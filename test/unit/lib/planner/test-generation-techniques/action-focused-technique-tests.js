'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/test-generation-techniques/action-focused-technique.js', function() {
    describe('on file being required', function() {
        let Emitter;
        let actionFocusedTechnique;
        let plannerEventDispatch;

        beforeEach(function() {
            mockery.enable({useCleanCache: true});
            mockery.registerAllowable(
                '../../../../../lib/planner/test-generatorion-techniques/action-focused-technique.js'
            );

            Emitter = {
                mixIn: function(myObject) {
                    myObject.on = sinon.stub();
                    myObject.emit = sinon.stub();
                },
            };
            sinon.spy(Emitter, 'mixIn');
            plannerEventDispatch = sinon.stub();

            mockery.registerMock('../../util/set-operations.js', {});
            mockery.registerMock('../../util/emitter.js', Emitter);
            mockery.registerMock('../planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
        });

        afterEach(function() {
            mockery.resetCache();
            mockery.deregisterAll();
            mockery.disable();
        });

        it('should call Emitter.mixIn with actionFocusedTechnique and plannerEventDispatch', function() {
            actionFocusedTechnique = require(
                '../../../../../lib/planner/test-generatorion-techniques/action-focused-technique.js'
            );

            expect(Emitter.mixIn.args).to.deep.equal([
                [
                    actionFocusedTechnique,
                    plannerEventDispatch,
                ],
            ]);
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
