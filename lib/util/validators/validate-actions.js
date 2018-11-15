'use strict';

const EventEmitter = require('events').EventEmitter;

let validateActions;

module.exports = validateActions = {
  validate(actions, name, componentName) {
    if (!(typeof actions === 'object') || Array.isArray(actions)) {
      throw new SimulatoError.ACTION.ACTIONS_NOT_OBJECT(
          `Actions for '${name}' was not returned as an Object by parent component '${componentName}'`
      );
    }

    for (let actionName in actions) {
      if (actions.hasOwnProperty(actionName)) {
        let action = actions[actionName];

        if (!(typeof action === 'object') || Array.isArray(action)) {
          throw new SimulatoError.ACTION.ACTION_TYPE_ERROR(
              `Action '${actionName}' for component '${componentName}' is not an object`
          );
        }
        validateActions.emit('validateActions.actionReadyToValidate', action, actionName, componentName);
      }
    }
  },
  _validateAction(action, actionName, componentName) {
    if (action.preconditions) {
      if (typeof action.preconditions !== 'function') {
        throw new SimulatoError.ACTION.ACTION_TYPE_ERROR(
            `The preconditions property  for '${actionName}' of component '${componentName}' must be a function`
        );
      }
    }
    if (action.parameters) {
      if (!(Array.isArray(action.parameters))) {
        throw new SimulatoError.ACTION.ACTION_TYPE_ERROR(
            `The parameters property  for '${actionName}' of component '${componentName}' must be an Array`
        );
      }

      validateActions.emit(
          'validateActions.parametersReadyToValidate',
          action.parameters,
          actionName,
          componentName
      );
    }
    if (!(action.perform && typeof action.perform === 'function')) {
      throw new SimulatoError.ACTION.ACTION_TYPE_ERROR(
          `The perform property is required for '${actionName}' of component '${componentName}' and must be a function`
      );
    }
    if (!(action.effects && typeof action.effects === 'function')) {
      throw new SimulatoError.ACTION.ACTION_TYPE_ERROR(
          `The effects property is required for '${actionName}' of component '${componentName}' and must be a function`
      );
    }
  },
  _validatePreconditions(preconditions, actionName, componentName) {
    if (!(Array.isArray(preconditions))) {
      throw new SimulatoError.ACTION.ACTION_TYPE_ERROR(
          `The preconditions property for '${actionName}' of component '${componentName}' must return an array`
      );
    }

    for (let [index, value] of preconditions.entries()) {
      if (!(Array.isArray(value))) {
        throw new SimulatoError.ACTION.ACTION_TYPE_ERROR(
            `Precondition found at index '${index}' of preconditions`
          + `for action '${actionName}' of component '${componentName}' must be an Array`
        );
      }

      if (typeof value[0] !== 'string') {
        throw new SimulatoError.ACTION.ACTION_TYPE_ERROR(
            `Precondition found at index '${index}' of preconditions `
          + `for action '${actionName}' of component '${componentName}' must have `
          + `a string value at the 0 index to denote chai assertion function`
        );
      }
    }
  },
  _validateParameters(parameters, actionName, componentName) {
    for (let [index, value] of parameters.entries()) {
      if (!(typeof value === 'object') || Array.isArray(value)) {
        throw new SimulatoError.ACTION.ACTION_TYPE_ERROR(
            `Paramter found at index '${index}' of parameters `
            + `for action '${actionName}' of component '${componentName}' must be an Object`
        );
      }
      if (!(value.name && typeof value.name === 'string')) {
        throw new SimulatoError.ACTION.ACTION_TYPE_ERROR(
            `The name property is required for parameter found at index '${index}' `
          + `of parameters for action '${actionName}' of component '${componentName}' and must be a string`
        );
      }

      if (!(value.generate && typeof value.generate === 'function')) {
        throw new SimulatoError.ACTION.ACTION_TYPE_ERROR(
            `The generate property is required for parameter found at index '${index}' `
          + `of parameters for action '${actionName}' of component '${componentName}' and must be a function`
        );
      }
    }
  },
};

Object.setPrototypeOf(validateActions, new EventEmitter());

validateActions.on('validateActions.actionReadyToValidate', validateActions._validateAction);
validateActions.on('validateActions.preconditionsReadyToValidate', validateActions._validatePreconditions);
validateActions.on('validateActions.parametersReadyToValidate', validateActions._validateParameters);
