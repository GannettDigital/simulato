'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/planner/duplicate-plan-generated.js', function() {
  let PlannerError;
  let goalNotFound;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/planner/duplicate-plan-generated.js');

    PlannerError = sinon.stub();

    mockery.registerMock('./planner-error.js', PlannerError);

    goalNotFound = require('../../../../../lib/errors/planner/duplicate-plan-generated.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new PlannerError with \'DUPLICATE_PLAN_GENERATED\', and passed in message', function() {
      goalNotFound('ERROR_MESSAGE');

      expect(PlannerError.args).to.deep.equal([
        ['DUPLICATE_PLAN_GENERATED', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new PlannerError', function() {
      let result;

      result = goalNotFound('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(PlannerError);
    });
  });
});
