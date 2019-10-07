# Configuring Relations Among Columns 🤝

TOAST UI Grid uses the `relations` option to configure relations among different columns. The value of the `relations` option is an array that represents the inherent relationship the current column has with the target column.

In order to implement the relation among columns, use the `targetNames` property to specify the target columns list. Furthermore, you can use properties like `editable`, `disabled`, and `listItems` to define a situation in which the state of the target column can be changed, and each of these properties takes a callback function as its value. The columns listed in the `targetNames` are affected by the result of corresponding callback function every time the column's value is changed. 

Every callback function takes one object as its parameter, and listed are the properties that can be used within the parameter. 
- `value`: The value of current (to be changed) cell.
- `editable`: Whether the current (to be changed) cell can be edited or not.
- `disabled`: Whether the current (to be changed) cell has been disabled or not.
- `rowData`: An object with information of all values from the current cell's row.

## editable

The callback function, `editable`, determines whether the target column can be edited or not. Only when the cells are present in columns with the `editable` set to `true`, cells can be edited. 

```javascript
grid.setColumns([
  {
    header: 'col1',
    name: 'col1',
    relations: [
      {
        targetNames: ['col2', 'col3'],
        editable({ value }) {
          return value === '1';
        }
      }    
    ]        
  },
  {
    header: 'col2',
    name: 'col2'
  },
  {
    header: 'col3',
    name: 'col3'
  }
]);
```

In the example above, the column 'col1' has specified the `relations` option, and the target columns are 'col2' and 'col3'. If the value of one of the cells in 'col1' was changed to '1', cells in 'col2' and 'col3' and in the same row as the corresponding element can be edited.  

## disabled

The callback function `disabled` determines whether the target column has been disabled or not. If the callback function returns `true`, all of the cells in the target columns are disabled.

The `disabled` function is of the same form as the `editable` function. 

## listItems

The callback function `listItems` determines the options list of the target column, and can only be used for columns that have configured internal editor of list type (`checkbox`, `radio`, and `select`). The return value takes for the form of `editor.options.listItems`, and is an array of options list. Every time the value of the callback function changes, the target column's cell options list reflect the changes made by the callback function. In order to display cell's `label` instead of the value, you have to configure the internal formatter option, `listItemText`. 

```javascript
grid.setColumns([
  {
    header: 'col1',
    name: 'col1',
    formatter: 'listItemText',
    editor: {
      type: 'select',
      options: {
        listItems: []
      }
    },
    relations: [
      {
        targetNames: ['col2'],
        listItems({ value }) {
          let items;

          if (value === '1') {
            items = [{ text: 'opt1', value: '1' }, { text: 'opt2', value: '2' }];
          } else {
            items = [{ text: 'opt3', value: '3' }, { text: 'opt4', value: '4' }];
          }
          return items;
        }
      }
    ]
  },
  {
    header: 'col2',
    name: 'col2',
    formatter: 'listItemText',
    editor: {
      type: 'select',
      options: {
        listItems: []
      }
    }
  }
]);
```
As in the example above, the col1's values determine the col2's options list. If the value of one of the cells in col1 is changed to `1`, the options list in col2 and in the same row as the corresponding element is changed to `opt1` and `opt2`. In other cases, they are changed to `opt3` and  `opt4`. 

## Example

More examples dealing with `relations` can be found [here](https://nhn.github.io/tui.grid/latest/tutorial-example05-relation-columns).