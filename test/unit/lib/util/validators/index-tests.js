'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/validators/index.js', function() {
    let validateElements;
    let validateModel;
    let validateTestCases;
    let validateComponents;
    let validateEvents;
    let validateChildren;
    let validateActions;

    beforeEach(function() {
        mockery.enable({useCleanCache: true});
        mockery.registerAllowable('../../../../../lib/util/validators/index.js');

        validateElements = sinon.stub();
        validateModel = {
            validate: sinon.stub(),
        };
        validateTestCases = sinon.stub();
        validateComponents = sinon.stub();
        validateEvents = sinon.stub();
        validateChildren = sinon.stub();
        validateActions = {
            validate: sinon.stub(),
        };

        mockery.registerMock('./validate-elements.js', validateElements);
        mockery.registerMock('./validate-model.js', validateModel);
        mockery.registerMock('./validate-test-cases.js', validateTestCases);
        mockery.registerMock('./validate-components.js', validateComponents);
        mockery.registerMock('./validate-events.js', validateEvents);
        mockery.registerMock('./validate-children.js', validateChildren);
        mockery.registerMock('./validate-actions.js', validateActions);
    });

    afterEach(function() {
        mockery.resetCache();
        mockery.deregisterAll();
        mockery.disable();
    });

    it('should export 7 items on an object', function() {
        let result = require('../../../../../lib/util/validators/index.js');

        expect(Object.getOwnPropertyNames(result).length).to.equal(7);
    });

    it('should have the property \'validateElements\' with the value from requiring'
        + ' \'./validate-elements.js\'', function() {
        let result = require('../../../../../lib/util/validators/index.js');

        expect(result.validateElements).to.deep.equal(validateElements);
    });

    it('should have the property \'validateModel\' with the value from requiring'
        + ' \'./validate-model.js\'.validate', function() {
        let result = require('../../../../../lib/util/validators/index.js');

        expect(result.validateModel).to.deep.equal(validateModel.validate);
    });

    it('should have the property \'validateTestCases\' with the value from requiring'
        + ' \'./validate-test-cases.js\'', function() {
        let result = require('../../../../../lib/util/validators/index.js');

        expect(result.validateTestCases).to.deep.equal(validateTestCases);
    });

    it('should have the property \'validateComponents\' with the value from requiring'
        + ' \'./validate-components.js\'', function() {
        let result = require('../../../../../lib/util/validators/index.js');

        expect(result.validateComponents).to.deep.equal(validateComponents);
    });

    it('should have the property \'validateEvents\' with the value from requiring'
        + ' \'./validate-events.js\'', function() {
        let result = require('../../../../../lib/util/validators/index.js');

        expect(result.validateEvents).to.deep.equal(validateEvents);
    });

    it('should have the property \'validateChildren\' with the value from requiring'
        + ' \'./validate-children .js\'', function() {
        let result = require('../../../../../lib/util/validators/index.js');

        expect(result.validateChildren).to.deep.equal(validateChildren);
    });

    it('should have the property \'validateActions\' with the value from requiring'
        + ' \'./validate-actions .js\'.validate', function() {
        let result = require('../../../../../lib/util/validators/index.js');

        expect(result.validateActions).to.deep.equal(validateActions.validate);
    });
});
