import { CellRenderer } from '@t/renderer';
import { cls } from '../helper/dom';

export class RowHeaderDraggableRenderer implements CellRenderer {
  private el: HTMLDivElement;

  constructor() {
    const el = document.createElement('div');

    el.className = cls('row-header-draggable');

    this.el = el;
    this.createSquares();
  }

  getElement() {
    return this.el;
  }

  private createSquares() {
    for (let i = 0; i < 3; i += 1) {
      const wrapper = document.createElement('div');

      wrapper.style.lineHeight = '0';

      for (let j = 0; j < 3; j += 1) {
        const square = document.createElement('span');

        wrapper.appendChild(square);
      }
      this.el.appendChild(wrapper);
    }
  }
}
