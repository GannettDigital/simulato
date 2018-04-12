'use strict';

const EventEmitter = require('events').EventEmitter;

let forwardStateSpaceSearch;
module.exports = forwardStateSpaceSearch = {
    pathArray: [],
    goalActions: new Set(),
    foundGoalActions: new Set(),
    discoveredActions: new Set(),
    predeterminedGoalAction: null,
    callback: null,
    * _createPlans(entryComponents, predeterminedGoalAction, callback) {
        let next = yield;
        forwardStateSpaceSearch.callback = callback;

        if (predeterminedGoalAction) {
            forwardStateSpaceSearch.predeterminedGoalAction = predeterminedGoalAction;
        }

        let components = yield forwardStateSpaceSearch.emit('forwardStateSpaceSearch.getComponents', next);

        for (let type of entryComponents) {
            let component = components[type];
            let startNode = yield forwardStateSpaceSearch
                .emit('forwardStateSpaceSearch.createSearchNode', new Set(), next);

            startNode.state.createAndAddComponent({
                type: type,
                name: component.entryComponent.name,
                state: component.entryComponent.state,
                options: component.entryComponent.options,
            });

            startNode.testCase.push({
                type: type,
                name: component.entryComponent.name,
                state: component.entryComponent.state,
                options: component.entryComponent.options,
            });

            yield forwardStateSpaceSearch
                .emit('forwardStateSpaceSearch.addApplicableActions', startNode, next);

            let unfoundGoalActionCount = yield forwardStateSpaceSearch
                .emit('forwardStateSpaceSearch.findUnfoundGoalActionCount', startNode, next);
            yield forwardStateSpaceSearch
                .emit('forwardStateSpaceSearch.setNodeInMap', startNode, unfoundGoalActionCount, next);
        }

        forwardStateSpaceSearch.emit('forwardStateSpaceSearch.findGoalActions');
    },
    * _addApplicableActions(node, callback) {
        let next = yield;

        let components = node.state.getComponents();
        let {goalActions, discoveredActions} = forwardStateSpaceSearch;

        for (let component of components) {
            for (let actionName of Object.getOwnPropertyNames(component.actions)) {
                let actionIdentifier = `${component.name}.${actionName}`;

                let applicable = yield forwardStateSpaceSearch
                    .emit('forwardStateSpaceSearch.checkPreconditions', node, component, actionName, next);

                if (applicable === true && !node.path.has(actionIdentifier)) {
                    node.actions.add(actionIdentifier);
                }
                if (!discoveredActions.has(actionIdentifier)) {
                    goalActions.add(actionIdentifier);
                }

                discoveredActions.add(actionIdentifier);
            }
        }

        callback();
    },
    * _findGoalActions() {
        let next = yield;

        let {goalActions, discoveredActions, foundGoalActions, predeterminedGoalAction, callback}
             = forwardStateSpaceSearch;

        let node = yield forwardStateSpaceSearch
            .emit('forwardStateSpaceSearch.getNodeFromMap', next);

        if (!node) {
            throw new SimulatoError.PLANNER.GOAL_NOT_FOUND(
                `Planning finished before finding the following goal(s): ` + [...goalActions.values()]
            );
        }

        for (let action of node.actions.values()) {
            let clonedNode = yield forwardStateSpaceSearch
                .emit('forwardStateSpaceSearch.cloneSearchNode', node, next);
            clonedNode.actions = new Set();
            clonedNode.path.add(action);

            yield forwardStateSpaceSearch
                .emit('forwardStateSpaceSearch.applyActionToNode', clonedNode, next);
            yield forwardStateSpaceSearch
                .emit('forwardStateSpaceSearch.addApplicableActions', clonedNode, next);
            yield forwardStateSpaceSearch
                .emit('forwardStateSpaceSearch.testForGoal', clonedNode, next);

            if ((!predeterminedGoalAction && discoveredActions.size === foundGoalActions.size) ||
                (predeterminedGoalAction && foundGoalActions.has(predeterminedGoalAction))) {
                return callback(null, null, true, discoveredActions);
            }

            let unfoundGoalActionCount = yield forwardStateSpaceSearch
                .emit('forwardStateSpaceSearch.findUnfoundGoalActionCount', clonedNode, next);

            yield forwardStateSpaceSearch
                .emit('forwardStateSpaceSearch.setNodeInMap', clonedNode, unfoundGoalActionCount, next);
        }

        forwardStateSpaceSearch.emit('forwardStateSpaceSearch.findGoalActions');
    },
    _applyActionToNode(node, callback) {
        let actionIdentifier = [...node.path.values()][node.path.size - 1];
        let [name, actionName] = actionIdentifier.split('.');
        let component = node.state.getComponentsAsMap().get(name);
        let action = component.actions[actionName];

        let testCaseAction = {
            name: actionIdentifier,
        };

        if (Array.isArray(action.parameters)) {
            let parameters = action.parameters.map(function(parameter) {
                return parameter.generate.call(component, node.dataStore);
            });
            testCaseAction.options = {
                parameters,
            };
            action.effects.call(component, ...testCaseAction.options.parameters, node.state, node.dataStore);
        } else {
            action.effects.call(component, node.state, node.dataStore);
        }

        node.testCase.push(testCaseAction);
        node.lastAction = actionIdentifier;

        callback();
    },
    * _checkPreconditions(node, component, actionName, callback) {
        let next = yield;

        if (component.actions[actionName].preconditions === undefined) {
            return callback(null, true);
        }

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
            yield forwardStateSpaceSearch.emit(
                'forwardStateSpaceSearch.runAssertions',
                node.state.getState(),
                preconditions,
                next
            );
        } catch (error) {
            return callback(null, false);
        }

        callback(null, true);
    },
    * _testForGoal(node, callback) {
        let next = yield;

        let {goalActions, foundGoalActions, predeterminedGoalAction} = forwardStateSpaceSearch;

        if (goalActions.has(node.lastAction) && !foundGoalActions.has(node.lastAction)) {
            foundGoalActions.add(node.lastAction);
            goalActions.delete(node.lastAction);
            if (!predeterminedGoalAction || predeterminedGoalAction === node.lastAction) {
                forwardStateSpaceSearch.callback(null,
                    yield forwardStateSpaceSearch.emit('forwardStateSpaceSearch.cloneSearchNode', node, next));
            }
        }

        callback();
    },
    _setNodeInMap(node, unfoundGoalActionCount, callback) {
        let {pathArray} = forwardStateSpaceSearch;

        if (!pathArray[node.testCase.length]) {
            pathArray[node.testCase.length] = [];
        }

        if (!pathArray[node.testCase.length][unfoundGoalActionCount]) {
            pathArray[node.testCase.length][unfoundGoalActionCount] = [];
        }

        pathArray[node.testCase.length][unfoundGoalActionCount].push(node);

        return callback();
    },
    * _getNodeFromMap(callback) {
        let next = yield;
        let {pathArray} = forwardStateSpaceSearch;
        let node;

        for (let i = 0; i < pathArray.length; i++) {
            if (pathArray[i]) {
                for (let j = pathArray[i].length -1; j >= 1; j--) {
                    if (pathArray[i][j]) {
                        node = yield forwardStateSpaceSearch
                            .emit('forwardStateSpaceSearch.findNextNode', pathArray[i][j], j, next);
                        if (node) {
                            return callback(null, node);
                        }
                    }
                }
            }
        }

        for (let i = 0; i < pathArray.length; i++) {
            if (pathArray[i]) {
                if (pathArray[i][0]) {
                    node = yield forwardStateSpaceSearch
                        .emit('forwardStateSpaceSearch.findNextNode', pathArray[i][0], 0, next);
                    if (node) {
                        return callback(null, node);
                    }
                }
            }
        }

        return callback(null, null);
    },
    * _findNextNode(nodesArray, currentActionsCount, callback) {
        let next = yield;
        let node = null;
        let nodesToReorder = [];
        let nodeToReturn = null;

        while (nodesArray.length) {
            node = nodesArray.pop();

            let unfoundGoalActionCount = yield forwardStateSpaceSearch
                .emit('forwardStateSpaceSearch.findUnfoundGoalActionCount', node, next);

            if (unfoundGoalActionCount === currentActionsCount) {
                nodeToReturn = node;
                break;
            }
            nodesToReorder.push({node, unfoundGoalActionCount});
        }

        for (let reorderNode of nodesToReorder) {
            yield forwardStateSpaceSearch
                .emit(
                    'forwardStateSpaceSearch.setNodeInMap',
                    reorderNode.node,
                    reorderNode.unfoundGoalActionCount,
                    next
                );
        }

        return callback(null, nodeToReturn);
    },
    _findUnfoundGoalActionCount(node, callback) {
        let unfoundGoalActionCount = node.actions.size;
        for (let action of node.actions) {
            if (forwardStateSpaceSearch.foundGoalActions.has(action)) {
                unfoundGoalActionCount--;
            }
        }
        return callback(null, unfoundGoalActionCount);
    },
};

Object.setPrototypeOf(forwardStateSpaceSearch, new EventEmitter());


forwardStateSpaceSearch.on('forwardStateSpaceSearch.checkPreconditions',
    function(node, component, actionName, callback) {
        process.nextTick(function() {
            run(forwardStateSpaceSearch._checkPreconditions, [node, component, actionName, callback]);
        });
    });

forwardStateSpaceSearch.on('forwardStateSpaceSearch.addApplicableActions',
    function(node, callback) {
        process.nextTick(function() {
            run(forwardStateSpaceSearch._addApplicableActions, [node, callback]);
        });
    });

forwardStateSpaceSearch.on('forwardStateSpaceSearch.findGoalActions',
    function(callback) {
        process.nextTick(function() {
            run(forwardStateSpaceSearch._findGoalActions, [callback]);
        });
    });

forwardStateSpaceSearch.on('forwardStateSpaceSearch.applyActionToNode',
    function(node, callback) {
        process.nextTick(function() {
            forwardStateSpaceSearch._applyActionToNode(node, callback);
        });
    });

forwardStateSpaceSearch.on('forwardStateSpaceSearch.testForGoal',
    function(node, callback) {
        process.nextTick(function() {
            run(forwardStateSpaceSearch._testForGoal, [node, callback]);
        });
    });

forwardStateSpaceSearch.on('forwardStateSpaceSearch.createPlans',
    function(entryComponents, predeterminedGoalAction, callback) {
        process.nextTick(function() {
            run(forwardStateSpaceSearch._createPlans, [entryComponents, predeterminedGoalAction, callback]);
        });
    });

forwardStateSpaceSearch.on('forwardStateSpaceSearch.setNodeInMap',
    function(node, actionCount, callback) {
        process.nextTick(function() {
            forwardStateSpaceSearch._setNodeInMap(node, actionCount, callback);
        });
    });

forwardStateSpaceSearch.on('forwardStateSpaceSearch.getNodeFromMap',
    function(callback) {
        process.nextTick(function() {
            run(forwardStateSpaceSearch._getNodeFromMap, [callback]);
        });
    });

forwardStateSpaceSearch.on('forwardStateSpaceSearch.findNextNode',
    function(nodesArray, currentActionsCount, callback) {
        process.nextTick(function() {
            run(forwardStateSpaceSearch._findNextNode, [nodesArray, currentActionsCount, callback]);
        });
    });

forwardStateSpaceSearch.on('forwardStateSpaceSearch.findUnfoundGoalActionCount',
    function(node, callback) {
        process.nextTick(function() {
            forwardStateSpaceSearch._findUnfoundGoalActionCount(node, callback);
        });
    });

function run(myFunction, args) {
    let generatorObject = myFunction(...args);

    generatorObject.next();

    function nextFunction(error, result) {
        if (error) {
            generatorObject.throw(error);
        } else {
            generatorObject.next(result);
        }
    }

    generatorObject.next(nextFunction);
}
