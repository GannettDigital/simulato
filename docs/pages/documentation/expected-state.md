---
permalink: /documentation/expected-state/
title: 'Expected State'
toc: false
classes: wide
sidebar: docs_sidebar
---

This section documents functions for the expected state used throughout the tool

## Methods

### createAndAddComponent(componentConfig)
  * Creates a component and adds it to the expected state
  * Parameters
    * `componentConfig` **required**
      * An object with the following fields
        * `type` **required**
          * A string corresponding to one of the components' `type` property
        * `name` **required**
          * A string that denotes the unique name of component when created
        * `state` **required**
          * An object representing the state of the component
        * `options`
          * An object used for any data the user wants the component to have
        * `dyanamicArea`  
          * A string that denotes the dynamicArea this component should be a part of

### createComponent(componentConfig)
  * Creates a component
  * Parameters
    * `componentConfig` **required**
      * An object with the following fields
        * `type` **required**
          * A string corresponding to one of the components' `type` property
        * `name` **required**
          * A string that denotes the unique name of component when created
        * `options`
          * An object used for any data the user wants the component to have
        * `dyanamicArea`
          * A string that denotes the dynamicArea this component should be a part of

### addComponent(component, state)
  * Adds a created component with the given state
  * Parameters
    * `component` **required**
      * The created componend to be added to the state
    * `state` **required**
      * An object representing the state of the component to be added

### delete(name)
  * Deletes a single component from the expected state
    * Parameters
      * `name` **required**
        * A string denoting name of the component to delete

### clear()
  * Clears the expected state (does not save anything)

### clearDynamicArea(dynamicArea)
  * Deletes all components for a given dynamic area
  * Parameters
    * `dynamicArea` **required**
      * A string denoting the dynamic area to clear

### getState()
  * Gets a JavaScript object representing the current state 

### modify(name, callback)
  * Modifies a component
    * Parameters
      * `name` **required**
        * A string denoting the component to modify
      * `callback` **required**
        * The function that is called with the component as the first parameter

### stash()
  * Stash the current state (can be popped later)

### pop()
  * Pops the most recent stashed state

### stashDynamicArea(dynamicArea)
  * Stashes the components and states of the passed dynamic area
    * Parameters
      * `dynamicArea` **required**
        * A string denoting the dynamic area you wish to stash

### isDynamicAreaStashed(dynamicArea)
  * Checks if the passed dynamic area is stashed
    * Parameters
      * `dynamicArea` **required**
        * A string denoting the dynamic area you wish to check

### retrieveDynamicArea(dynamicArea)
  * Retrieves the components and states from a stashed dynamic area
  * Adds the retrieved components back to the dynamic area
    * Parameters
      * `dynamicArea` **required**
        * A String denoting the dynamic area you wish to retrieve

## event emitter
  * An event emitter instance wherein the events returned from the `events` function are registered
  * Use this emitter to emit events to other components
