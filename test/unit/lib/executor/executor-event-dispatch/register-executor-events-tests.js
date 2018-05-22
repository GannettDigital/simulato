'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/executor/executor-event-dispatch/register-executor-events.js', function() {
    let executeTestCase;
    let driverHandler;
    let reporters;
    let executionEngine;
    let eeReportHandler;
    let eePrintReport;
    let assertionHandler;
    let executorEventDispatch;
    let registerExecutorEvents;
    let stateCompare;

    beforeEach(function() {
        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../../../../../lib/executor/executor-event-dispatch/register-executor-events.js');

        executeTestCase = {
            on: sinon.stub(),
            configure: sinon.stub(),
        };
        driverHandler = {
            inSauceLabs: sinon.stub(),
            locally: sinon.stub(),
            quit: sinon.stub(),
            handleError: sinon.stub(),
        };
        reporters = {
            teamcity: {
                reportStartAction: sinon.stub(),
                reportFinishedAction: sinon.stub(),
                reportEndStep: sinon.stub(),
                reportDone: sinon.stub(),
            },
            basic: {
                reportStartAction: sinon.stub(),
                reportEndStep: sinon.stub(),
                reportDone: sinon.stub(),
            },
        };
        executionEngine = {
            on: sinon.stub(),
            configure: sinon.stub(),
            errorOccurred: sinon.stub(),
            done: sinon.stub(),
            applyEffects: sinon.stub(),
            applyPreconditions: sinon.stub(),
        };
        eeReportHandler = {
            on: sinon.stub(),
            startReport: sinon.stub(),
            recordNewAction: sinon.stub(),
            recordNewStep: sinon.stub(),
            appendReportError: sinon.stub(),
            finalizeReport: sinon.stub(),
            handleError: sinon.stub(),
        };
        eePrintReport = {
            printOutputToConsole: sinon.stub(),
        };
        assertionHandler = {
            on: sinon.stub(),
            assertPageState: sinon.stub(),
            assertExpectedPageState: sinon.stub(),
        };
        executorEventDispatch = {
            on: sinon.stub(),
            emit: sinon.stub(),
        };

        stateCompare = {
            printDifference: sinon.stub(),
        };

        mockery.registerMock('../execute-test-case.js', executeTestCase);
        mockery.registerMock('../driver-handler.js', driverHandler);
        mockery.registerMock('../reporters', reporters);
        mockery.registerMock('../execution-engine/execution-engine.js', executionEngine);
        mockery.registerMock('../execution-engine/execution-engine-report-handler.js', eeReportHandler);
        mockery.registerMock('../execution-engine/execution-engine-print-report.js', eePrintReport);
        mockery.registerMock('../assertion-handler.js', assertionHandler);
        mockery.registerMock('../state-compare.js', stateCompare);

        registerExecutorEvents =
            require('../../../../../lib/executor/executor-event-dispatch/register-executor-events.js');
    });

    afterEach(function() {
        mockery.resetCache();
        mockery.deregisterAll();
        mockery.disable();
    });

    it('should call executorEventDispatch.on once', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executorEventDispatch.on.callCount).to.equal(1);
    });

    it('should call executorEventDispatch.on with the event \'executor.scheduled\' ' +
        'and the function executeTestCase.configure', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executorEventDispatch.on.args[0]).to.deep.equal([
            'executor.scheduled',
            executeTestCase.configure,
        ]);
    });

    it('should call executeTestCase.on 8 times', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executeTestCase.on.callCount).to.equal(9);
    });

    it('should call executeTestCase.on with the event \'executeTestCase.exceptionCaught\' ' +
        'and the function eeReportHandler.errorOccurred', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executeTestCase.on.args[0]).to.deep.equal([
            'executeTestCase.exceptionCaught',
            executionEngine.errorOccurred,
        ]);
    });

    it('should call executeTestCase.on with the event \'executeTestCase.exceptionCaught\' ' +
        'and the function eeReportHandler.errorOccurred', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executeTestCase.on.args[1]).to.deep.equal([
            'executeTestCase.errorHandled',
            executionEngine.done,
        ]);
    });

    it('should call executeTestCase.on with the event \'executeTestCase.loadComponents\'', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executeTestCase.on.args[2][0]).to.deep.equal('executeTestCase.loadComponents');
    });

    describe('when the callback is called for executeTestCase.on with the event ' +
        'executeTestCase.loadComponents', function() {
        it('should call executeEventDispatch.emit with the event \'executeTestCase.loadComponents\'' +
            'and the passed in componentsPath', function() {
            executeTestCase.on.onCall(2).callsArgWith(1, 'aPath');

            registerExecutorEvents(executorEventDispatch);

            expect(executorEventDispatch.emit.args).to.deep.equal([
                [
                    'executor.loadComponents',
                    'aPath',
                ],
            ]);
        });
    });

    it('should call executeTestCase.on with the event \'executeTestCase.driverSetToSauce\' ' +
        'and the function driverHandler.inSaucelabs', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executeTestCase.on.args[3]).to.deep.equal([
            'executeTestCase.driverSetToSauce',
            driverHandler.inSaucelabs,
        ]);
    });

    it('should call executeTestCase.on with the event \'executeTestCase.driverSetToLocal\' ' +
        'and the function driverHandler.locally', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executeTestCase.on.args[4]).to.deep.equal([
            'executeTestCase.driverSetToLocal',
            driverHandler.locally,
        ]);
    });

    it('should call executeTestCase.on with the event \'executeTestCase.configured\' ' +
        'and the function driverHandler.locally', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executeTestCase.on.args[5]).to.deep.equal([
            'executeTestCase.configured',
            executionEngine.configure,
        ]);
    });

    it('should call executeTestCase.on with the event \'executeTestCase.reporterSetToTeamcity\'', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executeTestCase.on.args[6][0]).to.deep.equal('executeTestCase.reporterSetToTeamcity');
    });

    describe('when the callback is called for executeTestCase.on with the event ' +
        'executeTestCase.reporterSetToTeamcity', function() {
        it('should call executionEngine.on 14 times', function() {
            executeTestCase.on.onCall(6).callsArg(1);

            registerExecutorEvents(executorEventDispatch);

            expect(executionEngine.on.callCount).to.equal(14);
        });

        it('should call executionEngine.on with the event \'executionEngine.actionStarted\'' +
            'and the passed in the function reporters.teamcity.reportStartAction', function() {
            executeTestCase.on.onCall(6).callsArg(1);

            registerExecutorEvents(executorEventDispatch);

            expect(executionEngine.on.args[0]).to.deep.equal([
                'executionEngine.actionStarted',
                reporters.teamcity.reportStartAction,
            ]);
        });

        it('should call executionEngine.on with the event \'executionEngine.actionFinsihed\'' +
            'and the passed in the function reporters.teamcity.reportFinishedAction', function() {
            executeTestCase.on.onCall(6).callsArg(1);

            registerExecutorEvents(executorEventDispatch);

            expect(executionEngine.on.args[1]).to.deep.equal([
                'executionEngine.actionFinsihed',
                reporters.teamcity.reportFinishedAction,
            ]);
        });

        it('should call executionEngine.on with the event \'executionEngine.stepEnded\'' +
            'and the passed in the function reporters.teamcity.reportEndStep', function() {
            executeTestCase.on.onCall(6).callsArg(1);

            registerExecutorEvents(executorEventDispatch);

            expect(executionEngine.on.args[2]).to.deep.equal([
                'executionEngine.stepEnded',
                reporters.teamcity.reportEndStep,
            ]);
        });
    });

    it('should call executeTestCase.on with the event \'executeTestCase.reporterSetToBasic\'', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executeTestCase.on.args[7][0]).to.deep.equal('executeTestCase.reporterSetToBasic');
    });

    describe('when the callback is called for executeTestCase.on with the event ' +
        'executeTestCase.reporterSetToBasic', function() {
        it('should call executionEngine.on 13 times', function() {
            executeTestCase.on.onCall(7).callsArg(1);

            registerExecutorEvents(executorEventDispatch);

            expect(executionEngine.on.callCount).to.equal(13);
        });

        it('should call executionEngine.on with the event \'executionEngine.actionStarted\'' +
            'and the passed in the function reporters.basic.reportStartAction', function() {
            executeTestCase.on.onCall(7).callsArg(1);

            registerExecutorEvents(executorEventDispatch);

            expect(executionEngine.on.args[0]).to.deep.equal([
                'executionEngine.actionStarted',
                reporters.basic.reportStartAction,
            ]);
        });

        it('should call executionEngine.on with the event \'executionEngine.stepEnded\'' +
            'and the passed in the function reporters.basic.reportEndStep', function() {
            executeTestCase.on.onCall(7).callsArg(1);

            registerExecutorEvents(executorEventDispatch);

            expect(executionEngine.on.args[1]).to.deep.equal([
                'executionEngine.stepEnded',
                reporters.basic.reportEndStep,
            ]);
        });
    });

    it('should call executeTestCase.on with the event \'executeTestCase.finished\'', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executeTestCase.on.args[8][0]).to.deep.equal('executeTestCase.finished');
    });

    describe('when the callback is called for executeTestCase.on with the event ' +
        'executeTestCase.finished', function() {
        it('should call executeEventDispatch.emit with the event \'executor.ended\'' +
            'and the passed in callback', function() {
            executeTestCase.on.onCall(8).callsArg(1);

            registerExecutorEvents(executorEventDispatch);

            expect(executorEventDispatch.emit.args).to.deep.equal([
                [
                    'executor.ended',
                ],
            ]);
        });
    });

    it('should call executionEngine.on 11 times', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executionEngine.on.callCount).to.equal(11);
    });

    it('should call executionEngine.on with the event \'executionEngine.configured\' ' +
        'and the function eeReportHandler.startReport', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executionEngine.on.args[0]).to.deep.equal([
            'executionEngine.configured',
            eeReportHandler.startReport,
        ]);
    });

    it('should call executionEngine.on with the event \'executionEngine.actionStarted\' ' +
        'and the function eeReportHandler.recordNewAction', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executionEngine.on.args[1]).to.deep.equal([
            'executionEngine.actionStarted',
            eeReportHandler.recordNewAction,
        ]);
    });

    it('should call executionEngine.on with the event \'executionEngine.stepStarted\' ' +
        'and the function eeReportHandler.recordNewStep', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executionEngine.on.args[2]).to.deep.equal([
            'executionEngine.stepStarted',
            eeReportHandler.recordNewStep,
        ]);
    });

    it('should call executionEngine.on with the event \'executionEngine.actionErrored\' ' +
        'and the function eeReportHandler.appendReportError', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executionEngine.on.args[3]).to.deep.equal([
            'executionEngine.actionErrored',
            eeReportHandler.appendReportError,
        ]);
    });

    it('should call executionEngine.on with the event \'executionEngine.done\' ' +
        'and the function eeReportHandler.finalizeReport', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executionEngine.on.args[4]).to.deep.equal([
            'executionEngine.done',
            eeReportHandler.finalizeReport,
        ]);
    });

    it('should call executionEngine.on with the event \'executionEngine.done\' ' +
        'and the function driverHandler.quit', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executionEngine.on.args[5]).to.deep.equal([
            'executionEngine.done',
            driverHandler.quit,
        ]);
    });

    it('should call executionEngine.on with the event \'executionEngine.preconditionsReadyForVerification\' ' +
        'and the function assertionHandler.assertPageState', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executionEngine.on.args[6]).to.deep.equal([
            'executionEngine.preconditionsReadyForVerification',
            assertionHandler.assertPageState,
        ]);
    });

    it('should call executionEngine.on with the event \'executionEngine.effectsReadyForVerification\' ' +
        'and the function assertionHandler.assertExpectedPageState', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executionEngine.on.args[7]).to.deep.equal([
            'executionEngine.effectsReadyForVerification',
            assertionHandler.assertExpectedPageState,
        ]);
    });

    it('should call executionEngine.on with the event \'executionEngine.createExpectedState\'', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executionEngine.on.args[8][0]).to.deep.equal('executionEngine.createExpectedState');
    });

    describe('when the callback is called for executionEngine.on with the event ' +
        'executionEngine.createExpectedState', function() {
        it('should call executeEventDispatch.emit with the event \'executor.createExpectedState\'' +
            ', the dataStore, and the passed in callback', function() {
            let callback = sinon.spy();
            executionEngine.on.onCall(8).callsArgWith(1, 'myDataStore', callback);

            registerExecutorEvents(executorEventDispatch);

            expect(executorEventDispatch.emit.args).to.deep.equal([
                [
                    'executor.createExpectedState',
                    'myDataStore',
                    callback,
                ],
            ]);
        });
    });

    it('should call executionEngine.on with the event \'executionEngine.createDataStore\'', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executionEngine.on.args[9][0]).to.deep.equal('executionEngine.createDataStore');
    });

    describe('when the callback is called for executionEngine.on with the event ' +
        'executionEngine.createDataStore', function() {
        it('should call executeEventDispatch.emit with the event \'executor.createDataStore\'' +
            'and the passed in callback', function() {
            let callback = sinon.spy();
            executionEngine.on.onCall(9).callsArgWith(1, callback);

            registerExecutorEvents(executorEventDispatch);

            expect(executorEventDispatch.emit.args).to.deep.equal([
                [
                    'executor.createDataStore',
                    callback,
                ],
            ]);
        });
    });

    it('should call executionEngine.on with the event \'executionEngine.getComponents\'', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(executionEngine.on.args[10][0]).to.deep.equal('executionEngine.getComponents');
    });

    describe('when the callback is called for executionEngine.on with the event ' +
        'executionEngine.getComponents', function() {
        it('should call executeEventDispatch.emit with the event \'executor.getComponents\'' +
            'and the passed in callback', function() {
            let callback = sinon.spy();
            executionEngine.on.onCall(10).callsArgWith(1, callback);

            registerExecutorEvents(executorEventDispatch);

            expect(executorEventDispatch.emit.args).to.deep.equal([
                [
                    'executor.getComponents',
                    callback,
                ],
            ]);
        });
    });

    it('should call eeReportHandler.on 3 times', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(eeReportHandler.on.callCount).to.equal(3);
    });

    it('should call eeReportHandler.on with the event \'eeReportHandler.reportFinalized\' ' +
        'and the function eePrintReport.printOutputToConsole', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(eeReportHandler.on.args[0]).to.deep.equal([
            'eeReportHandler.reportFinalized',
            eePrintReport.printOutputToConsole,
        ]);
    });

    it('should call eeReportHandler.on with the event \'eeReportHandler.reportFinalized\' ' +
        'and the function executeTestCase.finishTestCase', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(eeReportHandler.on.args[1]).to.deep.equal([
            'eeReportHandler.reportFinalized',
            executeTestCase.finishTestCase,
        ]);
    });

    it('should call eeReportHandler.on with the event \'eeReportHandler.errorOccured\' ' +
        'and the function driverHandler.handleError', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(eeReportHandler.on.args[2]).to.deep.equal([
            'eeReportHandler.errorOccured',
            driverHandler.handleError,
        ]);
    });

    it('should call assertionHandler.on 6 times', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(assertionHandler.on.callCount).to.equal(6);
    });

    it('should call assertionHandler.on with the event \'assertionHandler.getPageState\'', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(assertionHandler.on.args[0][0]).to.deep.equal('assertionHandler.getPageState');
    });

    describe('when the callback is called for assertionHandler.on with the event ' +
        'assertionHandler.getPageState', function() {
        it('should call executeEventDispatch.emit with the event \'executor.getPageState\'' +
            'and the passed in components and callback', function() {
            let callback = sinon.spy();
            assertionHandler.on.onCall(0).callsArgWith(1, {component: 'myComponent'}, callback);

            registerExecutorEvents(executorEventDispatch);

            expect(executorEventDispatch.emit.args).to.deep.equal([
                [
                    'executor.getPageState',
                    {component: 'myComponent'},
                    callback,
                ],
            ]);
        });
    });

    it('should call assertionHandler.on with the event \'assertionHandler.runAssertions\'', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(assertionHandler.on.args[1][0]).to.deep.equal('assertionHandler.runAssertions');
    });

    describe('when the callback is called for assertionHandler.on with the event ' +
        'assertionHandler.runAssertions', function() {
        it('should call executeEventDispatch.emit with the event \'executor.runAssertions\'' +
            'and the passed in state, assertions and callback', function() {
            let callback = sinon.spy();
            assertionHandler.on.onCall(1).callsArgWith(
                1,
                {displayed: true},
                {data: 'myData'},
                [['isTrue', 'myElem.displayed']],
                callback
            );

            registerExecutorEvents(executorEventDispatch);

            expect(executorEventDispatch.emit.args).to.deep.equal([
                [
                    'executor.runAssertions',
                    {displayed: true},
                    {data: 'myData'},
                    [['isTrue', 'myElem.displayed']],
                    callback,
                ],
            ]);
        });
    });

    it('should call assertionHandler.on with the event \'assertionHandler.runDeepEqual\'', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(assertionHandler.on.args[2][0]).to.deep.equal('assertionHandler.runDeepEqual');
    });

    describe('when the callback is called for assertionHandler.on with the event ' +
        'assertionHandler.runDeepEqual', function() {
        it('should call executeEventDispatch.emit with the event \'executor.runDeepEqual\'' +
            'and the passed in state, expectedState and callback', function() {
            let callback = sinon.spy();
            assertionHandler.on.onCall(2).callsArgWith(
                1,
                {displayed: true},
                {displayed: true},
                callback
            );

            registerExecutorEvents(executorEventDispatch);

            expect(executorEventDispatch.emit.args).to.deep.equal([
                [
                    'executor.runDeepEqual',
                    {displayed: true},
                    {displayed: true},
                    callback,
                ],
            ]);
        });
    });

    it('should call assertionHandler.on with the event \'assertionHandler.stateCheckTimedOut\''
        + 'and the function stateCompare.printDifference', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(assertionHandler.on.args[3]).to.deep.equal([
            'assertionHandler.stateCheckTimedOut',
            stateCompare.printDifference,
        ]);
    });

    it('should call assertionHandler.on with the event \'assertionHandler.effectsVerified\''
        + 'and the function executionEngine.applyEffects', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(assertionHandler.on.args[4]).to.deep.equal([
            'assertionHandler.effectsVerified',
            executionEngine.applyEffects,
        ]);
    });

    it('should call assertionHandler.on with the event \'assertionHandler.preconditionsVerified\''
        + 'and the function executionEngine.applyPreconditions', function() {
        registerExecutorEvents(executorEventDispatch);

        expect(assertionHandler.on.args[5]).to.deep.equal([
            'assertionHandler.preconditionsVerified',
            executionEngine.applyPreconditions,
        ]);
    });
});
