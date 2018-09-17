'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('index.js', function() {
  let tempProcessArgv;
  let SimulatoError;
  let program;
  let packageJSON;
  let configHandler;
  let initializeEventDispatchers;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../index.js');

    SimulatoError = 'mySimulatoErrors';
    program = {};
    program.version = sinon.stub();
    program.command = sinon.stub().returns(program);
    program.option = sinon.stub().returns(program);
    program.action = sinon.stub();
    program.parse = sinon.stub();
    packageJSON = {
      version: '0.1.2',
    };
    configHandler = {
      createConfig: sinon.stub(),
    };
    initializeEventDispatchers = sinon.stub();

    tempProcessArgv = process.argv;
    process.argv = ['argOne', 'argTwo'];

    mockery.registerMock('./lib/errors', SimulatoError);
    mockery.registerMock('commander', program);
    mockery.registerMock('./package.json', packageJSON);
    mockery.registerMock('./lib/util/config-handler.js', configHandler);
    mockery.registerMock('./lib/util/initialize-event-dispatchers', initializeEventDispatchers);
  });

  afterEach(function() {
    delete global.SimulatoError;
    process.argv = tempProcessArgv;
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should set global.SimulatoError to the result of the require to \'./lib/errors\'', function() {
    require('../../index.js');

    expect(global.SimulatoError).to.equal('mySimulatoErrors');
  });

  it('should call initializeEventDispatchers once with no arguments', function() {
    require('../../index.js');

    expect(initializeEventDispatchers.args).to.deep.equal([[]]);
  });

  it('should call program.version once with packageJSON.version', function() {
    require('../../index.js');

    expect(program.version.args).to.deep.equal([['0.1.2']]);
  });

  it('should program.command twice', function() {
    require('../../index.js');

    expect(program.command.callCount).to.equal(2);
  });

  it('should call program.option 20 times', function() {
    require('../../index.js');

    expect(program.option.callCount).to.equal(19);
  });

  it('should call program.action twice', function() {
    require('../../index.js');

    expect(program.action.callCount).to.equal(2);
  });

  it('should call program.command with the string \'run\'', function() {
    require('../../index.js');

    expect(program.command.args[0]).to.deep.equal(['run']);
  });

  it('should call program.option with the strings \'-T, --testPath <testPath>\' ' +
        'and \'The path to the tests\'', function() {
    require('../../index.js');

    expect(program.option.args[0]).to.deep.equal(['-T, --testPath <testPath>', 'The path to the tests']);
  });

  it('should call program.option with the strings \'-c, --componentPath <componentPath>\' ' +
        'and \'The path to the components\'', function() {
    require('../../index.js');

    expect(program.option.args[1]).to.deep.equal([
      '-c, --componentPath <componentPath>',
      'The path to the components',
    ]);
  });

  it('should call program.option with the strings \'-r, --reporter [reporter]\' ' +
        'and \'Specify a reporter to use\'', function() {
    require('../../index.js');

    expect(program.option.args[2]).to.deep.equal(['-r, --reporter [reporter]', 'Specify a reporter to use']);
  });

  it('should call program.option with the strings \'-s, --saucelabs\' ' +
        'and \'Run tests in the saucelabs\'', function() {
    require('../../index.js');

    expect(program.option.args[3]).to.deep.equal(['-s, --saucelabs', 'Run tests in the saucelabs']);
  });

  it('should call program.option with the strings \'-p, --parallelism <parallelism>\' ' +
        'and \'Amount of tests to run in parallel\' and Number.parseInt', function() {
    require('../../index.js');

    expect(program.option.args[4]).to.deep.equal([
      '-p, --parallelism <parallelism>',
      'Amount of tests to run in parallel',
      Number.parseInt,
    ]);
  });

  it('should call program.option with the strings \'-R, --reportPath [path]\' ' +
        'and \'The path to write the test result report to\'', function() {
    require('../../index.js');

    expect(program.option.args[5]).to.deep.equal([
      '-R, --reportPath [path]',
      'The path to write the test result report to',
    ]);
  });

  it('should call program.option with the strings \'-J, --reportFormat <type>\' ' +
        'and \'The format in which to write the test reports in\'', function() {
    require('../../index.js');

    expect(program.option.args[6]).to.deep.equal([
      '-J, --reportFormat <type>',
      'The format in which to write the test reports in',
    ]);
  });

  it('should call program.option with the strings \'-b, --before <path>\' ' +
        'and \'The path to the before script\'', function() {
    require('../../index.js');

    expect(program.option.args[7]).to.deep.equal(['-b, --before <path>', 'The path to the before script']);
  });

  it('should call program.option with the strings \'-f, --configFile <path>\' ' +
        'and \'The path to the config file\'', function() {
    require('../../index.js');

    expect(program.option.args[8]).to.deep.equal(['-f, --configFile <path>', 'The path to the config file']);
  });

  it('should call program.option with the strings \'-d, --testDelay <milliseconds>\' ' +
        'and \'The time in milliseconds to stagger test start times\'', function() {
    require('../../index.js');

    expect(program.option.args[9]).to.deep.equal([
      '-d, --testDelay <milliseconds>',
      'The time in milliseconds to stagger test start times',
    ]);
  });

  it('should call program.option with the strings \'-F, --rerunFailedTests <int>\' ' +
        'and \'The number of times to rerun failed tests\'', function() {
    require('../../index.js');

    expect(program.option.args[10]).to.deep.equal([
      '-F, --rerunFailedTests <int>',
      'The number of times to rerun failed tests',
    ]);
  });

  it('should call program.option with the strings \'-D, --debug\' ' +
        'and \'A flag to turn on debugging when spawning child processes\'', function() {
    require('../../index.js');

    expect(program.option.args[11]).to.deep.equal([
      '-D, --debug',
      'A flag to turn on debugging when spawning child processes',
    ]);
  });

  it('should call program.option with the strings \'-P, --debugPort <int>\' ' +
        'and \'Starting port for debugging when spawning child processes\'', function() {
    require('../../index.js');

    expect(program.option.args[12]).to.deep.equal([
      '-P, --debugPort <int>',
      'Starting port for debugging when spawning child processes',
    ]);
  });

  it('should call program.action with configHandler.createConfig on the first call', function() {
    require('../../index.js');

    expect(program.action.args[0]).to.deep.equal([configHandler.createConfig]);
  });

  it('should call program.command with the string \'generate\'', function() {
    require('../../index.js');

    expect(program.command.args[1]).to.deep.equal(['generate']);
  });

  it('should call program.option with the strings \'-c, --componentPath <componentPath>\' ' +
        'and \'The path to the components\'', function() {
    require('../../index.js');

    expect(program.option.args[13]).to.deep.equal([
      '-c, --componentPath <componentPath>',
      'The path to the components',
    ]);
  });

  it('should call program.option with the strings \'-o, --outputPath <path>\' ' +
        'and \'The path to write the generated test cases to\'', function() {
    require('../../index.js');

    expect(program.option.args[14]).to.deep.equal([
      '-o, --outputPath <path>',
      'The path to write the generated test cases to',
    ]);
  });

  it('should call program.option with the strings \'-a, --actionToCover <action>\' ' +
        'and \'The action to generate a test for. Specfied as component.ACTION_NAME\'', function() {
    require('../../index.js');

    expect(program.option.args[15]).to.deep.equal([
      '-a, --actionToCover <action>',
      'The action to generate a test for. Specfied as component.ACTION_NAME',
    ]);
  });

  it('should call program.option with the strings \'-A, --plannerAlgorithm <algorithm>\' ' +
        'and \'The algorithm for the planner to use\'', function() {
    require('../../index.js');

    expect(program.option.args[16]).to.deep.equal([
      '-A, --plannerAlgorithm <algorithm>',
      'The algorithm for the planner to use',
    ]);
  });

  it('should call program.option with the strings \'-f, --configFile <path>\' ' +
        'and \'The path to the config file\'', function() {
    require('../../index.js');

    expect(program.option.args[17]).to.deep.equal(['-f, --configFile <path>', 'The path to the config file']);
  });

  it('should call program.option with the strings \'-D, --debug\' ' +
        'and \'A flag to turn on debugging when generating tests\'', function() {
    require('../../index.js');

    expect(program.option.args[18]).to.deep.equal([
      '-D, --debug',
      'A flag to turn on debugging when generating tests',
    ]);
  });

  it('should call program.action with configHandler.createConfig on the second call', function() {
    require('../../index.js');

    expect(program.action.args[1]).to.deep.equal([configHandler.createConfig]);
  });

  it('should call program.parse once with process.argv', function() {
    require('../../index.js');

    expect(program.parse.args).to.deep.equal([
      [['argOne', 'argTwo']],
    ]);
  });
});
