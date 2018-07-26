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
      name: `firstNameTextInput`,
      state: { ... },
      options: {
        id: '<some id value here>'
      }
    },
    {
      type: 'TextInput',
      name: `lastNameTextInput`,
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
      name: `firstNameTextInput`,
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
      name: `lastNameTextInput`,
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
      name: `firstNameTextInput`,
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
      name: `lastNameTextInput`,
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

## Model

## Children

With the growing popularity of reusable components, many sites are set up with a hierarchical view tree. A home page could call multiple views such as the left sidebar, or the top actionbar, which in turn those views could call numerous links and buttons. To continue without standard of mimicking the html structure with our components as closely as possible, children can be added into a component. 

## Actions

## Events

## Expected State

## Data Store

## Reusable Components

## Dynamic Areas

## Run Time Variables
