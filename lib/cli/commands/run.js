'use strict';

const Emitter = require('../../util/emitter.js');
const configHandler = require('../../util/config/config-handler.js');
const cliEventDispatch = require('../cli-event-dispatch/cli-event-dispatch.js');

let run;

module.exports = run = {
  configure() {
    const paths = [configHandler.get('testPath')];
    let testFilePaths;
    const configureInfo = {};

    run.emit('findFiles.search', paths, function(files) {
      run.emit('validators.validateTestCases', files, function(validatedTestCases) {
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
              `No test cases were found at path '${paths}'`,
          );
        }
      });
    });
  },
};

Emitter.mixIn(run, cliEventDispatch);
