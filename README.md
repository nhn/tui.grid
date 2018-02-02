# ![toast ui grid](https://cloud.githubusercontent.com/assets/12269489/13489851/a5ca2490-e16c-11e5-8d80-3bf6fe3b940d.png)

> The powerful widget to show and edit data. It's free!

[![GitHub release](https://img.shields.io/github/release/nhnent/tui.grid.svg)](https://github.com/nhnent/tui.grid/releases/latest)
[![npm](https://img.shields.io/npm/v/tui-grid.svg)](https://www.npmjs.com/package/tui-grid)
[![bower](https://img.shields.io/bower/v/tui-grid.svg)](https://github.com/nhnent/tui.grid/releases/latest)
[![GitHub license](https://img.shields.io/github/license/nhnent/tui.grid.svg)](https://github.com/nhnent/tui.grid/blob/production/LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/nhnent/tui.grid/pulls)
[![code with hearth by NHN Entertainment](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-NHN%20Entertainment-ff1414.svg)](https://github.com/nhnent)

[![tui-grid-screenshot](https://user-images.githubusercontent.com/18183560/35043725-fde63120-fbd0-11e7-8952-66eb7750a8b5.png)](https://www.youtube.com/watch?v=pyPlOFhexQk)

☝️ 👀 ☝️ _Click the image above to play the video below shows the major features of TOAST UI Grid briefly!_

## 🚩 Table of Contents
* [Browser Support](#-browser-support)
* [Features](#-features)
* [Examples](#-examples)
* [Install](#-install)
  * [Using npm](#using-npm)
  * [Using bower](#using-bower)
  * [Download](#download)
* [Usage](#-usage)
  * [HTML](#html)
  * [JavaScript](#javascript)
* [Development](#-development)
  * [Setup](#setup)
  * [Local Test](#local-test)
  * [Run Server](#run-server)
  * [Bundle](#bundle)
* [Documents](#-documents)
* [Contributing](#-contributing)
* [TOAST UI Family](#-toast-ui-family)
* [License](#-license)

## 🌏 Browser Support
|<img src="https://user-images.githubusercontent.com/1215767/34348590-250b3ca2-ea4f-11e7-9efb-da953359321f.png" alt="IE / Edge" width="16px" height="16px" /> Internet Explorer | <img src="https://user-images.githubusercontent.com/1215767/34348380-93e77ae8-ea4d-11e7-8696-9a989ddbbbf5.png" alt="IE / Edge" width="16px" height="16px" /> Edge | <img src="https://user-images.githubusercontent.com/1215767/34348383-9e7ed492-ea4d-11e7-910c-03b39d52f496.png" alt="Firefox" width="16px" height="16px" /> Firefox | <img src="https://user-images.githubusercontent.com/1215767/34348387-a2e64588-ea4d-11e7-8267-a43365103afe.png" alt="Chrome" width="16px" height="16px" /> Chrome | <img src="https://user-images.githubusercontent.com/1215767/34348394-a981f892-ea4d-11e7-9156-d128d58386b9.png" alt="Safari" width="16px" height="16px" /> Safari |
| :---------: | :---------: | :---------: | :---------: | :---------: |
| 8+ | Yes | Yes | Yes | Yes |


## 🎨 Features
* Various input types *(checkbox, radio, select, password, etc)*
* Full keyboard navigation *(move, select, copy, paste, delete, etc)*
* Virtual scrolling *(Handling large dataset without performance loses)*
* Copy & Paste using clipboard with 3rd party application *(Like MS-Excel or Google-spreadsheet)*
* Column resize & reorder & show & hide
* Multi column headers
* Custom cell formatter & converter
* Inline Editing
* Validation
* Selection
* Pagination
* Picking date
* Sorting
* Merging cell
* Frozen(Pinned) columns
* Relation between each columns
* Binding to remote data
* Summarize all values of each column
* Customizing styles *(Three basic themes)*

In addition, you can implement desired functions using various options and APIs.

## 🐾 Examples

* [Basic](https://nhnent.github.io/tui.grid/api/tutorial-example01-basic.html)
* [Complex columns](https://nhnent.github.io/tui.grid/api/tutorial-example03-complex-columns.html)
* [Input types](https://nhnent.github.io/tui.grid/api/tutorial-example04-input-types.html)
* [Relation between columns](https://nhnent.github.io/tui.grid/api/tutorial-example05-relation-columns.html)
* [Applying Themes](https://nhnent.github.io/tui.grid/api/tutorial-example07-applying-themes.html)
* [Using DatePicker component](https://nhnent.github.io/tui.grid/api/tutorial-example08-using-datepicker.html)
* [Using Summary](https://nhnent.github.io/tui.grid/api/tutorial-example09-using-summary.html)
* [Binding to remote data](https://nhnent.github.io/tui.grid/api/tutorial-example10-using-net.html)

Here are more [examples](https://nhnent.github.io/tui.grid/api/tutorial-example01-basic.html) and play with TOAST UI Grid!

## 💾 Install

Install the module to use. TOAST UI products are registered in two package managers, [npm](https://www.npmjs.com/) and [bower](https://bower.io/). You can download it directly from the github repository, but we highly recommend to install using the npm package manager.

### Using npm

``` sh
$ npm install --save tui-grid # latest version
$ npm install --save tui-grid@<version> # specific version
```

### Using bower

``` sh
$ bower install tui-grid # latest version
$ bower install tui-grid#<tag> # specific version
```

### Download

* [Download bundle files](https://github.com/nhnent/tui.grid/tree/production/dist)
* [Download all sources for each version](https://github.com/nhnent/tui.grid/releases)

## 🔨 Usage

### HTML

Add the container element where TOAST UI Grid will be created.

``` html
<div id="grid"></div>
```

### JavaScript

TOAST UI Grid can be used by creating an instance with the constructor function.
To get the constructor function, you should import the module using one of the following three ways depending on your environment.

``` javascript
var Grid = tui.Grid; /* namespace */
```
``` javascript
var Grid = require('tui-grid'); /* CommonJS in Node.js */
```
``` javascript
import {Grid} from 'tui-grid'; /* ES6 in Node.js */
```

You can create an instance with options and call various APIs after creating an instance.

``` javascript
var instance = new Grid({
    el: $('#grid'), // Container element
    columns: [
        {
            title: 'Name',
            name: 'name'
        },
        {
            title: 'Artist',
            name: 'artist'
        },
        {
            title: 'Release',
            name: 'release'
        },
        {
            title: 'Genre',
            name: 'genre'
        }
    ],
    data: [
      {
        name: 'Beautiful Lies',
        artist: 'Birdy',
        release: '2016.03.26',
        genre: 'Pop'
      }
    ]
});

instance.setData(newData); // Call API of instance's public method

Grid.applyTheme('striped'); // Call API of static method
```

## 🔧 Development

TOAST UI products are open source, so you can create a pull request after you fix [issues](https://github.com/nhnent/tui.grid/issues). Run npm scripts and develop yourself with the following process.

### Setup

``` sh
$ git clone https://github.com/nhnent/tui.grid.git
$ cd tui.grid
$ npm install
```

### Local Test

``` sh
$ npm run test
```

### Run Server

``` sh
$ npm run serve
$ npm run serve:ie8 # Run on Internet Explorer 8
```

### Bundle

``` sh
$ npm run bundle
```


## 📙 Documents
* [Getting Started](https://github.com/nhnent/tui.grid/wiki/Getting-Started)
* [Tutorials](https://github.com/nhnent/tui.grid/wiki)
* [APIs](https://nhnent.github.io/tui.grid/api)

You can also see the older versions of API page on the [releases page](https://github.com/nhnent/tui.grid/releases).

## 💬 Contributing
* [Code of Conduct](CODE_OF_CONDUCT.md)
* [Contributing guideline](CONTRIBUTING.md)
* [Commit convention](https://github.com/nhnent/tui.editor/blob/production/docs/COMMIT_MESSAGE_CONVENTION.md)

## 🍞 TOAST UI Family
* [TOAST UI Chart](https://github.com/nhnent/tui.chart)
* [TOAST UI Editor](https://github.com/nhnent/tui.editor)
* [TOAST UI Components](https://github.com/nhnent)

## 📜 License
This software is licensed under the [MIT](https://github.com/nhnent/tui.grid/blob/production/LICENSE) © [NHN Entertainment](https://github.com/nhnent).
