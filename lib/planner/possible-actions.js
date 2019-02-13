'use strict';

const Emitter = require('../util/emitter.js');
const plannerEventDispatch = require('./planner-event-dispatch/planner-event-dispatch.js');

let possibleActions;

module.exports = possibleActions = {
  * get(state, callback) {
    let next = yield;
    let components = state.getComponents();

    let allActions = new Set();
    let applicableActions = new Set();
    for (let component of components) {
      for (let actionName of Object.getOwnPropertyNames(component.actions)) {
        let actionIdentifier = `${component.name}.${actionName}`;
        allActions.add(actionIdentifier);

        let data = yield possibleActions.emitAsync(
          'possibleActions.checkIfPossible',
          component,
          actionName,
          state,
          state._dataStore,
          next
        );

        if (data.applicable) {
          applicableActions.add(actionIdentifier);
        }
      }
    }
    return callback(null, {applicableActions, allActions});
  },
* checkIfPossible(component, actionName, state, dataStore, callback) {
    let next = yield;
    let applicable = false;
    let preconditions;
    let action = component.actions[actionName];
    if (action.preconditions === undefined) {
      applicable = true;
    } else {
      try {
        if (Array.isArray(action.parameters)) {
          let parameters = action.parameters.map(function(parameter) {
            return parameter.generate.call(component, dataStore);
          });
          preconditions = action.preconditions.call(component, ...parameters, dataStore);
        } else {
          preconditions = action.preconditions.call(component, dataStore);
        }
      } catch (error) {
        error.message =
                        `An error with the message '${error.message}' was thrown while ` +
                        `executing preconditions for the action '${component.name}.${actionName}'`;
        throw error;
      }

      try {
        yield possibleActions.emitAsync(
            'oracle.runAssertions',
            state.getState(),
            dataStore.retrieveAll(),
            preconditions,
            next
        );
        applicable = true;
      } catch (error) {
        applicable = false;
      }
    }
    return callback(null, {applicable, preconditions});
  }
};

Emitter.mixIn(possibleActions, plannerEventDispatch);

possibleActions.on('possibleActions.checkIfPossible', possibleActions.checkIfPossible);
