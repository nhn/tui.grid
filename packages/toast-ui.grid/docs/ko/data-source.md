# 데이터 소스 🛰

일반적으로 TOAST UI Grid는 로컬 데이터를 이용한 프론트 엔드 환경에서 작동한다. 하지만 `dataSource`라고 하는 간단한 객체를 쓰면 원격 데이터도 이용할 수 있다. 이를 위해 아래의 예시처럼 `dataSource` 객체를 정의하고 `data` 옵션을 설정한다.

## 데이터 소스 옵션

`dataSource`에는 다음과 같은 속성들이 있다.

- **initialRequest** `{boolean}` : 초기 데이터 조회를 위한 `readData` API 요청 여부
- **api**
    - **readData** `{object}` : 데이터 조회 요청을 위한 `url`과 `method`를 나타낸다.
    - **createData** `{object}` : 데이터 추가 요청을 위한 `url`과 `method`를 나타낸다.
    - **updateData** `{object}` : 데이터 수정 요청을 위한 `url`과 `method`를 나타낸다.
    - **deleteData** `{object}` : 데이터 삭제 요청을 위한 `url`과 `method`를 나타낸다.
    - **modifyData** `{object}` : 데이터 추가, 수정, 삭제 요청을 위한 `url`과 `method`를 나타낸다.
- **hideLoadingBar** `{boolean}` : 로딩바 숨김 여부를 설정한다.
- **withCredentials** `{boolean}` : ajax 요청 시 적용될 `withCredentials` 옵션을 설정한다.    
- **contentType** `{string}` : ajax 요청 시 공통으로 사용할 `content-type` header를 설정한다.
- **headers** `{object}` : ajax 요청 시 `content-type` 외에 공통으로 사용할 header를 설정한다.
- **serializer** `{function}` : ajax 요청 시 파라미터의 직렬화를 커스터마이징 하고 싶은 경우 사용한다.
- **mimeType** `{string}` : MIME type을 지정하고 싶은 경우 설정한다.

각 속성의 자세한 내용은 아래에서 볼 수 있다.

## 데이터 조회

### 옵션 설정

`dataSource`에서 데이터 조회를 위한 `api.readData` 옵션은 필수 옵션이며 아래처럼 간단하게 설정할 수 있다.

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
`grid` 인스턴스는 설정한 `url`과 `method`를 보고 인스턴트 생성 시 또는 페이지를 이동하는 경우 해당 옵션을 보고 데이터 조회 요청을 한다. 만약 `initialRequest` 옵션이 `false` 라면 인스턴스만 생성하고 요청은 보내지 않으므로, 이런 경우는 [readData](https://nhn.github.io/tui.grid/latest/Grid#readData) API를 이용하여 명시적으로 데이터를 가져올 수 있다.

```js
const dataSource = {
  api: {
    readData: { url: '/api/read', method: 'GET', initParams: { param: 'param' } }
  },
  initialRequest: false // 디폴트 값은 true
};

const grid = new Grid({
  // ...,
  data: dataSource
});

grid.readData(1);
```

api 옵션 정의 시 초기 요청 파라미터를 추가하고 싶은 경우, `initParams` 속성을 설정하면 해당 파라미터를 `query string`에 추가하여 요청한다. `initParams` 속성은 `GET` api에 대해서만 유효하다.

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

> **참조**
> `initParams` 옵션은 `v4.9.0` 이상부터 사용할 수 있다.

### `readData`의 프로토콜

`readData`의 프로토콜에 대해 살펴보자. Grid가 특정 `URL`과 `method`로 요청을 보냈을 때 문자열 매개변수는 다음과 같다.

```
page=1&perPage=10
```
- **page** `{number}` : 현재 페이지
- **perPage** `{number}` : 한 페이지에 표현되는 로우의 개수

만약 *정렬* 기능을 사용하고 있다면, 다음과 같이 정렬 옵션이 문자열 매개변수에 포함되어야 한다.

```
page=1&perPage=10&sortColumn=XXX&sortAscending=true
```

- **sortColumn** `{string}` : 로우들의 순서를 결정하는 컬럼의 이름
- **sortAscending** `{boolean}` : `true`인 경우 오름차순, `false`인 경우 내림차순으로 정렬한다.

응답 데이터는 JSON 문자열이어야 한다. 요청이 성공적으로 처리된 경우 응답 데이터는 다음과 같다.

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

- **result** `{boolean}` : 요청이 성공적으로 처리된 경우 `true`, 실패한 경우 `false`이다.
- **data**
    - **contents** `{array}` : 로우 데이터의 배열로, `grid.resetData()` 메서드의 매개변수와 같다.
    - **pagination**
        - **page** `{number}` : 현재 페이지
        - **totalCount** `{number}` : 모든 로우들의 개수

요청을 처리하다가 오류가 발생하면 `result`는 `false`이다.

```json
{
  "result": false,
  "message": "Error message from the server"
}
```

## 변경 데이터 저장

원격 서버에 변경된 데이터를 저장하고 싶은 경우, 다음 API를 사용할 수 있다.

- **createData** : 새롭게 추가된 데이터만 보내는 경우
- **updateData** : 수정된 데이터만 보내는 경우
- **deleteData** : 삭제된 데이터만 보내는 경우
- **modifyData** : 추가, 수정, 삭제된 모든 데이터를 보내는 경우

위 API를 사용하기 위해, 각 요청에 대한 `url`과 `method`를 미리 등록해야한다.

```js
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

그 후 아래의 예시처럼 각 요청을 보내는 `request()` 메서드를 사용할 수 있다.
(아래의 예시는 단순한 예시로, 더 많은 정보는 [API 문서](http://nhn.github.io/tui.grid/latest/)에서 찾을 수 있다.)

```js
grid.request('createData'); // 'POST' 방식으로 '/api/createData'에 요청을 보낸다.
grid.request('updateData'); // 'PUT' 방식으로 '/api/updateData'에 요청을 보낸다.
```

`request()` 메서드를 호출한 경우 `grid` 인스턴스는 변경된 데이터로 요청을 보낸다. 데이터는 배열로 이루어진 JSON 문자열로, 변경된 로우들의 모든 데이터를 포함한다. 예를 들어 두 개의 로우를 변경한 후 `request('updateData')`를 호출하면 전송되는 데이터 문자열은 다음과 같다.
```
updatedRows=[{"c1":"data1-1","c2":"data1-2,"rowKey":1},{"c1":"data2-1","c2":data2-2,"rowKey":2}]
```
(실제 상황에서 데이터는 인코딩된다.)

또 다른 API는 매개변수 이름이 다르지만 동일한 형식의 데이터를 사용한다. `createData`는 **createdRows**를, `deleteData`는 **deletedRows**를, `modifyData`는 **createdRows**, **updatedRows**, **deletedRows**를 매개변수 이름으로 사용한다.

원격 서버의 응답 데이터 또한 JSON 문자열이다.

```json
{
  "result": true,
  "data": {}
}
```

`data` 속성은 선택 사항이다. 필요한 데이터가 있는 경우 원격 서버로부터 `data` 속성을 받아 사용할 수 있다. 오류가 발생하면 `result`는 `false`가 된다.

```json
{
  "result": false,
  "message": "Error message from the server"
}
```

## ajax 옵션

TOAST UI Grid는 원격 서버와 ajax 통신을 할 때 사용할 수 있는 다양한 옵션들을 제공한다. 옵션은 아래와 같다.

- **withCredentials** : 쿠키 또는 `Authorization` 헤더와 같은 보안에 민감한 정보를 CORS 요청 시 함께 보내기 위한 옵션이다. 기본값은 `false` 이다.
- **contentType** : ajax 요청 시 사용할 `content-type` header를 설정한다. 기본값은 `application/x-www-form-urlencoded`이며 JSON 타입을 사용하고 싶은 경우 `application/json` 로 설정한다.
- **headers** : `content-type` 외에 요청에 필요한 header를 설정한다.
- **serializer** : 파라미터의 직렬화를 커스터마이징 하고 싶은 경우 사용한다. 특정 문자의 인코딩 또는 직렬화 형태를 변경하고 싶은 경우 사용한다. 기본 직렬화 형식은 아래와 같다.
  1. Array format
      - basic
        ```js
        // 직렬화 전
        { a: [1, 2, 3] } 
        
        // 직렬화 후
        a[]=1&a[]=2&a[]=3
        ```
      - nested
        ```js
        // 직렬화 전
        { a: [1, 2, [3]] }

        // 직렬화 후
        a[]=1&a[]=2&a[2][]=3
        ```
  2. Object format
      - basic
        ```js
        // 직렬화 전
        { a: { b: 1, c: 2 } }

        // 직렬화 후
        a[b]=1&a[c]=2
        ```
- **mimeType** : MIME type을 재지정하고 싶은 경우 설정한다.

ajax 옵션을 공통으로 사용하고 싶은 경우에 아래 예제처럼 설정할 수 있다.

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
API별로 다른 ajax 옵션을 사용하고 싶은 경우 개별로 지정할 수 있으며, 이 옵션은 공통으로 설정된 ajax 옵션보다 우선순위를 가진다.

```js
const dataSource = {
  api: {
    readData: { 
      url: '/api/readData/',
      method: 'GET',
      headers: { 'x-custom-header': 'custom-header' },
      // 아래에 설정된 serializer 옵션이 공통 serializer 옵션보다 우선순위를 가진다.
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

> **참조**
> `withCredentials` 외에 모든 ajax 옵션은 `v4.9.0` 이상부터 사용할 수 있다.

## 페이지네이션

원격 서버로 요청을 보내는 경우 대개 `Pagination`이 필요하다. `Pagination`은 다음과 같이 `pageOptions`로 정의할 수 있다.

```js
const grid = new Grid({
  // ...,
  data: dataSource,
  pageOptions: {
    perPage: 10
  }
});
```

## 콜백 사용하기

Grid 인스턴스의 `on()` 메서드를 사용하여 처리 상태에 따른 콜백 함수를 등록할 수 있다. 사용 가능한 이벤트는 다음과 같다. 각 이벤트 핸들러 함수의 인자로 Grid 인스턴스와 `XMLHttpRequest` 인스턴스가 넘어간다.

```js
grid.on('beforeRequest', function(ev) {
  // 요청을 보내기 전
}).on('response', function(ev) {
  // 성공/실패와 관계 없이 응답을 받았을 경우
}).on('successResponse', function(ev) {
  // 결과가 true인 경우
}).on('failResponse', function(ev) {
  // 결과가 false인 경우
}).on('errorResponse', function(ev) {
  // 오류가 발생한 경우
});
```

## RESTful URI

API의 각 `url` 옵션을 RESTful하게 정의하고 싶은 경우, 아래 예제처럼 함수 형태로 `url` 옵션을 지정할 수 있다.

```js
let shopId = '1000';

const dataSource = {
  api: {
    readData: { url: () => `/company/${shopId}/sales`, method: 'GET' },
    deleteDate: { url: () => `/company/${shopId}/sales`, method: 'DELETE' }
  }
}
```

> **참조**
> RESTful URI 설정은 `v4.9.0` 이상부터 사용할 수 있다.

## 로딩바 숨김 옵션
`hideLoadingBar`옵션을 설정하여 기본 로딩바를 숨길 수 있다. 기본값은 `false`이다.

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

> **참조**
> `hideLoadingBar` 옵션은 `v4.9.0` 이상부터 사용할 수 있다.

## 예제

원격 데이터를 사용하는 예제는 [여기](https://nhn.github.io/tui.grid/latest/tutorial-example10-data-source)서 확인할 수 있다.
