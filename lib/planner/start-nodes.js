'use strict';

const Emitter = require('../util/emitter.js');
const plannerEventDispatch = require('./planner-event-dispatch/planner-event-dispatch.js');
let startNodes;

module.exports = startNodes = {
  * get(callback) {
    let next = yield;

    let entryComponents = yield startNodes.emitAsync('entryComponents.get', next);

    let nodes = [];
    for (let component of entryComponents) {
      let node = yield startNodes.emitAsync('searchNode.create', new Set(), next);

      let configObject = {
        type: component.type,
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
