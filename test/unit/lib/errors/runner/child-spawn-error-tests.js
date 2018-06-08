'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/runner/spawn-child-error.js', function() {
  let RunnerError;
  let goalNotFound;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/runner/spawn-child-error.js');

    RunnerError = sinon.stub();

    mockery.registerMock('./runner-error.js', RunnerError);

    goalNotFound = require('../../../../../lib/errors/runner/spawn-child-error.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new RunnerError with \'SPAWN_CHILD_ERROR\', and passed in message', function() {
      goalNotFound('ERROR_MESSAGE');

      expect(RunnerError.args).to.deep.equal([
        ['SPAWN_CHILD_ERROR', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new Runner\Error', function() {
      let result;

      result = goalNotFound('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(RunnerError);
    });
  });
});
