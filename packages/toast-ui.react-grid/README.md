# TOAST UI Grid for React

> This is a React component wrapping [TOAST UI Grid](https://github.com/nhn/tui.grid).

[![npm version](https://img.shields.io/npm/v/@toast-ui/react-grid.svg)](https://www.npmjs.com/package/@toast-ui/react-grid)

## 🚩 Table of Contents

- [Collect statistics on the use of open source](#collect-statistics-on-the-use-of-open-source)
- [Install](#-install)
- [Usage](#-usage)

## Collect statistics on the use of open source

React Wrapper of TOAST UI Grid applies Google Analytics (GA) to collect statistics on the use of open source, in order to identify how widely TOAST UI Grid is used throughout the world. It also serves as important index to determine the future course of projects. location.hostname (e.g. > “ui.toast.com") is to be collected and the sole purpose is nothing but to measure statistics on the usage. To disable GA, use the `usageStatistics` props like the example below.

```js
<Grid
  data={
    [
      /* ... */
    ]
  }
  columns={
    [
      /* ... */
    ]
  }
  usageStatistics={false}
/>
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

- Using ECMAScript module

```js
import 'tui-grid/dist/tui-grid.css';
import Grid from '@toast-ui/react-grid';
```

- Using CommonJS module

```js
require('tui-grid/dist/tui-grid.css');
const Grid = require('@toast-ui/react-grid');
```

### Props

[All the options of the TOAST UI Grid](http://nhn.github.io/tui.grid/latest/Grid) are supported in the form of props. Note that `data` and `columns` props are required and other props are optional.

```js
const data = [
  {id: 1, name: 'Editor'},
  {id: 2, name: 'Grid'},
  {id: 3, name: 'Chart'}
];

const columns = [
  {name: 'id', header: 'ID'},
  {name: 'name', header: 'Name'}
];

const MyComponent = () => (
  <Grid
    data={data}
    columns={columns}
    rowHeight={25}
    bodyHeight={100}
    heightResizable={true}
    rowHeaders={['rowNum']}
  />

);
```

### Reactive Props

Normally, React components are re-rendered whenever the props received from a parent component are changed. But not all the props of the wrapper component are reactive as the TOAST UI Grid does not provide setter methods for all options. Below are the list of reactive props which are currently supported.

- `data` (using `setData`)
- `columns` (using `setColumns`)
- `bodyHeight` (using `setBodyHeight`)
- `frozenColumnCount` (using `setFrozenColumnCount`)

If you don't want some props to be reactive, you can disable reactivity of specific props using `oneTimeBindingProps`. For example, if you don't want to re-render whenever `data` and `columns` props are changed, you can use `oneTimeBindingProps` like the example below.

```js
const MyComponent = () => (
  <Grid
    data={data}
    columns={columns}
    bodyHeight={100}
    frozenColumnCount={2}
    oneTimeBindingProps={['data', 'columns']}
  />
);
```

### Instance Methods

For using [instance methods of TOAST UI Grid](http://nhn.github.io/tui.grid/latest/Grid#activateFocus), first thing to do is creating Refs of wrapper component using [`createRef()`](https://reactjs.org/docs/refs-and-the-dom.html#creating-refs). But the wrapper component does not provide a way to call instance methods of TOAST UI Grid directly. Instead, you can call `getInstance()` method of the wrapper component to get the instance, and call the methods on it.

```js
class MyComponent extends React.Component {
  gridRef = React.createRef();

  handleAppendRow = () => {
    this.gridRef.current.getInstance().appendRow({});
  };

  render() {
    return (
      <>
        <Grid ref={this.gridRef} data={data} columns={columns} />
        <button onClick={this.handleAppendRow}>Append Row</button>
      </>
    );
  }
}
```

### Getting the root element

An instance of the wrapper component also provides a handy method for getting the root element. If you want to manipulate the root element directly, you can call `getRootElement` to get the element.

```js
class MyComponent extends React.Component {
  gridRef = React.createRef();

  handleClickButton = () => {
    this.gridRef.current.getRootElement().classList.add('my-grid-root');
  };

  render() {
    return (
      <>
        <Grid ref={this.gridRef} data={data} columns={columns} />
        <button onClick={this.handleClickButton}>Click!</button>
      </>
    );
  }
}
```

### Static Methods

The wrapper component does not provide a way to call [static methods of TOAST UI Grid](http://nhn.github.io/tui.grid/latest/Grid#applyTheme). If you want to use static methods such as `applyTheme` or `setLanguage` you should use it via importing `tui-grid` directly.

```js
import TuiGrid from 'tui-grid';

TuiGrid.setLanguage('ko');
TuiGrid.applyTheme('striped');
```

### Events

[All the events of TOAST UI Grid](http://nhn.github.io/tui.grid/latest/Grid#event-beforeRequest) are supported in the form of `on[EventName]` props. The first letter of each event name should be capitalized. For example, for using `click` event you can use `onClick` prop like the example below.

```js
class MyComponent extends React.Component {
  handleClick = () => {
    console.log('click!!');
  };

  render() {
    return <Grid data={data} columns={columns} onClick={this.handleClick} />;
  }
}
```

### DataSource

In general, the TOAST UI Grid runs on the front-end environment using local data. However, you can also bind remote data using a plain object called `dataSource`. To use this, define the `dataSource` object and set it to the data option like the example below.

```js
const columns = [
  /* ... */
];
const dataSource = {
  withCredentials: false,
  initialRequest: true,
  api: {
    readData: { url: 'api/readData', method: 'GET' }
  }
};

const MyComponent = () => (
  <Grid
    columns={columns}
    data={dataSource}
    pageOptions={{ perPage: 3 }}
    onSuccessResponse={data => {
      console.log(data);
    }}
  />
);
```

### With React Hooks

React Hooks can be used together.

```js
import React, { useCallback } from 'react';

const MyComponentWithHooks = () => {
  const onClick = useCallback(() => {
    console.log('condition:', condition);
  }, [condition]);

  return <Grid columns={columns} data={data} onClick={onClick} />;
};
```
