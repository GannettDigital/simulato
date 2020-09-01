'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/apply-effects.js', function() {
  let applyEffects;
  let node;
  let callback;
  let action;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../lib/planner/apply-effects.js');

    applyEffects = require('../../../../lib/planner/apply-effects.js');

    const sampleMap = new Map();
    sampleMap.set('test', {
      actions: {
        ACTION: {
          perform: sinon.stub(),
          effects: sinon.stub(),
          parameters: [{
            generate: sinon.stub().returns('parameter'),
          }],
        },
      },
    });

    node = {
      path: ['test.ACTION'],
      state: {
        getComponentsAsMap: sinon.stub().returns(sampleMap),
      },
      testCase: {
        push: sinon.stub(),
      },
      dataStore: {
        storedData: 'someData',
      },
    };
    callback = sinon.stub();
    action = node.state.getComponentsAsMap().get('test').actions.ACTION;
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });
  it('should call the callback once', function() {
    applyEffects(node, callback);

    expect(callback.callCount).to.equal(1);
  });
  it('should call node.testCase.push once', function() {
    const testObject =
        {'name': 'test.ACTION',
          'options':
                    {'parameters':
                        ['parameter'],
                    },
        };

    applyEffects(node, callback);

    expect(node.testCase.push.args).to.deep.equal([[testObject]]);
  });
  it('should assign last action to the node', function() {
    applyEffects(node, callback);

    expect(node.lastAction).to.equal('test.ACTION');
  });
  describe('if the parameters are an array', function() {
    it('should call the generate function passing in node.datastore', function() {
      applyEffects(node, callback);

      expect(action.parameters[0].generate.args).to.deep.equal([[
        node.dataStore,
      ]]);
    });
    it('should call the generate function with the passed in this context of component', function() {
      applyEffects(node, callback);

      expect(action.parameters[0].generate.thisValues).to.deep.equal([
        node.state.getComponentsAsMap().get('test'),
      ]);
    });
    it('should call the generate function and produce "parameter"', function() {
      applyEffects(node, callback);

      expect(action.effects.args[0][0]).to.deep.equal('parameter');
    });
    it('should call action effects with the testCaseAction.option.parameters, ' +
            'the node.state, and the node.dataStore', function() {
      applyEffects(node, callback);

      expect(action.effects.args[0]).to.deep.equal(['parameter', node.state, node.dataStore]);
    });
    it('should call action effects with the this context of component', function() {
      applyEffects(node, callback);

      expect(action.effects.thisValues).to.deep.equal([
        node.state.getComponentsAsMap().get('test'),
      ]);
    });
    it('should throw an error if the parameters and action effects throws an error', function() {
      const thrown = new Error('ERROR_THROWN');
      let err;
      action.effects.throws(thrown);

      try {
        applyEffects(node, callback);
      } catch (error) {
        err = error;
      }

      expect(err).to.deep.equal(thrown);
    });
  });
  describe('if the parameters are not an array', function() {
    it('it should call action.effects with node state and node.dataStore passed in', function() {
      action.parameters = {};

      applyEffects(node, callback);

      expect(action.effects.args[0]).to.deep.equal([node.state, node.dataStore]);
    });

    it('should call action effects with the this context of component', function() {
      action.parameters = {};

      applyEffects(node, callback);

      expect(action.effects.thisValues).to.deep.equal([
        node.state.getComponentsAsMap().get('test'),
      ]);
    });
    it('should throw an error if the action effects throws an error', function() {
      const thrown = new Error('ERROR_THROWN');
      let err;
      action.parameters = {};
      action.effects.throws(thrown);

      try {
        applyEffects(node, callback);
      } catch (error) {
        err = error;
      }

      expect(err).to.deep.equal(thrown);
    });
  });
});
