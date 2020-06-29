# 유효성 검사 ✔️

TOAST UI Grid는 셀 데이터의 유효성을 검사하는 기능을 제공한다. `columns[].validation` 옵션을 사용하며, 컬럼 단위로 유효성 검사를 할 수 있다. `columns[].validation` 옵션의 하위 옵션 정보는 다음과 같다.

| 옵션명        | 타입                   | 기본값     |
| ------------- | ---------------------- | ---------- |
| `dataType`    | `'string' \| 'number'` | `'string'` |
| `required`    | `boolean`              | `false`    |
| `min`         | `number`               | `null`     |
| `max`         | `number`               | `null`     |
| `regExp`      | `RegExp`               | `null`     |
| `validatorFn` | `function`             | `null`     |

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
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

## `dataType` 옵션

`dataType` 옵션을 사용해 Grid 초기 데이터 또는 `setValue` 메서드로 변경된 셀 데이터가 해당 타입과 일치하는지 검사할 수 있다. `dataType` 옵션을 통해 설정할 수 있는 타입은 문자열(`'string'`)과 숫자(`'number'`)로, 다른 타입의 값이 셀 데이터로 설정되면 해당 셀이 유효하지 않음으로 표시된다(배경 색상이 빨간색으로 변경된다).

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
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

## `required` 옵션

`required` 옵션을 `true`로 설정하면 셀 데이터가 빈 값인지 검사할 수 있다. `required` 옵션이 설정된 컬럼은 배경 색상이 노란색으로 표시된다. 이 때 셀 데이터가 빈 값이면 빨간색으로 표시된다.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'name',
      validation: {
        required: true
      }
    }
  ]
});

grid.setValue(3, 'artist', '');
```

![02-validation-required](https://user-images.githubusercontent.com/18183560/61283084-81ec0480-a7f7-11e9-9e82-715f8da22ecd.png)

## `min`, `max` 옵션

`min`, `max` 옵션에 숫자로 값을 지정하면 셀 데이터가 최소, 최댓값 범위에 들어와 있는 값인지 검사할 수 있다. 이 때 셀 데이터가 `min`값 보다 작거나 `max`값 보다 큰 경우에는 빨간색으로 표시된다.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'price',
      validation: {
        min: 10000,
        max: 20000
      }
    }
  ]
});
```

![image](https://user-images.githubusercontent.com/35371660/63257029-dc272c00-c2b3-11e9-8e2e-fa878577cd15.png)


> **참조**
> `min`, `max`는 `v4.5.0` 이상부터 사용할 수 있는 옵션이다.


## `regExp` 옵션

`regExp` 옵션에 정규식을 지정하면 셀 데이터가 정규식에 해당되는 값인지 검사할 수 있다. 이 때 셀 데이터가 정규식에 해당되지 않는 경우에는 빨간색으로 표시된다.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'name',
      validation: {
        regExp: /[a-zA-Z]+_[a-zA-Z]/
      }
    }
  ]
});
```

![image](https://user-images.githubusercontent.com/35371660/63257294-67082680-c2b4-11e9-8e76-6a5b80e10d2b.png)


> **참조**
> `regExp`는 `v4.5.0` 이상부터 사용할 수 있는 옵션이다.

## `validatorFn` 옵션

`validatorFn` 옵션에 함수를 지정하면 셀 데이터(`value`)를 인자로 받아 함수 결과를 검사할 수 있다. 이 때 함수 결과가 `truthy`가 아닌 경우에는 빨간색으로 표시된다.


```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'price',
      validation: {
        validatorFn: value => value !== 10000
      }
    }
  ]
});
```

![image](https://user-images.githubusercontent.com/35371660/63257621-26f57380-c2b5-11e9-9237-ea927cfa014e.png)

> **참조**
> * `validatorFn`는 `v4.5.0` 이상부터 사용할 수 있는 옵션이다.
> * `v4.10.0` 이상부터는 셀 데이터 외에 로우 데이터, 컬럼 명도 함께 인자로 받기 때문에, 로우의 다른 셀 데이터와 연산하여 데이터 검증이 필요한 경우 활용할 수 있다.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'price',
      validation: {
        validatorFn: (value, row, columnName) => Number(value) + Number(row['anotherColumn']) > 10000
      }
    }
  ]
});
```

### `meta` 정보 반환
`validatorFn` 옵션으로 지정한 함수에서 아래와 같이 유효성 검증 결과(`valid` 속성)와 meta 정보를 반환할 경우, `validate` API의 결과로 meta 정보가 함께 반환된다. `VALIDATOR_FN` 에러 코드만으로 검증 결과를 다루기 불편한 경우 이 meta 정보를 이용하여 에러 처리를 용이하게 할 수 있다.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'price',
      validation: {
        validatorFn: (value, row, columnName) => {
          return { 
            valid: Number(value) + Number(row['anotherColumn']) > 10000,
            // `validate` API의 결과로 meta 정보가 함께 반환된다.
            meta: { customErrorCode: 'CUSTOM_ERROR_CODE' }
          };
        }
      }
    }
  ]
});
```

> **참조**
> `meta` 정보 반환은 `v4.14.0` 이상부터 사용할 수 있다.

## `unique` 옵션

`unique` 옵션을 `true`로 설정하면 셀 데이터가 컬럼에서 중복되는지 검사할 수 있다. 이 때 셀 데이터가 중복되는 경우에는 빨간색으로 표시된다.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'price',
      validation: {
        unique: true
      }
    }
  ]
});
```

![image](https://user-images.githubusercontent.com/37766175/85833184-48c06080-b7cc-11ea-932c-b09c73b2e9dc.png)

> **참조**
> * `unique`는 `v4.14.0` 이상부터 사용할 수 있는 옵션이다.
> * 내부적으로 최적화를 하였지만, 대용량 데이터에서 `unique`옵션을 사용하는 경우에는 성능적인 이슈가 있을 수 있다.

## `validate()` 메서드

`validation` 옵션을 설정하고 `validate()` 메서드를 호출하면 로우 단위로 유효성에 맞지 않은 컬럼 정보를 가져올 수 있다. `v4.5.0` 부터는 여러 유효성 검사를 함께 진행할 수 있으며 `errorCode`는 배열 형태로 반환된다.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
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
        errorCode: ['TYPE_STRING']
      },
      {
        columnName: 'listenCount',
        errorCode: ['TYPE_NUMBER']
      }
    ]
  },
  {
    rowKey: 1,
    errors: [
      {
        columnName: 'downloadCount',
        errorCode: ['TYPE_NUMBER']
      }
    ]
  },
  {
    rowKey: 3,
    errors: [
      {
        columnName: 'listenCount',
        errorCode: ['REQUIRED']
      }
    ]
  }
];
```

### `errorInfo` 속성
`validate()` 메서드의 결과로 meta 정보도 함께 볼 수 있는 `errorInfo` 속성이 추가되었다. 검증에 사용된 정규식 또는 `validatorFn` 함수에서의 meta 정보 등 자세한 에러 정보를 얻을 수 있다.(`errorCode` 속성은 **deprecated** 되었다.)

```js
// validate() 호출 결과값
[
  {
    rowKey: 1,
    errors: [
      {
        columnName: 'name',
        // `errorCode` 속성은 deprecated 되었다.
        errorCode: ['VALIDATOR_FN'],
        errorInfo: [{ code: "VALIDATOR_FN", customErrorCode: 'CUSTOM_ERROR_CODE' }]
      },
      {
        columnName: 'artist',
        // `errorCode` 속성은 deprecated 되었다.
        errorCode: ['REGEXP'],
        errorInfo: [{ code: "REGEXP", regExp: /[a-zA-Z]+_[a-zA-Z]/ }]
      }
    ]
  },
  {
    rowKey: 2,
    errors: [
      {
        columnName: 'price',
        // `errorCode` 속성은 deprecated 되었다.
        errorCode: ['MIN'],
        errorInfo: [{ code: "MIN", min: 1000 }]
      }
    ]
  }
]  
```

> **참조**
> `errorInfo`는 `v4.14.0` 이상부터 사용할 수 있는 속성이다.

## 예제

유효성 검사 예제는 [여기](https://nhn.github.io/tui.grid/latest/tutorial-example20-validation)서 확인할 수 있다.
