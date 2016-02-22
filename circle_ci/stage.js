#!/usr/bin/env node

const shell = require('shelljs')
const yargs = require('yargs')

const argv = yargs
  .usage('Usage: $0 [options]')
  .example('$0 --directory ./dist')
  .example('$0 --tear-down unity/feature/user-view')
  .demand(2)
  .option('directory', {
    alias: 'd',
    describe: 'directory to sync to s3'
  })
  .option('tear-down', {
    alias: 't',
    describe: 'tear down a staged <repo>/<branch>'
  })
  .option('repo', {
    alias: 'r',
    describe: 'name of the repo'
  })
  .option('branch', {
    alias: 'b',
    describe: 'name of the branch'
  })
  .argv

const getURLName = (repo, branch) => {
  // getURLName('myRepo', 'feature/dev-stuff_save')
  //=> 'my-repo-feature-dev-stuff-save'
  //
  // replace all non-word characters and underscores with hyphens
  // camelCase to spine-case
  return `${repo}-${branch}`
    .replace(/[\W|_]/gi, '-')
    .replace(/[A-Z]/g, x => `-${x.toLowerCase()}`)
}

const bucketName = getURLName(
  process.env.CIRCLE_PROJECT_REPONAME,
  process.env.CIRCLE_BRANCH
)

shell.exec(`aws s3api create-bucket --bucket ${bucketName} --acl public-read`)
