import { ComplexColumnInfo, Column } from '../store/types';
import { some } from '../helper/common';

export function isParentColumnHeader(complexHeaderColumns: ComplexColumnInfo[], name: string) {
  return !!complexHeaderColumns.length && some(item => item.name === name, complexHeaderColumns);
}

export function isHiddenColumn(column: Column, columnName: string) {
  return column.allColumnMap[columnName].hidden;
}
