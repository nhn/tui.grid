## Downloading Files

The recommended way to download the **TOAST UI Grid** as a package is through a package manager for the front-end like the [bower](http://bower.io) or the [npm](https://www.npmjs.com/).

If you've installed the *bower*, run this command in the directory of your project.

```
bower install tui-grid
```

Also, you can download it using the *npm* since version 2.3.0 or later. 

```
npm install tui-grid
```

This downloads all necessary files for the **TOAST UI Grid**, including all dependencies.

You can also download these files manually at the [dist directory](https://github.com/nhnent/tui.grid/tree/production/dist) or [releases page](https://github.com/nhnent/tui.grid/releases). But you have to download all dependencies below manually as well.

- [jquery](https://jquery.com/) >=1.11.0
- [underscore](http://underscorejs.org/) >=1.8.3
- [backbone](http://backbonejs.org/) >=1.3.3
- [tui-code-snippet](https://github.com/nhnent/tui.code-snippett) >=1.2.5
- [tui-pagination](https://github.com/nhnent/tui.pagination) >=3.0.0 *(Optional. Required if you use pagination)*
- [tui-date-picker](https://github.com/nhnent/tui.date-picker) >=3.0.0 *(Optional. Required if you use date-picker)*


## Including Files

Now you can include the script files to your html page. If you download files through the *bower*, they will be in the `bower_components` directory.

```html
<script src="bower_components/jquery/jquery.js"></script>
<script src="bower_components/underscore/underscore.js"></script>
<script src="bower_components/backbone/backbone.js"></script>
<script src="bower_components/tui-code-snippet/dist/tui-code-snippet.js"></script>
<script src="bower_components/tui-pagination/dist/tui-pagination.js"></script>
<script src="bower_components/tui-date-picker/dist/tui-date-picker.js"></script>
<script src="bower_components/tui-grid/dist/tui-grid.js"></script>
```

You need to include the CSS file as well.

```html
<link rel="stylesheet" type="text/css" href="bower_components/tui-grid/dist/tui-grid.css" />
```

Similarly, you can download and include files through the npm. In this case, the `bower_components` directory is replaced by `node_modules`.

```html
<script src="node_modules/tui-grid/dist/tui-grid.js"></script>
```

There is one more thing to do. The TOAST UI Grid uses two images to display a loading-indicator and icons, `ani_loading.gif` and `icons.gif` respectively. In the CSS file, paths of these images are specified with the relative path `../images/`. If you place the images in the different paths, you should find and replace all paths of the images in the CSS file to the correct paths.

## Creating an Instance

To use the **TOAST UI Grid** in your page, you should create an instance of `tui.Grid` like example below. 
This uses the Grid class as a namespace when you include the script files in your html page.

```javascript
var grid = new tui.Grid({
    el: $('#wrapper'), // only required. other options are optional
    data: [ ... ],
    virtualScrolling: true,
    editingEvent: 'click',
    ...
});
```

Beginning with version 2.3.0 or later, you can import the Grid class in the [CommonJS module format](https://webpack.js.org/api/module-methods/#commonjs).

```js
var Grid = require('tui-grid');
var grid = new Grid(...);
```

The Grid class receives an option object as a parameter, in which only `el` field is required. The value of `el` should be a jQuery object of the HTML element you want to use as a wrapper. As this does not create an HTML element automatically, the wrapper element must exist in advance when creating the instance.

Another options like `data`, `virtualScrolling`, `editingEvent` are optional, and you can find more options in detail at the [API page](https://nhnent.github.io/tui.grid/api).

## Defining Column Models

Before you add data to the Grid, you need to define column models which specify the schema of data. You can use `setColumns()` method to define them, like an example below.

```javascript
grid.setColumns([
    {
        title: 'ID',
        name: 'id'
    },
    {
        title: 'CITY',
        name: 'city',
        editOptions: {
            type: 'text'    
        }    
    },
    {
        title: 'COUNTRY',
        name: 'country',
        editOptions: {
            type: 'checkbox'    
        }
    }
]);
```

The `setColumns()` method receives an array as a parameter, in which each element specifies a column definition.
The `name` property is only required, and it's used as a key of row data. The string value defined as the `title` property is shown in the column header. It's optional, but it would be better to set it because the column header will be empty without this value.

You can specify the input type of the column using the `editOptions.type` property. If not specified, the type will be a `normal`, which is plain text that is not editable. The `text` type uses an `input[type=text]` element to present the value of the cell. More types like `select`, `checkbox` can be used as an `editOptions.type`. In addition, there are other options which can be used as a property of the `editOptions`. You can find the details about the `editOptions` at the [API page](https://nhnent.github.io/tui.grid/api).

You can also define the column models with a `columns` option when creating the Grid instance.

```javascript
var grid = new tui.Grid({
    el: $('#wrapper'),
    columns: [
        // ... same array as above example
    ],
    // another options ...
});
```

## Setting data

Finally, you can set your data to the Grid using the `data` option or the `setData()` method.

```javascript
var data = [
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
var grid = new tui.Grid({
    el: $('#wrapper'),
    data: data,
    ...
});

// case 2 : using setData method
grid.setData(data);
```

The `data` option or the `setData()` method receives an array as a parameter, in which each element specifies a row data. The data is just a plain object. You can see that the properties of each row data matches the `name` properties of the column models, that is specified above.

Then you can see the table of your data on your screen.

![First grid example](https://cloud.githubusercontent.com/assets/12269489/13629114/2d2469ee-e61a-11e5-9aaa-fdcce5d428c0.png)


## Example Page

You can see the basic example [here](https://nhnent.github.io/tui.grid/api/tutorial-example01-basic.html).