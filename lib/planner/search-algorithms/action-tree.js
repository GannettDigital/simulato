'use strict';

const Emitter = require('../../util/emitter.js');
const configHandler = require('../../util/config/config-handler.js');
const plannerEventDispatch = require('../planner-event-dispatch/planner-event-dispatch.js');
const assert = require('chai').assert;

let actionTree;

module.exports = actionTree = {
  _id: 1,
  _visitedIds: new Set(),
  _uniqueWhilePrinting: new Set(),
  _allNodes: new Map(),
  _foundChildren: new Map(),
  _rootNodes: new Map(),
  _discoveredActions: new Map(),
  _visitedActions: new Set(),
  _actionStack: [],
  _expectedState: null,
  _metaState: {},
  _dataStore: null,
  _predeterminedGoalAction: null,
  _unmetPreconditions: {},
  _testPaths: [],
  _stashedStates: [],
  _discoveredActionsSet: new Set(),
  * createPlans(callback) {
    let next = yield;
    
    // TODO: HANDLE SPECIFIC ACTION AS GOAL TO END PLANNING EARLY
    if (configHandler.get('actionToCover')) {
      actionTree._predeterminedGoalAction = configHandler.get('actionToCover');
    }
    
    // Create initial actionStack from entryComponents
    yield actionTree.emitAsync('actionTree.processEntryComponents', next);
    
    // Save all current actionNodes into their respective _rootNode as these are all entry actions
    for (let rootActionId of actionTree._actionStack) {
      let rootAction = actionTree._allNodes.get(rootActionId);
      let rootNode = actionTree._rootNodes.get(rootAction.name);
      rootNode.actionNodes.push(rootActionId);
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

    // TODO: Handle to check if fail if unmetPreconditions have keys still
    // Currently just passing that as unsolved actions, unless we want to throw an error

    // Create Test Paths from Root Nodes
    actionTree._createTestPaths();

    return callback(null, actionTree._testPaths, actionTree._discoveredActionsSet);
  },
  * _performActions(callback) {
    let next = yield;
    // While there are still actions on the stack
    while(actionTree._actionStack.length) {
      // Grab the next action off the stack and do it
      let nextAction = actionTree._actionStack.pop();
      if (!actionTree._visitedIds.has(nextAction)) {
        actionTree._visitedIds.add(nextAction);
        yield actionTree.emitAsync('actionTree.performAction', nextAction, next);
      }
    }
    // Stack is now empty
    return callback(null);
  },
  * _performAction(actionNode, callback) {
    let next = yield;
    // Create path back to the root
    let path = actionTree._getActionPath(actionTree._allNodes.get(actionNode));
    
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
    if (configHandler.get('debug') === true) {
      console.log(`Found a path to new action: ${path[0].name}.${path[0].action}`);
    }

    // Check if pops happened for to do special state compares 
    if (actionTree._expectedState._popCount) {
      for (let i = 0; i < actionTree._expectedState._popCount; i++) {
        oldState = actionTree._expectedState._planningStashedStates.pop();
      }
    }

    let touchedNodesInPreconMap = new Set();
    // Get difference in states
    let stateDiff = yield actionTree.emitAsync('stateDifference.createDiff', oldState, actionTree._expectedState.getState(), next);
    // Process new things state difference
    actionTree._processObjectDiff(stateDiff, path[0], 'pageState', touchedNodesInPreconMap);
    // Get difference in datastore
    let dataDiff = yield actionTree.emitAsync('stateDifference.createDiff', oldDatastore, actionTree._dataStore.retrieveAll(), next);
    // Process new dataStore difference
    actionTree._processObjectDiff(dataDiff, path[0], 'dataStore', touchedNodesInPreconMap);

    // Process all new components
    for (let componentName of actionTree._expectedState.getNewComponents()) {
      // Send in the last processed node as the parent node
      yield actionTree.emitAsync('actionTree.processNewComponent', componentName, path[0], next);
    }

    // For all the nodes touched be this action inside the preconMap, check if they can now be done
    // yield actionTree.emitAsync('actionTree.processTouchedNodes', touchedNodesInPreconMap, next);

    return callback(null);
  },
  * _processEntryComponents(callback) {
    let next = yield;
    let entryComponents = yield actionTree.emitAsync('entryComponents.get', next);

    // for each entry component, create root nodes from actions
    for (let component of entryComponents) {
      // save all entryComponent components for use with plan recreation
      actionTree._rootNodes.set(component.entryComponent.name, {component, actionNodes: []});
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
      // check to see if action is currently possible
      let possibilityData = yield actionTree.emitAsync(
        'possibleActions.checkIfPossible',
        component,
        actionName,
        actionTree._expectedState,
        actionTree._dataStore,
        next
      );
      
      // Add each precondition to disovered actions
      let actionNodePreconditions = [];
      if (possibilityData.preconditions) {
        for (let precondition of possibilityData.preconditions) {    
          actionNodePreconditions.push({
            key: precondition[1],
            value: precondition
          }); 
        }
      } 
      actionTree._discoveredActions.set(actionIdentifier, {preconditions: actionNodePreconditions, nodes: []});
      actionTree._discoveredActionsSet.add(actionIdentifier);

      // create a new action node for our new action
      let actionNode = actionTree._createNode(component, actionName, parentNode, possibilityData.applicable);
      
      if (possibilityData.applicable) {
        //add to actionStack to get performed
        actionTree._actionStack.push(actionNode.id);
      } else {
        // Add each prcondition to the preconMap
        for (let i = 0; i < actionNodePreconditions.length; i++) {
          actionTree._addToPreconMap(actionNode, actionNodePreconditions[i]);
        }
      }
    }
    return callback(null);
  },
  _addToPreconMap(actionNode, precondition) {
    // Find out the precondition key and value, as well as which dataset it belongs to
    // Get the actionNodes that meet this precondition, if any
    if (precondition.key === 'dataStore' && precondition.value[0] === 'property') {
      precondition.key = `dataStore.${precondition.value[2]}`;
    }


    let nodesToMeetPrecon = actionTree._getNodesToMeetPrecondition(precondition.key, precondition.value);

    // Add info into the unmetPreconditions
    // First check if key already exists, if not init
    if (!actionTree._unmetPreconditions.hasOwnProperty(precondition.key)) {
      actionTree._unmetPreconditions[precondition.key] = {
        values: [],
        setters: [],
        actionNodes: [],
      }
    }
    let unmetPrecon = actionTree._unmetPreconditions[precondition.key];
    // check if value exists and init if not
    let valueIndex = actionTree._findValueIndex(unmetPrecon.values, precondition.value);
    if (valueIndex === -1) {
      unmetPrecon.values.push(precondition.value);
      unmetPrecon.setters.push([]);
      unmetPrecon.actionNodes.push([]);
      valueIndex = unmetPrecon.values.length - 1;
    }
    // Set setters, could be 0 to X nodes
    for (let setter of nodesToMeetPrecon) {
      unmetPrecon.setters[valueIndex].push(setter);
    }
    // Add node that cares about this into preconmap
    unmetPrecon.actionNodes[valueIndex].push(actionNode.actionIdentifier);
  },
  _findValueIndex(arr, value) {
    // For every value in the array
    let valueIndex = -1;
    for (let i = 0; i < arr.length; i++) {
      // If they are the same length, it could potentially be a match
      if (arr[i].length === value.length) {
        // Match each element of the value to the element in the array
        let match = true;
        for (let j = 0; j < value.length; j++) {
          if (arr[i][j] !== value[j]) {
            // Not a match, shut inner loop down
            match = false;
            break;
          }
        }
        // If match is still true, we found a match
        if (match) {
          // Set value index to the mathing element in the passed in arr
          valueIndex = i;
          break;
        }
      } 
    }
    return valueIndex;
  },
  _getNodesToMeetPrecondition(key, value) {
    let nodesToMeetPrecon = [];
    if (actionTree._metaState.hasOwnProperty(key)) {
      // If Key exists, check to see if the value we need exists
      let valueIndex = -1;
      for (let i = 0; i < actionTree._metaState[key].values.length; i++) {
        try {
          assert[value[0]](actionTree._metaState[key].values[i], ...value.slice(2), key);
        } catch (error) {
          continue;
        }
        valueIndex = i;
        break;
      }
      if (valueIndex > -1) {
        // Value exists for this, meaning there is a an action that meets this condition
        nodesToMeetPrecon = actionTree._metaState[key].actionNodes[valueIndex];
      }
    }
    return nodesToMeetPrecon;
  },
  _createNode(component, actionName, parentNode, possible) {
    let newActionNode = {
      id: actionTree._id++,
      type: component.type,
      name: component.name,
      action: actionName,
      children: [],
      parent: parentNode,
      actionIdentifier: `${component.name}.${actionName}`
    };

    if (parentNode && possible) {
      parentNode.children.push(newActionNode);
    }

    actionTree._allNodes.set(newActionNode.id, newActionNode);
    actionTree._discoveredActions.get(`${newActionNode.name}.${newActionNode.action}`).nodes.push(newActionNode.id);
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

    // Need to run preconditions, as they can set things in the datastore
    if (action.preconditions !== undefined) {
      if (!Array.isArray(action.parameters)) {
        action.preconditions.call(component, actionTree._dataStore);
      } else {
        // check if the params have NOT been set for this node
        if (!Array.isArray(actionNode.parameters)) {
          // set the actionNode's parameters so they never change
          actionNode.parameters = action.parameters.map(function(parameter) {
            return parameter.generate.call(component, actionTree._dataStore);
          });
        }
        action.preconditions.call(component, ...actionNode.parameters, actionTree._dataStore);
      }
    }

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
  _processObjectDiff(stateDiff, actionNode, keyStr, touchedNodesInPreconMap) {
    for (let key in stateDiff) {
      if (stateDiff.hasOwnProperty(key)) {
        let value = stateDiff[key];
        let newKeyStr = `${keyStr}.${key}`;
        if (value.hasOwnProperty('newState')) {
          // New things added to state no changes to old purely additions
          actionTree._processNew(value['newState'], actionNode, newKeyStr, touchedNodesInPreconMap);
        } else {
          // else this is not the newState object dive deeper
          actionTree._processObjectDiff(value, actionNode, newKeyStr, touchedNodesInPreconMap);
        }
      }
    }
  },
  _processNew(newState, actionNode, keyStr, touchedNodesInPreconMap) {
    // check if changes are objects and we need to dive deeper
    let keyValues = [];
    // If newState is an object
    if (Object(newState) === newState) {
      for (let key in newState) {
        if (newState.hasOwnProperty(key)) {
          let newKeyStr = `${keyStr}.${key}`;
          // if there is another inner object, go handle it
          if (Object(newState[key]) === newState[key]) {
            actionTree._processNew(newState[key], actionNode, newKeyStr, touchedNodesInPreconMap)
          } else {
            // else push on the found value
            keyValues.push({key: newKeyStr, value: newState[key]});
          }
        }
      }
    } else {
      // Else already at the new value
      keyValues.push({key: keyStr, value: newState});
    }


    for (let entry of keyValues) {
      actionTree._insertIntoDataSet(entry, actionNode, touchedNodesInPreconMap);
    }
  },
  _insertIntoDataSet(entry, actionNode, touchedNodesInPreconMap) {
    // Check if already exists in chosen meta data
    if (!actionTree._metaState.hasOwnProperty(entry.key)) {
      actionTree._metaState[entry.key] = {
        values: [],
        actionNodes: [],
      }
    }
    // check if value exists and init if not
    let valueIndex = actionTree._metaState[entry.key].values.indexOf(entry.value);
    if (valueIndex === -1) {
      actionTree._metaState[entry.key].values.push(entry.value);
      actionTree._metaState[entry.key].actionNodes.push([]);
      valueIndex = actionTree._metaState[entry.key].values.length - 1;
    }
    actionTree._metaState[entry.key].actionNodes[valueIndex].push(actionNode.actionIdentifier);

    // Check if this was an unmet precondition
    if (actionTree._unmetPreconditions.hasOwnProperty(entry.key)) {
      // Get value index to see if this is the value that was needed
      let preconValueIndex = -1;
      let specialPropertyCase = false;
      let unmetPrecon = actionTree._unmetPreconditions[entry.key];
      for (let i = 0; i < unmetPrecon.values.length; i++) {
        if (unmetPrecon.values[i][0] === 'property') {
          specialPropertyCase = true
        } else {
          try {
            assert[unmetPrecon.values[i][0]](entry.value, ...unmetPrecon.values[i].slice(2), entry.key);
          } catch (error) {
            continue;
          }
        }
        preconValueIndex = i;
        break;
      }
      if (preconValueIndex > -1 || specialPropertyCase) {
        // This means this was a value we cared about
        // We need to add this actionNode as a setter for this condition
        actionTree._unmetPreconditions[entry.key].setters[preconValueIndex].push(actionNode.actionIdentifier);

        // Flag the nodes that care about this setter as "touched" so we can do one check later rather than multiple now
        for (let touchedNode of actionTree._unmetPreconditions[entry.key].actionNodes[preconValueIndex]) {
          if (!actionTree._visitedActions.has(touchedNode)) {
            touchedNodesInPreconMap.add(touchedNode);
          }
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
      let valueIndexs = [];
      let allPrecons = actionTree._discoveredActions.get(node).preconditions;
      for (let i = 0; i < allPrecons.length; i++) {
        let precon = allPrecons[i];
        // Check if the precons here, are in the unmetPreconMap, and that there are setters for the matching preconkey
        let valueIndex = -1
        if (actionTree._unmetPreconditions.hasOwnProperty(precon.key)) {
          let unmetPrecon = actionTree._unmetPreconditions[precon.key];
          for (let j = 0; j < unmetPrecon.values.length; j++) {
            let matchingPrecon = true;
            try {
              assert.deepEqual(precon.value, unmetPrecon.values[j], true)
            } catch (err) {
              matchingPrecon = false
            }
            if (matchingPrecon) {
              valueIndex = j;
              break;
            }
          }
        } else {
          possible = false;
          break;
        }
        
        // Check to see if the there is a setter for a valid valueIndex
        if (valueIndex > -1 && actionTree._unmetPreconditions[precon.key].setters[valueIndex].length > 0) {
          nodesToHit.push(actionTree._unmetPreconditions[precon.key].setters[valueIndex]);
          valueIndexs.push(valueIndex);
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
          actionTree._removeFromPreconMap(node, allPrecons, valueIndexs);
            // Find its correct new home in the tree and add to actionStack
            actionTree._processNewPath(nodePath);
            // Add the node to the action stack with its new path
            actionTree._actionStack.push(nodePath[nodePath.length - 1].id);
        }
      }
    }
    return callback(null);
  },
  _processNewPath(nodePath) {
    let i = 0;
    for (i; i < nodePath.length; i++) {
      if (nodePath[i].parent) {
        let flag = true;
        for (let child of nodePath[i - 1].children) {
          if (child.id === nodePath[i].id) {
            flag = false;
            break;
          }
        }
        if (flag) {
          break;
        }
      }
    }

    // TODO: Once nodes start getting cloned below, they are making unique actions in a unique state that they were not previously doing
    // Do we want to take account for this, check if it effects the state in a new way? and add to metaES and unmetPrecons
    // Not sure if its wanted, as this may lead to false positives that mutiple actions can solve one precondition.

    for (i; i < nodePath.length - 1; i++) {
      let node = actionTree._createNode(nodePath[i], nodePath[i].action, nodePath[i - 1], true);
      nodePath[i] = node;
    }

    nodePath[nodePath.length - 1].parent = nodePath[nodePath.length - 2];
    nodePath[nodePath.length - 2].children.push(nodePath[nodePath.length - 1]);

    // // Travel down the path, until we find a node out of place, skip root, and dont do the final action (target action)
    // for (let i = 1; i < nodePath.length - 1; i++) {
    //   // When we find a node that doesnt have the parent it thinks it should
    //   if (nodePath[i].parent.id !== nodePath[i -1].id) {
    //   // if (nodePath[i].parent !== nodePath[i - 1]) {
    //     // Clone that node as it needs to be reassigned as a new node in the three
    //     let node = actionTree._createNode(nodePath[i], nodePath[i].action, nodePath[i - 1], true);
    //     // Put this new node into the nodePath in place for use with following nodes
    //     nodePath[i] = node;
    //   }
    // }

    // // Assign the finalActions parent to its new parent in the path
    // nodePath[nodePath.length - 1].parent = nodePath[nodePath.length - 2];
    // // Add the the finalAction as child to its new parent
    // nodePath[nodePath.length - 2].children.push(nodePath[nodePath.length - 1]);

  },
  _removeFromPreconMap(node, preconditions, valueIndexs) {
    // get all preconditions we can remove for this node
    for (let i = 0; i < preconditions.length; i++) {
      let unmetPrecondition = actionTree._unmetPreconditions[preconditions[i].key];
      // remove from actionNodes
      let actionNodes = unmetPrecondition.actionNodes[valueIndexs[i]];
      for (let i = 0; i < actionNodes.length; i++) {
        if (actionNodes[i] === node) {
          actionNodes.splice(i, 1);
        }
      }
      // check if it is now empty, can clean up more of the preconMap
      if (actionNodes.length === 0) {
        // remove the setters and value, no longer care
        unmetPrecondition.values.splice(valueIndexs[i], 1);
        if (unmetPrecondition.values.length === 0) {
          // if the values is now empty, delete precondition
          delete actionTree._unmetPreconditions[preconditions[i].key]
        } else {
          // Still values, just none for these setters / actionNodes
          unmetPrecondition.actionNodes.splice(valueIndexs[i], 1);
          unmetPrecondition.setters.splice(valueIndexs[i], 1);
        }
      }
    }
  },
  * _constructPath(actionNode, nodesToHit, callback) {
    if (configHandler.get('debug') === true) {
      console.log(`Constructing path to ${actionNode}`);
    }
    let start = process.hrtime();
    let next = yield;
    //Constract a path to the actionNode, making sure to hit all nodes needed to meet preconditions
    let actions = new Map();
    for (let nodeIdentifiers of nodesToHit) {
      for (let nodeIdentifier of nodeIdentifiers) {
        let nodes = actionTree._discoveredActions.get(nodeIdentifier).nodes;
        for (let node of nodes) {
          actionTree._getActionsFromPath(actionTree._allNodes.get(node), actions);
        }
      } 
    }
    let rootNode;
    let nodes = actionTree._discoveredActions.get(actionNode).nodes;
    for (let node of nodes) {
      rootNode = actionTree._getActionsFromPath(actionTree._allNodes.get(node), actions);
    }

    // Create the all possible paths until we find our actionNode
    yield actionTree._initExpectedState(next);

    let rootComponent = yield actionTree.emitAsync('componentHandler.getComponent', rootNode.type, next);
    actionTree._processEntryComponent(rootComponent);

    let {applicableActions, allActions} = yield actionTree.emitAsync('possibleActions.get', actionTree._expectedState, next);

    let tree = [];
    let actionNotFound = true;    

    // Get "root" nodes of tree
    let pathsActions = new Map(actions);
    for (let possibleAction of applicableActions.values()) {
      for (let action of actions.values()) {
        if (possibleAction === action.actionIdentifier) {
          let actionsLeft = new Map(pathsActions).delete(action.id);
          tree.push({
            parent: null,
            action,
            depth: 0,
            actionsLeft,
          });
          if (action.actionIdentifier === actionNode) {
            actionNotFound = false;
          }
        }
      }
    }

    let treeStartIndex = 0;
    let actionFoundIndex;
    let pathValid = true;
    while (actionNotFound && pathValid) {
      //  TODO: IF time goes over a limit, such as like 5 seconds, fallback to a DFS less efficient algo or maybe based on action count?
      let target = tree.length;
      let countOfNodesChecked = 0;
      for (let i = treeStartIndex; i < target; i++) {
        countOfNodesChecked++;
        // First init the state
        yield actionTree._initExpectedState(next);

        let rootComponent = yield actionTree.emitAsync('componentHandler.getComponent', rootNode.type, next);
        actionTree._processEntryComponent(rootComponent);

        // Then apply actions up the nodes path while keeping list of actions performed in list
        let pathsActions = new Map(actions);
        let node = tree[i];

        let path = actionTree._getActionPath(node);

        // Apply Effects on all all nodes down the path
        for (let i = path.length - 1; i >= 0; i--) {
          yield actionTree.emitAsync('actionTree.applyActionEffects', path[i].action, next);
          pathsActions.delete(path[i].action.id);
        }

        // Get all possible actions at this point in time
        let {applicableActions, allActions} = yield actionTree.emitAsync('possibleActions.get', actionTree._expectedState, next);
        
        //Add all possible actions we care about as children
        for (let possibleAction of applicableActions.values()) {
          for (let action of pathsActions.values()) {
            if (possibleAction === action.actionIdentifier) {
              let actionsLeft = new Map(pathsActions);
              actionsLeft.delete(action.id);
              tree.push({
                parent: tree[i],
                action,
                actionsLeft,
                depth: tree[i].depth + 1
              });
              if (action.actionIdentifier === actionNode) {
                // We found the action
                actionNotFound = false;
                actionFoundIndex = tree.length - 1;
              }
            }
          }
        }
      }
      if (countOfNodesChecked == 0) {
        // Could not find path with the nodes to hit provided. Still might be possible with other nodes to meet (mutiple actions can affect the same precondition)
        pathValid = false;
        // TODO: Figure out what precondition was not met, and the action we thought were meet it. This action does not need to be a setter for our particular actionNode
        // however unmetPrecons is not set up to handle that additional information, but will make future path contrusctions faster if it did know to not even try
      }
      treeStartIndex = treeStartIndex + countOfNodesChecked;
    }

    let path = [];
    if (pathValid) {
      // Element at tree[actionFoundIndex] is our target, get its path
      path = [];
      let node = tree[actionFoundIndex];
      for (let i = tree[actionFoundIndex].depth; i >= 0; i--) {
        path[node.depth] = node.action;
        node = node.parent;
      }
      if (configHandler.get('debug') === true) {
        console.log(`${actionNode} took ${process.hrtime(start)}`);
      }
    } else {
      if (configHandler.get('debug') === true) {
        console.log(`Could not find path for ${actionNode} in ${process.hrtime(start)}, potentially still solvable`);
      }
    }

    callback(null, path);
  },
  _getActionsFromPath(actionNode, actions) {
    actions.set(actionNode.id, actionNode);

    let lastValidNode = actionNode;
    let currentNode = actionNode.parent;
    while (currentNode) {
      actions.set(currentNode.id, currentNode);
      lastValidNode = currentNode;
      currentNode = currentNode.parent;
    }
    return lastValidNode;
  },
  _createTestPaths() {
    // Use the set root nodes, to create paths
    for (let rootNode of actionTree._rootNodes.values()) {
      for (let rootActionId of rootNode.actionNodes) {
        let rootAction = actionTree._allNodes.get(rootActionId);
        actionTree._treeTraversal(rootAction, 0);
      }
    }
  },
  _treeTraversal(node, depth) {
    if (node.children.length > 0) {
      // continue traversing
      depth++;
      for (let child of node.children) {
        actionTree._treeTraversal(child, depth);
      }
    } else {
      actionTree._createFinalPath(node, depth)
    }
  },
  _createFinalPath(node, depth) {
    // this is a leaf node add path
    let path = [];
    for (let i = depth; i >= 0; i--) {
      let action = {
        name: `${node.name}.${node.action}`
      };
      if (node.parameters) {
        action.options = {
          parameters: node.parameters,
        }
      }
      //Leave a space at the beggning for the entry stuff, so depth + 1
      path[i + 1] = action;
      if (i === 0) {
        // get entry component to get the state
        let rootComponent = actionTree._rootNodes.get(node.name).component;
        path[0] = {
          type: rootComponent.type,
          name: rootComponent.entryComponent.name,
          state: rootComponent.entryComponent.state
        }
      }
      node = node.parent;                
    }
    actionTree._testPaths.push(path)
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
            // Look if it was met in the metaState for each particular value that unmetprecondition has
            actionTree._checkForMatchingConditions(precondition.values[i], i, key, touchedNodes, precondition);
          }
        }
      }
    }
    yield actionTree.emitAsync('actionTree.processTouchedNodes', touchedNodes, next);
    return callback(null);
  },
  _checkForMatchingConditions(precondition, preconValueIndex, preconKey, touchedNodes, fullUmetPrecondition) {
    // Get the value we are checking
    if (precondition[0] === 'property') {
      if (actionTree._metaState.hasOwnProperty(preconKey)) {
        for (let nodeArr of actionTree._metaState[preconKey].actionNodes) {
          for (let node of nodeArr) {
            touchedNodes.add(node);
            actionTree._unmetPreconditions[preconKey].setters[preconValueIndex].push(actionNode.actionIdentifier);
          }
        }
      }
    } else {
      if (actionTree._metaState.hasOwnProperty(preconKey)) {
        let valueIndex = -1;
        for (let i = 0; i < actionTree._metaState[preconKey].values.length; i++) {
          try {
            assert[precondition[0]](actionTree._metaState[preconKey].values[i], ...precondition.slice(2), preconKey);
          } catch (error) {
            continue;
          }
          valueIndex = i;
          break;
        }
        if (valueIndex > -1) {
          // Value exists for this, check if there is a setter
          if (actionTree._metaState[preconKey].actionNodes[valueIndex].length > 0) {
            // actionNode(s) exist, add them to the preconMap as setter(s)
  
            // First we need to get the appropriate preconMap enrty          
            for (let actionNode of actionTree._metaState[preconKey].actionNodes[valueIndex]) {
              // Add each actionNode to the corresponding actionTree._unmetPrecondition
              actionTree._unmetPreconditions[preconKey].setters[preconValueIndex].push(actionNode.actionIdentifier);
            }
            for (let touchedNode of precondition.actionNodes[preconValueIndex]) {
              touchedNodes.add(touchedNode);
            }
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