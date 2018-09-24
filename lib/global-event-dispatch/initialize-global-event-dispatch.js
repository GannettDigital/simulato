'use strict';

const globalEventDispatch = require('./global-event-dispatch.js');
const registerGlobalEvents = require('./register-global-events.js');

module.exports = function() {
  registerGlobalEvents(globalEventDispatch);
};
