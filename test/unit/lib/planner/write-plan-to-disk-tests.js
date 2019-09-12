'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/write-plans-to-disk.js', function() {
  let fs;
  let path;
  let configHandler;
  let clock;
  let writePlansToDisk;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../lib/planner/write-plans-to-disk.js');
    let crypto;
    fs = {
      writeFileSync: sinon.stub(),
    };
    path = {
      resolve: sinon.stub(),
    };
    configHandler = {
      get: sinon.stub(),
    };
    crypto = {
      createHash: sinon.stub().returns({
        update: sinon.stub().returns({
          digest: sinon.stub().returns(
              'hashedPlan'
          ),
        }),
      }),
    };

    clock = sinon.useFakeTimers(12345);
    sinon.spy(console, 'log');

    mockery.registerMock('fs', fs);
    mockery.registerMock('path', path);
    mockery.registerMock('crypto', crypto);
    mockery.registerMock('../util/config/config-handler.js', configHandler);

    writePlansToDisk = require('../../../../lib/planner/write-plans-to-disk.js');
  });

  afterEach(function() {
    console.log.restore();
    clock.restore();
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should call configHandler.get once with \'outputPath\'', function() {
    let plans = [];

    writePlansToDisk(plans);

    expect(configHandler.get.args).to.deep.equal([['outputPath']]);
  });

  describe('for each plan of the passed in plans', function() {
    it('should call path.resolve with the outputPath and the constructed file name', function() {
      let plans = ['plan1'];

      configHandler.get.returns('outputPath/');

      writePlansToDisk(plans);

      expect(path.resolve.args).to.deep.equal([
        [`outputPath/`, 'simulato--hashedPlan'],
      ]);
    });

    it('should call fs.writeFileSync with the resolved path,' +
      'and the stringified version of the plan.testCase', function() {
      path.resolve.onCall(0).returns('path1');
      path.resolve.onCall(1).returns('path2');
      let plans = [
        {foo: 'bar'},
        {bar: 'foo'},
      ];

      writePlansToDisk(plans);

      expect(fs.writeFileSync.args).to.deep.equal([
        ['path1', '{\"foo\":\"bar\"}'],
        ['path2', '{\"bar\":\"foo\"}'],
      ]);
    });
  });

  it('should call console.log to say it wrote the amount of plans to disk as passed in', function() {
    let plans = ['plan1', 'plan2'];

    writePlansToDisk(plans);

    expect(console.log.args).to.deep.equal([[
      `Generated and wrote 2 test(s) to disk`,
    ]]);
  });
});
