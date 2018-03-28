'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/executor/execution-engine/execution-engine-print-report.js', function() {
    describe('printOutputToConsole', function() {
        let report;
        let executionEnginePrintReport;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/execution-engine/execution-engine-print-report.js');

            report = {
                testName: 'My Test',
                actionCount: 10,
                time: [123, 456],
            };
            sinon.spy(console, 'log');

            executionEnginePrintReport =
                require('../../../../../lib/executor/execution-engine/execution-engine-print-report.js');
        });

        afterEach(function() {
            console.log.restore();
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call console.log 4 times', function() {
            executionEnginePrintReport.printOutputToConsole(report);

            expect(console.log.callCount).to.equal(4);
        });

        it('should call console.log with the test summary message and the report.testName', function() {
            executionEnginePrintReport.printOutputToConsole(report);

            expect(console.log.args[0]).to.deep.equal(['\nTest Summary']);
        });

        it('should call console.log with the total actions run from report.actionCount', function() {
            executionEnginePrintReport.printOutputToConsole(report);

            expect(console.log.args[1]).to.deep.equal(['\tTotal actions run: 10']);
        });

        it('should call console.log with the run time from report.time', function() {
            executionEnginePrintReport.printOutputToConsole(report);

            expect(console.log.args[2]).to.deep.equal(['\tRun time: 123.456 seconds']);
        });

        it('should call console.log with test ended and the name from report.testName', function() {
            executionEnginePrintReport.printOutputToConsole(report);

            expect(console.log.args[3]).to.deep.equal(['\n--- Test Ended: My Test ---\n']);
        });

        describe('if report.error is an error', function() {
            it('should call console.log 7 times if there are two errors', function() {
                report.error = {
                    name: 'My Error',
                    nameOfComponent: 'Instance 1',
                    actionName: 'THIS_ACTION',
                    failedStep: 'preconditions',
                };

                executionEnginePrintReport.printOutputToConsole(report);

                expect(console.log.callCount).to.equal(7);
            });

            it('should print the failed action with the report.error.name and ' +
                'report.error.actionName', function() {
                report.error = {
                    name: 'My Error',
                    nameOfComponent: 'Instance 1',
                    actionName: 'THIS_ACTION',
                    failedStep: 'preconditions',
                };

                executionEnginePrintReport.printOutputToConsole(report);

                expect(console.log.args[3]).to.deep.equal(['\tFailed Action: Instance 1 - THIS_ACTION']);
            });

            it('should print the step from report.error.failedStep', function() {
                report.error = {
                    name: 'My Error',
                    nameOfComponent: 'Instance 1',
                    actionName: 'THIS_ACTION',
                    failedStep: 'preconditions',
                };

                executionEnginePrintReport.printOutputToConsole(report);

                expect(console.log.args[4]).to.deep.equal(['\t\tStep: preconditions']);
            });

            it('should print the error\'s name from report.error.name', function() {
                report.error = {
                    name: 'My Error',
                    nameOfComponent: 'Instance 1',
                    actionName: 'THIS_ACTION',
                    failedStep: 'preconditions',
                };

                executionEnginePrintReport.printOutputToConsole(report);

                expect(console.log.args[5]).to.deep.equal(['\t\t\tError: My Error']);
            });
        });
    });
});
