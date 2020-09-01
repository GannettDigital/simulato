'use strict';

const TestCaseError = require('./test-case-error.js');

module.exports = function(message) {
  return new TestCaseError('TEST_CASE_NOT_ARRAY', message);
};
