'use strict';

const webdriver = require('selenium-webdriver');
const EventEmitter = require('events').EventEmitter;

let executeTestCase;

module.exports = executeTestCase = {
    configure(testPath) {
        process.on('uncaughtException', function(error) {
            process.exitCode = 1;
            executeTestCase.emit('executeTestCase.exceptionCaught', error);
        });

        process.env.TEST_NAME = testPath.split('\\').pop().split('/').pop();

        global.By = webdriver.By;
        global.until = webdriver.until;

        const testCase = require(testPath);

        executeTestCase.emit('executeTestCase.loadComponents', process.env.COMPONENTS_PATH);

        if (process.env.SAUCE_LABS === 'true') {
            executeTestCase.emit('executeTestCase.driverSetToSauce');
        } else {
            executeTestCase.emit('executeTestCase.driverSetToLocal');
        }

        executeTestCase.emit('executeTestCase.configured', testCase);
    },
};

Object.setPrototypeOf(executeTestCase, new EventEmitter());
