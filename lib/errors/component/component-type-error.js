'use strict';

const ComponentError = require('./component-error.js');

module.exports = function(message) {
  return new ComponentError('COMPONENT_TYPE_ERROR', message);
};
