# 필터 🔍

TOAST UI Grid에서는 옵션을 사용하여 컬럼 별로 필터 기능을 사용할 수 있다. 필터 옵션을 지정한 컬럼은 헤더 영역에 필터 버튼이 활성화되며, 버튼을 클릭하여 데이터를 필터링할 수 있다. 이 기능은 v4.6.0 이후로 사용할 수 있으며 현재는 클라이언트 기능만 제공하고 있다.(DataSource를 이용한 서버사이드 필터링은 추후에 제공될 예정이다.)

## 필터 지정하기

필터는 컬럼별로 지정이 가능하며 `text`, `number`, `select`, `date` 총 4가지 빌트인 필터를 제공한다.
* 문자열 타입 : 옵션이 없는 경우 사용
* 객체 타입 : 옵션이 필요한 경우 사용

```js
const grid = new tui.Grid({
  el: document.getElementById('grid'),
  data: gridData,
  bodyHeight: 500,
  columns: [
    {
      header: 'Name',
      name: 'name',
      filter: 'text'
    },
    {
      header: 'Name',
      name: 'name',
      filter: {
        type: 'text',
        showApplyBtn: true,
        showClearBtn: true
      }
    }
  ]
});
```

또한, 타입에 맞는 비교 코드가 존재한다. `code`는 필터링 조건을 나타내는 코드이며 이후에 설명할 `filter()` API에 사용된다.

| option            | code     | type   |
| ----------------- | -------- | ------ |
| `=`               | eq       | number |
| `>`               | lt       | number |
| `<`               | gt       | number |
| `>=`              | lte      | number |
| `<=`              | gte      | number |
| `!=`              | ne       | number |
| `Equals`          | eq       | text   |
| `Not equals`      | ne       | text   |
| `Contains`        | contain  | text   |
| `Starts with`     | start    | text   |
| `Ends with`       | end      | text   |
| `Equals`          | eq       | date   |
| `Not equals`      | ne       | date   |
| `After`           | after    | date   |
| `After or Equal`  | afterEq  | date   |
| `Before`          | before   | date   |
| `Before or Equal` | beforeEq | date   |

### text, number, date

`text`, `number`, `date` 세 타입은 select와 input이 기본으로 주어진다. select는 위 표에 나타나는 option이 나타나며 그에 대한 값을 입력해 찾는 방식이다.

![simple1](https://user-images.githubusercontent.com/35371660/65324092-274f9a00-dbe6-11e9-828a-c60a27e35a6d.gif)

`date` 타입을 사용하기 위해서는 [TOAST UI DatePicker](https://github.com/nhn/tui.date-picker) 의존을 갖고 있어야 하며 자세한 내용은 [DatePicker 사용 가이드](./date-picker.md)를 참고한다.

### select

`select`는 위 세 타입과 다르게 리스트로 제공되어 값을 체크박스로 선택하는 방식이다.

![simple2](https://user-images.githubusercontent.com/35371660/65324226-94fbc600-dbe6-11e9-8084-ea5dc3826e34.gif)

리스트 검색이 가능하며 검색된 결과를 선택하여 필터링 할 수 있다.

## Apply Button, Clear Button

조건이 바로 적용되는 것을 원하지 않다면 `showApplyBtn` 필드를 `true`로 지정해 버튼을 눌렀을 때 필터가 적용되게 할 수 있다. 또한, 이미 적용된 필터 조건을 초기화하는 버튼을 만들고 싶다면 `showClearBtn`을 사용하면 된다.

```js
const grid = new tui.Grid({
  el: document.getElementById('grid'),
  data,
  columns: [
    {
      header: 'Name',
      name: 'name',
      filter: {
        type: 'text',
        showApplyBtn: true,
        showClearBtn: true
      }
    }
    // ...,
  ]
});
```

위 코드는 다음처럼 실행된다.

![image](https://user-images.githubusercontent.com/35371660/65323005-3b45cc80-dbe3-11e9-955c-48dd6320c220.png)

## 복수 조건 필터

복수 조건 필터는 4가지 타입 중 `select`를 제외한 `text`, `number`, `date` 만 사용 가능하다. 필터 지정시 `operator` 필드에 'OR' 혹은 'AND'를 지정하면 초기값을 지정할 수 있다.

```js
const grid = new tui.Grid({
  el: document.getElementById('grid'),
  data,
  columns: [
    // ...,
    {
      header: 'Genre',
      name: 'genre',
      filter: {
        type: 'text',
        operator: 'OR'
      }
    }
  ]
});
```

위 코드는 다음과 같이 작동한다.

![operator_1](https://user-images.githubusercontent.com/35371660/65322756-a0e58900-dbe2-11e9-996c-fdca0d23d1fd.gif)

`operator`와 두번째 필터는 첫번째 필터의 값을 채웠을 경우 노출된다.

## API

### filter

특정 컬럼의 필터 조건을 변경하고 데이터를 필터링한다.

```js
const state = {
  code: 'eq',
  value: 30
};

grid.filter(columnName, state);
```

### unfilter

컬럼에 적용된 필터 조건을 제거한다.

```js
grid.unfilter(columnName);
```

### getFilterState

컬럼의 필터 상태를 반환한다.

```js
grid.getFilterState(columnName); 
// {
//   columnName: 'columnName',
//   conditionFn: Function,
//   type: 'type'
//   state: [
//     {
//       code: 'code',
//       value: 'value'
//     }
//   ]
// }
```

### setFilter

컬럼에 필터 옵션을 지정할 수 있다. filterOpt는 처음 column에 필터를 설정하는 것처럼 'string' 혹은 객체로 컬럼을 지정할 수 있다.

```js
// const filterOpt = 'text'; // 혹은
const filterOpt = {
  type: 'text',
  showApplyBtn: true,
  showClearBtn: false,
  operator: 'OR'
};

grid.setFilter(columnName, filterOpt);
```

## custom event

### filter

커스텀 이벤트로는 필터링 시 발생하는 `filter`를 제공한다.

```js
grid.on('filter', ev => {
  console.log(ev);
  // ev.instance - Current grid instance
  // ev.filterState - filterState
});
```

## 예제

필터 기능 예제는 [여기](http://nhn.github.io/tui.grid/latest/tutorial-example24-filter)서 확인해 볼 수 있다.
