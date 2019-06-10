import { OptGrid } from '../types';
import { Dimension, Column, SummaryPosition, RowCoords } from './types';
import { observable } from '../helper/observable';
import { isNumber } from '../helper/common';

type OptDimension = {
  column: Column;
  frozenBorderWidth?: number;
  summaryHeight?: number;
  domWidth: number;
  summaryPosition?: SummaryPosition;
  scrollX: boolean;
  scrollY: boolean;
} & Pick<
  OptGrid,
  'width' | 'rowHeight' | 'minRowHeight' | 'bodyHeight' | 'minBodyHeight' | 'scrollX' | 'scrollY'
>;

export function create({
  column,
  width = 'auto',
  domWidth,
  rowHeight = 40,
  bodyHeight = 'auto',
  minRowHeight = 40,
  minBodyHeight = 130,
  frozenBorderWidth = 1,
  scrollX,
  scrollY,
  summaryHeight = 0,
  summaryPosition = 'bottom'
}: OptDimension): Dimension {
  const bodyHeightVal = typeof bodyHeight === 'number' ? bodyHeight : 0;

  return observable<Dimension>({
    offsetLeft: 0,
    offsetTop: 0,
    width: width === 'auto' ? domWidth : width,
    autoWidth: width === 'auto',
    minBodyHeight,
    bodyHeight: Math.max(bodyHeightVal, minBodyHeight),
    autoHeight: bodyHeight === 'auto',
    fitToParentHeight: bodyHeight === 'fitToParent',
    minRowHeight,
    rowHeight: isNumber(rowHeight) ? Math.max(rowHeight, minRowHeight) : minRowHeight,
    autoRowHeight: rowHeight === 'auto',
    scrollX,
    scrollY,
    summaryHeight,
    summaryPosition,
    headerHeight: 40,
    scrollbarWidth: 17,
    tableBorderWidth: 1,
    cellBorderWidth: 1,

    get scrollYWidth() {
      return this.scrollY ? this.scrollbarWidth : 0;
    },

    get scrollXHeight() {
      return this.scrollX ? this.scrollbarWidth : 0;
    },

    get frozenBorderWidth(this: Dimension) {
      const { visibleFrozenCount, rowHeaderCount } = column;
      const visibleLeftColumnCount = visibleFrozenCount - rowHeaderCount;

      return visibleLeftColumnCount > 0 ? frozenBorderWidth : 0;
    },

    get contentsWidth(this: Dimension) {
      const columnLen = column.visibleColumns.length;
      const totalBorderWidth = columnLen * this.cellBorderWidth;

      return this.width - this.scrollYWidth - this.frozenBorderWidth - totalBorderWidth;
    }
  });
}

export function setBodyHeight(dimension: Dimension, rowCoords: RowCoords) {
  const { totalRowHeight } = rowCoords;
  const { autoHeight, scrollXHeight, minBodyHeight } = dimension;

  if (autoHeight) {
    dimension.bodyHeight = Math.max(totalRowHeight + scrollXHeight, minBodyHeight);
  }
}
