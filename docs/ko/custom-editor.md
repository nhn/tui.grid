# 커스텀 에디터 🛠

셀 데이터를 효과적으로 표현하기 위해 `CellEditor` 포맷의 커스텀 에디터들을 사용할 수 있다. `CellEditor` 는 생성자 함수로 TOAST UI Grid가 내부에서 `new` 키워드로 인스턴스를 생성한다. `class` 키워드를 사용해서 정의할 것을 권장하지만 사용할 수 없는 환경이라면 `function` 과 `prototype` 을 사용해 정의해도 문제는 없다.

(성호 코맨트: 뒷부분은 너무 당연한 사족들인것같아용 중요한건 CellEditor 타입을 정의하는건데 이거 혹시 타입스크립트 인터페이스로 정의되어 있지 않나요? 타입스크립트도 사용했으니 용어도 그렇고 포맷보다는 차라리 인터페이스를 활용해 설명하는게 좋지 않을까 싶어요)

`CellEditor` 포맷은 아래와 같다.
* `constructor` 
  생성자 함수는 셀의 에디팅이 시작될 때 마다 호출된다. 일반적으로 루트 엘리먼트를 인스턴스 멤버로 저장하는 작업을 수행한다. 이렇게 저장된 멤버들은 `getElement()` 와 `getValue()` 메서드를 통해 접근할 수 있다. 생성자의 인자로 편집 UI를 커스터마이징 할 수 있는 유용한 정보들을 담은 객체를 전달받는다. 인자로 전달되는 객체는 아래와 같은 정보를 담고 있다.        

  | 속성 | 타입 | 반환 타입 |
  |--------|--------|--------|
  | `grid` | `Grid` | `grid` 속성은 Grid 인스턴스를 참조하고 있다. 그리드의 특정 데이터를 얻거나 직접 조작할 때 유용하게 사용할 수 있다. |
  | `rowKey` | `string \| number` | `rowKey` 속성은 현재 셀을 포함하고 있는 row의 키값이다. |
  | `columnInfo` | `ColumnInfo` | `columnInfo` 속성은 셀이 포함된 컬럼의 모든 정보를 갖고 있다. `ColumnInfo`의 인터페이스는 [여기](https://github.com/nhn/tui.grid/blob/master/src/store/types.ts)에 정의되어 있다. |
  | `value` | `string \| number \| boolean` | 셀의 현재 값 |

* `getElement` 
  `getElement` 메서드는 에디터의 루트 DOM 엘리먼트를 리턴한다. 편집이 시작되면 리턴된 엘리먼트가 편집 레이어 DOM에 삽입된다.
* `getValue`
  `getValue` 메서드는 셀의 값을 리턴한다. 편집이 종료되면 리턴된 값이 셀의 데이터 값으로 사용된다.
* `mounted`
  `mounted` 메서드는 선택사항으로 인풋 엘리먼트를 초기화 할 때 사용될 수 있다. 메서드는 `getElement()` 로 리턴된 엘리먼트가 DOM에 삽입된 이후 바로 실행된다.
* `beforeDestory`
  `beforeDestory` 메서드 역시 선택사항으로 인풋 엘리먼트를 삭제할 때 사용할 수 있다. `getElement()` 로 리턴된 엘리먼트가 DOM에서 제거된 직후 실행된다.

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

직접 만든 `Custom Editor`는 `columns` 배열에 제공되는 컬럼 정보 객체에 `editor.type`옵션으로 제공해 사용할 수 있다. `Custom Options`가 `Custom Editor`에서 사용될 필요가 있다면 `editor.options`에 설정한다.

```js
const grid = new Grid({
  // ... another options
  columns: [
    {
      header: 'Custom',
      name: 'custom',
      editor: {
        type: CustomTextEditor,
        options: {
          customTextEditorOptions: {
            // ...
          }
        }
      }        
    }
    // ...
  ]
});
```

`Custom Options`는 생성자 함수에서 사용될 수 있는데 생성자 함수에 전달되는 인자 객체에서 `columnInfo.editor.options.customTextEditorOptions` 경로로 접근할 수 있다.

```js
class CustomTextEditor {
  constructor(props) {
    const customOptions = props.columnInfo.editor.options.customTextEditorOptions;
    // ...
  }
  // ...
}
```


## 내장 에디터

TOAST UI Grid에는 다양한 에디터가 미리 내장되어 있어 쉽게 셀 데이터에서 적용할 수 있다. `columns` 의 `editor` 옵션으로 설정한다.

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ... another options
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

사용가능한 내장 에디터는 총 5개가 있다.

-   text : Text input (input[type=text])
-   password : Password input (input[type=password])
-   checkbox : Check box (input[type=checkbox])
-   radio : Radio button (input[type=radio])
-   select : Select box (select)


## editor.options.listItems 사용하기

`checkbox`, `radio`, `select` 타입 등을 사용하려면 리스트 옵션을 설정해야 한다. 리스트 옵션은 `editor.options.listItems` 과 `listItemText` 내장 포매터 옵션으로 설정한다.

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
  // ...
];

const grid = new Grid({
  //...options
  columns  
});
```

`editor.options.listItems` 는 배열이며 각각의 요소들은 `text` 와 `value` 속성을 갖고 있다. `text` 속성은 각 아이템의 라벨로 사용되고 `value` 속성은 `listItemText` 내장 포매터를 통해 셀의 값으로 사용된다.


## checkbox 타입의 값

다른 타입들과 달리 `checkbox` 는 다중의 값을 사용한다. 여러 개의 체크박스가 체크된 경우 셀의 값은 선택된 체크 박스들의 값이 콤마로 분리되어 연결된 스트링 값이 된다. 예를 들어 'browser' 모델의 컬럼의 샘플이 위와 같은 모습을 하고 있고 'IE9', 'Firfox', 'Chrome' 이 체크된 경우 셀의 값은 `'1,4,5'` 가 된다.


## 예제

다양한 인풋 타입의 예제들은 [여기](https://nhn.github.io/tui.grid/latest/tutorial-example03-custom-editor)서 확인할 수 있다.