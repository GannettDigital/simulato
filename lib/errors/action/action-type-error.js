'use strict';

const ActionError = require('./action-error.js');

module.exports = function(message) {
  return new ActionError('ACTION_TYPE_ERROR', message);
};
