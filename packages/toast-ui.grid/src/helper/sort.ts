import { isBlank, isNumber, convertToNumber } from './common';
import { CellValue, SortedColumn, Row } from '@t/store/data';

export function compare(valueA: CellValue, valueB: CellValue) {
  const isBlankA = isBlank(valueA);
  const isBlankB = isBlank(valueB);
  let convertedA = convertToNumber(valueA);
  let convertedB = convertToNumber(valueB);

  if (!isNumber(convertedA) || !isNumber(convertedB)) {
    convertedA = String(valueA);
    convertedB = String(valueB);
  }

  let result = 0;

  if (isBlankA && !isBlankB) {
    result = -1;
  } else if (!isBlankA && isBlankB) {
    result = 1;
  } else if (convertedA < convertedB) {
    result = -1;
  } else if (convertedA > convertedB) {
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
