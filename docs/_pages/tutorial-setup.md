---
permalink: /tutorial-setup/
title: "Setup"
toc: false
classes: wide
---

## Prerequisites

Simulato is built using Node.js and published as an NPM package to facilitate in UI testing of HTML based systems.  As we develop models throughout this tutorial a basic understand of JavaScript, Node.js, and HTML is assumed.  Any complex uses of JavaScript/Node.js will have a quick explanation as we dont want the language to get in the way of the modeling process.

## Dependencies Setup

In order to get Simulato up and running there are a few system dependencies we need to have installed.

* Node.js <https://nodejs.org/en/>
  * Simulato supports the latest LTS version of node
* NPM
  * Installs with Node.js
* Chrome
  * Currently chrome is the only supported driver/browser
* Chromedriver <http://chromedriver.chromium.org/>
  * Needs to correspond with the version of chrome on your system

## Project Setup

We will create a new project environment as we follow this tutorial. First lets create a new folder to store our project. Throughout this tutorial we will assume you are using a bash style terminal.

```
$ mkdir simulato-tutorial && cd simulato-tutorial
```

Once inside the project folder, we need to set up a basic Node.js environment. We will call `npm init` in the terminal, this will ask some default questions, hitting enter to use defaults is all we need to do.

```
$ npm init
```

This should create a package.json for us that looks like the following

```
{
  "name": "simulato-tutorial",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}
```
Now that we have our package.json we can install Simulato using NPM.

```
$ npm install simulato --save
```

This tutorial will base all examples off the test site created used to run acceptance tests for Simulato.  This is available as an NPM package that we can install and run locally to have an environment to test, so lets install that too.

```
$ npm install simulato-test-site --save
```

Let's now add a script into our package.json that will allow us to easily spin up the test site so we can access it and run our tests against it.  Inside the package.json file add `"start-test-site": "npm explore simulato-test-site -- npm start"` to the "scripts" section.  More about NPM scripts can be found [here](https://docs.npmjs.com/misc/scripts). This script simply spins up our test site by calling the test site's `start` script.

Our package.json should now contain our two dependencies as well as our custom script.

```
{
  "name": "simulato-tutorial",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start-test-site": "npm explore simulato-test-site -- npm start"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "simulato": "^0.6.1",
    "simulato-test-site": "^1.0.2"
  }
}
```

Your individual version numbers for the test site and Simulato may vary depending on the latest released version.

To make sure our site is all set up and ready to go lets simply call the script, and make sure the site spins up.  Note that this process takes over our terminal while the server is running, feel free to run the site in the background or a secondary terminal window.

```
$ npm run start-test-site
```

The last part of our setup is to create a folder where we can add our components as we create them throughout this tutorial. We will simply create an empty folder in our project called `components`. This should leave us with the final project file structure shown below, with folders indicated with '-':

```
- components
- node_modules 
package-lock.json 
package.json
```

Both package-lock.json and node_modules were created for us when we installed our packages.

Now that everything is up and ready to go we can start creating components! Let's start by creating our [first component](/tutorial-first-component).