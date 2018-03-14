'use strict';

const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');

let ExpectedState;
module.exports = ExpectedState = {
    create(callback) {
        const expectedState = Object.create(ExpectedState);
        expectedState._state = {};
        expectedState._stashedStates = [];
        expectedState._components = new Map();
        expectedState._dynamicAreas = new Map();
        expectedState._stashedComponents = [];
        expectedState._dataStore = {};
        expectedState.eventEmitter = new EventEmitter();

        return callback(expectedState);
    },
    clone(callback) {
        let clonedState;
        this.create((expectedState) => {
            clonedState = expectedState;
            clonedState._state= {};
            clonedState._components = new Map();
            for (let [componentName, component] of this._components.entries()) {
                let componentState = _.cloneDeep(this._state[componentName]);
                let componentOptions = _.cloneDeep(component.options || {});
                clonedState.createAndAddComponent(component.name, component.instanceName,
                    componentState, componentOptions);
            }
            clonedState._stashedStates = _.cloneDeep(this._stashedStates);
            for (let stashedComponentMap of this._stashedComponents) {
                let components = new Map();
                for (let [instanceName, component] of stashedComponentMap.entries()) {
                    let componentOptions = _.cloneDeep(component.options || {});
                    let myComponent = clonedState.createComponent(component.name, instanceName, componentOptions);
                    components.set(myComponent.instanceName, myComponent);
                }
                clonedState._stashedComponents.push(components);
            }

            callback(clonedState);
        });
    },
    createComponent(componentName, instanceName, options) {
        let newComponent;
        if (!(typeof componentName === 'string' && componentName.length > 0)) {
            throw new MbttError.ACTION.EXPECTED_STATE_ERROR(
                `componentName is required for creating a component and must be a string`
            );
        }
        if (!(typeof instanceName === 'string' && instanceName.length > 0)) {
            throw new MbttError.ACTION.EXPECTED_STATE_ERROR(
                `instanceName is required for creating component '${componentName}' and must be a string`
            );
        }
        if (options && (!(typeof options === 'object') || Array.isArray(options))) {
            throw new MbttError.ACTION.EXPECTED_STATE_ERROR(
                `Passed in options for instance name '${instanceName}'`
                    +` of component '${componentName}' must be an object`
            );
        }
        ExpectedState.emit('expectedState.getComponent', componentName, (error, component) => {
            if (error) {
                throw new MbttError.ACTION.EXPECTED_STATE_ERROR(
                    `${instanceName} of ${componentName} could not be created. `
                        + `${componentName} not found in component set`
                );
            }
            newComponent = Object.create(component);
            newComponent.instanceName = instanceName;
            newComponent.parentComponent = componentName;
            newComponent.options = options || {};
            newComponent.elements = newComponent.elements(instanceName, options);
            ExpectedState.emit('expectedState.elementsReceived', newComponent.elements, instanceName, componentName);
            newComponent.model = newComponent.model();
            ExpectedState.emit('expectedState.modelReceived', newComponent.model, instanceName, componentName);
            newComponent.actions = newComponent.actions(instanceName, options);
            ExpectedState.emit('expectedState.actionsReceived', newComponent.actions, instanceName, componentName);

            if (newComponent.events) {
                newComponent.events = newComponent.events(instanceName, options, this);
                ExpectedState.emit('expectedState.eventsReceived', newComponent.events, instanceName, componentName);
            }

            if (newComponent.children) {
                newComponent.children = newComponent.children(instanceName, options, this);
                ExpectedState.emit(
                    'expectedState.childrenReceived', newComponent.children, instanceName, componentName
                );
            }
        });
        return newComponent;
    },
    addComponent(component, state) {
        if (!(typeof state === 'object') || Array.isArray(state)) {
            throw new MbttError.ACTION.EXPECTED_STATE_ERROR(
                `component with instanceName '${component.instanceName}'`
                    + `must have a state object to add to expecte state`
            );
        }

        this._components.set(component.instanceName, component);
        this._state[component.instanceName] = state;

        if (component.events) {
            this._registerEvents(component);
        }

        if (component.children) {
            this._addChildren(component);
        }

        if (component.options.dynamicArea) {
            this._addToDynamicArea(component);
        }
    },
    _addToDynamicArea(component) {
        if (!this._dynamicAreas.get(component.options.dynamicArea)) {
            this._dynamicAreas.set(component.options.dynamicArea, new Set());
        }
        this._dynamicAreas.get(component.options.dynamicArea).add(component.instanceName);
    },
    _addChildren(component) {
        for (let child of component.children) {
            child.options = child.options || {};

            if (!child.options.dynamicArea && component.options.dynamicArea) {
                child.options.dynamicArea = component.options.dynamicArea;
            }

            let childComponent = this.createComponent(child.componentName, child.instanceName, child.options);
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
    createAndAddComponent(componentName, instanceName, state, options) {
        let newComponent = this.createComponent(componentName, instanceName, options);
        this.addComponent(newComponent, state);
    },
    delete(instanceName) {
        let component = this.getComponent(instanceName);

        if (component) {
            this._deregisterEvents(component);
            this._components.delete(instanceName);
            delete this._state[instanceName];
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
    modify(instanceName, callback) {
        callback(this._state[instanceName]);
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
    storeData(key, value) {
        this._dataStore[key] = _.cloneDeep(value);
    },
    retrieveData(key, callback) {
        return callback(this._dataStore[key]);
    },
    deleteData(key) {
        delete this._dataStore[key];
    },
    retrieveAndDeleteData(key, callback) {
        let temp = this._dataStore[key];
        delete this._dataStore[key];
        return callback(temp);
    },
};

Object.setPrototypeOf(ExpectedState, new EventEmitter());
