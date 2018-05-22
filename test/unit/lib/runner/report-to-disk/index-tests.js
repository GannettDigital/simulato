'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/report-to-disk/index.js', function() {
  let json;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/runner/report-to-disk');

    json = sinon.stub();

    mockery.registerMock('./write-json-to-disk.js', json);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export 1 item on an object', function() {
    let result = require('../../../../../lib/runner/report-to-disk');

    expect(Object.getOwnPropertyNames(result).length).to.equal(1);
  });

  it('should have the property \'json\' with the value from requiring'
    + ' \'./write-json-to-disk.js\'', function() {
    let result = require('../../../../../lib/runner/report-to-disk');

    expect(result.json).to.deep.equal(json);
  });
});
