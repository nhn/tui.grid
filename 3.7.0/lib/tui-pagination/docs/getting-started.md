## Add dependency files

To use a pagination component, you must include CSS and JavaScript files.
These files can be downloaded from the `dist` folder in this repository.

#### CSS File

```html
<link rel="stylesheet" href="tui-pagination.css">
```

#### JS Files
```html
<script type="text/javascript" src="tui-code-snippet.js"></script>
<script type="text/javascript" src="tui-pagination.js"></script>
```

## Create a pagination component

### Step 1. Add a container element that the pagination component will be created.

```html
<div id="pagination" class="tui-pagination"></div>
```

### Step 2. Create instance.

Create an instance by passing the container element and option values as parameters.

* Create with the id selector of the container element
```js
var pagination = new tui.Pagination('pagination', options);
```

* Create with a container element

```js
var container = document.getElementById('pagination');
var pagination = new tui.Pagination(container, options);
```

* Create with options

```js
var options = {
  totalItems: 10,
  itemsPerPage: 10,
  visiblePages: 10,
  page: 1,
  centerAlign: false,
  firstItemClassName: 'tui-first-child',
  lastItemClassName: 'tui-last-child',
  template: {
      page: '<a href="#" class="tui-page-btn">{{page}}</a>',
      currentPage: '<strong class="tui-page-btn tui-is-selected">{{page}}</strong>',
      moveButton:
          '<a href="#" class="tui-page-btn tui-{{type}}">' +
              '<span class="tui-ico-{{type}}">{{type}}</span>' +
          '</a>',
      disabledMoveButton:
          '<span class="tui-page-btn tui-is-disabled tui-{{type}}">' +
              '<span class="tui-ico-{{type}}">{{type}}</span>' +
          '</span>',
      moreButton:
          '<a href="#" class="tui-page-btn tui-{{type}}-is-ellip">' +
              '<span class="tui-ico-ellip">...</span>' +
          '</a>'
   }
};

var pagination = new tui.Pagination('pagination', options);
```

Information about each option is as follows:

|Name|Type|Description|
|---|---|---|
|`totalItems`|`{number}`|Total number of items|
|`itemsPerPage`|`{number}`|Number of items to draw per page|
|`visiblePages`|`{number}`|Number of pages to display|
|`[page]`|`{number}`|Current page to display|
|`[centerAlign]`|`{boolean}`|Whether the page is moved to centered or not|
|`[firstItemClassName]`|`{string}`|The style class name of the first page button|
|`[lastItemClassName]`|`{string}`|The style class name of the last page button|
|`[template]`|`{string\|function}`|Template for page and move buttons|

## How to use template

You can customize the page or move buttons, and the detailed options for the elements that can be created with the template option (`template`) are as follows.

|Name|Type|
|---|---|
|`page`|Each page|
|`currentPage`|Current page|
|`moveButton`|Move buttons (first, previous, next, last)|
|`disabledMoveButton`|Disabled move buttons|
|`moreButton`|More pages buttons|

Template options are available in two ways.
The example below uses the template option to customize the more button.

### Using string template

```js
...
template: {
    ...
    moveButton:
        '<div class="custom-page-btn custom-{{type}}">' +
            '<span class="custom-ico-{{type}}"></span>' +
        '</div>'
    },
    ...
...
```

### Using a template function

```js
...
template: {
    ...
    moveButton: function(type) {
        var template = '';

        if (type === 'first') {
            template = '<div class="custom-page-btn">' +
                           '<span class="custom-ico"></span>' +
                       '</div>';
        }

        return template;
    },
    ...
...
```

The property information referenced by each template is as follows.
When using a template function, the property value is passed to the function parameter and can be referenced.

|Name|Property Name|Value|
|---|---|---|
|`page`|`page`|1, 2, 3...|
|`currentPage`|`page`|1|
|`moveButton`|`type`|first, prev, next, last|
|`disabledMoveButton`|`type`|first, prev, next, last|
|`moreButton`|`type`|prev, next|

## Custom events

There are two custom events available in the pagination component.

For each custom event, the `page` number is returned in the` eventData` object, and `false` in the` beforeMove` event is canceled. (The `afterMove` event also does not fired)


```js
pagination.on('beforeMove', function(evt) {
    var ePage = evt.page;
    var result = ajax.call({page: ePage});

    if(result) {
        pagination.movePageTo(ePage);
    } else {
        return false;
    }
});

pagination.on('afterMove', function(evt) {
    var ePage = evt.page;
    console.log(ePage);
});
```

For more information, see the [API](https://nhnent.github.io/tui.pagination/latest/).
