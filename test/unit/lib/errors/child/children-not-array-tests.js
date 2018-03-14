'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/child/children-not-array.js', function() {
  let ChildError;
  let childrenNotArray;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/child/children-not-array.js');

    ChildError = sinon.stub();

    mockery.registerMock('./child-error.js', ChildError);

    childrenNotArray = require('../../../../../lib/errors/child/children-not-array.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ChildError with \'CHILDREN_NOT_ARRAY\', and passed in message', function() {
      childrenNotArray('ERROR_MESSAGE');

      expect(ChildError.args).to.deep.equal([
        ['CHILDREN_NOT_ARRAY', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ChildError', function() {
      let result;

      result = childrenNotArray('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ChildError);
    });
  });
});
