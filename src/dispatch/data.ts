import {
  Store,
  CellValue,
  RowKey,
  SelectionRange,
  RowAttributes,
  RowAttributeValue
} from '../store/types';
import { findProp, arrayEqual, mapProp } from '../helper/common';
import { copyDataToRange, getRangeToPaste } from '../query/clipboard';
import { getSortedData } from '../helper/sort';
import { isColumnEditable } from '../helper/clipboard';

export function setValue({ data }: Store, rowKey: RowKey, columnName: string, value: CellValue) {
  const targetRow = findProp('rowKey', rowKey, data.rawData);
  if (targetRow) {
    targetRow[columnName] = value;
  }
}

export function setRowAttribute(
  { data }: Store,
  rowKey: RowKey,
  attrName: keyof RowAttributes,
  value: RowAttributeValue
) {
  const targetRow = findProp('rowKey', rowKey, data.rawData);
  if (targetRow) {
    targetRow._attributes[attrName] = value;
  }
}

export function setRowAttributeAll(
  { data }: Store,
  attrName: keyof RowAttributes,
  value: RowAttributeValue
) {
  data.rawData.forEach((row) => {
    row._attributes[attrName] = value;
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
    setRowAttributeAll(store, 'checked', false);
  }
  setRowAttribute(store, rowKey, 'checked', true);
}

export function uncheck(store: Store, rowKey: RowKey) {
  setRowAttribute(store, rowKey, 'checked', false);
}

export function checkAll(store: Store) {
  const { rendererOptions = {} } = store.column.allColumnMap._checked;

  if (rendererOptions.inputType !== 'radio') {
    setRowAttributeAll(store, 'checked', true);
  }
}

export function uncheckAll(store: Store) {
  const { rendererOptions = {} } = store.column.allColumnMap._checked;

  if (rendererOptions.inputType !== 'radio') {
    setRowAttributeAll(store, 'checked', false);
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
