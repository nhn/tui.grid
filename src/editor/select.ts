import { CellEditor } from './types';
import { CellValue } from '../store/types';

export interface Options {
  type: 'select';
  listItems: {
    text: string;
    value: CellValue;
  }[];
}
export class SelectEditor implements CellEditor {
  private el: HTMLSelectElement;

  public constructor(options: Options, value: CellValue) {
    const el = document.createElement('select');
    const { listItems } = options;

    listItems.forEach((item) => {
      el.appendChild(this.createOptions(item.text, item.value));
    });
    el.value = String(value);

    this.el = el;
  }

  private createOptions(text: string, value: CellValue) {
    const option = document.createElement('option');
    option.setAttribute('value', String(value));
    option.innerText = text;

    return option;
  }

  public getElement() {
    return this.el;
  }

  public getValue() {
    return this.el.value;
  }

  public start() {
    this.el.focus();
  }
}
