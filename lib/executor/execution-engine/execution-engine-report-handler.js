'use strict';

const EventEmitter = require('events').EventEmitter;

let eeReportHandler;

module.exports = eeReportHandler = {
  _report: {
    testName: null,
    actionCount: 0,
    time: null,
    error: null,
  },
  _currentAction: null,
  _currentStep: null,
  _startTime: null,
  startReport() {
    eeReportHandler._report.testName = process.env.TEST_NAME;
    eeReportHandler._startTime = process.hrtime();
  },
  recordNewAction(action, actionConfig) {
    eeReportHandler._report.actionCount++;
    eeReportHandler._currentAction = actionConfig;
  },
  recordNewStep(step) {
    eeReportHandler._currentStep = step;
  },
  appendReportError(error) {
    eeReportHandler.emit('eeReportHandler.errorOccured');
    eeReportHandler._report.error = error;
    eeReportHandler._report.error.instanceName = eeReportHandler._currentAction.instanceName;
    eeReportHandler._report.error.actionName = eeReportHandler._currentAction.actionName;
    eeReportHandler._report.error.failedStep = eeReportHandler._currentStep;
  },
  finalizeReport() {
    eeReportHandler._report.time = process.hrtime(eeReportHandler._startTime);
    eeReportHandler.emit('eeReportHandler.reportFinalized', eeReportHandler._report);
  },
};

Object.setPrototypeOf(eeReportHandler, new EventEmitter());

eeReportHandler.on('eeReportHandler.uncaughtErrorReceived', eeReportHandler.appendReportError);
eeReportHandler.on('eeReportHandler.uncaughtErrorHandled', eeReportHandler.finalizeReport);
