'use strict';

const TestCaseError = require('./test-case-error.js');

module.exports = function(message) {
  return new TestCaseError('NO_TEST_CASES_FOUND', message);
};
