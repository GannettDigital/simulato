'use strict';

const Emitter = require('../util/emitter.js');

let possibleActions;

module.exports = possibleActions = {
    * get(node, callback) {
        let next = yield;
        let components = node.state.getComponents();

        let applicableActions = new Set();
        for (let component of components) {
            for (let actionName of Object.getOwnPropertyNames(component.actions)) {
                let actionIdentifier = `${component.name}.${actionName}`;

                // let applicable = yield forwardStateSpaceSearch
                //     .emit('forwardStateSpaceSearch.checkPreconditions', node, component, actionName, next);

                let applicable = false;
                if (component.actions[actionName].preconditions === undefined) {
                    applicable = true;
                } else {
                    let preconditions;
                    try {
                        preconditions = component.actions[actionName].preconditions.call(component, node.dataStore);
                    } catch (error) {
                        error.message =
                            `An error with the message '${error.message}' was thrown while ` +
                            `executing preconditions for the action '${component.name}.${actionName}'`;
                        throw error;
                    }

                    try {
                        yield possibleActions.emit(
                            'possibleActions.runAssertions',
                            node.state.getState(),
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
        callback(null, applicableActions);
    }
}

Emitter.mixIn(possibleActions);

possibleActions.runOn('possibleActions.getPossibleActions', possibleActions.get);
