import {
  Store,
  CellValue,
  RowKey,
  SelectionRange,
  RowAttributes,
  RowAttributeValue
} from '../store/types';
import { copyDataToRange, getRangeToPaste } from '../query/clipboard';
import { findProp, arrayEqual, mapProp } from '../helper/common';
import { getSortedData } from '../helper/sort';
import { isColumnEditable } from '../helper/clipboard';
import { OptRow, OptAppendRow } from '../types';
import { createRawRow, createViewRow } from '../store/data';
import { notify } from '../helper/reactive';

export function setValue({ data }: Store, rowKey: RowKey, columnName: string, value: CellValue) {
  const targetRow = findProp('rowKey', rowKey, data.rawData);

  if (targetRow) {
    targetRow[columnName] = value;
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

export function setColumnValues(store: Store, columnName: string, value: CellValue) {
  store.data.rawData.forEach((targetRow) => {
    targetRow[columnName] = value;
  });
}

export function check(store: Store, rowKey: RowKey) {
  const { rendererOptions = {} } = store.column.allColumnMap._checked;

  if (rendererOptions.inputType === 'radio') {
    setAllRowAttribute(store, 'checked', false);
  }
  setRowAttribute(store, rowKey, 'checked', true);
}

export function uncheck(store: Store, rowKey: RowKey) {
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

// @TODO neet to modify useClient options with net api
export function sort({ data }: Store, columnName: string, ascending: boolean) {
  const { sortOptions } = data;
  if (sortOptions.columnName !== columnName || sortOptions.ascending !== ascending) {
    data.sortOptions = { ...sortOptions, columnName, ascending };
  }
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
    column: { visibleColumns }
  } = store;
  const {
    row: [startRowIndex, endRowIndex],
    column: [startColumnIndex, endColumnIndex]
  } = indexToPaste;

  const columnNames = mapProp('name', visibleColumns);

  for (let rowIdx = 0; rowIdx + startRowIndex <= endRowIndex; rowIdx += 1) {
    const rawRowIndex = rowIdx + startRowIndex;
    for (let columnIdx = 0; columnIdx + startColumnIndex <= endColumnIndex; columnIdx += 1) {
      const name = columnNames[columnIdx + startColumnIndex];
      if (isColumnEditable(viewData, rawRowIndex, name)) {
        rawData[rawRowIndex][name] = pasteData[rowIdx][columnIdx];
      }
    }
  }
}

export function paste(store: Store, pasteData: string[][]) {
  const { selection } = store;

  if (selection.range) {
    pasteData = copyDataToRange(selection.range, pasteData);
  }

  const rangeToPaste = getRangeToPaste(store, pasteData);
  applyPasteDataToRawData(store, pasteData, rangeToPaste);
  store.selection.inputRange = rangeToPaste;
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

export function appendRow({ data, column }: Store, row: OptRow, options: OptAppendRow) {
  const { rawData, viewData } = data;
  const { defaultValues, allColumnMap } = column;
  const { at = rawData.length } = options;

  const rawRow = createRawRow(row, rawData.length, defaultValues);
  const viewRow = createViewRow(rawRow, allColumnMap);

  rawData.splice(at, 0, rawRow);
  viewData.splice(at, 0, viewRow);

  notify(data, 'rawData');
  notify(data, 'viewData');
}
