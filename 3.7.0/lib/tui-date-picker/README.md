# TOAST UI Component : Date Picker
> Component that selects specific date.

[![GitHub release](https://img.shields.io/github/release/nhnent/tui.date-picker.svg)](https://github.com/nhnent/tui.date-picker/releases/latest)
[![npm](https://img.shields.io/npm/v/tui-date-picker.svg)](https://www.npmjs.com/package/tui-date-picker)
[![GitHub license](https://img.shields.io/github/license/nhnent/tui.date-picker.svg)](https://github.com/nhnent/tui.date-picker/blob/production/LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/nhnent/tui.project-name/labels/help%20wanted)
[![code with hearth by NHN Entertainment](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-NHN%20Entertainment-ff1414.svg)](https://github.com/nhnent)


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
* [Documents](#-documents)
* [Contributing](#-contributing)
* [Dependency](#-dependency)
* [License](#-license)


## 🌏 Browser Support
| <img src="https://user-images.githubusercontent.com/1215767/34348387-a2e64588-ea4d-11e7-8267-a43365103afe.png" alt="Chrome" width="16px" height="16px" /> Chrome | <img src="https://user-images.githubusercontent.com/1215767/34348590-250b3ca2-ea4f-11e7-9efb-da953359321f.png" alt="IE" width="16px" height="16px" /> Internet Explorer | <img src="https://user-images.githubusercontent.com/1215767/34348380-93e77ae8-ea4d-11e7-8696-9a989ddbbbf5.png" alt="Edge" width="16px" height="16px" /> Edge | <img src="https://user-images.githubusercontent.com/1215767/34348394-a981f892-ea4d-11e7-9156-d128d58386b9.png" alt="Safari" width="16px" height="16px" /> Safari | <img src="https://user-images.githubusercontent.com/1215767/34348383-9e7ed492-ea4d-11e7-910c-03b39d52f496.png" alt="Firefox" width="16px" height="16px" /> Firefox |
| :---------: | :---------: | :---------: | :---------: | :---------: |
| Yes | 8+ | Yes | Yes | Yes |


## 🎨 Features
* Selects specific year, month, date, and time.
* Creates the calendar that only show date-layer using `createCalendar` API.
* Creates the range picker that selects a date period using `createRangePicker` API.
* Supports internationalization(i18n).
* Supports custom events.
* Provides the file of default css style.


## 🐾 Examples
* [Basic](https://nhnent.github.io/tui.date-picker/latest/tutorial-example01-basic) : Example of using default options.
* [Having Timepicker](https://nhnent.github.io/tui.date-picker/latest/tutorial-example04-having-timepicker) :  Example of using a time picker to select a time.
* [Calendar](https://nhnent.github.io/tui.date-picker/latest/tutorial-example07-calendar) : Examples of creating and using calendars.
* [RangePicker](https://nhnent.github.io/tui.date-picker/latest/tutorial-example08-daterangepicker) : Example of creating and using a range picker.

More examples can be found on the left sidebar of each example page, and have fun with it.


## 💾 Install

TOAST UI products can be used by using the package manager or downloading the source directly.
However, we highly recommend using the package manager.

### Via Package Manager

TOAST UI products are registered in two package managers, [npm](https://www.npmjs.com/) and [bower](https://bower.io/).
You can conveniently install it using the commands provided by each package manager.
When using npm, be sure to use it in the environment [Node.js](https://nodejs.org/ko/) is installed.

#### npm

``` sh
$ npm install --save tui-date-picker # Latest version
$ npm install --save tui-date-picker@<version> # Specific version
```

#### bower

``` sh
$ bower install tui-date-picker # Latest version
$ bower install tui-date-picker#<tag> # Specific version
```

### Via Contents Delivery Network (CDN)

TOAST UI products are available over a CDN powered by [TOAST Cloud](https://www.toast.com).

You can use CDN as below.

```html
<link rel="stylesheet" href="https://uicdn.toast.com/tui.date-picker/latest/tui-date-picker.css">
<script src="https://uicdn.toast.com/tui.date-picker/latest/tui-date-picker.js"></script>
```

If you want to use a specific version, use the tag name instead of `latest` in the url's path.

The CDN directory has the following structure.

```
tui.date-picker/
├─ latest
│  ├─ tui-date-picker.css
│  ├─ tui-date-picker.js
│  ├─ tui-date-picker.min.js
├─ v3.0.0/
│  ├─ ...
```

### Download Source Files
* [Download bundle files](https://github.com/nhnent/tui.date-picker/tree/production/dist)
* [Download all sources for each version](https://github.com/nhnent/tui.date-picker/releases)




## 🔨 Usage

### HTML

You need to add two elements.
One is the container element to display a date picker, and the other is a target element in which a date picker is attached.
Also add some elements for applying the css style.

``` html
<div class="tui-datepicker-input tui-datetime-input tui-has-focus">
    <input type="text" id="tui-date-picker-target" aria-label="Date-Time">
    <span class="tui-ico-date"></span>
</div>
<div id="tui-date-picker-container" style="margin-top: -1px;"></div>
```

### JavaScript

This can be used by creating an instance with the constructor function.
To get the constructor function, you should import the module using one of the following ways depending on your environment.

#### Using namespace in browser environment
``` javascript
var DatePicker = tui.DatePicker;
```

#### Using module format in node environment
``` javascript
var DatePicker = require('tui-date-picker'); /* CommonJS */
```

``` javascript
import DatePicker from 'tui-date-picker'; /* ES6 */
```

You can create an instance with [options](http://nhnent.github.io/tui.date-picker/latest/DatePicker) and call various APIs after creating an instance.

``` javascript
var container = document.getElementById('tui-date-picker-container');
var target = document.getElementById('tui-date-picker-target');

var instance = new DatePicker(container, {
    input: {
        element: target
    },
    ...
});

instance.getDate();
```

For more information about the API, please see [here](http://nhnent.github.io/tui.date-picker/latest/DatePicker).


## 🔧 Pull Request Steps

TOAST UI products are open source, so you can create a pull request(PR) after you fix issues.
Run npm scripts and develop yourself with the following process.

### Setup

Fork `develop` branch into your personal repository.
Clone it to local computer. Install node modules.
Before starting development, you should check to haveany errors.

``` sh
$ git clone https://github.com/{your-personal-repo}/tui.date-picker.git
$ cd tui.date-picker
$ npm install
$ npm run test
```

### Develop

Let's start development!
You can see your code is reflected as soon as you saving the codes by running a server.
Don't miss adding test cases and then make green rights.

#### Run webpack-dev-server

``` sh
$ npm run serve
$ npm run serve:ie8 # Run on Internet Explorer 8
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
* [Getting Started](https://github.com/nhnent/tui.date-picker/blob/production/docs/getting-started.md)
* [Tutorials](https://github.com/nhnent/tui.date-picker/tree/production/docs)
* [APIs](https://nhnent.github.io/tui.date-picker/latest)

You can also see the older versions of API page on the [releases page](https://github.com/nhnent/tui.date-picker/releases).


## 💬 Contributing
* [Code of Conduct](https://github.com/nhnent/tui.date-picker/blob/production/CODE_OF_CONDUCT.md)
* [Contributing guideline](https://github.com/nhnent/tui.date-picker/blob/production/CONTRIBUTING.md)
* [Issue guideline](https://github.com/nhnent/tui.date-picker/blob/production/docs/ISSUE_TEMPLATE.md)
* [Commit convention](https://github.com/nhnent/tui.date-picker/blob/production/docs/COMMIT_MESSAGE_CONVENTION.md)


## 🔩 Dependency
* [tui-code-snippet](https://github.com/nhnent/tui.code-snippet) >=1.5.0
* [tui-time-picker](https://github.com/nhnent/tui.time-picker) >=1.3.0
* [jquery](https://jquery.com/) >=1.11.0


## 📜 License

This software is licensed under the [MIT](https://github.com/nhnent/tui.date-picker/blob/production/LICENSE) © [NHN Entertainment](https://github.com/nhnent).
