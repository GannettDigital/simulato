'use strict';

let ActionError = require('./action-error.js');

module.exports = function(message) {
  return new ActionError('PRECONDITION_CHECK_FAILED', message);
};
