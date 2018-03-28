'use strict';

module.exports = function(events, name, type) {
    if (!Array.isArray(events)) {
        throw new MbttError.EVENT.EVENTS_NOT_ARRAY(
            `Events for '${name}' were not returned as an Array by parent component '${type}'`
        );
    }

    for (let [index, value] of events.entries()) {
        if (!(value instanceof Object)) {
          throw new MbttError.EVENT.EVENT_NOT_OBJECT(
            `Event of events array at index '${index}' for component '${type}' must be an object`
          );
        }

        if (typeof value.name !== 'string' && !Array.isArray(value.name)) {
            throw new MbttError.EVENT.EVENT_OBJECT_PROPERTY_TYPE(
              `The 'name' property of event at index '${index}' for component '${type}' must ` +
              `be a string or an array. Found '${value.name}'`
            );
        }

        if (Array.isArray(value.name)) {
          for (let [nameIndex, nameValue] of value.name.entries()) {
                if (typeof nameValue !== 'string') {
                    throw new MbttError.EVENT.EVENT_OBJECT_PROPERTY_TYPE(
                        `The 'name' property of event at index ${index} for component '${type}'`
                        + `Array value at index '${nameIndex}' must be a string.  Found '${nameValue}'`
                    );
                }
           }
        }

        if (typeof value.listener !== 'function') {
            throw new MbttError.EVENT.EVENT_OBJECT_PROPERTY_TYPE(
              `The 'listener' property of event at index '${index}' for component '${type}' must ` +
              `be a function. Found '${value.listener}'`
            );
        }
    }
};
