'use strict';

const EventEmitter = require('events').EventEmitter;

let testReportHandler;
module.exports = testReportHandler = {
  _report: {
    testCount: 0,
    failedTestCount: 0,
    time: null,
    testReports: [],
  },
  _startTime: null,
  startReportHandler() {
    testReportHandler._startTime = process.hrtime();
  },
  appendTestReport(report) {
    testReportHandler._report.testCount++;
    testReportHandler._report.testReports.push(report);
    if (report.error) {
      testReportHandler._report.failedTestCount++;
    }
  },
  finalizeReport() {
    testReportHandler._report.time = process.hrtime(testReportHandler._startTime);
    testReportHandler.emit('testReportHandler.reportFinalized', testReportHandler._report);
  },
};

Object.setPrototypeOf(testReportHandler, new EventEmitter());
