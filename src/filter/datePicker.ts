import { FilterItem, FilterItemProps } from './types';
import { DateFilterCode } from '../store/types';
import { createInput, createSelect } from './createElement';
import TuiDatePicker from 'tui-date-picker';
import { deepMergedCopy, isNull, isNumber, isString, isUndefined } from '../helper/common';

type DateLabel =
  | 'Equals'
  | 'Not equals'
  | 'After'
  | 'After or Equal'
  | 'Before'
  | 'Before or Equal';

type DateOptions = { [key in DateFilterCode]: DateLabel };

const dateOptions: DateOptions = {
  eq: 'Equals',
  ne: 'Not equals',
  after: 'After',
  afterEq: 'After or Equal',
  before: 'Before',
  beforeEq: 'Before or Equal'
};

export class DatePickerFilter implements FilterItem {
  public el: HTMLDivElement;

  private inputEl: HTMLInputElement;

  private datePickerEl: TuiDatePicker;

  private createCalendarWrapper() {
    const calendarWrapper = document.createElement('div');
    calendarWrapper.style.marginTop = '-4px';
    this.el.appendChild(calendarWrapper);

    return calendarWrapper;
  }

  public constructor(props: FilterItemProps) {
    this.el = document.createElement('div');
    this.inputEl = createInput();
    const selectContainer = createSelect(dateOptions);

    this.el.appendChild(selectContainer);
    this.el.appendChild(this.inputEl);

    // @TODO: datepicker 엘리먼트 만드는 것 util로 분리
    const calendarWrapper = this.createCalendarWrapper();
    let value;
    const {
      grid: { usageStatistics },
      columnInfo
    } = props;
    const { options } = columnInfo.filter!;
    let date = isUndefined(value) || isNull(value) ? '' : new Date();
    let format = 'yyyy-MM-dd';

    if (options) {
      if (options.format) {
        format = options.format;
        delete options.format;
      }
    }

    if (isNumber(value) || isString(value)) {
      date = new Date(value);
    }

    const defaultOptions = {
      date,
      type: 'date',
      input: {
        element: this.inputEl,
        format
      },
      usageStatistics
    };

    this.datePickerEl = new TuiDatePicker(
      calendarWrapper,
      deepMergedCopy(defaultOptions, options || {})
    );
  }

  public getFilterState() {
    // return this.filterState.condition;
  }

  public setFilterState() {}

  public getElement() {
    return this.el;
  }

  public mounted() {}
}
