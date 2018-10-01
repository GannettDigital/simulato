'use strict';

const Emitter = require('../../util/emitter.js');
const runnerEventDispatch = require('../runner-event-dispatch/runner-event-dispatch.js');
const configHandler = require('../../util/config-handler.js');

let testReportHandler;
module.exports = testReportHandler = {
  _report: {
    status: 'fail',
    testCount: 0,
    failedTestCount: 0,
    time: null,
    testReports: [],
  },
  startReportHandler() {
    testReportHandler._report.time = process.hrtime();
  },
  createTestReport(testNumber, testName) {
    if (testReportHandler._report.testReports[testNumber]) {
      testReportHandler._report.testReports[testNumber].testRuns.push({stdErr: '', report: {}});
    } else {
      testReportHandler._report.testCount++;
      testReportHandler._report.failedTestCount++;
      testReportHandler._report.testReports[testNumber] = {
        testName,
        status: 'fail',
        rerunCount: 0,
        testRuns: [{stdErr: '', report: {}}],
      };
    }
  },
  appendTestStdErr(stdErr, testNumber) {
    let testReport = testReportHandler._report.testReports[testNumber];
    let testRun = testReport.testRuns[testReport.rerunCount];
    testRun.stdErr += stdErr;
  },
  appendTestReport(report, testNumber) {
    let testReport = testReportHandler._report.testReports[testNumber];
    let testRun = testReport.testRuns[testReport.rerunCount];
    testRun.report = report;
  },
  finalizeTestReport(testNumber, rerun) {
    let testReport = testReportHandler._report.testReports[testNumber];
    let testRun = testReport.testRuns[testReport.rerunCount];
    if (testRun.report.status === 'pass') {
      testReportHandler._report.failedTestCount--;
      testReport.status = 'pass';
    }
    if (Object.keys(testRun.report).length === 0) {
      testRun.report = {
        testName: testReport.testName,
        status: 'fail',
      };
    }
    if (rerun && testRun.report.status === 'fail') {
      testRun.report.status = 'rerun';
      testReport.rerunCount++;
    }
    testReportHandler._handleTestReport(testRun.report);
  },
  finalizeReport() {
    testReportHandler._report.time = process.hrtime(testReportHandler._report.time);
    if (!testReportHandler._report.failedTestCount) {
      testReportHandler._report.status = 'pass';
    }
    testReportHandler._handleTestReportSummary();
    testReportHandler.emit('testReportHandler.reportFinalized');
  },
  _handleTestReport(report) {
    switch (configHandler.get('reporter')) {
      case 'basic':
        testReportHandler.emit('testReportHandler.testReportReadyToPrint', 'basic', report);
    }
  },
  _handleTestReportSummary() {
    switch (configHandler.get('reporter')) {
      case 'basic':
        testReportHandler.emit('testReportHandler.testReportSummaryReadyToPrint', 'basic', testReportHandler._report);
    }

    if (configHandler.get('reportPath')) {
      switch (configHandler.get('reportFormat')) {
        case 'JSON':
          testReportHandler.emit('testReportHandler.testReportSummaryReadyToWrite', 'JSON', testReportHandler._report);
          break;
        case 'actionJSON':
          testReportHandler.emit('testReportHandler.testReportSummaryReadyToWrite',
              'actionJSON', testReportHandler._report);
          break;
      }
    }
  },
};

Emitter.mixIn(testReportHandler, runnerEventDispatch);
