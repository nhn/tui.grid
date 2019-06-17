# Tree 🌳

The TOAST UI Grid provides the function to represent hierarchical data. When a tree column is set, the data on a specific column is displayed in the tree form.

## Tree UI

When a tree column is activated, each cell with tree data is represented by the following UI:

* Depth : Represents a hierarchical relationship between parent and child rows. The minimum depth starts with `1`.
* Expanded/collapsed button : It is created on the parent row that has a child row, and child rows are visible or hidden.
* Icon : You can use a status icon that shows whether a parent row has child rows.

![tree-column](https://user-images.githubusercontent.com/18183560/41633101-0bd39096-7478-11e8-814f-5acbd21ea7d5.png)

## How to Use

### Set Tree Data

Initialize the tree data(`object`) in an array like the common row data. If there are child rows, add the row data for each child row in the `_children` property of the parent row data. To initialize the expanded/closed button, use the `_attribute.expanded` property. The default value is `false` (collpased state). If set to `true`, the button is shown as expanded state.

```js
const data = [
  {
    c1: 'foo',
    c2: 'bar',
    _attributes: {
      expanded: true // default: false
    },
    _children: [
      {
        c1: 'baz',
        c2: 'qux'
      },
      // ...
    ]
  },
  // ...
];
```

### Activate Tree Column

The `treeColumnOptions` option is used to set the tree column, and there are three sub-options `name`, `useIcon` and `useCascadingCheckbox`. The function of each option is as follows.

| Option | Description |
| --- | --- |
| `name` | Sets column name to display tree data |
| `useIcon` | Sets whether to use the icon |
| `useCascadingCheckbox` | Sets whether to change state of the checkbox with keeping parent-child relationship |

The default value of `useIcon` the option is true, the parent row displays the folder icon and the child row displays the file icon.

The default value of the useCascadingCheckbox option is `true`. When all child rows are selected, the parent row is selected. When the parent row is selected, all children are selected. If set to `false`, you can check individual rows.

You can add options on the grid instance option.

```js
import Grid from 'tui-grid';

const options = {
  // ...
  treeColumnOptions: {
    name: 'c1',
    useIcon: true,
    useCascadingCheckbox: true
  }
};

const grid = new Grid(options);
```

### Using Tree APIs

When a tree column is activated, you can call the following tree related methods:

| Name | Description |
| --- | --- |
| `expand` | Expands the child rows of a particular row |
| `expandAll` | Expands all child rows |
| `collapse` | Collapses the child rows of a particular row |
| `collapseAll` | Collapses all child rows |
| `getAncestorRows` | Returns all ancestor rows of the particular row |
| `getDescendantRows` | Returns all descendant rows of the particular row |
| `getParent` | Returns the parent row of the particular row |
| `getChildRows` | Returns the child rows of the particular row |
| `getDepth` | Returns the depth value of the particular row |

```js
const rowKey = 1;
grid.getAncestors(rowKey, true);
grid.expandAll();
```
It also provides custom events and occurs when the parent row is expanded or collapsed.

| Name | Description |
| --- | --- |
| `expand` | Occurs when the particular parent row is expanded |
| `collapsed` | Occurs when the particular parent row is collapsed |

```js
grid.on('expand', (ev) => {
  const {rowKey} = ev;
  const descendantRows = grid.getDescendantRows(rowKey);

  console.log('rowKey: ' + rowKey);
  console.log('ededescendantRows: ' + descendantRows);
});
```

### Behavior Changed APIs

The behavior of some API is changing when a tree column is activated.

| Name | Description |
| --- | --- |
| `appendRow` | Creates child rows below current row  |
| `prependRow` | Creates child rows below current row |
| `removeRow` | If there are child rows, deletes them together |
| `check` | If sets `useCascadingCheckbox: true`, changes state of the checkbox with keeping the parent-child relationship |
| `uncheck` | If sets `useCascadingCheckbox: true`, changes state of the checkbox width keeping the parent-child relationship |

### Notice

When using a tree column, there are restrictions on the use of **sorting**, **row merging**, **pagination**.

## Example Page

You can see the sample Grid, which uses tree column [here](https://nhn.github.io/tui.grid/latest/tutorial-example15-tree).