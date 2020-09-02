'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/component/non-unique-component.js', function() {
  let ComponentError;
  let nonUniqueComponent;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/component/non-unique-component.js');

    ComponentError = sinon.stub();

    mockery.registerMock('./component-error.js', ComponentError);

    nonUniqueComponent = require('../../../../../lib/errors/component/non-unique-component.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ComponentError with \'NON_UNIQUE_COMPONENT\', and passed in message', function() {
      nonUniqueComponent('ERROR_MESSAGE');

      expect(ComponentError.args).to.deep.equal([
        ['NON_UNIQUE_COMPONENT', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ComponentError', function() {
      const result = nonUniqueComponent('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ComponentError);
    });
  });
});
