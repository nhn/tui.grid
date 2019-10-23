# 데이터 소스 🛰

일반적으로 TOAST UI Grid는 로컬 데이터를 이용한 프론트 엔드 환경에서 작동한다. 하지만 `dataSource`라고 하는 간단한 객체를 쓰면 원격 데이터도 이용할 수 있다. 이를 위해 아래의 예시처럼 `dataSource` 객체를 정의하고 `data` 옵션을 설정한다.

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

`dataSource`에는 다음과 같은 속성들이 있다.

- **initialRequest** `{boolean}` : 초기 데이터 조회를 위한 `readData` API 요청 여부
- **api**
    - **readData** `{object}` : 데이터 조회 요청을 위한 `URL`과 `method`를 나타낸다.

이 옵션에 사용할 수 있는 또 다른 속성들은 [API 문서](http://nhn.github.io/tui.grid/latest/)의 `dataSource` 부분에서 살펴볼 수 있다.

이것이 원격 서버에서 데이터를 가져오는데 필요한 전부이다. 이제 `grid` 인스턴스는 `URL`과 `method`로 요청을 보내고 응답 데이터를 분석하여 화면에 표시한다. `api.readData`는 `dataSource`옵션에서 반드시 설정해야 하는 속성으로, 페이지가 변경되어 데이터를 새롭게 불러와야 하거나 인스턴스가 초기화되었을 때 사용된다.

## `readData`의 프로토콜

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

## 페이지네이션

원격 서버로 요청을 보내는 경우 대개 `Pagination`이 필요하다. `Pagination`은 다음과 같이 `pageOptions`로 정의할 수 있다.

```javascript
const grid = new Grid({
  // ... another options
  data: dataSource,
  pageOptions: {
    perPage: 10
  }
});
```

## 변경된 데이터 저장하기

원격 서버에 변경된 데이터를 저장하고 싶은 경우, 다음 API를 사용할 수 있다.

- **createData** : 새롭게 추가된 데이터만 보내는 경우
- **updateData** : 수정된 데이터만 보내는 경우
- **deleteData** : 삭제된 데이터만 보내는 경우
- **modifyData** : 추가, 수정, 삭제된 모든 데이터를 보내는 경우

위 API를 사용하기 위해, 각 요청에 대한 `URL`과 `method`를 미리 등록해야한다.

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

그 후 아래의 예시처럼 각 요청을 보내는 `request()` 메서드를 사용할 수 있다.
(아래의 예시는 단순한 예시로, 더 많은 정보는 [API 문서](http://nhn.github.io/tui.grid/latest/)에서 찾을 수 있다.)

```javascript
grid.request('createData'); // 'GET' 방식으로 '/api/createData'에 요청을 보낸다.
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

## 콜백 사용하기

Grid 인스턴스의 `on()` 메서드를 사용하여 처리 상태에 따른 콜백 함수를 등록할 수 있다. 사용 가능한 이벤트는 다음과 같다.

```javascript
grid.on('beforeRequest', function(data) {
  // 요청을 보내기 전
}).on('response', function(data) {
  // 성공/실패와 관계 없이 응답을 받았을 경우
}).on('successResponse', function(data) {
  // 결과가 true인 경우
}).on('failResponse', function(data) {
  // 결과가 false인 경우
}).on('errorResponse', function(data) {
  // 오류가 발생한 경우
});
```

## 예제

원격 데이터를 사용하는 예제는 [여기](https://nhn.github.io/tui.grid/latest/tutorial-example10-data-source)서 확인할 수 있다.