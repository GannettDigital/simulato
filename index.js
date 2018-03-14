#!/usr/bin/env node

'use strict';

global.MbttError = require('./lib/errors');
const program = require('commander');
const packageJSON = require('./package.json');
const commands = require('./lib/cli/commands');
const initializeEventDispatchers = require('./lib/util/initialize-event-dispatchers');
initializeEventDispatchers();

program.version(packageJSON.version);

program
    .command('run <path...>')
    .option('-c, --components <componentPath>', 'Path to components')
    .option('-r, --reporter [reporter]', 'Specify a reporter to use')
    .option('-s, --saucelabs', 'Run tests in the saucelabs')
    .option('-p, --parallelism <parallelism>', 'Amount of tests to run in parallel', Number.parseInt)
    .option('-o, --outputPath [path]', 'The path wherein to write the test report')
    .option('-b, --before <path>', 'The path to the before script run before the test suite')
    .action(commands.run);

program
    .command('generate <path>')
    .option('-o, --outputPath <path>', 'The path wherein to write the generated test cases')
    .option('-t, --technique <technique>', 'The test generation technique')
    .option('-a, --actionToCover <action>', 'The action to generate a test for. Specfied as component.ACTION_NAME')
    .action(commands.generate);

program.parse(process.argv);
