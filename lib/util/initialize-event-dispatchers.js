'use strict';

const initializeGlobalEventDispatch = require('../global-event-dispatch/initialize-global-event-dispatch');
const initializeRunnerEventDispatch = require('../runner/runner-event-dispatch/initialize-runner-event-dispatch');
const initializePlannerEventDispatch =
    require('../planner/planner-event-dispatch/initialize-planner-event-dispatch.js');
const initializeExecuteEventDispatch
    = require('../executor/executor-event-dispatch/initialize-executor-event-dispatch.js');
const initializeCliEventDispatch = require('../cli/cli-event-dispatch/initialize-cli-event-dispatch.js');

module.exports = function() {
    initializeGlobalEventDispatch();
    initializeCliEventDispatch();
    initializeRunnerEventDispatch();
    initializePlannerEventDispatch();
    initializeExecuteEventDispatch();
};
