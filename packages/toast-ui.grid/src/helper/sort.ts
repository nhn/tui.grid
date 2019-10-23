import { CellValue, Row, SortedColumn, ViewRow } from '../store/types';
import { isBlank, convertToNumber } from './common';

export function compare(valueA: CellValue, valueB: CellValue) {
  const isBlankA = isBlank(valueA);
  const isBlankB = isBlank(valueB);
  const numberA = convertToNumber(valueA);
  const numberB = convertToNumber(valueB);

  let result = 0;

  if (isBlankA && !isBlankB) {
    result = -1;
  } else if (!isBlankA && isBlankB) {
    result = 1;
  } else if (numberA < numberB) {
    result = -1;
  } else if (numberA > numberB) {
    result = 1;
  }

  return result;
}

function getComparators(columns: SortedColumn[]) {
  const comparators: { name: string; comparator: Function }[] = [];

  columns.forEach(column => {
    const { columnName, ascending } = column;

    comparators.push({
      name: columnName,
      comparator: ascending
        ? compare
        : (valueA: CellValue, valueB: CellValue) => -compare(valueA, valueB)
    });
  });

  return comparators;
}

export function sortRawData(columns: SortedColumn[]) {
  const comparators = getComparators(columns);

  return (rowA: Row, rowB: Row) => {
    for (const { name: columnName, comparator } of comparators) {
      let result = 0;

      result = comparator(rowA[columnName], rowB[columnName]);
      if (result) {
        return result;
      }
    }

    return 0;
  };
}

export function sortViewData(columns: SortedColumn[]) {
  const comparators = getComparators(columns);

  return (rowA: ViewRow, rowB: ViewRow) => {
    for (const { name: columnName, comparator } of comparators) {
      let result = 0;

      const valueA = columnName === 'sortKey' ? rowA.sortKey : rowA.valueMap[columnName].value;
      const valueB = columnName === 'sortKey' ? rowB.sortKey : rowB.valueMap[columnName].value;

      result = comparator(valueA, valueB);
      if (result) {
        return result;
      }
    }
    return 0;
  };
}
