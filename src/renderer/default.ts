import { CellRenderer, CellRendererProps } from './types';
import { cls } from '../helper/dom';

export class DefaultRenderer implements CellRenderer {
  private el: HTMLDivElement;

  public constructor(props: CellRendererProps) {
    const el = document.createElement('div');
    el.className = cls('cell-content');

    this.el = el;
    this.changed(props);
  }

  public getElement() {
    return this.el;
  }

  public changed(props: CellRendererProps) {
    this.el.innerHTML = `${props.prefix}${props.formattedValue}${props.postfix}`;
  }
}
