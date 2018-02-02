The [TOAST UI DatePicker](https://github.com/nhnent/tui.date-picker) component can be easily integrated into the TOAST UI Grid. Just by adding some options to the `columns`, you can use a DatePicker in the Grid without extra coding.

*(This feature has been added from version 2.1.0)*

## Including Component Files

Before using the DatePicker, you need to include JS file into your page. If you downloaded the Grid through [Bower](http://bower.io), this file would be in the `bower_components` directory.

```html
<script src="bower_components/tui-date-picker/dist/tui-datepicker.js"></script>
```

You can also download this file manually. For more information, see
Github repository of the [DatePicker](https://github.com/nhnent/tui.date-picker).

## Adding options to the `columns `

To use a DatePicker, you need to add the `component` option to the `columns`. This is all you need to do, since the Grid internally creates a instance of `tui-date-picker`, and controls it in response to user control. The option looks like below.

```javascript
[
    {
        title: 'c1',
        columnName: 'c1',
        editOption: {
            type: 'text',
        },
        component: {
            name: 'datePicker',
            options: {
                format: 'yy/MM/dd',
                date: new Date(2017, 0, 1)
            }
        }
    },
    {
        title: 'c2',
        columnName: 'c2',
        editOption: {
            type: 'text'
        },
        component: {
            name: 'datePicker',
            options: {
                date: new Date(2014, 3, 10),
                selectableRanges: [
                    [new Date(2014, 3, 10), new Date(2014, 5, 20)]
                ]
            }
        }
    }
]
```

Notice that the value of the `editOptions.type` is `text`. The DatePicker component will be activated only for the `text` type column.

Let's see the each property of the `component` object.

### `component.name`

The `name` property indicates a name of the target component. You should set this value to `datePicker` for using a DatePicker component.

### `component.options`

Using the `options` property, you can set up options to be used to create a DatePicker instance. The available options are `date`, `format` and `selectableRanges`. For more information, see the [DatePicker API page](http://nhnent.github.io/tui.date-picker/latest).

*(Although there are much more options available for the DatePicker component, other options are restricted as they might cause some integration issues.)*

## Example Page

You can see the sample Grid using DatePicker component [here](https://nhnent.github.io/tui.grid/api/tutorial-example08-using-datepicker.html).
