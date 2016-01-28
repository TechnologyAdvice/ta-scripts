#!/usr/bin/env node

'use strict'

const fs = require('fs')
const path = require('path')
const Promise = require('bluebird')
const cp = require('child_process')
const argv = require('yargs')
  .usage('Usage: $0 <path> -- [...args]')
  .demand(1)
  .argv

const extProgramMap = {
  '.sh': 'bash',
  '.js': 'node',
}

const ifFileExists = filePath => {
  return new Promise((resolve, reject) => {
    try {
      fs.statSync(filePath)
      resolve(filePath)
    } catch (e) {
      reject(e)
    }
  })
}

const executeScript = (script, args) => {
  const ext = path.extname(script)
  const program = extProgramMap[ext]
  cp.execSync(`${program} ${script} ${args}`, {stdio: 'inherit'})
}

const searchForScript = (basedir, scriptPath) => {
  return new Promise((resolve, reject) => {
    let failedPaths = []
    Object.keys(extProgramMap).some(ext => {
      const tryPath = path.resolve(basedir, `${scriptPath}${ext}`)
      try {
        fs.statSync(tryPath)
        resolve(tryPath)
      } catch (e) {
        failedPaths.push(tryPath)
      }
    })
    reject(failedPaths)
  })
}

const throwSearchFail = (script, searchedPaths) => {
  throw new Error(`Could not find "${script}" in:\n\n${searchedPaths.join('\n')}\n`)
}

// ----------------------------------------
// Run
// ----------------------------------------

const scriptPath = argv._.shift()
const scriptArgs = argv._.join(' ')

ifFileExists(scriptPath)
  .then(res => executeScript(scriptPath, scriptArgs))
  .catch(err => {
    searchForScript(__dirname, scriptPath)
      .then(
        foundPath => executeScript(foundPath, scriptArgs),
        searched => throwSearchFail(scriptPath, searched)
      )
  })
