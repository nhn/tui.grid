import { findIndex, findProp, findPropIndex } from '../helper/common';
import { isParentColumHeader } from '../helper/column';
import { ColumnInfo, ComplexColumnInfo } from '../store/types';

function sortBasedVisibleColumns(visibleColumns: ColumnInfo[], childNames: string[]) {
  const result: string[] = [];

  visibleColumns.forEach((column) => {
    if (findIndex((name) => name === column.name, childNames) !== -1) {
      result.push(column.name);
    }
  });

  return result;
}

export function getLeafChildColumnNames(complexHeaderColumns: ComplexColumnInfo[], name: string) {
  const column = findProp('name', name, complexHeaderColumns)!;
  let result: string[] = [];
  if (!column) {
    return [name];
  }

  column.childNames!.forEach((childName) => {
    if (isParentColumHeader(complexHeaderColumns, childName)) {
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
  name: string,
  rowHeaderCount: number
) {
  const unSortedChildNames = getLeafChildColumnNames(complexHeaderColumns, name);
  const childNames = sortBasedVisibleColumns(visibleColumns, unSortedChildNames);

  const lastIndex = childNames.length - 1;
  const startIndex = findPropIndex('name', childNames[0], visibleColumns) - rowHeaderCount;
  const endIndex = findPropIndex('name', childNames[lastIndex], visibleColumns) - rowHeaderCount;

  return [startIndex, endIndex];
}
