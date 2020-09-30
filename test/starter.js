'use strict'
require('ts-node').register({ transpileOnly: true })
const path = require('path')

require(path.join(__dirname, 'cases', process.argv[2] + '.ts'))
