# Row Span 🖖

TOAST UI Grid provides a Row Span functionality that allows merging continual row data in column units. The merged cells are treated as a single cell, and operations including `focus` and `selection` operate as one cell instead of multiple cells. 

## Row Span UI

When the Row Span is applied, selected cells in the row are merged and represented as shown below. 

![row-span](https://user-images.githubusercontent.com/37766175/62029543-cdea7080-b21d-11e9-9411-5ed8e2a734b2.png)

## Option

Use the `_attributes.rowSpan` option to configure the target columns to span and the number of cells as key value pairs.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  data: [
    {
      name: 'Beautiful Lies',
      artist: 'Birdy'
    },
    {
      name: '19',
      artist: 'Adele',
      _attributes: {
        rowSpan: { // Merge rows
          artist: 3
        }
      }
    },
    {
      name: '21',
      artist: 'Adele'
    },
    {
      name: '25',
      artist: 'Adele'
    }
  ],
  columns: [
      {
        header: 'Name',
        name: 'name'
      },
      {
        header: 'Artist',
        name: 'artist'
      }
    ]
});
```

## API

There are some options in `appendRow` and `removeRow` API that only work properly when the row span has been applied. 

| API | Option | Explanation |
| --- | --- | --- |
| `appendRow`| `extendPrevRowSpan` | If the row immediately before (above) the newly appended row is at the bottom of the merged cell, the `extendPrevRowSpan` option determines whether or not to extend the merge range to the previous row. If the row is appended into the middle of the merged cells, the cell is merged regardless of this option's value.  |
| `removeRow`| `keepRowSpanData` | If the row that is at the top of the merged cells is deleted, `keepRowSpanData` determines whether or not to maintain the row span feature. If the row is deleted from the middle of the merged cells, the cell is deleted regardless of this option's value. |

## Example

More examples with Row Span can be found [here](http://nhn.github.io/tui.grid/latest/tutorial-example06-attributes).