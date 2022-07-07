# Data Source 🛰

Generally, the TOAST UI Grid operates with the local data in the Front End environment. However, with the help of a simple object, `dataSource`, TOAST UI Grid can be configured to host remote data as well. 

## Data Source Options

`dataSource` has the following properties.

- **initialRequest** `{boolean}` : Represents whether or not there has been a request to get the initial data
- **api** 
    - **readData** `{object}` : Represents the `url` and `method` needed to request to read data
    - **createData** `{object}` : Represents the `url` and `method` needed to request to add data
    - **updateData** `{object}` : Represents the `url` and `method` needed to request to update data
    - **deleteData** `{object}` : Represents the `url` and `method` needed to request to delete data
    - **modifyData** `{object}` : Represents the `url` and `method` needed to request to add, update, or remove data
- **hideLoadingBar** `{boolean}` : Represents whether or not to hide the loading bar
- **withCredentials** `{boolean}` : Configures the `withCredentials` option that will be applied during an ajax request
- **contentType** `{string}` : Configures the `content-type` that will be used as a standard during an ajax request
- **headers** `{object}` : Configures headers aside from the `content-type` that will be used during an ajax request
- **serializer** `{function}` : Can be used to customize parameter serialization during an ajax request
- **mimeType** `{string}` : Can be used to configure MIME type

More information regarding each property can be found below. 

## Read Data

### Option Configuration

The `api.readData` is an option that is required in order to read data from the `dataSource`, and it can be configured simply as shown below. 

```js
import Grid from 'tui-grid';

const dataSource = {
  api: {
    readData: { url: '/api/read', method: 'GET', initParams: { param: 'param' } }
  }
};

const grid = new Grid({
  // ...,
  data: dataSource
});
```

The `grid` instance refers to the configured `url` and the `method` during the instantiation or when the page is being navigated to request according to the specified option. If the `initialRequest` option is set to `false`, it just creates an instance without sending a request, so [readData](https://nhn.github.io/tui.grid/latest/Grid#readData) API can be used to directly get data in such cases. 

```js
const dataSource = {
  api: {
    readData: { url: '/api/read', method: 'GET', initParams: { param: 'param' } }
  },
  initialRequest: false // set to true by default
};

const grid = new Grid({
  // ...,
  data: dataSource
});

grid.readData(1);
```

If you wanted to configure additional initial request parameters during the declaration of api options, use the `initParams` property to add and request corresponding parameter to the `query string`. The `initParams` property is only valid within the `GET` api. 

```js
const dataSource = {
  api: {
    readData: { url: '/api/read', method: 'GET', initParams: { param: 'param' } }
  }
};

const grid = new Grid({
  // ...,
  data: dataSource
});
```

> **Note**
> `initParams` option can be used with `v4.9.0` and up. 

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
    - **contents** `{array}`: As an array of row data, it is the same as the `grid.resetData()` method's parameter. 
    - **pagination** `{object}`: with two properties
        - **page** `{number}`: The current page
        - **totalCount** `{number}`: The total number of rows. 

When an error occurs while processing the request, the `result` is set to `false`. 

```json
{
  "result": false,
  "message": "Error message from the server"
}
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
  // ...,
  data: dataSource
});
```

Then, you can use the `request()` method to send individual requests. 
(The example below is a basic use of the `request()` method, and more information is available in the [API documentation](https://nhn.github.io/tui.grid/latest/). 

```javascript
grid.request('createData'); // Uses the 'POST' method to send a request to '/api/createData'.
grid.request('updateData'); // Uses the 'PUT' method to send a request to '/api/updateData'.
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

## ajax options

TOAST UI Grid offers variety of different options for ajax communication with a remote server. The options are as follow. 

- **withCredentials** : It is an option used to send sensitive information like cookies and `Authorization` header together upon CORS request. It is set to `false` by default.
- **contentType** : Configures the `content-type` that will be used as a standard during an ajax request. The default value is `application/x-www-form-urlencoded` and can be set to `application/json` if so desired. 
- **headers** : Configures headers aside from the `content-type` that will be used during an ajax request.
- **serializer** : It can be used to customize parameter serialization during an ajax request. It can also be used to change the encoding or the serialization of a particular character. The basic serialization is as follows. 

  1. Array format
      - basic
        ```js
        // before serialization
        { a: [1, 2, 3] } 
        
        // after serialization
        a[]=1&a[]=2&a[]=3
        ```
      - nested
        ```js
        // before serialization
        { a: [1, 2, [3]] }

        // after serialization
        a[]=1&a[]=2&a[2][]=3
        ```
  2. Object format
      - basic
        ```js
        // before serialization
        { a: { b: 1, c: 2 } }

        // after serialization
        a[b]=1&a[c]=2
        ```

- **mimeType** : Can be configured to reassign the MIME type. 

The ajax option can be configured to be the common option by following the example below. 

```js
const dataSource = {
  api: {
    readData: { url: '/api/readData/', method: 'GET' },
    createData: { url: '/api/createData', method: 'POST' }
  },
  contentType: 'application/json',
  headers: { 'x-custom-header': 'custom-header' },
  serializer(params) {
    return Qs.stringify(params);
  }
}

const grid = new Grid({
  // ...,
  data: dataSource
});
```

It is possible to use different ajax options for different APIs, and this can be done by assigning options individually. Options configured individually have higher priority than common ajax options. 

```js
const dataSource = {
  api: {
    readData: { 
      url: '/api/readData/',
      method: 'GET',
      headers: { 'x-custom-header': 'custom-header' },
      // The serializer option below holds higher priority over the common serializer option. 
      serializer(params) {
        return Qs.stringify(params);
      }
    }
  },
  serializer(params) {
    return params
  }
}

const grid = new Grid({
  // ...,
  data: dataSource
});
```

> **Note**
> All ajax options except `withCredentials` can be used from `v4.9.0` and up.

## Pagination

Usually when sending a request to a remote server, `Pagination` is required. `Pagination` can be defined using the `pageOptions` like in the example below.

```javascript
const grid = new Grid({
  // ...,
  data: dataSource,
  pageOptions: {
    perPage: 10
  }
});
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

## RESTful URI

If you want to declare API's each `url` options in a RESTful manner, you can use the `url` option like in the example below.

```js
let shopId = '1000';

const dataSource = {
  api: {
    readData: { url: () => `/company/${shopId}/sales`, method: 'GET' },
    deleteData: { url: () => `/company/${shopId}/sales`, method: 'DELETE' }
  }
}
```

> **Note**
> RESTful URI configurations can be used from `v4.9.0` and up.

## hideLoadingBar Option
You can use the `hideLoadingBar` option to hide the basic loading bar. By default, it is set to `false`. 

```js
const grid = new Grid({
  // ...,
  data: {
    api: {
      readData: { url: '/api/readData/', method: 'get' }
    },
    hideLoadingBar: true
  }
});
```

> **Note**
> `hideLoadingBar` option can be used from `v4.9.0` and up.

## Example

More examples with using remote data can be found [here](https://nhn.github.io/tui.grid/latest/tutorial-example10-data-source).
