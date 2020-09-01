'use strict';

const PlannerError = require('./planner-error.js');

module.exports = function(message) {
  return new PlannerError('DUPLICATE_PLAN_GENERATED', message);
};
