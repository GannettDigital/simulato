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
    if (!(value.selector.type === 'attribute' || value.selector.type === 'querySelector')) {
      throw new SimulatoError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE(
        `The selector 'type' field for '${value.name}' must be either 'attribute' or 'querySelector'`
          + ` inside component '${type}'`
      );
    }
    if (value.selector.type === 'attribute' && typeof value.selector.key !== 'string') {
      throw new SimulatoError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE(
        `The selector 'key' field for '${value.name}' must be a string when using selector type attribute`
          + ` inside component '${type}'`
      );
    }
    if (typeof value.selector.value !== 'string') {
      throw new SimulatoError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE(
        `The selector 'value' field for '${value.name}' must be a string inside component '${type}'`
      );
    }
  }
};
