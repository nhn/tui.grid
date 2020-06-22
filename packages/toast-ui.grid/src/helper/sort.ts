import { CellValue, SortedColumn, Row } from '@t/store/data';
import { Column, ColumnInfo } from '@t/store/column';
import { Dictionary } from '@t/options';
import { isBlank, isNumber, convertToNumber } from './common';

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

function getComparators(columns: SortedColumn[], columnMap: Dictionary<ColumnInfo>) {
  const comparators: { name: string; comparator: Function }[] = [];

  columns.forEach(column => {
    const { columnName, ascending } = column;
    const comparator = columnMap[columnName]?.comparator || compare;

    comparators.push({
      name: columnName,
      comparator: ascending
        ? comparator
        : (valueA: CellValue, valueB: CellValue, rowA: Row, rowB: Row) =>
            -comparator(valueA, valueB, rowA, rowB)
    });
  });

  return comparators;
}

export function sortRawData(column: Column, columns: SortedColumn[]) {
  const comparators = getComparators(columns, column.allColumnMap);

  return (rowA: Row, rowB: Row) => {
    for (const { name: columnName, comparator } of comparators) {
      const result = comparator(rowA[columnName], rowB[columnName], rowA, rowB);

      if (result) {
        return result;
      }
    }

    return 0;
  };
}
