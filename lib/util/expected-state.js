'use strict';

const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');

let ExpectedState;
module.exports = ExpectedState = {
    create(dataStore, callback) {
        const expectedState = Object.create(ExpectedState);
        expectedState._state = {};
        expectedState._stashedStates = [];
        expectedState._components = new Map();
        expectedState._dynamicAreas = new Map();
        expectedState._stashedComponents = [];
        expectedState.eventEmitter = new EventEmitter();
        expectedState._dataStore = dataStore;
        expectedState._pageState = {};

        return callback(expectedState);
    },
    clone(dataStore, callback) {
        let clonedState;
        this.create(dataStore, (expectedState) => {
            clonedState = expectedState;
            clonedState._state= {};
            clonedState._pageState = _.cloneDeep(this._pageState);
            clonedState._components = new Map();
            for (let [type, component] of this._components.entries()) {
                let componentState = _.cloneDeep(this._state[type]);
                let componentOptions = _.cloneDeep(component.options);
                clonedState.createAndAddComponent({
                    type: component.type,
                    name: component.name,
                    state: componentState,
                    options: componentOptions,
                });
            }
            clonedState._stashedStates = _.cloneDeep(this._stashedStates);
            for (let stashedComponentMap of this._stashedComponents) {
                let components = new Map();
                for (let [name, component] of stashedComponentMap.entries()) {
                    let componentOptions = _.cloneDeep(component.options);
                    let myComponent = clonedState.createComponent({
                        type: component.type,
                        name: name,
                        options: componentOptions,
                    });
                    components.set(myComponent.name, myComponent);
                }
                clonedState._stashedComponents.push(components);
            }

            callback(clonedState);
        });
    },
    createComponent(componentConfig) {
        let {type, name, options, dynamicArea} = componentConfig;
        let newComponent;
        if (!(typeof type === 'string' && type.length > 0)) {
            throw new MbttError.ACTION.EXPECTED_STATE_ERROR(
                `type is required for creating a component and must be a string`
            );
        }
        if (!(typeof name === 'string' && name.length > 0)) {
            throw new MbttError.ACTION.EXPECTED_STATE_ERROR(
                `name is required for creating component '${type}' and must be a string`
            );
        }
        if (options && (!(typeof options === 'object') || Array.isArray(options))) {
            throw new MbttError.ACTION.EXPECTED_STATE_ERROR(
                `Passed in options for instance name '${name}'`
                    +` of component '${type}' must be an object`
            );
        }
        ExpectedState.emit('expectedState.getComponent', type, (error, component) => {
            if (error) {
                throw new MbttError.ACTION.EXPECTED_STATE_ERROR(
                    `${name} of ${type} could not be created. `
                        + `${type} not found in component set`
                );
            }
            newComponent = Object.create(component);
            newComponent.expectedState = this;

            newComponent.getFromPage = function getFromPage(key) {
                return _.get(this.expectedState._pageState, key);
            };

            newComponent.name = name;
            newComponent.type = type;
            newComponent.options = options || {};
            newComponent.elements = newComponent.elements();
            ExpectedState.emit('expectedState.elementsReceived', newComponent.elements, name, type);
            newComponent.model = newComponent.model();
            ExpectedState.emit('expectedState.modelReceived', newComponent.model, name, type);
            newComponent.actions = newComponent.actions();
            ExpectedState.emit('expectedState.actionsReceived', newComponent.actions, name, type);

            if (newComponent.events) {
                newComponent.events = newComponent.events(this, this._dataStore);
                ExpectedState.emit('expectedState.eventsReceived', newComponent.events, name, type);
            }

            if (newComponent.children) {
                newComponent.children = newComponent.children(this, this._dataStore);
                ExpectedState.emit(
                    'expectedState.childrenReceived', newComponent.children, name, type
                );
            }

            if (dynamicArea) {
                newComponent.dynamicArea = dynamicArea;
            }
        });
        return newComponent;
    },
    addComponent(component, state) {
        if (!(typeof state === 'object') || Array.isArray(state)) {
            throw new MbttError.ACTION.EXPECTED_STATE_ERROR(
                `component with name '${component.name}'`
                    + `must have a state object to add to expecte state`
            );
        }

        this._components.set(component.name, component);
        this._state[component.name] = state;

        component._currentWorkingModel = this._pageState[component.instanceName];

        if (component.events) {
            this._registerEvents(component);
        }

        if (component.children) {
            this._addChildren(component);
        }

        if (component.dynamicArea) {
            this._addToDynamicArea(component);
        }
    },
    _addToDynamicArea(component) {
        if (!this._dynamicAreas.get(component.dynamicArea)) {
            this._dynamicAreas.set(component.dynamicArea, new Set());
        }
        this._dynamicAreas.get(component.dynamicArea).add(component.name);
    },
    _addChildren(component) {
        for (let child of component.children) {
            child.options = child.options || {};

            if (!child.dynamicArea && component.dynamicArea) {
                child.dynamicArea = component.dynamicArea;
            }

            let childComponent = this.createComponent(child);
            this.addComponent(childComponent, child.state);
        }
    },
    _registerEvents(component) {
        if (component.events) {
            for (let event of component.events) {
                if (Array.isArray(event.name)) {
                    for (let eventName of event.name) {
                        this.eventEmitter.on(eventName, event.listener);
                    }
                } else {
                    this.eventEmitter.on(event.name, event.listener);
                }
            }
        }
    },
    _deregisterEvents(component) {
        if (component.events) {
            for (let event of component.events) {
                if (Array.isArray(event.name)) {
                    for (let eventName of event.name) {
                        this.eventEmitter.removeListener(eventName, event.listener);
                    }
                } else {
                    this.eventEmitter.removeListener(event.name, event.listener);
                }
            }
        }
    },
    createAndAddComponent(componentConfig) {
        let newComponent = this.createComponent(componentConfig);
        this.addComponent(newComponent, componentConfig.state);
    },
    delete(name) {
        let component = this.getComponent(name);

        if (component) {
            this._deregisterEvents(component);
            this._components.delete(name);
            delete this._state[name];
        }
    },
    clear() {
        this.eventEmitter.removeAllListeners();
        this._state = {};
        this._components.clear();
    },
    clearDynamicArea(dynamicArea) {
        let components = this._dynamicAreas.get(dynamicArea);
        if (components) {
            for (let component of components) {
                this.delete(component);
            }
        }
    },
    getState() {
        return this._state;
    },
    getComponent(key) {
        return this._components.get(key);
    },
    getComponents() {
        return Array.from(this._components.values());
    },
    getComponentsAsMap() {
        return this._components;
    },
    modify(name, callback) {
        callback(this._state[name]);
    },
    stash() {
        this.eventEmitter.removeAllListeners();
        const state = _.cloneDeep(this._state);
        this._stashedStates.push(state);
        this._stashedComponents.push(this._components);
        this._state = {};
        this._components = new Map();
    },
    pop() {
        if (this._stashedStates.length === 0) {
            throw new MbttError.ACTION.EXPECTED_STATE_ERROR('Failed to pop. No stashed states.');
        }

        this.eventEmitter.removeAllListeners();
        this._state = this._stashedStates.pop();
        this._components = this._stashedComponents.pop();
        [...this._components.values()].map(this._registerEvents, this);
    },
};

Object.setPrototypeOf(ExpectedState, new EventEmitter());
