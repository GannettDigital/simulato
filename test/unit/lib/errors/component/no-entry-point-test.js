'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/component/no-entry-point.js', function() {
  let ComponentError;
  let noEntryPoint;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/component/no-entry-point.js');

    ComponentError = sinon.stub();

    mockery.registerMock('./component-error.js', ComponentError);

    noEntryPoint = require('../../../../../lib/errors/component/no-entry-point.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('on execution of the required file', function() {
    it('should call new ComponentError with \'NO_ENTRY_POINT\', and passed in message', function() {
      noEntryPoint('ERROR_MESSAGE');

      expect(ComponentError.args).to.deep.equal([
        ['NO_ENTRY_POINT', 'ERROR_MESSAGE'],
      ]);
    });

    it('should return new ComponentError', function() {
      let result;

      result = noEntryPoint('ERROR_MESSAGE');

      expect(result).to.be.an.instanceof(ComponentError);
    });
  });
});
