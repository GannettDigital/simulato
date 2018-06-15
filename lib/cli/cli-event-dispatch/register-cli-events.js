'use strict';

const generate = require('../commands/generate.js');
const run = require('../commands/run.js');
const before = require('../orchestration/before.js');
const after = require('../orchestration/after.js');

module.exports = function(cliEventDispatch) {
  cliEventDispatch.on('run.configuredSkipOrchestration', function(configureInfo) {
    cliEventDispatch.emit('cli.configured', configureInfo);
  });
  cliEventDispatch.on('run.configuredRunOrchestration', before.runScripts);

  cliEventDispatch.on('before.finished', function(configureInfo) {
    cliEventDispatch.emit('cli.configured', configureInfo);
  });

  cliEventDispatch.on('cli.commandFinished', function() {
    after();
  });
};
