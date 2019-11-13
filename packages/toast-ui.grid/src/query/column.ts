import { ComplexColumnInfo, Column } from '../store/types';
import { includes, some } from '../helper/common';

export function isParentColumnHeader(complexColumnHeaders: ComplexColumnInfo[], name: string) {
  return !!complexColumnHeaders.length && some(item => item.name === name, complexColumnHeaders);
}

export function isHiddenColumn(column: Column, columnName: string) {
  return column.allColumnMap[columnName].hidden;
}

export function isComplexHeader(column: Column, columnName: string) {
  return some(
    ({ name, hideChildHeaders, childNames }) =>
      !!(name === columnName || (hideChildHeaders && includes(childNames, columnName))),
    column.complexColumnHeaders
  );
}
