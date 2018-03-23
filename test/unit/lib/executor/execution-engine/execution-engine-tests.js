'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/executor/execution-engine/execution-engine.js', function() {
    describe('on file being required', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let executionEngine;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/execution-engine/execution-engine.js');

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

        it('should set the object prototype of executionEngine to a new EventEmitter', function() {
            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');

            expect(Object.getPrototypeOf(executionEngine)).to.deep.equal(EventEmitterInstance);
        });

        it('should call executionEngine.on 7 times', function() {
            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');

            expect(executionEngine.on.callCount).to.equal(7);
        });

        it('should call executionEngine.on with the event \'executionEngine.configured\' and the ' +
            'function executionEngine._executeNextAction', function() {
            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');

            expect(executionEngine.on.args[0]).to.deep.equal([
                'executionEngine.configured',
                executionEngine._executeNextAction,
            ]);
        });

        it('should call executionEngine.on with the event \'executionEngine.actionStarted\' and the ' +
            'function executionEngine._executeStep', function() {
            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');


            expect(executionEngine.on.args[1]).to.deep.equal([
                'executionEngine.actionStarted',
                executionEngine._executeStep,
            ]);
        });

        it('should call executionEngine.on with the event \'executionEngine.stepCompleted\' and the ' +
            'function executionEngine._stepCompleted', function() {
            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');


            expect(executionEngine.on.args[2]).to.deep.equal([
                'executionEngine.stepCompleted',
                executionEngine._stepCompleted,
            ]);
        });

        it('should call executionEngine.on with the event \'executionEngine.actionFinished\' and the ' +
            'function executionEngine._executeNextAction', function() {
            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');


            expect(executionEngine.on.args[3]).to.deep.equal([
                'executionEngine.actionFinished',
                executionEngine._executeNextAction,
            ]);
        });

        it('should call executionEngine.on with the event \'executionEngine.nextStepReadied\' and the ' +
            'function executionEngine._executeStep', function() {
            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');


            expect(executionEngine.on.args[4]).to.deep.equal([
                'executionEngine.nextStepReadied',
                executionEngine._executeStep,
            ]);
        });

        it('should call executionEngine.on with the event \'executionEngine.actionsFinished\' and the ' +
            'function executionEngine.done', function() {
            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');


            expect(executionEngine.on.args[5]).to.deep.equal([
                'executionEngine.actionsFinished',
                executionEngine.done,
            ]);
        });

        it('should call executionEngine.on with the event \'executionEngine.errorHandled\' and the ' +
            'function executionEngine.done', function() {
            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');


            expect(executionEngine.on.args[6]).to.deep.equal([
                'executionEngine.errorHandled',
                executionEngine.done,
            ]);
        });
    });

    describe('configure', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let testCaseActions;
        let expectedState;
        let executionEngine;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/execution-engine/execution-engine.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            expectedState = {
                createAndAddComponent: sinon.stub(),
            };
            testCaseActions = [{
                componentName: 'myComponent',
                instanceName: 'myInstance',
                state: {_state: {property: 'value'}},
                options: {opt: 'myOption'},
            }];
            sinon.spy(testCaseActions, 'shift');

            mockery.registerMock('events', {EventEmitter});

            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should set executionEngine._actionList to the passed in testCaseActions', function() {
            executionEngine.configure(testCaseActions);

            expect(executionEngine._actionList).to.deep.equal([
                {
                    componentName: 'myComponent',
                    instanceName: 'myInstance',
                    state: {_state: {property: 'value'}},
                    options: {opt: 'myOption'},
                },
            ]);
        });

        it('should call exeuctionEngine.emit once with the event \'executionEngine.createDataStore\'', function() {
            executionEngine.configure();

            expect(executionEngine.emit.args[0][0]).to.equal('executionEngine.createDataStore');
        });

        describe('when the callback for the event \'executionEngine.createDataStore\' is called', function() {
            it('should set executionEngine._dataStore to the passed in dataStore', function() {
                executionEngine.emit.onCall(0).callsArgWith(1, 'myDataStore');

                executionEngine.configure();

                expect(executionEngine._dataStore).to.equal('myDataStore');
            });

            it('should call emit with the event \'executionEngine.createExpectedState\'' +
                'and the passed in dataStore', function() {
                executionEngine.emit.onCall(0).callsArgWith(1, 'myDataStore');

                executionEngine.configure();

                expect(executionEngine.emit.args[1].slice(0, 2)).to.deep.equal([
                    'executionEngine.createExpectedState',
                    'myDataStore',
                ]);
            });

            describe('when the callback for the event \'executionEngine.createExpectedState\' is called', function() {
                it('should call executionEngine._actionList.shift once', function() {
                    executionEngine.emit.onCall(0).callsArgWith(1, '');
                    executionEngine.emit.onCall(1).callsArgWith(2, expectedState);

                    executionEngine.configure(testCaseActions);

                    expect(executionEngine._actionList.shift.callCount).to.equal(1);
                });

                it('should set executionEngine.expectedState to the passed in expectedState', function() {
                    executionEngine.emit.onCall(0).callsArgWith(1, '');
                    executionEngine.emit.onCall(1).callsArgWith(2, expectedState);

                    executionEngine.configure(testCaseActions);

                    expect(executionEngine._expectedState).to.deep.equal({
                        createAndAddComponent: expectedState.createAndAddComponent,
                    });
                });

                it('should call executionEngine._expectedState.createAndAddComponent with parameters componentName, ' +
                    'instanceName, state, and options from the first' +
                    'action on executionEngine._actionList', function() {
                    executionEngine.emit.onCall(0).callsArgWith(1, '');
                    executionEngine.emit.onCall(1).callsArgWith(2, expectedState);

                    executionEngine.configure(testCaseActions);

                    expect(expectedState.createAndAddComponent.args).to.deep.equal([
                        [
                            'myComponent',
                            'myInstance',
                            {_state: {property: 'value'}},
                            {opt: 'myOption'},
                        ],
                    ]);
                });

                it('should call emit once with the event \'executionEngine.configured\'', function() {
                    executionEngine.emit.onCall(0).callsArgWith(1, '');
                    executionEngine.emit.onCall(1).callsArgWith(2, expectedState);

                    executionEngine.configure(testCaseActions);

                    expect(executionEngine.emit.args[2]).to.deep.equal([
                        'executionEngine.configured',
                    ]);
                });

                it('should call emit thrice', function() {
                    executionEngine.emit.onCall(0).callsArgWith(1, '');
                    executionEngine.emit.onCall(1).callsArgWith(2, expectedState);

                    executionEngine.configure(testCaseActions);

                    expect(executionEngine.emit.callCount).to.equal(3);
                });
            });
        });
    });

    describe('_executeNextAction', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let components;
        let executionEngine;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/execution-engine/execution-engine.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});

            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');

            sinon.spy(executionEngine._actionList, 'shift');
            sinon.spy(executionEngine._steps, 'push');
            components = new Map([
                [
                    'myInstance',
                    {
                        actions: {
                            MY_ACTION: {
                                preconditions: sinon.stub(),
                                perform: sinon.stub(),
                                effects: sinon.stub(),
                            },
                        },
                    },
                ],
            ]);
            executionEngine._actionList.push({
                    name: 'myInstance.MY_ACTION',
            });
            executionEngine._expectedState = {
                getComponentsAsMap: sinon.stub().returns(components),
            };
        });

        afterEach(function() {
            executionEngine._actionList.shift.restore();
            executionEngine._steps.push.restore();
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('if executionEngine._actionList.length is 0', function() {
            it('should call executionEngine.emit', function() {
                executionEngine._actionList.pop();

                executionEngine._executeNextAction();

                expect(executionEngine.emit.args).to.deep.equal([
                    ['executionEngine.actionsFinished'],
                ]);
            });
        });

        describe('if executionEngine._actionList.length is not 0', function() {
            it('should set exectutionEngine._actionConfig to the first item in ' +
                'executionEngine._actionslist along with instanceName and actionName from the name', function() {
                executionEngine._executeNextAction();

                expect(executionEngine._actionConfig).to.deep.equal({
                    name: 'myInstance.MY_ACTION',
                    instanceName: 'myInstance',
                    actionName: 'MY_ACTION',
                });
            });

            it('should call executionEngine._actionList.shift once', function() {
                executionEngine._executeNextAction();

                expect(executionEngine._actionList.shift.callCount).to.equal(1);
            });

            it('should throw an error if components does not have an instanceName', function() {
                executionEngine._expectedState.getComponentsAsMap.returns(new Map());

                expect(executionEngine._executeNextAction).to.throw(
                    'Component, myInstance, does not exist in expected state during execution'
                );
            });

            it('should set executionEngine._action to the action retrieved from the components ' +
                'by instanceName and actionName', function() {
                executionEngine._executeNextAction();

                expect(executionEngine._action).to.deep.equal(components.get('myInstance').actions.MY_ACTION);
            });

            it('should throw an error if the action does not exist on the component', function() {
                executionEngine._actionList[0].name = 'myInstance.NONEXISTENT_ACTION';

                expect(executionEngine._executeNextAction).to.throw(
                    'Action, NONEXISTENT_ACTION, does not exist in component myInstance'
                );
            });

            it('should call executionEngine._steps.push with the string \'perform\'', function() {
                executionEngine._executeNextAction();

                expect(executionEngine._steps.push.args[1]).to.deep.equal(['perform']);
            });

            it('should call executionEngine._steps.push with the string \'effects\'', function() {
                executionEngine._executeNextAction();

                expect(executionEngine._steps.push.args[2]).to.deep.equal(['effects']);
            });

            describe('if the executionEngine._action.preconditions is undefined', function() {
                it('should call executionEngine._steps.push twice', function() {
                    delete components.get('myInstance').actions.MY_ACTION.preconditions;

                    executionEngine._executeNextAction();

                    expect(executionEngine._steps.push.callCount).to.equal(2);
                });
            });

            describe('if the executionEngine._action.preconditions is defined', function() {
                it('should call executionEngine._steps.push thrice', function() {
                    executionEngine._executeNextAction();

                    expect(executionEngine._steps.push.callCount).to.equal(3);
                });

                it('should call executionEngine._steps.push with the string \'preconditions\'', function() {
                    executionEngine._executeNextAction();

                    expect(executionEngine._steps.push.args[0]).to.deep.equal(['preconditions']);
                });
            });

            it('should call executionEngine.emit with the event \'executionEngine.actionStarted\' and ' +
                'executionEngine._action, executionEngine._actionConfig, and executionEngine._steps', function() {
                executionEngine._executeNextAction();

                expect(executionEngine.emit.args).to.deep.equal([
                    [
                        'executionEngine.actionStarted',
                        components.get('myInstance').actions.MY_ACTION,
                        {
                            name: 'myInstance.MY_ACTION',
                            instanceName: 'myInstance',
                            actionName: 'MY_ACTION',
                        },
                        ['preconditions', 'perform', 'effects'],
                    ],
                ]);
            });
        });
    });

    describe('_executeStep', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let executionEngine;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/execution-engine/execution-engine.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});

            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');

            executionEngine._steps = ['preconditions', 'perform', 'effects'];
            sinon.spy(executionEngine._steps, 'shift');
            executionEngine._actionConfig = {
                instanceName: 'testName',
                actionName: 'testAction',
            };
            executionEngine._action = {
                preconditions: sinon.stub(),
                perform: sinon.stub(),
                effects: sinon.stub(),
            };
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('if executionEngine._steps.length is 0', function() {
            it('should call once executionEngine.emit with the event \'executionEngine.actionFinished\' ' +
                'executionEngine._action', function() {
                executionEngine._steps = [];
                executionEngine._action = {
                    perform: 'my perform function',
                    effects: 'my effects function',
                };

                executionEngine._executeStep();

                expect(executionEngine.emit.args).to.deep.equal([
                    [
                        'executionEngine.actionFinished',
                        {
                            perform: 'my perform function',
                            effects: 'my effects function',
                        },
                    ],
                ]);
            });
        });

        describe('if executionEngine._steps.length is greater than 0', function() {
            it('should call executionEngine._steps.shift once', function() {
                executionEngine._executeStep();

                expect(executionEngine._steps.shift.callCount).to.equal(1);
            });

            it('should call executionEngine.emit with the event \'executionEngine.stepStarted\' ' +
                'and executionEngine._step', function() {
                executionEngine._executeStep();

                expect(executionEngine.emit.args[0]).to.deep.equal([
                    'executionEngine.stepStarted',
                    'preconditions',
                ]);
            });

            describe('when the executionEngine._step is equal to the string \'preconditions\'', function() {
                describe('if executionEngine._actionConfig.options.parameters is defined', function() {
                    it('should call the executionEngine._action.preconditions with the spread ' +
                        'actionParameters', function() {
                        executionEngine._actionConfig.options = {
                            parameters: ['param1', 'param2'],
                        };

                        executionEngine._executeStep();

                        expect(executionEngine._action.preconditions.args).to.deep.equal([
                            [
                                'param1',
                                'param2',
                            ],
                        ]);
                    });
                });

                describe('if executionEngine._actionConfig.options.parameters is not defined', function() {
                    it('should call the executionEngine._action.preconditions with no parameters', function() {
                        executionEngine._executeStep();

                        expect(executionEngine._action.preconditions.args).to.deep.equal([[]]);
                    });
                });

                it('should call executionEngine.emit twice', function() {
                    executionEngine._executeStep();

                    expect(executionEngine.emit.callCount).to.equal(2);
                });

                it('should call executionEngine.emit with the event \'executionEngine.preconditionsReady\' ' +
                    'as the first parameter', function() {
                    executionEngine._executeStep();

                    expect(executionEngine.emit.args[1][0]).to.equal('executionEngine.preconditionsReady');
                });

                it('should call executionEngine.emit with executionEngine._expectedState as the second ' +
                    'parameter', function() {
                    executionEngine._expectedState = {_state: 'myState'};

                    executionEngine._executeStep();

                    expect(executionEngine.emit.args[1][1]).to.deep.equal({_state: 'myState'});
                });

                it('should call executionEngine.emit with the preconditions as the third parameter', function() {
                    executionEngine._action.preconditions.returns([['isTrue', 'myElement.displayed']]);

                    executionEngine._executeStep();

                    expect(executionEngine.emit.args[1][2]).to.deep.equal([['isTrue', 'myElement.displayed']]);
                });

                it('should call executionEngine.emit with the number \'10000\' as the fourth parameter', function() {
                    executionEngine._action.preconditions.returns([['isTrue', 'myElement.displayed']]);

                    executionEngine._executeStep();

                    expect(executionEngine.emit.args[1][3]).to.equal(10000);
                });

                it('should call executionEngine.emit with a function as the fifth parameter', function() {
                    executionEngine._action.preconditions.returns([['isTrue', 'myElement.displayed']]);

                    executionEngine._executeStep();

                    expect(executionEngine.emit.args[1][4]).to.be.a('function');
                });


                describe('when the executionEngine._action.perform callback is called', function() {
                    describe('if there is an error', function() {
                        it('should throw the error', function() {
                            let error = new Error('An error occurred!');
                            executionEngine.emit.onCall(1).callsArgWith(4, error);
                            executionEngine._action.preconditions.returns([['isTrue', 'myElement.displayed']]);

                            expect(executionEngine._executeStep.bind(null)).to.throw('An error occurred!');
                        });
                    });
                    describe('if there is not an error', function() {
                        it('should call executionEngine.emit three times', function() {
                            executionEngine.emit.onCall(1).callsArg(4);
                            executionEngine._action.preconditions.returns([['isTrue', 'myElement.displayed']]);

                            executionEngine._executeStep();

                            expect(executionEngine.emit.callCount).to.equal(3);
                        });

                        it('should call executionEngine.emit with the event' +
                            ' \'executionEngine.stepCompleted\'', function() {
                            executionEngine.emit.onCall(1).callsArgWith(4);

                            executionEngine._executeStep();

                            expect(executionEngine.emit.args[2]).to.deep.equal([
                                'executionEngine.stepCompleted',
                            ]);
                        });
                    });
                });
            });

            describe('when the executionEngine._step is equal to the string \'perform\'', function() {
                describe('if executionEngine._actionConfig.options.parameters is defined', function() {
                    it('should call executionEngine._action.perform once', function() {
                        executionEngine._steps = ['perform', 'effects'];
                        executionEngine._actionConfig.options = {
                            parameters: ['param1'],
                        };

                        executionEngine._executeStep();

                        expect(executionEngine._action.perform.callCount).to.equal(1);
                    });

                    it('should call executionEngine._action.perform with the spread parameters prepended', function() {
                        executionEngine._steps = ['perform', 'effects'];
                        executionEngine._actionConfig.options = {
                            parameters: ['param1'],
                        };

                        executionEngine._executeStep();

                        expect(executionEngine._action.perform.args[0][0]).to.equal('param1');
                    });

                    it('should call executionEngine._action.perform with a function as the last parameter', function() {
                        executionEngine._steps = ['perform', 'effects'];
                        executionEngine._actionConfig.options = {
                            parameters: ['param1', 'param2'],
                        };

                        executionEngine._executeStep();

                        expect(executionEngine._action.perform.args[0][2]).to.be.a('function');
                    });

                    describe('when the executionEngine._action.perform callback is called', function() {
                        describe('if there is an error returned', function() {
                            it('should throw the error', function() {
                                let error = new Error('An error occurred!');
                                executionEngine._steps = ['perform', 'effects'];
                                executionEngine._actionConfig.options = {
                                    parameters: ['param1', 'param2'],
                                };

                                executionEngine._executeStep();
                                let callback = executionEngine._action.perform.args[0][2];

                                expect(callback.bind(null, error)).to.throw('An error occurred!');
                            });
                        });
                        describe('if there is not an error returned', function() {
                            it('should call executionEngine.emit with twice', function() {
                                executionEngine._action.perform.callsArg(2);
                                executionEngine._steps = ['perform', 'effects'];
                                executionEngine._actionConfig.options = {
                                    parameters: ['param1', 'param2'],
                                };

                                executionEngine._executeStep();

                                expect(executionEngine.emit.callCount).to.equal(2);
                            });

                            it('should call executionEngine.emit with the event \'executionEngine.stepCompleted\'' +
                                'and the passed in error', function() {
                                executionEngine._action.perform.callsArgWith(2);
                                executionEngine._steps = ['perform', 'effects'];
                                executionEngine._actionConfig.options = {
                                    parameters: ['param1', 'param2'],
                                };

                                executionEngine._executeStep();

                                expect(executionEngine.emit.args[1]).to.deep.equal([
                                    'executionEngine.stepCompleted',
                                ]);
                            });
                        });
                    });
                    it('should catch an error if one is thrown by executionEngine._action.perform ', function() {
                            executionEngine._steps = ['perform', 'effects'];
                            executionEngine._actionConfig.options = {
                                parameters: ['param1'],
                            };
                            executionEngine._action.perform.throws(new Error('TEST_ERROR'));

                            expect(executionEngine._executeStep).to.throw('The error \'TEST_ERROR\' was thrown '
                            + 'while executing the perform function for \'testName\' - \'testAction\'');
                    });
                });

                describe('if executionEngine._actionConfig.options.parameters is not defined', function() {
                    it('should call executionEngine._action.perform once', function() {
                        executionEngine._steps = ['perform', 'effects'];

                        executionEngine._executeStep();

                        expect(executionEngine._action.perform.callCount).to.equal(1);
                    });

                    it('should call executionEngine._action.perform with a function as the first ' +
                        'parameter', function() {
                        executionEngine._steps = ['perform', 'effects'];

                        executionEngine._executeStep();

                        expect(executionEngine._action.perform.args[0][0]).to.be.a('function');
                    });

                    describe('when the executionEngine._action.perform callback is called', function() {
                        describe('if there was an error returned', function() {
                            it('should throw the error', function() {
                                let error = new Error('An error occurred!');
                                executionEngine._steps = ['perform', 'effects'];

                                executionEngine._executeStep();
                                let callback = executionEngine._action.perform.args[0][0];

                                expect(callback.bind(null, error)).to.throw('An error occurred!');
                            });
                        });
                        describe('if there was no error returned', function() {
                            it('should call executionEngine.emit with twice', function() {
                                executionEngine._action.perform.callsArg(0);
                                executionEngine._steps = ['perform', 'effects'];

                                executionEngine._executeStep();

                                expect(executionEngine.emit.callCount).to.equal(2);
                            });

                            it('should call executionEngine.emit with the event \'executionEngine.stepCompleted\'' +
                                'and the passed in error', function() {
                                executionEngine._action.perform.callsArgWith(0);
                                executionEngine._steps = ['perform', 'effects'];

                                executionEngine._executeStep();

                                expect(executionEngine.emit.args[1]).to.deep.equal([
                                    'executionEngine.stepCompleted',
                                ]);
                            });
                        });
                    });
                    it('should catch an error if one is thrown by executionEngine._action.perform ', function() {
                        executionEngine._steps = ['perform', 'effects'];
                        executionEngine._action.perform.throws(new Error('TEST_ERROR'));

                        expect(executionEngine._executeStep).to.throw('The error \'TEST_ERROR\' was thrown '+
                        'while executing the perform function for \'testName\' - \'testAction\'');
                    });
                });
            });

            describe('when the executionEngine._step is equal to the string \'effects\'', function() {
                describe('if executionEngine._actionConfig.options.parameters is defined', function() {
                    it('should call executionEngine._action.effects once with the spread parameters ' +
                        'prepended and executionEngine._expectedState', function() {
                        executionEngine._steps = ['effects'];
                        executionEngine._expectedState = sinon.stub();
                        executionEngine._actionConfig.options = {
                            parameters: ['param1', 'param2'],
                        };

                        executionEngine._executeStep();

                        expect(executionEngine._action.effects.args).to.deep.equal([
                            [
                                'param1',
                                'param2',
                                executionEngine._expectedState,
                            ],
                        ]);
                    });
                    it('should catch an error if one is thrown by executionEngine._action.effects ', function() {
                        executionEngine._steps = ['effects'];
                        executionEngine._actionConfig.options = {
                            parameters: ['param1'],
                        };
                        executionEngine._action.effects.throws(new Error('TEST_ERROR'));

                        expect(executionEngine._executeStep).to.throw('The error \'TEST_ERROR\' was thrown ' +
                        'while executing the perform function for \'testName\' - \'testAction\'');
                    });
                });

                describe('if executionEngine._actionConfig.options.parameters is not defined', function() {
                    it('should call executionEngine._action.effects once with the ' +
                        'executionEngine._expectedState', function() {
                        let expectedState = sinon.stub();
                        executionEngine._expectedState = expectedState;
                        executionEngine._steps = ['effects'];

                        executionEngine._executeStep();

                        expect(executionEngine._action.effects.args).to.deep.equal([
                            [
                                expectedState,
                            ],
                        ]);
                    });
                    it('should catch an error if one is thrown by executionEngine._action.effects ', function() {
                        executionEngine._steps = ['effects'];
                        executionEngine._action.effects.throws(new Error('TEST_ERROR'));

                        expect(executionEngine._executeStep).to.throw('The error \'TEST_ERROR\' was thrown '+
                        'while executing the perform function for \'testName\' - \'testAction\'');
                    });
                });

                it('should call executionEngine.emit with twice', function() {
                    executionEngine._steps = ['effects'];

                    executionEngine._executeStep();

                    expect(executionEngine.emit.callCount).to.equal(2);
                });

                it('should call executionEngine.emit with the first parameter as the event ' +
                    '\'executionEngine.effectsApplied\'', function() {
                    executionEngine._steps = ['effects'];

                    executionEngine._executeStep();

                    expect(executionEngine.emit.args[1][0]).to.equal('executionEngine.effectsApplied');
                });

                it('should call executionEngine.emit with the second parameter as ' +
                    'executionEngine._expectedState', function() {
                    let expectedState = sinon.stub();
                    executionEngine._expectedState = expectedState;
                    executionEngine._steps = ['effects'];

                    executionEngine._executeStep();

                    expect(executionEngine.emit.args[1][1]).to.equal(expectedState);
                });

                it('should call executionEngine.emit with the third parameter as the number' +
                    '10000', function() {
                    executionEngine._steps = ['effects'];

                    executionEngine._executeStep();

                    expect(executionEngine.emit.args[1][2]).to.equal(10000);
                });

                it('should call executionEngine.emit with the fourth parameter as a function', function() {
                    executionEngine._steps = ['effects'];

                    executionEngine._executeStep();

                    expect(executionEngine.emit.args[1][3]).to.be.a('function');
                });

                describe('when the executionEngine.emit callback is called', function() {
                    describe('if the there was an error returned', function() {
                        it('should throw the error', function() {
                            let error = new Error('An error occurred!');
                            executionEngine.emit.onCall(1).callsArgWith(3, error);
                            executionEngine._steps = ['effects'];

                            expect(executionEngine._executeStep.bind(null)).to.throw('An error occurred!');
                        });
                    });

                    describe('if there was no error returned', function() {
                        it('should call executionEngine.emit with thrice', function() {
                            executionEngine.emit.onCall(1).callsArg(3);
                            executionEngine._steps = ['effects'];

                            executionEngine._executeStep();

                            expect(executionEngine.emit.callCount).to.equal(3);
                        });

                        it('should call executionEngine.emit with the event'
                            + ' \'executionEngine.stepCompleted\'', function() {
                            executionEngine.emit.onCall(1).callsArgWith(3);
                            executionEngine._steps = ['effects'];

                            executionEngine._executeStep();

                            expect(executionEngine.emit.args[2]).to.deep.equal([
                                'executionEngine.stepCompleted',
                            ]);
                        });
                    });
                });
            });
        });
    });

    describe('_stepCompleted', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let executionEngine;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/execution-engine/execution-engine.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});

            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');

            executionEngine._steps = ['preconditions', 'perform', 'effects'];
            executionEngine._actionConfig = {
                name: 'myInstance.MY_ACTION',
            };
            executionEngine._action = {
                preconditions: 'preconditions',
                perform: 'perform',
                effects: 'effects',
            };
            executionEngine._step = 'perform';
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call executionEngine.emit twice', function() {
            executionEngine._stepCompleted();

            expect(executionEngine.emit.callCount).to.equal(2);
        });

        it('should call executionEngine.emit with the event \'executionEngine.stepEnded\', null, ' +
            'executionEngine._action, executionEngine._actionConfig, executionEngine._step, ' +
            'and the string \'pass\' as parameters', function() {
            executionEngine._stepCompleted();

            expect(executionEngine.emit.args[0]).to.deep.equal([
                'executionEngine.stepEnded',
                null,
                {
                    preconditions: 'preconditions',
                    perform: 'perform',
                    effects: 'effects',
                },
                {
                    name: 'myInstance.MY_ACTION',
                },
                'perform',
                'pass',
            ]);
        });

        it('should call executionEngine.emit with the event \'executionEngine.nextStepReadied\',' +
            'executionEngine._action, executionEngine._actionConfig, executionEngine._step, ' +
            'as parameters', function() {
            executionEngine._stepCompleted();

            expect(executionEngine.emit.args[1]).to.deep.equal([
                'executionEngine.nextStepReadied',
                {
                    preconditions: 'preconditions',
                    perform: 'perform',
                    effects: 'effects',
                },
                {
                    name: 'myInstance.MY_ACTION',
                },
                ['preconditions', 'perform', 'effects'],
            ]);
        });
    });

    describe('errorOccurred', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let executionEngine;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/execution-engine/execution-engine.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});

            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');

            executionEngine._actionConfig = {
                name: 'myInstance.MY_ACTION',
            };
            executionEngine._action = {
                preconditions: 'preconditions',
                perform: 'perform',
                effects: 'effects',
            };
            executionEngine._step = 'perform';
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call executionEngine.emit with the event \'executionEngine.actionErrored\' ' +
            'and the passed in error', function() {
            let error = new Error('An error occurred!');

            executionEngine.errorOccurred(error, true);

            expect(executionEngine.emit.args[0]).to.deep.equal([
                'executionEngine.actionErrored',
                error,
            ]);
        });

        it('should call executionEngine.emit with the event \'executionEngine.stepEnded\', ' +
            'the passed in error, executionEngine._action,executionEngine._actionConfig, ' +
            'executionEngine._step, and the string \'fail\'', function() {
            let error = new Error('An error occurred!');

            executionEngine.errorOccurred(error, true);

            expect(executionEngine.emit.args[1]).to.deep.equal([
                'executionEngine.stepEnded',
                error,
                {
                    preconditions: 'preconditions',
                    perform: 'perform',
                    effects: 'effects',
                },
                {
                    name: 'myInstance.MY_ACTION',
                },
                'perform',
                'fail',
            ]);
        });
    });

    describe('done', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let executionEngine;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/execution-engine/execution-engine.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});

            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call executionEngine.emit once with the event \'executionEngine.done\'', function() {
            executionEngine.done();

            expect(executionEngine.emit.args).to.deep.equal([
                [
                    'executionEngine.done',
                ],
            ]);
        });
    });
});
