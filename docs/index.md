# iot-dashboard Documentation

**This Page:**

* [Hosting the iot-dashboard](#hosting-the-iot-dashboard)
* [Contributing](#Contributing) to the dashboard core codebase (this git repo)
* [Basic Concepts](#basic-concepts)
* [Coding Guidelines](#coding-guidelines)

**Lean more:**

* [Getting Started: Write your own plugins](https://gitlab.com/lobaro/iot-dashboard/blob/master/docs/pluginDevGettingStarted.md)
* [Architecture Overview](architecture.md)
* [Plugin Development](pluginDevelopment.md)
* [Security](security.md) related topics

# Hosting the iot-Dashboard
If you plan to host an own instance of the iot-dashboard please have a look into our [Security](Security) page. A documentation on how to setup your own instance on a server might follow in future and will require some additional work on the Dashboard before.

# Contributing
All contributions to the core and plugins are very welcome.

To get started with writing code for the Dashboard core you need a good understanding of the Basic Concepts (see below) and follow the Coding Guidelines (see blow).
If you want to provide another datasource or visualization in form of a new widget checkout the [Plugin Development](pluginDevelopment.md) page.

# Basic Concepts
A basic overview of the concepts and ideas behind the Dashboard.

* **Dashboard:** A `Dashboard` defines `Datasources` and `Widgets` based on `Plugins` that can be arranged in different `Layouts`. It can be imported and exported manually or from a server.
* **Layout:** A `Layout` belongs to one `Dashboard` and defines how `Widgets` are arranged.
* **Widget:** A `Widget` can be arranged inside the `Layout` and renders content based on the `WidgetType`, `WidgetProps` and `Datasources`.
* **Datasource:** A `Datasource` provides data for `Widgets` based on the `DatasourceType` and `DatasourceProps`
* **Plugins:** Plugins provide the implementations for `Datasources` and `Widgets`.

# Coding Guidelines

Eslint and tslint is in place and must be followed to get successful CI builds.

JavaScript should be converted to TypeScript when touched.

New code must be tested, unittests can be provided next to the code as `<filename>.test.ts`, they will be executed automatically during build.
Read the redux guide about [writing tests](http://redux.js.org/docs/recipes/WritingTests.html).

## Folder Structure

* Folders should reflect the business domain not Framework structures
* `root` - Globally used stuff & new stuff that can not be sorted in yet
* `ui` - generic, reusable UI components
* `util` - generic, reusable functions that helps in certain situations
* `typings` - contains custom typings in case the ones managed by the `typings.json` are not sufficient
* *Everything else* - should match to the Basic Concepts (see ab ove)

## File Naming

* `.js` / `.ts` - Business Logic: Actions & Reducers
* `.ui.js` / `.tsx` - React components
* `.test.js` / `.test.ts` - Tests, automatically loaded by gulp inject

# Webpack Analysis

Useful to check problems in the Webpack build.

- Execute: `npm run webpack-profile`
- Goto: [https://webpack.github.io/analyse/](https://webpack.github.io/analyse/)
- Load the generated stats.json
