# Sort 🗂

TOAST UI Grid enables you to use options to sort through columns. The columns with sort option configured can be distinguished by the sort button that appears in the header area, and the column can be sorted using said button.

## Sorting a Single Column

When you press the column's *sort button* in Grid, the data in the corresponding column is sorted in the ascending/descending order. The options available for configuration are as presented below. 

```js
const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'alphabetA',
      header: 'alphabetA',
      sortable: true,
      sortingType: 'desc'
    },
    {
      name: 'alphabetB',
      header: 'alphabetB',
      sortable: true,
      sortingType: 'asc'
    }
  ]
});
```

As you can see in the example above, you can use the sort feature by setting the `sortable` option present in the `columns` array's information object to `true.` The `sortingType` option defines the default sorting order for the column. The `asc` and `desc` values can be used to sort the column in ascending and descending order, respectively. The default value is set to `asc.`

* `sortingType: 'asc'`

  ![image](https://user-images.githubusercontent.com/37766175/64319913-667fc780-cff8-11e9-81ab-4b5d25449816.gif)
  
* `sortingType: 'desc'`

  ![image](https://user-images.githubusercontent.com/37766175/64319941-6da6d580-cff8-11e9-9028-cfceb9386a79.gif)


## Sorting Multiple Columns

You can also sort data found in multiple column at once. In order to use the *multiple column sort* feature, you do not need to perform additional configurations. Rather, simply by clicking the column's sort button while holding down the `Cmd(Ctrl)` key, the data will be sorted in the order in which you pressed the button. 

```js
const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'alphabetA',
      header: 'alphabetA',
      sortable: true,
      sortingType: 'desc'
    },
    {
      name: 'alphabetB',
      header: 'alphabetB',
      sortable: true,
      sortingType: 'asc'
    }
  ]
});
```


![image](https://user-images.githubusercontent.com/37766175/64319568-abefc500-cff7-11e9-90c8-3a386dd7b7fa.gif)

If you click the sort button without holding down the `Cmd(Ctrl)` key, all of previously sorted columns will be cancelled, and only the most recently selected column will be sorted. 

![image](https://user-images.githubusercontent.com/37766175/64320470-954a6d80-cff9-11e9-977b-9cb1421b0a7c.gif)

> **Note**
> Multiple column sort feature can only be implemented in `v4.2.0` and above. 

## Syncing Data Source
If you decide to use the Grid's [Data Source](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/docs/en/data-source.md) to integrate remote data, you need to configure the `useClientSort` option in order to use the sort functionality, as presented below. 

```js
const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'alphabetA',
      header: 'alphabetA',
      sortable: true,
      sortingType: 'desc'
    },
    {
      name: 'alphabetB',
      header: 'alphabetB',
      sortable: true,
      sortingType: 'asc'
    }
  ],
  useClientSort: false
});
```

> **Note**
> Currently, data synced using the `Data Source` can only be sorted individually. While we plan on implementing the functionality of sorting multiple columns at once, at the moment, it is not yet supported. 


## Custom Comparator

If you want to sort the data with your own comparator, the `comparator` option can be useful for it. 
The structure of the Custom Comparator is same as [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) that runs in the javascript `sort` function, but there is a difference that row information to be sorted can also be used as parameters. It is possible to sort the data with other column data using these parameters.

```js
const comparator = (valueA, valueB, rowA, rowB) => {
  return (valueA.length + rowA.alphabetB.length) - (valueB.length + rowB.alphabetB.length);
};

const grid = new Grid({
  data,
  columns: [
    { name: 'alphabetA', header: 'alphabetA', comparator  },
    { name: 'alphabetB', header: 'alphabetB'  },
    // ...
  ]
})
```

> **Note**
> Custom Comparator feature can only be implemented in `v4.14.0` and above. 

## Using the Sort API

The sort related methods can be called as such. 

| Name | Description |
| --- | --- |
| `sort` | Executes a single column sort or a multiple column sort with respect to a selected column. |
| `unsort` | Undo the sort with respect to a selected column. |
| `getSortState` | Returns the information regarding the sorted data as an object. |


```js
grid.sort('columnName', true, true);
grid.unsort('columnName');

/* 
 * @example
 *   // Unsorted State
 *   {
 *     columns: [{ columnName: 'sortKey', ascending: true }],
 *     useClient: true
 *   } 
 * 
 *   // Data Sorted into Columns alphabetA and alphabetB
 *   {
 *     columns: [{ columnName: 'alphabetA', ascending: true }, { columnName: 'alphabetB', ascending: false }],
 *     useClient: true
 *   }
 */
grid.getSortState();

```

Furthermore the custom events provided by the API is triggered every time the data is sorted.

| Name | Description |
| --- | --- |
| `sort` | Occurs when the data is sorted. |

## Example

More examples with the sort functionality can be found [here](http://nhn.github.io/tui.grid/latest/tutorial-example19-sort).