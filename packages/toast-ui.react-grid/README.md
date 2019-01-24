# TOAST UI Grid for React

> This is a React component wrapping [TOAST UI Grid](https://github.com/nhnent/tui.grid).

[![github version](https://img.shields.io/github/release/nhnent/toast-ui.react-grid.svg)](https://github.com/nhnent/toast-ui.react-grid/releases/latest)
[![npm version](https://img.shields.io/npm/v/@toast-ui/react-grid.svg)](https://www.npmjs.com/package/@toast-ui/react-grid)
[![license](https://img.shields.io/github/license/nhnent/toast-ui.react-grid.svg)](https://github.com/nhnent/toast-ui.react-grid/blob/master/LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/nhnent/toast-ui.react-grid/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)
[![code with hearth by NHN Entertainment](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-NHN%20Entertainment-ff1414.svg)](https://github.com/nhnent)

## 🚩 Table of Contents
* [Collect statistics on the use of open source](#collect-statistics-on-the-use-of-open-source)
* [Install](#-install)
    * [Using npm](#using-npm)
* [Usage](#-usage)
    * [Load](#load)
    * [Implement](#implement)
    * [Props](#props)
    * [Event](#event)
    * [Method](#method)
* [Pull Request Steps](#-pull-request-steps)
* [Documents](#-documents)
* [Contributing](#-contributing)
* [License](#-license)

## Collect statistics on the use of open source

React Wrapper of TOAST UI Grid applies Google Analytics (GA) to collect statistics on the use of open source, in order to identify how widely TOAST UI Grid is used throughout the world. It also serves as important index to determine the future course of projects. location.hostname (e.g. > “ui.toast.com") is to be collected and the sole purpose is nothing but to measure statistics on the usage. To disable GA, use the following `usageStatistics` option when declare React Wrapper compoent.

```js
var options = {
    ...
    usageStatistics: false
}
```

Or, import `tui-code-snippet.js` (**v1.4.0** or **later**) and then immediately write the options as follows:
```js
tui.usageStatistics = false;
```

## 💾 Install

### Using npm

```sh
npm install --save @toast-ui/react-grid
```

## 🔡 Usage

### Import

You can use Toast UI Grid for React as a ECMAScript module or a CommonJS module. As this module does not contain CSS files, you should import `tui-grid.css` from `tui-grid` manually.

* Using ECMAScript module

```js
import 'tui-grid/dist/tui-grid.css'
import Grid from '@toast-ui/react-grid'
```

* Using CommonJS module

```js
require('tui-grid/dist/tui-grid.css');
const Grid = require('@toast-ui/react-grid');
```

### Props

[All the options of the TOAST UI Grid](http://nhnent.github.io/tui.grid/latest/Grid) are supported in the form of props. 

```js
const data = [
  {id: 1, name: 'Editor'},
  {id: 2, name: 'Grid'}
  {id: 3, name: 'Chart'}
];

const columns = [
  {name: 'id', title: 'ID'},
  {name: 'name', title: 'Name'}
];

const MyComponent = () => (
  <Grid 
    data={data} 
    columns={columns} 
    bodyHeight={100} 
  />
);
```

### Reactive Props

Normally, React Components are re-rendered whenever the props received from a parent Component are changed. But not all the props of this Component are reactive as the TOAST UI Grid does not provide setter methods for all options. Below are the list of reactive props which are currently supported.

- data (using `setData`)
- columns (using `setColumns`)
- bodyHeight (using `setBodyHeight`)
- frozenColumnCount (using `setFrozenColumnCount`)

If you don't want some props to be reactive, you can disable reactivity of specific props using `oneTimeBindingProps`. For example, if you don't want to re-render whenever `data` and `columns` props are changed, you can use `oneTimeBindingProps` like example below. 

```js

const MyComponent = () => (
  <Grid 
    data={data} 
    columns={columns} 
    bodyHeight={100} 
    oneTimeBindingProps={['data', 'columns']}
  />
);
```

### Methods (Using Ref)

For using methods of TOAST UI Grid instance, first thing to do is creating Refs of wrapper Component using `createRef()`. The wrapper Component does not provide a way to call methods of TOAST UI Grid instance directly. Instead, you can call `getGridInstance()` method of the wrapper Component to get the instance, and call the methods with it.

```js
class MyComponent extends React.Component {
  gridRef = React.createRef();
  
  handleAppendRow = () => {
    this.gridRef.current.getGridInstance().appendRow({});
  }

  render() {
    return (
      <>
        <Grid 
          ref={this.gridRef}
          data={data} 
          columns={columns} 
          bodyHeight={100} 
        />
        <button onClick={this.handleAppendRow}>Append Row</button>
      </>

    );
  }
}
```

### Static Methods




### Event


## 🔧 Pull Request Steps

TOAST UI products are open source, so you can create a pull request(PR) after you fix issues.
Run npm scripts and develop yourself with the following process.

### Setup

Fork `develop` branch into your personal repository.
Clone it to local computer. Install node modules.
Before starting development, you should check to haveany errors.

``` sh
$ git clone https://github.com/{your-personal-repo}/[[repo name]].git
$ cd [[repo name]]
$ npm install
```

### Develop

Let's start development!

### Pull Request

Before PR, check to test lastly and then check any errors.
If it has no error, commit and then push it!

For more information on PR's step, please see links of Contributing section.

## 📙 Documents
* [Getting Started](https://github.com/nhnent/toast-ui.react-grid/blob/master/docs/getting-started.md)

## 💬 Contributing
* [Code of Conduct](https://github.com/nhnent/toast-ui.react-grid/blob/master/CODE_OF_CONDUCT.md)
* [Contributing guideline](https://github.com/nhnent/toast-ui.react-grid/blob/master/CONTRIBUTING.md)
* [Commit convention](https://github.com/nhnent/toast-ui.react-grid/blob/master/docs/COMMIT_MESSAGE_CONVENTION.md)

## 📜 License
This software is licensed under the [MIT](./LICENSE) © [NHN Ent.](https://github.com/nhnent)
