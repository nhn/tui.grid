import { Store, CellValue, RowKey } from '../store/types';
import { findProp, arrayEqual } from '../helper/common';
import { getSortedData } from '../helper/sort';

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

// @TODO neet to modify useClient options with net api
export function sort({ data }: Store, columnName: string, ascending: boolean) {
  const { sortOptions } = data;
  if (sortOptions.columnName !== columnName || sortOptions.ascending !== ascending) {
    data.sortOptions = { ...sortOptions, ...{ columnName, ascending } };
  }
  const { rawData, viewData } = getSortedData(data, columnName, ascending);
  if (!arrayEqual(rawData, data.rawData)) {
    data.rawData = rawData;
    data.viewData = viewData;
  }
}
