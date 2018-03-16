'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/executor/assertion-handler.js', function() {
    describe('on file being required', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let assertionHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/assertion-handler.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should set the object prototype of assertionHandler to a new EventEmitter', function() {
            assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(Object.getPrototypeOf(assertionHandler)).to.deep.equal(EventEmitterInstance);
        });

        it('should call assertionHandler.on 7 times', function() {
            assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.on.callCount).to.equal(8);
        });

        it('should call assertionHandler.on with the event \'assertionHandler.assertPageStateConfigured\' and the ' +
            'function assertionHandler._getAndCheckPageStateContinually', function() {
                assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.on.args[0]).to.deep.equal([
                'assertionHandler.assertPageStateConfigured',
                assertionHandler._getAndCheckPageStateContinually,
            ]);
        });

        it('should call assertionHandler.on with the event \'assertionHandler.assertExpectedPageStateConfigured\' ' +
            'and the function assertionHandler._getAndCheckExpectedPageStateContinually', function() {
                assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.on.args[1]).to.deep.equal([
                'assertionHandler.assertExpectedPageStateConfigured',
                assertionHandler._getAndCheckExpectedPageStateContinually,
            ]);
        });

        it('should call assertionHandler.on with the event \'assertionHandler.pageStateCheckReady\' and the ' +
            'function assertionHandler._getAndCheckPageState', function() {
                assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.on.args[2]).to.deep.equal([
                'assertionHandler.pageStateCheckReady',
                assertionHandler._getAndCheckPageState,
            ]);
        });

        it('should call assertionHandler.on with the event \'assertionHandler.pageStateErrorReceived\' and the ' +
            'function assertionHandler._getAndCheckPageStateContinually', function() {
                assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.on.args[3]).to.deep.equal([
                'assertionHandler.pageStateErrorReceived',
                assertionHandler._getAndCheckPageStateContinually,
            ]);
        });

        it('should call assertionHandler.on with the event \'assertionHandler.assertionsFailed\' and the ' +
            'function assertionHandler._getAndCheckPageStateContinually', function() {
                assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.on.args[4]).to.deep.equal([
                'assertionHandler.assertionsFailed',
                assertionHandler._getAndCheckPageStateContinually,
            ]);
        });

        it('should call assertionHandler.on with the event \'assertionHandler.expectedPageStateCheckReady\' and the ' +
            'function assertionHandler._getAndCheckExpectedPageState', function() {
                assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.on.args[5]).to.deep.equal([
                'assertionHandler.expectedPageStateCheckReady',
                assertionHandler._getAndCheckExpectedPageState,
            ]);
        });

        it('should call assertionHandler.on with the event \'assertionHandler.expectedPageStateErrorReceived\' ' +
            'and the function assertionHandler._getAndCheckExpectedPageStateContinually', function() {
                assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.on.args[6]).to.deep.equal([
                'assertionHandler.expectedPageStateErrorReceived',
                assertionHandler._getAndCheckExpectedPageStateContinually,
            ]);
        });

        it('should call assertionHandler.on with the event \'assertionHandler.deepEqualFailed\' and the ' +
            'function assertionHandler._getAndCheckExpectedPageStateContinually', function() {
                assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.on.args[7]).to.deep.equal([
                'assertionHandler.deepEqualFailed',
                assertionHandler._getAndCheckExpectedPageStateContinually,
            ]);
        });
    });

    describe('assertPageState', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let clock;
        let assertionHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/assertion-handler.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            clock = sinon.useFakeTimers(381);

            mockery.registerMock('events', {EventEmitter});

            assertionHandler = require('../../../../lib/executor/assertion-handler.js');
        });

        afterEach(function() {
            clock.restore();
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should set assertionHandler._expectedState to equal the passed in expectedState', function() {
            assertionHandler.assertPageState('myExpectedState');

            expect(assertionHandler._expectedState).to.equal('myExpectedState');
        });

        it('should set assertionHandler._assertions to equal the passed in assertions', function() {
            assertionHandler.assertPageState('', [['assertion1'], ['assertion2']]);

            expect(assertionHandler._assertions).to.deep.equal([['assertion1'], ['assertion2']]);
        });

        it('should set assertionHandler._assertions to equal the passed in assertions', function() {
            assertionHandler.assertPageState('', '', 1000);

            expect(assertionHandler._timeOut).to.equal(1381);
        });

        it('should set assertionHandler._assertions to equal the passed in assertions', function() {
            let callback = sinon.spy();

            assertionHandler.assertPageState('', '', 0, callback);

            expect(assertionHandler._callback).to.deep.equal(callback);
        });

        it('should call assertionHandler.emit once with the event ' +
            '\'assertionHandler.assertPageStateConfigured\'', function() {
            assertionHandler.assertPageState();

            expect(assertionHandler.emit.args).to.deep.equal([
                ['assertionHandler.assertPageStateConfigured'],
            ]);
        });
    });

    describe('_getAndCheckPageStateContinually', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let clock;
        let assertionHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/assertion-handler.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            clock = sinon.useFakeTimers(381);
            global.MbttError = {
                ACTION: {
                    PRECONDITION_ASSERTION_FAILURE: sinon.stub(),
                    PRECONDITION_CHECK_FAILED: sinon.stub(),
                },
            };

            mockery.registerMock('events', {EventEmitter});

            assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            assertionHandler._callback = sinon.spy();
        });

        afterEach(function() {
            delete global.MbttError;
            clock.restore();
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('if Date.now() returns a value greater than assertionHandler._timeout', function() {
            describe('if the passed in error.name is equal to \'AssertionError\'', function() {
                it('should throw an error', function() {
                    assertionHandler._timeout = 100;
                    global.MbttError.ACTION.PRECONDITION_ASSERTION_FAILURE.returns(
                        {message: 'My Error'}
                    );
                    let error = new Error('An error');
                    error.name = 'AssertionError';

                    expect(assertionHandler._getAndCheckPageStateContinually.bind(null, error)).to.throw('My Error');
                });

                it('should call MbttError.ACTION.PRECONDITION_ASSERTION_FAILURE once with the passed ' +
                    'in error.message', function() {
                    assertionHandler._timeOut = 100;
                    global.MbttError.ACTION.PRECONDITION_ASSERTION_FAILURE.returns(
                        {message: 'My Error'}
                    );
                    let error = new Error('An error');
                    error.name = 'AssertionError';

                    try {
                        assertionHandler._getAndCheckPageStateContinually(error);
                    } catch (error) {

                    }

                    expect(MbttError.ACTION.PRECONDITION_ASSERTION_FAILURE.args).to.deep.equal([
                        ['An error'],
                    ]);
                });
            });

            describe('if the passed in error.name not equal to \'AssertionError\'', function() {
                it('should throw an error', function() {
                    assertionHandler._timeout = 100;
                    global.MbttError.ACTION.PRECONDITION_CHECK_FAILED.returns(
                        {message: 'My Error'}
                    );
                    let error = new Error('An error');
                    error.name = 'NotAssertionError';

                    expect(assertionHandler._getAndCheckPageStateContinually.bind(null, error)).to.throw('My Error');
                });

                it('should call MbttError.ACTION.PRECONDITION_ASSERTION_FAILURE once with the passed ' +
                    'in error.message', function() {
                        assertionHandler._timeout = 100;
                        global.MbttError.ACTION.PRECONDITION_CHECK_FAILED.returns(
                            {message: 'My Error'}
                        );
                        let error = new Error('An error');
                        error.name = 'NotAssertionError';

                    try {
                        assertionHandler._getAndCheckPageStateContinually(error);
                    } catch (error) {

                    }

                    expect(MbttError.ACTION.PRECONDITION_CHECK_FAILED.args).to.deep.equal([
                        ['NotAssertionError'],
                    ]);
                });
            });
        });

        describe('if Date.now() returns a value equal to assertionHandler._timeout', function() {
            describe('if the passed in error.name is equal to \'AssertionError\'', function() {
                it('should throw an error', function() {
                    assertionHandler._timeout = 381;
                    global.MbttError.ACTION.PRECONDITION_ASSERTION_FAILURE.returns(
                        {message: 'My Error'}
                    );
                    let error = new Error('An error');
                    error.name = 'AssertionError';

                    expect(assertionHandler._getAndCheckPageStateContinually.bind(null, error)).to.throw('My Error');
                });
            });

            describe('if the passed in error.name not equal to \'AssertionError\'', function() {
                it('should throw an error', function() {
                    assertionHandler._timeout = 381;
                    global.MbttError.ACTION.PRECONDITION_CHECK_FAILED.returns(
                        {message: 'My Error'}
                    );
                    let error = new Error('An error');
                    error.name = 'NotAssertionError';

                    expect(assertionHandler._getAndCheckPageStateContinually.bind(null, error)).to.throw('My Error');
                });
            });
        });

        describe('if Date.now() returns a value lesser than assertionHandler._timeout', function() {
            it('should call assertionHandler.emit once with the event ' +
                '\'assertionHandler.pageStateCheckReady\'', function() {
                assertionHandler._timeOut = 1000;

                assertionHandler._getAndCheckPageStateContinually();

                expect(assertionHandler.emit.args).to.deep.equal([
                    ['assertionHandler.pageStateCheckReady'],
                ]);
            });
        });
    });

    describe('_getAndCheckPageState', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let assertionHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/assertion-handler.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});

            assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            assertionHandler._callback = sinon.spy();
            assertionHandler._expectedState = {
                getComponentsAsMap: sinon.stub(),
            };
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call assertionHandler.emit once', function() {
            assertionHandler._getAndCheckPageState();

            expect(assertionHandler.emit.callCount).to.equal(1);
        });

        it('should call assertionHandler.emit with the event\'assertionHandler.getPageState\' and the result '+
            'of the call to assertionHandler._expectedState.getComponentsAsMap', function() {
            assertionHandler._expectedState.getComponentsAsMap.returns('componentsAsAMap');

            assertionHandler._getAndCheckPageState();

            expect(assertionHandler.emit.args[0][0]).to.equal('assertionHandler.getPageState');
        });

        it('should call assertionHandler._expectedState.getComponentsAsMap once with no parameters', function() {
            assertionHandler._getAndCheckPageState();

            expect(assertionHandler._expectedState.getComponentsAsMap.args).to.deep.equal([[]]);
        });

        describe('when the callback for assertionHandler.emit with the event \'assertionHandler.getPageState\' ' +
            'is called', function() {
            describe('if there is an error passed in', function() {
                it('should call assertionHandler.emit twice', function() {
                    let error = new Error('An error occurred');
                    assertionHandler.emit.onCall(0).callsArgWith(2, error);

                    assertionHandler._getAndCheckPageState();

                    expect(assertionHandler.emit.callCount).to.equal(2);
                });

                it('should call assertionHandler.emit with the event ' +
                    '\'assertionHandler.pageStateErrorReceived\' and the passed in error', function() {
                    let error = new Error('An error occurred');
                    assertionHandler.emit.onCall(0).callsArgWith(2, error);

                    assertionHandler._getAndCheckPageState();

                    expect(assertionHandler.emit.args[1]).to.deep.equal(
                        ['assertionHandler.pageStateErrorReceived', error]
                    );
                });
            });

            describe('if there is not an error passed in', function() {
                it('should call assertionHandler.emit twice', function() {
                    assertionHandler.emit.onCall(0).callsArg(2);

                    assertionHandler._getAndCheckPageState();

                    expect(assertionHandler.emit.callCount).to.equal(2);
                });

                it('should call set assertionHandler._pageState to the passed in state', function() {
                    assertionHandler.emit.onCall(0).callsArgWith(2, null, {property: 'value'});

                    assertionHandler._getAndCheckPageState();

                    expect(assertionHandler._pageState).to.deep.equal({property: 'value'});
                });

                it('should call assertionHandler.emit with the event \'assertionHandler.runAssertions\', ' +
                    'assertionHandler._pageState, and assertionHandler._assertions as the first 3 ' +
                    'parameters', function() {
                    assertionHandler._assertions = ['assertion1', 'assertion2'];
                    assertionHandler.emit.onCall(0).callsArgWith(2, null, {property: 'value'});

                    assertionHandler._getAndCheckPageState();

                    expect(assertionHandler.emit.args[1].slice(0, 3)).to.deep.equal([
                        'assertionHandler.runAssertions',
                        {property: 'value'},
                        ['assertion1', 'assertion2'],
                    ]);
                });

                describe('when the callback for assertionHandler.emit with the event ' +
                    '\'assertionHandler.runAssertions\' is called', function() {
                    describe('if an error is passed in', function() {
                        it('should call assertionHandler.emit thrice', function() {
                            let error = new Error('An error occurred');
                            assertionHandler.emit.onCall(0).callsArgWith(2, null, {property: 'value'});
                            assertionHandler.emit.onCall(1).callsArgWith(3, error);

                            assertionHandler._getAndCheckPageState();

                            expect(assertionHandler.emit.callCount).to.equal(3);
                        });

                        it('should call assertionHandler.emit with the event ' +
                            '\'assertionHandler.assertionsFailed\' and the passed in error', function() {
                            let error = new Error('An error occurred');
                            assertionHandler.emit.onCall(0).callsArgWith(2, null, {property: 'value'});
                            assertionHandler.emit.onCall(1).callsArgWith(3, error);

                            assertionHandler._getAndCheckPageState();

                            expect(assertionHandler.emit.args[2]).to.deep.equal(
                                ['assertionHandler.assertionsFailed', error]
                            );
                        });
                    });

                    describe('if there is not an error passed in', function() {
                        it('should call assertionHandler._callback once with no parameters', function() {
                            assertionHandler.emit.onCall(0).callsArgWith(2, null, {property: 'value'});
                            assertionHandler.emit.onCall(1).callsArg(3);

                            assertionHandler._getAndCheckPageState();

                            expect(assertionHandler._callback.args).to.deep.equal([[]]);
                        });
                    });
                });
            });
        });
    });

    describe('assertExpectedPageState', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let clock;
        let assertionHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/assertion-handler.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            clock = sinon.useFakeTimers(381);

            mockery.registerMock('events', {EventEmitter});

            assertionHandler = require('../../../../lib/executor/assertion-handler.js');
        });

        afterEach(function() {
            clock.restore();
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should set assertionHandler._expectedState to equal the passed in expectedState', function() {
            assertionHandler.assertExpectedPageState('myExpectedState');

            expect(assertionHandler._expectedState).to.equal('myExpectedState');
        });

        it('should set assertionHandler._assertions to equal the passed in assertions', function() {
            assertionHandler.assertExpectedPageState('', 1000);

            expect(assertionHandler._timeOut).to.equal(1381);
        });

        it('should set assertionHandler._assertions to equal the passed in assertions', function() {
            let callback = sinon.spy();

            assertionHandler.assertExpectedPageState('', 0, callback);

            expect(assertionHandler._callback).to.deep.equal(callback);
        });

        it('should call assertionHandler.emit once with the event ' +
            '\'assertionHandler.assertPageStateConfigured\'', function() {
            assertionHandler.assertExpectedPageState();

            expect(assertionHandler.emit.args).to.deep.equal([
                ['assertionHandler.assertExpectedPageStateConfigured'],
            ]);
        });
    });

    describe('_getAndCheckExpectedPageStateContinually', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let clock;
        let assertionHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/assertion-handler.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            clock = sinon.useFakeTimers(381);
            global.MbttError = {
                ACTION: {
                    EXPECTED_STATE_ERROR: sinon.stub(),
                },
            };

            mockery.registerMock('events', {EventEmitter});

            assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            assertionHandler._expectedState = {
                _state: {
                    property: 'value',
                },
            };
            assertionHandler._callback = sinon.spy();
        });

        afterEach(function() {
            delete global.MbttError;
            clock.restore();
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('if Date.now() returns a value greater than assertionHandler._timeout', function() {
            it('should call assertionHandler.emit once with the event \'assertionHandler.stateCheckTimedOut\', ' +
                'assertionHandler._pageState, assertionHandler._expectedState._state', function() {
                assertionHandler._timeout = 100;
                assertionHandler._pageState = {
                    displayed: true,
                };

                try {
                    assertionHandler._getAndCheckExpectedPageStateContinually();
                } catch (error) {

                }

                expect(assertionHandler.emit.args).to.deep.equal([
                    [
                        'assertionHandler.stateCheckTimedOut',
                        {displayed: true},
                        {property: 'value'},
                    ],
                ]);
            });

            it('should throw an error', function() {
                assertionHandler._timeout = 100;
                global.MbttError.ACTION.EXPECTED_STATE_ERROR.returns(
                    {message: 'My Error'}
                );

                expect(assertionHandler._getAndCheckExpectedPageStateContinually).to.throw('My Error');
            });

            it('should call MbttError.ACTION.EXPECTED_STATE_ERROR once with a message', function() {
                assertionHandler._timeout = 100;
                global.MbttError.ACTION.EXPECTED_STATE_ERROR.returns(
                    {message: 'My Error'}
                );

                try {
                    assertionHandler._getAndCheckExpectedPageStateContinually();
                } catch (error) {

                }

                expect(MbttError.ACTION.EXPECTED_STATE_ERROR.args).to.deep.equal([
                    ['Page state did not equal expected state'],
                ]);
            });
        });

        describe('if Date.now() returns a value equal to assertionHandler._timeout', function() {
            it('should throw an error', function() {
                assertionHandler._timeout = 381;
                global.MbttError.ACTION.EXPECTED_STATE_ERROR.returns(
                    {message: 'My Error'}
                );

                expect(assertionHandler._getAndCheckExpectedPageStateContinually).to.throw('My Error');
            });
        });

        describe('if Date.now() returns a value lesser than assertionHandler._timeout', function() {
            it('should call assertionHandler.emit once with the event ' +
                '\'assertionHandler.pageStateCheckReady\'', function() {
                assertionHandler._timeOut = 1000;

                assertionHandler._getAndCheckExpectedPageStateContinually();

                expect(assertionHandler.emit.args).to.deep.equal([
                    ['assertionHandler.expectedPageStateCheckReady'],
                ]);
            });
        });
    });

    describe('_getAndCheckExpectedPageState', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let assertionHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/assertion-handler.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});

            assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            assertionHandler._callback = sinon.spy();
            assertionHandler._expectedState = {
                getComponentsAsMap: sinon.stub(),
                getState: sinon.stub(),
            };
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call assertionHandler.emit once', function() {
            assertionHandler._getAndCheckExpectedPageState();

            expect(assertionHandler.emit.callCount).to.equal(1);
        });

        it('should call assertionHandler.emit with the event\'assertionHandler.getPageState\' and the result '+
            'of the call to assertionHandler._expectedState.getComponentsAsMap', function() {
            assertionHandler._expectedState.getComponentsAsMap.returns('componentsAsAMap');

            assertionHandler._getAndCheckExpectedPageState();

            expect(assertionHandler.emit.args[0][0]).to.equal('assertionHandler.getPageState');
        });

        it('should call assertionHandler._expectedState.getComponentsAsMap once with no parameters', function() {
            assertionHandler._getAndCheckExpectedPageState();

            expect(assertionHandler._expectedState.getComponentsAsMap.args).to.deep.equal([[]]);
        });

        describe('when the callback for assertionHandler.emit with the event \'assertionHandler.getPageState\' ' +
            'is called', function() {
            describe('if there is an error passed in', function() {
                it('should call assertionHandler.emit twice', function() {
                    let error = new Error('An error occurred');
                    assertionHandler.emit.onCall(0).callsArgWith(2, error);

                    assertionHandler._getAndCheckExpectedPageState();

                    expect(assertionHandler.emit.callCount).to.equal(2);
                });

                it('should call assertionHandler.emit with the event ' +
                    '\'assertionHandler.expectedPageStateErrorReceived\'', function() {
                    let error = new Error('An error occurred');
                    assertionHandler.emit.onCall(0).callsArgWith(2, error);

                    assertionHandler._getAndCheckExpectedPageState();

                    expect(assertionHandler.emit.args[1]).to.deep.equal(
                        ['assertionHandler.expectedPageStateErrorReceived']
                    );
                });
            });

            describe('if there is not an error passed in', function() {
                it('should call assertionHandler.emit twice', function() {
                    assertionHandler.emit.onCall(0).callsArg(2);

                    assertionHandler._getAndCheckExpectedPageState();

                    expect(assertionHandler.emit.callCount).to.equal(2);
                });

                it('should call set assertionHandler._pageState to the passed in state', function() {
                    assertionHandler.emit.onCall(0).callsArgWith(2, null, {property: 'value'});

                    assertionHandler._getAndCheckExpectedPageState();

                    expect(assertionHandler._pageState).to.deep.equal({property: 'value'});
                });

                it('should call assertionHandler._expectedState.getState once', function() {
                    assertionHandler.emit.onCall(0).callsArg(2);

                    assertionHandler._getAndCheckExpectedPageState();

                    expect(assertionHandler._expectedState.getState.callCount).to.equal(1);
                });

                it('should call assertionHandler.emit with the event \'assertionHandler.runAssertions\', ' +
                    'assertionHandler._pageState, and the result of the call to ' +
                    'assertionHandler._expectedState.getState as the first 3 parameters', function() {
                    assertionHandler._expectedState.getState.returns({property: 'value'});
                    assertionHandler.emit.onCall(0).callsArgWith(2, null, {property: 'value'});

                    assertionHandler._getAndCheckExpectedPageState();

                    expect(assertionHandler.emit.args[1].slice(0, 3)).to.deep.equal([
                        'assertionHandler.runDeepEqual',
                        {property: 'value'},
                        {property: 'value'},
                    ]);
                });

                describe('when the callback for assertionHandler.emit with the event ' +
                    '\'assertionHandler.runDeepEqual\' is called', function() {
                    describe('if an error is passed in', function() {
                        it('should call assertionHandler.emit thrice', function() {
                            let error = new Error('An error occurred');
                            assertionHandler.emit.onCall(0).callsArgWith(2, null, {property: 'value'});
                            assertionHandler.emit.onCall(1).callsArgWith(3, error);

                            assertionHandler._getAndCheckExpectedPageState();

                            expect(assertionHandler.emit.callCount).to.equal(3);
                        });

                        it('should call assertionHandler.emit with the event ' +
                            '\'assertionHandler.assertionsFailed\'', function() {
                            let error = new Error('An error occurred');
                            assertionHandler.emit.onCall(0).callsArgWith(2, null, {property: 'value'});
                            assertionHandler.emit.onCall(1).callsArgWith(3, error);

                            assertionHandler._getAndCheckExpectedPageState();

                            expect(assertionHandler.emit.args[2]).to.deep.equal(['assertionHandler.deepEqualFailed']);
                        });
                    });

                    describe('if there is not an error passed in', function() {
                        it('should call assertionHandler._callback once with no parameters', function() {
                            assertionHandler.emit.onCall(0).callsArgWith(2, null, {property: 'value'});
                            assertionHandler.emit.onCall(1).callsArg(3);

                            assertionHandler._getAndCheckExpectedPageState();

                            expect(assertionHandler._callback.args).to.deep.equal([[]]);
                        });
                    });
                });
            });
        });
    });
});
