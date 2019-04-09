'use strict';

const Emitter = require('../../util/emitter.js');
const configHandler = require('../../util/config/config-handler.js');
const plannerEventDispatch = require('../planner-event-dispatch/planner-event-dispatch.js');

let forwardStateSpaceSearch;
module.exports = forwardStateSpaceSearch = {
  _pathArray: [],
  _goalActions: new Set(),
  _foundGoalActions: new Set(),
  _discoveredActions: new Set(),
  _predeterminedGoalAction: null,
  _callback: null,
  * createPlans(callback) {
    let next = yield;
    forwardStateSpaceSearch._callback = callback;

    if (configHandler.get('actionToCover')) {
      forwardStateSpaceSearch._predeterminedGoalAction = configHandler.get('actionToCover');
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
    let { _goalActions, _discoveredActions } = forwardStateSpaceSearch;

    for (let action of actions) {
      if (!_discoveredActions.has(action)) {
        _goalActions.add(action);
      }

      _discoveredActions.add(action);
    }
  },
  * _findGoalActions() {
    let next = yield;

    let { _goalActions, _discoveredActions, _foundGoalActions, _predeterminedGoalAction, _callback }
      = forwardStateSpaceSearch;

    let node = forwardStateSpaceSearch._getNodeFromMap();

    if (!node) {
      throw new SimulatoError.PLANNER.GOAL_NOT_FOUND(
        `Planning finished before finding the following goal(s): ` + [..._goalActions.values()]
      );
    }

    for (let action of node.actions.values()) {
      let clonedNode = yield forwardStateSpaceSearch
        .emitAsync('searchNode.clone', node, next);
      clonedNode.actions = new Set();
      clonedNode.path.push(action);

      yield forwardStateSpaceSearch
        .emitAsync('planner.applyEffects', clonedNode, next);
      let { applicableActions, allActions } = yield forwardStateSpaceSearch
        .emitAsync('possibleActions.get', clonedNode.state, next);
      clonedNode.actions = applicableActions;
      forwardStateSpaceSearch._addActions(allActions);
      yield forwardStateSpaceSearch
        .emitAsync('forwardStateSpaceSearch.testForGoal', clonedNode, next);

      if ((!_predeterminedGoalAction && _discoveredActions.size === _foundGoalActions.size) ||
        (_predeterminedGoalAction && _foundGoalActions.has(_predeterminedGoalAction))) {
        return _callback(null, null, true, _discoveredActions);
      }

      let unfoundGoalActionCount = forwardStateSpaceSearch._findUnfoundGoalActionCount(clonedNode);

      forwardStateSpaceSearch._setNodeInMap(clonedNode, unfoundGoalActionCount);
    }

    forwardStateSpaceSearch.emitAsync('forwardStateSpaceSearch.findGoalActions');
  },
  * _testForGoal(node, callback) {
    let next = yield;

    let { _goalActions, _foundGoalActions, _predeterminedGoalAction } = forwardStateSpaceSearch;

    if (_goalActions.has(node.lastAction) && !_foundGoalActions.has(node.lastAction)) {
      _foundGoalActions.add(node.lastAction);
      _goalActions.delete(node.lastAction);

      if (configHandler.get('debug') === true) {
        if (_goalActions.size === 0) {
          console.log(`\nFound a path to all ${_foundGoalActions.size} discovered action(s).`);
        } else {
          console.log(`\nFound a path to ${_foundGoalActions.size} action(s).`);
          console.log('Searching for a path to:');
          console.log(_goalActions);
        }
      }

      if (!_predeterminedGoalAction || _predeterminedGoalAction === node.lastAction) {
        forwardStateSpaceSearch._callback(null,
          yield forwardStateSpaceSearch.emitAsync('searchNode.clone', node, next));
      }
    }

    callback();
  },
  _setNodeInMap(node, unfoundGoalActionCount) {
    let { _pathArray } = forwardStateSpaceSearch;

    if (!_pathArray[node.testCase.length]) {
      _pathArray[node.testCase.length] = [];
    }

    if (!_pathArray[node.testCase.length][unfoundGoalActionCount]) {
      _pathArray[node.testCase.length][unfoundGoalActionCount] = [];
    }

    _pathArray[node.testCase.length][unfoundGoalActionCount].push(node);
  },
  _getNodeFromMap() {
    let { _pathArray } = forwardStateSpaceSearch;
    let node;

    for (let i = 0; i < _pathArray.length; i++) {
      if (_pathArray[i]) {
        for (let j = _pathArray[i].length - 1; j >= 1; j--) {
          if (_pathArray[i][j]) {
            node = forwardStateSpaceSearch._findNextNode(_pathArray[i][j], j);
            if (node) {
              return node;
            }
          }
        }
      }
    }

    for (let i = 0; i < _pathArray.length; i++) {
      if (_pathArray[i]) {
        if (_pathArray[i][0]) {
          node = forwardStateSpaceSearch._findNextNode(_pathArray[i][0], 0);
          if (node) {
            return node;
          }
        }
      }
    }

    return null;
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
      nodesToReorder.push({ node, unfoundGoalActionCount });
    }

    for (let reorderNode of nodesToReorder) {
      forwardStateSpaceSearch._setNodeInMap(reorderNode.node, reorderNode.unfoundGoalActionCount);
    }

    return nodeToReturn;
  },
  _findUnfoundGoalActionCount(node) {
    let unfoundGoalActionCount = node.actions.size;
    for (let action of node.actions) {
      if (forwardStateSpaceSearch._foundGoalActions.has(action)) {
        unfoundGoalActionCount--;
      }
    }
    return unfoundGoalActionCount;
  },
};

Emitter.mixIn(forwardStateSpaceSearch, plannerEventDispatch);

forwardStateSpaceSearch.runOn('forwardStateSpaceSearch.findGoalActions', forwardStateSpaceSearch._findGoalActions);
forwardStateSpaceSearch.runOn('forwardStateSpaceSearch.testForGoal', forwardStateSpaceSearch._testForGoal);
