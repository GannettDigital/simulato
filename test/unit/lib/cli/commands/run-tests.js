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
            };

            global.MbttError = {
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
            delete global.MbttError;
            delete process.env.CONFIG_FILE;
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
            it('should set the reporter if it exists', function() {
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
            it('should set the reporter if it exists', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.REPORTER).to.equal(configFile.reporter);
            });
            it('should not assign the reporter if it is not set', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                configFile.reporter = undefined;
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.REPORTER).to.equal(undefined);
            });
        });
        describe('if report path is loaded from options', function() {
            it('should not assign the report path if it is not set', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                configFile.reportPath = undefined;
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.OUTPUT_PATH).to.equal(undefined);
            });
            describe('if reportPath exists', function() {
                describe('if reportPath is type of boolean', function() {
                    it('should set the output path to cwd and call cwd twice', function() {
                        let pathLoc = '../../../../config.js';
                        let options = {reportPath: true};
                        mockery.registerMock(pathLoc, configFile);

                        run.configure(options);

                        expect(process.cwd.callCount).to.equal(2);
                    });
                });
                describe('else reportPath is not type of boolean', function() {
                    it('should set the output path to what is passed', function() {
                        let pathLoc = '../../../../config.js';
                        let options = {};
                        path.resolve.onCall(0).returns('filePath');
                        mockery.registerMock(pathLoc, configFile);

                        run.configure(options);

                        expect(process.env.OUTPUT_PATH).to.equal('filePath');
                    });
                });
                it('should resolve the path for the output', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {reportPath: 'path'};
                    configFile.before = false;
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(path.resolve.args).to.deep.equal([['path']]);
                });
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
            describe('if saucelabs is false', function() {
                it('should not set SAUCE_LABS', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {};
                    configFile.saucelabs = undefined;
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(process.env.SAUCE_LABS).to.equal(undefined);
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
                it('should set the SAUCE_CAPABILITIES env variable', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {};
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(JSON.parse(process.env.SAUCE_CAPABILITIES)).to.deep.equal(sauceConfig);
                });
                it('should set TUNNEL_IDENTIFIER to MBTTTimestamp', function() {
                    let pathLoc = '../../../../config.js';
                    let options = {};
                    mockery.registerMock(pathLoc, configFile);

                    run.configure(options);

                    expect(process.env.TUNNEL_IDENTIFIER).to.equal('MBTTTimestamp');
                });
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
            it('should leave the before script undefined if not defined in configFile or options', function() {
                let pathLoc = '../../../../config.js';
                let options = {};
                configFile.reportPath = true;
                mockery.registerMock(pathLoc, configFile);

                run.configure(options);

                expect(process.env.BEFORE_SCRIPT).to.equal('undefined');
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
                    describe('if the testFilePaths length is 1', function() {
                        it('should call run.emit with args '+
                            '(\'run.configuredRunOrchestration\', configureInfo) ', function() {
                            let files = 'files';
                            let validTestCases = 'validTestCases';
                            let pathLoc = '../../../../config.js';
                            let options = {};
                            configFile.reportPath = false;
                            mockery.registerMock(pathLoc, configFile);
                            run.emit.onCall(0).callsArgWith(2, files);
                            run.emit.onCall(1).callsArgWith(2, validTestCases);

                            run.configure(options);

                            expect(run.emit.args[2]).to.deep.equal(['run.configuredRunOrchestration', {
                            'command': 'run', 'parallelism': '', 'testFilePaths': 'validTestCases'}]);
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
                    describe('else the testFilePath length is not 1', function() {
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

                            expect(run.emit.args[2]).to.deep.equal(['run.configuredRunOrchestration', {
                                'command': 'execute', 'testFile': 'Case'}]);
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
                        MbttError.TEST_CASE.NO_TEST_CASES_FOUND.throws({message});
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
