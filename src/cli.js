#!/usr/bin/env node
const { cwd, argv: [,, port = 8080, path = ''] } = process;
const directory = `${cwd()}${path.replace(/^(?!\\|\/|$)|\//g, '\\').replace(/(\\|\/)$/, '')}`;
require('./revise.min.js')(Number(port), directory);
