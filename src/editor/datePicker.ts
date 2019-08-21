import TuiDatePicker from 'tui-date-picker';
import { CellEditor, CellEditorProps } from './types';
import { cls } from '../helper/dom';
import { deepMergedCopy, isNumber, isString, isUndefined, isNull } from '../helper/common';

export class DatePickerEditor implements CellEditor {
  public el: HTMLDivElement;

  private inputEl: HTMLInputElement;

  private datePickerEl: TuiDatePicker;

  private createWrapper() {
    const el = document.createElement('div');
    el.className = cls('layer-datepicker');

    return el;
  }

  private createInputElement() {
    const inputEl = document.createElement('input');
    inputEl.className = cls('content-text');
    inputEl.type = 'text';
    this.el.appendChild(inputEl);

    return inputEl;
  }

  private createCalendarWrapper() {
    const calendarWrapper = document.createElement('div');
    calendarWrapper.style.marginTop = '-4px';
    this.el.appendChild(calendarWrapper);

    return calendarWrapper;
  }

  public constructor(props: CellEditorProps) {
    this.el = this.createWrapper();
    this.inputEl = this.createInputElement();

    const calendarWrapper = this.createCalendarWrapper();
    const {
      grid: { usageStatistics },
      columnInfo,
      value
    } = props;
    const { options } = columnInfo.editor!;
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

  public getElement() {
    return this.el;
  }

  public getValue() {
    return this.inputEl.value;
  }

  public mounted() {
    this.inputEl.select();
    this.datePickerEl.open();
  }

  public beforeDestroy() {
    this.datePickerEl.destroy();
  }
}
