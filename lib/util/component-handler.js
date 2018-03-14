'use strict';

const EventEmitter = require('events').EventEmitter;

let componentHandler;

module.exports = componentHandler = {
  _components: {},
  getComponent(componentName, callback) {
    if (componentHandler._components[componentName]) {
        return callback(null, componentHandler._components[componentName]);
    }
    return callback(new Error(`Component: ${componentName} not found in components set`));
  },
  getComponents(callback) {
    return callback(null, componentHandler._components);
  },
  getComponentActions(callback) {
    let actionSets = new Set();

    for (let component of Object.values(componentHandler._components)) {
        for (let actionName of Object.keys(component.actions)) {
            actionSets.add(`${component.name}.${actionName }`);
        }
    }

    return callback(actionSets);
  },
  _loadComponents(paths) {
    for (let aPath of paths) {
        let component = require(aPath);
        if (componentHandler._components[component.name]) {
            throw new MbttError.COMPONENT.NON_UNIQUE_COMPONENT(
                `A component with the name '${component.name}' has already been loaded, must have unique name`
            );
        }
        componentHandler._components[component.name] = component;
    }
  },
  configure(path) {
    componentHandler.emit('componentHandler.findFiles', [path], function(files) {
        if (files.length) {
            componentHandler.emit('componentHandler.filesReadyToValidate', files, function(validatedFiles) {
                componentHandler.emit('componentHandler.configured', validatedFiles);
            });
        } else {
            throw new MbttError.COMPONENT.NO_COMPONENTS_FOUND(`No components were found at path '${[path]}'`);
        }
    });
  },
};

Object.setPrototypeOf(componentHandler, new EventEmitter());

componentHandler.on('componentHandler.configured', componentHandler._loadComponents);
