'use strict';

const EventEmitter = require('events').EventEmitter;
const uuidv4 = require('uuid/v4');
const configHandler = require('../../util/config-handler.js');

let run;

module.exports = run = {
    configure(options) {
        configHandler.createConfig(options.opts(), function(config) {
            let paths = [config.testPath];

            process.env.COMPONENTS_PATH = config.componentPath;
            process.env.REPORTER = config.reporter;
            process.env.OUTPUT_PATH = config.reportPath;
            process.env.TEST_DELAY = config.testDelay;
            process.env.TEST_RERUN_COUNT = config.rerunFailedTests;

            if (config.saucelabs) {
                process.env.SAUCE_LABS = 'true';
                if (!process.env.TUNNEL_IDENTIFIER) {
                    process.env.TUNNEL_IDENTIFIER = `MBTT${uuidv4()}`;
                }
            }

            if (config.sauceCapabilities) {
                process.env.SAUCE_CAPABILITIES = JSON.stringify(config.sauceCapabilities);
                if (config.sauceCapabilities.hasOwnProperty('username')) {
                    process.env.SAUCE_USERNAME = config.sauceCapabilities.username;
                }
                if (config.sauceCapabilities.hasOwnProperty('accessKey')) {
                    process.env.SAUCE_ACCESS_KEY = config.sauceCapabilities.accessKey;
                }
            }

            if (config.before) {
                process.env.BEFORE_SCRIPT = config.before;
            }

            if (config.debug) {
                process.env.DEBUG = true;
            }

            if (config.debugPort) {
                process.env.DEBUG_PORT = config.debugPort;
            }

            let testFilePaths;
            let configureInfo = {
                parallelism: config.parallelism,
            };

            run.emit('run.findFiles', paths, function(files) {
                run.emit('run.testCasesReadyToValidate', files, function(validatedTestCases) {
                    if (validatedTestCases.length) {
                        testFilePaths = validatedTestCases;
                        if (process.env.USING_PARENT_TEST_RUNNER === 'true') {
                            configureInfo.command = 'execute';
                            configureInfo.testFile = testFilePaths[0];
                            return run.emit('run.configuredSkipOrchestration', configureInfo);
                        } else {
                            configureInfo.command = 'run';
                            configureInfo.testFilePaths = testFilePaths;
                        }
                        return run.emit('run.configuredRunOrchestration', configureInfo);
                    } else {
                        throw new SimulatoError.TEST_CASE.NO_TEST_CASES_FOUND(
                            `No test cases were found at path '${paths}'`
                        );
                    }
                });
            });
        });
    },
};

Object.setPrototypeOf(run, new EventEmitter());
