import { Column, Range, Viewport, Dimension, Data, RowCoords, ColumnCoords } from './types';
import { observable, Observable } from '../helper/observable';
import { arrayEqual, findIndex } from '../helper/common';
import { getMaxRowSpanCount, isRowSpanEnabled } from '../helper/rowSpan';

interface ViewPortOption {
  data: Data;
  column: Column;
  dimension: Dimension;
  rowCoords: RowCoords;
  columnCoords: ColumnCoords;
  showDummyRows: boolean;
}

function findIndexByPosition(offsets: number[], position: number) {
  const rowOffset = findIndex(offset => offset > position, offsets);

  return rowOffset === -1 ? offsets.length - 1 : rowOffset - 1;
}

function calculateRange(
  scrollPos: number,
  totalSize: number,
  offsets: number[],
  data: Data,
  rowCalculation?: boolean
): Range {
  // safari uses negative scroll position for bouncing effect
  scrollPos = Math.max(scrollPos, 0);

  const start = findIndexByPosition(offsets, scrollPos);
  const end = findIndexByPosition(offsets, scrollPos + totalSize) + 1;
  const { rawData, sortOptions } = data;

  if (rawData.length && rowCalculation && isRowSpanEnabled(sortOptions)) {
    const maxRowSpanCount = getMaxRowSpanCount(start, rawData);
    const topRowSpanIndex = start - maxRowSpanCount;

    return [topRowSpanIndex >= 0 ? topRowSpanIndex : 0, end];
  }

  return [start, end];
}

function getCachedRange(cachedRange: Range, newRange: Range) {
  if (cachedRange && arrayEqual(cachedRange, newRange)) {
    return cachedRange;
  }
  return newRange;
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
      widths.R.forEach(width => {
        totalRWidth += width + cellBorderWidth;
      });

      return totalRWidth - areaWidth.R + scrollbarWidth;
    },

    get maxScrollTop() {
      const { bodyHeight, scrollbarWidth } = dimension;
      const { totalRowHeight } = rowCoords;

      return totalRowHeight - bodyHeight + scrollbarWidth;
    },

    // only for right side columns
    get colRange(this: Observable<Viewport>) {
      const range = calculateRange(
        this.scrollLeft,
        columnCoords.areaWidth.R,
        columnCoords.offsets.R,
        data
      );
      return getCachedRange(this.__storage__.colRange, range);
    },

    // only for right side columns
    get columns(this: Viewport) {
      return column.visibleColumnsBySideWithRowHeader.R.slice(...this.colRange);
    },

    get offsetLeft(this: Viewport) {
      return columnCoords.offsets.R[this.colRange[0]];
    },

    get rowRange(this: Observable<Viewport>) {
      const range = calculateRange(
        this.scrollTop,
        dimension.bodyHeight,
        rowCoords.offsets,
        data,
        true
      );
      return getCachedRange(this.__storage__.rowRange, range);
    },

    get rows(this: Viewport) {
      return data.viewData.slice(...this.rowRange);
    },

    get offsetTop(this: Viewport) {
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
