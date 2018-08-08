---
permalink: /tutorial-entry-component/
title: "Entry Component"
toc: false
classes: wide
---

The first component for any system modeled using Simulato is an entry component. This tells Simulato where it should start when planning occurs, and can be thought of as the entry into the system.  For most web UIs this is as simple as navigating to the website.

An entry component looks like any other component, but it also includes a special "entryCompomemt" property.
{: .notice--info}

Let's start creating our entry component, giving it a unique `type`. This component will detail out only 1 action, navigating to the the Simulato test site. As such, we will give it a `type` of 'NavigateToTestSite', as well as the file name 'navigateToTestSite.model.js'. The file should be created in our components folder. Remember that `type` is always in PascalCase.

```
'use strict'

module.exports = {
  type: 'NavigateToTestSite'
}
```

When creating `elements` for our entry component specifically, we don't have anything in the system we want to select, in fact we are not even in the system yet to select anything. Since the purpose of the entry component is to get us into system, we will just return an empty array for elements.  We always need to return at least an empty array because `elements` is a required property.

```
'use strict'

module.exports = {
  type: 'NavigateToTestSite',
  elements () {
    return [];
  },
}
```

Since we have no `elements`, we won't have anything in our `model` section either. With no elements detailed out, there is nothing to model. Since its required, we will return an empty object.

```
'use strict'

module.exports = {
  type: 'NavigateToTestSite',
  elements () {
    return [];
  },
  model () {
    return {};
  },
}
```

With our model section created, we are able to add the `entryComponent` property that differentiates entry components for other components.  Whenever a component is created and added to the expected state of the system, a unique  `name`, and an expected `state` must be provided.  Entry components are functionally no different, and a `name` and `state` must be provided. However, since we need some place to start, we provide this information directly in the component via the `entryComponent` property. This is a simple object that species a `name` and the component's `state`.

```
'use strict'

module.exports = {
  type: 'NavigateToTestSite',
  entryComponent: {
    name: 'navigateToTestSite',
    state: {}
  },
  elements () {
    return [];
  },
  model () {
    return {};
  },
}
```

`name` should always be camelCase, which helps us differentiate between `type` and `name`. Unique names are not enforced by Simulato, but when planning and generating tests, it determines unique actions with a combination of `name` and action names. If two components have the same name, Simulato will not be able to tell the difference between two components, and test generation will most likely not create the results expected.
{: .notice--warning}

With the presence of the `entryComponent` property, Simualato will automatically create this component at the start of the planning step, adding it into the expected state with the provided `name`, and `state`. This will be the base of all planning for test generation for our test site components.

Lastly, we need to create the `actions` property. Unlike the first component, there will be an action for our entry component. That action being the actual navigation to the the test site. The actions property must be a function that returns an object. The object contains key value pairs with each key being an action name, and the value an object with 4 main properties, `preconditions`, `perform`, `effects`, and `parameters`.  Both `parameters` and `preconditions` are optional parts of the actions, however `preconditions` will be in almost every component besides your entry component. 

Since we are not relying on any part of our system to be in a certain state to navigate there, we can simply omit `preconditions` to our action.

`perform` where we will tell the Selenium driver how to perform our action and actually interact with the web page.  Currently, Simulato only supports base JavaScript Selenium, the documentation can be found [here](http://seleniumhq.github.io/selenium/docs/api/javascript/index.html).  Both `driver`, `until`, and `By` are provided globally via Simulato, and are used when constructing the perform block.  Selenium uses promises to handle the synchronous nature of `driver` actions to the webpage, which can be read about inside its documentation.  However, as promises are not used in Simulato, a callback is provided  into to the perform block. This must be called inside the perform block to tell Simulato this step is complete. When using the Selenium driver the most common actions we have found used are `findElement()`, `click()`, and `sendKeys()`. We use the common `then()` function all promises have as the final call in the Selenium promise chain to convert from promises to Simulato's callback scheme. In the world of promises they either resolve (success) or reject (fail). The first callback in `.then(callback, callback)` is called if the promise throws no errors, and is considered a success, while the second is called if an error is thrown. For converting it back to Simulato's callback scheme, we want to call the callback for either a resolve or a reject which is why we pass the callback in twice.


For `NavigateToPresto` we want our action to use one of the more uncommon driver actions `get()`. This tells Selenium to open up a browser, and navigate to the url provided. As with all perform blocks, we need to to tell Simulato when the perform block is finished. We do this by calling the callback provided by Simulato in the perform function.

```
'use strict'

module.exports = {
  type: 'NavigateToTestSite',
  entryComponent: {
    name: 'navigateToTestSite',
    state: {}
  },
  elements () {
    return [];
  },
  model () {
    return {};
  },
  actions () {
    return {
      NAVIGATE_TO_SITE: {
        perform (callback) {
          driver.get('http://localhost:3000')
            .then(callback, callback);
        }
      }
    };
  },
}
```

When creating action names, we use all caps and underscores similar to constants. Originally when Simulato was being developed action names had to be unique, as each component was only used once. However, as development continued we created the ability to reuse components, and action names were no longer unique, however the standard of all caps action names remained.

When creating the url for `driver.get()` make sure you use the port your machine assigned to the test app.

Now that we have our `perform` created, we need to tell Simulato the expected effects of the action. This is done in the `effects` function of our action. This will tell Simulato how we want to change the expected state of our system.  In our current example, the only thing in our state is the entryComponent, `navigateToTestSite`, that was automatically created with an empty object for its state. Since we no longer care about the state of our entry component, we can remove that from the expected state with either `expectedState.delete('navigateToTestSite')` or more simply `expectedState.clear()` which will delete everything from the state (which is just `navigateToTestSite` at this point).

In the [previous section](/tutorial-first-component/) of the tutorial, we created a component `MainSiteLayout`.  We know when we navigate to the test site, we land on a page with the header, the same header we modeled in `MainSiteLayout`. As such we want to create and add this component to the expected state as the effect for navigating to the site using `expectedState.createAndAddComponent()`. More documentation about the expected state can be found [here](/expected-state/).

```
'use strict'

module.exports = {
  type: 'NavigateToTestSite',
  entryComponent: {
    name: 'navigateToTestSite',
    state: {}
  },
  elements () {
    return [];
  },
  model () {
    return {};
  },
  actions () {
    return {
      NAVIGATE_TO_SITE: {
        perform (callback) {
          driver.get('http://localhost:3000')
            .then(callback, callback);
        },
        effects (expectedState) {
          expectedState.clear();
          expectedState.createAndAddComponent({
            type: 'MainSiteLayout',
            name: 'mainSiteLayout',
            state: {
              header: {
                displayed: true
              }
            }
          });
        }
      }
    };
  },
}
```

Whenever a component is created and added to the state, we need to provide an object with `type`, `name`, and `state`. So far in the creation of our components the `name` value has simply been the `type` value but camelCase rather than PascalCase, however as we later begin to make components that are used more than once, we will have to create unique names. When provided the `state` object, it needs to follow the same structure as the `model` of the component type we are adding.  In this case when we look back at our `MainSiteLayout` component we see it has the model:

```
model () {
  return {
    header: {
      displayed: 'siteHeader.isDisplayed'
    }
  };
},
```

When we created the component, and its `model`, we detailed out to Simulato what all components of this `type` needs when created and added to the expected state. As such, our corresponding expected state must match the same structure.  Since we are directly adding this state into our expected state, we need to provide values for what we expect, which, in this case, we expect the `header.displayed` to be true.

With the completion of our `actions` we now have 2 functioning components. We have the `type` 'NavigateToTestSite' and the `type` 'MainSiteLayout'.  As an entry component, 'NavigateToTestSite' will automatically be created and added into the expected state with the `name` 'navigateToTestSite'. 'navigateToTestSite' provides an action, `NAVIGATE_TO_TEST_SITE`,  that will go the test site url. The actions' effects will clear out the state, then add the component with the `name` 'mainSectionLayout'. When we add 'mainSectionLayout' we expect that the header will be displayed.

We should now be able to generate tests using Simulato. But before we generate tests, lets create a folder we can use to specify where tests should be written to the disk. Inside the project main folder create a directory named 'tests'.  By default, when calling the `generate` command it will look for components in a components folder, which is why we used that as a folder name.  Back in the terminal inside our project folder we can now run the command to generate tests specifying the test generation output to the 'tests' folder.

`$ simulato generate -o ./tests`

Only 1 test should be generated at this point, performing the action `navigateToTestSite.NAVIGATE_TO_SITE`. The terminal output should display this, showing it found 1 / 1 actions, and the name of the action it found. We should be left with the following file structure.

```
- components
    mainSiteLayout.model.js
    navigateToTestSite.model.js
- node_modules
- tests
    <generatedTestName>.json
package-lock.json 
package.json
```

Now that we have the test let's run it!

`$ simulato run -T ./tests`

We are using different cli flags for both run and generate which can be read about [here](/cli/).

Hopefully, if all went well, you should see that your test passed. However, if not, this is a good time to do a few quick checks. Does a chrome window open on your machine? If not, make sure you have chromedriver installed.  If the window did pop up, check the url, make sure it navigated to the correct place, make sure to check the port!  If a test failed in the effects, it will show you what the page state was vs what you expected. We can use this to make sure our tests are working correctly. Let's say I go back into our entry component 'NavigateToTestSite'. Inside the effects of our action, I change that I expect the `header.displayed` from `true` to `false`. That is, I am incorrectly expecting the header to not be displayed, while we know it's true. Let's take a look at the terminal when we rerun our test.

```
$ simulato run -T ./tests
❌ 1533583159691-simulato-1_1.json 🍅

ActionError EXPECTED_STATE_ERROR: Page state did not equal expected state
  // ACTION ERROR STACK TRACE

Action: navigateToTestSite.NAVIGATE_TO_SITE
Step: effects
ActionIndex: 0

-- Page State
++ Expected State
  {
    mainSiteLayout: {
      header: {
-       displayed: true,
+       displayed: false,
      },
    },
  }


*** Final Aggregate Test Summary ***
Total tests run: 1
Tests passed: 0
Tests failed: 1
Run time: 11.786941605 seconds

Failed Tests:

1533583159691-simulato-1_1.json - Ran 1 time(s)
        Run 1: ActionError EXPECTED_STATE_ERROR: Page state did not equal expected state
                Action: navigateToTestSite.NAVIGATE_TO_SITE Step: effects ActionIndex: 0
```

In the above test run, I can see that my test failed. It tells me the action `navigateToTestSite.NAVIGATE_TO_SITE` failed and it failed in the `effects` step. It also specifies the action index, so that if the same action was run multiple times in one test, I will know which instance if I look up the index in the JSON test file. It then goes on to show me a detailed comparison of what I expected vs what the actual page state was. As seen above, I expected the header to be displayed `false`, however, when Simulato checked the actual page state it found displayed to be `true`. We can use this to determine that either the test failed or we created our model wrong.

Both components created so far can be thought of as "one time" components. That is they really are only used once when modeling out our system. there is only one home page, there is only one way to navigate to the site. Lets start taking a look on creating more dynamic, reusable components in the [next part of the tutorial](/tutorial-reusable-components-pt1).
