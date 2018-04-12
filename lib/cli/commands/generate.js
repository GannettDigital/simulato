'use strict';

const path = require('path');
const EventEmitter = require('events').EventEmitter;

let generate;

module.exports = generate = {
    configure(options) {
        let configFile;

        if (options.configFile) {
            configFile = require(path.normalize(`${process.cwd()}/${options.configFile}`));
        } else {
            configFile = require(path.normalize(`${process.cwd()}/config.js`));
        }

        let components = options.components || configFile.components;
        if (components) {
            generate.emit('generate.loadComponents', components);
        } else {
            throw new SimulatoError.CLI.INVALID_COMPONENT_PATH(`Invalid component path: ${components}`);
        }

        let outputPath = options.outputPath || configFile.outputPath;
        if (outputPath) {
            process.env.PLANNER_OUTPUT_PATH = path.resolve(outputPath);
        } else {
            process.env.PLANNER_OUTPUT_PATH = process.cwd();
        }

        let configureInfo = {};

        let actionToCover = options.actionToCover || configFile.actionToCover;
        if (actionToCover) {
            configureInfo.actionToCover = actionToCover;
        }

        let technique = options.technique || configFile.technique;
        if (technique.match(/^actionFocused$/)) {
            configureInfo.technique = technique;
        } else {
            throw new SimulatoError.CLI.INVALID_GENERATION_TECHNIQUE(`Invalid test generation technique: ${technique}`);
        }

        generate.emit('generate.configured', configureInfo);
    },
};

Object.setPrototypeOf(generate, new EventEmitter());
