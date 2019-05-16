import { Store, CellValue, RowKey } from '../store/types';

export function setValue({ data }: Store, rowKey: RowKey, columnName: string, value: CellValue) {
  const targetRow = data.rawData.find((row) => row.rowKey === rowKey);
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
