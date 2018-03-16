'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/action/actions-not-object.js', function() {
  let ActionError;
  let actionsNotObject;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/action/actions-not-object.js');

    ActionError = sinon.stub();

    mockery.registerMock('./action-error.js', ActionError);

    actionsNotObject = require('../../../../../lib/errors/action/actions-not-object.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ActionError with \'ACTIONS_NOT_OBJECT\', and passed in message', function() {
      actionsNotObject('ERROR_MESSAGE');

      expect(ActionError.args).to.deep.equal([
        ['ACTIONS_NOT_OBJECT', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ActionError', function() {
      let result;

      result = actionsNotObject('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ActionError);
    });
  });
});
