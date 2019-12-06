import { ComplexColumnInfo, Column, ColumnInfo } from '../store/types';
import { findProp, includes, mapProp, some, someProp } from '../helper/common';

type MergedComplexColumns = (ComplexColumnInfo | ColumnInfo)[];

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

export function getColumnHierarchy(
  column: ColumnInfo | ComplexColumnInfo,
  complexColumnHeaders: ComplexColumnInfo[],
  mergedComplexColumns?: MergedComplexColumns
) {
  const complexColumns: MergedComplexColumns = mergedComplexColumns || [];

  if (column) {
    complexColumns.push(column);

    if (complexColumnHeaders) {
      complexColumnHeaders.forEach(complexColumnHeader => {
        if (includes(complexColumnHeader.childNames, column.name)) {
          getColumnHierarchy(complexColumnHeader, complexColumnHeaders, complexColumns);
        }
      });
    }
  }

  return complexColumns;
}

export function getRemovedHiddenChildColumns(hierarchies: MergedComplexColumns[]) {
  return hierarchies.map(columns => {
    if (columns.length > 1) {
      // The hideChildHeaders option always exists in the second column to last.
      const { hideChildHeaders } = columns[columns.length - 2] as ComplexColumnInfo;
      if (hideChildHeaders) {
        columns.pop();
      }
    }

    return columns;
  });
}

export function getComplexColumnsHierarchy(
  columns: ColumnInfo[],
  complexColumnHeaders: ComplexColumnInfo[]
) {
  return getRemovedHiddenChildColumns(
    columns.map(column => getColumnHierarchy(column, complexColumnHeaders).reverse())
  );
}

export function getHierarchyMaxRowCount(hierarchies: MergedComplexColumns[]) {
  return Math.max(0, ...mapProp('length', hierarchies));
}

export function getChildHeaderCount(
  columns: ColumnInfo[],
  complexColumns: ComplexColumnInfo[],
  name: string
) {
  let count = 0;
  const leafColumn = someProp('name', name, columns);
  if (!leafColumn) {
    const { childNames } = findProp('name', name, complexColumns)!;
    childNames.forEach(childName => {
      const leafChildColumn = someProp('name', childName, columns);
      count += leafChildColumn ? 1 : getChildHeaderCount(columns, complexColumns, childName);
    });
  }

  return count;
}
