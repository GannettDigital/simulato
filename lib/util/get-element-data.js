'use strict';

module.exports = function(elementsToGet, callback) {
    let functions = {
        findElement(key, value, elements) {
            for (let currentElement of elements) {
                if (currentElement[key] === value) {
                    return currentElement;
                } else if (!(currentElement.shadowRoot === null || currentElement.shadowRoot === undefined)) {
                    let shadowElements = currentElement.shadowRoot.querySelectorAll('*');
                    let match = functions.findElement(key, value, shadowElements);
                    if (match) {
                        return match;
                    }
                }
            }
        },
        getElementData(elementsToFind) {
            let data = {};
            for (const element of elementsToFind) {
                let type = element.selector.type;
                let value = element.selector.value;
                let key = element.selector.key;
                let myElement;

                if (type === 'querySelector') {
                    myElement = document.querySelector(value);
                } else if (type === 'attribute') {
                    let elements = document.getElementsByTagName('*');
                    myElement = functions.findElement(key, value, elements);
                } else {
                    throw new Error(
                        'Invalid selector.type for element ' + element.name + ' must be querySelector or attribute'
                    );
                }
                if (myElement) {
                    data[element.name] = functions.getElementInfo(myElement);
                }
            }

            return data;
        },
        getElementInfo(element) {
            return {
                attributes: functions.extractNameAndValue(element.attributes),
                name: element.name,
                disabled: element.disabled,
                innerHTML: element.innerHTML,
                innerText: element.innerText,
                hidden: element.hidden,
                value: element.value,
                webElement: element,
                isDisplayed: functions.isDisplayed(element),
            };
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
