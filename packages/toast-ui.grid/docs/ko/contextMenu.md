# 컨텍스트 메뉴 📒

TOAST UI Grid는 `v4.18.0` 버전부터 컨텍스트 메뉴 기능을 제공한다. 셀에서 마우스 우측 버튼을 누르면 컨텍스트 메뉴가 나오며, `contextMenu` 옵션으로 원하는 컨텍스트 메뉴를 설정할 수 있다.

### 옵션
`contextMenu` 옵션은 함수나 `null`이 되어야 하며, 함수의 반환값은 아래와 같은 2차원 배열이어야 한다.

```js
const grid = Grid({
  // ...
  contextMenu: ({ rowKey, columnName }) => (
    // 2차원 배열을 반환
    [
      [
        {
          name: 'id1',
          label: 'menu1',
          action: 'copyRows',
          classNames: ['my']
        },
        {
          name: 'id2',
          label: 'menu2',
          action: () => {
            console.log('menu2');
          },
          subMenu: [
            {
              name: 'id3',
              label: 'subMenu1',
            },
          ],
        },
      ],
      [
        {
          name: 'id4',
          label: 'menu3',
          action: () => {
            console.log('menu3');
          }
        },
      ],
    ]
  ),
  // ...
});
```

먼저 각각의 메뉴 그룹을 배열 형태로 정의하며 그룹 내의 메뉴 항목들을 배열의 원소로 지정한다. 각 요소들은 정의된 순서대로 그룹 내에서 렌더링된다. 위의 예제 코드는 아래 이미지처럼 `menu1`, `menu2`와 `menu3`이 그룹으로 나누어 렌더링된다.

![image](https://user-images.githubusercontent.com/37766175/123938532-2a3e0800-d9d2-11eb-9ded-ec4562cb026e.png)

`contextMenu` 옵션이 `null`이면 컨텍스트 메뉴는 비활성화 되며 브라우저의 기본 컨텍스트 메뉴가 활성화 된다.

![image](https://user-images.githubusercontent.com/41339744/142086149-bb853f02-08e0-41cf-9a46-5dc48c85db20.gif)

#### 동적 컨텍스트 메뉴
`contextMenu` 옵션으로 설정한 함수는 `rowKey`, `columnName`로 구성된 객체를 인자로 받는다. 이 객체는 컨텍스트 메뉴를 띄운 셀의 `rowKey`, `columnName`을 의미하며, 아래처럼 동적으로 메뉴 구성을 변경하고 싶은 경우 사용한다.

```js
function createContextMenu({ rowKey, columnName }) {
  // 'name' 컬럼에서 컨텍스트 메뉴를 활성화 하였을 경우 메뉴 구성을 다르게 보여준다.
  if (columnName === 'name') {
    return [
      [
        {
          name: 'id1',
          label: 'menu1',
          action: 'copyRows'
        }
      ]
    ]
  }
  return [
    //...
  ]
}
```

#### 컨텍스트 메뉴 구성 요소
각 메뉴 항목은 아래와 같은 프로퍼티로 구성된다.

| 프로퍼티 | 타입 | 설명 |
|--------|--------|--------|
| `name` | `string` | 메뉴를 구분하기 위한 이름으로 필수값이다. 반드시 유일한 값이어야 한다. |
| `label` | `string` | 메뉴의 텍스트를 설정하며, 필수값이다. html 텍스트 형태로도 정의할 수 있다. |
| `action` | `function` | 메뉴를 클릭하였을 때 실행 될 함수이다. |
| `classNames` | `Array<string>` | 메뉴에 적용할 CSS 클래스를 정의한다. |
| `disabled` | `boolean` | 메뉴의 비활성화를 결정한다. |
| `subMenu` | `Array<ContextMenuItem>` | 서브 메뉴를 정의하며,  재귀적으로 같은 옵션(`name`, `label`, `action` 등)을 가진다. |

![image](https://user-images.githubusercontent.com/37766175/123945118-c4a14a00-d9d8-11eb-9035-e6b700ddb701.png)

### 디폴트 컨텍스트 메뉴
`contextMenu` 옵션으로 원하는 메뉴를 설정하지 않을 경우에는 아래와 같은 항목으로 구성된 디폴트 컨텍스트 메뉴가 활성화된다.

* `Copy`: 포커스된 셀 데이터를 복사
* `Copy Columns`: 선택된 셀 영역의 컬럼을 모두 복사
* `Copy Rows`: 선택된 셀 영역의 로우를 모두 복사

![image](https://user-images.githubusercontent.com/37766175/123945765-72acf400-d9d9-11eb-8632-6a2a44b00386.png)

> **참조**
> 컨텍스트 메뉴는 `v4.18.0` 이상부터 사용할 수 있다.