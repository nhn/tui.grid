import { CellIndex, Store } from '../store/types';
import { clamp, isNull } from '../helper/common';
import { getNextRowIndex, getPrevRowIndex, KeyboardEventCommandType } from '../helper/keyboard';
import { getRowSpanTopIndex, getRowSpanBottomIndex, enableRowSpan } from '../helper/rowSpan';

export function getNextCellIndex(
  store: Store,
  command: KeyboardEventCommandType,
  [rowIndex, columnIndex]: CellIndex
): CellIndex {
  const {
    data,
    column: { visibleColumnsWithRowHeader, rowHeaderCount },
    rowCoords: { heights }
  } = store;
  const { rawData, viewData, sortOptions } = data;
  const columnName = visibleColumnsWithRowHeader[columnIndex].name;
  const firstColumnSortOption = sortOptions.columns[0];

  switch (command) {
    case 'up':
      if (enableRowSpan(firstColumnSortOption.columnName)) {
        rowIndex = getRowSpanTopIndex(rowIndex, columnName, rawData);
      }
      rowIndex = getPrevRowIndex(rowIndex, heights);
      break;
    case 'down':
      if (enableRowSpan(firstColumnSortOption.columnName)) {
        rowIndex = getRowSpanBottomIndex(rowIndex, columnName, rawData);
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
      rowIndex = viewData.length - 1;
      break;
    case 'pageUp': {
      rowIndex = 0;
      break;
    }
    case 'pageDown': {
      rowIndex = viewData.length - 1;
      break;
    }
    case 'firstColumn':
      columnIndex = rowHeaderCount;
      break;
    case 'lastColumn':
      columnIndex = visibleColumnsWithRowHeader.length - 1;
      break;
    default:
      break;
  }

  rowIndex = clamp(rowIndex, 0, viewData.length - 1);
  columnIndex = clamp(columnIndex, 0, visibleColumnsWithRowHeader.length - 1);

  return [rowIndex, columnIndex];
}

export function getRemoveRange(store: Store) {
  const { focus, selection } = store;
  const { totalColumnIndex, rowIndex } = focus;
  const { range } = selection;

  if (range) {
    return range;
  }
  if (!isNull(totalColumnIndex) && !isNull(rowIndex)) {
    return {
      column: [totalColumnIndex, totalColumnIndex],
      row: [rowIndex, rowIndex]
    };
  }
  return null;
}
