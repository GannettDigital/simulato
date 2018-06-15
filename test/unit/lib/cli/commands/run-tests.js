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

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/cli/commands/run.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };

            global.SimulatoError = {
                TEST_CASE: {
                    NO_TEST_CASES_FOUND: sinon.stub(),
                },
            };

            configHandler = {
                get: sinon.stub().returns('sanity_tests'),
            };

            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('../../util/config-handler.js', configHandler);
            run = require('../../../../../lib/cli/commands/run.js');
        });

        afterEach(function() {
            delete process.env.USING_PARENT_TEST_RUNNER;
            delete global.SimulatoError;
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call configHandler.get once with \'testPath\'', function() {
            run.configure();

            expect(configHandler.get.args).to.deep.equal([['testPath']]);
        });

        it('should call run.emit with run.findFiles and [config.testPath] as first and second param', function() {
            run.configure();

            expect(run.emit.args[0].slice(0, 2)).to.deep.equal([
                'run.findFiles',
                [
                    'sanity_tests',
                ],
            ]);
        });

        it('should call run.emit with a function as the 3rd param', function() {
            run.configure();

            expect(run.emit.args[0].slice(2, 3)[0]).to.be.a('function');
        });

        describe('when the first run.emit callback is called', function() {
            it('should call run.emit with run.testCasesReadyToValidate and ' +
                'returned files as first and second param', function() {
                run.emit.onCall(0).callsArgWith(2, ['file1', 'file2']);

                run.configure();

                expect(run.emit.args[1].slice(0, 2)).to.deep.equal([
                    'run.testCasesReadyToValidate',
                    ['file1', 'file2'],
                ]);
            });

            it('should call run.emit with a function for the third param', function() {
                run.emit.onCall(0).callsArgWith(2, ['file1', 'file2']);

                run.configure();

                expect(run.emit.args[1].slice(2, 3)[0]).to.be.a('function');
            });

            describe('when the second run.emit callback is called', function() {
                describe('if there are validated test cases returned', function() {
                    describe('if the process.env.USING_PARENT_TESTRUNNER is true', function() {
                        it('should call run.emit with args '+
                            '(\'run.configuredSkipOrchestration\', configureInfo) ', function() {
                            run.emit.onCall(0).callsArgWith(2, ['file1', 'file2']);
                            run.emit.onCall(1).callsArgWith(2, ['validTestCases']);
                            process.env.USING_PARENT_TEST_RUNNER = true;

                            run.configure();

                            expect(run.emit.args[2]).to.deep.equal([
                                'run.configuredSkipOrchestration',
                                {
                                    command: 'execute',
                                    testFile: 'validTestCases',
                                },
                            ]);
                        });
                    });

                    describe('if the process.env.USING_PARENT_TESTRUNNER is NOT true', function() {
                        it('should call run.emit with (\'run.configuredRunOrchestration\', configureInfo), ' +
                        'but also have valid test cases', function() {
                            run.emit.onCall(0).callsArgWith(2, ['file1', 'file2']);
                            run.emit.onCall(1).callsArgWith(2, ['validTestCases']);
                            process.env.USING_PARENT_TEST_RUNNER = 'false';

                            run.configure();

                            expect(run.emit.args[2]).to.deep.equal([
                                'run.configuredRunOrchestration',
                                {
                                    command: 'run',
                                    testFilePaths: ['validTestCases'],
                                },
                            ]);
                        });
                    });
                });

                describe('if no validated test cases are returned', function() {
                    it('should throw an error no test cases found', function() {
                        run.emit.onCall(0).callsArgWith(2, ['file1', 'file2']);
                        run.emit.onCall(1).callsArgWith(2, []);
                        let message = 'No test cases were found at path';
                        SimulatoError.TEST_CASE.NO_TEST_CASES_FOUND.throws({message});

                        expect(run.configure.bind(null)).to.throw(message);
                    });
                });
            });
        });
    });
});
