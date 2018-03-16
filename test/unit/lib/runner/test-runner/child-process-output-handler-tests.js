'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/runner/test-runner/child-process-output-handler.js', function() {
  describe('on file being required', function() {
    let childProcessOutputHandler;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/child-process-output-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
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
      childProcessOutputHandler = require('../../../../../lib/runner/test-runner/child-process-output-handler.js');

      expect(Object.getPrototypeOf(childProcessOutputHandler)).to.deep.equal(EventEmitterInstance);
    });
  });

  describe('addNewChildOutput', function() {
    let childProcessOutputHandler;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/child-process-output-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});

      childProcessOutputHandler = require('../../../../../lib/runner/test-runner/child-process-output-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should add an empty string to _data.stdoutArray at the index passed in', function() {
      let index = 3;

      childProcessOutputHandler.addNewChildOutput(index);

      expect(childProcessOutputHandler._data.stdoutArray).to.deep.equal([
        undefined, undefined, undefined, '',
      ]);
    });

    it('should add an empty string to _data.stderrArray at the index passed in', function() {
      let index = 5;

      childProcessOutputHandler.addNewChildOutput(index);
      expect(childProcessOutputHandler._data.stderrArray).to.deep.equal([
        undefined, undefined, undefined, undefined, undefined, '',
      ]);
    });
  });

  describe('appendStdout', function() {
    let childProcessOutputHandler;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/child-process-output-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});

      childProcessOutputHandler = require('../../../../../lib/runner/test-runner/child-process-output-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should append the _data.stdoutArray at the index passed in with the data passed in', function() {
      let testNumber = 2;
      let data = 'new data being appended';
      childProcessOutputHandler._data.stdoutArray[testNumber] = 'old data, ';

      childProcessOutputHandler.appendStdout(data, testNumber);

      expect(childProcessOutputHandler._data.stdoutArray).to.deep.equal([
        undefined, undefined, 'old data, new data being appended',
      ]);
    });
  });

  describe('appendStderr', function() {
    let childProcessOutputHandler;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/child-process-output-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});

      childProcessOutputHandler = require('../../../../../lib/runner/test-runner/child-process-output-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should append the _data.stderrArray at the index passed in with the data passed in', function() {
      let testNumber = 1;
      let data = 'new data being appended';
      childProcessOutputHandler._data.stderrArray[testNumber] = 'old data, ';

      childProcessOutputHandler.appendStderr(data, testNumber);

      expect(childProcessOutputHandler._data.stderrArray).to.deep.equal([
        undefined, 'old data, new data being appended',
      ]);
    });
  });

  describe('finalizeChildOutput', function() {
    let childProcessOutputHandler;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/runner/test-runner/child-process-output-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('events', {EventEmitter});

      childProcessOutputHandler = require('../../../../../lib/runner/test-runner/child-process-output-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call childProcessOutputHanlder.emit with the event and the _data', function() {
      childProcessOutputHandler._data = {
        stdoutArray: [
          'string 1',
          'string 2',
        ],
        stderrArray: [
          'string 3',
          'string 4',
        ],
      };

      childProcessOutputHandler.finalizeChildOutput();

      expect(childProcessOutputHandler.emit.args).to.deep.equal([
        [
          'childProcessOutputHandler.childOutputFinalized',
          {
            stdoutArray: [
              'string 1',
              'string 2',
            ],
            stderrArray: [
              'string 3',
              'string 4',
            ],
          },
        ],
      ]);
    });
  });
});
