'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/child/child-not-object.js', function() {
  let ChildError;
  let childNotObject;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/child/child-not-object.js');

    ChildError = sinon.stub();

    mockery.registerMock('./child-error.js', ChildError);

    childNotObject = require('../../../../../lib/errors/child/child-not-object.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ChildError with \'CHILD_NOT_OBJECT\', and passed in message', function() {
      childNotObject('ERROR_MESSAGE');

      expect(ChildError.args).to.deep.equal([
        ['CHILD_NOT_OBJECT', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ChildError', function() {
      let result;

      result = childNotObject('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ChildError);
    });
  });
});
