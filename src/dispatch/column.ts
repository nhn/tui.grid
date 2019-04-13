import { Store } from '../store/types';

export function setFrozenColumnCount({ column }: Store, count: number) {
  column.frozenCount = count;
}

export function hideColumn({ column }: Store, columnName: string) {
  const columnItem = column.allColumns.find(({ name }) => name === columnName);

  if (columnItem) {
    columnItem.hidden = true;
  }
}

export function showColumn({ column }: Store, columnName: string) {
  const columnItem = column.allColumns.find(({ name }) => name === columnName);

  if (columnItem) {
    columnItem.hidden = false;
  }
}
