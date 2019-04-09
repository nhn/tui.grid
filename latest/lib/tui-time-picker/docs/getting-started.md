### 1. Load dependency files
* Script - [jQuery](https://github.com/jquery/jquery) 1.11.0 or later
* Script - [tui-code-snippet](https://github.com/nhnent/tui.code-snippet) 1.2.5 or later

```html
<html>
    <head>
        ....
        <link href="tui-time-picker.css" rel="stylesheet">
    </head>
    <body>
        ....
        <script type="text/javascript" src="jquery.min.js"></script>
        <script type="text/javascript" src="tui-code-snippet.min.js"></script>
        <script type="text/javascript" src="tui-time-picker.min.js"></script>
        ....
    </body>
</html>
```

### 2. Write a wrapper element

```html
<div id="timepicker-wrapper"></div>
```

### 3. Create instance

```js
var instance = new tui.TimePicker('#timepicker-wrapper', {
   // options
});
```

You can see the detail information at the [API & Examples](https://nhnent.github.io/tui.time-picker/latest)
