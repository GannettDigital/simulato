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
        expectedState._stashedDynamicAreas = [];
        expectedState._stashedDynamicAreasComponentsAndStates = new Map();
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
                    dynamicArea: component.dynamicArea,
                    cloning: true,
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
                        dynamicArea: component.dynamicArea,
                    });
                    components.set(myComponent.name, myComponent);
                }
                clonedState._stashedComponents.push(components);
            }
            for (let dynamicArea of this._stashedDynamicAreas) {
                let clonedDynamicArea = new Map();
                for (let [dynamicAreaName, components] of dynamicArea.entries()) {
                    clonedDynamicArea.set(dynamicAreaName, new Set(components));
                }
                clonedState._stashedDynamicAreas.push(clonedDynamicArea);
            }

            this._stashedDynamicAreasComponentsAndStates.forEach((value, key, map)=>{
                let clonedDynamicAreaComponentAndState = new Map();
                value.components.forEach((dynamicAreaName)=>{
                    clonedDynamicAreaComponentAndState.set(
                        key,
                        {
                            components: this._stashedDynamicAreasComponentsAndStates.get(key).components,
                            states: this._stashedDynamicAreasComponentsAndStates.get(key).states,
                        });
                    });
                clonedState._stashedDynamicAreasComponentsAndStates = clonedDynamicAreaComponentAndState;
            });
            callback(clonedState);
        });
    },
    createComponent(componentConfig) {
        let {type, name, options, dynamicArea} = componentConfig;
        let newComponent;
        if (!(typeof type === 'string' && type.length > 0)) {
            throw new SimulatoError.ACTION.EXPECTED_STATE_ERROR(
                `type is required for creating a component and must be a string`
            );
        }
        if (!(typeof name === 'string' && name.length > 0)) {
            throw new SimulatoError.ACTION.EXPECTED_STATE_ERROR(
                `name is required for creating component '${type}' and must be a string`
            );
        }
        if (options && (!(typeof options === 'object') || Array.isArray(options))) {
            throw new SimulatoError.ACTION.EXPECTED_STATE_ERROR(
                `Passed in options for instance name '${name}'`
                    +` of component '${type}' must be an object`
            );
        }
        ExpectedState.emit('expectedState.getComponent', type, (error, component) => {
            if (error) {
                throw new SimulatoError.ACTION.EXPECTED_STATE_ERROR(
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
    addComponent(component, state, cloning) {
        if (!(typeof state === 'object') || Array.isArray(state)) {
            throw new SimulatoError.ACTION.EXPECTED_STATE_ERROR(
                `component with name '${component.name}'`
                    + `must have a state object to add to expecte state`
            );
        }

        this._components.set(component.name, component);
        this._state[component.name] = state;

        component._currentWorkingModel = this._pageState[component.name];

        if (component.events) {
            this._registerEvents(component);
        }

        if (component.children && !cloning) {
            this._addChildren(component);
        }

        if (component.dynamicArea) {
            this._addToDynamicArea(component);
        }
    },
    _addToDynamicArea(component) {
        if (component.dynamicArea instanceof Array) {
            component.dynamicArea.forEach((dynamicArea)=>{
                if (!this._dynamicAreas.get(dynamicArea)) {
                    this._dynamicAreas.set(dynamicArea, new Set());
                }
                this._dynamicAreas.get(dynamicArea).add(component.name);
            });
        } else {
            if (!this._dynamicAreas.get(component.dynamicArea)) {
                this._dynamicAreas.set(component.dynamicArea, new Set());
            }
            this._dynamicAreas.get(component.dynamicArea).add(component.name);
        }
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
        this.addComponent(newComponent, componentConfig.state, componentConfig.cloning);
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
        if (this._dynamicAreas.get(dynamicArea)) {
            let components = Array.from(this._dynamicAreas.get(dynamicArea));
            this._dynamicAreas.forEach(
                function(value, key, map) {
                     components.forEach(function(component) {
                           map.get(key).delete(component);
                     });
                   }
            );
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
        this._stashedDynamicAreas.push(this._dynamicAreas);
        this._state = {};
        this._components = new Map();
        this._dynamicAreas = new Map();
    },
    stashDynamicArea(dynamicArea) {
        let stashedDynamicAreaComponents = new Map();
        let stashedDynamicAreaStates = new Map();
            this._dynamicAreas.get(dynamicArea).components.forEach((componentConfig)=>{
                    let component = this.getComponent(componentConfig.name);
                    stashedDynamicAreaComponents.set(componentConfig.name, component);
                    stashedDynamicAreaStates.set(componentConfig.name, this._state[component.type]);
                }
            );
        this._stashedDynamicAreasComponentsAndStates.set(
            dynamicArea,
            {
                components: stashedDynamicAreaComponents,
                states: stashedDynamicAreaStates,
            }
        );
        this.clearDynamicArea(dynamicArea);
    },
    pop() {
        if (this._stashedStates.length === 0) {
            throw new SimulatoError.ACTION.EXPECTED_STATE_ERROR('Failed to pop. No stashed states.');
        }

        this.eventEmitter.removeAllListeners();
        this._state = this._stashedStates.pop();
        this._components = this._stashedComponents.pop();
        this._dynamicAreas = this._stashedDynamicAreas.pop() || new Map();
        [...this._components.values()].map(this._registerEvents, this);
    },
    retrieveDynamicArea(dynamicArea) {
        this._stashedDynamicAreasComponentsAndStates
        .get(dynamicArea)
        .components
        .forEach((value, key, map)=>{
            this.addComponent(
                value,
                this._stashedDynamicAreasComponentsAndStates.get(dynamicArea).states.get(key),
                false);
        });
        this._stashedDynamicAreasComponentsAndStates.delete(dynamicArea);
    },
};

Object.setPrototypeOf(ExpectedState, new EventEmitter());
