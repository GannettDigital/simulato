'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/cli/run.js', function() {
    describe('on file being required', function() {
        let run;
        let EventEmitter;
        let EventEmitterInstance;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/cli/commands/run.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('uuid/v4', {});
            mockery.registerMock('../../util/config-handler.js', {});
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should set the object prototype of run to a new EventEmitter', function() {
            run = require('../../../../../lib/cli/commands/run.js');

            expect(Object.getPrototypeOf(run)).to.deep.equal(EventEmitterInstance);
        });
    });
    describe('configure', function() {
        let run;
        let EventEmitter;
        let EventEmitterInstance;
        let configHandler;
        let config;
        let uuidv4;
        let sauceConfig;
        let options;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/cli/commands/run.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };

            sauceConfig = {
                'name': 'testName',
                'browserName': 'chrome',
                'platform': 'Windows 10',
                'version': '63.0',
                'username': 'user',
                'accessKey': 'key',
                'tunnel-identifier': 'tunnelID',
                'customData': {
                            'build': 'buildNum',
                            'release': 'releaseNum',
                            'commithash': 'commit',
                            'environment': 'env',
                },
            };

            config = {
                testPath: 'sanity_tests',
                componentPath: './test/acceptance/components',
                reporter: 'testReporter',
                parallelism: 5,
                reportPath: 'sanity_tests',
                testDelay: 700,
                rerunFailedTests: 5,
            };

            global.SimulatoError = {
                TEST_CASE: {
                    NO_TEST_CASES_FOUND: sinon.stub(),
                },
            };

            configHandler = {
                createConfig: sinon.stub().returns(config),
            };

            options = {
                opts: sinon.stub().returns({opt1: 'some option'}),
            };

            uuidv4 = sinon.stub().returns('Timestamp');

            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('../../util/config-handler.js', configHandler);
            mockery.registerMock('uuid/v4', uuidv4);
            run = require('../../../../../lib/cli/commands/run.js');
        });

        afterEach(function() {
            delete process.env.SAUCE_CAPABILITIES;
            delete process.env.COMPONENTS_PATH;
            delete process.env.SAUCE_LABS;
            delete process.env.REPORTER;
            delete process.env.OUTPUT_PATH;
            delete process.env.SAUCE_LABS;
            delete process.env.TUNNEL_IDENTIFIER;
            delete process.env.BEFORE_SCRIPT;
            delete process.env.USING_PARENT_TEST_RUNNER;
            delete global.SimulatoError;
            delete process.env.CONFIG_FILE;
            delete process.env.SAUCE_USERNAME;
            delete process.env.SAUCE_ACCESS_KEY;
            delete process.env.TEST_DELAY;
            delete process.env.TEST_RERUN_COUNT;
            delete process.env.DEBUG;
            delete process.env.DEBUG_PORT;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call the passed in options.opts method once with no params', function() {
            run.configure(options);

            expect(options.opts.args).to.deep.equal([[]]);
        });

        it('should call configHandler.createConfig once', function() {
            run.configure(options);

            expect(configHandler.createConfig.callCount).to.equal(1);
        });

        it('should call configHandler.createConfig with ' +
            'the first param as the returned object from options.opts', function() {
            run.configure(options);

            expect(configHandler.createConfig.args[0][0]).to.deep.equal({opt1: 'some option'});
        });

        it('should call configHandler.createConfig with ' +
            'the second param as a function', function() {
            run.configure(options);

            expect(configHandler.createConfig.args[0][1]).to.be.a('function');
        });

        describe('when the configHandler.createConfig callback is called', function() {
            it('should set the process.env.COMPONENTS_PATH to config.componentPath', function() {
                configHandler.createConfig.callsArgWith(1, config);

                run.configure(options);

                expect(process.env.COMPONENTS_PATH).to.equal(config.componentPath);
            });

            it('should set the process.env.REPORTER to config.reporter', function() {
                configHandler.createConfig.callsArgWith(1, config);

                run.configure(options);

                expect(process.env.REPORTER).to.equal(config.reporter);
            });

            it('should set the process.env.OUTPUT_PATH to config.reportPath', function() {
                configHandler.createConfig.callsArgWith(1, config);

                run.configure(options);

                expect(process.env.OUTPUT_PATH).to.equal(config.reportPath);
            });

            it('should set the process.env.TEST_DELAY to config.testDelay', function() {
                configHandler.createConfig.callsArgWith(1, config);

                run.configure(options);

                expect(process.env.TEST_DELAY).to.equal(`${config.testDelay}`);
            });

            it('should set the process.env.TEST_RERUN_COUNT to config.rerunFailedTests', function() {
                configHandler.createConfig.callsArgWith(1, config);

                run.configure(options);

                expect(process.env.TEST_RERUN_COUNT).to.equal(`${config.rerunFailedTests}`);
            });

            describe('if config.saucelabs is truthy', function() {
                it('should set the process.env.SAUCE_LABS to config.reportPath', function() {
                    config.saucelabs = true;
                    configHandler.createConfig.callsArgWith(1, config);

                    run.configure(options);

                    expect(process.env.SAUCE_LABS).to.equal('true');
                });

                describe('if process.env.TUNNEL_IDENTIFIER is falsey', function() {
                    it('should call uuidv4 once with no params', function() {
                        config.saucelabs = true;
                        configHandler.createConfig.callsArgWith(1, config);

                        run.configure(options);

                        expect(uuidv4.args).to.deep.equal([[]]);
                    });

                    it('should set the process.env.TUNNEL_IDENTIFIER to MBTT + returned value of uuidv4', function() {
                        config.saucelabs = true;
                        configHandler.createConfig.callsArgWith(1, config);

                        run.configure(options);

                        expect(process.env.TUNNEL_IDENTIFIER).to.equal('MBTTTimestamp');
                    });
                });

                describe('if process.env.TUNNEL_IDENTIFIER is truthy', function() {
                    it('should call NOT uuidv4', function() {
                        config.saucelabs = true;
                        process.env.TUNNEL_IDENTIFIER = 'someTunnelId';
                        configHandler.createConfig.callsArgWith(1, config);

                        run.configure(options);

                        expect(uuidv4.callCount).to.equal(0);
                    });
                });
            });

            describe('if config.sauceCapabilities is truthy', function() {
                it('should set process.env.SAUCE_CAPABILITIES to the ' +
                    'JSON.stringified version of config.sauceCapabilities', function() {
                    config.sauceCapabilities = sauceConfig;
                    configHandler.createConfig.callsArgWith(1, config);

                    run.configure(options);

                    expect(process.env.SAUCE_CAPABILITIES).to.equal(JSON.stringify(sauceConfig));
                });

                describe('if config.sauceCapabilities has property username', function() {
                    it('should set the process.env.SAUCE_USERNAME to that username value', function() {
                        config.sauceCapabilities = sauceConfig;
                        configHandler.createConfig.callsArgWith(1, config);

                        run.configure(options);

                        expect(process.env.SAUCE_USERNAME).to.equal(sauceConfig.username);
                    });
                });

                describe('if config.sauceCapabilities does NOT have property username', function() {
                    it('should not set process.env.SAUCE_USERNAME to that username value', function() {
                        delete sauceConfig.username;
                        config.sauceCapabilities = sauceConfig;
                        configHandler.createConfig.callsArgWith(1, config);

                        run.configure(options);

                        expect(process.env.SAUCE_USERNAME).to.equal(undefined);
                    });
                });

                describe('if config.sauceCapabilities has property accessKey', function() {
                    it('should set the process.env.SAUCE_ACCESS_KEY to that accessKey value', function() {
                        config.sauceCapabilities = sauceConfig;
                        configHandler.createConfig.callsArgWith(1, config);

                        run.configure(options);

                        expect(process.env.SAUCE_ACCESS_KEY).to.equal(sauceConfig.accessKey);
                    });
                });

                describe('if config.sauceCapabilities does NOT have property accessKey', function() {
                    it('should NOT set process.env.SAUCE_ACCESS_KEY to that accessKey value', function() {
                        delete sauceConfig.accessKey;
                        config.sauceCapabilities = sauceConfig;
                        configHandler.createConfig.callsArgWith(1, config);

                        run.configure(options);

                        expect(process.env.SAUCE_ACCESS_KEY).to.equal(undefined);
                    });
                });
            });

            describe('if config.before is truthy', function() {
                it('should set the process.env.BEFORE_SCRIPT to config.before', function() {
                    config.before = 'script';
                    configHandler.createConfig.callsArgWith(1, config);

                    run.configure(options);

                    expect(process.env.BEFORE_SCRIPT).to.equal('script');
                });
            });

            describe('if config.debug is truthy', function() {
                it('should set the process.env.DEBUG to true', function() {
                    config.debug = true;
                    configHandler.createConfig.callsArgWith(1, config);

                    run.configure(options);

                    expect(process.env.DEBUG).to.equal('true');
                });
            });

            describe('if config.debugPort is truthy', function() {
                it('should set the process.env.DEBUG_PORT to true', function() {
                    config.debugPort = 1234;
                    configHandler.createConfig.callsArgWith(1, config);

                    run.configure(options);

                    expect(process.env.DEBUG_PORT).to.equal('1234');
                });
            });
        });

        it('should call run.emit with run.findFiles and [config.testPath] as first and second param', function() {
            configHandler.createConfig.callsArgWith(1, config);

            run.configure(options);

            expect(run.emit.args[0].slice(0, 2)).to.deep.equal([
                'run.findFiles',
                [
                    'sanity_tests',
                ],
            ]);
        });

        it('should call run.emit with a function as the 3rd param', function() {
            configHandler.createConfig.callsArgWith(1, config);

            run.configure(options);

            expect(run.emit.args[0].slice(2, 3)[0]).to.be.a('function');
        });

        describe('when the first run.emit callback is called', function() {
            it('should call run.emit with run.testCasesReadyToValidate and ' +
                'returned files as first and second param', function() {
                configHandler.createConfig.callsArgWith(1, config);
                run.emit.onCall(0).callsArgWith(2, ['file1', 'file2']);

                run.configure(options);

                expect(run.emit.args[1].slice(0, 2)).to.deep.equal([
                    'run.testCasesReadyToValidate',
                    ['file1', 'file2'],
                ]);
            });

            it('should call run.emit with a function for the third param', function() {
                configHandler.createConfig.callsArgWith(1, config);
                run.emit.onCall(0).callsArgWith(2, ['file1', 'file2']);

                run.configure(options);

                expect(run.emit.args[1].slice(2, 3)[0]).to.be.a('function');
            });

            describe('when the second run.emit callback is called', function() {
                describe('if there are validated test cases returned', function() {
                    describe('if the process.env.USING_PARENT_TESTRUNNER is true', function() {
                        it('should call run.emit with args '+
                            '(\'run.configuredSkipOrchestration\', configureInfo) ', function() {
                            configHandler.createConfig.callsArgWith(1, config);
                            run.emit.onCall(0).callsArgWith(2, ['file1', 'file2']);
                            run.emit.onCall(1).callsArgWith(2, ['validTestCases']);
                            process.env.USING_PARENT_TEST_RUNNER = true;

                            run.configure(options);

                            expect(run.emit.args[2]).to.deep.equal([
                                'run.configuredSkipOrchestration',
                                {
                                    command: 'execute',
                                    parallelism: 5,
                                    testFile: 'validTestCases',
                                },
                            ]);
                        });
                    });

                    describe('if the process.env.USING_PARENT_TESTRUNNER is NOT true', function() {
                        it('should call run.emit with (\'run.configuredRunOrchestration\', configureInfo), ' +
                        'but also have valid test cases', function() {
                            configHandler.createConfig.callsArgWith(1, config);
                            run.emit.onCall(0).callsArgWith(2, ['file1', 'file2']);
                            run.emit.onCall(1).callsArgWith(2, ['validTestCases']);
                            process.env.USING_PARENT_TEST_RUNNER = 'false';

                            run.configure(options);

                            expect(run.emit.args[2]).to.deep.equal([
                                'run.configuredRunOrchestration',
                                {
                                    command: 'run',
                                    parallelism: 5,
                                    testFilePaths: ['validTestCases'],
                                },
                            ]);
                        });
                    });
                });

                describe('if no validated test cases are returned', function() {
                    it('should throw an error no test cases found', function() {
                        configHandler.createConfig.callsArgWith(1, config);
                        run.emit.onCall(0).callsArgWith(2, ['file1', 'file2']);
                        run.emit.onCall(1).callsArgWith(2, []);
                        let message = 'No test cases were found at path';
                        SimulatoError.TEST_CASE.NO_TEST_CASES_FOUND.throws({message});

                        expect(run.configure.bind(null, options)).to.throw(message);
                    });
                });
            });
        });
    });
});
