'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/writers/index.js', function() {
  let json;
  let actionJson;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/runner/writers');

    json = sinon.stub();
    actionJson = sinon.stub();

    mockery.registerMock('./write-json-to-disk.js', json);
    mockery.registerMock('./action-json-writer.js', actionJson);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export 2 items on an object', function() {
    let result = require('../../../../../lib/runner/writers');

    expect(Object.getOwnPropertyNames(result).length).to.equal(2);
  });

  it('should have the property \'JSON\' with the value from requiring'
    + ' \'./write-json-to-disk.js\'', function() {
    let result = require('../../../../../lib/runner/writers');

    expect(result.JSON).to.deep.equal(json);
  });

  it('should have the property \'actionJSON\' with the value from requiring'
    + ' \'./action-json-writer.js\'', function() {
    let result = require('../../../../../lib/runner/writers');

    expect(result.actionJSON).to.deep.equal(actionJson.write);
  });
});
