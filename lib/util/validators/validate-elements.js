'use strict';

module.exports = function(elements, name, type) {
  if (!Array.isArray(elements)) {
    throw new SimulatoError.ELEMENT.ELEMENTS_NOT_ARRAY(
        `Elements for '${name}' were not returned as an Array by parent component '${type}'`
    );
  }

  for (let [index, value] of elements.entries()) {
    if (!(value instanceof Object)) {
      throw new SimulatoError.ELEMENT.ELEMENT_NOT_OBJECT(
        `Element of elements array at index '${index}' for component '${type}' must be an object`
      );
    }
    if (typeof value.name !== 'string') {
      throw new SimulatoError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE(
        `Element of elements array at index '${index}' for component '${type}' must be an string`
      );
    }
    if (typeof value.selector !== 'object' || Array.isArray(value.selector)) {
      throw new SimulatoError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE(
        `The selector field for '${value.name}' must be an object inside component '${type}'`
      );
    }
    if (typeof value.selector.type !== 'string') {
      throw new SimulatoError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE(
        `The selector 'type' field for '${value.name}' must be a string inside component '${type}'`
      );
    }
    let allowedType = (
      value.selector.type === 'getElementById' ||
      value.selector.type === 'querySelector' ||
      value.selector.type === 'querySelectorAll' ||
      value.selector.type === 'getElementsByTagName' ||
      value.selector.type === 'getElementsByClassName'
    );
    if (!allowedType) {
      throw new SimulatoError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE(
        `The selector 'type' field for '${value.name}' must be either 'getElementById', 'querySelector', `
          + `'querySelectorAll', 'getElementsByTagName', or 'getElementsByClassName' inside component '${type}'`
      );
    }
    if (typeof value.selector.value !== 'string') {
      throw new SimulatoError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE(
        `The selector 'value' field for '${value.name}' must be a string inside component '${type}'`
      );
    }
  }
};
