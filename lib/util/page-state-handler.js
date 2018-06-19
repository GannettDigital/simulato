'use strict';

const getElementData = require('./get-element-data.js');
const _ = require('lodash');
const Emitter = require('./emitter.js');
const globalEventDispatch = require('../global-event-dispatch/global-event-dispatch.js');

let pageStateHandler;

module.exports = pageStateHandler = {
  getPageState(components, callback) {
    let pageStateData = {
      pageModel: {},
      length: components.size,
      callback,
    };

    if (pageStateData.length === 0) {
      return callback(null, pageStateData.pageModel);
    }

    for (let component of components.values()) {
      pageStateHandler.emit('pageStateHandler.componentRetrieved', component, pageStateData);
    }
  },
  _getComponentState(component, pageStateData) {
    return driver.executeAsyncScript(getElementData, component.elements)
    .then(function(data) {
      pageStateHandler
        .emit('pageStateHandler.componentDataReceived', component.model, component, data, pageStateData);
    });
  },
  _aggregatePageState(model, component, data, pageStateData) {
    pageStateHandler.emit('pageStateHandler.createComponentModel', model, data, function(model) {
      pageStateData.pageModel[component.name] = model;
    });
    if (Object.keys(pageStateData.pageModel).length === pageStateData.length) {
      pageStateData.callback(null, pageStateData.pageModel);
    }
  },
  _createComponentModel(modelTemplate, data, callback) {
    let model = {};
    let properties = Object.getOwnPropertyNames(modelTemplate);

    for (let propertyName of properties) {
      let propertyValue = modelTemplate[propertyName];

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
          pageStateHandler.emit('pageStateHandler.createComponentModel', propertyValue, data, function(returnedModel) {
            model[propertyName] = returnedModel;
          });
          break;
      }
    }
    return callback(model);
  },
};

Emitter.mixIn(pageStateHandler, globalEventDispatch);

pageStateHandler.on('pageStateHandler.componentRetrieved', pageStateHandler._getComponentState);
pageStateHandler.on('pageStateHandler.componentDataReceived', pageStateHandler._aggregatePageState);
pageStateHandler.on('pageStateHandler.createComponentModel', pageStateHandler._createComponentModel);
