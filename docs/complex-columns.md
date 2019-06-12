## Using the `header.complexColumns`

The TOAST UI Grid allows you to group columns under a parent column header. Using the `header.complexColumns` option, you can build a tree-like structure, where one or more columns can be grouped together by a parent header. The parent header can also be a child of another parent header.

The `header.complexColumns` option is an array, in which each element specifies a parent column. Similar to normal columns, the parent column has the `name` and the `title` properties. But you can specify child columns with the `childNames` property.

Let's see the example below.

```javascript
var grid = new tui.Grid({
    el: $('#wrapper'),
    columns: [
        {
            title: 'col1',
            name: 'col1',
        },
        {
            title: 'col2',
            name: 'col2',  
        },
        {
            title: 'col3',
            name: 'col3'    
        }
    ],
    header: {
        complexColumns: [
            {
                title: 'col1 + col2',
                name: 'parent1',
                childNames: ['col1', 'col2']            
            },
            {
                title: 'col1 + col2 + col3',
                name: 'parent2',
                childNames: ['parent1', 'col3']
            }
        ]
    }
});
```

Now, the `parent1` column is the parent of the `col1` and `col2`. And you can see that the `parent1` column is also a child of another column `parent2`, which contains `col3` also.

The result of the sample code looks like this:

![The result of the sample code](https://cloud.githubusercontent.com/assets/12269489/13692635/bcebcdd4-e786-11e5-8b18-437185c52745.png)

## Example Page

You can see the example that is using more complex column headers [here](https://nhnent.github.io/tui.grid/api/tutorial-example03-complex-columns.html).
