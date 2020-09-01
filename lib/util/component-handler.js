'use strict';

const Emitter = require('./emitter.js');
const globalEventDispatch = require('../global-event-dispatch/global-event-dispatch.js');

let componentHandler;

module.exports = componentHandler = {
  _components: {},
  getComponent(type, callback) {
    if (componentHandler._components[type]) {
      return callback(null, componentHandler._components[type]);
    }
    return callback(new Error(`Component: ${type} not found in components set`));
  },
  getComponents(callback) {
    return callback(null, componentHandler._components);
  },
  getComponentActions(callback) {
    const actionSets = new Set();

    for (const component of Object.values(componentHandler._components)) {
      for (const actionName of Object.keys(component.actions)) {
        actionSets.add(`${component.type}.${actionName }`);
      }
    }

    return callback(actionSets);
  },
  _loadComponents(paths) {
    for (const aPath of paths) {
      const component = require(aPath);
      if (componentHandler._components[component.type]) {
        throw new SimulatoError.COMPONENT.NON_UNIQUE_COMPONENT(
            `A component with the name '${component.type}' has already been loaded, must have unique name`,
        );
      }
      componentHandler._components[component.type] = component;
    }
  },
  configure(path) {
    componentHandler.emit('findFiles.search', [path], function(files) {
      if (files.length) {
        componentHandler.emit('validators.validateComponents', files, function(validatedFiles) {
          componentHandler.emit('componentHandler.configured', validatedFiles);
        });
      } else {
        throw new SimulatoError.COMPONENT.NO_COMPONENTS_FOUND(`No components were found at path '${[path]}'`);
      }
    });
  },
};

Emitter.mixIn(componentHandler, globalEventDispatch);

componentHandler.on('componentHandler.configured', componentHandler._loadComponents);
