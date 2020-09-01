'use strict';

const PlannerError = require('./planner-error.js');

module.exports = function(message) {
  return new PlannerError('NO_STARTING_ACTIONS', message);
};
