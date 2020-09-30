// Stub to make sure that the required callbacks are called by exit-hook
let c = 0
let noCallback = true

// Increment the called count
export const called = () => {
  c++
}

// Exit with error
export const reject = (s: string, code?: number | null) => {
  process.stdout.write('FAILURE: ' + s)
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(code === null || code === undefined ? 1 : code)
}

// Exit with success
export const done = () => {
  process.stdout.write('SUCCESS')
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0)
}

// Add the exit check with a specific expected called count
export const addCheck = (num: number) => {
  noCallback = false

  // Only call exit once, and save uncaught errors
  let called = false
  let ucErrStr: string

  // Save errors that do not start with 'test'
  process.on('uncaughtException', (err) => {
    if (err.message.indexOf('test') !== 0) {
      ucErrStr = err.stack!
    }
  })
  // Save rejections that do not start with 'test'
  process.on('unhandledRejection', (reason) => {
    if (reason && reason instanceof Error) {
      ucErrStr = reason.message
    } else {
      ucErrStr = reason ? reason.toString() : ''
    }
  })

  // Check that there were no unexpected errors and all callbacks were called
  function onExitCheck(timeout: boolean | null) {
    if (called) {
      return
    }
    called = true

    if (timeout) {
      reject('Test timed out')
    } else if (ucErrStr) {
      reject(ucErrStr)
    } else if (c === num) {
      done()
    } else {
      reject('Expected ' + num + ' callback calls, but ' + c + ' received')
    }
  }

  process.once('exit', onExitCheck.bind(null, null))
  setTimeout(onExitCheck.bind(null, true), 10000)
}

// If the check isn't added, throw on exit
process.once('exit', () => {
  if (noCallback) {
    reject('FAILURE, CHECK NOT ADDED')
  }
})
