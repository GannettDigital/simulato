'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/component/no-components-found.js', function() {
  let ComponentError;
  let noComponentsFound;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/component/no-components-found.js');

    ComponentError = sinon.stub();

    mockery.registerMock('./component-error.js', ComponentError);

    noComponentsFound = require('../../../../../lib/errors/component/no-components-found.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ComponentError with \'NO_COMPONENTS_FOUND\', and passed in message', function() {
      noComponentsFound('ERROR_MESSAGE');

      expect(ComponentError.args).to.deep.equal([
        ['NO_COMPONENTS_FOUND', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ComponentError', function() {
      const result = noComponentsFound('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ComponentError);
    });
  });
});
