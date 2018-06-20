'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/runner/index.js', function() {
  let SPAWN_CHILD_ERROR;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/errors/runner');

    SPAWN_CHILD_ERROR = sinon.stub();

    mockery.registerMock('./spawn-child-error.js', SPAWN_CHILD_ERROR);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export 1 item on an object', function() {
    let result = require('../../../../../lib/errors/runner');

    expect(Object.getOwnPropertyNames(result).length).to.equal(1);
  });

  it('should have the property \'SPAWN_CHILD_ERROR\' with the value from requiring'
    + ' \'./child-spawn-error.js\'', function() {
    let result = require('../../../../../lib/errors/runner');

    expect(result.SPAWN_CHILD_ERROR).to.deep.equal(SPAWN_CHILD_ERROR);
  });
});
