'use strict';

const Emitter = require('../util/emitter.js');

let possibleActions;

module.exports = possibleActions = {
    * get(node, callback) {
        let next = yield;
        let components = node.state.getComponents();

        let allActions = new Set();
        let applicableActions = new Set();
        for (let component of components) {
            for (let actionName of Object.getOwnPropertyNames(component.actions)) {
                let actionIdentifier = `${component.name}.${actionName}`;
                let action = component.actions[actionName];
                allActions.add(actionIdentifier);

                let applicable = false;
                if (action.preconditions === undefined) {
                    applicable = true;
                } else {
                    let preconditions;
                    try {
                        if (Array.isArray(action.parameters)) {
                            let parameters = action.parameters.map(function(parameter) {
                                return parameter.generate.call(component, node.dataStore);
                            });
                            preconditions = action.preconditions.call(component, ...parameters, node.dataStore);
                        } else {
                            preconditions = action.preconditions.call(component, node.dataStore);
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
                            node.state.getState(),
                            node.dataStore.retrieveAll(),
                            preconditions,
                            next
                        );
                        applicable = true;
                    } catch (error) {
                        applicable = false;
                    }
                }

                if (applicable) {
                    applicableActions.add(actionIdentifier);
                }
            }
        }
        callback(null, {applicableActions, allActions});
    },
};

Emitter.mixIn(possibleActions, require('./planner-event-dispatch/planner-event-dispatch.js'));
