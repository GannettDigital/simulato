'use strict';

const xTestRunner = require('../x-test-runner/x-test-runner.js');
const testRunner = require('../test-runner/test-runner.js');
const testReportHandler = require('../test-runner/test-report-handler.js');
const debugPortHandler = require('../test-runner/debug-port-handler.js');
const reporters = require('../reporters');
const writers = require('../writers');

module.exports = function(runnerEventDispatch) {
  runnerEventDispatch.on('runner.scheduled', xTestRunner.configure);

  // runnerEventDispatch.on('runner.scheduled', testRunner.configure);
  // runnerEventDispatch.on('runner.scheduled', testReportHandler.startReportHandler);

  runnerEventDispatch.on('testRunner.testStarted', testReportHandler.createTestReport);
  runnerEventDispatch.on('testRunner.testFinished', testReportHandler.finalizeTestReport);
  runnerEventDispatch.on('testRunner.testDataReceived', testReportHandler.appendTestReport);
  runnerEventDispatch.on('testRunner.childStderrReceived', testReportHandler.appendTestStdErr);
  runnerEventDispatch.on('testRunner.done', testReportHandler.finalizeReport);
  runnerEventDispatch.on('testRunner.getDebugPort', debugPortHandler.getPort);

  runnerEventDispatch.on('testReportHandler.testReportReadyToPrint', function(reporter, report) {
    reporters[reporter].printTestResult(report);
  });
  runnerEventDispatch.on('testReportHandler.testReportSummaryReadyToPrint', function(reporter, report) {
    reporters[reporter].printReportSummary(report);
  });
  runnerEventDispatch.on('testReportHandler.testReportSummaryReadyToWrite', function(format, report) {
    writers[format](report);
  });
  runnerEventDispatch.on('testReportHandler.reportFinalized', function() {
    runnerEventDispatch.emit('runner.ended');
  });
};
