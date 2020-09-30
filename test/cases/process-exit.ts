import exitHook from '../../src'
import * as stub from './stub'

exitHook(() => {
  stub.called()
})

exitHook(() => {
  stub.called()
})

process.on('exit', () => {
  stub.called()
})

stub.addCheck(3)

process.exit()
