import {
  Column,
  ColumnCoords,
  Dimension,
  Range,
  RowCoords,
  Selection,
  SelectionType,
  SelectionUnit,
  Side
} from './types';
import { Observable, observable } from '../helper/observable';
import { getSortedRange } from '../helper/selection';

type ColumnWidths = { [key in Side]: number[] };

interface SelectionOptions {
  selectionUnit: SelectionUnit;
  columnCoords: ColumnCoords;
  column: Column;
  dimension: Dimension;
  rowCoords: RowCoords;
}

function getOwnSideColumnRange(
  columnRange: Range,
  side: Side,
  visibleFrozenCount: number,
  rowHeaderCount: number
): Range | null {
  const [start, end] = columnRange.map((columnIdx) => columnIdx + rowHeaderCount);

  if (side === 'L' && start < visibleFrozenCount) {
    return [start, Math.min(end, visibleFrozenCount - 1)];
  }

  if (side === 'R' && end >= visibleFrozenCount) {
    return [Math.max(start, visibleFrozenCount) - visibleFrozenCount, end - visibleFrozenCount];
  }

  return null;
}

function getVerticalStyles(rowRange: Range, rowOffsets: number[], rowHeights: number[]) {
  const top = rowOffsets[rowRange[0]];
  const bottom = rowOffsets[rowRange[1]] + rowHeights[rowRange[1]];

  return { top, height: bottom - top };
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

  return { left, width };
}

export function create({
  selectionUnit,
  rowCoords,
  columnCoords,
  column: columnInfo,
  dimension
}: SelectionOptions): Observable<Selection> {
  return observable({
    inputRange: null,
    unit: selectionUnit,
    type: 'cell' as SelectionType,
    intervalIdForAutoScroll: null,
    get range(this: Selection) {
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

      // @TODO: span 처리 필요
      return { row, column };
    },
    get rangeBySide(this: Selection) {
      if (!this.range) {
        return null;
      }
      const { visibleFrozenCount, rowHeaderCount } = columnInfo;
      const { column, row } = this.range;

      return {
        L: { row, column: getOwnSideColumnRange(column, 'L', visibleFrozenCount, rowHeaderCount) },
        R: { row, column: getOwnSideColumnRange(column, 'R', visibleFrozenCount, rowHeaderCount) }
      };
    },
    get rangeAreaInfo(this: Selection) {
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
          ...getVerticalStyles(leftRange.row, rowOffsets, rowHeights),
          ...getHorizontalStyles(leftRange.column, columnWidths, 'L', cellBorderWidth)
        };
      }

      if (rightRange.column) {
        rightSideStyles = {
          ...getVerticalStyles(rightRange.row, rowOffsets, rowHeights),
          ...getHorizontalStyles(rightRange.column, columnWidths, 'R', cellBorderWidth)
        };
      }

      return {
        L: leftSideStyles,
        R: rightSideStyles
      };
    }
  });
}
