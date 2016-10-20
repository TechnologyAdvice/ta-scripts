#!/usr/bin/env node
/**
 * Creates a changelog for the current build and puts it in the root
 * Commits and pushes it if it updated
 */
const axios = require('axios')
const childProcess = require('child_process')
const fs = require('fs-promise')

// ----------------------------------------
// Environment
// ----------------------------------------

const { CIRCLE_BRANCH, CIRCLE_PROJECT_USERNAME, CIRCLE_PROJECT_REPONAME, CIRCLE_USERNAME } = process.env
if (!CIRCLE_BRANCH)            throw new Error('Missing env var CIRCLE_BRANCH.')
if (!CIRCLE_PROJECT_USERNAME)  throw new Error('Missing env var CIRCLE_PROJECT_USERNAME.')
if (!CIRCLE_PROJECT_REPONAME)  throw new Error('Missing env var CIRCLE_PROJECT_REPONAME.')
if (!CIRCLE_USERNAME)          throw new Error('Missing env var CIRCLE_USERNAME.')

// ----------------------------------------
// Arg parse
// ----------------------------------------
const argv = require('yargs')
  .usage('USAGE: $0 [options]')
  .option('t', {
    alias: 'token',
    describe: 'github personal access token'
  })
  .help()
  .argv

// ----------------------------------------
// Utils
// ----------------------------------------
const log = (...msgs) => console.log('CREATE CHANGELOG:', ...msgs) // eslint-disable-line no-console

const wait = ms => new Promise(res => setTimeout(res, ms))

// format axios responses for abbreviated logging
const formatRes = (res) => {
  if ({}.toString.call(res) !== '[object Object]') return
  const { status, data } = res

  let truncatedData = ''
  if (data) truncatedData = data.length > 100 ? `${res.data.substr(0, 100)}...` : data

  return JSON.stringify({ status, data: `${truncatedData}` }, null, 2)
}

// ----------------------------------------
// Methods
// ----------------------------------------
let endpoint = `https://github-changelog-api.herokuapp.com/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}`
if (argv.token) endpoint += `?token=${argv.token}`

const postChangelogRequest = () => {
  log(`Posting changelog request: ${endpoint}`)
  return axios.post(endpoint)
    .catch(err => Promise.reject(new Error('Failed to POST changelog request\n\n' + formatRes(err.response))))
}

const pollForChangelog = () => {
  log('Polling for completed changelog')
  return axios.get(endpoint)
    .then(
      res => {
        // changelog is done
        log('Received changelog string', formatRes(res))
        return res.data
      },
      err => {
        if (err.response.status === 302) {
          // poll
          log('Changelog job in progress, waiting...', formatRes(err.response))
          return wait(5000).then(pollForChangelog)
        } else {
          // reject all other errors
          return Promise.reject(new Error('Error while polling:\n\n' + formatRes(err.response)))
        }
      }
    )
}

const writeChangelog = (data) => {
  log('Writing changelog to disk:', data)
  return fs.writeFile('CHANGELOG.md', data)
    .catch(err => Promise.reject(new Error('Failed to write changelog to disk:\n\n' + formatRes(err.response))))
}

const commitAndPush = () => Promise.resolve()
  .then(() => {
    log('Committing and pushing changelog, if needed')

    const changelogWasUpdated = childProcess.execSync('git ls-files -m')
      .toString()
      .split('\n')
      .filter(l => !!l)
      .some(modifiedFile => modifiedFile === 'CHANGELOG.md')

    if (changelogWasUpdated) {
      childProcess.execSync("git add CHANGELOG.md")
      childProcess.execSync(`git commit -n -m 'update CHANGELOG.md by ${CIRCLE_USERNAME} [ci skip]'`)
      childProcess.execSync(`git rebase origin ${CIRCLE_BRANCH}`)
      childProcess.execSync(`git push origin ${CIRCLE_BRANCH}`)
    } else {
      log('Will not push changelog, it has not changed.')
    }
  })
  .catch(err => Promise.reject(new Error('Failed to commit and push changelog:\n\n' + err.stack)))

// ----------------------------------------
// Run
// ----------------------------------------
postChangelogRequest()
  .then(wait(5000))
  .then(pollForChangelog)
  .then(writeChangelog)
  .then(commitAndPush)
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
