import { CellIndex, Store } from '../store/types';
import { clamp } from '../helper/common';
import {
  getPageMovedIndex,
  getPageMovedPosition,
  KeyboardEventCommandType
} from '../helper/keyboard';

export function getNextCellIndex(
  store: Store,
  command: KeyboardEventCommandType,
  [rowIndex, columnIndex]: CellIndex
): CellIndex {
  const {
    data: { viewData },
    column: { visibleColumns },
    dimension: { bodyHeight, cellBorderWidth },
    rowCoords: { offsets }
  } = store;

  switch (command) {
    case 'up':
      rowIndex -= 1;
      break;
    case 'down':
      rowIndex += 1;
      break;
    case 'left':
      columnIndex -= 1;
      break;
    case 'right':
      columnIndex += 1;
      break;
    case 'firstCell':
      columnIndex = 0;
      rowIndex = 0;
      break;
    case 'lastCell':
      columnIndex = visibleColumns.length - 1;
      rowIndex = viewData.length - 1;
      break;
    case 'pageUp': {
      const movedPosition = getPageMovedPosition(rowIndex, offsets, bodyHeight, true);
      rowIndex = getPageMovedIndex(offsets, cellBorderWidth, movedPosition);
      break;
    }
    case 'pageDown': {
      const movedPosition = getPageMovedPosition(rowIndex, offsets, bodyHeight, false);
      rowIndex = getPageMovedIndex(offsets, cellBorderWidth, movedPosition);
      break;
    }
    case 'firstColumn':
      columnIndex = 0;
      break;
    case 'lastColumn':
      columnIndex = visibleColumns.length - 1;
      break;
    default:
      break;
  }

  rowIndex = clamp(rowIndex, 0, viewData.length - 1);
  columnIndex = clamp(columnIndex, 0, visibleColumns.length - 1);

  return [rowIndex, columnIndex];
}
