'use strict';

const plannerEventDispatch = require('./planner-event-dispatch.js');
const registerPlannerEvents = require('./register-planner-events.js');

module.exports = function() {
  registerPlannerEvents(plannerEventDispatch);
};
