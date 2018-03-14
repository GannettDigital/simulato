'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/action/action-type-error.js', function() {
  let ActionError;
  let actionTypeError;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/action/action-type-error.js');

    ActionError = sinon.stub();

    mockery.registerMock('./action-error.js', ActionError);

    actionTypeError = require('../../../../../lib/errors/action/action-type-error.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ActionError with \'ACTION_TYPE_ERROR\', and passed in message', function() {
      actionTypeError('ERROR_MESSAGE');

      expect(ActionError.args).to.deep.equal([
        ['ACTION_TYPE_ERROR', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ActionError', function() {
      let result;

      result = actionTypeError('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ActionError);
    });
  });
});
