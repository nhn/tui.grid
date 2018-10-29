# TOAST UI Grid for Vue

> This is Vue component wrapping [TOAST UI Grid](https://github.com/nhnent/tui.grid).

[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)
[![github version](https://img.shields.io/github/release/nhnent/toast-ui.vue-grid.svg)](https://github.com/nhnent/toast-ui.vue-grid/releases/latest)
[![npm version](https://img.shields.io/npm/v/@toast-ui/vue-grid.svg)](https://www.npmjs.com/package/@toast-ui/vue-grid)
[![license](https://img.shields.io/github/license/nhnent/toast-ui.vue-grid.svg)](https://github.com/nhnent/toast-ui.vue-grid/blob/master/LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg)](https://github.com/nhnent/toast-ui.vue-grid/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)
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

Vue Wrapper of TOAST UI Grid applies Google Analytics (GA) to collect statistics on the use of open source, in order to identify how widely TOAST UI Grid is used throughout the world. It also serves as important index to determine the future course of projects. location.hostname (e.g. > “ui.toast.com") is to be collected and the sole purpose is nothing but to measure statistics on the usage. To disable GA, use the following `usageStatistics` option when declare Vue Wrapper compoent.

```js
var options = {
    ...
    usageStatistics: false
}
```

Or, include include `tui-code-snippet.js` (**v1.4.0** or **later**) and then immediately write the options as follows:
```js
tui.usageStatistics = false;
```

## 💾 Install

### Using npm

```sh
npm install --save @toast-ui/vue-grid
```

## 🔡 Usage

### Load

You can use Toast UI Grid for Vue as moudule format or namespace. Also you can use Single File Component (SFC of Vue). When using module format and SFC, you should load `tui-grid.css` in the script.

* Using Ecmascript module

    ```js
    import 'tui-grid/dist/tui-grid.css'
    import { Grid } from '@toast-ui/vue-grid'
    ```

* Using Commonjs module

    ```js
    require('tui-grid/dist/tui-grid.css');
    var toastui = require('@toast-ui/vue-grid');
    var Grid = toastui.Grid;
    ```

* Using Single File Component

    ```js
    import 'tui-grid/dist/tui-grid.css'
    import Grid from '@toast-ui/vue-grid/src/Grid.vue'
    ```

* Using namespace

    ```js
    var Grid = toastui.Grid;
    ```

### Implement

First insert `<grid>` in the template or html. `rowData` and `columnData` props are required.

```html
<grid :rowData="rows" :columnData="columns" />
```

Load grid component and then add it to the `components` in your component or Vue instance.

```js
import 'tui-grid/dist/tui-grid.css'
import { Grid } from '@toast-ui/vue-grid'

export default {
    components: {
        'grid': Grid
    },
    data() {
        return {
            rows: [ // for rowData prop
                {
                    name: 'Beautiful Lies',
                    artist: 'Birdy'
                },
                {
                    name: 'X',
                    artist: 'Ed Sheeran'
                }
            ],
            columns: [ // for columnData prop
                {
                    title: 'Name',
                    name: 'name',
                },
                {
                    title: 'Artist',
                    name: 'artist'
                }
            ]
        }
    }
}
```

### Props

You can use `rowData`, `columnData`, `options`, `theme` and `language` props. Example of each props is in the [Getting Started](https://github.com/nhnent/toast-ui.vue-grid/blob/master/docs/getting-started.md#props).

* `rowData`, `columnData`

    | Type | Required |
    | --- | --- |
    | Array | O |

    These props are row and colume data of the grid. If you change `rowData` or `columnData`, the grid is rendered to change data.

* `options`

    | Type | Required |
    | --- | --- |
    | Object | X |

    You can configurate your grid using `options` prop. For more information which properties can be set in `options`, see [options of tui.grid](https://nhnent.github.io/tui.grid/api/Grid.html).

* `theme`

    | Type | Required |
    | --- | --- |
    | Strinf or Object | X |

    This prop can change theme of the grid. We support `default`, `striped` and `clean` themes. So in case you just set `String` of these themes.

    If you want to use other theme, you set `Object` that is required `name` and `value`. For more information which properties of `value` are available, see `extOptions` of [applyTheme of tui.grid](https://nhnent.github.io/tui.grid/api/Grid.html#.applyTheme).

* `language`

    | Type | Required |
    | --- | --- |
    | String or Object | X |

    This prop can change language of the grid. We support `en` and `ko`. So in case you just set `String` of these languages.

    If you want to use other languages, you set `Object` that is required `name` and `value`. For more infomation which properties of `value` are available, see `data` of [setLanguage of tui.grid](https://nhnent.github.io/tui.grid/api/Grid.html#.setLanguage).

### Event

* click : Occurs when a mouse button is clicked on the Grid.
* check : Occurs when a checkbox in row header is checked.
* uncheck : Occurs when a checkbox in row header is unchecked.
* dblclick : Occurs when a mouse button is double clicked on the Grid.
* mouseover : Occurs when a mouse pointer is moved onto the Grid.
* mouseout : Occurs when a mouse pointer is moved off from the Grid.
* mousedown : Occurs when a mouse button is downed on the Grid.
* focusChange : Occurs when focused cell is about to change.
* expanded : Occurs when the row having child rows is expanded.
* expandedAll : Occurs when all rows having child rows are expanded.
* collapsed : Occurs when the row having child rows is collapsed.
* collapsedAll : Occurs when all rows having child rows are expanded.
* beforeRequest : Occurs before the http request is sent.
* response : Occurs when the response is received from the server.
* successResponse : Occurs after the response event, if the result is true.
* failResponse : Occurs after the response event, if the result is false.
* errorResponse : Occurs after the response event, if the response is Error.
* selection : Occurs when selecting cells.
* deleteRange : Occurs when cells are deleted by 'del' key.

For more information such as the parameters of each event, see [event of tui.grid](https://nhnent.github.io/tui.grid/api/Grid.html). Example of event is in the [Getting Started](https://github.com/nhnent/toast-ui.vue-grid/blob/master/docs/getting-started.md#event).

### Method

For use method, first you need to assign `ref` attribute of element like this:

```html
<grid ref="tuiGrid" :rowData="rows" :columnData="columns"/>
```

After then you can use methods through `this.$refs`. We provide `getRootElement` and `invoke` methods.

* `getRootElement`

    You can get root element of grid using this method.

    ```js
    this.$refs.tuiGrid.getRootElement();
    ```

* `invoke`

    If you want to more manipulate the Grid, you can use `invoke` method to call the method of tui.grid. First argument of `invoke` is name of the method and second argument is parameters of the method. To find out what kind of methods are available, see [method of tui.grid](http://nhnent.github.io/tui.grid/api/Grid.html).

    ```js
    const info = this.$refs.tuiGrid.invoke('getFocusedCell');
    this.$refs.tuiGrid.invoke('setWidth', 500);
    ```

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
* [Getting Started](https://github.com/nhnent/toast-ui.vue-grid/blob/master/docs/getting-started.md)

## 💬 Contributing
* [Code of Conduct](https://github.com/nhnent/toast-ui.vue-grid/blob/master/CODE_OF_CONDUCT.md)
* [Contributing guideline](https://github.com/nhnent/toast-ui.vue-grid/blob/master/CONTRIBUTING.md)
* [Commit convention](https://github.com/nhnent/toast-ui.vue-grid/blob/master/docs/COMMIT_MESSAGE_CONVENTION.md)

## 📜 License
This software is licensed under the [MIT](./LICENSE) © [NHN Ent.](https://github.com/nhnent)
