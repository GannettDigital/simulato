'use strict';

const Emitter = require('../../util/emitter.js');

let forwardStateSpaceSearch;
module.exports = forwardStateSpaceSearch = {
    pathArray: [],
    goalActions: new Set(),
    foundGoalActions: new Set(),
    discoveredActions: new Set(),
    predeterminedGoalAction: null,
    callback: null,
    * _createPlans(predeterminedGoalAction, callback) {
        let next = yield;
        forwardStateSpaceSearch.callback = callback;

        if (predeterminedGoalAction) {
            forwardStateSpaceSearch.predeterminedGoalAction = predeterminedGoalAction;
        }

        let startNodes = yield forwardStateSpaceSearch.emitAsync('forwardStateSpaceSearch.getStartNodes', next);

        for (let startNode of startNodes) {
            yield forwardStateSpaceSearch.emitAsync('forwardStateSpaceSearch.addActions', startNode.allActions, next);
            let unfoundGoalActionCount = yield forwardStateSpaceSearch
                .emitAsync('forwardStateSpaceSearch.findUnfoundGoalActionCount', startNode, next);
            yield forwardStateSpaceSearch
                .emitAsync('forwardStateSpaceSearch.setNodeInMap', startNode, unfoundGoalActionCount, next);
        }

        forwardStateSpaceSearch.emitAsync('forwardStateSpaceSearch.findGoalActions');
    },
    _addActions(actions, callback) {
        let {goalActions, discoveredActions} = forwardStateSpaceSearch;

        for (let action of actions) {
            if (!discoveredActions.has(action)) {
                goalActions.add(action);
            }

            discoveredActions.add(action);
        }

        callback();
    },
    * _findGoalActions() {
        let next = yield;

        let {goalActions, discoveredActions, foundGoalActions, predeterminedGoalAction, callback}
             = forwardStateSpaceSearch;

        let node = yield forwardStateSpaceSearch
            .emitAsync('forwardStateSpaceSearch.getNodeFromMap', next);

        if (!node) {
            throw new SimulatoError.PLANNER.GOAL_NOT_FOUND(
                `Planning finished before finding the following goal(s): ` + [...goalActions.values()]
            );
        }

        for (let action of node.actions.values()) {
            let clonedNode = yield forwardStateSpaceSearch
                .emitAsync('forwardStateSpaceSearch.cloneSearchNode', node, next);
            clonedNode.actions = new Set();
            clonedNode.path.push(action);

            yield forwardStateSpaceSearch
                .emitAsync('forwardStateSpaceSearch.applyEffects', clonedNode, next);
            let {applicableActions, allActions} = yield forwardStateSpaceSearch
                .emitAsync('forwardStateSpaceSearch.getPossibleActions', clonedNode, next);
            clonedNode.actions = applicableActions;
            yield forwardStateSpaceSearch.emitAsync('forwardStateSpaceSearch.addActions', allActions, next);
            yield forwardStateSpaceSearch
                .emitAsync('forwardStateSpaceSearch.testForGoal', clonedNode, next);

            if ((!predeterminedGoalAction && discoveredActions.size === foundGoalActions.size) ||
                (predeterminedGoalAction && foundGoalActions.has(predeterminedGoalAction))) {
                return callback(null, null, true, discoveredActions);
            }

            let unfoundGoalActionCount = yield forwardStateSpaceSearch
                .emitAsync('forwardStateSpaceSearch.findUnfoundGoalActionCount', clonedNode, next);

            yield forwardStateSpaceSearch
                .emitAsync('forwardStateSpaceSearch.setNodeInMap', clonedNode, unfoundGoalActionCount, next);
        }

        forwardStateSpaceSearch.emitAsync('forwardStateSpaceSearch.findGoalActions');
    },
    * _testForGoal(node, callback) {
        let next = yield;

        let {goalActions, foundGoalActions, predeterminedGoalAction} = forwardStateSpaceSearch;

        if (goalActions.has(node.lastAction) && !foundGoalActions.has(node.lastAction)) {
            foundGoalActions.add(node.lastAction);
            goalActions.delete(node.lastAction);
            if (!predeterminedGoalAction || predeterminedGoalAction === node.lastAction) {
                forwardStateSpaceSearch.callback(null,
                    yield forwardStateSpaceSearch.emitAsync('forwardStateSpaceSearch.cloneSearchNode', node, next));
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
                            .emitAsync('forwardStateSpaceSearch.findNextNode', pathArray[i][j], j, next);
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
                        .emitAsync('forwardStateSpaceSearch.findNextNode', pathArray[i][0], 0, next);
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
                .emitAsync('forwardStateSpaceSearch.findUnfoundGoalActionCount', node, next);

            if (unfoundGoalActionCount === currentActionsCount) {
                nodeToReturn = node;
                break;
            }
            nodesToReorder.push({node, unfoundGoalActionCount});
        }

        for (let reorderNode of nodesToReorder) {
            yield forwardStateSpaceSearch
                .emitAsync(
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

Emitter.mixIn(forwardStateSpaceSearch);

forwardStateSpaceSearch.runOn('forwardStateSpaceSearch.findGoalActions', forwardStateSpaceSearch._findGoalActions);
forwardStateSpaceSearch.runOn('forwardStateSpaceSearch.testForGoal', forwardStateSpaceSearch._testForGoal);
forwardStateSpaceSearch.runOn('forwardStateSpaceSearch.createPlans', forwardStateSpaceSearch._createPlans);
forwardStateSpaceSearch.on('forwardStateSpaceSearch.setNodeInMap', forwardStateSpaceSearch._setNodeInMap);
forwardStateSpaceSearch.runOn('forwardStateSpaceSearch.getNodeFromMap', forwardStateSpaceSearch._getNodeFromMap);
forwardStateSpaceSearch.runOn('forwardStateSpaceSearch.findNextNode', forwardStateSpaceSearch._findNextNode);
forwardStateSpaceSearch
    .on('forwardStateSpaceSearch.findUnfoundGoalActionCount', forwardStateSpaceSearch._findUnfoundGoalActionCount);
forwardStateSpaceSearch.on('forwardStateSpaceSearch.addActions', forwardStateSpaceSearch._addActions);
