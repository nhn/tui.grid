import { CellEditor } from './types';
import { CellValue } from '../store/types';
import { cls } from '../helper/dom';

let maxId = 0;

function getNextId() {
  maxId += 1;

  return `tui-grid-checkbox-${maxId}`;
}

export class CellCheckboxEditor implements CellEditor {
  private el?: HTMLElement;

  public constructor(options: object, value: CellValue, dispatch: Function) {
    const el = document.createElement('fieldset');

    let id = getNextId();
    el.appendChild(this.createCheckbox('1', id));
    el.appendChild(this.createLabel('Pop', id));

    id = getNextId();
    el.appendChild(this.createCheckbox('2', id));
    el.appendChild(this.createLabel('Rock', id));

    id = getNextId();
    el.appendChild(this.createCheckbox('3', id));
    el.appendChild(this.createLabel('R&B', id));

    this.el = el;
  }

  private createLabel(text: string, id: string) {
    const label = document.createElement('label');
    label.innerText = text;
    label.setAttribute('for', id);

    return label;
  }

  private createCheckbox(value: CellValue, id: string) {
    const input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('data-value-type', 'string');
    input.setAttribute('id', id);
    input.setAttribute('value', String(value));

    return input;
  }

  public getElement() {
    return this.el;
  }

  public onChange(value: CellValue) {
    (this.el as HTMLInputElement).value = String(value);
  }

  public getValue() {
    return '';
    // if (this.el) {
    //   return this.el.value;
    // }
    // return '';
  }

  public onStart() {
    // if (this.el) {
    //   this.el.select();
    // }
  }

  public onFinish() {
    // if (this.el) {
    //   this.el.blur();
    // }
  }
}
