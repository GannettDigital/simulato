'use strict';

const Emitter = require('../../util/emitter.js');
const configHandler = require('../../util/config/config-handler.js');
const cliEventDispatch = require('../cli-event-dispatch/cli-event-dispatch.js');

let generate;

module.exports = generate = {
  configure() {
    process.env.PLANNING_MODE = true;
    generate.emit('componentHandler.configure', configHandler.get('componentPath'));
    generate.emit('generate.configured');
  },
};

Emitter.mixIn(generate, cliEventDispatch);
