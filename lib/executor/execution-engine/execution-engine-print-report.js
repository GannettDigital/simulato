'use strict';

module.exports = {
  printOutputToConsole(report) {
    console.log(`\nTest Summary`);
    console.log(`\tTotal actions run: ${report.actionCount}`);
    console.log(`\tRun time: ${report.time[0]}.${report.time[1]} seconds`);
    if (report.error) {
        console.log(`\tFailed Action: ${report.error.nameOfComponent} - ${report.error.actionName}`);
        console.log(`\t\tStep: ${report.error.failedStep}`);
        console.log(`\t\t\tError: ${report.error.name}`);
    }
    console.log(`\n--- Test Ended: ${report.testName} ---\n`);
  },
};
