'use strict';

const EventEmitter = require('events').EventEmitter;
const configHandler = require('../util/config-handler.js');

let testPlanner;
module.exports = testPlanner = {
    generateTests() {
        if (configHandler.get('technique') === 'actionFocused') {
            testPlanner.emit('testPlanner.actionFocusedTechniqueSet');
        }
    },
};

Object.setPrototypeOf(testPlanner, new EventEmitter());
