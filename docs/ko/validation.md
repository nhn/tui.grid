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

`dataType` 옵션을 사용해 Grid 초기 데이터 또는 `setValue` 메서드로 변경된 셀 데이터가 해당 타입과 일치하는지 검사할 수 있다. `dataType` 옵션을 통해 설정할 수 있는 타입은 문자열(`'string'`)과 숫자(`'number'`)로, 다른 타입의 값이 셀 데이터로 설정되면 해당 셀이 유효하지 않음으로 표시된다(배경 색상이 빨간색으로 변경된다).

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

`required` 옵션을 `true`로 설정하면 셀 데이터가 빈 값인지 검사할 수 있다. `required` 옵션이 설정된 컬럼은 배경 색상이 노란색으로 표시된다. 이 때 셀 데이터가 빈 값이면 빨간색으로 표시된다.

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

grid.setValue(3, 'artist', '');
```

![02-validation-required](https://user-images.githubusercontent.com/18183560/61283084-81ec0480-a7f7-11e9-9e82-715f8da22ecd.png)

## min, max 옵션

`v4.5.0` 이상부터 사용할 수 있는 옵션이다. `min`, `max` 옵션에 숫자로 값을 지정하면 셀 데이터가 최소, 최댓값 범위에 들어와 있는 값인지 검사할 수 있다. 이 때 셀 데이터가 `min`값 보다 작거나 `max`값 보다 큰 경우에는 빨간색으로 표시된다.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...
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

## regExp 옵션

`v4.5.0` 이상부터 사용할 수 있는 옵션이다. `regExp` 옵션에 정규식을 지정하면 셀 데이터가 정규식에 해당되는 값인지 검사할 수 있다. 이 때 셀 데이터가 정규식에 해당되지 않는 경우에는 빨간색으로 표시된다.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...
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

## validatorFn 옵션

`v4.5.0` 이상부터 사용할 수 있는 옵션이다. `validatorFn` 옵션에 함수를 지정하면 셀 데이터를 매개변수로 함수 결과를 검사할 수 있다. 이 때 함수 결과가 `truthy`가 아닌 경우에는 빨간색으로 표시된다.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...
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

## validate() 메서드

`validation` 옵션을 설정하고 `validate()` 메서드를 호출하면 로우 단위로 유효성에 맞지 않은 컬럼 정보를 가져올 수 있다. `v4.5.0` 부터는 여러 유효성 검사를 함께 진행할 수 있으며 `errorCode`는 배열 형태로 반환된다.

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

<!-- @TODO: 결과값 다시 노출 -->

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

## 예제

유효성 검사 예제는 [여기](https://nhn.github.io/tui.grid/latest/tutorial-example20-validation)서 확인할 수 있다.
