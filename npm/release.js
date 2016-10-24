#!/usr/bin/env node
const childProcess = require('child_process')
const path = require('path')
const fs = require('fs')
const yargs = require('yargs')

// ----------------------------------------
// Utils
// ----------------------------------------
const log = (...msgs) => console.log('npm/release:', ...msgs)

const handleError = (msg, err) => {
  if (err) throw err
  console.error()
  console.error('npm/release:', msg, '\n')
  process.exit(1)
}

const sh = (command, print = false) => {
  try {
    const output = childProcess.execSync(command).toString().replace(/\n$/g, '')

    if (print && output) {
      print(`\`${command}\`:`)
      print(output.split('\n').map(l => `  ${l}`).join('\n'))
    }

    return output
  } catch (err) {
    handleError(err.msg, err)
  }
}

// ----------------------------------------
// Parse Args
// ----------------------------------------
const argv = yargs
  .usage('Usage: node $0 <major|minor|patch|premajor|preminor|prepatch|prerelease|from-git>')
  .fail(handleError)
  .check(argv => {
    const versions = ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease', 'from-git']
    const isValidVersion = !!versions.find(x => x === argv._[0])

    if (isValidVersion) return true

    handleError(`Version '${argv._[0]}' is not a valid version:${versions.map(x => `\n - ${x}`).join('')}`)
  })
  .help()
  .demand(1, 'You must specify a version to release. See --help.')
  .strict()
  .argv

// ----------------------------------------
// Git Checks
// ----------------------------------------
log('Verifying Git status.')
sh('git fetch')

const localSha = sh('git rev-parse @')
const remoteSha = sh('git rev-parse @{u}')
const baseSha = sh('git merge-base @ @{u}')

if (sh('git status --porcelain')) {
  handleError('Commit or stash you changes before releasing')
} else {
  log('Working directory is clean.')
}

if (localSha === remoteSha) {
  log('Local branch is up-to-date.')
} else if (localSha === baseSha) {
  handleError('You need to pull changes before you can release.')
} else if (remoteSha === baseSha) {
  handleError('You need to push changes before you can release.')
} else {
  handleError('Your branch has diverged from the remote, you cannot release.')
}

// ----------------------------------------
// NPM Checks
// ----------------------------------------

// package files exist
const pkg = require(path.resolve(process.cwd(), 'package.json'))

if (pkg.files) {
  log('Ensuring package files exist.')
  const missingFiles = pkg.files.filter(filePath => {
    const fp = path.resolve(process.cwd(), filePath)
    try {
      fs.accessSync(fp, fs.F_OK)
      console.log('exists', fp)
      return false
    } catch (err) {
      console.log('missing', fp)
      return true
    }
  })
  if (missingFiles.length) {
    handleError(`Some package.json \`files\` are not present: ${missingFiles.map(f => `\n - ${f}`).join('')}`)
  }
} else {
  log('No package.json files to verify.')
}

// logged in
// Check for token before asking for user name to avoid NPM's process exit
const npmUser = sh("cat ~/.npmrc | grep '_authToken=[a-zA-Z0-9\-]'") && sh('npm whoami')
if (!npmUser) {
  handleError('You must be logged in to NPM to publish, run \'npm login\' first.')
} else {
  log(`NPM logged in as \`${npmUser}\`.`)
}

// has access
const isCollaborator = sh(`npm access ls-collaborators | grep '.*${npmUser}.*:.*write.*'`)
const isOwner = sh(`npm owner ls | grep '.*${npmUser} <.*'`)
if (!isCollaborator || !isOwner) {
  handleError(`${npmUser} is not an NPM owner or collaborator. Request access from:\n${sh('npm owner ls')}`)
} else {
  log(`NPM user \`${npmUser}\` has \`${isOwner ? 'owner' : 'collaborator'}\` access to \`${pkg.name}\`.`)
}

// ----------------------------------------
// Publish!
// ----------------------------------------
const version = argv._[0]
log(`Publishing new \`${version}\` version as \`${npmUser}\`.`)

sh(`npm version ${version}`, true)
sh('git push', true)
sh('git push --follow-tags', true)
sh('npm publish', true)
