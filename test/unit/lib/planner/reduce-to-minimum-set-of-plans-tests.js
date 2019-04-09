'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/reduce-to-minimum-set-of-plans.js', function () {
  let setOperations;
  let callback;
  let reduceToMinimumSetOfPlans;
  let algorithm;

  beforeEach(function () {
    mockery.enable({ useCleanCache: true });
    mockery.registerAllowable('../../../../lib/planner/reduce-to-minimum-set-of-plans.js');

    setOperations = {
      isSuperset: sinon.stub(),
    };
    callback = sinon.stub();
    algorithm = 'default';

    mockery.registerMock('../util/set-operations.js', setOperations);

    reduceToMinimumSetOfPlans = require('../../../../lib/planner/reduce-to-minimum-set-of-plans.js');
  });

  afterEach(function () {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should call setOperations.isSuperset 0 times if there is one plan', function () {
    let plans = [
      {
        path: new Set('action1', 'action2'),
      },
    ];

    reduceToMinimumSetOfPlans(plans, algorithm, callback);

    expect(setOperations.isSuperset.callCount).to.equal(0);
  });

  it('should call setOperations.isSuperset 6 times if there are three plans', function () {
    let plans = [
      {
        path: new Set(['action1', 'action2']),
      },
      {
        path: new Set(['action1', 'action3']),
      },
      {
        path: new Set(['action1', 'action4']),
      },
    ];

    reduceToMinimumSetOfPlans(plans, algorithm, callback);

    expect(setOperations.isSuperset.callCount).to.equal(6);
  });

  it('should call the passed in callback once with null and the finalPlans', function () {
    let plans = [
      {
        path: new Set(['action1', 'action2']),
      },
    ];

    reduceToMinimumSetOfPlans(plans, algorithm, callback);

    expect(callback.args).to.deep.equal([
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

  describe('for each plan in the passed in plans', function () {
    it('should call setOperations.isSuperset with the two plan paths', function () {
      let plans = [
        {
          path: new Set(['action1', 'action2']),
        },
        {
          path: new Set(['action1', 'action2', 'action3']),
        },
      ];
      setOperations.isSuperset.onCall(0).returns(true);

      reduceToMinimumSetOfPlans(plans, algorithm, callback);

      expect(setOperations.isSuperset.args[0]).to.deep.equal([
        new Set(['action1', 'action2', 'action3']),
        new Set(['action1', 'action2']),
      ]);
    });

    it('should remove the plan from the list of the plans if setOperation.isSuperset returns true', function () {
      let plans = [
        {
          path: new Set(['action1', 'action2']),
        },
        {
          path: new Set(['action1', 'action2', 'action3']),
        },
      ];
      setOperations.isSuperset.onCall(0).returns(true);

      reduceToMinimumSetOfPlans(plans, algorithm, callback);

      expect(callback.args[0][1]).to.deep.equal([
        {
          path: new Set(['action1', 'action2', 'action3']),
        },
      ]);
    });

    it('should not remove the plan from the list of the plans if setOperation.isSuperset returns false', function () {
      let plans = [
        {
          path: new Set(['action1', 'action2']),
        },
        {
          path: new Set(['action1', 'action2', 'action3']),
        },
      ];
      setOperations.isSuperset.returns(false);

      reduceToMinimumSetOfPlans(plans, algorithm, callback);

      expect(callback.args[0][1]).to.deep.equal([
        {
          path: new Set(['action1', 'action2']),
        },
        {
          path: new Set(['action1', 'action2', 'action3']),
        },
      ]);
    });
  });
});
