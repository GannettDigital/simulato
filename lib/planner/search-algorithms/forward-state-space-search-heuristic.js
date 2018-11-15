'use strict';

const Emitter = require('../../util/emitter.js');
const configHandler = require('../../util/config/config-handler.js');
const plannerEventDispatch = require('../planner-event-dispatch/planner-event-dispatch.js');

let forwardStateSpaceSearch;
module.exports = forwardStateSpaceSearch = {
  pathArray: [],
  goalActions: new Set(),
  foundGoalActions: new Set(),
  discoveredActions: new Set(),
  predeterminedGoalAction: null,
  callback: null,
  * createPlans(callback) {
    let next = yield;
    forwardStateSpaceSearch.callback = callback;

    if (configHandler.get('actionToCover')) {
      forwardStateSpaceSearch.predeterminedGoalAction = configHandler.get('actionToCover');
    }

    let startNodes = yield forwardStateSpaceSearch.emitAsync('startNodes.get', next);

    for (let startNode of startNodes) {
      forwardStateSpaceSearch._addActions(startNode.allActions);
      let unfoundGoalActionCount = forwardStateSpaceSearch._findUnfoundGoalActionCount(startNode);
      forwardStateSpaceSearch._setNodeInMap(startNode, unfoundGoalActionCount);
    }

    forwardStateSpaceSearch.emitAsync('forwardStateSpaceSearch.findGoalActions');
  },
  _addActions(actions) {
    let {goalActions, discoveredActions} = forwardStateSpaceSearch;

    for (let action of actions) {
      if (!discoveredActions.has(action)) {
        goalActions.add(action);
      }

      discoveredActions.add(action);
    }
  },
  * _findGoalActions() {
    let next = yield;

    let {goalActions, discoveredActions, foundGoalActions, predeterminedGoalAction, callback}
             = forwardStateSpaceSearch;

    let node = forwardStateSpaceSearch._getNodeFromMap();

    if (!node) {
      throw new SimulatoError.PLANNER.GOAL_NOT_FOUND(
          `Planning finished before finding the following goal(s): ` + [...goalActions.values()]
      );
    }

    for (let action of node.actions.values()) {
      let clonedNode = yield forwardStateSpaceSearch
          .emitAsync('searchNode.clone', node, next);
      clonedNode.actions = new Set();
      clonedNode.path.push(action);

      yield forwardStateSpaceSearch
          .emitAsync('planner.applyEffects', clonedNode, next);
      let {applicableActions, allActions} = yield forwardStateSpaceSearch
          .emitAsync('possibleActions.get', clonedNode, next);
      clonedNode.actions = applicableActions;
      forwardStateSpaceSearch._addActions(allActions);
      yield forwardStateSpaceSearch
          .emitAsync('forwardStateSpaceSearch.testForGoal', clonedNode, next);

      if ((!predeterminedGoalAction && discoveredActions.size === foundGoalActions.size) ||
                (predeterminedGoalAction && foundGoalActions.has(predeterminedGoalAction))) {
        return callback(null, null, true, discoveredActions);
      }

      let unfoundGoalActionCount = forwardStateSpaceSearch._findUnfoundGoalActionCount(clonedNode);

      forwardStateSpaceSearch._setNodeInMap(clonedNode, unfoundGoalActionCount);
    }

    forwardStateSpaceSearch.emitAsync('forwardStateSpaceSearch.findGoalActions');
  },
  * _testForGoal(node, callback) {
    let next = yield;

    let {goalActions, foundGoalActions, predeterminedGoalAction} = forwardStateSpaceSearch;

    if (goalActions.has(node.lastAction) && !foundGoalActions.has(node.lastAction)) {
      foundGoalActions.add(node.lastAction);
      goalActions.delete(node.lastAction);

      if (configHandler.get('debug') === true) {
        if (goalActions.size === 0) {
          console.log(`\nFound a path to all ${foundGoalActions.size} discovered action(s).`);
        } else {
          console.log(`\nFound a path to ${foundGoalActions.size} action(s).`);
          console.log('Searching for a path to:');
          console.log(goalActions);
        }
      }

      if (!predeterminedGoalAction || predeterminedGoalAction === node.lastAction) {
        forwardStateSpaceSearch.callback(null,
            yield forwardStateSpaceSearch.emitAsync('searchNode.clone', node, next));
      }
    }

    callback();
  },
  _setNodeInMap(node, unfoundGoalActionCount) {
    let {pathArray} = forwardStateSpaceSearch;

    if (!pathArray[node.testCase.length]) {
      pathArray[node.testCase.length] = [];
    }

    if (!pathArray[node.testCase.length][unfoundGoalActionCount]) {
      pathArray[node.testCase.length][unfoundGoalActionCount] = [];
    }

    pathArray[node.testCase.length][unfoundGoalActionCount].push(node);
  },
  _getNodeFromMap() {
    let {pathArray} = forwardStateSpaceSearch;
    let node;

    for (let i = 0; i < pathArray.length; i++) {
      if (pathArray[i]) {
        for (let j = pathArray[i].length -1; j >= 1; j--) {
          if (pathArray[i][j]) {
            node = forwardStateSpaceSearch._findNextNode(pathArray[i][j], j);
            if (node) {
              return node;
            }
          }
        }
      }
    }

    for (let i = 0; i < pathArray.length; i++) {
      if (pathArray[i]) {
        if (pathArray[i][0]) {
          node = forwardStateSpaceSearch._findNextNode(pathArray[i][0], 0);
          if (node) {
            return node;
          }
        }
      }
    }

    return callback(null, null);
  },
  _findNextNode(nodesArray, currentActionsCount) {
    let node = null;
    let nodesToReorder = [];
    let nodeToReturn = null;

    while (nodesArray.length) {
      node = nodesArray.pop();

      let unfoundGoalActionCount = forwardStateSpaceSearch._findUnfoundGoalActionCount(node);

      if (unfoundGoalActionCount === currentActionsCount) {
        nodeToReturn = node;
        break;
      }
      nodesToReorder.push({node, unfoundGoalActionCount});
    }

    for (let reorderNode of nodesToReorder) {
      forwardStateSpaceSearch._setNodeInMap(reorderNode.node, reorderNode.unfoundGoalActionCount);
    }

    return nodeToReturn;
  },
  _findUnfoundGoalActionCount(node) {
    let unfoundGoalActionCount = node.actions.size;
    for (let action of node.actions) {
      if (forwardStateSpaceSearch.foundGoalActions.has(action)) {
        unfoundGoalActionCount--;
      }
    }
    return unfoundGoalActionCount;
  },
};

Emitter.mixIn(forwardStateSpaceSearch, plannerEventDispatch);

forwardStateSpaceSearch.runOn('forwardStateSpaceSearch.findGoalActions', forwardStateSpaceSearch._findGoalActions);
forwardStateSpaceSearch.runOn('forwardStateSpaceSearch.testForGoal', forwardStateSpaceSearch._testForGoal);
