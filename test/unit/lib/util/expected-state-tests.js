'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/expected-state.js', function() {
    describe('on file being required', function() {
        let expectedState;
        let EventEmitter;
        let EventEmitterInstance;

        beforeEach(function() {
          mockery.enable({useCleanCache: true});
          mockery.registerAllowable('../../../../lib/util/expected-state.js');

          EventEmitter = sinon.stub();
          EventEmitterInstance = {
            emit: sinon.stub(),
            on: sinon.stub(),
          };
          EventEmitter.returns(EventEmitterInstance);

          mockery.registerMock('events', {EventEmitter});
          mockery.registerMock('lodash', {});
        });

        afterEach(function() {
          mockery.resetCache();
          mockery.deregisterAll();
          mockery.disable();
        });

        it('should set the object prototype of printOutput to a new EventEmitter', function() {
          expectedState = require('../../../../lib/util/expected-state.js');

          expect(Object.getPrototypeOf(expectedState)).to.deep.equal(EventEmitterInstance);
        });
    });
    describe('create', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;
        let callback;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});
            expectedState = require('../../../../lib/util/expected-state.js');
            callback = sinon.spy();
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call the callback with an object which has the prototype of expected state', function() {
            expectedState.create(callback);

            expect(Object.getPrototypeOf(callback.args[0][0])).to.deep.equal(expectedState);
        });

        it('should create an object with all the appropriate fields for an expected state', function() {
            let comparableObject = {
                _state: {},
                _stashedStates: [],
                _components: new Map(),
                _dynamicAreas: new Map(),
                _stashedComponents: [],
                _dataStore: {},
                eventEmitter: EventEmitterInstance,
            };

            expectedState.create(callback);

            expect(Object.getOwnPropertyNames(callback.args[0][0]))
            .to.deep.equal(Object.getOwnPropertyNames(comparableObject));
        });
    });

    describe('clone', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;
        let newExpectedState;
        let callback;
        let _;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            _ = {
                cloneDeep: sinon.stub(),
            };

            _.cloneDeep.onCall(0).returns({});

            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', _);
            let expectedStateConstructor = require('../../../../lib/util/expected-state.js');
            expectedStateConstructor.create(function(value) {
                expectedState = value;
            });
            expectedStateConstructor.create(function(value) {
                newExpectedState = value;
            });
            callback = sinon.spy();
            newExpectedState.createComponent = sinon.stub();
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should create the expectedState in the cloned state', function() {
            _.cloneDeep.onCall(1).returns([]);

            expectedState.clone(callback);

            expect(callback.args[0][0]).to.deep.equal(expectedState);
        });
        describe('when the expectedState.create callback is called', function() {
            describe('for each component in the expectedState being cloned', function() {
                it('should call _.deepClone with that components state', function() {
                    newExpectedState.createAndAddComponent = sinon.stub();
                    expectedState.create = sinon.stub();
                    expectedState._components.set('key', {instanceName: 'test'});
                    expectedState._state = {'key': {instanceName: 'test'}};
                    expectedState.create.callsArgOnWith(0, expectedState, newExpectedState);

                    expectedState.clone(callback);

                    expect(_.cloneDeep.args[1]).to.deep.equal([{instanceName: 'test'}]);
                });
                it('should call _.deepClone with that components options', function() {
                    newExpectedState.createAndAddComponent = sinon.stub();
                    expectedState.create = sinon.stub();
                    expectedState._components.set('key', {instanceName: 'test', options: {option1: 'option1'}});
                    expectedState._state = {'key': {instanceName: 'test'}};
                    expectedState.create.callsArgOnWith(0, expectedState, newExpectedState);

                    expectedState.clone(callback);

                    expect(_.cloneDeep.args[2]).to.deep.equal([{option1: 'option1'}]);
                });
                it('should call createAndAddComponent with the arguments "undefined, test, [], []"', function() {
                    newExpectedState.createAndAddComponent = sinon.stub();
                    expectedState.create = sinon.stub();
                    expectedState._components.set('key', {name: 'componentName', instanceName: 'instanceName'});
                    expectedState.create.callsArgOnWith(0, expectedState, newExpectedState);
                    _.cloneDeep.onCall(1).returns({});
                    _.cloneDeep.onCall(2).returns({});

                    expectedState.clone(callback);

                    expect(newExpectedState.createAndAddComponent.args).to.deep.equal(
                        [
                            ['componentName', 'instanceName', {}, {}],
                        ]
                    );
                });
            });

            it('should call _.cloneDeep with the stashedComponents of the expectedState being cloned', function() {
                newExpectedState.createAndAddComponent = sinon.stub();
                expectedState.create = sinon.stub();
                expectedState._stashedStates = ['stashed', 'states'];
                expectedState.create.callsArgOnWith(0, expectedState, newExpectedState);

                expectedState.clone(callback);

                expect(_.cloneDeep.args[1]).to.deep.equal([['stashed', 'states']]);
            });

            describe('for each stashed component in the expectedState.stashedComponents being cloned', function() {
                it('should call _.cloneDeep with the stashed components options', function() {
                    newExpectedState.createAndAddComponent = sinon.stub();
                    expectedState.create = sinon.stub();
                    let stashedComponents = new Map();
                    stashedComponents.set('key', {instanceName: 'stashed1', options: {option1: 'option1'}});
                    expectedState._stashedComponents = [stashedComponents];
                    newExpectedState.createComponent.onCall(0).returns(new Map());
                    expectedState.create.callsArgOnWith(0, expectedState, newExpectedState);
                    _.cloneDeep.onCall(1).returns([]);

                    expectedState.clone(callback);

                    expect(_.cloneDeep.args[2]).to.deep.equal([{option1: 'option1'}]);
                });

                it('should call clonedState.createComponent with'
                    + 'component name, instanceName, and component options', function() {
                    newExpectedState.createAndAddComponent = sinon.stub();
                    expectedState.create = sinon.stub();
                    let stashedComponents = new Map();
                    stashedComponents.set(
                        'stashed1',
                        {name: 'componentName', instanceName: 'stashed1', options: {option1: 'option1'}}
                    );
                    expectedState._stashedComponents = [stashedComponents];
                    newExpectedState.createComponent.onCall(0).returns(new Map());
                    expectedState.create.callsArgOnWith(0, expectedState, newExpectedState);
                    _.cloneDeep.onCall(1).returns([]);
                    _.cloneDeep.onCall(2).returns({});

                    expectedState.clone(callback);

                    expect(newExpectedState.createComponent.args).to.deep.equal([['componentName', 'stashed1', {}]]);
                });
                it('should call clonedState._stashedComponents.push with the new map of components', function() {
                    newExpectedState.createAndAddComponent = sinon.stub();
                    expectedState.create = sinon.stub();
                    let stashedComponents = new Map();
                    stashedComponents.set(
                        'stashed1',
                        {name: 'componentName', instanceName: 'stashed1', options: {option1: 'option1'}}
                    );
                    expectedState._stashedComponents = [stashedComponents];
                    newExpectedState.createComponent.onCall(0).returns({instanceName: 'createdComponent'});
                    expectedState.create.callsArgOnWith(0, expectedState, newExpectedState);
                    _.cloneDeep.onCall(1).returns([]);
                    _.cloneDeep.onCall(2).returns({});
                    let expectedMap = new Map();
                    expectedMap.set('createdComponent', {instanceName: 'createdComponent'});
                    sinon.spy(newExpectedState._stashedComponents, 'push');

                    expectedState.clone(callback);

                    expect(newExpectedState._stashedComponents.push.args).to.deep.equal([[expectedMap]]);
                });
            });
        });
    });


    describe('createComponent', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;
        let error;
        let component;
        let errorCalled;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});
            expectedState = require('../../../../lib/util/expected-state.js');

            global.MbttError = {
                ACTION: {
                    EXPECTED_STATE_ERROR: sinon.stub(),
                },
            };

            component = {
                instanceName: 'string',
                elements: sinon.stub().returns([]),
                model: sinon.stub(),
                actions: sinon.stub(),
            };
        });

        afterEach(function() {
            delete global.MbttError;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should throw an error if the passed in componentName is not a string'
            + 'or a string of length 0', function() {
            let message = `componentName is required for creating a component and must be a string`;
            MbttError.ACTION.EXPECTED_STATE_ERROR.throws(
                {message}
            );

            expect(expectedState.createComponent.bind(null, {}, 'instanceName')).to.throw(message);
        });

        it('should throw an error if the passed in instanceName is not a string'
            + 'or a string of length 0', function() {
            let message = `instanceName is required for creating component 'componentName' and must be a string`;
            MbttError.ACTION.EXPECTED_STATE_ERROR.throws(
                {message}
            );

            expect(expectedState.createComponent.bind(null, 'componentName', 1234)).to.throw(message);
        });

        it('should throw an error if the passed in options is not an object', function() {
            let message = `Passed in options for instance naame 'instanceName'`
                + ` of component 'componentName' must be an object`;
            MbttError.ACTION.EXPECTED_STATE_ERROR.throws(
                {message}
            );

            expect(expectedState.createComponent.bind(null, 'componentName', 'instanceName', [])).to.throw(message);
        });

        it('should call expectedState.emit', function() {
            expectedState.emit = sinon.stub();

            expectedState.createComponent('compName', component.instanceName);

            expect(expectedState.emit.args[0].slice(0, 2)).to.deep.equal(['expectedState.getComponent', 'compName']);
        });

        describe('when the emit\'s callback is called', function() {
            it('should throw an error if there is one', function() {
                error = new Error('TEST_ERROR');
                expectedState.emit.callsArgOnWith(2, expectedState, error, component);


                try {
                    expectedState.createComponent('compName', component.instanceName);
                } catch (error) {
                    errorCalled = true;
                }

                expect(errorCalled).to.equal(true);
            });

            it('should create the component with options', function() {
                error = undefined;
                expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, error, component);


                let retVal = expectedState.createComponent('compName', component.instanceName, {option1: 'val'});

                expect(retVal).to.deep.equal({instanceName: 'string', parentComponent: 'compName',
                elements: [], model: undefined, actions: undefined, options: {option1: 'val'}});
            });

            it('should create the component without options and set options to an empty object', function() {
                error = undefined;
                expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, error, component);


                let retVal = expectedState.createComponent('compName', component.instanceName);

                expect(retVal).to.deep.equal({instanceName: 'string', parentComponent: 'compName',
                elements: [], model: undefined, actions: undefined, options: {}});
            });

            it('should assign the return value of newComponent.elements() to newComponent.elements', function() {
                error = undefined;
                expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, error, component);
                expectedState.elements = sinon.stub();

                expectedState.createComponent('compName', component.instanceName);

                expect(expectedState.elements.args).to.deep.equal([]);
            });

            it('should call emit with args: [expectedState.elementsReceived,[],string,compName]', function() {
                error = undefined;
                expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, error, component);

                expectedState.createComponent('compName', component.instanceName);

                expect(expectedState.emit.args[1]).to.deep.equal(['expectedState.elementsReceived',
                [], 'string', 'compName']);
            });

            it('should assign the return value of newComponent.model() to newComponent.model', function() {
                error = undefined;
                expectedState.model = sinon.stub();
                expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, error, component);

                expectedState.createComponent('compName', component.instanceName);

                expect(expectedState.model.args).to.deep.equal([]);
            });

            it('should call emit with args: [expectedState.modelReceived, [undefined], string, compName]', function() {
                error = undefined;
                expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, error, component);

                expectedState.createComponent('compName', component.instanceName);

                expect(expectedState.emit.args[2]).to.deep.equal(['expectedState.modelReceived',
                undefined, 'string', 'compName']);
            });

            it('should assign the return value of newComponent.actions() to newComponent.actions', function() {
                error = undefined;
                expectedState.actions = sinon.stub();
                expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, error, component);

                expectedState.createComponent('compName', component.instanceName);

                expect(expectedState.actions.args).to.deep.equal([]);
            });

            it('should call emit with args:'
                + '[expectedState.actionsReceived, [undefined], string, compName]', function() {
                error = undefined;
                expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, error, component);

                expectedState.createComponent('compName', component.instanceName);

                expect(expectedState.emit.args[3]).to.deep.equal(['expectedState.actionsReceived',
                undefined, 'string', 'compName']);
            });

            describe('if newComponent.events is defined', function() {
                it('should call ExpectedState.emit 5 times', function() {
                    let events = sinon.stub();
                    component.events = events;
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, error, component);

                    expectedState.createComponent('compName', component.instanceName, {property: 'value'});

                    expect(expectedState.emit.callCount).to.equal(5);
                });

                it('should call newComponent.events once with instanceName, newComponent.options, ' +
                    'and the this context', function() {
                    let events = sinon.stub();
                    component.events = events;
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, error, component);

                    expectedState.createComponent('compName', component.instanceName, {property: 'value'});

                    expect(events.args).to.deep.equal([
                        ['string', {property: 'value'}, expectedState],
                    ]);
                });

                it('should assign newComponent.events to the result of the call to newComponent.events', function() {
                    let events = sinon.stub().returns('myEvents');
                    component.events = events;
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, error, component);

                    let newComponent = expectedState.createComponent('compName', component.instanceName, {
                        property: 'value',
                    });

                    expect(newComponent.events).to.equal('myEvents');
                });

                it('should call ExpectedState.emit with the event \'expectedState.eventsReceived\', ' +
                    'newComponent.events, instanceName, and componentName', function() {
                    let events = sinon.stub().returns('myEvents');
                    component.events = events;
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, error, component);

                    expectedState.createComponent('compName', component.instanceName, {property: 'value'});

                    expect(expectedState.emit.args[4]).to.deep.equal([
                        'expectedState.eventsReceived',
                        'myEvents',
                        'string',
                        'compName',
                    ]);
                });
            });

            describe('if newComponent.events and newComponent.children is not defined', function() {
                it('should call ExpectedState.emit 4 times', function() {
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, error, component);

                    expectedState.createComponent('compName', component.instanceName, {property: 'value'});

                    expect(expectedState.emit.callCount).to.equal(4);
                });
            });

            describe('if newComponent.children is defined', function() {
                it('should call ExpectedState.emit 5 times', function() {
                    let children = sinon.stub();
                    component.children = children;
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, error, component);

                    expectedState.createComponent('compName', component.instanceName, {property: 'value'});

                    expect(expectedState.emit.callCount).to.equal(5);
                });

                it('should call newComponent.children once with the passed in instanceName, ' +
                    'options, and this context', function() {
                    let children = sinon.stub();
                    component.children = children;
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, error, component);

                    expectedState.createComponent('compName', component.instanceName, {property: 'value'});

                    expect(children.args).to.deep.equal([
                        [
                            'string',
                            {property: 'value'},
                            expectedState,
                        ],
                    ]);
                });

                it('should assign newComponent.children to the result of the call to ' +
                    'newComponent.children', function() {
                    let children = sinon.stub().returns('myChildren');
                    component.children = children;
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, error, component);

                    let newComponent = expectedState.createComponent('compName', component.instanceName, {
                        property: 'value',
                    });

                    expect(newComponent.children).to.equal('myChildren');
                });

                it('should call ExpectedState.emit with the event \'expectedState.childrenReceived\', ' +
                    'newComponent.children, instanceName, and componentName', function() {
                    let children = sinon.stub().returns('myChildren');
                    component.children = children;
                    expectedState.emit.onCall(0).callsArgOnWith(2, expectedState, error, component);

                    expectedState.createComponent('compName', component.instanceName, {property: 'value'});

                    expect(expectedState.emit.args[4]).to.deep.equal([
                        'expectedState.childrenReceived',
                        'myChildren',
                        'string',
                        'compName',
                    ]);
                });
            });
        });
    });

    describe('addComponent', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let component;
        let state;
        let expectedState;
        let fakeExpectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});
            expectedState = require('../../../../lib/util/expected-state.js');
            fakeExpectedState ={
                _state: {},
                _registerEvents: sinon.stub(),
                _addChildren: sinon.stub(),
                _addToDynamicArea: sinon.stub(),
                _components: new Map(),
                _dynamicAreas: new Map(),
            };
            expectedState._state = {};
            component = {
                instanceName: 'string',
                options: {},
            };
            state = {};
            global.MbttError = {
                ACTION: {
                    EXPECTED_STATE_ERROR: sinon.stub(),
                },
            };

            sinon.spy(fakeExpectedState._components, 'set');
        });

        afterEach(function() {
            delete global.MbttError;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
            fakeExpectedState._components.set.restore();
        });

        it('should throw an error the passed in state is not an object', function() {
            let message = `component with instanceName 'instanceName'`
                + `must have a state object to add to expecte state`;
            MbttError.ACTION.EXPECTED_STATE_ERROR.throws(
                {message}
            );

            expect(expectedState.addComponent.bind(null, component, 'notObject')).to.throw(message);
        });

        it('should set a component with a key value pair', function() {
            expectedState.addComponent.call(fakeExpectedState, component, state);

            expect(fakeExpectedState._components.get(component.instanceName)).to.deep.equal(
                {
                    instanceName: 'string',
                    options: {},
                }
            );
        });

        it('should call set with the appropriate args', function() {
            expectedState.addComponent.call(fakeExpectedState, component, state);

            expect(fakeExpectedState._components.set.args).to.deep.equal([
            [component.instanceName, component],
            ]);
        });

        it('should set the state[instanceName] to the passed in state', function() {
            expectedState.addComponent.call(fakeExpectedState, component, state);

            expect(fakeExpectedState._state[component.instanceName]).to.deep.equal({});
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

                expectedState.addComponent.call(fakeExpectedState, component, state);

                expect(fakeExpectedState._registerEvents.args).to.deep.equal([
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
                            instanceName: 'string',
                            options: {},
                        },
                    ],
                ]);
            });
        });

        describe('if component.children is defined', function() {
            it('should call this._addChildren once with the passed in component', function() {
                component.children = [
                    {
                        componentName: 'myComponent',
                        instanceName: 'myInstance',
                        state: {
                            property: 'value',
                        },
                        options: {
                            option: 'option1',
                        },
                    },
                ];

                expectedState.addComponent.call(fakeExpectedState, component, state);

                expect(fakeExpectedState._addChildren.args).to.deep.equal([
                    [
                        {
                            children: [
                                {
                                    componentName: 'myComponent',
                                    instanceName: 'myInstance',
                                    state: {
                                        property: 'value',
                                    },
                                    options: {
                                        option: 'option1',
                                    },
                                },
                            ],
                            instanceName: 'string',
                            options: {},
                        },
                    ],
                ]);
            });
        });

        describe('if component.options.dynamicArea is defined', function() {
            it('should call this._addToDynamicArea once with the passed in component', function() {
                component.options.dynamicArea = 'myDynamicArea';

                expectedState.addComponent.call(fakeExpectedState, component, state);

                expect(fakeExpectedState._addToDynamicArea.args).to.deep.equal([
                    [
                        {
                            instanceName: 'string',
                            options: {
                                dynamicArea: 'myDynamicArea',
                            },
                        },
                    ],
                ]);
            });
        });
    });

    describe('_addToDynamicArea', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;
        let fakeExpectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            fakeExpectedState = {
                _dynamicAreas: new Map(),
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});

            expectedState = require('../../../../lib/util/expected-state.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        describe('if the dynamicArea does not exist', function() {
            it('should create the dynamic area in the map with the key as the dynamic ' +
                'area and the value a set with the component\'s instanceName', function() {
                let component = {
                    instanceName: 'myInstance',
                    options: {
                        dynamicArea: 'myDynamicArea',
                    },
                };

                expectedState._addToDynamicArea.call(fakeExpectedState, component);

                expect(fakeExpectedState._dynamicAreas).to.deep.equal(new Map([
                    [
                        'myDynamicArea',
                        new Set(['myInstance']),
                    ],
                ]));
            });
        });

        describe('if the dynamicArea already exists', function() {
            it('should add the component\'s instanceName to the set', function() {
                fakeExpectedState._dynamicAreas.set('myDynamicArea', new Set(['myFirstInstance']));
                let component = {
                    instanceName: 'mySecondInstance',
                    options: {
                        dynamicArea: 'myDynamicArea',
                    },
                };

                expectedState._addToDynamicArea.call(fakeExpectedState, component);

                expect(fakeExpectedState._dynamicAreas).to.deep.equal(new Map([
                    [
                        'myDynamicArea',
                        new Set(['myFirstInstance', 'mySecondInstance']),
                    ],
                ]));
            });
        });
    });

    describe('_addChildren', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let component;
        let expectedState;
        let fakeExpectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            fakeExpectedState = {
                createComponent: sinon.stub(),
                addComponent: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});
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

                expectedState._addChildren.call(fakeExpectedState, component);

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

                expectedState._addChildren.call(fakeExpectedState, component);

                expect(component.children[0].options.dynamicArea).to.equal('myChildDynamicArea');
            });
        });

        describe('if child.options.dynamicArea is not set and the component.options.dynamicArea is set', function() {
            it('should set child.options.dynamicArea to component.options.dynamicArea', function() {
                component.children.push(
                    {}
                );
                component.options.dynamicArea = 'myComponentDynamicArea';

                expectedState._addChildren.call(fakeExpectedState, component);

                expect(component.children[0].options.dynamicArea).to.equal('myComponentDynamicArea');
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

                expectedState._addChildren.call(fakeExpectedState, component);

                expect(component.children[0].options).to.deep.equal({something: 'value'});
            });
        });

        describe('if there is one item in component.children array', function() {
            it('should call this.createComponent once with child.componentName, ' +
                'child.instanceName, child.options', function() {
                component.children.push(
                    {
                        componentName: 'myComponent',
                        instanceName: 'myInstance',
                        options: {
                            something: 'value',
                        },
                    }
                );

                expectedState._addChildren.call(fakeExpectedState, component);

                expect(fakeExpectedState.createComponent.args).to.deep.equal([
                    [
                        'myComponent',
                        'myInstance',
                        {
                            something: 'value',
                        },
                    ],
                ]);
            });

            it('should call this.addComponent once with the value returned from ' +
                'this.createComponent and child.state', function() {
                component.children.push(
                    {
                        componentName: 'myComponent',
                        instanceName: 'myInstance',
                        options: {
                            something: 'value',
                        },
                        state: {
                            property: 'someValue',
                        },
                    }
                );
                fakeExpectedState.createComponent.returns('myCreatedComponent');

                expectedState._addChildren.call(fakeExpectedState, component);

                expect(fakeExpectedState.addComponent.args).to.deep.equal([
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

                expectedState._addChildren.call(fakeExpectedState, component);

                expect(fakeExpectedState.createComponent.callCount).to.equal(4);
            });
        });
    });

    describe('_registerEvents', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;
        let fakeExpectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            fakeExpectedState = {
                eventEmitter: {
                    on: sinon.stub(),
                },
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});

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

                    expectedState._registerEvents.call(fakeExpectedState, component);

                    expect(fakeExpectedState.eventEmitter.on.args).to.deep.equal([
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

                    expectedState._registerEvents.call(fakeExpectedState, component);

                    expect(fakeExpectedState.eventEmitter.on.args).to.deep.equal([
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
                expectedState._registerEvents.call(fakeExpectedState, {});

                expect(fakeExpectedState.eventEmitter.on.args).to.deep.equal([]);
            });
        });
    });

    describe('_deregisterEvents', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;
        let fakeExpectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            fakeExpectedState = {
                eventEmitter: {
                    removeListener: sinon.stub(),
                },
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});

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

                    expectedState._deregisterEvents.call(fakeExpectedState, component);

                    expect(fakeExpectedState.eventEmitter.removeListener.args).to.deep.equal([
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

                    expectedState._deregisterEvents.call(fakeExpectedState, component);

                    expect(fakeExpectedState.eventEmitter.removeListener.args).to.deep.equal([
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
                expectedState._deregisterEvents.call(fakeExpectedState, {});

                expect(fakeExpectedState.eventEmitter.removeListener.args).to.deep.equal([]);
            });
        });
    });

    describe('createAndAddComponent', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});

            expectedState = require('../../../../lib/util/expected-state.js');
            expectedState.createComponent = sinon.stub();
            expectedState.addComponent = sinon.stub();
            expectedState.createComponent.returns(new Map());
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call createComponent with the passed args', function() {
            let retVal = ['componentName', 'instance', undefined];

            expectedState.createAndAddComponent('componentName', 'instance', {});

            expect(expectedState.createComponent.args[0])
                .to.deep.equal(retVal);
        });
        it('should call addComponent with new component', function() {
            expectedState.createAndAddComponent('componentName', 'instance', {});

            expect(expectedState.addComponent.args[0]).to.deep.equal([new Map(), {}]);
        });
    });

    describe('delete', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let fakeExpectedState;
        let expectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            fakeExpectedState = {
                getComponent: sinon.stub(),
                _deregisterEvents: sinon.stub(),
                _components: {
                    delete: sinon.stub(),
                },
                _state: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});

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
            expectedState.delete.call(fakeExpectedState, 'myInstance');

            expect(fakeExpectedState.getComponent.args).to.deep.equal([
                [
                    'myInstance',
                ],
            ]);
        });

        describe('if this.getComponent returns value', function() {
            it('should call this._deregisterEvents once with the returned component', function() {
                fakeExpectedState.getComponent.returns('myComponent');

                expectedState.delete.call(fakeExpectedState, 'myInstance');

                expect(fakeExpectedState._deregisterEvents.args).to.deep.equal([
                    [
                        'myComponent',
                    ],
                ]);
            });

            it('should call this._components.delete once with the passed in instanceName', function() {
                fakeExpectedState.getComponent.returns('myComponent');

                expectedState.delete.call(fakeExpectedState, 'myInstance');

                expect(fakeExpectedState._components.delete.args).to.deep.equal([
                    [
                        'myInstance',
                    ],
                ]);
            });

            it('should delete the property corresponding to the instanceName on this._state', function() {
                fakeExpectedState.getComponent.returns('myComponent');
                fakeExpectedState._state = {myInstance: 'aValue'};

                expectedState.delete.call(fakeExpectedState, 'myInstance');

                expect(fakeExpectedState._state).to.deep.equal({});
            });
        });

        describe('if this.getComponent returns undefined', function() {
            it('should not call this._components.delete', function() {
                fakeExpectedState.getComponent.returns(undefined);

                expectedState.delete.call(fakeExpectedState, 'myInstance');

                expect(fakeExpectedState._components.delete.args).to.deep.equal([]);
            });
        });
    });

    describe('clear', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;
        let fakeExpectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            fakeExpectedState = {
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
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});

            expectedState = require('../../../../lib/util/expected-state.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call this.eventEmitter.removeAllListeners once with no arguments', function() {
            expectedState.clear.call(fakeExpectedState);

            expect(fakeExpectedState.eventEmitter.removeAllListeners.args).to.deep.equal([[]]);
        });

        it('should set this.state to be an empty object', function() {
            expectedState.clear.call(fakeExpectedState);

            expect(fakeExpectedState._state).to.deep.equal({});
        });

        it('should call this._components.clear once', function() {
            expectedState.clear.call(fakeExpectedState);

            expect(fakeExpectedState._components.clear.callCount).to.equal(1);
        });
    });

    describe('clearDynamicArea', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;
        let dynamicArea;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});
            let expectedStateConstructor = require('../../../../lib/util/expected-state.js');
            expectedStateConstructor.create(function(value) {
                expectedState = value;
            });
            dynamicArea = 'key';
            expectedState.delete = sinon.stub();
            expectedState._dynamicAreas.set(dynamicArea, new Set());
            expectedState._dynamicAreas.get(dynamicArea).add({
                name: 'value',
            });
            sinon.spy(expectedState._dynamicAreas, 'get');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
            expectedState._dynamicAreas.get.restore();
        });

        it('should get components for a valid dynamic area', function() {
            expectedState.clearDynamicArea(dynamicArea);

            expect(expectedState._dynamicAreas.get.args).to.deep.equal([['key']]);
        });
        it('should clear the specified dynamic area', function() {
            expectedState.clearDynamicArea(dynamicArea);

            expect(expectedState.delete.args).to.deep.equal([[{name: 'value'}]]);
        });
        it('should skip clearing the dynamic area since there are no components', function() {
            dynamicArea = undefined;

            expectedState.clearDynamicArea(dynamicArea);

            expect(expectedState._dynamicAreas.get.callCount).to.equal(1);
        });
    });

    describe('getState', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});
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
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});
            let expectedStateConstructor = require('../../../../lib/util/expected-state.js');
            expectedStateConstructor.create(function(value) {
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
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});
            let expectedStateConstructor = require('../../../../lib/util/expected-state.js');
            expectedStateConstructor.create(function(value) {
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
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});
            let expectedStateConstructor = require('../../../../lib/util/expected-state.js');
            expectedStateConstructor.create(function(value) {
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
        let EventEmitter;
        let EventEmitterInstance;
        let instanceName;
        let callback;
        let expectedState;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});
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
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;
        let fakeExpectedState;
        let _;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };

            _ = {
                cloneDeep: sinon.stub().returns({key: 'value'}),
            };

            fakeExpectedState = {
                _state: {
                    key: 'value',
                },
                _components: new Map([['key', 'value']]),
                _stashedStates: [],
                _stashedComponents: [],
                eventEmitter: {
                    removeAllListeners: sinon.stub(),
                },
            };
            sinon.spy(fakeExpectedState._stashedStates, 'push');
            sinon.spy(fakeExpectedState._stashedComponents, 'push');

            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', _);
            expectedState = require('../../../../lib/util/expected-state.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
            fakeExpectedState._stashedStates.push.restore();
            fakeExpectedState._stashedComponents.push.restore();
        });

        it('should call this.eventEmitter.removeAllListeners once with no arguments', function() {
            expectedState.stash.call(fakeExpectedState);

            expect(fakeExpectedState.eventEmitter.removeAllListeners.args).to.deep.equal([[]]);
        });

        it('should clonedeep the state first', function() {
            expectedState.stash.call(fakeExpectedState);

            expect(_.cloneDeep.callCount).to.equal(1);
        });

        it('should push the state into stashed state', function() {
            expectedState.stash.call(fakeExpectedState);

            expect(fakeExpectedState._stashedStates.push.args).to.deep.equal([[{key: 'value'}]]);
        });

        it('should push components into stashed component', function() {
            let returnedMap = new Map();
            returnedMap.set('key', 'value');

            expectedState.stash.call(fakeExpectedState);

            expect(fakeExpectedState._stashedComponents.push.args).to.deep.equal([[returnedMap]]);
        });

        it('should set the state to an empty object', function() {
            expectedState.stash.call(fakeExpectedState);

            expect(fakeExpectedState._state).to.deep.equal({});
        });

        it('should set the components to an empty map', function() {
            expectedState.stash.call(fakeExpectedState);

            expect(fakeExpectedState._components).to.deep.equal(new Map());
        });
    });

    describe('pop', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;
        let fakeExpectedState;
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
            global.MbttError = {
                ACTION: {
                    EXPECTED_STATE_ERROR: sinon.stub(),
                },
            };

            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});
            expectedState = require('../../../../lib/util/expected-state.js');
            stashedComponent = new Map([['key', 'value']]);
            fakeExpectedState = {
                _stashedStates: [{key: 'value'}],
                _stashedComponents: [stashedComponent],
                _registerEvents: sinon.stub(),
                eventEmitter: {
                    removeAllListeners: sinon.stub(),
                },
            };

            sinon.spy(stashedComponent, 'values');
            sinon.spy(fakeExpectedState._stashedStates, 'pop');
            sinon.spy(fakeExpectedState._stashedComponents, 'pop');
        });

        afterEach(function() {
            delete global.MbttError;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
            stashedComponent.values.restore();
            fakeExpectedState._stashedStates.pop.restore();
            fakeExpectedState._stashedComponents.pop.restore();
        });

        describe('if expectedState._stashedStates.length is 0', function() {
            it('should throw an error', function() {
                fakeExpectedState._stashedStates.shift();
                let error = new Error('My Error');
                MbttError.ACTION.EXPECTED_STATE_ERROR.throws(error);

                expect(expectedState.pop.bind(fakeExpectedState)).to.throw('My Error');
            });

            it('should call MbttError.ActionError.EXPECTED_STATE_ERROR a could not pop error message', function() {
                fakeExpectedState._stashedStates.shift();
                let error = new Error('My Error');
                MbttError.ACTION.EXPECTED_STATE_ERROR.throws(error);

                try {
                    expectedState.pop.call(fakeExpectedState);
                } catch (err) {}

                expect(MbttError.ACTION.EXPECTED_STATE_ERROR.args).to.deep.equal([
                    [
                        'Failed to pop. No stashed states.',
                    ],
                ]);
            });
        });

        it('should call this.eventEmitter.removeAllListeners once with no arguments', function() {
            expectedState.pop.call(fakeExpectedState);

            expect(fakeExpectedState.eventEmitter.removeAllListeners.args).to.deep.equal([[]]);
        });

        it('should call pop on the stashed state once', function() {
            expectedState.pop.call(fakeExpectedState);

            expect(fakeExpectedState._stashedStates.pop.callCount).to.equal(1);
        });

        it('should set the _state to the popped state', function() {
            expectedState.pop.call(fakeExpectedState);

            expect(fakeExpectedState._state).to.deep.equal({key: 'value'});
        });

        it('should call pop on the stashed component once', function() {
            expectedState.pop.call(fakeExpectedState);

            expect(fakeExpectedState._stashedComponents.pop.callCount).to.deep.equal(1);
        });

        it('should set the _components to the popped component', function() {
            let returnedMap = new Map();
            returnedMap.set('key', 'value');

            expectedState.pop.call(fakeExpectedState);

            expect(fakeExpectedState._components).to.deep.equal(returnedMap);
        });

        it('should call this._components.values once with no parameters', function() {
            expectedState.pop.call(fakeExpectedState);

            expect(stashedComponent.values.args).to.deep.equal([[]]);
        });

        it('should call this._.values once with no parameters', function() {
            expectedState.pop.call(fakeExpectedState);

            expect(stashedComponent.values.args).to.deep.equal([[]]);
        });

        it('should call this._registerEvents twice with component as the first parameter', function() {
            stashedComponent.set('key2', 'value2');

            expectedState.pop.call(fakeExpectedState);

            expect(fakeExpectedState._registerEvents.args).to.deep.equal([
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
            expectedState.pop.call(fakeExpectedState);

            expect(fakeExpectedState._registerEvents.thisValues).to.deep.equal([
                fakeExpectedState,
            ]);
        });
    });
    describe('storeData', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;
        let key;
        let value;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {
                cloneDeep: sinon.stub().returns('value'),
            });

            expectedState = require('../../../../lib/util/expected-state.js');
            expectedState._dataStore = {};
            key = 'key';
            value = 'value';
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });
        it('should store key value data in the data store', function() {
            expectedState.storeData(key, value);

            expect(expectedState._dataStore[key]).to.equal(value);
        });
    });
    describe('retrieveData', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let key;
        let expectedState;
        let callback;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});
            callback = sinon.spy();
            expectedState = require('../../../../lib/util/expected-state.js');
            expectedState._dataStore = {
                key: 'value',
            };
            key = 'key';
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });
        it('should retrieve data from the datastore corresponding to the passed key', function() {
            expectedState.retrieveData(key, callback);

            expect(callback.args).to.deep.equal([['value']]);
        });
    });
    describe('deleteData', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let expectedState;
        let key;
        let value;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {
                cloneDeep: sinon.stub().returns('value'),
            });

            expectedState = require('../../../../lib/util/expected-state.js');
            expectedState._dataStore = {};
            key = 'key';
            value = 'value';
            expectedState._dataStore[key] = value;
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });
        it('should delete the value for a  given key', function() {
            expectedState.deleteData(key);

            expect(expectedState._dataStore[key]).to.deep.equal(undefined);
        });
    });
    describe('retrieveAndDeleteData', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let key;
        let expectedState;
        let callback;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/util/expected-state.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('lodash', {});
            callback = sinon.spy();
            expectedState = require('../../../../lib/util/expected-state.js');
            expectedState._dataStore = {
                key: 'value',
            };
            key = 'key';
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });
        it('should delete the value for a given key', function() {
            expectedState.retrieveAndDeleteData(key, callback);

            expect(expectedState._dataStore[key]).to.deep.equal(undefined);
        });
        it('should retrieve data of the passed in key from the datastore', function() {
            expectedState.retrieveAndDeleteData(key, callback);

            expect(callback.args).to.deep.equal([['value']]);
        });
    });
});
