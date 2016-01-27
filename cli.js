#!/usr/bin/env node

const path = require('path')
const cp = require('child_process')
const argv = require('yargs')
  .usage('Usage: $0 <path> -- [...args]')
  .demand(1)
  .argv

const programMap = {
  '.sh': 'bash',
  '.js': 'node',
}

const scriptPath = argv._.shift()
const scriptArgs = argv._.join(' ')
const scriptExt = path.extname(scriptPath)
const program = programMap[scriptExt]

if (!program) {
  throw new Error(`There is no program assigned to handle the extension "${scriptExt}".`)
}

cp.execSync(`${program} ${scriptPath} ${scriptArgs}`, {cwd: __dirname, stdio: 'inherit'})
