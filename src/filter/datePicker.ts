import { FilterItem, FilterItemProps } from './types';
import { createInput, createSelect } from './createElement';
import TuiDatePicker from 'tui-date-picker';
import { deepMergedCopy, isNull, isNumber, isString, isUndefined } from '../helper/common';
import { filterSelectOption } from '../helper/filter';

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

  private onKeyUpInput = (ev: Event) => {
    console.log(ev.target);
  };

  public constructor(props: FilterItemProps) {
    this.el = document.createElement('div');
    this.inputEl = createInput(this.onKeyUpInput);
    const selectContainer = createSelect(filterSelectOption.date);

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
