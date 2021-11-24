# 드래그 앤 드롭 ✊

TOAST UI Grid는 `v4.17.0` 버전 부터 로우의, `v4.20.0` 버전 부터 컬럼의 드래그 앤 드롭 기능을 제공한다. 드래그 앤 드롭 또는 `moveRow`, `moveColumn` API를 이용해 로우나 컬럼의 순서를 변경할 수 있다.

## 드래그 앤 드롭 사용하기
그리드의 `draggable` 옵션을 `true`로 지정하면 드래그 앤 드롭 기능을 사용할 수 있다.

```ts
const grid = new Grid({
  // D&D 기능 활성화
  draggable: true,
});
```

## 로우 순서 변경
드래그 앤 드롭 기능을 활성화 하면 그리드에 `_draggable` 로우 헤더가 추가된다. 

순서를 변경하길 원하는 로우의 `_draggable` 헤더를 드래그하면 해당 로우에 대한 플로팅 레이어가 생성되고 드래그 앤 드롭 기능이 시작된다.

이동 시 실시간으로 로우의 위치가 변경된다.

원하는 위치에서 드롭하면 생성된 플로팅 레이어가 삭제되면서 드래그 앤 드롭 기능이 종료된다.

### 기본 데이터 동작
이동 대상 로우를 플로팅 형태로 띄워 위치가 변경된다. 

![normal data](https://user-images.githubusercontent.com/37766175/116191858-fd6a3c00-a767-11eb-81bb-3c809800eb88.gif)


### 트리 데이터 동작
원하는 다른 로우 위에 드롭하면 해당 로우의 자식 요소로 이동한다. 이때, 가장 마지막 자식 노드로 이동한다.
단, 트리 노드에서 자기 자식 노드로 이동할 수 없다.

![tree date child](https://user-images.githubusercontent.com/41339744/142822696-66a47f32-5e61-4eab-b6f6-77bf6f94cd43.gif)

다른 로우들 사이에 드롭하면 해당 로우들 사이에 이웃 요소로 이동한다.

![tree data sibling](https://user-images.githubusercontent.com/41339744/142822565-9f448cfc-2590-4b45-b833-afc8bbc1f7a6.gif)

필터, 정렬 기능을 사용할 경우 로우의 위치를 이동할 수 없다.

### API

#### API 옵션
| 프로퍼티 | 타입 |
| --- | --- |
| `rowKey` | `RowKey` |
| `targetIndex` | `number` |
| `options` | `OptMoveRow` |

```ts
// OptMoveRow 옵션은 트리 데이터를 위한 옵션이다. appended가 ture면 다른 행의 자식 행으로 이동한다.
interface OptMoveRow {
  appended?: boolean
}
public moveRow(rowKey: RowKey, targetIndex: number, options: OptMoveRow): void;
```

## 컬럼 순서 변경
드래그 앤 드롭 기능을 활성화하고, 순서를 변경하길 원하는 컬럼 헤더를 그리드 바디로 드래그하면 해당 컬럼 헤더에 대한 플로팅 레이어가 생성되고 드래그 앤 드롭 기능이 시작된다.

이동 시 실시간으로 컬럼의 위치가 변경된다.

원하는 위치에서 드롭하면 생성된 플로팅 레이어가 삭제되면서 드래그 앤 드롭 기능이 종료된다.

![normal data](https://user-images.githubusercontent.com/41339744/142585990-a7a6c920-5348-4b98-9206-f825ce91448c.gif)

단, 숨겨진 컬럼이 있거나 복합 컬럼을 사용하는 경우 컬럼 드래그 앤 드롭을 사용할 수 없으며, 이동하려는 컬럼이나 이동하려는 위치가 로우 헤더 컬럼이거나 트리 컬럼인 경우 컬럼의 위치를 이동할 수 없다.

### API

주어진 컬럼(`columnName`)의 위치를 지정한 위치(`targetIndex`)로 이동한다.

단, 주어진 컬럼이나 지정한 위치의 컬럼이 로우 헤더 컬럼이거나 트리 컬럼인 경우 컬럼을 이동하지 않는다.

#### API 옵션
| 프로퍼티 | 타입 |
| --- | --- |
| `columnName` | `string` |
| `targetIndex` | `number` |

```ts
public moveColumn(columnName: string, targetIndex: number): void;
```

## 커스텀 이벤트

### dragStart
드래그하여 로우나 컬럼의 이동을 시작했을 때 발생하는 `dragStart` 커스텀 이벤트를 제공한다.

```ts
grid.on('dragStart', ev => {
  console.log(ev);
  // row
  //   ev.rowKey - The rowKey of the row to drag
  //   ev.floatingRow - The floating row DOM element
  // column
  //   ev.columnName - The column name of the column to drag
  //   ev.floatingColumn - The floating column DOM element
});
```

### drag
로우나 컬럼을 드래그할 때 발생하는 `drag` 커스텀 이벤트를 제공한다.

```ts
grid.on('drag', ev => {
  console.log(ev);
  // row
  //   ev.rowKey - The rowKey of the dragging row
  //   ev.targetRowKey - The rowKey of the row at current dragging position
  //   ev.appended - Whether the row is appended to other row as the child in tree data.
  // column
  //   ev.columnName - The column name of the dragging column
  //   ev.targetColumnName - The column name of the column at current dragging position
});
```

### drop
로우나 컬럼을 드롭할 때 발생하는 `drop` 커스텀 이벤트를 제공한다.

```ts
grid.on('drop', ev => {
  console.log(ev);
  // row
  //   ev.rowKey - The rowKey of the dragging row
  //   ev.targetRowKey - The rowKey of the row at current dragging position
  //   ev.appended - Whether the row is appended to other row as the child in tree data.
  // column
  //   ev.columnName - The column name of the dragging column
  //   ev.targetColumnName - The column name of the column at current dragging position
});
```

## 이외의 동작
포커스나 셀렉션은 드래그 앤 드롭을 시작할 때 초기화 한다.

floating row(`tui-grid-floating-row`, `tui-grid-floating-column`, `tui-grid-floating-cell`, `tui-grid-floating-tree-cell-content`), floating line(`tui-grid-floating-line`), 이동하려는 위치의 로우(`tui-grid-cell.dragging`, `tui-grid-cell.parent-cell`)의 스타일은 css class를 오버라이딩하여 재지정할 수 있다. 별도의 테마로 지정하는 방식은 아직 지원하지 않는다.

## 예제

드래그 앤 드롭 기능 예제는 [여기](http://nhn.github.io/tui.grid/latest/tutorial-example28-drag-and-drop)서 확인해 볼 수 있다.
