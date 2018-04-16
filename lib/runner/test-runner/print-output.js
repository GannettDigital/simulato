'use strict';

const EventEmitter = require('events').EventEmitter;

let printOutput;
module.exports = printOutput = {
    _testSummary: null,
    _childOutput: null,
    addTestSummary(data) {
        printOutput._testSummary = data;
        printOutput.emit('printOutput.testSummaryAdded');
    },
    addChildOutput(data) {
        printOutput._childOutput = data;
        printOutput.emit('printOutput.childOutputAdded');
    },
    _checkIfReadyToPrint() {
        if (printOutput._testSummary && printOutput._childOutput) {
            printOutput.emit('printOutput.outputReadied');
        }
    },
    _printChildOutput() {
        for (let i = 0; i < printOutput._childOutput.stdoutArray.length; i++) {
            if (printOutput._childOutput.stdoutArray[i]) {
                console.log(printOutput._childOutput.stdoutArray[i]);
            }
            if (printOutput._childOutput.stderrArray[i]) {
                console.log(printOutput._childOutput.stderrArray[i]);
            }
        }
    },
    _printTestSummary() {
        console.log(`*** Final Aggregate Test Summary ***`);
        console.log(`Total tests run: ${printOutput._testSummary.testCount}`);
        console.log(`Tests passed: ${printOutput._testSummary.testCount - printOutput._testSummary.failedTestCount}`);
        console.log(`Tests failed: ${printOutput._testSummary.failedTestCount}`);
        console.log(`Run time: ${printOutput._testSummary.time[0]}.${printOutput._testSummary.time[1]} seconds\n`);
        for (let testReport of printOutput._testSummary.testReports) {
            if (testReport.error) {
                process.exitCode = 1;
                console.log(`${testReport.testName}:`);
                console.log(`\tFailed Action: ${testReport.error.nameOfComponent} - ${testReport.error.actionName}`);
                console.log(`\t\tStep: ${testReport.error.failedStep}`);
                console.log(`\t\t\tError: ${testReport.error.name}`);
            }
        }
    },
};

Object.setPrototypeOf(printOutput, new EventEmitter());

printOutput.on('printOutput.testSummaryAdded', printOutput._checkIfReadyToPrint);
printOutput.on('printOutput.childOutputAdded', printOutput._checkIfReadyToPrint);
printOutput.on('printOutput.outputReadied', printOutput._printChildOutput);
printOutput.on('printOutput.outputReadied', printOutput._printTestSummary);
