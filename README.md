[![npm version](https://badge.fury.io/js/iot-dashboard.svg)](https://badge.fury.io/js/iot-dashboard) [![build status](https://gitlab.com/lobaro/iot-dashboard/badges/master/build.svg)](https://gitlab.com/lobaro/iot-dashboard/commits/master) [![Dependencies](https://david-dm.org/niondir/iot-dashboard.svg)](https://david-dm.org/niondir/iot-dashboard) [![Dev-Dependencies](https://david-dm.org/niondir/iot-dashboard/dev-status.svg)](https://david-dm.org/niondir/iot-dashboard#info=devDependencies)


**Help, Questions, Feedback:**  [![Gitter](https://badges.gitter.im/iot-dashboard/Lobby.svg)](https://gitter.im/iot-dashboard/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge)

# IoT-Dashboard
Free open-source website to display & control (IoT) data - everything is a thing. 

A generic dashboard application based on JavaScript, HTML and CSS that runs in modern browsers without any server in the background. 
Allows to arrange and configure widgets to display data from any datasource - not limited to Internet of Things.

A plugin API that allows easy widget and datasource development to keep the dashboard as extensible as possible.

Can be used as free alternative to [geckoboard](https://www.geckoboard.com), [kibana](https://www.elastic.co/products/kibana), [grafana](http://grafana.org/) or [freeboard](https://freeboard.io/).
And of course for all other IoT, M2M, Industry 4.0, BigData, whatever dashboards you have to pay for out there.

This project is backed by [Lobaro.com](http://www.lobaro.com) - We offer full-stack IoT services including customized hardware, backend-integration and visualizations.

---
## Documentation ##
* [IoT-Dashboard Documentation](https://gitlab.com/lobaro/iot-dashboard/wikis/home)
* [Plugin Development: Getting Started](https://gitlab.com/lobaro/iot-dashboard/wikis/pluginDevGettingStarted.md)
* [Plugin API](https://gitlab.com/lobaro/iot-dashboard/wikis/pluginDevelopment.md)

## Live Demo ##

Standalone:

* [Live Demo Stable](http://demo.iot-dashboard.org/) of the `master` branch.
* [Live Demo Dev](http://demo.iot-dashboard.org/branch/dev/) of the `dev` branch.

Online service:

The iot-dashboard code does not include any server-side backend logic for account mangement, plugin registry and state persistence. If you need these features,
e.g. if you want to share your dashboard easily with others over the web, you can use the hosted version of the dashboard (currently in beta):

* [Lobaro Dashboard Hosting](https://dashboard.lobaro.com/)

## Motivation ##
Why just another Dashboard?

I was looking for a Dashboard with the following properties:

- OpenSource, royalty free, with code that I can understand and extend for full customization
- Easy to setup, maintain and extend - even for unusual datasources and widgets
- A Reasonable set of default widgets, to be used out of the box
- Simple API and development setup to write custom widgets and datasources, as a solid base for community driven development and extensions
- Running locally/offline without the need of any server, keeping the server optional until I really need one
- Having a community that extends the Dashboard for their own needs

If you find something that comes close to the above requirements, please let me know!

## Setup / Install ##

Prerequisite: Download & install [NodeJs](https://nodejs.org)

### Setup Plugin Development Toolchain ###

To keep everything simple all important tasks are based on scripts in package.json. Use `npm run <script-name>` to run any of them.

1) Clone this reposity 

    git clone https://gitlab.com/lobaro/iot-dashboard.git
    cd iot-dashboard

2) Install all dependencies for building, testing and development - can take some time

    npm install

3) Run the Webpack Dev Server with live-reload and hot module replacement

    npm run dev

 [Webpack](https://webpack.github.io/) is the used build tool to transpile and bundle all sources. The development WebServer is part of Webpack and allows to run the application with live-reload locally.

4) Open your browser at: 

* Dashboard: [http://localhost:8080](http://localhost:8080) 
* Tests: [http://localhost:8080/webpack-dev-server/tests.html](http://localhost:8080/webpack-dev-server/tests.html)

5) Run a second task in another terminal to compile i.a. plugins automatically on file-change

    npm run watch

The watch task compiles the Plugin sources and keeps test files up to date. 

Particular it monitors & transpiles the plugins in `/plugins/**/*.js` (source dev folder) to `/dist/plugins/**/*.js` (plugin load folder) when the sourcefile changes.

See `gulpfile.js` -> `watch` task for more details.

6) **Done!**

You have succesfully installed the dashboard development toolchain. 

To get started with plugin developement follow the [Plugin Developmenet: Getting Started](https://gitlab.com/lobaro/iot-dashboard/wikis/pluginDevGettingStarted.md) guide 
starting with step two.

To continue with plugin development later only the above steps 3 to 6 have to be performed again.


### OR Install and run the Dashboard locally  ###

The fastest way to get the dashboard running on your machine (**without development tools!**).

1) Install the Dashboard starter server

    npm install -g iot-dashboard-starter

2) Start the dashboard with

    iot-dashboard

Open your browser at [http://localhost:8081](http://localhost:8081)

---

To include the dashboard in your own project install it as dependency with

    npm install --save-dev iot-dashboard

#### Useful Tasks

To make sure all you changes will survive the CI build

    npm run build

To just run the tests (not enough to survive the CI build!)

    npm test

Find the coverage report in `dist/coverage` or while the server is running at [http://localhost:8080/coverage/](http://localhost:8080/coverage/)

## Copyright & License ##
Copyright © 2016 Lobaro (http://www.lobaro.com)

The code is available under [Mozilla Public License 2.0](https://www.mozilla.org/en-US/MPL/) (MPL 2.0)
For more information you might want to read the [FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/).

Contributors have to add a [License Header](https://www.mozilla.org/en-US/MPL/headers/) to new sourcecode files.

This means you can use and modify the code for private propose (personal or inside your organisation)
Outside of your Organisation you must make modified MPLed code available to your users and comply with all other requirements of the MPL 2.0.

If you need some of the code available under another license, do not hesitate to [contact](http://www.lobaro.com/contact/) Lobaro.
