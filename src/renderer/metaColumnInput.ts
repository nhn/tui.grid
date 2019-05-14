import { CellRenderer, CellRendererProps } from './types';

export class MetaColumnInputRenderer implements CellRenderer {
  private el: HTMLInputElement;

  public constructor(props: CellRendererProps) {
    const el = document.createElement('input');
    const {
      grid,
      rowKey,
      columnInfo: { rendererOptions = {} }
    } = props;

    el.type = rendererOptions.inputType;
    el.name = String(rowKey);

    el.addEventListener('change', () => {
      if (el.checked) {
        grid.check(rowKey);
      } else {
        grid.uncheck(rowKey);
      }
    });

    this.el = el;
    this.changed(props);
  }

  public getElement() {
    return this.el;
  }

  public changed(props: CellRendererProps) {
    this.el.checked = Boolean(props.value);
  }
}
