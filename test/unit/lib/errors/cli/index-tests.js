'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/cli/index.js', function() {
  let INVALID_COMPONENT_PATH;
  let INVALID_GENERATION_TECHNIQUE;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/cli');

    INVALID_COMPONENT_PATH = sinon.stub();
    INVALID_GENERATION_TECHNIQUE = sinon.stub();

    mockery.registerMock('./invalid-component-path.js', INVALID_COMPONENT_PATH);
    mockery.registerMock('./invalid-generation-technique.js', INVALID_GENERATION_TECHNIQUE);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export 2 items on an object', function() {
    let result = require('../../../../../lib/errors/cli');

    expect(Object.getOwnPropertyNames(result).length).to.equal(2);
  });

  it('should have the property \'INVALID_COMPONENT_PATH\' with the value from requiring'
    + ' \'./invalid-component-path.js\'', function() {
    let result = require('../../../../../lib/errors/cli');

    expect(result.INVALID_COMPONENT_PATH).to.deep.equal(INVALID_COMPONENT_PATH);
  });

  it('should have the property \'INVALID_GENERATION_TECHNIQUE\' with the value from requiring'
    + ' \'./invalid-generation-technique.js\'', function() {
    let result = require('../../../../../lib/errors/cli');

    expect(result.INVALID_GENERATION_TECHNIQUE).to.deep.equal(INVALID_GENERATION_TECHNIQUE);
  });
});
