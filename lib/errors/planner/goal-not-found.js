'use strict';

let PlannerError = require('./planner-error.js');

module.exports = function(message) {
  return new PlannerError('GOAL_NOT_FOUND', message);
};
