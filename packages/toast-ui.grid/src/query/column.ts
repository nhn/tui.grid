import { ComplexColumnInfo, Column } from '../store/types';
import { includes, some } from '../helper/common';

export function isParentColumnHeader(complexColumnHeaders: ComplexColumnInfo[], name: string) {
  return !!complexColumnHeaders.length && some(item => item.name === name, complexColumnHeaders);
}

export function isHiddenColumn(column: Column, columnName: string) {
  return column.allColumnMap[columnName].hidden;
}

export function isComplexHeader(column: Column, columnName: string) {
  const { complexColumnHeaders } = column;

  for (let idx = 0; idx < complexColumnHeaders.length; idx += 1) {
    const { name, hideChildHeaders, childNames } = complexColumnHeaders[idx];
    if (name === columnName || (hideChildHeaders && includes(childNames!, columnName))) {
      return true;
    }
  }

  return false;
}
