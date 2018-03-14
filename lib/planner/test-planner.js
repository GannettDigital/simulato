'use strict';

const EventEmitter = require('events').EventEmitter;

let testPlanner;
module.exports = testPlanner = {
    generateTests(configureInfo) {
        if (configureInfo.technique === 'actionFocused') {
            testPlanner.emit('testPlanner.actionFocusedTechniqueSet', configureInfo.actionToCover);
        }
    },
};

Object.setPrototypeOf(testPlanner, new EventEmitter());
