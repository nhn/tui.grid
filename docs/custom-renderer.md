## Custom Renderer 🔩

The TOAST UI Grid provides the `Custom Renderer` in the `CellRenderer` format for users to customize the cell UI to meet their own requirements. It's more powerful than `formatter` option to control of cell rendering behavior.

The `CellRenderer` should be the constructor function like the `CellEditor`. The TOAST UI Grid will make instances of it using `new` keyword internally. We recommend using class keyword, but in case class keyword is not available, `function` and `prototype` can be used instead.

The `CellRenderer` format is as below. 
* `constructor`
  The constructor function is invoked when the cell element (`TD`) is mounted to the DOM. It's common to store the root element as a instance member, so that it can be used later in other methods such as getElement() and render(). It receives props object which contains useful information for customizing contents of the cell. The interface of the props object is same as `CellEditor` format. The format is like below.

  | property | type | return type |
  |--------|--------|--------|
  | `grid` | `Grid` | The `grid` property is an instance of TOAST UI Grid itself. This can be useful if you want to get specific data or manipulate the data manually. |
  | `rowKey` | `string \| number` | The `rowKey` of the row which contains the cell. |
  | `columnInfo` | `ColumnInfo` | The `columnInfo` property contains the all information of the column in which the target cell is contained. The inerface of the ColumnInfo is defined [here](https://github.com/nhn/tui.grid/blob/master/src/store/types.ts). |
  | `value` | `string \| number \| boolean` | The current `value` of the cell |

* `getElement`
   The `getElement` method should return the root DOM element of the cell contents. When the cell (`TD` element) is mounted, the returned element will be appended as a child elemement.
* `mounted`
  The `mounted` method is an `optional`, and can be used to initialize Input elements. This method is invoked immediately after the root element returned by getElement() is attached to the DOM.
* `render`
  The `render` method is used to sychronize the rendered contents and the value of the cell. This method is invoked whenever the value of the cell is changed.
* `focused`
  The `focused` method is an `optional`, and can be used to add some behavior when the focus is set on the cell. This method is invoked whenever the focus is changed and set on the cell.
* `beforeDestroy`
  The `beforeDestroy` method is an `optional`, and can be used to clean up input elements. This method is invoked immediately before the root element returned by getElement() is detached from the DOM.

Note that you can define your own `Custom Options` can be used in the constructor function using `props.columnInfo.renderer.options`.

The following is the source code of the simple slider renderer.

```javascript
class CustomSliderRenderer {
  constructor(props) {
    const el = document.createElement('input');
    // you can access the renderer custom options as below.
    const { min, max } = props.columnInfo.renderer.options;

    el.type = 'range';
    el.min = String(min);
    el.max = String(max);

    el.addEventListener('mousedown', (ev) => {
      ev.stopPropagation();
    });

    this.el = el;
    this.render(props);
  }

  getElement() {
    return this.el;
  }

  render(props) {
    this.el.value = String(props.value);
  }
}
```

To use your own `Custom Renderer`, just specify it with the `renderer.type` option of `columns`. If you need the `Custom Options` to be used in your `Custom Renderer`, set it to the `renderer.options`.

```javascript
const grid = new tui.Grid({
  // ... another options
  columns: [
    {
      header: 'Custom',
      name: 'custom',
      renderer: {
        type: CustomSliderRenderer,
        options: {
          min: 0,
          max: 30
        }
      }        
    }
    // ...
  ]
});
```

## Example

You can see the example which uses various input types [here](https://nhn.github.io/tui.grid/latest/tutorial-example04-custom-renderer).
