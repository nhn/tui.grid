# Complex Columns 🔗

The TOAST UI Grid allows you to group columns under a parent column header. Using the `header.complexColumns` option, you can build a tree-like structure, where one or more columns can be grouped together by a parent header. The parent header can also be a child of another parent header.

The `header.complexColumns` option is an array, in which each element specifies a parent column. Similar to normal columns, the parent column has the `name` and the `title` properties. But you can specify child columns with the `childNames` property.

Let's see the example below.

```javascript
import Grid from 'tui-grid';

const grid = new Grid({
  el: document.getElementById('grid'),
  columns: [
    {
      header: 'col1',
      name: 'col1'
    },
    {
      header: 'col2',
      name: 'col2'
    },
    {
      header: 'col3',
      name: 'col3'    
    }
  ],
  header: {
    complexColumns: [
      {
        header: 'col1 + col2',
        name: 'parent1',
        childNames: ['col1', 'col2']            
      },
      {
        header: 'col1 + col2 + col3',
        name: 'parent2',
        childNames: ['parent1', 'col3']
      }
    ]
  }
});
```

Now, the `parent1` column is the parent of the `col1` and `col2`. And you can see that the `parent1` column is also a child of another column `parent2`, which contains `col3` also.

The result of the sample code looks like this:

![The result of the sample code](https://user-images.githubusercontent.com/18183560/59605689-49023680-914a-11e9-99f9-25bb26316b04.png)

## Example

You can see the example that is using more complex column headers [here](http://nhn.github.io/tui.grid/latest/tutorial-example02-complex-columns).
