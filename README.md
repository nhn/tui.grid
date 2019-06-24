# ![TOAST UI Grid](https://uicdn.toast.com/toastui/img/tui-grid-bi.png)

> The Powerful Component to Display and Edit Data. Experience the Ultimate Data Transformer!

[![GitHub release](https://img.shields.io/github/release/nhn/tui.grid.svg)](https://github.com/nhn/tui.grid/releases/latest) [![npm](https://img.shields.io/npm/v/tui-grid.svg)](https://www.npmjs.com/package/tui-grid) [![GitHub license](https://img.shields.io/github/license/nhn/tui.grid.svg)](https://github.com/nhn/tui.grid/blob/production/LICENSE) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/nhn/tui.grid/pulls) [![code with hearth by NHN ](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-NHN-ff1414.svg)](https://github.com/nhn)

![tui-grid](https://user-images.githubusercontent.com/18183560/42144044-de298b02-7df3-11e8-8bbd-dc824ae0df52.png)

## TOAST UI Grid 4 is released!!

We have **eliminated the unnecessary dependencies**; **enhanced the performance through the virtual DOM**; and **undertaken a massive task of improving the overall API**. Finally, we are proud to present to you the more **powerful** and **lighter** TOAST UI Grid 4.0! Also, we are planning to maintain the existing version(3.8) in the 3.8 branch for only bugfixes.

## Wrappers

* [toast-ui.vue-grid](https://github.com/nhn/toast-ui.vue-grid) - **Vue** wrapper component implemented by NHN. 
* [toast-ui.react-grid](https://github.com/nhn/toast-ui.react-grid) - **React** wrapper component implemented by NHN.

## 🚩 Table of Contents

* [Collect statistics on the use of open source](#Collect-statistics-on-the-use-of-open-source)
* [Browser Support](#-browser-support)
* [The Toast UI Grid Is an Ultimate Transformer](#-the-toast-ui-grid-is-an-ultimate-transformer)
    * [Data Can Be Displayed in Any Format](#data-can-be-displayed-in-any-format)
    * [Provides a Variety of Editing Elements](#provides-a-variety-of-editing-elements)
    * [Simple, Easy to Use Themes](#simple-easy-to-use-themes)
* [Features](#-features)
* [Examples](#-examples)
* [Install](#-install)
    * [Via Package Manager](#via-package-manager)
    * [Via Contents Delivery Network (CDN)](#via-contents-delivery-network-cdn)
    * [Download Source Files](#download-source-files)
* [Usage](#-usage)
    * [HTML](#html)
    * [JavaScript](#javascript)
    * [TypeScript](#TypeScript)
* [Pull Request Steps](#-pull-request-steps)
    * [Setup](#setup)
    * [Develop](#develop)
    * [Pull Request Steps](#pull-request)
* [Documents](#-documents)
* [Contributing](#-contributing)
* [TOAST UI Family](#-toast-ui-family)
* [Used By](#-used-by)
* [License](#-license)

## Collect statistics on the use of open source

TOAST UI Grid applies Google Analytics (GA) to collect statistics on the use of open source, in order to identify how widely TOAST UI Grid is used throughout the world.
It also serves as important index to determine the future course of projects.
`location.hostname` (e.g. > “ui.toast.com") is to be collected and the sole purpose is nothing but to measure statistics on the usage.

To disable GA, use the following `usageStatistics` option when creating the instance.

```js
const options = {
  // ...
  usageStatistics: false
}

const instance = new Grid(options);
```

## 🌏 Browser Support

| <img src="https://user-images.githubusercontent.com/1215767/34348387-a2e64588-ea4d-11e7-8267-a43365103afe.png" alt="Chrome" width="16px" height="16px" /> Chrome | <img src="https://user-images.githubusercontent.com/1215767/34348590-250b3ca2-ea4f-11e7-9efb-da953359321f.png" alt="IE" width="16px" height="16px" /> Internet Explorer | <img src="https://user-images.githubusercontent.com/1215767/34348380-93e77ae8-ea4d-11e7-8696-9a989ddbbbf5.png" alt="Edge" width="16px" height="16px" /> Edge | <img src="https://user-images.githubusercontent.com/1215767/34348394-a981f892-ea4d-11e7-9156-d128d58386b9.png" alt="Safari" width="16px" height="16px" /> Safari | <img src="https://user-images.githubusercontent.com/1215767/34348383-9e7ed492-ea4d-11e7-910c-03b39d52f496.png" alt="Firefox" width="16px" height="16px" /> Firefox |
| :---------: | :---------: | :---------: | :---------: | :---------: |
| Yes | 9+ | Yes | Yes | Yes |


## 🤖 The Toast UI Grid Is an Ultimate Transformer

### Data Can Be Displayed in Any Format

#### Styling

The TOAST UI Grid is a component that can **display**, **edit**, **add**, and **delete** multiple data.
You can append units to the data shown and use `html` to represent images and links instead of textual data.

![style](https://user-images.githubusercontent.com/18183560/41572390-7cbb9478-73b2-11e8-817d-eca61ee939ae.png)

#### Summary

The summary function allows you to caculate on multiple rows of data and display the results.
It automatically calculates the **total sum**, the **average**, the **maximum and minimum value**, and updates each result whenever the value changes.

![summary](https://user-images.githubusercontent.com/18183560/41572394-7e821e76-73b2-11e8-90bc-630b55be4367.png)

#### Tree Data

Starting with version 3 or later, you can use tree data to represent them in a hierarchy.
Now let's process the data we want.

![tree](https://user-images.githubusercontent.com/18183560/41572383-780a9c08-73b2-11e8-9ffb-7bc5e58860e6.png)


### Provides a Custom Editing Elements

In order to edit the data, you don't need to use `html` to create the editing elements yourself.
It supports various `input` elements such as **text**, **select box**, **checkbox**, **radio button.**
You can set the data editing method just by setting options.
You can also show editing elements whatever you want through **Custom Editor**.

![59417111-9e181280-8e01-11e9-8de7-2df819b36354](https://user-images.githubusercontent.com/37766175/59748226-9b139b00-92b5-11e9-9e72-d4b6e3fbd5ff.png)


### Simple, Easy to Use Themes

It has three themes: **default**, **striped** (zebra pattern), and **clean** theme.
You can easily add the desired design to the themes provided through the theme API.
Themes API has been improved since version 3, allowing you to easily control the background color of the header / body area and vertical / horizontal border lines without modifying CSS styles directly.
Use the theme to customize your grid.</span>

| default | striped | clean |
| ------- | ------- | ----- |
|![theme-default](https://user-images.githubusercontent.com/18183560/41571499-724937ec-73ae-11e8-8ecd-a111a5c391bc.png)|![theme-striped](https://user-images.githubusercontent.com/18183560/41571500-727500ca-73ae-11e8-808c-252638e479fc.png)|![theme-clean](https://user-images.githubusercontent.com/18183560/41571498-721ffdbe-73ae-11e8-9e75-7603b582c3cb.png)|

In addition, a variety of powerful features can be found on the demo page below. 👇👇👇


## 🎨 Features

* [More Diverse Input Types _(checkbox, radio, select, password, etc.)_](https://github.com/nhn/tui.grid/blob/master/docs/custom-editor.md)
* [Full Keyboard Navigation _(move, select, copy, paste, delete, etc.)_](https://github.com/nhn/tui.grid/blob/master/docs/keymap.md)
* [Copy & Paste using clipboard with 3rd party application _(Like MS-Excel or Google-spreadsheet)_](https://github.com/nhn/tui.grid/blob/master/docs/clipboard.md)
* [Multi column headers](https://github.com/nhn/tui.grid/blob/master/docs/complex-columns.md)
* [Picking date](https://github.com/nhn/tui.grid/blob/master/docs/date-picker.md)
* [Relational Structure Between Columns](https://github.com/nhn/tui.grid/blob/master/docs/relation-between-columns.md)
* [Data Source](https://github.com/nhn/tui.grid/blob/master/docs/data-source.md)
* [Summarize all values of each column](https://github.com/nhn/tui.grid/blob/master/docs/summary.md)
* [Customizing styles _(Three basic themes)_](https://github.com/nhn/tui.grid/blob/master/docs/themes.md)
* [Tree Data Representation](https://github.com/nhn/tui.grid/blob/master/docs/tree.md)
* [Custom cell renderer](https://github.com/nhn/tui.grid/blob/master/docs/custom-renderer.md)
* Enhanced Virtual Scroll _(Handling Large Dataset Without Performance Loss)_
* Column resize & reorder & show & hide
* Validation
* Selection
* Pagination
* Sorting
* Merging cell
* Frozen(Pinned) columns

## 🐾 Examples

* [Basic](https://nhn.github.io/tui.grid/latest/tutorial-example01-basic)
* [Custom Editor](https://nhn.github.io/tui.grid/latest/tutorial-example03-custom-editor)
* [Relation between columns](https://nhn.github.io/tui.grid/latest/tutorial-example05-relation-columns)
* [Themes](https://nhn.github.io/tui.grid/latest/tutorial-example07-themes)
* [DatePicker](https://nhn.github.io/tui.grid/latest/tutorial-example08-date-picker)
* [Summary](https://nhn.github.io/tui.grid/latest/tutorial-example09-summary)
* [Data Source](https://nhn.github.io/tui.grid/latest/tutorial-example10-data-source)
* [Tree](https://nhn.github.io/tui.grid/latest/tutorial-example14-tree)

Here are more [examples](https://nhn.github.io/tui.grid/latest/tutorial-example01-basic) and play with TOAST UI Grid!


## 💾 Install

TOAST UI products can be used by using the package manager or downloading the source directly.
However, we highly recommend using the package manager.

### Via Package Manager

TOAST UI products are registered in two package managers, [npm](https://www.npmjs.com/).
You can conveniently install it using the commands provided by the package manager.
When using npm, be sure to use it in the environment [Node.js](https://nodejs.org/en/) is installed.

#### npm

``` sh
$ npm install --save tui-grid # Latest version
$ npm install --save tui-grid@<version> # Specific version
```

### Via Contents Delivery Network (CDN)

TOAST UI products are available over the CDN powered by [TOAST Cloud](https://www.toast.com).

You can use the CDN as below.

``` html
<link rel="stylesheet" href="https://uicdn.toast.com/tui-grid/latest/tui-grid.css" />
...
<script src="https://uicdn.toast.com/tui-grid/latest/tui-grid.js"></script>
```

If you want to use a specific version, use the tag name instead of `latest` in the url's path.

The CDN directory has the following structure.

```
tui-grid/
├─ latest/
│  ├─ tui-grid.css
│  ├─ tui-grid.min.css
│  ├─ tui-grid.js
│  └─ tui-grid.min.js
├─ v3.8.0/
│  ├─ ...
```

### Download Source Files

* [Download bundle files](https://github.com/nhn/tui.grid/tree/production/dist)
* [Download all sources for each version](https://github.com/nhn/tui.grid/releases)


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
const Grid = tui.Grid;
```

#### Using module format in node environment

``` javascript
const Grid = require('tui-grid'); /* CommonJS */
```

``` javascript
import Grid from 'tui-grid'; /* ES6 */
```

You can create an instance with options and call various APIs after creating an instance.

``` javascript
const instance = new Grid({
  el: document.getElementById('grid), // Container element
  columns: [
    {
      header: 'Name',
      name: 'name'
    },
    {
      header: 'Artist',
      name: 'artist'
    },
    {
      header: 'Release',
      name: 'release'
    },
    {
      header: 'Genre',
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

instance.resetData(newData); // Call API of instance's public method

Grid.applyTheme('striped'); // Call API of static method
```

### TypeScript

If you are using TypeScript, you must use `import module = require('module')` to import the Grid module. See ["export = " and "import = require()"](https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require).

```typescript
import Grid = require('tui-grid');

const instance = new Grid({
    // ...options
});
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
$ npm start
```

#### Run storybook

``` sh
$ npm run storybook
```

#### Run cypress test

``` sh
$ npm run test
```

### Pull Request

Before PR, check to test lastly and then check any errors.
If it has no error, commit and then push it!

For more information on PR's step, please see links of Contributing section.


## 📙 Documents

* [Getting Started](https://github.com/nhn/tui.grid/blob/production/docs/getting-started.md)
* [Tutorials](https://github.com/nhn/tui.grid/tree/production/docs)
* [APIs](https://nhn.github.io/tui.grid/latest)

You can also see the older versions of API page on the [releases page](https://github.com/nhn/tui.grid/releases).


## 💬 Contributing

* [Code of Conduct](https://github.com/nhn/tui.grid/blob/production/CODE_OF_CONDUCT.md)
* [Contributing guideline](https://github.com/nhn/tui.grid/blob/production/CONTRIBUTING.md)
* [Issue guideline](https://github.com/nhn/tui.grid/blob/production/docs/ISSUE_TEMPLATE.md)
* [Commit convention](https://github.com/nhn/tui.grid/blob/production/docs/COMMIT_MESSAGE_CONVENTION.md)


## 🍞 TOAST UI Family

* [TOAST UI Calendar](https://github.com/nhn/tui.calendar)
* [TOAST UI Chart](https://github.com/nhn/tui.chart)
* [TOAST UI Editor](https://github.com/nhn/tui.editor)
* [TOAST UI Image-Editor](https://github.com/nhn/tui.image-editor)
* [TOAST UI Components](https://github.com/nhn)

## 🚀 Used By
* [NCP - Commerce Platform](https://www.e-ncp.com/)
* [Toast File](https://file.toast.com/)
* [HANGAME](https://www.hangame.com/)
* [TOAST Gamebase](https://docs.toast.com/ko/Game/Gamebase/ko/oper-analytics/)
* [TOAST Dooray - Collaboration Service](https://dooray.com/)
* [Shop by](https://www.godo.co.kr/shopby/main.gd)
* [Payco](https://www.payco.com/)
* [Payco Shopping](https://shopping.payco.com)
* [YES24 - Movie Management System (Admin Tools)](http://m.movie.yes24.com/Movie/CurrentMovie.aspx) 


## 📜 License

This software is licensed under the [MIT](https://github.com/nhn/tui.grid/blob/production/LICENSE) © [NHN](https://github.com/nhn).
