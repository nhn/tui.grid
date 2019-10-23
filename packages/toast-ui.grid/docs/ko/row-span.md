# 로우 스팬 🖖

TOAST UI Grid는 연속되는 로우들의 데이터를 컬럼 단위로 병합할 수 있는 로우 스팬 기능을 제공한다. 병합된 셀 자체가 하나의 셀로 간주되므로, `focus`, `selection` 의 경우에도 여러 개의 셀이 아닌 하나의 셀로서 동작한다.

## 로우 스팬 UI

로우 스팬이 적용된 경우, 로우의 특정 셀들이 병합되어 아래처럼 표현된다.

![row-span](https://user-images.githubusercontent.com/37766175/62029543-cdea7080-b21d-11e9-9411-5ed8e2a734b2.png)

## 옵션

`_attributes.rowSpan` 옵션에 병합 대상 컬럼과 개수를 각각 키와 속성으로 설정한다. 

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ... another options
  data: [
    {
      name: 'Beautiful Lies',
      artist: 'Birdy'
    },
    {
      name: '19',
      artist: 'Adele',
      _attributes: {
        rowSpan: { // Merge rows
          artist: 3
        }
      }
    },
    {
      name: '21',
      artist: 'Adele'
    },
    {
      name: '25',
      artist: 'Adele'
    }
  ],
  columns: [
      {
        header: 'Name',
        name: 'name'
      },
      {
        header: 'Artist',
        name: 'artist'
      }
    ]
});
```

## API

`appendRow` 와 `removeRow` API에는 로우 스팬이 적용된 경우만 동작하는 옵션이 있다.

| API | 옵션 | 설명 |
| --- | --- | --- |
| `appendRow`| `extendPrevRowSpan` | 추가된 로우의 이전(위) 로우가 병합된 셀의 가장 하단 로우인 경우, 이를 확장하여 추가 병합할 지 결정하는 옵션이다. 만약 로우가 병합된 셀의 중간에 추가되는 경우는 옵션 값과 상관없이 추가 병합된다. |
| `removeRow`| `keepRowSpanData` | 로우 스팬이 적용된 가장 상단의 로우가 삭제된 경우(병합된 셀의 가장 상단 로우), 다음 로우를 기준으로 로우 스팬을 유지할 지 결정하는 옵션이다. 만약 병합된 셀의 중간에 있는 로우가 삭제된 경우는 옵션 값과 상관없이 기존 병합 상태를 유지한다.|

## 예제

[여기](http://nhn.github.io/tui.grid/latest/tutorial-example06-attributes)서 로우 스팬 예제를 확인할 수 있다.
