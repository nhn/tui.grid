import { Store } from '@t/store';
import { Range, SelectionRange } from '@t/store/selection';
import { clamp, isNull } from '../helper/common';
import { KeyboardEventCommandType } from '../helper/keyboard';
import { getRowSpanTopIndex, getRowSpanBottomIndex, isRowSpanEnabled } from './rowSpan';
import { getSortedRange } from './selection';
import { isClientPagination } from './data';

type CellIndex = [number, number];

function getPrevRowIndex(rowIndex: number, heights: number[]) {
  let index = rowIndex;

  while (index > 0) {
    index -= 1;
    if (heights[index]) {
      break;
    }
  }

  return index;
}

function getNextRowIndex(rowIndex: number, heights: number[]) {
  let index = rowIndex;

  while (index < heights.length - 1) {
    index += 1;
    if (heights[index]) {
      break;
    }
  }

  return index;
}

export function getNextCellIndex(
  store: Store,
  command: KeyboardEventCommandType,
  [rowIndex, columnIndex]: CellIndex
): CellIndex {
  const {
    data,
    column,
    rowCoords: { heights },
  } = store;
  const { visibleColumnsWithRowHeader, rowHeaderCount } = column;
  const { sortState, filteredRawData, pageRowRange } = data;

  const lastRowIndex =
    (isClientPagination(data) ? pageRowRange[1] - pageRowRange[0] : filteredRawData.length) - 1;
  const columnName = visibleColumnsWithRowHeader[columnIndex].name;
  const lastRow = lastRowIndex === rowIndex;
  const lastColumn = visibleColumnsWithRowHeader.length - 1 === columnIndex;
  const firstRow = rowIndex === 0;
  const firstColumn = columnIndex === rowHeaderCount;

  switch (command) {
    case 'up':
      if (isRowSpanEnabled(sortState, column)) {
        rowIndex = getRowSpanTopIndex(rowIndex, columnName, filteredRawData);
      }
      rowIndex = getPrevRowIndex(rowIndex, heights);
      break;
    case 'down':
      if (isRowSpanEnabled(sortState, column)) {
        rowIndex = getRowSpanBottomIndex(rowIndex, columnName, filteredRawData);
      }
      rowIndex = getNextRowIndex(rowIndex, heights);
      break;
    case 'left':
      columnIndex -= 1;
      break;
    case 'right':
      columnIndex += 1;
      break;
    case 'firstCell':
      columnIndex = rowHeaderCount;
      rowIndex = 0;
      break;
    case 'lastCell':
      columnIndex = visibleColumnsWithRowHeader.length - 1;
      rowIndex = lastRowIndex;
      break;
    case 'pageUp': {
      rowIndex = 0;
      break;
    }
    case 'pageDown': {
      rowIndex = lastRowIndex;
      break;
    }
    case 'firstColumn':
      columnIndex = rowHeaderCount;
      break;
    case 'lastColumn':
      columnIndex = visibleColumnsWithRowHeader.length - 1;
      break;
    case 'nextCell':
      if (lastRow && lastColumn) {
        break;
      }
      if (lastColumn) {
        if (isRowSpanEnabled(sortState, column)) {
          rowIndex = getRowSpanBottomIndex(rowIndex, columnName, filteredRawData);
        }
        rowIndex = getNextRowIndex(rowIndex, heights);
        columnIndex = rowHeaderCount;
      } else {
        columnIndex += 1;
      }
      break;
    case 'prevCell':
      if (firstRow && firstColumn) {
        break;
      }
      if (firstColumn) {
        if (isRowSpanEnabled(sortState, column)) {
          rowIndex = getRowSpanTopIndex(rowIndex, columnName, filteredRawData);
        }
        rowIndex = getPrevRowIndex(rowIndex, heights);
        columnIndex = visibleColumnsWithRowHeader.length - 1;
      } else {
        columnIndex -= 1;
      }
      break;
    default:
      break;
  }

  rowIndex = clamp(rowIndex, 0, lastRowIndex);
  columnIndex = clamp(columnIndex, 0, visibleColumnsWithRowHeader.length - 1);

  return [rowIndex, columnIndex];
}

export function getRemoveRange(store: Store): SelectionRange | null {
  const { focus, selection } = store;
  const { totalColumnIndex, originalRowIndex } = focus;
  const { originalRange } = selection;

  if (originalRange) {
    return originalRange;
  }
  if (!isNull(totalColumnIndex) && !isNull(originalRowIndex)) {
    return {
      column: [totalColumnIndex, totalColumnIndex],
      row: [originalRowIndex, originalRowIndex],
    };
  }
  return null;
}

export function getNextCellIndexWithRowSpan(
  store: Store,
  command: KeyboardEventCommandType,
  currentRowIndex: number,
  columnRange: Range,
  cellIndexes: Range
) {
  let rowIndex = cellIndexes[0];
  const columnIndex = cellIndexes[1];
  const [startColumnIndex, endColumnIndex] = getSortedRange(columnRange);

  for (let index = startColumnIndex; index <= endColumnIndex; index += 1) {
    const nextRowIndex = getNextCellIndex(store, command, [currentRowIndex, index])[0];

    if (
      (command === 'up' && nextRowIndex < rowIndex) ||
      (command === 'down' && nextRowIndex > rowIndex)
    ) {
      rowIndex = nextRowIndex;
    }
  }
  return [rowIndex, columnIndex];
}
