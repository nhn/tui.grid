## Using `Built-in Editor`


In the TOAST UI Grid, various built-in editor can be used to present cell data. You can specify it with the `editor` option of `columns`.

```javascript
const grid = new tui.Grid({
    // ... another options
    columns: [
        {
            header: 'ID',
            name: 'id',
            editor: 'text'
        },
        {
            header: 'PASSWORD',
            name: 'password',
            editor: 'password'
        }
    ]
});
```

Available types are in the following list:

- **text** : Text input (`input[type=text]`)
- **password** : Password input (`input[type=password]`)
- **checkbox** : Check box (`input[type=checkbox]`)
- **radio** : Radio button (`input[type=radio]`)
- **select** : Select box (`select`)


## Using `editor.options.listItems`

To use the `checkbox`, `radio`, and `select` types, you need to set list options using the `editor.options.listItems` option and the `listItemText` built-in formatter option.

```javascript
columns: [
    {
        header: 'BROWSER',
        name: 'browser',
        formatter: 'listItemText'
        editor: {
            type: 'checkbox',
            options: {
                listItems: [
                    { text: 'IE 9', value: 1 },
                    { text: 'IE 10', value: 2 },
                    { text: 'IE 11', value: 3 },
                    { text: 'Firefox', value: 4 }
                    { text: 'Chrome', value: 5 }
                ]
            }
        }        
    }
    // ...
]
```

The `editor.options.listItems` is an array, in which each element has the `text` and the `value` property. The `text` property will be shown as a label of the item, and the `value` property will be used as a value of the cell through the `listItemText` built-in formatter.

## Using `Custom Editor`


You can use any `Custom Editor` you want for presenting cell data more effectively in the `CellEditor` format TOAST UI Grid provides. The `CellEditor` should be the constructor function. The TOAST UI Grid will make instances of it using `new` keyword internally. We recommend using class keyword, but in case class keyword is not available, `function` and `prototype` can be used instead.

 
The `CellEditor` format is as below. 
* `constructor`
  The constructor function is invoked whenever editing is started. It's common to store the root element as an instance member, so that it can be used later in other methods such as getElement() and getValue(). It receives props object which contains useful information for customizing editing UI. The interface of the props object is like below.

  | property | type | return type |
  |--------|--------|--------|
  | `grid` | `Grid` | The `grid` property is an instance of TOAST UI Grid itself. This can be useful if you want to get specific data or manipulate the data manually. |
  | `rowKey` | `string | number` | The `rowKey` of the row contained cell. |
  | `columnInfo` | `ColumnInfo` | The `columnInfo` property contains the all information of the column in which the target cell is contained. The inerface of the ColumnInfo is defined [here](https://github.com/nhn/tui.grid/blob/master/src/store/types.ts). |
  | `value` | `string | number | boolean` | The current `value` of the cell |

* `getElement`
   The `getElement` method should return the root DOM element of the editor. When editing is started, the returned element will be appended to the editing layer DOM.
* `getValue`
  The `getValue` method should return the value of the cell. When editing is finished, the returned value will be used to set the cell value.
* `mounted`
  The `mounted` method is an `optional`, and can be used to initialize Input elements. This method is invoked immediately after the root element returned by getElement() is attached to the DOM.
* `beforeDestroy`
  The `beforeDestroy` method is an `optional`, and can be used to clean up input elements. This method is invoked immediately before the root element returned by getElement() is detached from the DOM.

The following is the source code of the simple text editor.

```javascript
class CustomTextEditor {
  constructor(props) {
    const el = document.createElement('input');

    el.type = 'text';
    el.value = String(props.value);

    this.el = el;
  }

  getElement() {
    return this.el;
  }

  getValue() {
    return this.el.value;
  }

  mounted() {
    this.el.select();
  }
}
```

To use your own `Custom Editor`, just specify it with the `editor.type` option of `columns`. If you need the `Custom Options` to be used in your `Custom Editor`, set it to the `editor.options`.

```javascript
const grid = new tui.Grid({
    // ... another options
    columns: [
        {
            header: 'Custom',
            name: 'custom',
            editor: {
                type: CustomTextEditor,
                options: {
                    customTextEditorOptions: {
                        // ...
                    }
                }
            }        
        }
        // ...
    ]
});
```
The `Custom Options` can be used in the constructor function using `props.columnInfo.editor.options` as below.
```javascript
class CustomTextEditor {
  constructor(props) {
    const customOptions = props.columnInfo.editor.options.customTextEditorOptions;
    // ...
  }
  // ...
}
```

## Value of `checkbox` Type

Unlike other types, the `checkbox` type uses multiple values. When you check multiple checkboxes, the value of the cell will be the concatenated string of all checked values separated with comma. For example, if the model of the 'browser' column is like the sample above and the boxes of 'IE 9', 'Firefox' and 'Chrome' are checked, the value of the cell should be `'1,4,5'`.


## Example Page

You can see the example which uses various input types [here](https://nhn.github.io/tui.grid/api/tutorial-example04-custom-editor.html).
