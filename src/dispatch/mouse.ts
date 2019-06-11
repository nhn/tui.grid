import { findOffsetIndex, findPropIndex, isNull } from '../helper/common';
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
  RowKey,
  Range
} from '../store/types';
import { getRowRangeWithRowSpan, enableRowSpan } from '../helper/rowSpan';
import { getChildColumnRange } from '../query/mouse';

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

function getFocusCellPos(store: Store) {
  const { columnCoords, rowCoords, focus, dimension, viewport } = store;
  const { columnIndex, rowIndex, side, cellPosRect } = focus;

  if (isNull(columnIndex) || isNull(rowIndex) || isNull(side) || isNull(cellPosRect)) {
    return null;
  }

  const { left, right } = cellPosRect;
  const { offsets, heights } = rowCoords;
  const { areaWidth, widths } = columnCoords;
  const { headerHeight, tableBorderWidth, width } = dimension;
  const { scrollLeft } = viewport;
  const offsetLeft = Math.min(areaWidth.L - scrollLeft + tableBorderWidth, width - right);
  const focusCellWidth = widths[side][columnIndex];

  return {
    pageX: left + focusCellWidth + (side === 'L' ? 0 : offsetLeft),
    pageY: offsets[rowIndex] + heights[rowIndex] + headerHeight
  };
}

export function selectionEnd({ selection }: Store) {
  selection.inputRange = null;
  // @TODO: minimumColumnRange 고려 필요
  // selection.minimumColumnRange = null;
}

export function selectionUpdate(store: Store, dragStartData: DragData, dragData: DragData) {
  const { dimension, viewport, columnCoords, rowCoords, selection, column, id, data } = store;
  const { scrollTop, scrollLeft } = viewport;
  const { widths, areaWidth } = columnCoords;
  const { offsets: rowOffsets } = rowCoords;
  const { rowHeaderCount } = column;
  const { pageX, pageY } = dragData;
  const { inputRange: curInputRange } = selection;
  const { visibleColumns } = column;

  let startRowIndex, startColumnIndex, endRowIndex;
  const viewInfo = { pageX, pageY, scrollTop, scrollLeft };
  const scrolledPosition = getScrolledPosition(viewInfo, dimension, areaWidth.L);
  const totalColumnOffsets = getTotalColumnOffsets(widths, dimension.cellBorderWidth);
  const endColumnIndex = findOffsetIndex(totalColumnOffsets, scrolledPosition.x) - rowHeaderCount;
  endRowIndex = findOffsetIndex(rowOffsets, scrolledPosition.y);

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

  if (startColumnIndex < 0 || endColumnIndex < 0 || startRowIndex < 0 || endRowIndex < 0) {
    return;
  }

  if (enableRowSpan(data.sortOptions.columnName)) {
    const rowRange: Range = [startRowIndex, endRowIndex];
    const colRange: Range = [startColumnIndex, endColumnIndex];
    [startRowIndex, endRowIndex] = getRowRangeWithRowSpan(
      rowRange,
      colRange,
      visibleColumns,
      store.focus.rowIndex,
      data
    );
  }

  const inputRange: SelectionRange = {
    row: [startRowIndex, endRowIndex],
    column: [startColumnIndex, endColumnIndex]
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
      const focusCellPos = getFocusCellPos(store);
      const focusData = isNull(focusCellPos) ? dragData : focusCellPos;
      selectionUpdate(store, focusData, dragData);
    } else {
      changeFocus(focus, data, data.viewData[rowIndex].rowKey, columnName, id);
      selectionEnd(store);
    }
  }
}

export function mouseDownHeader(store: Store, name: string, parentHeader: boolean) {
  const { data, selection, id, column } = store;
  const { visibleColumns, rowHeaderCount, complexHeaderColumns } = column;
  const lastRowIndex = data.viewData.length - 1;

  let startColumnIndex, lastColumnIndex;

  if (parentHeader) {
    [startColumnIndex, lastColumnIndex] = getChildColumnRange(
      visibleColumns,
      complexHeaderColumns,
      name,
      rowHeaderCount
    );
  } else {
    startColumnIndex = lastColumnIndex =
      findPropIndex('name', name, visibleColumns) - rowHeaderCount;
  }

  const inputRange: SelectionRange = {
    row: [0, lastRowIndex],
    column: [startColumnIndex, lastColumnIndex]
  };

  changeSelectionRange(selection, inputRange, id);
}

export function dragMoveHeader(store: Store, dragData: DragData, selectionStartName: string) {
  const { dimension, viewport, columnCoords, selection, column, id } = store;
  const { scrollTop, scrollLeft } = viewport;
  const { areaWidth, widths } = columnCoords;
  const { rowHeaderCount, visibleColumns, complexHeaderColumns } = column;
  const { pageX, pageY } = dragData;
  const { inputRange: curInputRange } = selection;

  if (curInputRange === null) {
    return;
  }

  let [startColumnIdx, endColumnIdx] = getChildColumnRange(
    visibleColumns,
    complexHeaderColumns,
    selectionStartName,
    rowHeaderCount
  );

  const viewInfo = { pageX, pageY, scrollTop, scrollLeft };
  const scrolledPosition = getScrolledPosition(viewInfo, dimension, areaWidth.L);
  const totalColumnOffsets = getTotalColumnOffsets(widths, dimension.cellBorderWidth);
  const columnIndex = findOffsetIndex(totalColumnOffsets, scrolledPosition.x) - rowHeaderCount;
  const rowIndex = curInputRange.row[1];

  if (columnIndex < startColumnIdx) {
    startColumnIdx = columnIndex;
  }

  if (columnIndex > endColumnIdx) {
    endColumnIdx = columnIndex;
  }

  if (columnIndex >= 0) {
    const inputRange: SelectionRange = {
      row: [0, rowIndex],
      column: [startColumnIdx, endColumnIdx]
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
