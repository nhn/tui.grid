# Row Headers ✅

TOAST UI Grid uses the `rowHeaders` option to enable checkboxes or assign a row number to each row. 

## Option
### type

In rowHeaders, there are two types available: `rowNum` that displays the row number and the `checkbox` that enables users to be able to select a certain row.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  rowHeaders: ['rowNum', 'checkbox']
  // or rowHeaders: [{ type: 'rowNum' }, { type: 'checkbox' }]
});
```

The code above, when executed, displays the row numbers and checkboxes like the image below. 

![image](https://user-images.githubusercontent.com/35371660/60868741-9b75d500-a268-11e9-98f3-18a9293d32b4.png)

### width, align, valign
* `width`: Represents the width of the row header and has pixels (px) for units. If a value is not given, a default value will be applied. 
* `align`: Determines the horizontal align. Default value is `left` align, and it can take `left`, `right`, and `center` for its values.
* `valign`: Determines the vertical align. Default value is `middle` align, and it can take `top`, `middle`, and `bottom` for its values. 

```js
const grid = new Grid({
  // ...,
  rowHeaders: [
    { type: 'rowNum', width: 100, align: 'left', valign: 'bottom' },
    { type: 'checkbox' }
  ]
})
```

### Customizing Row Headers with header and renderer

* `header`: Used when customizing row headers to be put in headers. 

```js
const grid = new Grid({
  // ...,
  rowHeaders: [
    {
      type: 'checkbox',
      header: `
        <label for="all-checkbox" class="checkbox">
          <input type="checkbox" id="all-checkbox" class="hidden-input" name="_checked" />
          <span class="custom-input"></span>
        </label>
      `
    }
  ]
});
```

The code above is an example of customizing the row header using an HTML string. When executed, the result is displayed below. 

![image](https://user-images.githubusercontent.com/35371660/60875736-7340a300-a275-11e9-9cd6-9472c2763323.png)

* `renderer`: For its input, it takes a Custom Renderer constructor function. You can use it to customize the row header sections for each row. Furthermore, you can use it to implement the radio button, which has been discontinued in v4.0, using the renderer options. 

```js
// checkbox custom renderer
class CheckboxRenderer {
  constructor(props) {
    const { grid, rowKey } = props;

    const label = document.createElement('label');
    label.className = 'checkbox tui-grid-row-header-checkbox';
    label.setAttribute('for', String(rowKey));

    const hiddenInput = document.createElement('input');
    hiddenInput.className = 'hidden-input';
    hiddenInput.id = String(rowKey);

    const customInput = document.createElement('span');
    customInput.className = 'custom-input';

    label.appendChild(hiddenInput);
    label.appendChild(customInput);

    hiddenInput.type = 'checkbox';
    label.addEventListener('click', (ev) => {
      ev.preventDefault();

      if (ev.shiftKey) {
        grid[!hiddenInput.checked ? 'checkBetween' : 'uncheckBetween'](rowKey);
        return;
      }

      grid[!hiddenInput.checked ? 'check' : 'uncheck'](rowKey);
    });

    this.el = label;

    this.render(props);
  }

  getElement() {
    return this.el;
  }

  render(props) {
    const hiddenInput = this.el.querySelector('.hidden-input');
    const checked = Boolean(props.value);

    hiddenInput.checked = checked;
  }
}

const grid = new tui.Grid({
  el: document.getElementById('grid'),
  data,
  rowHeaders: [
    {
      type: 'checkbox',
      renderer: {
        type: CheckboxRenderer
      }
    }
  ]
});
```

The code above will result in the image below.

![image](https://user-images.githubusercontent.com/35371660/60876491-f6aec400-a276-11e9-8ff6-b2b30c5f6f4a.png)

For more detailed explanation on Custom Renderer, refer to the following [link](./custom-renderer). 

## Using Row Header's Checkbox
### check, uncheck Events

You can configure your row header to emit an event when the checkbox has been clicked/unclicked. 

```js
const grid = new Grid({
  data,
  rowHeaders: ['checkbox']
});

grid.on('check', (ev) => {
  alert(`check: ${ev.rowKey}`);
});

grid.on('uncheck', (ev) => {
  alert(`uncheck: ${ev.rowKey}`);
});
```

If you run the code above, you will be able to see that it emits an event like in the gif below. 

![check_uncheck](https://user-images.githubusercontent.com/35371660/60872188-3a053480-a26f-11e9-8af4-e5280bf45f69.gif)

### Using _attributes' checkDisabled Option

By setting the `_attributes` option's `checkDisabled` to `true`, you can disable the checkbox for certain rows.

```js
const data = [
  {
    name: 'Beautiful Lies',
    artist: 'Birdy',
    _attributes: {
      checkDisabled: true
    }
  },
  {
    name: 'X',
    artist: 'Ed Sheeran',
  }
  // ...,
];

const grid = new Grid({
  data,
  rowHeaders: ['checkbox']
});
```

By running the code above, you will be able to see that the checkbox has been disabled like in the image below. 

![image](https://user-images.githubusercontent.com/35371660/60870503-fbba4600-a26b-11e9-8a5d-39af045b40bf.png)

All options for rowHeaders can be found on the `Grid.rowHeader` section of the [API Documentation](https://nhn.github.io/tui.grid/latest). 

## Example

More examples with customizing row headers can be found [here](https://nhn.github.io/tui.grid/latest/tutorial-example11-row-headers).