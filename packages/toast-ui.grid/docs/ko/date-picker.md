# DatePicker 📅

TOAST UI Grid에 [TOAST UI DatePicker](https://github.com/nhn/tui.date-picker)를 쉽게 도입할 수 있다. 컬럼에 [셀 에디터](./custom-editor.md) 옵션으로 추가적인 개발 과정 없이 Grid에서 DatePicker를 사용할 수 있다.

## 스타일

tui-date-picker 또는 tui-time-picker 스타일을 그대로 적용하고 싶다면 css 파일을 추가한다.

```js
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';
```

## `columns`에 DatePicker 활성화하기

DatePicker를 사용하려면 `columns`에 `editor` 옵션을 추가하기만 하면 된다. Grid는 내부적으로 `tui-date-picker` 인스턴스를 생성하고 사용자 조작에 응하여 DatePicker를 제어한다. 옵션은 다음과 같이 설정한다.

사용자는 컬럼의 `editor` 속성에 `datePicker`라고 명시하여 기본 DatePicker를 쉽게 사용할 수 있다.

```js
const columns = [
  {
    name: 'datepicker default',
    editor: 'datePicker'
  }
];
```

![default_datepicker](https://user-images.githubusercontent.com/35371660/59477678-37dad080-8e91-11e9-90d9-c99053ae83d9.gif)

`options` 속성으로 DatePicker 인스턴스 생성 옵션을 설정할 수 있다. 더 많은 정보는 [DatePicker API 문서](https://nhn.github.io/tui.date-picker/4.1.0/DatePicker)에서 확인할 수 있다.

*(DatePicker에서 사용할 수 있는 옵션은 많지만, 다른 옵션들을 사용할 경우 Grid와의 통합에서 문제를 야기할 수 있기 때문에 제한한다.)*

```js
const columns = [
  {
    name: 'monthPicker',
    editor: {
      type: 'datePicker',
      options: {
        format: 'yyyy-MM',
        type: 'month'
      }
    }
  },
  {
    name: 'selectableRanges',
    editor: {
      type: 'datePicker',
      options: {
        format: 'yyyy/MM/dd',
        selectableRanges: [[new Date(1992, 2, 25), new Date(1992, 2, 29)]]
      }
    }
  },
  {
    name: 'timePickerWithTab',
    editor: {
      type: 'datePicker',
      options: {
        format: 'yyyy-MM-dd HH:mm A',
        timepicker: {
          layoutType: 'tab',
          inputType: 'spinbox'
        }
      }
    }
  }
]
```

결과는 다음과 같다.

![options_datepicker](https://user-images.githubusercontent.com/35371660/59477679-37dad080-8e91-11e9-9156-1aab1e8aecd1.gif)

## 예제

DatePicker를 사용하는 예제는 [여기](https://nhn.github.io/tui.grid/latest/tutorial-example08-date-picker)서 확인할 수 있다.