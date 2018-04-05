# ![TOAST UI Grid](http://uicdn.toast.com/toastui/img/tui-grid-bi.png)

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
    * [Via Package Manager](#via-package-manager)
    * [Via Contents Delivery Network (CDN)](#via-contents-delivery-network-cdn)
    * [Download Source Files](#download-source-files)
* [Usage](#-usage)
    * [HTML](#html)
    * [JavaScript](#javascript)
* [Pull Request Steps](#-pull-request-steps)
    * [Setup](#setup)
    * [Develop](#develop)
    * [Pull Request Steps](#pull-request)
* [Dependency](#-dependency)
* [Documents](#-documents)
* [Contributing](#-contributing)
* [TOAST UI Family](#-toast-ui-family)
* [License](#-license)


## 🌏 Browser Support
| <img src="https://user-images.githubusercontent.com/1215767/34348387-a2e64588-ea4d-11e7-8267-a43365103afe.png" alt="Chrome" width="16px" height="16px" /> Chrome | <img src="https://user-images.githubusercontent.com/1215767/34348590-250b3ca2-ea4f-11e7-9efb-da953359321f.png" alt="IE" width="16px" height="16px" /> Internet Explorer | <img src="https://user-images.githubusercontent.com/1215767/34348380-93e77ae8-ea4d-11e7-8696-9a989ddbbbf5.png" alt="Edge" width="16px" height="16px" /> Edge | <img src="https://user-images.githubusercontent.com/1215767/34348394-a981f892-ea4d-11e7-9156-d128d58386b9.png" alt="Safari" width="16px" height="16px" /> Safari | <img src="https://user-images.githubusercontent.com/1215767/34348383-9e7ed492-ea4d-11e7-910c-03b39d52f496.png" alt="Firefox" width="16px" height="16px" /> Firefox |
| :---------: | :---------: | :---------: | :---------: | :---------: |
| Yes | 8+ | Yes | Yes | Yes |


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

* [Basic](https://nhnent.github.io/tui.grid/latest/tutorial-example01-basic.html)
* [Complex columns](https://nhnent.github.io/tui.grid/latest/tutorial-example03-complex-columns.html)
* [Input types](https://nhnent.github.io/tui.grid/latest/tutorial-example04-input-types.html)
* [Relation between columns](https://nhnent.github.io/tui.grid/latest/tutorial-example05-relation-columns.html)
* [Applying Themes](https://nhnent.github.io/tui.grid/latest/tutorial-example07-applying-themes.html)
* [Using DatePicker component](https://nhnent.github.io/tui.grid/latest/tutorial-example08-using-datepicker.html)
* [Using Summary](https://nhnent.github.io/tui.grid/latest/tutorial-example09-using-summary.html)
* [Binding to remote data](https://nhnent.github.io/tui.grid/latest/tutorial-example10-using-net.html)

Here are more [examples](https://nhnent.github.io/tui.grid/latest/tutorial-example01-basic.html) and play with TOAST UI Grid!


## 💾 Install

TOAST UI products can be used by using the package manager or downloading the source directly.
However, we highly recommend using the package manager.

### Via Package Manager

TOAST UI products are registered in two package managers, [npm](https://www.npmjs.com/) and [bower](https://bower.io/).
You can conveniently install it using the commands provided by each package manager.
When using npm, be sure to use it in the environment [Node.js](https://nodejs.org/ko/) is installed.

#### npm

``` sh
$ npm install --save tui-grid # Latest version
$ npm install --save tui-grid@<version> # Specific version
```

#### bower

``` sh
$ bower install tui-grid # Latest version
$ bower install tui-grid#<tag> # Specific version
```

### Via Contents Delivery Network (CDN)
TOAST UI products are available over the CDN powered by [TOAST Cloud](https://www.toast.com).

You can use the CDN as below.

```html
<link rel="stylesheet" href="https://uicdn.toast.com/tui.grid/latest/tui-grid.css" />
...
<script src="https://uicdn.toast.com/tui.grid/latest/tui-grid.js"></script>
```

If you want to use a specific version, use the tag name instead of `latest` in the url's path.

The CDN directory has the following structure.

```
tui.grid/
├─ latest/
│  ├─ tui-grid.comb.js // This file includes the backbone and underscore.
│  ├─ tui-grid.comb.min.js
│  ├─ tui-grid.css
│  ├─ tui-grid.min.css
│  ├─ tui-grid.js
│  └─ tui-grid.min.js
├─ v2.10.0/
│  ├─ ...
```

### Download Source Files
* [Download bundle files](https://github.com/nhnent/tui.grid/tree/production/dist)
* [Download all sources for each version](https://github.com/nhnent/tui.grid/releases)


## 🔩 Dependency
* [jquery](https://jquery.com/) >=1.11.0
* [underscore](http://underscorejs.org/) >=1.8.3
* [backbone](http://backbonejs.org/) >=1.3.3
* [tui-code-snippet](https://github.com/nhnent/tui.code-snippett) >=1.3.0
* component (optional)
  * [tui-pagination](https://github.com/nhnent/tui.pagination) >=3.2.0
  * [tui-date-picker](https://github.com/nhnent/tui.date-picker) >=3.1.0

You can also use **lodash** instead of underscore and use **higher version of jquery** (like v2.x.x) depending on your project.


## 🔨 Usage

### HTML

Add the container element where TOAST UI Grid will be created.

``` html
<div id="grid"></div>
```

### JavaScript

TOAST UI Grid can be used by creating an instance with the constructor function.
To get the constructor function, you should import the module using one of the following ways depending on your environment.

#### Using namespace in browser environment
``` javascript
var Grid = tui.Grid;
```

#### Using module format in node environment
``` javascript
var Grid = require('tui-grid'); /* CommonJS */
```

``` javascript
import {Grid} from 'tui-grid'; /* ES6 */
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

## 🔧 Pull Request Steps

TOAST UI products are open source, so you can create a pull request(PR) after you fix issues.
Run npm scripts and develop yourself with the following process.

### Setup

Fork `master` branch into your personal repository.
Clone it to local computer. Install node modules.
Before starting development, you should check to haveany errors.

``` sh
$ git clone https://github.com/{your-personal-repo}/tui.grid.git
$ cd tui.grid
$ npm install
$ npm run test
```

### Develop

Let's start development!
You can see your code is reflected as soon as you saving the codes by running a server.
Don't miss adding test cases and then make green rights.

#### Run webpack-dev-server

``` sh
$ npm run dev
$ npm run dev:ie8 # Run on Internet Explorer 8
```

#### Run karma test

``` sh
$ npm run test
```

### Pull Request

Before PR, check to test lastly and then check any errors.
If it has no error, commit and then push it!

For more information on PR's step, please see links of Contributing section.


## 📙 Documents
* [Getting Started](https://github.com/nhnent/tui.grid/blob/production/docs/getting-started.md)
* [Tutorials](https://github.com/nhnent/tui.grid/tree/production/docs)
* [APIs](https://nhnent.github.io/tui.grid/latest)

You can also see the older versions of API page on the [releases page](https://github.com/nhnent/tui.grid/releases).


## 💬 Contributing
* [Code of Conduct](https://github.com/nhnent/tui.grid/blob/production/CODE_OF_CONDUCT.md)
* [Contributing guideline](https://github.com/nhnent/tui.grid/blob/production/CONTRIBUTING.md)
* [Issue guideline](https://github.com/nhnent/tui.grid/blob/production/docs/ISSUE_TEMPLATE.md)
* [Commit convention](https://github.com/nhnent/tui.grid/blob/production/docs/COMMIT_MESSAGE_CONVENTION.md)


## 🍞 TOAST UI Family
* [TOAST UI Chart](https://github.com/nhnent/tui.chart)
* [TOAST UI Editor](https://github.com/nhnent/tui.editor)
* [TOAST UI Components](https://github.com/nhnent)


## 📜 License
This software is licensed under the [MIT](https://github.com/nhnent/tui.grid/blob/production/LICENSE) © [NHN Entertainment](https://github.com/nhnent).
