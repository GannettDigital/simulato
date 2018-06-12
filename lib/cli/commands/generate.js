'use strict';

const EventEmitter = require('events').EventEmitter;
const configHandler = require('../../util/config-handler.js');

let generate;

module.exports = generate = {
    configure(options) {
        configHandler.createConfig(options.opts(), function(config) {
            generate.emit('generate.loadComponents', config.componentPath);

            process.env.PLANNER_OUTPUT_PATH = config.outputPath;

            let configureInfo = {};

            if (config.actionToCover) {
                configureInfo.actionToCover = config.actionToCover;
            }

            configureInfo.technique = config.technique;

            generate.emit('generate.configured', configureInfo);
        });
    },
};

Object.setPrototypeOf(generate, new EventEmitter());
