'use strict';

const EventEmitter = require('events').EventEmitter;

let assertionHandler;

module.exports = assertionHandler = {
  _expectedState: null,
  _pageState: null,
  _assertions: null,
  _timeOut: null,
  _callback: null,
  assertPageState(expectedState, assertions, milliseconds, callback) {
    assertionHandler._expectedState = expectedState;
    assertionHandler._assertions = assertions;
    assertionHandler._timeOut = Date.now() + milliseconds;
    assertionHandler._callback = callback;
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
        assertionHandler.emit(
          'assertionHandler.runAssertions',
          assertionHandler._pageState,
          assertionHandler._assertions,
          function(error) {
            if (error) {
              return assertionHandler.emit('assertionHandler.assertionsFailed', error);
            } else {
              return assertionHandler._callback();
            }
          }
        );
      }
    );
  },
  assertExpectedPageState(expectedState, milliseconds, callback) {
    assertionHandler._expectedState = expectedState;
    assertionHandler._timeOut = Date.now() + milliseconds;
    assertionHandler._callback = callback;
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
      assertionHandler._expectedState.getComponentsAsMap(),
      function(error, state) {
        if (error) {
          return assertionHandler.emit('assertionHandler.expectedPageStateErrorReceived');
        }
        assertionHandler._pageState = state;
        assertionHandler.emit('assertionHandler.runDeepEqual',
          assertionHandler._pageState,
          assertionHandler._expectedState.getState(),
          function(error) {
            if (error) {
              return assertionHandler.emit('assertionHandler.deepEqualFailed');
            } else {
              return assertionHandler._callback();
            }
          }
        );
      }
    );
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
