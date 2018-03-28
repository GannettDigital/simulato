'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/executor/execution-engine/execution-engine-report-handler.js', function() {
    describe('on file being required', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let eeReportHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should set the object prototype of eeReportHandler to a new EventEmitter', function() {
            eeReportHandler =
                require('../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

            expect(Object.getPrototypeOf(eeReportHandler)).to.deep.equal(EventEmitterInstance);
        });

        it('should call eeReportHandler.on with the event \'eeReportHandler.uncaughtErrorReceived\' and the ' +
            'function eeReportHandler.appendReportError', function() {
            eeReportHandler =
                require('../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

            expect(eeReportHandler.on.args[0]).to.deep.equal([
                'eeReportHandler.uncaughtErrorReceived',
                eeReportHandler.appendReportError,
            ]);
        });

        it('should call eeReportHandler.on with the event \'eeReportHandler.uncaughtErrorHandled\' and the ' +
            'function eeReportHandler.finalizeReport', function() {
            eeReportHandler =
                require('../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

            expect(eeReportHandler.on.args[1]).to.deep.equal([
                'eeReportHandler.uncaughtErrorHandled',
                eeReportHandler.finalizeReport,
            ]);
        });
    });

    describe('startReport', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let eeReportHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            sinon.stub(process, 'hrtime').returns([123, 456]);

            mockery.registerMock('events', {EventEmitter});

            eeReportHandler =
                require('../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');
        });

        afterEach(function() {
            delete process.env.TEST_NAME;
            process.hrtime.restore();
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should set eeReportHandler._report.testName to process.env.TEST_NAME', function() {
            process.env.TEST_NAME = 'My Test';

            eeReportHandler.startReport();

            expect(eeReportHandler._report.testName).to.equal('My Test');
        });

        it('should set eeReportHandler._startTime to the result of the call to process.hrtime', function() {
            eeReportHandler.startReport();

            expect(eeReportHandler._startTime).to.deep.equal([123, 456]);
        });
    });

    describe('recordNewAction', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let eeReportHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});

            eeReportHandler =
                require('../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should increment eeReportHandler._report.actionCount', function() {
            eeReportHandler.recordNewAction();

            expect(eeReportHandler._report.actionCount).to.equal(1);
        });

        it('should set eeReportHandler._currentAction to the passed in actionConfig', function() {
            let actionConfig = {name: 'My Instance', action: 'My Action'};

            eeReportHandler.recordNewAction('', actionConfig);

            expect(eeReportHandler._currentAction).to.deep.equal({name: 'My Instance', action: 'My Action'});
        });
    });

    describe('recordNewStep', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let eeReportHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});

            eeReportHandler =
                require('../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should set eeReportHandler._currentStep to the passed in step', function() {
            eeReportHandler.recordNewStep('My Step');

            expect(eeReportHandler._currentStep).to.equal('My Step');
        });
    });

    describe('appendReportError', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let eeReportHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('events', {EventEmitter});

            eeReportHandler =
                require('../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call eeReportHandler.emit once with the event \'eeReportHandler.errorOccured\'', function() {
            eeReportHandler._currentAction = {};

            eeReportHandler.appendReportError({});

            expect(eeReportHandler.emit.args).to.deep.equal([
                [
                    'eeReportHandler.errorOccured',
                ],
            ]);
        });

        it('should set eeReportHandler._report.error to the passed in error', function() {
            eeReportHandler._currentAction = {};
            let error = new Error('An error occurred');

            eeReportHandler.appendReportError(error);

            expect(eeReportHandler._report.error).to.deep.equal(error);
        });

        it('should set eeReportHandler._report.error.nameOfComponent to ' +
            'eeReportHandler._currentAction.name', function() {
            eeReportHandler._currentAction = {name: 'myInstance'};
            let error = new Error('An error occurred');

            eeReportHandler.appendReportError(error);

            expect(eeReportHandler._report.error.nameOfComponent).to.equal('myInstance');
        });

        it('should set eeReportHandler._report.error.actionName to ' +
            'eeReportHandler._currentAction.actionName', function() {
            eeReportHandler._currentAction = {actionName: 'MY_ACTION'};
            let error = new Error('An error occurred');

            eeReportHandler.appendReportError(error);

            expect(eeReportHandler._report.error.actionName).to.equal('MY_ACTION');
        });

        it('should set eeReportHandler._report.error.failedStep to ' +
            'eeReportHandler._currentAction.failedStep', function() {
            eeReportHandler._currentAction = {};
            eeReportHandler._currentStep = 'perform';
            let error = new Error('An error occurred');

            eeReportHandler.appendReportError(error);

            expect(eeReportHandler._report.error.failedStep).to.equal('perform');
        });
    });

    describe('finalizeReport', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let eeReportHandler;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);
            sinon.stub(process, 'hrtime').returns([123, 456]);

            mockery.registerMock('events', {EventEmitter});

            eeReportHandler =
                require('../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');
        });

        afterEach(function() {
            process.hrtime.restore();
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call process.hrtime once with eeReportHandler._startTime', function() {
            eeReportHandler._startTime = [111, 222];

            eeReportHandler.finalizeReport();

            expect(process.hrtime.args).deep.equal([
                [[111, 222]],
            ]);
        });

        it('should set eeReportHandler._report.time to the result of the call process.hrtime', function() {
            eeReportHandler.finalizeReport();

            expect(eeReportHandler._report.time).deep.equal([123, 456]);
        });

        it('should call eeReportHandler.emit once with the event \'eeReportHandler.reportFinalized\' ' +
            'and eeReportHandler._report as parameters', function() {
            eeReportHandler.finalizeReport();

            expect(eeReportHandler.emit.args).to.deep.equal([
                [
                    'eeReportHandler.reportFinalized',
                    {
                        testName: null,
                        actionCount: 0,
                        time: [123, 456],
                        error: null,
                    },
                ],
            ]);
        });
    });
});
