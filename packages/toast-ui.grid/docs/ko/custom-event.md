# 커스텀 이벤트 🛎

TOAST UI Grid는 내장 기능 외에도 커스텀 기능을 확장할 수 있는 강력한 이벤트 시스템을 제공한다.

## 이벤트 핸들러 등록 / 해제하기

인스턴스 메서드인 `on()`을 사용하여 특정 이벤트 핸들러를 등록할 수 있다. 첫 번째 인자는 타겟 이벤트의 이름이고, 두 번째 인자는 등록할 핸들러이다. 

```javascript
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
});

grid.on('click', () => {
  console.log('clicked!!');
})

grid.on('dblclick', () => {
  console.log('double clicked!!');
});
```

인스턴스 메서드인 `off()`를 사용하여 특정 이벤트에서 핸들러를 해제할 수 있다. `on()`과 마찬가지로 첫 번째 인자는 타겟 이벤트의 이름이다. 두 번째 인자도 동일하게 해제할 핸들러이지만 옵셔널 인자이다. 만약 두 번째 인자를 넘기지 않는다면, 이벤트에 등록된 모든 핸들러가 해제된다.

```javascript
grid.off('click');
// or
grid.off('click', onClickHandler);
```

## 옵션 설정을 이용한 이벤트 핸들러 등록

Grid 옵션에서 이벤트 핸들러를 직접 넘겨 설정하는 경우도 있다. 해당 이벤트 핸들러는 `on()` 인스턴스 메소드를 이용하여 등록할 수 없으며, `off()`를 사용하여 이벤트 핸들러를 해제할 필요가 없다. 옵션 설정을 사용하여 등록할 수 있는 이벤트 핸들러는 `onBeforeChange()`, `onAfterChange()`, `onGridMounted()`, `onGridBeforeDestroy()` 4가지이며, 설정 방법은 아래 예제와 같다.

```javascript
const grid = new Grid({
  // ...,
  columns: [
    {
      header: 'Name',
      name: 'name',
      onBeforeChange(ev) {
        console.log('Before change:' + ev);
      },
      onAfterChange(ev) {
        console.log('After change:' + ev);
      },
      editor: 'text',
    }
  ],
  onGridMounted(ev) {
    console.log('mounted' + ev);
  },
  onGridBeforeDestroy(ev) {
    console.log('before destroy' + ev);
  }
});
```

## GridEvent
이벤트가 발생한 경우, `GridEvent` 인스턴스는 이벤트에 등록된 핸들러로 넘겨진다. `GridEvent` 인스턴스에는 이벤트 핸들러에서 유용하게 사용할 수 있는 정보가 담겨있다. 예를 들어 `click` 이벤트가 발생한 경우, `rowKey`, `targetType`, `columnName` 값이 `GridEvent` 인스턴스에 저장되고 이를 이용하여 사용자는 타겟 셀의 주소를 알 수 있다.

```javascript
grid.on('click', (ev) => {
  if (ev.rowKey === 3 && ev.columnName === 'col1') {
    // do something
  }
});
```

`GridEvent` 인스턴스는 이벤트의 기본 동작을 취소하는 `stop()` 메서드를 제공한다. 예를 들어 특정 로우가 선택되는 것을 막고 싶은 경우, `click` 이벤트에 핸들러를 등록하고 `ev.stop()`을 호출하면 된다.

```javascript
grid.on('click', (ev) => {
  if (ev.rowKey === 3) {
    ev.stop();  
  }
});
```

`GridEvent` 인스턴스는 `nativeEvent` 속성을 가질 수 있다. 이는 `click`이나 `mousedown`과 같은 브라우저의 네이티브 이벤트이다.

```javascript
grid.on('mousedown', (ev) => {
  console.log(ev.nativeEvent);
});
```

## 사용할 수 있는 이벤트

- `click` : 테이블 셀을 마우스로 클릭한 경우
- `dblclick` : 테이블 셀을 마우스로 더블 클릭한 경우
- `mousedown` :  테이블 셀을 마우스로 누른 경우
- `mouseover` : 테이블 셀에 마우스 포인터가 들어간 경우
- `mouseout` : 테이블 셀에서 마우스 포인터가 벗어난 경우
- `focusChange` : 테이블 셀 포커스를 선택한 경우
- `columnResize` : 컬럼의 너비를 조정한 경우
- `check`: 로우 헤더의 체크 박스를 선택한 경우
- `uncheck`: 로우 헤더의 체크 박스를 해제한 경우
- `checkAll`: 헤더의 체크 박스를 선택하여 로우 헤더의 모든 체크 박스가 선택된 경우
- `uncheckAll`: 헤더의 체크 박스를 해제하여 로우 헤더의 모든 체크 박스가 해제된 경우
- `selection`: 테이블에서 선택 영역을 변경한 경우
- `editingStart`: 테이블에서 셀 편집을 시작한 경우
- `editingFinish`: 테이블에서 셀 편집을 종료한 경우
- `beforeSort` : 데이터를 정렬하기 전
- `afterSort` : 데이터를 정렬한 후
- `beforeUnsort` : 데이터의 정렬이 해제되기 전
- `afterUnsort` : 데이터의 정렬이 해제된 후
- `sort` : 데이터를 정렬한 후 (**deprecated 됨** `afterSort`를 사용하라)
- `beforeFilter` : 데이터를 필터링하기 전
- `afterFilter` : 데이터를 필터링한 후
- `beforeUnfilter` : 데이터의 필터링이 해제되기 전
- `afterUnfilter` : 데이터의 필터링이 해제된 후
- `filter` : 데이터를 필터링한 경우 (**deprecated 됨** `afterFilter`를 사용하라)
- `beforePageMove` : 페이지를 이동하기 전
- `afterPageMove` : 페이지를 이동한 후
- `scrollEnd` : 스크롤 위치가 가장 하단에 도달한 경우
- `beforeChange`: 하나 또는 여러 개의 셀 값이 변경되기 전
- `afterChange`: 하나 또는 여러 개의 셀 값이 변경된 후
- `dragStart`: 드래그하여 로우의 이동을 시작했을 때(`draggable` 옵션이 활성화된 경우만 발생)
- `drag`: 드래그하여 로우를 이동하는 중(`draggable` 옵션이 활성화된 경우만 발생)
- `drop`: 드래그가 끝나고 로우 이동을 완료하였을 때(`draggable` 옵션이 활성화된 경우만 발생)
- `keydown`: 키 입력을 하였을 때(편집 중에는 발생하지 않음)

`DataSource`를 이용할 때 사용할 수 있는 이벤트는 다음과 같다.

- `beforeRequest` : http 요청을 보내기 전
- `response` : 서버에서 응답을 받았을 경우
- `successResponse` : `response` 이벤트 발생 후 `response.result`가 `true`인 경우
- `failResponse` : `response` 이벤트 발생 후 `response.result`가 `false`인 경우
- `errorResponse` : `response` 이벤트 발생 후 응답이 오류인 경우

트리 컬럼을 활성화했을 때 사용할 수 있는 이벤트는 다음과 같다.

- `expand` : 클릭 이벤트 또는 `expand()`, `expandAll` 메서드를 호출하여 펼치기/접기 버튼이 '펼침' 상태로 변경된 경우
- `collapse` : 클릭 이벤트 또는 `collapse()`, `collapseAll` 메서드를 호출하여 펼치기/접기 버튼이 '접힘' 상태로 변경된 경우

옵션 설정을 이용한 사용할 수 있는 이벤트는 다음과 같다.

- `onBeforeChange` : 셀의 값이 변경되기 전 (**deprecated 됨** `beforeChange`를 사용하라)
- `onAfterChange` : 셀의 값이 변경된 후 (**deprecated 됨** `afterChange`를 사용하라)
- `onGridMounted` : Grid가 DOM에 렌더링된 후
- `onGridUpdated` : Grid의 모든 데이터가 변경되고 Grid가 DOM에 렌더링 된 후
- `onGridBeforeDestroy` : Grid가 DOM에서 사라지기 전

이벤트에 대한 자세한 정보는 [API 문서](https://nhn.github.io/tui.grid/latest/Grid#event-beforeRequest)에서 살펴볼 수 있다.

## 예제

커스텀 이벤트를 사용하는 예제는 [여기](https://nhn.github.io/tui.grid/latest/tutorial-example15-custom-event)서 확인할 수 있다.
