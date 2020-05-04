# 커스텀 에디터 🛠

셀 데이터를 효과적으로 표현하기 위해 `CellEditor` 생성자 함수의 인터페이스를 기반으로 커스텀 에디터를 사용할 수 있다. TOAST UI Grid는 사용자가 등록한 `CellEditor` 생성자 함수를 이용하여 내부적으로 인스턴스를 생성한 후, 반환된 요소를 DOM에 추가한다. 커스텀 에디터는 `class` 키워드를 사용하여 선언하는 것을 권장하지만, 사용할 수 없는 경우 `function`과 `prototype`을 사용해도 무방하다.

`CellEditor` 인터페이스는 아래와 같다.(`CellEditor`의 인터페이스 구조는 [types/editor/index.d.ts](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/types/editor/index.d.ts)을 참고한다.)
* `constructor` 
  생성자 함수는 셀의 에디팅이 시작될 때 마다 호출된다. 일반적으로 루트 엘리먼트를 인스턴스 멤버로 저장하는 작업을 수행한다. 이렇게 저장된 멤버들은 `getElement()` 와 `getValue()` 메서드를 통해 접근할 수 있다. 생성자의 인자로 편집 UI를 커스터마이징 할 수 있는 유용한 정보들을 담은 객체를 전달받는다. 인자로 전달되는 객체는 아래와 같은 정보를 담고 있다.        

  | 속성 | 타입 | 반환 타입 |
  |--------|--------|--------|
  | `grid` | `Grid` | `grid` 속성은 Grid 인스턴스를 참조하고 있다. Grid의 특정 데이터를 얻거나 직접 조작할 때 유용하게 사용할 수 있다. |
  | `rowKey` | `string \| number` | 현재 셀을 포함하고 있는 로우의 `rowKey` 값이다. |
  | `columnInfo` | `ColumnInfo` | `columnInfo` 속성은 타겟 셀이 포함된 컬럼의 모든 정보를 담고 있다. `ColumnInfo`의 인터페이스는 [여기](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/types/store/column.d.ts)에 정의되어 있다. |
  | `value` | `string \| number \| boolean` | 셀의 현재 값 |

* `getElement` 
  에디터의 루트 DOM 엘리먼트를 반환한다. 편집이 시작되면 반환된 엘리먼트가 편집 대상 셀 위치에 삽입된다.
* `getValue`
  셀의 값을 반환한다. 집이 종료되면 반환된 값이 셀의 데이터 값으로 사용된다.
* `mounted`
  `optional`이며, 인풋 엘리먼트를 초기화하는 데 사용한다. 이 메서드는 `getElement()`에서 반환되는 루트 엘리먼트가 DOM에 추가된 직후 호출된다.
* `beforeDestory`
  `optional`이며, 인풋 엘리먼트를 삭제할 때 사용할 수 있다. `getElement()` 로 반환된 엘리먼트가 DOM에서 제거되기 직전 실행된다.

다음은 간단한 텍스트 에디터의 예제 코드이다.

```js
class CustomTextEditor {
  constructor(props) {
    const el = document.createElement('input');

    el.type = 'text';
    el.value = String(props.value);

    this.el = el;
  }

  getElement() {
    return this.el;
  }

  getValue() {
    return this.el.value;
  }

  mounted() {
    this.el.select();
  }
}
```

위 예제와 같은 사용자 정의 `Custom Editor`는 `columns` 배열에 제공되는 컬럼 정보 객체의 `editor.type` 옵션으로 설정하여 사용할 수 있다. `Custom Editor`에서 별도의 사용자 정의 옵션이 필요하다면 `editor.options`에 설정한다.

```js
const grid = new Grid({
  // ...,
  columns: [
    {
      header: 'Custom',
      name: 'custom',
      editor: {
        type: CustomTextEditor,
        options: {
          customTextEditorOptions: {
            // ...,
          }
        }
      }        
    }
    // ...,
  ]
});
```

설정한 사용자 정의 옵션은 `Custom Editor`의 생성자 함수에서 사용될 수 있다. 아래 예제처럼 생성자 함수에 전달되는 `props` 인자 객체에서 `columnInfo.editor.options.customTextEditorOptions` 경로로 접근할 수 있다.

```js
class CustomTextEditor {
  constructor(props) {
    const customOptions = props.columnInfo.editor.options.customTextEditorOptions;
    // ...,
  }
  // ...,
}
```


## 내장 에디터

TOAST UI Grid에는 다양한 에디터가 내장되어 있으며, `columns` 배열에 제공되는 컬럼 정보 객체의 `editor` 옵션에 설정하여 사용할 수 있다.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      header: 'ID',
      name: 'id',
      editor: 'text'
    },
    {
      header: 'PASSWORD',
      name: 'password',
      editor: 'password'
    }
  ]
});
```

사용 가능한 내장 에디터는 총 5개가 있다.

- **text** : Text input (`input[type=text]`)
- **password** : Password input (`input[type=password]`)
- **checkbox** : Check box (`input[type=checkbox]`)
- **radio** : Radio button (`input[type=radio]`)
- **select** : Select box (`select`)


## editor.options.listItems 사용하기

`checkbox`, `radio`, `select`와 같은 에디터 타입들을 사용하려면 리스트 옵션을 설정해야 한다. 리스트 옵션은 `editor.options.listItems` 과 `formatter` 옵션(`listItemText` 내장 포매터)을 이용하여 설정한다.

```js
const columns = [
  {
    header: 'BROWSER',
    name: 'browser',
    formatter: 'listItemText',
    editor: {
      type: 'checkbox',
      options: {
        listItems: [
          { text: 'IE 9', value: 1 },
          { text: 'IE 10', value: 2 },
          { text: 'IE 11', value: 3 },
          { text: 'Firefox', value: 4 },
          { text: 'Chrome', value: 5 }
        ]
      }
    }        
  }
  // ...,
];

const grid = new Grid({
  //...options
  columns  
});
```

`editor.options.listItems` 는 배열이며 각각의 엘리먼트들은 `text` 와 `value` 속성을 갖고 있다. `listItemText` 내장 포매터를 설정한다면 `text` 속성은 셀의 레이블로 사용되고 `value` 속성은 셀의 내부 값으로 사용된다.

## checkbox 타입의 값

다른 타입들과 달리 `checkbox` 는 다중 값을 사용한다. 여러 개의 체크박스가 선택된 경우, 셀의 값은 선택된 값들이 콤마로 연결된 문자열이 된다. 예를 들어 'browser' 컬럼이 위 예제와 같다면, 'IE9', 'Firfox', 'Chrome' 이 체크된 경우 셀의 값은 `'1,4,5'` 가 된다.


## 예제

다양한 내장 에디터 및 커스텀 에디터의 예제들은 [여기](https://nhn.github.io/tui.grid/latest/tutorial-example03-custom-editor)서 확인할 수 있다.