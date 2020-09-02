'use strict';

const TestCaseError = require('./test-case-error.js');

module.exports = function(message) {
  return new TestCaseError('FILE_TYPE_ERROR', message);
};
