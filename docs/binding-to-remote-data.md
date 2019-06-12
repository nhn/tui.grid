## Net add-on

In general, the TOAST UI Grid runs on the front-end environment using local data. However, you can also bind remote data using  'Net' add-on. To use this, call the `use` method like the example below.

```javascript
grid.use('Net', {
    perPage: 100,
    api: {
        readData: 'api/readData'    
    }    
});
```

The `use` method receives an option object as a parameter, which has properties below:

- **perPage** `{number}` : Number of rows displayed in a page
- **api**
    - **readData** `{string}` : URL to which the request for fetching data is sent

There are also another properties available in this option, which you can find at the `module:addon/net` section of [the API page](http://nhnent.github.io/tui.grid/latest/).

This is all thing you need to fetch data from the remote server. Then the `grid` instance sends the request to the URL, parses the response data, and displays them on the screen. The `readData` is a required property for using `Net` add-on, that is used when an instance is initialized or when data needs to be refreshed whenever pages change.

## Protocol of `readData`

Let's take a look at the protocol of `readData`. When the Grid sends the request to the specified URL, it uses the `GET` method. Then, the parameter string will look like this:

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
    - **contents** `{array}` : An array of row data. Same value with the parameter of `grid.setData()` method.
    - **pagination**
        - **page** `{number}` : Current page number
        - **totalCount** `{number}` : Count of all rows

If an error occurred when processing the request, `result` should be `false` and the `message` should be added.

```json
{
    "result": false,
    "message": "Error message from the server"
}
```

## Saving Changed Data

If you want to save changed data to the remote server, you can use the following APIs:

- **createData** : To send newly added data only
- **updateData** : To send updated data only
- **deleteData** : To send deleted data only
- **modifyData** : To send all added/updated/deleted data

To use these APIs, you have to register the URL of each request in advance.

```javascript
grid.use('Net', {
    perPage: 100,
    api: {
        readData: '/api/readData',
        createData: '/api/createData',
        updateData: '/api/updateData',
        modifyData: '/api/modifyData',
        deleteData: '/api/deleteData'
    }
});
```

Then you can use the `request()` method to send each request like the example below.
(This is just a simplified example. See [the API page](http://nhnent.github.io/tui.grid/api) for more information.)

```javascript
var net = grid.getAddOn('Net');

net.request('createData'); // Send a request to '/api/createData'
net.request('updateData'); // Send a request to '/api/updateData'
```

If you call the `request()` method, the Net sends the request with a changed data. The data is a JSON string of an array which contains all data of changed rows. For example, if you change two rows in the data and then call `request('updateData')`, data string being sent will be like this:
```
updatedRows=[{"c1":"data1-1","c2":"data1-2,"rowKey":1},{"c1":"data2-1","c2":data2-2,"rowKey":2}]
```
(In the real case, the data will be URL-Encoded)

Another APIs use the same type of the data with a different parameter name. The `craeteDate` uses **createdRows**, and the `deleteData` uses **deletedRows** as a name of parameter. In the case of `modifyData`, names of the parameter includes **createdRows**, **updatedRows**, and **deletedRows**.

The response data from the remote server, which is also a JSON string, should be like this.

```json
{
    "result": true,
    "data": {}
}
```

The `data` property is optional. You can use it if you want to send data from the remote server as a result. If an error is occurred, the `result` property should be `false`, and the `message` property is required to pass an error message to the client.

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

## Download-Excel Buttons

There are 'Download-excel' and 'Download-excel-all' buttons at the control panel which is at the bottom of the Grid. These buttons don't work unless the corresponding API exists in the Net.

```javascript
grid.use('Net', {
    perPage: 100,
    api: {
        readData: '/api/readData',
        downloadExcel: '/api/download/excel', // To download page data as an excel file
        downloadExcelAll: '/api/download/excelAll' // To download all data as an excel file
    }
});
```

If you click a button, and if the server already implemented the feature, then the browser will start to download the data as an excel file. The request protocol is the same with the protocol of `readData`. However, in the case of `downloadExcelAll` API, the `page` and the `perPage` parameter will be excluded.

## Example Page

You can see the example that binding to remote data [here](https://nhnent.github.io/tui.grid/api/tutorial-example10-using-net.html).
