import { ComplexColumnInfo } from '../store/types';
import { some } from './common';

export function isRowHeader(columnName: string) {
  return ['_number', '_checked'].indexOf(columnName) > -1;
}

export function isRowNumColumn(columnName: string) {
  return columnName === '_number';
}

export function isCheckboxColumn(columnName: string) {
  return columnName === '_checked';
}

export function isParentColumnHeader(complexHeaderColumns: ComplexColumnInfo[], name: string) {
  return !!complexHeaderColumns.length && some(item => item.name === name, complexHeaderColumns);
}
