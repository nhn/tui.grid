## Using `editOptions.type`

In the TOAST UI Grid, various input types can be used to present cell data. You can specify it with the `editOptions.type` option of `columns`.

```javascript
var grid = new tui.Grid({
    // ... another options
    columns: [
        {
            title: 'ID',
            name: 'id',
            editOptions: {
                type: 'text'    
            }  
        },
        {
            title: 'PASSWORD',
            name: 'password',
            editOptions: {
                type: 'text-password'
            }    
        }
    ]
});
```

Available types are in the following list:

- **normal** : Plain text (not editable)
- **text** : Text input (`input[type=text]`)
- **password** : Password input (`input[type=password]`)
- **checkbox** : Check box (`input[type=checkbox]`)
- **radio** : Radio button (`input[type=radio]`)
- **select** : Select box (`select`)


## Using `editOptions.listItems`

To use the `checkbox`, `radio`, and `select` types, you need to set list options using the `editOptions.listItems` option.

```javascript
columns: [
    {
        title: 'BROWSER',
        name: 'browser',
        editOptions: {
            type: 'checkbox',
            listItems: [
                {text: 'IE 9', value: 1},
                {text: 'IE 10', value: 2},
                {text: 'IE 11', value: 3},
                {text: 'Firefox', value: 4}
                {text: 'Chrome', value: 5}
            ]
        }        
    }
    // ...
]
```

The `editOptions.listItems` is an array, in which each element has the `text` and the `value` property. The `text` property will be shown as a label of the item, and the `value` property will be used as a value of the cell.


## Value of `checkbox` Type

Unlike other types, the `checkbox` type uses multiple values. When you check multiple checkboxes, the value of the cell will be the concatenated string of all checked values separated with comma. For example, if the model of the 'browser' column is like the sample above and the boxes of 'IE 9', 'Firefox' and 'Chrome' are checked, the value of the cell should be `'1,4,5'`.


## Example Page

You can see the example which uses various input types [here](https://nhnent.github.io/tui.grid/api/tutorial-example04-input-types.html).
