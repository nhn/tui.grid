# Getting Started

## 🚩 Table of Contents
* [Install](#-install)
    * [Using npm](#using-npm)
* [Usage](#-usage)
    * [Load](#load)
    * [Implement](#implement)
    * [Props](#props)
        * [data](#data)
        * [options](#options)
        * [theme](#theme)
    * [Event](#event)
    * [Method](#method)


## 💾 Install

### Using npm

```sh
npm install --save @toast-ui/vue-grid
```

## 🔡 Usage

### Load

You can use Toast UI Grid for Vue as module format or namespace. Also you can use Single File Component (SFC of Vue). When using module format and SFC, you should load `tui-grid.css` in the script.

* Using EcmaScript module

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
<grid :data="gridProps.data" :columns="gridProps.columns" />
```

Load grid component and then add it to the `components` in your component or Vue instance.

> TOAST UI Grid has its own reactivity system, and does not use the reactivity system of Vue. So, instead of adding props in the `data`, declare `props` in the `created` lifecycle method.

```js
import 'tui-grid/dist/tui-grid.css'
import { Grid } from '@toast-ui/vue-grid'

export default {
  components: {
    'grid': Grid
  },
  created() {
    this.options = {
      data: [ // for rowData prop
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
          header: 'Name',
          name: 'name',
        },
        {
          header: 'Artist',
          name: 'artist'
        }
      ]
    }
  }
}
```

### Props

You can use `rowData`, `columnData`, `options`, `theme` and `language` props.

* `rowData`, `columnData`

    | Type | Required |
    | --- | --- |
    | Array | Object | O |

    These props are row and colume data of the grid. If you change `rowData` or `columnData`, the grid is rendered to change data.

    Example :

    ``` html
    <template>
      <grid
        :data="gridProps.data" 
        :columns="gridProps.columns" 
      />
    </template>
    <script>
    import 'tui-grid/dist/tui-grid.css'
    import { Grid } from '@toast-ui/vue-grid';

    export default {
      name: 'myGrid',
      components: {
        'grid': Grid
      },
      created() {
        this.gridProps = {
          data: [ // for rowData prop
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
              header: 'Name',
              name: 'name',
            },
            {
              header: 'Artist',
              name: 'artist'
            }
          ]
        }
      }
    };
    </script>
    ```

* `options`

    | Type | Required |
    | --- | --- |
    | Object | X |

    You can configurate your grid using `options` prop. For more information which properties can be set in `options`, see [options of tui.grid](https://nhn.github.io/tui.grid/latest/Grid).

    Example:

    ``` html
    <template>
        <grid
          :data="gridProps.data"
          :columns="gridProps.columns"
          :options="gridProps.options"
        />
    </template>
    <script>
    import 'tui-grid/dist/tui-grid.css'
    import { Grid } from '@toast-ui/vue-grid';

    export default {
        name: 'myGrid',
        components: {
          'grid': Grid
        },
        created() {
          this.gridProps = {
            data: [
              // ... omit
            ],
            columns: [ 
              // ... omit
            ],
            options: {
              scrollX: false,
              scrollY: false,
              rowHeight: 30,
              rowHeaders: ['checkbox']
            }
          }
        }
    };
    </script>
    ```

* `theme`

    | Type | Required |
    | --- | --- |
    | Strinf or Object | X |

    This prop can change theme of the grid. We support `default`, `striped` and `clean` themes. So in case you just set `String` of these themes.

    If you want to use other theme, you set `Object` that is required `name` and `value`. For more information which properties of `value` are available, see `extOptions` of [applyTheme of tui.grid](https://nhn.github.io/tui.grid/latest/Grid#applyTheme).

    Example using `String`:

    ``` html
    <template>
      <grid
        :data="gridProps.data"
        :columns="gridProps.columns"
        :theme="'striped'"
      />
    </template>
    <script>
    import 'tui-grid/dist/tui-grid.css'
    import { Grid } from '@toast-ui/vue-grid';

    export default {
      name: 'myGrid',
      components: {
        'grid': Grid
      },
      created() {
        this.gridProps = {
          rows: [
            // ... omit
          ],
          columns: [ 
            // ... omit
          ]
        }
      }
    };
    </script>
    ```

    Example using `Object`:

    ``` html
    <template>
      <grid
        :data="gridProps.rows"
        :columns="gridProps.columns"
        :theme="gridProps.myTheme"
      />
    </template>
    <script>
    import 'tui-grid/dist/tui-grid.css'
    import { Grid } from '@toast-ui/vue-grid';

    export default {
      name: 'myGrid',
      components: {
        'grid': Grid
      },
      created() {
        this.gridProps = {
          data: [
            // ... omit
          ],
          columns: [ 
            // ... omit
          ],
          myTheme: {
            name: 'myTheme',
            value: {
              cell: {
                normal: {
                  background: '#00ff00',
                  border: '#e0e0e0'
                },
                head: {
                  background: '#ff0000',
                  border: '#ffff00'
                },
                editable: {
                  background: '#fbfbfb'
                }
              }
            }
          }
        }
      }
    };
    </script>
    ```

* `language`

    | Type | Required |
    | --- | --- |
    | String or Object | X |

    This prop can change language of the grid. We support `en` and `ko`. So in case you just set `String` of these languages.

    If you want to use other languages, you set `Object` that is required `name` and `value`. For more infomation which properties of `value` are available, see `data` of [setLanguage of tui.grid](https://nhn.github.io/tui.grid/latest/Grid#setLanguage).

    Example using `String`:

    ```html
    <template>
        <grid 
          :data="rows" 
          :columns="columns" 
          :language="'ko'"
        />
    </template>
    <script>
    import 'tui-grid/dist/tui-grid.css'
    import { Grid } from '@toast-ui/vue-grid';

    export default {
      name: 'myGrid',
      components: {
        'grid': Grid
      },
      created() {
        // ...
      }
    };
    </script>
    ```

    Example using `Object`:

    ```html
    <template>
      <grid 
        :data="gridProps.data" 
        :columns="gridProps.columns" 
        :language="gridProps.myLang"
      />
    </template>
    <script>
    import 'tui-grid/dist/tui-grid.css'
    import { Grid } from '@toast-ui/vue-grid';

    export default {
      name: 'myGrid',
      components: {
        'grid': Grid
      },
      created() {
        this.gridProps = {
          data: [
              // ... omit
          ],
          columns: [ 
              // ... omit
          ],
          myLang: {
            name: 'en-US',
            value: {
              display: {
                noData: 'No data.',
                loadingData: 'Loading data.',
                resizeHandleGuide: 'You can change the width of the column by mouse drag, ' +
                                    'and initialize the width by double-clicking.'
              },
              net: {
                confirmCreate: 'Are you sure you want to create {{count}} data?',
                confirmUpdate: 'Are you sure you want to update {{count}} data?',
                confirmDelete: 'Are you sure you want to delete {{count}} data?',
                confirmModify: 'Are you sure you want to modify {{count}} data?',
                noDataToCreate: 'No data to create.',
                noDataToUpdate: 'No data to update.',
                noDataToDelete: 'No data to delete.',
                noDataToModify: 'No data to modify.',
                failResponse: 'An error occurred while requesting data.\nPlease try again.'
              }
            }
          }
        }
      }
    };
    </script>
    ```

### Event

* click : Occurs when a mouse button is clicked on the Grid.
* check : Occurs when a checkbox in row header is checked.
* uncheck : Occurs when a checkbox in row header is unchecked.
* dblclick : Occurs when a mouse button is double clicked on the Grid.
* mouseover : Occurs when a mouse pointer is moved onto the Grid.
* mouseout : Occurs when a mouse pointer is moved off from the Grid.
* mousedown : Occurs when a mouse button is downed on the Grid.
* focusChange : Occurs when focused cell is about to change.
* expande : Occurs when the row having child rows is expanded.
* collapse : Occurs when the row having child rows is collapsed.
* beforeRequest : Occurs before the http request is sent.
* response : Occurs when the response is received from the server.
* successResponse : Occurs after the response event, if the result is true.
* failResponse : Occurs after the response event, if the result is false.
* errorResponse : Occurs after the response event, if the response is Error.
* selection : Occurs when selecting cells.

For more information such as the parameters of each event, see [event of tui.grid](https://nhn.github.io/tui.grid/latest/Grid).

Example :

```html
<template>
  <grid
    :data="gridProps.data"
    :columns="gridProps.columns"
    @click="onClick"
    @check="onCheck"
  />
</template>
<script>
import 'tui-grid/dist/tui-grid.css'
import { Grid } from '@toast-ui/vue-grid';

export default {
  name: 'myGrid',
  components: {
    'grid': Grid
  },
  created() {
    this.gridProps = {
      data: [
        // ... omit
      ],
      columns: [ 
        // ... omit
      ]
    }
  },
  methods: {
    onClick(evt) {
      // implement your code
    },
    onCheck(evt) {
      // implement your code
    }
  }
};
</script>
```

### Method

For use method, first you need to assign `ref` attribute of element like this:

```html
<grid ref="tuiGrid" :data="rows" :columns="columns"/>
```

After then you can use methods through `this.$refs`. We provide `getRootElement` and `invoke` methods.

* `getRootElement`

    You can get root element of grid using this method.

    ```js
    this.$refs.tuiGrid.getRootElement();
    ```

* `invoke`

    If you want to more manipulate the Grid, you can use `invoke` method to call the method of tui.grid. First argument of `invoke` is name of the method and second argument is parameters of the method. To find out what kind of methods are available, see [method of tui.grid](http://nhn.github.io/tui.grid/latest/Grid).

    ```js
    const info = this.$refs.tuiGrid.invoke('getFocusedCell');
    this.$refs.tuiGrid.invoke('setWidth', 500);
    ```
