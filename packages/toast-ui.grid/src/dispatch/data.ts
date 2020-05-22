import {
  Row,
  RowKey,
  CellValue,
  RowAttributes,
  LoadingState,
  RemoveTargetRows
} from '@t/store/data';
import { Store } from '@t/store';
import { SelectionRange } from '@t/store/selection';
import { ColumnInfo } from '@t/store/column';
import {
  OptRow,
  OptAppendRow,
  OptRemoveRow,
  ResetOptions,
  SortStateResetOption,
  FilterStateResetOption
} from '@t/options';
import { copyDataToRange, getRangeToPaste } from '../query/clipboard';
import {
  findProp,
  mapProp,
  removeArrayItem,
  includes,
  isEmpty,
  someProp,
  findPropIndex,
  silentSplice
} from '../helper/common';
import { createViewRow, createData, setRowRelationListItems, createRawRow } from '../store/data';
import { notify, isObservable } from '../helper/observable';
import { changeSelectionRange, initSelection } from './selection';
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
  changeSortState,
  updateSortKey,
  sortByCurrentState,
  resetSortKey
} from './sort';
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
import { initFilter, updateFilters, clearFilter } from './filter';
import { getSelectionRange } from '../query/selection';
import { initScrollPosition } from './viewport';
import { isRowHeader } from '../helper/column';
import { updatePageOptions, updatePageWhenRemovingRow } from './pagination';
import { updateRowSpanWhenAppending, updateRowSpanWhenRemoving } from './rowSpan';
import { createObservableData } from './lazyObservable';

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

export function makeObservable(store: Store, rowIndex: number) {
  const { data, column, id } = store;
  const { rawData, viewData } = data;
  const { columnMapWithRelation, treeColumnName, treeIcon } = column;
  const rawRow = rawData[rowIndex];

  if (isObservable(rawRow)) {
    return;
  }

  if (treeColumnName) {
    const parentRow = findRowByRowKey(data, column, id, rawRow._attributes.tree!.parentRowKey);
    rawData[rowIndex] = createTreeRawRow(rawRow, parentRow || null, columnMapWithRelation);
    viewData[rowIndex] = createViewRow(
      rawData[rowIndex],
      columnMapWithRelation,
      rawData,
      treeColumnName,
      treeIcon
    );
  } else {
    rawData[rowIndex] = createRawRow(rawRow, rowIndex, columnMapWithRelation);
    viewData[rowIndex] = createViewRow(rawData[rowIndex], columnMapWithRelation, rawData);
  }
  notify(data, 'rawData', 'filteredRawData', 'viewData', 'filteredViewData');
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
  const { allColumnMap, columnsWithoutRowHeader } = column;
  const rowIdx = findIndexByRowKey(data, column, id, rowKey, false);
  const targetRow = rawData[rowIdx];

  if (!targetRow || targetRow[columnName] === value) {
    return;
  }
  if (checkCellState) {
    makeObservable(store, rowIdx);
    const { disabled, editable } = viewData[rowIdx].valueMap[columnName];

    if (disabled || !editable) {
      return;
    }
  }

  const targetColumn = findProp('name', columnName, columnsWithoutRowHeader);
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
    let valid = true;

    if (checkCellState) {
      const { disabled, editable } = data.viewData[index].valueMap[columnName];
      valid = !disabled && editable;
    }

    if (targetRow[columnName] !== value && valid) {
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
  if (allColumnMap[treeColumnName]) {
    changeTreeRowsCheckedState(store, rowKey, true);
  }
  setCheckedAllRows(store);

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
  if (allColumnMap[treeColumnName]) {
    changeTreeRowsCheckedState(store, rowKey, false);
  }
  setCheckedAllRows(store);

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

export function setDisabledAllCheckbox({ data }: Store) {
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

export function appendRow(store: Store, row: OptRow, options: OptAppendRow) {
  const { data, id } = store;
  const { rawData, viewData, sortState, pageOptions } = data;
  const { at = rawData.length } = options;
  const { rawRow, viewRow, prevRow } = getCreatedRowInfo(store, at, row);
  const inserted = at !== rawData.length;

  silentSplice(viewData, at, 0, viewRow);
  silentSplice(rawData, at, 0, rawRow);
  makeObservable(store, at);
  updatePageOptions(store, { totalCount: pageOptions.totalCount! + 1 });
  updateHeights(store);

  if (inserted) {
    updateSortKey(data, at);
  }

  sortByCurrentState(store);

  if (prevRow && isRowSpanEnabled(sortState)) {
    updateRowSpanWhenAppending(rawData, prevRow, options.extendPrevRowSpan || false);
  }

  getDataManager(id).push('CREATE', rawRow, inserted);
  updateSummaryValueByRow(store, rawRow, { type: 'APPEND' });
  postUpdateAfterManipulation(store, at, 'DONE');
}

export function removeRow(store: Store, rowKey: RowKey, options: OptRemoveRow) {
  const { data, id, focus, column } = store;
  const { rawData, viewData, sortState } = data;
  const rowIndex = findIndexByRowKey(data, column, id, rowKey, false);

  if (rowIndex === -1) {
    return;
  }

  const nextRow = rawData[rowIndex + 1];

  updatePageWhenRemovingRow(store, 1);

  viewData.splice(rowIndex, 1);
  const [removedRow] = rawData.splice(rowIndex, 1);
  updateHeights(store);

  if (!someProp('rowKey', focus.rowKey, rawData)) {
    initFocus(store);
  }
  initSelection(store);

  if (nextRow && isRowSpanEnabled(sortState)) {
    updateRowSpanWhenRemoving(rawData, removedRow, nextRow, options.keepRowSpanData || false);
  }

  if (rowIndex !== rawData.length) {
    updateSortKey(data, removedRow.sortKey + 1, false);
  }

  getDataManager(id).push('DELETE', removedRow);
  updateSummaryValueByRow(store, removedRow, { type: 'REMOVE' });
  postUpdateAfterManipulation(store, rowIndex, getLoadingState(rawData));
}

export function clearData(store: Store) {
  const { data, id, rowCoords } = store;

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

  getDataManager(id).clearAll();
}

function resetSortState(store: Store, sortState?: SortStateResetOption) {
  const { data, column } = store;
  if (sortState) {
    const { columnName, ascending, multiple } = sortState;

    if (column.allColumnMap[columnName].sortable) {
      changeSortState(store, columnName, ascending, multiple, false);
      notify(data, 'sortState');
    }
  } else {
    initSortState(data);
  }
}

function resetFilterState(store: Store, filterState?: FilterStateResetOption) {
  if (filterState) {
    const { columnFilterState, columnName } = filterState;
    const columnFilterOption = store.column.allColumnMap[columnName].filter;

    if (columnFilterOption) {
      if (columnFilterState) {
        const nextState = {
          conditionFn: () => true,
          type: columnFilterOption.type,
          state: columnFilterState,
          columnName,
          operator: columnFilterOption.operator
        };
        updateFilters(store, columnName, nextState);
      } else {
        clearFilter(store, columnName);
      }
    }
  } else {
    initFilter(store);
  }
}

export function resetData(store: Store, inputData: OptRow[], options: ResetOptions) {
  const { data, column, id } = store;
  const { sortState, filterState } = options;
  const { rawData, viewData } = createData({ data: inputData, column, lazyObservable: true });
  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent();

  initScrollPosition(store);
  initFocus(store);
  initSelection(store);

  resetSortState(store, sortState);
  resetFilterState(store, filterState);

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

export function setLoadingState({ data }: Store, state: LoadingState) {
  data.loadingState = state;
}

export function setCheckedAllRows({ data }: Store) {
  const { filteredRawData, pageRowRange } = data;
  let result = false;

  if (filteredRawData.length) {
    const enableCheckRows = filteredRawData
      .slice(...pageRowRange)
      .filter(row => !row._attributes.checkDisabled);
    result = !!enableCheckRows.length && enableCheckRows.every(row => row._attributes.checked);
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
  const { data, id } = store;
  const { rawData, viewData, sortState } = data;
  const orgRow = rawData[rowIndex];

  if (!orgRow) {
    return;
  }

  row.sortKey = orgRow.sortKey;
  const { rawRow, viewRow, prevRow } = getCreatedRowInfo(store, rowIndex, row, orgRow.rowKey);

  silentSplice(viewData, rowIndex, 1, viewRow);
  silentSplice(rawData, rowIndex, 1, rawRow);
  makeObservable(store, rowIndex);

  sortByCurrentState(store);

  if (prevRow && isRowSpanEnabled(sortState)) {
    updateRowSpanWhenAppending(rawData, prevRow, false);
  }

  getDataManager(id).push('UPDATE', rawRow);

  updateHeightsWithFilteredData(store);
  updateSummaryValueByRow(store, rawRow, { type: 'SET', orgRow });
  postUpdateAfterManipulation(store, rowIndex, 'DONE');
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
  getDataManager(id).push('UPDATE', rawRow, true);
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
  updateHeights(store);
  postUpdateAfterManipulation(store, startIndex, 'DONE');
}

export function removeRows(store: Store, targetRows: RemoveTargetRows) {
  const { data, id, focus } = store;
  const { sortState, viewData, rawData } = data;
  const { rowIndexes, rows, nextRows } = targetRows;
  const deletedCount = rowIndexes.length;

  updatePageWhenRemovingRow(store, deletedCount);

  rowIndexes.forEach((rowIndex, i) => {
    const nextRow = nextRows[i];
    const [removedRow] = silentSplice(rawData, rowIndex - i, 1);
    silentSplice(viewData, rowIndex - i, 1);

    if (nextRow) {
      if (isRowSpanEnabled(sortState)) {
        updateRowSpanWhenRemoving(rawData, removedRow, nextRow, false);
      }
    }
    getDataManager(id).push('DELETE', removedRow);
    updateSortKey(data, removedRow.sortKey + 1, false);
  });

  notify(data, 'rawData', 'filteredRawData', 'viewData', 'filteredViewData');
  updateHeights(store);

  if (someProp('rowKey', focus.rowKey, rows)) {
    initFocus(store);
  }
  initSelection(store);

  updateAllSummaryValues(store);
  postUpdateAfterManipulation(store, rowIndexes[0], getLoadingState(rawData));
}

function postUpdateAfterManipulation(store: Store, rowIndex: number, state: LoadingState) {
  setLoadingState(store, state);
  updateRowNumber(store, rowIndex);
  setDisabledAllCheckbox(store);
  setCheckedAllRows(store);
}
