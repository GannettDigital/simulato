'use strict';

module.exports = function applyEffects(node, callback) {
  const actionIdentifier = node.path[node.path.length -1];
  const [name, actionName] = actionIdentifier.split('.');
  const component = node.state.getComponentsAsMap().get(name);
  const action = component.actions[actionName];

  const testCaseAction = {
    name: actionIdentifier,
  };

  if (Array.isArray(action.parameters)) {
    const parameters = action.parameters.map(function(parameter) {
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
