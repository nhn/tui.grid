import { Store, Row, Side, VisibleColumns } from '../store/types';
import { clamp } from '../helper/common';
import { PageInfo, ColumnInfo, KeyboardEventCommandType } from '../helper/keyboard';

export function getVisibleColumnNames(visibleColumns: VisibleColumns) {
  return [...visibleColumns.L, ...visibleColumns.R];
}

function indexOfColumnName(columnName: string, side: Side, visibleColumns: VisibleColumns) {
  let index = visibleColumns[side].findIndex((col) => col.name === columnName);

  if (side === 'R') {
    index += visibleColumns.L.length;
  }

  return index;
}

function isValidRowIndexRange(rowIndex: number, viewDataLength: number) {
  return rowIndex >= 0 && rowIndex < viewDataLength;
}

function findRowKey(rowKey: number | string, viewData: Row[], offset: number) {
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

function getPageMovedIndex(pageInfo: PageInfo, isPrevDir: boolean) {
  const { rowIndex, offsets, viewData, cellBorderWidth, bodyHeight } = pageInfo;
  let distance = bodyHeight;

  if (isPrevDir) {
    distance *= -1;
  }

  const movedIndex = findOffsetIndex(offsets, cellBorderWidth, offsets[rowIndex] + distance);

  return clamp(movedIndex, 0, viewData.length - 1);
}

function getPageMovedRowKey(pageInfo: PageInfo, isPrevDir: boolean) {
  const { rowKey, rowIndex, viewData } = pageInfo;
  const movedRowIndex = getPageMovedIndex(pageInfo, isPrevDir);
  const offset = movedRowIndex - rowIndex;

  return findRowKey(rowKey, viewData, offset);
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

function findColumnName({ columnName, side, visibleColumns }: ColumnInfo, offset: number) {
  let columnIndex = indexOfColumnName(columnName, side, visibleColumns);
  const visibleColumnNames = getVisibleColumnNames(visibleColumns);

  if (isValidColumnRange(columnIndex + offset, visibleColumnNames.length)) {
    columnIndex += offset;
  }

  return visibleColumnNames[columnIndex].name;
}

function firstColumnName(visibleColumns: VisibleColumns) {
  return getVisibleColumnNames(visibleColumns)[0].name;
}

function lastColumnName(visibleColumns: VisibleColumns) {
  const visibleColumnNames = getVisibleColumnNames(visibleColumns);

  return visibleColumnNames[visibleColumnNames.length - 1].name;
}

export function moveFocus(store: Store, command: KeyboardEventCommandType) {
  const {
    focus,
    data: { viewData },
    column: { visibleColumns },
    dimension: { bodyHeight, cellBorderWidth },
    rowCoords: { offsets }
  } = store;

  const { side, rowIndex } = focus;
  let { rowKey, columnName } = focus;

  if (!rowKey || !rowIndex || !columnName || !side) {
    return;
  }

  const pageInfo = {
    rowKey,
    rowIndex,
    offsets,
    viewData,
    cellBorderWidth,
    bodyHeight
  };

  const columnInfo = {
    columnName,
    side,
    visibleColumns
  };

  switch (command) {
    case 'up':
      rowKey = findRowKey(rowKey, viewData, -1);
      break;
    case 'down':
      rowKey = findRowKey(rowKey, viewData, 1);
      break;
    case 'left':
      columnName = findColumnName(columnInfo, -1);
      break;
    case 'right':
      columnName = findColumnName(columnInfo, 1);
      break;
    case 'firstCell':
      columnName = firstColumnName(visibleColumns);
      rowKey = firstRowKey(viewData);
      break;
    case 'lastCell':
      columnName = lastColumnName(visibleColumns);
      rowKey = lastRowKey(viewData);
      break;
    case 'pageUp':
      rowKey = getPageMovedRowKey(pageInfo, true);
      break;
    case 'pageDown':
      rowKey = getPageMovedRowKey(pageInfo, false);
      break;
    case 'firstColumn':
      columnName = firstColumnName(visibleColumns);
      break;
    case 'lastColumn':
      columnName = lastColumnName(visibleColumns);
      break;
    default:
      break;
  }

  focus.active = true;
  focus.rowKey = rowKey;
  focus.columnName = columnName;
}

export function editFocus(store: Store, command: KeyboardEventCommandType) {
  // @TODO: 이후 관련 키보드 이벤트 작업 필요
  console.log(store, command);
}

export function selectFocus(store: Store, command: KeyboardEventCommandType) {
  // @TODO: 이후 관련 키보드 이벤트 작업 필요
  console.log(store, command);
}

export function removeFocus(store: Store) {
  // @TODO: 이후 관련 키보드 이벤트 작업 필요
  console.log(store);
}
