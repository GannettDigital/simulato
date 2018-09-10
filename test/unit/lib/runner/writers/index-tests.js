'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/writers/index.js', function() {
  let json;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/runner/writers');

    json = sinon.stub();

    mockery.registerMock('./write-json-to-disk.js', json);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export 1 item on an object', function() {
    let result = require('../../../../../lib/runner/writers');

    expect(Object.getOwnPropertyNames(result).length).to.equal(2);
  });

  it('should have the property \'JSON\' with the value from requiring'
    + ' \'./write-json-to-disk.js\'', function() {
    let result = require('../../../../../lib/runner/writers');

    expect(result.JSON).to.deep.equal(json);
  });
});
