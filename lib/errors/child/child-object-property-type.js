'use strict';

let ChildError = require('./child-error.js');

module.exports = function(message) {
  return new ChildError('CHILD_OBJECT_PROPERTY_TYPE', message);
};
