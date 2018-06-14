'use strict';

let CustomError = require('../custom-error.js');

module.exports = function RUNNER_ERROR(code, message) {
  return new CustomError('RunnerError', code, message);
};
