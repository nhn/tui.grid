# Clipboard 📎

## Copy to clipboard
Press keys `Cmd(Ctrl)` + `c` while focus or selection is on the grid. The copy operation will copy selected ranges or the currently focused cell. The grid use `\t`(tab) as the deliminator, copy and paste are easily compatible with Excel.

![clipboard_copy](https://user-images.githubusercontent.com/35371660/59558283-8cb14f00-9029-11e9-85f4-7bcaff5edaf4.gif)

### copyOptions 
CopyOptions can be specified by grid option or by column. You can modify which values are copied through copyOptions.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  copyOptions: {
    useFormattedValue: true,
    useListItemText: true,
    customValue: 'custom'
  }
});

// or

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'type',
      editor: 'text',
      copyOptions: {
        useFormattedValue: true,
        useListItem,
        customValue: (value, rowAttrs, column) => `Column name is ${column.name}`
      }
    }
  ]
})
```

| property | type | action | 
| --- | --- | --- |
| customValue | `string` / `function` | Copy string value or changed values through function |
| useListItemText | `boolean` | Copy select or checkbox cell values to `text` rather than` value` of listItem |
| useFormattedValue | `boolean` | Copy text with `formatter` in cell  |

If multiple copy options are used, It has the following this order.
1. customValue
2. useListItemText
3. useFormattedValue
4. original data

### Example of using customValue

```js
const columns = [
  {
    name: 'release',
    copyOptions: {
      customValue: (value, rowAttrs, column) => `Column name is ${column.name}`
    }
  },
  // ...,
];
const grid = new Grid({
  el: document.getElementById('wrapper'),
  columns,
  // ...,
});
```

![paste_custom](https://user-images.githubusercontent.com/35371660/59573554-8a64f880-90ee-11e9-9f7d-e4cdf950e553.gif)

### copyToClipboard()
You can use the `copyToClipboard()` method to copy the selected of focused area. As well as the key event, the copy operation can be also used by calling the API. When you want to copy rather than the key event, you can use the `copyToClipboard()` method.

```js
const grid = new Grid ({ ... });
grid.copyToClipboard();
```

## Paste from clipboard
Press keys `Cmd(Ctrl)` + `v` while focus or selection is on the grid. The value is changed only when using the Cell Editor.

![clipboard_paste](https://user-images.githubusercontent.com/35371660/59558284-8d49e580-9029-11e9-9598-824595da75d4.gif)

## Example

You can see the example that clipboard [here](https://nhn.github.io/tui.grid/latest/tutorial-example01-basic).
