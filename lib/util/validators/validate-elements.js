'use strict';

module.exports = function(elements, instanceName, componentName) {
  if (!Array.isArray(elements)) {
    throw new MbttError.ELEMENT.ELEMENTS_NOT_ARRAY(
        `Elements for '${instanceName}' were not returned as an Array by parent component '${componentName}'`
    );
  }

  for (let [index, value] of elements.entries()) {
    if (!(value instanceof Object)) {
      throw new MbttError.ELEMENT.ELEMENT_NOT_OBJECT(
        `Element of elements array at index '${index}' for component '${componentName}' must be an object`
      );
    }
    if (typeof value.name !== 'string') {
      throw new MbttError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE(
        `Element of elements array at index '${index}' for component '${componentName}' must be an string`
      );
    }
    if (typeof value.selector !== 'object' || Array.isArray(value.selector)) {
      throw new MbttError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE(
        `The selector field for '${value.name}' must be an object`
      );
    }
    if (typeof value.selector.type !== 'string') {
      throw new MbttError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE(
        `The selector 'type' field for '${value.name}' must be a string`
      );
    }
    if (!(value.selector.type === 'attribute' || value.selector.type === 'querySelector')) {
      throw new MbttError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE(
        `The selector 'type' field for '${value.name}' must be either 'attribute' or 'querySelector`
      );
    }
    if (value.selector.type === 'attribute' && typeof value.selector.key !== 'string') {
      throw new MbttError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE(
        `The selector 'key' field for '${value.name}' must be a string when using selector type attribute`
      );
    }
    if (typeof value.selector.value !== 'string') {
      throw new MbttError.ELEMENT.ELEMENT_OBJECT_PROPERTY_TYPE(
        `The selector 'value' field for '${value.name}' must be a string`
      );
    }
  }
};
