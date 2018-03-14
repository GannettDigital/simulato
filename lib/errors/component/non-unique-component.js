'use strict';

let ComponentError = require('./component-error.js');

module.exports = function(message) {
  return new ComponentError('NON_UNIQUE_COMPONENT', message);
};
