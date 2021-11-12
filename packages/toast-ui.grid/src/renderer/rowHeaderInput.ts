import { CellRenderer, CellRendererProps } from '@t/renderer';
import { cls } from '../helper/dom';

export class RowHeaderInputRenderer implements CellRenderer {
  private el: HTMLDivElement;

  private input: HTMLInputElement;

  public constructor(props: CellRendererProps) {
    const el = document.createElement('div');
    const input = document.createElement('input');
    const { grid, rowKey, disabled } = props;

    el.className = cls('row-header-checkbox');
    input.type = 'checkbox';
    input.name = '_checked';
    input.disabled = disabled;

    input.addEventListener('click', (ev: MouseEvent) => {
      if (ev.shiftKey) {
        grid[input.checked ? 'checkBetween' : 'uncheckBetween'](rowKey);
        return;
      }

      grid[input.checked ? 'check' : 'uncheck'](rowKey);
    });

    el.appendChild(input);

    this.el = el;
    this.input = input;
    this.render(props);
  }

  public getElement() {
    return this.el;
  }

  public render(props: CellRendererProps) {
    const { value, disabled } = props;

    this.input.checked = Boolean(value);
    this.input.disabled = disabled;
  }
}
