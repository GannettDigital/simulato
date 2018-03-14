'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/executor/reporters/basic-reporter.js', function() {
    describe('reportStartAction', function() {
        let basicReporter;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/reporters/basic-reporter.js');

            sinon.spy(console, 'log');

            basicReporter = require('../../../../../lib/executor/reporters/basic-reporter.js');
        });

        afterEach(function() {
            console.log.restore();
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call console.log once with the passed in actionConfig.instanceName and' +
            'actionConfig.actionName in a string', function() {
            basicReporter.reportStartAction('', {instanceName: 'myInstance', actionName: 'myAction'});

            expect(console.log.args).to.deep.equal([[
                'myInstance - myAction',
            ]]);
        });
    });

    describe('reportEndStep', function() {
        let basicReporter;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable('../../../../../lib/executor/reporters/basic-reporter.js');

            sinon.spy(console, 'log');

            basicReporter = require('../../../../../lib/executor/reporters/basic-reporter.js');
        });

        afterEach(function() {
            console.log.restore();
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call console.log once with a green check mark and the step if the result is \'pass\'', function() {
            basicReporter.reportEndStep('', '', '', 'myStep', 'pass');

            expect(console.log.args).to.deep.equal([[
                '\t✓ myStep',
            ]]);
        });

        it('should call console.log with a red x and the step if the result is \'fails\'', function() {
            basicReporter.reportEndStep('', '', '', 'myStep', 'fail');

            expect(console.log.args).to.deep.equal([[
                '\t❌ myStep',
            ]]);
        });
    });
});
