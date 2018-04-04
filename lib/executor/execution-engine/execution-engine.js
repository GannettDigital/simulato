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
                    let {type, name, state, options} = executionEngine._actionList.shift();
                    executionEngine._expectedState.createAndAddComponent({type, name, state, options});
                    executionEngine.emit('executionEngine.configured');
                }
            );
        });
    },
    _executeNextAction() {
        if (executionEngine._actionList.length === 0) {
            return executionEngine.emit('executionEngine.actionsFinished');
        }

        let actionObject = executionEngine._actionList.shift();
        let [name, actionName] = actionObject.name.split('.');
        executionEngine._actionConfig = {name, actionName, options: actionObject.options};

        let components = executionEngine._expectedState.getComponentsAsMap();

        if (!components.has(name)) {
            throw new Error(`Component, ${name}, does not exist in expected state during execution`);
        }

        executionEngine._action = components.get(name).actions[actionName];

        if (!executionEngine._action) {
            throw new Error(`Action, ${actionName}, does not exist in component ${name}`);
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
            .get(executionEngine._actionConfig.name);

        switch (executionEngine._step) {
            case 'preconditions':
                executionEngine.emit(
                    'executionEngine.preconditionsReadyForVerification',
                    executionEngine._expectedState,
                    executionEngine._action,
                    executionEngine._actionConfig,
                    executionEngine._dataStore,
                    actionParameters,
                    10000);
                break;

            case 'perform':
                try {
                    if (actionParameters) {
                        executionEngine._action.perform
                            .call(component, ...actionParameters, callback);
                    } else {
                        executionEngine._action.perform
                            .call(component, callback);
                    }
                } catch (error) {
                    error.message = `The error '${error.message}' was thrown while ` +
                    `executing the perform function for ` +
                    `'${executionEngine._actionConfig.name}' ` +
                    `- '${executionEngine._actionConfig.actionName}'`;
                    throw error;
                }
                break;

            case 'effects':
                executionEngine.emit(
                    'executionEngine.effectsReadyForVerification',
                    executionEngine._expectedState,
                    executionEngine._action,
                    executionEngine._actionConfig,
                    executionEngine._dataStore,
                    actionParameters,
                    10000
                );
                break;
        }
    },
    applyPreconditions() {
        let actionParameters;
        if (executionEngine._actionConfig.options && executionEngine._actionConfig.options.parameters) {
            actionParameters = executionEngine._actionConfig.options.parameters;
        }

        let component = executionEngine._expectedState.getComponent(executionEngine._actionConfig.name);

        try {
            if (actionParameters) {
                executionEngine._action.preconditions.call(
                    component,
                    ...actionParameters,
                    executionEngine._dataStore
                );
            } else {
                executionEngine._action.preconditions.call(
                    component,
                    executionEngine._dataStore
                );
            }
        } catch (error) {
            error.message = `The error '${error.message}' was thrown while ` +
            `executing the preconditions function for ` +
            `'${executionEngine._actionConfig.name}' ` +
            `- '${executionEngine._actionConfig.actionName}'`;
            throw error;
        }

        executionEngine.emit('executionEngine.stepCompleted');
    },
    applyEffects() {
        let actionParameters;
        if (executionEngine._actionConfig.options && executionEngine._actionConfig.options.parameters) {
            actionParameters = executionEngine._actionConfig.options.parameters;
        }

        let component = executionEngine._expectedState.getComponent(executionEngine._actionConfig.name);

        try {
            if (actionParameters) {
                executionEngine._action.effects.call(
                    component,
                    ...actionParameters,
                    executionEngine._expectedState,
                    executionEngine._dataStore
                );
            } else {
                executionEngine._action.effects.call(
                    component,
                    executionEngine._expectedState,
                    executionEngine._dataStore
                );
            }
        } catch (error) {
            error.message = `The error '${error.message}' was thrown while ` +
            `executing the effects function for ` +
            `'${executionEngine._actionConfig.name}' ` +
            `- '${executionEngine._actionConfig.actionName}'`;
            throw error;
        }

        executionEngine.emit('executionEngine.stepCompleted');
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
