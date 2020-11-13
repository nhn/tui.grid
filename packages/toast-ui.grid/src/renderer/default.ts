import { CellRenderer, CellRendererProps } from '@t/renderer';
import { cls } from '../helper/dom';

export class DefaultRenderer implements CellRenderer {
  private el: HTMLDivElement;

  public constructor(props: CellRendererProps) {
    const el = document.createElement('div');
    const { ellipsis, whiteSpace } = props.columnInfo;

    el.className = cls('cell-content');
    el.setAttribute('title', `${props.formattedValue}`);

    // @TODO: we should remove below options and consider common the renderer option for style, attribute and class names
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
