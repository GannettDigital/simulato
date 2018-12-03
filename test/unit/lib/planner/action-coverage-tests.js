'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/planner/action-coverage.js', function() {
  describe('on file require', function() {
    let Emitter;
    let plannerEventDispatch;
    let actionCoverage;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/planner/action-coverage.js');


      Emitter = {
        mixIn: function(myObject) {
          myObject.emitAsync = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      plannerEventDispatch = sinon.stub();

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('./planner-event-dispatch/planner-event-dispatch.js', plannerEventDispatch);
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should Emitter.mixIn once with actionCoverage and plannerEventDispatch ' +
            'as parameters', function() {
      actionCoverage = require('../../../../lib/planner/action-coverage.js');

      expect(Emitter.mixIn.args).to.deep.equal([
        [
          actionCoverage,
          plannerEventDispatch,
        ],
      ]);
    });
  });

  describe('reportCoverage', function() {
    let Emitter;
    let next;
    let actionCoverage;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable('../../../../lib/planner/action-coverage.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.emitAsync = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      sinon.spy(console, 'log');
      next = sinon.stub();

      mockery.registerMock('../util/emitter.js', Emitter);
      mockery.registerMock('./planner-event-dispatch/planner-event-dispatch.js', {});

      actionCoverage = require('../../../../lib/planner/action-coverage.js');
    });

    afterEach(function() {
      console.log.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call actionCoverage.emit once with the event "countActions.calculate", ' +
      'plans, discoveredActions, and next', function() {
      let generator = actionCoverage.reportCoverage('plans', 'discoveredActions');

      generator.next();
      generator.next(next);

      expect(actionCoverage.emitAsync.args).to.deep.equal([
        [
          'countActions.calculate',
          'plans',
          'discoveredActions',
          next,
        ],
      ]);
    });

    it('should report the coverage percentage to a precision of 5', function() {
      let actionsNotCovered = new Set([
        'action2',
      ]);
      let actionOccurrences = new Map([
        ['action1', 1],
        ['action2', 0],
      ]);
      let generator = actionCoverage.reportCoverage();

      generator.next();
      generator.next(next);
      generator.next({actionOccurrences, actionsNotCovered});

      expect(console.log.args[7]).to.deep.equal([
        '\nAction Coverage Percentage: 50.000%',
      ]);
    });

    describe('when there are not actionOccurrences or actionsNotCovered', function() {
      it('should call console.log  4 times', function() {
        let generator = actionCoverage.reportCoverage();

        generator.next();
        generator.next(next);
        generator.next({actionOccurrences: new Map(), actionsNotCovered: new Set()});

        expect(console.log.callCount).to.equal(4);
      });

      it('should call console.log  with a starting report string', function() {
        let generator = actionCoverage.reportCoverage();

        generator.next();
        generator.next(next);
        generator.next({actionOccurrences: new Map(), actionsNotCovered: new Set()});

        expect(console.log.args[0]).to.deep.equal([
          '\n-- Action Coverage Report --',
        ]);
      });

      it('should call console.log  with a action occurrences section header', function() {
        let generator = actionCoverage.reportCoverage();

        generator.next();
        generator.next(next);
        generator.next({actionOccurrences: new Map(), actionsNotCovered: new Set()});

        expect(console.log.args[1]).to.deep.equal([
          '\nAction Occurrences',
        ]);
      });

      it('should call console.log  with the action coverage fraction', function() {
        let generator = actionCoverage.reportCoverage();

        generator.next();
        generator.next(next);
        generator.next({actionOccurrences: new Map(), actionsNotCovered: new Set()});

        expect(console.log.args[2]).to.deep.equal([
          '\nAction Coverage: 0 / 0',
        ]);
      });

      it('should call console.log  with the action coverage percentage', function() {
        let generator = actionCoverage.reportCoverage();

        generator.next();
        generator.next(next);
        generator.next({actionOccurrences: new Map(), actionsNotCovered: new Set()});

        expect(console.log.args[3]).to.deep.equal([
          '\nAction Coverage Percentage: NaN%',
        ]);
      });
    });

    describe('for each action occurence', function() {
      it('should call console.log with the action and the occurrences', function() {
        let actionOccurrences = new Map([
          ['action1', 2],
          ['action2', 1],
        ]);
        let generator = actionCoverage.reportCoverage();

        generator.next();
        generator.next(next);
        generator.next({actionOccurrences, actionsNotCovered: new Set()});

        expect(console.log.args.slice(2, 4)).to.deep.equal([
          [
            '\taction1: 2',
          ],
          [
            '\taction2: 1',
          ],
        ]);
      });
    });

    describe('if actionsNotCovered.size is greater than 0', function() {
      it('should call console.log with the number of actions not covered', function() {
        let actionsNotCovered = new Set([
          'action1',
          'action2',
        ]);
        let generator = actionCoverage.reportCoverage();

        generator.next();
        generator.next(next);
        generator.next({actionOccurrences: new Map(), actionsNotCovered: actionsNotCovered});

        expect(console.log.args[2]).to.deep.equal([
          '\nActions Not Covered: 2',
        ]);
      });

      describe('for each action not covered', function() {
        it('should call console.log with the action', function() {
          let actionsNotCovered = new Set([
            'action1',
            'action2',
          ]);
          let actionOccurrences = new Map([
            ['action1', 0],
            ['action2', 0],
          ]);
          let generator = actionCoverage.reportCoverage();

          generator.next();
          generator.next(next);
          generator.next({actionOccurrences, actionsNotCovered});

          expect(console.log.args.slice(5, 7)).to.deep.equal([
            [
              '\taction1',
            ],
            [
              '\taction2',
            ],
          ]);
        });
      });
    });
  });
});
