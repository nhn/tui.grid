import { findOffsetIndex } from '../helper/common';
import { isRowHeader } from '../helper/column';
import { changeFocus } from './focus';
import { changeSelectionRange } from './selection';
import {
  Store,
  Side,
  Dimension,
  Selection,
  Viewport,
  SelectionRange,
  DragData,
  DragStartData
} from '../store/types';

export function setNavigating({ focus }: Store, navigating: boolean) {
  focus.navigating = navigating;
}

type OverflowType = -1 | 0 | 1;

interface ScrollData {
  scrollLeft: number;
  scrollTop: number;
}

interface OverflowInfo {
  x: OverflowType;
  y: OverflowType;
}

type ElementInfo = {
  side: Side;
  top: number;
  left: number;
} & ScrollData;

type ViewInfo = DragData & ScrollData;

interface BodySize {
  bodyWidth: number;
  bodyHeight: number;
}

interface ContainerPosition {
  x: number;
  y: number;
}

type EventInfo = DragData & {
  shiftKey: boolean;
};

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
  { pageX, pageY }: DragData,
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

export function selectionUpdate(store: Store, dragStartData: DragStartData, dragData: DragData) {
  const {
    dimension,
    viewport: { scrollTop, scrollLeft },
    columnCoords: { widths, areaWidth },
    rowCoords: { offsets: rowOffsets },
    selection,
    id
  } = store;
  const { pageX, pageY } = dragData;
  const { inputRange: curInputRange } = selection;

  let startRowIndex, startColumnIndex;
  const viewInfo = { pageX, pageY, scrollTop, scrollLeft };
  const scrolledPosition = getScrolledPosition(viewInfo, dimension, areaWidth.L);
  const rowIndex = findOffsetIndex(rowOffsets, scrolledPosition.y);
  const totalColumnOffsets = getTotalColumnOffsets(widths, dimension.cellBorderWidth);
  const columnIndex = findOffsetIndex(totalColumnOffsets, scrolledPosition.x);

  if (curInputRange === null) {
    const startViewInfo = {
      pageX: dragStartData.pageX!,
      pageY: dragStartData.pageY!,
      scrollTop,
      scrollLeft
    };
    const startScrolledPosition = getScrolledPosition(startViewInfo, dimension, areaWidth.L);
    startRowIndex = findOffsetIndex(rowOffsets, startScrolledPosition.y);
    startColumnIndex = findOffsetIndex(totalColumnOffsets, startScrolledPosition.x);
  } else {
    startRowIndex = curInputRange.row[0];
    startColumnIndex = curInputRange.column[0];
  }

  const inputRange: SelectionRange = {
    row: [startRowIndex, rowIndex],
    column: [startColumnIndex, columnIndex]
  };

  changeSelectionRange(selection, inputRange, id);
}

export function dragMoveBody(store: Store, dragStartData: DragStartData, dragData: DragData) {
  const {
    dimension,
    columnCoords: { areaWidth },
    selection,
    viewport
  } = store;

  selectionUpdate(store, dragStartData, dragData);
  setScrolling(dragData, areaWidth.L + areaWidth.R, selection, dimension, viewport);
}

export function dragEndBody({ selection }: Store) {
  stopAutoScroll(selection);
}

export function mouseDownBody(store: Store, elementInfo: ElementInfo, eventInfo: EventInfo) {
  const { data, column, columnCoords, rowCoords, focus, id } = store;
  const { pageX, pageY, shiftKey } = eventInfo;

  const { side, scrollLeft, scrollTop, left, top } = elementInfo;
  const offsetX = pageX - left + scrollLeft;
  const offsetY = pageY - top + scrollTop;

  const rowIndex = findOffsetIndex(rowCoords.offsets, offsetY);
  const columnIndex = findOffsetIndex(columnCoords.offsets[side], offsetX);
  const columnName = column.visibleColumnsBySide[side][columnIndex].name;

  if (!isRowHeader(columnName)) {
    if (shiftKey) {
      const dragData = { pageX, pageY };
      selectionUpdate(store, dragData, dragData);
    } else {
      changeFocus(focus, data.viewData[rowIndex].rowKey, columnName, id);
      selectionEnd(store);
    }
  }
}
