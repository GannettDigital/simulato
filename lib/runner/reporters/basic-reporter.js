'use strict';
const jestDiff = require('jest-diff');

const symbols = {
  pass: '✓',
  fail: '❌',
  rerun: '⟲',
};

const funSymbols = {
  pass: '🌴',
  fail: '🍅',
  rerun: '🏃',
};

module.exports = {
  printTestResult(report) {
    console.log(`${symbols[report.status]} ${report.testName} ${funSymbols[report.status]}`);
    if (report.status == 'fail') {
      if (report.stdErr) {
        console.log('\n' + report.stdErr);
      }
      if (report.errorLocation) {
        let failedStep = report.actions[report.errorLocation.actionIndex].steps[report.errorLocation.step];
        console.log('\n' + failedStep.error.stack);
        let failedAction = report.actions[report.errorLocation.actionIndex];
        console.log(`\n\x1b[31m` +
          `Action: ${failedAction.component}.${failedAction.action} ` +
          `\nStep: ${report.errorLocation.step} ` +
          `\nActionIndex: ${report.errorLocation.actionIndex}\x1b[0m`);
        if (report.errorLocation.step === 'effects') {
          console.log(jestDiff(failedStep.expectedState, failedStep.pageState, {
            aAnnotation: 'Expected State',
            bAnnotation: 'Page State',
            expand: false,
          }));
        }
      }
    }
  },
  printReportSummary(report) {
    console.log(`\n*** Final Aggregate Test Summary ***`);
    console.log(`Total tests run: ${report.testCount}`);
    console.log(`Tests passed: ${report.testCount - report.failedTestCount}`);
    console.log(`Tests failed: ${report.failedTestCount}`);
    console.log(`Run time: ${report.time[0]}.${report.time[1]} seconds\n`);
    if (report.status === 'fail') {
      console.log(`\x1b[31mFailed Tests:\n\x1b[0m`);
      for (let testReport of report.testReports) {
        if (testReport.status === 'fail') {
          console.log(`\x1b[31m${testReport.testName} - Ran ${testReport.rerunCount + 1} time(s)\x1b[0m`);
          for (let [index, testRun] of testReport.testRuns.entries()) {
            if (testRun.report.errorLocation) {
              let failedStep =
                testRun.report.actions[testRun.report.errorLocation.actionIndex]
                    .steps[testRun.report.errorLocation.step];
              console.log(`\t\x1b[31mRun ${index + 1}: ` +
                `${failedStep.error.name}: ${failedStep.error.message}\x1b[0m`);
              let failedAction = testRun.report.actions[testRun.report.errorLocation.actionIndex];
              console.log(`\t\t\x1b[31m` +
                `Action: ${failedAction.component}.${failedAction.action} ` +
                `Step: ${testRun.report.errorLocation.step} ` +
                `ActionIndex: ${testRun.report.errorLocation.actionIndex}\x1b[0m`);
            } else {
              console.log(`\t\x1b[31mRun ${index + 1}: ${testRun.stdErr}\x1b[0m`);
            }
          }
          console.log('');
        }
      }
    }
  },
};
