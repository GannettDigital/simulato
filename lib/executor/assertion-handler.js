'use strict';

const EventEmitter = require('events').EventEmitter;

let assertionHandler;

module.exports = assertionHandler = {
  _expectedState: null,
  _pageState: {},
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

    assertionHandler.emit('assertionHandler.cloneAndGetPreconditions', function() {
      assertionHandler.emit('assertionHandler.assertPageStateConfigured');
    });
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
        assertionHandler.emit('assertionHandler.cloneAndGetPreconditions', function(preconditions) {
          assertionHandler.emit(
            'assertionHandler.runAssertions',
            assertionHandler._pageState,
            preconditions,
            function(error) {
              if (error) {
                return assertionHandler.emit('assertionHandler.assertionsFailed', error);
              } else {
                return assertionHandler._callback();
              }
            }
          );
        });
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

    assertionHandler.emit('assertionHandler.cloneAndApplyEffects');
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

        assertionHandler.emit('assertionHandler.cloneAndApplyEffects');

        assertionHandler.emit('assertionHandler.runDeepEqual',
          assertionHandler._pageState,
          assertionHandler._clonedExpectedState.getState(),
          function(error) {
            if (error) {
              return assertionHandler.emit('assertionHandler.deepEqualFailed');
            } else {
              assertionHandler._expectedState._pageState = assertionHandler._pageState;
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

    clonedExpectedState._pageState = assertionHandler._pageState;

    let component = clonedExpectedState.getComponent(assertionHandler._actionConfig.name);

    try {
      if (assertionHandler._actionParameters) {
        component.actions[assertionHandler._actionConfig.actionName].effects.call(
          component,
          ...assertionHandler._actionParameters,
          clonedExpectedState,
          clonedDataStore
        );
      } else {
        component.actions[assertionHandler._actionConfig.actionName].effects.call(
          component,
          clonedExpectedState,
          clonedDataStore
        );
      }
    } catch (error) {
      error.message = `The error '${error.message}' was thrown while ` +
      `executing the effects function for ` +
      `'${assertionHandler._actionConfig.name}' ` +
      `- '${assertionHandler._actionConfig.actionName}'`;
      throw error;
    }

    assertionHandler._components = clonedExpectedState.getComponentsAsMap();
    assertionHandler._clonedExpectedState = clonedExpectedState;
  },
  _cloneAndGetPreconditions(callback) {
    let clonedDataStore = assertionHandler._dataStore.clone();
    let clonedExpectedState;
    assertionHandler._expectedState.clone(clonedDataStore, function(myExpectedState) {
      clonedExpectedState = myExpectedState;
    });

    clonedExpectedState._pageState = assertionHandler._pageState;

    let component = clonedExpectedState.getComponent(assertionHandler._actionConfig.name);

    let preconditions;

    try {
      if (assertionHandler._actionParameters) {
        preconditions = component.actions[assertionHandler._actionConfig.actionName].preconditions.call(
          component,
          ...assertionHandler._actionParameters,
          clonedDataStore
        );
      } else {
        preconditions = component.actions[assertionHandler._actionConfig.actionName].preconditions.call(
          component,
          clonedDataStore
        );
      }
    } catch (error) {
      error.message = `The error '${error.message}' was thrown while ` +
      `executing the preconditions function for ` +
      `'${assertionHandler._actionConfig.name}' ` +
      `- '${assertionHandler._actionConfig.actionName}'`;
      throw error;
    }

    assertionHandler._components = clonedExpectedState.getComponentsAsMap();

    return callback(preconditions);
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
assertionHandler.on('assertionHandler.cloneAndApplyEffects',
  assertionHandler._cloneAndApplyEffects);
assertionHandler.on('assertionHandler.cloneAndGetPreconditions',
  assertionHandler._cloneAndGetPreconditions);
