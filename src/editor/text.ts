import { CellEditor } from './types';
import { CellValue } from '../store/types';
import { cls } from '../helper/dom';

export class CellTextEditor implements CellEditor {
  private el?: HTMLInputElement;

  public constructor(value: CellValue, dispatch: Function) {
    const el = document.createElement('input');
    el.className = cls('content-text');
    el.type = 'text';
    el.value = String(value);

    el.addEventListener('focusin', () => {
      el.select();
      dispatch('start');
    });

    el.addEventListener('focusout', () => {
      dispatch('finish');
    });

    this.el = el;
  }

  public getElement() {
    return this.el;
  }

  public onChange(value: CellValue) {
    (this.el as HTMLInputElement).value = String(value);
  }

  public getValue() {
    if (this.el) {
      return this.el.value;
    }

    return '';
  }

  public onStart() {
    if (this.el) {
      this.el.select();
    }
  }

  public onFinish() {
    if (this.el) {
      this.el.blur();
    }
  }
}
