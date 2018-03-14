'use strict';

const path = require('path');
const EventEmitter = require('events').EventEmitter;
const uuidv4 = require('uuid/v4');

let run;

module.exports = run = {
    configure(paths, options) {
        process.env.COMPONENTS_PATH = options.components;

        if (options.reporter) {
            process.env.REPORTER = options.reporter;
        }

        if (options.outputPath) {
            if (typeof options.outputPath == 'boolean') {
                process.env.OUTPUT_PATH = process.cwd();
            } else {
                process.env.OUTPUT_PATH = path.resolve(options.outputPath);
            }
        }

        if (options.saucelabs) {
            process.env.SAUCE_LABS = 'true';
            process.env.TUNNEL_IDENTIFIER = process.env.TUNNEL_IDENTIFIER || `MBTT${uuidv4()}`;
        }

        if (options.before) {
            process.env.BEFORE_SCRIPT = path.resolve(options.before);
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
                        configureInfo.parallelism = options.parallelism;
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
