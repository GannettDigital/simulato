'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/cli/cli-event-dispatch/register-cli-events.js', function() {
  let generate;
  let run;
  let before;
  let after;
  let registerCliEvents;
  let cliEventDispatch;
  let callback;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../../lib/cli/cli-event-dispatch/register-cli-events.js');

    generate = {
      on: sinon.stub(),
    };

    run = {
      on: sinon.stub(),
    };

    before = {
      on: sinon.stub(),
      runScripts: sinon.stub(),
    };

    after = sinon.stub();

    cliEventDispatch = {
      on: sinon.stub(),
      emit: sinon.stub(),
    };

    callback = sinon.stub();

    mockery.registerMock('../commands/generate.js', generate);
    mockery.registerMock('../commands/run.js', run);
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

  it('should call generate.on twice', function() {
    registerCliEvents(cliEventDispatch);

    expect(generate.on.callCount).to.equal(2);
  });

  it('should on first call of generate.on the first param is \'generate.loadComponents\'', function() {
    registerCliEvents(cliEventDispatch);

    expect(generate.on.args[0][0]).to.equal('generate.loadComponents');
  });

  it('should on first call of generate.on the second param is a callback function', function() {
    registerCliEvents(cliEventDispatch);

    expect(generate.on.args[0][1]).to.be.a('function');
  });

  describe('when the first call of generate.on callback is called', function() {
    it('should call cliEventDispath.emit with the first param \'cli.loadComponents\' '
    + 'and the second param as the returned path', function() {
      generate.on.onCall(0).callsArgWith(1, 'aPath');

      registerCliEvents(cliEventDispatch);

      expect(cliEventDispatch.emit.args).to.deep.equal([[
        'cli.loadComponents', 'aPath',
      ]]);
    });
  });

  it('should on second call of generate.on the first param is \'generate.configured\'', function() {
    registerCliEvents(cliEventDispatch);

    expect(generate.on.args[1][0]).to.equal('generate.configured');
  });

  it('should on second call of generate.on the second param is a callback function', function() {
    registerCliEvents(cliEventDispatch);

    expect(generate.on.args[1][1]).to.be.a('function');
  });

  describe('when the second call of generate.on callback is called', function() {
    it('should call cliEventDispath.emit with \'cli.generateConfigured\'', function() {
      generate.on.onCall(1).callsArgWith(1);

      registerCliEvents(cliEventDispatch);

      expect(cliEventDispatch.emit.args).to.deep.equal([[
        'cli.generateConfigured',
      ]]);
    });
  });

  it('should call run.on four times', function() {
    registerCliEvents(cliEventDispatch);

    expect(run.on.callCount).to.equal(4);
  });

  it('should on first call of run.on the first param is \'run.findFiles\'', function() {
    registerCliEvents(cliEventDispatch);

    expect(run.on.args[0][0]).to.equal('run.findFiles');
  });

  it('should on first call of run.on the second param is a callback function', function() {
    registerCliEvents(cliEventDispatch);

    expect(run.on.args[0][1]).to.be.a('function');
  });

  describe('when the first call of run.on callback is called', function() {
    it('should call cliEventDispath.emit with the first param \'cli.findFiles\' '
    + 'and the second param as the returned path and the callback as third', function() {
      run.on.onCall(0).callsArgWith(1, ['path1', 'path2'], callback);

      registerCliEvents(cliEventDispatch);

      expect(cliEventDispatch.emit.args).to.deep.equal([[
        'cli.findFiles', ['path1', 'path2'], callback,
      ]]);
    });
  });

  it('should on second call of run.on the first param is \'run.testCasesReadyToValidate\'', function() {
    registerCliEvents(cliEventDispatch);

    expect(run.on.args[1][0]).to.equal('run.testCasesReadyToValidate');
  });

  it('should on second call of run.on the second param is a callback function', function() {
    registerCliEvents(cliEventDispatch);

    expect(run.on.args[1][1]).to.be.a('function');
  });

  describe('when the second call of run.on callback is called', function() {
    it('should call cliEventDispath.emit with the params \'cli.testCasesReadyToValidate\' '
    + 'the returned files, and the callback function', function() {
      run.on.onCall(1).callsArgWith(1, ['file1', 'file2'], callback);

      registerCliEvents(cliEventDispatch);

      expect(cliEventDispatch.emit.args).to.deep.equal([[
        'cli.testCasesReadyToValidate', ['file1', 'file2'], callback,
      ]]);
    });
  });

  it('should on thid call of run.on the first param is \'run.configuredSkipOrchestration\'', function() {
    registerCliEvents(cliEventDispatch);

    expect(run.on.args[2][0]).to.equal('run.configuredSkipOrchestration');
  });

  it('should on thid call of run.on the second param is a callback function', function() {
    registerCliEvents(cliEventDispatch);

    expect(run.on.args[2][1]).to.be.a('function');
  });

  describe('when the third call of run.on callback is called', function() {
    it('should call cliEventDispath.emit with the params \'cli.configured\' '
    + 'and the returned info', function() {
      run.on.onCall(2).callsArgWith(1, {some: 'info'});

      registerCliEvents(cliEventDispatch);

      expect(cliEventDispatch.emit.args).to.deep.equal([[
        'cli.configured', {some: 'info'},
      ]]);
    });
  });

  it('on the fourth call of run.on the params are \'run.configuredRunOrchestration\' '
  + 'and before.runScripts', function() {
    registerCliEvents(cliEventDispatch);

    expect(run.on.args[3]).to.deep.equal(['run.configuredRunOrchestration', before.runScripts]);
  });

  it('should call before.on once', function() {
    registerCliEvents(cliEventDispatch);

    expect(before.on.callCount).to.equal(1);
  });

  it('should call before.on with the first param as \'before.finished\'', function() {
    registerCliEvents(cliEventDispatch);

    expect(before.on.args[0][0]).to.equal('before.finished');
  });

  it('should call before.on with the second param as a callback function', function() {
    registerCliEvents(cliEventDispatch);

    expect(before.on.args[0][1]).to.be.a('function');
  });

  describe('when the before.on callback is called', function() {
    it('should call cliEventDispath.emit with the first param \'cli.configured\' '
    + 'and the second param as the returned info', function() {
      before.on.onCall(0).callsArgWith(1, {some: 'info'});

      registerCliEvents(cliEventDispatch);

      expect(cliEventDispatch.emit.args).to.deep.equal([[
        'cli.configured', {some: 'info'},
      ]]);
    });
  });

  it('should call cliEventDispatch.on once', function() {
    registerCliEvents(cliEventDispatch);

    expect(cliEventDispatch.on.callCount).to.equal(1);
  });

  it('should call cliEventDispatch.on with the first param as \'cli.commandFinished\'', function() {
    registerCliEvents(cliEventDispatch);

    expect(cliEventDispatch.on.args[0][0]).to.equal('cli.commandFinished');
  });

  it('should call cliEventDispatch.on with the second param as a callback function', function() {
    registerCliEvents(cliEventDispatch);

    expect(cliEventDispatch.on.args[0][1]).to.be.a('function');
  });

  describe('when the cliEventDispatch.on callback is called', function() {
    it('should call after once with no params', function() {
      cliEventDispatch.on.onCall(0).callsArg(1);

      registerCliEvents(cliEventDispatch);

      expect(after.args).to.deep.equal([[]]);
    });
  });
});
