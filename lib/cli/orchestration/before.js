'use strict';

const Saucelabs = require('../../util/saucelabs.js');
const concurrent = require('palinode').concurrent;
const EventEmitter = require('events').EventEmitter;
const configHandler = require('../../util/config-handler.js');

let before;

module.exports = before = {
    runScripts(configureInfo) {
        let functions = [];

        if (configHandler.get('before')) {
            functions.push(require(configHandler.get('before')));
        }

        if (configHandler.get('saucelabs')) {
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

Object.setPrototypeOf(before, new EventEmitter());

before.on('before.readyToRunFunctions', before._runFunctions);
