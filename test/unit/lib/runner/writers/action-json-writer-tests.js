'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe.only('lib/runner/test-runner/action-json-writer.js', function() {
  describe('write', function() {
    let actionJsonWriter;
    let configHandler;
    let path;
    let fs;
    let report;
    let passingReport;

    beforeEach(function() {
      configHandler = {
        get: sinon.stub(),
      };
      path = {
        resolve: sinon.stub(),
      };
      fs = {
        writeFileSync: sinon.stub(),
        readFileSync: sinon.stub(),
      };
      report = {
        testReports: [
          {
            status: 'fail',
            testRuns: [
              {
                report: {
                  testName: 'testOne',
                  actions: [
                    {
                      component: 'navigate',
                      action: 'navigate',
                      status: 'pass',
                      time: [
                        1,
                        201697760,
                      ],
                      steps: {
                        precondition: {
                          status: 'pass',
                          error: null,
                        },
                        perform: {
                          status: 'pass',
                          error: null,
                        },
                        effects: {
                          status: 'pass',
                          error: null,
                        },
                      },
                    },
                    {
                      component: 'article1',
                      action: 'click',
                      status: 'fail',
                      time: [
                        1,
                        201697760,
                      ],
                      steps: {
                        perform: {
                          status: 'fail',
                          error: 'perform failed',
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };

      passingReport = {
        testReports: [
          {
            status: 'fail',
            testRuns: [
              {
                report: {
                  testName: 'testOne',
                  actions: [
                    {
                      component: 'navigate',
                      action: 'navigate',
                      status: 'pass',
                      time: [
                        1,
                        201697760,
                      ],
                      steps: {
                        precondition: {
                          status: 'pass',
                          error: null,
                        },
                        perform: {
                          status: 'pass',
                          error: null,
                        },
                        effects: {
                          status: 'pass',
                          error: null,
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      };


      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/action-json-writer.js');
      mockery.registerMock('fs', fs);
      mockery.registerMock('path', path);
      mockery.registerMock('../../util/config-handler.js', configHandler);

      actionJsonWriter = require('../../../../../lib/runner/writers/action-json-writer.js');
      actionJsonWriter._getActionTestData = sinon.stub();
      actionJsonWriter._writeReports = sinon.stub();
      actionJsonWriter._checkActionForError = sinon.stub();
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call configHandler.get with \'testPath\'', function() {
      actionJsonWriter._getActionTestData.returns({
        count: 0,
      });

      actionJsonWriter.write(report);

      expect(configHandler.get.args).to.deep.equal([['testPath']]);
    });

    it('should call path.resolve with testPath', function() {
      actionJsonWriter._getActionTestData.returns({
        count: 0,
      });
      configHandler.get.returns('./testPath');

      actionJsonWriter.write(report);

      expect(path.resolve.args).to.deep.equal([['./testPath']]);
    });

    describe('for each each rep of test reports', function() {
      it('should call fs.readFileSync with the path to the test and \'utf8\'', function() {
        path.resolve.returns('./testpath');
        actionJsonWriter._getActionTestData.returns({
          count: 0,
        });

        actionJsonWriter.write(report);

        expect(fs.readFileSync.args).to.deep.equal([
          [
            './testpath/testOne',
            'utf8',
          ],
        ]);
      });
      describe('for each action within report.actions', function() {
        it('should call actionJsonWriter._getActionTestData with action name passed in', function() {
          actionJsonWriter._getActionTestData.returns({
            count: 0,
            failures: [],
            averageTime: 0,
            status: 'fail',
          });

          actionJsonWriter.write(report);

          expect(actionJsonWriter._getActionTestData.args).to.deep.equal([['navigate.navigate'], ['article1.click']]);
        });

        it('should increment count by one', function() {
          actionJsonWriter._getActionTestData.returns({
            count: 0,
          });

          actionJsonWriter.write(report);

          expect(actionJsonWriter._getActionTestData().count).to.equal(2);
        });

        it('should calculate the average time for each action', function() {
          actionJsonWriter._getActionTestData.returns({
            averageTime: 0,
          });

          actionJsonWriter.write(report);

          expect(actionJsonWriter._getActionTestData().averageTime).to.equal(2.40339552);
        });

        it('should call actionJsonWriter._checkActionForError with action and testData passed in', function() {
          actionJsonWriter._getActionTestData.returns({
            count: 0,
            failures: [],
            averageTime: 0,
            status: 'pass',
          });

          actionJsonWriter.write(report);

          expect(actionJsonWriter._checkActionForError.args).to.deep.equal([
            [
              {
                'action': 'navigate',
                'component': 'navigate',
                'status': 'pass',
                'steps': {
                  'effects': {
                    'error': null,
                    'status': 'pass',
                  },
                  'perform': {
                    'error': null,
                    'status': 'pass',
                  },
                  'precondition': {
                    'error': null,
                    'status': 'pass',
                  },
                },
                'time': [
                  1,
                  201697760,
                ],
              },
              {
                'averageTime': 2.40339552,
                'count': 2,
                'failures': [],
                'status': 'pass',
              },
            ],
            [
              {
                'action': 'click',
                'component': 'article1',
                'status': 'fail',
                'steps': {
                  'perform': {
                    'error': 'perform failed',
                    'status': 'fail',
                  },
                },
                'time': [
                  1,
                  201697760,
                ],
              },
              {
                'averageTime': 2.40339552,
                'count': 2,
                'failures': [],
                'status': 'pass',
              },
            ],
          ]);
        });

        describe('if there is an error in test data', function() {
          it('should push the error and failing test to testData.failures', function() {
            fs.readFileSync.returns('testOne');
            actionJsonWriter._getActionTestData.returns({
              failures: [],
            });
            actionJsonWriter._checkActionForError.returns('error');

            actionJsonWriter.write(report);

            expect(actionJsonWriter._getActionTestData().failures).to.deep.equal([
              {
                'error': 'error',
                'test': 'testOne',
              },
              {
                'error': 'error',
                'test': 'testOne',
              },
            ]);
          });
        });

        describe('if there is no an error in test data', function() {
          it('should return actionJsonWriter._writeReports', function() {
            actionJsonWriter._getActionTestData.returns({
              count: 0,
            });
            actionJsonWriter.write(passingReport);

            expect(actionJsonWriter._writeReports.args).to.deep.equal([[]]);
          });
        });
      });
    });
  });

  describe('_getActionTestData', function() {
    let actionJsonWriter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/action-json-writer.js');
      mockery.registerMock('fs', {});
      mockery.registerMock('path', {});
      mockery.registerMock('../../util/config-handler.js', {});

      actionJsonWriter = require('../../../../../lib/runner/writers/action-json-writer.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if actionJsonWriter._testData[actionName] does NOT exsist', function() {
      it('it should set _testData[actionName] to an object with the default values', function() {
        let actionName = 'action';
        actionJsonWriter._testData[actionName] = null;

        let testData = actionJsonWriter._getActionTestData(actionName);

        expect(testData).to.deep.equal({
          count: 0,
          failures: [],
          averageTime: 0,
          status: 'pass',
        });
      });
    });

    describe('if actionJsonWriter._testData[actionName] does exsist', function() {
      it('should return actionJsonWriter._testData[actionName]', function() {
        let actionName = 'action';
        actionJsonWriter._testData[actionName] = 'testData';

        let testData = actionJsonWriter._getActionTestData(actionName);

        expect(testData).to.deep.equal('testData');
      });
    });
  });

  describe('_createNotes', function() {
    let actionJsonWriter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/action-json-writer.js');
      mockery.registerMock('fs', {});
      mockery.registerMock('path', {});
      mockery.registerMock('../../util/config-handler.js', {});

      actionJsonWriter = require('../../../../../lib/runner/writers/action-json-writer.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('for each failure within test.failures', function() {
      it('should return report notes', function() {
        let test = {
          count: 4,
          failures: [
            {
              error: 'error1',
              test: 'test1',
            },
            {
              error: 'error2',
              test: 'test2',
            },
          ],
        };
        let notes;

        notes = actionJsonWriter._createNotes(test);

        expect(notes).to.equal('Run Count: 4\nFail Count: 2\nFailures:\nError: "error1"\n\nTest: test1\n' +
        'Error: "error2"\n\nTest: test2');
      });
    });
    describe('for each failure within test.failures', function() {
      it('should return report notes', function() {
        let test = {
          count: 4,
          failures: [],
        };
        let notes;

        notes = actionJsonWriter._createNotes(test);

        expect(notes).to.equal('Run Count: 4\nFail Count: 0\nFailures:');
      });
    });
  });

  describe('_writeReports', function() {
    let actionJsonWriter;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/action-json-writer.js');
      mockery.registerMock('fs', {});
      mockery.registerMock('path', {});
      mockery.registerMock('../../util/config-handler.js', {});

      actionJsonWriter = require('../../../../../lib/runner/writers/action-json-writer.js');
      actionJsonWriter._writeReport = sinon.stub();
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('for each key value pair in actionJsonWriter._testData', function() {
      it('should call action actionJsonWriter._writeReport with actionName and test passed in', function() {
        actionJsonWriter._testData = {
          foo: 'bar',
          test: 'two',
        };

        actionJsonWriter._writeReports();

        expect(actionJsonWriter._writeReport.args).to.deep.equal([['foo', 'bar'], ['test', 'two']]);
      });
    });
  });

  describe('_writeReport', function() {
    let actionJsonWriter;
    let configHandler;
    let path;
    let fs;

    beforeEach(function() {
      configHandler = {
        get: sinon.stub(),
      };
      path = {
        resolve: sinon.stub(),
      };
      fs = {
        writeFileSync: sinon.stub(),
      };
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/action-json-writer.js');
      mockery.registerMock('fs', fs);
      mockery.registerMock('path', path);
      mockery.registerMock('../../util/config-handler.js', configHandler);

      actionJsonWriter = require('../../../../../lib/runner/writers/action-json-writer.js');
      actionJsonWriter._createNotes = sinon.stub();
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call actionJsonWriter._createNotes once with test passed in', function() {
      let test = {
        foo: 'bar',
      };
      let actionName = 'actionName';

      actionJsonWriter._writeReport(actionName, test);

      expect(actionJsonWriter._createNotes.args).to.deep.equal([
        [{foo: 'bar'}],
      ]);
    });

    it('should call configHandler.get once with \'reportPath\'', function() {
      let test = {
        foo: 'bar',
      };
      let actionName = 'actionName';

      actionJsonWriter._writeReport(actionName, test);

      expect(configHandler.get.args).to.deep.equal([['reportPath']]);
    });

    it('should call path.resolve once with \'reportPath\' and \'actionName.json\'', function() {
      let test = {
        foo: 'bar',
      };
      let actionName = 'actionName';
      configHandler.get.returns('./reportPath');

      actionJsonWriter._writeReport(actionName, test);

      expect(path.resolve.args).to.deep.equal([['./reportPath', 'actionName.json']]);
    });

    it('should call fs.writeFileSync with customReportPath and customReport passed in', function() {
      let test = {
        foo: 'bar',
      };
      let actionName = 'actionName';
      path.resolve.returns('./reportPath', 'actionName.json' );

      actionJsonWriter._writeReport(actionName, test);

      expect(fs.writeFileSync.args).to.deep.equal([
        ['./reportPath',
          '[{"automation":"Yes","name":"actionName","automation-content":"actionName",'+
        '"description":"","precondition":"","priority":"","test-steps":[{"description"'+
        ':"","expected":"","actual":"","step-status":""}],"execution-time":"NaN"}]',
        ],
      ]);
    });
  });

  describe('_checkActionForError', function() {
    let actionJsonWriter;
    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/action-json-writer.js');
      mockery.registerMock('fs', {});
      mockery.registerMock('path', {});
      mockery.registerMock('../../util/config-handler.js', {});

      actionJsonWriter = require('../../../../../lib/runner/writers/action-json-writer.js');
      actionJsonWriter._checkStepForError = sinon.stub();
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the passed in action.status does not equal \'fail\'', function() {
      it('should return null', function() {
        let action = {status: 'pass'};
        let testData = {};
        let result;

        result = actionJsonWriter._checkActionForError(action, testData);

        expect(result).to.equal(null);
      });
    });

    describe('if the passed in action.status equals \'fail\'', function() {
      it('should set the passed in testData.status to \'fail\'', function() {
        let action = {status: 'fail'};
        let testData = {status: 'pass'};

        actionJsonWriter._checkActionForError(action, testData);

        expect(testData.status).to.equal('fail');
      });

      describe('for each step in the array \'steps\'', function() {
        describe('if the passed in action has an error in preconditions', function() {
          it('should call _checkStepForError once with the passed in action and \'preconditions\'', function() {
            let action = {status: 'fail'};
            let testData = {status: 'pass'};
            actionJsonWriter._checkStepForError.returns('error');

            actionJsonWriter._checkActionForError(action, testData);

            expect(actionJsonWriter._checkStepForError.args).to.deep.equal([[
              {status: 'fail'},
              'preconditions',
            ]]);
          });

          it('should return the error from the call to _checkStepForError', function() {
            let action = {status: 'fail'};
            let testData = {status: 'pass'};
            let result;
            actionJsonWriter._checkStepForError.returns('error');

            result = actionJsonWriter._checkActionForError(action, testData);

            expect(result).to.equal('error');
          });
        });

        describe('if the passed in action has an error in perform', function() {
          it('should call _checkStepForError twice with the passed in action and steps \'preconditions\', \'perform\'',
              function() {
                let action = {status: 'fail'};
                let testData = {status: 'pass'};
                actionJsonWriter._checkStepForError.onCall(0).returns(null);
                actionJsonWriter._checkStepForError.onCall(1).returns('perform error');

                actionJsonWriter._checkActionForError(action, testData);

                expect(actionJsonWriter._checkStepForError.args).to.deep.equal([
                  [{status: 'fail'}, 'preconditions'],
                  [{status: 'fail'}, 'perform'],
                ]);
              });

          it('should return the error from the call to _checkStepForError for perform', function() {
            let action = {status: 'fail'};
            let testData = {status: 'pass'};
            let result;
            actionJsonWriter._checkStepForError.onCall(0).returns(null);
            actionJsonWriter._checkStepForError.onCall(1).returns('perform error');

            result = actionJsonWriter._checkActionForError(action, testData);

            expect(result).to.equal('perform error');
          });
        });

        describe('if the passed in action has an error in effects', function() {
          it('should call _checkStepForError thrice with the passed in action and steps'+
          ' \'preconditions\', \'perform\', \'effects\'', function() {
            let action = {status: 'fail'};
            let testData = {status: 'pass'};
            actionJsonWriter._checkStepForError.onCall(0).returns(null);
            actionJsonWriter._checkStepForError.onCall(1).returns(null);
            actionJsonWriter._checkStepForError.onCall(2).returns('effects error');

            actionJsonWriter._checkActionForError(action, testData);

            expect(actionJsonWriter._checkStepForError.args).to.deep.equal([
              [{status: 'fail'}, 'preconditions'],
              [{status: 'fail'}, 'perform'],
              [{status: 'fail'}, 'effects'],
            ]);
          });

          it('should return the error from the call to _checkStepForError for effects', function() {
            let action = {status: 'fail'};
            let testData = {status: 'pass'};
            let result;
            actionJsonWriter._checkStepForError.onCall(0).returns(null);
            actionJsonWriter._checkStepForError.onCall(1).returns(null);
            actionJsonWriter._checkStepForError.onCall(2).returns('effects error');

            result = actionJsonWriter._checkActionForError(action, testData);

            expect(result).to.equal('effects error');
          });
        });
      });
    });
  });

  describe('_checkStepForError', function() {
    let actionJsonWriter;
    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/writers/action-json-writer.js');
      mockery.registerMock('fs', {});
      mockery.registerMock('path', {});
      mockery.registerMock('../../util/config-handler.js', {});

      actionJsonWriter = require('../../../../../lib/runner/writers/action-json-writer.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the passed in action.steps does NOT have the passed in step property', function() {
      it('should return null', function() {
        let action = {
          steps: {
            precondition: {},
          },
        };
        let result;

        result = actionJsonWriter._checkStepForError(action, 'step');

        expect(result).to.equal(null);
      });
    });

    describe('if the passed in action.steps does have the passed in step property', function() {
      describe('if the passed in actions.steps[step] does NOT have the status \'fail\'', function() {
        it('should return null', function() {
          let action = {
            steps: {
              precondition: {
                status: 'pass',
              },
            },
          };
          let result;

          result = actionJsonWriter._checkStepForError(action, 'precondition');

          expect(result).to.equal(null);
        });
      });

      describe('if the passed in actions.steps[step] does have the status \'fail\'', function() {
        it('should return the error property', function() {
          let action = {
            steps: {
              precondition: {
                status: 'fail',
                error: 'error',
              },
            },
          };
          let result;

          result = actionJsonWriter._checkStepForError(action, 'precondition');

          expect(result).to.equal('error');
        });
      });
    });
  });
});
