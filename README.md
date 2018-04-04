# simulato
Simulato is a tool that uses model based testing techniques to generate and run tests for web page user interfaces in the browser.

## Components
This section details the different sections of a component

### type
* type is **required**
* Description
    * `type` must be a string that denotes the component's type
    
### elements
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

### model
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

### actions
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

### children
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

### events
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

## CLI
### Commands
#### run <testPaths...>
* Description
    * Runs the tests in the folder paths specified
* Example usage
    * `model-based-test-tool run ./tests -c ./components -o ./tests`
* Options
    * `-T`, `--testPath` **required**
        * Path to tests
        * Example: `-T ./my-test-folder`
    * `-c`, `--components` **required**
        * Path to components
        * Example: `-c ./my-components-folder`
    * `-r`, `--reporter`
        * Specify a reporter to use. Either `basic` or `teamcity` 
        * Default is `basic`
        * Example: `-r teamcity`
    * `-s`, `--saucelabs`
        * Flag for running tests in saucelabs. A sauce tunnel will be started
        * Must have `SAUCE_USERNAME` AND `SAUCE_ACCESS_KEY` specified
        * Example: `-s`
    * `-p`, `--parallelism`
        *  Amount of tests to run in parallel
        *  Default is `20`
        *  Example; `-p 5`
    * `-R`, `--reportPath`
        * The parth wherein to write the test report
        * Example: `-o ./my-reports`
    * `-b`, `--before`
        * The path to a before script run before the test suite
        * Must be a valid JavaScript file that exports a single function
        * Example: `-b my-before-script.js`
    * `-f`, `--configFile`
        * Path to configFile
        * Example: `-f ./config.js`

#### generate <pathToComponents>
* Description
    * Generates tests using the supplied components
* Example Usage
    * `model-based-test-tool generate ./components -o ./tests -t actionFocused`
* Options
    * `-c`, `--components` **required**
        * Path to components
        * Example: `-c ./my-components-folder`
    * `-o`, `--outputPath`
        * The path wherein to write the generated test cases
        * Default is the current working directory
        * Example `-o ./tests` 
    * `-t`, `--technique` **required**
        * The test generation technique
        * The only and required option at this point is `actionFocused`
        * Example: `-t actionFocused`
    * `-a`, `--actionToCover`
        *  The single action to generate a test to cover
        *  Example: `-a myComponent.MY_ACTION`
    * `-f`, `--configFile`
        * Path to configFile
        * Example: `-f ./config.js`

## Configuration File
This section documents utilization of the configuration file in place of CLI options

* Any of the cli options can be referenced from the configuration file by the following
    * testPath
    * components
    * reporter
    * saucelabs
    * paralellism
    * reportPath
    * before
    * configFile
    * outputPath
    * technique
    * actionToCover

* Example File
    ```
    'use strict'

    module.exports = {
        testPath: './test/acceptance/tests',
        components: './test/acceptance/components',
        reportPath: './test/acceptance/tests',
        saucelabs: {
            'name': process.env.TEST_NAME,
            'browserName': 'chrome',
            'platform': 'Windows 10',
            'version': '63.0',
            'username': process.env.SAUCE_USERNAME,
            'accessKey': process.env.SAUCE_ACCESS_KEY,
            'tunnel-identifier': process.env.TUNNEL_IDENTIFIER,
            'customData': {
                        'build': process.env.BUILD_NUMBER,
                        'release': process.env.RELEASE_VERSION,
                        'commithash': process.env.COMMIT_HASH,
                        'environment': process.env.NODE_ENV,
                        },
                    },
        outputPath: './test/acceptance/tests',
        technique: 'actionFocused',
    }
    ```
* If modifying saucelabs options, please include all above options, otherwise you can leave it blank

## Expected State
This section documents functions for the expected state used throughout the tool
* `createAndAddComponent(componentConfig)`
    * Creates a component and adds it to the expected state
    * Parameters
        * `componentConfig`
            * An object with the following fields
                * `type`
                    * A string corresponding to one of the components' `type` property
                * `name`
                    * A string that denotes the unique name of component when created
                * `state`
                    * An object representing the state of the component
                * `options`
                    * An object used for any data the user wants the component to have
                * `dyanamicArea`
                    * A string that denotes the dynamicArea this component should be a part of
* `createComponent(componentConfig)`
    * Creates a component
    * Parameters
        * `componentConfig`
            * An object with the following fields
                * `type`
                    * A string corresponding to one of the components' `type` property
                * `name`
                    * A string that denotes the unique name of component when created
                * `options`
                    * An object used for any data the user wants the component to have
                * `dyanamicArea`
                    * A string that denotes the dynamicArea this component should be a part of
* `addComponent(component, state)`
    * Adds a created component with the given state
    * Parameters
        * `component`
            * The created componend to be added to the state
        * `state`
            * An object representing the state of the component to be added
* `delete(name)`
    * Deletes a single component from the expected state
    * Parameters
        * `name`
            * A string denoting name of the component to delete
* `clear()`
    * Clears the expected state (does not save anything)
* `clearDynamicArea(dynamicArea)`
    * Deletes all components for a given dynamic area
    * Parameters
        * `dynamicArea`
            * A string denoting the dynamic area to clear
* `getState()`
    * Gets a JavaScript object representing the current state 
* `modify(name, callback)`
    * Modifies a component
        * Parameters
            * `name`
                * A string denoting the component to modify
            * `callback`
                * The function that is called with the component as the first parameter
* `stash()`
    * Stash the current state (can be popped later)
* `pop()`
    * Pops the most recent stashed state
* `eventEmitter`
    * An event emitter instance wherein the events returned from the `events` function are registered
    * Use this emitter to emit events to other components
    
## Data Store
* `store(key, value)`
    * Stores data
    * Parameters
        * `key`
            * Any value valid as a key in a JS object that is used to identify the value
        * `value`
            * The data to store. This value is deep cloned
* `retrieve(key)`
    * Returns data from the data store
    * Parameters
        * `key`
            * The key associated with value to be returned from the data store
* `delete(key)`
    * Deletes data from the data store
    * Parameters
        * `key`
            * The key of the value to delete from the data store
* `retrieveAndDelete(key)`
    * Deletes and then returns the data from the data store
    * Parameters
        * `key`
            * The key to be retrieved and deleted from the data store
* `retrieveAll`
    * Returns the entire data store object
