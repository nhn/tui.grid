import { Side } from '@t/store/focus';
import { SelectionUnit, SelectionType, SelectionRange, Selection, Range } from '@t/store/selection';
import { ColumnCoords } from '@t/store/columnCoords';
import { Column } from '@t/store/column';
import { Dimension } from '@t/store/dimension';
import { RowCoords } from '@t/store/rowCoords';
import { Data } from '@t/store/data';
import { observable } from '../helper/observable';
import { getSortedRange } from '../query/selection';
import { isClientPagination } from '../query/data';

type ColumnWidths = { [key in Side]: number[] };

interface SelectionOption {
  selectionUnit: SelectionUnit;
  columnCoords: ColumnCoords;
  column: Column;
  dimension: Dimension;
  rowCoords: RowCoords;
  data: Data;
}

function getOwnSideColumnRange(
  columnRange: Range,
  side: Side,
  visibleFrozenCount: number
): Range | null {
  const [start, end] = columnRange.map((columnIdx) => columnIdx);

  if (side === 'L' && start < visibleFrozenCount) {
    return [start, Math.min(end, visibleFrozenCount - 1)];
  }

  if (side === 'R' && end >= visibleFrozenCount) {
    return [Math.max(start, visibleFrozenCount) - visibleFrozenCount, end - visibleFrozenCount];
  }

  return null;
}

function getVerticalStyles(
  rowRange: Range,
  rowOffsets: number[],
  rowHeights: number[],
  cellBorderWidth: number
) {
  const top = rowOffsets[rowRange[0]];
  const bottom = rowOffsets[rowRange[1]] + rowHeights[rowRange[1]];

  return { top, height: bottom - top - cellBorderWidth };
}

function getHorizontalStyles(
  columnRange: Range | null,
  columnWidths: ColumnWidths,
  side: Side,
  cellBorderWidth: number
) {
  let left = 0;
  let width = 0;
  if (!columnRange) {
    return { left, width };
  }

  const widths = columnWidths[side];
  const startIndex = columnRange[0];
  const endIndex = Math.min(columnRange[1], widths.length - 1);

  for (let i = 0; i <= endIndex; i += 1) {
    if (i < startIndex) {
      left += widths[i] + cellBorderWidth;
    } else {
      width += widths[i] + cellBorderWidth;
    }
  }

  width -= cellBorderWidth;
  if (side === 'R' && endIndex === widths.length - 1) {
    width -= cellBorderWidth;
  }

  return { left, width };
}

export function create({
  selectionUnit,
  rowCoords,
  columnCoords,
  column: columnInfo,
  dimension,
  data,
}: SelectionOption) {
  return observable<Selection>({
    inputRange: null,
    unit: selectionUnit,
    type: 'cell' as SelectionType,
    intervalIdForAutoScroll: null,
    get range() {
      if (!this.inputRange) {
        return null;
      }
      const { widths: columnWidths } = columnCoords;
      const row = getSortedRange(this.inputRange.row);
      let column = getSortedRange(this.inputRange.column);

      if (this.unit === 'row') {
        const endColumnIndex = columnWidths.L.length + columnWidths.R.length - 1;
        column = [0, endColumnIndex];
      }

      return { row, column };
    },

    get rangeBySide() {
      if (!this.range) {
        return null;
      }
      const { visibleFrozenCount } = columnInfo;
      const { column, row } = this.range;

      return {
        L: { row, column: getOwnSideColumnRange(column, 'L', visibleFrozenCount) },
        R: { row, column: getOwnSideColumnRange(column, 'R', visibleFrozenCount) },
      };
    },

    get rangeAreaInfo() {
      if (!this.rangeBySide) {
        return null;
      }

      const { cellBorderWidth } = dimension;
      const { offsets: rowOffsets, heights: rowHeights } = rowCoords;
      const { widths: columnWidths } = columnCoords;
      const { L: leftRange, R: rightRange } = this.rangeBySide;

      let leftSideStyles = null;
      let rightSideStyles = null;

      if (leftRange.column) {
        leftSideStyles = {
          ...getVerticalStyles(leftRange.row, rowOffsets, rowHeights, cellBorderWidth),
          ...getHorizontalStyles(leftRange.column, columnWidths, 'L', cellBorderWidth),
        };
      }

      if (rightRange.column) {
        rightSideStyles = {
          ...getVerticalStyles(rightRange.row, rowOffsets, rowHeights, cellBorderWidth),
          ...getHorizontalStyles(rightRange.column, columnWidths, 'R', cellBorderWidth),
        };
      }

      return {
        L: leftSideStyles,
        R: rightSideStyles,
      };
    },

    get rangeWithRowHeader() {
      if (!this.range) {
        return null;
      }
      const { rowHeaderCount } = columnInfo;
      const {
        range: { row, column },
      } = this;

      const columnStartIndex = Math.max(column[0] - rowHeaderCount, 0);
      const columnEndIndex = Math.max(column[1] - rowHeaderCount, 0);

      return {
        row,
        column: [columnStartIndex, columnEndIndex] as Range,
      };
    },

    get originalRange(): SelectionRange | null {
      if (!this.range) {
        return null;
      }
      const { pageOptions } = data;
      const { row, column } = this.range;

      if (isClientPagination(data)) {
        const { perPage, page } = pageOptions;
        const prevPageRowCount = perPage * (page - 1);
        return {
          row: [row[0] + prevPageRowCount, row[1] + prevPageRowCount],
          column,
        };
      }

      return this.range;
    },
  });
}
