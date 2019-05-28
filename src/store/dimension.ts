import { Dimension, Column, Data, SummaryPosition } from './types';
import { observable } from '../helper/observable';
import { OptGrid } from '../types';

type OptDimension = {
  data: Data;
  column: Column;
  frozenBorderWidth?: number;
  summaryHeight?: number;
  summaryPosition?: SummaryPosition;
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
  scrollY = true,
  summaryHeight = 0,
  summaryPosition = 'bottom'
}: OptDimension): Dimension {
  const bodyHeightVal = typeof bodyHeight === 'number' ? Math.max(bodyHeight, minBodyHeight) : 0;

  return observable<Dimension>({
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
    summaryHeight,
    summaryPosition,
    headerHeight: 40,
    scrollbarWidth: 17,
    tableBorderWidth: 1,
    cellBorderWidth: 1,

    get contentsWidth(this: Dimension) {
      const columnLen = column.visibleColumns.length;
      const totalBorderWidth = (columnLen + 1) * this.cellBorderWidth;

      return this.width - this.scrollYWidth - totalBorderWidth - this.frozenBorderWidth;
    },

    get frozenBorderWidth(this: Dimension) {
      const { visibleFrozenCount, rowHeaderCount } = column;
      const visibleLeftColumnCount = visibleFrozenCount - rowHeaderCount;

      return visibleLeftColumnCount > 0 ? frozenBorderWidth : 0;
    },

    get totalRowHeight() {
      return data.viewData.length * this.rowHeight + this.tableBorderWidth;
    },

    get scrollXHeight() {
      return this.scrollX ? this.scrollbarWidth : 0;
    },

    get scrollYWidth() {
      return this.scrollY ? this.scrollbarWidth : 0;
    }
  });
}
