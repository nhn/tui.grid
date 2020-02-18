# ![TOAST UI Grid](https://uicdn.toast.com/toastui/img/tui-grid-bi.png)

[![npm](https://img.shields.io/npm/v/tui-grid.svg)](https://www.npmjs.com/package/tui-grid)

## 🚩 Table of Contents

- [Collect statistics on the use of open source](#Collect-statistics-on-the-use-of-open-source)
- [Documents](#-documents)
- [Install](#-install)
- [Usage](#-usage)

## Collect statistics on the use of open source

TOAST UI Grid applies Google Analytics (GA) to collect statistics on the use of open source, in order to identify how widely TOAST UI Grid is used throughout the world.
It also serves as important index to determine the future course of projects.
`location.hostname` (e.g. > "ui.toast.com") is to be collected and the sole purpose is nothing but to measure statistics on the usage.

To disable GA, use the following `usageStatistics` option when creating the instance.

```js
const options = {
  // ...
  usageStatistics: false
};

const instance = new Grid(options);
```

## 📙 Documents

- Getting Started
  - [English](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/docs/en/getting-started.md)
  - [한국어](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/docs/ko/getting-started.md)
- Tutorials
  - [English](https://github.com/nhn/tui.grid/tree/master/packages/toast-ui.grid/docs)
  - [한국어](https://github.com/nhn/tui.grid/tree/master/packages/toast-ui.grid/docs/ko)
- v4.0 Migration Guide
  - [English](https://github.com/nhn/tui.grid/tree/master/packages/toast-ui.grid/docs/v4.0-migration-guide.md)
  - [한국어](https://github.com/nhn/tui.grid/tree/master/packages/toast-ui.grid/docs/v4.0-migration-guide-kor.md)
- [APIs](https://nhn.github.io/tui.grid/latest)

You can also see the older versions of API page on the [releases page](https://github.com/nhn/tui.grid/releases).

## 💾 Install

TOAST UI products can be used by using the package manager or downloading the source directly.
However, we highly recommend using the package manager.

### Via Package Manager

TOAST UI products are registered in two package managers, [npm](https://www.npmjs.com/).
You can conveniently install it using the commands provided by the package manager.
When using npm, be sure to use it in the environment [Node.js](https://nodejs.org/en/) is installed.

#### npm

```sh
$ npm install --save tui-grid # Latest version
$ npm install --save tui-grid@<version> # Specific version
```

### Via Contents Delivery Network (CDN)

TOAST UI products are available over the CDN powered by [TOAST Cloud](https://www.toast.com).

You can use the CDN as below.

```html
<link rel="stylesheet" href="https://uicdn.toast.com/grid/latest/tui-grid.css" />
...
<script src="https://uicdn.toast.com/grid/latest/tui-grid.js"></script>
```

If you want to use a specific version, use the tag name instead of `latest` in the url's path.

The CDN directory has the following structure.

```
grid/
├─ latest/
│  ├─ tui-grid.css
│  ├─ tui-grid.min.css
│  ├─ tui-grid.js
│  └─ tui-grid.min.js
├─ v3.8.0/
│  ├─ ...
```

### Download Source Files

- [Download all sources for each version](https://github.com/nhn/tui.grid/releases)

## 🔨 Usage

### HTML

Add the container element where TOAST UI Grid will be created.

```html
<div id="grid"></div>
```

### JavaScript

TOAST UI Grid can be used by creating an instance with the constructor function.
To get the constructor function, you should import the module using one of the following ways depending on your environment.

#### Using namespace in browser environment

```javascript
const Grid = tui.Grid;
```

#### Using module format in node environment

```javascript
const Grid = require('tui-grid'); /* CommonJS */
```

```javascript
import Grid from 'tui-grid'; /* ES6 */
```

You can create an instance with options and call various API after creating an instance.

```javascript
const instance = new Grid({
  el: document.getElementById('grid'), // Container element
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
