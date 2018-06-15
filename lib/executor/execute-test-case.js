'use strict';

const webdriver = require('selenium-webdriver');
const EventEmitter = require('events').EventEmitter;
const configHandler = require('../util/config-handler.js');

let executeTestCase;

module.exports = executeTestCase = {
    configure(testPath) {
        process.on('uncaughtException', function(error) {
            process.exitCode = 1;
            executeTestCase.emit('executeTestCase.exceptionCaught', error);
        });

        global.By = webdriver.By;
        global.until = webdriver.until;

        const testCase = require(testPath);

        executeTestCase.emit('executeTestCase.loadComponents', configHandler.get('componentPath'));

        if (configHandler.get('saucelabs')) {
            executeTestCase.emit('executeTestCase.driverSetToSauce');
        } else {
            executeTestCase.emit('executeTestCase.driverSetToLocal');
        }

        executeTestCase.emit('executeTestCase.configured', testCase);
    },
};

Object.setPrototypeOf(executeTestCase, new EventEmitter());
