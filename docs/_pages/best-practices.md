---
permalink: /best-practices/
title: 'Modeling Best Practices'
toc_label: 'Best Practices'
---

This Documentation will go over best practices developers of Simulato have found during their use of the tool.  Everything presented here has been found to make the modeling practice easier, as well making the models clear, concise and reusable.

## File Structure

When creating components, matching the system under test's file structure allows for ease of development.  It will allow anyone working with the HTML files to know which components represent that view so the components can be updated side by side with any changes to the view.  Constraining your component to only model what that is included with any given HTML will help keep models smaller, consistent with the system views, and help guide you create the component.

System Under Test Files:

```
- app
- views
  - home.html
  - profile.html
  - login.html
app.js
package.json
```

Test Files:

```
- components
  - views
    - home.model.js
    - profile.model.js
    - login.model.js
```

As you can see all the components were appended with `.model.js` to help distinguish them from the views themselves, and let a user easily know these are models of the html.

Many times the created models for a system live in the same repository / file location as the system itself.  The same logic applies for where to put the tests, just inside a test folder in the main repository.  

System Under Test Files with Tests Included:

```
- app
- views
  - home.html
  - profile.html
  - login.html
- test
  - components
    - views
      - home.model.js
      - profile.model.js
      - login.model.js
app.js
package.json
```

When creating a component, sometimes a view is too complicated, large, or the logic your component needs to perform requires multiple components.  To keep the files grouped while still following the file structure of your system under test, a folder can be created where you would normally create the single component.  Name the folder the view you are modeling, and inside that folder put the multiple components that comprise that view.  It's good practice to keep the names of the models with similar prefixes, changing the suffix to describe what part of the view they are.  

For example, if inside the `profile.html` file, there is an HTML `<select>` tag that needs to be modeled, and that dropdown is a second component we could use the following file structure:

```
- components
  - views
    - home.model.js
    - profile
      - profile.model.js
      - profile.dropdown.model.js
    - login.model.js
```

By keeping the the `profile` part the same and just adding `.dropdown` to the dropdown model, as well as putting them into a folder together, there is a clear grouping of those two models and both are needed to model the `profile.html` view.

If you find that your system has very large complicated html views, don't be afraid to break the models down into multiple components, just remember to try and keep everything logically grouped so developers of the system know which models belong to which views.

## Naming

This section will go into the details of names for your component's type, as well as how to choose names when creating and adding a component to your expected state.  In addition it will provide naming conventions for a components children, or any component it creates during actions.

### Component Type

Component type values should reflect directly back to the html they are modeling.  This helps keep them clear and simple as to what type of component they are.  As a standard, type should be in PascalCase, similar to how you would name a class or constructor in an object oriented language.

Example:

If the component is modeling a file `home-page.html`
The type for that component should be `type: 'HomePage'`.

In the case where multiple components comprise the same view, types should follow the naming you used for the files, following the standards in the `File Structure` section of this document.

Example: 

```
- components
  - views
    - home.model.js
    - profile
      - profile.model.js
      - profile.dropdown.model.js
    - login.model.js
```

`profile.model.js` would have `type: 'Profile'`
`profile.dropdownmodel.js` would have `type: 'ProfileDropdown'`

Many times when looking at a html file structure, files will have simple names such as `actionbar.html` or `index.html`. This would end up having multiple components with the same `type`, which isn't allowed in Simulato.  In this situation prepending the folder names allows to create unique `type` values, as multiple files of the same name are not allowed in a folder.

Example:

System File Structure

```
- app
- views
  - home
    - index.html
    - actionbar.html
  - profile
    - index.html
    - actionbar.html
  - login
    - index.html
app.js
package.json
```

Test File Structure

```
- components
  - views
    - home
      index.model.js
      actionbar.model.js
    - profile
      index.model.js
      actionbar.model.js
    - login
      index.model.js
```

The types from top to bottom would be the following

`type: 'HomeIndex'`
`type: 'HomeActionbar'`
`type: 'ProfileIndex'`
`type: 'ProfileActionbar'`
`type: 'LoginIndex'`

Continue moving up the the folder structure until you can satisfy creating a unique `type` value.

As you create components, you might want to create some that don't follow exactly with the system under test.  Maybe you see a pattern of views using plain html text inputs, or a checkboxes frequently. Instead of having to model them in each view, you want to create a reusable component you can just call as a child to reduce model development time.  There is also your entry component, the component that navigates into your system (usually just one). For these types of models, that don't relate one to one with a view of the system, they should be placed in folders outside file structure you are copying, but still under the components folder.

```
- components
  - views
    - home
      index.model.js
      actionbar.model.js
    - profile
      index.model.js
      actionbar.model.js
    - login
      index.model.js
  - entry
    - entryComponent.model.js
  - base-html
    - textInput.model.js
    - checkBox.model.js
```

### Component Name

As a standard, names should be written in camelCase, to distinguish them from type. Similar to the component type being related to the HTML file, a given component's name should be related to that component's type. 

When a component, and therefore a view, is only used once for the system the name can simply be the component's type, but in camelCase.

Example:

```
- app
- views
  - home-page.html
  - profile.html
  - login-page.html
- components
  - home-page.model.js
  - profile.model.js
  - login-page.model.js
app.js
package.json
```

When looking this file structure, with its 3 views and its 3 accompanying models, if each view was only used once in that system the components could have the following names.

`name: 'homePage'`
`name: 'profile'`
`name: 'loginPage'`

These names would be very similar to the component's type which would be `HomePage`, `Profile`, and `LoginPage` respectively.

When looking at a more modern approach to front end design, many views are reusable and called throughout a system multiple times.  Just like type, we want the names to be unique so we can get a good grasp of where they belong in the system.  Usually when a view is reusable they are called within other views, when this is the case the standard is to call them as children, which we will detail in the next section. 

However, reusable views don't have to be called within other views, a specific view could be part of multiple routes, or just loaded in tandem with other views. When this is the case we want to have a clear naming convention so we know where the view is being used, and has a different name when the view is called elsewhere.

Example:

```
- app
- views
  - actionbar.html
  - home-page.html
  - profile-page.html
- components
  - actionbar.model.js
  - home-page.model.js
  - profile-page.model.js
app.js
package.json
```

Let's say the view `actionbar.html` is called with `home-page.html` and a separate instance of `actionbar.html` is called with `profile-page.html`.  We will assume that `actionbar.html` behaves different when loaded either `home-page.html` or `profile-page.html`. By making this assumption we know we need to create and add the actionbar component to the expected state twice, once for profile and once for home, if they were the same action bar that was just static on the page, we would only ever add it once and would not have to worry about this specific naming situation.

Currently, following the standards the type for `actionbar.model.js` would be `type: 'Actionbar'`.  When we call `expectedState.createAndAddComponent()`, we want to differentiate which views actionbar this is.

When creating the home page's actionbar:

```
expectedState.createAndAddComponent({
  type: 'Actionbar',
  name: 'homePageActionbar',
  state: { ... }
});
```

When creating the profile page's actionbar

```
expectedState.createAndAddComponent({
  type: 'Actionbar',
  name: 'profilePageActionbar',
  state: { ... }
});
```

This naming style matches very closely with the children naming conventions that we will talk about next.

### Children Names

This section will specifically go over the best naming practices for children, the standards for the rest of children in the `children` section below.

When adding children into a component, they are normally a reusable type component being added. When this is the case the standard is to prepend the the current component's name to the name you would normally name a base component (following the standard above).  Naming the components this way will allow the user to quickly identify during test generation and execution which actionbar state/actions we are currently caring about.

Example:

Let's say a home page view calls a text input view, this view is somewhere else in the system and has a corresponding component already created. Inside the home page component we would see the following

```
type: 'HomePage',
elements () {
  return [ ... ];
},
model () {
  return { ... };
},
actions () {
  return { ... }
},
children () {
  return [ ... ];
}
```

The home page model has `type: 'HomePage'`, and following standards the name should be `name: 'homePage'`.
We want to add the TextInput component into the children section of the model. Assuming it has the `type: 'TextInput'`, we would want to prepend our current name `homePage` to the name we would give TextInput, `textInput`.  However since we do not specifically know what name will be given to any given component when it's added to the expected state, we want to avoid prepending any hard coded values. The components `this` context comes in to help out (specifics about `this` can be found [here](#this)). Inside the `this` context we have access to the name property, that is the name this component was given during its creation. Using [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), we can easily create a name for the child using the prepended components name.

Remember to keep the standard of using camelCase, creating the following child:

```
children () {
  return [
    {
      type: 'TextInput',
      name: `${this.name}TextInput`,
      state: { ... }
    }
  ];
}
```

In our specific example it will create the name `homePageTextInput`.  It's important to use the this context to create the children name, as many times in a hierarchical view structure, a child can go on to its own children components, which in turn could make more children components. By always prepending `${this.name}` it will allow each child to have unique names, and correspond back to the parent component that originally created them.

Example:

Lets again assume we have our home page view, however this time it calls a Form as well as the TextInput. We have the following form component, which in itself calls a TextInput.

```
type: 'Form',
elements () {
  return [ ... ];
},
model () {
  return { ... };
},
actions () {
  return { ... }
},
children () {
  return [
    {
      type: 'TextInput',
      name: `${this.name}TextInput`,
      state: { ... }
    }
  ];
}
```

We will call the Form component in our home page:

```
type: 'HomePage',
elements () {
  return [ ... ];
},
model () {
  return { ... };
},
actions () {
  return { ... }
},
children () {
  return [
    {
      type: 'TextInput',
      name: `${this.name}TextInput`,
      state: { ... }
    },
    {
      type: 'Form',
      name: `${this.name}Form`,
      state: { ... }
    }
  ];
}
```

This will create the Form component with the name `homePageForm`, as well as the TextInput component with the name `homePageTextInput`. In addition the newly created Form component will create its child, TextInput. Because of always using `this.name` when creating our children, the Form's TextInput will have the name `homePageFormTextInput`.

This example shows two important concepts:

One, if we were hard coding the name for TextInput inside homepage it would technically work assuming home page was only ever added to the expected state once.  However, the TextInput child inside form, if harded coded to `homePageFormTextInput` would only work for the home page child, if this form was added in any other component, lets' say `profilePage`, we wouldn't want the profile page to create a form, that creates a Textinput to have the name `homePageFormTextInput`, but rather `profilePageFormTextInput`. 

Two, if names are hard coded we could easily end up accidentally adding two components of the same name to the expected state. Following with the `TextInput` example, if the names were always just `textInput`, when the form's TextInput was added both the home page's TextInput and form's TextInput would have the same name.

Sometimes just prepending `this.name` isn't enough to create a unique name. Lets say our Form component is a form that asks for a users first and last name.  Each field in the form is a basic TextInput component that can be added as children. This means the form component will have two children of `type: 'TextInput'`.  We cannot just give both the name `${this.name}TextInput` as we would run into the problem of two components added to the expected state with the same name. To solve this issue we can add some context about the text input into the name.  This context doesn't have a hard standard, but use your best judgement to keep it simple and clear. 

Example: 

Let's assume the form has two inputs, First Name, and Last name, solution to our unique naming problem is simply adding FirstName and LastName into the components name.

```
type: 'Form',
elements () {
  return [ ... ];
},
model () {
  return { ... };
},
actions () {
  return { ... }
},
children () {
  return [
    {
      type: 'TextInput',
      name: `${this.name}FirstNameTextInput`,
      state: { ... }
    },
    {
      type: 'TextInput',
      name: `${this.name}LastNameTextInput`,
      state: { ... }
    }
  ];
}
```

If this form was still being called by our home page component, the final names would be `homePageFormFirstNameTextInput` and `homePageFormLastNameTextInput`.  While using this name convention names can start to get long if children create children create children, it will ensure there are unique names and they are grouped together.

At some point, continuing to prepend `this.name` to component's name may lose its value.  Either the name has gone to long and is hard to understand, or you went through a certain section of your UI far enough you are on a new unique page.  It is ok to remove the `this.name` of part of a component at some point and start over with a new base name. Many times these base names are used when a new view is navigated two, and isn't rendered as part of a parent view.

For example, let's assume we have a login page component, which calls our form component with the two text inputs. After I fill out the forms text inputs, a button on the login page becomes enabled that I can then click. If clicking the button navigates us to our home page, that is, the effects of clicking the submit button navigates me to home page.  Inside the effects for that action, I want to add the `HomePage` component to the expected state.  If I were to follow the guide above, it would have the name `loginPageHomePage` which isn't very valuable for a name.  That is, I wouldn't gain value propagating `this.name` through to the home page component. Instead when adding the `HomePage` component to the expected state, I can just give it the name `homePage`.

As a rule of thumb, propagate `this.name` down through children, but when adding in 'base' view components, start with a fresh name.

## Entry Components

Normally all components added to the expected state happens during action effects, or as children, but the first component needs to be added into the state automatically so Simulato knows where to start test generation and execution.  To run Simulato tests, at least one entry component is needed. This component contains a specific property tells Simulato it is an entry component.

The type for component can be as simple as 'Entry' if you only have one entry component, or something more specific as needed.

Example: 

```
type: 'NavigateToSite',
entryComponent: {
    name: 'navigateToSite',
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
        driver.get('http://www.siteUnderTest.com')
          .then(callback, callback)
      },
      effects (expectedState) {
        expectedState.clear();
        expectedState.createAndAddComponent({
          type: 'LoginPage',
          name: 'loginPage',
          state: { ... }
        });
      }
    }
  }
}
```

As seen above, when an entry component is created the entryComponent property is added to the component. This simply gives it the name it should be created with, as well as the state it should expect. For most entry components the elements and model will simply return an empty array and object, which will me the entryComponent.state will be an empty object.  The reason they are empty is there is nothing we currently expect to be present in the UI, nothing that needs to be modeled, we are simply making an action with no preconditions, that opens the browser and navigate to a page.  Note that even though the elements and model returns an empty array and object, they can not be removed from the component as all components need a type, elements, model, and actions property.

Inside the effects of our navigation we call expectedState.clear(), this will removed the entry component itself from the expected state that simulato automatically added, if we fail to call expectedState.clear() this component will be part of the expected state for the entire test run.

## this Context

`this` context in javascript behaves slightly differently then other languages and can be read about [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this).  Inside simulato, when a component is created to be put into the expected state it will call `Object.create()` passing in the base component that is module.exported from a component file. It then sets some properties to the newly created component based on the values passed in during creation. These values are: `type`, `name`, `options`, and `dynamicarea`. It will then run the following functions in order: elements(), model(), actions(), events(), children().  As these functions are part of the newly created components object, the `this` context inside each of those functions is the component itself. This provides you access to the `name`, `type`, `options`, and `dynamicArea` properties of the component. Since the functions run in a specific order, you are able to see `this.elements` inside the model, but you would be unable to see `this.actions` inside the model. Children is specifically run last in order for you leverage events if needed.

`this.name`, `this.options`, and `this.dynamicarea` and the 3 important values that can be leveraged while creating logic for either creating components, or adding effects in your components. `this.name` should be used when wanting to modify yourself with `expectedState.modify(this.name, (component) => { ... })`, as well as used with all the naming standards stated above.  `this.dynamicarea` is useful when creating and adding components and wanting to know which dynamicarea's the current component has. Note: When creating children the parent component's dynamic areas are auto assigned to the child, however when creating and adding, or specifically specify dynamic areas to a child will only use provided dynamic areas. More of this will be covered in the dynamic area section. `this.options` is detailed below.

### this.Options

`this.options` is the object passed in by a user when an component is created and added to the expected state. If no options are provided, a empty object is provided to the `this` context. The options object is provided to the end user as a place to pass in anything they find useful for the component they are creating.  Some common use cases are provided below.

#### Passing in a selector value for a reusable component:

Going back to our form example, if I have form with two different input fields, these input fields will have different HTML selectors.  As a best practice always add id attribute to fields, more on this will be discussed in the `Elements` section of this documentation.  In order to pass in the selector value for each text input, we can use the options block as seen below:

```
type: 'Form',
elements () {
  return [ ... ];
},
model () {
  return { ... };
},
actions () {
  return { ... }
},
children () {
  return [
    {
      type: 'TextInput',
      name: 'firstNameTextInput',
      state: { ... },
      options: {
        id: '<some id value here>'
      }
    },
    {
      type: 'TextInput',
      name: 'lastNameTextInput',
      state: { ... },
      options: {
        id: '<some other id value here>'
      }
    }
  ];
}
```

This will create the two different TextInput components, passing in a unique id for each one.  The TextInput can now have the following model.

```
type: 'TextInput',
elements () {
  return [
    {
      name: 'inputField',
      selector: {
        type: 'getElementById',
        value: this.options.id
      }
    }
  ];
},
model () {
  return { ... };
},
actions () {
  return { ... }
}
```

As stated above, inside the `this` context of a component we will have access to `this.options`, that is the options that were passed in when it was created. So when elements are returned from our newly created firstNameTextInput and lastNameTextInput, they will each be created with their own unique id that we passed in.

#### Passing in data to be used in an action:

Continuing with our TextInput, let's say it's only action is to enter text, this will simply add some text into the input box changing the input's value. Using action parameters (discussed further in the `action` section), we will create the text we want the input to put in.

```
type: 'TextInput',
elements () {
  return [
    {
      name: 'inputField',
      selector: {
        type: 'getElementById',
        value: this.options.id
      }
    }
  ];
},
model () {
  return {
    displayed: 'inputField.isDisplayed',
    value: 'inputField.value'
  };
},
actions () {
  return {
    ENTER_TEXT: {
      parameters: [
        {
          name: 'text',
          generate () {
            return 'This Text Will Be Input To Field';
          }
        }
      ],
      preconditions () {
        return [
          ['isTrue', `pageState.${this.name}.displayed`]
        ];
      },
      perform (text, callback) {
        driver.findElement(By.id(this.options.id))
          .sendKeys(text)
          .then(callback, callback);
      },
      effects (text, expectedState) {
        expectedState.modify(this.name, (input) => {
          input.value = text;
        });
      }
    }
  }
}
```

If you take a look into the parameters property of ENTER_TEXT, you can see we are creating a parameter named `text`, which when generated will return the string `'This Text Will Be Input To Field'`. This will then be used in the perform to use selenium driver to send the `text` to the input, and inside the effect we can modify the expected state to expect that `text` is the input's value.  By using `this.options` we can pass in what we want generated by our `text` parameter, rather than having the hard coded value. 

```
parameters: [
  {
    name: 'text',
    generate () {
      return this.options.text;
    }
  }
],
```

When going back to our form, who creates the two `TextInput` components, we can pass in more options, to make each `TextInput` dynamic and unique.

```
type: 'Form',
elements () {
  return [ ... ];
},
model () {
  return { ... };
},
actions () {
  return { ... }
},
children () {
  return [
    {
      type: 'TextInput',
      name: 'firstNameTextInput',
      state: {
        displayed: true,
        input: ''
      },
      options: {
        id: '<some id value here>',
        text: 'John'
      }
    },
    {
      type: 'TextInput',
      name: 'lastNameTextInput',
      state: {
        displayed: true,
        input: ''
      },
      options: {
        id: '<some other id value here>',
        text: 'Doe'
      }
    }
  ];
}
```

#### Passing in flags to control logic inside the component:

At some point you will probably want to make components that are even more dynamic than just selector values, and some sort of action parameter.  Since the main sections of a component (`elements`, `model`, `actions`, `children`, `events`) are all designed as javascript functions, it gives the component creator a large amount of power of to what is returned when that section is invoked and added to the component.  To continue with our TextInput, currently we have a ENTER_TEXT action, but what if we also want a DELETE_TEXT action.  It could be that in the system under test some special logic applies when certain input values are deleted, but probably not all of them. If we just add it as a normal action, every single text input would enter and delete text, leading to some unnecessary action bloat.  We can pass in some sort of flag inside the `options` that would dynamically add an action.

```
actions () {
  const actions = {
    ENTER_TEXT: {
      parameters: [
        {
          name: 'text',
          generate () {
            return this.options.text;
          }
        }
      ],
      preconditions () {
        return [
          ['isTrue', `pageState.${this.name}.displayed`]
        ];
      },
      perform (text, callback) {
        driver.findElement(By.id(this.options.id))
          .sendKeys(text)
          .then(callback, callback);
      },
      effects (text, expectedState) {
        expectedState.modify(this.name, (input) => {
          input.value = text;
        });
      }
    }
  };

  if (this.options.deleteText) {
    actions.DELETE_TEXT = {
      preconditions () {
        return [
          ['isTrue', `pageState.${this.name}.displayed`],
          ['isNotEmpty', `pageState.${this.name}.value`]
        ];
      },
      perform (callback) {
        driver.findElement(By.id(this.options.id))
          .clear()
          .then(callback, callback);
      },
      effects (expectedState) {
        expectedState.modify(this.name, (input) => {
          input.value = '';
        });
      }
    }
  }

  return actions;
}
```

As seen above you can we are just using a simple if statement to decide if we ant to add the DELETE_TEXT action onto the actions object before we return it. When the `action()` function is called during component creation, if will check if `this.options.deleteText` is truthy, and if truthy, will add the DELETE_TEXT to actions.  So if we go back to our form we can have it delete the last name, but not delete the first name.

```
type: 'Form',
elements () {
  return [ ... ];
},
model () {
  return { ... };
},
actions () {
  return { ... }
},
children () {
  return [
    {
      type: 'TextInput',
      name: 'firstNameTextInput',
      state: {
        displayed: true,
        input: ''
      },
      options: {
        id: '<some id value here>',
        text: 'John'
      }
    },
    {
      type: 'TextInput',
      name: 'lastNameTextInput',
      state: {
        displayed: true,
        input: ''
      },
      options: {
        id: '<some other id value here>',
        text: 'Doe',
        deleteText: true
      }
    }
  ];
}
```

Remember, options can have whatever a user needs it. If that is a String, a Boolean to use as a flag, a function you will call in your component, that is left to the component creator. Think of options as your "free space" to influence components to make them more dynamic, and follow logic needed to match the system under test.

## Elements

The elements section is used to describe what things we care about on the page, and more specifically how selenium can find them.  We previously went over using `this.options` for making selectorss more dynamic, so this section will just cover good practices when creating selectors.

The number one golden rule for selectors is to always use ids when possible. If you have control over the html you are modeling add id's to the elements you care about. Query selectors are brittle, and any change to the html page can break a query selector. Always, always, always prioritize ids when possible.

That being said, there are many times you require in 3rd party libraries, or dont have the control of the html and query selectors are the best you are able to do.  When this is this case try to make as stable as a selector as you are able. For example, there is a sidebar with 3 links, each link is an anchor tag that is a direct child of a div with the id `sidebarId`. If the second link was the "active" link, and was given the class `active`, if I were to just open up chrome, have it tell me the selector it could give me a selector such as `'#sidebarId > a.active'`. At that given point in time, that it is selector, however if I click a different link it will not longer refer to the 2nd link.  A more stable querySelector would be `'#sidebarId > a:nth-child(2)'`, this will always refer to the second a tag even if it has the active class or not.

It's good practice to only add elements you care about, that is, the elements used in the model section of the component. While a view may have 50 different html tags we could put in our elements, if only 5 are ones we care about for our model, those are the only 5 we should add to this section. While selenium will only actively grab data about the elements you put in the model (which costs execution time), it is a waste of your time to have selectors created for every single part of a view if we don't care about them all. In addition, all names must be unique inside a single component.

## Model

If the elements section can be thought of how we tell selenium where to get the elements, the model can be thought of as what things we care about for that element. Built into selenium the following data is retrieved for each element in the elements section: 

`attributes`:  An object, each key on the object being an attribute present on the element, with the value of that key as the value for the attribute. Example: `<div hidden="true"></div>`. The attributes of this element would be `{hidden: 'true'}`.

`name`: Name provided by the creator of the elements section, remember each element has a name and selector, this is that provided name.

`disabled`:  Commonly used disabled attribute, put here for convenience rather than having to go through the attributes object.

`innerHTML`: innerHtml property of the element.

`innerText`: innerText property of the element.

`hidden`: hidden property of the element.

`value`: value property of the element.

`checked`: checked property of the element.

`webElement`: webElement provided by Selenium. Contains all data, and used as a backup if there is some data needed not easily provided by Simulato.

`isDisplayed`: Custom displayed function created for Simulato, a simplified version of the one default in Selenium. Calls the browser function `getComputedStyle()` to check `display`, `visibility`, `opacity`, as well its the elements size to determine if that element is currently visible on the page.

Using this aggregated element data we can create a component with a model section modeling out the parts we care about. We should only model out parts of the system we are directly concerned with, each property we add to a model is more we have to manage in our expectedState.

For most use cases, `disabled`, `innerText`, `value`, and `isDisplayed` will cover the information you need to get from a webpage. When using `attributes` or `webElement`, a function will have to be used inside the model to get the information out that you need. A common use case would be to have a element class be part of your model, as seen in the example below.

Example:

Going back to our `TextInput`, let's assume a class can be added to the element `locked`. If the text input has the `locked` class, we will be unable to delete the text inside that input. Our previous version of `TextInput` had both the `ENTER_TEXT` and `DELETE_TEXT` action, with `DELETE_TEXT` preconditions checking if the input was displayed, as well as had some text. We know need to check if has the `locked` class as a precondition.

Previous TextInput:

```
type: 'TextInput',
elements () {
  return [
    {
      name: 'inputField',
      selector: {
        type: 'getElementById',
        value: this.options.id
      }
    }
  ];
},
model () {
  return {
    displayed: 'inputField.isDisplayed',
    value: 'inputField.value'
  };
},
actions () {
  const actions = {
    ENTER_TEXT: {
      parameters: [
        {
          name: 'text',
          generate () {
            return this.options.text;
          }
        }
      ],
      preconditions () {
        return [
          ['isTrue', `pageState.${this.name}.displayed`]
        ];
      },
      perform (text, callback) {
        driver.findElement(By.id(this.options.id))
          .sendKeys(text)
          .then(callback, callback);
      },
      effects (text, expectedState) {
        expectedState.modify(this.name, (input) => {
          input.value = text;
        });
      }
    }
  };

  if (this.options.deleteText) {
    actions.DELETE_TEXT = {
      preconditions () {
        return [
          ['isTrue', `pageState.${this.name}.displayed`],
          ['isNotEmpty', `pageState.${this.name}.value`]
        ];
      },
      perform (callback) {
        driver.findElement(By.id(this.options.id))
          .clear()
          .then(callback, callback);
      },
      effects (expectedState) {
        expectedState.modify(this.name, (input) => {
          input.value = '';
        });
      }
    }
  }

  return actions;
}
```

First we will go into the model section, and add in the `locked` property we care about. To do this we will need to use the attribute `class`, which contains the string inside the `class` attribute of an element.

`<input type="text" class="locked">`

```
elements () {
  return [
    {
      name: 'inputField',
      selector: {
        type: 'getElementById',
        value: this.options.id
      }
    }
  ];
},
model () {
  return {
    displayed: 'inputField.isDisplayed',
    value: 'inputField.value',
    locked (elements) {
      let classString = elements.inputField.attributes.class;
      if (classString.indexOf('locked') !== -1) {
        return true;
      }
      return false;
    }
  };
},
```

When declaring a property on the model as a function (as seen above), the elements object is automatically passed in by Simulato. The elements object has a property for each element created in the elements section, with they key of the name you created. Accessing that element will provide you access to the properties described above.  When looking at the class attribute in html, it's value will be a string of all class names. For our example we check the string for the class we care about, evaluating to true or false accordingly.  We can now modify our `DELETE_TEXT` action to use the `locked` property of the model.

```
actions.DELETE_TEXT = {
  preconditions () {
    return [
      ['isTrue', `pageState.${this.name}.displayed`],
      ['isNotEmpty', `pageState.${this.name}.value`],
      ['isFalse', `pageState.${this.name}.locked`]
    ];
  },
  perform (callback) {
    driver.findElement(By.id(this.options.id))
      .clear()
      .then(callback, callback);
  },
  effects (expectedState) {
    expectedState.modify(this.name, (input) => {
      input.value = '';
    });
  }
}
```

## Actions

The actions section has 4 main parts, `preconditions`, `perform`, `effects`, and `parameters`.  Both `parameters` and `preconditions` are optional parts of the actions, however `preconditions` will be in almost every component besides your entry component.

### Preconditions

The preconditions property of the action object must be a function that returns an array of arrays representing [chai asserts](http://www.chaijs.com/api/assert/).  Inside the simulato code, it will process the chai asserts to generate tests, as well as make sure conditions are met during test execution.  The chai assert array follows the exact same pattern regardless of what chai assert you are calling. The following pattern is used:

[ `<chaiAsserMethod>`, `<param1>`, `[param2]`, ... ]

For example, a commonly used chai asset is [isTrue](http://www.chaijs.com/api/assert/#method_istrue). Looking at the documentation, isTrue takes a param value, as well as an optional param message.  If we wanted to check something on the pageState is displayed we could make the following chai assert array:

[ 'isTrue', `pageState.${this.name}.displayed` ]

This would tell Simulato to call the chai assert isTrue method, passing in the value we care about to check if is true.

When creating you chai assert arrays, use `this.name` whenever possible when referring to the current component, in addition always make sure to prepend with either `pageState` or `dataStore` as this tells simulato what part of the system you are asserting on.

Any number of preconditions are allowed for any given action, but the more preconditions the slower test generation becomes. Always make your preconditions as succinct, and specific to the action as possible.

Example:

Let's say we have a page with 2 checkboxes, checkbox1, and checkbox2. Both checkboxes are part of a component as seen below.

```
type: 'CheckboxPage',
elements () {
  return [
    {
      name: 'checkboxContainer',
      selector: {
        type: 'getElementById'
        value: 'checkboxContainer'
      }
    },
    {
      name: 'checkbox1',
      selector: {
        type: 'getElementById'
        value: 'checkboxContainerCheckbox1'
    }
    },
        {
      name: 'checkbox2',
      selector: {
        type: 'getElementById'
        value: 'checkboxContainerCheckbox2'
      }
    }
  ];
},
model () {
  return {
    displayed: 'checkboxContainer.isDisplayed',
    checkbox1: {
      displayed: 'checkbox1.isDisplayed',
      checked: 'checkbox1.checked'
    },
    checkbox2: {
      displayed: 'checkbox2.isDisplayed',
      checked: 'checkbox2.checked'
    }
  };
},
actions () { ... }
```

When creating actions I want to have 2 actions for each checkbox, CHECK and UNCHECK. Just as they sound one action will check the box, the second will uncheck.  When creating preconditions we want to think of what is the bare minimum required to be able to perform that action.  Lets focus on one action, CHECK_CHECKBOX1. As part of our model we know we could use if the container is displayed, if checkbox1 is displayed as well as its checked property, and if checkbox2 is displayed and it's checked property. Because all of this is available to us we could make the follow preconditions

```
actions () {
  return {
    CHECK_CHECKBOX1: {
      preconditions () {
        return [
          [ 'isTrue', `pageState.${this.name}.displayed` ],
          [ 'isTrue', `pageState.${this.name}.checkbox1.displayed` ],
          [ 'isFalse', `pageState.${this.name}.checkbox1.checked` ],
          [ 'isTrue', `pageState.${this.name}.checkbox2.displayed` ],
          [ 'isFalse', `pageState.${this.name}.checkbox2.checked` ],
        ];
      },
      perform (callback) { ... },
      effects () { ... },
    }
  };
}
```
Looking at these preconditions, we are saying we can only perform CHECK_CHECKBOX1 if the checkboxContainer is displayed (which we assigned to displayed property of the model), and both checkbox1 and checkbox2 are displayed, and neither box is checked.  Since these are checkboxes and not radio buttons we will assume the status of checxkbox2 has no relevance to checkbox one, and we can easily remove the 2 preconditions regarding checkbox2 in our action for checkbox1.

```
actions () {
  return {
    CHECK_CHECKBOX1: {
      preconditions () {
        return [
          [ 'isTrue', `pageState.${this.name}.displayed` ],
          [ 'isTrue', `pageState.${this.name}.checkbox1.displayed` ],
          [ 'isFalse', `pageState.${this.name}.checkbox1.checked` ],
        ];
      },
      perform (callback) { ... },
      effects () { ... },
    }
  };
}
```

This leaves us with 3 preconditions to perform CHECK_CHECKBOX1.  To follow the standard of distilling the preconditions down to the bare minimum we need to meet the requirement, if our checkbox is never NOT displayed when this component is part of the state, and the container is never NOT displayed, we don't need to add these as preconditions as they are not relevant.

```
actions () {
  return {
    CHECK_CHECKBOX1: {
      preconditions () {
        return [
          [ 'isFalse', `pageState.${this.name}.checkbox1.checked` ],
        ];
      },
      perform (callback) { ... },
      effects () { ... },
    }
  };
}
```

Anything not used in preconditions or effects can be removed from the model section, as well as elements section if they are not relevant to our actions. This would distill down the component to the following adding preconditions for our 4 actions.

```
type: 'CheckboxPage',
elements () {
  return [
    {
      name: 'checkbox1',
      selector: {
        type: 'getElementById'
        value: 'checkboxContainerCheckbox1'
    }
    },
        {
      name: 'checkbox2',
      selector: {
        type: 'getElementById'
        value: 'checkboxContainerCheckbox2'
      }
    }
  ];
},
model () {
  return {
    checkbox1: {
      checked: 'checkbox1.checked'
    },
    checkbox2: {
      checked: 'checkbox2.checked'
    }
  };
},
actions () {
  return {
    CHECK_CHECKBOX1: {
      preconditions () {
        return [
          [ 'isFalse', `pageState.${this.name}.checkbox1.checked` ],
        ];
      },
      perform (callback) { ... },
      effects () { ... },
    },
    UNCHECK_CHECKBOX1: {
      preconditions () {
        return [
          [ 'isTrue', `pageState.${this.name}.checkbox1.checked` ],
        ];
      },
      perform (callback) { ... },
      effects () { ... },
    },
    CHECK_CHECKBOX2: {
      preconditions () {
        return [
          [ 'isFalse', `pageState.${this.name}.checkbox2.checked` ],
        ];
      },
      perform (callback) { ... },
      effects () { ... },
    },
    UNCHECK_CHECKBOX2: {
      preconditions () {
        return [
          [ 'isTrue', `pageState.${this.name}.checkbox2.checked` ],
        ];
      },
      perform (callback) { ... },
      effects () { ... },
    }
  };
}
```

Remember you can add in/remove parts of the model that you need. So while in this example we removed displayed from both our model and preconditions, if there were other actions that affected this displayed status of these checkboxes, we would want them back in both model and precondition.  So for example, if there was some sort toggle on the page, that toggles the display of the checkboxes. I would need to have the preconditions that the checkboxes are displayed as well as checked/unchecked, as there is a possibility in the system those checkboxes are not displayed.  We would also have to model the actions that would display and undisplay our checkboxes to have better complete tests of our system.

### Perform

Perform is where we will tell the selenium driver how to perform our action, and actually does the interaction on the web page.  Currently simulato only supports base javascript selenium, whos documentation can be found [here](http://seleniumhq.github.io/selenium/docs/api/javascript/index.html).  Both driver, and By are provided globally via Simulato, and are used when constructing the perform block.  Selenium uses promises to handle the synchronous nature of perform driver actions to the webpage, which can all be read about inside its documentation.  However, as promises are not used in Simulato, a callback is provided by simulato, into to the perform block, this must be called inside the perform block to tell Simulato this step is complete. When using selenium driver the most common actions we have found used are `findElement()`, `click()`, `sendKeys()`, and `then()`.

Example: 

To continue with our checkbox actions, lets fill out the perform block for CHECK_CHECKBOX1. We know to check a checkbox in an html system you just have to click it. So first we need to have the selenium driver find the element, click it, then we can call our callback telling Simulato we are finished with the perform block.

```
type: 'CheckboxPage',
elements () {
  return [
    {
      name: 'checkbox1',
      selector: {
        type: 'getElementById'
        value: 'checkboxContainerCheckbox1'
    }
    },
        {
      name: 'checkbox2',
      selector: {
        type: 'getElementById'
        value: 'checkboxContainerCheckbox2'
      }
    }
  ];
},
model () {
  return {
    checkbox1: {
      checked: 'checkbox1.checked'
    },
    checkbox2: {
      checked: 'checkbox2.checked'
    }
  };
},
actions () {
  return {
    CHECK_CHECKBOX1: {
      preconditions () {
        return [
          [ 'isFalse', `pageState.${this.name}.checkbox1.checked` ],
        ];
      },
      perform (callback) {
        driver.findElement(By.id('checkboxContainerCheckbox1'))
          .click()
          .then(callback, callback);
      },
      effects () { ... },
    },
    ...
  };
}
```

As seen we are using `driver.findElement()` to tell selenium driver how to find the element we want to perform our action on. `By`, the other globally provided object can also be found in the [selenium docs](http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_By.html), and is used to provide selectors to `findElement()`. Common uses are `By.id()` and `By.css()`. Once we have the element found, we chain promises to click it, then call our callback.  It is best practice to use `.then(callback, callback)` to leave a perform block.  In the world of promises they can resolve differently, either success or reject. The first callback in `.then(callback, callback)` is called if the promise throws no errors, and is considered a success, while the second is called if an error is thrown. For converting it back to simulato's callback scheme, we want to call the callback for either a promise success, or promise reject, which is why we pass callback in twice.

Similar to how preconditions should be as simple as possible, so should action perform blocks. If you find yourself performing actions on mutiple elements, or doing multiple things to one element inside one perform block, these should be broken out into multiple actions.

### Effects

Now that we know what conditions must be met to perform an action, how to perform the action, we need to describe the expected behavior, more specifically, the expected effect on the system of performing that action.

When creating the effects block, keep to the standard of only modifying yourself, trying not to ever modify other components besides the component where the action is.

Example:

To continue fleshing out our checkbox example, when we perform the action CHECK_CHECKBOX1, the effect of the html should be that the html elements `checked` property should now be true. We will modify the expected state of our checkboxPage to reflect this.

```
type: 'CheckboxPage',
elements () {
  return [
    {
      name: 'checkbox1',
      selector: {
        type: 'getElementById'
        value: 'checkboxContainerCheckbox1'
    }
    },
        {
      name: 'checkbox2',
      selector: {
        type: 'getElementById'
        value: 'checkboxContainerCheckbox2'
      }
    }
  ];
},
model () {
  return {
    checkbox1: {
      checked: 'checkbox1.checked'
    },
    checkbox2: {
      checked: 'checkbox2.checked'
    }
  };
},
actions () {
  return {
    CHECK_CHECKBOX1: {
      preconditions () {
        return [
          [ 'isFalse', `pageState.${this.name}.checkbox1.checked` ],
        ];
      },
      perform (callback) {
        driver.findElement(By.id('checkboxContainerCheckbox1'))
          .click()
          .then(callback, callback);
      },
      effects (expectedState) {
        expectedState.modify(this.name, (checkboxPage) => {
          checkboxPage.checkbox1.checked = true;
        });
      },
    },
    UNCHECK_CHECKBOX1: {
      preconditions () {
        return [
          [ 'isTrue', `pageState.${this.name}.checkbox1.checked` ],
        ];
      },
      perform (callback) {
        driver.findElement(By.id('checkboxContainerCheckbox1'))
          .click()
          .then(callback, callback);
      },
      effects (expectedState) {
        expectedState.modify(this.name, (checkboxPage) => {
          checkboxPage.checkbox1.checked = false;
        });
      },
    },
    CHECK_CHECKBOX2: {
      preconditions () {
        return [
          [ 'isFalse', `pageState.${this.name}.checkbox2.checked` ],
        ];
      },
      perform (callback) {
        driver.findElement(By.id('checkboxContainerCheckbox2'))
          .click()
          .then(callback, callback);
      },
      effects (expectedState) {
        expectedState.modify(this.name, (checkboxPage) => {
          checkboxPage.checkbox2.checked = true;
        });
      },
    },
    UNCHECK_CHECKBOX2: {
      preconditions () {
        return [
          [ 'isTrue', `pageState.${this.name}.checkbox2.checked` ],
        ];
      },
      perform (callback) {
        driver.findElement(By.id('checkboxContainerCheckbox2'))
          .click()
          .then(callback, callback);
      },
      effects (expectedState) {
        expectedState.modify(this.name, (checkboxPage) => {
          checkboxPage.checkbox2.checked = false;
        });
      },
    },
  };
}
```

As seen above, we are following the standard of modify only the component the action is in. Following the standard, it will make it so most times you call `expectedState.modify()`, you will pass in `this.name` to specify which component added to the state you want to modify. When providing `expected.modify()` a callback, we are using the ES6 standard arrow notation.  The parameter passed into the callback is the expected state object of that component as it currently is inside the expected state. In our example we know that expected state object, which follows the model of this component, has a checkbox1 property, which has a checked property, which we now want to set to true.  If you are ever unsure what properties will be passed back refer to the model section of the component you are modifying. 

In many cases, performing actions in one component will affect another component's state. Since the best practice is to only modify ourselves, we need a way to tell other components that our action was performed.  This concept is what led to the development of the event system inside our actions, which is described in detail in the events section of this document.

### Parameters

The last section inside an action is the Parameters section. This section was left for last as it is not used in every component you will create. Parameters provides you with a section to generate parameters that can be used during the perform and effect blocks of an action.  If you ever are using some sort of hard coded input, and then using that input inside the effects the parameters block should be used instead.  Parameters are prepended into the the parameters for both perform and effects, one parameter in the function calls for each parameter created in this parameters block.

Example:

A common use case is when we want to use `driver.sendKeys()` in our perform block. Let's say we have an input, that we want to send some data to inside an ENTER_TEXT action. Our action block would look like this:

```
actions () {
  return {
    ENTER_TEXT: {
      parameters: [
        {
          name: 'inputText',
          generate() {
              return 'Some static input text';
          },
        },
      ],
      preconditions () {
        return [
          [ 'isTrue', `pageState.${this.name}.displayed` ]
        ];
      },
      perform (inputText, callback) {
        driver.findElement(By.id('textInputId'))
          .sendKeys(inputText)
          .then(callback, callback)
      },
      effects (inputText, expectedState) {
        expectedState.modify(this.name, (input) => {
          input.value = inputText
        });
      }
    }
  };
}
```

As seen above, the `inputText` is created inside the parameters block, and is prepended into the parameters of both the perform, and effects functions. Similar to other standards in programming, we can easily change the `inputText` parameter, and it will reflect in both places it is used.  While this example shows a static string being generated, the generate function for each parameter is invoked once during planning, so different inputs can be generated for each individual test generation.

## Reusable Components

With the growing popularity of reusable components for front end design, many views inside a particular site will call "mini views", or small templates rather than hard coding that section of the html over and over.  We can create components in this exact way, creating reusable components that we can call as children to ease development. Looking back at our checkbox example we used in the actions section, we created the following component: 

```
type: 'CheckboxPage',
elements () {
  return [
    {
      name: 'checkbox1',
      selector: {
        type: 'getElementById'
        value: 'checkboxContainerCheckbox1'
    }
    },
        {
      name: 'checkbox2',
      selector: {
        type: 'getElementById'
        value: 'checkboxContainerCheckbox2'
      }
    }
  ];
},
model () {
  return {
    checkbox1: {
      checked: 'checkbox1.checked'
    },
    checkbox2: {
      checked: 'checkbox2.checked'
    }
  };
},
actions () {
  return {
    CHECK_CHECKBOX1: {
      preconditions () {
        return [
          [ 'isFalse', `pageState.${this.name}.checkbox1.checked` ],
        ];
      },
      perform (callback) {
        driver.findElement(By.id('checkboxContainerCheckbox1'))
          .click()
          .then(callback, callback);
      },
      effects (expectedState) {
        expectedState.modify(this.name, (checkboxPage) => {
          checkboxPage.checkbox1.checked = true;
        });
      },
    },
    UNCHECK_CHECKBOX1: {
      preconditions () {
        return [
          [ 'isTrue', `pageState.${this.name}.checkbox1.checked` ],
        ];
      },
      perform (callback) {
        driver.findElement(By.id('checkboxContainerCheckbox1'))
          .click()
          .then(callback, callback);
      },
      effects (expectedState) {
        expectedState.modify(this.name, (checkboxPage) => {
          checkboxPage.checkbox1.checked = false;
        });
      },
    },
    CHECK_CHECKBOX2: {
      preconditions () {
        return [
          [ 'isFalse', `pageState.${this.name}.checkbox2.checked` ],
        ];
      },
      perform (callback) {
        driver.findElement(By.id('checkboxContainerCheckbox2'))
          .click()
          .then(callback, callback);
      },
      effects (expectedState) {
        expectedState.modify(this.name, (checkboxPage) => {
          checkboxPage.checkbox2.checked = true;
        });
      },
    },
    UNCHECK_CHECKBOX2: {
      preconditions () {
        return [
          [ 'isTrue', `pageState.${this.name}.checkbox2.checked` ],
        ];
      },
      perform (callback) {
        driver.findElement(By.id('checkboxContainerCheckbox2'))
          .click()
          .then(callback, callback);
      },
      effects (expectedState) {
        expectedState.modify(this.name, (checkboxPage) => {
          checkboxPage.checkbox2.checked = false;
        });
      },
    },
  };
}
```

When looking at the component its clearly evident that both the actions for checkbox1 and checkbox2 do the exact same things, just for each respective checkbox.  Even the model and elements are similar, only difference being names and selector values.  These are all signs that we can convert this into a reusable component, and cut down on development time, especially if checkboxes are used elsewhere in the system. Just like any other programming, if some logic can be abstracted out, we should do the same for our components.  Let's first create a basic checkbox component

```
type: 'Checkbox',
elements () {
  return [
    {
      name: 'checkbox'
      selector: {
        type: `getElementById`,
        value: this.options.id
      }
    }
  ];
},
model () {
  return {
    checked: 'checkbox.checked'
  };
},
actions () {
  return {
    CHECK: {
      preconditions () {
        return [
          [ 'isFalse', `pageState.${this.name}.checked` ],
        ];
      },
      perform (callback) {
        driver.findElement(By.id(this.options.id))
          .click()
          .then(callback, callback);
      },
      effects (expectedState) {
        expectedState.modify(this.name, (checkbox) => {
          checkbox.checked = true;
        });
      },
    },
    UNCHECK: {
      preconditions () {
        return [
          [ 'isTrue', `pageState.${this.name}.checked` ],
        ];
      },
      perform (callback) {
        driver.findElement(By.id(this.options.id))
          .click()
          .then(callback, callback);
      },
      effects (expectedState) {
        expectedState.modify(this.name, (checkbox) => {
          checkbox.checked = false;
        });
      },
    }
  };
}
```

Now that we have created a base `Checkbox` component, we can rework our `CheckboxPage` to call these it's checkboxes as children rather than having to model out each checkbox itself.

```
type: 'CheckboxPage',
elements () {
  return [];
},
model () {
  return {};
},
actions () {
  return {};
},
children () {
  return [
    {
      type: 'Checkbox',
      name: `${this.name}Checkbox1`,
      state: {
        checked: false
      },
      options: {
        id: 'checkboxContainerCheckbox1'
      }
    },
    {
      type: 'Checkbox',
      name: `${this.name}Checkbox2`,
      state: {
        checked: false
      },
      options: {
        id: 'checkboxContainerCheckbox2'
      }
    },
  ];
}
```

There are a lot of things going on in this example, that are explained in various parts through this documentation. We are using the `this` context for both `name` and `options`, more details which can be found in the `this` section of this documentation. We are creating the preconditions, perform, and effects following the `actions` section of this documentation. We are following naming conventions for children and components as seen in the `naming` section.  At lastly we are using `children` that will be expanded on in the following children section of this document.

The important thing to remember is, if we can abstract some part of the system, and make it easier on us to not have to write as much code, we should.

## Children

Many sites contain a hierarchical view, for example a home page could call multiple views such as the left sidebar, or the top actionbar, which in turn those views could call numerous links and buttons. Continuing with our standard of mimicking the html structure with our components as closely as possible, we want to create these sub views as children inside the component for the main view.

Example:

We have a view, `home-page.html`. We will assume that view will call 2 other views directly from the html of the home page view. It calls `actionbar.html` as well as `home-sidenav.html`.  To create our `HomePage` children section, we would want to add 2 children, one for `Actionbar` and one for `HomeSidenav`. The children section of our `HomePage` component would be as follows:

```
type: 'HomePage',
elements () { ... },
model () { ... },
actions () { ... },
children () {
  return [
    {
      type: 'Actionbar',
      name: `${this.name}Actionbar`,
      state: { ... }
    },
    {
      type: 'HomeSidenav',
      name: 'homeSidenav',
      state: { ... } 
    }
  ];
}
```

As seen above, this returns 2 children inside the `HomePage` component. This matches the home page view, and its always best practice to match html we are modeling.  This shows two different styles of naming, as stated above in the naming section. As a quick recap, assuming `ActionBar` is a reused component we name the child `${this.name}Actionbar`, this way we know it will be the home pages actionbar. However for `HomeSidenav`, it's a one time view, only `HomePage` calls `homeSidenav`, because of this we can give it a name that doesn't use `this.name`, however using `this.name` is still valid.  When creating the children, placing them in the order the html file calls them makes it easy to scan an html, along with a component and quickly identify what each child represents.

Another common use case for children is when a certain html view has common html elements such as `<button>`, `<input type="text">`, or `<a>`. To avoid having to create an element section, model section, and action section for each use in a view, we can create a reusable component that we can add as children.  A detailed example of this can be found in the `Reusable Component` section of this documentation.

## Events

As alluded to in previous action effects section, we need a way to communicate with other components.  As a rule of thumb for calling `expectedState.modify()`, we only want to modify the component we call the function in.  As a small part of the system, an individual component doesn't know which other components in the system are affected by it's actions, and it shouldn't have to know.  This is where the event emitter comes into play. When creating a component, if I know other parts of the system can be affected by any given action, I can emit out an event, broadcasting it to the rest of the components inside the expected state.  Other components can then register listener functions to these events, which can be invoked on broadcast of the event, triggering more changes to the expected state.

Let's go back to our checkbox example from actions and lets assume when checkbox1 or checkbox2 is checked, a button becomes enabled on the page that if clicked will reset the checkboxes back to unchecked state. First we need to modify our checkboxPage to have a button.

```
type: 'CheckboxPage',
elements () {
  return [
    {
      name: 'resetButton',
      selector: {
        type: 'getElementById',
        value: 'checkboxContainerResetButton'
      }
    }
  ];
},
model () {
  return {
    resetButton: {
      disabled: 'resetButton.disabled'
    }
  };
},
actions () {
  return {
    CLICK_RESET_BUTTON: {
      preconditions () {
        return [
          [ 'isFalse', `pageState.${this.name}.button.disabled` ]
        ];
      },
      perform (callback) {
        driver.findElement(By.id('checkboxContainerResetButton'))
          .click()
          .then(callback, callback);
      },
      effects () {
        //EFFECTS WILL BE ADDED LATER IN EXAMPLE
      }
    }
  };
},
children () {
  return [
    {
      type: 'Checkbox',
      name: `${this.name}Checkbox1`,
      state: {
        checked: false
      },
      options: {
        id: 'checkboxContainerCheckbox1'
      }
    },
    {
      type: 'Checkbox',
      name: `${this.name}Checkbox2`,
      state: {
        checked: false
      },
      options: {
        id: 'checkboxContainerCheckbox2'
      }
    },
  ];
}
```

We know of some setup in our `CheckboxPage` component to have an action for clicking the reset button. We purposely left the effects section blank, we will get back to that later as we describe events more.  When looking at the CLICK_RESET_BUTTON action, it has a precondition of the button has to be enabled, or more specifically disabled attribute must be false.  We know that this happens, when a checkbox is checked, which happens inside the `Checkbox` component. We need the `CheckboxPage` to know when a checkbox is checked.  We can emit an event out from the `Checkbox` component to start the process.

```
type: 'Checkbox',
elements () {
  return [
    {
      name: 'checkbox'
      selector: {
        type: `getElementById`,
        value: this.options.id
      }
    }
  ];
},
model () {
  return {
    checked: 'checkbox.checked'
  };
},
actions () {
  return {
    CHECK: {
      preconditions () {
        return [
          [ 'isFalse', `pageState.${this.name}.checked` ],
        ];
      },
      perform (callback) {
        driver.findElement(By.id(this.options.id))
          .click()
          .then(callback, callback);
      },
      effects (expectedState) {
        expectedState.modify(this.name, (checkbox) => {
          checkbox.checked = true;
        });
        expectedState.eventEmitter.emit(`${this.name}Checked`)
      },
    },
    UNCHECK: {
      preconditions () {
        return [
          [ 'isTrue', `pageState.${this.name}.checked` ],
        ];
      },
      perform (callback) {
        driver.findElement(By.id(this.options.id))
          .click()
          .then(callback, callback);
      },
      effects (expectedState) {
        expectedState.modify(this.name, (checkbox) => {
          checkbox.checked = false;
        });
        expectedState.eventEmitter.emit(`${this.name}Unchecked`)
      },
    }
  };
}
```

Looking into the action effects above we added an event to be emitted for each action, `${this.name}Checked` and `${this.name}Unhecked` for their respective actions. This will allow us to register a listener in our `CheckboxPage` component, so that component will know when a box is checked or unchecked.

```
type: 'CheckboxPage',
elements () {
  return [
    {
      name: 'resetButton',
      selector: {
        type: 'getElementById',
        value: 'checkboxContainerResetButton'
      }
    }
  ];
},
model () {
  return {
    resetButton: {
      disabled: 'resetButton.disabled'
    }
  };
},
actions () {
  return {
    CLICK_RESET_BUTTON: {
      preconditions () {
        return [
          [ 'isFalse', `pageState.${this.name}.button.disabled` ]
        ];
      },
      perform (callback) {
        driver.findElement(By.id('checkboxContainerResetButton'))
          .click()
          .then(callback, callback);
      },
      effects () {
        //EFFECTS WILL BE ADDED LATER IN EXAMPLE
      }
    }
  };
},
children () {
  return [
    {
      type: 'Checkbox',
      name: `${this.name}Checkbox1`,
      state: {
        checked: false
      },
      options: {
        id: 'checkboxContainerCheckbox1'
      }
    },
    {
      type: 'Checkbox',
      name: `${this.name}Checkbox2`,
      state: {
        checked: false
      },
      options: {
        id: 'checkboxContainerCheckbox2'
      }
    },
  ];
},
events (expectedState) {
  const myThis = this;
  return [
    {
      name: `${this.name}Checkbox1Checked`,
      listener () {
        expectedState.modify(myThis.name, (checkboxPage) => {
          checkboxPage.button.disabled = false;
        });
      }
    },
    {
      name: `${this.name}Checkbox1Unchecked`,
      listener () {
        expectedState.modify(myThis.name, (checkboxPage) => {
          checkboxPage.button.disabled = true;
        });
      }
    }
  ];
}
```

In the above events section you can see we added two event listeners, one for checkbox1 being checked, and one for it being unchecked. This allows us to follow the rule of modifying only the the component you are in where we can now call `expectedState.modify()` passing `this.name`.  Important note, because of the nature of the `this` context of javascript, the component's `this` context does not get passed into the `listener()`, as the listener is not actually called by the component, but by the eventEmitter.  Because of this, we need to create a variable inside the events function giving us access to the information we need such as name, options, dynamicarea.

Base on the logic of the page, we know that it's not just checkbox1 that will enable/disable the button but also checkbox2. Instead of having to create 2 more listeners, that perform the same logic, we can pass in arrays for the name property of each event that should trigger a particular listener.

```
events (expectedState) {
  const myThis = this;
  return [
    {
      name: [ `${this.name}Checkbox1Checked`, `${this.name}Checkbox2Checked` ]
      listener () {
        expectedState.modify(myThis.name, (checkboxPage) => {
          checkboxPage.button.disabled = false;
        });
      }
    },
    {
      name: [ `${this.name}Checkbox1Unchecked`, `${this.name}Checkbox2Unchecked` ]
      listener () {
        expectedState.modify(myThis.name, (checkboxPage) => {
          checkboxPage.button.disabled = true;
        });
      }
    }
  ];
}
```

A standard to follow when emitting events, is to always prepend the event with `this.name`. This allows the events to become unique, since our component names must be unique.  In the above example, because we are emitting unique event names we know we are specifically listening to what checkboxes are being checked. If there was a 3rd checkbox somewhere else, and it did not affect our resetButton, but our event was some generic string like 'checkboxChecked'. Our event listener would trigger, and we would incorrectly enable our button.

A second standard to follow when creating event listeners is to only listen "one level away".  In our example, the `CheckboxPage` is listening to its direct children `Checkbox`, this is listening only "one level away". Because of this we will easily know an event name when following naming conventions. Since we directly name the child, we will can use the same name from the child section to construct our event name. If we assumed that someone else called `CheckboxPage` as a child, and it actually cared about the CheckboxChecked event, we should propagate the event back up through the child hierarchy. We achieve this buy listening to a components direct child, and emitting a new event using `this.name`<Event> so we can continue to use `this.name` and the child name we know exists.

## Data Store

The data store is primarily used for persistent storage, as well as any system specific data that things not currently in the state may need later when they are added.  The data store should avoid being used for local storage inside a specific component, where `this.options` could be more easily utilized.

Example:

Lets say we have the following flow inside of a webpage.

Navigate to site -> login page -> home page -> profile page.

On the login page, I enter a username and password to get authenticated into the system, once logged in it brings me directly to the home page. At this point the only component inside our expected state is the home page.  On the home page is a link that directs me to the profile page. At this point the only component inside our expected state is the profile page. On the profile page a header exists that says 'Hello <username>', the username being filled in with what I provided in the login page.  To be able to assert that the message is displaying the correct name, I need to know the username that was entered into the login page. During the login action of a component I could store the username into the datastore for persistently storing that information. Then, once I create the login page component, I am able to retrieve that data from the datastore and expect the state to be there.

```
type: 'LoginPage`,
elements () { ... },
model () { ... },
actions () {
  return {
    LOGIN: {
      parameters: [
        {
          name: 'username',
          generator () {
            return 'myUsername'
          }
        },
        {
          name: 'password',
          generator () {
            return 'topSekritPassword'
          }
        }
      ],
      preconditions () { ... },
      perform (username, password, callback) { ... },
      effects (username, password, expectedState, dataStore) {
        expectedState.clear();
        expectedState.createAndAddComponent({
          type: 'HomePage',
          name: 'homePage',
          state: { ... }
        });
        dataStore.store('username', username);
      }
    }
  }
} 
```

As seen in the abbreviated component above, inside the effects of the LOGIN action, we are calling `dataStore.store()`, storing under the key 'username', the username value generated from our parameters section 'myUsername'.  We are now able to call `dataStore.retrieve()` at any point, inside any component where the data store is available to retrieve 'myUsername'.

Similar to other naming such as children and events, if something being stored in the data store is specific to an individual component, prepend the key name with `this.name`. This way, just like names and events, we will know exactly who that data belongs too, and we can ensure we retrieve what we expect to retrieve. 

## Dynamic Areas

## Run Time Variables
