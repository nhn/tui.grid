import {
  Row,
  PageOptions,
  RowKey,
  CellValue,
  RowAttributes,
  Data,
  LoadingState
} from '@t/store/data';
import { Store } from '@t/store';
import { SelectionRange, Range } from '@t/store/selection';
import { ColumnInfo, Column } from '@t/store/column';
import { OriginData } from '@t/dispatch';
import { copyDataToRange, getRangeToPaste } from '../query/clipboard';
import {
  findProp,
  mapProp,
  removeArrayItem,
  includes,
  isEmpty,
  someProp,
  findPropIndex,
  shallowEqual,
  isUndefined
} from '../helper/common';
import { OptRow, OptAppendRow, OptRemoveRow } from '@t/options';
import {
  createViewRow,
  createData,
  generateDataCreationKey,
  createRowSpan,
  setRowRelationListItems,
  createRawRow
} from '../store/data';
import { notify, isObservable } from '../helper/observable';
import { changeSelectionRange, initSelection } from './selection';
import { getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';
import { getDataManager, getDataProvider } from '../instance';
import { changeTreeRowsCheckedState } from './tree';
import { isRowSpanEnabled } from '../query/rowSpan';
import { initFocus } from './focus';
import { createTreeRawRow } from '../store/helper/tree';
import { sort, initSortState } from './sort';
import {
  findIndexByRowKey,
  findRowByRowKey,
  isEditableCell,
  getRowHeight,
  getLoadingState,
  getAddedClassName,
  getRemovedClassName,
  getCreatedRowInfo,
  isSorted,
  isFiltered,
  getMaxRowKey,
  isScrollPagination
} from '../query/data';
import {
  updateSummaryValueByCell,
  updateSummaryValueByColumn,
  updateSummaryValueByRow,
  updateAllSummaryValues
} from './summary';
import { initFilter } from './filter';
import { getSelectionRange } from '../query/selection';
import { initScrollPosition } from './viewport';
import { isRowHeader } from '../helper/column';

function updateRowSpanWhenAppend(data: Row[], prevRow: Row, extendPrevRowSpan: boolean) {
  const { rowSpanMap: prevRowSpanMap } = prevRow;

  if (isEmpty(prevRowSpanMap)) {
    return;
  }

  Object.keys(prevRowSpanMap).forEach(columnName => {
    const prevRowSpan = prevRowSpanMap[columnName];
    if (prevRowSpan) {
      const { count, mainRow: keyRow, mainRowKey } = prevRowSpan;
      const mainRow = keyRow ? prevRow : findProp('rowKey', mainRowKey, data)!;
      const mainRowSpan = mainRow.rowSpanMap[columnName];
      const startOffset = keyRow || extendPrevRowSpan ? 1 : -count + 1;

      // keep rowSpan state when appends row in the middle of rowSpan
      if (mainRowSpan.spanCount > startOffset) {
        mainRowSpan.count += 1;
        mainRowSpan.spanCount += 1;

        updateSubRowSpan(data, mainRow, columnName, 1, mainRowSpan.spanCount);
      }
    }
  });
}

function updateRowSpanWhenRemove(
  data: Row[],
  removedRow: Row,
  nextRow: Row,
  keepRowSpanData: boolean
) {
  const { rowSpanMap: removedRowSpanMap } = removedRow;

  if (isEmpty(removedRowSpanMap)) {
    return;
  }

  Object.keys(removedRowSpanMap).forEach(columnName => {
    const removedRowSpan = removedRowSpanMap[columnName];
    const { count, mainRow: keyRow, mainRowKey } = removedRowSpan;
    let mainRow: Row, spanCount: number;

    if (keyRow) {
      mainRow = nextRow;
      spanCount = count - 1;

      if (spanCount > 1) {
        const mainRowSpan = mainRow.rowSpanMap[columnName];
        mainRowSpan.mainRowKey = mainRow.rowKey;
        mainRowSpan.mainRow = true;
      }
      if (keepRowSpanData) {
        mainRow[columnName] = removedRow[columnName];
      }
    } else {
      mainRow = findProp('rowKey', mainRowKey, data)!;
      spanCount = mainRow.rowSpanMap[columnName].spanCount - 1;
    }

    if (spanCount > 1) {
      const mainRowSpan = mainRow.rowSpanMap[columnName];
      mainRowSpan.count = spanCount;
      mainRowSpan.spanCount = spanCount;
      updateSubRowSpan(data, mainRow, columnName, 1, spanCount);
    } else {
      delete mainRow.rowSpanMap[columnName];
    }
  });
}

function updateSubRowSpan(
  data: Row[],
  mainRow: Row,
  columnName: string,
  startOffset: number,
  spanCount: number
) {
  const mainRowIndex = findPropIndex('rowKey', mainRow.rowKey, data);

  for (let offset = startOffset; offset < spanCount; offset += 1) {
    const row = data[mainRowIndex + offset];
    row.rowSpanMap[columnName] = createRowSpan(false, mainRow.rowKey, -offset, spanCount);
  }
}

function updateHeightsWithFilteredData(store: Store) {
  if (store.data.filters) {
    initFocus(store);
  }
  updateHeights(store);
}

export function updateHeights(store: Store) {
  const { data, rowCoords, dimension } = store;
  const { pageOptions, pageRowRange, filteredRawData } = data;
  const { rowHeight } = dimension;

  rowCoords.heights = pageOptions.useClient
    ? filteredRawData.slice(...pageRowRange).map(row => getRowHeight(row, rowHeight))
    : filteredRawData.map(row => getRowHeight(row, rowHeight));
}

export function updatePageOptions(
  { data }: Store,
  pageOptions: PageOptions,
  forceUpdatePage = false
) {
  const { pageOptions: orgPageOptions } = data;
  if (!isEmpty(orgPageOptions)) {
    // if infinite scrolling is applied, page number should be not reset to know the last loaded page
    if (!forceUpdatePage && isScrollPagination(data)) {
      delete pageOptions.page;
    }
    const newPageOptions = { ...orgPageOptions, ...pageOptions };

    if (!shallowEqual(newPageOptions, orgPageOptions)) {
      data.pageOptions = newPageOptions;
    }
  }
}

export function makeObservable(store: Store, rowKey: RowKey) {
  const { data, column, id } = store;
  const { rawData, viewData } = data;
  const { columnMapWithRelation, treeColumnName, treeIcon } = column;
  const foundIndex = findIndexByRowKey(data, column, id, rowKey, false);
  const rawRow = rawData[foundIndex];

  if (isObservable(rawRow)) {
    return;
  }

  if (treeColumnName) {
    const parentRow = findRowByRowKey(data, column, id, rawRow._attributes.tree!.parentRowKey);
    rawData[foundIndex] = createTreeRawRow(rawRow, parentRow || null, columnMapWithRelation);
    viewData[foundIndex] = createViewRow(
      rawData[foundIndex],
      columnMapWithRelation,
      rawData,
      treeColumnName,
      treeIcon
    );
  } else {
    rawData[foundIndex] = createRawRow(rawRow, foundIndex, columnMapWithRelation);
    viewData[foundIndex] = createViewRow(rawData[foundIndex], columnMapWithRelation, rawData);
  }
  notify(data, 'rawData');
  notify(data, 'viewData');
}

export function setValue(
  store: Store,
  rowKey: RowKey,
  columnName: string,
  value: CellValue,
  checkCellState = false
) {
  let gridEvent;
  const { column, data, id } = store;
  const { rawData, viewData, sortState } = data;
  const { visibleColumns, allColumnMap } = column;
  const rowIdx = findIndexByRowKey(data, column, id, rowKey, false);
  const targetRow = rawData[rowIdx];

  if (!targetRow || targetRow[columnName] === value) {
    return;
  }
  if (checkCellState) {
    makeObservable(store, rowKey);
    const { disabled, editable } = viewData[rowIdx].valueMap[columnName];

    if (disabled || !editable) {
      return;
    }
  }

  const targetColumn = findProp('name', columnName, visibleColumns);
  const orgValue = targetRow[columnName];

  if (targetColumn && targetColumn.onBeforeChange) {
    gridEvent = new GridEvent({ rowKey, columnName, value: orgValue, nextValue: value });
    targetColumn.onBeforeChange(gridEvent);

    if (gridEvent.isStopped()) {
      return;
    }
  }

  const { rowSpanMap } = targetRow;
  const { columns } = sortState;
  const index = findPropIndex('columnName', columnName, columns);

  targetRow[columnName] = value;
  setRowRelationListItems(targetRow, allColumnMap);

  if (index !== -1) {
    sort(store, columnName, columns[index].ascending, true, false);
  }

  updateHeightsWithFilteredData(store);
  updateSummaryValueByCell(store, columnName, { orgValue, value });
  getDataManager(id).push('UPDATE', targetRow);

  if (!isEmpty(rowSpanMap) && rowSpanMap[columnName] && isRowSpanEnabled(sortState)) {
    const { spanCount } = rowSpanMap[columnName];
    // update sub rows value
    for (let count = 1; count < spanCount; count += 1) {
      rawData[rowIdx + count][columnName] = value;
      updateSummaryValueByCell(store, columnName, { orgValue, value });
      getDataManager(id).push('UPDATE', rawData[rowIdx + count]);
    }
  }

  if (targetColumn && targetColumn.onAfterChange) {
    gridEvent = new GridEvent({ rowKey, columnName, value, prevValue: orgValue });
    targetColumn.onAfterChange(gridEvent);
  }
}

export function isUpdatableRowAttr(name: keyof RowAttributes, checkDisabled: boolean) {
  return !(name === 'checked' && checkDisabled);
}

export function setRowAttribute<K extends keyof RowAttributes>(
  { data, column, id }: Store,
  rowKey: RowKey,
  attrName: K,
  value: RowAttributes[K]
) {
  const targetRow = findRowByRowKey(data, column, id, rowKey, false);

  // https://github.com/microsoft/TypeScript/issues/34293
  if (targetRow && isUpdatableRowAttr(attrName, targetRow._attributes.checkDisabled)) {
    targetRow._attributes[attrName] = value;
  }
}

export function setAllRowAttribute<K extends keyof RowAttributes>(
  { data }: Store,
  attrName: K,
  value: RowAttributes[K],
  allPage = true
) {
  const { filteredRawData } = data;
  const range = allPage ? [0, filteredRawData.length] : data.pageRowRange;

  filteredRawData.slice(...range).forEach(row => {
    if (isUpdatableRowAttr(attrName, row._attributes.checkDisabled)) {
      // https://github.com/microsoft/TypeScript/issues/34293
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
  if (checkCellState) {
    // @TODO: find more practical way to make observable
    createObservableData(store, true);
  }
  const { id, data } = store;
  data.rawData.forEach((targetRow, index) => {
    const { disabled, editable } = data.viewData[index].valueMap[columnName];
    if (targetRow[columnName] !== value && (!checkCellState || (!disabled && editable))) {
      targetRow[columnName] = value;
      getDataManager(id).push('UPDATE', targetRow);
    }
  });
  updateSummaryValueByColumn(store, columnName, { value });
}

export function check(store: Store, rowKey: RowKey) {
  const { id, column } = store;
  const { allColumnMap, treeColumnName = '' } = column;
  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({ rowKey });

  setRowAttribute(store, rowKey, 'checked', true);
  setCheckedAllRows(store);

  if (allColumnMap[treeColumnName]) {
    changeTreeRowsCheckedState(store, rowKey, true);
  }

  /**
   * Occurs when a checkbox in row header is checked
   * @event Grid#check
   * @property {number | string} rowKey - rowKey of the checked row
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('check', gridEvent);
}

export function uncheck(store: Store, rowKey: RowKey) {
  const { id, column } = store;
  const { allColumnMap, treeColumnName = '' } = column;
  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({ rowKey });

  setRowAttribute(store, rowKey, 'checked', false);
  setCheckedAllRows(store);

  if (allColumnMap[treeColumnName]) {
    changeTreeRowsCheckedState(store, rowKey, false);
  }

  /**
   * Occurs when a checkbox in row header is unchecked
   * @event Grid#uncheck
   * @property {number | string} rowKey - rowKey of the unchecked row
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('uncheck', gridEvent);
}

export function checkAll(store: Store, allPage?: boolean) {
  const { id } = store;
  setAllRowAttribute(store, 'checked', true, allPage);
  setCheckedAllRows(store);
  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent();

  /**
   * Occurs when a checkbox in header is checked(checked all checkbox in row header)
   * @event Grid#checkAll
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('checkAll', gridEvent);
}

export function uncheckAll(store: Store, allPage?: boolean) {
  const { id } = store;
  setAllRowAttribute(store, 'checked', false, allPage);
  setCheckedAllRows(store);
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
  const { data, column, id } = store;
  const { filteredRawData, filteredViewData } = data;
  const { visibleColumnsWithRowHeader } = column;
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
      if (filteredViewData.length && isEditableCell(data, column, rawRowIndex, name)) {
        pasted = true;
        filteredRawData[rawRowIndex][name] = pasteData[rowIdx][columnIdx];
      }
    }
    if (pasted) {
      getDataManager(id).push('UPDATE', filteredRawData[rawRowIndex]);
    }
  }
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

function setDisabledAllCheckbox({ data }: Store) {
  const { rawData } = data;

  data.disabledAllCheckbox =
    !!rawData.length && rawData.every(row => row._attributes.checkDisabled);
}

function setRowOrColumnDisabled(target: RowAttributes | ColumnInfo, disabled: boolean) {
  if (target.disabled === disabled) {
    notify(target, 'disabled');
  } else {
    target.disabled = disabled;
  }
}

// @TODO consider the client pagination with disabled
export function setDisabled(store: Store, disabled: boolean) {
  const { data, column } = store;
  data.rawData.forEach(row => {
    row._disabledPriority = {};
    setAllRowAttribute(store, 'disabled', disabled);
    setAllRowAttribute(store, 'checkDisabled', disabled);
  });
  column.columnsWithoutRowHeader.forEach(columnInfo => {
    columnInfo.disabled = disabled;
  });
  data.disabledAllCheckbox = disabled;
}

export function setRowDisabled(
  store: Store,
  disabled: boolean,
  rowKey: RowKey,
  withCheckbox: boolean
) {
  const { data, column, id } = store;
  const row = findRowByRowKey(data, column, id, rowKey, false);
  if (row) {
    const { _attributes, _disabledPriority } = row;

    column.allColumns.forEach(columnInfo => {
      _disabledPriority[columnInfo.name] = 'ROW';
    });

    if (withCheckbox) {
      _attributes.checkDisabled = disabled;
      setDisabledAllCheckbox(store);
    }
    setRowOrColumnDisabled(_attributes, disabled);
  }
}

export function setColumnDisabled({ data, column }: Store, disabled: boolean, columnName: string) {
  if (isRowHeader(columnName)) {
    return;
  }

  data.rawData.forEach(row => {
    row._disabledPriority[columnName] = 'COLUMN';
  });
  setRowOrColumnDisabled(column.allColumnMap[columnName], disabled);
}

export function setRowCheckDisabled(store: Store, disabled: boolean, rowKey: RowKey) {
  const { data, column, id } = store;
  const row = findRowByRowKey(data, column, id, rowKey, false);
  if (row) {
    row._attributes.checkDisabled = disabled;
    setDisabledAllCheckbox(store);
  }
}

function updateSortKey(data: Data, sortKey: number, appended = true) {
  const incremental = appended ? 1 : -1;
  const { rawData, viewData } = data;

  for (let idx = 0; idx < rawData.length; idx += 1) {
    if (rawData[idx].sortKey >= sortKey) {
      rawData[idx].sortKey += incremental;
      viewData[idx].sortKey += incremental;
    }
  }
  if (appended) {
    rawData[sortKey].sortKey = sortKey;
    viewData[sortKey].sortKey = sortKey;
  }
}

function resetSortKey(data: Data, start: number) {
  const { rawData, viewData } = data;
  for (let idx = start; idx < rawData.length; idx += 1) {
    rawData[idx].sortKey = idx;
    viewData[idx].sortKey = idx;
  }
}

function sortByCurrentState(store: Store) {
  const { data } = store;
  if (isSorted(data)) {
    const { columnName, ascending } = data.sortState.columns[0];
    sort(store, columnName, ascending, true, false);
  }
}

export function appendRow(store: Store, row: OptRow, options: OptAppendRow) {
  const { data, id } = store;
  const { rawData, viewData, sortState, pageOptions } = data;
  const { at = rawData.length } = options;
  const { rawRow, viewRow, prevRow } = getCreatedRowInfo(store, at, row);

  viewData.splice(at, 0, viewRow);
  rawData.splice(at, 0, rawRow);
  updatePageOptions(store, { totalCount: pageOptions.totalCount! + 1 });
  updateHeights(store);

  if (at !== rawData.length) {
    updateSortKey(data, at);
  }

  sortByCurrentState(store);

  if (prevRow && isRowSpanEnabled(sortState)) {
    updateRowSpanWhenAppend(rawData, prevRow, options.extendPrevRowSpan || false);
  }

  getDataManager(id).push('CREATE', rawRow);
  updateSummaryValueByRow(store, rawRow, { type: 'APPEND' });
  setLoadingState(store, 'DONE');
  updateRowNumber(store, at);
  setDisabledAllCheckbox(store);
  if (data.checkedAllRows) {
    checkAll(store);
  }
}

export function removeRow(store: Store, rowKey: RowKey, options: OptRemoveRow) {
  const { data, id, focus, column } = store;
  const { rawData, viewData, sortState, pageOptions } = data;
  const rowIdx = findIndexByRowKey(data, column, id, rowKey, false);

  if (rowIdx === -1) {
    return;
  }

  const nextRow = rawData[rowIdx + 1];

  if (!isEmpty(pageOptions)) {
    const { perPage, totalCount, page } = pageOptions;
    let modifiedLastPage = Math.floor((totalCount - 1) / perPage);

    if ((totalCount - 1) % perPage) {
      modifiedLastPage += 1;
    }

    updatePageOptions(
      store,
      {
        totalCount: totalCount - 1,
        page: modifiedLastPage < page ? modifiedLastPage : page
      },
      true
    );
  }

  viewData.splice(rowIdx, 1);
  const [removedRow] = rawData.splice(rowIdx, 1);
  updateHeights(store);

  if (!someProp('rowKey', focus.rowKey, rawData)) {
    initFocus(store);
  }

  if (nextRow && isRowSpanEnabled(sortState)) {
    updateRowSpanWhenRemove(rawData, removedRow, nextRow, options.keepRowSpanData || false);
  }

  if (rowIdx !== rawData.length) {
    updateSortKey(data, removedRow.sortKey + 1, false);
  }

  getDataManager(id).push('DELETE', removedRow);
  updateSummaryValueByRow(store, removedRow, { type: 'REMOVE' });
  setLoadingState(store, getLoadingState(rawData));
  updateRowNumber(store, rowIdx);
  setDisabledAllCheckbox(store);
  setCheckedAllRows(store);
}

export function clearData(store: Store) {
  const { data, id, rowCoords } = store;
  data.rawData.forEach(row => {
    getDataManager(id).push('DELETE', row);
  });

  initScrollPosition(store);
  initFocus(store);
  initSelection(store);
  initSortState(data);
  initFilter(store);
  rowCoords.heights = [];
  data.viewData = [];
  data.rawData = [];
  updatePageOptions(store, { totalCount: 0, page: 1 }, true);
  updateAllSummaryValues(store);
  setLoadingState(store, 'EMPTY');
  setCheckedAllRows(store);
}

export function resetData(store: Store, inputData: OptRow[]) {
  const { data, column, id } = store;
  const { rawData, viewData } = createData({ data: inputData, column, lazyObservable: true });
  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent();

  initScrollPosition(store);
  initFocus(store);
  initSelection(store);

  if (data.sortState.useClient) {
    initSortState(data);
  }

  initFilter(store);
  updatePageOptions(store, { totalCount: rawData.length, page: 1 }, true);
  data.viewData = viewData;
  data.rawData = rawData;
  updateHeights(store);
  updateAllSummaryValues(store);
  setLoadingState(store, getLoadingState(rawData));
  setCheckedAllRows(store);

  getDataManager(id).setOriginData(inputData);
  getDataManager(id).clearAll();

  setTimeout(() => {
    /**
     * Occurs when the grid data is updated and the grid is rendered onto the DOM
     * The event occurs only in the following API as below.
     * 'resetData', 'restore', 'reloadData', 'readData', 'setPerPage' with 'dataSource', using 'dataSource'
     * @event Grid#onGridUpdated
     * @property {Grid} instance - Current grid instance
     */
    eventBus.trigger('onGridUpdated', gridEvent);
  });
}

export function addRowClassName(store: Store, rowKey: RowKey, className: string) {
  const { data, column, id } = store;
  const row = findRowByRowKey(data, column, id, rowKey, false);
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
  const row = findRowByRowKey(data, column, id, rowKey, false);
  if (row) {
    removeArrayItem(className, row._attributes.className.row);
    notify(row._attributes, 'className');
  }
}

function addClassNameToAttribute(row: Row, columnName: string, className: string) {
  const columnClassNames = row._attributes.className.column[columnName];
  row._attributes.className.column[columnName] = getAddedClassName(className, columnClassNames);

  notify(row._attributes, 'className');
}

function removeClassNameToAttribute(row: Row, columnName: string, className: string) {
  const columnClassNames = row._attributes.className.column[columnName];
  if (columnClassNames) {
    row._attributes.className.column[columnName] = getRemovedClassName(className, columnClassNames);
  }

  notify(row._attributes, 'className');
}

export function addCellClassName(
  store: Store,
  rowKey: RowKey,
  columnName: string,
  className: string
) {
  const { data, column, id } = store;
  const row = findRowByRowKey(data, column, id, rowKey, false);
  if (row) {
    addClassNameToAttribute(row, columnName, className);
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
    removeClassNameToAttribute(row, columnName, className);
  }
}

export function addColumnClassName({ data }: Store, columnName: string, className: string) {
  const { rawData } = data;

  rawData.forEach(row => {
    addClassNameToAttribute(row, columnName, className);
  });
}

export function removeColumnClassName({ data }: Store, columnName: string, className: string) {
  const { rawData } = data;

  rawData.forEach(row => {
    removeClassNameToAttribute(row, columnName, className);
  });
}

export function movePage(store: Store, page: number) {
  const { data } = store;

  initScrollPosition(store);

  data.pageOptions.page = page;
  notify(data, 'pageOptions');

  updateHeights(store);
  initSelection(store);
  initFocus(store);
  setCheckedAllRows(store);
  updateAllSummaryValues(store);
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

  return data
    .filteredIndex!.slice(start, end)
    .reduce(
      (acc: OriginData, rowIndex) =>
        getDataToBeObservable(acc, data.rawData[rowIndex], rowIndex, treeColumnName),
      { rows: [], targetIndexes: [] }
    );
}

export function createObservableData({ column, data, viewport, id }: Store, allRowRange = false) {
  const rowRange: Range = allRowRange ? [0, data.rawData.length] : viewport.rowRange;
  const { treeColumnName } = column;
  const originData =
    data.filters && !allRowRange
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
}

function fillMissingColumnData(allColumns: ColumnInfo[], rawData: Row[]) {
  allColumns.forEach(({ name }) => {
    rawData.forEach(row => {
      if (isUndefined(row[name])) {
        row[name] = null;
      }
    });
  });
}

function changeToObservableData(column: Column, data: Data, originData: OriginData) {
  const { targetIndexes, rows } = originData;
  fillMissingColumnData(column.allColumns, data.rawData);

  // prevRows is needed to create rowSpan
  const prevRows = targetIndexes.map(targetIndex => data.rawData[targetIndex - 1]);
  const { rawData, viewData } = createData({ data: rows, column, lazyObservable: false, prevRows });

  for (let index = 0, end = rawData.length; index < end; index += 1) {
    const targetIndex = targetIndexes[index];
    data.viewData.splice(targetIndex, 1, viewData[index]);
    data.rawData.splice(targetIndex, 1, rawData[index]);
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
  const { columnMapWithRelation, treeColumnName, treeIcon } = column;
  fillMissingColumnData(column.allColumns, data.rawData);

  // create new creation key for updating the observe function of hoc component
  generateDataCreationKey();

  rows.forEach(row => {
    const parentRow = findRowByRowKey(data, column, id, row._attributes.tree!.parentRowKey);
    const rawRow = createTreeRawRow(row, parentRow || null, columnMapWithRelation);
    const viewRow = createViewRow(row, columnMapWithRelation, rawData, treeColumnName, treeIcon);
    const foundIndex = findIndexByRowKey(data, column, id, rawRow.rowKey);

    viewData.splice(foundIndex, 1, viewRow);
    rawData.splice(foundIndex, 1, rawRow);
  });
}

export function setLoadingState({ data }: Store, state: LoadingState) {
  data.loadingState = state;
}

export function setCheckedAllRows({ data }: Store) {
  const { filteredRawData, pageRowRange } = data;

  data.checkedAllRows =
    !!filteredRawData.length &&
    filteredRawData
      .slice(...pageRowRange)
      .filter(row => !row._attributes.checkDisabled)
      .every(row => row._attributes.checked);
}

export function updateRowNumber({ data }: Store, startIndex: number) {
  const { rawData } = data;

  for (let idx = startIndex; idx < rawData.length; idx += 1) {
    rawData[idx]._attributes.rowNum = idx + 1;
  }
}

export function setRow(store: Store, rowIndex: number, row: OptRow) {
  const { data, id } = store;
  const { rawData, viewData, sortState } = data;
  const orgRow = rawData[rowIndex];

  if (!orgRow) {
    return;
  }

  row.sortKey = orgRow.sortKey;
  const { rawRow, viewRow, prevRow } = getCreatedRowInfo(store, rowIndex, row, orgRow.rowKey);

  viewData.splice(rowIndex, 1, viewRow);
  rawData.splice(rowIndex, 1, rawRow);

  sortByCurrentState(store);

  if (prevRow && isRowSpanEnabled(sortState)) {
    updateRowSpanWhenAppend(rawData, prevRow, false);
  }

  getDataManager(id).push('UPDATE', rawRow);

  updateHeightsWithFilteredData(store);
  updateSummaryValueByRow(store, rawRow, { type: 'SET', orgRow });
  updateRowNumber(store, rowIndex);
  setDisabledAllCheckbox(store);
  if (data.checkedAllRows) {
    checkAll(store);
  }
}

export function moveRow(store: Store, rowKey: RowKey, targetIndex: number) {
  const { data, column, id } = store;
  const { rawData, viewData } = data;

  if (!rawData[targetIndex] || isSorted(data) || isFiltered(data)) {
    return;
  }

  const currentIndex = findIndexByRowKey(data, column, id, rowKey, false);

  if (currentIndex === -1) {
    return;
  }

  const minIndex = Math.min(currentIndex, targetIndex);
  const [viewRow] = viewData.splice(currentIndex, 1);
  const [rawRow] = rawData.splice(currentIndex, 1);

  viewData.splice(targetIndex, 0, viewRow);
  rawData.splice(targetIndex, 0, rawRow);

  resetSortKey(data, minIndex);
  updateRowNumber(store, minIndex);
  getDataManager(id).push('UPDATE', rawRow);
}

export function scrollToNext(store: Store) {
  const { data, id } = store;
  const { page, totalCount, perPage, useClient } = data.pageOptions;

  if (isScrollPagination(data)) {
    if (useClient) {
      data.pageOptions.page += 1;
      notify(data, 'pageOptions');

      sortByCurrentState(store);
      updateHeights(store);
    } else if (page * perPage < totalCount) {
      data.pageOptions.page += 1;
      getDataProvider(id).readData(data.pageOptions.page);
    }
  }
}

export function appendRows(store: Store, inputData: OptRow[]) {
  const { data, column } = store;

  if (!column.keyColumnName) {
    const rowKey = getMaxRowKey(data);
    inputData.forEach((row, index) => {
      row.rowKey = rowKey + index;
    });
  }

  const startIndex = data.rawData.length;
  const { rawData, viewData } = createData({ data: inputData, column, lazyObservable: true });

  data.viewData = data.viewData.concat(viewData);
  data.rawData = data.rawData.concat(rawData);

  resetSortKey(data, startIndex);
  sortByCurrentState(store);
  updateRowNumber(store, startIndex);
  updateHeights(store);
  setDisabledAllCheckbox(store);
  if (data.checkedAllRows) {
    checkAll(store);
  }
}
