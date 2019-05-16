import { Store, Side, Dimension, Selection, Viewport } from '../store/types';
import { findOffsetIndex } from '../helper/common';
import { isRowHeader } from '../helper/column';

export function setNavigating({ focus }: Store, navigating: boolean) {
  focus.navigating = navigating;
}

type OverflowType = -1 | 0 | 1;

interface OverflowInfo {
  x: OverflowType;
  y: OverflowType;
}

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

interface BodySize {
  bodyWidth: number;
  bodyHeight: number;
}

interface ContainerPosition {
  x: number;
  y: number;
}

function getPositionFromBodyArea(pageX: number, pageY: number, dimension: Dimension) {
  const {
    offsetLeft,
    offsetTop,
    tableBorderWidth,
    cellBorderWidth,
    headerHeight,
    summaryHeight,
    summaryPosition
  } = dimension;
  const adjustedSummaryHeight = summaryPosition === 'top' ? summaryHeight : 0;

  return {
    x: pageX - offsetLeft,
    y:
      pageY -
      (offsetTop + headerHeight + adjustedSummaryHeight + cellBorderWidth + tableBorderWidth)
  };
}

function getTotalColumnOffsets(widths: { [key in Side]: number[] }, cellBorderWidth: number) {
  const totalWidths = [...widths.L, ...widths.R];
  const offsets = [0];
  for (let i = 1, len = totalWidths.length; i < len; i += 1) {
    offsets.push(offsets[i - 1] + totalWidths[i - 1] + cellBorderWidth);
  }

  return offsets;
}

function getScrolledPosition(
  { pageX, pageY, scrollLeft, scrollTop }: ViewInfo,
  dimension: Dimension,
  leftSideWidth: number
) {
  const { x: bodyPositionX, y: bodyPositionY } = getPositionFromBodyArea(pageX, pageY, dimension);
  const scrollX = bodyPositionX > leftSideWidth ? scrollLeft : 0;
  const scrolledPositionX = bodyPositionX + scrollX;
  const scrolledPositionY = bodyPositionY + scrollTop;

  return {
    x: scrolledPositionX,
    y: scrolledPositionY
  };
}

function judgeOverflow(
  { x: containerX, y: containerY }: ContainerPosition,
  { bodyHeight, bodyWidth }: BodySize
): OverflowInfo {
  let overflowY: OverflowType = 0;
  let overflowX: OverflowType = 0;

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
  bodyWidth: number,
  dimension: Dimension
) {
  const { bodyHeight } = dimension;
  const { x, y } = getPositionFromBodyArea(pageX, pageY, dimension);

  return judgeOverflow({ x, y }, { bodyWidth, bodyHeight });
}

function stopAutoScroll(selection: Selection) {
  const { intervalIdForAutoScroll } = selection;

  if (intervalIdForAutoScroll !== null) {
    clearInterval(intervalIdForAutoScroll);
    selection.intervalIdForAutoScroll = null;
  }
}

function isAutoScrollable(overflowX: OverflowType, overflowY: OverflowType) {
  return !(overflowX === 0 && overflowY === 0);
}

function adjustScrollLeft(overflowX: OverflowType, viewport: Viewport) {
  const { scrollPixelScale, scrollLeft, maxScrollLeft } = viewport;

  if (overflowX < 0) {
    viewport.scrollLeft = Math.max(0, scrollLeft - scrollPixelScale);
  } else if (overflowX > 0) {
    viewport.scrollLeft = Math.max(maxScrollLeft, scrollLeft - scrollPixelScale);
  }
}

function adjustScrollTop(overflowY: OverflowType, viewport: Viewport) {
  const { scrollTop, maxScrollTop, scrollPixelScale } = viewport;

  if (overflowY < 0) {
    viewport.scrollTop = Math.max(0, scrollTop - scrollPixelScale);
  } else if (overflowY > 0) {
    viewport.scrollTop = Math.min(maxScrollTop, scrollTop + scrollPixelScale);
  }
}

function adjustScroll(viewport: Viewport, overflow: OverflowInfo) {
  if (overflow.x) {
    adjustScrollLeft(overflow.x, viewport);
  }

  if (overflow.y) {
    adjustScrollTop(overflow.y, viewport);
  }
}

function setScrolling(
  { pageX, pageY }: MouseEvent,
  bodyWidth: number,
  selection: Selection,
  dimension: Dimension,
  viewport: Viewport
) {
  const overflow = getOverflowFromMousePosition(pageX, pageY, bodyWidth, dimension);
  stopAutoScroll(selection);
  if (isAutoScrollable(overflow.x, overflow.y)) {
    selection.intervalIdForAutoScroll = setInterval(adjustScroll.bind(null, viewport, overflow));
  }
}

export function selectionEnd({ selection }: Store) {
  selection.inputRange = null;
  // @TODO: minimumColumnRange 고려 필요
  // selection.minimumColumnRange = null;
}

export function selectionUpdate(store: Store, eventInfo: MouseEvent) {
  const {
    dimension,
    viewport: { scrollTop, scrollLeft },
    columnCoords: { widths, areaWidth },
    rowCoords: { offsets: rowOffsets },
    selection,
    focus: {
      rowIndex: focusRowIndex,
      columnIndex: focusColumnIndex,
      totalColumnIndex: totalFocusColumnIndex
    }
  } = store;
  const { pageX, pageY } = eventInfo;
  const { inputRange } = selection;

  if (focusColumnIndex === null || focusRowIndex === null || totalFocusColumnIndex === null) {
    return;
  }

  let startRowIndex, startColumnIndex;
  const viewInfo = { pageX, pageY, scrollTop, scrollLeft };
  const scrolledPosition = getScrolledPosition(viewInfo, dimension, areaWidth.L);
  const rowIndex = findOffsetIndex(rowOffsets, scrolledPosition.y);
  const totalColumnOffsets = getTotalColumnOffsets(widths, dimension.cellBorderWidth);
  const columnIndex = findOffsetIndex(totalColumnOffsets, scrolledPosition.x);

  if (inputRange === null) {
    startRowIndex = rowIndex;
    startColumnIndex = columnIndex;
  } else {
    startRowIndex = inputRange.row![0];
    startColumnIndex = inputRange.column![0];
  }

  selection.inputRange = {
    row: [startRowIndex, rowIndex],
    column: [startColumnIndex, columnIndex]
  };
}

export function dragMoveBody(store: Store, eventInfo: MouseEvent) {
  const {
    dimension,
    columnCoords: { areaWidth },
    selection,
    viewport
  } = store;

  selectionUpdate(store, eventInfo);
  setScrolling(eventInfo, areaWidth.L + areaWidth.R, selection, dimension, viewport);
}

export function dragEndBody({ selection }: Store) {
  stopAutoScroll(selection);
}

export function mouseDownBody(store: Store, elementInfo: ElementInfo, eventInfo: MouseEvent) {
  const { data, column, columnCoords, rowCoords, focus } = store;
  const { pageX, pageY, shiftKey } = eventInfo;

  const { side, scrollLeft, scrollTop, left, top } = elementInfo;
  const offsetX = pageX - left + scrollLeft;
  const offsetY = pageY - top + scrollTop;

  const rowIndex = findOffsetIndex(rowCoords.offsets, offsetY);
  const columnIndex = findOffsetIndex(columnCoords.offsets[side], offsetX);
  const columnName = column.visibleColumnsBySide[side][columnIndex].name;

  if (shiftKey) {
    selectionUpdate(store, eventInfo);
  } else if (!isRowHeader(columnName)) {
    focus.rowKey = data.viewData[rowIndex].rowKey;
    focus.columnName = columnName;
    selectionEnd(store);
  }
}
