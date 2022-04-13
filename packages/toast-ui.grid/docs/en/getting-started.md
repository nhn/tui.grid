# Getting Started 🚀

## The Project Setup

TOAST UI products can be used by using the package manager or downloading the source directly. However, we highly recommend using the package manager.

### Via Package Manager

You can conveniently install it using the commands provided by each package manager.
When using npm, be sure to use it in the environment [Node.js](https://nodejs.org/en/) is installed.

### npm

``` sh
$ npm install --save tui-grid # Latest version
```

### Via Contents Delivery Network (CDN)

TOAST UI products are available over the CDN powered by [NHN Cloud](https://www.toast.com).

You can use the CDN as below.

``` html
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
├─ v4.21.0/
│  ├─ ...
```

## Creating Your First Grid

### HTML

Add the container element where TOAST UI Grid will be created.

``` html
<div id="grid"></div>
```

### JavaScript

**TOAST UI Grid** can be used by creating an instance with the constructor function.
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
import Grid from 'tui-grid'; /* ES6 */
```

You can create an instance with options and call various APIs after creating an instance.

```javascript
import Grid from 'tui-grid';

const grid = new Grid({
  el: document.getElementById('wrapper'), // Container element
  columns: [ 
    // ...,
  ],
  // ...,
});
```

The Grid class receives an option object as a parameter, in which `el` and `columns` fields are required. The value of `el` should HTML element you want to use as a wrapper. And `column` is an array with column information such as the name, header, and editor. As this does not create an HTML element automatically, the wrapper element must exist in advance when creating the instance.

Another options are optional, and you can find more options in detail at the [API page](https://nhn.github.io/tui.grid/latest/).

## Defining Column Models

Before you add data to the Grid, you need to define column models which specify the schema of data. You can use `setColumns()` method to define them, like an example below.

```javascript
grid.setColumns([
  {
    header: 'ID',
    name: 'id'
  },
  {
    header: 'CITY',
    name: 'city',
    editor: 'text'
  },
  {
    header: 'COUNTRY',
    name: 'country'
  }
]);
```

The `setColumns()` method receives an array as a parameter, in which each element specifies a column definition. The `name` property is only required, and it's used as a key of row data. The string value defined as the `header` property is shown in the column header. It's optional, but it would be better to set it because the column header will be empty without this value.

You can specify the input type of the column using the `editor` property. The `text` type uses an `input[type=text]` element to present the value of the cell. More types like `select`, `checkbox` can be used as an `editor.type`. In addition, there are other options which can be used as a property of the `editor.options`. You can find the details about the `editor.options` at the [Cell Editor Interface issue](./custom-editor.md).

You can also define the column models with a `columns` option when creating the Grid instance.

```javascript
const grid = new Grid({
  el: document.getElementById('wrapper'),
  columns: [
    // ... same array as above example
  ],
  // ...,
});
```

## Setting data

Finally, you can set your data to the Grid using the `data` option or the `setData()` method.

```javascript
const data = [
  {
    id: '10012',
    city: 'Seoul',
    country: 'South Korea'
  },
  {
    id: '10013',
    city: 'Tokyo',
    country: 'Japan'    
  },
  {
    id: '10014',
    city: 'London',
    country: 'England'
  },
  {
    id: '10015',
    city: 'Ljubljana',
    country: 'Slovenia'
  },
  {
    id: '10016',
    city: 'Reykjavik',
    country: 'Iceland'
  }
];

// case 1 : using data option
const grid = new Grid({
  el: document.getElementById('wrapper'),
  data,
  ...
});

// case 2 : using resetData method
grid.resetData(data);
```

The `data` option or the `resetData()` method receives an array as a parameter, in which each element specifies a row data. The data is just a plain object. You can see that the properties of each row data matches the `name` properties of the column models, that is specified above.

Then you can see the table of your data on your screen.

![getting_started](https://user-images.githubusercontent.com/35371660/59482121-72993480-8ea2-11e9-8dba-46c04c727b31.png)

## Example

You can see the basic example [here](https://nhn.github.io/tui.grid/latest/tutorial-example01-basic).
