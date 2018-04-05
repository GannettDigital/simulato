---
permalink: /components/
title: 'Components'
toc_label: 'Components'
---

This section details the different sections of a component

## `this` context
* Description
    * The passed in `this` context to all of the component functions which has certain useful properties
    * `this` properties and functions
        * `name`
            * The unique name given the component upon creation
        * `type`
            * The type of the component
        * `options`
            * The options given to the component upon creation
        * `elements`
            * The computed elements from executing the elements function
        * `model`
            * The computed model from executing the elemetns function
        * `actions`
            * The computed actions from executing the actions function
        * `events`
            * The computed events from executing the events function
        * `children`
            * The computed children from executing the children function
        * `dynamicArea`
            * The dynamicArea given to the component upon creation
        * `getFromPage(key)`
            * Gets a value from the current model of the page
            * Parameters
                * `key` **required**
                    * A string to access the value in the model
            * Example
                ```
this.getFromPage('nameOfComponent.propertyOnModel.subPropertyOnModel');
                ```
## type
* type is **required**
* Description
    * `type` must be a string that denotes the component's type
    
## elements
* elements is **required**
* Description
    * `elements` must be a function that must return an array
    * The elements specified here are retrieved from the browser when the tool scrapes the web page
    * The data that is retrieved for each element is:
        * attributes
            * Extracted key/value pairs from the element's attribute list
            * For the element `<div class="myClass"></div>` the attribute `class` is retrieved along with all `key="value"` attributes of the elements
        * name
        * innerHTML
        * innerText
        * hidden
        * value
        * disabled
        * webElement
            * The selenium representation of the web element 
        * isDisplayed
            * A boolean computed based on whether the element is visible to a user
* Element properties
    * `name`
        * Must a be a string and is **required**
        * The name is used to access the element in the model section of a component
    * `selector`
        * Must be an object and is **required**
    * `selector.type`
        * Must be either the string `attribute` or `querySelector` and is **required**
        * Attribute selectors
            * Selects the first element in the DOM that matches the key/value pair below
        * Query Selectors
            * This uses the document.querySelector method to find elements
    * `selector.key`
        * Must be a string 
        * The key is the attribute used to select the elements. Can be any property on an element
        * Example: `id`
    * `selector.value`
        * Can be anything and is **required**
        * Keep in mind this is sent to the browser via selenium-webdriver
        * If the `selector.type` is attribute this should be the value of the attribute
        * If the `selector.type` is querySelectory this should be the query selector
* Example
    ```
    elements() {
        return [
            {
                name: 'searchResults',
                selector: {
                    type: 'attribute',
                    key: 'id',
                    value: 'rhscol',
                },
            },
        ];
    }
    ```

## model
* model is **required**
* Description
    * `model` must be a function that must return an object
    * The model specficied here is created from the `elements` specified above are scraped and returned from the browser
    * Only model what is important for determining correctness and leave out anything else
* Model Properties
    * There are no predfined properties
    * Each property must be an object, string, or a function
    * For properties that are strings
        * The tool does a lodash `get` with the string on the elements object
    * For properties that are functions
        * The tool executes the function with all the element data from the elements above and the return value is assigned to the property
    * For properties that are objects
        * The tool examines the object's properties
* Example
    * Given the following model
    ```
    model() {
        return {
            displayed: 'myButton.isDisplayed',
            disabled: 'myButton.disabled',
            active(scrapedDataFromBrowser) {
                let buttonClass = scrapedDataFromBrowser.myButton.attributes.class;
    
                return buttonClass.indexOf('active') !== -1;
            },
        };
    }
    ```
    * Given the following elements
    ```
    elements() {
        return [
            {
                name: 'myButton',
                selector: {
                    type: 'attribute',
                    key: 'id',
                    value: 'myId',
                },
            },
        ];
    }
    ```
    * Given the following data returned from the browser
    ```
    {
        myButton: {
            attributes: {
                class: 'big active fancy',
                id: 'myId',
                someAttribute: 'some value',
            },
            name: '',
            innerHTML: '',
            innerTEXT: '',
            hidden: false,
            disabled: false,
            value: '',
            webElement: <selenium representation of the web element>,
            isDisplayed: true,
        }
    }
    ```
    * The resulting model is
    ```
    {
        displayed: true,
        disabled: false,
        active: true,
    }
    ```
    * The reason why
        * `displayed`
            * A lodash `get` is done on the data returned from the browser with the string `myButton.isDisplayed` specifed in the model which results in the boolean value `true`
        * `disabled`
            * A lodash `get` is done on the data returned from the browser with the string `myButton.disabled` specified in the model which results in the boolean value `false`
        * `active`
            * The tool executes the function with the data from the browser. The function checks if the string `active` is contained within the class attribute of myButton. Since the string `active` is indeed inside the class attribute the function returns the boolean value `true` which is then assigned to the attribute `active` in the model.

## actions
* actions is **required**
* Description
    * `actions` must be a function and must return an object
    * Actions are used act on the system under test, retrieve data, and anything else that is desired during test execution
    *  The actions format is loosely based on STRIPS and similar techniques for specifying actions within a planning domain
    *  Actions consist of: parameters, preconditions, perform, and effects
* Action properties
    * `<SOME_ACION>`
        * The name of the first level property is the name of the action
    * `<SOME_ACTION>.parameters`
        * Must be an array with objects inside
        * Each parameter defined is prepended to the `perform` and `effects` functions for the action
    * `<SOME_ACTION>.parameters[i].name`
        * The name of the parameter and is **required** for each parameter defined
    * `<SOME_ACTION>.parameters[i].generate`
        * A function to generate the value for the parameter and is **required** for each parameter defined
    * `<SOME_ACTION>.preconditions`
        * Must be a function and must return a two dimmensional array
        * Each array in the returned array is a chai assertion method and its parameters
            * Example: `['myChaiAssertionMethod', 'firstParameter', 'secondParameter']`
        * During execution these chai assertions are performed against the actual modeled state of the page and cause test failure if they are not true within an amount of time (currently 10 seconds)
        * During planning these chai assertions are performed against the expected state to determine if an action is applicable in a given state
        * Parameters
            * Action Parameters
                * Action parameters are prepended
            * `dataStore`
                * The utility used to store data during test execution and planning
    * `<SOME_ACTION>.perform`
        * Must be a function, must call the passed in callback, and is **required** 
        * During test execution this function is called to act on the system or do anything else desired during execution
        * Usually, the gobally defined `driver` which is a webdriver instance used to interact with the browser
        * Parameters
            * Action Parameters
                * Action parameters are prepended
            * `callback`
                * The function to call when done executing
    * `<SOME_ACTION>.effects`
        * Must be a function and is **required** 
        * After the perform is executed the effects are called to allow for any any changes to made to the expected state
        * Parameters
            * Action Parameters
                * Action parameters are prepended
            * `expectedState`
                * The utility used to modify the desired state of the program
            * `dataStore`
                * The utility used to store data during test execution and planning
* Example
    ```
    MY_ACTION: {
        parameters: [
            {
                name: 'myParameter',
                generate() {
                    return 'some value';
                },
            },
        ],
        preconditions(dataStore) {
            return [
                ['isTrue', `${this.name}.displayed`],
                ['equal', `${this.name}.value`, 'some value'],
            ];
        },
        perform(myParameter, callback) {
            driver
            .findElement(By.id('myId'))
            .sendKeys(myParameter)
            .then(callback, callback);
        },
        effects(myParameter, expectedState, dataStore) {
            expectedState.modify(this.name, function(myComponentInstance) {
                myComponentInstance.value = myParameter;
            });
        },
    },
    ```

## children
* Description
    * `children` must be a function and must return an array
    * Children are used to specify other components that need to be created when the component is added to the expected state
    * Use children to reduce the burden of specifying repetative and lengthy state objects when a component is created and added
    * It is a good idea to create small, reusable components for common UI elements under test and then simply specify them as children when needed
* Parameters
    * `expectedState`
        * The utility used to modify the desired state of the program
    * `dataStore`
        * The utility used to store data during test execution and planning
* Child properties
    * `type`
        * The type of component to be created and is **required**
    * `name`
        * The unique name to give the created component and is **required**
    * `state`
        * The state of the component upon creation and is **required**
    * `options`
        * The options to be passed to the component upon creation
* Example
    ```
    children(expectedState, dataStore) {
        return [
            {
                type: 'Button',
                name: 'myButton',
                state: {
                    displayed: true,
                    disabled: false,
                },
                options: {
                    buttonId: 'myButtonId',
                },
            },
            {
                type: 'TextInput',
                name: 'myTextInput',
                state: {
                    displayed: true,
                    value: '',
                },
                options: {
                    textInputId: 'myTextInputId',
                    text: 'My Slug',
                },
            },
        ];
    }
    ```

## events
* Description
    * `events` must be a function and must return an array
    * Events are used to specify ilsteners to events occuring on the `expectedState.eventEmitter`
    * Use events to facilitate communication between components
    * This can be a good way for child components to communicate to parent components
* Parameters
    * `expectedState`
        * The utility used to modify the desired state of the program
    * `dataStore`
        * The utility used to store data during test execution and planning
* Event properties
    * `name`
        * A string or array of strings which are events to attach the `listener` to and is **required**
    * `listener`
        * A function to runs when the event(s) in the `name` property is/are run and is **required**
* Example
    ```
    events(expectedState, dataStore) {
        return [
            {
                name: 'myTextBoxTextEntered',
                listener() {
                    // do something...
                },
            },
            {
                name: ['myButtonClicked', 'myOtherButtonClicked'],
                listener() {
                    expectedState.pop();
                },
            },
        ];
    }
    ```