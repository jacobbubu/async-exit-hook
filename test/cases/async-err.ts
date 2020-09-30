import exitHook, { HookFunc } from '../../src'
import * as stub from './stub'

exitHook((_, cb) => {
  setTimeout(() => {
    stub.called()
    cb()
  }, 50)
  stub.called()
})

exitHook(() => {
  stub.called()
})

exitHook.uncaughtExceptionHandler((err, cb) => {
  setTimeout(() => {
    stub.called()
    cb()
  }, 50)
  if (!err || err.message !== 'test') {
    stub.reject('No error passed to uncaughtExceptionHandler, or message not test - ')
  }
  stub.called()
})

process.on('uncaughtException', () => {
  // All uncaught exception handlers should be called even though the exit hook handler was registered
  stub.called()
})

stub.addCheck(6)

throw new Error('test')
