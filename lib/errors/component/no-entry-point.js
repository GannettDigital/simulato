'use strict';

const ComponentError = require('./component-error.js');

module.exports = function(message) {
  return new ComponentError('NO_ENTRY_POINT', message);
};
