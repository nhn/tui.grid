import { CellEditor, CellEditorProps } from './types';
import { cls } from '../helper/dom';
import { deepMergedCopy, isNumber, isString } from '../helper/common';
import TuiDatePicker from 'tui-date-picker';
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';

export class DatepickerEditor implements CellEditor {
  private el: HTMLDivElement;

  private inputEl: HTMLInputElement;

  private datepickerEl: TuiDatePicker;

  public constructor(props: CellEditorProps) {
    let format;
    const el = document.createElement('div');
    const inputEl = document.createElement('input');
    const calendarWrapper = document.createElement('div');

    el.appendChild(inputEl);
    el.appendChild(calendarWrapper);

    el.className = cls('layer-datepicker');
    inputEl.className = cls('content-text');
    inputEl.type = 'text';
    calendarWrapper.style.marginTop = '-4px';

    this.inputEl = inputEl;
    this.el = el;

    const { editorOptions } = props.columnInfo;

    if (editorOptions) {
      format = editorOptions.format ? editorOptions.format : 'yyyy-MM-dd';
    }

    const defaultOptions = {
      date: isNumber(props.value) || isString(props.value) ? new Date(props.value) : new Date(),
      format: 'yyyy-MM-dd',
      type: 'date',
      input: {
        element: inputEl,
        format
      }
    };

    this.datepickerEl = new TuiDatePicker(
      calendarWrapper,
      deepMergedCopy(defaultOptions, editorOptions || {})
    );
  }

  public getElement() {
    return this.el;
  }

  public getValue() {
    return this.inputEl.value;
  }

  public start() {
    this.inputEl.select();
    this.datepickerEl.open();
  }
}
