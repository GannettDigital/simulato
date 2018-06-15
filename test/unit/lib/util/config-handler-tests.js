'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/config-handler.js', function() {
  describe('on file being required', function() {
    let configHandler;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/config-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('lodash', {});
      mockery.registerMock('path', {});
      mockery.registerMock('./defaults.js', {});
      mockery.registerMock('uuid/v4', {});
      mockery.registerMock('events', {EventEmitter});
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should set the object prototype of configHandler to a new EventEmitter', function() {
      configHandler = require('../../../../lib/util/config-handler.js');

      expect(Object.getPrototypeOf(configHandler)).to.deep.equal(EventEmitterInstance);
    });
  });

  describe('createConfig', function() {
    let _;
    let defaults;
    let configHandler;
    let EventEmitter;
    let EventEmitterInstance;
    let uuidv4;
    let options;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/config-handler.js');

      _ = {
        merge: sinon.stub(),
        get: sinon.stub(),
      };

      defaults = {
        defaultKey: 'defaultValue',
      };

      options = {
        opts: sinon.stub().returns({cliOption: 'a cli option'}),
        name: sinon.stub().returns('run'),
      };

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      uuidv4 = sinon.stub();

      mockery.registerMock('lodash', _);
      mockery.registerMock('path', {});
      mockery.registerMock('./defaults.js', defaults);
      mockery.registerMock('uuid/v4', uuidv4);
      mockery.registerMock('events', {EventEmitter});

      configHandler = require('../../../../lib/util/config-handler.js');
      configHandler._getBaseConfig = sinon.stub();
      configHandler._resolvePaths = sinon.stub();
    });

    afterEach(function() {
      delete process.env.USING_PARENT_TEST_RUNNER;
      delete process.env.PARENT_CONFIG;
      delete process.env.TEST_PATH;
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if process.env.USING_PARENT_TEST_RUNNER is truthy', function() {
      it('should freeze the config making it immutable', function() {
        process.env.USING_PARENT_TEST_RUNNER = 'true';
        process.env.TEST_PATH = 'a/test/path';
        process.env.PARENT_CONFIG = JSON.stringify({
          key1: 'value1',
          key2: 'value2',
        });

        configHandler.createConfig(options);

        expect(configHandler._config).to.be.frozen;
      });

      it('set the config using process.env.PARENT_CONFIG, process.env.TEST_PATH', function() {
        process.env.USING_PARENT_TEST_RUNNER = 'true';
        process.env.TEST_PATH = 'a/test/path';
        process.env.PARENT_CONFIG = JSON.stringify({
          key1: 'value1',
          key2: 'value2',
        });

        configHandler.createConfig(options);

        expect(configHandler._config).to.deep.equal({
          key1: 'value1',
          key2: 'value2',
          testPath: 'a/test/path',
          testName: 'path',
        });
      });

      it('should call the passed in options.name once with no args', function() {
        process.env.USING_PARENT_TEST_RUNNER = 'true';
        process.env.TEST_PATH = 'a/test/path';
        process.env.PARENT_CONFIG = JSON.stringify({
          key1: 'value1',
          key2: 'value2',
        });

        configHandler.createConfig(options);

        expect(options.name.args).to.deep.equal([[]]);
      });

      it('should call configHandler.emit with \'configHandler.configCreated\' and '
        + 'the passed in options.name', function() {
        process.env.USING_PARENT_TEST_RUNNER = 'true';
        process.env.TEST_PATH = 'a/test/path';
        process.env.PARENT_CONFIG = JSON.stringify({
          key1: 'value1',
          key2: 'value2',
        });

        configHandler.createConfig(options);

        expect(configHandler.emit.args).to.deep.equal([[
          'configHandler.configCreated',
          'run',
        ]]);
      });
    });

    it('should call lodash merge passing in an empty object, and the required in defaults', function() {
      configHandler.createConfig(options);

      expect(_.merge.args).to.deep.equal([[{}, {defaultKey: 'defaultValue'}]]);
    });

    it('should call configHandler._getBaseConfig with the passed in cliOptions as the first param', function() {
      configHandler.createConfig(options);

      expect(configHandler._getBaseConfig.args[0][0]).to.deep.equal({cliOption: 'a cli option'});
    });

    it('should call configHandler._getBaseConfig with a function as the second param', function() {
      configHandler.createConfig(options);

      expect(configHandler._getBaseConfig.args[0][1]).to.deep.a('function');
    });

    it('should call the passed in cli.opts once with no params', function() {
      configHandler.createConfig(options);

      expect(options.opts.args).to.deep.equal([[]]);
    });

    it('should call configHandler._getBaseConfig once', function() {
      configHandler.createConfig(options);

      expect(configHandler._getBaseConfig.callCount).to.equal(1);
    });

    describe('when the callback for configHandler._getBaseConfig is called', function() {
      it('should call lodash merge passing in an current config, and returned configFile object', function() {
        configHandler._getBaseConfig.callsArgWith(1, {configFileKey: 'config file value'});

        configHandler.createConfig(options);

        expect(_.merge.args[1]).to.deep.equal([
          {},
          {configFileKey: 'config file value'},
        ]);
      });

      it('should call the passed in cli.opts twice', function() {
        configHandler._getBaseConfig.callsArgWith(1, {configFileKey: 'config file value'});

        configHandler.createConfig(options);

        expect(options.opts.args).to.deep.equal([[], []]);
      });

      it('should call lodash merge passing in an current config, and passed in cliOptions', function() {
        configHandler._getBaseConfig.callsArgWith(1, {});

        configHandler.createConfig(options);

        expect(_.merge.args[2]).to.deep.equal([
          {},
          {cliOption: 'a cli option'},
        ]);
      });

      it('should call lodash merge a total of 3 times', function() {
        configHandler._getBaseConfig.callsArgWith(1, {configFileKey: 'config file value'});

        configHandler.createConfig(options);

        expect(_.merge.callCount).to.equal(3);
      });

      it('should call configHandler._resolvePaths once with the current config as its params', function() {
        configHandler._getBaseConfig.callsArgWith(1, {});

        configHandler.createConfig(options);

        expect(configHandler._resolvePaths.args).to.deep.equal([[{}]]);
      });

      it('should freeze the config making it immutable', function() {
        configHandler._getBaseConfig.callsArgWith(1, {});

        configHandler.createConfig(options);

        expect(configHandler._config).to.be.frozen;
      });

      it('should call the passed in options.name once with no args', function() {
        configHandler._getBaseConfig.callsArgWith(1, {});

        configHandler.createConfig(options);

        expect(options.name.args).to.deep.equal([[]]);
      });

      it('should call configHandler.emit with \'configHandler.configCreated\' and '
        + 'the passed in options.name', function() {
        configHandler._getBaseConfig.callsArgWith(1, {});

        configHandler.createConfig(options);

        expect(configHandler.emit.args).to.deep.equal([[
          'configHandler.configCreated',
          'run',
        ]]);
      });
    });
  });

  describe('get', function() {
    let configHandler;
    let EventEmitter;
    let EventEmitterInstance;
    let _;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/config-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      _ = {
        get: sinon.stub().returns('value'),
      };

      mockery.registerMock('lodash', _);
      mockery.registerMock('path', {});
      mockery.registerMock('./defaults.js', {});
      mockery.registerMock('uuid/v4', {});
      mockery.registerMock('events', {EventEmitter});

      configHandler = require('../../../../lib/util/config-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call lodash get once, passing the config handlers current config, ' +
      'and the passed in property path', function() {
      configHandler.get('property.path');

      expect(_.get.args).to.deep.equal([[
        {},
        'property.path',
      ]]);
    });

    it('should return the value from the call to lodash get', function() {
      let result;

      result = configHandler.get('property.path');

      expect(result).to.equal('value');
    });
  });

  describe('get all', function() {
    let configHandler;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/config-handler.js');

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('lodash', {});
      mockery.registerMock('path', {});
      mockery.registerMock('./defaults.js', {});
      mockery.registerMock('uuid/v4', {});
      mockery.registerMock('events', {EventEmitter});

      configHandler = require('../../../../lib/util/config-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should return the configHandlers current config', function() {
      let result;
      configHandler._config = {key: 'value'};

      result = configHandler.getAll();

      expect(result).to.deep.equal({key: 'value'});
    });
  });

  describe('_getBaseConfig', function() {
    let callback;
    let path;
    let configHandler;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/config-handler.js');

      callback = sinon.spy();

      path = {
        normalize: sinon.stub(),
      };

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('lodash', {});
      mockery.registerMock('path', path);
      mockery.registerMock('./defaults.js', {});
      mockery.registerMock('uuid/v4', {});
      mockery.registerMock('events', {EventEmitter});

      configHandler = require('../../../../lib/util/config-handler.js');
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    describe('if the passed in cliOptions.configFile is truthy', function() {
      it('should call path.normalize once with process.cwd() and cliOptions.configFile', function() {
        let requirePath = `${process.cwd()}/path/to/config`;
        path.normalize.onCall(0).returns(requirePath);
        mockery.registerMock(requirePath, {key: 'required from cliOptions.configFile'});

        configHandler._getBaseConfig({configFile: 'path/to/config'}, callback);

        expect(path.normalize.args).to.deep.equal([[
          requirePath,
        ]]);
      });

      it('should call the passed in callback with the config returned from cliOptions.configFile', function() {
        let requirePath = `${process.cwd()}/path/to/config`;
        path.normalize.onCall(0).returns(requirePath);
        mockery.registerMock(requirePath, {key: 'required from cliOptions.configFile'});

        configHandler._getBaseConfig({configFile: 'path/to/config'}, callback);

        expect(callback.args).to.deep.equal([[
          {key: 'required from cliOptions.configFile'},
        ]]);
      });
    });

    describe('if the passed in cliOptions.configFile is falsey', function() {
      it('should call path.normalize once with process.cwd() and \'/config.js\'', function() {
        let requirePath = `${process.cwd()}/config.js`;
        path.normalize.onCall(0).returns(requirePath);
        mockery.registerMock(requirePath, {key: 'required from default path'});

        configHandler._getBaseConfig({}, callback);

        expect(path.normalize.args).to.deep.equal([[
          requirePath,
        ]]);
      });

      it('should call the passed in callback with the config returned from default path', function() {
        let requirePath = `${process.cwd()}/config.js`;
        path.normalize.onCall(0).returns(requirePath);
        mockery.registerMock(requirePath, {key: 'required from default path'});

        configHandler._getBaseConfig({}, callback);

        expect(callback.args).to.deep.equal([[
          {key: 'required from default path'},
        ]]);
      });

      describe('if requiring in the default path throws an error', function() {
        describe('if the error.code is \'MODULE_NOT_FOUND\'', function() {
          it('should call the passed in callback with an empty object', function() {
            let requirePath = `${process.cwd()}/config.js`;
            mockery.registerAllowable(requirePath);
            path.normalize.onCall(0).returns(requirePath);

            configHandler._getBaseConfig({}, callback);

            expect(callback.args).to.deep.equal([[
              {},
            ]]);
          });
        });

        describe('if the error.code is NOT \'MODULE_NOT_FOUND\'', function() {
          it('should throw the error from requiring default file path', function() {
            mockery.registerAllowable(1);
            path.normalize.onCall(0).returns(1);

            expect(configHandler._getBaseConfig.bind(null, {}, callback)).to.throw('path must be a string');
          });
        });
      });
    });
  });

  describe('_resolvePaths', function() {
    let path;
    let configHandler;
    let config;
    let EventEmitter;
    let EventEmitterInstance;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/config-handler.js');

      path = {
        resolve: sinon.stub(),
      };

      config = {
        componentPath: './componentPath',
        outputPath: './outputPath',
        reportPath: './reportPath',
        testPath: './testPath',
      };

      EventEmitter = sinon.stub();
      EventEmitterInstance = {
        emit: sinon.stub(),
        on: sinon.stub(),
      };
      EventEmitter.returns(EventEmitterInstance);

      mockery.registerMock('lodash', {});
      mockery.registerMock('path', path);
      mockery.registerMock('./defaults.js', {});
      mockery.registerMock('uuid/v4', {});
      mockery.registerMock('events', {EventEmitter});

      configHandler = require('../../../../lib/util/config-handler.js');
      configHandler._config = config;
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call path.resolve 4 times', function() {
      configHandler._resolvePaths(config);

      expect(path.resolve.callCount).to.equal(4);
    });

    it('should call path.resolve with config.componentPath', function() {
      configHandler._resolvePaths(config);

      expect(path.resolve.args[0]).to.deep.equal(['./componentPath']);
    });

    it('should set the passed in config.componentPath to the returned resolve value', function() {
      path.resolve.onCall(0).returns('resolved/componentPath');

      configHandler._resolvePaths(config);

      expect(config.componentPath).to.equal('resolved/componentPath');
    });

    it('should call path.resolve with config.outputPath', function() {
      configHandler._resolvePaths(config);

      expect(path.resolve.args[1]).to.deep.equal(['./outputPath']);
    });

    it('should set the passed in config.outputPath to the returned resolve value', function() {
      path.resolve.onCall(1).returns('resolved/outputPath');

      configHandler._resolvePaths(config);

      expect(config.outputPath).to.equal('resolved/outputPath');
    });

    it('should call path.resolve with config.reportPath', function() {
      configHandler._resolvePaths(config);

      expect(path.resolve.args[2]).to.deep.equal(['./reportPath']);
    });

    it('should set the passed in config.reportPath to the returned resolve value', function() {
      path.resolve.onCall(2).returns('resolved/reportPath');

      configHandler._resolvePaths(config);

      expect(config.reportPath).to.equal('resolved/reportPath');
    });

    it('should call path.resolve with config.testPath', function() {
      configHandler._resolvePaths(config);

      expect(path.resolve.args[3]).to.deep.equal(['./testPath']);
    });

    it('should set the passed in config.testPath to the returned resolve value', function() {
      path.resolve.onCall(3).returns('resolved/testPath');

      configHandler._resolvePaths(config);

      expect(config.testPath).to.equal('resolved/testPath');
    });

    describe('if config.before is truthy', function() {
      it('should call path.resolve 5 times', function() {
        config.before = './beforePath';

        configHandler._resolvePaths(config);

        expect(path.resolve.callCount).to.equal(5);
      });

      it('should call path.resolve with config.before', function() {
        config.before = './beforePath';

        configHandler._resolvePaths(config);

        expect(path.resolve.args[4]).to.deep.equal(['./beforePath']);
      });

      it('should set the passed in config.before to the returned resolve value', function() {
        config.before = './beforePath';
        path.resolve.onCall(4).returns('resolved/beforePath');

        configHandler._resolvePaths(config);

        expect(config.before).to.equal('resolved/beforePath');
      });
    });
  });
});
