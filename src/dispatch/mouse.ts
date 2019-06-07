import { findOffsetIndex, findPropIndex } from '../helper/common';
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
  RowKey
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

export function selectionUpdate(store: Store, dragStartData: DragData, dragData: DragData) {
  const { dimension, viewport, columnCoords, rowCoords, selection, column, id } = store;
  const { scrollTop, scrollLeft } = viewport;
  const { widths, areaWidth } = columnCoords;
  const { offsets: rowOffsets } = rowCoords;
  const { rowHeaderCount } = column;
  const { pageX, pageY } = dragData;
  const { inputRange: curInputRange } = selection;

  let startRowIndex, startColumnIndex;
  const viewInfo = { pageX, pageY, scrollTop, scrollLeft };
  const scrolledPosition = getScrolledPosition(viewInfo, dimension, areaWidth.L);
  const rowIndex = findOffsetIndex(rowOffsets, scrolledPosition.y);
  const totalColumnOffsets = getTotalColumnOffsets(widths, dimension.cellBorderWidth);
  const columnIndex = findOffsetIndex(totalColumnOffsets, scrolledPosition.x) - rowHeaderCount;

  if (curInputRange === null) {
    const startViewInfo = {
      pageX: dragStartData.pageX,
      pageY: dragStartData.pageY,
      scrollTop,
      scrollLeft
    };
    const startScrolledPosition = getScrolledPosition(startViewInfo, dimension, areaWidth.L);
    startRowIndex = findOffsetIndex(rowOffsets, startScrolledPosition.y);
    startColumnIndex =
      findOffsetIndex(totalColumnOffsets, startScrolledPosition.x) - rowHeaderCount;
  } else {
    startRowIndex = curInputRange.row[0];
    startColumnIndex = curInputRange.column[0];
  }

  if (startColumnIndex < 0 || columnIndex < 0 || startRowIndex < 0 || rowIndex < 0) {
    return;
  }

  const inputRange: SelectionRange = {
    row: [startRowIndex, rowIndex],
    column: [startColumnIndex, columnIndex]
  };

  changeSelectionRange(selection, inputRange, id);
}

export function dragMoveBody(store: Store, dragStartData: DragData, dragData: DragData) {
  const { dimension, columnCoords, selection, viewport } = store;
  const { areaWidth } = columnCoords;

  selectionUpdate(store, dragStartData, dragData);
  setScrolling(dragData, areaWidth.L + areaWidth.R, selection, dimension, viewport);
}

export function dragEnd({ selection }: Store) {
  stopAutoScroll(selection);
}

export function mouseDownBody(store: Store, elementInfo: ElementInfo, eventInfo: EventInfo) {
  const { data, column, columnCoords, rowCoords, focus, id } = store;
  const { pageX, pageY, shiftKey } = eventInfo;
  const { visibleColumnsBySide } = column;

  const { side, scrollLeft, scrollTop, left, top } = elementInfo;
  const offsetLeft = pageX - left + scrollLeft;
  const offsetTop = pageY - top + scrollTop;

  const rowIndex = findOffsetIndex(rowCoords.offsets, offsetTop);
  const columnIndex = findOffsetIndex(columnCoords.offsets[side], offsetLeft);
  const columnName = visibleColumnsBySide[side][columnIndex].name;

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

export function mouseDownHeader(store: Store, name: string) {
  const { data, selection, id, column } = store;
  const columnIndex = findPropIndex('name', name, column.visibleColumns) - column.rowHeaderCount;
  const lastRowIndex = data.viewData.length - 1;
  const inputRange: SelectionRange = {
    row: [0, lastRowIndex],
    column: [columnIndex, columnIndex]
  };

  changeSelectionRange(selection, inputRange, id);
}

export function dragMoveHeader(store: Store, dragData: DragData) {
  const { dimension, viewport, columnCoords, selection, column, id } = store;
  const { scrollTop, scrollLeft } = viewport;
  const { areaWidth, widths } = columnCoords;
  const { rowHeaderCount } = column;
  const { pageX, pageY } = dragData;
  const { inputRange: curInputRange } = selection;

  if (curInputRange === null) {
    return;
  }

  const viewInfo = { pageX, pageY, scrollTop, scrollLeft };
  const scrolledPosition = getScrolledPosition(viewInfo, dimension, areaWidth.L);
  const totalColumnOffsets = getTotalColumnOffsets(widths, dimension.cellBorderWidth);
  const columnIndex = findOffsetIndex(totalColumnOffsets, scrolledPosition.x) - rowHeaderCount;
  const startColumnIndex = curInputRange.column[0];
  const rowIndex = curInputRange.row[1];

  if (columnIndex >= 0) {
    const inputRange: SelectionRange = {
      row: [0, rowIndex],
      column: [startColumnIndex, columnIndex]
    };

    changeSelectionRange(selection, inputRange, id);
    setScrolling(dragData, areaWidth.L + areaWidth.R, selection, dimension, viewport);
  }
}

export function mouseDownRowHeader(store: Store, rowKey: RowKey) {
  const { selection, id, column, data } = store;
  const { visibleColumns, rowHeaderCount } = column;
  const rowIndex = findPropIndex('rowKey', rowKey, data.rawData);
  const lastColumnIndex = visibleColumns.length - 1 - rowHeaderCount;
  const inputRange: SelectionRange = {
    row: [rowIndex, rowIndex],
    column: [0, lastColumnIndex]
  };

  changeSelectionRange(selection, inputRange, id);
}

export function dragMoveRowHeader(store: Store, dragData: DragData) {
  const { dimension, viewport, columnCoords, rowCoords, selection, id } = store;
  const { scrollTop, scrollLeft } = viewport;
  const { areaWidth } = columnCoords;
  const { offsets: rowOffsets } = rowCoords;
  const { pageX, pageY } = dragData;
  const { inputRange: curInputRange } = selection;

  if (curInputRange === null) {
    return;
  }

  const viewInfo = { pageX, pageY, scrollTop, scrollLeft };
  const scrolledPosition = getScrolledPosition(viewInfo, dimension, areaWidth.L);
  const rowIndex = findOffsetIndex(rowOffsets, scrolledPosition.y);
  const startRowIndex = curInputRange.row[0];
  const columnIndex = curInputRange.column[1];

  const inputRange: SelectionRange = {
    row: [startRowIndex, rowIndex],
    column: [0, columnIndex]
  };

  changeSelectionRange(selection, inputRange, id);
}
