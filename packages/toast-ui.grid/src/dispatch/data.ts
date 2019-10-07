import {
  Store,
  CellValue,
  RowKey,
  SelectionRange,
  RowAttributes,
  RowAttributeValue,
  Dictionary,
  Data,
  Row,
  Column,
  Range,
  PageOptions,
  PagePosition
} from '../store/types';
import { copyDataToRange, getRangeToPaste } from '../query/clipboard';
import {
  findProp,
  mapProp,
  isUndefined,
  removeArrayItem,
  includes,
  isEmpty,
  someProp,
  findPropIndex
} from '../helper/common';
import { isColumnEditable } from '../helper/clipboard';
import { OptRow, OptAppendRow, OptRemoveRow } from '../types';
import { createRawRow, createViewRow, createData, generateDataCreationKey } from '../store/data';
import { notify, isObservable } from '../helper/observable';
import { getRowHeight } from '../store/rowCoords';
import { changeSelectionRange } from './selection';
import { getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';
import { getDataManager } from '../instance';
import { changeTreeRowsCheckedState } from './tree';
import {
  isRowSpanEnabled,
  updateRowSpanWhenAppend,
  updateRowSpanWhenRemove
} from '../helper/rowSpan';
import { getRenderState } from '../helper/renderState';
import { changeFocus, initFocus } from './focus';
import { createTreeRawRow } from '../helper/tree';
import { sort, initSortState } from './sort';
import { findIndexByRowKey, findRowByRowKey } from '../query/data';
import {
  updateSummaryValueByCell,
  updateSummaryValueByColumn,
  updateSummaryValueByRow,
  updateAllSummaryValues
} from './summary';
import { initFilter, filter } from './filter';
import { isRowHeader } from '../helper/column';
import { cls } from '../helper/dom';
import { setHoveredRowKey } from './renderState';
import { findRowIndexByPosition } from '../query/mouse';

interface OriginData {
  rows: Row[];
  targetIndexes: number[];
}

export function setValue(store: Store, rowKey: RowKey, columnName: string, value: CellValue) {
  const { column, data, id } = store;
  const { rawData, sortState, filters } = data;
  const targetRow = findRowByRowKey(data, column, id, rowKey);
  if (!targetRow || targetRow[columnName] === value) {
    return;
  }

  const targetColumn = findProp('name', columnName, column.visibleColumns);
  let gridEvent = new GridEvent({ rowKey, columnName, value });

  if (targetColumn && targetColumn.onBeforeChange) {
    targetColumn.onBeforeChange(gridEvent);
  }

  if (gridEvent.isStopped()) {
    return;
  }
  if (targetRow) {
    const { rowSpanMap } = targetRow;
    const { columns } = sortState;
    const prevValue = targetRow[columnName];
    const index = findPropIndex('columnName', columnName, columns);

    targetRow[columnName] = value;

    if (index !== -1) {
      sort(store, columnName, columns[index].ascending, true, false);
    }

    if (filters) {
      const columnFilter = findProp('columnName', columnName, filters);
      if (columnFilter) {
        const { conditionFn, state } = columnFilter;
        filter(store, columnName, conditionFn!, state);
      }
    }

    updateSummaryValueByCell(store, columnName, { prevValue, value });
    getDataManager(id).push('UPDATE', targetRow);

    if (!isEmpty(rowSpanMap) && rowSpanMap[columnName] && isRowSpanEnabled(sortState)) {
      const { spanCount } = rowSpanMap[columnName];
      const mainRowIndex = findIndexByRowKey(data, column, id, rowKey);

      // update sub rows value
      for (let count = 1; count < spanCount; count += 1) {
        rawData[mainRowIndex + count][columnName] = value;
        getDataManager(id).push('UPDATE', rawData[mainRowIndex + count]);
      }
    }
  }

  if (targetColumn && targetColumn.onAfterChange) {
    gridEvent = new GridEvent({ rowKey, columnName, value });
    targetColumn.onAfterChange(gridEvent);
  }
}

export function isUpdatableRowAttr(
  name: keyof RowAttributes,
  checkDisabled: boolean,
  allDisabled: boolean
) {
  return !(name === 'checked' && (checkDisabled || allDisabled));
}

export function setRowAttribute(
  { data, column, id }: Store,
  rowKey: RowKey,
  attrName: keyof RowAttributes,
  value: RowAttributeValue
) {
  const { disabled } = data;
  const targetRow = findRowByRowKey(data, column, id, rowKey);
  if (targetRow && isUpdatableRowAttr(attrName, targetRow._attributes.checkDisabled, disabled)) {
    targetRow._attributes[attrName] = value;
  }
}

export function setAllRowAttribute(
  { data }: Store,
  attrName: keyof RowAttributes,
  value: RowAttributeValue
) {
  data.rawData.forEach(row => {
    if (isUpdatableRowAttr(attrName, row._attributes.checkDisabled, data.disabled)) {
      row._attributes[attrName] = value;
    }
  });
}

export function setColumnValues(
  store: Store,
  columnName: string,
  value: CellValue,
  checkCellState = false
) {
  // @TODO Check Cell State
  store.data.rawData.forEach(targetRow => {
    targetRow[columnName] = value;
  });
  updateSummaryValueByColumn(store, columnName, { value });
}

export function check(store: Store, rowKey: RowKey) {
  const { allColumnMap, treeColumnName = '' } = store.column;
  const { data, id } = store;
  const { filteredRawData } = data;
  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({ rowKey });

  /**
   * Occurs when a checkbox in row header is checked
   * @event Grid#check
   * @property {number | string} rowKey - rowKey of the checked row
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('check', gridEvent);

  setRowAttribute(store, rowKey, 'checked', true);
  data.checkedAllRows = !filteredRawData.some(row => !row._attributes.checked);

  if (allColumnMap[treeColumnName]) {
    changeTreeRowsCheckedState(store, rowKey, true);
  }
}

export function uncheck(store: Store, rowKey: RowKey) {
  const { data, id, column } = store;
  const { allColumnMap, treeColumnName = '' } = column;
  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({ rowKey });

  /**
   * Occurs when a checkbox in row header is unchecked
   * @event Grid#uncheck
   * @property {number | string} rowKey - rowKey of the unchecked row
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('uncheck', gridEvent);

  setRowAttribute(store, rowKey, 'checked', false);
  data.checkedAllRows = false;

  if (allColumnMap[treeColumnName]) {
    changeTreeRowsCheckedState(store, rowKey, false);
  }
}

export function checkAll(store: Store) {
  const { data, id } = store;
  setAllRowAttribute(store, 'checked', true);
  data.checkedAllRows = true;
  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent();

  /**
   * Occurs when a checkbox in header is checked(checked all checkbox in row header)
   * @event Grid#checkAll
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('checkAll', gridEvent);
}

export function uncheckAll(store: Store) {
  const { data, id } = store;
  setAllRowAttribute(store, 'checked', false);
  data.checkedAllRows = false;
  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent();

  /**
   * Occurs when a checkbox in header is unchecked(unchecked all checkbox in row header)
   * @event Grid#uncheckAll
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('uncheckAll', gridEvent);
}

function applyPasteDataToRawData(
  store: Store,
  pasteData: string[][],
  indexToPaste: SelectionRange
) {
  const {
    data: { filteredRawData, filteredViewData },
    column: { visibleColumnsWithRowHeader },
    id
  } = store;
  const {
    row: [startRowIndex, endRowIndex],
    column: [startColumnIndex, endColumnIndex]
  } = indexToPaste;

  const columnNames = mapProp('name', visibleColumnsWithRowHeader);

  for (let rowIdx = 0; rowIdx + startRowIndex <= endRowIndex; rowIdx += 1) {
    let pasted = false;
    const rawRowIndex = rowIdx + startRowIndex;
    for (let columnIdx = 0; columnIdx + startColumnIndex <= endColumnIndex; columnIdx += 1) {
      const name = columnNames[columnIdx + startColumnIndex];
      if (filteredViewData.length && isColumnEditable(filteredViewData, rawRowIndex, name)) {
        pasted = true;
        filteredRawData[rawRowIndex][name] = pasteData[rowIdx][columnIdx];
      }
    }
    if (pasted) {
      getDataManager(id).push('UPDATE', filteredRawData[rawRowIndex]);
    }
  }
}

function getSelectionRange(range: SelectionRange, pageOptions: PageOptions): SelectionRange {
  if (!isEmpty(pageOptions)) {
    const { row, column } = range;
    const { perPage, page } = pageOptions;
    const prevPageRowCount = (page! - 1) * perPage!;

    return {
      row: [row[0] - prevPageRowCount, row[1] - prevPageRowCount],
      column
    };
  }

  return range;
}

export function paste(store: Store, pasteData: string[][]) {
  const { selection, id, data } = store;
  const { pageOptions } = data;
  const { originalRange } = selection;

  if (originalRange) {
    pasteData = copyDataToRange(originalRange, pasteData);
  }

  const rangeToPaste = getRangeToPaste(store, pasteData);
  applyPasteDataToRawData(store, pasteData, rangeToPaste);
  changeSelectionRange(selection, getSelectionRange(rangeToPaste, pageOptions), id);
}

export function setDisabled(store: Store, disabled: boolean) {
  store.data.disabled = disabled;
}

export function setRowDisabled(
  store: Store,
  disabled: boolean,
  rowKey: RowKey,
  withCheckbox: boolean
) {
  const { data, column, id } = store;
  const row = findRowByRowKey(data, column, id, rowKey);
  if (row) {
    row._attributes.disabled = disabled;
    if (withCheckbox) {
      row._attributes.checkDisabled = disabled;
    }
  }
}

export function setRowCheckDisabled(store: Store, disabled: boolean, rowKey: RowKey) {
  const { data, column, id } = store;
  const row = findRowByRowKey(data, column, id, rowKey);
  if (row) {
    row._attributes.checkDisabled = disabled;
  }
}

function updateSortKey(data: Data, at: number) {
  const { rawData, viewData } = data;
  for (let idx = 0; idx < rawData.length; idx += 1) {
    if (rawData[idx].sortKey >= at) {
      rawData[idx].sortKey += 1;
    }
    if (viewData[idx].sortKey >= at) {
      viewData[idx].sortKey += 1;
    }
  }
  rawData[at].sortKey = at;
  viewData[at].sortKey = at;
}

export function appendRow(store: Store, row: OptRow, options: OptAppendRow) {
  const { data, column, rowCoords, dimension, id, renderState } = store;
  const { rawData, viewData, sortState, pageOptions, pageRowRange } = data;
  const { heights } = rowCoords;
  const { defaultValues, allColumnMap } = column;
  const { at = rawData.length } = options;
  const prevRow = rawData[at - 1];

  const emptyData = column.allColumns
    .filter(({ name }) => !isRowHeader(name))
    .reduce((acc, { name }) => ({ ...acc, [name]: '' }), {});
  const index = Math.max(-1, ...(mapProp('rowKey', rawData) as number[])) + 1;
  const rawRow = createRawRow({ ...emptyData, ...row }, index, defaultValues);
  const viewRow = createViewRow(rawRow, allColumnMap, rawData);

  rawData.splice(at, 0, rawRow);
  viewData.splice(at, 0, viewRow);
  heights.splice(at, 0, getRowHeight(rawRow, dimension.rowHeight));

  if (pageOptions.useClient) {
    const currentPageDataLength = pageRowRange[1] - pageRowRange[0];

    if (currentPageDataLength === pageOptions.perPage) {
      heights.pop();
    }

    data.pageOptions = {
      ...pageOptions,
      totalCount: pageOptions.totalCount! + 1
    };
  }

  if (at !== rawData.length) {
    updateSortKey(data, at);
  }

  if (!isRowSpanEnabled(sortState)) {
    const { columnName, ascending } = sortState.columns[0];

    sort(store, columnName, ascending);
  }

  if (prevRow && isRowSpanEnabled(sortState)) {
    updateRowSpanWhenAppend(rawData, prevRow, options.extendPrevRowSpan || false);
  }

  notify(data, 'rawData');
  notify(data, 'viewData');
  notify(rowCoords, 'heights');

  updateSummaryValueByRow(store, rawRow, true);
  renderState.state = 'DONE';
  getDataManager(id).push('CREATE', rawRow);
}

export function removeRow(store: Store, rowKey: RowKey, options: OptRemoveRow) {
  const { data, rowCoords, id, renderState, focus, column } = store;
  const { rawData, viewData, sortState, pageOptions } = data;
  const rowIdx = findIndexByRowKey(data, column, id, rowKey);

  if (rowIdx === -1) {
    return;
  }

  const nextRow = rawData[rowIdx + 1];
  const removedRow = rawData.splice(rowIdx, 1)[0];

  viewData.splice(rowIdx, 1);
  rowCoords.heights.splice(rowIdx, 1);

  if (pageOptions.useClient) {
    data.pageOptions = {
      ...pageOptions,
      totalCount: pageOptions.totalCount! - 1
    };
  }

  if (nextRow && isRowSpanEnabled(sortState)) {
    updateRowSpanWhenRemove(rawData, removedRow, nextRow, options.keepRowSpanData || false);
  }

  if (!someProp('rowKey', focus.rowKey, rawData)) {
    focus.navigating = false;
    changeFocus(store, null, null, id);
    if (focus.editingAddress && focus.editingAddress.rowKey === rowKey) {
      focus.editingAddress = null;
    }
  }

  notify(data, 'rawData');
  notify(data, 'viewData');
  notify(rowCoords, 'heights');
  notify(data, 'filteredRawData');
  updateSummaryValueByRow(store, removedRow, false);
  renderState.state = getRenderState(data.rawData);
  getDataManager(id).push('DELETE', removedRow);
}

export function clearData(store: Store) {
  const { data, id, renderState, rowCoords } = store;
  data.rawData.forEach(row => {
    getDataManager(id).push('DELETE', row);
  });

  initFocus(store);
  initSortState(data);
  initFilter(store);
  rowCoords.heights = [];
  data.rawData = [];
  data.viewData = [];
  if (data.pageOptions.useClient) {
    data.pageOptions = {
      ...data.pageOptions,
      totalCount: 0
    };
  }
  updateAllSummaryValues(store);
  renderState.state = 'EMPTY';
}

export function resetData(store: Store, inputData: OptRow[]) {
  const { data, column, dimension, rowCoords, id, renderState } = store;
  const { rawData, viewData } = createData(inputData, column, true);
  const { rowHeight } = dimension;

  initFocus(store);
  initSortState(data);
  initFilter(store);
  rowCoords.heights = rawData.map(row => getRowHeight(row, rowHeight));
  data.viewData = viewData;
  data.rawData = rawData;
  updateAllSummaryValues(store);
  renderState.state = getRenderState(rawData);
  if (data.pageOptions.useClient) {
    data.pageOptions = {
      ...data.pageOptions,
      totalCount: rawData.length
    };
  }

  // @TODO need to execute logic by condition
  getDataManager(id).setOriginData(inputData);
  getDataManager(id).clearAll();
}

export function addRowClassName(store: Store, rowKey: RowKey, className: string) {
  const { data, column, id } = store;
  const row = findRowByRowKey(data, column, id, rowKey);
  if (row) {
    const rowClassMap = row._attributes.className.row;
    const isExist = includes(rowClassMap, className);
    if (!isExist) {
      rowClassMap.push(className);
      notify(row._attributes, 'className');
    }
  }
}

export function removeRowClassName(store: Store, rowKey: RowKey, className: string) {
  const { data, column, id } = store;
  const row = findRowByRowKey(data, column, id, rowKey);
  if (row) {
    removeArrayItem(className, row._attributes.className.row);
    notify(row._attributes, 'className');
  }
}

export function addRowHoverClassByPosition(store: Store, viewInfo: PagePosition) {
  const {
    renderState: { hoveredRowKey },
    data: { filteredRawData },
    viewport: { scrollLeft, scrollTop }
  } = store;
  const rowIndex = findRowIndexByPosition(store, {
    ...viewInfo,
    scrollLeft,
    scrollTop
  });
  const rowKey = filteredRawData[rowIndex].rowKey;

  if (hoveredRowKey !== rowKey) {
    removeRowClassName(store, hoveredRowKey!, cls('row-hover'));
    setHoveredRowKey(store, rowKey);
    addRowClassName(store, rowKey, cls('row-hover'));
  }
}

export function addCellClassName(
  store: Store,
  rowKey: RowKey,
  columnName: string,
  className: string
) {
  const { data, column, id } = store;
  const row = findRowByRowKey(data, column, id, rowKey);
  if (row) {
    const columnClassMap = row._attributes.className.column;
    if (isUndefined(columnClassMap[columnName])) {
      columnClassMap[columnName] = [className];
    } else {
      const isExist = includes(columnClassMap[columnName], className);
      if (!isExist) {
        columnClassMap[columnName].push(className);
      }
    }
    notify(row._attributes, 'className');
  }
}

export function removeCellClassName(
  store: Store,
  rowKey: RowKey,
  columnName: string,
  className: string
) {
  const { data, column, id } = store;
  const row = findRowByRowKey(data, column, id, rowKey);
  if (row) {
    const columnClassMap = row._attributes.className.column;
    if (isUndefined(columnClassMap[columnName])) {
      return;
    }
    removeArrayItem(className, columnClassMap[columnName]);
    notify(row._attributes, 'className');
  }
}

export function refreshRowHeight({ data, rowCoords }: Store, rowIndex: number, rowHeight: number) {
  data.rawData[rowIndex]._attributes.height = rowHeight;
  rowCoords.heights[rowIndex] = rowHeight;

  notify(rowCoords, 'heights');
}

export function setPagination({ data }: Store, pageOptions: PageOptions) {
  data.pageOptions = pageOptions as Required<PageOptions>;
}

export function movePage({ data, rowCoords, dimension }: Store, page: number) {
  data.pageOptions.page = page;
  notify(data, 'pageOptions');

  rowCoords.heights = data.rawData
    .slice(...data.pageRowRange)
    .map(row => getRowHeight(row, dimension.rowHeight));
}

export function changeColumnHeadersByName({ column }: Store, columnsMap: Dictionary<string>) {
  const { complexHeaderColumns, allColumnMap } = column;

  Object.keys(columnsMap).forEach(columnName => {
    const col = allColumnMap[columnName];
    if (col) {
      col.header = columnsMap[columnName];
    }

    if (complexHeaderColumns.length) {
      const complexCol = findProp('name', columnName, complexHeaderColumns);
      if (complexCol) {
        complexCol.header = columnsMap[columnName];
      }
    }
  });

  notify(column, 'allColumns');
}

function getDataToBeObservable(acc: OriginData, row: Row, index: number, treeColumnName?: string) {
  if (treeColumnName && row._attributes.tree!.hidden) {
    return acc;
  }

  if (!isObservable(row)) {
    acc.rows.push(row);
    acc.targetIndexes.push(index);
  }

  return acc;
}

function createOriginData(data: Data, rowRange: Range, treeColumnName?: string) {
  const [start, end] = rowRange;

  return data.rawData
    .slice(start, end)
    .reduce(
      (acc: OriginData, row, index) =>
        getDataToBeObservable(acc, row, index + start, treeColumnName),
      {
        rows: [],
        targetIndexes: []
      }
    );
}

function createFilteredOriginData(data: Data, rowRange: Range, treeColumnName?: string) {
  const [start, end] = rowRange;

  return data.filteredIndex
    .slice(start, end)
    .reduce(
      (acc: OriginData, rowIndex) =>
        getDataToBeObservable(acc, data.rawData[rowIndex], rowIndex, treeColumnName),
      { rows: [], targetIndexes: [] }
    );
}

export function createObservableData({ column, data, viewport, id }: Store, allRowRange = false) {
  const rowRange: Range = allRowRange ? [0, data.rawData.length] : viewport.rowRange;
  const { treeColumnName } = column;
  const originData = data.filters
    ? createFilteredOriginData(data, rowRange, treeColumnName)
    : createOriginData(data, rowRange, treeColumnName);

  if (!originData.rows.length) {
    return;
  }

  if (treeColumnName) {
    changeToObservableTreeData(column, data, originData, id);
  } else {
    changeToObservableData(column, data, originData);
  }

  notify(data, 'rawData');
  notify(data, 'viewData');
  notify(data, 'filteredViewData');
}

function changeToObservableData(column: Column, data: Data, originData: OriginData) {
  const { targetIndexes, rows } = originData;
  // prevRows is needed to create rowSpan
  const prevRows = targetIndexes.map(targetIndex => data.rawData[targetIndex - 1]);
  const { rawData, viewData } = createData(rows, column, false, prevRows);

  for (let index = 0, end = rawData.length; index < end; index += 1) {
    const targetIndex = targetIndexes[index];
    data.rawData[targetIndex] = rawData[index];
    data.viewData[targetIndex] = viewData[index];
  }
}

function changeToObservableTreeData(
  column: Column,
  data: Data,
  originData: OriginData,
  id: number
) {
  const { rows } = originData;
  const { rawData, viewData } = data;
  const { allColumnMap, treeColumnName, treeIcon } = column;

  // create new creation key for updating the observe function of hoc component
  generateDataCreationKey();

  rows.forEach(row => {
    const parentRow = findRowByRowKey(data, column, id, row._attributes.tree!.parentRowKey);
    const rawRow = createTreeRawRow(row, column.defaultValues, parentRow || null);
    const viewRow = createViewRow(row, allColumnMap, rawData, treeColumnName, treeIcon);
    const foundIndex = findIndexByRowKey(data, column, id, rawRow.rowKey);

    rawData[foundIndex] = rawRow;
    viewData[foundIndex] = viewRow;
  });
}
