'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/cli/orchestration/after.js', function() {
  let after;
  let Saucelabs;
  let concurrent;
  let configHandler;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/cli/orchestration/after.js');

    Saucelabs = {
        close: sinon.stub(),
    };

    concurrent = sinon.stub();
    configHandler = {
      get: sinon.stub(),
    };

    sinon.stub(process, 'exit');
    sinon.spy(console, 'log');

    mockery.registerMock('palinode', {concurrent});
    mockery.registerMock('../../util/saucelabs.js', Saucelabs);
    mockery.registerMock('../../util/config-handler.js', configHandler);

    after = require('../../../../../lib/cli/orchestration/after.js');
  });

  afterEach(function() {
    process.exit.restore();
    console.log.restore();
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should call configHandler.get once with \'saucelabs\'', function() {
    after();

    expect(configHandler.get.args).to.deep.equal([['saucelabs']]);
  });

  describe('when config.get(\'saucelabs\') is truthy', function() {
    it('should call concurrent once', function() {
      configHandler.get.returns(true);

      after();

      expect(concurrent.callCount).to.equal(1);
    });

    it('should call concurrent with an array containing Saucelabs.close as the first argument', function() {
      configHandler.get.returns(true);

      after();

      expect(concurrent.args[0][0]).to.deep.equal([Saucelabs.close]);
    });

    it('should call concurrent with a callback function as the second argument', function() {
      configHandler.get.returns(true);

      after();

      expect(concurrent.args[0][1]).to.deep.be.a('function');
    });

    describe('when the callback for concurrent is called', function() {
      describe('if an error was returned', function() {
        it('should call console.log the error returned', function() {
          let error = new Error('error from concurrent');
          concurrent.callsArgWith(1, error);
          configHandler.get.returns(true);

          after();

          expect(console.log.args).to.deep.equal([[error]]);
        });
        it('should call process.exit with error code 1', function() {
          let error = new Error('error from concurrent');
          concurrent.callsArgWith(1, error);
          configHandler.get.returns(true);

          after();

          expect(process.exit.args).to.deep.equal([[1]]);
        });
      });

      describe('if no error is returned', function() {
        it('should not call process.exit', function() {
          concurrent.callsArgWith(1, null);
          configHandler.get.returns(true);

          after();

          expect(process.exit.callCount).to.equal(0);
        });
      });
    });
  });

  it('should call concurrent once', function() {
    delete process.env.SAUCE_LABS;

    after();

    expect(concurrent.callCount).to.equal(1);
  });

  it('should call concurrent with an empty array as the first argument', function() {
    delete process.env.SAUCE_LABS;

    after();

    expect(concurrent.args[0][0]).to.deep.equal([]);
  });

  it('should call concurrent with a callback function as the second argument', function() {
    delete process.env.SAUCE_LABS;

    after();

    expect(concurrent.args[0][1]).to.deep.be.a('function');
  });

  describe('when the callback for concurrent is called', function() {
    describe('if an error was returned', function() {
      it('should call console.log the error returned', function() {
        let error = new Error('error from concurrent');
        concurrent.callsArgWith(1, error);

        after();

        expect(console.log.args).to.deep.equal([[error]]);
      });
      it('should call process.exit with error code 1', function() {
        let error = new Error('error from concurrent');
        concurrent.callsArgWith(1, error);

        after();

        expect(process.exit.args).to.deep.equal([[1]]);
      });
    });

    describe('if no error is returned', function() {
      it('should not call process.exit', function() {
        concurrent.callsArgWith(1, null);

        after();

        expect(process.exit.callCount).to.equal(0);
      });
    });
  });
});
