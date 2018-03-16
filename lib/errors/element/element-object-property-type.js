'use strict';

let ElementError = require('./element-error.js');

module.exports = function(message) {
  return new ElementError('ELEMENT_OBJECT_PROPERTY_TYPE', message);
};
