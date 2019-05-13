import { Dimension, Column, Data } from './types';
import { reactive } from '../helper/reactive';
import { OptGrid } from '../types';

type OptDimension = {
  data: Data;
  column: Column;
  frozenBorderWidth?: number;
} & Pick<
  OptGrid,
  'width' | 'rowHeight' | 'minRowHeight' | 'bodyHeight' | 'minBodyHeight' | 'scrollX' | 'scrollY'
>;

export function create({
  data,
  column,
  width = 'auto',
  rowHeight = 40,
  bodyHeight = 'auto',
  minRowHeight = 40,
  minBodyHeight = 130,
  frozenBorderWidth = 1,
  scrollX = true,
  scrollY = true
}: OptDimension): Dimension {
  const bodyHeightVal = typeof bodyHeight === 'number' ? Math.max(bodyHeight, minBodyHeight) : 0;

  return reactive<Dimension>({
    offsetLeft: 0,
    offsetTop: 0,
    width: width === 'auto' ? 0 : width,
    autoWidth: width === 'auto',
    minBodyHeight,
    bodyHeight: Math.max(bodyHeightVal, minBodyHeight),
    autoHeight: bodyHeight === 'auto',
    fitToParentHeight: bodyHeight === 'fitToParent',
    rowHeight: typeof rowHeight === 'number' ? Math.max(rowHeight, minRowHeight) : 0,
    minRowHeight,
    autoRowHeight: rowHeight === 'auto',
    scrollX,
    scrollY,
    summaryHeight: 0,
    summaryPosition: 'bottom',
    headerHeight: 40,
    scrollbarWidth: 17,
    tableBorderWidth: 1,
    cellBorderWidth: 1,

    get contentsWidth(this: Dimension) {
      const columnLen = column.visibleColumns.length;
      const totalBorderWidth = (columnLen + 1) * this.cellBorderWidth;
      const scrollYWidth = this.scrollY ? this.scrollbarWidth : 0;

      return this.width - scrollYWidth - totalBorderWidth - this.frozenBorderWidth;
    },

    get frozenBorderWidth(this: Dimension) {
      return column.visibleFrozenCount > 0 ? frozenBorderWidth : 0;
    },

    get totalRowHeight() {
      return data.viewData.length * (this.rowHeight + 1);
    }
  });
}
