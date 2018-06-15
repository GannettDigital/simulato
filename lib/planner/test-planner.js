'use strict';

const Emitter = require('../util/emitter.js');

let testPlanner;
module.exports = testPlanner = {
    generateTests(configureInfo) {
        if (configureInfo.technique === 'actionFocused') {
            testPlanner.emit('testPlanner.actionFocusedTechniqueSet', configureInfo.actionToCover);
        }
    },
};

Emitter.mixIn(testPlanner, require('./planner-event-dispatch/planner-event-dispatch.js'));
