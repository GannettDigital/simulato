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

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/report-to-disk/write-json-to-disk.js');

      path = {
        resolve: sinon.stub(),
      };

      fs = {
        writeFileSync: sinon.stub(),
      };

      mockery.registerMock('fs', fs);
      mockery.registerMock('path', path);

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

    describe('if process.env.OUTPUT_PATH is truthy', function() {
      it('should call path.resolve with process.env.OUTPUT_PATH and date string test name', function() {
        process.env.OUTPUT_PATH = './';
        let report = 'test report';

        writeReportToDisk(report);

        expect(path.resolve.args).to.deep.equal([
          [
            './',
            `${now}-test-report.json`,
          ],
        ]);
      });

      it('should call fs.writeFileSync with filepath and passed in report', function() {
        process.env.OUTPUT_PATH = './';
        let report = 'test report';
        path.resolve.returns(`./${now}-test-report.json`);

        writeReportToDisk(report);

        expect(fs.writeFileSync.args).to.deep.equal([
          [
            `./${now}-test-report.json`,
            JSON.stringify(report),
          ],
        ]);
      });
    });

    describe('if process.env.OUTPUT_PATH is falsey', function() {
      it('should not call path.resolve', function() {
        delete process.env.OUTPUT_PATH;
        let report = 'test report';

        writeReportToDisk(report);

        expect(path.resolve.notCalled).to.be.true;
      });
    });
  });
});
