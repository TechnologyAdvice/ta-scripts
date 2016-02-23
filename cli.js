#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')
const Promise = require('bluebird')
const cp = require('child_process')
const argv = require('yargs')
  .usage('Usage: $0 <path> [...args]')
  .demand(1)
  .argv

const extProgramMap = {
  '.sh': 'bash',
  '.js': 'node',
}

const executeScript = (script, args) => {
  const ext = path.extname(script)
  const program = extProgramMap[ext]
  if (!program) throw new Error(`ta-script has no program assigned to handle the "${ext}" ext`)
  cp.execSync(`${program} ${script} ${args}`, { stdio: 'inherit' })
}

// looks for a script in basedir under the scriptPath.
// if not found, looks for script matching all extensions in extProgramMap
const searchForScript = (basedir, scriptPath) => {
  return new Promise((resolve, reject) => {
    const triedPaths = []
    const extensions = [''].concat(Object.keys(extProgramMap));

    extensions.forEach(ext => {
      const tryPath = path.resolve(basedir, `${scriptPath}${ext}`)
      try {
        fs.statSync(tryPath)
        resolve(tryPath)
      } catch (e) {
        triedPaths.push(tryPath)
      }
    })
    throw new Error(`Could not find "${scriptPath}" in:\n\n${triedPaths.join('\n')}\n`)
  });
}

// ----------------------------------------
// Run
// ----------------------------------------

const scriptPath = process.argv[2]
const scriptArgs = process.argv.slice(3)
  // for backward compatibility remove '--' first arg
  // it was used as the first arg to separate script args from cli args
  .filter((arg, i) => !(i === 0 && arg === '--'))
  .join(' ')

searchForScript(__dirname, scriptPath)
  .then(foundPath => executeScript(foundPath, scriptArgs))
  .catch(e => {
    console.error(e.toString())
    process.exit(1)
  })
