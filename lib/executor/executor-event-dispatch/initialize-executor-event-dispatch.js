'use strict';

const executorEventDispatch = require('./executor-event-dispatch.js');
const registerExecutorEvents = require('./register-executor-events.js');

module.exports = function() {
    registerExecutorEvents(executorEventDispatch);
};
