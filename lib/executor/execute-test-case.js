'use strict';

const webdriver = require('selenium-webdriver');
const EventEmitter = require('events').EventEmitter;

let executeTestCase;

module.exports = executeTestCase = {
    configure(testPath) {
        process.on('uncaughtException', function(error) {
            executeTestCase.emit('executeTestCase.exceptionCaught', error);
            console.log('\n' + error.stack);
            process.exitCode = 1;
            executeTestCase.emit('executeTestCase.errorHandled');
        });
        let testName = testPath.split('\\').pop().split('/').pop();
        process.env.TEST_NAME = testName;

        console.log(`+++ Starting Test: ${testName} +++\n`);

        global.By = webdriver.By;
        global.until = webdriver.until;

        const testCase = require(testPath);

        executeTestCase.emit('executeTestCase.loadComponents', process.env.COMPONENTS_PATH);

        if (process.env.SAUCE_LABS === 'true') {
            executeTestCase.emit('executeTestCase.driverSetToSauce');
        } else {
            executeTestCase.emit('executeTestCase.driverSetToLocal');
        }

        if (process.env.REPORTER === 'teamcity') {
            executeTestCase.emit('executeTestCase.reporterSetToTeamcity');
        } else {
            executeTestCase.emit('executeTestCase.reporterSetToBasic');
        }
        executeTestCase.emit('executeTestCase.configured', testCase);
    },
    finishTestCase(report) {
        if (process.env.USING_PARENT_TEST_RUNNER === 'true') {
            process.send(report);
        }
        executeTestCase.emit('executeTestCase.finished');
    },
};

Object.setPrototypeOf(executeTestCase, new EventEmitter());
