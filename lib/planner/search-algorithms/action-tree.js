'use strict';

const Emitter = require('../../util/emitter.js');
const configHandler = require('../../util/config/config-handler.js');
const plannerEventDispatch = require('../planner-event-dispatch/planner-event-dispatch.js');
const assert = require('chai').assert;

let actionTree;

module.exports = actionTree = {
  _rootNodes: new Set(),
  _discoveredActions: new Map(),
  _visitedActions: new Set(),
  _actionStack: [],
  _expectedState: null,
  _metaExpectedState: {},
  _dataStore: null,
  _metaDataStore: {},
  _predeterminedGoalAction: null,
  _unmetPreconditions: {},
  _testPaths: [],
  * createPlans(callback) {
    let next = yield;
    
    // TODO: HANDLE SPECIFIC ACTION AS GOAL TO END PLANNING EARLY
    if (configHandler.get('actionToCover')) {
      actionTree._predeterminedGoalAction = configHandler.get('actionToCover');
    }
    
    // Create initial actionStack from entryComponents
    yield actionTree.emitAsync('actionTree.processEntryComponents', next);
    // save all entryComponent rootnode actions for recreated of tree later
    for (let rootNode of actionTree._actionStack) {
      actionTree._rootNodes.add(rootNode);
    }

    // Perform actions feom the actionStack
    yield actionTree.emitAsync('actionTree.performActions', next);

    // Once we are out of free actions, check for left overs in precon map against metaES
    let foundAction = true;
    while (foundAction) {
      yield actionTree.emitAsync('actionTree.checkForLeftoverPossibleActions', next);
      if (actionTree._actionStack.length === 0) {
        // No actions found, planning has ended
        foundAction = false;
        break;
      } else {
        // Do the actions found
        yield actionTree.emitAsync('actionTree.performActions', next);
      }
    }

    // TODO: Handle to check if fail or precon map stuff

    // Create Test Paths from Root Nodes
    actionTree._createTestPaths();
    
    // TODO: What do I callback with?
    return callback(actionTree._testPaths);
  },
  * _performActions(callback) {
    let next = yield;
    // While there are still actions on the stack
    while(actionTree._actionStack.length) {
      // Grab the next action off the stack and do it
      yield actionTree.emitAsync('actionTree.performAction', actionTree._actionStack.pop(), next);
    }
    // Stack is now empty
    return callback(null);
  },
  * _performAction(actionNode, callback) {
    let next = yield;
    // Create path back to the root
    let path = actionTree._getActionPath(actionNode);
    
    // Init the espected state and datastore;
    yield actionTree._initExpectedState(next);

    let rootComponent = yield actionTree.emitAsync('componentHandler.getComponent', path[path.length - 1].type, next);
    actionTree._processEntryComponent(rootComponent);

    // Apply Effects on all all nodes down the path except the last action
    for (let i = path.length - 1; i > 0; i--) {
      yield actionTree.emitAsync('actionTree.applyActionEffects', path[i], next);
    }

    // Take a snapshot of the current state and datastore so we can get a diff after last action
    let oldState = JSON.parse(JSON.stringify(actionTree._expectedState.getState()));
    let oldDatastore = JSON.parse(JSON.stringify(actionTree._dataStore.retrieveAll()));
    // Clear out all components so we know the new ones added
    actionTree._expectedState.clearNewComponents();
    // Apply the last effect
    yield actionTree.emitAsync('actionTree.applyActionEffects', path[0], next);
    // Add action as visited
    actionTree._visitedActions.add(`${path[0].name}.${path[0].action}`);

    let touchedNodesInPreconMap = new Set();
    // Get difference in states
    let stateDiff = yield actionTree.emitAsync('stateDifference.createDiff', oldState, actionTree._expectedState.getState(), next);
    // Process new things into the metaExpectedState, will also check precon map
    actionTree._processObjectDiff(stateDiff, path[0], 'es', '', touchedNodesInPreconMap);
    // Get difference in datastore
    let dataDiff = yield actionTree.emitAsync('stateDifference.createDiff', oldDatastore, actionTree._dataStore.retrieveAll(), next);
    // Process new things into the metaDatastore, will also check precon map
    actionTree._processObjectDiff(dataDiff, path[0], 'ds', '', touchedNodesInPreconMap);

    // Process all new components
    for (let componentName of actionTree._expectedState.getNewComponents()) {
      // Send in the last processed node as the parent node
      yield actionTree.emitAsync('actionTree.processNewComponent', componentName, path[0], next);
    }

    // For all the nodes touched be this action inside the preconMap, check if they can now be done
    yield actionTree.emitAsync('actionTree.processTouchedNodes', touchedNodesInPreconMap, next);

    return callback(null);
  },
  * _processEntryComponents(callback) {
    let next = yield;
    let entryComponents = yield actionTree.emitAsync('entryComponents.get', next);

    // for each entry component, create root nodes from actions
    for (let component of entryComponents) {
      // init an expected state to process actions of entryComponent
      yield actionTree._initExpectedState(next);
      // process the entry component, adding it to the expected state
      actionTree._processEntryComponent(component, next);
      // process immediately so we find entryComponent actions, passing in null for parent
      yield actionTree.emitAsync('actionTree.processNewComponent', component.entryComponent.name, null, next);
    }

    return callback(null);
  },
  _processEntryComponent(component) {
    let entryConfig = {
      state: component.entryComponent.state,
      name: component.entryComponent.name,
      options: component.entryComponent.options,
      type: component.type
    };
    // add entryComponent
    actionTree._expectedState.createAndAddComponent(entryConfig);
    // clear out the expected states added components as we know we only added this entry component
    actionTree._expectedState.clearNewComponents();
  },
  * _processNewComponent(componentName, parentNode, callback) {
    let next = yield;
    let component = actionTree._expectedState.getComponent(componentName);
    if (component) {
      for (let actionKey in component.actions) {
        if (component.actions.hasOwnProperty(actionKey)) {
          yield actionTree.emitAsync('actionTree.processAction', component, actionKey, parentNode, next);
        }
      }
    }

    return callback(null);
  },
  * _processAction(component, actionName, parentNode, callback) {
    let next = yield;
    
    let actionIdentifier = `${component.name}.${actionName}`;
    // Check if action has not already been visited
    if (!actionTree._visitedActions.has(actionIdentifier)) {
      // add new action to disovered actions, with empty object for use with precons later
      actionTree._discoveredActions.set(actionIdentifier, []);
      // check to see if action is currently possible
      let possibilityData = yield actionTree.emitAsync(
        'possibleActions.checkIfPossible',
        component,
        actionName,
        actionTree._expectedState,
        actionTree._dataStore,
        next
      );

      // create a new action node for our new action
      let actionNode = actionTree._createNode(component, actionName, parentNode, possibilityData.applicable);
      
      if (possibilityData.applicable) {
        //add to actionStack to get performed
        actionTree._actionStack.push(actionNode);
      } else {
        // Add each prcondition to the preconMap
        for (let precondition of possibilityData.preconditions) {
          actionTree._addToPreconMap(actionNode, precondition);
        }
      }
    }
    return callback(null);
  },
  _addToPreconMap(actionNode, precondition) {
    // Find out the precondition key and value, as well as which dataset it belongs to
    let value = precondition;
    let splitPrecondition = precondition[1].split('.');
    let dataSet = splitPrecondition[0];
    let key = splitPrecondition.slice(1).join('.');

    // Get the actionNodes that meet this precondition, if any
    let nodesToMeetPrecon = actionTree._getNodesToMeetPrecondition(dataSet, key, value);

    // Add info into the unmetPreconditions
    // First check if key already exists, if not init
    if (!actionTree._unmetPreconditions.hasOwnProperty(key)) {
      actionTree._unmetPreconditions[key] = {
        values: [],
        setters: [],
        actionNodes: [],
      }
    }
    let unmetPrecon = actionTree._unmetPreconditions[key];
    // check if value exists and init if not
    let valueIndex = unmetPrecon.values.indexOf(value);
    if (valueIndex === -1) {
      unmetPrecon.values.push(value);
      unmetPrecon.setters.push([]);
      unmetPrecon.actionNodes.push([]);
      valueIndex = unmetPrecon.values.length - 1;
    }
    // Set setters, could be 0 to X nodes
    for (let setter of nodesToMeetPrecon) {
      unmetPrecon.setters[valueIndex].push(setter);
    }
    // Add node that cares about this into preconmap
    unmetPrecon.actionNodes[valueIndex].push(actionNode);

    // Add precon into discoveredActions for ease of lookup later
    actionTree._discoveredActions.get(`${actionNode.name}.${actionNode.action}`).push({
      key,
      value
    }); 
  },
  _getNodesToMeetPrecondition(dataSet, key, value) {
    let nodesToMeetPrecon = [];
    let data;
    if (dataSet === 'pageState') {
      data = actionTree._metaExpectedState;
    } else {
      data = actionTree._metaDataStore;
    }
    if (data.hasOwnProperty(key)) {
      // If Key exists, check to see if the value we need exists
      let valueIndex = -1;
      for (let i = 0; i < data[key].values.length; i++) {
        try {
          assert[value[0]](data[key].values[i], ...value.slice(2), key);
        } catch (error) {
          continue;
        }
        valueIndex = i;
        break;
      }
      // let valueIndex = data[key].values.indexOf(value);
      if (valueIndex > -1) {
        // Value exists for this, meaning there is a an action that meets this condition
        nodesToMeetPrecon = data[key].actionNodes[valueIndex];
      }
    }
    return nodesToMeetPrecon;
  },
  _createNode(component, actionName, parentNode, possible) {
    let newActionNode = {
      type: component.type,
      name: component.name,
      action: actionName,
      children: [],
      parent: parentNode
    };
    if (parentNode && possible) {
      parentNode.children.push(newActionNode);
    }
    return newActionNode;
  },
  _getActionPath(actionNode) {
    let path = [actionNode];

    let currentNode = actionNode.parent;
    while (currentNode) {
      path.push(currentNode);
      currentNode = currentNode.parent;
    }
    
    return path;
  },
  _applyActionEffects(actionNode, callback) {
    let component = actionTree._expectedState.getComponent(actionNode.name);
    let action = component.actions[actionNode.action];

    // if the action has no parameters call without
    if (!Array.isArray(action.parameters)) {
      action.effects.call(component, actionTree._expectedState, actionTree._dataStore);
    } else {
      // check if the params have NOT been set for this node
      if (!Array.isArray(actionNode.parameters)) {
        // set the actionNode's parameters so they never change
        actionNode.parameters = action.parameters.map(function(parameter) {
          return parameter.generate.call(component, actionTree._dataStore);
        });
      }
      // call with the actionNode's parameters
      action.effects.call(component, ...actionNode.parameters, actionTree._expectedState, actionTree._dataStore);
    }

    callback(null);
  },
  _initExpectedState(callback) {
    actionTree.emitAsync('dataStore.create', function(dataStore) {
      actionTree._dataStore = dataStore;
      actionTree.emitAsync('expectedState.create', actionTree._dataStore, function(expectedState) {
        actionTree._expectedState = expectedState;
        callback();
      });
    });
  },
  _processObjectDiff(stateDiff, actionNode, dataType, keyStr, touchedNodesInPreconMap) {
    for (let key in stateDiff) {
      if (stateDiff.hasOwnProperty(key)) {
        let value = stateDiff[key];
        let newKeyStr;
        if (keyStr) {
          newKeyStr = `${keyStr}.${key}`
        } else {
          newKeyStr = key;
        }
        if (value.hasOwnProperty('newState')) {
          // New things added to state no changes to old purely additions
          actionTree._processNew(value['newState'], actionNode, dataType, newKeyStr, touchedNodesInPreconMap);
        } else if (Object(value) === value) {
          // If they value is an object we need to dive deeper to look for change
          actionTree._processObjectDiff(value, actionNode, dataType, newKeyStr, touchedNodesInPreconMap);
        }
      }
    }
  },
  _processNew(newState, actionNode, dataType, keyStr, touchedNodesInPreconMap) {
    // check if changes are objects and we need to dive deeper
    let keyValues = [];
    if (Object(newState) === newState) {
      for (let key in newState) {
        let newKeyStr = `${keyStr}.${key}`
        if (newState.hasOwnProperty(key)) {
          if (Object(newState[key]) === newState[key]) {
            actionTree._processNew(newState[key], actionNode, dataType, newKeyStr, touchedNodesInPreconMap)
          } else {
            keyValues.push({key: newKeyStr, value: newState[key]});
          }
        }
      }
    } else {
      keyValues.push({key: keyStr, value: newState});
    }

    let data;
    
    if (dataType === 'es') {
      data = actionTree._metaExpectedState;
    } else {
      data = actionTree._dataStore;
    }

    for (let entry of keyValues) {
      actionTree._insertIntoDataSet(data, entry, actionNode, touchedNodesInPreconMap);
    }
  },
  _insertIntoDataSet(data, entry, actionNode, touchedNodesInPreconMap) {
    // Check if already exists in chosen meta data
    if (!data.hasOwnProperty(entry.key)) {
      data[entry.key] = {
        values: [],
        actionNodes: [],
      }
    }
    // check if value exists and init if not
    let valueIndex = data[entry.key].values.indexOf(entry.value);
    if (valueIndex === -1) {
      data[entry.key].values.push(entry.value);
      data[entry.key].actionNodes.push([]);
      valueIndex = data[entry.key].values.length - 1;
    }
    data[entry.key].actionNodes[valueIndex].push(actionNode);

    // Check if this was an unmet precondition
    if (actionTree._unmetPreconditions.hasOwnProperty(entry.key)) {
      // Get value index to see if this is the value that was needed
      // TODO: Wrap this into a function
      let preconValueIndex = -1;
      let unmetPrecon = actionTree._unmetPreconditions[entry.key];
      for (let i = 0; i < unmetPrecon.values.length; i++) {
        try {
          assert[unmetPrecon.values[i][0]](entry.value, ...unmetPrecon.values[i].slice(2), entry.key);
        } catch (error) {
          continue;
        }
        preconValueIndex = i;
        break;
      }
      if (preconValueIndex > -1) {
        // This means this was a value we cared about
        // We need to add this actionNode as a setter for this condition
        actionTree._unmetPreconditions[entry.key].setters[preconValueIndex].push(actionNode);

        // Flag the nodes that care about this setter as "touched" so we can do one check later rather than multiple now
        for (let touchedNode of actionTree._unmetPreconditions[entry.key].actionNodes[preconValueIndex]) {
          touchedNodesInPreconMap.add(touchedNode);
        }
      }
    }
  },
  * _processTouchedNodes(touchedNodes, callback) {
    let next = yield;

    for (let node of touchedNodes.values()) {
      // First check if all precons are met for this node
      let possible = true;
      let nodesToHit = [];
      let allPrecons = actionTree._discoveredActions.get(`${node.name}.${node.action}`);
      for (let i = 0; i < allPrecons.length; i++) {
        let precon = allPrecons[i];
        // for each precon, need to check if there is now a way to get the value it needs

        // TODO EVERYTHING IS BROKEN
        // TODO: Check both the es and ds
        let metaValue = actionTree._metaExpectedState[precon.key];
        let valueIndex = -1;
        for (let j = 0; j < metaValue.values.length; j++) {
          try {
            assert[precon.value[0]](metaValue.values[j], ...precon.value.slice(2), precon.key);
          } catch (error) {
            continue;
          }
          valueIndex = i;
          break;
        }
        // Check to see if the is NOT a setter for this value
        if (valueIndex > -1 && actionTree._unmetPreconditions[precon.key].setters[valueIndex].length > 0) {
          // if there are setters, push on array of all setters
          nodesToHit.push(actionTree._unmetPreconditions[precon.key].setters[valueIndex]);
        } else {
          possible = false;
          break;
        }
      }

      // If all preconditions are met for this particlar node, create the path
      if (possible) {
        let nodePath = yield actionTree.emitAsync('actionTree.constructPath', node, nodesToHit, next);
        if (nodePath.length > 0) {
          // The node we found a path to can be removed from preconmap
          actionTree._removeFromPreconMap(node);
          // Find its correct new home in the tree and add to actionStack
          actionTree._processNewPath(nodePath);
          // Add the node to the action stack with its new path
          actionTree._actionStack.push(node);
        } else {
          // NO PATH FOUND?!?!?!
          console.log('oh crap we didnt find a path');
        }
      }
    }
    return callback(null);
  },
  _processNewPath(nodePath) {
    // Travel down the path, until we find a node out of place, skip root, and dont do the final action (target action)
    for (let i = 1; i < nodePath.length - 1; i++) {
      // When we find a node that doesnt have the parent it thinks it should
      if (nodePath[i].parent !== nodePath[i - 1]) {
        // Clone that node as it needs to be reassigned as a new node in the three
        // Create new object with information we want, aka not children/parent to stop circular reference
        let oldChildren = nodePath[i].children;
        let oldParent = nodePath[i].parent;
        delete nodePath[i].children;
        delete nodePath[i].parent;
        let node = JSON.parse(JSON.stringify(nodePath[i]));
        nodePath[i].children = oldChildren;
        nodePath[i].parent = oldParent;
        // Assign its correct new parent
        node.parent = nodePath[i - 1];
        // Assign the children to empty
        node.children = [];
        // Add this node to its parents children
        node.parent.children.push(node);
        // Put this new node into the nodePath in place for use with following nodes
        nodePath[i] = node;
      }
    }

    // Assign the finalActions parent to its new parent in the path
    nodePath[nodePath.length - 1].parent = nodePath[nodePath.length - 2];
    // Add the the finalAction as child to its new parent
    nodePath[nodePath.length - 2].children.push(nodePath[nodePath.length - 1]);
  },
  _removeFromPreconMap(node) {
    // get all preconditions we can remove for this node
    let precoditions = actionTree._discoveredActions.get(`${node.name}.${node.action}`);
    for (let precondition of precoditions) {
      let unmetPrecondition = actionTree._unmetPreconditions[precondition.key];
      // get the value index
      let valueIndex = unmetPrecondition.values.indexOf(precondition.value);
      // remove from actionNodes
      let actionNodes = unmetPrecondition.actionNodes[valueIndex];
      for (let i = 0; i < actionNodes.length; i++) {
        if (actionNodes[i] === node) {
          actionNodes.splice(i, 1);
        }
      }
      // check if it is now empty, can clean up more of the preconMap
      if (actionNodes.length === 0) {
        // remove the setters and value, no longer care
        unmetPrecondition.values.splice(valueIndex, 1);
        if (unmetPrecondition.values.length === 0) {
          // if the values is now empty, delete precondition
          delete actionTree._unmetPreconditions[precondition.key]
        } else {
          // Still values, just none for these setters / actionNodes
          unmetPrecondition.actionNodes.splice(valueIndex, 1);
          unmetPrecondition.setters.splice(valueIndex, 1);
        }
      }
    }
  },
  * _constructPath(actionNode, nodesToHit, callback) {
    let next = yield;
    //Constract a path to the actionNode, making sure to hit all nodes needed to meet preconditions
    let actions = new Map();
    for (let nodeArr of nodesToHit) {
      for (let node of nodeArr) {
        actionTree._getActionsFromPath(node, actions);
      }
    }
    let rootNode = actionTree._getActionsFromPath(actionNode, actions);
    // Init the espected state and datastore;
    yield actionTree._initExpectedState(next);

    let rootComponent = yield actionTree.emitAsync('componentHandler.getComponent', rootNode.type, next);
    actionTree._processEntryComponent(rootComponent);

    let validPath = true;
    let path = [];
    while(validPath) {
      let {applicableActions, allActions} = yield actionTree.emitAsync('possibleActions.get', actionTree._expectedState, next);
      let actionToPeform;
      for (let action of actions.keys()) {
        if (applicableActions.has(action)) {
          actionToPeform = action;
          break;
        }
      }
      if (!actionToPeform) {
        validPath = false;
        // Could not find a path
        if (actions.keys.length > 0) {
          path = [];
        }
        break;
        // TODO: Check if able to backtrack (dupe full set of actions)
      }
      let node =  actions.get(actionToPeform);
      yield actionTree.emitAsync('actionTree.applyActionEffects', node, next);
      path.push(node);
      actions.delete(actionToPeform);
    }
    
    callback(null, path);
  },
  _getActionsFromPath(actionNode, actions) {
    actions.set(`${actionNode.name}.${actionNode.action}`, actionNode);

    let lastValidNode = actionNode;
    let currentNode = actionNode.parent;
    while (currentNode) {
      actions.set(`${currentNode.name}.${currentNode.action}`, currentNode);
      lastValidNode = currentNode;
      currentNode = currentNode.parent;
    }
    return lastValidNode;
  },
  _createTestPaths() {
    // Use the set root nodes, to create paths
    for (let rootNode of actionTree._rootNodes) {
      actionTree._treeTraversal(rootNode, 0);
    }
  },
  _treeTraversal(node, depth) {
    if (node.children.length) {
      // continue traversing
      depth++;
      for (let child of node.children) {
        actionTree._treeTraversal(child, depth);
      }
    } else {
      // this is a leaf node add path
      let path = [];
      for (let i = depth; i >= 0; i--) {
        path[i] = `${node.name}.${node.action}`;
        node = node.parent;      
      }
      actionTree._testPaths.push(path)
    }
  },
  * _checkForLeftoverPossibleActions(callback) {
    let next = yield;
    // Need to go through all the unmetPreconditions, and find if any were met before we knew they were unmet
    let touchedNodes = new Set();
    for (let key in actionTree._unmetPreconditions) {
      if (actionTree._unmetPreconditions.hasOwnProperty(key)) {
        let precondition = actionTree._unmetPreconditions[key];
        // For each value in this precondition, Figure out if this precondition was met in either the ES, or DS
        for (let i = 0; i < precondition.values.length; i++) {
          // If there are already setters, immediatly add to touchedNodes
          if (precondition.setters[i].length > 0) {
            for (let node of precondition.actionNodes[i]) {
              touchedNodes.add(node);
            }
          } else {
            // Check the expectedstate
            actionTree._checkForMatchingConditions('es', precondition, key, i, touchedNodes);
            // Check the datastore
            actionTree._checkForMatchingConditions('ds', precondition, key, i, touchedNodes);
          }
        }
      }
    }
    yield actionTree.emitAsync('actionTree.processTouchedNodes', touchedNodes, next);
    return callback(null);
  },
  _checkForMatchingConditions(dataSet, precondition, preconKey, preconValueIndex, touchedNodes) {
    let data;
    if (dataSet === 'es') {
      data = actionTree._metaExpectedState;
    } else {
      data = actionTree._metaDataStore;
    }
    if (data.hasOwnProperty(preconKey)) {
      let valueIndex = data[preconKey].values.indexOf(precondition.values[preconValueIndex]);
      if (valueIndex > -1) {
        // Value exists for this, check if there is a setter
        if (data[preconKey].actionNodes[valueIndex].length > 0) {
          // actionNode(s) exist, add them to the preconMap as setter(s) 
          for (let actionNode of data[preconKey].actionNodes[valueIndex]) {
            // Add each actionNode to the corresponding precon
            precondition.setters[preconValueIndex].push(actionNode);
          }
          for (let touchedNode of precondition.actionNodes[preconValueIndex]) {
            touchedNodes.add(touchedNode);
          }
        }
      }
    }
  }
};

Emitter.mixIn(actionTree, plannerEventDispatch);

actionTree.on('actionTree.applyActionEffects', actionTree._applyActionEffects);
actionTree.runOn('actionTree.performAction', actionTree._performAction);
actionTree.runOn('actionTree.performActions', actionTree._performActions);
actionTree.runOn('actionTree.processEntryComponents', actionTree._processEntryComponents);
actionTree.runOn('actionTree.processNewComponent', actionTree._processNewComponent);
actionTree.runOn('actionTree.processAction', actionTree._processAction);
actionTree.runOn('actionTree.processTouchedNodes', actionTree._processTouchedNodes);
actionTree.runOn('actionTree.constructPath', actionTree._constructPath);
actionTree.runOn('actionTree.checkForLeftoverPossibleActions', actionTree._checkForLeftoverPossibleActions);