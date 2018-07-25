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

For example:

If the component is modeling a file `home-page.html`
The type for that component should be `type: 'HomePage'`.

In the case where multiple components comprise the same view, types should follow the naming you used for the files, following the standards in the `File Structure` section of this document.

For example: 

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

For example:

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

### Component Name

As a standard, names should be written in camelCase, to distinguish them from type. Similar to the component type being related to the HTML file, a given component's name should be related to that component's type. 

When a component, and therefore a view, is only used once for the system the name can simply be the component's type, but in camelCase.

For example:

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

For Example:

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

Naming the components this way will allow the user to quickly identify during test generation and execution which actionbar state/actions we are currently caring about.  This naming style matches very closely with the children naming conventions that we will talk about next.

### Children Names

## Elements

## Model

## Actions

## Events

## Expected State

## Reusable Components

## Dynamic Areas

## Run Time Variables
