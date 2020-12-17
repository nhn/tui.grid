# Pagination 📖

TOAST UI Grid offers a pagination feature that allows users to view data in terms of pages. However, it is worth mentioning that the pagination feature has [tui-pagination](https://github.com/nhn/tui.pagination) as its dependency, so the bundle file is provided with the [tui-pagination](https://github.com/nhn/tui.pagination) file included. If you are using CDN to access the Grid, be sure to include the `tui-pagination` dependencies. 

```js
<script type="text/javascript" src="https://uicdn.toast.com/tui.pagination/v3.4.0/tui-pagination.js"></script>
```

## Style

In order to apply the style found in tui-pagination directly, import the appropriate css file. 

```js
import 'tui-pagination/dist/tui-pagination.css';
```

## Syncing Data Source

It is a common practice to use remote data with backend communications and the pagination feature. In such case, the TOAST UI Grid's [Data Source](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/docs/en/data-source.md) can be synced with the pagination feature for convenience. The option configuration is as follows. 

```js
const grid = new Grid({
  // ...,
  pageOptions: { perPage: 10 }
});
```

As you can see in the example above, in order to sync remote data operations, just define how many rows to show in one page with the `pageOptions.perPage` and adapt the request and response parameters with Data Source. You can view related information [here](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/docs/en/data-source.md) for more information.

## Client Pagination 

TOAST UI Grid provides a Client Pagination feature that enables the users to view the data within the Grid page-by-page without having to connect to a backend. In order to use the Client Pagination feature, be sure to set the `pageOptions.useClient` to be `true`. The configuration is as follows. 

```js
const grid = new Grid({
  // ...,
  pageOptions: {
    useClient: true,
    perPage: 10
  }
});
```
> **Note**
> The Client Pagiantion feature can only be used with `v4.5.0` and above. 

## API Comparison

Certain APIs perform differently when it is applied to Client Paginations than when it is applied to Data Source synced paginations. 

| API | Client Pagination | Data Source Synced Pagination |
| --- | --- | --- |
| `appendRow` | Appends a new row at the bottom with respect to all of data instead of at the the bottom of the current page. | Appends a new row at the end of the current page. |
| `prependRow` | Inserts a new row at the beginning of all of data instead of at the beginning of the current page. | Inserts a new row at the beginning of the current page. |
| `removeRow` | Removes the specified row with respect to all of data, instead of the current page. | Removes the specified row with respect to the current page. |

## Using the Pagination API

The pagination methods can be called as such. 

| Name | Description |
| --- | --- |
| `getPagination` | Returns an instance of `tui-pagination` that is being used within the Grid. <br>(*If the pagination feature is not being used, returns `null`*) | 
| `setPerPage` | Reconfigures the number of data sets to be displayed in one page. |

```js
const pagination = grid.getPagination();
const currentPage = pagination.getCurrentPage();
console.log(currentPage);

grid.setPerPage(10);
```

## Example

More examples with Client Pagination can be found [here](http://nhn.github.io/tui.grid/latest/tutorial-example23-client-pagination), and those regarding Data Source synced pagination can be found [here](https://nhn.github.io/tui.grid/latest/tutorial-example10-data-source).
