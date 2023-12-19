import {
  Row,
  RowKey,
  CellValue,
  RowAttributes,
  LoadingState,
  RemoveTargetRows,
  Data,
} from '@t/store/data';
import { Store } from '@t/store';
import { ColumnInfo } from '@t/store/column';
import { Range } from '@t/store/selection';
import { OptRow, OptAppendRow, OptRemoveRow, ResetOptions, OptRowProp } from '@t/options';
import {
  findProp,
  removeArrayItem,
  includes,
  isEmpty,
  someProp,
  findPropIndex,
  silentSplice,
  isNil,
  last,
  isBetween,
} from '../helper/common';
import { createViewRow, createData, setRowRelationListItems, createRawRow } from '../store/data';
import { notify, isObservable, batchObserver, asyncInvokeObserver } from '../helper/observable';
import { initSelection } from './selection';
import { getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';
import { getDataManager, getDataProvider } from '../instance';
import { changeTreeRowsCheckedState } from './tree';
import { isRowSpanEnabled } from '../query/rowSpan';
import { initFocus } from './focus';
import { createTreeRawRow } from '../store/helper/tree';
import {
  sort,
  initSortState,
  updateSortKey,
  sortByCurrentState,
  resetSortKey,
  resetSortState,
} from './sort';
import {
  findIndexByRowKey,
  findRowByRowKey,
  getRowHeight,
  getLoadingState,
  getAddedClassName,
  getRemovedClassName,
  getCreatedRowInfo,
  isSorted,
  getMaxRowKey,
  isScrollPagination,
  isFiltered,
  getCreatedRowInfos,
  getCheckStateChangedRowkeysInRange,
} from '../query/data';
import {
  updateSummaryValueByCell,
  updateSummaryValueByColumn,
  updateSummaryValueByRow,
  updateAllSummaryValues,
} from './summary';
import { initFilter, resetFilterState } from './filter';
import { initScrollPosition } from './viewport';
import { isCheckboxColumn, isDragColumn, isRowHeader, isRowNumColumn } from '../helper/column';
import { updatePageOptions, updatePageWhenRemovingRow, resetPageState } from './pagination';
import {
  resetRowSpan,
  updateRowSpan,
  updateRowSpanWhenAppending,
  updateRowSpanWhenRemoving,
} from './rowSpan';
import { createObservableData } from './lazyObservable';
import {
  removeUniqueInfoMap,
  createNewValidationMap,
  replaceColumnUniqueInfoMap,
  forceValidateUniquenessOfColumns,
  forceValidateUniquenessOfColumn,
} from '../store/helper/validation';
import { setColumnWidthsByText, setAutoResizingColumnWidths } from './column';
import { fitRowHeightWhenMovingRow } from './renderState';
import {
  DISABLED_PRIORITY_CELL,
  DISABLED_PRIORITY_COLUMN,
  DISABLED_PRIORITY_NONE,
  DISABLED_PRIORITY_ROW,
} from '../helper/constant';

// interface ContinuousRowInfo {
//   rowIndex: number;
//   rawRow: Row;
//   viewRow: { rowKey: OptRowProp; sortKey: OptRowProp; uniqueKey: OptRowProp };
// }

interface ContinuousRowInfo {
  rowIndices: number[];
  rawRows: Row[];
  viewRows: { rowKey: OptRowProp; sortKey: OptRowProp; uniqueKey: OptRowProp }[];
}

function getIndexRangeOfCheckbox(
  { data, column, id }: Store,
  startRowKey: RowKey,
  targetRowKey: RowKey
): Range {
  const filtered = isFiltered(data);

  const from = findIndexByRowKey(data, column, id, startRowKey, filtered);
  const to = findIndexByRowKey(data, column, id, targetRowKey, filtered);

  return from < to ? [from, to + 1] : [to, from + 1];
}

function updateHeightsWithFilteredData(store: Store) {
  const { data, focus } = store;
  const { filteredRawData } = data;
  const { rowKey } = focus;

  if (!filteredRawData.some((row) => row.rowKey === rowKey)) {
    initFocus(store);
  }
  updateHeights(store);
}

export function updateHeights(store: Store) {
  const { data, rowCoords, dimension } = store;
  const { pageOptions, pageRowRange, filteredRawData } = data;
  const { rowHeight } = dimension;

  rowCoords.heights = pageOptions.useClient
    ? filteredRawData.slice(...pageRowRange).map((row) => getRowHeight(row, rowHeight))
    : filteredRawData.map((row) => getRowHeight(row, rowHeight));
}

export function makeObservable({
  store,
  rowIndex,
  silent = false,
  lazyObservable = false,
  forced = false,
}: {
  store: Store;
  rowIndex: number;
  silent?: boolean;
  lazyObservable?: boolean;
  forced?: boolean;
}) {
  const { data, column, id } = store;
  const { rawData, viewData } = data;
  const { treeColumnName } = column;
  const rawRow = rawData[rowIndex];

  if (!forced && isObservable(rawRow)) {
    return;
  }

  if (treeColumnName) {
    const parentRow = findRowByRowKey(data, column, id, rawRow._attributes.tree!.parentRowKey);
    rawData[rowIndex] = createTreeRawRow(id, rawRow, parentRow || null, column, {
      lazyObservable,
    });
  } else {
    rawData[rowIndex] = createRawRow(id, rawRow, rowIndex, column, { lazyObservable });
  }
  viewData[rowIndex] = createViewRow(id, rawData[rowIndex], rawData, column);

  if (!silent) {
    notify(data, 'rawData', 'filteredRawData', 'viewData', 'filteredViewData');
  }
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
  const eventBus = getEventBus(id);
  const { rawData, viewData, sortState } = data;
  const { allColumnMap, columnsWithoutRowHeader } = column;
  const rowIndex = findIndexByRowKey(data, column, id, rowKey, false);
  const targetRow = rawData[rowIndex];

  if (!targetRow || targetRow[columnName] === value) {
    return;
  }
  if (checkCellState) {
    makeObservable({ store, rowIndex });
    const { disabled, editable } = viewData[rowIndex].valueMap[columnName];

    if (disabled || !editable) {
      return;
    }
  }

  resetRowSpan(store);

  const targetColumn = findProp('name', columnName, columnsWithoutRowHeader);
  const orgValue = targetRow[columnName];

  // @TODO: 'onBeforeChange' event is deprecated. This event will be replaced with 'beforeChange' event
  if (targetColumn && targetColumn.onBeforeChange) {
    gridEvent = new GridEvent({ rowKey, columnName, value: orgValue, nextValue: value });
    targetColumn.onBeforeChange(gridEvent);

    if (gridEvent.isStopped()) {
      updateRowSpan(store);
      return;
    }
  }

  const change = { rowKey, columnName, value: orgValue, nextValue: value };
  gridEvent = new GridEvent({ origin: 'cell', changes: [change] });

  /**
   * Occurs before one or more cells is changed
   * @event Grid#beforeChange
   * @property {string} origin - The type of change('paste', 'delete', 'cell')
   * @property {Array.<object>} changes - rowKey, column name, original values and next values before changing the values
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('beforeChange', gridEvent);
  if (gridEvent.isStopped()) {
    updateRowSpan(store);
    return;
  }

  value = change.nextValue;
  const { rowSpanMap } = targetRow;
  const { columns } = sortState;
  const index = findPropIndex('columnName', columnName, columns);

  replaceColumnUniqueInfoMap(id, column, { rowKey, columnName, prevValue: orgValue, value });

  targetRow[columnName] = value;
  setRowRelationListItems(targetRow, allColumnMap);

  if (index !== -1) {
    sort(store, columnName, columns[index].ascending, true, false);
  }

  setTimeout(() => {
    updateHeightsWithFilteredData(store);
  });
  updateSummaryValueByCell(store, columnName, { orgValue, value });
  getDataManager(id).push('UPDATE', [targetRow]);

  if (!isEmpty(rowSpanMap) && rowSpanMap[columnName] && isRowSpanEnabled(sortState, column)) {
    const { spanCount } = rowSpanMap[columnName];
    // update sub rows value
    for (let count = 1; count < spanCount; count += 1) {
      rawData[rowIndex + count][columnName] = value;
      updateSummaryValueByCell(store, columnName, { orgValue, value });
      getDataManager(id).push('UPDATE', [rawData[rowIndex + count]]);
    }
  }
  setAutoResizingColumnWidths(store);

  // @TODO: 'onAfterChange' event is deprecated. This event will be replaced with 'afterChange' event
  if (targetColumn && targetColumn.onAfterChange) {
    gridEvent = new GridEvent({ rowKey, columnName, value, prevValue: orgValue });
    targetColumn.onAfterChange(gridEvent);
  }

  gridEvent = new GridEvent({
    origin: 'cell',
    changes: [{ rowKey, columnName, value, prevValue: orgValue }],
  });

  /**
   * Occurs after one or more cells is changed
   * @event Grid#afterChange
   * @property {string} origin - The type of change('paste', 'delete', 'cell')
   * @property {Array.<object>} changes - rowKey, column name, previous values and changed values after changing the values
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('afterChange', gridEvent);

  updateRowSpan(store);
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

export function setRowsAttributeInRange<K extends keyof RowAttributes>(
  store: Store,
  attrName: K,
  value: RowAttributes[K],
  range: Range
) {
  store.data.filteredRawData.slice(...range).forEach((row) => {
    if (isUpdatableRowAttr(attrName, row._attributes.checkDisabled)) {
      row._attributes[attrName] = value;
    }
  });
}

export function setAllRowAttribute<K extends keyof RowAttributes>(
  { data }: Store,
  attrName: K,
  value: RowAttributes[K],
  allPage = true
) {
  const { filteredRawData } = data;
  const range = allPage ? [0, filteredRawData.length] : data.pageRowRange;

  filteredRawData.slice(...range).forEach((row) => {
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
  const { id, data, column } = store;
  data.rawData.forEach((targetRow, index) => {
    let valid = true;

    if (checkCellState) {
      const { disabled, editable } = data.viewData[index].valueMap[columnName];
      valid = !disabled && editable;
    }

    if (targetRow[columnName] !== value && valid) {
      replaceColumnUniqueInfoMap(id, column, {
        rowKey: targetRow.rowKey,
        columnName,
        prevValue: targetRow[columnName],
        value,
      });
      targetRow[columnName] = value;
      getDataManager(id).push('UPDATE', [targetRow]);
    }
  });
  updateSummaryValueByColumn(store, columnName, { value });
  forceValidateUniquenessOfColumn(data.rawData, column, columnName);
  setAutoResizingColumnWidths(store);
  updateRowSpan(store);
}

export function check(store: Store, rowKey: RowKey) {
  const { id, column, data } = store;
  const { allColumnMap, treeColumnName = '' } = column;
  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({ rowKey });

  data.clickedCheckboxRowkey = rowKey;

  setRowAttribute(store, rowKey, 'checked', true);
  if (allColumnMap[treeColumnName]) {
    changeTreeRowsCheckedState(store, rowKey, true);
  }
  asyncInvokeObserver(() => {
    setCheckedAllRows(store);
  });

  /**
   * Occurs when a checkbox in row header is checked
   * @event Grid#check
   * @property {number | string} [rowKey] - rowKey of the checked row(when single check via click)
   * @property {Array<number | string>} [rowKeys] - rowKeys of the checked rows(when multiple check via shift-click)
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('check', gridEvent);
}

export function uncheck(store: Store, rowKey: RowKey) {
  const { id, column, data } = store;
  const { allColumnMap, treeColumnName = '' } = column;
  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({ rowKey });

  data.clickedCheckboxRowkey = rowKey;

  setRowAttribute(store, rowKey, 'checked', false);
  if (allColumnMap[treeColumnName]) {
    changeTreeRowsCheckedState(store, rowKey, false);
  }
  asyncInvokeObserver(() => {
    setCheckedAllRows(store);
  });

  /**
   * Occurs when a checkbox in row header is unchecked
   * @event Grid#uncheck
   * @property {number | string} [rowKey] - rowKey of the unchecked row(when single check via click)
   * @property {Array<number | string>} [rowKeys] - rowKeys of the unchecked rows(when multiple unchecked via shift-click)
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('uncheck', gridEvent);
}

export function setCheckboxBetween(
  store: Store,
  value: boolean,
  startRowKey: RowKey,
  endRowKey?: RowKey
) {
  const { data, id } = store;
  const { clickedCheckboxRowkey } = data;
  const targetRowKey = endRowKey || clickedCheckboxRowkey;
  const eventBus = getEventBus(id);

  if (isNil(targetRowKey)) {
    if (value) {
      check(store, startRowKey);
    } else {
      uncheck(store, startRowKey);
    }
    return;
  }

  const range = getIndexRangeOfCheckbox(store, startRowKey, targetRowKey);
  const checkStateChangedRowkeys = getCheckStateChangedRowkeysInRange(store, value, range);
  const eventArgs = { rowKey: startRowKey, rowKeys: checkStateChangedRowkeys };

  const gridEventBefore = new GridEvent(eventArgs);
  /**
   * Occurs before the http request is sent
   * @event Grid#beforeRequest
   * @type {module:event/gridEvent}
   * @property {XMLHttpRequest} xhr - Current XMLHttpRequest instance
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('beforeCheckBetween', gridEventBefore);
  if (gridEventBefore.isStopped()) {
    if (value) {
      check(store, startRowKey);
    } else {
      uncheck(store, startRowKey);
    }
    return;
  }

  data.clickedCheckboxRowkey = startRowKey;

  setRowsAttributeInRange(store, 'checked', value, range);
  setCheckedAllRows(store);

  const gridEvent = new GridEvent(eventArgs);

  eventBus.trigger(value ? 'check' : 'uncheck', gridEvent);
}

export function checkAll(store: Store, allPage?: boolean) {
  const { id } = store;
  setAllRowAttribute(store, 'checked', true, allPage);
  setCheckedAllRows(store);
  notify(store.data, 'rawData', 'filteredRawData', 'viewData', 'filteredViewData');

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
  notify(store.data, 'rawData', 'filteredRawData', 'viewData', 'filteredViewData');

  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent();

  /**
   * Occurs when a checkbox in header is unchecked(unchecked all checkbox in row header)
   * @event Grid#uncheckAll
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('uncheckAll', gridEvent);
}

export function setDisabledAllCheckbox({ data }: Store) {
  const { rawData } = data;

  data.disabledAllCheckbox =
    !!rawData.length && rawData.every((row) => row._attributes.checkDisabled);
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
  data.rawData.forEach((row) => {
    row._disabledPriority = {};
    setAllRowAttribute(store, 'disabled', disabled);
    setAllRowAttribute(store, 'checkDisabled', disabled);
  });
  column.columnsWithoutRowHeader.forEach((columnInfo) => {
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

    column.allColumns.forEach((columnInfo) => {
      _disabledPriority[columnInfo.name] = DISABLED_PRIORITY_ROW;
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

  data.rawData.forEach((row) => {
    row._disabledPriority[columnName] = DISABLED_PRIORITY_COLUMN;
  });
  setRowOrColumnDisabled(column.allColumnMap[columnName], disabled);
}

export function setCellDisabled(
  store: Store,
  disabled: boolean,
  rowKey: RowKey,
  columnName: string
) {
  const { data, column, id } = store;

  if (isRowNumColumn(columnName) || isDragColumn(columnName)) {
    return;
  }

  const row = findRowByRowKey(data, column, id, rowKey, false);

  if (row) {
    const { _attributes, _disabledPriority } = row;

    _disabledPriority[columnName] = disabled ? DISABLED_PRIORITY_CELL : DISABLED_PRIORITY_NONE;

    if (isCheckboxColumn(columnName)) {
      _attributes.checkDisabled = disabled;
      setDisabledAllCheckbox(store);
    }

    notify(row, '_disabledPriority');
  }
}

export function setRowCheckDisabled(store: Store, disabled: boolean, rowKey: RowKey) {
  const { data, column, id } = store;
  const row = findRowByRowKey(data, column, id, rowKey, false);
  if (row) {
    row._attributes.checkDisabled = disabled;
    setDisabledAllCheckbox(store);
  }
}

export function appendRow(store: Store, row: OptRow, options: OptAppendRow) {
  const { data, column, id } = store;
  const { rawData, viewData, sortState, pageOptions } = data;
  const { at = rawData.length, extendPrevRowSpan } = options;
  const { rawRow, viewRow, prevRow } = getCreatedRowInfo(store, at, row);
  const inserted = at !== rawData.length;

  silentSplice(rawData, at, 0, rawRow);
  silentSplice(viewData, at, 0, viewRow);
  makeObservable({ store, rowIndex: at });
  updatePageOptions(store, { totalCount: pageOptions.totalCount! + 1 });
  updateHeights(store);

  if (inserted) {
    updateSortKey(data, at);
  }

  sortByCurrentState(store);

  if (isRowSpanEnabled(sortState, column)) {
    if (prevRow) {
      updateRowSpanWhenAppending(rawData, prevRow, extendPrevRowSpan || false);
    }
    updateRowSpan(store);
  }

  getDataManager(id).push('CREATE', [rawRow], inserted);
  updateSummaryValueByRow(store, rawRow, { type: 'APPEND' });
  postUpdateAfterManipulation(store, at, 'DONE', [rawRow]);
}

export function removeRow(store: Store, rowKey: RowKey, options: OptRemoveRow) {
  const { data, id, focus, column } = store;
  const { rawData, viewData, sortState } = data;
  const rowIndex = findIndexByRowKey(data, column, id, rowKey, false);

  if (rowIndex === -1) {
    return;
  }

  let removedRow = {} as Row;
  const nextRow = rawData[rowIndex + 1];

  updatePageWhenRemovingRow(store, 1);
  removeUniqueInfoMap(id, rawData[rowIndex], column);

  batchObserver(() => {
    [removedRow] = rawData.splice(rowIndex, 1);
  });
  viewData.splice(rowIndex, 1);
  updateHeights(store);

  if (!someProp('rowKey', focus.rowKey, rawData)) {
    initFocus(store);
  }
  initSelection(store);

  if (nextRow && isRowSpanEnabled(sortState, column)) {
    updateRowSpanWhenRemoving(rawData, removedRow, nextRow, options.keepRowSpanData || false);
  }

  if (rowIndex !== rawData.length) {
    updateSortKey(data, removedRow.sortKey + 1, false);
  }

  getDataManager(id).push('DELETE', [removedRow]);
  updateSummaryValueByRow(store, removedRow, { type: 'REMOVE' });
  postUpdateAfterManipulation(store, rowIndex, getLoadingState(rawData));
}

export function clearData(store: Store) {
  const { data, id, rowCoords } = store;

  createNewValidationMap(id);
  initScrollPosition(store);
  initFocus(store);
  initSelection(store);
  initSortState(data);
  initFilter(store);
  rowCoords.heights = [];
  data.rawData = [];
  data.viewData = [];
  updatePageOptions(store, { totalCount: 0, page: 1 }, true);
  updateAllSummaryValues(store);
  setLoadingState(store, 'EMPTY');
  setCheckedAllRows(store);

  getDataManager(id).clearAll();
}

export function resetData(store: Store, inputData: OptRow[], options: ResetOptions) {
  const { data, column, id } = store;
  const { sortState, filterState, pageState } = options;

  createNewValidationMap(id);

  const { rawData, viewData } = createData(id, inputData, column, { lazyObservable: true });
  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent();

  initScrollPosition(store);
  initFocus(store);
  initSelection(store);

  resetSortState(store, sortState);
  resetFilterState(store, filterState);
  resetPageState(store, rawData.length, pageState);

  data.rawData = rawData;
  data.viewData = viewData;
  updateHeights(store);
  updateAllSummaryValues(store);
  setLoadingState(store, getLoadingState(rawData));
  setCheckedAllRows(store);

  getDataManager(id).setOriginData(inputData);
  getDataManager(id).clearAll();
  setColumnWidthsByText(store);
  updateRowSpan(store);

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

  rawData.forEach((row) => {
    addClassNameToAttribute(row, columnName, className);
  });
}

export function removeColumnClassName({ data }: Store, columnName: string, className: string) {
  const { rawData } = data;

  rawData.forEach((row) => {
    removeClassNameToAttribute(row, columnName, className);
  });
}

export function setLoadingState({ data }: Store, state: LoadingState) {
  data.loadingState = state;
}

export function setCheckedAllRows({ data }: Store) {
  const { filteredRawData, pageRowRange } = data;
  let result = false;

  if (filteredRawData.length) {
    const enableCheckRows = filteredRawData
      .slice(...pageRowRange)
      .filter((row) => !row._attributes.checkDisabled);
    result = !!enableCheckRows.length && enableCheckRows.every((row) => row._attributes.checked);
  }
  data.checkedAllRows = result;
}

export function updateRowNumber({ data }: Store, startIndex: number) {
  const { rawData } = data;

  for (let idx = startIndex; idx < rawData.length; idx += 1) {
    rawData[idx]._attributes.rowNum = idx + 1;
  }
}

export function setRow(store: Store, rowIndex: number, row: OptRow) {
  const { data, id, column } = store;
  const { rawData, viewData, sortState } = data;
  const orgRow = rawData[rowIndex];

  if (!orgRow) {
    return;
  }

  removeUniqueInfoMap(id, orgRow, column);

  row.sortKey = orgRow.sortKey;
  const { rawRow, viewRow, prevRow } = getCreatedRowInfo(store, rowIndex, row, orgRow.rowKey);

  silentSplice(rawData, rowIndex, 1, rawRow);
  silentSplice(viewData, rowIndex, 1, viewRow);
  makeObservable({ store, rowIndex });

  sortByCurrentState(store);

  if (prevRow && isRowSpanEnabled(sortState, column)) {
    updateRowSpanWhenAppending(rawData, prevRow, false);
  }

  getDataManager(id).push('UPDATE', [rawRow]);

  setTimeout(() => {
    updateHeightsWithFilteredData(store);
  });
  updateSummaryValueByRow(store, rawRow, { type: 'SET', orgRow });
  postUpdateAfterManipulation(store, rowIndex, 'DONE');
  updateRowSpan(store);
}

function spliceContinuousRowInfos(data: Data, continuousRowInfo: ContinuousRowInfo) {
  const { rawData, viewData } = data;
  const startRowIndex = continuousRowInfo.rowIndices[0];
  const sizeOfContinuousRowInfos = continuousRowInfo.rowIndices.length;

  silentSplice(rawData, startRowIndex, sizeOfContinuousRowInfos, ...continuousRowInfo.rawRows);
  silentSplice(viewData, startRowIndex, sizeOfContinuousRowInfos, ...continuousRowInfo.viewRows);
}

export function setRows(store: Store, rows: OptRow[]) {
  const { data, column, id, viewport } = store;
  const { rawData, sortState } = data;
  const { rowRange } = viewport;

  const sortedIndexedRows = rows
    .map((row) => {
      const rowIndex = findIndexByRowKey(data, column, id, row.rowKey as RowKey, false);
      const orgRow = rawData[rowIndex];

      removeUniqueInfoMap(id, orgRow, column);

      row.sortKey = orgRow.sortKey;
      return { rowIndex, row, orgRow };
    })
    .sort((prev, current) => prev.rowIndex - current.rowIndex);

  const createdRowInfos = getCreatedRowInfos(store, sortedIndexedRows);

  let continuousRowInfo: ContinuousRowInfo = {
    rowIndices: [],
    rawRows: [],
    viewRows: [],
  };

  createdRowInfos.forEach(({ rowIndex, row }) => {
    const { rawRow, viewRow } = row;

    if (
      continuousRowInfo.rowIndices.length === 0 ||
      last(continuousRowInfo.rowIndices) === rowIndex - 1
    ) {
      continuousRowInfo.rowIndices.push(rowIndex);
      continuousRowInfo.rawRows.push(rawRow);
      continuousRowInfo.viewRows.push(viewRow);
    } else {
      spliceContinuousRowInfos(data, continuousRowInfo);
      continuousRowInfo = {
        rowIndices: [rowIndex],
        rawRows: [rawRow],
        viewRows: [viewRow],
      };
    }
  });
  spliceContinuousRowInfos(data, continuousRowInfo);

  createdRowInfos
    .filter(({ rowIndex }) => isBetween(rowIndex, rowRange[0], rowRange[1]))
    .forEach(({ rowIndex }) =>
      makeObservable({ store, rowIndex, silent: false, lazyObservable: true })
    );

  if (isRowSpanEnabled(sortState, column)) {
    createdRowInfos
      .filter(({ row: { prevRow } }) => !!prevRow)
      .forEach(({ row: { prevRow } }) => updateRowSpanWhenAppending(rawData, prevRow, false));
  }

  getDataManager(id).push(
    'UPDATE',
    createdRowInfos.map(({ row }) => row.rawRow)
  );

  sortByCurrentState(store);
  postUpdateAfterManipulation(store, createdRowInfos[0].rowIndex, 'DONE');

  setTimeout(() => {
    updateHeightsWithFilteredData(store);
  });

  updateRowSpan(store);
  updateAllSummaryValues(store);
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
  const [rawRow] = silentSplice(rawData, currentIndex, 1);
  const [viewRow] = silentSplice(viewData, currentIndex, 1);

  batchObserver(() => {
    rawData.splice(targetIndex, 0, rawRow);
  });
  viewData.splice(targetIndex, 0, viewRow);

  fitRowHeightWhenMovingRow(store, currentIndex, targetIndex);

  resetSortKey(data, minIndex);
  updateRowNumber(store, minIndex);
  getDataManager(id).push('UPDATE', [rawRow], true);
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
      setCheckedAllRows(store);
    } else if (page * perPage < totalCount) {
      data.pageOptions.page += 1;
      getDataProvider(id).readData(data.pageOptions.page);
    }
  }
}

export function appendRows(store: Store, inputData: OptRow[]) {
  const { data, column, id } = store;

  const startIndex = data.rawData.length;
  const { rawData, viewData } = createData(id, inputData, column, { lazyObservable: true });

  if (!column.keyColumnName) {
    const rowKey = getMaxRowKey(data);
    rawData.forEach((row, index) => {
      row.rowKey = rowKey + index;
    });

    viewData.forEach((row, index) => {
      row.rowKey = rowKey + index;
    });
  }

  const newRawData = data.rawData.concat(rawData);
  const newViewData = data.viewData.concat(viewData);

  data.rawData = newRawData;
  data.viewData = newViewData;

  resetSortKey(data, startIndex);
  sortByCurrentState(store);
  updateHeights(store);
  rawData.forEach((rawRow) => getDataManager(id).push('CREATE', [rawRow]));
  postUpdateAfterManipulation(store, startIndex, 'DONE', rawData);
  updateRowSpan(store);
}

export function removeRows(store: Store, targetRows: RemoveTargetRows) {
  const { data, id, focus, column } = store;
  const { sortState, viewData, rawData } = data;
  const { rowIndices: rowIndexes, rows, nextRows } = targetRows;
  const deletedCount = rowIndexes.length;

  updatePageWhenRemovingRow(store, deletedCount);

  rowIndexes.forEach((rowIndex, i) => {
    const nextRow = nextRows[i];
    const [removedRow] = silentSplice(rawData, rowIndex - i, 1);
    silentSplice(viewData, rowIndex - i, 1);
    removeUniqueInfoMap(id, removedRow, column);

    if (nextRow) {
      if (isRowSpanEnabled(sortState, column)) {
        updateRowSpanWhenRemoving(rawData, removedRow, nextRow, false);
      }
    }
    getDataManager(id).push('DELETE', [removedRow]);
  });

  resetSortKey(data, 0);

  notify(data, 'rawData', 'filteredRawData', 'viewData', 'filteredViewData');
  updateHeights(store);

  if (someProp('rowKey', focus.rowKey, rows)) {
    initFocus(store);
  }
  initSelection(store);

  updateAllSummaryValues(store);
  postUpdateAfterManipulation(store, rowIndexes[0], getLoadingState(rawData));
}

function postUpdateAfterManipulation(
  store: Store,
  rowIndex: number,
  state: LoadingState,
  rows?: Row[]
) {
  setLoadingState(store, state);
  updateRowNumber(store, rowIndex);
  setDisabledAllCheckbox(store);
  setCheckedAllRows(store);
  forceValidateUniquenessOfColumns(store.data.rawData, store.column);
  setAutoResizingColumnWidths(store, rows);
}
