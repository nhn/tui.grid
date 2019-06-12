The TOAST UI Grid has a powerful event system which provides ways to extend custom functionality on top of the built-in features. 

## Attach/Detach event handlers

To attach a handler to a specific event, you can use the public method `on()`. The first argument is a name of target event, and the second argument is a handler to attach. 

```javascript
var grid = new tui.Grid({
// options…
});

grid.on('click', function() {
    console.log('clicked!!');
}).on('dblclick', function() {
    console.log('double clicked!!');
});
```

As the `on()` method returns its instance, you can call it with method chaining. 

To detach a handler from a specific event, you can use the public method `off()`. Like the `on()` method, the first argument is a name of target event. The second argument is handler attached, but it is optional. If you don't use the second argument, all handlers attached to the event is detached.

```javascript
grid.off('click');
// or
grid.off('click', onClickHandler);
```

## GridEvent
When an event occurs, an instance of the `GridEvent` class is passed to the handler attached to the event. It has useful information which can be used by event handler. For example, if the `click` event occurs, `rowKey` and `name` value is set to the `GridEvent` object so that user can figure out the address of the target cell.

```javascript
grid.on('click', function(ev) {
    if (ev.rowKey === 3 && ev.name === 'col1') {
      // do something
    }
});
```

The `GridEvent` class also has the `stop()` method which can be used to prevent default action of the event. For example, if you want to prevent for a specific row not to be selected, you can attach a handler to the `selectRow` event and call the `ev.stop()`.

```javascript
grid.on('selectRow', function(ev) {
    if (ev.rowKey === 3) {
      ev.stop();  
    }
});
```

The `GridEvent` class can have a `nativeEvent` property, this is the browser's native events like `click`, `mousedown` and so on.

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
- `focusChanged` : When a table cell is selected

There are other events which is used only when the `Net` addon is enabled.

- `beforeRequest` : Before the http request is sent
- `response` : When the response is received from the server
- `successResponse` : After the `response` event, if the `response.result` is `true`
- `failResponse` : After the `response` event, if the `response.result` is `false`
- `errorResponse` : After the `response` event, if the response is Error

You can see the detail information of these events at the [API page](http://nhnent.github.io/tui.grid/api).