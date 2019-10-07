# 컬럼 관계 설정 🤝

TOAST UI Grid는 `relations` 옵션을 사용하여 컬럼 간의 관계를 지정할 수 있다. `relations` 옵션 값은 각 요소가 현재 컬럼과 타겟 컬럼 사이의 고유한 관계를 설정한 배열이다.

컬럼 관계를 설정하기 위해 `targetNames` 속성으로 타겟 컬럼 목록을 명시한다. 또한 `editable`, `disabled`, `listItems` 속성을 사용해 타겟 컬럼의 상태를 바꾸는 조건을 정의할 수 있으며, 각 속성 값은 콜백 함수에 해당한다. `targetNames`에 포함된 컬럼은 값이 변경될 때마다 각 콜백 함수의 결과에 영향을 받는다.

모든 콜백 함수는 매개 변수로 하나의 객체를 받는다. 매개 변수에서 사용할 수 있는 속성들은 다음과 같다.
- `value`: 현재 (변경하는) 셀의 값
- `editable`: 현재 (변경하는) 셀의 편집 가능 여부
- `disabled`: 현재 (변경하는) 셀의 비활성화 여부
- `rowData`: 현재 셀이 위치한 로우의 모든 값이 포함된 객체

## editable

`editable` 콜백 함수는 타겟 컬럼의 `editable` 상태를 결정한다. 반환 값이 `true`인 경우에만 타겟 컬럼의 셀들을 편집할 수 있다.

```javascript
grid.setColumns([
  {
    header: 'col1',
    name: 'col1',
    relations: [
      {
        targetNames: ['col2', 'col3'],
        editable({ value }) {
          return value === '1';
        }
      }    
    ]        
  },
  {
    header: 'col2',
    name: 'col2'
  },
  {
    header: 'col3',
    name: 'col3'
  }
]);
```

위의 예제에서 'col1' 컬럼에는 `relations` 옵션이 명시되어있고, 타겟 컬럼은 'col2'와 'col3'이다. 'col1'에 있는 셀 하나의 값이 '1'로 변경될 경우, 해당 셀과 같은 로우에 있는 'col2'와 'col3'의 셀도 편집할 수 있다.

## disabled

`disabled` 콜백 함수는 타겟 컬럼의 비활성화 상태를 결정한다. 반환 값이 `true`인 경우에만 타겟 컬럼의 셀들은 비활성화된다.

콜백 함수의 형태는 `editable`과 동일하다.

## listItems

`listItems` 콜백 함수는 타겟 컬럼의 옵션 리스트를 결정하며 리스트 타입의 내장 에디터(`checkbox`, `radio`, `select`)를 설정한 컬럼에서만 사용할 수 있다. 반환 값은 `editor.options.listItems` 같은 형태로, 옵션 리스트의 배열이다. 콜백 함수의 반환 값이 달라질 때마다 타겟 컬럼의 셀 옵션 리스트가 반환 값으로 변경된다. 셀의 값이 아닌 `label`을 보여주기 위해서는 `listItemText`라는 내장 포매터 옵션을 설정해야 한다.

```javascript
grid.setColumns([
  {
    header: 'col1',
    name: 'col1',
    formatter: 'listItemText',
    editor: {
      type: 'select',
      options: {
        listItems: []
      }
    },
    relations: [
      {
        targetNames: ['col2'],
        listItems({ value }) {
          let items;

          if (value === '1') {
            items = [{ text: 'opt1', value: '1' }, { text: 'opt2', value: '2' }];
          } else {
            items = [{ text: 'opt3', value: '3' }, { text: 'opt4', value: '4' }];
          }
          return items;
        }
      }
    ]
  },
  {
    header: 'col2',
    name: 'col2',
    formatter: 'listItemText',
    editor: {
      type: 'select',
      options: {
        listItems: []
      }
    }
  }
]);
```

위의 예제에서 col1 컬럼의 값은 col2의 옵션 리스트를 결정한다. col1에 있는 셀 하나의 값이 `1`로 변경될 경우, 해당 셀과 같은 로우에 있는 col2 셀의 옵션 리스트는 `opt1`과 `opt2`가 된다. 그 외의 경우 `opt3`와 `opt4`가 된다.

## 예제

`relations`를 사용하는 예제는 [여기](https://nhn.github.io/tui.grid/latest/tutorial-example05-relation-columns)서 확인할 수 있다.