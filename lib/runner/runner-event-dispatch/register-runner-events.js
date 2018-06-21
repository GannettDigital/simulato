'use strict';

const testRunner = require('../test-runner/test-runner.js');
const testReportHandler = require('../test-runner/test-report-handler.js');
const writeReportToDisk = require('../report-to-disk');
const reporters = require('../reporters');
const debugPortHandler = require('../test-runner/debug-port-handler.js');

module.exports = function(runnerEventDispatch) {
    runnerEventDispatch.on('runner.scheduled', testRunner.configure);
    runnerEventDispatch.on('runner.scheduled', testReportHandler.startReportHandler);

    runnerEventDispatch.on('testRunner.testStarted', testReportHandler.createTestReport);
    runnerEventDispatch.on('testRunner.testFinished', testReportHandler.finalizeTestReport);
    runnerEventDispatch.on('testRunner.testDataReceived', testReportHandler.appendTestReport);
    runnerEventDispatch.on('testRunner.childStderrReceived', testReportHandler.appendTestStdErr);
    runnerEventDispatch.on('testRunner.done', testReportHandler.finalizeReport);
    runnerEventDispatch.on('testRunner.getDebugPort', debugPortHandler.getPort);

    runnerEventDispatch.on('testReportHandler.testReportFinalized', reporters.basic.printTestResult);
    runnerEventDispatch.on('testReportHandler.reportFinalized', writeReportToDisk.json);
    runnerEventDispatch.on('testReportHandler.reportFinalized', reporters.basic.printReportSummary);
    runnerEventDispatch.on('testReportHandler.reportFinalized', function() {
        runnerEventDispatch.emit('runner.ended');
    });
};
