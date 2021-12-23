# Tree 🌳

TOAST UI Grid supports hierarchical data representation. By enabling the tree column settings, you can display a certain column of data in a tree structure. 

## Tree UI

When the tree column has been enabled, each cell that contains tree data is displayed in the UI like the following.

* Depth: Represents the parent-child relationship between rows. It must have a minimum depth of 1. 
* Expand / Collapse Button: This feature is enabled for parent rows with children. You can choose to make the children visible or hidden. 
* Icon: Lets the users know whether the parent row has children or not. 

![tree-column](https://user-images.githubusercontent.com/18183560/41633101-0bd39096-7478-11e8-814f-5acbd21ea7d5.png)

## Usage

### Configuring Tree Data

Like regular row data, tree data (`object`) are configured as arrays. If there are children rows, each child row's data is added to the parent row's `_children` attribute. Expand/Collapse button uses the `_attribute.expanded` attribute to initialize. The default value is `false` (collapsed) and when the value is set to `true`, the data are expanded. 

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
      // ...,
    ]
  },
  // ...,
];
```

### Initializing Tree Columns

The `treeColumnOptions` option is used to configure tree columns, and has three lower options: `name`, `useIcon`, and `useCascadingCheckbox`. The purpose of each lower option is as follows. 

| Option | Description |
| --- | --- |
| `name` | Configures the name of the column represented in tree structure. |
| `useIcon` | Determines whether to display the Icon or not. |
| `useCascadingCheckbox` | Determines whether to change the state of the checkbox or not while maintaining the parent-child relationship. |
| `indentWidth` | Determines the default width of the indentation width to be set for child nodes. |


The default value for `useIcon` is set to `true`, and the parent and the children row are represented in a folder iceon and in a file icon, respectively. 

The default value for `useCascadingCheckbox` is set to `true`, and if all children rows are selected, the corresponding parent row is selected as well, and vice versa. If it is set to `false`, each row can be checked individually. 

The default value of `indentWidth` is `22`. Child nodes have an indent width that is multiple the depth of the base width.

Aforementioned options can be configured using the Grid constructor option. 

```js
import Grid from 'tui-grid';

const options = {
  // ...,
  treeColumnOptions: {
    name: 'c1',
    useIcon: true,
    useCascadingCheckbox: true
  }
};

const grid = new Grid(options);
```

### Using the Tree API

When the tree column has been initialized, you can call the following tree related methods. 

| Method | Description |
| --- | --- |
| `expand` | Expands all children of a certain row. |
| `expandAll` | Expands all children of all rows. |
| `collapse` | Collapses all children of a certain row. |
| `collapseAll` | Collapses all children of all rows. |
| `getAncestorRows` | Returns all ancestor rows of a certain row. |
| `getDescendantRows` | Returns all descendant rows of a certain row. |
| `getParent` | Returns the parent row of a certain row. |
| `getChildRows` | Returns all children rows of a certain row. |
| `getDepth` | Returns the depth of a certain row. |


```js
const rowKey = 1;
grid.getAncestors(rowKey, true);
grid.expandAll();
```

Furthermore, custom events are provided, so that corresponding events are emitted when a parent row is expanded or collapsed. 

| Event | Description |
| --- | --- |
| `expand` | Emitted when a certain parent row has been expanded. | 
| `collapse` | Emitted when a certain parent row has been collapsed. |

```js
grid.on('expand', (ev) => {
  const {rowKey} = ev;
  const descendantRows = grid.getDescendantRows(rowKey);

  console.log('rowKey: ' + rowKey);
  console.log('descendantRows: ' + descendantRows);
});
```

### How Tree Columns Affect Other API

When tree columns have been initialized, certain API acts differently. 

| Name | Description |
| --- | --- |
| `appendRow` | Creates and pushes a child row under the current row.  |
| `prependRow` | Creates and prepends a child row under the current row. |
| `removeRow` | Removes all data of a certain row. (If there are children rows, children rows are removed as well.) |
| `check` | If `useCascadingCheckbox: true`, change the state of the checkbox while maintaining the parent-child relationship. |
| `uncheck` | If `useCascadingCheckbox: true`, change the state of the checkbox while maintaining the parent-child relationship. |

> **Note**
> If you are using tree columns, there are restrictions on using **sorting**, **row merging**, and **pagination.**

## Example

Examples of using tree columns can be found [here](https://nhn.github.io/tui.grid/latest/tutorial-example14-tree).