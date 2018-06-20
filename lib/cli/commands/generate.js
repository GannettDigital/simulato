'use strict';

const EventEmitter = require('events').EventEmitter;
const configHandler = require('../../util/config-handler.js');

let generate;

module.exports = generate = {
    configure() {
        generate.emit('generate.loadComponents', configHandler.get('componentPath'));
        generate.emit('generate.configured');
    },
};

Object.setPrototypeOf(generate, new EventEmitter());
