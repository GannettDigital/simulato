'use strict';

const EventEmitter = require('events').EventEmitter;

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
    if (rerun && testRun.report.status === 'fail') {
      testRun.report.status = 'rerun';
      testReport.rerunCount++;
    }
    testReportHandler.emit('testReportHandler.testReportFinalized', testRun.report);
  },
  finalizeReport() {
    testReportHandler._report.time = process.hrtime(testReportHandler._report.time);
    if (!testReportHandler._report.failedTestCount) {
      testReportHandler._report.status = 'pass';
    }
    testReportHandler.emit('testReportHandler.reportFinalized', testReportHandler._report);
  },
};

Object.setPrototypeOf(testReportHandler, new EventEmitter());
