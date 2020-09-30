import exitHook from '../../src'
import * as stub from './stub'

exitHook((_, cb) => {
  // process.exit() doesn't give asynchronous hooks a chance to execute.
  setTimeout(() => {
    stub.called()
    cb()
  }, 50)
  stub.called()
})

process.on('exit', () => {
  stub.called()
})

stub.addCheck(2)

process.exit()
