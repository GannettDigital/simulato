'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/test-runner/write-report-to-disk.js', function() {
  describe('writeReport', function() {
    let fs;
    let path;
    let writeReportToDisk;
    let clock;
    let now;
    let configHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/report-to-disk/write-json-to-disk.js');

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
      mockery.registerMock('../../util/config-handler.js', configHandler);

      now = Date.now();
      clock = sinon.useFakeTimers(now);

      writeReportToDisk = require('../../../../../lib/runner/report-to-disk/write-json-to-disk.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
      clock.restore();
    });

    it('should call configHandler.get with \'reportPath\'', function() {
      writeReportToDisk('test report');

      expect(configHandler.get.args).to.deep.equal([['reportPath']]);
    });

    describe('if configHandler.get(\'reportPath\') is truthy', function() {
      it('should call path.resolve with the configs reportPath and date string test name', function() {
        let report = 'test report';
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
        let report = 'test report';
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

    describe('if configHandler.get(\'reportPath\') is falsey', function() {
      it('should not call path.resolve', function() {
        let report = 'test report';

        writeReportToDisk(report);

        expect(path.resolve.notCalled).to.be.true;
      });
    });
  });
});
