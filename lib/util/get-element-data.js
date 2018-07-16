'use strict';

module.exports = function(elementsToGet, callback) {
  let functions = {
    getElementData(elementsToFind) {
      let data = {};
      for (const element of elementsToFind) {
        let type = element.selector.type;
        let value = element.selector.value;
        let selectedDomValue;
        switch (type) {
          case 'querySelector':
            selectedDomValue = document.querySelector(value);
            break;

          case 'querySelectorAll':
            selectedDomValue = document.querySelectorAll(value);
            break;

          case 'getElementById':
            selectedDomValue = document.getElementById(value);
            break;

          case 'getElementsByTagName':
            selectedDomValue = document.getElementsByTagName(value);
            break;

          case 'getElementsByClassName':
            selectedDomValue = document.getElementsByClassName(value);
            break;

          default:
            throw new Error(
              'Invalid selector.type for element \'' + element.name + '\' ' +
              'must be querySelector, querySelectorAll, getElementById, getElementsByTagName, or getElementsByClassName'
            );
        }
        if (selectedDomValue) {
          data[element.name] = functions.getElementInfo(selectedDomValue);
        }
      }

      return data;
    },
    getElementInfo(data) {
      if (data.length || data.length === 0) {
        let elementInfo = [];
        for (let i = 0; i < data.length; i++) {
          elementInfo.push({
            attributes: functions.extractNameAndValue(data[i].attributes),
            name: data[i].name,
            disabled: data[i].disabled,
            innerHTML: data[i].innerHTML,
            innerText: data[i].innerText,
            hidden: data[i].hidden,
            value: data[i].value,
            webElement: data[i],
            isDisplayed: functions.isDisplayed(data[i]),
          });
        }
        return elementInfo;
      } else {
        return {
          attributes: functions.extractNameAndValue(data.attributes),
          name: data.name,
          disabled: data.disabled,
          innerHTML: data.innerHTML,
          innerText: data.innerText,
          hidden: data.hidden,
          value: data.value,
          webElement: data,
          isDisplayed: functions.isDisplayed(data),
        };
      }
    },
    extractNameAndValue(attributes) {
      const attributeObject = {};
      for (const attribute of attributes) {
        attributeObject[attribute.localName] = attribute.value;
      }
      return attributeObject;
    },
    isDisplayed(elem) {
      if (!(elem instanceof Element)) throw Error('elem is not an element.');
      const style = getComputedStyle(elem);
      if (style.display === 'none') return false;
      if (style.visibility !== 'visible') return false;
      if (style.opacity < 0.1) return false;
      if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
        elem.getBoundingClientRect().width === 0) {
        return false;
      }
      return true;
    },
  };

  try {
    callback(functions.getElementData(elementsToGet));
  } catch (error) {
    callback(error);
  }

  return functions;
};
