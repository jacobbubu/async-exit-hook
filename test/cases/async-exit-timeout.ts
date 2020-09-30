import exitHook, { HookFunc } from '../../src'
import * as stub from './stub'

exitHook((_, cb) => {
  setTimeout(() => {
    stub.called()
    cb()
  }, 2000)
  stub.called()
})

exitHook(() => {
  stub.called()
})

// eslint-disable-next-line handle-callback-err
exitHook.uncaughtExceptionHandler((_, cb) => {
  setTimeout(() => {
    stub.called()
    cb()
  }, 2000)
  stub.called()
})

exitHook.forceExitTimeout(500)
stub.addCheck(3)

throw new Error('test')
