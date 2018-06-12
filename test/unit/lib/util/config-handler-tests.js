'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/config-handler.js', function() {
  describe('createConfig', function() {
    let _;
    let callback;
    let defaults;
    let configHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/config-handler.js');

      callback = sinon.spy();

      _ = {
        merge: sinon.stub(),
      };

      defaults = {
        defaultKey: 'defaultValue',
      };

      mockery.registerMock('lodash', _);
      mockery.registerMock('path', {});
      mockery.registerMock('./defaults.js', defaults);

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
      it('should freeze the returned config making it immutable', function() {
        process.env.USING_PARENT_TEST_RUNNER = 'true';
        process.env.TEST_PATH = 'a/test/path';
        process.env.PARENT_CONFIG = JSON.stringify({
          key1: 'value1',
          key2: 'value2',
        });

        configHandler.createConfig({}, callback);

        expect(callback.args[0][0]).to.be.frozen;
      });

      it('should call the callback passing in the config set from ' +
        'process.env.PARENT_CONFIG and process.env.TEST_PATH', function() {
        process.env.USING_PARENT_TEST_RUNNER = 'true';
        process.env.TEST_PATH = 'a/test/path';
        process.env.PARENT_CONFIG = JSON.stringify({
          key1: 'value1',
          key2: 'value2',
        });

        configHandler.createConfig({}, callback);

        expect(callback.args).to.deep.equal([[{
          key1: 'value1',
          key2: 'value2',
          testPath: 'a/test/path',
        }]]);
      });
    });

    it('should call lodash merge passing in an empty object, and the required in defaults', function() {
      configHandler.createConfig({}, callback);

      expect(_.merge.args).to.deep.equal([[{}, {defaultKey: 'defaultValue'}]]);
    });

    it('should call configHandler._getBaseConfig with the passed in cliOptions as the first param', function() {
      configHandler.createConfig({cliOption: 'a cli option'}, callback);

      expect(configHandler._getBaseConfig.args[0][0]).to.deep.equal({cliOption: 'a cli option'});
    });

    it('should call configHandler._getBaseConfig with a function as the second param', function() {
      configHandler.createConfig({cliOption: 'a cli option'}, callback);

      expect(configHandler._getBaseConfig.args[0][1]).to.deep.a('function');
    });

    it('should call configHandler._getBaseConfig once', function() {
      configHandler.createConfig({cliOption: 'a cli option'}, callback);

      expect(configHandler._getBaseConfig.callCount).to.equal(1);
    });

    describe('when the callback for configHandler._getBaseConfig is called', function() {
      it('should call lodash merge passing in an current config, and returned configFile object', function() {
        configHandler._getBaseConfig.callsArgWith(1, {configFileKey: 'config file value'});

        configHandler.createConfig({}, callback);

        expect(_.merge.args[1]).to.deep.equal([
          {},
          {configFileKey: 'config file value'},
        ]);
      });

      it('should call lodash merge passing in an current config, and passed in cliOptions', function() {
        configHandler._getBaseConfig.callsArgWith(1, {});

        configHandler.createConfig({cliOption: 'a cli option value'}, callback);

        expect(_.merge.args[2]).to.deep.equal([
          {},
          {cliOption: 'a cli option value'},
        ]);
      });

      it('should call lodash merge a total of 3 times', function() {
        configHandler._getBaseConfig.callsArgWith(1, {configFileKey: 'config file value'});

        configHandler.createConfig({}, callback);

        expect(_.merge.callCount).to.equal(3);
      });

      it('should call configHandler._resolvePaths once with the current config as its params', function() {
        configHandler._getBaseConfig.callsArgWith(1, {});

        configHandler.createConfig({}, callback);

        expect(configHandler._resolvePaths.args).to.deep.equal([[{}]]);
      });

      it('should set process.env.PARENT_CONFIG as the JSON stringified version of the current config', function() {
        configHandler._getBaseConfig.callsArgWith(1, {});

        configHandler.createConfig({}, callback);

        expect(process.env.PARENT_CONFIG).to.equal(JSON.stringify({}));
      });

      it('should freeze the returned config making it immutable', function() {
        configHandler._getBaseConfig.callsArgWith(1, {});

        configHandler.createConfig({}, callback);

        expect(callback.args[0][0]).to.be.frozen;
      });

      it('should call the callback passing in the config set', function() {
        configHandler._getBaseConfig.callsArgWith(1, {});

        configHandler.createConfig({}, callback);

        expect(callback.args).to.deep.equal([[{}]]);
      });
    });
  });

  describe('_getBaseConfig', function() {
    let callback;
    let path;
    let configHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/util/config-handler.js');

      callback = sinon.spy();

      path = {
        normalize: sinon.stub(),
      };

      mockery.registerMock('lodash', {});
      mockery.registerMock('path', path);
      mockery.registerMock('./defaults.js', {});

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

      mockery.registerMock('lodash', {});
      mockery.registerMock('path', path);
      mockery.registerMock('./defaults.js', {});

      configHandler = require('../../../../lib/util/config-handler.js');
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
