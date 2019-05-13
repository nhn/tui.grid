import { CellRenderer } from './types';
import { CellRenderData, ColumnInfo } from '../store/types';
import { cls } from '../helper/dom';

export class DefaultRenderer implements CellRenderer {
  private el: HTMLDivElement;

  private columnInfo: ColumnInfo;

  public constructor(renderData: CellRenderData, columnInfo: ColumnInfo) {
    const el = document.createElement('div');
    el.className = cls('cell-content');
    el.innerHTML = renderData.formattedValue;

    this.columnInfo = columnInfo;

    this.el = el;
  }

  public getElement() {
    return this.el;
  }

  public changed(renderData: CellRenderData) {
    this.el.innerHTML = renderData.formattedValue;
  }
}
