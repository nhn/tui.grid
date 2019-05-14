import { Store, Side, Range, Dimension, Selection, SelectionRange } from '../store/types';
import { findOffsetIndex } from '../helper/common';

type Widths = { [key in Side]: number[] };

interface ElementInfo {
  side: Side;
  top: number;
  left: number;
  scrollTop: number;
  scrollLeft: number;
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

interface BodySize {
  bodyWidth: number;
  bodyHeight: number;
}

interface ContainerPosition {
  x: number;
  y: number;
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
  dimension: Dimension,
  lsideWidth: number
) {
  const {
    offsetLeft,
    offsetTop,
    tableBorderWidth,
    cellBorderWidth,
    headerHeight,
    summaryHeight,
    summaryPosition
  } = dimension;
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
  const { unit, type, range: prevRange } = selection;
  const rowStartIndex = focusRowIndex;
  let rowEndIndex = rowIndex;
  let columnStartIndex = focusColumnIndex;
  let columnEndIndex = columnIndex;

  if (!prevRange && unit === 'row') {
    columnStartIndex = 0;
  }

  if (type === 'row') {
    columnEndIndex = columnLength - 1;
  } else if (type === 'column') {
    rowEndIndex = rowLength - 1;
  }

  const range = {
    row: getSortedRange([rowStartIndex, rowEndIndex]),
    column: getSortedRange([columnStartIndex, columnEndIndex])
  };

  return range as SelectionRange;
}

function judgeOverflow(
  { x: containerX, y: containerY }: ContainerPosition,
  { bodyHeight, bodyWidth }: BodySize
) {
  // const containerX = containerPosition.x;
  // const containerY = containerPosition.y;
  let overflowY = 0;
  let overflowX = 0;

  if (containerY < 0) {
    overflowY = -1;
  } else if (containerY > bodyHeight) {
    overflowY = 1;
  }

  if (containerX < 0) {
    overflowX = -1;
  } else if (containerX > bodyWidth) {
    overflowX = 1;
  }

  return {
    x: overflowX,
    y: overflowY
  };
}

function getOverflowFromMousePosition(
  pageX: number,
  pageY: number,
  bodyHeight: number,
  widths: Widths
) {
  const bodySize = {
    bodyWidth: 0,
    bodyHeight
  };
  [...widths.L, ...widths.R].forEach((width) => {
    bodySize.bodyWidth += width;
  });

  const x = 0;
  const y = 0;

  return judgeOverflow({ x, y }, bodySize);
}

function stopAutoScroll(selection: Selection) {
  const { intervalIdForAutoScroll } = selection;

  if (intervalIdForAutoScroll !== null) {
    clearInterval(intervalIdForAutoScroll);
    selection.intervalIdForAutoScroll = null;
  }
}

function isAutoScrollable(overflowX: number, overflowY: number) {
  return !(overflowX === 0 && overflowY === 0);
}

function setScrolling(
  pageX: number,
  pageY: number,
  bodyHeight: number,
  widths: Widths,
  selection: Selection
) {
  // @TODO
  // 1. overflow x y 위치 받아옴
  const overflow = getOverflowFromMousePosition(pageX, pageY, bodyHeight, widths);
  stopAutoScroll(selection);
  if(isAutoScrollable(overflow.x, overflow.y)) {
    selection.intervalIdForAutoScroll = setInterval(this.adjustScroll, )
  }
  // 2. stopAutoScroll
  // 3. isAutoScrollable 이면 adjustScroll Interval을 건다.
}

// ⬆️ dispatch 하는데 필요한 함수
// ⬇️ dispatch 할 떄 호출되는 함수

export function setFocusActive({ focus }: Store, active: boolean) {
  focus.active = active;
}

export function selectionEnd({ selection }: Store) {
  selection.range = null;
  // selection.minimumColumnRange = null;
}

export function selectionUpdate(store: Store, eventInfo: MouseEvent) {
  const {
    data: { viewData },
    column: { visibleColumns, visibleColumnsBySide },
    dimension,
    viewport: { scrollTop, scrollLeft },
    columnCoords: { widths, areaWidth },
    rowCoords: { offsets: rowOffsets },
    selection,
    focus: { rowIndex: focusRowIndex, columnIndex: focusColumnIndex, side }
  } = store;
  const { pageX, pageY } = eventInfo;

  if (focusColumnIndex === null || focusRowIndex === null) {
    return;
  }

  const viewInfo = { pageX, pageY, scrollTop, scrollLeft };
  const scrolledPosition = getScrolledPosition(viewInfo, dimension, areaWidth.L);
  const rowIndex = findOffsetIndex(rowOffsets, scrolledPosition.y);
  const totalColumnOffsets = getTotalColumnOffsets(widths, dimension.cellBorderWidth);
  const columnIndex = findOffsetIndex(totalColumnOffsets, scrolledPosition.x);
  const totalFocusColumnIndex =
    side === 'R' ? focusColumnIndex + visibleColumnsBySide.L.length : focusColumnIndex;

  const inputIndex = { rowIndex, columnIndex };
  const focusIndex = { rowIndex: focusRowIndex, columnIndex: totalFocusColumnIndex };

  selection.range = getRange(
    selection,
    inputIndex,
    focusIndex,
    visibleColumns.length,
    viewData.length
  );
}

export function dragMoveBody(store: Store, eventInfo: MouseEvent) {
  const {
    dimension: { bodyHeight },
    columnCoords: { widths },
    selection
  } = store;
  const { pageX, pageY } = eventInfo;

  selectionUpdate(store, eventInfo);
  setScrolling(pageX, pageY, bodyHeight, widths, selection);
}

export function mouseDownBody(store: Store, elementInfo: ElementInfo, eventInfo: MouseEvent) {
  const { data, column, columnCoords, rowCoords, focus, selection } = store;
  const { pageX, pageY, shiftKey } = eventInfo;

  if (shiftKey) {
    // @TODO: dispatch 가 아니라 분리된 함수를 호출하도록 수정 필요
    selectionUpdate(store, eventInfo);
  } else if (selection.type === 'row') {
    // @TODO: select row
  } else {
    const { side, scrollLeft, scrollTop, left, top } = elementInfo;
    const offsetX = pageX - left + scrollLeft;
    const offsetY = pageY - top + scrollTop;

    const rowIndex = findOffsetIndex(rowCoords.offsets, offsetY);
    const columnIndex = findOffsetIndex(columnCoords.offsets[side], offsetX);

    focus.rowKey = data.viewData[rowIndex].rowKey;
    focus.columnName = column.visibleColumnsBySide[side][columnIndex].name;
    selectionEnd(store);
  }
}
