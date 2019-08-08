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
  RowKey
} from '../store/types';
import { getRowRangeWithRowSpan } from '../helper/rowSpan';
import { getChildColumnRange } from '../query/selection';
import { findIndexByRowKey } from '../query/data';

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
    viewport.scrollLeft = Math.min(maxScrollLeft, scrollLeft + scrollPixelScale);
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

function findColumnIndexByPosition(store: Store, viewInfo: ViewInfo) {
  const { dimension, columnCoords } = store;
  const { widths, areaWidth } = columnCoords;
  const totalColumnOffsets = getTotalColumnOffsets(widths, dimension.cellBorderWidth);
  const scrolledPosition = getScrolledPosition(viewInfo, dimension, areaWidth.L);

  return findOffsetIndex(totalColumnOffsets, scrolledPosition.x);
}

function findRowIndexByPosition(store: Store, viewInfo: ViewInfo) {
  const { dimension, columnCoords, rowCoords } = store;
  const { areaWidth } = columnCoords;
  const scrolledPosition = getScrolledPosition(viewInfo, dimension, areaWidth.L);

  return findOffsetIndex(rowCoords.offsets, scrolledPosition.y);
}

function getColumnNameRange(
  store: Store,
  dragStartData: DragData,
  dragData: DragData,
  elementInfo: ElementInfo
) {
  const {
    column: { allColumns }
  } = store;
  const { scrollTop, scrollLeft } = elementInfo;

  const { pageX: startPageX, pageY: startPageY } = dragStartData;
  const { pageX: endPageX, pageY: endPageY } = dragData;

  const startViewInfo = { pageX: startPageX, pageY: startPageY, scrollTop, scrollLeft };
  const endViewInfo = { pageX: endPageX, pageY: endPageY, scrollTop, scrollLeft };

  const startColumnIndex = findColumnIndexByPosition(store, startViewInfo);
  const endColumnIndex = findColumnIndexByPosition(store, endViewInfo);

  const { name: startColumnName } = allColumns[startColumnIndex];
  const { name: endColumnName } = allColumns[endColumnIndex];

  return [startColumnName, endColumnName];
}

export function selectionEnd({ selection }: Store) {
  selection.inputRange = null;
}

export function selectionUpdate(store: Store, dragStartData: DragData, dragData: DragData) {
  const { viewport, selection, column, id, data, focus } = store;
  const { scrollTop, scrollLeft } = viewport;
  const { pageX, pageY } = dragData;
  const { inputRange: curInputRange } = selection;
  const { visibleColumnsWithRowHeader } = column;

  let startRowIndex, startColumnIndex, endRowIndex;
  const viewInfo = { pageX, pageY, scrollTop, scrollLeft };
  const endColumnIndex = findColumnIndexByPosition(store, viewInfo);
  endRowIndex = findRowIndexByPosition(store, viewInfo);

  if (curInputRange === null) {
    const { totalColumnIndex, rowIndex } = focus;

    startColumnIndex = totalColumnIndex!;
    startRowIndex = rowIndex!;
  } else {
    startRowIndex = curInputRange.row[0];
    startColumnIndex = curInputRange.column[0];
  }

  if (startColumnIndex < 0 || endColumnIndex < 0 || startRowIndex < 0 || endRowIndex < 0) {
    return;
  }

  [startRowIndex, endRowIndex] = getRowRangeWithRowSpan(
    [startRowIndex, endRowIndex],
    [startColumnIndex, endColumnIndex],
    visibleColumnsWithRowHeader,
    store.focus.rowIndex,
    data
  );

  const inputRange: SelectionRange = {
    row: [startRowIndex, endRowIndex],
    column: [startColumnIndex, endColumnIndex]
  };

  changeSelectionRange(selection, inputRange, id);
}

export function dragMoveBody(
  store: Store,
  dragStartData: DragData,
  dragData: DragData,
  elementInfo: ElementInfo
) {
  const { dimension, columnCoords, selection, viewport } = store;
  const { areaWidth } = columnCoords;

  const [startColumnName, endColumnName] = getColumnNameRange(
    store,
    dragStartData,
    dragData,
    elementInfo
  );

  if (!isRowHeader(startColumnName) && !isRowHeader(endColumnName)) {
    selectionUpdate(store, dragStartData, dragData);
    setScrolling(dragData, areaWidth.L + areaWidth.R, selection, dimension, viewport);
  }
}

export function dragEnd({ selection }: Store) {
  stopAutoScroll(selection);
}

export function mouseDownBody(store: Store, elementInfo: ElementInfo, eventInfo: EventInfo) {
  const { data, column, columnCoords, rowCoords, focus, id } = store;

  if (data.rawData.length === 0) {
    return;
  }

  const { pageX, pageY, shiftKey } = eventInfo;
  const { visibleColumnsBySideWithRowHeader } = column;

  const { side, scrollLeft, scrollTop, left, top } = elementInfo;
  const offsetLeft = pageX - left + scrollLeft;
  const offsetTop = pageY - top + scrollTop;

  const rowIndex = findOffsetIndex(rowCoords.offsets, offsetTop);
  const columnIndex = findOffsetIndex(columnCoords.offsets[side], offsetLeft);
  const columnName = visibleColumnsBySideWithRowHeader[side][columnIndex].name;

  if (!isRowHeader(columnName)) {
    if (shiftKey) {
      const dragData = { pageX, pageY };
      const focusCellPos = getFocusCellPos(store);
      const focusData = isNull(focusCellPos) ? dragData : focusCellPos;
      selectionUpdate(store, focusData, dragData);
    } else {
      selectionEnd(store);
      changeFocus(focus, data, data.viewData[rowIndex].rowKey, columnName, id);
    }
  }
}

export function mouseDownHeader(store: Store, name: string, parentHeader: boolean) {
  const { data, selection, id, column, focus } = store;
  const { rawData, viewData } = data;

  if (rawData.length === 0) {
    return;
  }

  const { visibleColumnsWithRowHeader, complexHeaderColumns } = column;
  const endRowIndex = viewData.length - 1;

  let startColumnIndex, endColumnIndex;

  if (parentHeader) {
    [startColumnIndex, endColumnIndex] = getChildColumnRange(
      visibleColumnsWithRowHeader,
      complexHeaderColumns,
      name
    );
  } else {
    startColumnIndex = endColumnIndex = findPropIndex('name', name, visibleColumnsWithRowHeader);
  }

  const inputRange: SelectionRange = {
    row: [0, endRowIndex],
    column: [startColumnIndex, endColumnIndex]
  };

  changeFocus(focus, data, rawData[0].rowKey, name, id);
  changeSelectionRange(selection, inputRange, id);
}

export function dragMoveHeader(store: Store, dragData: DragData, startSelectedName: string) {
  const { dimension, viewport, columnCoords, selection, column, id } = store;
  const { scrollTop, scrollLeft } = viewport;
  const { areaWidth } = columnCoords;
  const { visibleColumnsWithRowHeader, complexHeaderColumns } = column;
  const { pageX, pageY } = dragData;
  const { inputRange: curInputRange } = selection;

  if (isNull(curInputRange)) {
    return;
  }

  let [startColumnIdx, endColumnIdx] = getChildColumnRange(
    visibleColumnsWithRowHeader,
    complexHeaderColumns,
    startSelectedName
  );

  const viewInfo = { pageX, pageY, scrollTop, scrollLeft };
  const columnIndex = findColumnIndexByPosition(store, viewInfo);

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
  const { selection, id, column, data, focus } = store;
  const { visibleColumnsWithRowHeader, rowHeaderCount } = column;
  const rowIndex = findIndexByRowKey(data, column, id, rowKey);
  const endColumnIndex = visibleColumnsWithRowHeader.length - 1;
  const [startRowIndex, endRowIndex] = getRowRangeWithRowSpan(
    [rowIndex, rowIndex],
    [rowHeaderCount, endColumnIndex],
    visibleColumnsWithRowHeader,
    null,
    data
  );

  const inputRange: SelectionRange = {
    row: [startRowIndex, endRowIndex],
    column: [rowHeaderCount, endColumnIndex]
  };

  changeFocus(
    focus,
    data,
    data.rawData[rowIndex].rowKey,
    visibleColumnsWithRowHeader[rowHeaderCount].name,
    id
  );
  changeSelectionRange(selection, inputRange, id);
}

export function dragMoveRowHeader(store: Store, dragData: DragData) {
  const { viewport, selection, id, data, column } = store;
  const { scrollTop, scrollLeft } = viewport;
  const { visibleColumnsWithRowHeader, rowHeaderCount } = column;
  const { pageX, pageY } = dragData;
  const { inputRange: curInputRange } = selection;

  if (curInputRange === null) {
    return;
  }

  const viewInfo = { pageX, pageY, scrollTop, scrollLeft };
  const columnIndex = curInputRange.column[1];
  let startRowIndex = curInputRange.row[0];
  let endRowIndex = findRowIndexByPosition(store, viewInfo);

  [startRowIndex, endRowIndex] = getRowRangeWithRowSpan(
    [startRowIndex, endRowIndex],
    [rowHeaderCount, columnIndex],
    visibleColumnsWithRowHeader,
    null,
    data
  );

  const inputRange: SelectionRange = {
    row: [startRowIndex, endRowIndex],
    column: [rowHeaderCount, columnIndex]
  };

  changeSelectionRange(selection, inputRange, id);
}
