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

module.exports = function(globalEventDispatch) {
    cliEventDispatch.on('cli.loadComponents', componentHandler.configure);
    cliEventDispatch.on('cli.generateConfigured', function(configureInfo) {
        plannerEventDispatch.emit('planner.generateConfigured', configureInfo);
    });
    cliEventDispatch.on('cli.findFiles', findFiles.search);
    cliEventDispatch.on('cli.testCasesReadyToValidate', validators.validateTestCases);
    cliEventDispatch.on('cli.configured', function(configureInfo) {
        if (configureInfo.command === 'execute') {
            executeEventDispatch.emit('executor.scheduled', configureInfo.testFile);
        } else {
            runnerEventDispatch.emit('runner.scheduled', configureInfo.testFilePaths, configureInfo.parallelism);
        }
    });

    runnerEventDispatch.on('runner.ended', function() {
        cliEventDispatch.emit('cli.commandFinished');
    });

    executeEventDispatch.on('executor.loadComponents', componentHandler.configure);
    executeEventDispatch.on('executor.getComponents', componentHandler.getComponents);
    executeEventDispatch.on('executor.createExpectedState', expectedState.create);
    executeEventDispatch.on('executor.createDataStore', dataStore.create);
    executeEventDispatch.on('executor.getPageState', pageStateHandler.getPageState);
    executeEventDispatch.on('executor.runAssertions', oracle.runAssertions);
    executeEventDispatch.on('executor.runDeepEqual', oracle.deepEqual);

    componentHandler.on('componentHandler.findFiles', findFiles.search);
    componentHandler.on('componentHandler.filesReadyToValidate', validators.validateComponents);

    pageStateHandler.on('pageStateHandler.getComponents', componentHandler.getComponents);

    expectedState.on('expectedState.getComponent', componentHandler.getComponent);
    expectedState.on('expectedState.elementsReceived', validators.validateElements);
    expectedState.on('expectedState.modelReceived', validators.validateModel);
    expectedState.on('expectedState.eventsReceived', validators.validateEvents);
    expectedState.on('expectedState.childrenReceived', validators.validateChildren);
    expectedState.on('expectedState.actionsReceived', validators.validateActions);

    globalEventDispatch.on('componentHandler.getComponentActions', componentHandler.getComponentActions);
    globalEventDispatch.on('componentHandler.getComponents', componentHandler.getComponents);
    globalEventDispatch.on('expectedState.create', expectedState.create);
    globalEventDispatch.on('oracle.runAssertions', oracle.runAssertions);
    globalEventDispatch.on('dataStore.create', dataStore.create);
};
