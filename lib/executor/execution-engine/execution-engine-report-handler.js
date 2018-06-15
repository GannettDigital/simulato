'use strict';

const EventEmitter = require('events').EventEmitter;
const configHandler = require('../../util/config-handler.js');

let eeReportHandler;

module.exports = eeReportHandler = {
  _report: {
    testName: null,
    actions: [],
    time: null,
    status: 'fail',
    errorLocation: {
      actionIndex: null,
      step: null,
    },
  },
  _currentActionIndex: null,
  startReport() {
    eeReportHandler._report.testName = configHandler.get('testName');
    eeReportHandler._report.time = process.hrtime();
  },
  startAction(actionConfig) {
    eeReportHandler._report.actions.push({
      component: actionConfig.name,
      action: actionConfig.actionName,
      status: 'fail',
      time: process.hrtime(),
      steps: {
        preconditions: null,
        perform: null,
        effects: null,
      },
    });
    eeReportHandler._currentActionIndex = eeReportHandler._report.actions.length - 1;
  },
  endAction() {
    let action = eeReportHandler._report.actions[eeReportHandler._currentActionIndex];
    action.time = process.hrtime(action.time);
    if (eeReportHandler._report.errorLocation.actionIndex !== eeReportHandler._currentActionIndex) {
      action.status = 'pass';
    }
  },
  startStep(stepName) {
    eeReportHandler._report.actions[eeReportHandler._currentActionIndex].steps[stepName] = {
      status: 'fail',
      time: process.hrtime(),
      error: null,
    };
  },
  endStep(error, stepName) {
    let step = eeReportHandler._report.actions[eeReportHandler._currentActionIndex].steps[stepName];
    step.time = process.hrtime(step.time);
    if (error) {
      step.error = {
        name: error.name,
        code: error.code,
        message: error.message,
        stack: error.stack,
      };
      eeReportHandler._report.errorLocation.step = stepName;
      eeReportHandler._report.errorLocation.actionIndex = eeReportHandler._currentActionIndex;
      eeReportHandler.emit('eeReportHandler.errorOccured');
    } else {
      step.status = 'pass';
    }
  },
  appendStateCompare(compareString) {
    let step = eeReportHandler._report.actions[eeReportHandler._currentActionIndex].steps['effects'];
    step.stateCompare = compareString;
  },
  finalizeReport() {
    eeReportHandler._report.time = process.hrtime(eeReportHandler._report.time);
    if (eeReportHandler._report.errorLocation.actionIndex === null) {
      eeReportHandler._report.status = 'pass';
    }
    process.send(eeReportHandler._report);
  },
};

Object.setPrototypeOf(eeReportHandler, new EventEmitter());

eeReportHandler.on('eeReportHandler.errorOccured', eeReportHandler.endAction);
