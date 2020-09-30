import { fork } from 'child_process'
import * as path from 'path'
import exitHook, { HookSignals } from '../src'

function testInSub(test: string, signal?: HookSignals): Promise<[number | null, string]> {
  return new Promise((resolve) => {
    const proc = fork(path.resolve(__dirname, 'starter.js'), [test], {
      env: process.env,
      silent: true,
    })

    let output = ''

    proc.stdout!.on('data', (data) => {
      output += data.toString()
    })

    proc.stderr!.on('data', (data) => {
      output += data.toString()
    })

    proc.on('exit', (code) => {
      resolve([code, output])
    })

    if (signal === 'shutdown') {
      proc.send(signal)
    } else if (signal) {
      proc.kill(signal as NodeJS.Signals)
    }
  })
}

describe('basic', () => {
  it('API: test adding and removing and listing hooks', () => {
    exitHook(() => {
      /**/
    })

    // Ensure SIGBREAK hook
    exitHook.hookEvent('SIGBREAK', 128 + 21)
    expect(exitHook.hookedEvents().indexOf('SIGBREAK')).not.toBe(-1)

    // Unhook SIGBREAK
    exitHook.unhookEvent('SIGBREAK')
    expect(exitHook.hookedEvents().indexOf('SIGBREAK')).toBe(-1)

    // Re-hook SIGBREAK
    exitHook.hookEvent('SIGBREAK', 128 + 21)
    expect(exitHook.hookedEvents().indexOf('SIGBREAK')).not.toBe(-1)
  })

  it('sync handlers', async () => {
    const [code, output] = await testInSub('sync', 'shutdown')
    expect(output).toBe('SUCCESS')
    expect(code).toBe(0)
  })

  it('process exit', async () => {
    const [code, output] = await testInSub('process-exit')
    expect(output).toBe('SUCCESS')
    expect(code).toBe(0)
  })

  it('async handlers', async () => {
    const [code, output] = await testInSub('async', 'shutdown')
    expect(output).toBe('SUCCESS')
    expect(code).toBe(0)
  })

  it('async process exit', async () => {
    const [code, output] = await testInSub('async-process-exit')
    expect(output).toBe('SUCCESS')
    expect(code).toBe(0)
  })

  it('async uncaught exception handler', async () => {
    const [code, output] = await testInSub('async-err')
    expect(output).toBe('SUCCESS')
    expect(code).toBe(0)
  })

  it('async uncaught exception handler', async () => {
    const [code, output] = await testInSub('async-exit-timeout')
    expect(output).toBe('SUCCESS')
    expect(code).toBe(0)
  })

  it('unhandled promise rejection', async () => {
    const [code, output] = await testInSub('async-exit-timeout')
    expect(output).toBe('SUCCESS')
    expect(code).toBe(0)
  })
})
