'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/search-node.js', function() {
  describe('on file require', function() {
    let Emitter;
    let plannerEventDispatch;
    let searchNode;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/planner/search-node.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.emitAsync = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();

      mockery.registerMock('lodash', {});
      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('./planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should Emitter.mixIn once with searchNode and plannerEventDispatch ' +
            'as parameters', function() {
      searchNode = require('../../../../lib/planner/search-node.js');

      expect(Emitter.mixIn.args).to.deep.equal([
        [
          searchNode,
          plannerEventDispatch,
        ],
      ]);
    });
  });

  describe('create', function() {
    let Emitter;
    let callback;
    let searchNode;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/planner/search-node.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      callback = sinon.stub();

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('lodash', {});
      mockery.registerMock('./planner-event-dispatch/planner-event-dispatch.js', {});

      searchNode = require('../../../../lib/planner/search-node.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should callback with an object whose prototype is searchNode', function() {
      searchNode.emit.onCall(0).callsArgWith(1, 'myDataStore');
      searchNode.emit.onCall(1).callsArgWith(2, 'myExpectedState');

      searchNode.create([], callback);

      expect(Object.getPrototypeOf(callback.args[0][1])).to.deep.equal(searchNode);
    });

    it('should searchNode.emit with the event \'dataStore.create\'', function() {
      searchNode.create([], callback);

      expect(searchNode.emit.args[0][0]).to.equal('dataStore.create');
    });

    describe('when the callback is called for the event \'dataStore.create\'', function() {
      it('should set myNode.dataStore to the passed in dataStore', function() {
        searchNode.emit.onCall(0).callsArgWith(1, 'myDataStore');
        searchNode.emit.onCall(1).callsArgWith(2, 'myExpectedState');

        searchNode.create([], callback);

        expect(callback.args[0][1].dataStore).to.equal('myDataStore');
      });

      it('should searchNode.emit with the event \'expectedState.create\', and the ' +
                'passed in dataStore', function() {
        searchNode.emit.onCall(0).callsArgWith(1, 'myDataStore');

        searchNode.create([], callback);

        expect(searchNode.emit.args[1].slice(0, 2)).to.deep.equal([
          'expectedState.create',
          'myDataStore',
        ]);
      });

      it('should call searchNode.emit twice', function() {
        searchNode.emit.onCall(0).callsArgWith(1, 'myDataStore');

        searchNode.create([], callback);

        expect(searchNode.emit.callCount).to.equal(2);
      });

      describe('when the callback is called for the event \'expectedState.create\'', function() {
        it('should call the callback once with null and a node the specified properties', function() {
          const node = Object.create(searchNode);
          node.dataStore = 'myDataStore';
          node.state = 'myExpectedState';
          node.path = [];
          node.actions = ['MY_ACTION'];
          node.testCase = [];
          node.lastAction = null;
          node.allActions = new Set();
          searchNode.emit.onCall(0).callsArgWith(1, 'myDataStore');
          searchNode.emit.onCall(1).callsArgWith(2, 'myExpectedState');

          searchNode.create(['MY_ACTION'], callback);

          expect(callback.args).to.deep.equal([
            [
              null,
              node,
            ],
          ]);
        });
      });
    });
  });

  describe('clone', function() {
    let Emitter;
    let _;
    let callback;
    let node;
    let searchNode;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/planner/search-node.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      callback = sinon.stub();
      _ = {
        cloneDeep: sinon.stub(),
      };
      node = {
        create: sinon.stub(),
        dataStore: {
          clone: sinon.stub(),
        },
        actions: new Set(['SOME_ACTION', 'SOME_OTHER_ACTION']),
        state: {
          clone: sinon.stub(),
        },
        path: ['action1', 'action2'],
        testCase: [{name: 'MY_ACTION'}, {name: 'MY_ACTION_2'}],
        lastAction: 'myLastAction',
        allActions: new Set(['AN_ACTION', 'ANOTHER_ACTION']),
      };

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('lodash', _);
      mockery.registerMock('./planner-event-dispatch/planner-event-dispatch.js', {});

      searchNode = require('../../../../lib/planner/search-node.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should node.create once', function() {
      searchNode.clone(node, callback);

      expect(node.create.callCount).to.equal(1);
    });

    it('should call node.create with the actions of the passed in node', function() {
      searchNode.clone(node, callback);

      expect(node.create.args[0][0]).to.deep.equal(
          new Set(['SOME_ACTION', 'SOME_OTHER_ACTION']),
      );
    });

    describe('when the node.create callback is called', function() {
      it('should call node.dataStore.clone once with no arguments', function() {
        node.create.callsArgWith(1, null, {});

        searchNode.clone(node, callback);

        expect(node.dataStore.clone.args).to.deep.equal([[]]);
      });

      it('should set the return of the call to node.dataStore.clone to newNode.dataStore', function() {
        node.create.callsArgWith(1, null, {});
        node.state.clone.callsArgWith(1, {});
        node.dataStore.clone.returns('myClonedDataStore');

        searchNode.clone(node, callback);

        expect(callback.args[0][1].dataStore).to.equal('myClonedDataStore');
      });

      it('should call node.state.clone once', function() {
        node.create.callsArgWith(1, null, {});

        searchNode.clone(node, callback);

        expect(node.state.clone.callCount).to.equal(1);
      });

      it('should call node.state.clone with the first parameter as newNode.dataStore', function() {
        node.create.callsArgWith(1, null, {});
        node.dataStore.clone.returns('myClonedDataStore');

        searchNode.clone(node, callback);

        expect(node.state.clone.args[0][0]).to.equal('myClonedDataStore');
      });

      describe('when the node.state.clone callback is called', function() {
        it('should set call _.cloneDeep once with node.testCase', function() {
          node.create.callsArgWith(1, null, {});
          node.state.clone.callsArgWith(1, {});
          node.dataStore.clone.returns('myClonedDataStore');

          searchNode.clone(node, callback);

          expect(_.cloneDeep.args).to.deep.equal([
            [
              [{name: 'MY_ACTION'}, {name: 'MY_ACTION_2'}],
            ],
          ]);
        });

        it('should set newNode.testCase to result of the call to _.cloneDeep', function() {
          node.create.callsArgWith(1, null, {});
          node.state.clone.callsArgWith(1, {property: 'value'});
          node.dataStore.clone.returns('myClonedDataStore');
          _.cloneDeep.returns('clonedTestCase');

          searchNode.clone(node, callback);

          expect(callback.args[0][1].testCase).to.equal('clonedTestCase');
        });

        it('should call the callback once with null and the newNode', function() {
          node.create.callsArgWith(1, null, {});
          node.state.clone.callsArgWith(1, {property: 'value'});
          node.dataStore.clone.returns('myClonedDataStore');
          _.cloneDeep.returns('clonedTestCase');

          searchNode.clone(node, callback);

          expect(callback.args).to.deep.equal([
            [
              null,
              {
                dataStore: 'myClonedDataStore',
                lastAction: 'myLastAction',
                path: ['action1', 'action2'],
                state: {
                  property: 'value',
                },
                testCase: 'clonedTestCase',
                allActions: new Set(['AN_ACTION', 'ANOTHER_ACTION']),
              },
            ],
          ]);
        });
      });
    });
  });
});
