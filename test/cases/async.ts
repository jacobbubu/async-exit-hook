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

stub.addCheck(3)
