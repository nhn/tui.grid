## Data Source 🛰

In general, the TOAST UI Grid runs on the front-end environment using local data. However, you can also bind remote data using a plain object called `dataSource`. To use this, define the `dataSource` object and set it to the `data` option like the example below.

```javascript
const dataSource = {
  api: {
    readData: { url: '/api/read', method: 'GET' }
  }
};

const grid = new tui.Grid({
  // ... another options
  data: dataSource
});
```

The `dataSource` has properties below:

- **initialRequest** `{boolean}` : Whether to request `readData` after initialized
- **api**
    - **readData** `{object}` : `URL` and `method` to which the request for fetching data are sent

There are also another properties available in this option, which you can find at the `dataSource` section of [the API page](http://nhn.github.io/tui.grid/latest/).

This is all thing you need to fetch data from the remote server. Then the `grid` instance sends the request to the `URL` and `method`, parses the response data, and displays them on the screen. The `api.readData` is a required property in the `dataSource` option, that is used when an instance is initialized or when data needs to be refreshed whenever pages change.

## Protocol of `readData`

Let's take a look at the protocol of `readData`. When the Grid sends the request to the specified `URL` and `method`. Then, the parameter string would look like this:

```
page=1&perPage=10
```
- **page** `{number}` : Current page number
- **perPage** `{number}` : Number of rows displayed in a page

If you are using the *sort* feature, the sort options should be added to the parameter string like this:

```
page=1&perPage=10&sortColumn=XXX&sortAscending=true
```

- **sortColumn** `{string}` : The name of the column which determines the order of rows
- **sortAscending** `{boolean}` : `true` if ascending, `false` if descending

The response data should be a JSON string. If the request is processed successfully, the response data should be like this.

```json
{
  "result": true,
  "data": {
    "contents": [],
    "pagination": {
      "page": 1,
      "totalCount": 100
    }
  }
}
```

- **result** `{boolean}` : `true` if the request is processed successfully, `false` if not
- **data**
    - **contents** `{array}` : An array of row data. Same value with the parameter of `grid.resetData()` method.
    - **pagination**
        - **page** `{number}` : Current page number
        - **totalCount** `{number}` : Count of all rows

If an error occurred when processing the request, `result` should be `false`.

```json
{
  "result": false,
  "message": "Error message from the server"
}
```

## Pagination

When sends the request to the remote server, usually you need the `Pagination`. The `Pagination` can be defined as `pageOptions` option like below.

```javascript
const grid = new tui.Grid({
  // ... another options
  data: dataSource,
  pageOptions: {
    perPage: 10
  }
});
```

## Saving Changed Data

If you want to save changed data to the remote server, you can use the following APIs:

- **createData** : To send newly added data only
- **updateData** : To send updated data only
- **deleteData** : To send deleted data only
- **modifyData** : To send all added/updated/deleted data

To use these APIs, you have to register the `URL` and `method` of each request in advance.

```javascript
const dataSource = {
  api: {
    readData: { url: '/api/readData', method: 'GET' },
    createData: { url: '/api/createData', method: 'POST' },
    updateData: { url: '/api/updateData', method: 'PUT' },
    modifyData: { url: '/api/modifyData', method: 'PUT' },
    deleteData: { url: '/api/deleteData', method: 'DELETE' }
  }
};

const grid = new tui.Grid({
  // ... another options
  data: dataSource
});
```

Then you can use the `request()` method to send each request like the example below.
(This is just a simplified example. See [the API page](http://nhn.github.io/tui.grid/api) for more information.)

```javascript
grid.request('createData'); // Send a request to '/api/createData' as 'GET' method
grid.request('updateData'); // Send a request to '/api/updateData' as 'PUT' method
```

If you call the `request()` method, the `grid` instance sends the request with a changed data. The data is a JSON string of an array which contains all data of changed rows. For example, if you change two rows in the data and then call `request('updateData')`, data string being sent will be like this:
```
updatedRows=[{"c1":"data1-1","c2":"data1-2,"rowKey":1},{"c1":"data2-1","c2":data2-2,"rowKey":2}]
```
(In the real case, the data will be URL-Encoded)

Another APIs use the same type of the data with a different parameter name. The `craeteData` uses **createdRows**, and the `deleteData` uses **deletedRows** as a name of parameter. In the case of `modifyData`, names of the parameter includes **createdRows**, **updatedRows**, and **deletedRows**.

The response data from the remote server, which is also a JSON string, should be like this.

```json
{
  "result": true,
  "data": {}
}
```

The `data` property is optional. You can use it if you want to send data from the remote server as a result. If an error is occurred, the `result` property should be `false`.

```json
{
  "result": false,
  "message": "Error message from the server"
}
```

## Using Callback

You can register callback functions for each state of the process using the `on()` method of a grid instance. List of available events is below:

```javascript
grid.on('beforeRequest', function(data) {
  // before sending a request
}).on('response', function(data) {
  // when receiving response regardless of success/fail
}).on('successResponse', function(data) {
  // when the result is true
}).on('failResponse', function(data) {
  // when the result is false
}).on('errorResponse', function(data) {
  // when an error occurred
});
```

## Example

You can see the example that binding to remote data [here](https://nhn.github.io/tui.grid/latest/tutorial-example10-data-source).
