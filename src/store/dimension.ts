import { Row, Dimension, Column } from './types';
import { reactive } from '../helper/reactive';
import { OptGrid } from '../types';

type OptDimension = {
  data: Row[];
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
    colOffsets: [],
    scrollbarWidth: 17,
    tableBorderWidth: 1,
    cellBorderWidth: 1,
    lsideWidth: 0,
    get frozenBorderWidth(this: Dimension) {
      const { visibleFrozenCount } = column;

      return visibleFrozenCount > 0 ? frozenBorderWidth : 0;
    },
    get rsideWidth() {
      return this.width;
    },
    get totalRowHeight() {
      return data.length * (this.rowHeight + 1);
    },
    get rowOffsets() {
      const offsets = [0];
      const { rowHeight } = this;
      for (let i = 1, len = data.length; i < len; i += 1) {
        offsets.push(offsets[i - 1] + rowHeight + 1);
      }
      return offsets;
    }
  });
}
