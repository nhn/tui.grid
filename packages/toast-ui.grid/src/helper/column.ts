import { includes } from './common';

export function isRowHeader(columnName: string) {
  return includes(['_number', '_checked', '_draggable'], columnName);
}

export function isRowNumColumn(columnName: string) {
  return columnName === '_number';
}

export function isCheckboxColumn(columnName: string) {
  return columnName === '_checked';
}

export function isDragColumn(columnName: string) {
  return columnName === '_draggable';
}
