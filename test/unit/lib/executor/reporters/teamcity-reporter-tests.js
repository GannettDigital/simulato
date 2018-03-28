'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/executor/reporters/teamcity-reporter.js', function() {
    describe('reportStartAction', function() {
        let teamcityReporter;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/reporters/teamcity-reporter.js');

            sinon.spy(console, 'log');

            teamcityReporter = require('../../../../../lib/executor/reporters/teamcity-reporter.js');
        });

        afterEach(function() {
            console.log.restore();
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call console.log once with actionConfig.name and ' +
            'actionConfig.actionName in the teamcity format', function() {
                teamcityReporter.reportStartAction('', {name: 'myInstance', actionName: 'myAction'});

                expect(console.log.args).to.deep.equal([
                    ['##teamcity[testSuiteStarted name=\'myInstance - myAction\']'],
                ]);
        });
    });

    describe('reportEndStep', function() {
        let teamcityReporter;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/reporters/teamcity-reporter.js');

            sinon.spy(console, 'log');

            teamcityReporter = require('../../../../../lib/executor/reporters/teamcity-reporter.js');
        });

        afterEach(function() {
            console.log.restore();
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call console.log with test started and the step name', function() {
            teamcityReporter.reportEndStep('', '', '', '\'myStep');

            expect(console.log.args[0]).to.deep.equal(['##teamcity[testStarted name=\'\'myStep\']']);
        });

        describe('when there is an error and the passed in result is the string \'fail\'', function() {
            it('should call console.log with test failed, the step, and the error\'s message', function() {
                let error = new Error('myError');

                teamcityReporter.reportEndStep(error, '', '', '\'myStep', 'fail');

                expect(console.log.args[1]).to.deep.equal([
                    '##teamcity[testFailed name=\'\'myStep\' message=\'myError\']',
                ]);
            });

            it('should call console.log with test ended and the step name', function() {
                let error = new Error('myError');

                teamcityReporter.reportEndStep(error, '', '', '\'myStep', 'fail');

                expect(console.log.args[2]).to.deep.equal(['##teamcity[testFinished name=\'\'myStep\']']);
            });

            it('should call conosle.log with test suite finished with actionConfig.name and' +
                ' actionConfig.actionName', function() {
                let error = new Error('myError');

                teamcityReporter.reportEndStep(error, '',
                    {name: 'myInstance', actionName: 'actionName'}, '\'myStep', 'fail');

                expect(console.log.args[3]).to.deep.equal(
                    ['##teamcity[testSuiteFinished name=\'myInstance - actionName\']']);
            });
        });

        describe('when there is not an error', function() {
            it('should call console.log twice', function() {
                teamcityReporter.reportEndStep('', '', '', 'myStep');

                expect(console.log.callCount).to.equal(2);
            });

            it('should call console.log with test ended and the step name', function() {
                teamcityReporter.reportEndStep('', '', '', 'myStep');

                expect(console.log.args[1]).to.deep.equal(['##teamcity[testFinished name=\'myStep\']']);
            });
        });
    });

    describe('reportFinishedAction', function() {
        let teamcityReporter;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/reporters/teamcity-reporter.js');

            sinon.spy(console, 'log');

            teamcityReporter = require('../../../../../lib/executor/reporters/teamcity-reporter.js');
        });

        afterEach(function() {
            console.log.restore();
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call console.log once with actionConfig.name and ' +
            'actionConfig.actionName in the teamcity format', function() {
                teamcityReporter.reportFinishedAction('', {name: 'myInstance', actionName: 'myAction'});

                expect(console.log.args).to.deep.equal([
                    ['##teamcity[testSuiteFinished name=\'myInstance - myAction\']'],
                ]);
        });
    });
});
