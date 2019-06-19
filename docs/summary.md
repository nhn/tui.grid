# Summary  ✍️

The TOAST UI Grid provides the **summary** which is usually used to represent the summaries of each column, the TOAST UI Grid also provides useful options for that purpose.

_* Caveat : 
The `summary` replaces the existing `footer` option and is the same as the `footer`. And since version 2.5.0, the `footer` and `setFooterColumnContent()` have been deprecated._

## Summary options

To enable the summary, you should add `summary` property to the option object which is used when creating an instance of `tui.Grid`.

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

The `summary.position` property sets the position of the summary. The default value is `'bottom'`. If this property is set to `'top'`, the summary is shown below the header. 

The `summary.height` property sets the height of the summary by pixel unit. If this property is set to `0`, the summary is not shown. 

The `summary.columnContent` property is the key-value object which configures the content of each column. Each key is a name of column, and each value is an obejct which contains a `template` function which returns the HTML string. The returning string from a `template` is used to render each column(&lt;th&gt; tag).

The `summary.defaultContent` property is also the key-value object which sets content of all columns except columns set by `summary.columnContent` property. The `template` property is same as `template` function property of `summary.columnContent`.

## Using Automatic Summary

If you set an object for a specific column to the `columnContent` property, the Grid automatically calculates the summary of that column. It means that whenever some values in the column are changed, the Grid re-calculate the summary. A result of summary is passed to a `template` function as a paramater so that you can use it for generating HTML string of the summary. In the case of `template` function of the `defaultContent` property, it works the same.

```javascript
const grid = new Grid({
  //...options
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

As you can see above, a `template` function takes a `summary` object as a parameter and it contains values like `sum`, `avg`, etc. The available types are listed below.

- `sum`: sum(total) value
- `avg`: average value
- `min`: minimum value
- `max`: maximum value
- `cnt`: count of the rows

Whenever a summary value is changed, a `template` function is called and a content of a column in the summary is refreshed using the returing HTML of a `template` function.

One important thing is that every value in the column must be a `Number` type. If a value is not a number type, the Grid treat it as a number `0`. 


## Disabling Automatic Summary

There is another property available for a value object of the `columnContent` and `defaultContent`. The name of the property is `useAutoSummary` and this determines whether using the automatic summary or not. As a default value of a `useAutoSummary` is `true`, if you want to use a `template` function without auto-summary, use should set this property to `false` like example below.

```javascript
const grid = new Grid({
  //...options
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

To return the static content as the result of `columnContent` of each column or `defaultContent`, sets the HTML string as their value. Then, the Grid sets `useAutoSummary:false` internally for preventing unnecessary calculation.

```javascript
const grid = new Grid({
  //...options
  summary: {
    columnContent: {
      col1: 'col1 content'
    },
    defaultContent: 'static content'
  }
});
```

## setSummaryColumnContent()

A Grid instance also has a public API to change a content of each column in the summary. `setSummaryColumnContent()` sets the HTML string or `template` function to the summary of the given column. 

```javascript
grid.setSummaryColumnContent('col1', 'content');

// or if you want to set template function, use as below.
grid.setSummaryColumnContent('col1', {
  template(summary) {
    return 'sum: ' + summary.sum + '<br>avg: ' + summary.avg;
  }
});
```

This method is useful when you want to set your own value to the column in the summary dynamically.

## Example

You can see a Grid using a summary with the auto-summary at the [example page](https://nhn.github.io/tui.grid/latest/tutorial-example09-summary).
