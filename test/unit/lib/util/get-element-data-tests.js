'use strict';

const mockery = require('mockery');
const sinon = require('sinon');
const expect = require('chai').expect;

describe.only('lib/util/get-element-data.js', function() {
  let getElementData;
  let getElementDataFunctions;
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
        type: 'attribute',
        key: 'id',
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

    global.document = {
      getElementsByTagName: sinon.stub().returns(['element1', 'element2']),
      querySelector: sinon.stub().returns(null),
    };

    global.Element = function(name) {
      this.name = name;
      this.getBoundingClientRect = sinon.stub().returns({height: 10, width: 10});
    };

    global.getComputedStyle = sinon.stub();

    getElementData =
      require('../../../../lib/util/get-element-data.js');
    getElementDataFunctions = getElementData([], callback);
  });

  afterEach(function() {
    delete global.document;
    delete global.Element;
    delete global.getComputedStyle;
    mockery.resetCache();
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should call the callback function', function() {
    getElementData([element2], callback);

    expect(callback.callCount).to.equal(2);
  });

  it('should call the callback function with a function as the parameter', function() {
    getElementData([element2], callback);

    expect(callback.args[1][0]).to.be.a('object');
  });

  describe('if the callback catches an error', function() {
    it('should call the callback with an error', function() {
      getElementData([{}], callback);

      expect(callback.args[1][0]).to.be.an('error');
    });
  });

  describe('when get elementData is called and the functions are returned', function() {
    describe('on call of findElement', function() {
      describe('for each element of the passed in elements', function() {
        describe('if the element[key] is the passed in value', function() {
          it('should return that element', function() {
            let returnData;

            returnData = getElementDataFunctions.findElement('key', 'value', [{key: 'value'}]);

            expect(returnData).to.deep.equal({key: 'value'});
          });
        });

        describe('if that element.shadowRoot is not null', function() {
          it('should call querySelectorAll propety of the shadowRoot once with \'*\'', function() {
            let element = {
              key: 'value',
              shadowRoot: {
                querySelectorAll: sinon.stub(),
              },
            };
            let findElementToCall = getElementDataFunctions.findElement;
            getElementDataFunctions.findElement = sinon.stub();

            findElementToCall('key', 'notTheValue', [element]);

            expect(element.shadowRoot.querySelectorAll.args).to.deep.equal([[
              '*',
            ]]);
          });

          it('should return the result from the resursive calls of findElement', function() {
            let element = {
              key: 'value',
              shadowRoot: {
                querySelectorAll: sinon.stub(),
              },
            };
            let findElementToCall = getElementDataFunctions.findElement;
            getElementDataFunctions.findElement = sinon.stub().returns('matchedElement');
            let returnData;

            returnData = findElementToCall('key', 'notTheValue', [element]);

            expect(returnData).to.deep.equal('matchedElement');
          });
        });

        describe('if the element[key] is not the passed in value and .shadowRoot is null', function() {
          it('should not return anything', function() {
            let returnData;

            getElementDataFunctions.findElement('key', 'value', [{key: 'notValue'}]);

            expect(returnData).to.deep.equal(undefined);
          });
        });
      });
    });

    describe('on call of getElementData', function() {
      describe('for each element in the passed in elementsToFind', function() {
        describe('if the the element\'s selector type is querySelector', function() {
          it('should call document.querySelector with that elements selector value', function() {
            document.querySelector.returns('someElement');
            getElementDataFunctions.getElementInfo = sinon.stub();

            getElementDataFunctions.getElementData([element2]);

            expect(document.querySelector.args).to.deep.equal([['someQuerySelector']]);
          });
        });

        describe('if the the element\'s selector type is attribute', function() {
          it('should call document.getElementsByTagName with the string \'*\'', function() {
            getElementDataFunctions.getElementInfo = sinon.stub();
            getElementDataFunctions.findElement = sinon.stub().returns('anElement');

            getElementDataFunctions.getElementData([element1]);

            expect(document.getElementsByTagName.args).to.deep.equal([['*']]);
          });

          it('should call functions.findElement with the selector.key, selector.value '
            + 'and the returned elements from document.getElementsByTagName', function() {
            getElementDataFunctions.getElementInfo = sinon.stub();
            getElementDataFunctions.findElement = sinon.stub().returns('anElement');

            getElementDataFunctions.getElementData([element1]);

            expect(getElementDataFunctions.findElement.args).to.deep.equal([[
              'id',
              'someId',
              ['element1', 'element2'],
            ]]);
          });
        });

        describe('if the the element\'s selector type is NOT attribute or querySelector', function() {
          it('should throw an error stating invalid selector.type', function() {
            getElementDataFunctions.getElementInfo = sinon.stub();
            getElementDataFunctions.findElement = sinon.stub().returns('anElement');

            expect(getElementDataFunctions.getElementData.bind(
              null,
              [{name: 'badElement', selector: {type: 'badType'}}]
            )).to.throw(`Invalid selector.type for element badElement must be querySelector or attribute`);
          });
        });

        it('should call getElementInfo with the passing in the element found', function() {
          document.querySelector.returns('someElement');
          getElementDataFunctions.getElementInfo = sinon.stub();
          getElementDataFunctions.findElement = sinon.stub().returns('anElement');

          getElementDataFunctions.getElementData([element1, element2]);

          expect(getElementDataFunctions.getElementInfo.args).to.deep.equal([
            ['anElement'],
            ['someElement'],
          ]);
        });
      });

      it('should return an object with all the found element data', function() {
        let data;
        document.querySelector.returns('someElement');
        getElementDataFunctions.getElementInfo = sinon.stub().returns('elementData');
        getElementDataFunctions.findElement = sinon.stub().returns('anElement');

        data = getElementDataFunctions.getElementData([element1, element2]);

        expect(data).to.deep.equal({
          element1: 'elementData',
          element2: 'elementData',
        });
      });
    });

    describe('on call of getElementInfo', function() {
      it('should call extractNameAndValue once passing in the passed in element.attributes', function() {
        let element = {
          attributes: ['some', 'attributes'],
        };
        getElementDataFunctions.extractNameAndValue = sinon.stub();
        getElementDataFunctions.isDisplayed = sinon.stub();

        getElementDataFunctions.getElementInfo(element);

        expect(getElementDataFunctions.extractNameAndValue.args).to.deep.equal([[['some', 'attributes']]]);
      });

      it('should call isDisplayed once passing in the passed in element', function() {
        let element = {
          attributes: ['some', 'attributes'],
        };
        getElementDataFunctions.extractNameAndValue = sinon.stub();
        getElementDataFunctions.isDisplayed = sinon.stub();

        getElementDataFunctions.getElementInfo(element);

        expect(getElementDataFunctions.isDisplayed.args).to.deep.equal([[element]]);
      });

      it('should return the element with its an object with the element data we care about', function() {
        let element = {
          attributes: ['some', 'attributes'],
          name: 'element1',
          disabled: false,
          innerHTML: '<h1>innerHtml</h1>',
          innerText: 'someInnerText',
          hidden: false,
        };
        let returnedData;

        getElementDataFunctions.extractNameAndValue = sinon.stub().returns([{attr1: 'attribute1'}]);
        getElementDataFunctions.isDisplayed = sinon.stub().returns(true);

        returnedData = getElementDataFunctions.getElementInfo(element);

        expect(returnedData).to.deep.equal({
          attributes: [{attr1: 'attribute1'}],
          name: 'element1',
          disabled: false,
          innerHTML: '<h1>innerHtml</h1>',
          innerText: 'someInnerText',
          hidden: false,
          value: undefined,
          webElement: element,
          isDisplayed: true,
        });
      });
    });

    describe('on call of extractNameAndValue', function() {
      describe('for each attribute of the passed in attributes', function() {
        it('should add to the returned object the local name as a key and its value as the value', function() {
          let attributes = [
            {
              localName: 'attribute1',
              value: 'value1',
            },
            {
              localName: 'attribute2',
              value: 'value2',
            },
          ];
          let returnData;

          returnData = getElementDataFunctions.extractNameAndValue(attributes);

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
          expect(getElementDataFunctions.isDisplayed.bind({})).to.throw(
            'elem is not an element'
          );
        });
      });

      it('should call getComputedStyle once passing in the passed in element', function() {
        let element = new Element('element1');
        getComputedStyle.returns({});

        getElementDataFunctions.isDisplayed(element);

        expect(getComputedStyle.args).to.deep.equal([[element]]);
      });

      describe('for properties of the returned style object of getComputedStyle', function() {
        describe('if style.display is \'none\'', function() {
          it('should return false', function() {
            let element = new Element('element1');
            getComputedStyle.returns({display: 'none'});
            let returnValue;

            returnValue = getElementDataFunctions.isDisplayed(element);

            expect(returnValue).to.equal(false);
          });
        });

        describe('if style.visibility does not equal \'visible\'', function() {
          it('should return false', function() {
            let element = new Element('element1');
            getComputedStyle.returns({visibility: 'notVisable'});
            let returnValue;

            returnValue = getElementDataFunctions.isDisplayed(element);

            expect(returnValue).to.equal(false);
          });
        });

        describe('if style.opacity is less than 0.1', function() {
          it('should return false', function() {
            let element = new Element('element1');
            getComputedStyle.returns({visibility: 'visible', opacity: 0.01});
            let returnValue;

            returnValue = getElementDataFunctions.isDisplayed(element);

            expect(returnValue).to.equal(false);
          });
        });

        it('should call the passed in elements getBoundingClientRect function twice', function() {
          let element = new Element('element1');
          getComputedStyle.returns({visibility: 'visible', opacity: 1});

          getElementDataFunctions.isDisplayed(element);

          expect(element.getBoundingClientRect.callCount).to.equal(2);
        });

        describe('if the passed in elements offset width and height plus its heigh and width is 0', function() {
          it('should return false', function() {
            let element = new Element('element1');
            element.offsetWidth = -10;
            element.offsetHeight = -10;
            getComputedStyle.returns({visibility: 'visible', opacity: 1});
            let returnData;

            returnData = getElementDataFunctions.isDisplayed(element);

            expect(returnData).to.equal(false);
          });
        });

        it('should return true if all the isDisplayed criteria passes', function() {
          let element = new Element('element1');
          getComputedStyle.returns({visibility: 'visible', opacity: 1});
          let returnData;

          returnData = getElementDataFunctions.isDisplayed(element);

          expect(returnData).to.equal(true);
        });
      });
    });
  });
});
