# Infinite Scroll 📜

TOAST UI Grid offers infinite scroll feature so that it retrieves the following data automatically when the scroll has reached its end. The feature can be used in the following three ways: client infinite scroll, in synchronization with the [Data Source](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/docs/en/data-source.md), and to implement the `scrollEnd` custom event. The important thing to remember when using the infinite scroll feature is that an appropriate value for the `bodyHeight` must be set so that the scroll appears within the grid. The infinite scroll feature can be used with `v4.10.0` and up. 

## Client Infinite Scroll

When you use the client infinite scroll feature, the data within the Grid will automatically divide itself up into multiple sections and add the following data when the scroll reaches its end without having to connect to a backend. In order to use the client infinite scroll feature, you must set the `pageOptions.useClient` to `true` and `pageOptions.type` to `scroll`. Furthermore, the `pageOptions.perPage` can be used to specify the number of data at each infinite scroll. You can configure the feature as shown in the example below. 

```js
const grid = new Grid({
  // ...,
  bodyHeight: 300,
  pageOptions: {
    useClient: true,
    type: 'scroll',
    perPage: 50
  }
});
```

## Synchronization with the Data Source

Generally, the infinite scroll feature is used in tandem with the backend to utilize remote data. In such cases, the infinite scroll feature can be synchronized with the TOAST UI Grid's [Data Source](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/docs/en/data-source.md). The options can be configured simply as in the example below. 

```js
const grid = new Grid({
  // ...,
  data: {
    api: {
      readData: { url: '/api/readData', method: 'GET' }
    }
  },
  bodyHeight: 300,
  pageOptions: {
    type: 'scroll', 
    perPage: 50 
  }
});
```

### Sorting
If you were to use the Data Source synchronized infinite scroll feature with the sorting functionality, you do not need to set the `useClientSort` option to `false` like when using the pagination. When sorting while using the infinite scroll, only the visible data will be sorted instead of the entire data, so there is no need to communicate with the server. 

```js
const grid = new Grid({
  // ...,
  data: {
    api: {
      readData: { url: '/api/readData', method: 'GET' }
    }
  },
  bodyHeight: 300,
  pageOptions: {
    type: 'scroll', 
    perPage: 50 
  },
  // The following option is unnecessary. 
  // useClientSort: false
});
```

## Implementation Using the Custom Event `scrollEnd`

When it is difficult to use the infinite scroll feature with the data source synchronized, it is possible to use the custom event `scrollEnd` and [appendRows](https://nhn.github.io/tui.grid/latest/Grid#appendRows) API to implement the infinite scroll independently. 

```js
const grid = new Grid({ 
  data, 
  column,
  bodyHeight: 300
});

grid.on('scrollEnd', () => {
  axios.get('/api/readData', response => {
    grid.appendRows(response.data);
  });
})
```

> **Note**
> The infinite scroll feature can be used from `v4.10.0` and up. 

## Examples

More examples with the infinite scroll feature can be found [here](http://nhn.github.io/tui.grid/latest/tutorial-example26-infinite-scroll).