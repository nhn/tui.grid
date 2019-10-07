import { CellRenderer, CellRendererProps } from './types';
import { cls } from '../helper/dom';

export class DefaultRenderer implements CellRenderer {
  private el: HTMLDivElement;

  public constructor(props: CellRendererProps) {
    const el = document.createElement('div');
    const { ellipsis, whiteSpace } = props.columnInfo;

    el.className = cls('cell-content');
    if (ellipsis) {
      el.style.textOverflow = 'ellipsis';
    }
    if (whiteSpace) {
      el.style.whiteSpace = whiteSpace;
    }

    this.el = el;
    this.render(props);
  }

  public getElement() {
    return this.el;
  }

  public render(props: CellRendererProps) {
    this.el.innerHTML = `${props.formattedValue}`;
  }
}
