import { Store, Side } from '../store/types';

export function setFrozenColumnCount({ column }: Store, count: number) {
  column.frozenCount = count;
}

export function setColumnWidth({ column }: Store, side: Side, index: number, width: number) {
  const columnItem = column.visibleColumnsBySide[side][index];

  columnItem.baseWidth = width;
  columnItem.fixedWidth = true;
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
