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

Component type values should reflect directly back to the html they are modeling.  This helps keep them clear and simple as to what type of component they are.  As a standard, type should be in Pascal case, similar to how you would name a class or constructor in an object oriented language.

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

Similar to the component type, the name should be 

### Children Names

## Elements

## Model

## Actions

## Events

## Reusable Components

## Dynamic Areas

## Run Time Variables
