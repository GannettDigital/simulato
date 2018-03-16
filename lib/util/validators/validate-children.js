'use strict';

module.exports = function(children, instanceName, componentName) {
    if (!Array.isArray(children)) {
        throw new MbttError.CHILD.CHILDREN_NOT_ARRAY(
            `Children for '${instanceName}' were not returned as an Array by parent component '${componentName}'`
        );
    }

    for (let [index, value] of children.entries()) {
        if (!(value instanceof Object)) {
            throw new MbttError.CHILD.CHILD_NOT_OBJECT(
              `Child of children array at index '${index}' for component '${componentName}' must be an object`
            );
        }

        if (typeof value.componentName !== 'string') {
            throw new MbttError.CHILD.CHILD_OBJECT_PROPERTY_TYPE(
                `The 'componentName' property of child at index '${index}' for component '${componentName}' must ` +
                `be a string. Found '${value.componentName}'`
            );
        }

        if (typeof value.instanceName !== 'string') {
            throw new MbttError.CHILD.CHILD_OBJECT_PROPERTY_TYPE(
                `The 'instanceName' property of child at index '${index}' for component '${componentName}' must ` +
                `be a string. Found '${value.instanceName}'`
            );
        }

        if (!(value.state instanceof Object)) {
            throw new MbttError.CHILD.CHILD_OBJECT_PROPERTY_TYPE(
                `The 'state' property of child at index '${index}' for component '${componentName}' must ` +
                `be an object. Found '${value.state}'`
            );
        }

        if (value.options !== undefined && !(value.options instanceof Object)) {
            throw new MbttError.CHILD.CHILD_OBJECT_PROPERTY_TYPE(
                `The 'options' property of child at index '${index}' for component '${componentName}' must ` +
                `be an object. Found '${value.options}'`
            );
        }
    }
};
