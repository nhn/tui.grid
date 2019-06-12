The TOAST UI Grid provides you an easy way to customize the style of the grid. With `applyTheme()` method, you can easily change entire styles of the grid. 

### Using Built-in Presets

There are three built-in presets in the TOAST UI Grid - **default**, **striped** and **clean**. To apply one of these presets, you only have to add one line of code to your source code:

```javascript
tui.Grid.applyTheme('default');
```

If you run the code above or don't apply any preset, the **default** preset will be applied. It looks like below.

![screen shot 2016-05-03 at 5 17 22 pm](https://cloud.githubusercontent.com/assets/12269489/14979546/0a71f726-115e-11e6-8c27-36b0e4d3a706.png)

Using the **striped** preset adds zebra-striping to the table.
```javascript
tui.Grid.applyTheme('striped');
```
The result will looks like this:

![screen shot 2016-05-03 at 5 18 03 pm](https://cloud.githubusercontent.com/assets/12269489/14979547/0bb33ea6-115e-11e6-9107-148826fc6291.png)

If you want more clean and basic style, use the **clean** preset.
```javascript
tui.Grid.applyTheme('clean');
```
It has a very simple design like below.

![screen shot 2016-05-03 at 5 18 52 pm](https://cloud.githubusercontent.com/assets/12269489/14979553/118cdcc4-115e-11e6-89ec-01111587a8d5.png)

### Customizing themes

If you want to apply your own styles to the grid, you can extend the preset theme with your own options. The `applyTheme()` method has a second parameter, which extends the existing theme options. For example, if you want to use **striped** preset with changing the background colors of head-cells and cells in even rows, you can use the code below.

```javascript
tui.Grid.applyTheme('striped', {
    cell: {
        head: {
            background: '#eef'
        },
        evenRow: {
            background: '#fee'
        }
    }
});
```
The result will looks like this:

![screen shot 2016-05-03 at 6 13 19 pm](https://cloud.githubusercontent.com/assets/12269489/14979733/29b829a6-115f-11e6-820d-aa973be07577.png)

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
        head: {
            background: '#fff',
            border: '#e0e0e0'
        },
        selectedHead: {
            background: '#e0e0e0'
        }
    }
});
```

You can see all available options at the `tui.Grid.applyTheme()` section of the [API page](http://nhnent.github.io/tui.grid/api).


### Example page

You can apply preset themes and customize them with a sample grid [here](http://nhnent.github.io/tui.grid/api/tutorial-example07-applying-themes.html).
