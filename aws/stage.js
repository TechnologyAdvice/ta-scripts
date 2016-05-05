#!/usr/bin/env node
'use strict'

const fs = require('fs')
const sh = require('shelljs')
const path = require('path')
const yargs = require('yargs')

// exit on any error, like bash 'set -e'
sh.config.fatal = true

const argv = yargs
  .usage('\nUsage: $0 --repo <name> --branch <name> [options]')
  .strict()
  .example('$0 -r unity -b bug/foo -d dist', 'stage dist contents as unity bug/foo')
  .example('$0 -r unity -b bug/foo -t', 'tear down staging for unity bug/foo')
  .example('$0 -r unity -b bug/foo -g', 'get the url for unity bug/foo')
  .example('$0 -r unity -b bug/foo -n', 'get the bucket for unity bug/foo')
  .option('r', {
    alias: 'repo',
    describe: 'name of the github repo',
    demand: true,
    requiresArg: true,
    type: 'string',
  })
  .option('b', {
    alias: 'branch',
    describe: 'name of the github branch',
    demand: true,
    requiresArg: true,
    type: 'string',
  })
  .option('d', {
    alias: 'directory',
    describe: 'local directory to sync to s3',
    demand: false,
    requiresArg: true,
    type: 'string',
  })
  .option('t', {
    alias: 'tear-down',
    describe: 'tear down a staged repo/branch',
    demand: false,
    requiresArg: false,
    type: 'boolean',
  })
  .option('g', {
    alias: 'get-url',
    describe: 'get the url for a staged repo/branch',
    demand: false,
    requiresArg: false,
    type: 'boolean',
  })
  .option('n', {
    alias: 'get-bucket-name',
    describe: 'get the bucket name for a staged repo/branch',
    demand: false,
    requiresArg: false,
    type: 'boolean',
  })
  .option('o', {
    alias: 'get-object-path',
    describe: 'get the object path for a staged repo/branch',
    demand: false,
    requiresArg: false,
    type: 'boolean',
  })
  .check((argv, options) => {
    const requireOne = ['directory', 'tear-down', 'get-url', 'get-bucket-name', 'get-object-path']
    if (requireOne.filter(opt => !!argv[opt]).length !== 1) {
      throw new Error(`Specify either: ${requireOne.map(r => `--${r}`).join(', ')}`)
    }

    return true
  })
  .help('h')
  .alias('h', 'help')
  .argv

// ------------------------------------
// Methods
// ------------------------------------
const BUCKET_NAME = 'deweybot'
const REPO_DIR = 'qa/src'

/**
 * Returns the relative path for a given staged repo and branch.
 * @param {String} repo The GitHub repo name.
 * @param {String} branch The GitHub branch name.
 * @returns {*}
 */
const getStagedPath = (repo, branch) => `${REPO_DIR}/${repo}/${branch}`

/**
 * Returns the S3Uri for the given repo and branch.
 * @param {String} repo The GitHub repo name.
 * @param {String} branch The GitHub branch name.
 * @returns {*}
 */
const getS3Uri = (repo, branch) => `s3://${BUCKET_NAME}/${getStagedPath(repo, branch)}`

/**
 * Get the url for staged projects.
 * @returns {String}
 */
const getStagingUrl = () => `http://deweybot.taplatform.net/qa`

/**
 * Stage assets in `dir` to a location generated from the `repo` and `branch`.
 * @param {String} dir The local dir to sync.
 * @param {String} repo The GitHub repo name.
 * @param {String} branch The GitHub branch name.
 */
const stage = (dir, repo, branch) => {
  const stagedPath = getStagedPath(repo, branch)
  const pathRegExp = /(href="|src=")\/?(?!\/)(.*?")/g
  // cache file contents so we can restore them
  const cache = {}
  sh.cd(dir)
  const indexFiles = sh.find('.').filter((file) => /\.html$/.test(file))

  // recursively replace abs *.html attribute paths with S3Uri relative paths
  sh.echo('...monkey patching html paths')
  indexFiles.forEach((file) => {
    cache[file] = sh.cat(file)
    sh.sed('-i', pathRegExp, (group, g1, g2) => `${g1}/${stagedPath}${g2 === '"' ? g2 : `/${g2}`}`, file)
  })

  // sync
  const s3Uri = getS3Uri(repo, branch)
  sh.echo('...syncing')
  sh.exec(`aws s3 sync ./ ${s3Uri}/ --delete --acl public-read`)

  // restore html files
  sh.echo('...cleanup')
  indexFiles.forEach((file) => fs.writeFileSync(file, cache[file], 'utf8'))
}

/**
 * Remove a project from staging.
 * @param {String} repo The GitHub repo name.
 * @param {String} branch The GitHub branch name.
 */
const tearDown = (repo, branch) => {
  const s3Uri = getS3Uri(repo, branch)
  sh.exec(`aws s3 rm ${s3Uri} --recursive`)
}

// ------------------------------------
// Run
// ------------------------------------

// Ensure aws cli
if (!sh.which('aws')) sh.exec('sudo pip install awscli', { silent: true })

const repo = argv.repo
const branch = argv.branch

if (argv.directory) {
  stage(argv.directory, repo, branch)
  sh.echo(getStagingUrl())
}
if (argv.tearDown) {
  tearDown(repo, branch)
}
if (argv.getUrl) {
  sh.echo(getStagingUrl())
}
if (argv.getBucketName) {
  sh.echo(BUCKET_NAME)
}
if (argv.getObjectPath) {
  sh.echo(getStagedPath(repo, branch))
}
