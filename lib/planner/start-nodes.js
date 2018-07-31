'use strict';

const Emitter = require('../util/emitter.js');
const plannerEventDispatch = require('./planner-event-dispatch/planner-event-dispatch.js');
let startNodes;

module.exports = startNodes = {
    * get(callback) {
        let next = yield;

        let components = yield startNodes.emitAsync('componentHandler.getComponents', next);

        let entryComponents = [];
        for (let type in components) {
            if (components[type].entryComponent) {
                entryComponents.push(type);
            }
        }

        if (entryComponents.length === 0) {
            throw new SimulatoError.COMPONENT.NO_ENTRY_POINT('Planning failed, no entry component found');
        }

        let nodes = [];
        for (let type of entryComponents) {
            let component = components[type];
            let node = yield startNodes.emitAsync('searchNode.create', new Set(), next);

            let configObject = {
                type: type,
                name: component.entryComponent.name,
                state: component.entryComponent.state,
                options: component.entryComponent.options,
            };

            node.state.createAndAddComponent(configObject);
            node.testCase.push(configObject);

            let {applicableActions, allActions} = yield startNodes
                .emitAsync('possibleActions.get', node, next);
            node.actions = applicableActions;
            node.allActions = allActions;
            nodes.push(node);
        }

        return callback(null, nodes);
    },
};

Emitter.mixIn(startNodes, plannerEventDispatch);
