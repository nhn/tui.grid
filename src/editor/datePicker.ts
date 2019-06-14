import TuiDatePicker from 'tui-date-picker';
import { CellEditor, CellEditorProps } from './types';
import { cls } from '../helper/dom';
import { deepMergedCopy, isNumber, isString } from '../helper/common';

export class DatePickerEditor implements CellEditor {
  private el: HTMLDivElement;

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
    let format = 'yyyy-MM-dd';
    let date = new Date();

    this.el = this.createWrapper();
    this.inputEl = this.createInputElement();
    const calendarWrapper = this.createCalendarWrapper();
    const { options } = props.columnInfo.editor!;

    if (options) {
      if (options.format) {
        format = options.format;
        delete options.format;
      }
    }

    if (isNumber(props.value) || isString(props.value)) {
      date = new Date(props.value);
    }

    const defaultOptions = {
      date,
      type: 'date',
      input: {
        element: this.inputEl,
        format
      }
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
}
