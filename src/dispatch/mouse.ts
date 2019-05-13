import { Store, Side, Range, Dimension, Selection } from '../store/types';
import { findOffsetIndex } from '../helper/common';

export function setNavigating({ focus }: Store, navigating: boolean) {
  focus.navigating = navigating;
}

interface MouseEventInfo {
  offsetX: number;
  offsetY: number;
  side: Side;
  shiftKey: boolean;
}

interface ViewInfo {
  scrollLeft: number;
  scrollTop: number;
  pageX: number;
  pageY: number;
}

interface IndexInfo {
  rowIndex: number;
  columnIndex: number;
}

function getSortedRange(range: Range): Range {
  return range[0] > range[1] ? [range[1], range[0]] : range;
}

function getTotalColumnOffsets(widths: { [key in Side]: number[] }, cellBorderWidth: number) {
  const totalWidths = [...widths.L, ...widths.R];
  const offsets = [0];
  for (let i = 1, len = totalWidths.length; i < len; i += 1) {
    offsets[i] = offsets[i - 1] + totalWidths[i - 1] + cellBorderWidth;
  }

  return offsets;
}

function getScrolledPosition(
  { pageX, pageY, scrollLeft, scrollTop }: ViewInfo,
  {
    offsetLeft,
    offsetTop,
    tableBorderWidth,
    cellBorderWidth,
    headerHeight,
    summaryHeight,
    summaryPosition
  }: Dimension,
  lsideWidth: number
) {
  const smHeight = summaryPosition === 'top' ? summaryHeight : 0;
  const bodyPositionX = pageX - offsetLeft;
  const bodyPositionY =
    pageY - (offsetTop + headerHeight + smHeight + cellBorderWidth + tableBorderWidth);
  const isRSide = bodyPositionX > lsideWidth;
  const scrollX = isRSide ? scrollLeft : 0;
  const scrolledPositionX = bodyPositionX + scrollX;
  const scrolledPositionY = bodyPositionY + scrollTop;

  return {
    x: scrolledPositionX,
    y: scrolledPositionY
  };
}

function getRange(
  selection: Selection,
  { rowIndex, columnIndex }: IndexInfo,
  { rowIndex: focusRowIndex, columnIndex: focusColumnIndex }: IndexInfo,
  columnLength: number,
  rowLength: number
) {
  const { unit, type } = selection;
  let { inputRange } = selection;
  const rowStartIndex = focusRowIndex;
  let rowEndIndex = rowIndex;
  let columnStartIndex = focusColumnIndex;
  let columnEndIndex = columnIndex;

  if (!inputRange) {
    if (unit === 'row') {
      selection.type = 'row';
      columnStartIndex = 0;
    } else {
      selection.type = 'cell';
    }
  }

  if (type === 'row') {
    columnEndIndex = columnLength - 1;
  } else if (type === 'column') {
    rowEndIndex = rowLength - 1;
  }

  inputRange = {
    row: [rowStartIndex, rowEndIndex],
    column: [columnStartIndex, columnEndIndex]
  };

  return inputRange;
}

// @TODO: 정리 필요
// ⬆️ dispatch 하는데 필요한 함수
// ⬇️ dispatch 할 떄 호출되는 함수
export function mouseDownBody(store: Store, eventInfo: MouseEventInfo) {
  const { data, column, columnCoords, rowCoords, focus, selection } = store;
  const { offsetX, offsetY, side, shiftKey } = eventInfo;

  const rowIndex = findOffsetIndex(rowCoords.offsets, offsetY);
  const columnIndex = findOffsetIndex(columnCoords.offsets[side], offsetX);
  const columnName = column.visibleColumnsBySide[side][columnIndex].name;

  if (columnName !== '_number') {
    focus.rowKey = data.viewData[rowIndex].rowKey;
    focus.columnName = columnName;
  }

  if (shiftKey) {
    // @TODO: update
  } else if (selection.type === 'row') {
    // @TODO: select row
  } else {
    focus.rowKey = data.viewData[rowIndex].rowKey;
    focus.columnName = column.visibleColumnsBySide[side][columnIndex].name;
  }
}

export function dragMoveBody(store: Store, eventInfo: MouseEvent) {
  const {
    data: { viewData },
    column: { visibleColumns, visibleColumnsBySide },
    dimension,
    viewport: { scrollTop, scrollLeft },
    columnCoords: {
      widths,
      areaWidth: { L: lsideWidth }
    },
    rowCoords: { offsets: rowOffsets },
    selection,
    focus: { rowIndex: focusRowIndex, columnIndex: focusColumnIndex, side }
  } = store;
  const { pageX, pageY } = eventInfo;

  if (focusColumnIndex === null || focusRowIndex === null) {
    return;
  }

  const viewInfo = {
    pageX,
    pageY,
    scrollTop,
    scrollLeft
  };

  const scrolledPosition = getScrolledPosition(viewInfo, dimension, lsideWidth);
  const rowIndex = findOffsetIndex(rowOffsets, scrolledPosition.y);
  const totalColumnOffsets = getTotalColumnOffsets(widths, dimension.cellBorderWidth);
  const columnIndex = findOffsetIndex(totalColumnOffsets, scrolledPosition.x);
  const totalFocusColumnIndex =
    side === 'R' ? focusColumnIndex + visibleColumnsBySide.L.length : focusColumnIndex;

  const inputIndex = { rowIndex, columnIndex };
  const focusIndex = { rowIndex: focusRowIndex, columnIndex: totalFocusColumnIndex };

  const range = getRange(selection, inputIndex, focusIndex, visibleColumns.length, viewData.length);

  selection.range = {
    row: getSortedRange(range.row),
    column: getSortedRange(range.column)
  };
}

export function dragEndBody({ selection }: Store) {
  selection.inputRange = null;
  selection.range = null;
  // selection.minimumColumnRange = null;
}
