'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/test-generation-techniques/action-focused-technique.js', function() {
    describe('on file being required', function() {
        let EventEmitter;
        let EventEmitterInstance;
        let actionFocusedTechnique;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/test-generatorion-techniques/action-focused-technique.js'
            );

            EventEmitter = sinon.stub();
            EventEmitterInstance = {
                emit: sinon.stub(),
                on: sinon.stub(),
            };
            EventEmitter.returns(EventEmitterInstance);

            mockery.registerMock('../../util/set-operations.js', {});
            mockery.registerMock('events', {EventEmitter});
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should set the object prototype of executionEngine to a new EventEmitter', function() {
            actionFocusedTechnique = require(
                '../../../../../lib/planner/test-generatorion-techniques/action-focused-technique.js'
            );

            expect(Object.getPrototypeOf(actionFocusedTechnique)).to.deep.equal(EventEmitterInstance);
        });

        it('should call actionFocusedTechnique.on once', function() {
            actionFocusedTechnique = require(
                '../../../../../lib/planner/test-generatorion-techniques/action-focused-technique.js'
            );

            expect(actionFocusedTechnique.on.callCount).to.equal(1);
        });

        it('should call actionFocusedTechnique.on with the event \'actionFocusedTechnique.plansCreated\' ' +
            'and the function actionFocusedTechnique._reduceToMinimumSetOfPlans', function() {
            actionFocusedTechnique = require(
                '../../../../../lib/planner/test-generatorion-techniques/action-focused-technique.js'
            );

            expect(actionFocusedTechnique.on.args[0]).to.deep.equal([
                'actionFocusedTechnique.plansCreated',
                actionFocusedTechnique._reduceToMinimumSetOfPlans,
            ]);
        });
    });
});
