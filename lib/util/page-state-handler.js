'use strict';

const getElementData = require('./get-element-data.js');
const _ = require('lodash');

let pageStateHandler;

module.exports = pageStateHandler = {
  getPageState(components, callback) {
    if (components.size === 0) {
      return callback(null, {});
    }

    pageStateHandler._getComponentsStates(components, callback);
  },
  _getComponentsStates(components, callback) {
    const componentElements = {};
    for (const component of components.values()) {
      componentElements[component.name] = component.elements;
    }
    return driver.executeAsyncScript(getElementData, componentElements)
        .then(function(componentsData) {
          pageStateHandler._aggregatePageState(components, componentsData, callback);
        });
  },
  _aggregatePageState(components, componentsData, callback) {
    const pageModel = {};

    for (const component of components.values()) {
      pageModel[component.name] =
        pageStateHandler._createComponentModel(component.model, componentsData[component.name]);
    }

    return callback(null, pageModel);
  },
  _createComponentModel(modelTemplate, data) {
    const model = {};
    const properties = Object.getOwnPropertyNames(modelTemplate);

    for (const propertyName of properties) {
      const propertyValue = modelTemplate[propertyName];

      switch (typeof propertyValue) {
        case 'function':
          try {
            model[propertyName] = propertyValue(data);
          } catch (error) {
            model[propertyName] = undefined;
          }
          break;
        case 'string':
          model[propertyName] = _.get(data, propertyValue);
          break;
        case 'object':
          model[propertyName] = pageStateHandler._createComponentModel(propertyValue, data);
          break;
      }
    }
    return model;
  },
};
