import { OptGrid } from '@t/options';
import { Column } from '@t/store/column';
import { SummaryPosition } from '@t/store/summary';
import { Dimension } from '@t/store/dimension';
import { observable } from '../helper/observable';
import { isNumber } from '../helper/common';

type DimensionOption = {
  column: Column;
  frozenBorderWidth?: number;
  summaryHeight?: number;
  domWidth: number;
  summaryPosition?: SummaryPosition;
  headerHeight: number;
} & Pick<
  OptGrid,
  | 'width'
  | 'rowHeight'
  | 'minRowHeight'
  | 'bodyHeight'
  | 'minBodyHeight'
  | 'heightResizable'
  | 'scrollX'
  | 'scrollY'
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
  heightResizable = false,
  scrollX = true,
  scrollY = true,
  summaryHeight = 0,
  summaryPosition = 'bottom',
  headerHeight = 40,
}: DimensionOption) {
  const bodyHeightVal = typeof bodyHeight === 'number' ? bodyHeight : 0;

  return observable<Dimension>({
    offsetLeft: 0,
    offsetTop: 0,
    width: width === 'auto' ? domWidth : width,
    autoWidth: width === 'auto',
    minBodyHeight,
    bodyHeight: Math.max(bodyHeightVal, minBodyHeight),
    autoHeight: bodyHeight === 'auto',
    heightResizable,
    fitToParentHeight: bodyHeight === 'fitToParent',
    minRowHeight,
    rowHeight: isNumber(rowHeight) ? Math.max(rowHeight, minRowHeight) : minRowHeight,
    autoRowHeight: rowHeight === 'auto',
    scrollX,
    scrollY,
    summaryHeight,
    summaryPosition,
    headerHeight,
    scrollbarWidth: 17,
    tableBorderWidth: 1,
    cellBorderWidth: 1,

    get scrollYWidth() {
      return this.scrollY ? this.scrollbarWidth : 0;
    },

    get scrollXHeight() {
      return this.scrollX ? this.scrollbarWidth : 0;
    },

    get frozenBorderWidth() {
      const { visibleColumnsBySide } = column;
      const visibleLeftColumnCount = visibleColumnsBySide.L.length;

      return visibleLeftColumnCount > 0 ? frozenBorderWidth : 0;
    },

    get contentsWidth() {
      const columnLen = column.visibleColumnsWithRowHeader.length;
      const totalBorderWidth = columnLen * this.cellBorderWidth;

      return this.width - this.scrollYWidth - this.frozenBorderWidth - totalBorderWidth;
    },
  });
}
