'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/action/precondition-check-failed.js', function() {
  let ActionError;
  let preconditionCheckFailed;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/action/precondition-check-failed.js');

    ActionError = sinon.stub();

    mockery.registerMock('./action-error.js', ActionError);

    preconditionCheckFailed = require('../../../../../lib/errors/action/precondition-check-failed.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ActionError with \'PRECONDITION_CHECK_FAILED\', and passed in message', function() {
      preconditionCheckFailed('ERROR_MESSAGE');

      expect(ActionError.args).to.deep.equal([
        ['PRECONDITION_CHECK_FAILED', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ActionError', function() {
      const result = preconditionCheckFailed('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ActionError);
    });
  });
});
