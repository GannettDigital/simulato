'use strict';

const testRunner = require('../test-runner/test-runner.js');
const testReportHandler = require('../test-runner/test-report-handler.js');
const writeReportToDisk = require('../report-to-disk');
const reporters = require('../reporters');

module.exports = function(runnerEventDispatch) {
    runnerEventDispatch.on('runner.scheduled', testRunner.configure);
    runnerEventDispatch.on('runner.scheduled', testReportHandler.startReportHandler);

    testRunner.on('testRunner.testStarted', testReportHandler.createTestReport);
    testRunner.on('testRunner.testFinished', testReportHandler.finalizeTestReport);
    testRunner.on('testRunner.testDataReceived', testReportHandler.appendTestReport);
    testRunner.on('testRunner.childStderrReceived', testReportHandler.appendTestStdErr);
    testRunner.on('testRunner.done', testReportHandler.finalizeReport);

    testReportHandler.on('testReportHandler.testReportFinalized', reporters.basic.printTestResult);
    testReportHandler.on('testReportHandler.reportFinalized', writeReportToDisk.json);
    testReportHandler.on('testReportHandler.reportFinalized', reporters.basic.printReportSummary);
    testReportHandler.on('testReportHandler.reportFinalized', function() {
        runnerEventDispatch.emit('runner.ended');
    });
};
