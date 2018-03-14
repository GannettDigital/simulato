'use strict';

const testRunner = require('../test-runner/test-runner.js');
const childProcessOutputHandler = require('../test-runner/child-process-output-handler.js');
const testReportHandler = require('../test-runner/test-report-handler.js');
const writeReportToDisk = require('../test-runner/write-report-to-disk.js');
const printOutput = require('../test-runner/print-output.js');

module.exports = function(runnerEventDispatch) {
    runnerEventDispatch.on('runner.scheduled', testRunner.configure);
    runnerEventDispatch.on('runner.scheduled', testReportHandler.startReportHandler);

    testRunner.on('testRunner.testStarted', childProcessOutputHandler.addNewChildOutput);
    testRunner.on('testRunner.testDataReceived', testReportHandler.appendTestReport);
    testRunner.on('testRunner.childStdoutReceived', childProcessOutputHandler.appendStdout);
    testRunner.on('testRunner.childStderrReceived', childProcessOutputHandler.appendStderr);
    testRunner.on('testRunner.done', childProcessOutputHandler.finalizeChildOutput);
    testRunner.on('testRunner.done', testReportHandler.finalizeReport);

    childProcessOutputHandler.on('childProcessOutputHandler.childOutputFinalized', printOutput.addChildOutput);

    testReportHandler.on('testReportHandler.reportFinalized', writeReportToDisk.writeReport);
    testReportHandler.on('testReportHandler.reportFinalized', printOutput.addTestSummary);
    testReportHandler.on('testReportHandler.reportFinalized', function() {
        runnerEventDispatch.emit('runner.ended');
    });
};
