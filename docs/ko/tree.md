# 트리 🌳

TOAST UI Grid는 계층적 데이터를 표현하는 기능을 지원한다. 트리 컬럼을 설정하면 특정 컬럼의 데이터가 트리 형태로 표시된다.

## 트리 UI

트리 컬럼이 활성화된 경우, 트리 데이터가 포함되어있는 각 셀은 다음과 같은 UI로 표현된다.

* 깊이: 부모와 자식 로우 간의 계층적 관계를 표현한다. 최소 깊이는 1이다.
* 펼치기/접기 버튼: 자식 로우가 있는 부모 로우에 만들어진다. 자식 로우를 보이게 하거나 숨길 수 있다.
* 아이콘: 부모 로우가 자식 로우를 가졌는지 알려준다.

![tree-column](https://user-images.githubusercontent.com/18183560/41633101-0bd39096-7478-11e8-814f-5acbd21ea7d5.png)

## 사용 방법

### 트리 데이터 설정하기

일반적인 로우 데이터처럼 트리 데이터(`object`)를 배열로 설정한다. 만약 자식 로우가 있을 경우, 각 자식 로우의 데이터를 부모 로우 데이터의 `_children` 속성에 추가한다. 펼치기/접기 버튼은 `_attribute.expanded` 속성을 사용하여 초기 설정을 한다. 기본값은 `false`(접힘 상태)이며, `true`로 설정하는 경우 버튼은 펼침 상태로 보인다.

```js
const data = [
  {
    c1: 'foo',
    c2: 'bar',
    _attributes: {
      expanded: true // default: false
    },
    _children: [
      {
        c1: 'baz',
        c2: 'qux'
      },
      // ...
    ]
  },
  // ...
];
```

### 트리 컬럼 활성화하기

`treeColumnOptions` 옵션은 트리 컬럼을 설정하기 위해 쓰이며, `name`, `useIcon`, `useCascadingCheckbox` 이라는 세 가지 하위 옵션을 가진다. 각 하위 옵션이 하는 일은 다음과 같다.

| Option | Description |
| --- | --- |
| `name` | 트리 형태로 표현되는 컬럼의 이름을 설정한다. |
| `useIcon` | 아이콘의 사용여부를 설정한다. |
| `useCascadingCheckbox` | 부모-자식 관계를 유지하며 체크 박스 상태를 변경할 지 설정한다. |

`useIcon`의 기본값은 `true`이다. 부모 로우는 폴더 아이콘으로, 자식 로우는 파일 아이콘으로 나타낸다.

`useCascadingCheckbox`의 기본값은 `true`이다. 모든 자식 로우가 선택된 경우 부모 로우도 선택되며, 부모 로우가 선택된 경우 모든 자식 로우가 선택된다. `false`인 경우, 각 로우를 개별적으로 선택할 수 있다.

Grid 인스턴스 생성 옵션으로 설정할 수 있다.

```js
import Grid from 'tui-grid';

const options = {
  // ...
  treeColumnOptions: {
    name: 'c1',
    useIcon: true,
    useCascadingCheckbox: true
  }
};

const grid = new Grid(options);
```

### 트리 API 사용하기

트리 컬럼이 활성화된 경우, 다음과 같이 트리와 관련된 메서드를 호출할 수 있다.

| 이름 | 설명 |
| --- | --- |
| `expand` | 특정 로우의 자식 로우들을 펼친다. |
| `expandAll` | 모든 자식 로우들을 펼친다. |
| `collapse` | 특정 로우의 자식 로우들을 접는다. |
| `collapseAll` | 모든 자식 로우들을 접는다. |
| `getAncestorRows` | 특정 로우의 모든 조상 로우들을 반환한다. |
| `getDescendantRows` | 특정 로우의 모든 자손 로우들을 반환한다. |
| `getParent` | 특정 로우의 부모 로우를 반환한다. |
| `getChildRows` | 특정 로우의 자식 로우들을 반환한다. |
| `getDepth` | 특정 로우의 깊이 값을 반환한다. |

```js
const rowKey = 1;
grid.getAncestors(rowKey, true);
grid.expandAll();
```
또한 커스텀 이벤트가 제공되어 부모 로우를 펼치거나 접을 때 해당 이벤트가 발생한다.

| 이름 | 설명 |
| --- | --- |
| `expand` | 특정 부모 로우를 펼칠 때 발생한다. |
| `collapse` | 특정 부모 로우를 접을 때 발생한다. |

```js
grid.on('expand', (ev) => {
  const {rowKey} = ev;
  const descendantRows = grid.getDescendantRows(rowKey);

  console.log('rowKey: ' + rowKey);
  console.log('descendantRows: ' + descendantRows);
});
```

### 다르게 작동하는 API

트리 컬럼이 활성화되면 특정 API는 이전과 다르게 작동한다.

| 이름 | 설명 |
| --- | --- |
| `appendRow` | 현재 로우의 마지막 자식 아래에 로우를 만든다.  |
| `prependRow` | 현재 로우의 첫 번째 자식 아래에 로우를 만든다. |
| `removeRow` | 자식 로우가 있다면 자식 로우를 포함하여 모두 지운다. |
| `check` | `useCascadingCheckbox: true`로 설정되어있다면 부모-자식 관계를 유지하며 체크 박스의 상태를 바꾼다. |
| `uncheck` | `useCascadingCheckbox: true`로 설정되어있다면 부모-자식 관계를 유지하며 체크 박스의 상태를 바꾼다. |

### 참조

트리 컬럼을 사용하는 경우, **sorting**, **row merging**, **pagination**의 사용에 제한이 있다.

## 예제

트리 컬럼을 사용하는 예제는 [여기](https://nhn.github.io/tui.grid/latest/tutorial-example14-tree)서 확인할 수 있다.