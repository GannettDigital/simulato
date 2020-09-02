'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/cli/orchestration/before.js', function() {
  describe('on file being required', function() {
    let before;
    let Emitter;
    let concurrent;
    let cliEventDispatch;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/cli/orchestration/before.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      cliEventDispatch = sinon.stub();

      concurrent = sinon.stub();

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('palinode', {concurrent});
      mockery.registerMock('../../util/saucelabs.js', {});
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('../cli-event-dispatch/cli-event-dispatch.js', cliEventDispatch);
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call Emitter.mixIn once with before and the cliEventDispatch', function() {
      before = require('../../../../../lib/cli/orchestration/before.js');

      expect(Emitter.mixIn.args).to.deep.equal([
        [
          before,
          cliEventDispatch,
        ],
      ]);
    });

    it(`should call before.on once passing in the event 'before.readyToRunFunctions` +
            ` and the function before._runFunctions`, function() {
      before = require('../../../../../lib/cli/orchestration/before.js');

      expect(before.on.args).to.deep.equal([[
        'before.readyToRunFunctions',
        before._runFunctions,
      ]]);
    });
  });

  describe('runScripts', function() {
    let before;
    let Emitter;
    let Saucelabs;
    let functionToRequire;
    let concurrent;
    let configHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/cli/orchestration/before.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      Saucelabs = {
        connect: sinon.stub(),
      };

      configHandler = {
        get: sinon.stub(),
      };

      concurrent = sinon.stub();
      functionToRequire = sinon.stub();
      mockery.registerMock('path/to/script', functionToRequire);

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('palinode', {concurrent});
      mockery.registerMock('../../util/saucelabs.js', Saucelabs);
      mockery.registerMock('../../util/config/config-handler.js', configHandler);
      mockery.registerMock('../cli-event-dispatch/cli-event-dispatch.js', {});

      before = require('../../../../../lib/cli/orchestration/before.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call configHanlder.get twice', function() {
      before.runScripts({someConfig: 'aConfigValue'});

      expect(configHandler.get.callCount).to.equal(2);
    });

    it('should call configHanlder.get with \'before\'', function() {
      before.runScripts({someConfig: 'aConfigValue'});

      expect(configHandler.get.args[0]).to.deep.equal(['before']);
    });

    describe('when configHandler.get(\'before\') is truthy', function() {
      it('should call configHanlder.get thrice', function() {
        configHandler.get.onCall(0).returns(true);
        configHandler.get.onCall(1).returns('path/to/script');

        before.runScripts({someConfig: 'aConfigValue'});

        expect(configHandler.get.callCount).to.equal(3);
      });

      it('should call configHanlder.get with \'before\'', function() {
        configHandler.get.onCall(0).returns(true);
        configHandler.get.onCall(1).returns('path/to/script');

        before.runScripts({someConfig: 'aConfigValue'});

        expect(configHandler.get.args[1]).to.deep.equal(['before']);
      });

      it(`should call before.emit once with the event 'before.readyToRunFunctions' ` +
            `an array containing the required sciprt, and the passed on configureInfo`, function() {
        configHandler.get.onCall(0).returns(true);
        configHandler.get.onCall(1).returns('path/to/script');

        before.runScripts({someConfig: 'aConfigValue'});

        expect(before.emit.args).to.deep.equal([
          [
            'before.readyToRunFunctions',
            [functionToRequire],
            {someConfig: 'aConfigValue'},
          ],
        ]);
      });
    });

    describe('when configHandler.get(\'before\') is falsey', function() {
      it(`should call before.emit once with the event 'before.readyToRunFunctions' ` +
                `an empty array, and the passed on configureInfo`, function() {
        before.runScripts({someConfig: 'aConfigValue'});

        expect(before.emit.args).to.deep.equal([
          [
            'before.readyToRunFunctions',
            [],
            {someConfig: 'aConfigValue'},
          ],
        ]);
      });
    });

    it('should call configHanlder.get with \'driver.saucelabs\'', function() {
      before.runScripts({someConfig: 'aConfigValue'});

      expect(configHandler.get.args[1]).to.deep.equal(['driver.saucelabs']);
    });

    describe('when configHandler.get(\'driver.saucelabs\') is truthy', function() {
      it('should call Saucelabs.connect once', function() {
        configHandler.get.onCall(1).returns(true);

        before.runScripts({someConfig: 'aConfigValue'});

        expect(Saucelabs.connect.callCount).to.equal(1);
      });

      it('should call Saucelabs.connect passing in a callback function', function() {
        configHandler.get.onCall(1).returns(true);

        before.runScripts({someConfig: 'aConfigValue'});

        expect(Saucelabs.connect.args[0][0]).to.be.a('function');
      });

      describe('when the callback function is called', function() {
        describe('if an error was returned', function() {
          it('should throw the error', function() {
            configHandler.get.onCall(1).returns(true);
            Saucelabs.connect.callsArgWith(0, new Error('Threw an error'));
            let errMessage;

            try {
              before.runScripts({someConfig: 'aConfigValue'});
            } catch (error) {
              errMessage = error.message;
            }

            expect(errMessage).to.equal('Threw an error');
          });
        });
        describe('if no error was returned', function() {
          it(`should call before.emit once with the event 'before.readyToRunFunctions' ` +
                        `an empty array, and the passed on configureInfo`, function() {
            configHandler.get.onCall(1).returns(true);
            Saucelabs.connect.callsArgWith(0, null);

            before.runScripts({someConfig: 'aConfigValue'});

            expect(before.emit.args).to.deep.equal([
              [
                'before.readyToRunFunctions',
                [],
                {someConfig: 'aConfigValue'},
              ],
            ]);
          });
        });
      });
    });

    describe('when both configHandler.get(\'before\') and configHandler.get(\'saucelabs\') are truthy', function() {
      it('should call Saucelabs.connect once', function() {
        configHandler.get.onCall(0).returns(true);
        configHandler.get.onCall(1).returns('path/to/script');
        configHandler.get.onCall(2).returns(true);

        before.runScripts({someConfig: 'aConfigValue'});

        expect(Saucelabs.connect.callCount).to.equal(1);
      });

      it('should call Saucelabs.connect passing in a callback function', function() {
        configHandler.get.onCall(0).returns(true);
        configHandler.get.onCall(1).returns('path/to/script');
        configHandler.get.onCall(2).returns(true);

        before.runScripts({someConfig: 'aConfigValue'});

        expect(Saucelabs.connect.args[0][0]).to.be.a('function');
      });

      describe('when the callback function is called', function() {
        describe('if an error was returned', function() {
          it('should throw the error', function() {
            configHandler.get.onCall(0).returns(true);
            configHandler.get.onCall(1).returns('path/to/script');
            configHandler.get.onCall(2).returns(true);
            Saucelabs.connect.callsArgWith(0, new Error('Threw an error'));
            let errMessage;

            try {
              before.runScripts({someConfig: 'aConfigValue'});
            } catch (error) {
              errMessage = error.message;
            }

            expect(errMessage).to.equal('Threw an error');
          });
        });
        describe('if no error was returned', function() {
          it(`should call before.emit once with the event 'before.readyToRunFunctions' ` +
                        `an array containing the required sciprt, and the passed on configureInfo`, function() {
            Saucelabs.connect.callsArgWith(0, null);
            configHandler.get.onCall(0).returns(true);
            configHandler.get.onCall(1).returns('path/to/script');
            configHandler.get.onCall(2).returns(true);

            before.runScripts({someConfig: 'aConfigValue'});

            expect(before.emit.args).to.deep.equal([
              [
                'before.readyToRunFunctions',
                [functionToRequire],
                {someConfig: 'aConfigValue'},
              ],
            ]);
          });
        });
      });
    });
  });

  describe('_runFunctions', function() {
    let before;
    let Emitter;
    let Saucelabs;
    let functionToRequire;
    let concurrent;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../../lib/cli/orchestration/before.js');


      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      Saucelabs = {
        connect: sinon.stub(),
      };

      concurrent = sinon.stub();
      process.env.SAUCE_LABS = 'true';
      process.env.BEFORE_SCRIPT = 'path/to/script';
      functionToRequire = sinon.stub();
      mockery.registerMock('path/to/script', functionToRequire);

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('palinode', {concurrent});
      mockery.registerMock('../../util/saucelabs.js', Saucelabs);
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('../cli-event-dispatch/cli-event-dispatch.js', {});

      before = require('../../../../../lib/cli/orchestration/before.js');
    });

    afterEach(function() {
      delete process.env.BEFORE_SCRIPT;
      delete process.env.SAUCE_LABS;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call concurrent once', function() {
      before._runFunctions([functionToRequire], {someConfig: 'aConfigValue'});

      expect(concurrent.callCount).to.equal(1);
    });

    it('should call concurrent with the passed in functions as the first param', function() {
      before._runFunctions([functionToRequire], {someConfig: 'aConfigValue'});

      expect(concurrent.args[0][0]).to.deep.equal([functionToRequire]);
    });

    it('should call concurrent with a callback as the second param', function() {
      before._runFunctions([functionToRequire], {someConfig: 'aConfigValue'});

      expect(concurrent.args[0][1]).to.deep.be.a('function');
    });

    describe('when the callback function is called', function() {
      describe('if an error is returned', function() {
        it('should throw the error', function() {
          concurrent.callsArgWith(1, new Error('Threw an error'));
          let errMessage;

          try {
            before._runFunctions([functionToRequire], {someConfig: 'aConfigValue'});
          } catch (error) {
            errMessage = error.message;
          }

          expect(errMessage).to.equal('Threw an error');
        });
      });

      describe('if an error is NOT returned', function() {
        it(`should call before.emit once with the event 'before.finished' ` +
                    `and the passed on configureInfo`, function() {
          concurrent.callsArgWith(1, null);

          before._runFunctions([], {someConfig: 'aConfigValue'});

          expect(before.emit.args).to.deep.equal([
            [
              'before.finished',
              {someConfig: 'aConfigValue'},
            ],
          ]);
        });
      });
    });
  });
});
