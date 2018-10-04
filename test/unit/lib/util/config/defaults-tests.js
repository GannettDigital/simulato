'use strict';

const mockery = require('mockery');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('lib/util/config/defaults.js', function() {
  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/util/config/defaults.js');

    sinon.spy(process, 'cwd');
  });

  afterEach(function() {
    process.cwd.restore();
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export the defaults object', function() {
    let defaults = require('../../../../../lib/util/config/defaults.js');

    expect(defaults).to.deep.equal({
      componentPath: `${process.cwd()}/components`,
      outputPath: process.cwd(),
      testPath: `${process.cwd()}/tests`,
      configFile: `${process.cwd()}/simulato-config.js`,
      reporter: 'basic',
      reportFormat: 'JSON',
      parallelism: 20,
      testDelay: 200,
      rerunFailedTests: 0,
      plannerAlgorithm: 'forwardStateSpaceSearchHeuristic',
    });
  });

  it('should call process.cwd 4 times', function() {
    require('../../../../../lib/util/config/defaults.js');

    expect(process.cwd.callCount).to.equal(4);
  });
});
