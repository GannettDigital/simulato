'use strict';

const Emitter = require('../util/emitter.js');
const executorEventDispatch = require('./executor-event-dispatch/executor-event-dispatch.js');

let assertionHandler;

module.exports = assertionHandler = {
  _expectedState: null,
  _clonedExpectedState: null,
  _clonedDataStore: null,
  _components: null,
  _pageState: {},
  _assertions: null,
  _timeOut: null,
  _action: null,
  _actionConfig: null,
  assertPageState(expectedState, action, actionConfig, dataStore, actionParameters, milliseconds) {
    assertionHandler._expectedState = expectedState;
    assertionHandler._timeOut = Date.now() + milliseconds;
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
        throw new SimulatoError.ACTION.PRECONDITION_ASSERTION_FAILURE(error.message);
      } else {
        throw new SimulatoError.ACTION.PRECONDITION_CHECK_FAILED(error.name);
      }
    }
    assertionHandler.emit('assertionHandler.pageStateCheckReady');
  },
  * _getAndCheckPageState() {
    let next = yield;

    assertionHandler._pageState = yield assertionHandler.emitAsync(
        'pageStateHandler.getPageState',
        assertionHandler._expectedState.getComponentsAsMap(),
        next
    );

    let preconditions = yield assertionHandler.emitAsync('assertionHandler.cloneAndGetPreconditions', next);

    try {
      yield assertionHandler.emitAsync(
          'oracle.runAssertions',
          assertionHandler._pageState,
          assertionHandler._clonedDataStore.retrieveAll(),
          preconditions,
          next
      );
    } catch (error) {
      return assertionHandler.emit('assertionHandler.preconditionsFailed', error);
    }

    assertionHandler.emit('assertionHandler.preconditionsVerified');
  },
  assertExpectedPageState(expectedState, action, actionConfig, dataStore, actionParameters, milliseconds) {
    assertionHandler._expectedState = expectedState;
    assertionHandler._timeOut = Date.now() + milliseconds;
    assertionHandler._action = action;
    assertionHandler._actionConfig = actionConfig;
    assertionHandler._dataStore = dataStore;
    assertionHandler._actionParameters = actionParameters;

    assertionHandler.emit('assertionHandler.cloneAndApplyEffects');
    assertionHandler.emit('assertionHandler.assertExpectedPageStateConfigured');
  },
  _getAndCheckExpectedPageStateContinually() {
    if (Date.now() >= assertionHandler._timeOut) {
      assertionHandler.emit(
          'assertionHandler.stateCheckTimedOut',
          assertionHandler._pageState, assertionHandler._clonedExpectedState._state);
      throw new SimulatoError.ACTION.EXPECTED_STATE_ERROR('Page state did not equal expected state');
    }

    assertionHandler.emit('assertionHandler.expectedPageStateCheckReady');
  },
  * _getAndCheckExpectedPageState() {
    let next = yield;

    assertionHandler._pageState = yield assertionHandler.emitAsync(
        'pageStateHandler.getPageState',
        assertionHandler._components,
        next
    );

    assertionHandler.emit('assertionHandler.cloneAndApplyEffects');

    try {
      yield assertionHandler.emitAsync(
          'oracle.runDeepEqual',
          assertionHandler._pageState,
          assertionHandler._clonedExpectedState.getState(),
          next
      );
    } catch (error) {
      return assertionHandler.emit('assertionHandler.effectsFailed');
    }

    assertionHandler._expectedState._pageState = assertionHandler._pageState;
    assertionHandler.emit('assertionHandler.effectsVerified');
  },
  _cloneAndApplyEffects() {
    assertionHandler.emit('assertionHandler.clone');

    let component = assertionHandler._clonedExpectedState.getComponent(assertionHandler._actionConfig.name);
    try {
      if (assertionHandler._actionParameters) {
        component.actions[assertionHandler._actionConfig.actionName].effects.call(
            component,
            ...assertionHandler._actionParameters,
            assertionHandler._clonedExpectedState,
            assertionHandler._clonedDataStore
        );
      } else {
        component.actions[assertionHandler._actionConfig.actionName].effects.call(
            component,
            assertionHandler._clonedExpectedState,
            assertionHandler._clonedDataStore
        );
      }
    } catch (error) {
      error.message = `The error '${error.message}' was thrown while ` +
      `executing the effects function for ` +
      `'${assertionHandler._actionConfig.name}' ` +
      `- '${assertionHandler._actionConfig.actionName}'`;
      throw error;
    }

    assertionHandler._components = assertionHandler._clonedExpectedState.getComponentsAsMap();
  },
  _cloneAndGetPreconditions(callback) {
    assertionHandler.emit('assertionHandler.clone');

    assertionHandler._components = assertionHandler._clonedExpectedState.getComponentsAsMap();
    let component = assertionHandler._clonedExpectedState.getComponent(assertionHandler._actionConfig.name);

    let preconditions;
    try {
      if (assertionHandler._actionParameters) {
        preconditions = component.actions[assertionHandler._actionConfig.actionName].preconditions.call(
            component,
            ...assertionHandler._actionParameters,
            assertionHandler._clonedDataStore
        );
      } else {
        preconditions = component.actions[assertionHandler._actionConfig.actionName].preconditions.call(
            component,
            assertionHandler._clonedDataStore
        );
      }
    } catch (error) {
      error.message = `The error '${error.message}' was thrown while ` +
      `executing the preconditions function for ` +
      `'${assertionHandler._actionConfig.name}' ` +
      `- '${assertionHandler._actionConfig.actionName}'`;
      throw error;
    }

    return callback(null, preconditions);
  },
  _clone() {
    let clonedDataStore = assertionHandler._dataStore.clone();

    let clonedExpectedState;
    assertionHandler._expectedState.clone(clonedDataStore, function(myExpectedState) {
      clonedExpectedState = myExpectedState;
    });

    assertionHandler._clonedExpectedState = clonedExpectedState;
    assertionHandler._clonedDataStore = clonedDataStore;
    assertionHandler._clonedExpectedState._pageState = assertionHandler._pageState;
  },
};

Emitter.mixIn(assertionHandler, executorEventDispatch);

assertionHandler.on('assertionHandler.assertPageStateConfigured',
    assertionHandler._getAndCheckPageStateContinually);
assertionHandler.on('assertionHandler.assertExpectedPageStateConfigured',
    assertionHandler._getAndCheckExpectedPageStateContinually);
assertionHandler.runOn('assertionHandler.pageStateCheckReady',
    assertionHandler._getAndCheckPageState);
assertionHandler.on('assertionHandler.pageStateErrorReceived',
    assertionHandler._getAndCheckPageStateContinually);
assertionHandler.on('assertionHandler.preconditionsFailed',
    assertionHandler._getAndCheckPageStateContinually);
assertionHandler.runOn('assertionHandler.expectedPageStateCheckReady',
    assertionHandler._getAndCheckExpectedPageState);
assertionHandler.on('assertionHandler.expectedPageStateErrorReceived',
    assertionHandler._getAndCheckExpectedPageStateContinually);
assertionHandler.on('assertionHandler.effectsFailed',
    assertionHandler._getAndCheckExpectedPageStateContinually);
assertionHandler.on('assertionHandler.cloneAndApplyEffects',
    assertionHandler._cloneAndApplyEffects);
assertionHandler.on('assertionHandler.cloneAndGetPreconditions',
    assertionHandler._cloneAndGetPreconditions);
assertionHandler.on('assertionHandler.clone',
    assertionHandler._clone);
