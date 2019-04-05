import { Row, Dimension } from './types';
import { reactive } from '../helper/reactive';
import { OptGrid } from '../types';

type OptDimension = {
  data: Row[];
} & Pick<
  OptGrid,
  'width' | 'rowHeight' | 'minRowHeight' | 'bodyHeight' | 'minBodyHeight' | 'scrollX' | 'scrollY'
>;

export function create({
  data,
  width = 'auto',
  rowHeight = 40,
  bodyHeight = 'auto',
  minRowHeight = 40,
  minBodyHeight = 130,
  scrollX = true,
  scrollY = true
}: OptDimension): Dimension {
  return reactive<Dimension>({
    width: width === 'auto' ? 0 : width,
    autoWidth: width === 'auto',
    bodyHeight: typeof bodyHeight === 'number' ? Math.max(bodyHeight, minBodyHeight) : 0,
    autoHeight: bodyHeight === 'auto',
    fitToParentHeight: bodyHeight === 'fitToParent',
    minBodyHeight,
    rowHeight: typeof rowHeight === 'number' ? Math.max(rowHeight, minRowHeight) : 0,
    minRowHeight,
    autoRowHeight: rowHeight === 'auto',
    scrollX,
    scrollY,
    summaryHeight: 0,
    summaryPosition: 'bottom',
    headerHeight: 30,
    frozenBorderWidth: 0,
    colOffsets: [],
    scrollbarWidth: 17,
    tableBorderWidth: 1,
    cellBorderWidth: 1,
    lsideWidth: 0,
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
