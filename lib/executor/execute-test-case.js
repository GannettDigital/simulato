'use strict';

const webdriver = require('selenium-webdriver');
const remote = require('selenium-webdriver/remote');

const Emitter = require('../util/emitter.js');
const configHandler = require('../util/config/config-handler.js');
const executorEventDispatch = require('./executor-event-dispatch/executor-event-dispatch.js');

let executeTestCase;

module.exports = executeTestCase = {
  configure(testPath) {
    global.By = webdriver.By;
    global.until = webdriver.until;
    global.remote = remote;
    global.Key = webdriver.Key;
    const testCase = require(testPath);

    executeTestCase.emit('componentHandler.configure', configHandler.get('componentPath'));

    executeTestCase.emit('executeTestCase.setupDriver');

    process.on('uncaughtException', function(error) {
      process.exitCode = 1;
      executeTestCase.emit('executeTestCase.exceptionCaught', error);
    });

    executeTestCase.emit('executeTestCase.configured', testCase);
  },
};

Emitter.mixIn(executeTestCase, executorEventDispatch);
