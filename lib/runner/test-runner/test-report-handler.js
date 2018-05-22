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
    testReportHandler._report.testCount++;
    testReportHandler._report.failedTestCount++;
    testReportHandler._report.testReports[testNumber] = {
      testName,
      status: 'fail',
    };
  },
  appendTestStdErr(stdErr, testNumber) {
    if (testReportHandler._report.testReports[testNumber].stdErr) {
      testReportHandler._report.testReports[testNumber].stdErr += stdErr;
    } else {
      testReportHandler._report.testReports[testNumber].stdErr = '' + stdErr;
    }
  },
  appendTestReport(report, testNumber) {
    if (testReportHandler._report.testReports[testNumber].stdErr) {
      report.stdErr = testReportHandler._report.testReports[testNumber].stdErr;
    }
    if (report.status === 'pass') {
      testReportHandler._report.failedTestCount--;
    }
    testReportHandler._report.testReports[testNumber] = report;
  },
  finalizeTestReport(testNumber) {
    testReportHandler.emit('testReportHandler.testReportFinalized', testReportHandler._report.testReports[testNumber]);
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
