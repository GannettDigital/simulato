#!/usr/bin/env node

'use strict';

global.SimulatoError = require('./lib/errors');
const program = require('commander');
const packageJSON = require('./package.json');
const configHandler = require('./lib/util/config-handler.js');
const initializeEventDispatchers = require('./lib/util/initialize-event-dispatchers');
initializeEventDispatchers();

program.version(packageJSON.version);

program
    .command('run')
    .option('-T, --testPath <testPath>', 'Path to tests')
    .option('-c, --componentPath <componentPath>', 'Path to components')
    .option('-r, --reporter [reporter]', 'Specify a reporter to use')
    .option('-s, --saucelabs', 'Run tests in the saucelabs')
    .option('-p, --parallelism <parallelism>', 'Amount of tests to run in parallel', Number.parseInt)
    .option('-R, --reportPath [path]', 'The path to write the test result report to')
    .option('-b, --before <path>', 'The path to the before script')
    .option('-f, --configFile <path>', 'The path to the config file')
    .option('-d, --testDelay <milliseconds>', 'The time in milliseconds to stagger test start times')
    .option('-F, --rerunFailedTests <int>', 'The number of times to rerun failed tests')
    .option('-D, --debug', 'A flag to turn on debugging when spawning child processes')
    .option('-P, --debugPort <int>', 'Starting port for debugging when spawning child processes')
    .action(configHandler.createConfig);

program
    .command('generate')
    .option('-c, --componentPath <componentPath>', 'the path to the components')
    .option('-o, --outputPath <path>', 'The path to write the generated test cases to')
    .option('-a, --actionToCover <action>', 'The action to generate a test for. Specfied as component.ACTION_NAME')
    .option('-A, --plannerAlgorithm <algorithm>', 'The algorithm for the planner to use')
    .option('-f, --configFile <path>', 'The path to the config file')
    .action(configHandler.createConfig);

program.parse(process.argv);
