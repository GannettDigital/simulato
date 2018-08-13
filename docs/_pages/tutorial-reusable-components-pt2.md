---
permalink: /tutorial-reusable-components-pt2/
title: "Creating Reusable Components Part 2"
toc: false
classes: wide
---

In [part 1](/tutorial-reusable-components-pt1) of reusable components, we created a fairly large, bulky elements and model section for articles in our `MainSiteLayout` component. When looking at the elements we added we can start to see a lot of similarities between the two articles. The selectors for each article element can be broken down into two parts, what article it belongs to, and if its a image, heading, or text. So for the `article1heading` we can break it into `article1` and `heading`, and `article2heading` to `article2` and `heading`. This trend follows through for image and text.  Looking at the model, for each article we are checking the same properties on the page. We are checking `isDisplayed` for the image, heading, and body as well as the `innerText` for heading and body. We can use these commonalities to create one reusable component for articles.

Before we actually start making the component, we need to come up with a strategy to be able to pass information to the component we are making.  When we broke down the elements, and their selectors, we saw that only parts of the value are changing. We need to send the dynamic part of that id to our reusable component which will allow us to use one component `type` and just create two components of that type. Leveraging Javascript, we are able to use the `this` context as a medium to pass information to our components.

The `this` context in javascript behaves slightly differently then other languages and can be read about [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this).  Inside simulato, when a component is created to be put into the expected state it will call `Object.create()` passing in the base component that is module.exported from a component file. This creates a new object, inheriting the property of the base component we module.export. It then sets some properties to the newly created component based on the values passed in during creation. These values are: `type`, `name`, `options`, and `dynamicarea`. The new component will then run the following functions in order: elements(), model(), actions(), events(), children(). Since the new component is calling its own properties, that is the functions listed previously, the `this` context bound to those functions will be the new component itself. We haven't covered `events` and `children` yet in this tutorial, but we can still note the `this` context is available to them.

We can use the `this` context to solve our need to pass in information to a component, specifically `this.options`. When calling `expectedState.createAndAddComponent()` we know we pass in an object containing `type`, `name`, and `state`, but there is also an additional property we can pass in `options`. The options object is provided to the end user as a place to pass in anything they find useful for the component they are creating.  When the component is actually created, `this.options` is the object passed in by a user and made available to the the `this` context. If no options are provided, a empty object is provided to the `this` context. Now that we have a way to send information, we are finally ready to make our first reusable component.

First off we need to give our new component a `type`. Since we are using this to represent a news article, we can make the `type` as simple as `NewsArticle`. Remember to make the file inside the `components` folder, giving it the name `newsArticle.model.js`.

```
'use strict'

module.exports = {
  type: 'NewsArticle',
}
```

Next we need to create the elements.  Elements is where we can getting start making use of  `this.options`. We know three elements we want to create are: image, heading and text. We know for each element we have an id we can use to select them, lets use for an example `article1Image`.  We know from our previous discussion that `article1` is the part of the string that changes, and it will always end in `Image`. We can use `this.options` to pass in the dynamic part of each id.  Assuming we named the option `baseId`, using [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), we can easily create a selector value for all three of our elements.

```
'use strict'

module.exports = {
  type: 'NewsArticle',
  elements () {
    return [
      {
        name: 'image',
        selector: {
          type: 'getElementById',
          value: `${this.options.baseId}Image`
        }
      },
      {
        name: 'heading',
        selector: {
          type: 'getElementById',
          value: `${this.options.baseId}Heading`
        }
      },
      {
        name: 'text',
        selector: {
          type: 'getElementById',
          value: `${this.options.baseId}Text`
        }
      }
    ];
  },
}
```

As seen above, whenever we create a component of `type` `NewsArticle` we will need to pass in `baseId` inside the options. It's good practice to add some internal documentation at the top of each component that uses options. This will help other component creators to reuse components more efficiently, and understand what is needed for the component you created.

```
'use strict'

/*****
* Options:
*  baseId *required*
*    String
*    Specifies the base id that will prepended to element selectors for image, heading, and text.
*****/

module.exports = {
  type: 'NewsArticle',
  elements () {
    return [
      {
        name: 'image',
        selector: {
          type: 'getElementById',
          value: `${this.options.baseId}Image`
        }
      },
      {
        name: 'heading',
        selector: {
          type: 'getElementById',
          value: `${this.options.baseId}Heading`
        }
      },
      {
        name: 'text',
        selector: {
          type: 'getElementById',
          value: `${this.options.baseId}Text`
        }
      }
    ];
  },
}
```

Going forward with this tutorial, whenever `options` are added to a component we will create the corresponding internal documentation.

Now that we have our `elements`, we can create the `model`. This model should look very similar to the article section inside our previous `MainSiteLayout` component, as nothing has changed with what we want to model out for each element. In addition we will create our empty actions, as we do not currently have any actions related to `NewsArticle`.

```
'use strict'

/*****
* Options:
*  baseId *required*
*    String
*    Specifies the base id that will prepended to element selectors for image, heading, and text.
*****/

module.exports = {
  type: 'NewsArticle',
  elements () {
    return [
      {
        name: 'image',
        selector: {
          type: 'getElementById',
          value: `${this.options.baseId}Image`
        }
      },
      {
        name: 'heading',
        selector: {
          type: 'getElementById',
          value: `${this.options.baseId}Heading`
        }
      },
      {
        name: 'text',
        selector: {
          type: 'getElementById',
          value: `${this.options.baseId}Text`
        }
      }
    ];
  },
  model () {
    return {
      image: {
        displayed: 'image.isDisplayed',
      },
      heading: {
        displayed: 'heading.isDisplayed',
        text: 'heading.innerText'
      },
      body: {
        displayed: 'text.isDisplayed',
        text: 'text.innerText'
      }
    }
  },
  actions () {
    return {};
  }
}
```

Now that we have our `NewsArticle` component, we can go remove the article related component parts out of `MainSiteLayout`.

```
'use strict'

module.exports = {
  type: 'MainSiteLayout',
  elements () {
    return [
      {
        name: 'siteHeader',
        selector: {
          type: 'getElementById',
          value: 'siteHeader'
        }
      }
    ];
  },
  model () {
    return {
      header: {
        displayed: 'siteHeader.isDisplayed'
      }
    };
  },
  actions () {
    return {};
  }
}
```

Since we change our model, remember that you always need to and change the expected state of anyone creating the component of the model you change.
{: notice--info}

Inside the `NAVIGATE_TO_SITE` action we need to update where we add in `MainSiteLayout` to the expected state according to our new model.  In addition, lets add 2 article components to the our expected state as they are present on the page when we navigate there.

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
          expectedState.createAndAddComponent({
            type: 'NewsArticle',
            name: 'newsArticleOne',
            state: {
              image: {
                displayed: true
              },
              heading: {
                displayed: true,
                text: 'Test Article One'
              },
              body: {
                displayed: true,
                text: 'This is the body text of a first test article that is long enough to pass by the preview and still show more in the pop up modal.'
              }
            },
            options: {
              baseId: 'article1'
            }
          });
          expectedState.createAndAddComponent({
            type: 'NewsArticle',
            name: 'newsArticleTwo',
            state: {
              image: {
                displayed: true
              },
              heading: {
                displayed: true,
                text: 'Test Article Two'
              },
              body: {
                displayed: true,
                text: 'This is the body text of a second test article that is long enough to pass by the preview and still show more in the pop up modal.'
              }
            },
            options: {
              baseId: 'article2'
            }
          });
        }
      }
    };
  },
}
```

A few things of note above:

1. Both the newly added components have the same `type`, our new `NewsArticle` component.
2. The new `NewsArticle` components have unique `name`s, `newsArticleOne` and `newsArticleTwo`.
3. We added the `option`, `baseId`, specifying each article's unique base id that is used inside our `elements` of `NewsArticle`.

We should now be able to generate and run some tests! Like before when we just added all the article information to `MainSiteLayout`, creating the new `NewsArticle` and adding into the state is functionally the same. We still only have one action, and only one test should be generated.

`$ npm run generate-tests`

Once our test is generated (make sure you deleted the old one), we can run it.

`$ npm run test`

You should see the same result as before, a quick navigation to the test site, and it making sure the header, and both articles are correctly displayed.

Now we have a good base knowledge for Simulato, and we can start adding more actions to test our site, using more features, and creating more components. Let's start by adding a new action for clicking on a `NewsArticle`, and exploring the [stash/pop](/tutorial-stash-pop/) feature of expected state.