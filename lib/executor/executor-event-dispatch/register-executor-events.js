'use strict';

const executeTestCase = require('../execute-test-case.js');
const driverHandler = require('../driver-handler.js');
const reporters = require('../reporters');
const executionEngine = require('../execution-engine/execution-engine.js');
const eeReportHandler = require('../execution-engine/execution-engine-report-handler.js');
const eePrintReport = require('../execution-engine/execution-engine-print-report.js');
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
  executeTestCase.on('executeTestCase.reporterSetToTeamcity', function() {
    executionEngine.on('executionEngine.actionStarted', reporters.teamcity.reportStartAction);
    executionEngine.on('executionEngine.actionFinsihed', reporters.teamcity.reportFinishedAction);
    executionEngine.on('executionEngine.stepEnded', reporters.teamcity.reportEndStep);
  });
  executeTestCase.on('executeTestCase.reporterSetToBasic', function() {
    executionEngine.on('executionEngine.actionStarted', reporters.basic.reportStartAction);
    executionEngine.on('executionEngine.stepEnded', reporters.basic.reportEndStep);
  });
  executeTestCase.on('executeTestCase.finished', function() {
    executorEventDispatch.emit('executor.ended');
  });

  executionEngine.on('executionEngine.configured', eeReportHandler.startReport);
  executionEngine.on('executionEngine.actionStarted', eeReportHandler.recordNewAction);
  executionEngine.on('executionEngine.stepStarted', eeReportHandler.recordNewStep);
  executionEngine.on('executionEngine.actionErrored', eeReportHandler.appendReportError);
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

  eeReportHandler.on('eeReportHandler.reportFinalized', eePrintReport.printOutputToConsole);
  eeReportHandler.on('eeReportHandler.reportFinalized', executeTestCase.finishTestCase);
  eeReportHandler.on('eeReportHandler.errorOccured', driverHandler.handleError);

  assertionHandler.on('assertionHandler.getPageState', function(components, callback) {
    executorEventDispatch.emit('executor.getPageState', components, callback);
  });
  assertionHandler.on('assertionHandler.runAssertions', function(state, assertions, callback) {
    executorEventDispatch.emit('executor.runAssertions', state, assertions, callback);
  });
  assertionHandler.on('assertionHandler.runDeepEqual', function(state, expectedState, callback) {
    executorEventDispatch.emit('executor.runDeepEqual', state, expectedState, callback);
  });
  assertionHandler.on('assertionHandler.stateCheckTimedOut', stateCompare.printDifference);
  assertionHandler.on('assertionHandler.effectsVerified', executionEngine.applyEffects);
  assertionHandler.on('assertionHandler.preconditionsVerified', executionEngine.applyPreconditions);
};
