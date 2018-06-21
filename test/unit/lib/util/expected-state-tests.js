'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/expected-state.js', function() {
    describe('on file being required', function() {
        let expectedState;
        let Emitter;
        let globalEventDispatch;

        beforeEach(function() {
          mockery.enable({useCleanCache: true});
          mockery.registerAllowable('../../../../lib/util/expected-state.js');

          Emitter = {
            mixIn: function(myObject) {
                myObject.emit = sinon.stub();
            },
          };
          sinon.spy(Emitter, 'mixIn');
          globalEventDispatch = sinon.stub();

          mockery.registerMock('./emitter.js', Emitter);
          mockery.registerMock('lodash', {});
          mockery.registerMock('events', {});
          mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', globalEventDispatch);
        });

        afterEach(function() {
          mockery.resetCache();
          mockery.deregisterAll();
          mockery.disable();
        });

        it('should call Emitter.mixIn with expectedState and globalEventDispatch', function() {
            expectedState = require('../../../../lib/util/expected-state.js');

            expect(Emitter.mixIn.args).to.deep.equal([
                [
                    expectedState,
                    globalEventDispatch,
                ],
            ]);
        });
    });

    describe('create', function() {
        let Emitter;
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;
        let callback;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');

            EventEmitterInstance = sinon.stub();
            EventEmitter = sinon.stub();
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('lodash', {});
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

            expectedState = require('../../../../lib/util/expected-state.js');
            callback = sinon.spy();
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call the callback with an object which has the prototype of expected state', function() {
            expectedState.create({}, callback);

            expect(Object.getPrototypeOf(callback.args[0][0])).to.deep.equal(expectedState);
        });

        it('should create an object with all the appropriate fields for an expected state', function() {
            let comparableObject = {
                _state: {},
                _stashedStates: [],
                _components: new Map(),
                _dynamicAreas: new Map(),
                _stashedDynamicAreas: [],
                _stashedDynamicAreasComponentsAndStates: new Map(),
                _stashedComponents: [],
                eventEmitter: EventEmitterInstance,
                _dataStore: {},
                _pageState: {},
            };

            expectedState.create({}, callback);

            expect(Object.getOwnPropertyNames(callback.args[0][0]))
                .to.deep.equal(Object.getOwnPropertyNames(comparableObject));
        });
    });

    describe('clone', function() {
        let Emitter;
        let expectedState;
        let callback;
        let myThis;
        let clonedExpectedState;
        let _;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');

            _ = {
                cloneDeep: sinon.stub(),
            };
            callback = sinon.stub();
            myThis = {
                create: sinon.stub(),
                _components: new Map(),
                _stashedComponents: [],
                _pageState: {
                    name: 'model',
                },
                _stashedDynamicAreas: [],
                _stashedDynamicAreasComponentsAndStates: new Map(),
            };
            clonedExpectedState = {
                createAndAddComponent: sinon.stub(),
                createComponent: sinon.stub(),
                _stashedDynamicAreasComponentsAndStates: new Map(),
                _stashedComponents: [],
                _stashedDynamicAreas: [],
            };

            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('lodash', _);
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});
            mockery.registerMock('events', {});

            expectedState = require('../../../../lib/util/expected-state.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call this.create once', function() {
            expectedState.clone.call(myThis, 'myDataStore', callback);

            expect(myThis.create.callCount).to.equal(1);
        });

        it('should call this.create with the passed in dataStore', function() {
            expectedState.clone.call(myThis, 'myDataStore', callback);

            expect(myThis.create.args[0][0]).to.equal('myDataStore');
        });

        describe('when the expectedState.create callback is called', function() {
            it('should call _.cloneDeep with this._pageState', function() {
                myThis.create.callsArgOnWith(1, myThis, clonedExpectedState);

                expectedState.clone.call(myThis, {}, callback);

                expect(_.cloneDeep.args[0]).to.deep.equal([
                    {
                        name: 'model',
                    },
                ]);
            });

            it('should set the cloned expected state property \'_pageState\' to the ' +
                'result of the first call to _.cloneDeep', function() {
                myThis.create.callsArgOnWith(1, myThis, clonedExpectedState);
                _.cloneDeep.onCall(0).returns({myName: 'myModel'});

                expectedState.clone.call(myThis, {}, callback);

                expect(clonedExpectedState._pageState).to.deep.equal({
                    myName: 'myModel',
                });
            });

            describe('for each component in the expectedState being cloned', function() {
                it('should call _.deepClone with that components state', function() {
                    myThis._components.set('key', {name: 'test'});
                    myThis._state = {'key': {name: 'test'}};
                    myThis.create.callsArgOnWith(1, myThis, clonedExpectedState);

                    expectedState.clone.call(myThis, {}, callback);

                    expect(_.cloneDeep.args[1]).to.deep.equal([{name: 'test'}]);
                });

                it('should call _.deepClone with that components options', function() {
                    myThis._components.set('key', {name: 'test', options: {option1: 'option1'}});
                    myThis._state = {'key': {name: 'test'}};
                    myThis.create.callsArgOnWith(1, myThis, clonedExpectedState);

                    expectedState.clone.call(myThis, {}, callback);

                    expect(_.cloneDeep.args[2]).to.deep.equal([{option1: 'option1'}]);
                });

                it('should call createAndAddComponent with an object containing: ' +
                    'component.type, component.name, componentState, and componentOptions', function() {
                    myThis._components.set(
                        'key',
                        {type: 'componentName', name: 'instanceName', dynamicArea: 'myDynamicArea'}
                    );
                    myThis._state = {type: 'componentName', name: 'instanceName'};
                    _.cloneDeep.onCall(1).returns('myComponentState');
                    _.cloneDeep.onCall(2).returns('myComponentOptions');
                    myThis.create.callsArgOnWith(1, myThis, clonedExpectedState);

                    expectedState.clone.call(myThis, {}, callback);

                    expect(clonedExpectedState.createAndAddComponent.args).to.deep.equal(
                        [
                            [{
                                type: 'componentName',
                                name: 'instanceName',
                                state: 'myComponentState',
                                options: 'myComponentOptions',
                                dynamicArea: 'myDynamicArea',
                                cloning: true,
                            }],
                        ]
                    );
                });
            });

            it('should call _.cloneDeep with the stashedComponents of the expectedState being cloned', function() {
                myThis._stashedStates = ['stashedState1', 'stashedState2'];
                myThis.create.callsArgOnWith(1, myThis, clonedExpectedState);

                expectedState.clone.call(myThis, {}, callback);

                expect(_.cloneDeep.args[1]).to.deep.equal([['stashedState1', 'stashedState2']]);
            });

            describe('for each stashed component in the expectedState.stashedComponents being cloned', function() {
                it('should call _.cloneDeep with the stashed components options', function() {
                    let stashedComponents = new Map();
                    stashedComponents.set('key', {name: 'stashed1', options: {option1: 'option1'}});
                    myThis._stashedComponents = [stashedComponents];
                    clonedExpectedState.createComponent.returns({});
                    myThis.create.callsArgOnWith(1, myThis, clonedExpectedState);

                    expectedState.clone.call(myThis, {}, callback);

                    expect(_.cloneDeep.args[2]).to.deep.equal([{option1: 'option1'}]);
                });

                it('should call clonedState.createComponent with and object containing'
                    + 'component.type, name, and componentOptions', function() {
                    let stashedComponents = new Map();
                    stashedComponents.set(
                        'stashed1',
                        {
                            type: 'componentName',
                            name: 'stashed1',
                            options: {option1: 'option1'},
                            dynamicArea: 'myDynamicArea',
                        }
                    );
                    myThis._stashedComponents = [stashedComponents];
                    myThis.create.callsArgOnWith(1, myThis, clonedExpectedState);
                    clonedExpectedState.createComponent.returns({});
                    _.cloneDeep.onCall(2).returns('myComponentOptions');

                    expectedState.clone.call(myThis, {}, callback);

                    expect(clonedExpectedState.createComponent.args).to.deep.equal([
                        [{
                            type: 'componentName',
                            name: 'stashed1',
                            options: 'myComponentOptions',
                            dynamicArea: 'myDynamicArea',
                        }],
                    ]);
                });
                it('should call clonedState._stashedComponents.push with the new map of components', function() {
                    let stashedComponents = new Map();
                    stashedComponents.set(
                        'stashed1',
                        {type: 'componentName', name: 'stashed1', options: {option1: 'option1'}}
                    );
                    myThis._stashedComponents = [stashedComponents];
                    clonedExpectedState.createComponent.onCall(0).returns({name: 'createdComponent'});
                    clonedExpectedState._stashedComponents = {
                        push: sinon.stub(),
                    };
                    myThis.create.callsArgOnWith(1, myThis, clonedExpectedState);
                    let expectedMap = new Map([['createdComponent', {name: 'createdComponent'}]]);

                    expectedState.clone.call(myThis, {}, callback);

                    expect(clonedExpectedState._stashedComponents.push.args).to.deep.equal([[expectedMap]]);
                });
            });

            describe('for each stashed dynamicArea in this._stashedDynamicAreas', function() {
                it('should call clonedState._stashedDynamicArea.push with an identical dynamicArea map', function() {
                    myThis._stashedDynamicAreas = [
                        new Map([
                            ['dynamicArea1', new Set(['name1', 'name2'])],
                            ['dynamicArea2', new Set(['name3', 'name4'])],
                        ]),
                    ];
                    myThis.create.callsArgOnWith(1, myThis, clonedExpectedState);

                    expectedState.clone.call(myThis, {}, callback);

                    expect(clonedExpectedState._stashedDynamicAreas).to.deep.equal([
                        new Map([
                            ['dynamicArea1', new Set(['name1', 'name2'])],
                            ['dynamicArea2', new Set(['name3', 'name4'])],
                        ]),
                    ]);
                });
            });

            it('should call the callback once with the clonedState', function() {
                myThis.create.callsArgOnWith(1, myThis, clonedExpectedState);

                expectedState.clone.call(myThis, {}, callback);

                expect(callback.args).to.deep.equal([[clonedExpectedState]]);
            });
            describe('for each stashed dynamicarea component and state', function() {
                describe('for each dynamicarea name', function() {
                    it('should set the cloned dynamic area and state', function() {
                        myThis.create.callsArgOnWith(1, myThis, clonedExpectedState);
                        let component = {
                            type: 'componentType',
                            name: 'instanceName',
                            elements: sinon.stub().returns(['myElements']),
                            model: sinon.stub().returns({model: 'modelValue'}),
                            actions: sinon.stub().returns({ACTION_1: 'someAction'}),
                            options: {option1: 'someOption'},
                        };
                        let componentState = {
                            type: 'componentType',
                            name: 'instanceName',
                            options: {
                                option1: 'someOption',
                            },
                        };
                        let componentsMap = new Map();
                        let statesMap = new Map();
                        componentsMap.set('instanceName', component);
                        statesMap.set('instanceName', componentState);
                        myThis._stashedDynamicAreasComponentsAndStates = new Map();
                        myThis._stashedDynamicAreasComponentsAndStates.set('testDynamicArea', {
                            components: componentsMap,
                            states: statesMap,
                        });
                        clonedExpectedState._stashedDynamicAreasComponentsAndStates.set('testDynamicArea', {
                            components: componentsMap,
                            states: statesMap,
                        });

                        expectedState.clone.call(myThis, {}, callback);

                        expect(callback.args[0][0]).to.deep.equal(clonedExpectedState);
                    });
                });
                it('should set the stashed dynamicarea components to the clonedstate', function() {
                    myThis.create.callsArgOnWith(1, myThis, clonedExpectedState);

                        let component = {
                            type: 'componentType',
                            name: 'instanceName',
                            elements: sinon.stub().returns(['myElements']),
                            model: sinon.stub().returns({model: 'modelValue'}),
                            actions: sinon.stub().returns({ACTION_1: 'someAction'}),
                            options: {option1: 'someOption'},
                        };
                        let componentState = {
                            type: 'componentType',
                            name: 'instanceName',
                            options: {
                                option1: 'someOption',
                            },
                        };

                        let componentsMap = new Map();
                        let statesMap = new Map();

                        componentsMap.set('instanceName', component);
                        statesMap.set('instanceName', componentState);

                        myThis._stashedDynamicAreasComponentsAndStates = new Map();
                        myThis._stashedDynamicAreasComponentsAndStates.set('testDynamicArea', {
                            components: componentsMap,
                            states: statesMap,
                        });

                        expectedState.clone.call(myThis, {}, callback);

                        expect(callback.args[0][0]._stashedDynamicAreasComponentsAndStates.get('testDynamicArea')
                        .components.get('instanceName'))
                        .to.deep.equal(componentsMap.get('instanceName'));
                });
                it('should set the stashed dynamicarea state to the clonedstate', function() {
                    myThis.create.callsArgOnWith(1, myThis, clonedExpectedState);

                    let component = {
                        type: 'componentType',
                        name: 'instanceName',
                        elements: sinon.stub().returns(['myElements']),
                        model: sinon.stub().returns({model: 'modelValue'}),
                        actions: sinon.stub().returns({ACTION_1: 'someAction'}),
                        options: {option1: 'someOption'},
                    };
                    let componentState = {
                        type: 'componentType',
                        name: 'instanceName',
                        options: {
                            option1: 'someOption',
                        },
                    };

                    let componentsMap = new Map();
                    let statesMap = new Map();

                    componentsMap.set('instanceName', component);
                    statesMap.set('instanceName', componentState);

                    myThis._stashedDynamicAreasComponentsAndStates = new Map();
                    myThis._stashedDynamicAreasComponentsAndStates.set('testDynamicArea', {
                        components: componentsMap,
                        states: statesMap,
                    });

                    expectedState.clone.call(myThis, {}, callback);

                    expect(callback.args[0][0]._stashedDynamicAreasComponentsAndStates.get('testDynamicArea')
                    .states.get('instanceName'))
                    .to.deep.equal(statesMap.get('instanceName'));
                });
            });
        });
    });

    describe('createComponent', function() {
        let Emitter;
        let expectedState;
        let component;
        let errorCalled;
        let componentConfig;
        let _;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            global.SimulatoError = {
                ACTION: {
                    EXPECTED_STATE_ERROR: sinon.stub(),
                },
            };

            component = {
                type: 'componentType',
                name: 'instanceName',
                elements: sinon.stub().returns(['myElements']),
                model: sinon.stub().returns({model: 'modelValue'}),
                actions: sinon.stub().returns({ACTION_1: 'someAction'}),
                options: {option1: 'someOption'},
            };

            componentConfig = {
                type: 'componentType',
                name: 'instanceName',
                options: {
                    option1: 'someOption',
                },
            };
            _ = {
                get: sinon.stub(),
            };

            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('events', {});
            mockery.registerMock('lodash', _);
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

            expectedState = require('../../../../lib/util/expected-state.js');
            expectedState._dataStore = {storedData: 'someData'};
        });

        afterEach(function() {
            delete global.SimulatoError;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should throw an error if the passed in componentConfig.type is not a string'
            + 'or a string of length 0', function() {
            let message = `Error was thrown`;
            SimulatoError.ACTION.EXPECTED_STATE_ERROR.throws(
                {message}
            );
            delete componentConfig.type;

            expect(expectedState.createComponent.bind(null, componentConfig)).to.throw(message);
        });

        it('should throw an error if the passed in componentConfig.name is not a string'
            + 'or a string of length 0', function() {
            let message = `Error was thrown`;
            SimulatoError.ACTION.EXPECTED_STATE_ERROR.throws(
                {message}
            );
            componentConfig.name = 1234;

            expect(expectedState.createComponent.bind(null, componentConfig)).to.throw(message);
        });

        it('should throw an error if the passed in componentConfig.options is not an object', function() {
            let message = `Error was thrown`;
            SimulatoError.ACTION.EXPECTED_STATE_ERROR.throws(
                {message}
            );
            componentConfig.options = [];

            expect(expectedState.createComponent.bind(null, componentConfig)).to.throw(message);
        });

        it('should call expectedState.emit with the event componentHandler.getComponent'
            + ' with the passed in componentConfig.type as first 2 params', function() {
            expectedState.emit = sinon.stub();

            expectedState.createComponent(componentConfig);

            expect(expectedState.emit.args[0].slice(0, 2)).to.deep.equal([
                'componentHandler.getComponent', 'componentType',
            ]);
        });

        it('should call expectedState.emit with a function as the 3rd param', function() {
            expectedState.emit = sinon.stub();

            expectedState.createComponent(componentConfig);

            expect(expectedState.emit.args[0].slice(2, 3)[0]).to.be.a('function');
        });

        describe('when the emit\'s callback is called', function() {
            it('should throw an error if there is one', function() {
                let error = new Error('TEST_ERROR');
                expectedState.emit.callsArgOnWith(2, expectedState, error, component);

                try {
                    expectedState.createComponent(componentConfig);
                } catch (error) {
                    errorCalled = true;
                }

                expect(errorCalled).to.equal(true);
            });

            describe('when the newComponent.getFromPage function is called', function() {
                it('should call _.get once with this.expectedState._pageState and the passed in key', function() {
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);
                    let newComponent = expectedState.createComponent(componentConfig);
                    expectedState._pageState = {component: 'model'};

                    newComponent.getFromPage('myKey');

                    expect(_.get.args).to.deep.equal([
                        [
                            {component: 'model'},
                            'myKey',
                        ],
                    ]);
                });

                it('should return the result of the call to _.get', function() {
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);
                    let newComponent = expectedState.createComponent(componentConfig);
                    _.get.returns('myValue');

                    let result = newComponent.getFromPage('myKey');

                    expect(result).to.equal('myValue');
                });
            });

            it('should create the component with options', function() {
                expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                let newComponent = expectedState.createComponent(componentConfig);

                expect(newComponent).to.deep.equal({
                    name: 'instanceName',
                    type: 'componentType',
                    expectedState,
                    elements: ['myElements'],
                    model: {model: 'modelValue'},
                    actions: {ACTION_1: 'someAction'},
                    options: {option1: 'someOption'},
                    getFromPage: newComponent.getFromPage,
                });
            });

            describe('if no options are passed in with componentConfig', function() {
                it('should create the component without options and set options to an empty object', function() {
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);
                    delete componentConfig.options;

                    let newComponent = expectedState.createComponent(componentConfig);

                    expect(newComponent).to.deep.equal({
                        name: 'instanceName',
                        type: 'componentType',
                        elements: ['myElements'],
                        expectedState,
                        model: {model: 'modelValue'},
                        actions: {ACTION_1: 'someAction'},
                        options: {},
                        getFromPage: newComponent.getFromPage,
                    });
                });
            });

            it('should call newComponent.elements once with no params', function() {
                expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                expectedState.createComponent(componentConfig);

                expect(component.elements.args).to.deep.equal([[]]);
            });

            it('should assign the return value of newComponent.elements() to newComponent.elements', function() {
                expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                let newComponent = expectedState.createComponent(componentConfig);

                expect(newComponent.elements).to.deep.equal(['myElements']);
            });

            it(`should call ExepectedState.emit with the event 'validators.validateElements', ` +
                `the newComponents.elements the newComponent.name and the newComponent.type`, function() {
                expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                expectedState.createComponent(componentConfig);

                expect(expectedState.emit.args[1]).to.deep.equal([
                    'validators.validateElements',
                    ['myElements'],
                    'instanceName',
                    'componentType',
                ]);
            });

            it('should call newComponent.model once with no params', function() {
                expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                expectedState.createComponent(componentConfig);

                expect(component.model.args).to.deep.equal([[]]);
            });

            it('should assign the return value of newComponent.model() to newComponent.model', function() {
                expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                let newComponent = expectedState.createComponent(componentConfig);

                expect(newComponent.model).to.deep.equal({model: 'modelValue'});
            });

            it(`should call ExepectedState.emit with the event 'validators.validateModel', ` +
            `the newComponents.model the newComponent.name and the newComponent.type`, function() {
                expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                expectedState.createComponent(componentConfig);

                expect(expectedState.emit.args[2]).to.deep.equal([
                    'validators.validateModel',
                    {model: 'modelValue'},
                    'instanceName',
                    'componentType',
                ]);
            });

            it('should call newComponent.actions once with no params', function() {
                expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                expectedState.createComponent(componentConfig);

                expect(component.actions.args).to.deep.equal([[]]);
            });

            it('should assign the return value of newComponent.actions() to newComponent.actions', function() {
                expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                let newComponent = expectedState.createComponent(componentConfig);

                expect(newComponent.actions).to.deep.equal({ACTION_1: 'someAction'});
            });

            it(`should call ExepectedState.emit with the event 'validators.validateActions', ` +
                `the newComponents.actions the newComponent.name and the newComponent.type`, function() {
                expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                expectedState.createComponent(componentConfig);

                expect(expectedState.emit.args[3]).to.deep.equal([
                    'validators.validateActions',
                    {ACTION_1: 'someAction'},
                    'instanceName',
                    'componentType',
                ]);
            });

            describe('if newComponent.events and newComponent.children is not defined', function() {
                it('should call ExpectedState.emit 4 times', function() {
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                    expectedState.createComponent(componentConfig);

                    expect(expectedState.emit.callCount).to.equal(4);
                });
            });

            describe('if newComponent.events is defined', function() {
                it('should call ExpectedState.emit 5 times', function() {
                    let events = sinon.stub();
                    component.events = events;
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                    expectedState.createComponent(componentConfig);

                    expect(expectedState.emit.callCount).to.equal(5);
                });

                it('should call newComponent.events once with expectedState and '
                    + 'expectedState._dataStore passed in', function() {
                    let events = sinon.stub();
                    component.events = events;
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                    expectedState.createComponent(componentConfig);

                    expect(component.events.args).to.deep.equal([[
                        expectedState,
                        {storedData: 'someData'},
                    ]]);
                });

                it('should assign newComponent.events to the result of the call to newComponent.events', function() {
                    let events = sinon.stub().returns('myEvents');
                    component.events = events;
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                    let newComponent = expectedState.createComponent(componentConfig);

                    expect(newComponent.events).to.equal('myEvents');
                });

                it(`should call ExepectedState.emit with the event 'validators.validateEvents', ` +
                    `the newComponents.events the newComponent.name and the newComponent.type`, function() {
                    let events = sinon.stub().returns('myEvents');
                    component.events = events;
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                    expectedState.createComponent(componentConfig);

                    expect(expectedState.emit.args[4]).to.deep.equal([
                        'validators.validateEvents',
                        'myEvents',
                        'instanceName',
                        'componentType',
                    ]);
                });
            });

            describe('if newComponent.children is defined', function() {
                it('should call ExpectedState.emit 5 times', function() {
                    let children = sinon.stub();
                    component.children = children;
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                    expectedState.createComponent(componentConfig);

                    expect(expectedState.emit.callCount).to.equal(5);
                });

                it('should call newComponent.children once passing in expectedState and the dataStore', function() {
                    let children = sinon.stub();
                    component.children = children;
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                    expectedState.createComponent(componentConfig);

                    expect(component.children.args).to.deep.equal([
                        [
                            expectedState,
                            {storedData: 'someData'},
                        ],
                    ]);
                });

                it('should assign newComponent.children to the result of the call to ' +
                    'newComponent.children', function() {
                    let children = sinon.stub().returns('myChildren');
                    component.children = children;
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                    let newComponent = expectedState.createComponent(componentConfig);

                    expect(newComponent.children).to.equal('myChildren');
                });

                it('should call ExpectedState.emit with the event \'validators.validateChildren\', ' +
                    'newComponent.children, name, and componentType', function() {
                    let children = sinon.stub().returns('myChildren');
                    component.children = children;
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);

                    expectedState.createComponent(componentConfig);

                    expect(expectedState.emit.args[4]).to.deep.equal([
                        'validators.validateChildren',
                        'myChildren',
                        'instanceName',
                        'componentType',
                    ]);
                });
            });

            describe('if dynamicArea is defined', function() {
                it('should assign newComponent.dynamicArea to the passed in dynamicArea', function() {
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, null, component);
                    componentConfig.dynamicArea = 'aDynamicArea';

                    let newComponent = expectedState.createComponent(componentConfig);

                    expect(newComponent).to.deep.equal({
                        name: 'instanceName',
                        type: 'componentType',
                        elements: ['myElements'],
                        expectedState,
                        model: {model: 'modelValue'},
                        actions: {ACTION_1: 'someAction'},
                        options: {option1: 'someOption'},
                        dynamicArea: 'aDynamicArea',
                        getFromPage: newComponent.getFromPage,
                    });
                });
            });
        });
    });

    describe('addComponent', function() {
        let Emitter;
        let component;
        let state;
        let expectedState;
        let myThis;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('events', {});
            mockery.registerMock('lodash', {});
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

            expectedState = require('../../../../lib/util/expected-state.js');
            myThis = {
                _state: {},
                _registerEvents: sinon.stub(),
                _addChildren: sinon.stub(),
                _addToDynamicArea: sinon.stub(),
                _components: new Map(),
                _dynamicAreas: new Map(),
                _pageState: {
                    'instanceName': {
                        key: 'value',
                    },
                },
            };
            expectedState._state = {};
            component = {
                name: 'instanceName',
                options: {},
            };
            state = {state: 'someState'};
            global.SimulatoError = {
                ACTION: {
                    EXPECTED_STATE_ERROR: sinon.stub(),
                },
            };
        });

        afterEach(function() {
            delete global.SimulatoError;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should throw an error the passed in state is not an object', function() {
            let message = `Error thrown`;
            SimulatoError.ACTION.EXPECTED_STATE_ERROR.throws(
                {message}
            );

            expect(expectedState.addComponent.bind(null, component, 'notObject')).to.throw(message);
        });

        it('should set a component in this._components using the component.name as the key'
            + ' and the component as the value', function() {
            let componentMap = new Map();
            componentMap.set('instanceName', component);

            expectedState.addComponent.call(myThis, component, state);

            expect(myThis._components).to.deep.equal(componentMap);
        });

        it('should set the this._state to the passed in state', function() {
            expectedState.addComponent.call(myThis, component, state);

            expect(myThis._state[component.name]).to.deep.equal({state: 'someState'});
        });

        it('should set component._currentWorkingModel to the value from this._pageState[component.name]', function() {
            expectedState.addComponent.call(myThis, component, state);

            expect(component._currentWorkingModel).to.deep.equal({key: 'value'});
        });

        describe('if component.events is defined', function() {
            it('should call this._registerEvents once with the passed in component', function() {
                component.events = [
                    {
                        name: 'event',
                        listener: 'myListener',
                    },
                    {
                        name: 'event2',
                        listener: 'myListener2',
                    },
                ];

                expectedState.addComponent.call(myThis, component, state);

                expect(myThis._registerEvents.args).to.deep.equal([
                    [
                        {
                            events: [
                                {
                                    name: 'event',
                                    listener: 'myListener',
                                },
                                {
                                    name: 'event2',
                                    listener: 'myListener2',
                                },
                            ],
                            name: 'instanceName',
                            options: {},
                            _currentWorkingModel: {
                                key: 'value',
                            },
                        },
                    ],
                ]);
            });
        });

        describe('if component.children is defined and cloning is not true', function() {
            it('should call this._addChildren once with the passed in component', function() {
                component.children = [
                    {
                        type: 'myComponent',
                        name: 'myInstance',
                        state: {
                            property: 'value',
                        },
                        options: {
                            option: 'option1',
                        },
                    },
                ];

                expectedState.addComponent.call(myThis, component, state);

                expect(myThis._addChildren.args).to.deep.equal([
                    [
                        {
                            children: [
                                {
                                    type: 'myComponent',
                                    name: 'myInstance',
                                    state: {
                                        property: 'value',
                                    },
                                    options: {
                                        option: 'option1',
                                    },
                                },
                            ],
                            name: 'instanceName',
                            options: {},
                            _currentWorkingModel: {
                                key: 'value',
                            },
                        },
                    ],
                ]);
            });
            it('should add this children if children is not cloning', function() {
                component.children = [
                    {
                        type: 'myComponent',
                        name: 'myInstance',
                        state: {
                            property: 'value',
                        },
                        options: {
                            option: 'option1',
                        },
                    },
                ];

                expectedState.addComponent.call(myThis, component, state, false);

                expect(myThis._addChildren.args).to.deep.equal([
                    [
                        {
                            children: [
                                {
                                    type: 'myComponent',
                                    name: 'myInstance',
                                    state: {
                                        property: 'value',
                                    },
                                    options: {
                                        option: 'option1',
                                    },
                                },
                            ],
                            name: 'instanceName',
                            options: {},
                            _currentWorkingModel: {
                                key: 'value',
                            },
                        },
                    ],
                ]);
            });
        });
        describe('if component.children is not defined and cloning is false', function() {
            it('should not add the children', function() {
                component.children = false;
                expectedState._addChildren = sinon.stub();

                expectedState.addComponent.call(myThis, component, state, false);

                expect(expectedState._addChildren.callCount).to.equal(0);
            });
        });

        describe('if component.dynamicArea is defined', function() {
            it('should call this._addToDynamicArea once with the passed in component', function() {
                component.dynamicArea = 'myDynamicArea';

                expectedState.addComponent.call(myThis, component, state);

                expect(myThis._addToDynamicArea.args).to.deep.equal([
                    [
                        {
                            name: 'instanceName',
                            options: {},
                            dynamicArea: 'myDynamicArea',
                            _currentWorkingModel: {
                                key: 'value',
                            },
                        },
                    ],
                ]);
            });
        });
    });

    describe('_addToDynamicArea', function() {
        let Emitter;
        let expectedState;
        let myThis;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            myThis = {
                _dynamicAreas: new Map(),
            };
            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('events', {});
            mockery.registerMock('lodash', {});
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

            expectedState = require('../../../../lib/util/expected-state.js');
            sinon.spy(myThis._dynamicAreas, 'set');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
            myThis._dynamicAreas.set.restore();
        });

        describe('if the dynamic area is an array', function() {
            it('should iterate over the array to add the multiple dynamic areas', function() {
                let component = {
                    name: 'myInstance',
                    options: {},
                    dynamicArea: ['areaOne', 'areaTwo'],
                };

                expectedState._addToDynamicArea.call(myThis, component);

                expect(myThis._dynamicAreas).to.deep.equal(new Map([
                    [
                        'areaOne',
                        new Set(['myInstance']),
                    ],
                    [
                        'areaTwo',
                        new Set(['myInstance']),
                    ],
                ]));
            });
            describe('if the dynamic area does not already exist', function() {
                it('should add the dynamic area as a new set to the dynamic areas', function() {
                    let component = {
                        name: 'myInstance',
                        options: {},
                        dynamicArea: ['areaOne'],
                    };

                    expectedState._addToDynamicArea.call(myThis, component);

                    expect(myThis._dynamicAreas.set.callCount).to.equal(1);
                });
            });
            describe('if the dynamic area does exist', function() {
                it('should skip adding the dynamic area', function() {
                    let component = {
                        name: 'myInstance',
                        options: {},
                        dynamicArea: ['areaOne'],
                    };
                    myThis._dynamicAreas = new Map([[
                            'areaOne',
                            new Set(['myInstance']),
                    ]]);
                    sinon.spy(myThis._dynamicAreas, 'set');

                    expectedState._addToDynamicArea.call(myThis, component);

                    expect(myThis._dynamicAreas.set.callCount).to.equal(0);
                });
            });
            it('should add the component name to the dynamic area', function() {
                let component = {
                    name: 'myInstance',
                    options: {},
                    dynamicArea: ['areaOne'],
                };

                expectedState._addToDynamicArea.call(myThis, component);

                expect(myThis._dynamicAreas.get('areaOne')).to.deep.equal(new Set(['myInstance']));
            });
        });
        describe('if the dynamic area is not an array', function() {
            describe('if the dynamicArea does not exist', function() {
                it('should create the dynamic area in the map with the key as the dynamic ' +
                    'area and the value a set with the component\'s instanceName', function() {
                    let component = {
                        name: 'myInstance',
                        options: {},
                        dynamicArea: 'myDynamicArea',
                    };

                    expectedState._addToDynamicArea.call(myThis, component);

                    expect(myThis._dynamicAreas).to.deep.equal(new Map([
                        [
                            'myDynamicArea',
                            new Set(['myInstance']),
                        ],
                    ]));
                });
            });
            describe('if the dynamicArea already exists', function() {
                it('should add the component\'s name to the set', function() {
                    myThis._dynamicAreas.set('myDynamicArea', new Set(['myFirstInstance']));
                    let component = {
                        name: 'mySecondInstance',
                        options: {},
                        dynamicArea: 'myDynamicArea',
                    };

                    expectedState._addToDynamicArea.call(myThis, component);

                    expect(myThis._dynamicAreas).to.deep.equal(new Map([
                        [
                            'myDynamicArea',
                            new Set(['myFirstInstance', 'mySecondInstance']),
                        ],
                    ]));
                });
            });
        });
    });

    describe('_addChildren', function() {
        let Emitter;
        let component;
        let expectedState;
        let myThis;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            myThis = {
                createComponent: sinon.stub(),
                addComponent: sinon.stub(),
            };
            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('events', {});
            mockery.registerMock('lodash', {});
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

            component = {
                options: {},
                children: [],
            };

            expectedState = require('../../../../lib/util/expected-state.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('if child.options is undefined', function() {
            it('should set child.options to an empty object', function() {
                component.children.push(
                    {}
                );

                expectedState._addChildren.call(myThis, component);

                expect(component.children[0].options).to.deep.equal({});
            });
        });

        describe('if child.options.dynamicArea is set', function() {
            it('should keep the same value', function() {
                component.children.push(
                    {
                        options: {
                            dynamicArea: 'myChildDynamicArea',
                        },
                    }
                );

                expectedState._addChildren.call(myThis, component);

                expect(component.children[0].options.dynamicArea).to.equal('myChildDynamicArea');
            });
        });

        describe('if child.options.dynamicArea is not set and the component.options.dynamicArea is set', function() {
            it('should set child.options.dynamicArea to component.options.dynamicArea', function() {
                component.children.push(
                    {}
                );
                component.dynamicArea = 'myComponentDynamicArea';

                expectedState._addChildren.call(myThis, component);

                expect(component.children[0].dynamicArea).to.equal('myComponentDynamicArea');
            });
        });

        describe('if child.options.dynamicArea is not set and component.options.dynamicArea is not set', function() {
            it('should not change child.options.dynamicArea', function() {
                component.children.push(
                    {
                        options: {
                            something: 'value',
                        },
                    }
                );

                expectedState._addChildren.call(myThis, component);

                expect(component.children[0].options).to.deep.equal({something: 'value'});
            });
        });

        describe('if there is one item in component.children array', function() {
            it('should call this.createComponent once with child.componentName, ' +
                'child.instanceName, child.options', function() {
                component.children.push(
                    {
                        type: 'myComponent',
                        name: 'myInstance',
                        options: {
                            something: 'value',
                        },
                    }
                );

                expectedState._addChildren.call(myThis, component);

                expect(myThis.createComponent.args).to.deep.equal([
                    [{
                        type: 'myComponent',
                        name: 'myInstance',
                        options: {
                            something: 'value',
                        },
                    }],
                ]);
            });

            it('should call this.addComponent once with the value returned from ' +
                'this.createComponent and child.state', function() {
                component.children.push(
                    {
                        type: 'myComponent',
                        name: 'myInstance',
                        options: {
                            something: 'value',
                        },
                        state: {
                            property: 'someValue',
                        },
                    }
                );
                myThis.createComponent.returns('myCreatedComponent');

                expectedState._addChildren.call(myThis, component);

                expect(myThis.addComponent.args).to.deep.equal([
                    [
                        'myCreatedComponent',
                        {
                            property: 'someValue',
                        },
                    ],
                ]);
            });
        });

        describe('if there are 4 items in component.children array', function() {
            it('should call this.createComponent 4 times', function() {
                component.children.push(
                    {},
                    {},
                    {},
                    {}
                );

                expectedState._addChildren.call(myThis, component);

                expect(myThis.createComponent.callCount).to.equal(4);
            });
        });
    });

    describe('_registerEvents', function() {
        let Emitter;
        let expectedState;
        let myThis;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            myThis = {
                eventEmitter: {
                    on: sinon.stub(),
                },
            };
            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('lodash', {});
            mockery.registerMock('events', {});
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

            expectedState = require('../../../../lib/util/expected-state.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('if component.events is defined', function() {
            describe('if an event object has an array as the \'name\' property', function() {
                it('should call expectedState.eventEmitter.on twice with each item and the listener' +
                    'if there are two items the array', function() {
                    let component = {
                        events: [
                            {
                                name: ['event1', 'event2'],
                                listener: sinon.stub(),
                            },
                        ],
                    };

                    expectedState._registerEvents.call(myThis, component);

                    expect(myThis.eventEmitter.on.args).to.deep.equal([
                        ['event1', component.events[0].listener],
                        ['event2', component.events[0].listener],
                    ]);
                });
            });
            describe('if an event object has a string for the \'name\' property', function() {
                it('should call expectedState.eventEmitter.on once with the name and the listener', function() {
                    let component = {
                        events: [
                            {
                                name: 'event',
                                listener: sinon.stub(),
                            },
                        ],
                    };

                    expectedState._registerEvents.call(myThis, component);

                    expect(myThis.eventEmitter.on.args).to.deep.equal([
                        [
                            'event',
                            component.events[0].listener,
                        ],
                    ]);
                });
            });
        });

        describe('if component.events is not defined', function() {
            it('should not call expectedState.eventEmitter.on', function() {
                expectedState._registerEvents.call(myThis, {});

                expect(myThis.eventEmitter.on.args).to.deep.equal([]);
            });
        });
    });

    describe('_deregisterEvents', function() {
        let Emitter;
        let expectedState;
        let myThis;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            myThis = {
                eventEmitter: {
                    removeListener: sinon.stub(),
                },
            };
            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('lodash', {});
            mockery.registerMock('events', {});
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

            expectedState = require('../../../../lib/util/expected-state.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('if component.events is defined', function() {
            describe('if an event object has an array as the \'name\' property', function() {
                it('should call expectedState.eventEmitter.removeListener twice with each item and the listener' +
                    'if there are two items the array', function() {
                    let component = {
                        events: [
                            {
                                name: ['event1', 'event2'],
                                listener: sinon.stub(),
                            },
                        ],
                    };

                    expectedState._deregisterEvents.call(myThis, component);

                    expect(myThis.eventEmitter.removeListener.args).to.deep.equal([
                        ['event1', component.events[0].listener],
                        ['event2', component.events[0].listener],
                    ]);
                });
            });
            describe('if an event object has a string for the \'name\' property', function() {
                it('should call expectedState.eventEmitter.removeListener once with the name and the' +
                    'listener', function() {
                    let component = {
                        events: [
                            {
                                name: 'event',
                                listener: sinon.stub(),
                            },
                        ],
                    };

                    expectedState._deregisterEvents.call(myThis, component);

                    expect(myThis.eventEmitter.removeListener.args).to.deep.equal([
                        [
                            'event',
                            component.events[0].listener,
                        ],
                    ]);
                });
            });
        });

        describe('if component.events is not defined', function() {
            it('should not call expectedState.eventEmitter.removeListener', function() {
                expectedState._deregisterEvents.call(myThis, {});

                expect(myThis.eventEmitter.removeListener.args).to.deep.equal([]);
            });
        });
    });

    describe('createAndAddComponent', function() {
        let Emitter;
        let expectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('lodash', {});
            mockery.registerMock('events', {});
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

            expectedState = require('../../../../lib/util/expected-state.js');
            expectedState.createComponent = sinon.stub();
            expectedState.addComponent = sinon.stub();
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call createComponent with the passed args', function() {
            expectedState.createAndAddComponent(
                {type: 'componentType', name: 'instanceName', state: {someState: 'stateValue'}}
            );

            expect(expectedState.createComponent.args)
                .to.deep.equal([[
                    {
                        type: 'componentType',
                        name: 'instanceName',
                        state: {someState: 'stateValue'},
                    },
                ]]);
        });
        it('should call addComponent with new component and componentConfig.state', function() {
            let newComponent = {name: 'instanceName'};
            expectedState.createComponent.returns(newComponent);
            expectedState.createAndAddComponent(
                {type: 'componentType', name: 'instanceName', state: {someState: 'stateValue'}}
            );

            expect(expectedState.addComponent.args).to.deep.equal([[
                newComponent,
                {someState: 'stateValue'},
                undefined,
            ]]);
        });
    });

    describe('delete', function() {
        let Emitter;
        let myThis;
        let expectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            myThis = {
                getComponent: sinon.stub(),
                _deregisterEvents: sinon.stub(),
                _components: {
                    delete: sinon.stub(),
                },
                _state: sinon.stub(),
            };
            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('lodash', {});
            mockery.registerMock('events', {});
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

            expectedState = require('../../../../lib/util/expected-state.js');
            expectedState._components = new Map();
            expectedState._state = {};

            sinon.spy(expectedState._components, 'delete');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
            expectedState._components.delete.restore();
        });

        it('should call this.getComponent once with the passed in instanceName', function() {
            expectedState.delete.call(myThis, 'myInstance');

            expect(myThis.getComponent.args).to.deep.equal([
                [
                    'myInstance',
                ],
            ]);
        });

        describe('if this.getComponent returns value', function() {
            it('should call this._deregisterEvents once with the returned component', function() {
                myThis.getComponent.returns('myComponent');

                expectedState.delete.call(myThis, 'myInstance');

                expect(myThis._deregisterEvents.args).to.deep.equal([
                    [
                        'myComponent',
                    ],
                ]);
            });

            it('should call this._components.delete once with the passed in instanceName', function() {
                myThis.getComponent.returns('myComponent');

                expectedState.delete.call(myThis, 'myInstance');

                expect(myThis._components.delete.args).to.deep.equal([
                    [
                        'myInstance',
                    ],
                ]);
            });

            it('should delete the property corresponding to the instanceName on this._state', function() {
                myThis.getComponent.returns('myComponent');
                myThis._state = {myInstance: 'aValue'};

                expectedState.delete.call(myThis, 'myInstance');

                expect(myThis._state).to.deep.equal({});
            });
        });

        describe('if this.getComponent returns undefined', function() {
            it('should not call this._components.delete', function() {
                myThis.getComponent.returns(undefined);

                expectedState.delete.call(myThis, 'myInstance');

                expect(myThis._components.delete.args).to.deep.equal([]);
            });
        });
    });

    describe('clear', function() {
        let Emitter;
        let expectedState;
        let myThis;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            myThis = {
                _components: {
                    clear: sinon.stub(),
                },
                _state: {
                    test: 'value',
                },
                eventEmitter: {
                    removeAllListeners: sinon.stub(),
                },
            };
            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('lodash', {});
            mockery.registerMock('events', {});
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

            expectedState = require('../../../../lib/util/expected-state.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call this.eventEmitter.removeAllListeners once with no arguments', function() {
            expectedState.clear.call(myThis);

            expect(myThis.eventEmitter.removeAllListeners.args).to.deep.equal([[]]);
        });

        it('should set this.state to be an empty object', function() {
            expectedState.clear.call(myThis);

            expect(myThis._state).to.deep.equal({});
        });

        it('should call this._components.clear once', function() {
            expectedState.clear.call(myThis);

            expect(myThis._components.clear.callCount).to.equal(1);
        });
    });

    describe('clearDynamicArea', function() {
        let Emitter;
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;
        let dynamicArea;
        let dynamicArea2;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            EventEmitter = sinon.stub();
            EventEmitterInstance = sinon.stub();
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('lodash', {});
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

            let expectedStateConstructor = require('../../../../lib/util/expected-state.js');
            expectedStateConstructor.create({}, function(value) {
                expectedState = value;
            });
            dynamicArea = 'key';
            dynamicArea2 = 'key2';
            expectedState.delete = sinon.stub();
            expectedState._dynamicAreas.set(dynamicArea, new Set());
            expectedState._dynamicAreas.set(dynamicArea2, new Set());
            expectedState._dynamicAreas.get(dynamicArea).add('someComponent');
            expectedState._dynamicAreas.get(dynamicArea).add('someComponent2');
            expectedState._dynamicAreas.get(dynamicArea2).add('someComponent');
            expectedState._dynamicAreas.get(dynamicArea2).add('someComponent');
            expectedState._dynamicAreas.get(dynamicArea2).add('someComponent2');
            expectedState._dynamicAreas.get(dynamicArea2).add('someComponent3');
            sinon.spy(expectedState._dynamicAreas, 'get');
            sinon.spy(expectedState._dynamicAreas, 'forEach');
            sinon.spy(Array, 'from');
            expectedState.delete = sinon.stub();
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
            expectedState._dynamicAreas.get.restore();
            expectedState._dynamicAreas.forEach.restore();
            Array.from.restore();
        });

        describe('if the dynamicArea exists', function() {
            it('should call get with the key when clearDynamicArea is called', function() {
                expectedState.clearDynamicArea(dynamicArea);

                expect(expectedState._dynamicAreas.get.args[0]).to.deep.equal(['key']);
            });
            it('should call the Array.from function on a dynamic area array', function() {
                expectedState.clearDynamicArea(dynamicArea);

                expect(Array.from.callCount).to.equal(1);
            });
            it('should call dynamicAreas forEach once', function() {
                expectedState.clearDynamicArea(dynamicArea);

                expect(expectedState._dynamicAreas.forEach.callCount).to.equal(1);
            });
            it('should have one parameter of a function', function() {
                expectedState.clearDynamicArea(dynamicArea);

                expect(expectedState._dynamicAreas.forEach.args[0][0]).to.be.a('function');
            });
            it('should reduce the cleared dynamic area to an empty set', function() {
                expectedState.clearDynamicArea(dynamicArea);

                expect(expectedState._dynamicAreas.get('key')).to.deep.equal(new Set());
            });
            it('should delete components of a cleared dynamic area from other dynamic areas', function() {
                expectedState.clearDynamicArea(dynamicArea);

                expect(expectedState._dynamicAreas.get('key2')).to.deep.equal(new Set(['someComponent3']));
            });
            it('should call this.delete for each component in the dynamic area', function() {
                expectedState.clearDynamicArea(dynamicArea);

                expect(expectedState.delete.args).to.deep.equal([
                    ['someComponent'],
                    ['someComponent2'],
                ]);
            });
        });
        describe('if the dynamicArea does not exist', function() {
            it('should skip clearing the dynamic area', function() {
                dynamicArea = undefined;

                expectedState.clearDynamicArea(dynamicArea);

                expect(expectedState._dynamicAreas.forEach.callCount).to.equal(0);
            });
        });
    });

    describe('getState', function() {
        let Emitter;
        let expectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');

            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('lodash', {});
            mockery.registerMock('events', {});
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

            expectedState = require('../../../../lib/util/expected-state.js');

            expectedState._state = {};
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should return the state with key value pair', function() {
            expectedState._state = {key: 'value'};

            expect(expectedState.getState()).to.deep.equal({key: 'value'});
        });
    });
    describe('getComponent', function() {
        let Emitter;
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            EventEmitter = sinon.stub();
            EventEmitterInstance = sinon.stub();
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('lodash', {});
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

            let expectedStateConstructor = require('../../../../lib/util/expected-state.js');
            expectedStateConstructor.create({}, function(value) {
                expectedState = value;
            });
            expectedState._components.set('key', 'value');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('return the component corresponding to the key', function() {
            let retVal = expectedState.getComponent('key');

            expect(retVal).to.equal('value');
        });
    });

    describe('getComponents', function() {
        let Emitter;
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            EventEmitter = sinon.stub();
            EventEmitterInstance = sinon.stub();
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('lodash', {});
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

            let expectedStateConstructor = require('../../../../lib/util/expected-state.js');
            expectedStateConstructor.create({}, function(value) {
                expectedState = value;
            });
            expectedState._components.set('key', 'value');
            expectedState._components.set('key1', 'value1');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should get components from map as array', function() {
            let retVal = expectedState.getComponents();
            expect(retVal).to.deep.equal(['value', 'value1']);
        });
    });

    describe('getComponentsAsMap', function() {
        let Emitter;
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            EventEmitter = sinon.stub();
            EventEmitterInstance = sinon.stub();
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('lodash', {});
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

            let expectedStateConstructor = require('../../../../lib/util/expected-state.js');
            expectedStateConstructor.create({}, function(value) {
                expectedState = value;
            });
            expectedState._components.set('key', 'value');
            expectedState._components.set('key1', 'value1');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should return components as a map', function() {
            let returnedMap = new Map();
            returnedMap.set('key', 'value');
            returnedMap.set('key1', 'value1');

            let retVal = expectedState.getComponentsAsMap();

            expect(retVal).to.deep.equal(returnedMap);
        });
    });

    describe('modify', function() {
        let Emitter;
        let instanceName;
        let callback;
        let expectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');

            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('lodash', {});
            mockery.registerMock('events', {});
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

            expectedState = require('../../../../lib/util/expected-state.js');
            instanceName = 'componentInstance';
            expectedState._state = {
                componentInstance: 'state',
            };
            callback = sinon.spy();
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call the passed in callback with the component' +
        ' specified by the passed in instance name', function() {
            expectedState.modify(instanceName, callback);

            expect(callback.args).to.deep.equal([['state']]);
        });
    });

    describe('stash', function() {
        let Emitter;
        let expectedState;
        let myThis;
        let _;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            _ = {
                cloneDeep: sinon.stub().returns({key: 'value'}),
            };

            myThis = {
                _state: {
                    key: 'value',
                },
                _components: new Map([['key', 'value']]),
                _stashedStates: [],
                _stashedComponents: [],
                _stashedDynamicAreas: [],
                eventEmitter: {
                    removeAllListeners: sinon.stub(),
                },
            };
            sinon.spy(myThis._stashedStates, 'push');
            sinon.spy(myThis._stashedComponents, 'push');
            sinon.spy(myThis._stashedDynamicAreas, 'push');

            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('lodash', _);
            mockery.registerMock('events', {});
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

            expectedState = require('../../../../lib/util/expected-state.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
            myThis._stashedStates.push.restore();
            myThis._stashedComponents.push.restore();
            myThis._stashedDynamicAreas.push.restore();
        });

        it('should call this.eventEmitter.removeAllListeners once with no arguments', function() {
            expectedState.stash.call(myThis);

            expect(myThis.eventEmitter.removeAllListeners.args).to.deep.equal([[]]);
        });

        it('should clonedeep the state first', function() {
            expectedState.stash.call(myThis);

            expect(_.cloneDeep.callCount).to.equal(1);
        });

        it('should push the state into stashed state', function() {
            expectedState.stash.call(myThis);

            expect(myThis._stashedStates.push.args).to.deep.equal([[{key: 'value'}]]);
        });

        it('should push components into stashed component', function() {
            let returnedMap = new Map();
            returnedMap.set('key', 'value');

            expectedState.stash.call(myThis);

            expect(myThis._stashedComponents.push.args).to.deep.equal([[returnedMap]]);
        });

        it('should call this._stashedDynamicAreas.push once with this._dynamicAreas as the parameter', function() {
            myThis._dynamicAreas = new Map([['myDynamicArea', new Set(['name1', 'name2'])]]);

            expectedState.stash.call(myThis);

            expect(myThis._stashedDynamicAreas.push.args).to.deep.equal([
                [
                    new Map([
                        ['myDynamicArea', new Set(['name1', 'name2'])],
                    ]),
                ],
            ]);
        });

        it('should set the state to an empty object', function() {
            expectedState.stash.call(myThis);

            expect(myThis._state).to.deep.equal({});
        });

        it('should set the components to an empty map', function() {
            expectedState.stash.call(myThis);

            expect(myThis._components).to.deep.equal(new Map());
        });

        it('should call this._stashedDynamicAreas.push to an empty map', function() {
            myThis._dynamicAreas = new Map([['myDynamicArea', new Set(['name1', 'name2'])]]);

            expectedState.stash.call(myThis);

            expect(myThis._dynamicAreas).to.deep.equal(new Map());
        });
    });

    describe('stashDynamicArea', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;
        let myThis;
        let stashedComponent;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            global.SimulatoError = {
                ACTION: {
                    EXPECTED_STATE_ERROR: sinon.stub(),
                },
            };

            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});
            expectedState = require('../../../../lib/util/expected-state.js');
            stashedComponent = new Map([['key', 'value']]);
            myThis = {
                _stashedStates: [{key: 'value'}],
                _stashedComponents: [stashedComponent],
                _stashedDynamicAreas: [],
                _registerEvents: sinon.stub(),
                eventEmitter: {
                    removeAllListeners: sinon.stub(),
                },
                _dynamicAreas: new Map(),
                _clearDynamicArea: sinon.stub,
            };
        });

        afterEach(function() {
            delete global.SimulatoError;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('for each dynamicArea', function() {
            it('should stash the dynamic area components', function() {
                let component = {
                    type: 'componentType',
                    name: 'instanceName',
                    elements: sinon.stub().returns(['myElements']),
                    model: sinon.stub().returns({model: 'modelValue'}),
                    actions: sinon.stub().returns({ACTION_1: 'someAction'}),
                    options: {option1: 'someOption'},
                };
                let componentState = {
                    type: 'componentType',
                    name: 'instanceName',
                    options: {
                        option1: 'someOption',
                    },
                };
                myThis.getComponent = sinon.stub().returns(component);
                myThis._state = {};
                myThis._stashedDynamicAreasComponentsAndStates = new Map();
                myThis.clearDynamicArea = sinon.stub();

                let componentsMap = new Map();
                let statesMap = new Map();

                componentsMap.set('instanceName', component);
                statesMap.set('instanceName', componentState);
                myThis._dynamicAreas.set('testDynamicArea', {
                    components: componentsMap,
                    states: statesMap,
                });

                expectedState.stashDynamicArea.call(myThis, 'testDynamicArea');

                expect(myThis._stashedDynamicAreasComponentsAndStates.get('testDynamicArea')
                .components.get('instanceName'))
                .to.equal(component);
            });
            it('should stash the dynamic area states', function() {
                let component = {
                    type: 'componentType',
                    name: 'instanceName',
                    elements: sinon.stub().returns(['myElements']),
                    model: sinon.stub().returns({model: 'modelValue'}),
                    actions: sinon.stub().returns({ACTION_1: 'someAction'}),
                    options: {option1: 'someOption'},
                };
                let componentState = {
                    type: 'componentType',
                    name: 'instanceName',
                    options: {
                        option1: 'someOption',
                    },
                };

                myThis.getComponent = sinon.stub().returns(component);
                myThis._state = {
                    componentType: componentState,
                };
                myThis._stashedDynamicAreasComponentsAndStates = new Map();
                myThis.clearDynamicArea = sinon.stub();

                let componentsMap = new Map();
                let statesMap = new Map();

                componentsMap.set('instanceName', component);
                statesMap.set('instanceName', componentState);
                myThis._dynamicAreas.set('testDynamicArea', {
                    components: componentsMap,
                    states: statesMap,
                });

                expectedState.stashDynamicArea.call(myThis, 'testDynamicArea');

                expect(myThis._stashedDynamicAreasComponentsAndStates.get('testDynamicArea')
                .states.get('instanceName'))
                .to.equal(componentState);
            });
        });
        it('should clear the dynamic area that was stashed', function() {
            let component = {
                type: 'componentType',
                name: 'instanceName',
                elements: sinon.stub().returns(['myElements']),
                model: sinon.stub().returns({model: 'modelValue'}),
                actions: sinon.stub().returns({ACTION_1: 'someAction'}),
                options: {option1: 'someOption'},
            };
            let componentState = {
                type: 'componentType',
                name: 'instanceName',
                options: {
                    option1: 'someOption',
                },
            };

            myThis.getComponent = sinon.stub().returns(component);
            myThis._state = {
                componentType: componentState,
            };
            myThis._stashedDynamicAreasComponentsAndStates = new Map();
            myThis.clearDynamicArea = sinon.stub();

            let componentsMap = new Map();
            let statesMap = new Map();

            componentsMap.set('instanceName', component);
            statesMap.set('instanceName', componentState);
            myThis._dynamicAreas.set('testDynamicArea', {
                components: componentsMap,
                states: statesMap,
            });

            expectedState.stashDynamicArea.call(myThis, 'testDynamicArea');

            expect(myThis.clearDynamicArea.args[0][0]).to.equal('testDynamicArea');
        });
    });

    describe('pop', function() {
        let Emitter;
        let expectedState;
        let myThis;
        let stashedComponent;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            Emitter = {
                mixIn: function(myObject) {
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            global.SimulatoError = {
                ACTION: {
                    EXPECTED_STATE_ERROR: sinon.stub(),
                },
            };

            mockery.registerMock('./emitter.js', Emitter);
            mockery.registerMock('lodash', {});
            mockery.registerMock('events', {});
            mockery.registerMock('../global-event-dispatch/global-event-dispatch.js', {});

            expectedState = require('../../../../lib/util/expected-state.js');
            stashedComponent = new Map([['key', 'value']]);
            myThis = {
                _stashedStates: [{key: 'value'}],
                _stashedComponents: [stashedComponent],
                _stashedDynamicAreas: [],
                _registerEvents: sinon.stub(),
                eventEmitter: {
                    removeAllListeners: sinon.stub(),
                },
            };

            sinon.spy(stashedComponent, 'values');
            sinon.spy(myThis._stashedStates, 'pop');
            sinon.spy(myThis._stashedComponents, 'pop');
            sinon.spy(myThis._stashedDynamicAreas, 'pop');
        });

        afterEach(function() {
            delete global.SimulatoError;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
            stashedComponent.values.restore();
            myThis._stashedStates.pop.restore();
            myThis._stashedComponents.pop.restore();
            myThis._stashedDynamicAreas.pop.restore();
        });

        describe('if expectedState._stashedStates.length is 0', function() {
            it('should throw an error', function() {
                myThis._stashedStates.shift();
                let error = new Error('My Error');
                SimulatoError.ACTION.EXPECTED_STATE_ERROR.throws(error);

                expect(expectedState.pop.bind(myThis)).to.throw('My Error');
            });

            it('should call SimulatoError.ActionError.EXPECTED_STATE_ERROR a could not pop error message', function() {
                myThis._stashedStates.shift();
                let error = new Error('My Error');
                SimulatoError.ACTION.EXPECTED_STATE_ERROR.throws(error);

                try {
                    expectedState.pop.call(myThis);
                } catch (err) {}

                expect(SimulatoError.ACTION.EXPECTED_STATE_ERROR.args).to.deep.equal([
                    [
                        'Failed to pop. No stashed states.',
                    ],
                ]);
            });
        });

        it('should call this.eventEmitter.removeAllListeners once with no arguments', function() {
            expectedState.pop.call(myThis);

            expect(myThis.eventEmitter.removeAllListeners.args).to.deep.equal([[]]);
        });

        it('should call pop on the stashed state once', function() {
            expectedState.pop.call(myThis);

            expect(myThis._stashedStates.pop.callCount).to.equal(1);
        });

        it('should set the _state to the popped state', function() {
            expectedState.pop.call(myThis);

            expect(myThis._state).to.deep.equal({key: 'value'});
        });

        it('should call pop on the stashed component once', function() {
            expectedState.pop.call(myThis);

            expect(myThis._stashedComponents.pop.callCount).to.deep.equal(1);
        });

        it('should set the _components to the popped component', function() {
            let returnedMap = new Map();
            returnedMap.set('key', 'value');

            expectedState.pop.call(myThis);

            expect(myThis._components).to.deep.equal(returnedMap);
        });

        it('should call this._components.values once with no parameters', function() {
            expectedState.pop.call(myThis);

            expect(stashedComponent.values.args).to.deep.equal([[]]);
        });

        it('should call this._stashedDyanmicAreas.pop once with no arguments', function() {
            expectedState.pop.call(myThis);

            expect(myThis._stashedDynamicAreas.pop.args).to.deep.equal([[]]);
        });

        describe('if this._stashedDynamicAreas.pop returns undefined', function() {
            it('should set this._dynamicAreas to an empty map', function() {
                myThis._stashedDynamicAreas.push(undefined);

                expectedState.pop.call(myThis);

                expect(myThis._dynamicAreas).to.deep.equal(new Map());
            });
        });

        describe('if this._stashedDynamicAreas.pop returns a value', function() {
            it('should set this._dynamicAreas to popped dynamicArea', function() {
                myThis._stashedDynamicAreas.push(new Map([
                    ['myDynamicArea', new Set(['name1', 'name2'])],
                ]));

                expectedState.pop.call(myThis);

                expect(myThis._dynamicAreas).to.deep.equal(new Map([
                    ['myDynamicArea', new Set(['name1', 'name2'])],
                ]));
            });
        });

        it('should call this._.values once with no parameters', function() {
            expectedState.pop.call(myThis);

            expect(stashedComponent.values.args).to.deep.equal([[]]);
        });

        it('should call this._registerEvents twice with component as the first parameter', function() {
            stashedComponent.set('key2', 'value2');

            expectedState.pop.call(myThis);

            expect(myThis._registerEvents.args).to.deep.equal([
                [
                    'value',
                    0,
                    [
                        'value',
                        'value2',
                    ],
                ],
                [
                    'value2',
                    1,
                    [
                        'value',
                        'value2',
                    ],
                ],
            ]);
        });

        it('should call this._registerEvents with the this context as the this context of' +
            'the pop function', function() {
            expectedState.pop.call(myThis);

            expect(myThis._registerEvents.thisValues).to.deep.equal([
                myThis,
            ]);
        });
    });
    describe('retrieveDynamicArea', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;
        let myThis;
        let stashedComponent;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            global.SimulatoError = {
                ACTION: {
                    EXPECTED_STATE_ERROR: sinon.stub(),
                },
            };

            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});
            expectedState = require('../../../../lib/util/expected-state.js');
            stashedComponent = new Map([['key', 'value']]);
            myThis = {
                _stashedStates: [{key: 'value'}],
                _stashedComponents: [stashedComponent],
                _stashedDynamicAreas: [],
                _registerEvents: sinon.stub(),
                eventEmitter: {
                    removeAllListeners: sinon.stub(),
                },
            };
        });

        afterEach(function() {
            delete global.SimulatoError;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('for each component in the stashed dynamic area components', function() {
            it('should add the component to the expected state along with the state', function() {
                let component = {
                    type: 'componentType',
                    name: 'instanceName',
                    elements: sinon.stub().returns(['myElements']),
                    model: sinon.stub().returns({model: 'modelValue'}),
                    actions: sinon.stub().returns({ACTION_1: 'someAction'}),
                    options: {option1: 'someOption'},
                };
                let componentState = {
                    type: 'componentType',
                    name: 'instanceName',
                    options: {
                        option1: 'someOption',
                    },
                };

                myThis.getComponent = sinon.stub().returns(component);
                myThis._state = {
                    componentType: componentState,
                };
                myThis._stashedDynamicAreasComponentsAndStates = new Map();
                myThis.addComponent = sinon.stub();

                let componentsMap = new Map();
                let statesMap = new Map();

                componentsMap.set('instanceName', component);
                statesMap.set('instanceName', componentState);
                myThis._stashedDynamicAreasComponentsAndStates.set('testDynamicArea', {
                    components: componentsMap,
                    states: statesMap,
                });

                expectedState.retrieveDynamicArea.call(myThis, 'testDynamicArea');

                expect(myThis.addComponent.callCount).to.equal(1);
            });
        });
        it('should delete the retrieved dynamic area components and states', function() {
            let component = {
                type: 'componentType',
                name: 'instanceName',
                elements: sinon.stub().returns(['myElements']),
                model: sinon.stub().returns({model: 'modelValue'}),
                actions: sinon.stub().returns({ACTION_1: 'someAction'}),
                options: {option1: 'someOption'},
            };
            let componentState = {
                type: 'componentType',
                name: 'instanceName',
                options: {
                    option1: 'someOption',
                },
            };

            myThis.getComponent = sinon.stub().returns(component);
            myThis._state = {
                componentType: componentState,
            };
            myThis._stashedDynamicAreasComponentsAndStates = new Map();
            myThis.addComponent = sinon.stub();
            myThis._stashedDynamicAreasComponentsAndStates.delete = sinon.stub();

            let componentsMap = new Map();
            let statesMap = new Map();

            componentsMap.set('instanceName', component);
            statesMap.set('instanceName', componentState);
            myThis._stashedDynamicAreasComponentsAndStates.set('testDynamicArea', {
                components: componentsMap,
                states: statesMap,
            });

            expectedState.retrieveDynamicArea.call(myThis, 'testDynamicArea');

            expect(myThis._stashedDynamicAreasComponentsAndStates.delete.callCount).to.equal(1);
        });
    });
});
