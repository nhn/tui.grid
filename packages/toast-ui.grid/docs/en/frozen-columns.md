# Frozen Columns ❄️

With TOAST UI Grid, you can use `frozenCount` option to fix columns in their places.

## Option 

* `frozenCount`: You can specify the number of columns to fix to the left by using the `columnOptions` option's `frozenCount`. The default value is set to 0, and it must be assigned an numerical value. 
* `frozenBorderWidth`: You can also specify the border width of a certain column by using the `columnOptions` option's `frozenBorderWidth`. The default value is 1, and it must be assigned a numerical value. The unit used is `px`. 

```js
import Grid from 'tui-grid';

const grid = new Grid({
  data,
  column,
  columnOptions: {
    frozenCount: 3, // Freeze 3 left most columns and 
    frozenBorderWidth: 2 // set the border width of frozen columns to be 2px.
  }
});
```

The code above will produce the grid below. 

![image](https://user-images.githubusercontent.com/35371660/60934748-628a3e80-a302-11e9-8c41-b9bad694747a.png)

## Changing the Border Color

Using the `applyTheme`, you can change the color of the border line. Also, if you assign a color to the `frozenBorder` option's `border` value, you can set the border lines to be any color you want.

```js
Grid.applyTheme('striped', {
  frozenBorder: {
    border: '#ff0000'
  }
});
```

The grid below is the result of running the code above.

![image](https://user-images.githubusercontent.com/35371660/60935380-a120f880-a304-11e9-9a37-6b5662430918.png)


## setFrozenColumnCount()

`setFrozenColumnCount` method can be used to change the number of fixed columns. 


```js
const grid = new Grid({
  // ...,
});

grid.setFrozenColumnCount(2); // The number of columns to fix
```

All options are available in the `Grid.columnOptions` portion of the [API Documentation](https://nhn/github.io/tui.grid/latest). 


## Example

More examples with frozen columns can be found [here](http://nhn.github.io/tui.grid/latest/tutorial-example16-frozen-columns).