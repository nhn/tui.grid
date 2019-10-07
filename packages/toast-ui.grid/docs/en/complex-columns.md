# Complex Columns 🔗

Columns in TOAST UI Grid can be grouped into the parents' column headers. Using the `header.complexColumns` option, you can form a tree stuctured parent header group with multiple columns. The parent header can also become a member of another parent header.

The `header.complexColumns` option uses the array of data objects used to define the parent columns. Like general columns, the parent column has `name` and `header` properties. Additionally, it taked a `childNames` option, and it can be used to configure a list of children to be placed under the parent column. 

```js
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

Now, the column `parent1` has become the parent column of `col1` and `col2`. Furthermore, `parent1`, along with `col3`, has become a child member of `parent2`. 

The following image is the result of a complex column. 

![그리드](https://user-images.githubusercontent.com/18183560/59605689-49023680-914a-11e9-99f9-25bb26316b04.png)


## Example

More examples with using complex columns can be found [here](https://nhn.github.io/tui.grid/latest/tutorial-example02-complex-columns).