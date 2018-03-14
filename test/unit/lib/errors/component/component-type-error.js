'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/component/component-type-error.js', function() {
  let ComponentError;
  let componentTypeError;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/component/component-type-error.js');

    ComponentError = sinon.stub();

    mockery.registerMock('./component-error.js', ComponentError);

    componentTypeError = require('../../../../../lib/errors/component/component-type-error.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ComponentError with \'COMPONENT_TYPE_ERROR\', and passed in message', function() {
      componentTypeError('ERROR_MESSAGE');

      expect(ComponentError.args).to.deep.equal([
        ['COMPONENT_TYPE_ERROR', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ComponentError', function() {
      let result;

      result = componentTypeError('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ComponentError);
    });
  });
});
