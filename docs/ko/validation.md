# 유효성 검사 ✔️

TOAST UI Grid는 셀 데이터가 유효한 데이터 타입인지 검사하는 기능을 제공한다. `columns[].validation` 옵션을 사용하며, 컬럼 단위로 유효성 검사를 할 수 있다. `columns[].validation` 옵션의 하위 옵션 정보는 다음과 같다.

| 옵션명 | 타입 | 기본값 |
| --- | --- | --- |
| `dataType` | `'string' \| 'number'` | `'string'` |
| `required` | `boolean` | `false` |

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...
  columns: [
    {
      name: 'name',
      validation: {
        dataType: 'string',
        required: false
      }
    }
  ]
});
```

## dataType 옵션

`dataType` 옵션을 사용해 Grid 초기 데이터 또는 `setValue` 메서드로 변경된 셀 데이터가 해당 타입과 일치하는지 여부를 검사할 수 있다. `dataType` 옵션을 통해 설정할 수 있는 타입은 문자열(`'string'`)과 숫자(`'number'`)로, 다른 타입의 값이 셀 데이터로 설정되면 해당 셀이 유효하지 않음으로 표시된다(배경 색상이 빨간색으로 변경됨).

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...
  columns: [
    {
      name: 'name',
      validation: {
        dataType: 'string'
      }
    },
    {
      name: 'downloadCount',
      validation: {
        dataType: 'number'
      }
    }
  ]
});

grid.setValue(0, 'name', 10);
grid.setValue(1, 'downloadCount', 'foo');
```
![01-validation-dataType](https://user-images.githubusercontent.com/18183560/61283083-81ec0480-a7f7-11e9-9d57-07f729d6346b.png)

## required 옵션

`required` 옵션을 `true`로 설정하면 셀 데이터가 빈 값인지 여부를 검사할 수 있다. `required` 옵션이 설정된 컬럼은 배경 색상이 노란색으로 표시된다. 이 때 셀 데이가 빈 값이면 빨간색으로 표시된다.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...
  columns: [
    {
      name: 'name',
      validation: {
        required: true
      }
    }
  ]
});

grid.setValue(3, 'artsit', '');
```
![02-validation-required](https://user-images.githubusercontent.com/18183560/61283084-81ec0480-a7f7-11e9-9e82-715f8da22ecd.png)

## validate() 메서드

`validation` 옵션이 설정된 컬럼에 한해 유효성 검증 결과를 확인할 수 있다. 다음과 같이 `validation` 옵션이 설정되어 있을 때,  `validate()` 메서드를 호출하면 로우 단위로 유효성에 맞지 않은 컬럼 정보를 가져올 수 있다.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...
  columns: [
    {
      name: 'name',
      validation: {
        dataType: 'string'
      }
    },
    {
      name: 'downloadCount',
      validation: {
        dataType: 'number'
      }
    },
    {
      name: 'downloadCount',
      validation: {
        dataType: 'number',
        required: true
      }
    }
  ]
});

grid.validate();
```

![03-validation-validate](https://user-images.githubusercontent.com/18183560/61283085-81ec0480-a7f7-11e9-8ef2-d84aa1652649.png)

```js
// validate() 호출 결과값
[
  {
    rowKey: 0,
    errors: [
      {
        columnName: 'name',
        errorCode: 'TYPE_STRING'
      },
      {
        columnName: 'listenCount',
        errorCode: 'TYPE_NUMBER'
      }
    ]
  },
  {
    rowKey: 1,
    errors: [
      {
        columnName: 'downloadCount',
        errorCode: 'TYPE_NUMBER'
       }
    ]
  },
  {
    rowKey: 3,
    errors: [
      {
        columnName: 'listenCount',
        errorCode: 'REQUIRED'
      }
    ]
  }
]
```