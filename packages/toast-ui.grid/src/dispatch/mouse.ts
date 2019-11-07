import { findOffsetIndex, findPropIndex, isEmpty, isNull } from '../helper/common';
import { isRowHeader } from '../helper/column';
import { changeFocus, saveAndFinishEditing } from './focus';
import { changeSelectionRange } from './selection';
import {
  Store,
  Dimension,
  Selection,
  Viewport,
  SelectionRange,
  PagePosition,
  RowKey
} from '../store/types';
import { getRowRangeWithRowSpan } from '../query/rowSpan';
import { getChildColumnRange } from '../query/selection';
import { findIndexByRowKey } from '../query/data';
import {
  findColumnIndexByPosition,
  findRowIndexByPosition,
  getColumnNameRange,
  getOverflowFromMousePosition
} from '../query/mouse';
import { OverflowType, OverflowInfo, ElementInfo, EventInfo } from './types';

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
  { pageX, pageY }: PagePosition,
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

export function setNavigating({ focus }: Store, navigating: boolean) {
  focus.navigating = navigating;
}

export function selectionEnd({ selection }: Store) {
  selection.inputRange = null;
}

function updateSelection(store: Store, dragData: PagePosition) {
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

function finishEditingByHeaderSelection(store: Store, rowKey: RowKey, columnName: string) {
  const { editingAddress } = store.focus;

  if (editingAddress) {
    if (editingAddress.rowKey === rowKey && editingAddress.columnName === columnName) {
      saveAndFinishEditing(store);
    }
  }
}

export function dragMoveBody(
  store: Store,
  dragStartData: PagePosition,
  dragData: PagePosition,
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
    updateSelection(store, dragData);
    setScrolling(dragData, areaWidth.L + areaWidth.R, selection, dimension, viewport);
  }
}

export function dragEnd({ selection }: Store) {
  stopAutoScroll(selection);
}

export function mouseDownBody(store: Store, elementInfo: ElementInfo, eventInfo: EventInfo) {
  const { data, column, columnCoords, rowCoords, id } = store;
  const { filteredRawData } = data;

  if (!filteredRawData.length) {
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
      updateSelection(store, dragData);
    } else {
      selectionEnd(store);
      changeFocus(store, filteredRawData[rowIndex].rowKey, columnName, id);
    }
  }
}

export function mouseDownHeader(store: Store, name: string, parentHeader: boolean) {
  const { data, selection, id, column, rowCoords } = store;
  const { filteredRawData } = data;

  if (!filteredRawData.length) {
    return;
  }

  const { visibleColumnsWithRowHeader, complexColumnHeaders } = column;
  const endRowIndex = rowCoords.heights.length - 1;

  let startColumnIndex, endColumnIndex, columnName;

  if (parentHeader) {
    [startColumnIndex, endColumnIndex] = getChildColumnRange(
      visibleColumnsWithRowHeader,
      complexColumnHeaders,
      name
    );
    columnName = visibleColumnsWithRowHeader[startColumnIndex].name;
  } else {
    startColumnIndex = endColumnIndex = findPropIndex('name', name, visibleColumnsWithRowHeader);
    columnName = name;
  }

  const inputRange: SelectionRange = {
    row: [0, endRowIndex],
    column: [startColumnIndex, endColumnIndex]
  };
  const { rowKey } = filteredRawData[0];

  finishEditingByHeaderSelection(store, rowKey, columnName);
  changeFocus(store, rowKey, columnName, id);
  changeSelectionRange(selection, inputRange, id);
}

export function dragMoveHeader(store: Store, dragData: PagePosition, startSelectedName: string) {
  const { dimension, viewport, columnCoords, selection, column, id } = store;
  const { scrollTop, scrollLeft } = viewport;
  const { areaWidth } = columnCoords;
  const { visibleColumnsWithRowHeader, complexColumnHeaders } = column;
  const { pageX, pageY } = dragData;
  const { inputRange: curInputRange } = selection;

  if (isNull(curInputRange)) {
    return;
  }

  let [startColumnIdx, endColumnIdx] = getChildColumnRange(
    visibleColumnsWithRowHeader,
    complexColumnHeaders,
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
  const { selection, id, column, data } = store;
  const { visibleColumnsWithRowHeader, rowHeaderCount } = column;
  const { pageOptions } = data;
  const rowIndex = findIndexByRowKey(data, column, id, rowKey);
  const rowIndexWithPage = isEmpty(pageOptions) ? rowIndex : rowIndex % pageOptions.perPage;

  const endColumnIndex = visibleColumnsWithRowHeader.length - 1;
  const [startRowIndex, endRowIndex] = getRowRangeWithRowSpan(
    [rowIndexWithPage, rowIndexWithPage],
    [rowHeaderCount, endColumnIndex],
    visibleColumnsWithRowHeader,
    null,
    data
  );

  const inputRange: SelectionRange = {
    row: [startRowIndex, endRowIndex],
    column: [rowHeaderCount, endColumnIndex]
  };
  const editingRowKey = data.rawData[rowIndex].rowKey;
  const editingColumnName = visibleColumnsWithRowHeader[rowHeaderCount].name;

  finishEditingByHeaderSelection(store, editingRowKey, editingColumnName);
  changeFocus(store, editingRowKey, editingColumnName, id);
  changeSelectionRange(selection, inputRange, id);
}

export function dragMoveRowHeader(store: Store, dragData: PagePosition) {
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
