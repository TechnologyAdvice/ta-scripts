const cp = require('child_process')
const flow = require('flow-bin')

cp.execFileSync(flow, ['check'], {stdio: 'inherit'})
