'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/test-runner/test-runner.js', function() {
  describe('on file being required', function() {
    let testRunner;
    let Emitter;
    let runnerEventDispatch;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-runner.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      runnerEventDispatch = sinon.stub();

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('path', {});
      mockery.registerMock('child_process', {});
      mockery.registerMock('lodash', {});
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('../runner-event-dispatch/runner-event-dispatch.js', runnerEventDispatch);
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call Emitter.mixIn with testRunner and runnerEventDispatch', function() {
      testRunner = require('../../../../../lib/runner/test-runner/test-runner.js');

      expect(Emitter.mixIn.args).to.deep.equal([
        [
          testRunner,
          runnerEventDispatch,
        ],
      ]);
    });

    it('should call testRunner.on with testRunner.configured and testRunner._scheduleTests', function() {
      testRunner = require('../../../../../lib/runner/test-runner/test-runner.js');

      expect(testRunner.on.args[0]).to.deep.equal([
        'testRunner.configured',
        testRunner._scheduleTests,
      ]);
    });

    it('should call testRunner.on with testRunner.testFinished and testRunner._scheduleTests', function() {
      testRunner = require('../../../../../lib/runner/test-runner/test-runner.js');

      expect(testRunner.on.args[1]).to.deep.equal([
        'testRunner.testFinished',
        testRunner._scheduleTests,
      ]);
    });

    it('should call testRunner.on with testRunner.testScheduled and testRunner._createSpawnArgs', function() {
      testRunner = require('../../../../../lib/runner/test-runner/test-runner.js');

      expect(testRunner.on.args[2]).to.deep.equal([
        'testRunner.testScheduled',
        testRunner._createSpawnArgs,
      ]);
    });

    it('should call testRunner.on with testRunner.spawnArgsCreated and testRunner._startTest', function() {
      testRunner = require('../../../../../lib/runner/test-runner/test-runner.js');

      expect(testRunner.on.args[3]).to.deep.equal([
        'testRunner.spawnArgsCreated',
        testRunner._startTest,
      ]);
    });

    it('should call testRunner.on 5 times', function() {
      testRunner = require('../../../../../lib/runner/test-runner/test-runner.js');

      expect(testRunner.on.callCount).to.equal(4);
    });
  });

  describe('configure', function() {
    let testRunner;
    let Emitter;
    let configHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-runner.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      configHandler = {
        get: sinon.stub().withArgs('rerunFailedTests').returns(0),
      };

      sinon.stub(process, 'hrtime').returns([0, 0]);

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('path', {});
      mockery.registerMock('child_process', {});
      mockery.registerMock('lodash', {});
      mockery.registerMock('../../util/config/config-handler.js', configHandler);
      mockery.registerMock('../runner-event-dispatch/runner-event-dispatch.js', {});

      testRunner = require('../../../../../lib/runner/test-runner/test-runner.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
      process.hrtime.restore();
    });

    it('should call process.hrtime once', function() {
      testRunner.configure([]);

      expect(process.hrtime.callCount).to.equal(1);
    });

    it('should set the _testTimer to process.hrTime', function() {
      testRunner.configure([]);

      expect(testRunner._testTimer).to.deep.equal([0, 0]);
    });

    it('should set _testFiles to the passed in testFiles', function() {
      testRunner.configure(['../path/to/file1', '/pathto/file2']);

      expect(testRunner._testFiles).to.deep.equal(['../path/to/file1', '/pathto/file2']);
    });

    it('should set _testsRemaining to the passed in testFiles.length', function() {
      testRunner.configure(['../path/to/file1', '/pathto/file2']);
      expect(testRunner._testsRemaining).equal(2);
    });

    it('should call configHandler.get 3 times with ' +
      '\'testDely\' \'rerunFailedTests\' \'parallelism\'', function() {
      testRunner.configure(['testfiles']);

      expect(configHandler.get.args).to.deep.equal([
        ['testDelay'],
        ['rerunFailedTests'],
        ['parallelism'],
      ]);
    });

    it('should set _staggerTime to configHandler.get testDelay returned value', function() {
      configHandler.get.returns(5);

      testRunner.configure([]);

      expect(testRunner._staggerTime).equal(5);
    });

    it('should set _rerunCount to configHandler.get rerunFailedTests returned value', function() {
      configHandler.get.returns(2);

      testRunner.configure([]);

      expect(testRunner._rerunCount).equal(2);
    });

    it('should set ._parallelism to configHandler.get parallelism returned value', function() {
      configHandler.get.returns(4);

      testRunner.configure(['testfiles']);

      expect(testRunner._parallelism).to.equal(4);
    });


    it('should call testRunner.emit with the correct event', function() {
      testRunner.configure([]);

      expect(testRunner.emit.args).to.deep.equal([
        ['testRunner.configured'],
      ]);
    });
  });

  describe('_startTest', function() {
    let testRunner;
    let Emitter;
    let childProcess;
    let _;
    let sampleSpawnArgs;
    let test;
    let testPath;
    let configHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-runner.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      configHandler = {
        getAll: sinon.stub().returns({configProp: 'configVal'}),
      };

      test = {
        on: sinon.stub(),
        stderr: {
          on: sinon.stub(),
        },
      };

      childProcess = {
        spawn: sinon.stub(),
      };

      _ = {
        cloneDeep: sinon.stub(),
      };

      _.cloneDeep.returns({
        key1: 'value1',
        key2: 'value2',
      });

      childProcess.spawn.returns(test);

      sampleSpawnArgs = [
        '../../../index.js',
        'run',
        './path/to/tests',
        '-c',
        './path/to/components',
      ];

      testPath = 'dir/subDir/1527008636080-simulato-1_4.json';

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('path', {});
      mockery.registerMock('child_process', childProcess);
      mockery.registerMock('process', process);
      mockery.registerMock('lodash', _);
      mockery.registerMock('../../util/config/config-handler.js', configHandler);
      mockery.registerMock('../runner-event-dispatch/runner-event-dispatch.js', {});

      testRunner = require('../../../../../lib/runner/test-runner/test-runner.js');
    });

    afterEach(function() {
      process.exitCode = 0;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call _.cloneDeep once with process.env as an arg', function() {
      testRunner._startTest(sampleSpawnArgs, testPath);

      expect(_.cloneDeep.args).to.deep.equal([
        [process.env],
      ]);
    });

    it('should call configHandler.getAll once with no params', function() {
      testRunner._startTest(sampleSpawnArgs, testPath);

      expect(configHandler.getAll.args).to.deep.equal([[]]);
    });

    it('should call childProcess.spawn,"node", passed in spawnArgs, and options object', function() {
      testRunner._startTest(sampleSpawnArgs, testPath);

      expect(childProcess.spawn.args).to.deep.equal([
        [
          'node',
          [
            '../../../index.js',
            'run',
            './path/to/tests',
            '-c',
            './path/to/components',
          ],
          {
            env: {
              key1: 'value1',
              key2: 'value2',
              USING_PARENT_TEST_RUNNER: true,
              TEST_PATH: testPath,
              PARENT_CONFIG: '{\"configProp\":\"configVal\"}',
            },
            stdio: [null, null, null, 'ipc'],
          },
        ],
      ]);
    });

    it('should set test.name to the string after all \'/\' in the passed in test path', function() {
      testRunner._startTest(sampleSpawnArgs, testPath);

      expect(test.name).to.equal('1527008636080-simulato-1_4.json');
    });

    describe('when the testRunner._testNumber property has already been created for test.name', function() {
      it('should set test.number to testRunner._testNumbers[test.name]', function() {
        testRunner._testNumbers = {
          '1527008636080-simulato-1_4.json': 2,
        };

        testRunner._startTest(sampleSpawnArgs, testPath);

        expect(test.number).to.equal(2);
      });
    });

    describe('when the testRunner._testNumber property has NOT already been created for test.name', function() {
      it('should set testRunner._testNumbers[test.name] to '
        + 'Object.keys length value of testRunner._testNumbers', function() {
        testRunner._startTest(sampleSpawnArgs, testPath);

        expect(testRunner._testNumbers).to.deep.equal({'1527008636080-simulato-1_4.json': 0});
      });

      it('should set test.number to Object.keys length value of testRunner._testNumbers '
        + 'before the new testNumber was added', function() {
        testRunner._startTest(sampleSpawnArgs, testPath);

        expect(test.number).to.equal(0);
      });
    });

    it('should set test.testPath to the passed in test path', function() {
      testRunner._startTest(sampleSpawnArgs, testPath);

      expect(test.testPath).to.equal('dir/subDir/1527008636080-simulato-1_4.json');
    });

    it('should increment _testsRunning once', function() {
      testRunner._startTest(sampleSpawnArgs, testPath);

      expect(testRunner._testsRunning).to.equal(1);
    });

    it('should call test.stderr.on with the first arg is "data"', function() {
      testRunner._startTest(sampleSpawnArgs, testPath);

      expect(test.stderr.on.args[0][0]).to.deep.equal('data');
    });

    it('should call test.stderr.on with a function as the second arg', function() {
      testRunner._startTest(sampleSpawnArgs, testPath);

      expect(test.stderr.on.args[0][1]).to.be.a('function');
    });

    it('should call test.stderr.on once', function() {
      testRunner._startTest(sampleSpawnArgs, testPath);

      expect(test.stderr.on.callCount).to.equal(1);
    });

    describe('when the test.stderr.on callback is called', function() {
      it('should call testRunner.emit with the correct event with the passed in data and test.number', function() {
        test.stderr.on.callsArgWith(1, 'some error');

        testRunner._startTest(sampleSpawnArgs, testPath);

        expect(testRunner.emit.args[0]).to.deep.equal([
          'testRunner.childStderrReceived',
          'some error',
          0,
        ]);
      });
    });

    it('should call test.on with the first arg is "message"', function() {
      testRunner._startTest(sampleSpawnArgs, testPath);

      expect(test.on.args[0][0]).to.deep.equal('message');
    });

    it('should call test.on with a function as the second arg', function() {
      testRunner._startTest(sampleSpawnArgs, testPath);

      expect(test.on.args[0][1]).to.be.a('function');
    });

    describe('when the test.on message callback is called', function() {
      it('should call testRunner.emit with the correct event with the passed in data and test.number', function() {
        test.on.callsArgWith(1, 'message data');

        testRunner._startTest(sampleSpawnArgs, testPath);

        expect(testRunner.emit.args[0]).to.deep.equal([
          'testRunner.testDataReceived',
          'message data',
          0,
        ]);
      });
    });

    it('should call test.on with the first arg is "close"', function() {
      testRunner._startTest(sampleSpawnArgs, testPath);

      expect(test.on.args[1][0]).to.deep.equal('close');
    });

    it('should call test.on with a function as the second arg', function() {
      testRunner._startTest(sampleSpawnArgs, testPath);

      expect(test.on.args[1][1]).to.be.a('function');
    });

    describe('when the test.on close callback is called', function() {
      describe('if the returned exitCode is truthy', function() {
        describe('if testRunner._rerunCount is 0', function() {
          it('should set the process.exitCode to 1', function() {
            test.on.callsArgWith(1, 1);
            testRunner._rerunCount = 0;

            testRunner._startTest(sampleSpawnArgs, testPath);

            expect(process.exitCode).to.equal(1);
          });
        });

        describe('if testRunner._rerunCount is NOT 0', function() {
          it('should keep the process.exitCode as 0', function() {
            test.on.callsArgWith(1, 1);
            testRunner._rerunCount = 1;

            testRunner._startTest(sampleSpawnArgs, testPath);

            expect(process.exitCode).to.equal(0);
          });
        });


        it('should add the failed tests.testPath on to testRunner._testsToRerun', function() {
          test.on.callsArgWith(1, 1);

          testRunner._startTest(sampleSpawnArgs, testPath);
          expect(testRunner._testRerunMemo).to.deep.equal({'dir/subDir/1527008636080-simulato-1_4.json': NaN});
        });
      });

      it('should decrement testRunner._testsRunning once', function() {
        test.on.callsArgWith(1, 0);

        testRunner._startTest(sampleSpawnArgs, testPath);

        expect(testRunner._testsRunning).to.equal(0);
      });

      it('should decrement testRunner._testsRemaining once', function() {
        test.on.callsArgWith(1, 0);
        testRunner._testsRemaining = 4;
        testRunner._testRerunMemo = {'dir/subDir/1527008636080-simulato-1_4.json': 0};

        testRunner._startTest(sampleSpawnArgs, testPath);

        expect(testRunner._testsRemaining).to.equal(3);
      });

      it('should call testRunner.emit with the correct event testRunner.testFinished, test.number, '
        + 'and testRunner._rerunCount', function() {
        test.on.callsArgWith(1, 0);
        testRunner._rerunCount = 0;

        testRunner._startTest(sampleSpawnArgs, testPath);

        expect(testRunner.emit.args[1]).to.deep.equal([
          'testRunner.testFinished',
          0,
          undefined,
        ]);
      });

      it('should call testRunner.emit 3 times', function() {
        test.on.callsArgWith(1, 0);
        testRunner._testsRunning = 3;

        testRunner._startTest(sampleSpawnArgs, testPath);

        expect(testRunner.emit.callCount).to.deep.equal(3);
      });

      describe('when testRunner._testsRemaining is decremented down to 0', function() {
        describe('when testRunner._testRerunMemo value for the test is zero', function() {
          it('should call testRunner.emit with the correct event testRunner.done', function() {
            test.on.callsArgWith(1, 0);
            testRunner._testsRemaining = 1;
            testRunner._rerunCount = 3;
            testRunner._testRerunMemo = {'dir/subDir/1527008636080-simulato-1_4.json': 0};

            testRunner._startTest(sampleSpawnArgs, testPath);
            expect(testRunner.emit.args[2]).to.deep.equal([
              'testRunner.done',
            ]);
          });

          it('should call testRunner.emit three times', function() {
            test.on.callsArgWith(1, 0);
            testRunner._testsRemaining = 1;
            testRunner._testsToRerun = [];
            testRunner._rerunCount = 3;

            testRunner._startTest(sampleSpawnArgs, testPath);

            expect(testRunner.emit.callCount).to.deep.equal(3);
          });
        });

        describe('when testRunner has one test remaining and ._startTest is called', function() {
          it('should call testRunner.emit with the correct event testRunner.done', function() {
            test.on.callsArgWith(1, 0);
            testRunner._testsRemaining = 1;
            testRunner._testRerunMemo = {'dir/subDir/1527008636080-simulato-1_4.json': 0};
            testRunner._startTest(sampleSpawnArgs, testPath);

            expect(testRunner.emit.args[2]).to.deep.equal([
              'testRunner.done',
            ]);
          });

          it('should call testRunner.emit 4 times', function() {
            test.on.callsArgWith(1, 0);
            testRunner._testsRemaining = 1;
            testRunner._testsToRerun = ['test', 'test'];
            testRunner._rerunCount = 0;

            testRunner._startTest(sampleSpawnArgs, testPath);

            expect(testRunner.emit.callCount).to.deep.equal(3);
          });
        });
      });
    });

    it('should call test.on twice', function() {
      testRunner._startTest(sampleSpawnArgs, testPath);

      expect(test.on.callCount).to.equal(2);
    });

    it('should call testRunner.emit with the correct event, the test.number, and test.name', function() {
      testRunner._startTest(sampleSpawnArgs, testPath);

      expect(testRunner.emit.args).to.deep.equal([
        [
          'testRunner.testStarted',
          0,
          '1527008636080-simulato-1_4.json',
        ],
      ]);
    });
  });

  describe('_scheduleTests', function() {
    let testRunner;
    let Emitter;
    let clock;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-runner.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      clock = sinon.useFakeTimers(700);
      sinon.spy(clock, 'setTimeout');

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('path', {});
      mockery.registerMock('child_process', {});
      mockery.registerMock('lodash', {});
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('../runner-event-dispatch/runner-event-dispatch.js', {});

      testRunner = require('../../../../../lib/runner/test-runner/test-runner.js');
      testRunner._testFiles = [
        'test 1', 'test 2', 'test 3', 'test 4', 'test 5',
        'test 6', 'test 7', 'test 8', 'test 9', 'test 10',
        'test 11', 'test 12', 'test 13', 'test 14', 'test 15',
        'test 16', 'test 17', 'test 18', 'test 19', 'test 20',
      ];
      sinon.spy(testRunner._testFiles, 'pop');
      testRunner._parallelism = 20;
    });

    afterEach(function() {
      clock.setTimeout.restore();
      clock.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if parallelism is 20', function() {
      describe('if there are at least 20 test files', function() {
        it('should call testFiles.pop 20 times', function() {
          testRunner._scheduleTests();

          expect(testRunner._testFiles.pop.callCount).to.equal(20);
        });

        it('should call testRunner.emit with the correct event 20 times', function() {
          testRunner._staggerTime = 0;

          testRunner._scheduleTests();

          expect(testRunner.emit.args).to.deep.equal([
            ['testRunner.testScheduled', 'test 20'], ['testRunner.testScheduled', 'test 19'],
            ['testRunner.testScheduled', 'test 18'], ['testRunner.testScheduled', 'test 17'],
            ['testRunner.testScheduled', 'test 16'], ['testRunner.testScheduled', 'test 15'],
            ['testRunner.testScheduled', 'test 14'], ['testRunner.testScheduled', 'test 13'],
            ['testRunner.testScheduled', 'test 12'], ['testRunner.testScheduled', 'test 11'],
            ['testRunner.testScheduled', 'test 10'], ['testRunner.testScheduled', 'test 9'],
            ['testRunner.testScheduled', 'test 8'], ['testRunner.testScheduled', 'test 7'],
            ['testRunner.testScheduled', 'test 6'], ['testRunner.testScheduled', 'test 5'],
            ['testRunner.testScheduled', 'test 4'], ['testRunner.testScheduled', 'test 3'],
            ['testRunner.testScheduled', 'test 2'], ['testRunner.testScheduled', 'test 1'],
          ]);
        });
      });

      describe('if there are less than 20 test files', function() {
        it('should call testFiles.pop the number of test files + 1', function() {
          testRunner._testFiles.splice(14, 5);

          testRunner._scheduleTests();

          expect(testRunner._testFiles.pop.callCount).to.equal(16);
        });

        it('should call testRunner.emit as many times as there are testFiles times', function() {
          testRunner._testFiles.splice(14, 5);
          testRunner._staggerTime = 0;

          testRunner._scheduleTests();

          expect(testRunner.emit.callCount).to.equal(15);
        });
      });
    });

    describe('if testRunner._staggerTime is set to 10', function() {
      describe('if Date.now() is greater than the _timeToStartNextTest', function() {
        it('should set _timeToStartNextTest to Date.now() + 10', function() {
          testRunner._staggerTime = 10;
          testRunner._timeToStartNextTest = 300;
          testRunner._testFiles.splice(0, 19);

          testRunner._scheduleTests();

          expect(testRunner._timeToStartNextTest).to.equal(710);
        });

        it('should call testRunner.emit with testRunner.testScheduled and the test file', function() {
          testRunner._staggerTime = 10;
          testRunner._timeToStartNextTest = 300;
          testRunner._testFiles.splice(0, 19);

          testRunner._scheduleTests();

          expect(testRunner.emit.args).to.deep.equal([
            ['testRunner.testScheduled', 'test 20'],
          ]);
        });
      });

      describe('if Date.now() is equal to _timeToStartNextTest', function() {
        it('should set _timeToStartNextTest to Date.now() + 10', function() {
          testRunner._staggerTime = 10;
          testRunner._timeToStartNextTest = 700;
          testRunner._testFiles.splice(0, 19);

          testRunner._scheduleTests();

          expect(testRunner._timeToStartNextTest).to.equal(710);
        });

        it('should call testRunner.emit with testRunner.testScheduled and the test file', function() {
          testRunner._staggerTime = 10;
          testRunner._timeToStartNextTest = 700;
          testRunner._testFiles.splice(0, 19);

          testRunner._scheduleTests();

          expect(testRunner.emit.args).to.deep.equal([
            ['testRunner.testScheduled', 'test 20'],
          ]);
        });
      });

      describe('if Date.now() is less than _timeToStartNextTest', function() {
        it('should set _timeToStartNextTest to _timeToStartNextTest + 10', function() {
          testRunner._staggerTime = 10;
          testRunner._timeToStartNextTest = 900;
          testRunner._testFiles.splice(0, 19);

          testRunner._scheduleTests();

          expect(testRunner._timeToStartNextTest).to.equal(910);
        });

        it('should call setTimeout once', function() {
          testRunner._staggerTime = 10;
          testRunner._timeToStartNextTest = 900;
          testRunner._testFiles.splice(0, 19);

          testRunner._scheduleTests();

          expect(clock.setTimeout.callCount).to.equal(1);
        });

        it('should call setTimeout a function as first param', function() {
          testRunner._staggerTime = 10;
          testRunner._timeToStartNextTest = 900;
          testRunner._testFiles.splice(0, 19);

          testRunner._scheduleTests();

          expect(clock.setTimeout.args[0][0]).to.be.a('function');
        });

        it('should call setTimeout with _timeToStartNextTest - Date.now() as second param', function() {
          testRunner._staggerTime = 10;
          testRunner._timeToStartNextTest = 900;
          testRunner._testFiles.splice(0, 19);

          testRunner._scheduleTests();

          expect(clock.setTimeout.args[0][1]).to.equal(200);
        });

        it('should not call the callback after 199 clock ticks', function() {
          testRunner._staggerTime = 10;
          testRunner._timeToStartNextTest = 900;
          testRunner._testFiles.splice(0, 19);

          testRunner._scheduleTests();
          clock.tick(199);

          expect(testRunner.emit.callCount).to.equal(0);
        });

        describe('when setTimeout callback is called at the 200th clock tick', function() {
          it('should call testRunner.emit with testRunner.testScheduled and the test file', function() {
            testRunner._staggerTime = 10;
            testRunner._timeToStartNextTest = 900;
            testRunner._testFiles.splice(0, 19);

            testRunner._scheduleTests();
            clock.tick(200);

            expect(testRunner.emit.args).to.deep.equal([
              ['testRunner.testScheduled', 'test 20'],
            ]);
          });
        });
      });
    });
  });

  describe('_createSpawnArgs', function() {
    let testRunner;
    let Emitter;
    let path;
    let testPath;
    let configHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-runner.js');

      path = {
        resolve: sinon.stub(),
      };
      path.resolve.returns('curDir/../../../index.js');

      testPath = './path/to/test';

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      configHandler = {
        get: sinon.stub(),
      };

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('path', path);
      mockery.registerMock('child_process', {});
      mockery.registerMock('lodash', {});
      mockery.registerMock('../../util/config/config-handler.js', configHandler);
      mockery.registerMock('../runner-event-dispatch/runner-event-dispatch.js', {});

      testRunner = require('../../../../../lib/runner/test-runner/test-runner.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call testRunner.emit with the correct event with default spawnArgs and testPath', function() {
      testRunner._createSpawnArgs(testPath);

      expect(testRunner.emit.args).to.deep.equal([
        [
          'testRunner.spawnArgsCreated',
          [
            'curDir/../../../index.js',
            'run',
          ],
          './path/to/test',
        ],
      ]);
    });

    it('should call configHandler.get once to get the debug property', function() {
      testRunner._createSpawnArgs(testPath);

      expect(configHandler.get.args).to.deep.equal([['debug']]);
    });

    describe('if config.debug is truthy', function() {
      it('should call testRunner.emit with the first param \'testRunner.getDebugPort\'', function() {
        configHandler.get.returns(true);

        testRunner._createSpawnArgs(testPath);

        expect(testRunner.emit.args[0][0]).to.deep.equal('testRunner.getDebugPort');
      });

      it('should call testRunner.emit with the second param as a function', function() {
        configHandler.get.returns(true);

        testRunner._createSpawnArgs(testPath);

        expect(testRunner.emit.args[0][1]).to.be.a('function');
      });

      describe('when the callback sent in the event is called', function() {
        it('should call testRunner.emit with the correct event with spawnArgs including testDelay args'
          + 'and testPath', function() {
          testRunner.emit.onCall(0).callsArgWith(1, 3000);
          configHandler.get.returns(true);

          testRunner._createSpawnArgs(testPath);

          expect(testRunner.emit.args[1]).to.deep.equal([
            'testRunner.spawnArgsCreated',
            [
              '--inspect-brk=3000',
              'curDir/../../../index.js',
              'run',
            ],
            './path/to/test',
          ]);
        });

        it('should call testRunner.emit twice', function() {
          configHandler.get.returns(true);
          testRunner.emit.onCall(0).callsArgWith(1, 3000);

          testRunner._createSpawnArgs(testPath);

          expect(testRunner.emit.callCount).to.equal(2);
        });
      });
    });
  });
});
