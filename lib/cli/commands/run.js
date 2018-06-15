'use strict';

const EventEmitter = require('events').EventEmitter;
const configHandler = require('../../util/config-handler.js');

let run;

module.exports = run = {
    configure() {
        let paths = [configHandler.get('testPath')];
        let testFilePaths;
        let configureInfo = {};

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
    },
};

Object.setPrototypeOf(run, new EventEmitter());
