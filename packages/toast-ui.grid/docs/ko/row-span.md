# 로우 스팬 🖖

TOAST UI Grid는 연속되는 로우들의 데이터를 컬럼 단위로 병합할 수 있는 로우 스팬 기능을 제공한다. 병합된 셀 자체가 하나의 셀로 간주되므로, `focus`, `selection` 의 경우에도 여러 개의 셀이 아닌 하나의 셀로서 동작한다.

## 로우 스팬 UI

로우 스팬이 적용된 경우, 로우의 특정 셀들이 병합되어 아래처럼 표현된다.

![row-span](https://user-images.githubusercontent.com/37766175/62029543-cdea7080-b21d-11e9-9411-5ed8e2a734b2.png)

## 옵션

병합 대상 컬럼의 `rowSpan` 속성 값을 `true`로 설정한다.

```ts
const grid = new Grid({
  // ...,
  columns: [
      {
        header: 'Name',
        name: 'name',
        rowSpan: true
      },
      {
        header: 'Artist',
        name: 'artist',
        rowSpan: true
      }
    ],
  // ...
});
```

## 로우 스팬 동작

### 기본 데이터
그리드 생성 시 선택한 컬럼에 대해 로우 스팬을 적용한다.

<img width="800" src="https://user-images.githubusercontent.com/41339744/145195724-95a31ddb-9429-4ade-aca4-b0bd22f6c40f.png">

### 필터
필터 적용 시 변경된 데이터에 대해 로우 스팬을 재적용한다.

![](https://user-images.githubusercontent.com/41339744/145195895-bd62f5c7-12e0-44eb-9468-b8f957593ac5.gif)

### D&D
드래그 시작 시 모든 로우 스팬을 초기화 한 후 드롭 시 로우 스팬을 재적용 한다.
![](https://user-images.githubusercontent.com/41339744/145196027-8e4e2b36-d051-47ed-bc72-e0b09e2ac476.gif)

### 정렬
정렬 시 변경된 데이터에 대해 로우 스팬을 재적용한다.

![](https://user-images.githubusercontent.com/41339744/145196155-a51b211e-1a86-455c-968d-a747089115ab.gif)

### 페이지네이션
페이지가 다른 경우 이어지는 값이 같더라도 별도의 로우 스팬을 적용한다.

![](https://user-images.githubusercontent.com/41339744/145196260-f9223857-43ad-4a8e-9452-d95c0dec3f70.gif)

### 에디트
셀 값이 변경된 경우 그에 따라 로우 스팬을 재적용한다. 로우 스팬이 적용된 셀 값을 변경하면 로우 스팬으로 묶인 로우 중 최상단 로우의 셀 값만 변경된다.

![](https://user-images.githubusercontent.com/41339744/145196389-b67242db-9b97-4433-ac5a-03a890f85e0a.gif)

### 컬럼 관계
컬럼 관계 내 최상위 관계의 컬럼을 제외한 하위 컬럼에는 동적 로우스팬을 적용하지 않는다.

<img width="800" src="https://user-images.githubusercontent.com/41339744/145196470-d7a7f437-d096-48c0-b40f-da8aeece25b2.png">

### 트리
트리 데이터의 경우 로우 스팬을 적용하지 않는다.

## 예제

[여기](http://nhn.github.io/tui.grid/latest/tutorial-example29-dynamic-row-span)서 로우 스팬 예제를 확인할 수 있다.


## 데이터 _attributes의 옵션으로 적용 
> **deprecated 됨** 컬럼 옵션으로 적용하라.
### 옵션

`_attributes.rowSpan` 옵션에 병합 대상 컬럼과 개수를 각각 키와 속성으로 설정한다. 

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  data: [
    {
      name: 'Beautiful Lies',
      artist: 'Birdy'
    },
    {
      name: '19',
      artist: 'Adele',
      _attributes: {
        // deprecated
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

### API

`appendRow` 와 `removeRow` API에는 로우 스팬이 적용된 경우만 동작하는 옵션이 있다.

| API | 옵션 | 설명 |
| --- | --- | --- |
| `appendRow`| `extendPrevRowSpan` | 추가된 로우의 이전(위) 로우가 병합된 셀의 가장 하단 로우인 경우, 이를 확장하여 추가 병합할 지 결정하는 옵션이다. 만약 로우가 병합된 셀의 중간에 추가되는 경우는 옵션 값과 상관없이 추가 병합된다. |
| `removeRow`| `keepRowSpanData` | 로우 스팬이 적용된 가장 상단의 로우가 삭제된 경우(병합된 셀의 가장 상단 로우), 다음 로우를 기준으로 로우 스팬을 유지할 지 결정하는 옵션이다. 만약 병합된 셀의 중간에 있는 로우가 삭제된 경우는 옵션 값과 상관없이 기존 병합 상태를 유지한다.|

### 예제

[여기](http://nhn.github.io/tui.grid/latest/tutorial-example06-attributes)서 로우 스팬 예제를 확인할 수 있다.
