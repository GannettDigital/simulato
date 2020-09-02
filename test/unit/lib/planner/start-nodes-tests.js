'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/start-nodes.js', function() {
  describe('on file require', function() {
    let Emitter;
    let startNodes;
    let plannerEventDispatch;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/planner/start-nodes.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.emitAsync = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('./planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should Emitter.mixIn once with startNodes and plannerEventDispatch as parameters', function() {
      startNodes = require('../../../../lib/planner/start-nodes.js');

      expect(Emitter.mixIn.args).to.deep.equal([
        [
          startNodes,
          plannerEventDispatch,
        ],
      ]);
    });
  });

  describe('get', function() {
    let Emitter;
    let startNodes;
    let next;
    let callback;
    let node;
    let nodeTwo;
    let components;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/planner/start-nodes.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.emitAsync = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      next = sinon.stub();
      callback = sinon.stub();
      components = {
        componentOne: {
          entryComponent: {
            name: 'myName',
            state: {
              property: 'value',
            },
            options: {
              myOption: 'option',
            },
          },
        },
        componentTwo: {
          entryComponent: {
            name: 'myName',
            state: {
              property: 'value',
            },
            options: {
              myOption: 'option',
            },
          },
        },
      };
      node = {
        state: {
          createAndAddComponent: sinon.stub(),
        },
        testCase: {
          push: sinon.stub(),
        },
      };
      nodeTwo = {
        state: {
          createAndAddComponent: sinon.stub(),
        },
        testCase: {
          push: sinon.stub(),
        },
      };

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('./planner-event-dispatch/planner-event-dispatch.js', {});

      startNodes = require('../../../../lib/planner/start-nodes.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call startNodes.emitAsync with the event \'entryComponents.get\' and next', function() {
      const generator = startNodes.get(callback);

      generator.next();
      generator.next(next);

      expect(startNodes.emitAsync.args[0]).to.deep.equal([
        'entryComponents.get',
        next,
      ]);
    });

    describe('for each entry component', function() {
      it('should call startNodes.emitAsync with the event \'searchNode.create\', and empty set, ' +
        ' and next', function() {
        const generator = startNodes.get(callback);

        generator.next();
        generator.next(next);
        generator.next([components.componentOne, components.componentTwo]);

        expect(startNodes.emitAsync.args[1]).to.deep.equal([
          'searchNode.create',
          new Set(),
          next,
        ]);
      });

      it('should call node.state.createAndAddComponent with the type, name, state, and options in an ' +
        'object', function() {
        const generator = startNodes.get(callback);
        components.componentOne.type = 'componentOne';

        generator.next();
        generator.next(next);
        generator.next([components.componentOne, components.componentTwo]);
        generator.next(node);

        expect(node.state.createAndAddComponent.args).to.deep.equal([
          [
            {
              type: 'componentOne',
              name: 'myName',
              state: {
                property: 'value',
              },
              options: {
                myOption: 'option',
              },
            },
          ],
        ]);
      });

      it('should call node.testCase.push with the type, name, state, and options in an object', function() {
        const generator = startNodes.get(callback);
        components.componentOne.type = 'componentOne';

        generator.next();
        generator.next(next);
        generator.next([components.componentOne, components.componentTwo]);
        generator.next(node);

        expect(node.testCase.push.args).to.deep.equal([
          [
            {
              type: 'componentOne',
              name: 'myName',
              state: {
                property: 'value',
              },
              options: {
                myOption: 'option',
              },
            },
          ],
        ]);
      });

      it('should calll startNodes.emitAsync with the event \'possibleActions.get\', ' +
        ' node, and next', function() {
        const generator = startNodes.get(callback);
        components.componentOne.type = 'componentOne';

        generator.next();
        generator.next(next);
        generator.next([components.componentOne, components.componentTwo]);
        generator.next(node);

        expect(startNodes.emitAsync.args[2]).to.deep.equal([
          'possibleActions.get',
          node.state,
          next,
        ]);
      });

      it('should set node.actions to the returned applicableActions from yielding to startNodes.emitAsync ' +
        'with the event \'possibleActions.get\'', function() {
        const generator = startNodes.get(callback);
        const applicableActions = new Set(['ACTION_1', 'ACTION_2']);

        generator.next();
        generator.next(next);
        generator.next([components.componentOne, components.componentTwo]);
        generator.next(node);
        generator.next({applicableActions});

        expect(node.actions).to.deep.equal(new Set(['ACTION_1', 'ACTION_2']));
      });

      it('should set node.allActions to the returned allActions from yielding to startNodes.emitAsync with the ' +
        'event \'possibleActions.get\'', function() {
        const generator = startNodes.get(callback);
        const allActions = new Set(['ACTION_1', 'ACTION_2', 'ACTION_3']);

        generator.next();
        generator.next(next);
        generator.next([components.componentOne, components.componentTwo]);
        generator.next(node);
        generator.next({allActions});

        expect(node.allActions).to.deep.equal(new Set(['ACTION_1', 'ACTION_2', 'ACTION_3']));
      });
    });

    describe('if there are two entryComponents', function() {
      it('should call startNodes.emitAsync 5 times', function() {
        const generator = startNodes.get(callback);

        generator.next();
        generator.next(next);
        generator.next([components.componentOne, components.componentTwo]);
        generator.next(node);
        generator.next({});
        generator.next(nodeTwo);
        generator.next({});

        expect(startNodes.emitAsync.callCount).to.equal(5);
      });
    });

    describe('if there is one entryComponent', function() {
      it('should call startNodes.emitAsync 3 times', function() {
        delete components.componentTwo;
        const generator = startNodes.get(callback);

        generator.next();
        generator.next(next);
        generator.next([components.componentOne, components.componentTwo]);
        generator.next(node);
        generator.next({});

        expect(startNodes.emitAsync.callCount).to.equal(4);
      });
    });

    it('should call the passed in callback once with null, and the nodes', function() {
      const generator = startNodes.get(callback);

      generator.next();
      generator.next(next);
      generator.next([components.componentOne, components.componentTwo]);
      generator.next(node);
      generator.next({});
      generator.next(nodeTwo);
      generator.next({});

      expect(callback.args).to.deep.equal([
        [
          null,
          [node, nodeTwo],
        ],
      ]);
    });
  });
});
