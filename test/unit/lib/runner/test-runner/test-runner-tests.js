'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/test-runner/test-runner.js', function() {
  describe('on file being required', function() {
    let testRunner;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-runner.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});
      mockery.registerMock('path', {});
      mockery.registerMock('child_process', {});
      mockery.registerMock('lodash', {});
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should set the object prototype of printOutput to a new EventEmitter', function() {
      testRunner = require('../../../../../lib/runner/test-runner/test-runner.js');

      expect(Object.getPrototypeOf(testRunner)).to.deep.equal(EventEmitterInstance);
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

    it('should call testRunner.on 4 times', function() {
      testRunner = require('../../../../../lib/runner/test-runner/test-runner.js');

      expect(testRunner.on.callCount).to.equal(4);
    });
  });

  describe('configure', function() {
    let testRunner;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-runner.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      sinon.stub(process, 'hrtime').returns([0, 0]);

      mockery.registerMock('events', {EventEmitter});
      mockery.registerMock('path', {});
      mockery.registerMock('child_process', {});
      mockery.registerMock('lodash', {});

      testRunner = require('../../../../../lib/runner/test-runner/test-runner.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
      process.hrtime.restore();
    });

    it('should call process.hrtime once', function() {
      testRunner.configure();

      expect(process.hrtime.callCount).to.equal(1);
    });

    it('should set the _testTimer to process.hrTime', function() {
      testRunner.configure();

      expect(testRunner._testTimer).to.deep.equal([0, 0]);
    });

    it('should set _testFiles to the passed in testFiles', function() {
      testRunner.configure(['../path/to/file1', '/pathto/file2']);

      expect(testRunner._testFiles).to.deep.equal(['../path/to/file1', '/pathto/file2']);
    });

    it('should call testRunner.emit with the correct event', function() {
      testRunner.configure();

      expect(testRunner.emit.args).to.deep.equal([
        ['testRunner.configured'],
      ]);
    });

    describe('if parallelism paramter is passed in && > 0', function() {
      it('should set ._parallelism to the passed in parallelism paramater', function() {
        testRunner.configure(['testfiles'], 4);

        expect(testRunner._parallelism).to.equal(4);
      });
    });

    describe('if no parallelism is passed in', function() {
      it('should leave ._parallelism at the default 20', function() {
        testRunner.configure();

        expect(testRunner._parallelism).to.equal(20);
      });
    });
  });

  describe('_startTest', function() {
    let testRunner;
    let EventEmitter;
    let EventEmitterInstance;
    let childProcess;
    let _;
    let sampleSpawnArgs;
    let test;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-runner.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      test = {
        on: sinon.stub(),
        stdout: {
          on: sinon.stub(),
        },
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

      mockery.registerMock('events', {EventEmitter});
      mockery.registerMock('path', {});
      mockery.registerMock('child_process', childProcess);
      mockery.registerMock('process', process);
      mockery.registerMock('lodash', _);

      testRunner = require('../../../../../lib/runner/test-runner/test-runner.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call _.cloneDeep once with process.env as an arg', function() {
      testRunner._startTest(sampleSpawnArgs);

      expect(_.cloneDeep.args).to.deep.equal([
        [process.env],
      ]);
    });

    it('should call childProcess.spawn,"node", passed in spawnArgs, and options object', function() {
      testRunner._startTest(sampleSpawnArgs);

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
            },
            stdio: [null, null, null, 'ipc'],
          },
        ],
      ]);
    });

    it('should increment _testCount once', function() {
      testRunner._startTest(sampleSpawnArgs);

      expect(testRunner._testCount).to.equal(1);
    });

    it('should increment _testsRunning once', function() {
      testRunner._startTest(sampleSpawnArgs);

      expect(testRunner._testsRunning).to.equal(1);
    });

    it('should call test.stdout.on with the first arg is "data"', function() {
      testRunner._startTest(sampleSpawnArgs);

      expect(test.stdout.on.args[0][0]).to.deep.equal('data');
    });

    it('should call test.stdout.on with a function as the second arg', function() {
      testRunner._startTest(sampleSpawnArgs);

      expect(test.stdout.on.args[0][1]).to.be.a('function');
    });

    it('should call test.stdout.on once', function() {
      testRunner._startTest(sampleSpawnArgs);

      expect(test.stdout.on.callCount).to.equal(1);
    });

    describe('when the test.stdout.on callback is called', function() {
      it('should call testRunner.emit with the correct event with the passed in data and test.number', function() {
        test.stdout.on.callsArgWith(1, 'some data');

        testRunner._startTest(sampleSpawnArgs);

        expect(testRunner.emit.args[0]).to.deep.equal([
          'testRunner.childStdoutReceived',
          'some data',
          0,
        ]);
      });
    });

    it('should call test.stderr.on with the first arg is "data"', function() {
      testRunner._startTest(sampleSpawnArgs);

      expect(test.stderr.on.args[0][0]).to.deep.equal('data');
    });

    it('should call test.stderr.on with a function as the second arg', function() {
      testRunner._startTest(sampleSpawnArgs);

      expect(test.stderr.on.args[0][1]).to.be.a('function');
    });

    it('should call test.stderr.on once', function() {
      testRunner._startTest(sampleSpawnArgs);

      expect(test.stderr.on.callCount).to.equal(1);
    });

    describe('when the test.stderr.on callback is called', function() {
      it('should call testRunner.emit with the correct event with the passed in data and test.number', function() {
        test.stderr.on.callsArgWith(1, 'some error');

        testRunner._startTest(sampleSpawnArgs);

        expect(testRunner.emit.args[0]).to.deep.equal([
          'testRunner.childStderrReceived',
          'some error',
          0,
        ]);
      });
    });

    it('should call test.on with the first arg is "message"', function() {
      testRunner._startTest(sampleSpawnArgs);

      expect(test.on.args[0][0]).to.deep.equal('message');
    });

    it('should call test.on with a function as the second arg', function() {
      testRunner._startTest(sampleSpawnArgs);

      expect(test.on.args[0][1]).to.be.a('function');
    });

    describe('when the test.on message callback is called', function() {
      it('should call testRunner.emit with the correct event with the passed in data and test.number', function() {
        test.on.callsArgWith(1, 'message data');

        testRunner._startTest(sampleSpawnArgs);

        expect(testRunner.emit.args[0]).to.deep.equal([
          'testRunner.testDataReceived',
          'message data',
        ]);
      });
    });

    it('should call test.on with the first arg is "close"', function() {
      testRunner._startTest(sampleSpawnArgs);

      expect(test.on.args[1][0]).to.deep.equal('close');
    });

    it('should call test.on with a function as the second arg', function() {
      testRunner._startTest(sampleSpawnArgs);

      expect(test.on.args[1][1]).to.be.a('function');
    });

    describe('when the test.on close callback is called', function() {
      it('should decrement testRunner._testsRunning once', function() {
        test.on.callsArgWith(1);

        testRunner._startTest(sampleSpawnArgs);

        expect(testRunner._testsRunning).to.equal(0);
      });

      it('should call testRunner.emit with the correct event testRunner.testFinished', function() {
        test.on.callsArgWith(1, 'message data');

        testRunner._startTest(sampleSpawnArgs);

        expect(testRunner.emit.args[1]).to.deep.equal([
          'testRunner.testFinished',
        ]);
      });

      it('should call testRunner.emit 3 times', function() {
        test.on.callsArgWith(1, 'message data');
        testRunner._testsRunning = 3;

        testRunner._startTest(sampleSpawnArgs);

        expect(testRunner.emit.callCount).to.deep.equal(3);
      });

      describe('when testRunner._testsRunning is decremented down to 0', function() {
        it('should call testRunner.emit with the correct event testRunner.done', function() {
          test.on.callsArgWith(1, 'message data');

          testRunner._startTest(sampleSpawnArgs);

          expect(testRunner.emit.args[2]).to.deep.equal([
            'testRunner.done',
          ]);
        });

        it('should call testRunner.emit 4 times', function() {
          test.on.callsArgWith(1, 'message data');

          testRunner._startTest(sampleSpawnArgs);

          expect(testRunner.emit.callCount).to.deep.equal(4);
        });
      });
    });

    it('should call test.on twice', function() {
      testRunner._startTest(sampleSpawnArgs);

      expect(test.on.callCount).to.equal(2);
    });

    it('should call testRunner.emit with the correct event and the test.number', function() {
      testRunner._startTest(sampleSpawnArgs);

      expect(testRunner.emit.args).to.deep.equal([
        [
          'testRunner.testStarted',
          0,
        ],
      ]);
    });
  });

  describe('_scheduleTests', function() {
    let testRunner;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-runner.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});
      mockery.registerMock('path', {});
      mockery.registerMock('child_process', {});
      mockery.registerMock('lodash', {});

      testRunner = require('../../../../../lib/runner/test-runner/test-runner.js');
      testRunner._testFiles = [
        'test 1', 'test 2', 'test 3', 'test 4', 'test 5',
        'test 6', 'test 7', 'test 8', 'test 9', 'test 10',
        'test 11', 'test 12', 'test 13', 'test 14', 'test 15',
        'test 16', 'test 17', 'test 18', 'test 19', 'test 20',
      ];
      sinon.spy(testRunner._testFiles, 'pop');
    });

    afterEach(function() {
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

        it('should call printOutput.emit with the correct event 20 times', function() {
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

        it('should call printOutput.emit as many times as there are testFiles times', function() {
          testRunner._testFiles.splice(14, 5);

          testRunner._scheduleTests();

          expect(testRunner.emit.callCount).to.equal(15);
        });
      });
    });
  });

  describe('_createSpawnArgs', function() {
    let testRunner;
    let EventEmitter;
    let EventEmitterInstance;
    let path;
    let testPath;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/test-runner.js');

      path = {
        resolve: sinon.stub(),
      };
      path.resolve.returns('curDir/../../../index.js');

      process.env.COMPONENTS_PATH = './path/to/components';
      testPath = './path/to/test';

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});
      mockery.registerMock('path', path);
      mockery.registerMock('child_process', {});
      mockery.registerMock('lodash', {});

      testRunner = require('../../../../../lib/runner/test-runner/test-runner.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
      delete process.env.REPORTER;
      delete process.env.OUTPUT_PATH;
      delete process.env.SAUCE_LABS;
    });

    it('should call testRunner.emit with the correct event with default spawnArgs', function() {
      testRunner._createSpawnArgs(testPath);

      expect(testRunner.emit.args).to.deep.equal([
        [
          'testRunner.spawnArgsCreated',
          [
            'curDir/../../../index.js',
            'run',
            './path/to/test',
            '-c',
            './path/to/components',
          ],
        ],
      ]);
    });

    describe('if process.env.REPORTER is set', function() {
      it('should call testRunner.emit with the correct event with spawnArgs including reporter args', function() {
        process.env.REPORTER = 'reporterType';

        testRunner._createSpawnArgs(testPath);

        expect(testRunner.emit.args).to.deep.equal([
          [
            'testRunner.spawnArgsCreated',
            [
              'curDir/../../../index.js',
              'run',
              './path/to/test',
              '-c',
              './path/to/components',
              '-r',
              'reporterType',
            ],
          ],
        ]);
      });
    });

    describe('if process.env.OUTPUT_PATH is set', function() {
      it('should call testRunner.emit with the correct event with spawnArgs including output_path args', function() {
        process.env.OUTPUT_PATH = './output/path';

        testRunner._createSpawnArgs(testPath);

        expect(testRunner.emit.args).to.deep.equal([
          [
            'testRunner.spawnArgsCreated',
            [
              'curDir/../../../index.js',
              'run',
              './path/to/test',
              '-c',
              './path/to/components',
              '-o',
              './output/path',
            ],
          ],
        ]);
      });
    });

    describe('if process.env.SAUCE_LABS is set', function() {
      it('should call testRunner.emit with the correct event with spawnArgs including saucelabs args', function() {
        process.env.SAUCE_LABS = true;

        testRunner._createSpawnArgs(testPath);

        expect(testRunner.emit.args).to.deep.equal([
          [
            'testRunner.spawnArgsCreated',
            [
              'curDir/../../../index.js',
              'run',
              './path/to/test',
              '-c',
              './path/to/components',
              '-s',
            ],
          ],
        ]);
      });
    });
  });
});
