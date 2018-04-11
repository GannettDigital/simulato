'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/executor/assertion-handler.js', function() {
    describe('on file being required', function() {
        let Emitter;
        let assertionHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/assertion-handler.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');

            mockery.registerMock('../util/emitter.js', Emitter);
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call Emitter.mixIn with the assertionHandler', function() {
            assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(Emitter.mixIn.args).to.deep.equal([
                [
                    assertionHandler,
                ],
            ]);
        });

        it('should call assertionHandler.on 9 times', function() {
            assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.on.callCount).to.equal(9);
        });

        it('should call assertionHandler.runOn 2 times', function() {
            assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.runOn.callCount).to.equal(2);
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

        it('should call assertionHandler.runOn with the event \'assertionHandler.pageStateCheckReady\' and the ' +
            'function assertionHandler._getAndCheckPageState', function() {
                assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.runOn.args[0]).to.deep.equal([
                'assertionHandler.pageStateCheckReady',
                assertionHandler._getAndCheckPageState,
            ]);
        });

        it('should call assertionHandler.on with the event \'assertionHandler.pageStateErrorReceived\' and the ' +
            'function assertionHandler._getAndCheckPageStateContinually', function() {
                assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.on.args[2]).to.deep.equal([
                'assertionHandler.pageStateErrorReceived',
                assertionHandler._getAndCheckPageStateContinually,
            ]);
        });

        it('should call assertionHandler.on with the event \'assertionHandler.preconditionsFailed\' and the ' +
            'function assertionHandler._getAndCheckPageStateContinually', function() {
                assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.on.args[3]).to.deep.equal([
                'assertionHandler.preconditionsFailed',
                assertionHandler._getAndCheckPageStateContinually,
            ]);
        });

        it('should call assertionHandler.runOn with the event \'assertionHandler.expectedPageStateCheckReady\' ' +
            'and the function assertionHandler._getAndCheckExpectedPageState', function() {
                assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.runOn.args[1]).to.deep.equal([
                'assertionHandler.expectedPageStateCheckReady',
                assertionHandler._getAndCheckExpectedPageState,
            ]);
        });

        it('should call assertionHandler.on with the event \'assertionHandler.expectedPageStateErrorReceived\' ' +
            'and the function assertionHandler._getAndCheckExpectedPageStateContinually', function() {
                assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.on.args[4]).to.deep.equal([
                'assertionHandler.expectedPageStateErrorReceived',
                assertionHandler._getAndCheckExpectedPageStateContinually,
            ]);
        });

        it('should call assertionHandler.on with the event \'assertionHandler.effectsFailed\' and the ' +
            'function assertionHandler._getAndCheckExpectedPageStateContinually', function() {
                assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.on.args[5]).to.deep.equal([
                'assertionHandler.effectsFailed',
                assertionHandler._getAndCheckExpectedPageStateContinually,
            ]);
        });

        it('should call assertionHandler.on with the event \'assertionHandler.cloneAndApplyEffects\' and the ' +
            'function assertionHandler._cloneAndApplyEffects', function() {
                assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.on.args[6]).to.deep.equal([
                'assertionHandler.cloneAndApplyEffects',
                assertionHandler._cloneAndApplyEffects,
            ]);
        });

        it('should call assertionHandler.on with the event \'assertionHandler.cloneAndGetPreconditions\' and the ' +
            'function assertionHandler._cloneAndGetPreconditions', function() {
                assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.on.args[7]).to.deep.equal([
                'assertionHandler.cloneAndGetPreconditions',
                assertionHandler._cloneAndGetPreconditions,
            ]);
        });

        it('should call assertionHandler.on with the event \'assertionHandler.clone\' and the ' +
            'function assertionHandler._clone', function() {
                assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            expect(assertionHandler.on.args[8]).to.deep.equal([
                'assertionHandler.clone',
                assertionHandler._clone,
            ]);
        });
    });

    describe('assertPageState', function() {
        let Emitter;
        let clock;
        let assertionHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/assertion-handler.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            clock = sinon.useFakeTimers(381);

            mockery.registerMock('../util/emitter.js', Emitter);

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

        it('should set assertionHandler._timeOout to equal Date.now() plus the passed in milliseconds', function() {
            assertionHandler.assertPageState('myExpectedState', '', '', '', '', 500);

            expect(assertionHandler._timeOut).to.equal(881);
        });

        it('should set assertionHandler._action to equal the passed in action', function() {
            assertionHandler.assertPageState('', 'myAction');

            expect(assertionHandler._action).to.equal('myAction');
        });

        it('should set assertionHandler._actionConfig to equal the passed in actionConfig', function() {
            assertionHandler.assertPageState('', '', 'myActionConfig');

            expect(assertionHandler._actionConfig).to.equal('myActionConfig');
        });

        it('should set assertionHandler._dataStore to equal the passed in dataStore', function() {
            assertionHandler.assertPageState('', '', '', 'myDataStore');

            expect(assertionHandler._dataStore).to.equal('myDataStore');
        });

        it('should set assertionHandler._actionParameters to equal the passed in actionParameters', function() {
            assertionHandler.assertPageState('', '', '', '', 'myActionParameters');

            expect(assertionHandler._actionParameters).to.equal('myActionParameters');
        });

        it('should call assertionHandler.emit once', function() {
            assertionHandler.assertPageState();

            expect(assertionHandler.emit.callCount).to.equal(1);
        });

        it('should call assertionHandler.emit with the event ' +
            '\'assertionHandler.cloneAndGetPreconditions\' as the first argument', function() {
            assertionHandler.assertPageState();

            expect(assertionHandler.emit.args[0].slice(0, 1)).to.deep.equal(
                ['assertionHandler.cloneAndGetPreconditions']
            );
        });

        describe('when the callback is called for the event \'assertionHandler.cloneAndGetPreconditions\'', function() {
            it('should call assertionHandler.emit twice', function() {
                assertionHandler.emit.onCall(0).callsArg(1);

                assertionHandler.assertPageState();

                expect(assertionHandler.emit.callCount).to.equal(2);
            });

            it('should call assertionHandler.emit with the event ' +
                '\'assertionHandler.assertPageStateConfigured\'', function() {
                assertionHandler.emit.onCall(0).callsArg(1);

                assertionHandler.assertPageState();

                expect(assertionHandler.emit.args[1]).to.deep.equal(
                    ['assertionHandler.assertPageStateConfigured']
                );
            });
        });
    });

    describe('_getAndCheckPageStateContinually', function() {
        let Emitter;
        let clock;
        let assertionHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/assertion-handler.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            clock = sinon.useFakeTimers(381);
            global.SimulatoError = {
                ACTION: {
                    PRECONDITION_ASSERTION_FAILURE: sinon.stub(),
                    PRECONDITION_CHECK_FAILED: sinon.stub(),
                },
            };

            mockery.registerMock('../util/emitter.js', Emitter);

            assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            assertionHandler._callback = sinon.spy();
        });

        afterEach(function() {
            delete global.SimulatoError;
            clock.restore();
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('if Date.now() returns a value greater than assertionHandler._timeout', function() {
            describe('if the passed in error.name is equal to \'AssertionError\'', function() {
                it('should throw an error', function() {
                    assertionHandler._timeout = 100;
                    global.SimulatoError.ACTION.PRECONDITION_ASSERTION_FAILURE.returns(
                        {message: 'My Error'}
                    );
                    let error = new Error('An error');
                    error.name = 'AssertionError';

                    expect(assertionHandler._getAndCheckPageStateContinually.bind(null, error)).to.throw('My Error');
                });

                it('should call SimulatoError.ACTION.PRECONDITION_ASSERTION_FAILURE once with the passed ' +
                    'in error.message', function() {
                    assertionHandler._timeOut = 100;
                    global.SimulatoError.ACTION.PRECONDITION_ASSERTION_FAILURE.returns(
                        {message: 'My Error'}
                    );
                    let error = new Error('An error');
                    error.name = 'AssertionError';

                    try {
                        assertionHandler._getAndCheckPageStateContinually(error);
                    } catch (error) {

                    }

                    expect(SimulatoError.ACTION.PRECONDITION_ASSERTION_FAILURE.args).to.deep.equal([
                        ['An error'],
                    ]);
                });
            });

            describe('if the passed in error.name not equal to \'AssertionError\'', function() {
                it('should throw an error', function() {
                    assertionHandler._timeout = 100;
                    global.SimulatoError.ACTION.PRECONDITION_CHECK_FAILED.returns(
                        {message: 'My Error'}
                    );
                    let error = new Error('An error');
                    error.name = 'NotAssertionError';

                    expect(assertionHandler._getAndCheckPageStateContinually.bind(null, error)).to.throw('My Error');
                });

                it('should call SimulatoError.ACTION.PRECONDITION_ASSERTION_FAILURE once with the passed ' +
                    'in error.message', function() {
                        assertionHandler._timeout = 100;
                        global.SimulatoError.ACTION.PRECONDITION_CHECK_FAILED.returns(
                            {message: 'My Error'}
                        );
                        let error = new Error('An error');
                        error.name = 'NotAssertionError';

                    try {
                        assertionHandler._getAndCheckPageStateContinually(error);
                    } catch (error) {

                    }

                    expect(SimulatoError.ACTION.PRECONDITION_CHECK_FAILED.args).to.deep.equal([
                        ['NotAssertionError'],
                    ]);
                });
            });
        });

        describe('if Date.now() returns a value equal to assertionHandler._timeout', function() {
            describe('if the passed in error.name is equal to \'AssertionError\'', function() {
                it('should throw an error', function() {
                    assertionHandler._timeout = 381;
                    global.SimulatoError.ACTION.PRECONDITION_ASSERTION_FAILURE.returns(
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
                    global.SimulatoError.ACTION.PRECONDITION_CHECK_FAILED.returns(
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
        let Emitter;
        let next;
        let assertionHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/assertion-handler.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            next = sinon.stub();

            mockery.registerMock('../util/emitter.js', Emitter);

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

        it('should call assertionHandler.emitAsyc thrice', function() {
            let generator = assertionHandler._getAndCheckPageState();
            generator.next(next);
        });

        it('should call assertionHandler.emitAsync with the event \'assertionHandler.getPageState\', ' +
            'the components, and next', function() {
            assertionHandler._expectedState.getComponentsAsMap.returns('myComponents');
            let generator = assertionHandler._getAndCheckPageState();

            generator.next();
            generator.next(next);

            expect(assertionHandler.emitAsync.args[0]).to.deep.equal([
                'assertionHandler.getPageState',
                'myComponents',
                next,
            ]);
        });

        it('should call assertionHandler.emitAsync with the event \'assertionHandler.cloneAndGetPreconditions\', ' +
            'and next', function() {
            assertionHandler._expectedState.getComponentsAsMap.returns('myComponents');
            let generator = assertionHandler._getAndCheckPageState();

            generator.next();
            generator.next(next);
            generator.next();

            expect(assertionHandler.emitAsync.args[1]).to.deep.equal([
                'assertionHandler.cloneAndGetPreconditions',
                next,
            ]);
        });

        it('should set assertionHandler._pageState to the result of the yield with the ' +
            'event \'assertionHandler.getPageState\'', function() {
            let generator = assertionHandler._getAndCheckPageState();

            generator.next();
            generator.next(next);
            generator.next({name: 'model'});

            expect(assertionHandler._pageState).to.deep.equal({name: 'model'});
        });

        it('should call assertionHandler.emitAsync with the event \'assertionHandler.runAssertions\', ' +
            'assertionHandler._pageState, the preconditions, and next', function() {
            assertionHandler._expectedState.getComponentsAsMap.returns('myComponents');
            let generator = assertionHandler._getAndCheckPageState();

            generator.next();
            generator.next(next);
            generator.next({name: 'model'});
            generator.next('myPreconditions');

            expect(assertionHandler.emitAsync.args[2]).to.deep.equal([
                'assertionHandler.runAssertions',
                {name: 'model'},
                'myPreconditions',
                next,
            ]);
        });

        describe('when the yield with the event \'assertionHandler.runAssertions\' throws', function() {
            it('should call assertionHandler.emit once with the event \'assertionHandler.preconditionsFailed\' ' +
                'and the thrown error', function() {
                assertionHandler._expectedState.getComponentsAsMap.returns('myComponents');
                let error = new Error('An error occurred');
                let generator = assertionHandler._getAndCheckPageState();

                generator.next();
                generator.next(next);
                generator.next({name: 'model'});
                generator.next('myPreconditions');
                generator.throw(error);

                expect(assertionHandler.emit.args).to.deep.equal([
                    [
                        'assertionHandler.preconditionsFailed',
                        error,
                    ],
                ]);
            });
        });

            it('should call assertionHandler.emit once with the event ' +
                '\'assertionHandler.preconditionsVerified\'', function() {
                assertionHandler._expectedState.getComponentsAsMap.returns('myComponents');
                let generator = assertionHandler._getAndCheckPageState();

                generator.next();
                generator.next(next);
                generator.next({name: 'model'});
                generator.next('myPreconditions');
                generator.next();

                expect(assertionHandler.emit.args).to.deep.equal([
                    [
                        'assertionHandler.preconditionsVerified',
                    ],
                ]);
            });
    });

    describe('assertExpectedPageState', function() {
        let Emitter;
        let clock;
        let assertionHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/assertion-handler.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            clock = sinon.useFakeTimers(381);

            mockery.registerMock('../util/emitter.js', Emitter);

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

        it('should set assertionHandler._timeOout to equal Date.now() plus the passed in milliseconds', function() {
            assertionHandler.assertExpectedPageState('myExpectedState', '', '', '', '', 500);

            expect(assertionHandler._timeOut).to.equal(881);
        });

        it('should set assertionHandler._action to equal the passed in action', function() {
            assertionHandler.assertExpectedPageState('', 'myAction');

            expect(assertionHandler._action).to.equal('myAction');
        });

        it('should set assertionHandler._actionConfig to equal the passed in actionConfig', function() {
            assertionHandler.assertExpectedPageState('', '', 'myActionConfig');

            expect(assertionHandler._actionConfig).to.equal('myActionConfig');
        });

        it('should set assertionHandler._dataStore to equal the passed in dataStore', function() {
            assertionHandler.assertExpectedPageState('', '', '', 'myDataStore');

            expect(assertionHandler._dataStore).to.equal('myDataStore');
        });

        it('should set assertionHandler._actionParameters to equal the passed in actionParameters', function() {
            assertionHandler.assertExpectedPageState('', '', '', '', 'myActionParameters');

            expect(assertionHandler._actionParameters).to.equal('myActionParameters');
        });

        it('should call assertionHandler.emit twice', function() {
            assertionHandler.assertExpectedPageState();

            expect(assertionHandler.emit.callCount).to.equal(2);
        });

        it('should call assertionHandler.emit once with the event ' +
            '\'assertionHandler.cloneAndApplyEffects\'', function() {
            assertionHandler.assertExpectedPageState();

            expect(assertionHandler.emit.args[0]).to.deep.equal([
                'assertionHandler.cloneAndApplyEffects',
            ]);
        });

        it('should call assertionHandler.emit once with the event ' +
            '\'assertionHandler.assertPageStateConfigured\'', function() {
            assertionHandler.assertExpectedPageState();

            expect(assertionHandler.emit.args[1]).to.deep.equal([
                'assertionHandler.assertExpectedPageStateConfigured',
            ]);
        });
    });

    describe('_getAndCheckExpectedPageStateContinually', function() {
        let Emitter;
        let clock;
        let assertionHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/assertion-handler.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            clock = sinon.useFakeTimers(381);
            global.SimulatoError = {
                ACTION: {
                    EXPECTED_STATE_ERROR: sinon.stub(),
                },
            };

            mockery.registerMock('../util/emitter.js', Emitter);

            assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            assertionHandler._clonedExpectedState = {
                _state: {
                    property: 'value',
                },
            };
        });

        afterEach(function() {
            delete global.SimulatoError;
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
                global.SimulatoError.ACTION.EXPECTED_STATE_ERROR.returns(
                    {message: 'My Error'}
                );

                expect(assertionHandler._getAndCheckExpectedPageStateContinually).to.throw('My Error');
            });

            it('should call SimulatoError.ACTION.EXPECTED_STATE_ERROR once with a message', function() {
                assertionHandler._timeout = 100;
                global.SimulatoError.ACTION.EXPECTED_STATE_ERROR.returns(
                    {message: 'My Error'}
                );

                try {
                    assertionHandler._getAndCheckExpectedPageStateContinually();
                } catch (error) {

                }

                expect(SimulatoError.ACTION.EXPECTED_STATE_ERROR.args).to.deep.equal([
                    ['Page state did not equal expected state'],
                ]);
            });
        });

        describe('if Date.now() returns a value equal to assertionHandler._timeout', function() {
            it('should throw an error', function() {
                assertionHandler._timeout = 381;
                global.SimulatoError.ACTION.EXPECTED_STATE_ERROR.returns(
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
        let Emitter;
        let assertionHandler;
        let next;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/assertion-handler.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            next = sinon.stub();

            mockery.registerMock('../util/emitter.js', Emitter);

            assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            assertionHandler._clonedExpectedState = {
                getState: sinon.stub(),
            };
            assertionHandler._expectedState = {};
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call assertionHandler.emitAsync with with the event \'assertionHandler.getPageState\', ' +
            'assertionHandler._components, and next', function() {
            assertionHandler._components = new Map([['name', 'myComponent']]);
            let generator = assertionHandler._getAndCheckExpectedPageState();

            generator.next();
            generator.next(next);

            expect(assertionHandler.emitAsync.args[0]).to.deep.equal([
                'assertionHandler.getPageState',
                new Map([['name', 'myComponent']]),
                next,
            ]);
        });

        it('should call assertionHandler.emit with the event \'assertionHandler.cloneAndApplyEffects\'', function() {
            let generator = assertionHandler._getAndCheckExpectedPageState();

            generator.next();
            generator.next(next);
            generator.next();

            expect(assertionHandler.emit.args[0]).to.deep.equal(['assertionHandler.cloneAndApplyEffects']);
        });

        it('should call assertionHandler._clonedExpectedState.getState once with no parameters', function() {
            let generator = assertionHandler._getAndCheckExpectedPageState();

            generator.next();
            generator.next(next);
            generator.next();

            expect(assertionHandler._clonedExpectedState.getState.args).to.deep.equal([[]]);
        });

        it('should call assertionHandler.emit with the event \'assertionHandler.runDeepEqual\', ' +
            'assertionHandler._pageState, the state, and next', function() {
            assertionHandler._clonedExpectedState.getState.returns('myState');
            let generator = assertionHandler._getAndCheckExpectedPageState();

            generator.next();
            generator.next(next);
            generator.next({name: 'state'});

            expect(assertionHandler.emitAsync.args[1]).to.deep.equal([
                'assertionHandler.runDeepEqual',
                {name: 'state'},
                'myState',
                next,
            ]);
        });

        it('should call assertionHandler.emitAsync twice', function() {
            let generator = assertionHandler._getAndCheckExpectedPageState();

            generator.next();
            generator.next(next);
            generator.next();

            expect(assertionHandler.emitAsync.callCount).to.equal(2);
        });

        describe('when the yield with the event \'assertionHandler.runDeepEqual\' throws', function() {
            it('should call assertionHandler.emit with the event \'assertionHandler.effectsFailed\'', function() {
                let generator = assertionHandler._getAndCheckExpectedPageState();

                generator.next();
                generator.next(next);
                generator.next();
                generator.throw(new Error('An error occurred'));

                expect(assertionHandler.emit.args[1]).to.deep.equal([
                    'assertionHandler.effectsFailed',
                ]);
            });

            it('should call assertionHandler.emit twice', function() {
                let generator = assertionHandler._getAndCheckExpectedPageState();

                generator.next();
                generator.next(next);
                generator.next();
                generator.throw(new Error('An error occurred'));

                expect(assertionHandler.emit.callCount).to.equal(2);
            });
        });

        describe('when the yield with the event \'assertionHandler.runDeepEqual\' does not throw', function() {
            it('should set assertionHandler._expectedState._pageState to equal ' +
                'assertionHandler._pageState', function() {
                    let generator = assertionHandler._getAndCheckExpectedPageState();

                    generator.next();
                    generator.next(next);
                    generator.next({name: 'state'});
                    generator.next();

                    expect(assertionHandler._expectedState._pageState).to.deep.equal({name: 'state'});
            });

            it('should call assertionHandler.emit with the event \'assertionHandler.effectsVerified\'', function() {
                let generator = assertionHandler._getAndCheckExpectedPageState();

                generator.next();
                generator.next(next);
                generator.next();
                generator.next();

                expect(assertionHandler.emit.args[1]).to.deep.equal([
                    'assertionHandler.effectsVerified',
                ]);
            });

            it('should call assertionHandler.emit twice', function() {
                let generator = assertionHandler._getAndCheckExpectedPageState();

                generator.next();
                generator.next(next);
                generator.next();
                generator.next();

                expect(assertionHandler.emit.callCount).to.equal(2);
            });
        });
    });

    describe('_cloneAndAppyEffects', function() {
        let Emitter;
        let assertionHandler;
        let component;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/assertion-handler.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            component = {
                actions: {
                    MY_ACTION: {
                        effects: sinon.stub(),
                    },
                },
            };

            mockery.registerMock('../util/emitter.js', Emitter);

            assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            assertionHandler._clonedExpectedState = {
                getComponent: sinon.stub().returns(component),
                getComponentsAsMap: sinon.stub(),
            };
            assertionHandler._clonedDataStore = {
                key: 'value',
            };
            assertionHandler._actionConfig = {
                actionName: 'MY_ACTION',
                name: 'myName',
            };
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call assertionHanlder.emit once with with the event \'assertionHandler.clone\'', function() {
            assertionHandler._cloneAndApplyEffects();

            expect(assertionHandler.emit.args).to.deep.equal([
                [
                    'assertionHandler.clone',
                ],
            ]);
        });

        it('should call assertionHandler._clonedExpectedState.getComponet once with ' +
            'assertionHandler._actionConfig.name as the parameter', function() {
            assertionHandler._cloneAndApplyEffects();

            expect(assertionHandler._clonedExpectedState.getComponent.args).to.deep.equal([
                [
                    'myName',
                ],
            ]);
        });

        describe('if assertionHandler._actionParameters is defined', function() {
            it('should call component.actions.MY_ACTION.effects once with assertionHandler._actionParameters, assert' +
                'ionHandler._clonedExpectedState, and assertionHandler._clonedDataStore as parameters', function() {
                assertionHandler._actionParameters = ['myParam', 'mySecondParam'];

                assertionHandler._cloneAndApplyEffects();

                expect(component.actions.MY_ACTION.effects.args).to.deep.equal([
                    [
                        'myParam',
                        'mySecondParam',
                        assertionHandler._clonedExpectedState,
                        {key: 'value'},
                    ],
                ]);
            });

            it('should call component.actions.MY_ACTION.effects in the context of hte component', function() {
                assertionHandler._actionParameters = ['myParam', 'mySecondParam'];

                assertionHandler._cloneAndApplyEffects();

                expect(component.actions.MY_ACTION.effects.thisValues).to.deep.equal([
                    component,
                ]);
            });
        });

        describe('if assertionHandler._actionParameters is not defined', function() {
            it('should call component.actions.MY_ACTION.effects once with the assertion Handler._clonedExpectedState' +
                ' and assertionHandler._clonedDataStore as parameters', function() {
                assertionHandler._cloneAndApplyEffects();

                expect(component.actions.MY_ACTION.effects.args).to.deep.equal([
                    [
                        assertionHandler._clonedExpectedState,
                        {key: 'value'},
                    ],
                ]);
            });

            it('should call component.actions.MY_ACTION.effects in the context of hte component', function() {
                assertionHandler._cloneAndApplyEffects();

                expect(component.actions.MY_ACTION.effects.thisValues).to.deep.equal([
                    component,
                ]);
            });
        });

        describe('when component.actions.MY_ACTION.effects throws', function() {
            it('should throw an error with the modified message', function() {
                component.actions.MY_ACTION.effects.throws(new Error('An Error Occurred!'));

                expect(assertionHandler._cloneAndApplyEffects).to.throw(
                    `The error 'An Error Occurred!' was thrown while executing the effects ` +
                    `function for 'myName' - 'MY_ACTION'`
                );
            });
        });

        describe('when component.actions.MY_ACTION.effects does not throw', function() {
            it('should set assertionHandler._components to the result of the function call to ' +
                'assertionHandler._clonedExpectedState.getComponentsAsMap', function() {
                let components = new Map([['name', 'myComponent']]);
                assertionHandler._clonedExpectedState.getComponentsAsMap.returns(components);

                assertionHandler._cloneAndApplyEffects();

                expect(assertionHandler._components).to.deep.equal(new Map([['name', 'myComponent']]));
            });
        });
    });

    describe('_cloneAndGetPreconditions', function() {
        let Emitter;
        let assertionHandler;
        let component;
        let callback;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/assertion-handler.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            component = {
                actions: {
                    MY_ACTION: {
                        preconditions: sinon.stub(),
                    },
                },
            };
            callback = sinon.stub();

            mockery.registerMock('../util/emitter.js', Emitter);

            assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            assertionHandler._clonedExpectedState = {
                getComponent: sinon.stub().returns(component),
                getComponentsAsMap: sinon.stub().returns(new Map([['myName', component]])),
            };
            assertionHandler._clonedDataStore = {
                key: 'value',
            };
            assertionHandler._actionConfig = {
                actionName: 'MY_ACTION',
                name: 'myName',
            };
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call assertionHanlder.emit once with with the event \'assertionHandler.clone\'', function() {
            assertionHandler._cloneAndGetPreconditions(callback);

            expect(assertionHandler.emit.args).to.deep.equal([
                [
                    'assertionHandler.clone',
                ],
            ]);
        });

        it('should set assertionHandler._components to the result of the function call to ' +
            'assertionHandler._clonedExpectedState.getComponentsAsMap', function() {
            assertionHandler._cloneAndGetPreconditions(callback);

            expect(assertionHandler._components).to.deep.equal(new Map([['myName', component]]));
        });

        it('should call assertionHandler._clonedExpectedState.getComponet once with ' +
            'assertionHandler._actionConfig.name as the parameter', function() {
            assertionHandler._cloneAndGetPreconditions(callback);

            expect(assertionHandler._clonedExpectedState.getComponent.args).to.deep.equal([
                [
                    'myName',
                ],
            ]);
        });

        describe('if assertionHandler._actionParameters is defined', function() {
            it('should call component.actions.MY_ACTION.preconditions once with assertionHandler._actionParameters' +
                ', assertionHandler._clonedExpectedState, and ' +
                'assertionHandler._clonedDataStore as parameters', function() {
                assertionHandler._actionParameters = ['myParam', 'mySecondParam'];

                assertionHandler._cloneAndGetPreconditions(callback);

                expect(component.actions.MY_ACTION.preconditions.args).to.deep.equal([
                    [
                        'myParam',
                        'mySecondParam',
                        {key: 'value'},
                    ],
                ]);
            });

            it('should call component.actions.MY_ACTION.preconditions in the context of hte component', function() {
                assertionHandler._actionParameters = ['myParam', 'mySecondParam'];

                assertionHandler._cloneAndGetPreconditions(callback);

                expect(component.actions.MY_ACTION.preconditions.thisValues).to.deep.equal([
                    component,
                ]);
            });
        });

        describe('if assertionHandler._actionParameters is not defined', function() {
            it('should call component.actions.MY_ACTION.preconditions once with , assertionHandler._clonedExpected' +
                'State, and assertionHandler._clonedDataStore as parameters', function() {
                assertionHandler._cloneAndGetPreconditions(callback);

                expect(component.actions.MY_ACTION.preconditions.args).to.deep.equal([
                    [
                        {key: 'value'},
                    ],
                ]);
            });

            it('should call component.actions.MY_ACTION.preconditions in the context of hte component', function() {
                assertionHandler._cloneAndGetPreconditions(callback);

                expect(component.actions.MY_ACTION.preconditions.thisValues).to.deep.equal([
                    component,
                ]);
            });
        });

        describe('when component.actions.MY_ACTION.preconditions throws', function() {
            it('should throw an error with the modified message', function() {
                component.actions.MY_ACTION.preconditions.throws(new Error('An Error Occurred!'));

                expect(assertionHandler._cloneAndGetPreconditions.bind(null, callback)).to.throw(
                    `The error 'An Error Occurred!' was thrown while executing the preconditions ` +
                    `function for 'myName' - 'MY_ACTION'`
                );
            });
        });

        describe('when component.actions.MY_ACTION.preconditions does not throw', function() {
            it('should call the callback once with null and the result of the call to ' +
                'component.actions.MY_ACTION.preconditions', function() {
                component.actions.MY_ACTION.preconditions.returns([['isTrue', true]]);

                assertionHandler._cloneAndGetPreconditions(callback);

                expect(callback.args).to.deep.equal([
                    [
                        null,
                        [['isTrue', true]],
                    ],
                ]);
            });
        });
    });

    describe('_clone', function() {
        let Emitter;
        let assertionHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/assertion-handler.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };

            mockery.registerMock('../util/emitter.js', Emitter);

            assertionHandler = require('../../../../lib/executor/assertion-handler.js');

            assertionHandler._dataStore = {
                clone: sinon.stub(),
            };
            assertionHandler._expectedState = {
                clone: sinon.stub().callsArgWith(1, {_state: 'myState'}),
            };
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call expectedState._dataStore.clone once with no arguments', function() {
            assertionHandler._clone();

            expect(assertionHandler._dataStore.clone.args).to.deep.equal([[]]);
        });

        it('should call assertionHandler._expectedState.clone once', function() {
            assertionHandler._clone();

            expect(assertionHandler._expectedState.clone.callCount).to.equal(1);
        });

        it('should call assertionHandler._expectedState.clone with the clonedDataStore', function() {
            assertionHandler._dataStore.clone.returns({key: 'value'});

            assertionHandler._clone();

            expect(assertionHandler._expectedState.clone.args[0][0]).to.deep.equal({key: 'value'});
        });

        it('should set assertionHandler._clonedExpectedState._pageState equal to ' +
            'assertionHandler._pageState', function() {
            assertionHandler._pageState = {
                name: 'state',
            };

            assertionHandler._clone();

            expect(assertionHandler._clonedExpectedState._pageState).to.deep.equal(
                {name: 'state'}
            );
        });

        it('should set assertionHandler._clonedDataStore to the clonedDataStore', function() {
            assertionHandler._dataStore.clone.returns({key: 'value'});

            assertionHandler._clone();

            expect(assertionHandler._clonedDataStore).to.deep.equal({key: 'value'});
        });
    });
});
