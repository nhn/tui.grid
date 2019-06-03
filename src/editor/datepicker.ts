import { CellEditor, CellEditorProps } from './types';
import { cls } from '../helper/dom';
import DatePicker from 'tui-date-picker';
import 'tui-date-picker/dist/tui-date-picker.css';

type CalendarType = 'date' | 'month' | 'year';

interface DatePickerOptions {
  date?: Date;
  language?: string;
  showToday?: boolean;
  showJumpButtons?: boolean;
  type?: CalendarType;
  usageStatistics?: boolean;
}
// 생성하고 사라지면 지우고
export class DatepickerEditor implements CellEditor {
  private el: HTMLDivElement;

  private inputEl: HTMLInputElement;

  private datepickerEl: DatePicker | null = null;

  public constructor(props: CellEditorProps) {
    const el = document.createElement('div');
    const inputEl = document.createElement('input');
    const { editorOptions } = props.columnInfo;

    el.className = cls('content-text');

    // @TODO: 값 지정해주기
    // el.type = options.type;
    // el.value = String(props.value);

    el.appendChild(inputEl);

    this.inputEl = inputEl;
    this.el = el;
    const input = {
      element: inputEl,
      format: editorOptions && editorOptions.format ? editorOptions.format : 'yyyy-MM-dd'
    };

    this.datepickerEl = new DatePicker(this.el, {
      date: new Date(),
      type: 'date',
      ...editorOptions,
      input
    });
  }

  public getElement() {
    return this.el;
  }

  public getValue() {
    return this.inputEl.value;
    // const el
    //
    // return this.el.querySelector('#datepicker-input') aa.value;
  }

  public start() {
    this.datepickerEl!.open();
    this.inputEl.select();
  }
}
