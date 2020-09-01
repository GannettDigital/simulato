'use strict';

const EventEmitter = require('events').EventEmitter;

let validateModel;

module.exports = validateModel = {
  validate(model, name, type) {
    if (!(typeof model === 'object') || Array.isArray(model)) {
      throw new SimulatoError.MODEL.MODEL_NOT_OBJECT(
          `Model for '${name}' was not returned as an Object by parent component '${type}'`,
      );
    }
    validateModel.emit('validateModel.objectReadyToValidate', model, type, '');
  },
  _validateModelObject(object, type, parentKeyString) {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        const value = object[key];
        validateModel.emit('validateModel.valueReady', value, parentKeyString, key, type);
      }
    }
  },
  _handleValueTypes(value, parentKeyString, key, type) {
    if (typeof value === 'object' && !Array.isArray(value)) {
      parentKeyString += `${key}.`;
      validateModel.emit('validateModel.objectReadyToValidate', value, type, parentKeyString);
    } else if (!(typeof value === 'string' || typeof value === 'function')) {
      throw new SimulatoError.MODEL.MODEL_OBJECT_VALUE(
          `Value for '${parentKeyString}${key}' inside '${type}' model must be either a string or object`,
      );
    }
  },
};

Object.setPrototypeOf(validateModel, new EventEmitter());

validateModel.on('validateModel.objectReadyToValidate', validateModel._validateModelObject);
validateModel.on('validateModel.valueReadyToBeChecked', validateModel._handleValueTypes);
