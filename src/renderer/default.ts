import { CellRenderer, CellRendererProps } from './types';
import { cls } from '../helper/dom';

export class DefaultRenderer implements CellRenderer {
  private el: HTMLDivElement;

  public constructor(props: CellRendererProps) {
    const el = document.createElement('div');
    el.className = cls('cell-content');
    el.innerHTML = props.formattedValue;

    this.el = el;
  }

  public getElement() {
    return this.el;
  }

  public changed(props: CellRendererProps) {
    this.el.innerHTML = props.formattedValue;
  }
}
