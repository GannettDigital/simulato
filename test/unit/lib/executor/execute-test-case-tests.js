'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/executor/execute-test-case.js', function() {
    describe('on file being required', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let executeTestCase;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/execute-test-case.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('selenium-webdriver', {});
            mockery.registerMock('events', {EventEmitter});
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should set the object prototype of assertionHandler to a new EventEmitter', function() {
            executeTestCase = require('../../../../lib/executor/execute-test-case.js');

            expect(Object.getPrototypeOf(executeTestCase)).to.deep.equal(EventEmitterInstance);
        });
    });

    describe('configure', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let testPath;
        let webdriver;
        let executeTestCase;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../lib/executor/execute-test-case.js');

            testPath = '/tests/my-test-case.js';
            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            webdriver = {
                By: sinon.stub(),
                until: sinon.stub(),
            };
            sinon.stub(process, 'on');

            mockery.registerMock('selenium-webdriver', webdriver);
            mockery.registerMock('events', {EventEmitter});
            mockery.registerMock('/tests/my-test-case.js', 'testCase');

            executeTestCase = require('../../../../lib/executor/execute-test-case.js');
        });

        afterEach(function() {
            delete global.By;
            delete global.until;
            delete process.env.TEST_NAME;
            delete process.env.SAUCE_LABS;

            process.exitCode = 0;
            process.on.restore();

            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call process.on once', function() {
            executeTestCase.configure(testPath);

            expect(process.on.callCount).to.equal(1);
        });

        it('should call process.on with the event \'uncaughtException\'', function() {
            executeTestCase.configure(testPath);

            expect(process.on.args[0][0]).to.equal('uncaughtException');
        });

        describe('when the process.on callback is called', function() {
            it('should call executeTestCase.emit 4 times', function() {
                let error = new Error('An error occurred');
                process.on.callsArgWith(1, error);

                executeTestCase.configure(testPath);

                expect(executeTestCase.emit.callCount).to.equal(4);
            });

            it('should call process.on with the event \'executeTestCase.exceptionCaught\' and ' +
                'the passed in error', function() {
                let error = new Error('An error occurred');
                process.on.callsArgWith(1, error);

                executeTestCase.configure(testPath);

                expect(executeTestCase.emit.args[0]).to.deep.equal([
                    'executeTestCase.exceptionCaught',
                    error,
                ]);
            });

            it('should set the process.exitCode to the number 1', function() {
                let error = new Error('An error occurred');
                process.on.callsArgWith(1, error);

                executeTestCase.configure(testPath);

                expect(process.exitCode).to.equal(1);
            });
        });

        it('should process.env.TEST_NAME to \'my-test-case.js\' if the path is ' +
            '\'/tests/my-test-case.js\'', function() {
            executeTestCase.configure(testPath);

            expect(process.env.TEST_NAME).to.equal('my-test-case.js');
        });

        it('should set global.By to webdriver.By', function() {
            executeTestCase.configure(testPath);

            expect(global.By).to.deep.equal(webdriver.By);
        });

        it('should set global.until to webdriver.until', function() {
            executeTestCase.configure(testPath);

            expect(global.until).to.deep.equal(webdriver.until);
        });

        it('should call executeTestCase.emit 3 times', function() {
            executeTestCase.configure(testPath);

            expect(executeTestCase.emit.callCount).to.equal(3);
        });

        it('should call executeTestCase.emit with the event \'executeTestCase.loadComponents\' ' +
            'and process.env.COMPONENTS_PATH as parmeters', function() {
            process.env.COMPONENTS_PATH = '/my/components';
            executeTestCase.configure(testPath);

            expect(executeTestCase.emit.args[0]).to.deep.equal([
                'executeTestCase.loadComponents',
                '/my/components',
            ]);
        });

        describe('if process.env.SAUCE_LABS equals the string \'true\'', function() {
            it('should call executeTestCase.emit with the event \'executeTestCase.driverSetToSauce\'', function() {
                process.env.SAUCE_LABS = 'true';
                executeTestCase.configure(testPath);

                expect(executeTestCase.emit.args[1]).to.deep.equal([
                    'executeTestCase.driverSetToSauce',
                ]);
            });
        });

        describe('if process.env.SAUCE_LABS is not the string \'true\'', function() {
            it('should call executeTestCase.emit with the event \'executeTestCase.driverSetToLocal\'', function() {
                executeTestCase.configure(testPath);

                expect(executeTestCase.emit.args[1]).to.deep.equal([
                    'executeTestCase.driverSetToLocal',
                ]);
            });
        });

        it('should call executeTestCase.emit with the event \'executeTestCase.configured\'' +
            'and the required testCase', function() {
            executeTestCase.configure(testPath);

            expect(executeTestCase.emit.args[2]).to.deep.equal([
                'executeTestCase.configured',
                'testCase',
            ]);
        });
    });
});
