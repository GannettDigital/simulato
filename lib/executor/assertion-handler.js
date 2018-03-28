'use strict';

const EventEmitter = require('events').EventEmitter;

let assertionHandler;

module.exports = assertionHandler = {
  _expectedState: null,
  _pageState: {}, // should break when not an empty object
  _assertions: null,
  _timeOut: null,
  _callback: null,
  _action: null,
  _actionConfig: null,
  assertPageState(expectedState, action, actionConfig, dataStore, actionParameters, milliseconds, callback) {
    assertionHandler._expectedState = expectedState;
    assertionHandler._timeOut = Date.now() + milliseconds;
    assertionHandler._callback = callback;
    assertionHandler._action = action;
    assertionHandler._actionConfig = actionConfig;
    assertionHandler._dataStore = dataStore;
    assertionHandler._actionParameters = actionParameters;

    assertionHandler._cloneAndGetPreconditions();

    assertionHandler.emit('assertionHandler.assertPageStateConfigured');
  },
  _getAndCheckPageStateContinually(error) {
    if (Date.now() >= assertionHandler._timeOut) {
      if (error.name === 'AssertionError') {
        throw new MbttError.ACTION.PRECONDITION_ASSERTION_FAILURE(error.message);
      } else {
        throw new MbttError.ACTION.PRECONDITION_CHECK_FAILED(error.name);
      }
    }
    assertionHandler.emit('assertionHandler.pageStateCheckReady');
  },
  _getAndCheckPageState() {
    assertionHandler.emit(
      'assertionHandler.getPageState',
      assertionHandler._expectedState.getComponentsAsMap(),
      function(error, state) {
        if (error) {
          return assertionHandler.emit('assertionHandler.pageStateErrorReceived', error);
        }
        assertionHandler._pageState = state;
        let preconditions = assertionHandler._cloneAndGetPreconditions();
        assertionHandler.emit(
          'assertionHandler.runAssertions',
          assertionHandler._pageState,
          preconditions,
          function(error) {
            if (error) {
              return assertionHandler.emit('assertionHandler.assertionsFailed', error);
            } else {
              let component = assertionHandler._expectedState.getComponent(assertionHandler._actionConfig.instanceName);

              if (assertionHandler._actionParameters) {
                component.actions[assertionHandler._actionConfig.actionName].preconditions.call(component, ...assertionHandler._actionParameters, assertionHandler._expectedState);
              } else {
                component.actions[assertionHandler._actionConfig.actionName].preconditions.call(component, assertionHandler._expectedState);
              }
              return assertionHandler._callback();
            }
          }
        );
      }
    );
  },
  assertExpectedPageState(expectedState, action, actionConfig, dataStore, actionParameters, milliseconds, callback) {
    assertionHandler._expectedState = expectedState;
    assertionHandler._timeOut = Date.now() + milliseconds;
    assertionHandler._callback = callback;
    assertionHandler._action = action;
    assertionHandler._actionConfig = actionConfig;
    assertionHandler._dataStore = dataStore;
    assertionHandler._actionParameters = actionParameters;

    assertionHandler._cloneAndApplyEffects();
    // let clonedState = assertionHandler._cloneAndApplyEffects();
    // assertionHandler._components = clonedState.getComponentsAsMap();

    assertionHandler.emit('assertionHandler.assertExpectedPageStateConfigured');
  },
  _getAndCheckExpectedPageStateContinually() {
    if (Date.now() >= assertionHandler._timeOut) {
      assertionHandler.emit('assertionHandler.stateCheckTimedOut',
        assertionHandler._pageState, assertionHandler._expectedState._state);
      throw new MbttError.ACTION.EXPECTED_STATE_ERROR('Page state did not equal expected state');
    }

    assertionHandler.emit('assertionHandler.expectedPageStateCheckReady');
  },
  _getAndCheckExpectedPageState() {

    assertionHandler.emit('assertionHandler.getPageState',
      assertionHandler._components,
      function(error, state) {
        if (error) {
          return assertionHandler.emit('assertionHandler.expectedPageStateErrorReceived');
        }
        assertionHandler._pageState = state;
        assertionHandler._clonedExpectedState = assertionHandler._cloneAndApplyEffects();

        assertionHandler.emit('assertionHandler.runDeepEqual',
          assertionHandler._pageState,
          assertionHandler._clonedExpectedState.getState(),
          function(error) {
            if (error) {
              return assertionHandler.emit('assertionHandler.deepEqualFailed');
            } else {
              assertionHandler._expectedState._pageState = assertionHandler._pageState;
              let component = assertionHandler._expectedState.getComponent(assertionHandler._actionConfig.instanceName);
              // try catch me
              if (assertionHandler._actionParameters) {
                component.actions[assertionHandler._actionConfig.actionName].effects.call(component, ...assertionHandler._actionParameters, assertionHandler._expectedState);
              } else {
                component.actions[assertionHandler._actionConfig.actionName].effects.call(component, assertionHandler._expectedState);
              }
              return assertionHandler._callback();
            }
          }
        );
      }
    );
  },
  _cloneAndApplyEffects() {
    let clonedDataStore = assertionHandler._dataStore.clone();
    let clonedExpectedState;
    assertionHandler._expectedState.clone(clonedDataStore, function(myExpectedState) {
      clonedExpectedState = myExpectedState;
    });

    // for (let [instanceName, component] of clonedExpectedState.getComponentsAsMap()) {
    //   component._currentWorkingModel = assertionHandler._pageState[instanceName];
    // }

    clonedExpectedState._pageState = assertionHandler._pageState;

    let component = clonedExpectedState.getComponent(assertionHandler._actionConfig.instanceName);
    // try catch me
    if (assertionHandler._actionParameters) {
      component.actions[assertionHandler._actionConfig.actionName].effects.call(component, ...assertionHandler._actionParameters, clonedExpectedState);
    } else {
      component.actions[assertionHandler._actionConfig.actionName].effects.call(component, clonedExpectedState);
    }

    assertionHandler._components = clonedExpectedState.getComponentsAsMap();

    return clonedExpectedState;
  },
  _cloneAndGetPreconditions() {
    let clonedDataStore = assertionHandler._dataStore.clone();
    let clonedExpectedState;
    assertionHandler._expectedState.clone(clonedDataStore, function(myExpectedState) {
      clonedExpectedState = myExpectedState;
    });

    clonedExpectedState._pageState = assertionHandler._pageState;

    let component = clonedExpectedState.getComponent(assertionHandler._actionConfig.instanceName);
    // try catch me
    let preconditions;
    if (assertionHandler._actionParameters) {
      preconditions = component.actions[assertionHandler._actionConfig.actionName].preconditions.call(component, ...assertionHandler._actionParameters, clonedExpectedState);
    } else {
      preconditions = component.actions[assertionHandler._actionConfig.actionName].preconditions.call(component, clonedExpectedState);
    }

    assertionHandler._components = clonedExpectedState.getComponentsAsMap();

    return preconditions;
  },
};

Object.setPrototypeOf(assertionHandler, new EventEmitter());

assertionHandler.on('assertionHandler.assertPageStateConfigured',
  assertionHandler._getAndCheckPageStateContinually);
assertionHandler.on('assertionHandler.assertExpectedPageStateConfigured',
  assertionHandler._getAndCheckExpectedPageStateContinually);
assertionHandler.on('assertionHandler.pageStateCheckReady',
  assertionHandler._getAndCheckPageState);
assertionHandler.on('assertionHandler.pageStateErrorReceived',
  assertionHandler._getAndCheckPageStateContinually);
assertionHandler.on('assertionHandler.assertionsFailed',
  assertionHandler._getAndCheckPageStateContinually);
assertionHandler.on('assertionHandler.expectedPageStateCheckReady',
  assertionHandler._getAndCheckExpectedPageState);
assertionHandler.on('assertionHandler.expectedPageStateErrorReceived',
  assertionHandler._getAndCheckExpectedPageStateContinually);
assertionHandler.on('assertionHandler.deepEqualFailed',
  assertionHandler._getAndCheckExpectedPageStateContinually);
