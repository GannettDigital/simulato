'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/writers/write-json-to-disk.js', function() {
  describe('writeReport', function() {
    let fs;
    let path;
    let writeReportToDisk;
    let clock;
    let now;
    let configHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/write-json-to-disk.js');

      path = {
        resolve: sinon.stub(),
      };

      fs = {
        writeFileSync: sinon.stub(),
      };

      configHandler = {
        get: sinon.stub(),
      };

      mockery.registerMock('fs', fs);
      mockery.registerMock('path', path);
      mockery.registerMock('../../util/config/config-handler.js', configHandler);

      now = Date.now();
      clock = sinon.useFakeTimers(now);

      writeReportToDisk = require('../../../../../lib/runner/writers/write-json-to-disk.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
      clock.restore();
    });

    it('should call path.resolve with the configs reportPath and date string test name', function() {
      const report = 'test report';
      configHandler.get.returns('./reportPath');

      writeReportToDisk(report);

      expect(path.resolve.args).to.deep.equal([
        [
          './reportPath',
          `${now}-test-report.json`,
        ],
      ]);
    });

    it('should call fs.writeFileSync with filepath and passed in report', function() {
      const report = 'test report';
      path.resolve.returns(`./${now}-test-report.json`);
      configHandler.get.returns('./reportPath');

      writeReportToDisk(report);

      expect(fs.writeFileSync.args).to.deep.equal([
        [
          `./${now}-test-report.json`,
          JSON.stringify(report),
        ],
      ]);
    });
  });
});
