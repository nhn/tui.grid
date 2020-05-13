# Themes 👨‍🎨

TOAST UI Grid uses the `applyTheme()` method to set styles for the entire Grid and easily customize the Grid however the user sees fit. 

### Using Built-In Presets

TOAST UI Grid has three built in presets: **default**, **striped**, and **clean.** All of this can be achieved by typing in one simple line of code!

```js
import Grid from 'tui-grid';

Grid.applyTheme('default');
```

If the snippet above is not present in your code, the **default** preset will be applied. 

The **default** theme looks something like this. 

![theme_default](https://user-images.githubusercontent.com/35371660/59335524-b3c10580-8d37-11e9-9ad6-a74e1f30896e.png)

The **striped** preset will add stripes to your table. 

```js
Grid.applyTheme('striped');
```

Below is an example of a Grid with **striped** theme.

![theme_striped](https://user-images.githubusercontent.com/35371660/59335525-b3c10580-8d37-11e9-8d0a-4fc67c58cb6b.png)

If you are searching for simpler and more basic look, use the **clean** preset.

```js
Grid.applyTheme('clean');
```

The Grid below is the result of using the **clean** theme. 

![theme_clean](https://user-images.githubusercontent.com/35371660/59335522-b3c10580-8d37-11e9-83aa-a7cd6e9bbdc6.png)

### Customizing Themes

If you have a unique style that you want to implement, you can customize additional options to extend the preset themes. 

The second argument of the `applyTheme()` method is an object with extensible options for the theme. For example, if you were to implement a **striped** preset with different colors for the header area and even numbered rows, you can do so with the following. 

```js
Grid.applyTheme('striped', {
  cell: {
    header: {
      background: '#eef'
    },
    evenRow: {
      background: '#fee'
    }
  }
});
```

Once your run your code, your Grid should look something like the image below. 

![theme_custom](https://user-images.githubusercontent.com/35371660/59335763-321da780-8d38-11e9-89db-fbd0620ce9e2.png)

The following is an example of a customized **default** preset, and configurable options can be applied to both **default** as well as to **clean.** 

With the code below, you can compare for yourself how the **default** and **clean** presets have changed. 

```js
Grid.applyTheme('default', {
  cell: {
    normal: {
      background: '#fff',
      border: '#e0e0e0',
      showVerticalBorder: false,
      showHorizontalBorder: true
    },
    header: {
      background: '#fff',
      border: '#e0e0e0'
    },
    selectedHeader: {
      background: '#e0e0e0'
    }
  }
});
```

All options are documented in greater detail in [API Documentation](http://nhn.github.io/tui.grid/latest) under section `Grid.applyTheme()`.

## Example

[Here](http://nhn.github.io/tui.grid/latest/tutorial-example07-themes) is a sandbox where you can try different preset themes and customizable options on an example Grid.