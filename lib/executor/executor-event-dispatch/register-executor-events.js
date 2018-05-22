'use strict';

const executeTestCase = require('../execute-test-case.js');
const driverHandler = require('../driver-handler.js');
const executionEngine = require('../execution-engine/execution-engine.js');
const eeReportHandler = require('../execution-engine/execution-engine-report-handler.js');
const assertionHandler = require('../assertion-handler.js');
const stateCompare = require('../state-compare.js');

module.exports = function(executorEventDispatch) {
  executorEventDispatch.on('executor.scheduled', executeTestCase.configure);

  executeTestCase.on('executeTestCase.exceptionCaught', executionEngine.errorOccurred);
  executeTestCase.on('executeTestCase.errorHandled', executionEngine.done);
  executeTestCase.on('executeTestCase.loadComponents', function(componentsPath) {
    executorEventDispatch.emit('executor.loadComponents', componentsPath);
  });
  executeTestCase.on('executeTestCase.driverSetToSauce', driverHandler.inSaucelabs);
  executeTestCase.on('executeTestCase.driverSetToLocal', driverHandler.locally);
  executeTestCase.on('executeTestCase.configured', executionEngine.configure);

  executionEngine.on('executionEngine.configured', eeReportHandler.startReport);
  executionEngine.on('executionEngine.actionStarted', eeReportHandler.startAction);
  executionEngine.on('executionEngine.actionFinished', eeReportHandler.endAction);
  executionEngine.on('executionEngine.stepStarted', eeReportHandler.startStep);
  executionEngine.on('executionEngine.stepEnded', eeReportHandler.endStep);
  executionEngine.on('executionEngine.done', eeReportHandler.finalizeReport);
  executionEngine.on('executionEngine.done', driverHandler.quit);
  executionEngine.on('executionEngine.preconditionsReadyForVerification', assertionHandler.assertPageState);
  executionEngine.on('executionEngine.effectsReadyForVerification', assertionHandler.assertExpectedPageState);
  executionEngine.on('executionEngine.createExpectedState', function(datStore, callback) {
    executorEventDispatch.emit('executor.createExpectedState', datStore, callback);
  });
  executionEngine.on('executionEngine.createDataStore', function(callback) {
    executorEventDispatch.emit('executor.createDataStore', callback);
  });
  executionEngine.on('executionEngine.getComponents', function(callback) {
    executorEventDispatch.emit('executor.getComponents', callback);
  });

  eeReportHandler.on('eeReportHandler.errorOccured', driverHandler.handleError);

  assertionHandler.on('assertionHandler.getPageState', function(components, callback) {
    executorEventDispatch.emit('executor.getPageState', components, callback);
  });
  assertionHandler.on('assertionHandler.runAssertions', function(pageState, dataStore, assertions, callback) {
    executorEventDispatch.emit('executor.runAssertions', pageState, dataStore, assertions, callback);
  });
  assertionHandler.on('assertionHandler.runDeepEqual', function(state, expectedState, callback) {
    executorEventDispatch.emit('executor.runDeepEqual', state, expectedState, callback);
  });
  assertionHandler.on('assertionHandler.stateCheckTimedOut', stateCompare.printDifference);
  assertionHandler.on('assertionHandler.effectsVerified', executionEngine.applyEffects);
  assertionHandler.on('assertionHandler.preconditionsVerified', executionEngine.applyPreconditions);

  stateCompare.on('stateCompare.differenceCreated', eeReportHandler.appendStateCompare);
};
