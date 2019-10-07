# Data Source 🛰

Generally, the TOAST UI Grid operates with the local data in the Front End environment. However, with the help of a simple object, `dataSource`, TOAST UI Grid can be configured to host remote data as well. 

In order to do so, define the `dataSource` object as shown in the example below and configure the `data` option. 

```javascript
import Grid from 'tui-grid';

const dataSource = {
  api: {
    readData: { url: '/api/read', method: 'GET' }
  }
};

const grid = new Grid({
  // ... another options
  data: dataSource
});
```

`dataSource` has the following properties. 

- **initialRequest** `{boolean}` : Represents whether the `readData` API has been requested in order to get the initial data.
- **api**
    - **readData** `{object}`: Represents the `URL` and the `method` required to get data. 

Other properties for this option are further detailed in the `dataSource` portion of the [API Documentation]. 

This is all you need in order to bring in data from a remote server. Now, the `grid` instance sends requests through `URL` and `method` and analyzes the response data to display on the screen. `api.readData` is a mandatory property for the `dataSource` option, and is used when the page has to be reloaded due to changes or when the instance has been reset.

## Protocol Used in `readData`

Let's discuss the protocols used in `readData`. The following is the string parameter used when the Grid sends requests through the `URL` and `method`. 

```
page=1&perPage=10
```

- **page** `{number}`: The current page
- **perPage** `{number}`: The number of rows represented per each page. 

If you are using the *sort* feature, you have to explicitly mention the sorting option in the string parameter. 

```
page=1&perPage=10&sortColumn=XXX&sortAscending=true
```

- **sortColumn** `{string}`: The name of the column that determines the order of rows. 
- **sortAscending** `{boolean}`: If it is set to `true`, it will sort in the ascending order, and when set to false, it will sort in descending order. 

The response data must be in JSON string format. When the request has been succeessfully made, you should get a response that resembles the following.


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

- **result** `{boolean}`: It will return `true` when the request has been successfully made, and `false` otherwise. 
- **data**
    - **content** `{array}`: As an array of row data, it is the same as the `grid.resetData()` method's parameter. 
        - **page** `{number}`: The current page
        - **totalCount** `{number}`: The total number of rows. 

When an error occurs while processing the request, the `result` is set to `false`. 

```json
{
  "result": false,
  "message": "Error message from the server"
}
```

## Pagination

Usually when sending a request to a remote server, `Pagination` is required. `Pagination` can be defined using the `pageOptions` like in the example below.

```javascript
const grid = new Grid({
  // ... another options
  data: dataSource,
  pageOptions: {
    perPage: 10
  }
});
```

## Storing Modified Data

When you need to store modified data on a remote server, you can use the following API. 

- **createData**: Used when only sending newly added data
- **updateData**: Used when only sending updated data
- **deleteData**: Used when only sending deleted data
- **modifyData**: Used when sending all data including newly added, updated, and deleted data  

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

const grid = new Grid({
  // ... another options
  data: dataSource
});
```

Then, you can use the `request()` method to send individual requests. 
(The example below is a basic use of the `request()` method, and more information is available in the [API documentation](https://nhn.github.io/tui.grid/latest/). 

```javascript
grid.request('createData'); // Uses the 'GET' method to send a request to '/api/createData'.
grid.request('updateData'); // Uses the 'POST' method to send a request to '/api/updateData'.
```

When the `request()` method is called, the `grid` instance sends a request using the modified data, and the data is composed of a JSON string of arrays that contain all data from the modified rows. For example, the data string transmitted by calling `request('updateData')` after having changed two rows is as follows. 

```
updatedRows=[{"c1":"data1-1","c2":"data1-2,"rowKey":1},{"c1":"data2-1","c2":data2-2,"rowKey":2}]
```

(In the real work environment, data is encoded.)

Other API uses the identical data format with different names for its parameters. The `createData` uses **createRows**; `deleteData` uses **deletedRows**; and `modifyData` uses **createdRows**, **updatedRows**,  and **deletedRows** as its parameter names. 

Furthemore, the response from the remote server is also of JSON string format.

```json
{
  "result": true,
  "data": {}
}
```

The `data` property is optional. If there exists a necessary piece of data in the remote server, it can be retrieved using the `data` property. If an error occurs during the process, the `result` is set to `false`. 

```json
{
  "result": false,
  "message": "Error message from the server"
}
```


## Using Callbacks

You can use the Grid instance's `on()` method to register different callback functions for different states of the process. The following is a list of possible events. 

```javascript
grid.on('beforeRequest', function(data) {
  // Before sending the request
}).on('response', function(data) {
  // When a response has been received regardless of success.
}).on('successResponse', function(data) {
  // When the result is set to true
}).on('failResponse', function(data) {
  // When the result is set to false
}).on('errorResponse', function(data) {
  // When an error occurs
});
```

## Example

More examples with using remote data can be found [here](https://nhn.github.io/tui.grid/latest/tutorial-example10-data-source).