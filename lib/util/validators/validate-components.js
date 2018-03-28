'use strict';

let path = require('path');

module.exports = function(files, callback) {
  let component;

  files = files.filter(function(file) {
    return path.extname(file) === '.js';
  });

  for (let file of files) {
    try {
      component = require(file);
    } catch (error) {
        error.message = `The file at path '${file}' was unable to be loaded for reason '${error.message}'`;
        throw error;
    }

    if (typeof component !== 'object' || Array.isArray(component)) {
      throw new MbttError.COMPONENT.COMPONENT_TYPE_ERROR(`The component at file path '${file}' must be an object`);
    }
    if (typeof component.type !== 'string') {
      throw new MbttError.COMPONENT.COMPONENT_TYPE_ERROR(
        `The component at file path '${file}' must have a string for type property`
      );
    }
    if (component.entryComponent) {
      let entryComponent = component.entryComponent;
      if (typeof entryComponent !== 'object' || Array.isArray(entryComponent)) {
        throw new MbttError.COMPONENT.COMPONENT_TYPE_ERROR(
          `The entryComponent property must be an object for component '${component.type}'`
        );
      }
      if (typeof entryComponent.name !== 'string') {
        throw new MbttError.COMPONENT.COMPONENT_TYPE_ERROR(
          `The entryComponent.name property is required and must be a string for component '${component.type}'`
        );
      }
      if (typeof entryComponent.state !== 'object' || Array.isArray(entryComponent.state)) {
        throw new MbttError.COMPONENT.COMPONENT_TYPE_ERROR(
          `The entryComponent.state property is required and must be an object for component '${component.type}'`
        );
      }
    }
    if (component.options) {
      if (typeof component.options !== 'object' || Array.isArray(component.options)) {
        throw new MbttError.COMPONENT.COMPONENT_TYPE_ERROR(
          `The options property must be an object for component '${component.type}'`
        );
      }
      if (component.options.dynamicArea && typeof component.options.dynamicArea !== 'string') {
        throw new MbttError.COMPONENT.COMPONENT_TYPE_ERROR(
          `The component.options.dynamicArea property must be an string for component '${component.type}'`
        );
      }
    }
    if (typeof component.elements !== 'function') {
        throw new MbttError.COMPONENT.COMPONENT_TYPE_ERROR(
          `The elements property must be a function for component '${component.type}'`
        );
    }
    if (typeof component.model !== 'function') {
        throw new MbttError.COMPONENT.COMPONENT_TYPE_ERROR(
          `The model property must be a function for component '${component.type}'`
        );
    }
    if (typeof component.actions !== 'function') {
      throw new MbttError.COMPONENT.COMPONENT_TYPE_ERROR(
        `The actions property must be a function for component '${component.type}'`
      );
    }
  }

  callback(files);
};
