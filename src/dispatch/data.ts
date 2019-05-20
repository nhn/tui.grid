import { Store, CellValue, RowKey } from '../store/types';
import { findProp } from '../helper/common';
import { applyPasteDataToRawData, duplicateData, getRangeToPaste } from '../query/clipboard';

export function setValue({ data }: Store, rowKey: RowKey, columnName: string, value: CellValue) {
  const targetRow = findProp('rowKey', rowKey, data.rawData);
  if (targetRow) {
    targetRow[columnName] = value;
  }
}

export function setColumnValues(store: Store, columnName: string, value: CellValue) {
  store.data.rawData.forEach((targetRow) => {
    targetRow[columnName] = value;
  });
}

export function check(store: Store, rowKey: RowKey) {
  const { rendererOptions = {} } = store.column.allColumnMap._checked;

  if (rendererOptions.inputType === 'radio') {
    setColumnValues(store, '_checked', false);
  }

  setValue(store, rowKey, '_checked', true);
}

export function uncheck(store: Store, rowKey: RowKey) {
  setValue(store, rowKey, '_checked', false);
}

export function checkAll(store: Store) {
  const { rendererOptions = {} } = store.column.allColumnMap._checked;

  if (rendererOptions.inputType !== 'radio') {
    setColumnValues(store, '_checked', true);
  }
}

export function uncheckAll(store: Store) {
  const { rendererOptions = {} } = store.column.allColumnMap._checked;

  if (rendererOptions.inputType !== 'radio') {
    setColumnValues(store, '_checked', false);
  }
}

export function paste(store: Store, pasteData: string[][]) {
  const { selection } = store;

  if (selection.range) {
    pasteData = duplicateData(selection.range, pasteData);
  }

  const rangeToPaste = getRangeToPaste(store, pasteData);
  applyPasteDataToRawData(store, pasteData, rangeToPaste);
  store.selection.inputRange = rangeToPaste;
}
