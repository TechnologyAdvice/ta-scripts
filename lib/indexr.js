#!/usr/bin/env node
/**
 * Recursively creates index.js files exporting all *.js files in each directory.
 */
const path = require('path')
const Promise = require('bluebird')
const del = require('del')
const yargs = require('yargs')

const fs = Promise.promisifyAll(require('fs'))
const glob = Promise.promisify(require('glob'))

const argv = yargs
  .usage('$0 <directory> [options]')
  .example('$0 src', 'Recursively creates index.js in src')
  .demand(1)
  .help('help')
  .alias('h', 'help')
  .argv

const FLAG = '/* @indexr */'
const HEADER = [
  FLAG,
  '/* eslint-disable */',
  '',
].join('\n')

const findDirs = (dir) => glob(`${dir}/**/`, {
  ignore: [
    `./node_modules/**`,
  ],
})

const findFiles = (dir) => glob(`${dir}/*.js`, {
  ignore: [
    '**/index.js',
  ],
})

// resolve if missing index or existing index contains FLAG
const getSafeIndexPath = (dir) => {
  const indexPath = path.resolve(dir, 'index.js')
  return fs.readFileAsync(indexPath, 'utf8')
    .then(data => data.includes(FLAG) ? indexPath : null)
    .catch(err => err && err.code === 'ENOENT' ? indexPath : null)
}

const createIndexFile = (dir) => {
  return Promise.all([
      findFiles(dir),
      getSafeIndexPath(dir),
    ])
    .then(all => {
      const files = all[0]
      const safeIndexPath = all[1]

      // skip if no safe index was found
      if (!safeIndexPath) return Promise.resolve()

      // remove abandoned index
      if (safeIndexPath && !files.length) {
        return del(safeIndexPath)
      }

      // write new index
      const importNames = files.map(file => path.basename(file, '.js'))
      const importStatements = importNames.map(name => `import ${name} from './${name}'`).join('\n')

      const defaultExport = [
        '',
        'const defaultExport = {',
        importNames.map(importName => `  ${importName},`).join('\n'),
        '}',
        '',
        'export default defaultExport',
      ].join('\n')

      const contents = [HEADER, importStatements, defaultExport].join('\n')

      console.log(path.normalize(`\n${dir}/index.js`))
      console.log(importNames.map(x => `  - ${x}`).join('\n'))
      return fs.writeFileAsync(safeIndexPath, contents)
    })
}

// --------------------------------------
// Run
// --------------------------------------

findDirs(argv._[0])
  .then(dirs => Promise.all(dirs.map(createIndexFile)))
  .catch(err => {
    throw new Error(err)
  })
