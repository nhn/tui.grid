import { Store, RowKey } from '../store/types';
import { clamp } from '../helper/common';
import { KeyboardEventCommandType } from '../helper/keyboard';

function findOffsetIndex(offsets: number[], cellBorderWidth: number, position: number) {
  position += cellBorderWidth * 2;

  const idx = offsets.findIndex((offset) => offset - cellBorderWidth > position);

  return idx >= 0 ? idx - 1 : offsets.length - 1;
}

function getPageMovedPosition(
  rowIndex: number,
  offsets: number[],
  bodyHeight: number,
  isPrevDir: boolean
) {
  const distance = isPrevDir ? -bodyHeight : bodyHeight;

  return offsets[rowIndex] + distance;
}

function getPageMovedIndex(offsets: number[], cellBorderWidth: number, movedPosition: number) {
  const movedIndex = findOffsetIndex(offsets, cellBorderWidth, movedPosition);

  return clamp(movedIndex, 0, offsets.length - 1);
}

export function moveFocus(store: Store, command: KeyboardEventCommandType) {
  const {
    focus,
    data: { viewData },
    column: { visibleColumns, visibleColumnsBySide },
    dimension: { bodyHeight, cellBorderWidth },
    rowCoords: { offsets }
  } = store;

  let { rowIndex, columnIndex } = focus;

  if (rowIndex === null || columnIndex === null) {
    return;
  }

  if (focus.side === 'R') {
    columnIndex += visibleColumnsBySide.L.length;
  }

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

  rowIndex = clamp(rowIndex, 0, viewData.length);
  columnIndex = clamp(columnIndex, 0, visibleColumns.length);

  focus.navigating = true;
  focus.rowKey = viewData[rowIndex].rowKey;
  focus.columnName = visibleColumns[columnIndex].name;
}

export function editFocus({ column, focus }: Store, command: KeyboardEventCommandType) {
  const { rowKey, columnName } = focus;

  if (rowKey === null || columnName === null) {
    return;
  }

  if (command === 'currentCell') {
    const columnInfo = column.allColumnMap[columnName];

    if (columnInfo && columnInfo.editor) {
      focus.navigating = false;
      focus.editingAddress = { rowKey, columnName };
    }
  }
}

export function selectFocus(store: Store, command: KeyboardEventCommandType) {
  // @TODO: 이후 관련 키보드 이벤트 작업 필요
  console.log(store, command);
}

export function removeFocus(store: Store) {
  // @TODO: 이후 관련 키보드 이벤트 작업 필요
  console.log(store);
}

export function setFocusInfo(
  store: Store,
  rowKey: RowKey | null,
  columnName: string | null,
  navigating: boolean
) {
  store.focus.navigating = navigating;
  store.focus.rowKey = rowKey;
  store.focus.columnName = columnName;
}
