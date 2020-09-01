'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/reduce-to-minimum-set-of-plans.js', function() {
  let setOperations;
  let callback;
  let reduceToMinimumSetOfPlans;
  let algorithm;
  let crypto;
  let hash;
  let digest;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../lib/planner/reduce-to-minimum-set-of-plans.js');

    setOperations = {
      isSuperset: sinon.stub(),
    };
    callback = sinon.stub();
    algorithm = 'default';

    digest = sinon.stub();
    hash = {
      update: sinon.stub().returns({
        digest,
      }),
    };
    crypto = {
      createHash: sinon.stub().returns(hash),
    };

    mockery.registerMock('../util/set-operations.js', setOperations);
    mockery.registerMock('crypto', crypto);

    reduceToMinimumSetOfPlans = require('../../../../lib/planner/reduce-to-minimum-set-of-plans.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('when the algorithm is actionTree', function() {
    describe('for each plan from the passed in plans', function() {
      it('should create a hash for each plan', function() {
        const plans = [
          {
            path: new Set(['action1', 'action2']),
          },
        ];
        algorithm = 'actionTree';

        reduceToMinimumSetOfPlans(plans, algorithm, callback);

        expect(crypto.createHash.args).to.eql([
          ['sha256'],
        ]);
      });

      it('should update the hash with the plan string', function() {
        const plans = [
          {
            path: new Set(['action1', 'action2']),
          },
        ];
        algorithm = 'actionTree';

        reduceToMinimumSetOfPlans(plans, algorithm, callback);

        expect(hash.update.args).to.eql([
          [JSON.stringify({
            path: new Set(['action1', 'action2']),
          })],
        ]);
      });

      it('should create a base64 digest of the hash', function() {
        const plans = [
          {
            path: new Set(['action1', 'action2']),
          },
        ];
        algorithm = 'actionTree';

        reduceToMinimumSetOfPlans(plans, algorithm, callback);

        expect(digest.args).to.eql([
          ['base64'],
        ]);
      });

      describe('when there is not an existing plan', function() {
        it('should add the plan to the array of final plans', function() {
          const plans = [
            {
              path: new Set(['action1', 'action2']),
            },
            {
              path: new Set(['action2', 'action3']),
            },
          ];
          algorithm = 'actionTree';
          digest.onCall(0).returns('first');
          digest.onCall(1).returns('second');

          reduceToMinimumSetOfPlans(plans, algorithm, callback);

          expect(callback.args).to.eql([
            [
              null,
              [
                {
                  path: new Set(['action1', 'action2']),
                },
                {
                  path: new Set(['action2', 'action3']),
                },
              ],
            ],
          ]);
        });
      });

      describe('when there is an existing plan', function() {
        it('should not add the plan to the array of final plans', function() {
          const plans = [
            {
              path: new Set(['action1', 'action2']),
            },
            {
              path: new Set(['action1', 'action2']),
            },
          ];
          algorithm = 'actionTree';

          reduceToMinimumSetOfPlans(plans, algorithm, callback);

          expect(callback.args).to.eql([
            [
              null,
              [
                {
                  path: new Set(['action1', 'action2']),
                },
              ],
            ],
          ]);
        });
      });
    });

    describe('when the algorithm is not actionTree', function() {
      it('should call the callback with the passed in plans', function() {
        const plans = [
          {
            path: new Set(['action1', 'action2']),
          },
          {
            path: new Set(['action1', 'action2']),
          },
        ];

        reduceToMinimumSetOfPlans(plans, 'not-action-reee', callback);

        expect(callback.args).to.eql([
          [
            null,
            [
              {
                path: new Set(['action1', 'action2']),
              },
              {
                path: new Set(['action1', 'action2']),
              },
            ],
          ],
        ]);
      });
    });
  });
});
