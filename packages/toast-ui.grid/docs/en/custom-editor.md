# Custom Editor 🛠

In order to effectively represent the cell data, we can make use of the Custom Editor based on the `CellEditor` constructor function interface. TOAST UI Grid internally instantiates a new Custom Editor by using the user-registered `CellEditor` constructor function, and then adds the returned element to the DOM. While it is recommended to use the `class` keyword to declare the Custom Editor, if situation does not allow it, it is permissible to use `function` or `prototype`. 

`CellEditor`'s interface is as follows. (Refer to [types/editor/index.d.ts](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/types/editor/index.d.ts) for the structure of `CellEditor`'s interface.)
* `constructor`
    The constructor function is called every time the cell is being edited. Generally, it saves the root element as the instance member, and such members can be accessed by `getElement()` and `getValue()` methods. As for the parameter of the constructor function, it is an object that encompasses useful information used to edit and customize the UI. 
    
    The object contains the following information. 
    
  | Property | Type | Return Type |
  |--------|--------|--------|
  | `grid` | `Grid` | References the `Grid` instance. It can be used effectively when getting or manipulating a particular piece of data of the Grid. |
  | `rowKey` | `string \| number` | The rowKey of the row that contains the current cell. |
  | `columnInfo` | `ColumnInfo` | Contains all necessary information of the column that includes the target cell. The `ColumnInfo` interface is further defined [here](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/types/store/column.d.ts). |
  | `value` | `string \| number \| boolean` | The cell's current value

* `getElement`
    Returns the Editor's root DOM element. Once it is being edited on, the returned element is inserted in the place of the target cell.
* `getValue`
    Returns the cell's value. Once the editing is finished, the returned value is used as cell's data. 
* `mounted`
    This method is `optional`, and is used to initialize the input element. This method is called immediately after the root element returned from `getElement()` has been mounted to the DOM. 
* `beforeDestroy`
    This method is `optional`, and is used to delete the input element. This method is called immediately before the root element returned from `getElement()` has been removed from the DOM.
    
The following is a simple example snippet using the CustomTextEditor.

```js
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

As the example above demonstrates, the user defined `Custom Editor` can be configured using the `editor.type` option of the information object provided from the `columns` array. If there further user defined options required for the `Custom Editor`, use the `editor.options` to do so. 

```js
const grid = new Grid({
  // ...,
  columns: [
    {
      header: 'Custom',
      name: 'custom',
      editor: {
        type: CustomTextEditor,
        options: {
          customTextEditorOptions: {
            // ...,
          }
        }
      }        
    }
    // ...,
  ]
});
```

The configured user defined options can be implemented using `Custom Editor`'s constructor function. As we can see in the example below, we can use the `props` object to access the options by following the `columnInfo.editor.options.customTextEditorOptions` path. 

```js
class CustomTextEditor {
  constructor(props) {
    const customOptions = props.columnInfo.editor.options.customTextEditorOptions;
    // ...,
  }
  // ...,
}
```

## Built-In Editor

There are numerous built-in editors ready to be used with TOAST UI Grid, and it can be used by declaring it in the `editor` option provided by the `column` array's information object. 

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
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

There are total of five different built-in editors.

- **text** : Text input (`input[type=text]`)
- **password** : Password input (`input[type=password]`)
- **checkbox** : Check box (`input[type=checkbox]`)
- **radio** : Radio button (`input[type=radio]`)
- **select** : Select box (`select`)

## Using editor.options.listItems

In order to use editors like `checkbox`, `radio`, and `select`, we need to configure the list options. The list option can be configured through `editor.options.listItems` and `formatter` option (for `listItemText` built-in formatter). 

```js
const columns = [
  {
    header: 'BROWSER',
    name: 'browser',
    formatter: 'listItemText',
    editor: {
      type: 'checkbox',
      options: {
        listItems: [
          { text: 'IE 9', value: 1 },
          { text: 'IE 10', value: 2 },
          { text: 'IE 11', value: 3 },
          { text: 'Firefox', value: 4 },
          { text: 'Chrome', value: 5 }
        ]
      }
    }        
  }
  // ...,
];

const grid = new Grid({
  // ...,
  columns  
});
```
`editor.options.listItems` is an array, and each element has `text` and `value` properties. If we were to configure `listItemText` built-in formatter, the `text` property and `value` property are used as cell's label and internal value, respectively.

## checkbox Type Value

Unlike other types, the `checkbox` supports multiple values. If more than one checkboxes are checked, the value of the cell is of a string with checked boxes separated with commas. For example, if the `browser` column is as shown in the snippet above, the cell value with `IE9`, `Firefox`, and `Chrome` selected will be `'1,4,5'`.

## Example

More examples with built-in editors and custom editors can be found [here](https://nhn.github.io/tui.grid/latest/tutorial-example03-custom-editor).