import { Column, Range, Viewport, Dimension, Data, RowCoords, ColumnCoords } from './types';
import { observable, Observable } from '../helper/observable';
import { arrayEqual, findIndex } from '../helper/common';

function findIndexByPosition(offsets: number[], position: number) {
  const rowOffset = findIndex((offset) => offset > position, offsets);

  return rowOffset === -1 ? offsets.length - 1 : rowOffset - 1;
}

interface ViewPortOption {
  data: Data;
  column: Column;
  dimension: Dimension;
  rowCoords: RowCoords;
  columnCoords: ColumnCoords;
  showDummyRows: boolean;
}

export function create({
  data,
  column,
  dimension,
  rowCoords,
  columnCoords,
  showDummyRows
}: ViewPortOption): Observable<Viewport> {
  return observable({
    scrollLeft: 0,
    scrollTop: 0,
    scrollPixelScale: 40,

    get maxScrollLeft() {
      const { scrollbarWidth, cellBorderWidth } = dimension;
      const { areaWidth, widths } = columnCoords;
      let totalRWidth = 0;
      widths.R.forEach((width) => {
        totalRWidth += width + cellBorderWidth;
      });

      return totalRWidth - areaWidth.R + scrollbarWidth;
    },

    get maxScrollTop() {
      const { bodyHeight, scrollbarWidth } = dimension;
      const { totalRowHeight } = rowCoords;

      return totalRowHeight - bodyHeight + scrollbarWidth;
    },

    get colRange(this: Observable<Viewport>) {
      const offsets = columnCoords.offsets.R;
      const areaWidth = columnCoords.areaWidth.R;

      const scrollLeft = Math.max(this.scrollLeft, 0);
      const start = findIndexByPosition(offsets, scrollLeft);
      const end = findIndexByPosition(offsets, scrollLeft + areaWidth) + 1;
      const value = [start, end] as Range;

      const prevValue = this.__storage__.colRange;
      if (prevValue && arrayEqual(prevValue, value)) {
        return prevValue;
      }

      return value;
    },

    get columns(this: Viewport) {
      return column.visibleColumnsBySide.R.slice(...this.colRange);
    },

    get offsetX(this: Viewport) {
      return columnCoords.offsets.R[this.colRange[0]];
    },

    get rowRange(this: Observable<Viewport>) {
      const { bodyHeight } = dimension;
      const { offsets } = rowCoords;

      // safari uses negative scrollTop for bouncing effect
      const scrollTop = Math.max(this.scrollTop, 0);

      const start = findIndexByPosition(offsets, scrollTop);
      const end = findIndexByPosition(offsets, scrollTop + bodyHeight) + 1;
      const value = [start, end] as Range;

      const prevValue = this.__storage__.rowRange;
      if (prevValue && arrayEqual(prevValue, value)) {
        return prevValue;
      }

      return value;
    },

    get rows(this: Viewport) {
      return data.viewData.slice(...this.rowRange);
    },

    get offsetY(this: Viewport) {
      return rowCoords.offsets[this.rowRange[0]];
    },

    get dummyRowCount() {
      const { rowHeight, bodyHeight, scrollXHeight, cellBorderWidth } = dimension;
      const { totalRowHeight } = rowCoords;
      const adjustedRowHeight = rowHeight + cellBorderWidth;
      const adjustedBodyHeight = bodyHeight - scrollXHeight;

      if (showDummyRows && totalRowHeight < adjustedBodyHeight) {
        return Math.ceil((adjustedBodyHeight - totalRowHeight) / adjustedRowHeight) + 1;
      }

      return 0;
    }
  });
}
