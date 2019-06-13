The TOAST UI Grid provides you an easy way to customize the style of the grid. With `applyTheme()` method, you can easily change entire styles of the grid. 

### Using Built-in Presets

There are three built-in presets in the TOAST UI Grid - **default**, **striped** and **clean**. To apply one of these presets, you only have to add one line of code to your source code:

```javascript
tui.Grid.applyTheme('default');
```

If you run the code above or don't apply any preset, the **default** preset will be applied. It looks like below.

![theme_default](https://user-images.githubusercontent.com/35371660/59335524-b3c10580-8d37-11e9-9ad6-a74e1f30896e.png)

Using the **striped** preset adds zebra-striping to the table.
```javascript
tui.Grid.applyTheme('striped');
```
The result will looks like this:

![theme_striped](https://user-images.githubusercontent.com/35371660/59335525-b3c10580-8d37-11e9-8d0a-4fc67c58cb6b.png)

If you want more clean and basic style, use the **clean** preset.
```javascript
tui.Grid.applyTheme('clean');
```
It has a very simple design like below.

![theme_clean](https://user-images.githubusercontent.com/35371660/59335522-b3c10580-8d37-11e9-83aa-a7cd6e9bbdc6.png)

### Customizing themes

If you want to apply your own styles to the grid, you can extend the preset theme with your own options. The `applyTheme()` method has a second parameter, which extends the existing theme options. For example, if you want to use **striped** preset with changing the background colors of head-cells and cells in even rows, you can use the code below.

```javascript
tui.Grid.applyTheme('striped', {
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
The result will looks like this:

![theme_custom](https://user-images.githubusercontent.com/35371660/59335763-321da780-8d38-11e9-89db-fbd0620ce9e2.png)

The following example extends the **default** preset with the custom options. The options are the same with the **clean** preset. You can see the result by comparing the **default** and the **clean** preset in the screenshots above.

```javascript
tui.Grid.applyTheme('default',
    grid: {
        border: '#e0e0e0'
    },
    toolbar: {
        border: '#e0e0e0'
    },
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

You can see all available options at the `tui.Grid.applyTheme()` section of the [API page](http://nhn.github.io/tui.grid/latest).


### Example page

You can apply preset themes and customize them with a sample grid [here](http://nhn.github.io/tui.grid/latest/tutorial-example07-applying-themes).
