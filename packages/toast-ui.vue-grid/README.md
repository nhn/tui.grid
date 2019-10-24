# TOAST UI Grid for Vue

> This is Vue component wrapping [TOAST UI Grid](https://github.com/nhn/tui.grid).

[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)
[![npm version](https://img.shields.io/npm/v/@toast-ui/vue-grid.svg)](https://www.npmjs.com/package/@toast-ui/vue-grid)

## 🚩 Table of Contents

- [Collect statistics on the use of open source](#collect-statistics-on-the-use-of-open-source)
- [Documents](#-documents)
- [Install](#-install)
- [Usage](#-usage)

## Collect statistics on the use of open source

Vue Wrapper of TOAST UI Grid applies Google Analytics (GA) to collect statistics on the use of open source, in order to identify how widely TOAST UI Grid is used throughout the world. It also serves as important index to determine the future course of projects. `location.hostname` (e.g. > “ui.toast.com") is to be collected and the sole purpose is nothing but to measure statistics on the usage. To disable GA, use the following `usageStatistics` option when declare Vue Wrapper compoent.

```js
var options = {
  ...
  usageStatistics: false
}
```

## 📙 Documents

- [Getting Started](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.vue-grid/docs/getting-started.md)

## 💾 Install

### Using npm

```sh
npm install --save @toast-ui/vue-grid
```

## 🔡 Usage

### Load

You can use Toast UI Grid for Vue as moudule format or namespace. Also you can use Single File Component (SFC of Vue). When using module format and SFC, you should load `tui-grid.css` in the script.

- Using EcmaScript module

  ```js
  import 'tui-grid/dist/tui-grid.css';
  import { Grid } from '@toast-ui/vue-grid';
  ```

- Using Commonjs module

  ```js
  require('tui-grid/dist/tui-grid.css');
  var toastui = require('@toast-ui/vue-grid');
  var Grid = toastui.Grid;
  ```

- Using Single File Component

  ```js
  import 'tui-grid/dist/tui-grid.css';
  import Grid from '@toast-ui/vue-grid/src/Grid.vue';
  ```

- Using namespace

  ```js
  var Grid = toastui.Grid;
  ```

### Implement

First insert `<grid>` in the template or html. `rowData` and `columnData` props are required.

```html
<grid :data="gridProps.data" :columns="gridProps.columns" />
```

Load grid component and then add it to the `components` in your component or Vue instance.

> TOAST UI Grid has its own reactivity system, and does not use the reactivity system of Vue. So, instead of adding props in the `data`, declare `props` in the `created` lifecycle method.

```js
import 'tui-grid/dist/tui-grid.css';
import { Grid } from '@toast-ui/vue-grid';

export default {
  components: {
    grid: Grid
  },
  created() {
    this.gridProps = {
      data: [
        // for rowData prop
        {
          name: 'Beautiful Lies',
          artist: 'Birdy'
        },
        {
          name: 'X',
          artist: 'Ed Sheeran'
        }
      ],
      columns: [
        // for columnData prop
        {
          header: 'Name',
          name: 'name'
        },
        {
          header: 'Artist',
          name: 'artist'
        }
      ]
    };
  }
};
```

### Props

[All the options of the TOAST UI Grid](http://nhn.github.io/tui.grid/latest/Grid) are supported in the form of props. Note that `data` and `columns` props are required and other props are optional.

```html
<grid
  :data="gridProps.data"
  :columns="gridProps.columns"
  :rowHeaders="gridProps.rowHeaders"
  :columnOptions="gridProps.columnOptions"
></grid>
```

* `theme` and `language` props have been deprecated since `v2.1.0`. Use [static methods](#static-methods).

### Event

[All the events of TOAST UI Grid](http://nhn.github.io/tui.grid/latest/Grid#event-beforeRequest) are supported in the form of `on[EventName]` props. The first letter of each event name should be capitalized. For example, for using `click` event you can use `onClick` prop like the example below.

```html
<template>
  <div class="container">
    <grid
      :data="gridProps.data"
      :columns="gridProps.columns"
      @click="onClick"
    ></grid>
  </div>
</template>
<script>
import 'tui-grid/dist/tui-grid.css';
import { Grid } from '../src/index.js';

export default {
  components: {
    grid: Grid
  },
  methods: {
    onClick(ev) {
      console.log('click event: ', ev);
    }
  }
};
</script>
```

### Method

For use method, first you need to assign `ref` attribute of element like this:

```html
<grid ref="tuiGrid" :data="rows" :columns="columns" />
```

After then you can use methods through `this.$refs`. We provide `getRootElement` and `invoke` methods.

- `getRootElement`

  You can get root element of grid using this method.

  ```js
  this.$refs.tuiGrid.getRootElement();
  ```

- `invoke`

  If you want to more manipulate the Grid, you can use `invoke` method to call the method of tui.grid. First argument of `invoke` is name of the method and second argument is parameters of the method. To find out what kind of methods are available, see [method of tui.grid](http://nhn.github.io/tui.grid/latest/Grid).

  ```js
  const info = this.$refs.tuiGrid.invoke('getFocusedCell');
  this.$refs.tuiGrid.invoke('setWidth', 500);
  ```

## Static Methods

The wrapper component does not provide a way to call [static methods of TOAST UI Grid](http://nhn.github.io/tui.grid/latest/Grid#applyTheme). If you want to use static methods such as `applyTheme` or `setLanguage` you should use it via importing tui-grid directly.

```js
import TuiGrid from 'tui-grid';

TuiGrid.setLanguage('ko');
TuiGrid.applyTheme('striped');
```
