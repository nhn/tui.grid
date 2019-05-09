import { Store, Row, ColumnInfo, RowKey } from '../store/types';
import { clamp } from '../helper/common';
import { KeyboardEventCommandType } from '../helper/keyboard';

function indexOfColumnName(columnName: string, visibleColumns: ColumnInfo[]) {
  return visibleColumns.findIndex((col) => col.name === columnName);
}

function isValidRowIndexRange(rowIndex: number, viewDataLength: number) {
  return rowIndex >= 0 && rowIndex < viewDataLength;
}

function findRowKey(rowKey: RowKey, viewData: Row[], offset: number) {
  let rowIndex = viewData.findIndex((data) => data.rowKey === rowKey);
  if (isValidRowIndexRange(rowIndex + offset, viewData.length)) {
    rowIndex += offset;
  }

  return viewData[rowIndex].rowKey;
}

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

function firstRowKey(viewData: Row[]) {
  return viewData[0].rowKey;
}

function lastRowKey(viewData: Row[]) {
  return viewData[viewData.length - 1].rowKey;
}

function isValidColumnRange(columnIndex: number, columnLength: number) {
  return columnIndex >= 0 && columnIndex < columnLength;
}

function findColumnName(columnName: string, visibleColumns: ColumnInfo[], offset: number) {
  let columnIndex = indexOfColumnName(columnName, visibleColumns);

  if (isValidColumnRange(columnIndex + offset, visibleColumns.length)) {
    columnIndex += offset;
  }

  return visibleColumns[columnIndex].name;
}

function firstColumnName(visibleColumns: ColumnInfo[]) {
  return visibleColumns[0].name;
}

function lastColumnName(visibleColumns: ColumnInfo[]) {
  return visibleColumns[visibleColumns.length - 1].name;
}

export function moveFocus(store: Store, command: KeyboardEventCommandType) {
  const {
    focus,
    data: { viewData },
    column: { visibleColumns },
    dimension: { bodyHeight, cellBorderWidth },
    rowCoords: { offsets }
  } = store;

  const { rowIndex } = focus;
  let { rowKey, columnName } = focus;

  if (rowKey === null || rowIndex === null || columnName === null) {
    return;
  }

  switch (command) {
    case 'up':
      rowKey = findRowKey(rowKey, viewData, -1);
      break;
    case 'down':
      rowKey = findRowKey(rowKey, viewData, 1);
      break;
    case 'left':
      columnName = findColumnName(columnName, visibleColumns, -1);
      break;
    case 'right':
      columnName = findColumnName(columnName, visibleColumns, 1);
      break;
    case 'firstCell':
      columnName = firstColumnName(visibleColumns);
      rowKey = firstRowKey(viewData);
      break;
    case 'lastCell':
      columnName = lastColumnName(visibleColumns);
      rowKey = lastRowKey(viewData);
      break;
    case 'pageUp': {
      const movedPosition = getPageMovedPosition(rowIndex, offsets, bodyHeight, true);
      const movedRowIndex = getPageMovedIndex(offsets, cellBorderWidth, movedPosition);
      // eslint-disable-next-line prefer-destructuring
      rowKey = viewData[movedRowIndex].rowKey;
      break;
    }
    case 'pageDown': {
      const movedPosition = getPageMovedPosition(rowIndex, offsets, bodyHeight, false);
      const movedRowIndex = getPageMovedIndex(offsets, cellBorderWidth, movedPosition);
      // eslint-disable-next-line prefer-destructuring
      rowKey = viewData[movedRowIndex].rowKey;
      break;
    }
    case 'firstColumn':
      columnName = firstColumnName(visibleColumns);
      break;
    case 'lastColumn':
      columnName = lastColumnName(visibleColumns);
      break;
    default:
      break;
  }

  focus.navigating = true;
  focus.rowKey = rowKey;
  focus.columnName = columnName;
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
      focus.editing = { rowKey, columnName };
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
