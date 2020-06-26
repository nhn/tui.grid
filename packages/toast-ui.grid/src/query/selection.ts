import { ColumnInfo, ComplexColumnInfo } from '@t/store/column';
import { SelectionRange, Range } from '@t/store/selection';
import { PageOptions } from '@t/store/data';
import { findProp, findPropIndex, includes, isNull, isEmpty } from '../helper/common';
import { isParentColumnHeader } from './column';

function sortByVisibleColumns(visibleColumnsWithRowHeader: ColumnInfo[], childNames: string[]) {
  const result: string[] = [];

  visibleColumnsWithRowHeader.forEach((column) => {
    if (includes(childNames, column.name)) {
      result.push(column.name);
    }
  });

  return result;
}

export function getLeafChildColumnNames(complexColumnHeaders: ComplexColumnInfo[], name: string) {
  const column = findProp('name', name, complexColumnHeaders);
  if (!column) {
    return [name];
  }

  let result: string[] = [];
  column.childNames.forEach((childName) => {
    if (isParentColumnHeader(complexColumnHeaders, childName)) {
      result = [...result, ...getLeafChildColumnNames(complexColumnHeaders, childName)];
    } else {
      result = [...result, childName];
    }
  });

  return result;
}

export function getChildColumnRange(
  visibleColumnsWithRowHeader: ColumnInfo[],
  complexColumnHeaders: ComplexColumnInfo[],
  name: string
) {
  const unsortedChildNames = getLeafChildColumnNames(complexColumnHeaders, name);
  const childNames = sortByVisibleColumns(visibleColumnsWithRowHeader, unsortedChildNames);

  const startIndex = findPropIndex('name', childNames[0], visibleColumnsWithRowHeader);
  const endIndex = findPropIndex(
    'name',
    childNames[childNames.length - 1],
    visibleColumnsWithRowHeader
  );

  return [startIndex, endIndex];
}

export function getSortedRange(range: Range): Range {
  return range[0] > range[1] ? [range[1], range[0]] : range;
}

export function isSameInputRange(inp1: SelectionRange | null, inp2: SelectionRange | null) {
  if (isNull(inp1) || isNull(inp2)) {
    return inp1 === inp2;
  }

  return (
    inp1.column[0] === inp2.column[0] &&
    inp1.column[1] === inp2.column[1] &&
    inp1.row[0] === inp2.row[0] &&
    inp1.row[1] === inp2.row[1]
  );
}

export function getSelectionRange(range: SelectionRange, pageOptions: PageOptions): SelectionRange {
  if (!isEmpty(pageOptions)) {
    const { row, column } = range;
    const { perPage, page } = pageOptions;
    const prevPageRowCount = (page! - 1) * perPage!;

    return {
      row: [row[0] - prevPageRowCount, row[1] - prevPageRowCount],
      column,
    };
  }

  return range;
}
