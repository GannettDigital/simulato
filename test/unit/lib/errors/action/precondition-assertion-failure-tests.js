'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/action/precondition-assertion-failure.js', function() {
  let ActionError;
  let preconditionAssertionFailure;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/action/precondition-assertion-failure.js');

    ActionError = sinon.stub();

    mockery.registerMock('./action-error.js', ActionError);

    preconditionAssertionFailure = require('../../../../../lib/errors/action/precondition-assertion-failure.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ActionError with \'PRECONDITION_ASSERTION_FAILURE\', and passed in message', function() {
      preconditionAssertionFailure('ERROR_MESSAGE');

      expect(ActionError.args).to.deep.equal([
        ['PRECONDITION_ASSERTION_FAILURE', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ActionError', function() {
      const result = preconditionAssertionFailure('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ActionError);
    });
  });
});
