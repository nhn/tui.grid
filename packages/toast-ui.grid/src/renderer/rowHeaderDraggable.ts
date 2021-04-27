import { CellRenderer } from '@t/renderer';
import { cls } from '../helper/dom';

const ROW_COUNT = 3;
const COL_COUNT = 3;

export class RowHeaderDraggableRenderer implements CellRenderer {
  private el: HTMLDivElement;

  constructor() {
    const el = document.createElement('div');

    el.className = cls('row-header-draggable');

    this.el = el;
    this.renderDraggableIcon();
  }

  getElement() {
    return this.el;
  }

  private renderDraggableIcon() {
    for (let i = 0; i < ROW_COUNT; i += 1) {
      const wrapper = document.createElement('div');

      wrapper.style.lineHeight = '0';

      for (let j = 0; j < COL_COUNT; j += 1) {
        const square = document.createElement('span');

        wrapper.appendChild(square);
      }
      this.el.appendChild(wrapper);
    }
  }
}
