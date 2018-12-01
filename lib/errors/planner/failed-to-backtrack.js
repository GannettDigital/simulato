'use strict';

let PlannerError = require('./planner-error.js');

module.exports = function(message) {
  return new PlannerError('FAILED_TO_BACKTRACK', message);
};
