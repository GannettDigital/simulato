'use strict';

module.exports = function(children, name, type) {
    if (!Array.isArray(children)) {
        throw new SimulatoError.CHILD.CHILDREN_NOT_ARRAY(
            `Children for '${name}' were not returned as an Array by parent component '${type}'`
        );
    }

    for (let [index, value] of children.entries()) {
        if (!(value instanceof Object)) {
            throw new SimulatoError.CHILD.CHILD_NOT_OBJECT(
              `Child of children array at index '${index}' for component '${type}' must be an object`
            );
        }

        if (typeof value.type !== 'string') {
            throw new SimulatoError.CHILD.CHILD_OBJECT_PROPERTY_TYPE(
                `The 'type' property of child at index '${index}' for component '${type}' must ` +
                `be a string. Found '${value.type}'`
            );
        }

        if (typeof value.name !== 'string') {
            throw new SimulatoError.CHILD.CHILD_OBJECT_PROPERTY_TYPE(
                `The 'name' property of child at index '${index}' for component '${type}' must ` +
                `be a string. Found '${value.name}'`
            );
        }

        if (!(value.state instanceof Object)) {
            throw new SimulatoError.CHILD.CHILD_OBJECT_PROPERTY_TYPE(
                `The 'state' property of child at index '${index}' for component '${type}' must ` +
                `be an object. Found '${value.state}'`
            );
        }

        if (value.options !== undefined && !(value.options instanceof Object)) {
            throw new SimulatoError.CHILD.CHILD_OBJECT_PROPERTY_TYPE(
                `The 'options' property of child at index '${index}' for component '${type}' must ` +
                `be an object. Found '${value.options}'`
            );
        }
    }
};
