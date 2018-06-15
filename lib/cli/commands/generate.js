'use strict';

const Emitter = require('../../util/emitter.js');
const configHandler = require('../../util/config-handler.js');

let generate;

module.exports = generate = {
    configure() {
        generate.emit('componentHandler.configure', configHandler.get('componentPath'));
        generate.emit('generate.configured');
    },
};

Emitter.mixIn(generate, require('../cli-event-dispatch/cli-event-dispatch.js'));
