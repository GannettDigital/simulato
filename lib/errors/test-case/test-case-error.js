'use strict';

const CustomError = require('../custom-error.js');

module.exports = function TEST_CASE_ERROR(code, message) {
  return new CustomError('TestcaseError', code, message);
};
