---
permalink: /run-time-variables/
title: 'Run Time Variables'
toc: false
---

## When and where
Run time variables are useful when a property in a model is not known until execution time.
Run time variables are available to use anywhere you have access to the `this` context of the component.

## How
Use the function `this.getFromPage` detailed in the components section of the documentation.
Since run time variables are only filled in during execution it places limits on their use.
If a precondition is created using a run time variable it will always be `undefined` during planning.
Using run time variables with conditionals will most likely fail because during planning it will always be `undefined`.
It is probably not a good idea to use them in the two cases mentioned just above.
Remember, the particular problem run time variables solves is: a property in the model will have a value it just unknown at this point in time.

## Examples
* In the effects
    ```
effects(expectedState) {
    expectedState.createAndAddComponent({
        name: 'myName',
        type: 'myType',
        state: {
            displayed: true,
            searchResult: this.getFromPage('myName.searchResult'),
        }
    });
}
    ```
* Storing in the data store
    ```
SELECT_FIRST_DROPDOWN_CHOICE: {
    preconditions(dataStore) {
        dataStore.store('myDropDownChoice', this.getFromPage('myComponentName.dropDown.firstChoice'));

        return [
            ['isTrue', 'dropDown.expanded'],
        ];
    },
    perform(callback) {
        // Select the first choice in the drop down
    },
    effects(expectedState, dataStore) {
        expectedState.modify('myComponentName', function(myComponentName) {
            myComponentName.dropDown.currentSelection = dataStore.retrieve('myDropDownChoice');
            myComponentName.dropDown.expanded = false;
        });
    }
}
    ```
