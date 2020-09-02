'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/reports/index.js', function() {
  let basic;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/runner/reporters');

    basic = sinon.stub();

    mockery.registerMock('./basic-reporter.js', basic);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export 1 item on an object', function() {
    const result = require('../../../../../lib/runner/reporters');

    expect(Object.getOwnPropertyNames(result).length).to.equal(1);
  });

  it('should have the property \'basic\' with the value from requiring' +
    ' \'./basic-reporter\'', function() {
    const result = require('../../../../../lib/runner/reporters');

    expect(result.basic).to.deep.equal(basic);
  });
});
