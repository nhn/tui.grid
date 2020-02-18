# 클립보드 📎

## 클립보드에 복사하기
Grid 내의 셀을 포커스 또는 선택한 후 `Cmd(Ctrl)` + `c`를 누른다. 복사 작업은 선택된 범위 또는 현재 포커스된 셀에서 이루어진다. Grid는 `\t`(탭)을 구분자로 사용하여 엑셀에서의 복사 붙여넣기도 수월하게 이루어진다.

![clipboard_copy](https://user-images.githubusercontent.com/35371660/59558283-8cb14f00-9029-11e9-85f4-7bcaff5edaf4.gif)

### copyOptions 
복사 옵션은 Grid 옵션 또는 컬럼에서 명시할 수 있다. copyOptions를 이용하여 복사되는 값을 수정할 수 있다.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  copyOptions: {
    useFormattedValue: true,
    useListItemText: true,
    customValue: 'custom'
  }
});

// or

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'type',
      editor: 'text',
      copyOptions: {
        useFormattedValue: true,
        useListItem,
        customValue: (value, rowAttrs, column) => `Column name is ${column.name}`
      }
    }
  ]
})
```

| 속성 | 타입 | 동작 | 
| --- | --- | --- |
| customValue | `string` / `function` | 문자열 또는 함수로 변경된 값을 복사한다. |
| useListItemText | `boolean` | 선택 또는 체크 박스 셀의 값을 listItem의 `value`가 아닌 `text`로 복사한다. |
| useFormattedValue | `boolean` | 셀의 `formatter`와 함께 텍스트를 복사한다. |

만약 여러 복사 옵션을 사용한다면, 다음과 같은 우선순위를 따른다.
1. customValue
2. useListItemText
3. useFormattedValue
4. original data

### customValue 사용 예제

```js
const columns = [
  {
    name: 'release',
    copyOptions: {
      customValue: (value, rowAttrs, column) => `Column name is ${column.name}`
    }
  },
  // ...,
];
const grid = new Grid({
  el: document.getElementById('wrapper'),
  columns,
  // ...,
});
```

![paste_custom](https://user-images.githubusercontent.com/35371660/59573554-8a64f880-90ee-11e9-9f7d-e4cdf950e553.gif)

### copyToClipboard()
선택된 포커스 영역을 복사하는 경우 `copyToClipboard()`를 이용한다. 클립보드 기능은 키 이벤트를 사용하는 것 외에 API를 호출하여 선택된 영역을 복사할 수 있으며, 이때 `copyToClipboard()` 메서드를 사용한다.

```js
const grid = new Grid ({ ... });
grid.copyToClipboard();
```

## 클립보드에서 붙여넣기
Grid를 포커스 또는 선택한 후 `Cmd(Ctrl)` + `v`를 누른다. 셀 에디터를 사용하고 있을 때만 값을 변경할 수 있다.

![clipboard_paste](https://user-images.githubusercontent.com/35371660/59558284-8d49e580-9029-11e9-9598-824595da75d4.gif)

## 예제

클립보드 예제는 [여기](https://nhn.github.io/tui.grid/latest/tutorial-example01-basic)서 확인할 수 있다.