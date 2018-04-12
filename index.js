#!/usr/bin/env node

'use strict';

global.SimulatoError = require('./lib/errors');
const program = require('commander');
const packageJSON = require('./package.json');
const commands = require('./lib/cli/commands');
const initializeEventDispatchers = require('./lib/util/initialize-event-dispatchers');
initializeEventDispatchers();

program.version(packageJSON.version);

program
    .command('run')
    .option('-T, --testPath <testPath>', 'Path to tests')
    .option('-c, --components <componentPath>', 'Path to components')
    .option('-r, --reporter [reporter]', 'Specify a reporter to use')
    .option('-s, --saucelabs', 'Run tests in the saucelabs')
    .option('-p, --parallelism <parallelism>', 'Amount of tests to run in parallel', Number.parseInt)
    .option('-R, --reportPath [path]', 'The path to write the test result report to')
    .option('-b, --before <path>', 'The path to the before script')
    .option('-f, --configFile <path>', 'The path to the config file')
    .action(commands.run);

program
    .command('generate')
    .option('-c, --components <componentPath>', 'the path to the components')
    .option('-o, --outputPath <path>', 'The path to write the generated test cases to')
    .option('-a, --actionToCover <action>', 'The action to generate a test for. Specfied as component.ACTION_NAME')
    .option('-t, --technique <technique>', 'The test generation technique')
    .option('-f, --configFile <path>', 'The path to the config file')
    .action(commands.generate);

program.parse(process.argv);
