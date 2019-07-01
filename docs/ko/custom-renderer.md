# 커스텀 렌더러 🔩

TOAST UI Grid는 셀 UI를 사용자가 커스터마이징할 수 있도록 커스텀 렌더러(Custom Renderer) 기능을 제공한다. 커스텀 렌더러는 셀 렌더링 작업을 조작하는 데 `formatter`보다 훨씬 유용하다.

Grid 내부에서는 생성자 함수인 `CellRenderer`를 사용해 셀을 렌더링한다. 사용자가 셀 데이터를 커스터마이징할 때, `CellRenderer` 생성자 함수의 인터페이스를 기반으로 사용자 정의 `CellRenderer` 생성자 함수를 생성하여 사용한다. 사용자 정의 `CellRenderer`는 `class` 키워드를 사용하여 선언하는 것을 권장하지만, 사용할 수 없는 경우 `function`과 `prototype`을 사용해도 무방하다.

`CellRenderer` 인터페이스는 다음과 같다.
* `constructor`
  생성자 함수는 셀 요소(`TD`)가 DOM에 추가될 때 호출된다. 루트 요소를 인스턴스 멤버로 저장하는 것이 일반적이므로 나중에 `getElement()`와 `render()`와 같은 다른 메서드에서 사용할 수 있다. 생성자 함수는 셀을 커스터마이징할 때 필요한 속성들을 하나의 객체로 받는다. 속성 객체의 인터페이스는 `CellEditor` 인터페이스와 동일하며, 다음과 같다.

  | 속성 | 타입 | 반환 타입 |
  |--------|--------|--------|
  | `grid` | `Grid` | `grid` 속성은 TOAST UI Grid 인스턴스 그 자체이다. 사용자가 특정 데이터를 다루는 경우 유용하게 쓰일 수 있다. |
  | `rowKey` | `string \| number` | 현재 셀을 포함하고 있는 로우의 `rowKey`. |
  | `columnInfo` | `ColumnInfo` | `columnInfo` 속성은 타겟 셀이 포함된 컬럼의 모든 정보를 담고 있다. `ColumnInfo`의 인터페이스는 [여기](https://github.com/nhn/tui.grid/blob/master/src/store/types.ts)에 정의되어 있다. |
  | `value` | `string \| number \| boolean` | 셀의 현재 값. |

* `getElement`
  `getElement` 메서드는 셀의 루트 DOM 요소를 반환한다. 셀(`TD` 요소)가 추가될 때, 반환되는 요소는 자식 요소로 추가된다.
* `mounted`
  `mounted` 메서드는 `optional`이며, 인풋 요소를 초기화하는 데 사용한다. 이 메서드는 `getElement()`에서 반환되는 루트 요소가 DOM에 추가된 직후 호출된다.
* `render`
  `render` 메서드는 렌더링된 내용과 셀의 값을 동기화하는 데 사용된다. 이 메서드는 셀의 값이 변경될 때마다 호출된다.
* `focused`
  `focused` 메서드는 `optional`이며, 셀이 포커스되었을 때 특정 작업을 추가하고 싶은 경우 사용한다. 이 메서드는 포커스가 변경되어 셀에 적용되었을 때마다 호출된다.
* `beforeDestroy`
  `beforeDestory` 메서드는 `optional`이며, 인풋 요소를 초기화하거나 이벤트를 제거하는 데 사용될 수 있다. 이 메서드는 `getElement()`에서 반환된 루트 요소가 DOM에서 제거되기 직전 호출된다.

사용자는 `props.columnInfo.renderer.options`로 생성자 함수에서 사용할 수 있는 사용자 정의 `Custom Options`를 정의할 수 있다.

다음은 슬라이더를 사용할 수 있는 커스텀 렌더러의 예제 코드이다. 

```javascript
class CustomSliderRenderer {
  constructor(props) {
    const el = document.createElement('input');
    // 다음과 같이 렌더러 커스텀 옵션에 접근할 수 있다.
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

사용자 정의 `Custom Renderer`를 사용하기 위해 `columns`의 `renderer.type` 옵션을 함께 명시한다. `Custom Options`를 `Custom Renderer`에서 사용하고 싶다면 `renderer.options`에 `Custom Options`를 설정한다.

```javascript
import Grid from 'tui-grid';

const grid = new Grid({
  // ... another options
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
    // ...
  ]
});
```

## 예제

커스텀 렌더러를 사용하는 예제는 [여기](https://nhn.github.io/tui.grid/latest/tutorial-example04-custom-renderer)서 확인할 수 있다.