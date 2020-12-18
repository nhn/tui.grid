# Custom Renderer 🔩

TOAST UI Grid enables users to customize the cell UI by providing Custom Renderer. The Custom Renderer can be much more useful than the `formatter` when it comes to rendering cells. 

We can apply the Custom Renderer based on the `CellRenderer` constructor function's interface. Internally, TOAST UI Grid uses the `CellRenderer` constructor function registered by the user to instantiate a new Custom Renderer, and adds the returned element to the DOM. While it is recommended to use the Custom Renderer with the `class` keyword, if unplausible, it can be used with `function` and `prototype` as well. 

The interface of a `CellRenderer` is as follows. (The structure of `CellRenderer` interface can be found at [types/renderer/index.d.ts](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/types/renderer/index.d.ts).)
* `constructor`
    The constructor function is called when the cell element (`<td>`) is added to the DOM. Generally, it serves the purpose of storing the root element as the instance member, and such members can be accessed using `getElement()` and `getValue()` methods. The object passed ino the constructor function as parameter is identical to that of `CellEditor` interface, and is as follows. 

| Property | Type | Return Type |
|--------|--------|--------|
| `grid` | `Grid` | References the `Grid` instance. It can be used effectively when getting or manipulating a particular piece of data of the Grid. | 
| `rowKey` | `string \| number` | The rowKey of the row that contains the current cell. |
| `columnInfo` | `ColumnInfo` | Contains all necessary information of the column that includes the target cell. The `ColumnInfo` interface is further defined [here](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/types/store/column.d.ts). |
| `value` | `string \| number \| boolean` | The cell's current value |

* `getElement`
    Returns the cell's root DOM element. The returned element is automatically inserted as a child when the cell (`<td>` element) is newly added.
* `mounted`
    This method is `optional`, and is used to initialize the input element. This method is called immediately after the root element returned from `getElement()` has been mounted to the DOM. 
* ` render`
    This method is used to synchronize the cell's value with newly rendered content. This method is called every time the value of the cell has been changed.
* `focused`
    This method is `optional`, and is used to add particular tasks while the cell has been focused on. This method is called every time the focus has been shifted onto a cell. 

The snippet below is an example of a Custom Renderer that renders Sliders.

```javascript
class CustomSliderRenderer {
  constructor(props) {
    const el = document.createElement('input');
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

As in the example above, the `Custom Renderer` can be configured using the `renderer.type` option from the information object provided by the `columns` array. If you require further user defined options for the `Custom Renderer`, you can make necessary adjustments to `renderer.options`. 

```javascript
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
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
    // ...,
  ]
});
```

Declared user defined options can be used in `Custom Renderer`'s constructor function. As in the example below, we can use the `props` object to access the options by following the `columnInfo.renderer.options.min` path.  

```js
class CustomTextECustomSliderRendererditor {
  constructor(props) {
    const el = document.createElement('input');
    // As you can see, we can access the renderer's custom option as such. 
    const { min, max } = props.columnInfo.renderer.options;
    // ...,
  }
  // ...,
}
```

## Default Renderer styling

The Custom Renderers are useful options, but are cumbersome to use when you want to add simple styles or attributes to the cell.
For these cases, TOAST UI Grid provides options for simple styling in the default renderer. If `styles`, `attributes`, and `classNames` are set as child objects of `renderer` option, the styles and attributes can be added through default renderer. The features of each option are as follows.

* `styles`
  Add styles of cell. This object has the CSS property name as the key and a function that returns the value of the CSS property or the value of the CSS property as the value. If the value is the function type, the value of the cell or column information can be accessed through the `props` parameter.
  ```js
  styles: {
    fontWeight: 'bold',
    color: (props) => props.value.length > 3 ? '#ccc' : '#222';
  },
  ```
* `attributes`
  Add attributes of cell. This object has the attribute name as the key and a function that returns the value of string type or the value of string type as the value. If the value is the function type, the value of the cell or column information can be accessed through the `props` parameter.
  ```js
  attributes: {
    'data-type': 'default'
    title: (props) => `title: ${props.formattedValue}`
  },
  ```
* `classNames`
  Add class of cell. The option is configured as string array type.
  ```js
  classNames: ['my-styled-cell'],
  ```

The configuration of the above options is as below.

```js
const columns = [
  {
    name: 'name',
    renderer: {
      styles: {
        fontWeight: 'bold',
        color: (props) => props.value.length > 3 ? '#ccc' : '#222';
      },
      attributes: {
        'data-type': 'default'
        title: (props) => `title: ${props.formattedValue}`
      },
      classNames: ['my-styled-cell'],
    },
  },
];
const grid = new Grid({
  // ...,
  columns
});
```

> **Note**
> The `styles`, `attributes`, `classNames` options can only be used with `v4.16.1` and above. 

## Example

More examples with Custom Renderer can be found [here](https://nhn.github.io/tui.grid/latest/tutorial-example04-custom-renderer).