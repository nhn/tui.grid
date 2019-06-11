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
    const { listItems } = props.columnInfo.editorOptions as Options;

    listItems.forEach(({ text, value }) => {
      el.appendChild(this.createOptions(text, value));
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

  public mounted() {
    this.el.focus();
  }
}
