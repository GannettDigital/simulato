'use strict';

const webdriver = require('selenium-webdriver');
const Emitter = require('../util/emitter.js');
const configHandler = require('../util/config-handler.js');
const executorEventDispatch = require('./executor-event-dispatch/executor-event-dispatch.js');

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

        executeTestCase.emit('componentHandler.configure', configHandler.get('componentPath'));

        if (configHandler.get('saucelabs')) {
            executeTestCase.emit('executeTestCase.driverSetToSauce');
        } else {
            executeTestCase.emit('executeTestCase.driverSetToLocal');
        }

        executeTestCase.emit('executeTestCase.configured', testCase);
    },
};

Emitter.mixIn(executeTestCase, executorEventDispatch);
