# 커스텀 렌더러 🔩

TOAST UI Grid는 셀 UI를 사용자가 커스터마이징할 수 있도록 커스텀 렌더러를 제공한다. 커스텀 렌더러는 셀 렌더링 작업을 조작하는 데 `formatter`보다 훨씬 유용하다.

`CellRenderer` 생성자 함수의 인터페이스를 기반으로 커스텀 렌더러를 사용할 수 있다. TOAST UI Grid는 사용자가 등록한 `CellRenderer` 생성자 함수를 이용하여 내부적으로 인스턴스를 생성한 후, 반환된 엘리먼트를 DOM에 추가한다. 커스텀 렌더러는 `class` 키워드를 사용하여 선언하는 것을 권장하지만, 사용할 수 없는 경우 `function`과 `prototype`을 사용해도 무방하다.

`CellRenderer` 인터페이스는 다음과 같다.(`CellRenderer`의 인터페이스 구조는 [types/renderer/index.d.ts](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/types/renderer/index.d.ts)을 참고한다.)
* `constructor`
  생성자 함수는 셀 엘리먼트(`<td>`)가 DOM에 추가될 때 호출된다. 일반적으로 루트 엘리먼트를 인스턴스 멤버로 저장하는 작업을 수행한다. 이렇게 저장된 멤버들은 `getElement()` 와 `getValue()` 메서드를 통해 접근할 수 있다. 생성자 함수의 인자로 넘어오는 객체의 인터페이스는 `CellEditor` 인터페이스와 동일하며, 다음과 같다.

  | 속성 | 타입 | 반환 타입 |
  |--------|--------|--------|
  | `grid` | `Grid` | `grid` 속성은 Grid 인스턴스를 참조하고 있다. Grid의 특정 데이터를 얻거나 직접 조작할 때 유용하게 사용할 수 있다. |
  | `rowKey` | `string \| number` | 현재 셀을 포함하고 있는 로우의 `rowKey` 값이다. |
  | `columnInfo` | `ColumnInfo` | `columnInfo` 속성은 타겟 셀이 포함된 컬럼의 모든 정보를 담고 있다. `ColumnInfo`의 인터페이스는 [여기](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/types/store/column.d.ts)에 정의되어 있다. |
  | `value` | `string \| number \| boolean` | 셀의 현재 값 |

* `getElement`
  셀의 루트 DOM 엘리먼트를 반환한다. 셀(`<td>` 엘리먼트)이 추가될 때, 반환된 엘리먼트가 자식으로 삽입된다.
* `mounted`
  `optional`이며, 인풋 엘리먼트를 초기화하는 데 사용한다. 이 메서드는 `getElement()`에서 반환되는 루트 엘리먼트가 DOM에 추가된 직후 호출된다.
* `render`
  렌더링된 내용과 셀의 값을 동기화하는 데 사용된다. 이 메서드는 셀의 값이 변경될 때마다 호출된다.
* `focused`
  `optional`이며, 셀이 포커스되었을 때 특정 작업을 추가하고 싶은 경우 사용한다. 이 메서드는 포커스가 변경되어 셀에 적용되었을 때마다 호출된다.

다음은 슬라이더를 사용할 수 있는 커스텀 렌더러의 예제 코드이다. 

```javascript
class CustomSliderRenderer {
  constructor(props) {
    const el = document.createElement('input');
    const { min, max } = props.columnInfo.renderer.options;

    el.type = 'range';
    el.min = String(min);
    el.max = String(max);

    el.addEventListener('mousedown', (ev) => {
      ev.stopPropagation();
    });

    this.el = el;
    this.render(props);
  }

  getElement() {
    return this.el;
  }

  render(props) {
    this.el.value = String(props.value);
  }
}
```

위 예제와 같은 사용자 정의 `Custom Renderer`는 `columns` 배열에 제공되는 컬럼 정보 객체의 `renderer.type` 옵션으로 설정하여 사용할 수 있다. `Custom Renderer`에서 별도의 사용자 정의 옵션이 필요하다면 `renderer.options`에 설정한다.

```javascript
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      header: 'Custom',
      name: 'custom',
      renderer: {
        type: CustomSliderRenderer,
        options: {
          min: 0,
          max: 30
        }
      }        
    }
    // ...,
  ]
});
```

설정한 사용자 정의 옵션은 `Custom Renderer`의 생성자 함수에서 사용될 수 있다. 아래 예제처럼 생성자 함수에 전달되는 `props` 인자 객체에서 `columnInfo.renderer.options.min` 경로로 접근할 수 있다.


```js
class CustomTextECustomSliderRendererditor {
  constructor(props) {
    const el = document.createElement('input');
    // 다음과 같이 렌더러 커스텀 옵션에 접근할 수 있다.
    const { min, max } = props.columnInfo.renderer.options;
    // ...,
  }
  // ...,
}
```

## 디폴트 렌더러 스타일링

커스텀 렌더러는 유용한 옵션이지만 셀에 간단한 스타일이나 속성을 추가하고 싶은 경우에 사용하기에는 번거롭다.
TOAST UI Grid는 이러한 점을 보완하기 위해 디폴트 렌더러에 옵션을 지정하여 간단한 스타일링을 할 수 있게 옵션을 제공한다. `renderer` 옵션의 하위 객체로 `styles`, `attributes`, `classNames`을 설정하면 디폴트 렌더러를 통해서도 간단한 스타일링 및 속성을 추가할 수 있다. `styles`, `attributes`, `classNames` 각 옵션들의 특징은 아래와 같다.

* `styles`
  셀의 스타일을 추가하는데 사용한다. 이 옵션 객체는 CSS 프로퍼티 명을 키 값으로 가지며, 프로퍼티 값으로 CSS 프로퍼티의 값 또는 CSS 프로퍼티의 값을 반환하는 함수를 가진다. 만약 함수의 값을 가지는 경우 `props` 매개 변수를 통해 셀의 값이나 컬럼 정보에 접근할 수 있다.
  ```js
  styles: {
    fontWeight: 'bold',
    color: (props) => props.value.length > 3 ? '#ccc' : '#222';
  },
  ```
* `attributes`
  셀에 원하는 속성을 추가하는데 사용한다. 이 옵션 객체는 속성 명을 키 값으로 가지며, 값으로 문자열 값 또는 문자열 값을 반환하는 함수를 가진다. 만약 함수의 값을 가지는 경우 `props` 매개 변수를 통해 셀의 값이나 컬럼 정보에 접근할 수 있다.
  ```js
  attributes: {
    'data-type': 'default'
    title: (props) => `title: ${props.formattedValue}`
  },
  ```
* `classNames`
  셀에 원하는 class를 지정한다. 문자열 배열 형태의 데이터로 옵션을 설정한다.
  ```js
  classNames: ['my-styled-cell'],
  ```

위의 옵션들은 디폴트 렌더러에 아래처럼 적용할 수 있다.

```js
const columns = [
  {
    name: 'name',
    renderer: {
      styles: {
        fontWeight: 'bold',
        color: (props) => props.value.length > 3 ? '#ccc' : '#222';
      },
      attributes: {
        'data-type': 'default'
        title: (props) => `title: ${props.formattedValue}`
      },
      classNames: ['my-styled-cell'],
    },
  },
];
const grid = new Grid({
  // ...,
  columns
});
```

> **참조**
> 디폴트 렌더러의 `styles`, `attributes`, `classNames` 옵션들은 `v4.16.1` 이상부터 사용할 수 있다.

## 예제

커스텀 렌더러를 사용하는 예제는 [여기](https://nhn.github.io/tui.grid/latest/tutorial-example04-custom-renderer)서 확인할 수 있다.