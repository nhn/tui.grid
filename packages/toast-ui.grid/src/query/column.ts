import { ComplexColumnInfo, ColumnInfo, Column } from '@t/store/column';
import { findProp, includes, mapProp, some, someProp } from '../helper/common';

type MergedComplexColumns = (ComplexColumnInfo | ColumnInfo)[];

export function isParentColumnHeader(complexColumnHeaders: ComplexColumnInfo[], name: string) {
  return !!complexColumnHeaders.length && some((item) => item.name === name, complexColumnHeaders);
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
      complexColumnHeaders.forEach((complexColumnHeader) => {
        if (includes(complexColumnHeader.childNames, column.name)) {
          getColumnHierarchy(complexColumnHeader, complexColumnHeaders, complexColumns);
        }
      });
    }
  }

  return complexColumns;
}

export function getRemovedHiddenChildColumns(hierarchies: MergedComplexColumns[]) {
  return hierarchies.map((columns) => {
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
    columns.map((column) => getColumnHierarchy(column, complexColumnHeaders).reverse())
  );
}

export function convertHierarchyToData(hierarchy: MergedComplexColumns[]) {
  const maxRowCount = getHierarchyMaxRowCount(hierarchy);
  const data: string[][] = [];
  for (let i = 0; i < maxRowCount; i += 1) {
    data.push([]);
  }

  hierarchy.forEach((colunms) => {
    for (let i = 0; i < maxRowCount; i += 1) {
      const colInfo = colunms[i < colunms.length ? i : colunms.length - 1];
      data[i].push(colInfo.header);
    }
  });

  return data;
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
    const complexColumn = findProp('name', name, complexColumns);
    if (complexColumn) {
      complexColumn.childNames.forEach((childName) => {
        const leafChildColumn = someProp('name', childName, columns);
        count += leafChildColumn ? 1 : getChildHeaderCount(columns, complexColumns, childName);
      });
    }
  }

  return count;
}

export function getColumnSide(column: Column, columnName: string) {
  return someProp('name', columnName, column.visibleColumnsBySideWithRowHeader.R) ? 'R' : 'L';
}
