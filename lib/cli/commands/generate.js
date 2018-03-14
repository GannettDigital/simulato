'use strict';

const path = require('path');

const EventEmitter = require('events').EventEmitter;

let generate;

module.exports = generate = {
    configure(componentsPath, options) {
        generate.emit('generate.loadComponents', componentsPath);

        if (options.outputPath) {
            process.env.PLANNER_OUTPUT_PATH = path.resolve(options.outputPath);
        } else {
            process.env.PLANNER_OUTPUT_PATH = process.cwd();
        }

        let configureInfo = {};

        if (options.actionToCover) {
            configureInfo.actionToCover = options.actionToCover;
        }

        if (options.technique.match(/^actionFocused$/)) {
            configureInfo.technique = options.technique;
        } else {
            throw new Error(`Invalid test generation technique: ${options.technique}`);
        }

        generate.emit('generate.configured', configureInfo);
    },
};

Object.setPrototypeOf(generate, new EventEmitter());
