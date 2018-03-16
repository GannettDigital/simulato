'use strict';

let ActionError = require('./action-error.js');

module.exports = function(message) {
  return new ActionError('EXPECTED_STATE_ERROR', message);
};
