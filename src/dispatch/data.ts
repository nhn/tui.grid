import {
  Store,
  CellValue,
  RowKey,
  SelectionRange,
  RowAttributes,
  RowAttributeValue,
  PageOptions
} from '../store/types';
import { copyDataToRange, getRangeToPaste } from '../query/clipboard';
import {
  findProp,
  arrayEqual,
  mapProp,
  findPropIndex,
  isUndefined,
  removeArrayItem,
  includes
} from '../helper/common';
import { getSortedData } from '../helper/sort';
import { isColumnEditable } from '../helper/clipboard';
import { OptRow, OptAppendRow, OptRemoveRow } from '../types';
import { createRawRow, createViewRow, createData } from '../store/data';
import { notify } from '../helper/observable';
import { getRowHeight } from '../store/rowCoords';
import { getEventBus } from '../event/eventBus';
import { changeSelectionRange } from './selection';
import GridEvent from '../event/gridEvent';
import { getDataManager } from '../helper/inject';

export function setValue(
  { column, data, id }: Store,
  rowKey: RowKey,
  columnName: string,
  value: CellValue
) {
  const targetRow = findProp('rowKey', rowKey, data.rawData);
  if (!targetRow || targetRow[columnName] === value) {
    return;
  }

  const targetColumn = findProp('name', columnName, column.visibleColumns);
  let gridEvent = new GridEvent({ rowKey, columnName, value });

  if (targetColumn && targetColumn.onBeforeChange) {
    targetColumn.onBeforeChange(gridEvent);
  }

  if (!gridEvent.isStopped()) {
    if (targetRow) {
      targetRow[columnName] = value;
      getDataManager(id).push('U', targetRow);
    }
    if (targetColumn && targetColumn.onAfterChange) {
      gridEvent = new GridEvent({ rowKey, columnName, value });
      targetColumn.onAfterChange(gridEvent);
    }
  }
}

function isUpdatableRowAttr(
  name: keyof RowAttributes,
  checkDisabled: boolean,
  allDisabled: boolean
) {
  return !(name === 'checked' && (checkDisabled || allDisabled));
}

export function setRowAttribute(
  { data }: Store,
  rowKey: RowKey,
  attrName: keyof RowAttributes,
  value: RowAttributeValue
) {
  const { disabled, rawData } = data;
  const targetRow = findProp('rowKey', rowKey, rawData);
  if (targetRow && isUpdatableRowAttr(attrName, targetRow._attributes.checkDisabled, disabled)) {
    targetRow._attributes[attrName] = value;
  }
}

export function setAllRowAttribute(
  { data }: Store,
  attrName: keyof RowAttributes,
  value: RowAttributeValue
) {
  data.rawData.forEach((row) => {
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
  store.data.rawData.forEach((targetRow) => {
    targetRow[columnName] = value;
  });
}

export function check(store: Store, rowKey: RowKey) {
  const { rendererOptions = {} } = store.column.allColumnMap._checked;
  const eventBus = getEventBus(store.id);
  const gridEvent = new GridEvent({ rowKey });

  /**
   * Occurs when a checkbox in row header is checked
   * @event Grid#check
   * @property {number | string} rowKey - rowKey of the checked row
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('check', gridEvent);

  if (rendererOptions.inputType === 'radio') {
    setAllRowAttribute(store, 'checked', false);
  }
  setRowAttribute(store, rowKey, 'checked', true);
}

export function uncheck(store: Store, rowKey: RowKey) {
  const eventBus = getEventBus(store.id);
  const gridEvent = new GridEvent({ rowKey });

  /**
   * Occurs when a checkbox in row header is unchecked
   * @event Grid#uncheck
   * @property {number | string} rowKey - rowKey of the unchecked row
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('uncheck', gridEvent);

  setRowAttribute(store, rowKey, 'checked', false);
}

export function checkAll(store: Store) {
  const { rendererOptions = {} } = store.column.allColumnMap._checked;

  if (rendererOptions.inputType !== 'radio') {
    setAllRowAttribute(store, 'checked', true);
  }
}

export function uncheckAll(store: Store) {
  const { rendererOptions = {} } = store.column.allColumnMap._checked;

  if (rendererOptions.inputType !== 'radio') {
    setAllRowAttribute(store, 'checked', false);
  }
}

export function changeSortBtn({ data }: Store, columnName: string, ascending: boolean) {
  const { sortOptions } = data;
  if (sortOptions.columnName !== columnName || sortOptions.ascending !== ascending) {
    data.sortOptions = { ...sortOptions, columnName, ascending };
  }
}

export function sort(store: Store, columnName: string, ascending: boolean) {
  const { data } = store;
  const { sortOptions } = data;
  if (!sortOptions.useClient) {
    return;
  }
  changeSortBtn(store, columnName, ascending);
  const { rawData, viewData } = getSortedData(data, columnName, ascending);
  if (!arrayEqual(rawData, data.rawData)) {
    data.rawData = rawData;
    data.viewData = viewData;
  }
}

function applyPasteDataToRawData(
  store: Store,
  pasteData: string[][],
  indexToPaste: SelectionRange
) {
  const {
    data: { rawData, viewData },
    column: { visibleColumns },
    id
  } = store;
  const {
    row: [startRowIndex, endRowIndex],
    column: [startColumnIndex, endColumnIndex]
  } = indexToPaste;

  const columnNames = mapProp('name', visibleColumns);

  for (let rowIdx = 0; rowIdx + startRowIndex <= endRowIndex; rowIdx += 1) {
    let pasted = false;
    const rawRowIndex = rowIdx + startRowIndex;
    for (let columnIdx = 0; columnIdx + startColumnIndex <= endColumnIndex; columnIdx += 1) {
      const name = columnNames[columnIdx + startColumnIndex];
      if (isColumnEditable(viewData, rawRowIndex, name)) {
        pasted = true;
        rawData[rawRowIndex][name] = pasteData[rowIdx][columnIdx];
      }
    }
    if (pasted) {
      getDataManager(id).push('U', rawData[rawRowIndex]);
    }
  }
}

export function paste(store: Store, pasteData: string[][]) {
  const { selection, id } = store;

  if (selection.range) {
    pasteData = copyDataToRange(selection.range, pasteData);
  }

  const rangeToPaste = getRangeToPaste(store, pasteData);
  applyPasteDataToRawData(store, pasteData, rangeToPaste);
  changeSelectionRange(selection, rangeToPaste, id);
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
  const { rawData } = store.data;
  const row = findProp('rowKey', rowKey, rawData);
  if (row) {
    row._attributes.disabled = disabled;
    if (withCheckbox) {
      row._attributes.checkDisabled = disabled;
    }
  }
}

export function setRowCheckDisabled(store: Store, disabled: boolean, rowKey: RowKey) {
  const { rawData } = store.data;
  const row = findProp('rowKey', rowKey, rawData);
  if (row) {
    row._attributes.checkDisabled = disabled;
  }
}

export function appendRow(
  { data, column, rowCoords, dimension, id }: Store,
  row: OptRow,
  options: OptAppendRow
) {
  const { rawData, viewData } = data;
  const { heights } = rowCoords;
  const { defaultValues, allColumnMap } = column;
  const { at = rawData.length } = options;

  const rawRow = createRawRow(row, rawData.length, defaultValues);
  const viewRow = createViewRow(rawRow, allColumnMap);

  rawData.splice(at, 0, rawRow);
  viewData.splice(at, 0, viewRow);
  heights.splice(at, 0, getRowHeight(rawRow, dimension.rowHeight));

  notify(data, 'rawData');
  notify(data, 'viewData');
  notify(rowCoords, 'heights');
  getDataManager(id).push('C', rawRow);
}

export function removeRow({ data, rowCoords, id }: Store, rowKey: RowKey, options: OptRemoveRow) {
  const { rawData, viewData } = data;
  const { heights } = rowCoords;
  const rowIdx = findPropIndex('rowKey', rowKey, rawData);

  const removedRow = rawData.splice(rowIdx, 1);
  viewData.splice(rowIdx, 1);
  heights.splice(rowIdx, 1);

  notify(data, 'rawData');
  notify(data, 'viewData');
  notify(rowCoords, 'heights');
  getDataManager(id).push('D', removedRow[0]);
}

export function clearData({ data, id }: Store) {
  data.rawData.forEach((row) => {
    getDataManager(id).push('D', row);
  });
  data.rawData = [];
  data.viewData = [];
}

export function resetData({ data, column, dimension, rowCoords, id }: Store, inputData: OptRow[]) {
  const { rawData, viewData } = createData(inputData, column);
  const { rowHeight } = dimension;

  data.rawData = rawData;
  data.viewData = viewData;
  rowCoords.heights = rawData.map((row) => getRowHeight(row, rowHeight));

  // @TODO need to execute logic by condition
  getDataManager(id).setOriginData(inputData);
  getDataManager(id).clearAll();
}

export function addRowClassName(store: Store, rowKey: RowKey, className: string) {
  const { rawData } = store.data;
  const row = findProp('rowKey', rowKey, rawData);
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
  const { rawData } = store.data;
  const row = findProp('rowKey', rowKey, rawData);
  if (row) {
    removeArrayItem(className, row._attributes.className.row);
    notify(row._attributes, 'className');
  }
}

export function addCellClassName(
  store: Store,
  rowKey: RowKey,
  columnName: string,
  className: string
) {
  const { rawData } = store.data;
  const row = findProp('rowKey', rowKey, rawData);
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
  const { rawData } = store.data;
  const row = findProp('rowKey', rowKey, rawData);
  if (row) {
    const columnClassMap = row._attributes.className.column;
    if (isUndefined(columnClassMap[columnName])) {
      return;
    }
    removeArrayItem(className, columnClassMap[columnName]);
    notify(row._attributes, 'className');
  }
}

export function setRowHeight({ data, rowCoords }: Store, rowIndex: number, rowHeight: number) {
  data.rawData[rowIndex]._attributes.height = rowHeight;
  rowCoords.heights[rowIndex] = rowHeight;

  notify(rowCoords, 'heights');
}

export function setPagination({ data }: Store, pageOptions: PageOptions) {
  const { perPage } = data.pageOptions;
  data.pageOptions = { ...pageOptions, perPage };
}
