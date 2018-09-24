---
permalink: /documentation/data-store/
title: 'Data Store'
toc: false
classes: wide
sidebar: docs_sidebar
---

This section documents functions for the data store used throughout the tool

## Methods

### store(key, value)
  * Stores data
  * Parameters
    * `key` **required**
      * Any value valid as a key in a JS object that is used to identify the value
    * `value` **required**
      * The data to store. This value is deep cloned

### retrieve(key)
  * Returns data from the data store
  * Parameters
    * `key` **required**
      * The key associated with value to be returned from the data store

### delete(key)
  * Deletes data from the data store
  * Parameters
    * `key` **required**
      * The key of the value to delete from the data store

### retrieveAndDelete(key)
  * Deletes and then returns the data from the data store
  * Parameters
    * `key` **required**
      * The key to be retrieved and deleted from the data store

### retrieveAll()
  * Returns the entire data store object

### has(key)
  * Returns true if the key is in the data store. Otherwise returns false
  * Parameters
    * `key` **required**
      * The key for which to check the existence of
