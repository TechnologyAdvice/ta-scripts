const cp = require('child_process')
const flow = require('flow-bin')

try {
  cp.execFileSync(flow, ['check'], {stdio: 'inherit'})
} catch (e) {
  console.log(e)
  process.exit(1)
}
