'use strict';

let CustomError = require('../custom-error.js');

module.exports = function PLANNER_ERROR(code, message) {
  return new CustomError('PlannerError', code, message);
};
