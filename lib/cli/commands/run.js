'use strict';

const path = require('path');
const EventEmitter = require('events').EventEmitter;
const uuidv4 = require('uuid/v4');

let run;

module.exports = run = {

    configure(options) {
        let configFile;
        let paths;

        if (options.configFile) {
            if (process.env.USING_PARENT_TEST_RUNNER !== 'true') {
                process.env.CONFIG_FILE = path.normalize(`${process.cwd()}/${options.configFile}`);
            }
            configFile = require(process.env.CONFIG_FILE);
        } else {
            if (process.env.USING_PARENT_TEST_RUNNER !== 'true') {
                process.env.CONFIG_FILE = path.normalize(`${process.cwd()}/config.js`);
            }
                configFile = require(process.env.CONFIG_FILE);
        }

        let testPath = options.testPath || configFile.testPath;

        paths = [testPath];

        process.env.COMPONENTS_PATH = options.components || configFile.components;

        let reporter = options.reporter || configFile.reporter;
        if (reporter) {
            process.env.REPORTER = reporter;
        }

        let reportPath = options.reportPath || configFile.reportPath;
        if (reportPath) {
            if (typeof reportPath == 'boolean') {
                process.env.OUTPUT_PATH = process.cwd();
            } else {
                process.env.OUTPUT_PATH = path.resolve(reportPath);
            }
        }

        let saucelabs = options.saucelabs || configFile.saucelabs;
        if (saucelabs) {
            process.env.SAUCE_LABS = 'true';
            process.env.TUNNEL_IDENTIFIER = process.env.TUNNEL_IDENTIFIER || `MBTT${uuidv4()}`;
            if (configFile.sauceCapabilities) {
                process.env.SAUCE_CAPABILITIES = JSON.stringify(configFile.sauceCapabilities);
            }
        }

        let before = options.before || configFile.before;
        if (before) {
            process.env.BEFORE_SCRIPT = path.resolve(before);
        }

        let testFilePaths;
        let configureInfo = {};

        run.emit('run.findFiles', paths, function(files) {
            run.emit('run.testCasesReadyToValidate', files, function(validatedTestCases) {
                if (validatedTestCases.length) {
                    testFilePaths = validatedTestCases;
                    if (testFilePaths.length === 1) {
                        configureInfo.command = 'execute';
                        configureInfo.testFile = testFilePaths[0];
                        if (process.env.USING_PARENT_TEST_RUNNER === 'true') {
                            return run.emit('run.configuredSkipOrchestration', configureInfo);
                        }
                    } else {
                        configureInfo.command = 'run';
                        configureInfo.testFilePaths = testFilePaths;
                        configureInfo.parallelism = options.parallelism || configFile.parallelism; ;
                    }
                    return run.emit('run.configuredRunOrchestration', configureInfo);
                } else {
                    throw new MbttError.TEST_CASE.NO_TEST_CASES_FOUND(`No test cases were found at path '${paths}'`);
                }
            });
        });
    },
};

Object.setPrototypeOf(run, new EventEmitter());
