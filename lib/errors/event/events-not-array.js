'use strict';

const EventError = require('./event-error.js');

module.exports = function(message) {
  return new EventError('EVENTS_NOT_ARRAY', message);
};
