import { findProp, findPropIndex, includes } from '../helper/common';
import { isParentColumnHeader } from '../helper/column';
import { ColumnInfo, ComplexColumnInfo } from '../store/types';

function sortByVisibleColumns(visibleColumns: ColumnInfo[], childNames: string[]) {
  const result: string[] = [];

  visibleColumns.forEach((column) => {
    if (includes(childNames, column.name)) {
      result.push(column.name);
    }
  });

  return result;
}

export function getLeafChildColumnNames(complexHeaderColumns: ComplexColumnInfo[], name: string) {
  const column = findProp('name', name, complexHeaderColumns);
  if (!column) {
    return [name];
  }

  let result: string[] = [];
  column.childNames!.forEach((childName) => {
    if (isParentColumnHeader(complexHeaderColumns, childName)) {
      result = [...result, ...getLeafChildColumnNames(complexHeaderColumns, childName)];
    } else {
      result = [...result, childName];
    }
  });

  return result;
}

export function getChildColumnRange(
  visibleColumns: ColumnInfo[],
  complexHeaderColumns: ComplexColumnInfo[],
  name: string
) {
  const unsortedChildNames = getLeafChildColumnNames(complexHeaderColumns, name);
  const childNames = sortByVisibleColumns(visibleColumns, unsortedChildNames);

  const startIndex = findPropIndex('name', childNames[0], visibleColumns);
  const endIndex = findPropIndex('name', childNames[childNames.length - 1], visibleColumns);

  return [startIndex, endIndex];
}
