'use strict';

const sinon = require('sinon');
const mockery = require('mockery');
const expect = require('chai').expect;

describe('lib/planner/count-actions.js', function() {
  describe('calculate', function() {
    let callback;
    let countActions;
    let algorithm;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/planner/count-actions.js');

      callback = sinon.stub();

      countActions = require('../../../../lib/planner/count-actions.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });
    it('should call initialize all actions occurrences to 0', function() {
      const plans = [];
      algorithm = 'default';
      const discoveredActions = new Set([
        'action1',
        'action2',
        'action3',
      ]);

      countActions.calculate(plans, discoveredActions, algorithm, callback);

      expect(callback.args[0][1].actionOccurrences).to.deep.equal(new Map([
        ['action1', 0],
        ['action2', 0],
        ['action3', 0],
      ]));
    });

    it('should increment an actions occurrence if plan.path has an action has an occurence', function() {
      const plans = [
        {
          path: ['action1', 'action2'],
        },
        {
          path: ['action1', 'action3'],
        },
      ];
      algorithm = 'default';
      const discoveredActions = new Set([
        'action1',
        'action2',
        'action3',
      ]);

      countActions.calculate(plans, discoveredActions, algorithm, callback);

      expect(callback.args[0][1].actionOccurrences).to.deep.equal(new Map([
        ['action1', 2],
        ['action2', 1],
        ['action3', 1],
      ]));
    });

    it('should add actions with occurrence 0 to the actionsNotCovered set', function() {
      const plans = [
        {
          path: ['action1', 'action2'],
        },
        {
          path: ['action1', 'action3'],
        },
      ];
      algorithm = 'default';
      const discoveredActions = new Set([
        'action1',
        'action2',
        'action3',
        'action4',
      ]);

      countActions.calculate(plans, discoveredActions, algorithm, callback);

      expect(callback.args[0][1].actionsNotCovered).to.deep.equal(new Set([
        'action4',
      ]));
    });

    it('should call the callback once with the actionOccurrences and actionsNotCovered', function() {
      const plans = [
        {
          path: ['action1', 'action2'],
        },
        {
          path: ['action1', 'action3'],
        },
      ];
      algorithm = 'default';
      const discoveredActions = new Set([
        'action1',
        'action2',
        'action3',
        'action4',
      ]);

      countActions.calculate(plans, discoveredActions, algorithm, callback);

      expect(callback.args).to.deep.equal([
        [
          null,
          {
            actionOccurrences: new Map([
              ['action1', 2],
              ['action2', 1],
              ['action3', 1],
              ['action4', 0],
            ]),
            actionsNotCovered: new Set([
              'action4',
            ]),
          },
        ],
      ]);
    });
  });
});
