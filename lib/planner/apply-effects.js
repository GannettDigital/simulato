'use strict';

module.exports = function applyEffects(node, callback) {
  let actionIdentifier = node.path[node.path.length -1];
  let [name, actionName] = actionIdentifier.split('.');
  let component = node.state.getComponentsAsMap().get(name);
  let action = component.actions[actionName];

  let testCaseAction = {
    name: actionIdentifier,
  };

  if (Array.isArray(action.parameters)) {
    let parameters = action.parameters.map(function(parameter) {
      return parameter.generate.call(component, node.dataStore);
    });
    testCaseAction.options = {
      parameters,
    };
    action.effects.call(component, ...testCaseAction.options.parameters, node.state, node.dataStore);
  } else {
    action.effects.call(component, node.state, node.dataStore);
  }

  node.testCase.push(testCaseAction);
  node.lastAction = actionIdentifier;

  callback();
};
