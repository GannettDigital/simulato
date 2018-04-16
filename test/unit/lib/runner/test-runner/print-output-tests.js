'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/test-runner/print-output.js', function() {
  describe('on file being required', function() {
    let printOutput;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/print-output.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should set the object prototype of printOutput to a new EventEmitter', function() {
      printOutput = require('../../../../../lib/runner/test-runner/print-output.js');

      expect(Object.getPrototypeOf(printOutput)).to.deep.equal(EventEmitterInstance);
    });

    it('should call printOutput.on with printOutput.testSummaryAdded and printOutput._checkIfReadyToPrint', function() {
      printOutput = require('../../../../../lib/runner/test-runner/print-output.js');

      expect(printOutput.on.args[0]).to.deep.equal([
        'printOutput.testSummaryAdded',
        printOutput._checkIfReadyToPrint,
      ]);
    });

    it('should call printOutput.on with printOutput.childOutputAdded and printOutput._checkIfReadyToPrint', function() {
      printOutput = require('../../../../../lib/runner/test-runner/print-output.js');

      expect(printOutput.on.args[1]).to.deep.equal([
        'printOutput.childOutputAdded',
        printOutput._checkIfReadyToPrint,
      ]);
    });

    it('should call printOutput.on with printOutput.outputReadied and printOutput._printChildOutput', function() {
      printOutput = require('../../../../../lib/runner/test-runner/print-output.js');

      expect(printOutput.on.args[2]).to.deep.equal([
        'printOutput.outputReadied',
        printOutput._printChildOutput,
      ]);
    });

    it('should call printOutput.on with printOutput.outputReadied and printOutput._printTestSummary', function() {
      printOutput = require('../../../../../lib/runner/test-runner/print-output.js');

      expect(printOutput.on.args[3]).to.deep.equal([
        'printOutput.outputReadied',
        printOutput._printTestSummary,
      ]);
    });

    it('should call printOutput.on 4 times', function() {
      printOutput = require('../../../../../lib/runner/test-runner/print-output.js');

      expect(printOutput.on.callCount).to.equal(4);
    });
  });

  describe('addTestSummary', function() {
    let printOutput;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/print-output.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});

      printOutput = require('../../../../../lib/runner/test-runner/print-output.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should set _testSummary to the data passed in', function() {
      let data = {
        testCount: 3,
        failedTestCount: 1,
        time: [20, 234],
        testReports: [
          {
            testName: 'The test that failed',
            error: {
              instanceName: 'componentA',
              actionName: 'actionX',
              failedStep: 'effects',
            },
          },
        ],
      };

      printOutput.addTestSummary(data);

      expect(printOutput._testSummary).to.deep.equal({
        testCount: 3,
        failedTestCount: 1,
        time: [20, 234],
        testReports: [
          {
            testName: 'The test that failed',
            error: {
              instanceName: 'componentA',
              actionName: 'actionX',
              failedStep: 'effects',
            },
          },
        ],
      });
    });

    it('should call printOutput.emit with the correct event', function() {
      let data = {
        testCount: 3,
        failedTestCount: 1,
        time: [20, 234],
        testReports: [
          {
            testName: 'The test that failed',
            errors: {
              instanceName: 'componentA',
              actionName: 'actionX',
              failedStep: 'effects',
            },
          },
        ],
      };

      printOutput.addTestSummary(data);

      expect(printOutput.emit.args).to.deep.equal([
        [
          'printOutput.testSummaryAdded',
        ],
      ]);
    });
  });

  describe('addChildOutput', function() {
    let printOutput;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/print-output.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});

      printOutput = require('../../../../../lib/runner/test-runner/print-output.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should set _childOutput to the data passed in', function() {
      let data = {
        stdoutArray: [
          'Line 1 of stdout',
          'Line 2 of stdout',
          'Line 3 of stdout',
        ],
        stderrArray: [
          undefined,
          'There was some error here',
          undefined,
        ],
      };

      printOutput.addChildOutput(data);

      expect(printOutput._childOutput).to.deep.equal({
        stdoutArray: [
          'Line 1 of stdout',
          'Line 2 of stdout',
          'Line 3 of stdout',
        ],
        stderrArray: [
          undefined,
          'There was some error here',
          undefined,
        ],
      });
    });

    it('should call printOutput.emit with the correct event', function() {
      let data = {
        stdoutArray: [
          'Line 1 of stdout',
          'Line 2 of stdout',
          'Line 3 of stdout',
        ],
        stderrArray: [
          undefined,
          'There was some error here',
          undefined,
        ],
      };

      printOutput.addChildOutput(data);

      expect(printOutput.emit.args).to.deep.equal([
        [
          'printOutput.childOutputAdded',
        ],
      ]);
    });
  });

  describe('_checkIfReadyToPrint', function() {
    let printOutput;
    let EventEmitter;
    let EventEmitterInstance;
    let sampleTestSummary;
    let sampleChildOutput;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/print-output.js');

      sampleTestSummary = {
        testCount: 3,
        failedTestCount: 1,
        time: [20, 234],
        testReports: [
          {
            testName: 'The test that failed',
            error: {
              instanceName: 'componentA',
              actionName: 'actionX',
              failedStep: 'effects',
            },
          },
        ],
      };
      sampleChildOutput = {
        stdoutArray: [
          'Line 1 of stdout',
          'Line 2 of stdout',
          'Line 3 of stdout',
        ],
        stderrArray: [
          undefined,
          'There was some error here',
          undefined,
        ],
      };

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});

      printOutput = require('../../../../../lib/runner/test-runner/print-output.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call printOutput.emit with correct event if both _testSummary and _childOutput are set', function() {
      printOutput._testSummary = sampleTestSummary;
      printOutput._childOutput = sampleChildOutput;

      printOutput._checkIfReadyToPrint();

      expect(printOutput.emit.args).to.deep.equal([
        [
          'printOutput.outputReadied',
        ],
      ]);
    });

    it('should not call printOutput.emit if _testSummary is not set and _childOutput is set', function() {
      printOutput._childOutput = sampleChildOutput;

      printOutput._checkIfReadyToPrint();

      expect(printOutput.emit.notCalled).to.be.true;
    });

    it('should not call printOutput.emit if _testSummary is set and _childOutput is not set', function() {
      printOutput._testSummary = sampleTestSummary;

      printOutput._checkIfReadyToPrint();

      expect(printOutput.emit.notCalled).to.be.true;
    });
  });

  describe('_printChildOutput', function() {
    let printOutput;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/print-output.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      sinon.spy(console, 'log');

      mockery.registerMock('events', {EventEmitter});

      printOutput = require('../../../../../lib/runner/test-runner/print-output.js');
    });

    afterEach(function() {
      console.log.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should print 3 statements from stdoutArray if the array has 3 defined indices', function() {
      printOutput._childOutput = {
        stdoutArray: [
          'Line 1 of stdout',
          'Line 2 of stdout',
          'Line 3 of stdout',
        ],
        stderrArray: [],
      };

      printOutput._printChildOutput();

      expect(console.log.args).to.deep.equal([
        ['Line 1 of stdout'],
        ['Line 2 of stdout'],
        ['Line 3 of stdout'],
      ]);
    });

    it('should print 2 statements from stdoutArray if the array has 2 defined indices and 1 undefined', function() {
      printOutput._childOutput = {
        stdoutArray: [
          'Line 1 of stdout',
          undefined,
          'Line 3 of stdout',
        ],
        stderrArray: [],
      };

      printOutput._printChildOutput();

      expect(console.log.args).to.deep.equal([
        ['Line 1 of stdout'],
        ['Line 3 of stdout'],
      ]);
    });

    it('should print 3 statements from stderrArray if the array has 3 defined indices', function() {
      printOutput._childOutput = {
        stdoutArray: [
          undefined,
          undefined,
          undefined,
        ],
        stderrArray: [
          'Error 1',
          'Error 2',
          'Error 3',
        ],
      };

      printOutput._printChildOutput();

      expect(console.log.args).to.deep.equal([
        ['Error 1'],
        ['Error 2'],
        ['Error 3'],
      ]);
    });

    it('should print 1 statements from stderrArray if the array has 1 defined indices and 2 undefined', function() {
      printOutput._childOutput = {
        stdoutArray: [
          undefined,
          undefined,
          undefined,
        ],
        stderrArray: [
          undefined,
          undefined,
          'Error 3',
        ],
      };

      printOutput._printChildOutput();

      expect(console.log.args).to.deep.equal([
        ['Error 3'],
      ]);
    });
  });

  describe('_printTestSummary', function() {
    let printOutput;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/print-output.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      sinon.spy(console, 'log');

      mockery.registerMock('events', {EventEmitter});

      printOutput = require('../../../../../lib/runner/test-runner/print-output.js');
      printOutput._testSummary = {
        testCount: 3,
        failedTestCount: 2,
        time: [20, 234],
        testReports: [
          {
            testName: 'Test 1',
            error: {
              nameOfComponent: 'component1',
              name: 'My Error',
              actionName: 'actionX',
              failedStep: 'effects',
            },
          },
          {
            testName: 'Test 2',
            error: {
              nameOfComponent: 'component2',
              name: 'My Error',
              actionName: 'actionA',
              failedStep: 'effects',
            },
          },
        ],
      };
    });

    afterEach(function() {
      process.exitCode = 0;
      console.log.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call console.log with the title for the test summary', function() {
      printOutput._printTestSummary();

      expect(console.log.args[0]).to.deep.equal([
        `*** Final Aggregate Test Summary ***`,
      ]);
    });

    it('should call console.log to say total tests run using testCount', function() {
      printOutput._printTestSummary();

      expect(console.log.args[1]).to.deep.equal([
        `Total tests run: ${3}`,
      ]);
    });

    it('should call console.log to say total tests passed using testCount & failedTestCount', function() {
      printOutput._printTestSummary();

      expect(console.log.args[2]).to.deep.equal([
        `Tests passed: ${3 - 2}`,
      ]);
    });

    it('should call console.log to say total tests failed using failedTestCount', function() {
      printOutput._printTestSummary();

      expect(console.log.args[3]).to.deep.equal([
        `Tests failed: ${2}`,
      ]);
    });

    it('should call console.log to say run time using time array', function() {
      printOutput._printTestSummary();

      expect(console.log.args[4]).to.deep.equal([
        `Run time: ${20}.${234} seconds\n`,
      ]);
    });

    describe('for each test report', function() {
      describe('if there is an error', function() {
        it('should change the process.exitCode to 1', function() {
          printOutput._printTestSummary();

          expect(process.exitCode).to.equal(1);
        });
        it('should call console.log 13 times if there are 2 failed tests'
          + 'each with 1 failed action having 1 failed step', function() {
            printOutput._printTestSummary();

            expect(console.log.callCount).to.equal(13);
          });

        it('should call console.log to the testName of the failed action', function() {
          printOutput._printTestSummary();

          expect(console.log.args[5]).to.deep.equal([
            `${'Test 1'}:`,
          ]);
        });

        it('should call console.log to say the failed action using instanceName and actioName', function() {
          printOutput._printTestSummary();

          expect(console.log.args[6]).to.deep.equal([
            `\tFailed Action: ${'component1'} - ${'actionX'}`,
          ]);
        });

        it('should call console.log to say the failedStep', function() {
          printOutput._printTestSummary();

          expect(console.log.args[7]).to.deep.equal([
            `\t\tStep: ${'effects'}`,
          ]);
        });

        it('should call console.log to say the Error name', function() {
          printOutput._printTestSummary();

          expect(console.log.args[8]).to.deep.equal([
            `\t\t\tError: ${'My Error'}`,
          ]);
        });
      });

      describe('when there are no failed tests', function() {
        it('should not change the process.exitCode', function() {
          delete printOutput._testSummary.testReports[0].error;
          delete printOutput._testSummary.testReports[1].error;

          printOutput._printTestSummary();

          expect(process.exitCode).to.equal(0);
        });
        it('should only call console.log 5 times', function() {
          delete printOutput._testSummary.testReports[0].error;
          delete printOutput._testSummary.testReports[1].error;

          printOutput._printTestSummary();

          expect(console.log.callCount).to.equal(5);
        });
      });
    });
  });
});
