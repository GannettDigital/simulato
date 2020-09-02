'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe('lib/util/get-element-data.js', function() {
  let getElementData;
  let componentsElements;
  let callback;
  let element1;
  let element2;

  beforeEach(function() {
    mockery.enable({useCleanCache: true});
    mockery.registerAllowable('../../../../lib/util/get-element-data.js');

    callback = sinon.stub();

    element1 = {
      name: 'element1',
      selector: {
        type: 'getElementById',
        value: 'someId',
      },
    };

    element2 = {
      name: 'element2',
      selector: {
        type: 'querySelector',
        value: 'someQuerySelector',
      },
    };
    componentsElements = {
      component1: [element1],
      component2: [element2],
    };

    global.document = {
      getElementsByTagName: sinon.stub().returns(['element1', 'element2']),
      querySelector: sinon.stub().returns(null),
      querySelectorAll: sinon.stub(),
      getElementById: sinon.stub(),
      getElementsByClassName: sinon.stub(),
    };

    global.Element = function(name) {
      this.name = name;
      this.getBoundingClientRect = sinon.stub().returns({height: 10, width: 10});
    };

    global.getComputedStyle = sinon.stub();

    getElementData =
      require('../../../../lib/util/get-element-data.js');
  });

  afterEach(function() {
    delete global.document;
    delete global.Element;
    delete global.getComputedStyle;
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  describe(`when two components' elements are passed in`, function() {
    it('should call the callback function once with two components element data', function() {
      getElementData(componentsElements, callback);

      expect(callback.args).to.deep.equal([[
        {
          component1: {},
          component2: {},
        },
      ]]);
    });
  });

  it('should call the callback function with an empty object if componentsElements is empty', function() {
    getElementData([], callback);

    expect(callback.args).to.deep.equal([[{}]]);
  });

  describe('if getElementData throws an error', function() {
    it('should call the callback with an error', function() {
      getElementData(['asdf'], callback);

      expect(callback.args[0][0]).to.be.an('error');
    });
  });

  describe('when get getElementData is called and the functions are returned', function() {
    describe('on call of getElementData', function() {
      describe('for each element in the passed in elementsToFind', function() {
        describe('if the the element\'s selector type is querySelector', function() {
          it('should call document.querySelector with that elements selector value', function() {
            const getElementDataFunctions = getElementData([], callback);
            document.querySelector.returns('someElement');
            getElementDataFunctions.getElementInfo = sinon.stub();

            getElementDataFunctions.getElementData([element2]);

            expect(document.querySelector.args).to.deep.equal([['someQuerySelector']]);
          });
        });

        describe('if the the element\'s selector type is querySelectorAll', function() {
          it('should call document.querySelectorAll with that elements selector value', function() {
            const getElementDataFunctions = getElementData([], callback);
            document.querySelectorAll.returns(['someElement1', 'someElement2']);
            getElementDataFunctions.getElementInfo = sinon.stub();

            getElementDataFunctions.getElementData([{
              name: 'element',
              selector: {
                type: 'querySelectorAll',
                value: 'someQuerySelectorAll',
              },
            }]);

            expect(document.querySelectorAll.args).to.deep.equal([['someQuerySelectorAll']]);
          });
        });

        describe('if the the element\'s selector type is getElementById', function() {
          it('should call document.getElementById with that elements selector value', function() {
            const getElementDataFunctions = getElementData([], callback);
            document.getElementById.returns('someElement1');
            getElementDataFunctions.getElementInfo = sinon.stub();

            getElementDataFunctions.getElementData([{
              name: 'element',
              selector: {
                type: 'getElementById',
                value: 'someId',
              },
            }]);

            expect(document.getElementById.args).to.deep.equal([['someId']]);
          });
        });

        describe('if the the element\'s selector type is getElementsByTagName', function() {
          it('should call document.getElementsByTagName with that elements selector value', function() {
            const getElementDataFunctions = getElementData([], callback);
            document.getElementsByTagName.returns(['someElement1', 'someElement2']);
            getElementDataFunctions.getElementInfo = sinon.stub();

            getElementDataFunctions.getElementData([{
              name: 'element',
              selector: {
                type: 'getElementsByTagName',
                value: 'tagName',
              },
            }]);

            expect(document.getElementsByTagName.args).to.deep.equal([['tagName']]);
          });
        });

        describe('if the the element\'s selector type is getElementsByClassName', function() {
          it('should call document.getElementsByClassName with that elements selector value', function() {
            const getElementDataFunctions = getElementData([], callback);
            document.getElementsByClassName.returns(['someElement1', 'someElement2']);
            getElementDataFunctions.getElementInfo = sinon.stub();

            getElementDataFunctions.getElementData([{
              name: 'element',
              selector: {
                type: 'getElementsByClassName',
                value: 'className',
              },
            }]);

            expect(document.getElementsByClassName.args).to.deep.equal([['className']]);
          });
        });

        describe('if the the element\'s selector type is NOT valid', function() {
          it('should throw an error stating invalid selector.type', function() {
            const getElementDataFunctions = getElementData([], callback);
            getElementDataFunctions.getElementInfo = sinon.stub();
            getElementDataFunctions.findElement = sinon.stub().returns('anElement');

            expect(getElementDataFunctions.getElementData.bind(
                null,
                [{name: 'badElement', selector: {type: 'badType'}}],
            )).to.throw(
                'Invalid selector.type for element \'badElement\' must be ' +
              'querySelector, querySelectorAll, getElementById, getElementsByTagName, or getElementsByClassName',
            );
          });
        });

        it('should call getElementInfo with the passing in the element found', function() {
          const getElementDataFunctions = getElementData([], callback);
          document.querySelector.returns('someElement');
          document.getElementById.returns('anElement');
          getElementDataFunctions.getElementInfo = sinon.stub();

          getElementDataFunctions.getElementData([element1, element2]);

          expect(getElementDataFunctions.getElementInfo.args).to.deep.equal([
            ['anElement'],
            ['someElement'],
          ]);
        });
      });

      it('should return an object with all the found element data', function() {
        const getElementDataFunctions = getElementData([], callback);
        document.querySelector.returns('someElement');
        document.getElementById.returns('anElement');
        getElementDataFunctions.getElementInfo = sinon.stub().returns('elementData');

        const data = getElementDataFunctions.getElementData([element1, element2]);

        expect(data).to.deep.equal({
          element1: 'elementData',
          element2: 'elementData',
        });
      });
    });

    describe('on call of getElementInfo', function() {
      describe('if a singular element is passed in', function() {
        it('should call extractNameAndValue once passing in the passed in element.attributes', function() {
          const element = {
            attributes: ['some', 'attributes'],
          };
          const getElementDataFunctions = getElementData([], callback);
          getElementDataFunctions.extractNameAndValue = sinon.stub();
          getElementDataFunctions.isDisplayed = sinon.stub();

          getElementDataFunctions.getElementInfo(element);

          expect(getElementDataFunctions.extractNameAndValue.args).to.deep.equal([[['some', 'attributes']]]);
        });

        it('should call isDisplayed once passing in the passed in element', function() {
          const element = {
            attributes: ['some', 'attributes'],
          };
          const getElementDataFunctions = getElementData([], callback);
          getElementDataFunctions.extractNameAndValue = sinon.stub();
          getElementDataFunctions.isDisplayed = sinon.stub();

          getElementDataFunctions.getElementInfo(element);

          expect(getElementDataFunctions.isDisplayed.args).to.deep.equal([[element]]);
        });

        it('should return the element with its an object with the element data we care about', function() {
          const element = {
            attributes: ['some', 'attributes'],
            name: 'element1',
            disabled: false,
            innerHTML: '<h1>innerHtml</h1>',
            innerText: 'someInnerText',
            hidden: false,
          };
          const getElementDataFunctions = getElementData([], callback);
          getElementDataFunctions.extractNameAndValue = sinon.stub().returns([{attr1: 'attribute1'}]);
          getElementDataFunctions.isDisplayed = sinon.stub().returns(true);

          const returnedData = getElementDataFunctions.getElementInfo(element);

          expect(returnedData).to.deep.equal({
            attributes: [{attr1: 'attribute1'}],
            name: 'element1',
            disabled: false,
            innerHTML: '<h1>innerHtml</h1>',
            innerText: 'someInnerText',
            hidden: false,
            value: undefined,
            checked: undefined,
            webElement: element,
            isDisplayed: true,
          });
        });
      });

      describe('if there is an array with 0 elements passed in', function() {
        it('should return an empty array', function() {
          const elements = [];
          const getElementDataFunctions = getElementData([], callback);
          getElementDataFunctions.extractNameAndValue = sinon.stub();
          getElementDataFunctions.isDisplayed = sinon.stub();

          const result = getElementDataFunctions.getElementInfo(elements);

          expect(result).to.deep.equal([]);
        });
      });

      describe('if multiple elements are passed in', function() {
        describe('for each element in the passed in elements', function() {
          it('should call extractNameAndValue passing in the element.attributes', function() {
            const elements = [{
              attributes: ['some', 'attributes'],
            }, {
              attributes: ['some', 'other', 'attributes'],
            }];
            const getElementDataFunctions = getElementData([], callback);
            getElementDataFunctions.extractNameAndValue = sinon.stub();
            getElementDataFunctions.isDisplayed = sinon.stub();

            getElementDataFunctions.getElementInfo(elements);

            expect(getElementDataFunctions.extractNameAndValue.args).to.deep.equal([
              [['some', 'attributes']],
              [['some', 'other', 'attributes']],
            ]);
          });

          it('should call isDisplayed passing in the element', function() {
            const elements = [{
              attributes: ['some', 'attributes'],
            }, {
              attributes: ['some', 'other', 'attributes'],
            }];
            const getElementDataFunctions = getElementData([], callback);
            getElementDataFunctions.extractNameAndValue = sinon.stub();
            getElementDataFunctions.isDisplayed = sinon.stub();

            getElementDataFunctions.getElementInfo(elements);

            expect(getElementDataFunctions.isDisplayed.args).to.deep.equal([[elements[0]], [elements[1]]]);
          });

          it('should return the elements with an object with the element data we care about', function() {
            const elements = [{
              attributes: ['some', 'attributes'],
              name: 'element1',
              disabled: false,
              innerHTML: '<h1>innerHtml</h1>',
              innerText: 'someInnerText',
              hidden: false,
            }, {
              attributes: ['some', 'other', 'attributes'],
              name: 'element2',
              disabled: false,
              innerHTML: '<h1>innerHtml2</h1>',
              innerText: 'someInnerText2',
              hidden: false,
            }];
            const getElementDataFunctions = getElementData([], callback);
            getElementDataFunctions.extractNameAndValue = sinon.stub();
            getElementDataFunctions.extractNameAndValue.onCall(0).returns([{attr1: 'attribute1'}]);
            getElementDataFunctions.extractNameAndValue.onCall(1).returns([{attr2: 'attribute2'}]);
            getElementDataFunctions.isDisplayed = sinon.stub().returns(true);

            const returnedData = getElementDataFunctions.getElementInfo(elements);

            expect(returnedData).to.deep.equal([{
              attributes: [{attr1: 'attribute1'}],
              name: 'element1',
              disabled: false,
              innerHTML: '<h1>innerHtml</h1>',
              innerText: 'someInnerText',
              hidden: false,
              value: undefined,
              checked: undefined,
              webElement: elements[0],
              isDisplayed: true,
            }, {
              attributes: [{attr2: 'attribute2'}],
              name: 'element2',
              disabled: false,
              innerHTML: '<h1>innerHtml2</h1>',
              innerText: 'someInnerText2',
              hidden: false,
              value: undefined,
              checked: undefined,
              webElement: elements[1],
              isDisplayed: true,
            }]);
          });
        });
      });
    });

    describe('on call of extractNameAndValue', function() {
      describe('for each attribute of the passed in attributes', function() {
        it('should add to the returned object the local name as a key and its value as the value', function() {
          const attributes = [
            {
              localName: 'attribute1',
              value: 'value1',
            },
            {
              localName: 'attribute2',
              value: 'value2',
            },
          ];
          const getElementDataFunctions = getElementData([], callback);

          const returnData = getElementDataFunctions.extractNameAndValue(attributes);

          expect(returnData).to.deep.equal({
            attribute1: 'value1',
            attribute2: 'value2',
          });
        });
      });
    });

    describe('on call of isDisplayed', function() {
      describe('if the passed in element is not an instanceOf Element', function() {
        it('should throw an error', function() {
          const getElementDataFunctions = getElementData([], callback);

          expect(getElementDataFunctions.isDisplayed.bind({})).to.throw(
              'elem is not an element',
          );
        });
      });

      it('should call getComputedStyle once passing in the passed in element', function() {
        const element = new Element('element1');
        const getElementDataFunctions = getElementData([], callback);
        getComputedStyle.returns({});

        getElementDataFunctions.isDisplayed(element);

        expect(getComputedStyle.args).to.deep.equal([[element]]);
      });

      describe('for properties of the returned style object of getComputedStyle', function() {
        describe('if style.display is \'none\'', function() {
          it('should return false', function() {
            const element = new Element('element1');
            const getElementDataFunctions = getElementData([], callback);
            getComputedStyle.returns({display: 'none'});

            const returnValue = getElementDataFunctions.isDisplayed(element);

            expect(returnValue).to.equal(false);
          });
        });

        describe('if style.visibility does not equal \'visible\'', function() {
          it('should return false', function() {
            const element = new Element('element1');
            const getElementDataFunctions = getElementData([], callback);
            getComputedStyle.returns({visibility: 'notVisable'});

            const returnValue = getElementDataFunctions.isDisplayed(element);

            expect(returnValue).to.equal(false);
          });
        });

        describe('if style.opacity is less than 0.1', function() {
          it('should return false', function() {
            const element = new Element('element1');
            const getElementDataFunctions = getElementData([], callback);
            getComputedStyle.returns({visibility: 'visible', opacity: 0.01});

            const returnValue = getElementDataFunctions.isDisplayed(element);

            expect(returnValue).to.equal(false);
          });
        });

        it('should call the passed in elements getBoundingClientRect function twice', function() {
          const element = new Element('element1');
          const getElementDataFunctions = getElementData([], callback);
          getComputedStyle.returns({visibility: 'visible', opacity: 1});

          getElementDataFunctions.isDisplayed(element);

          expect(element.getBoundingClientRect.callCount).to.equal(2);
        });

        describe('if the passed in elements offset width and height plus its height and width is 0', function() {
          it('should return false', function() {
            const element = new Element('element1');
            const getElementDataFunctions = getElementData([], callback);
            element.offsetWidth = -10;
            element.offsetHeight = -10;
            getComputedStyle.returns({visibility: 'visible', opacity: 1});

            const returnData = getElementDataFunctions.isDisplayed(element);

            expect(returnData).to.equal(false);
          });
        });

        it('should return true if all the isDisplayed criteria passes', function() {
          const element = new Element('element1');
          const getElementDataFunctions = getElementData([], callback);
          getComputedStyle.returns({visibility: 'visible', opacity: 1});

          const returnData = getElementDataFunctions.isDisplayed(element);

          expect(returnData).to.equal(true);
        });
      });
    });
  });
});
