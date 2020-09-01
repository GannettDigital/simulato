'use strict';

const Saucelabs = require('../../util/saucelabs.js');
const concurrent = require('palinode').concurrent;
const Emitter = require('../../util/emitter.js');
const configHandler = require('../../util/config/config-handler.js');
const cliEventDispatch = require('../cli-event-dispatch/cli-event-dispatch.js');

let before;

module.exports = before = {
  runScripts(configureInfo) {
    const functions = [];

    if (configHandler.get('before')) {
      functions.push(require(configHandler.get('before')));
    }

    if (configHandler.get('driver.saucelabs')) {
      Saucelabs.connect(function(error) {
        if (error) {
          throw error;
        }
        before.emit('before.readyToRunFunctions', functions, configureInfo);
      });
    } else {
      before.emit('before.readyToRunFunctions', functions, configureInfo);
    }
  },
  _runFunctions(functions, configureInfo) {
    concurrent(functions, function(error) {
      if (error) {
        throw error;
      } else {
        before.emit('before.finished', configureInfo);
      }
    });
  },
};

Emitter.mixIn(before, cliEventDispatch);

before.on('before.readyToRunFunctions', before._runFunctions);
