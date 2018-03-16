'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/executor/reporters/index.js', function() {
    let basicReporter;
    let teamcityReporter;

    beforeEach(function() {
        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../../../../../lib/executor/reporters/index.js');

        basicReporter = sinon.stub();
        teamcityReporter = sinon.stub();

        mockery.registerMock('./basic-reporter.js', basicReporter);
        mockery.registerMock('./teamcity-reporter.js', teamcityReporter);
    });

    afterEach(function() {
        mockery.resetCache();
        mockery.deregisterAll();
        mockery.disable();
    });

    it('should export 2 items on an object', function() {
        let result = require('../../../../../lib/executor/reporters/index.js');

        expect(Object.getOwnPropertyNames(result).length).to.equal(2);
    });

    it('should have the property \'basic\' with the value from requiring \'./basic-reporter.js\'', function() {
        let result = require('../../../../../lib/executor/reporters/index.js');

        expect(result.basic).to.deep.equal(basicReporter);
    });

    it('should have the property \'teamcity\' with the value from requiring \'./teamcity-reporter.js\'', function() {
        let result = require('../../../../../lib/executor/reporters/index.js');

        expect(result.teamcity).to.deep.equal(teamcityReporter);
    });
});
