'use strict';

const EventEmitter = require('events').EventEmitter;

let validateModel;

module.exports = validateModel = {
  validate(model, instanceName, componentName) {
    if (!(typeof model === 'object') || Array.isArray(model)) {
      throw new MbttError.MODEL.MODEL_NOT_OBJECT(
          `Model for '${instanceName}' was not returned as an Object by parent component '${componentName}'`
      );
    }
    validateModel.emit('validateModel.objectReadyToValidate', model, componentName, '');
  },
  _validateModelObject(object, componentName, parentKeyString) {
    for (let key in object) {
      if (object.hasOwnProperty(key)) {
        let value = object[key];
        validateModel.emit('validateModel.valueReady', value, parentKeyString, key, componentName);
      }
    }
  },
  _handleValueTypes(value, parentKeyString, key, componentName) {
    if (typeof value === 'object' && !Array.isArray(value)) {
      parentKeyString += `${key}.`;
      validateModel.emit('validateModel.objectReadyToValidate', value, componentName, parentKeyString);
    } else if (!(typeof value === 'string' || typeof value === 'function')) {
      throw new MbttError.MODEL.MODEL_OBJECT_VALUE(
        `Value for '${parentKeyString}${key}' inside '${componentName}' model must be either a string or object`
      );
    }
  },
};

Object.setPrototypeOf(validateModel, new EventEmitter());

validateModel.on('validateModel.objectReadyToValidate', validateModel._validateModelObject);
validateModel.on('validateModel.valueReadyToBeChecked', validateModel._handleValueTypes);
