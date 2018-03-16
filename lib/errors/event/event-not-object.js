'use strict';

let EventError = require('./event-error.js');

module.exports = function(message) {
  return new EventError('EVENT_NOT_OBJECT', message);
};
