# DatePicker 📅

The [TOAST UI DatePicker](https://github.com/nhn/tui.date-picker) component can be easily integrated into the TOAST UI Grid. Just by using [cell editor](./custom-editor.md) options to the `columns`, you can use a DatePicker in the Grid without extra coding.

## Styles

If you want to use the existing tui-date-picker or tui-time-picker style, add the css file before using it.

```js
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';
```

## Adding options to the `columns`

To use a DatePicker, you need to add the `editor` option to the `columns`. This is all you need to do, since the Grid internally creates a instance of `tui-date-picker`, and controls it in response to user control. The option looks like below.

You can easily use the default Datepicker by specifying `datePicker` to the `editor` property of columns.

```js
const columns = [
  {
    name: 'datepicker default',
    editor: 'datePicker'
  }
];
```

![default_datepicker](https://user-images.githubusercontent.com/35371660/59477678-37dad080-8e91-11e9-90d9-c99053ae83d9.gif)

Using the `options` property, you can set up options to be used to create a DatePicker instance. For more information, see the [DatePicker API page](https://nhn.github.io/tui.date-picker/4.1.0/DatePicker).

*(Although there are much more options available for the DatePicker component, other options are restricted as they might cause some integration issues.)*

```js
const columns = [
  {
    name: 'monthPicker',
    editor: {
      type: 'datePicker',
      options: {
        format: 'yyyy-MM',
        type: 'month'
      }
    }
  },
  {
    name: 'selectableRanges',
    editor: {
      type: 'datePicker',
      options: {
        format: 'yyyy/MM/dd',
        selectableRanges: [[new Date(1992, 2, 25), new Date(1992, 2, 29)]]
      }
    }
  },
  {
    name: 'timePickerWithTab',
    editor: {
      type: 'datePicker',
      options: {
        format: 'yyyy-MM-dd HH:mm A',
        timepicker: {
          layoutType: 'tab',
          inputType: 'spinbox'
        }
      }
    }
  }
]
```

The result will looks like this:

![options_datepicker](https://user-images.githubusercontent.com/35371660/59477679-37dad080-8e91-11e9-9156-1aab1e8aecd1.gif)

## Example

You can see the sample Grid using datePicker [here](https://nhn.github.io/tui.grid/latest/tutorial-example08-date-picker).
