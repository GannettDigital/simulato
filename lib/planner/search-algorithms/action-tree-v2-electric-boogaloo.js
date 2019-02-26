'use strict';

const Emitter = require('../../util/emitter.js');
const configHandler = require('../../util/config/config-handler.js');
const plannerEventDispatch = require('../planner-event-dispatch/planner-event-dispatch.js');
const assert = require('chai').assert;
const uuid = require('uuid');

let actionTree;

module.exports = actionTree = {
  * createPlans(callback) {
    let next = yield;
    // Hnadle getting entry components
    yield actionTree.emitAsync('actionTree.processEntryComponents', next);

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
      // save all entryComponent components for use with plan recreation
      actionTree._rootNodes.set(component.entryComponent.name, {component, actions: []});
    }

    return callback(null);
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
};

Emitter.mixIn(actionTree, plannerEventDispatch);