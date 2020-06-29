# 정렬 🗂

TOAST UI Grid에서는 옵션을 사용하여 컬럼 별로 정렬 기능을 사용할 수 있다. 정렬 옵션을 지정한 컬럼은 헤더 영역에 정렬 버튼이 활성화되며, 버튼을 클릭하여 데이터를 정렬할 수 있다.

## 단일 컬럼 정렬

Grid에서 컬럼의 정렬 버튼을 눌렀을 경우, 해당 컬럼 기준으로 오름차순, 내림차순으로 데이터가 정렬된다. 옵션 설정은 다음과 같다.

```js
const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'alphabetA',
      header: 'alphabetA',
      sortable: true,
      sortingType: 'desc'
    },
    {
      name: 'alphabetB',
      header: 'alphabetB',
      sortable: true,
      sortingType: 'asc'
    }
  ]
});
```

위 예제처럼 `columns` 배열에 제공되는 컬럼 정보 객체의 `sortable` 옵션을 `true`로 설정하여 사용할 수 있다. `sortingType` 옵션은 컬럼의 디폴트 정렬 타입을 지정해주는 옵션이다. `asc`인 경우 오름차순, `desc`인 경우 내림차순으로 디폴트 정렬 타입이 지정된다. 생략할 경우 디폴트 정렬 타입은 `asc`이다.

* `sortingType: 'asc'`

  ![image](https://user-images.githubusercontent.com/37766175/64319913-667fc780-cff8-11e9-81ab-4b5d25449816.gif)
  
* `sortingType: 'desc'`

  ![image](https://user-images.githubusercontent.com/37766175/64319941-6da6d580-cff8-11e9-9028-cfceb9386a79.gif)


## 다중 컬럼 정렬

다중 컬럼 정렬은 여러 개의 컬럼을 기준으로 데이터를 정렬한다. 다중 컬럼 정렬 사용을 위해 추가적인 옵션 설정은 필요하지 않다. 단지 `Cmd(Ctrl)` 누른 상태에서 컬럼의 정렬 버튼을 클릭하면, 버튼을 누른 순서 기준으로 데이터가 정렬된다. 

```js
const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'alphabetA',
      header: 'alphabetA',
      sortable: true,
      sortingType: 'desc'
    },
    {
      name: 'alphabetB',
      header: 'alphabetB',
      sortable: true,
      sortingType: 'asc'
    }
  ]
});
```


![image](https://user-images.githubusercontent.com/37766175/64319568-abefc500-cff7-11e9-90c8-3a386dd7b7fa.gif)

만약 `Cmd(Ctrl)` 누르지 않고 정렬 버튼을 클릭한다면, 아래 그림처럼 다중 컬럼 정렬은 모두 해제되고 해당 컬럼 기준으로 단일 컬럼 정렬이 수행된다.

![image](https://user-images.githubusercontent.com/37766175/64320470-954a6d80-cff9-11e9-977b-9cb1421b0a7c.gif)

> **참조**
> 다중 컬럼 정렬은 `v4.2.0` 이상부터 사용할 수 있는 기능이다.

## 데이터 소스 연동
Grid의 [데이터 소스](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/docs/ko/data-source.md)를 이용하여 원격 데이터를 사용하는 경우, 정렬 기능을 사용하기 위해 아래와 같이 `useClientSort` 옵션 설정이 필요하다. 

```js
const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'alphabetA',
      header: 'alphabetA',
      sortable: true,
      sortingType: 'desc'
    },
    {
      name: 'alphabetB',
      header: 'alphabetB',
      sortable: true,
      sortingType: 'asc'
    }
  ],
  useClientSort: false
});
```

> **참조**
> 현재 `데이터 소스`에서는 단일 컬럼 정렬 기준으로만 연동이 가능하다. 다중 컬럼 정렬 연동은 이후 추가 지원될 계획이나, 현재는 지원되지 않는 상태이다.

## Custom Comparator

사용자가 직접 comparator를 정의하여 데이터를 정렬하고 싶은 경우 `comparator` 옵션을 사용할 수 있다. Custom Comparator의 구조는 자바스크립트 정렬 함수에서 실행되는 [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)과 동일하지만 정렬 대상인 로우 정보도 매개변수로 사용할 수 있다는 차이점이 있다. 이 매개변수는 다른 컬럼의 데이터를 사용하여 데이터를 정렬하는 경우 유용하게 사용할 수 있다.

```js
const comparator = (valueA, valueB, rowA, rowB) => {
  return (valueA.length + rowA.alphabetB.length) - (valueB.length + rowB.alphabetB.length);
};

const grid = new Grid({
  data,
  columns: [
    { name: 'alphabetA', header: 'alphabetA', comparator  },
    { name: 'alphabetB', header: 'alphabetB'  },
    // ...
  ]
})
```

> **참조**
> Custom Comparator 는 `v4.14.0` 이상부터 사용할 수 있는 기능이다.

## 정렬 API 사용하기

다음과 같이 정렬과 관련된 메서드를 호출할 수 있다.

| 이름 | 설명 |
| --- | --- |
| `sort` | 특정 컬럼을 기준으로 단일 컬럼 정렬 또는 다중 컬럼 정렬을 수행한다. |
| `unsort` | 특정 컬럼 기준으로 정렬을 해제한다. |
| `getSortState` | 현재 데이터의 정렬 기준 정보를 객체로 반환한다. |

```js
grid.sort('columnName', true, true);
grid.unsort('columnName');

/* 
 * @example
 *   // 데이터를 정렬하지 않은 기본 상태
 *   {
 *     columns: [{ columnName: 'sortKey', ascending: true }],
 *     useClient: true
 *   } 
 * 
 *   // alphabetA, alphabetB 컬럼으로 데이터를 정렬한 상태
 *   {
 *     columns: [{ columnName: 'alphabetA', ascending: true }, { columnName: 'alphabetB', ascending: false }],
 *     useClient: true
 *   }
 */
grid.getSortState();

```
또한 커스텀 이벤트가 제공되어 데이터가 정렬될 때 해당 이벤트가 발생한다.

| 이름 | 설명 |
| --- | --- |
| `sort` | 데이터를 정렬했을 때 발생한다. |

## 예제

정렬 기능 예제는 [여기](http://nhn.github.io/tui.grid/latest/tutorial-example19-sort)서 확인해 볼 수 있다.
