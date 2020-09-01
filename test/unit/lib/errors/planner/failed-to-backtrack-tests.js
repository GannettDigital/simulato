'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/planner/failed-to-backtrack.js', function() {
  let PlannerError;
  let goalNotFound;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/planner/failed-to-backtrack.js');

    PlannerError = sinon.stub();

    mockery.registerMock('./planner-error.js', PlannerError);

    goalNotFound = require('../../../../../lib/errors/planner/failed-to-backtrack.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new PlannerError with \'FAILED_TO_BACKTRACK\', and passed in message', function() {
      goalNotFound('ERROR_MESSAGE');

      expect(PlannerError.args).to.deep.equal([
        ['FAILED_TO_BACKTRACK', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new PlannerError', function() {
      const result = goalNotFound('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(PlannerError);
    });
  });
});
