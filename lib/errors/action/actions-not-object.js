'use strict';

const ActionError = require('./action-error.js');

module.exports = function(message) {
  return new ActionError('ACTIONS_NOT_OBJECT', message);
};
