'use strict';

const uuidv4 = require('uuid/v4');
const EventEmitter = require('events').EventEmitter;

let forwardStateSpaceSearch;
module.exports = forwardStateSpaceSearch = {
    * _createPlans(entryComponents, predeterminedGoalAction, callback) {
        let next = yield;

        let planningProblem = {
            fringe: new Map(),
            goalActions: new Set(),
            foundGoalActions: new Set(),
            discoveredActions: new Set(),
            exploreAllActions: true,
            callback,
        };

        if (predeterminedGoalAction) {
            planningProblem.goalActions.add(predeterminedGoalAction);
            planningProblem.exploreAllActions = false;
        }

        let components = yield forwardStateSpaceSearch.emit('forwardStateSpaceSearch.getComponents', next);

        for (let componentName of entryComponents) {
            let component = components[componentName];
            let startNode = yield forwardStateSpaceSearch
                                    .emit('forwardStateSpaceSearch.createSearchNode', new Set(), next);

            startNode.state.createAndAddComponent({
                componentName: componentName,
                instanceName: component.entryComponent.name,
                state: component.entryComponent.state,
                options: component.entryComponent.options,
            });

            startNode.testCase.push({
                name: 'initialization',
                componentName: componentName,
                instanceName: component.entryComponent.name,
                state: component.entryComponent.state,
                options: component.entryComponent.options,
            });

            yield forwardStateSpaceSearch
                    .emit('forwardStateSpaceSearch.addApplicableActions', planningProblem, startNode, next);
            planningProblem.fringe.set(uuidv4(), startNode);
        }

        forwardStateSpaceSearch.emit('forwardStateSpaceSearch.planningProblemCreated', planningProblem);
    },
    * _addApplicableActions(planningProblem, node, callback) {
        let next = yield;

        let components = node.state.getComponents();
        let {goalActions, discoveredActions, exploreAllActions} = planningProblem;

        for (let component of components) {
            for (let actionName of Object.getOwnPropertyNames(component.actions)) {
                let action = component.actions[actionName];
                let actionIdentifier = `${component.instanceName}.${actionName}`;

                let applicable = yield forwardStateSpaceSearch
                            .emit('forwardStateSpaceSearch.checkPreconditions', node, action, actionIdentifier, next);

                if (applicable === true && !node.path.has(actionIdentifier)) {
                    node.actions.add(actionIdentifier);
                }
                if (exploreAllActions && !discoveredActions.has(actionIdentifier)) {
                    goalActions.add(actionIdentifier);
                }

                discoveredActions.add(actionIdentifier);
            }
        }

        callback();
    },
    * _findGoalActions(planningProblem) {
        let next = yield;

        let {fringe, goalActions, discoveredActions, callback, exploreAllActions, foundGoalActions} = planningProblem;

        for (let [key, node] of fringe.entries()) {
            fringe.delete(key);

            for (let action of node.actions.values()) {
                let clonedNode =
                    yield forwardStateSpaceSearch.emit('forwardStateSpaceSearch.cloneSearchNode', node, next);
                clonedNode.actions = new Set();
                clonedNode.path.add(action);

                yield forwardStateSpaceSearch
                        .emit('forwardStateSpaceSearch.applyActionToNode', clonedNode, next);
                yield forwardStateSpaceSearch
                        .emit(
                            'forwardStateSpaceSearch.addApplicableActions',
                            planningProblem,
                            clonedNode,
                            next
                        );

                fringe.set(uuidv4(), clonedNode);

                yield forwardStateSpaceSearch
                        .emit('forwardStateSpaceSearch.testForGoal', planningProblem, clonedNode, next);

                if (exploreAllActions && discoveredActions.size === foundGoalActions.size) {
                    return callback(null, null, true, discoveredActions);
                } else if (!exploreAllActions && foundGoalActions.size === 1) {
                    return callback(null, null, true, discoveredActions);
                }
            }
        }

        throw new MbttError.PLANNER.GOAL_NOT_FOUND(
            `Planning finished before finding the following goal(s): ` + [...goalActions.values()]
        );
    },
    _applyActionToNode(node, callback) {
        let actionIdentifier = [...node.path.values()][node.path.size - 1];
        let [instanceName, actionName] = actionIdentifier.split('.');
        let action = node.state.getComponentsAsMap().get(instanceName).actions[actionName];

        let testCaseAction = {
            name: actionIdentifier,
        };

        if (Array.isArray(action.parameters)) {
            let parameters = action.parameters.map(function(parameter) {
                return parameter.generate();
            });
            testCaseAction.options = {
                parameters,
            };
            try {
                action.effects(...testCaseAction.options.parameters, node.state);
            } catch (error) {
                error.message = `There was an error in the action effects: ${error.message}`;
                throw error;
            }
        } else {
            try {
                action.effects(node.state);
            } catch (error) {
                error.message = `There was an error in the action effects: ${error.message}`;
                throw error;
            }
        }

        node.testCase.push(testCaseAction);
        node.lastAction = actionIdentifier;

        callback();
    },
    * _checkPreconditions(node, action, actionIdentifier, callback) {
        let next = yield;

        if (action.preconditions === undefined) {
            return callback(null, true);
        }

        let preconditions;
        try {
            preconditions = action.preconditions();
        } catch (error) {
            error.message =
                `An error with the message '${error.message}' was thrown while ` +
                `executing preconditions for the action '${actionIdentifier}'`;
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
    * _testForGoal(planningProblem, node, callback) {
        let next = yield;

        let {goalActions, foundGoalActions} = planningProblem;

        if (goalActions.has(node.lastAction) && !foundGoalActions.has(node.lastAction)) {
            foundGoalActions.add(node.lastAction);
            goalActions.delete(node.lastAction);
            planningProblem.callback(null,
                yield forwardStateSpaceSearch.emit('forwardStateSpaceSearch.cloneSearchNode', node, next));
        }

        callback();
    },
};

Object.setPrototypeOf(forwardStateSpaceSearch, new EventEmitter());


forwardStateSpaceSearch.on('forwardStateSpaceSearch.checkPreconditions',
    function(node, action, actionIdentifier, callback) {
        process.nextTick(function() {
            run(forwardStateSpaceSearch._checkPreconditions, [node, action, actionIdentifier, callback]);
        });
    });

forwardStateSpaceSearch.on('forwardStateSpaceSearch.addApplicableActions',
    function(planningProblem, node, callback) {
        process.nextTick(function() {
            run(forwardStateSpaceSearch._addApplicableActions, [planningProblem, node, callback]);
        });
    });

forwardStateSpaceSearch.on('forwardStateSpaceSearch.planningProblemCreated',
    function(planningProblem, node, callback) {
        process.nextTick(function() {
            run(forwardStateSpaceSearch._findGoalActions, [planningProblem, node, callback]);
        });
    });

forwardStateSpaceSearch.on('forwardStateSpaceSearch.applyActionToNode',
    function(node, callback) {
        process.nextTick(function() {
            forwardStateSpaceSearch._applyActionToNode(node, callback);
        });
    });

forwardStateSpaceSearch.on('forwardStateSpaceSearch.testForGoal',
    function(planningProblem, node, callback) {
        process.nextTick(function() {
            run(forwardStateSpaceSearch._testForGoal, [planningProblem, node, callback]);
        });
    });

forwardStateSpaceSearch.on('forwardStateSpaceSearch.createPlans',
    function(entryComponents, predeterminedGoalAction, callback) {
        process.nextTick(function() {
            run(forwardStateSpaceSearch._createPlans, [entryComponents, predeterminedGoalAction, callback]);
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
