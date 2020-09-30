# @jacobbubu/async-exit-hook

[![Build Status](https://github.com/jacobbubu/async-exit-hook/workflows/Build%20and%20Release/badge.svg)](https://github.com/jacobbubu/async-exit-hook/actions?query=workflow%3A%22Build+and+Release%22)
[![Coverage Status](https://coveralls.io/repos/github/jacobbubu/async-exit-hook/badge.svg)](https://coveralls.io/github/jacobbubu/async-exit-hook)
[![npm](https://img.shields.io/npm/v/@jacobbubu/async-exit-hook.svg)](https://www.npmjs.com/package/@jacobbubu/async-exit-hook/)

> Run some code when the process exits.
> [async-exit-hook](https://github.com/tapppi/async-exit-hook.git) rewritten in TypeScript.

## Intro.

The `process.on('exit')` event doesn't catch all the ways a process can exit. This module catches:

* process SIGINT, SIGTERM and SIGHUP, SIGBREAK signals
* process beforeExit and exit events
* PM2 clustering process shutdown message ([PM2 graceful reload](http://pm2.keymetrics.io/docs/usage/cluster-mode/#graceful-reload))

Useful for cleaning up. You can also include async handlers, and add custom events to hook and exit on.

Forked and rewritten from [async-exit-hook](https://github.com/tapppi/async-exit-hook.git).

### Considerations and warning
#### On `process.exit()` and asynchronous code
**If you use asynchronous exit hooks, DO NOT use `process.exit()` to exit.
The `exit` event DOES NOT support asynchronous code.**
> ['beforeExit' is not emitted for conditions causing explicit termination, such as process.exit()]
(https://nodejs.org/api/process.html#process_event_beforeexit)

#### Windows and `process.kill(signal)`
On windows `process.kill(signal)` immediately kills the process, and does not fire signal events, and as such, cannot be used to gracefully exit. See *Clustering and child processes* for a workaround when killing child processes. I'm planning to support gracefully exiting with async support on windows soon.

### Clustering and child processes
If you use custom clustering / child processes, you can gracefully shutdown your child process
by sending a shutdown message (`childProc.send('shutdown')`).

### Example
```ts
import exitHook from 'async-exit-hook'

exitHook(() => {
  console.log('exiting');
});

// you can add multiple hooks, even across files
exitHook(() => {
  console.log('exiting 2');
});

// you can add async hooks by accepting a callback
exitHook((err, cb) => {
  setTimeout(() => {
    console.log('exiting 3');
    cb();
  }, 1000);
});

// You can hook uncaught errors with uncaughtExceptionHandler(), consequently adding
// async support to uncaught errors (normally uncaught errors result in a synchronous exit).
exitHook.uncaughtExceptionHandler(err => {
  console.error(err);
});

// You can hook unhandled rejections with unhandledRejectionHandler()
exitHook.unhandledRejectionHandler(err => {
  console.error(err);
});

// You can add multiple uncaught error handlers
// Add the second parameter (callback) to indicate async hooks
exitHook.uncaughtExceptionHandler((err, callback) => {
  sendErrorToCloudOrWhatever(err) // Returns promise
    .then(() => {
      console.log('Sent err to cloud');
    })
    .catch(sendError => {
      console.error('Error sending to cloud: ', err.stack);
    })
    .then(() => callback);
});

// Add exit hooks for a signal or custom message:

// Custom signal
// Arguments are `signal, exitCode` (SIGBREAK is already handled, this is an example)
exitHook.hookEvent('SIGBREAK', 21);

// process event: `message` with a filter
// filter gets all arguments passed to *handler*: `process.on(message, *handler*)`
// Exits on process event `message` with msg `customShutdownMessage` only
exitHook.hookEvent('message', 0, msg => msg !== 'customShutdownMessage');

// All async hooks will work with uncaught errors when you have specified an uncaughtExceptionHandler
throw new Error('awesome');

//=> // Sync uncaughtExcpetion hooks called and retun
//=> '[Error: awesome]'
//=> // Sync hooks called and retun
//=> 'exiting'
//=> 'exiting 2'
//=> // Async uncaughtException hooks return
//=> 'Sent error to cloud'
//=> // Sync uncaughtException hooks return
//=> 'exiting 3'
```


## License

MIT

