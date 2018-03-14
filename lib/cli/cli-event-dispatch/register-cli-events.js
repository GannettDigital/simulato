'use strict';

const generate = require('../commands/generate.js');
const run = require('../commands/run.js');
const before = require('../orchestration/before.js');
const after = require('../orchestration/after.js');

module.exports = function(cliEventDispatch) {
  generate.on('generate.loadComponents', function(componentsPath) {
    cliEventDispatch.emit('cli.loadComponents', componentsPath);
  });
  generate.on('generate.configured', function(configureInfo) {
    cliEventDispatch.emit('cli.generateConfigured', configureInfo);
  });

  run.on('run.findFiles', function(paths, callback) {
    cliEventDispatch.emit('cli.findFiles', paths, callback);
  });
  run.on('run.testCasesReadyToValidate', function(files, callback) {
    cliEventDispatch.emit('cli.testCasesReadyToValidate', files, callback);
  });
  run.on('run.configuredSkipOrchestration', function(configureInfo) {
    cliEventDispatch.emit('cli.configured', configureInfo);
  });
  run.on('run.configuredRunOrchestration', before.runScripts);

  before.on('before.finished', function(configureInfo) {
    cliEventDispatch.emit('cli.configured', configureInfo);
  });

  cliEventDispatch.on('cli.commandFinished', function() {
    if (process.env.USING_PARENT_TEST_RUNNER !== 'true') {
      after();
    }
  });
};
