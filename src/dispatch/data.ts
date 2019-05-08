import { Store, CellValue } from '../store/types';

export function setValue(
  { data }: Store,
  rowKey: number | string,
  columnName: string,
  value: CellValue
) {
  const targetRow = data.rawData.find((row) => row.rowKey === rowKey);
  if (targetRow) {
    targetRow[columnName] = value;
  }
}
