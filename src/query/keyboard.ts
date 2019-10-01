import { CellIndex, Store } from '../store/types';
import { clamp, isNull } from '../helper/common';
import { getNextRowIndex, getPrevRowIndex, KeyboardEventCommandType } from '../helper/keyboard';
import { getRowSpanTopIndex, getRowSpanBottomIndex, isRowSpanEnabled } from '../helper/rowSpan';

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

  const { viewData, sortState, filteredRawData, filteredViewData } = data;
  const columnName = visibleColumnsWithRowHeader[columnIndex].name;

  switch (command) {
    case 'up':
      if (isRowSpanEnabled(sortState)) {
        rowIndex = getRowSpanTopIndex(rowIndex, columnName, filteredRawData);
      }
      rowIndex = getPrevRowIndex(rowIndex, heights);
      break;
    case 'down':
      if (isRowSpanEnabled(sortState)) {
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

  rowIndex = clamp(rowIndex, 0, filteredViewData.length - 1);
  columnIndex = clamp(columnIndex, 0, visibleColumnsWithRowHeader.length - 1);

  return [rowIndex, columnIndex];
}

export function getRemoveRange(store: Store) {
  const { focus, selection } = store;
  const { totalColumnIndex, originalRowIndex } = focus;
  const { originalRange } = selection;

  if (originalRange) {
    return originalRange;
  }
  if (!isNull(totalColumnIndex) && !isNull(originalRowIndex)) {
    return {
      column: [totalColumnIndex, totalColumnIndex],
      row: [originalRowIndex, originalRowIndex]
    };
  }
  return null;
}
