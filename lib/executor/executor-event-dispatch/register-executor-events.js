'use strict';

const executeTestCase = require('../execute-test-case.js');
const driverHandler = require('../driver-handler.js');
const executionEngine = require('../execution-engine/execution-engine.js');
const eeReportHandler = require('../execution-engine/execution-engine-report-handler.js');
const assertionHandler = require('../assertion-handler.js');

module.exports = function(executorEventDispatch) {
  executorEventDispatch.on('executor.scheduled', executeTestCase.configure);

  executorEventDispatch.on('executeTestCase.exceptionCaught', executionEngine.errorOccurred);
  executorEventDispatch.on('executeTestCase.errorHandled', executionEngine.done);
  executorEventDispatch.on('executeTestCase.setupDriver', driverHandler.setup);
  executorEventDispatch.on('executeTestCase.configured', executionEngine.configure);

  executorEventDispatch.on('executionEngine.configured', eeReportHandler.startReport);
  executorEventDispatch.on('executionEngine.actionStarted', eeReportHandler.startAction);
  executorEventDispatch.on('executionEngine.actionFinished', eeReportHandler.endAction);
  executorEventDispatch.on('executionEngine.stepStarted', eeReportHandler.startStep);
  executorEventDispatch.on('executionEngine.stepEnded', eeReportHandler.endStep);
  executorEventDispatch.on('executionEngine.done', eeReportHandler.finalizeReport);
  executorEventDispatch.on('executionEngine.done', driverHandler.quit);
  executorEventDispatch.on('executionEngine.preconditionsReadyForVerification', assertionHandler.assertPageState);
  executorEventDispatch.on('executionEngine.effectsReadyForVerification', assertionHandler.assertExpectedPageState);

  executorEventDispatch.on('eeReportHandler.errorOccured', driverHandler.handleError);

  executorEventDispatch.on('assertionHandler.stateCheckTimedOut', executionEngine.handleFailedStateCheck);
  executorEventDispatch.on('assertionHandler.effectsVerified', executionEngine.applyEffects);
  executorEventDispatch.on('assertionHandler.preconditionsVerified', executionEngine.applyPreconditions);
  executorEventDispatch.on('assertionHandler.preconditionsCalculated', eeReportHandler.addPreconditions);
};
