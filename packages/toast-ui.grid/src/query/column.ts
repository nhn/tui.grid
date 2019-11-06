import { ComplexColumnInfo, Column } from '../store/types';
import { some, uniq } from '../helper/common';

export function isParentColumnHeader(complexColumnHeaders: ComplexColumnInfo[], name: string) {
  return !!complexColumnHeaders.length && some(item => item.name === name, complexColumnHeaders);
}

export function isHiddenColumn(column: Column, columnName: string) {
  return column.allColumnMap[columnName].hidden;
}

export function addClassName(className: string, prevClassNames?: string[]) {
  const classNames = className.split(' ');
  const columnClassNames = prevClassNames ? prevClassNames : [];

  return uniq([...classNames, ...columnClassNames]);
}

export function removeClassName(className: string, prevClassNames: string[]) {
  const classNames = className.split(' ');
  const removedClassNames = prevClassNames;

  classNames.forEach(clsName => {
    const index = removedClassNames.indexOf(clsName);
    if (index !== -1) {
      removedClassNames.splice(index, 1);
    }
  });

  return removedClassNames;
}
