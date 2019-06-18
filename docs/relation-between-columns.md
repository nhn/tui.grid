# Relations 🤝

TOAST UI Grid allows you to set relations between columns using the `relations` option of a column model. The value of the `relations` option is an array in which each element defines a unique relation between current column and the target columns.

A relation has a `targetNames` property to specify the list of target columns. It also has callback functions like `editable`, `disabled` and `listItems` to specify the rules to change the state of target columns. The columns whose names are in the `targetNames` will be affected by the result of the callback functions whenever a current column value is changed.

Every callback function receives one object parameter. The available properties of the parameter are listed below.
- `value`: a value of the current (changing) cell
- `editable`: an editable status of the current (changing) cell
- `disabled`: a disabled status of the current (changing) cell
- `rowData`: an object that contains the all values of the row, where the current cell is located

## editable

The `editable` callback function determines the `editable` state of the target columns. If it returns `true`, the cells in the target columns will be editable. Otherwise, the cells will not be editable.

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

In the example above, 'col1' column has a `relations` option, and the target columns are 'col2' and 'col3'. If the value of a cell in 'col1' is changed to '1', the cells in the same row that are under 'col2' or 'col3' will become not editable.


## disabled

The `disabled` callback function determines the `disabled` state of the target columns. If it returns `true`, the cells in the target column will be disabled. Otherwise, the cells will not be disabled.

The form of the callback function is the same with `editable`.

## listItems

The `listItems` callback function determines the option list of the target columns. It can be only used for list type columns like `checkbox`, `radio`, and `select`. It returns an array of list options, which has a same form as  `editor.options.listItems`. Whenever the returning value of the callback function is changed, the option list of the cells in the target columns will be changed to the returning value. And you need to configure the `listItemText` built-in formatter option for showing the `label` of it not value.

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
      targetNames: ['col2'],
      listItems({ value }) {
        let items;

        if (value === '1') {
          items = [
            { text: 'opt1', value: '1' }
            { text: 'opt2', value: '2' }    
          ];
        } else {
          items = [
            { text: 'opt3', value: '3' }
            { text: 'opt4', value: '4' }    
          ]    
        }
        return items;
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

In the example above, the value of the 'col1' column determines the option list of the 'col2'. If the value of a cell in the 'col1' is changed to '1', the option list of a cell in 'col2' in the same row will become 'opt1' and 'opt2'. Otherwise, it will become 'opt3' and 'opt4'.

## Example Page

You can see the sample Grid, which uses `relations` [here](https://nhn.github.io/tui.grid/latest/tutorial-example05-relation-columns).
