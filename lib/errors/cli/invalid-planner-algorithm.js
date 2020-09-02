'use strict';

const CLIError = require('./cli-error.js');

module.exports = function INVALID_PLANNER_ALGORITHM(code, message) {
  return new CLIError('INVALID_PLANNER_ALGORITHM', code, message);
};
