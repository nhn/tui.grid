import { CellEditor, CellEditorProps } from './types';
import { CellValue } from '../store/types';

export interface Options {
  listItems: {
    text: string;
    value: CellValue;
  }[];
}
export class SelectEditor implements CellEditor {
  private el: HTMLSelectElement;

  public constructor(props: CellEditorProps) {
    const el = document.createElement('select');
    const options = props.columnInfo.editorOptions as Options;

    options.listItems.forEach((item) => {
      el.appendChild(this.createOptions(item.text, item.value));
    });
    el.value = String(props.value);

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
