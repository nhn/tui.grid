# Using DatePicker

The [TOAST UI DatePicker](https://github.com/nhn/tui.date-picker) component can be easily integrated into the TOAST UI Grid. Just by adding some options to the `columns`, you can use a DatePicker in the Grid without extra coding.

셀 에디터를 사용하는 것처럼 사용할 수 있다! 셀 에디터가 뭔지 더 궁금하다면 다음 링크를 참고해라.

## 사용하기 전에..

스타일이 적용된 tui-datepicker를 사용하려면 css부터 import 해야 한다.

```js
import 'tui-date-picker/dist/tui-date-picker.css';
```

## Adding options to the `columns`

To use a DatePicker, you need to add the `editor` option to the `columns`. This is all you need to do, since the Grid internally creates a instance of `tui-date-picker`, and controls it in response to user control. The option looks like below.

우리는 셀 에디터의 속성을 그대로 따라!

밑에처럼 columns의 editor옵션에 `datePicker`를 명시해줘. 그러면 데이트피커를 사용할 수 있게 된다.

// datepicker를 사용한다고만 명시할 경우

```js
const columns = [
  {
    name: 'datepicker default',
    editor: 'datePicker'
  }
];
```

<!-- 그림 1 -->

datePicker의 옵션을 사용하고 싶다면 셀 에디터와 동일하게 타입과 옵션을 분리해서 적는다.

Using the `options` property, you can set up options to be used to create a DatePicker instance. The available options are `date`, `format` and `selectableRanges`. For more information, see the [DatePicker API page](https://nhn.github.io/tui.date-picker/latest/DatePicker).

*(Although there are much more options available for the DatePicker component, other options are restricted as they might cause some integration issues.)*

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

<!-- 그림 2 -->


## Example Page

You can see the sample Grid using datePicker [here](https://nhn.github.io/tui.grid/latest/tutorial-example08-using-datepicker).
