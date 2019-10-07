# TOAST UI Grid for Vue

> This is Vue component wrapping [TOAST UI Grid](https://github.com/nhn/tui.grid).

[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)
[![npm version](https://img.shields.io/npm/v/@toast-ui/vue-grid.svg)](https://www.npmjs.com/package/@toast-ui/vue-grid)
[![license](https://img.shields.io/github/license/nhn/toast-ui.vue-grid.svg)](https://github.com/nhn/tui.grid/blob/master/LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/nhn/tui.grid/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)
[![code with hearth by NHN](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-NHN-ff1414.svg)](https://github.com/nhn)

## 🚩 Table of Contents

- [Collect statistics on the use of open source](#collect-statistics-on-the-use-of-open-source)
- [Documents](#-documents)
- [Install](#-install)
  - [Using npm](#using-npm)
- [Usage](#-usage)
  - [Load](#load)
  - [Implement](#implement)
  - [Props](#props)
  - [Event](#event)
  - [Method](#method)

## Collect statistics on the use of open source

Vue Wrapper of TOAST UI Grid applies Google Analytics (GA) to collect statistics on the use of open source, in order to identify how widely TOAST UI Grid is used throughout the world. It also serves as important index to determine the future course of projects. location.hostname (e.g. > “ui.toast.com") is to be collected and the sole purpose is nothing but to measure statistics on the usage. To disable GA, use the following `usageStatistics` option when declare Vue Wrapper compoent.

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

- Using Ecmascript module

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

You can use `rowData`, `columnData`, `options`, `theme` and `language` props. Example of each props is in the [Getting Started](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.vue-grid/docs/getting-started.md).

- `rowData`, `columnData`

  | Type            | Required |
  | --------------- | -------- |
  | Array or Object | O        |

  These props are row and colume data of the grid. If you change `rowData` or `columnData`, the grid is rendered to change data.

- `options`

  | Type   | Required |
  | ------ | -------- |
  | Object | X        |

  You can configurate your grid using `options` prop. For more information which properties can be set in `options`, see [options of tui.grid](https://nhn.github.io/tui.grid/latest/Grid).

- `theme`

  | Type             | Required |
  | ---------------- | -------- |
  | String or Object | X        |

  This prop can change theme of the grid. We support `default`, `striped` and `clean` themes. So in case you just set `String` of these themes.

  If you want to use other theme, you set `Object` that is required `name` and `value`. For more information which properties of `value` are available, see `extOptions` of [applyTheme of tui.grid](https://nhn.github.io/tui.grid/latest/Grid#applyTheme).

- `language`

  | Type             | Required |
  | ---------------- | -------- |
  | String or Object | X        |

  This prop can change language of the grid. We support `en` and `ko`. So in case you just set `String` of these languages.

  If you want to use other languages, you set `Object` that is required `name` and `value`. For more infomation which properties of `value` are available, see `data` of [setLanguage of tui.grid](https://nhn.github.io/tui.grid/latest/Grid#setLanguage).

### Event

- click : Occurs when a mouse button is clicked on the Grid.
- check : Occurs when a checkbox in row header is checked.
- uncheck : Occurs when a checkbox in row header is unchecked.
- dblclick : Occurs when a mouse button is double clicked on the Grid.
- mouseover : Occurs when a mouse pointer is moved onto the Grid.
- mouseout : Occurs when a mouse pointer is moved off from the Grid.
- mousedown : Occurs when a mouse button is downed on the Grid.
- focusChange : Occurs when focused cell is about to change.
- expand : Occurs when the row having child rows is expanded.
- collapse : Occurs when the row having child rows is collapsed.
- beforeRequest : Occurs before the http request is sent.
- response : Occurs when the response is received from the server.
- successResponse : Occurs after the response event, if the result is true.
- failResponse : Occurs after the response event, if the result is false.
- errorResponse : Occurs after the response event, if the response is Error.
- selection : Occurs when selecting cells.

For more information such as the parameters of each event, see [event of tui.grid](https://nhn.github.io/tui.grid/latest/Grid). Example of event is in the [Getting Started](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.vue-grid/docs/getting-started.md).

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
