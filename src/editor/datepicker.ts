import TuiDatePicker from 'tui-date-picker';
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';
import { CellEditor, CellEditorProps } from './types';
import { cls } from '../helper/dom';
import { deepMergedCopy, isNumber, isString } from '../helper/common';

export class DatepickerEditor implements CellEditor {
  private el: HTMLDivElement;

  private inputEl: HTMLInputElement;

  private datepickerEl: TuiDatePicker;

  public constructor(props: CellEditorProps) {
    let format = 'yyyy-MM-dd';
    let date = new Date();
    const el = document.createElement('div');
    const inputEl = document.createElement('input');
    const calendarWrapper = document.createElement('div');

    inputEl.className = cls('content-text');
    inputEl.type = 'text';
    el.className = cls('layer-datepicker');
    calendarWrapper.style.marginTop = '-4px';

    el.appendChild(inputEl);
    el.appendChild(calendarWrapper);

    this.inputEl = inputEl;
    this.el = el;

    const { editorOptions } = props.columnInfo;

    if (editorOptions && editorOptions.format) {
      // eslint-disable-next-line prefer-destructuring
      format = editorOptions.format;
      delete editorOptions.format;
    }

    if (isNumber(props.value) || isString(props.value)) {
      date = new Date(props.value);
    }

    const defaultOptions = {
      date,
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
