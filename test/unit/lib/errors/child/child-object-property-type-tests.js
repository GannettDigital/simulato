'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/child/child-object-property-type.js', function() {
  let ChildError;
  let childObjectPropertyType;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/child/child-object-property-type.js');

    ChildError = sinon.stub();

    mockery.registerMock('./child-error.js', ChildError);

    childObjectPropertyType = require('../../../../../lib/errors/child/child-object-property-type.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ChildError with \'CHILD_OBJECT_PROPERTY_TYPE\', and passed in message', function() {
      childObjectPropertyType('ERROR_MESSAGE');

      expect(ChildError.args).to.deep.equal([
        ['CHILD_OBJECT_PROPERTY_TYPE', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ChildError', function() {
      let result;

      result = childObjectPropertyType('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ChildError);
    });
  });
});
