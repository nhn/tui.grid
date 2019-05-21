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
import { Reactive, reactive } from '../helper/reactive';

type ColumnWidths = { [key in Side]: number[] };

interface SelectionOptions {
  selectionUnit: SelectionUnit;
  columnCoords: ColumnCoords;
  column: Column;
  dimension: Dimension;
  rowCoords: RowCoords;
}

function getSortedRange(range: Range): Range {
  return range[0] > range[1] ? [range[1], range[0]] : range;
}

function getOwnSideColumnRange(
  columnRange: Range,
  side: Side,
  visibleFrozenCount: number
): Range | null {
  if (side === 'L') {
    if (columnRange[0] < visibleFrozenCount) {
      return [columnRange[0], Math.min(columnRange[1], visibleFrozenCount - 1)];
    }
  } else if (columnRange[1] >= visibleFrozenCount) {
    return [
      Math.max(columnRange[0], visibleFrozenCount) - visibleFrozenCount,
      columnRange[1] - visibleFrozenCount
    ];
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
  column: { visibleFrozenCount },
  dimension: { cellBorderWidth }
}: SelectionOptions): Reactive<Selection> {
  return reactive({
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
        const lastColumnIndex = columnWidths.L.length + columnWidths.R.length - 1;
        column = [0, lastColumnIndex];
      }

      // @TODO: span 처리 필요
      return { row, column };
    },
    get rangeBySide(this: Selection) {
      if (!this.range) {
        return null;
      }
      const { column, row } = this.range;

      return {
        L: { row, column: getOwnSideColumnRange(column, 'L', visibleFrozenCount) },
        R: { row, column: getOwnSideColumnRange(column, 'R', visibleFrozenCount) }
      };
    },
    get rangeAreaInfo(this: Selection) {
      if (!this.rangeBySide) {
        return null;
      }
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
