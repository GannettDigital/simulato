'use strict';

const runnerEventDispatch = require('./runner-event-dispatch.js');
const registerRunnerEvents = require('./register-runner-events.js');

module.exports = function() {
    registerRunnerEvents(runnerEventDispatch);
};
