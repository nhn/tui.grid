# Summary ✍️

TOAST UI Grid provides a **summary** feature that enables users to be able to view summarized information of each column. Furthermore, the feature comes with other utility options so that users may make better use of the feature. 

## Summary Option

In order to use the summary feature, simply add the `summary` property to the `tui.Grid` instance constructor option.

```javascript
import Grid from 'tui-grid';

const grid = new Grid({
  el: document.getElementById('grid'),
  columns: [/* … */],
  summary: {
    position: 'bottom',
    height: 100,  // by pixel
    columnContent: {
      col1: {
        template() {
          return 'col1 footer';
        }
      },
      col2: {
        template() {
          return 'col2 footer';
        }
      }
    },
    defaultContent: {
      template() {
        return 'default footer';
      }
    }
  }
});
```

The `summary.position` determines where the summary will be positioned. The default value is `'bottom'`, and when the position is set to `'top'`, the summary will be located just under the header section.

The `summary.height` determines the height of the summary section in terms of pixels. If the property is set to `0`, the summary will not be visible. 

The `summary.columnContent` property is an object that is used to configure the content of each column. The object takes the name of the column as its key and the `template` function as the value. The `template` property returns an HTML string, and this string is used to render `<th>` tags in each column. 

The `summary.defaultContent` property is also an object that is used to configure other columns that have not already been configured by the `summary.columnContent` property. The `template` property is identical to the `template` property used in the `summary.columnContent`. 

## Using Auto Summary

If you designate an object to be a `columnContent` property of a certain column, the Grid automatically calculates the summary value of the column. To put it differently, every time a value in the column changes, the summary value is recalculated. Because the calculated summary value is passed on to be the argument for the `template` function, the HTML string can be created using these values. The `template` function for `defaultContent` property works identically. 

```javascript
const grid = new Grid({
  // ...,
  summary: {
    columnContent: {
      col1: {
        template(summary) {
          return 'sum: ' + summary.sum + '<br>avg: ' + summary.avg;
        }
      },
      col2: {
        template(summary) {
          return 'max: ' + summary.max + '<br>min: ' + summary.min;
        }
      }
    },
    defaultContent: {
      template(summary) {
        return 'default: ' + summary.sum;
      }
    }
  }
})
```

As you can see in the example above, the `template` function takes the `summary` object as an input, and the `summary` object consists of values like `sum` and `avg`. 

Here is a list of usable properties. 

- `sum`:  Sum
- `avg`:  Average Value
- `min`:  Minimum Value
- `max`: Maximum Value
- `cnt`: Number of Rows

Each time the value of the summary changes, the `template` function is called, and the embedded content affects the HTML string, the result of the `template` function. 

One important aspect to keep in mind is that all values in the column must be of `Number` type. The Grid deals with non-numerical values as a `0`. 

## Deactivating Auto Summary

The `useAutoSummary` is another property that can be specified in `columnContent` and `defaultContent`. The `useAutoSummary` determines the whether or not to use the auto summary feature, and the default value is set to `true`. 

If you were to use the `template` function without using auto summary feature, set the `useAutoSummary` to `false` like in the example below. 

```javascript
const grid = new Grid({
  // ...,
  summary: {
    columnContent: {
      col1: {
        useAutoSummary: false,
        template(summary) {
          return 'max: ' + summary.max + '<br>min: ' + summary.min;;
        }
      }
      // …
    },
    defaultContent: {
      useAutoSummary: false,
      template(summary) {
        return 'default: ' + summary.sum;
      }
    }
  }
});
```

If the HTML string is assigned as a property to the `columnContent` or `defaultContent`, the Grid internally deactivates the auto summary feature by configuring `useAutoSummary: false`, thereby preventing unnecessary calculations.

```javascript
const grid = new Grid({
  // ...,
  summary: {
    columnContent: {
      col1: 'col1 content'
    },
    defaultContent: 'static content'
  }
});
```

## setSummaryColumnContent()

The Grid instance provides an API in which to reconfigure the summary content. The `setSummaryColumnContent()` configures HTML string and the `template` function to the column's summary. 

```javascript
grid.setSummaryColumnContent('col1', 'content');

// If you were to configure the template function, observe the following code. 
grid.setSummaryColumnContent('col1', {
  template(summary) {
    return 'sum: ' + summary.sum + '<br>avg: ' + summary.avg;
  }
});
```

This method can be useful when dynamically configuring the summary column values. 

## Example

For more examples of Grid using the auto summary feature, check [here](https://nhn.github.io/tui.grid/latest/tutorial-example09-summary).