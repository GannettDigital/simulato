'use strict';

let TestCaseError = require('./test-case-error.js');

module.exports = function(message) {
  return new TestCaseError('TEST_CASE_TYPE_ERROR', message);
};
