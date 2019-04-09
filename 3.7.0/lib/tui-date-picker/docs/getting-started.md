## Load dependency files
* Script - [jQuery](https://github.com/jquery/jquery) 1.11.0 or later
* Script - [tui-code-snippet](https://github.com/nhnent/tui.code-snippet) 1.2.5 or later

```html
<html>
    <head>
        ....
        <link href="tui-date-picker.css" rel="stylesheet">
    </head>
    <body>
        ....
        <script type="text/javascript" src="jquery.min.js"></script>
        <script type="text/javascript" src="tui-code-snippet.js"></script>
        <script type="text/javascript" src="tui-date-picker.js"></script>
        ....
    </body>
</html>
```

## Write a wrapper element

```html
<div id="datepicker-wrapper"></div>
```

## Create instance

```js
var instance = new tui.DatePicker('#datepicker-wrapper', {
   // options
});
```

## Options

### Datepicker
* language (default 'en')
  * There are two supporting types by default - 'en' and 'ko'.
  * For custom texts - See the [Datepicker.localeTexts](https://nhnent.github.io/tui.date-picker/latest/DatePicker.html#.localeTexts)
  * If set both calendar-language and datepicker-language, will apply datepicker-language first.
* showAlways (default false)
  * If true, the datepicker will not close until you call "close()".
* autoClose (default true)
  * If true, Close datepicker when select date
* date (nullable)
  * Date instance or Timestamp for initial date
* input
  * Set to bind input element
  * ex) `{input: '#datepicker-input', format: 'yyyy-MM-dd'}`
  * See the [Date-Time text format](#date-time-text-format)
* type (default 'date')
  * Type of picker - 'date', 'month', year'
  * See [examples](https://nhnent.github.io/tui.date-picker/latest/tutorial-example05-picking-month.html) in API page
* selectableRanges
  * Set selectable dates of datepicker
  * 2d-Array: `[[startDate1, endDate1], [startDate2, endDate2], ...]`
* openers
  * Bind buttons to auto toggle(open-close) datepicker
  * Array of elements: ex) `['#opener1', '#opener2', ..]`
* calendar
  * See the [calendar option](#calendar)
* timepicker
  * See the [timepicker option](#timepicker)

### Calendar
* language (default 'en')
  * There are two supporting types by default - 'en' and 'ko'.
  * For custom texts - See the [Calendar.localeTexts](https://nhnent.github.io/tui.date-picker/latest/Calendar.html#.localeTexts)
* showToday (default true)
  * If true, calendar shows today
* showJumpButtons
  * If true, 'date'-type calendar shows jump buttons (prev-year, next-year)
* date
  * Date instance for initial date
* type
  * Type of calendar - 'date', 'month', 'year'

### Timepicker
* initialHour (default 0)
* initialMinute (default 0)
* showMeridiem (default true)
  * If true, shows 'AM'/'PM' selector.
* inputType (defalult selectbox)
  * Input types 'selectbox' or 'spinbox'

## Date-Time text format
|Format|Desc|Example|
|---|---|---|
|yyyy / YYYY|Year|2016, 2017, 2018, ...|
|y / yy / Y / YY|Year|16, 17, 18, ...|
|M|Month|1, 2, 3, ...|
|MM|Month|01, 02, 03, ...|
|MMM|Month - Str|Jan, Feb, Mar, ...|
|MMMM|Month - Str|January, February, March, ...|
|d|Day in month|1, 2, 3, ...|
|dd|Day in month|01, 02, 03, ...|
|D|Day in week - Str|Sun, Mon, Tue, ...|
|DD|Day in week - Str|Sunday, Monday, Tuesday, ...|
|h/H|Hour|1, 2, 3, ...|
|hh/HH|Hour|01, 02, 03, ...|
|m|Minute|1, 2, 3, ...|
|mm|Minute|01, 02, 03, ...|
|A|Meridiem-Uppercase|'AM', 'PM'|
|a|Meridiem-Lowercase|'am', 'pm'|
