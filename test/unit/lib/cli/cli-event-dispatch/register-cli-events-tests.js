'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/cli/cli-event-dispatch/register-cli-events.js', function() {
  let before;
  let after;
  let registerCliEvents;
  let cliEventDispatch;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/cli/cli-event-dispatch/register-cli-events.js');

    before = {
      runScripts: sinon.stub(),
    };

    after = sinon.stub();

    cliEventDispatch = {
      on: sinon.stub(),
      emit: sinon.stub(),
    };

    mockery.registerMock('../orchestration/before.js', before);
    mockery.registerMock('../orchestration/after.js', after);

    registerCliEvents =
      require('../../../../../lib/cli/cli-event-dispatch/register-cli-events.js');
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should call cliEventDispatch.on four times', function() {
    registerCliEvents(cliEventDispatch);

    expect(cliEventDispatch.on.callCount).to.equal(4);
  });

  it('should on first call of cliEventDispatch.on call with the first param ' +
    'as \'run.configuredSkipOrchestration\'', function() {
    registerCliEvents(cliEventDispatch);

    expect(cliEventDispatch.on.args[0][0]).to.equal('run.configuredSkipOrchestration');
  });

  it('should on first call of cliEventDispatch.on call with the second param as a function', function() {
    registerCliEvents(cliEventDispatch);

    expect(cliEventDispatch.on.args[0][1]).to.be.a('function');
  });

  describe('when the first call of cliEventDispatch.on callback is called', function() {
    it('should call cliEventDispath.emit with the params \'cli.configured\' ' +
      'and the configureInfo', function() {
      cliEventDispatch.on.onCall(0).callsArgWith(1, {some: 'info'});

      registerCliEvents(cliEventDispatch);

      expect(cliEventDispatch.emit.args).to.deep.equal([[
        'cli.configured', {some: 'info'},
      ]]);
    });
  });

  it('should on the second call of cliEventDispatch.on call with the params as ' +
    '\'cliEventDispatch.configuredRunOrchestration\' and before.runScripts', function() {
    registerCliEvents(cliEventDispatch);

    expect(cliEventDispatch.on.args[1]).to.deep.equal(
      [
        'run.configuredRunOrchestration',
        before.runScripts,
      ]
    );
  });

  it('should on the third call of cliEventDispatch.on call with the first param ' +
    'as \'before.finished\'', function() {
    registerCliEvents(cliEventDispatch);

    expect(cliEventDispatch.on.args[2][0]).to.equal('before.finished');
  });

  it('should on the third call of cliEventDispatch.on call with the second ' +
    'param as a function', function() {
    registerCliEvents(cliEventDispatch);

    expect(cliEventDispatch.on.args[2][1]).to.be.a('function');
  });

  describe('when the third call of cliEventDispatch.on callback is called', function() {
    it('should call cliEventDispath.emit with the first param \'cli.configured\' '
      + 'and the second param as the configureInfo', function() {
        cliEventDispatch.on.onCall(2).callsArgWith(1, {some: 'info'});

      registerCliEvents(cliEventDispatch);

      expect(cliEventDispatch.emit.args).to.deep.equal([[
        'cli.configured', {some: 'info'},
      ]]);
    });
  });

  it('should on the fourth call of cliEventDispatch.on call with the first ' +
    'param as \'cli.commandFinished\'', function() {
    registerCliEvents(cliEventDispatch);

    expect(cliEventDispatch.on.args[3][0]).to.equal('cli.commandFinished');
  });

  it('should on the fourth call of cliEventDispatch.on call with the second ' +
    'param as a function', function() {
    registerCliEvents(cliEventDispatch);

    expect(cliEventDispatch.on.args[3][1]).to.be.a('function');
  });

  describe('when the fourth call of cliEventDispatch.on callback is called', function() {
    it('should call after once with no params', function() {
      cliEventDispatch.on.onCall(3).callsArg(1);

      registerCliEvents(cliEventDispatch);

      expect(after.args).to.deep.equal([[]]);
    });
  });
});
