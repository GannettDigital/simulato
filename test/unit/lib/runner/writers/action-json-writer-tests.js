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
                      action: 'navigate',
                    },
                    {
                      component: 'article1',
                      action: 'click',
                    },
                  ],
                },
              },
            ],
          },
          {
            testRuns: [
              {
                report: {
                  testName: 'testTwo',
                  actions: [
                    {
                      component: 'navigate',
                      action: 'navigate',
                    },
                    {
                      component: 'article2',
                      action: 'click',
                    },
                    {
                      component: 'modal',
                      action: 'close',
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      fs = {
        writeFileSync: sinon.stub(),
        readFileSync: sinon.stub(),
      };

      configHandler = {
        get: sinon.stub(),
      };


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
      report = {
        testReports: [],
      };
      configHandler.get.returns('./testPath');

      writeActionReportToDisk(report);

      expect(path.resolve.args).to.deep.equal([
        [
          './testPath',
        ],
      ]);
    });

    it('should call configHandler.get with the parameter \'testPath\'', function() {
      report = {
        testReports: [],
      };
      configHandler.get.returns('./testPath');

      writeActionReportToDisk(report);

      expect(configHandler.get.args).to.deep.equal([
        [
          'testPath',
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
            'utf8',
          ],
          [
            './testpath/testTwo',
            'utf8',
          ],
        ]);
      });
    });

    describe('for each key value pair in obj', function() {
      it('should call path.resolve with the configs reportPath', function() {
        configHandler.get.returns('./reportPath');
        fs.readFileSync.returns('{}');

        writeActionReportToDisk(report);

        expect(path.resolve.args).to.deep.equal([
          [
            './reportPath',
          ],
          [
            './reportPath',
            'navigate.navigate.json',
          ],
          [
            './reportPath',
            'article1.click.json',
          ],
          [
            './reportPath',
            'article2.click.json',
          ],
          [
            './reportPath',
            'modal.close.json',
          ],
        ]);
      });

      it('should call configHandler.get with reportPath and the report name', function() {
        path.resolve.returns(`actionName.json`);
        configHandler.get.returns('reportPath', 'actionName.json');
        fs.readFileSync.returns('{}');

        writeActionReportToDisk(report);

        expect(configHandler.get.args).to.deep.equal([
          ['testPath',
          ],
          [
            'reportPath',
          ],
          [
            'reportPath',
          ],
          [
            'reportPath',
          ],
          [
            'reportPath',
          ],
        ]);
      });


      it('should call fs.writeFileSync with the custom report path and the action report passed in', function() {
        path.resolve.returns('./reportPath');
        fs.readFileSync.returns('{}');

        writeActionReportToDisk(report);

        expect(fs.writeFileSync.args).to.deep.equal([
          ['./reportPath',
          '[{"automation":"Yes","name":"navigate.navigate","automation-content"' +
          ':"sample#automation.content_0","description":"","precondition":"","' +
          'priority":"","note":{},"test-steps":[{"description":"","expected":"",' +
          '"actual":"","step-status":""}]},{"automation":"Yes","name":"navigate.navigate' +
          '","automation-content":"sample#automation.content_1","description":"","precondition"' +
          ':"","priority":"","note":{},"test-steps":[{"description":"","expected":"","' +
          'actual":"","step-status":""}]}]'],
          ['./reportPath',
          '[{"automation":"Yes","name":"article1.click","automation-content":"sample#automation.content_0",'+
          '"description":"","precondition":"","priority":"","note":{},"test-steps":[{"description":"",' +
          '"expected":"","actual":"","step-status":""}]}]'],
          ['./reportPath',
          '[{"automation":"Yes","name":"article2.click","automation-content":"sample#automation.content_0",'+
          '"description":"","precondition":"","priority":"","note":{},"test-steps":[{"description":"",' +
          '"expected":"","actual":"","step-status":""}]}]'],
          ['./reportPath',
          '[{"automation":"Yes","name":"modal.close","automation-content":"sample#automation.content_0",'+
          '"description":"","precondition":"","priority":"","note":{},"test-steps":[{"description":"",' +
          '"expected":"","actual":"","step-status":""}]}]'],
        ]);
      });
    });
  });
});
