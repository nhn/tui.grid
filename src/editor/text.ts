import { CellEditor } from './types';
import { CellValue } from '../store/types';
import { cls } from '../helper/dom';

interface Options {
  type: 'text' | 'password';
}

export class TextEditor implements CellEditor {
  private el!: HTMLInputElement;

  public constructor(options: Options, value: CellValue) {
    const el = document.createElement('input');
    el.className = cls('content-text');
    el.type = options.type;
    el.value = String(value);

    this.el = el;
  }

  public getElement() {
    return this.el;
  }

  public getValue() {
    return this.el.value;
  }

  public start() {
    this.el.select();
  }
}
