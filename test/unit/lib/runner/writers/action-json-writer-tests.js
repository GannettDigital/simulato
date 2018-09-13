'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/test-runner/action-json-writer.js', function() {
  describe('writeActionReport', function() {
    let fs;
    let path;
    let writeActionReportToDisk;
    let configHandler;
    let obj;
    let report;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/action-json-writer.js');

      path = {
        resolve: sinon.stub(),
      };
      
      report = {
        testReports: [
          {
            testRuns: [
              {
                report: {
                  testName: 'testOne',
                  actions: [
                    {
                      component: 'navigate',
                      action: 'navigate'
                    }
                  ]
                }
              },
              {
                report: {
                  testName: 'testOne',
                  actions: [
                    {
                      component: 'modal',
                      action: 'click'
                    }
                  ]
                }
              }
            ]
          },
          {
            testRuns: [
              {
                report: {
                  testName: 'testOne',
                  actions: [
                    {
                      component: 'navigate',
                      action: 'navigate'
                    }
                  ]
                }
              },
              {
                report: {
                  testName: 'testOne',
                  actions: [
                    {
                      component: 'modal',
                      action: 'click'
                    }
                  ]
                }
              }
            ]
          },
        ]
      }

      fs = {
        writeFileSync: sinon.stub(),
        readFileSync: sinon.stub(),
      };

      configHandler = {
        get: sinon.stub(),
      };

      obj = {};

      mockery.registerMock('fs', fs);
      mockery.registerMock('path', path);
      mockery.registerMock('../../util/config-handler.js', configHandler);

      writeActionReportToDisk = require('../../../../../lib/runner/writers/action-json-writer.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call path.resolve with the configs testPath', function() {
      let report = {
        testReports: []
      }
      configHandler.get.returns('./testPath');

      writeActionReportToDisk(report);

      expect(path.resolve.args).to.deep.equal([
        [
          './testPath'
        ],
      ]);
    });

    describe('for each test report of the passed in report', function() {
      it('should call fs.readFileSync with the path to the test and \'utf8\'', function() {

        path.resolve.returns('./testpath');
        fs.readFileSync.returns('{}');

        writeActionReportToDisk(report);
  
        expect(fs.readFileSync.args).to.deep.equal([
          [
            './testpath/testOne',
            'utf8'
          ],
          [
            './testpath/testOne',
            'utf8'
          ],
        ]);
      });
      
      it('should assign customReport', function() {
        let customReport = {
          "name": `test`
      }
        path.resolve.returns('./testpath');
        fs.readFileSync.returns('{}');

        writeActionReportToDisk(report);

        expect(customReport.name).to.equal("test");

      });
    });

    describe('for each key value pair in obj', function() {
      it('should call fs.writeFileSync with the custom report path and the action report passed in', function () {

        path.resolve.returns('./testpath');
        fs.readFileSync.returns('{}');

        writeActionReportToDisk(report);

        expect(fs.writeFileSync.args).to.deep.equal([[
          "./testpath",
          "[{\"automation\":\"Yes\",\"name\":\"modal.click\",\"automation-content\":\"sample#automation.content_0\",\"description\":\"\",\"precondition\":\"\",\"priority\":\"\",\"note\":{},\"test-steps\":[{\"description\":\"\",\"expected\":\"\",\"actual\":\"\",\"step-status\":\"\"}]},{\"automation\":\"Yes\",\"name\":\"modal.click\",\"automation-content\":\"sample#automation.content_1\",\"description\":\"\",\"precondition\":\"\",\"priority\":\"\",\"note\":{},\"test-steps\":[{\"description\":\"\",\"expected\":\"\",\"actual\":\"\",\"step-status\":\"\"}]}]"
        ]]);
      })
    })
  });
});
