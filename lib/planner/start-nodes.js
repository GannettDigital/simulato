'use strict';

const Emitter = require('../util/emitter.js');
const plannerEventDispatch = require('./planner-event-dispatch/planner-event-dispatch.js');
let startNodes;

module.exports = startNodes = {
  * get(callback) {
    const next = yield;

    const entryComponents = yield startNodes.emitAsync('entryComponents.get', next);

    const nodes = [];
    for (const component of entryComponents) {
      const node = yield startNodes.emitAsync('searchNode.create', new Set(), next);

      const configObject = {
        type: component.type,
        name: component.entryComponent.name,
        state: component.entryComponent.state,
        options: component.entryComponent.options,
      };

      node.state.createAndAddComponent(configObject);
      node.testCase.push(configObject);

      const {applicableActions, allActions} = yield startNodes
          .emitAsync('possibleActions.get', node.state, next);
      node.actions = applicableActions;
      node.allActions = allActions;
      nodes.push(node);
    }

    return callback(null, nodes);
  },
};

Emitter.mixIn(startNodes, plannerEventDispatch);
