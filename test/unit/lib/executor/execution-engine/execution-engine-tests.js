'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/executor/execution-engine/execution-engine.js', function() {
    describe('on file being required', function() {
        let Emitter;
        let executionEngine;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/execution-engine/execution-engine.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');

            mockery.registerMock('../../util/emitter.js', Emitter);
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });


        it('should call Emitter.mixIn with the executionEngine', function() {
            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');

            expect(Emitter.mixIn.args).to.deep.equal([
                [
                    executionEngine,
                ],
            ]);
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
        let Emitter;
        let testCaseActions;
        let expectedState;
        let executionEngine;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/execution-engine/execution-engine.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');

            expectedState = {
                createAndAddComponent: sinon.stub(),
            };
            testCaseActions = [{
                type: 'myComponent',
                name: 'myName',
                state: {_state: {property: 'value'}},
                options: {opt: 'myOption'},
            }];
            sinon.spy(testCaseActions, 'shift');

            mockery.registerMock('../../util/emitter.js', Emitter);

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
                    type: 'myComponent',
                    name: 'myName',
                    state: {_state: {property: 'value'}},
                    options: {opt: 'myOption'},
                },
            ]);
        });

        it('should call exeuctionEngine.emitAsync once with the event \'executionEngine.createDataStore\'', function() {
            executionEngine.configure();

            expect(executionEngine.emitAsync.args[0][0]).to.equal('executionEngine.createDataStore');
        });

        describe('when the callback for the event \'executionEngine.createDataStore\' is called', function() {
            it('should set executionEngine._dataStore to the passed in dataStore', function() {
                executionEngine.emitAsync.onCall(0).callsArgWith(1, 'myDataStore');

                executionEngine.configure();

                expect(executionEngine._dataStore).to.equal('myDataStore');
            });

            it('should call emitAsync with the event \'executionEngine.createExpectedState\'' +
                'and the passed in dataStore', function() {
                executionEngine.emitAsync.onCall(0).callsArgWith(1, 'myDataStore');

                executionEngine.configure();

                expect(executionEngine.emitAsync.args[1].slice(0, 2)).to.deep.equal([
                    'executionEngine.createExpectedState',
                    'myDataStore',
                ]);
            });

            describe('when the callback for the event \'executionEngine.createExpectedState\' is called', function() {
                it('should call executionEngine._actionList.shift once', function() {
                    executionEngine.emitAsync.onCall(0).callsArgWith(1, '');
                    executionEngine.emitAsync.onCall(1).callsArgWith(2, expectedState);

                    executionEngine.configure(testCaseActions);

                    expect(executionEngine._actionList.shift.callCount).to.equal(1);
                });

                it('should set executionEngine.expectedState to the passed in expectedState', function() {
                    executionEngine.emitAsync.onCall(0).callsArgWith(1, '');
                    executionEngine.emitAsync.onCall(1).callsArgWith(2, expectedState);

                    executionEngine.configure(testCaseActions);

                    expect(executionEngine._expectedState).to.deep.equal({
                        createAndAddComponent: expectedState.createAndAddComponent,
                    });
                });

                it('should call executionEngine._expectedState.createAndAddComponent with an object containing type, ' +
                    'name, state, and options from the first' +
                    'action on executionEngine._actionList', function() {
                    executionEngine.emitAsync.onCall(0).callsArgWith(1, '');
                    executionEngine.emitAsync.onCall(1).callsArgWith(2, expectedState);

                    executionEngine.configure(testCaseActions);

                    expect(expectedState.createAndAddComponent.args).to.deep.equal([
                        [
                            {
                                type: 'myComponent',
                                name: 'myName',
                                state: {
                                    _state: {property: 'value'},
                                },
                                options: {
                                    opt: 'myOption',
                                },
                            },
                        ],
                    ]);
                });

                it('should call emitAsync once with the event \'executionEngine.configured\'', function() {
                    executionEngine.emitAsync.onCall(0).callsArgWith(1, '');
                    executionEngine.emitAsync.onCall(1).callsArgWith(2, expectedState);

                    executionEngine.configure(testCaseActions);

                    expect(executionEngine.emitAsync.args[2]).to.deep.equal([
                        'executionEngine.configured',
                    ]);
                });

                it('should call emitAsync thrice', function() {
                    executionEngine.emitAsync.onCall(0).callsArgWith(1, '');
                    executionEngine.emitAsync.onCall(1).callsArgWith(2, expectedState);

                    executionEngine.configure(testCaseActions);

                    expect(executionEngine.emitAsync.callCount).to.equal(3);
                });
            });
        });
    });

    describe('_executeNextAction', function() {
        let Emitter;
        let components;
        let executionEngine;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/execution-engine/execution-engine.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            mockery.registerMock('../../util/emitter.js', Emitter);

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
            it('should call executionEngine.emitAsync', function() {
                executionEngine._actionList.pop();

                executionEngine._executeNextAction();

                expect(executionEngine.emitAsync.args).to.deep.equal([
                    ['executionEngine.actionsFinished'],
                ]);
            });
        });

        describe('if executionEngine._actionList.length is not 0', function() {
            it('should set exectutionEngine._actionConfig.name to the actions component name and ' +
                'exectutionEngine.actionName to the actions actionName', function() {
                executionEngine._executeNextAction();

                expect(executionEngine._actionConfig).to.deep.equal({
                    name: 'myInstance',
                    actionName: 'MY_ACTION',
                    options: undefined,
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

            it('should call executionEngine.emitAsync with the event \'executionEngine.actionStarted\' and ' +
                'executionEngine._action, executionEngine._actionConfig, and executionEngine._steps', function() {
                executionEngine._executeNextAction();

                expect(executionEngine.emitAsync.args).to.deep.equal([
                    [
                        'executionEngine.actionStarted',
                        {
                            name: 'myInstance',
                            actionName: 'MY_ACTION',
                            options: undefined,
                        },
                    ],
                ]);
            });
        });
    });

    describe('_executeStep', function() {
        let Emitter;
        let executionEngine;
        let componentMap;
        let getComponentsAsMap;
        let myComponent;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/execution-engine/execution-engine.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            mockery.registerMock('../../util/emitter.js', Emitter);

            componentMap = new Map();
            myComponent = {name: 'testName'};
            componentMap.set('testName', myComponent);
            getComponentsAsMap = sinon.stub();

            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');

            executionEngine._steps = ['preconditions', 'perform', 'effects'];
            sinon.spy(executionEngine._steps, 'shift');
            executionEngine._actionConfig = {
                name: 'testName',
                actionName: 'testAction',
            };
            executionEngine._action = {
                preconditions: sinon.stub(),
                perform: sinon.stub(),
                effects: sinon.stub(),
            };
            executionEngine._expectedState = {
                getComponentsAsMap: getComponentsAsMap.returns(componentMap),
                _state: 'myState',
            };
            executionEngine._dataStore = {storedData: 'someData'};
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('if executionEngine._steps.length is 0', function() {
            it('should call once executionEngine.emitAsync with the event \'executionEngine.actionFinished\' ' +
                'executionEngine._action', function() {
                executionEngine._steps = [];
                executionEngine._action = {
                    perform: 'my perform function',
                    effects: 'my effects function',
                };

                executionEngine._executeStep();

                expect(executionEngine.emitAsync.args).to.deep.equal([
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

            it('should call executionEngine.emitAsync with the event \'executionEngine.stepStarted\' ' +
                'and executionEngine._step', function() {
                executionEngine._executeStep();

                expect(executionEngine.emitAsync.args[0]).to.deep.equal([
                    'executionEngine.stepStarted',
                    'preconditions',
                ]);
            });

            describe('when the executionEngine._step is equal to the string \'preconditions\'', function() {
                it('should call executionEngine.emitAsync with the event \'executionEngine.preconditionsReadyFor' +
                    'Verification\',  executionEngine._expectedState, executionEngine._action, ' +
                    'executionEngine._actionConfig, executionEngine._dataStore, actionParameters, ' +
                    'and the number 10000', function() {
                    executionEngine._actionConfig.options = {
                        parameters: ['param1', 'param2'],
                    };

                    executionEngine._executeStep();

                    expect(executionEngine.emitAsync.args[1]).to.deep.equal([
                        'executionEngine.preconditionsReadyForVerification',
                        executionEngine._expectedState,
                        executionEngine._action,
                        {
                            name: 'testName',
                            actionName: 'testAction',
                            options: {
                                parameters: ['param1', 'param2'],
                            },
                        },
                        {
                            storedData: 'someData',
                        },
                        ['param1', 'param2'],
                        10000,
                    ]);
                });
            });
            describe('when the executionEngine._step is equal to the string \'perform\'', function() {
                describe('when the executionEngine._action.perform callback is called', function() {
                    describe('if there is an error', function() {
                        it('should throw the error', function() {
                            executionEngine._steps = ['perform', 'effects'];
                            let error = new Error('An error occurred!');
                            executionEngine._executeStep();
                            let callback = executionEngine._action.perform.args[0][0];

                            expect(callback.bind(null, error)).to.throw('An error occurred!');
                        });
                    });
                    describe('if there is not an error', function() {
                        it('should call executionEngine.emitAsync two times', function() {
                            executionEngine._steps = ['perform', 'effects'];
                            executionEngine._executeStep();
                            let callback = executionEngine._action.perform.args[0][0];

                            callback(null);

                            expect(executionEngine.emitAsync.callCount).to.equal(2);
                        });

                        it('should call executionEngine.emitAsync with the event' +
                            ' \'executionEngine.stepCompleted\'', function() {
                                executionEngine._steps = ['perform', 'effects'];
                                executionEngine._executeStep();
                                let callback = executionEngine._action.perform.args[0][0];

                                callback(null);

                            expect(executionEngine.emitAsync.args[1]).to.deep.equal([
                                'executionEngine.stepCompleted',
                            ]);
                        });
                    });
                });
            });

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

                it('should call the executionEngine._action.perform with ' +
                    'the this context as the component', function() {
                    executionEngine._steps = ['perform', 'effects'];
                    executionEngine._actionConfig.options = {
                        parameters: ['param1', 'param2'],
                    };

                    executionEngine._executeStep();

                    expect(executionEngine._action.perform.thisValues).to.deep.equal([
                        myComponent,
                    ]);
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
                        it('should call executionEngine.emitAsync with twice', function() {
                            executionEngine._action.perform.callsArg(2);
                            executionEngine._steps = ['perform', 'effects'];
                            executionEngine._actionConfig.options = {
                                parameters: ['param1', 'param2'],
                            };

                            executionEngine._executeStep();

                            expect(executionEngine.emitAsync.callCount).to.equal(2);
                        });

                        it('should call executionEngine.emitAsync with the event \'executionEngine.stepCompleted\'' +
                            'and the passed in error', function() {
                            executionEngine._action.perform.callsArgWith(2);
                            executionEngine._steps = ['perform', 'effects'];
                            executionEngine._actionConfig.options = {
                                parameters: ['param1', 'param2'],
                            };

                            executionEngine._executeStep();

                            expect(executionEngine.emitAsync.args[1]).to.deep.equal([
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

                it('should call the executionEngine._action.perform with ' +
                    'the this context as the component', function() {
                    executionEngine._steps = ['perform', 'effects'];

                    executionEngine._executeStep();

                    expect(executionEngine._action.perform.thisValues).to.deep.equal([
                        myComponent,
                    ]);
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
                        it('should call executionEngine.emitAsync with twice', function() {
                            executionEngine._action.perform.callsArg(0);
                            executionEngine._steps = ['perform', 'effects'];

                            executionEngine._executeStep();

                            expect(executionEngine.emitAsync.callCount).to.equal(2);
                        });

                        it('should call executionEngine.emitAsync with the event \'executionEngine.stepCompleted\'' +
                            'and the passed in error', function() {
                            executionEngine._action.perform.callsArgWith(0);
                            executionEngine._steps = ['perform', 'effects'];

                            executionEngine._executeStep();

                            expect(executionEngine.emitAsync.args[1]).to.deep.equal([
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

            describe('when the executionEngine._step is equal to the string \'effects\'', function() {
                it('should call executionEngine.emitAsync with the event \'executionEngine.effectsReadyFor' +
                    'Verification\',  executionEngine._expectedState, executionEngine._action, ' +
                    'executionEngine._actionConfig, executionEngine._dataStore, actionParameters, ' +
                    'and the number 10000', function() {
                    executionEngine._steps = ['effects'];
                    executionEngine._actionConfig.options = {
                        parameters: ['param1', 'param2'],
                    };

                    executionEngine._executeStep();

                    expect(executionEngine.emitAsync.args[1]).to.deep.equal([
                        'executionEngine.effectsReadyForVerification',
                        executionEngine._expectedState,
                        executionEngine._action,
                        {
                            name: 'testName',
                            actionName: 'testAction',
                            options: {
                                parameters: ['param1', 'param2'],
                            },
                        },
                        {
                            storedData: 'someData',
                        },
                        ['param1', 'param2'],
                        10000,
                    ]);
                });
            });
        });
    });

    describe('applyPreconditions', function() {
        let Emitter;
        let executionEngine;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/execution-engine/execution-engine.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            mockery.registerMock('../../util/emitter.js', Emitter);

            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');

            executionEngine._action = {
                preconditions: sinon.stub(),
            },
            executionEngine._actionConfig = {
                name: 'myName',
                actionName: 'MY_ACTION',
            };
            executionEngine._expectedState = {
                getComponent: sinon.stub().returns('myComponent'),
            };
            executionEngine._dataStore = {
                storedData: 'someData',
            };
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call executionEngine._expectedState.getComponent once with executionEngine._actionConfig.name ' +
            'as the parameter', function() {
            executionEngine.applyPreconditions();

            expect(executionEngine._expectedState.getComponent.args).to.deep.equal([
                ['myName'],
            ]);
        });

        describe('if executionEngine._actionConfig.options.parameters is defined', function() {
            it('should call the executionEngine._action.preconditions with the spread ' +
                'actionParameters and the executionEngine._dataStore', function() {
                executionEngine._actionConfig.options = {
                    parameters: ['param1', 'param2'],
                };

                executionEngine.applyPreconditions();

                expect(executionEngine._action.preconditions.args).to.deep.equal([
                    [
                        'param1',
                        'param2',
                        {storedData: 'someData'},
                    ],
                ]);
            });

            it('should call the executionEngine._action.preconditions with ' +
                'the this context as the component', function() {
                executionEngine._actionConfig.options = {
                    parameters: ['param1', 'param2'],
                };

                executionEngine.applyPreconditions();

                expect(executionEngine._action.preconditions.thisValues).to.deep.equal([
                    'myComponent',
                ]);
            });
        });

        describe('if executionEngine._actionConfig.options.parameters is not defined', function() {
            it('should call the executionEngine._action.preconditions with the dataStore', function() {
                executionEngine.applyPreconditions();

                expect(executionEngine._action.preconditions.args).to.deep.equal([[
                    {storedData: 'someData'},
                ]]);
            });

            it('should call the executionEngine._action.preconditions with ' +
                'the this context as the component', function() {
                executionEngine.applyPreconditions();

                expect(executionEngine._action.preconditions.thisValues).to.deep.equal([
                    'myComponent',
                ]);
            });
        });

        describe('if executionEngine._action.preconditions throws', function() {
            it('should throw an error with a modified error message', function() {
                let error = new Error('An Error Occurred!');
                executionEngine._action.preconditions.throws(error);

                expect(executionEngine.applyPreconditions).to.throw(
                    `The error 'An Error Occurred!' was thrown while executing the preconditions ` +
                    `function for 'myName' - 'MY_ACTION'`
                );
            });
        });

        describe('if executionEngine._action.preconditions does not throw', function() {
            it('should call executionEngine.emitAsync once with '
                + 'the event \'executionEngine.stepCompleted\'', function() {
                executionEngine.applyPreconditions();

                expect(executionEngine.emitAsync.args).to.deep.equal([
                    ['executionEngine.stepCompleted'],
                ]);
            });
        });
    });

    describe('applyEffects', function() {
        let Emitter;
        let executionEngine;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/execution-engine/execution-engine.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            mockery.registerMock('../../util/emitter.js', Emitter);

            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');

            executionEngine._action = {
                effects: sinon.stub(),
            },
            executionEngine._actionConfig = {
                name: 'myName',
                actionName: 'MY_ACTION',
            };
            executionEngine._expectedState = {
                getComponent: sinon.stub().returns('myComponent'),
            };
            executionEngine._dataStore = {
                storedData: 'someData',
            };
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call executionEngine._expectedState.getComponent once with executionEngine._actionConfig.name ' +
            'as the parameter', function() {
            executionEngine.applyEffects();

            expect(executionEngine._expectedState.getComponent.args).to.deep.equal([
                ['myName'],
            ]);
        });

        describe('if executionEngine._actionConfig.options.parameters is defined', function() {
            it('should call executionEngine._action.effects once with the spread parameters ' +
                'prepended, executionEngine._expectedState and executionEngine._dataStore', function() {
                executionEngine._steps = ['effects'];
                executionEngine._actionConfig.options = {
                    parameters: ['param1', 'param2'],
                };

                executionEngine.applyEffects();

                expect(executionEngine._action.effects.args).to.deep.equal([
                    [
                        'param1',
                        'param2',
                        executionEngine._expectedState,
                        {
                            storedData: 'someData',
                        },
                    ],
                ]);
            });

            it('should call the executionEngine._action.effects with ' +
                'the this context as the component', function() {
                executionEngine._steps = ['effects'];
                executionEngine._actionConfig.options = {
                    parameters: ['param1', 'param2'],
                };

                executionEngine.applyEffects();

                expect(executionEngine._action.effects.thisValues).to.deep.equal([
                    'myComponent',
                ]);
            });
        });

        describe('if executionEngine._actionConfig.options.parameters is not defined', function() {
            it('should call executionEngine._action.effects once with the ' +
                'executionEngine._expectedState', function() {
                executionEngine.applyEffects();

                expect(executionEngine._action.effects.args).to.deep.equal([
                    [
                        executionEngine._expectedState,
                        {
                            storedData: 'someData',
                        },
                    ],
                ]);
            });

            it('should call the executionEngine._action.effects with ' +
                'the this context as the component', function() {
                executionEngine.applyEffects();

                expect(executionEngine._action.effects.thisValues).to.deep.equal([
                    'myComponent',
                ]);
            });
        });

        describe('if executionEngine._action.effects throws', function() {
            it('should catch an error if one is thrown by executionEngine._action.effects ', function() {
                let error = new Error('An Error Occurred!');
                executionEngine._action.effects.throws(error);

                expect(executionEngine.applyEffects).to.throw(
                    `The error 'An Error Occurred!' was thrown ` +
                    `while executing the effects function for 'myName' - 'MY_ACTION'`);
            });
        });

        describe('if executionEngine._action.effects does not throw', function() {
            it('should call executionEngine.emitAsync once with '
                + 'the event \'executionEngine.stepCompleted\'', function() {
                executionEngine.applyEffects();

                expect(executionEngine.emitAsync.args).to.deep.equal([
                    ['executionEngine.stepCompleted'],
                ]);
            });
        });
    });

    describe('_stepCompleted', function() {
        let Emitter;
        let executionEngine;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/execution-engine/execution-engine.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            mockery.registerMock('../../util/emitter.js', Emitter);

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

        it('should call executionEngine.emitAsync twice', function() {
            executionEngine._stepCompleted();

            expect(executionEngine.emitAsync.callCount).to.equal(2);
        });

        it('should call executionEngine.emitAsync with the event \'executionEngine.stepEnded\', null, ' +
            'executionEngine._action, executionEngine._actionConfig, executionEngine._step, ' +
            'and the string \'pass\' as parameters', function() {
            executionEngine._stepCompleted();

            expect(executionEngine.emitAsync.args[0]).to.deep.equal([
                'executionEngine.stepEnded',
                null,
                'perform',
            ]);
        });

        it('should call executionEngine.emitAsync with the event \'executionEngine.nextStepReadied\',' +
            'executionEngine._action, executionEngine._actionConfig, executionEngine._step, ' +
            'as parameters', function() {
            executionEngine._stepCompleted();

            expect(executionEngine.emitAsync.args[1]).to.deep.equal([
                'executionEngine.nextStepReadied',
            ]);
        });
    });

    describe('errorOccurred', function() {
        let Emitter;
        let executionEngine;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/execution-engine/execution-engine.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            mockery.registerMock('../../util/emitter.js', Emitter);

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

        it('should call executionEngine.emitAsync with the event \'executionEngine.stepEnded\', ' +
            'the passed in error, executionEngine._action,executionEngine._actionConfig, ' +
            'executionEngine._step, and the string \'fail\'', function() {
            let error = new Error('An error occurred!');

            executionEngine.errorOccurred(error, true);

            expect(executionEngine.emitAsync.args[0]).to.deep.equal([
                'executionEngine.stepEnded',
                error,
                'perform',
            ]);
        });

        it('should call executionEngine.emitAsync with the event \'executionEngine.errorHandled\'', function() {
            let error = new Error('An error occurred!');

            executionEngine.errorOccurred(error, true);

            expect(executionEngine.emitAsync.args[1]).to.deep.equal([
                'executionEngine.errorHandled',
            ]);
        });
    });

    describe('done', function() {
        let Emitter;
        let executionEngine;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/execution-engine/execution-engine.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                    myObject.emitAsync = sinon.stub();
                    myObject.runOn = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            mockery.registerMock('../../util/emitter.js', Emitter);

            executionEngine = require('../../../../../lib/executor/execution-engine/execution-engine.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call executionEngine.emitAsync once with the event \'executionEngine.done\'', function() {
            executionEngine.done();

            expect(executionEngine.emitAsync.args).to.deep.equal([
                [
                    'executionEngine.done',
                ],
            ]);
        });
    });
});
