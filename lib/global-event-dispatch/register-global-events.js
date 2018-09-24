'use strict';

const runnerEventDispatch = require('../runner/runner-event-dispatch/runner-event-dispatch.js');
const plannerEventDispatch = require('../planner/planner-event-dispatch/planner-event-dispatch.js');
const executeEventDispatch = require('../executor/executor-event-dispatch/executor-event-dispatch.js');
const cliEventDispatch = require('../cli/cli-event-dispatch/cli-event-dispatch.js');

const componentHandler = require('../util/component-handler.js');
const pageStateHandler = require('../util/page-state-handler.js');
const expectedState = require('../util/expected-state.js');
const findFiles = require('../util/find-files.js');
const oracle = require('../util/oracle.js');
const validators = require('../util/validators');
const dataStore = require('../util/data-store.js');
const commands = require('../cli/commands');

module.exports = function(globalEventDispatch) {
  globalEventDispatch.on('generate.configured', function() {
    plannerEventDispatch.emit('planner.generateConfigured');
  });
  globalEventDispatch.on('findFiles.search', findFiles.search);
  globalEventDispatch.on('cli.configured', function(configureInfo) {
    if (configureInfo.command === 'execute') {
      executeEventDispatch.emit('executor.scheduled', configureInfo.testFile);
    } else {
      runnerEventDispatch.emit('runner.scheduled', configureInfo.testFilePaths, configureInfo.parallelism);
    }
  });

  globalEventDispatch.on('runner.ended', function() {
    cliEventDispatch.emit('cli.commandFinished');
  });

  globalEventDispatch.on('componentHandler.configure', componentHandler.configure);
  globalEventDispatch.on('componentHandler.getComponentActions', componentHandler.getComponentActions);
  globalEventDispatch.on('componentHandler.getComponents', componentHandler.getComponents);
  globalEventDispatch.on('componentHandler.getComponent', componentHandler.getComponent);

  globalEventDispatch.on('pageStateHandler.getPageState', pageStateHandler.getPageState);

  globalEventDispatch.on('oracle.runDeepEqual', oracle.deepEqual);
  globalEventDispatch.on('oracle.runAssertions', oracle.runAssertions);

  globalEventDispatch.on('validators.validateComponents', validators.validateComponents);
  globalEventDispatch.on('validators.validateTestCases', validators.validateTestCases);
  globalEventDispatch.on('validators.validateElements', validators.validateElements);
  globalEventDispatch.on('validators.validateModel', validators.validateModel);
  globalEventDispatch.on('validators.validateActions', validators.validateActions);
  globalEventDispatch.on('validators.validateEvents', validators.validateEvents);
  globalEventDispatch.on('validators.validateChildren', validators.validateChildren);

  globalEventDispatch.on('expectedState.create', expectedState.create);
  globalEventDispatch.on('dataStore.create', dataStore.create);

  globalEventDispatch.on('configHandler.configCreated', function(command) {
    commands[command]();
  });
  globalEventDispatch.on('configHandler.readyToValidate', validators.validateConfig);
};
