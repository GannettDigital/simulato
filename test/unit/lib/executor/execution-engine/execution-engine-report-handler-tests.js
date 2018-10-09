'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/executor/execution-engine/execution-engine-report-handler.js', function() {
  describe('on file being required', function() {
    let Emitter;
    let executorEventDispatch;
    let eeReportHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');
      executorEventDispatch = sinon.stub();

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('../executor-event-dispatch/executor-event-dispatch.js', executorEventDispatch);
    });

    afterEach(function() {
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call Emitter.mixIn once with eeReportHandler and the executorEventDispatch', function() {
      eeReportHandler =
                require('../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

      expect(Emitter.mixIn.args).to.deep.equal([
        [
          eeReportHandler,
          executorEventDispatch,
        ],
      ]);
    });

    it('should call eeReportHandler.on with the event \'eeReportHandler.errorOccured\' and the ' +
            'function eeReportHandler.endAction', function() {
      eeReportHandler =
                require('../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

      expect(eeReportHandler.on.args).to.deep.equal([[
        'eeReportHandler.errorOccured',
        eeReportHandler.endAction,
      ]]);
    });
  });

  describe('startReport', function() {
    let Emitter;
    let eeReportHandler;
    let configHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      sinon.stub(process, 'hrtime').returns([123, 456]);
      configHandler = {
        get: sinon.stub(),
      };

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/config/config-handler.js', configHandler);
      mockery.registerMock('../executor-event-dispatch/executor-event-dispatch.js', {});

      eeReportHandler =
                require('../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');
    });

    afterEach(function() {
      process.hrtime.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call configHandler.get once with \'testName\'', function() {
      eeReportHandler.startReport();

      expect(configHandler.get.args).to.deep.equal([['testName']]);
    });

    it('should set eeReportHandler._report.testName to the configs testName', function() {
      configHandler.get.returns('My Test');

      eeReportHandler.startReport();

      expect(eeReportHandler._report.testName).to.equal('My Test');
    });

    it('should call process.hrtime once passing in no params', function() {
      eeReportHandler.startReport();

      expect(process.hrtime.args).to.deep.equal([[]]);
    });

    it('should set eeReportHandler._report.time to the result of the call to process.hrtime', function() {
      eeReportHandler.startReport();

      expect(eeReportHandler._report.time).to.deep.equal([123, 456]);
    });
  });

  describe('startAction', function() {
    let Emitter;
    let eeReportHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      sinon.stub(process, 'hrtime').returns([123, 456]);

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('../executor-event-dispatch/executor-event-dispatch.js', {});

      eeReportHandler =
                require('../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');
    });

    afterEach(function() {
      process.hrtime.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should push a default report to eeReportHandler._report.actions', function() {
      eeReportHandler.startAction({name: 'myName', actionName: 'MY_ACTION'});

      expect(eeReportHandler._report.actions).to.deep.equal([
        {
          component: 'myName',
          action: 'MY_ACTION',
          status: 'fail',
          time: [123, 456],
          steps: {
            preconditions: null,
            perform: null,
            effects: null,
          },
        },
      ]);
    });

    it('should set eeReportHandler._currentActionIndex to eeReportHandler._report.actions.length - 1', function() {
      eeReportHandler._report.actions = [{}, {}];
      eeReportHandler.startAction({name: 'myName', actionName: 'MY_ACTION'});

      expect(eeReportHandler._currentActionIndex).to.equal(2);
    });
  });

  describe('endAction', function() {
    let Emitter;
    let eeReportHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      sinon.stub(process, 'hrtime').returns([123, 456]);

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('../executor-event-dispatch/executor-event-dispatch.js', {});

      eeReportHandler =
                require('../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

      eeReportHandler._currentActionIndex = 0;
      eeReportHandler._report.actions = [
        {
          component: 'myName',
          action: 'MY_ACTION',
          status: 'fail',
          time: [123, 456],
          steps: {
            preconditions: null,
            perform: null,
            effects: null,
          },
        },
      ];
    });

    afterEach(function() {
      process.hrtime.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call process.hrtime once passing in the action being ended \'time\' property', function() {
      eeReportHandler.endAction();

      expect(process.hrtime.args).to.deep.equal([[[123, 456]]]);
    });

    it('should set the action being ended \'time\' property to the result of '
            + ' the call of process.hrtime', function() {
      eeReportHandler.endAction();

      expect(eeReportHandler._report.actions[0].time).to.deep.equal([123, 456]);
    });

    describe('if there is NO error specified for the current action', function() {
      it('should set the action being ended \'status\' property to \'pass\'', function() {
        eeReportHandler.endAction();

        expect(eeReportHandler._report.actions[0].status).to.equal('pass');
      });
    });

    describe('if there is an error specified for the current action', function() {
      it('should keep the action being ended \'status\' property as \'fail\'', function() {
        eeReportHandler._report.errorLocation.actionIndex = 0;

        eeReportHandler.endAction();

        expect(eeReportHandler._report.actions[0].status).to.equal('fail');
      });
    });
  });

  describe('startStep', function() {
    let Emitter;
    let eeReportHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      sinon.stub(process, 'hrtime').returns([123, 456]);

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('../executor-event-dispatch/executor-event-dispatch.js', {});

      eeReportHandler =
                require('../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

      eeReportHandler._currentActionIndex = 0;
      eeReportHandler._report.actions = [
        {
          component: 'myName',
          action: 'MY_ACTION',
          status: 'fail',
          time: [123, 456],
          steps: {
            preconditions: null,
            perform: null,
            effects: null,
          },
        },
      ];
    });

    afterEach(function() {
      process.hrtime.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call process.hrtime once passing in no params', function() {
      eeReportHandler.startStep('preconditions');

      expect(process.hrtime.args).to.deep.equal([[]]);
    });

    it('should push a default step report to ' +
            'eeReportHandler._report.actions[currentActionIndex].steps[stepName]', function() {
      eeReportHandler.startStep('effects');

      expect(eeReportHandler._report.actions[0].steps['effects']).to.deep.equal({
        status: 'fail',
        time: [123, 456],
        error: null,
      });
    });
  });

  describe('endStep', function() {
    let Emitter;
    let eeReportHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      sinon.stub(process, 'hrtime').returns([123, 456]);

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('../executor-event-dispatch/executor-event-dispatch.js', {});

      eeReportHandler =
                require('../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

      eeReportHandler._currentActionIndex = 0;
      eeReportHandler._report.actions = [
        {
          component: 'myName',
          action: 'MY_ACTION',
          status: 'fail',
          time: [123, 456],
          steps: {
            preconditions: {
              status: 'fail',
              time: [123, 456],
              error: null,
            },
            perform: {
              status: 'fail',
              time: [123, 456],
              error: null,
            },
            effects: {
              status: 'fail',
              time: [123, 456],
              error: null,
            },
          },
        },
      ];
    });

    afterEach(function() {
      process.hrtime.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should call process.hrtime once passing in the current steps \'time\' property', function() {
      eeReportHandler.endStep(null, 'preconditions');

      expect(process.hrtime.args).to.deep.equal([[[123, 456]]]);
    });

    it('should set the current steps \'time\' property to the returned value of process.hrtime', function() {
      eeReportHandler.endStep(null, 'preconditions');

      expect(eeReportHandler._report.actions[0].steps['preconditions'].time).to.deep.equal([123, 456]);
    });

    describe('if an error was passed in', function() {
      it('should set the step.error to the error passed in', function() {
        let error = new Error('Error that was thrown');
        error.code = 'error code';

        eeReportHandler.endStep(error, 'preconditions');

        expect(eeReportHandler._report.actions[0].steps['preconditions']).to.deep.equal({
          error: {
            name: 'Error',
            code: 'error code',
            stack: error.stack,
            message: 'Error that was thrown',
          },
          status: 'fail',
          time: [123, 456],
        });
      });

      it('should set the eeReportHandler._report.errorLocation', function() {
        let error = new Error('Error that was thrown');
        error.code = 'error code';

        eeReportHandler.endStep(error, 'preconditions');

        expect(eeReportHandler._report.errorLocation).to.deep.equal({
          actionIndex: 0,
          step: 'preconditions',
        });
      });

      it('should call eeReportHandler.emit with the event \'eeReportHandler.errorOccured\'', function() {
        let error = new Error('Error that was thrown');
        error.code = 'error code';

        eeReportHandler.endStep(error, 'preconditions');

        expect(eeReportHandler.emit.args).to.deep.equal([[
          'eeReportHandler.errorOccured',
        ]]);
      });
    });

    describe('if NO error was passed in', function() {
      it('should set the current steps status to \'pass\'', function() {
        eeReportHandler.endStep(null, 'preconditions');

        expect(eeReportHandler._report.actions[0].steps['preconditions']).to.deep.equal({
          error: null,
          status: 'pass',
          time: [123, 456],
        });
      });
    });
  });

  describe('appendStateCompare', function() {
    let Emitter;
    let eeReportHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      sinon.stub(process, 'hrtime').returns([123, 456]);

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('../executor-event-dispatch/executor-event-dispatch.js', {});

      eeReportHandler =
                require('../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

      eeReportHandler._currentActionIndex = 0;
      eeReportHandler._report.actions = [
        {
          component: 'myName',
          action: 'MY_ACTION',
          status: 'fail',
          time: [123, 456],
          steps: {
            preconditions: {
              status: 'fail',
              time: [123, 456],
              error: null,
            },
            perform: {
              status: 'fail',
              time: [123, 456],
              error: null,
            },
            effects: {
              status: 'fail',
              time: [123, 456],
              error: null,
            },
          },
        },
      ];
    });

    afterEach(function() {
      process.hrtime.restore();
      mockery.resetCache();
      mockery.deregisterAll();
      mockery.disable();
    });

    it('should set the current actions effects step the stateCompare to the passed in string', function() {
      eeReportHandler.appendStateCompare('state compare string');

      expect(eeReportHandler._report.actions[0].steps['effects'].stateCompare).to.equal('state compare string');
    });
  });

  describe('finalizeReport', function() {
    let Emitter;
    let eeReportHandler;

    beforeEach(function() {
      mockery.enable({useCleanCache: true});
      mockery.registerAllowable(
          '../../../../../lib/executor/execution-engine/execution-engine-report-handler.js');

      Emitter = {
        mixIn: function(myObject) {
          myObject.on = sinon.stub();
          myObject.emit = sinon.stub();
        },
      };
      sinon.spy(Emitter, 'mixIn');

      sinon.stub(process, 'hrtime').returns([123, 456]);
      process.send = sinon.stub();

      mockery.registerMock('../../util/emitter.js', Emitter);
      mockery.registerMock('../../util/config/config-handler.js', {});
      mockery.registerMock('../executor-event-dispatch/executor-event-dispatch.js', {});

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
      eeReportHandler._report.time = [111, 222];

      eeReportHandler.finalizeReport();

      expect(process.hrtime.args).deep.equal([
        [[111, 222]],
      ]);
    });

    it('should set eeReportHandler._report.time to the result of the call process.hrtime', function() {
      eeReportHandler.finalizeReport();

      expect(eeReportHandler._report.time).deep.equal([123, 456]);
    });

    describe('when eeReportHandler.errorLocation is not set', function() {
      it('should set the report status to \'pass\'', function() {
        eeReportHandler.finalizeReport();

        expect(eeReportHandler._report.status).equal('pass');
      });
    });

    describe('when eeReportHandler.errorLocation is set', function() {
      it('should keep the report status as \'fail\'', function() {
        eeReportHandler._report.errorLocation.actionIndex = 0;

        eeReportHandler.finalizeReport();

        expect(eeReportHandler._report.status).equal('fail');
      });
    });

    it('should call process.send with the eeReportHandler._report', function() {
      eeReportHandler.finalizeReport();

      expect(process.send.args).to.deep.equal([[
        {
          actions: [],
          errorLocation: {
            actionIndex: null,
            step: null,
          },
          status: 'pass',
          testName: null,
          time: [123, 456],
        },
      ]]);
    });
  });
});
