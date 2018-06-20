'use strict';

const mockery = require('mockery');
const expect = require('chai').expect;

describe('lib/util/defaults.js', function() {
  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../lib/util/defaults.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export 8 items on an object', function() {
    let defaults = require('../../../../lib/util/defaults.js');

    expect(Object.getOwnPropertyNames(defaults).length).to.equal(8);
  });

  it('should have the property \'componentPath\' with the default value', function() {
    let defaults = require('../../../../lib/util/defaults.js');

    expect(defaults.componentPath).to.equal(`${process.cwd()}/components`);
  });

  it('should have the property \'outputPath\' with the default value', function() {
    let defaults = require('../../../../lib/util/defaults.js');

    expect(defaults.outputPath).to.equal(process.cwd());
  });

  it('should have the property \'testPath\' with the default value', function() {
    let defaults = require('../../../../lib/util/defaults.js');

    expect(defaults.testPath).to.equal(`${process.cwd()}/tests`);
  });

  it('should have the property \'technique\' with the default value', function() {
    let defaults = require('../../../../lib/util/defaults.js');

    expect(defaults.technique).to.equal('actionFocused');
  });

  it('should have the property \'reporter\' with the default value', function() {
    let defaults = require('../../../../lib/util/defaults.js');

    expect(defaults.reporter).to.equal('basic');
  });

  it('should have the property \'parallelism\' with the default value', function() {
    let defaults = require('../../../../lib/util/defaults.js');

    expect(defaults.parallelism).to.equal(20);
  });

  it('should have the property \'testDelay\' with the default value', function() {
    let defaults = require('../../../../lib/util/defaults.js');

    expect(defaults.testDelay).to.equal(200);
  });

  it('should have the property \'rerunFailedTests\' with the default value', function() {
    let defaults = require('../../../../lib/util/defaults.js');

    expect(defaults.rerunFailedTests).to.equal(0);
  });
});
