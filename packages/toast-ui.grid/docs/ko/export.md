# 내보내기 💾

TOAST UI Grid는 `v4.19.0` 버전 부터 `csv`와 엑셀(`xlsx`, `xls`(`v4.21.19` 이후))로 내보내기 기능을 제공한다. `export` API 또는 컨텍스트 메뉴의 `내보내기` 하위 메뉴를 통해 내보내기를 진행할 수 있다.

## 옵션

`export` API의 옵션은 객체 형태로 정의하며 각 프로퍼티는 아래와 같다.

| 프로퍼티 | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `includeHeader` | `boolean` | `true` | 내보내는 파일에 헤더 포함 여부를 결정한다.<br>CSV 내보내기의 경우 복합 컬럼을 사용 중이면 옵션 값과 상관없이 헤더를 내보내지 않는다. |
| `includeHiddenColumns` | `boolean` | `false` | 내보내는 파일에 숨겨진 컬럼의 포함 여부를 결정한다.<br>값이 참이면 모든 컬럼을 내보낸다. |
| `columnNames` | `string[]` | `[...보이는 모든 컬럼명]` | 내보내려는 컬럼을 선택한다.<br>해당 배열에 요소가 1개 이상 전달되면 `includeHiddenColumns` 옵션의 값과 상관 없이 전달 받은 컬럼을 내보낸다. |
| `onlySelected` | `boolean` | `false` | 선택한 영역만 내보낼지 여부를 결정한다.<br>값이 참이면 `includeHiddenColumns` 옵션과 `columnNames` 옵션의 값과 상관 없이 현재 선택한 영역만 내보낸다.<br>선택 영역이 없다면 옵션 값과 상관 없이 지정한 컬럼의 데이터 또는 숨겨진 컬럼을 포함한 모든 컬럼의 데이터 또는 보이는 컬럼의 데이터를 내보낸다. |
| `onlyFiltered` | `boolean` | `true` | 필터링된 데이터만 내보낼지 여부를 결정한다.<br>값이 참이면 필터링된 데이터만 내보내고, 거짓이면 모든 데이터를 내보낸다. |
| `useFormattedValue` | `boolean` | `false` | 포맷된 데이터를 내보낼지 여부를 결정한다.<br>값이 참이면 포맷된 데이터를 내보내고, 거짓이면 원본 데이터를 내보낸다. |
| `delimiter` | `','\|';'\|'\t'\|'\|'` | `','` | CSV 내보내기 시 구분자를 정의한다. |
| `fileName` | `string` | `'grid-export'` | 내보낼 파일의 이름을 정의한다. |

## API

### export

인자로 주어진 포맷과 내보내기 옵션에 따라 파일을 내보낸다.(`ExportOpt`은 위에서 설명한 옵션과 같은 객체이다)

`export(format: 'txt' | 'csv' | 'xlsx' | 'xls', exportOpt?: ExportOpt)`

```js
const options = {
  includeHiddenColumns: true,
  onlySelected: true,
  fileName: 'myExport',
};

grid.export('csv');
grid.export('xlsx');
grid.export('xlsx', options);
```

## 컨텍스트 메뉴

### 기본 컨텍스트 메뉴
그리드의 컨텍스트 메뉴에 `Export` 하위 메뉴로 `CSV Export`, `Excel Export` 메뉴가 추가된다.

각 메뉴 클릭 시 선택한 포맷으로 다운로드가 시작된다.

<img width="435" alt="context menu for export" src="https://user-images.githubusercontent.com/41339744/132184356-3bde459b-ec08-4443-8cea-90d41d6604a7.png">

### 커스텀 컨텍스트 메뉴
초기 설정 옵션 이외의 다른 옵션을 이용해 내보내기를 수행하고 싶다면 아래와 같이 컨텍스트 메뉴를 설정한다.

```js
const grid = Grid({
  // ...
  contextMenu: ({ rowKey, columnName }) => (
    [
      [
        {
          name: 'export',
          label: 'Export',
          subMenu: [
            // 기본 설정 옵션을 이용한 내보내기
            {
              name: 'default',
              label: 'Default',
              subMenu: [
                {
                  name: 'csvExport',
                  label: 'CSV export',
                  action: () => {
                    // 옵션을 전달하지 않으면 초기 설정 옵션으로 내보내기가 수행된다.
                    grid.export('csv');
                  }
                },
                {
                  name: 'excelExport',
                  label: 'Excel export',
                  action: () => {
                    grid.export('xlsx');
                  }
                },
              ]
            },
            // 지정한 다른 옵션을 이용한 내보내기 추가
            {
              name: 'withoutHeader',
              label: 'Without header',
              subMenu: [
                {
                  name: 'csvExport',
                  label: 'CSV export',
                  action: () => {
                    // 옵션을 전달해 초기 옵션이 아닌 다른 옵션으로 내보내기를 수행한다.
                    // 만약 옵션을 모달을 통해 전달받아 내보내기를 수행하길 원한다면 이곳에 해당 기능을 수행하는 코드를 작성하면 된다.
                    grid.export('csv', { includeHeader: false });
                  }
                },
                {
                  name: 'excelExport',
                  label: 'Excel export',
                  action: () => {
                    grid.export('xlsx', { includeHeader: false });
                  }
                },
              ]
            },
          ],
        }
      ],
    ]
  ),
  // ...
});
```
<img width="636" alt="custom context menu for export" src="https://user-images.githubusercontent.com/41339744/132184363-8d4560b1-c64d-48b8-8c53-83c135af8545.png">

> 컨텍스트 메뉴의 가이드는 [📒 컨텍스트 메뉴](./contextMenu.md)에서 살펴볼 수 있다.

## 커스텀 이벤트

### beforeExport

내보내기 전에 발생하는 `beforeExport` 커스텀 이벤트를 제공한다.

```js
grid.on('beforeExport', ev => {
  console.log(ev);
  // ev.exportFormat - Export format ('txt' | 'csv' | 'xlsx' | 'xls')
  // ev.exportOptions - Used export options
  // ev.data - Data to be finally exported (string[][])
});
```


만약 기본 내보내기 동작을 취소하고 서버에서 데이터를 받아온 데이터를 추가하여 내보내고 싶다면, 아래처럼 제어할 수 있다.

```js
grid.on('beforeExport', ev => {
  ev.stop();

  let { exportFn, data } = ev;

  fetch('www.example.com/grid-data').then((targetData) => {
    // 기존 데이터의 컬럼 순서와 서버에서 받아 온 데이터의 컬럼 데이터 순서를 반드시 일치시켜 주어야 한다.
    targetData.forEach((row) => {
      data.push(Object.keys(targetData).map((col) => {
        return row[col]
      }));
    })

    exportFn(data);
  });
});
```

### afterExport

내보내기 후에 발생하는 `afterExport` 커스텀 이벤트를 제공한다.

```js
grid.on('afterExport', ev => {
  console.log(ev);
  // ev.exportFormat - Export format ('txt' | 'csv' | 'xlsx' | 'xls')
  // ev.exportOptions - Used export options
  // ev.data - Data to be finally exported (string[][])
});
```

## 주의사항

### 옵션 우선순위
옵션의 우선순위는 열의 경우 `includeHiddenColumns` => `columnNames` => `onlySelected` 순으로, 행의 경우 `onlyFiltered` => `onlySelected` 순으로 높아진다.
즉, `onlySelected`의 값이 `true`이면 다른 세 옵션의 값과 상관없이 선택 영역의 데이터만 내보낸다.

### 복합 컬럼
엑셀 내보내기는 복합 컬럼을 지원하지만 CSV 내보내기는 이를 지원하지 않는다. 만약 복합 컬럼을 사용하는 중에 CSV 내보내기를 수행하면 컬럼 헤더는 내보내지 않는다.

### 로우 헤더 컬럼
로우 헤더 컬럼의 경우 행의 번호만 나타내는 컬럼을 내보낸다.

### 엑셀 내보내기
그리드의 엑셀 내보내기 기능은 [SheetJS](https://sheetjs.com/)(v0.17.1)를 사용하므로 엑셀 내보내기 기능을 사용하려면 SheetJS를 추가한다.
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.1/xlsx.full.min.js"></script>
```

`xlsx` 포맷을 지원하지 않는 구 버전 Excel 등에서 열 수 있는 파일 내보내기를 위해 `xls` 포맷을 지원한다.
또한 기본 엑셀 내보내기 포맷을 `xlsx`에서 `xls`로 변경하기 위해 `excelCompatibilityMode` 옵션을 사용할 수 있다.

```js
const grid = Grid({
  // ...
  exportOptions: {
      excelCompatibilityMode: true,
  },
  // ...
});
```

### 브라우저 지원 범위
| <img src="https://user-images.githubusercontent.com/1215767/34348387-a2e64588-ea4d-11e7-8267-a43365103afe.png" alt="Chrome" width="16px" height="16px" /> Chrome | <img src="https://user-images.githubusercontent.com/1215767/34348590-250b3ca2-ea4f-11e7-9efb-da953359321f.png" alt="IE" width="16px" height="16px" /> Internet Explorer | <img src="https://user-images.githubusercontent.com/1215767/34348380-93e77ae8-ea4d-11e7-8696-9a989ddbbbf5.png" alt="Edge" width="16px" height="16px" /> Edge | <img src="https://user-images.githubusercontent.com/1215767/34348394-a981f892-ea4d-11e7-9156-d128d58386b9.png" alt="Safari" width="16px" height="16px" /> Safari | <img src="https://user-images.githubusercontent.com/1215767/34348383-9e7ed492-ea4d-11e7-910c-03b39d52f496.png" alt="Firefox" width="16px" height="16px" /> Firefox |
| :---: | :---: | :---: | :---: | :---: |
| Yes | 10+ | Yes | Yes | Yes |

> 내보내기 기능은 `v4.19.0` 이상부터 사용할 수 있다.
