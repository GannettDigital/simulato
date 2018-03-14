'use strict';

const cliEventDispatch = require('./cli-event-dispatch.js');
const registerCliEvents = require('./register-cli-events.js');

module.exports = function() {
    registerCliEvents(cliEventDispatch);
};
