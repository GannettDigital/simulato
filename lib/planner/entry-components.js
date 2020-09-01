'use strict';

const Emitter = require('../util/emitter.js');
const plannerEventDispatch = require('./planner-event-dispatch/planner-event-dispatch.js');
let entryComponents;

module.exports = entryComponents = {
  * get(callback) {
    const next = yield;

    const allComponents = yield entryComponents.emitAsync('componentHandler.getComponents', next);

    const filteredComponents = [];
    for (const component in allComponents) {
      if (allComponents[component].entryComponent) {
        filteredComponents.push(allComponents[component]);
      }
    }

    if (filteredComponents.length === 0) {
      throw new SimulatoError.COMPONENT.NO_ENTRY_POINT('Planning failed, no entry component found');
    }

    return callback(null, filteredComponents);
  },
};

Emitter.mixIn(entryComponents, plannerEventDispatch);
