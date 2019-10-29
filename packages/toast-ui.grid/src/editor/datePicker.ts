import TuiDatePicker from 'tui-date-picker';
import { CellEditor, CellEditorProps } from './types';
import { cls } from '../helper/dom';
import { deepMergedCopy, isNumber, isString, isUndefined, isNull } from '../helper/common';
import { Dictionary } from '../store/types';

export class DatePickerEditor implements CellEditor {
  public el: HTMLDivElement;

  private inputEl: HTMLInputElement;

  private datePickerEl: TuiDatePicker;

  private iconEl?: HTMLElement;

  private createWrapper() {
    const el = document.createElement('div');
    el.className = cls('layer-datepicker');

    return el;
  }

  private createInputElement() {
    const inputEl = document.createElement('input');
    inputEl.className = cls('content-text');
    inputEl.type = 'text';

    return inputEl;
  }

  private createCalendarWrapper() {
    const calendarWrapper = document.createElement('div');
    calendarWrapper.style.marginTop = '-4px';
    this.el.appendChild(calendarWrapper);

    return calendarWrapper;
  }

  private openDatePicker() {
    this.datePickerEl.open();
  }

  private createIcon() {
    const icon = document.createElement('i');
    icon.className = cls('date-icon');
    icon.addEventListener('click', () => {
      this.openDatePicker();
    });

    return icon;
  }

  private focus() {
    this.inputEl.focus();
  }

  public constructor(props: CellEditorProps) {
    this.el = this.createWrapper();
    this.inputEl = this.createInputElement();
    const datepickerInputContainer = document.createElement('div');
    datepickerInputContainer.className = cls('datepicker-input-container');
    datepickerInputContainer.appendChild(this.inputEl);
    this.el.appendChild(datepickerInputContainer);

    const calendarWrapper = this.createCalendarWrapper();
    const {
      grid: { usageStatistics },
      columnInfo,
      value
    } = props;

    const options: Dictionary<any> = {
      showIcon: true,
      ...columnInfo.editor!.options
    };

    if (options.showIcon) {
      const icon = this.createIcon();
      this.iconEl = icon;
      this.inputEl.className = cls('datepicker-input');
      datepickerInputContainer.appendChild(icon);
    }

    let date = isUndefined(value) || isNull(value) ? '' : new Date();

    if (!options.format) {
      options.format = 'yyyy-MM-dd';
    }

    if (isNumber(value) || isString(value)) {
      date = new Date(value);
    }

    const defaultOptions = {
      date,
      type: 'date',
      input: {
        element: this.inputEl,
        format: options.format
      },
      usageStatistics
    };

    this.datePickerEl = new TuiDatePicker(calendarWrapper, deepMergedCopy(defaultOptions, options));
    this.datePickerEl.on('close', () => {
      this.focus();
    });
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
    if (this.iconEl) {
      this.iconEl.removeEventListener('click', this.openDatePicker);
    }
    this.datePickerEl.destroy();
  }
}
