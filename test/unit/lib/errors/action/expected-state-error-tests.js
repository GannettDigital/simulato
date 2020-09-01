'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/action/expected-state-error.js', function() {
  let ActionError;
  let expectedStateError;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/action/expected-state-error.js');

    ActionError = sinon.stub();

    mockery.registerMock('./action-error.js', ActionError);

    expectedStateError = require('../../../../../lib/errors/action/expected-state-error.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ActionError with \'EXPECTED_STATE_ERROR\', and passed in message', function() {
      expectedStateError('ERROR_MESSAGE');

      expect(ActionError.args).to.deep.equal([
        ['EXPECTED_STATE_ERROR', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ActionError', function() {
      const result = expectedStateError('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ActionError);
    });
  });
});
