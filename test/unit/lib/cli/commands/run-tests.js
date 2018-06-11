'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/cli/run.js', function() {
    describe('on file being required', function() {
        let run;
        let EventEmitter;
        let EventEmitterInstance;
        let path;
        let uuidv4;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/cli/commands/run.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            sinon.spy(process, 'cwd');

            path = {
                resolve: sinon.stub(),
                normalize: sinon.stub().returns('../../../../config.js'),
            };

            uuidv4 = sinon.stub().returns('Timestamp');

            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('path', path);
            mockery.registerMock('uuid/v4', uuidv4);
        });

        afterEach(function() {
            process.cwd.restore();
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
        let path;
        let configFile;
        let uuidv4;
        let sauceConfig;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/cli/commands/run.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            sinon.spy(process, 'cwd');

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

            configFile = {
                testPath: 'sanity_tests',
                components: './test/acceptance/components',
                reporter: 'testReporter',
                saucelabs: true,
                sauceCapabilities: sauceConfig,
                parallelism: '',
                reportPath: 'sanity_tests',
                before: 'script',
                testDelay: '700',
                rerunFailedTests: 5,
                debug: true,
                debugPort: 5555,
            };

            global.SimulatoError = {
                TEST_CASE: {
                    NO_TEST_CASES_FOUND: sinon.stub(),
                },
            };

            path = {
                resolve: sinon.stub(),
                normalize: sinon.stub().returns('../../../../config.js'),
            };

            uuidv4 = sinon.stub().returns('Timestamp');

            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('path', path);
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
            process.cwd.restore();
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });
        describe('if options.configFile is set', function() {
            describe('if the process is not using the parent test runner', function() {
                it('should call path.normalize once with result of process.cwd and the path loc', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {
                        configFile: pathLoc,
                        testPath: 'passedFile',
                    };
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(path.normalize.args).to.deep.equal([
                        [`${process.cwd()}/${pathLoc}`],
                    ]);
                });
            });
            describe('if the process is using the parent test runner', function() {
                it('should call path.normalize once with result of process.cwd and the pathloc', function() {
                    process.env.CONFIG_FILE = '../../../../config.js';
                    process.env.USING_PARENT_TEST_RUNNER = 'true';
                    let options = {
                        configFile: process.env.CONFIG_FILE,
                    };

                    mockery.registerMock(process.env.CONFIG_FILE, configFile);

                    run.configure(options);

                    expect(run.emit.args[0][1][0]).to.equal('sanity_tests');
                });
            });
            it('should use the passed in config file', function() {
                let pathLoc = '../../../../config.js';
                let options = {
                    configFile: pathLoc,
                    testPath: 'passedFile',
                };
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(run.emit.args[0][1][0]).to.equal('passedFile');
            });
        });
        describe('if the options.configFile is not set', function() {
            describe('if the process is not using the parent test runner', function() {
                it('should call path.normalize once with result of process.cwd and the path loc', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {};
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(path.normalize.args).to.deep.equal([
                        [`${process.cwd()}/config.js`],
                    ]);
                });
            });
            it('should use the default configFile', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(run.emit.args[0][1][0]).to.equal('sanity_tests');
            });
        });

        describe('if the reporter is passed in by the options', function() {
            it('should set the process.env.REPORTER to options.reporter', function() {
                let pathLoc = '../../../../config.js';
                let options = {
                    reporter: 'reporter',
                };
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.REPORTER).to.equal(options.reporter);
            });
        });

        describe('if the reporter is passed in by the configFile', function() {
            it('should set the process.env.REPORTER to configFile.reporter', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.REPORTER).to.equal(configFile.reporter);
            });
        });

        describe('if the reporter is not passed in by configFile or CLI', function() {
            it('should not assign process.env.REPORTER', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                configFile.reporter = undefined;
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.REPORTER).to.equal(undefined);
            });
        });

        describe('if report path is loaded from options', function() {
            describe('if reportPath is typeof boolean', function() {
                it('should call process.cwd twice', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {reportPath: true};
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(process.cwd.callCount).to.equal(2);
                });

                it('should set process.env.OUTPUT_PATH to process.cwd()', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {reportPath: true};
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(process.env.OUTPUT_PATH).to.equal(process.cwd());
                });
            });

            describe('if reportPath is not typeof boolean', function() {
                it('should call path.resolve with the reportPath', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {reportPath: 'path'};
                    delete configFile.before;
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(path.resolve.args).to.deep.equal([['path']]);
                });

                it('should set process.env.OUTPUT_PATH to the resolved path', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {reportPath: 'path'};
                    path.resolve.onCall(0).returns('filePath');
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(process.env.OUTPUT_PATH).to.equal('filePath');
                });
            });
        });

        describe('if report path is loaded from configFile', function() {
            describe('if reportPath is typeof boolean', function() {
                it('should call process.cwd twice', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {};
                    configFile.reportPath = true;
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(process.cwd.callCount).to.equal(2);
                });

                it('should set process.env.OUTPUT_PATH to process.cwd()', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {};
                    configFile.reportPath = true;
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(process.env.OUTPUT_PATH).to.equal(process.cwd());
                });
            });

            describe('if reportPath is not typeof boolean', function() {
                it('should call path.resolve with the reportPath', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {};
                    delete configFile.before;
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(path.resolve.args).to.deep.equal([['sanity_tests']]);
                });

                it('should set process.env.OUTPUT_PATH to the resolved path', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {};
                    path.resolve.onCall(0).returns('filePath');
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(process.env.OUTPUT_PATH).to.equal('filePath');
                });
            });
        });

        describe('if reportPath is not set in the options or CLI', function() {
            it('should not assign process.env.OUTPUT_PATH', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                configFile.reportPath = undefined;
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.OUTPUT_PATH).to.equal(undefined);
            });
        });

        describe('if saucelabs is passed in by options', function() {
            describe('if saucelabs is true', function() {
                it('should set SAUCE_LABS to true', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {saucelabs: sauceConfig};
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(process.env.SAUCE_LABS).to.equal('true');
                });
                it('should set TUNNEL_IDENTIFIER to MBTTTimestamp', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {saucelabs: sauceConfig};
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(process.env.TUNNEL_IDENTIFIER).to.equal('MBTTTimestamp');
                });

                describe('if config.sauceCapabilities is not set', function() {
                    it('should not set the SAUCE_CAPABILITIES', function() {
                        let pathLoc = '../../../../config.js';
                        let options = {saucelabs: sauceConfig};
                        mockery.registerMock(pathLoc, configFile);
                        configFile.saucelabs = undefined;
                        configFile.sauceCapabilities = undefined;

                        run.configure(options);

                        expect(process.env.SAUCE_CAPABILITIES).to.equal(undefined);
                    });
                });
            });
        });

        describe('if saucelabs is passed in by configFile', function() {
            describe('if saucelabs is true', function() {
                it('should set SAUCE_LABS to true', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {};
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(process.env.SAUCE_LABS).to.equal('true');
                });
                it('should set TUNNEL_IDENTIFIER to MBTTTimestamp', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {};
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(process.env.TUNNEL_IDENTIFIER).to.equal('MBTTTimestamp');
                });
                describe('if configFile contains sauce capabilities', function() {
                    it('should set the SAUCE_CAPABILITIES env variable', function() {
                        let pathLoc = '../../../../config.js';
                        let options = {};
                        mockery.registerMock(pathLoc, configFile);

                        run.configure(options);

                        expect(JSON.parse(process.env.SAUCE_CAPABILITIES)).to.deep.equal(sauceConfig);
                    });
                    describe('if sauce capabilities has username set', function() {
                        it('should set the SAUCE_USERNAME', function() {
                            let pathLoc = '../../../../config.js';
                            let options = {};
                            mockery.registerMock(pathLoc, configFile);

                            run.configure(options);

                            expect(JSON.parse(process.env.SAUCE_CAPABILITIES).username)
                            .to.deep.equal(process.env.SAUCE_USERNAME);
                        });
                    });
                    describe('if sauce capabilities does not have username set', function() {
                        it('should not set the SAUCE_USERNAME', function() {
                            let pathLoc = '../../../../config.js';
                            let options = {};
                            delete sauceConfig.username;
                            mockery.registerMock(pathLoc, configFile);

                            run.configure(options);

                            expect(JSON.parse(process.env.SAUCE_CAPABILITIES).username).to.deep.equal(undefined);
                        });
                    });
                    describe('if sauce capabilities has accessKey set', function() {
                        it('should set the SAUCE_ACCESS_KEY', function() {
                            let pathLoc = '../../../../config.js';
                            let options = {};
                            mockery.registerMock(pathLoc, configFile);

                            run.configure(options);

                            expect(JSON.parse(process.env.SAUCE_CAPABILITIES).accessKey)
                            .to.deep.equal(process.env.SAUCE_ACCESS_KEY);
                        });
                    });
                    describe('if sauce capabilities does not have accessKey set', function() {
                        it('should not set the SAUCE_ACCESS_KEY', function() {
                            let pathLoc = '../../../../config.js';
                            let options = {};
                            delete sauceConfig.accessKey;
                            mockery.registerMock(pathLoc, configFile);

                            run.configure(options);

                            expect(JSON.parse(process.env.SAUCE_CAPABILITIES).accessKey).to.deep.equal(undefined);
                        });
                    });
                });
            });
        });

        describe('if saucelabs is not set in options or CLI', function() {
            it('should leave process.env.SAUCE_LABS as undefined', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                configFile.saucelabs = undefined;
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.SAUCE_LABS).to.equal(undefined);
            });

            it('should leave process.env.TUNNEL_IDENTIFIER as undefined', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                configFile.saucelabs = undefined;
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.TUNNEL_IDENTIFIER).to.equal(undefined);
            });

            it('should leave process.env.SAUCE_CAPABILITIES as undefined', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                configFile.saucelabs = undefined;
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.SAUCE_CAPABILITIES).to.equal(undefined);
            });

            it('should leave process.env.SAUCE_USERNAME as undefined', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                configFile.saucelabs = undefined;
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.SAUCE_USERNAME).to.equal(undefined);
            });

            it('should leave process.env.SAUCE_ACCESS_KEY as undefined', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                configFile.saucelabs = undefined;
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.SAUCE_ACCESS_KEY).to.equal(undefined);
            });
        });

        describe('if before is passed in from the options', function() {
            it('should set the before script', function() {
                let pathLoc = '../../../../config.js';
                let options = {before: true};
                configFile.reportPath = true;
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(path.resolve.callCount).to.equal(1);
            });
        });

        describe('if before is passed in from the configFile', function() {
            it('should set the before script', function() {
                let pathLoc = '../../../../config.js';
                let options = {before: 'beforePath'};
                configFile.reportPath = true;
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(path.resolve.args).to.deep.equal([['beforePath']]);
            });
        });

        describe('if before is passed in from the configFile', function() {
            it('should set the before script', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                configFile.reportPath = true;
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(path.resolve.args).to.deep.equal([['script']]);
            });
        });

        describe('if before is not passed in with configFile or ClI', function() {
            it('should leave the before script undefined', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                configFile.reportPath = true;
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.BEFORE_SCRIPT).to.equal('undefined');
            });
        });

        describe('if testDelay is passed in by the options', function() {
            it('should set testDelay to process.env.TEST_DELAY', function() {
                let pathLoc = '../../../../config.js';
                let options = {
                    testDelay: '500',
                };
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.TEST_DELAY).to.equal(options.testDelay);
            });
        });

        describe('if the testDelay is passed in by the configFile', function() {
            it('should set testDelay to process.env.TEST_DELAY', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.TEST_DELAY).to.equal(configFile.testDelay);
            });
        });

        describe('if testDelay is not passed in with configFile or ClI', function() {
            it('should NOT set testDelay to process.env.TEST_DELAY', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                configFile.testDelay = undefined;
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.TEST_DELAY).to.equal(undefined);
            });
        });

        describe('if rerunFailedTests is passed in by the options', function() {
            it('should set rerunFailedTests to process.env.TEST_RERUN_COUNT', function() {
                let pathLoc = '../../../../config.js';
                let options = {
                    rerunFailedTests: 2,
                };
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.TEST_RERUN_COUNT).to.equal('2');
            });
        });

        describe('if the rerunFailedTests is passed in by the configFile', function() {
            it('should set rerunFailedTests to process.env.TEST_RERUN_COUNT', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.TEST_RERUN_COUNT).to.equal('5');
            });
        });

        describe('if rerunFailedTests is not passed in with configFile or ClI', function() {
            it('should NOT set rerunFailedTests to process.env.TEST_RERUN_COUNT', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                configFile.rerunFailedTests = undefined;
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.TEST_RERUN_COUNT).to.equal(undefined);
            });
        });

        describe('if debug is passed in by the options', function() {
            it('should set process.env.DEBUG to true', function() {
                let pathLoc = '../../../../config.js';
                let options = {
                    debug: true,
                };
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.DEBUG).to.equal('true');
            });
        });

        describe('if the debug is passed in by the configFile', function() {
            it('should set process.env.DEBUG to true', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.DEBUG).to.equal('true');
            });
        });

        describe('if debug is not passed in with configFile or ClI', function() {
            it('should NOT set process.env.TEST_RERUN_COUNT', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                configFile.debug = undefined;
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.DEBUG).to.equal(undefined);
            });
        });

        describe('if debug is set', function() {
            describe('if debugPort is passed in by the options', function() {
                it('should set process.env.DEBUG_PORT to debugPort', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {
                        debug: true,
                        debugPort: 4444,
                    };
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(process.env.DEBUG_PORT).to.equal('4444');
                });
            });

            describe('if the debugPort is passed in by the configFile', function() {
                it('should set process.env.DEBUG_PORT to the configFile.debugPort', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {};
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(process.env.DEBUG_PORT).to.equal('5555');
                });
            });

            describe('if debugPort is not passed in with configFile or ClI', function() {
                it('should NOT set process.env.DEBUG_PORT', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {};
                    configFile.debugPort = undefined;
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(process.env.DEBUG_PORT).to.equal(undefined);
                });
            });
        });

        it('should call the emit with run.findFiles with paths passed', function() {
            let pathLoc = '../../../../config.js';
            let options = {};
            configFile.reportPath = true;
            mockery.registerMock(pathLoc, configFile);

            run.configure(options);

            expect(run.emit.args[0].slice(0, 2)).to.deep.equal([
                'run.findFiles',
                [
                    'sanity_tests',
                ],
            ]);
        });
        it('should call the emit with run.findFiles with a callback as the 3rd argument', function() {
            let pathLoc = '../../../../config.js';
            let options = {};
            configFile.reportPath = true;
            mockery.registerMock(pathLoc, configFile);

            run.configure(options);

            expect(run.emit.args[0].slice(2, 3)[0]).to.be.a('function');
        });
        describe('calls the call back of run.emit for run.findFile on the 3rd argument', function() {
            it('should call the second emit with the arguments run.testCasesReadyToValidate and files', function() {
                let pathLoc = '../../../../config.js';
                let files = 'files';
                let options = {};
                configFile.reportPath = true;
                mockery.registerMock(pathLoc, configFile);
                run.emit.onCall(0).callsArgWith(2, files);

                run.configure(options);

                expect(run.emit.args[1].slice(0, 2)).to.deep.equal(['run.testCasesReadyToValidate', 'files']);
            });
            it('should call the second emit with a function for the third argument', function() {
                let pathLoc = '../../../../config.js';
                let files = 'files';
                let options = {};
                configFile.reportPath = true;
                mockery.registerMock(pathLoc, configFile);
                run.emit.onCall(0).callsArgWith(2, files);

                run.configure(options);

                expect(run.emit.args[1].slice(2, 3)[0]).to.be.a('function');
            });
            describe('calls the callback of run.emit for testCasesReadyToValidate on the 3rd argument', function() {
                describe('if there are validated test cases', function() {
                    describe('if the process.env.USING_PARENT_TESTRUNNER is true', function() {
                        it('should call run.emit with args '+
                            '(\'run.configuredSkipOrchestration\', configureInfo) ', function() {
                            let files = 'files';
                            let validTestCases = ['validTestCases'];
                            let pathLoc = '../../../../config.js';
                            let options = {};
                            configFile.reportPath = false;
                            mockery.registerMock(pathLoc, configFile);
                            run.emit.onCall(0).callsArgWith(2, files);
                            run.emit.onCall(1).callsArgWith(2, validTestCases);
                            process.env.USING_PARENT_TEST_RUNNER = true;
                            process.env.CONFIG_FILE = pathLoc;

                            run.configure(options);

                            expect(run.emit.args[2]).to.deep.equal([
                                'run.configuredSkipOrchestration',
                                {
                                    command: 'execute',
                                    testFile: 'validTestCases',
                                },
                            ]);
                        });
                        describe('if the process is using parent test runner', function() {
                            it('should call run.emit with args ' +
                                '\'run.configuredSkipOrchestration\', configureInfo', function() {
                                let files = 'files';
                                let validTestCases = ['Case'];
                                let pathLoc = '../../../../config.js';
                                let options = {};
                                process.env.USING_PARENT_TEST_RUNNER = 'true';
                                process.env.CONFIG_FILE = `${pathLoc}`;
                                configFile.reportPath = false;
                                mockery.registerMock(pathLoc, configFile);
                                run.emit.onCall(0).callsArgWith(2, files);
                                run.emit.onCall(1).callsArgWith(2, validTestCases);

                                run.configure(options);

                                expect(run.emit.args[2]).to.deep.equal(['run.configuredSkipOrchestration', {
                                    'command': 'execute', 'testFile': 'Case'}]);
                            });
                        });
                    });
                    describe('if the process.env.USING_PARENT_TESTRUNNER is NOT true', function() {
                        it('should call run.emit with (\'run.configuredRunOrchestration\', configureInfo), ' +
                        'but also have valid test cases', function() {
                            let files = 'files';
                            let validTestCases = ['Case'];
                            let pathLoc = '../../../../config.js';
                            let options = {};
                            process.env.USING_PARENT_TEST_RUNNER = 'false';
                            configFile.reportPath = false;
                            mockery.registerMock(pathLoc, configFile);
                            run.emit.onCall(0).callsArgWith(2, files);
                            run.emit.onCall(1).callsArgWith(2, validTestCases);

                            run.configure(options);

                            expect(run.emit.args[2]).to.deep.equal([
                                'run.configuredRunOrchestration',
                                {
                                    command: 'run',
                                    parallelism: '',
                                    testFilePaths: ['Case'],
                                },
                            ]);
                        });
                    });
                });
                describe('if there are not validated test cases', function() {
                    it('should throw an error no test cases found', function() {
                        let files = 'files';
                        let validTestCases = '';
                        let pathLoc = '../../../../config.js';
                        let options = {};
                        let message = 'No test cases were found at path';
                        SimulatoError.TEST_CASE.NO_TEST_CASES_FOUND.throws({message});
                        configFile.reportPath = false;
                        mockery.registerMock(pathLoc, configFile);
                        run.emit.onCall(0).callsArgWith(2, files);
                        run.emit.onCall(1).callsArgWith(2, validTestCases);

                        expect(run.configure.bind(null, options)).to.throw(message);
                    });
                });
            });
        });
    });
});
