'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/errors/index.js', function() {
  let ELEMENT;
  let ACTION;
  let COMPONENT;
  let MODEL;
  let PLANNER;
  let TEST_CASE;
  let EVENT;
  let CHILD;
  let CLI;
  let RUNNER;
  let CONFIG;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../lib/errors');

    ELEMENT = sinon.stub();
    ACTION = sinon.stub();
    COMPONENT = sinon.stub();
    MODEL = sinon.stub();
    PLANNER = sinon.stub();
    TEST_CASE = sinon.stub();
    EVENT = sinon.stub();
    CHILD = sinon.stub();
    CLI = sinon.stub();
    RUNNER = sinon.stub();
    CONFIG = sinon.stub();

    mockery.registerMock('./element', ELEMENT);
    mockery.registerMock('./action', ACTION);
    mockery.registerMock('./component', COMPONENT);
    mockery.registerMock('./model', MODEL);
    mockery.registerMock('./planner', PLANNER);
    mockery.registerMock('./test-case', TEST_CASE);
    mockery.registerMock('./event', EVENT);
    mockery.registerMock('./child', CHILD);
    mockery.registerMock('./cli', CLI);
    mockery.registerMock('./runner', RUNNER);
    mockery.registerMock('./config', CONFIG);
  });

  afterEach(function() {
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should export 11 items on an object', function() {
    let result = require('../../../../lib/errors');

    expect(Object.getOwnPropertyNames(result).length).to.equal(11);
  });

  it('should have the property \'ELEMENT\' with the value from requiring'
        + ' \'./element\'', function() {
    let result = require('../../../../lib/errors');

    expect(result.ELEMENT).to.deep.equal(ELEMENT);
  });

  it('should have the property \'ACTION\' with the value from requiring'
      + ' \'./action\'', function() {
    let result = require('../../../../lib/errors');

    expect(result.ACTION).to.deep.equal(ACTION);
  });

  it('should have the property \'COMPONENT\' with the value from requiring'
      + ' \'./component\'', function() {
    let result = require('../../../../lib/errors');

    expect(result.COMPONENT).to.deep.equal(COMPONENT);
  });

  it('should have the property \'MODEL\' with the value from requiring'
      + ' \'./model\'', function() {
    let result = require('../../../../lib/errors');

    expect(result.MODEL).to.deep.equal(MODEL);
  });

  it('should have the property \'PLANNER\' with the value from requiring'
      + ' \'./planner\'', function() {
    let result = require('../../../../lib/errors');

    expect(result.PLANNER).to.deep.equal(PLANNER);
  });

  it('should have the property \'TEST_CASE\' with the value from requiring'
    + ' \'./test-case\'', function() {
    let result = require('../../../../lib/errors');

    expect(result.TEST_CASE).to.deep.equal(TEST_CASE);
  });

  it('should have the property \'EVENT\' with the value from requiring'
    + ' \'./event\'', function() {
    let result = require('../../../../lib/errors');

    expect(result.EVENT).to.deep.equal(EVENT);
  });

  it('should have the property \'CHILD\' with the value from requiring'
    + ' \'./child\'', function() {
    let result = require('../../../../lib/errors');

    expect(result.CHILD).to.deep.equal(CHILD);
  });

  it('should have the property \'CLI\' with the value from requiring'
    + ' \'./cli\'', function() {
    let result = require('../../../../lib/errors');

    expect(result.CLI).to.deep.equal(CLI);
  });

  it('should have the property \'RUNNER\' with the value from requiring'
    + ' \'./runner\'', function() {
    let result = require('../../../../lib/errors');

    expect(result.RUNNER).to.deep.equal(RUNNER);
  });

  it('should have the property \'CONFIG\' with the value from requiring'
    + ' \'./config\'', function() {
    let result = require('../../../../lib/errors');

    expect(result.CONFIG).to.deep.equal(CONFIG);
  });
});
