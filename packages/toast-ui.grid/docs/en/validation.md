# Validation ✔️

TOAST UI Grid provides a validation feature to test for validity of a cell's data. We can use the validation feature by invoking the `columns[].validation` option, and can perform validation tests in column units at a time. The lower rank options of the `columns[].validation` option is as follows. 

| Option Name | Type | Default Value |
| --- | --- | --- |
| `dataType` | `'string' \| 'number'` | `'string'` |
| `required` | `boolean` | `false` |

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'name',
      validation: {
        dataType: 'string',
        required: false
      }
    }
  ]
});
```

## `dataType` Option

We can use the `dataType` option to check whether the Grid's initial data or the cell data changed by the `setValue` method has the appropriate type. The available choices for the `dataType` option are `string` and `number`, and if the cell data does not match the designated type, the Grid displays that the cell is not valid by displaying a red background. 

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'name',
      validation: {
        dataType: 'string'
      }
    },
    {
      name: 'downloadCount',
      validation: {
        dataType: 'number'
      }
    }
  ]
});

grid.setValue(0, 'name', 10);
grid.setValue(1, 'downloadCount', 'foo');
```
![01-validation-dataType](https://user-images.githubusercontent.com/18183560/61283083-81ec0480-a7f7-11e9-9d57-07f729d6346b.png)

## `required` Option

If we set `required` option to `true`, we can determine whether the cell data has a value or not. Columns with `required` option configured are displayed with yellow background. If the required cells' values are set as empty, those cells are displayed in red. 

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'name',
      validation: {
        required: true
      }
    }
  ]
});

grid.setValue(3, 'artsit', '');
```
![02-validation-required](https://user-images.githubusercontent.com/18183560/61283084-81ec0480-a7f7-11e9-9e82-715f8da22ecd.png)

## `min`, `max` Options

If you set a numerical value to the `min` and `max` options, you can validate whether the cell data is within the designated range. If the cell data is *not* in range, smaller than the `min` value or larger than the `max` value, the data is displayed in red.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'price',
      validation: {
        min: 10000,
        max: 20000
      }
    }
  ]
});
```

![image](https://user-images.githubusercontent.com/35371660/63257029-dc272c00-c2b3-11e9-8e2e-fa878577cd15.png)

> **Note**
> The `min`, `max` options can be implemented in `v4.5.0` and above.

## `regExp` Option

You can validate whether the cell data adheres to the specified pattern by defining the regular expression in the `regExp` option. If the cell data *does not* adhere to the designated pattern, the data is displayed in red. 

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'name',
      validation: {
        regExp: /[a-zA-Z]+_[a-zA-Z]/
      }
    }
  ]
});
```

![image](https://user-images.githubusercontent.com/35371660/63257294-67082680-c2b4-11e9-8e76-6a5b80e10d2b.png)

> **Note**
> The `regExp` option can be implemented in `v4.5.0` and above.

## `validatorFn` Option

You can validate the cell data with respect to the result of the function defined in the `validatorFn` option with the data as its parameter. If the result of the function is *not* `truthy`, the data is displayed in red.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'price',
      validation: {
        validatorFn: value => value !== 10000
      }
    }
  ]
});
```


![image](https://user-images.githubusercontent.com/35371660/63257621-26f57380-c2b5-11e9-9237-ea927cfa014e.png)

> **Note**
> * The `validatorFn` option can be implemented in `v4.5.0` and above.
> * You can validate the cell data with other column data from the row in `v4.10.0` and above, because `row` and `columnName` are also passed as parameters.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'price',
      validation: {
        validatorFn: (value, row, columnName) => Number(value) + Number(row['anotherColumn']) > 10000
      }
    }
  ]
});
```

### Returns `meta` information
If the validation result(`valid` property) and meta information are returned as below to the result of the function defined in the `validatorFn` option, the meta information will be included in the result of `validate` API. In case it is inconvenient to handle validation result with the error code `VALIDATOR_FN`, this meta information can be useful to handle the error. 

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'price',
      validation: {
        validatorFn: (value, row, columnName) => {
          return { 
            valid: Number(value) + Number(row['anotherColumn']) > 10000,
            // The meta information will be included in the result of `validate` API
            meta: { customErrorCode: 'CUSTOM_ERROR_CODE' }
          };
        }
      }
    }
  ]
});
```

> **Note**
> Returning `meta` information can be implemented in `v4.14.0` and above.

## `unique` Option

If you set `unique` option to `true`, you can validate whether the cell data is unique in the column. If the cell data *is not unique* in the column, the data is displayed in red. 

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'price',
      validation: {
        unique: true
      }
    }
  ]
});
```

![image](https://user-images.githubusercontent.com/37766175/85833184-48c06080-b7cc-11ea-932c-b09c73b2e9dc.png)

> **Note**
> * The `unique` option can be implemented in `v4.14.0` and above. 
> * Although optimized the performance internally, there may be performance issue when using the `unique` option in large data.

## validate() Method

We can retrieve the column's validation information in row units by configuring the `validation` option and calling the `validate()` method. 

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'name',
      validation: {
        dataType: 'string'
      }
    },
    {
      name: 'downloadCount',
      validation: {
        dataType: 'number'
      }
    },
    {
      name: 'downloadCount',
      validation: {
        dataType: 'number',
        required: true
      }
    }
  ]
});

grid.validate();
```

![03-validation-validate](https://user-images.githubusercontent.com/18183560/61283085-81ec0480-a7f7-11e9-8ef2-d84aa1652649.png)

```js
// Result of calling validate()
[
  {
    rowKey: 0,
    errors: [
      {
        columnName: 'name',
        errorCode: ['TYPE_STRING']
      },
      {
        columnName: 'listenCount',
        errorCode: ['TYPE_NUMBER']
      }
    ]
  },
  {
    rowKey: 1,
    errors: [
      {
        columnName: 'downloadCount',
        errorCode: ['TYPE_NUMBER']
       }
    ]
  },
  {
    rowKey: 3,
    errors: [
      {
        columnName: 'listenCount',
        errorCode: ['REQUIRED']
      }
    ]
  }
]
```

### `errorInfo` property

The `errorInfo` property that allows users to get meta information is added as the result of `validate()` method. You can get the more detail error information such as regular expression used on validating the data or the meta information returned as the result of `validatorFn` function.(`errorCode` property **is deprecated**)

```js
// Result of calling validate()
[
  {
    rowKey: 1,
    errors: [
      {
        columnName: 'name',
        // `errorCode` property is deprecated
        errorCode: ['VALIDATOR_FN'],
        errorInfo: [{ code: "VALIDATOR_FN", customErrorCode: 'CUSTOM_ERROR_CODE' }]
      },
      {
        columnName: 'artist',
        // `errorCode` property is deprecated
        errorCode: ['REGEXP'],
        errorInfo: [{ code: "REGEXP", regExp: /[a-zA-Z]+_[a-zA-Z]/ }]
      }
    ]
  },
  {
    rowKey: 2,
    errors: [
      {
        columnName: 'price',
        // `errorCode` property is deprecated
        errorCode: ['MIN'],
        errorInfo: [{ code: "MIN", min: 1000 }]
      }
    ]
  }
]  
```

> **Note**
> The `errorInfo` property can be implemented in `v4.14.0` and above.

## Example

More examples with validation can be found [here](https://nhn.github.io/tui.grid/latest/tutorial-example20-validation).