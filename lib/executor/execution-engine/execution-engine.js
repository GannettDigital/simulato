'use strict';

const EventEmitter = require('events').EventEmitter;

let executionEngine;

module.exports = executionEngine = {
    _actionList: [],
    _expectedState: null,
    _dataStore: null,
    _action: null,
    _actionConfig: null,
    _step: null,
    _steps: [],
    configure(testCaseActions) {
        executionEngine._actionList = testCaseActions;

        executionEngine.emit('executionEngine.createDataStore', function(dataStore) {
            executionEngine._dataStore = dataStore;
            executionEngine.emit('executionEngine.createExpectedState', executionEngine._dataStore,
                function(expectedState) {
                    executionEngine._expectedState = expectedState;
                    let {componentName, instanceName, state, options} = executionEngine._actionList.shift();
                    executionEngine._expectedState.createAndAddComponent({componentName, instanceName, state, options});
                    executionEngine.emit('executionEngine.configured');
                }
            );
        });
    },
    _executeNextAction() {
        if (executionEngine._actionList.length === 0) {
            return executionEngine.emit('executionEngine.actionsFinished');
        }

        executionEngine._actionConfig = executionEngine._actionList.shift();
        let [instanceName, actionName] = executionEngine._actionConfig.name.split('.');
        executionEngine._actionConfig.instanceName = instanceName;
        executionEngine._actionConfig.actionName = actionName;

        let components = executionEngine._expectedState.getComponentsAsMap();

        if (!components.has(instanceName)) {
            throw new Error(`Component, ${instanceName}, does not exist in expected state during execution`);
        }

        executionEngine._action = components.get(instanceName).actions[actionName];

        if (!executionEngine._action) {
            throw new Error(`Action, ${actionName}, does not exist in component ${instanceName}`);
        }

        executionEngine._action.preconditions && executionEngine._steps.push('preconditions');
        executionEngine._steps.push('perform');
        executionEngine._steps.push('effects');

        executionEngine.emit(
            'executionEngine.actionStarted',
            executionEngine._action,
            executionEngine._actionConfig,
            executionEngine._steps);
    },
    _executeStep() {
        if (executionEngine._steps.length === 0) {
            return executionEngine.emit('executionEngine.actionFinished', executionEngine._action);
        }

        executionEngine._step = executionEngine._steps.shift();
        let callback = function(error) {
            if (error) {
                throw error;
            }
            executionEngine.emit('executionEngine.stepCompleted');
        };

        let actionParameters;
        if (executionEngine._actionConfig.options && executionEngine._actionConfig.options.parameters) {
            actionParameters = executionEngine._actionConfig.options.parameters;
        }

        executionEngine.emit('executionEngine.stepStarted', executionEngine._step);

        let component = executionEngine._expectedState.getComponentsAsMap()
            .get(executionEngine._actionConfig.instanceName);

        switch (executionEngine._step) {
            case 'preconditions':
                let preconditions;
                if (actionParameters) {
                    preconditions = executionEngine._action.preconditions
                        .call(component, ...actionParameters, executionEngine._dataStore);
                } else {
                    preconditions = executionEngine._action.preconditions
                        .call(component, executionEngine._dataStore);
                }
                executionEngine.emit(
                    'executionEngine.preconditionsReady',
                    executionEngine._expectedState,
                    preconditions,
                    10000,
                    callback
                );
                break;

            case 'perform':
                if (actionParameters) {
                    try {
                        executionEngine._action.perform
                            .call(component, ...actionParameters, callback);
                    } catch (error) {
                        error.message = `The error '${error.message}' was thrown while ` +
                        `executing the perform function for ` +
                        `'${executionEngine._actionConfig.instanceName}' ` +
                        `- '${executionEngine._actionConfig.actionName}'`;
                        throw error;
                    }
                } else {
                    try {
                        executionEngine._action.perform
                            .call(component, callback);
                    } catch (error) {
                        error.message = `The error '${error.message}' was thrown while ` +
                        `executing the perform function for ` +
                        `'${executionEngine._actionConfig.instanceName}' ` +
                        `- '${executionEngine._actionConfig.actionName}'`;
                        throw error;
                    }
                }
                break;

            case 'effects':
                if (actionParameters) {
                    try {
                        executionEngine._action.effects.call(
                                component,
                                ...actionParameters,
                                executionEngine._expectedState,
                                executionEngine._dataStore
                            );
                    } catch (error) {
                        error.message = `The error '${error.message}' was thrown while ` +
                        `executing the perform function for ` +
                        `'${executionEngine._actionConfig.instanceName}' ` +
                        `- '${executionEngine._actionConfig.actionName}'`;
                        throw error;
                    }
                } else {
                    try {
                        executionEngine._action.effects
                            .call(component, executionEngine._expectedState, executionEngine._dataStore);
                    } catch (error) {
                        error.message = `The error '${error.message}' was thrown while ` +
                        `executing the perform function for ` +
                        `'${executionEngine._actionConfig.instanceName}' ` +
                        `- '${executionEngine._actionConfig.actionName}'`;
                        throw error;
                    }
                }
                executionEngine.emit('executionEngine.effectsApplied',
                    executionEngine._expectedState, 10000, callback);
                break;
        }
    },
    _stepCompleted() {
        executionEngine.emit(
            'executionEngine.stepEnded',
            null,
            executionEngine._action,
            executionEngine._actionConfig,
            executionEngine._step,
            'pass'
        );
        executionEngine.emit(
            'executionEngine.nextStepReadied',
            executionEngine._action,
            executionEngine._actionConfig,
            executionEngine._steps
        );
    },
    errorOccurred(error) {
        error.name = error.name;
        executionEngine.emit('executionEngine.actionErrored', error);
        executionEngine.emit(
            'executionEngine.stepEnded',
            error,
            executionEngine._action,
            executionEngine._actionConfig,
            executionEngine._step,
            'fail'
        );
    },
    done() {
        executionEngine.emit('executionEngine.done');
    },
};

Object.setPrototypeOf(executionEngine, new EventEmitter());

executionEngine.on('executionEngine.configured', executionEngine._executeNextAction);
executionEngine.on('executionEngine.actionStarted', executionEngine._executeStep);
executionEngine.on('executionEngine.stepCompleted', executionEngine._stepCompleted);
executionEngine.on('executionEngine.actionFinished', executionEngine._executeNextAction);
executionEngine.on('executionEngine.nextStepReadied', executionEngine._executeStep);
executionEngine.on('executionEngine.actionsFinished', executionEngine.done);
executionEngine.on('executionEngine.errorHandled', executionEngine.done);
