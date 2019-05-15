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
