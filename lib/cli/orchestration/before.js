'use strict';

const Saucelabs = require('../../util/saucelabs.js');
const concurrent = require('palinode').concurrent;
const EventEmitter = require('events').EventEmitter;

let before;

module.exports = before = {
    runScripts(configureInfo) {
        let functions = [];

        if (process.env.BEFORE_SCRIPT) {
            functions.push(require(process.env.BEFORE_SCRIPT));
        }

        if (process.env.SAUCE_LABS === 'true') {
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
