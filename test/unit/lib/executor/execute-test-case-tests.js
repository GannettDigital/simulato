'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/executor/execute-test-case.js', function() {
  describe('on file being required', function() {
    let Emitter;
    let executeTestCase;
    let executorEventDispatch;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/executor/execute-test-case.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      executorEventDispatch = sinon.stub();

      mockery.registerMock('selenium-webdriver', {});
      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('../util/config/config-handler.js', {});
      mockery.registerMock('selenium-webdriver/remote', {});
      mockery.registerMock('./executor-event-dispatch/executor-event-dispatch.js', executorEventDispatch);
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call Emitter.mixIn with executeTestCase and executorEventDispatch', function() {
      executeTestCase = require('../../../../lib/executor/execute-test-case.js');

      expect(Emitter.mixIn.args).to.deep.equal([
        [
          executeTestCase,
          executorEventDispatch,
        ],
      ]);
    });
  });

  describe('configure', function() {
    let Emitter;
    let testPath;
    let webdriver;
    let remote;
    let executeTestCase;
    let configHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/executor/execute-test-case.js');
      testPath = '/tests/my-test-case.js';
      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      webdriver = {
        By: sinon.stub(),
        until: sinon.stub(),
      };
      sinon.stub(process, 'on');
      configHandler = {
        get: sinon.stub(),
      };
      remote = sinon.stub();

      mockery.registerMock('selenium-webdriver', webdriver);
      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('/tests/my-test-case.js', 'testCase');
      mockery.registerMock('../util/config/config-handler.js', configHandler);
      mockery.registerMock('./executor-event-dispatch/executor-event-dispatch.js', {});
      mockery.registerMock('selenium-webdriver/remote', remote);

      executeTestCase = require('../../../../lib/executor/execute-test-case.js');
    });

    afterEach(function() {
      delete global.By;
      delete global.until;
      delete global.remote;

      process.exitCode = 0;
      process.on.restore();

      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should require a remote webdriver', function() {
      executeTestCase.configure(testPath);

      expect(global.remote).to.deep.equal(remote);
    });


    it('should call process.on once', function() {
      executeTestCase.configure(testPath);

      expect(process.on.callCount).to.equal(1);
    });

    it('should call process.on with the event \'uncaughtException\'', function() {
      executeTestCase.configure(testPath);

      expect(process.on.args[0][0]).to.equal('uncaughtException');
    });

    describe('when the process.on callback is called', function() {
      it('should call executeTestCase.emit 4 times', function() {
        let error = new Error('An error occurred');
        process.on.callsArgWith(1, error);

        executeTestCase.configure(testPath);

        expect(executeTestCase.emit.callCount).to.equal(4);
      });

      it('should call process.on with the event \'executeTestCase.exceptionCaught\' and ' +
          'the passed in error', function() {
        let error = new Error('An error occurred');
        process.on.callsArgWith(1, error);

        executeTestCase.configure(testPath);

        expect(executeTestCase.emit.args[2]).to.deep.equal([
          'executeTestCase.exceptionCaught',
          error,
        ]);
      });

      it('should set the process.exitCode to the number 1', function() {
        let error = new Error('An error occurred');
        process.on.callsArgWith(1, error);

        executeTestCase.configure(testPath);

        expect(process.exitCode).to.equal(1);
      });
    });

    it('should set global.By to webdriver.By', function() {
      executeTestCase.configure(testPath);

      expect(global.By).to.deep.equal(webdriver.By);
    });

    it('should set global.until to webdriver.until', function() {
      executeTestCase.configure(testPath);

      expect(global.until).to.deep.equal(webdriver.until);
    });

    it('should call executeTestCase.emit 3 times', function() {
      executeTestCase.configure(testPath);

      expect(executeTestCase.emit.callCount).to.equal(3);
    });

    it('should call configHandler.get once with \'componentPath\'', function() {
      executeTestCase.configure(testPath);

      expect(configHandler.get.args).to.deep.equal([['componentPath']]);
    });

    it('should call executeTestCase.emit with the event \'componentHandler.configure\' ' +
            'and configs componentPath as parmeters', function() {
      configHandler.get.returns('/my/components');

      executeTestCase.configure(testPath);

      expect(executeTestCase.emit.args[0]).to.deep.equal([
        'componentHandler.configure',
        '/my/components',
      ]);
    });

    it('should call executeTestCase.emit with the event \'executeTestCase.setupDriver\'', function() {
      executeTestCase.configure(testPath);

      expect(executeTestCase.emit.args[1]).to.deep.equal([
        'executeTestCase.setupDriver',
      ]);
    });

    it('should call executeTestCase.emit with the event \'executeTestCase.configured\'' +
            'and the required testCase', function() {
      executeTestCase.configure(testPath);

      expect(executeTestCase.emit.args[2]).to.deep.equal([
        'executeTestCase.configured',
        'testCase',
      ]);
    });
  });
});
