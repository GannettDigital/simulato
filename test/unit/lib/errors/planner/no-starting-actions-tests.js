'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/planner/no-starting-actions.js', function() {
  let PlannerError;
  let goalNotFound;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/planner/no-starting-actions.js');

    PlannerError = sinon.stub();

    mockery.registerMock('./planner-error.js', PlannerError);

    goalNotFound = require('../../../../../lib/errors/planner/no-starting-actions.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new PlannerError with \'NO_STARTING_ACTIONS\', and passed in message', function() {
      goalNotFound('ERROR_MESSAGE');

      expect(PlannerError.args).to.deep.equal([
        ['NO_STARTING_ACTIONS', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new PlannerError', function() {
      const result = goalNotFound('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(PlannerError);
    });
  });
});
