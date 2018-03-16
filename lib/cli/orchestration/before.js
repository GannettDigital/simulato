'use strict';

const Saucelabs = require('../../util/saucelabs.js');
const concurrent = require('palinode').concurrent;
const EventEmitter = require('events').EventEmitter;

let before;

module.exports = before = {
    runScripts(configureInfo) {
        let functions = [];

        if (process.env.SAUCE_LABS === 'true') {
            functions.push(Saucelabs.connect);
        }

        if (process.env.BEFORE_SCRIPT) {
            functions.push(require(process.env.BEFORE_SCRIPT));
        }

        if (functions.length > 0) {
            concurrent(functions, function(error) {
                if (error) {
                    console.log(error);
                    process.exit(1);
                } else {
                    before.emit('before.finished', configureInfo);
                }
            });
        } else {
            before.emit('before.finished', configureInfo);
        }
    },
};

Object.setPrototypeOf(before, new EventEmitter());
