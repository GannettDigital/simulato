'use strict';

const Emitter = require('../util/emitter.js');
const configHandler = require('../util/config-handler.js');

let testPlanner;
module.exports = testPlanner = {
    generateTests() {
        if (configHandler.get('technique') === 'actionFocused') {
            testPlanner.emit('testPlanner.actionFocusedTechniqueSet');
        }
    },
};

Emitter.mixIn(testPlanner, require('./planner-event-dispatch/planner-event-dispatch.js'));
