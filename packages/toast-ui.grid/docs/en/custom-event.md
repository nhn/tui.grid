# Custom Event 🛎

The TOAST UI Grid has a powerful event system which provides ways to extend custom functionality on top of the built-in features. 

## Attach / Detach event handlers

To attach a handler to a specific event, you can use the public method `on()`. The first argument is a name of target event, and the second argument is a handler to attach. 

```javascript
import Grid from 'tui-grid';

const grid = new Grid({
  // options…
});

grid.on('click', function() {
  console.log('clicked!!');
})

grid.on('dblclick', function() {
  console.log('double clicked!!');
});
```

To detach a handler from a specific event, you can use the public method `off()`. Like the `on()` method, the first argument is a name of target event. The second argument is handler attached, but it is optional. If you don't use the second argument, all handlers attached to the event is detached.

```javascript
grid.off('click');
// or
grid.off('click', onClickHandler);
```

## Adding Event Handlers Using Option Configurations

You can also directly set up the event handlers using the Grid's options. Such event handlers cannot be added using the `on()` instance method, and does not need to be removed using the `off()`. The event handlers that can be added using the option configurations are `onBeforeChange()`, `onAfterChange()`, `onGridMounted()`, and `onGridBeforeDestroy()`, and respective configurations are further detailed in examples below.

```javascript
const grid = new Grid({
  // ...,
  columns: [
    {
      header: 'Name',
      name: 'name',
      onBeforeChange(ev) {
        console.log('Before change:' + ev);
      },
      onAfterChange(ev) {
        console.log('After change:' + ev);
      },
      editor: 'text',
    }
  ],
  onGridMounted(ev) {
    console.log('mounted' + ev);
  },
  onGridBeforeDestroy(ev) {
    console.log('before destroy' + ev);
  }
});
```

## GridEvent
When an event occurs, an instance of the `GridEvent` instance is passed to the handler attached to the event. It has useful information which can be used by event handler. For example, if the `click` event occurs, `rowKey`, `targetType` and `columnName` value is set to the `GridEvent` instance so that user can figure out the address of the target cell.

```javascript
grid.on('click', function(ev) {
  if (ev.rowKey === 3 && ev.columnName === 'col1') {
    // do something
  }
});
```

The `GridEvent` instance also has the `stop()` method which can be used to prevent default action of the event. For example, if you want to prevent for a specific row not to be selected, you can attach a handler to the `click` event and call the `ev.stop()`.

```javascript
grid.on('click', function(ev) {
  if (ev.rowKey === 3) {
    ev.stop();  
  }
});
```

The `GridEvent` instance can have a `nativeEvent` property, this is the browser's native events like `click`, `mousedown` and so on.

```javascript
grid.on('mousedown', function(ev) {
  console.log(ev.nativeEvent);
});
```

## Available events

- `click` : When a mouse button is clicked on a table cell
- `dblclick` : When a mouse button is double clicked on a table cell
- `mousedown` :  When a mouse button is pressed on a table cell
- `mouseover` : When a mouse pointer is moved onto a table cell
- `mouseout` : When a mouse pointer is moved off a table cell
- `focusChange` : When a table cell focus is selected
- `columnResize` : When the width of a column is resized
- `check`: When a row header checkbox is filled
- `uncheck`: When a row header checkbox is cleared
- `checkAll`: When a header checkbox is filled, all the checkboxes in the row headers are filled
- `uncheckAll`: When a header checkbox is cleared, all the checkboxes in the row headers are cleared
- `selection`: When the selection area of the table is changed
- `editingStart`: When the editing of cell is started
- `editingFinish`: When the editing of cell is finished
- `beforeSort` : Before the data is sorted
- `afterSort` : After the data is sorted
- `beforeUnsort` : Before the data is unsorted
- `afterUnsort` : After the data is unsorted
- `sort` : After the data is sorted (**this event will be deprecated**, use `afterSort` event)
- `beforeFilter` : Before the data is filtered
- `afterFilter` : After the data is filtered
- `beforeUnfilter` : Before the data is unfiltered
- `afterUnfilter` : After the data is unfiltered
- `filter` : After the data is filtered (**this event will be deprecated**, use `afterFilter` event)
- `beforePageMove` : Before moving the page
- `afterPageMove` : After moving the page
- `scrollEnd` : When scrolling at the bottommost
- `beforeChange`: Before one or more cells is changed
- `afterChange`: After one or more cells is changed
- `dragStart`: Drag to start the movement of the row (only occurs if the `dragable` option is enabled)
- `drag`: Dragging to move row (only occurs if the `dragable` option is enabled)
- `drop`: When the drag is over and the row movement is complete. (only occurs if the `dragable` option is enabled)
- `keydown`: When a key is pressed. (Does not occur during editing)

There are other events that can be used when using `DataSource`.

- `beforeRequest` : Before the http request is sent
- `response` : When the response is received from the server
- `successResponse` : After the `response` event, if the `response.result` is `true`
- `failResponse` : After the `response` event, if the `response.result` is `false`
- `errorResponse` : After the `response` event, if the response is Error

Also, the following events are available when the tree column is enabled.

- `expand` : When the expand / collapse button is changed to the expanded state by clicking or calling the `expand()` and `expandAll()` methods.
- `collapse` : When the expand / collapse button is changed to the collapsed state by clicking or calling the `collapse()` and `collapseAll()` methods.

The following events can be added using option configurations.

- `onBeforeChange`: Before the value of the cell is changed(**this event will be deprecated**, use `beforeChange` event)
- `onAfterChange`: After the value of the cell is changed(**this event will be deprecated**, use `afterChange` event)
- `onGridMounted`: When the Grid has successfully rendered onto the DOM
- `onGridUpdated`: When the Grid data has updated and the Grid has rendered onto the DOM
- `onGridBeforeDestroy`: Before the Grid is removed from the DOM

You can see the detail information of these events at the [API page](https://nhn.github.io/tui.grid/latest/Grid#event-beforeRequest).

## Example

You can see the example which uses custom event [here](https://nhn.github.io/tui.grid/latest/tutorial-example15-custom-event).
