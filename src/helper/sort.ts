import { CellValue, Data, Row, SortedColumn, ViewRow } from '../store/types';
import { isBlank } from './common';

export function compare(valueA: CellValue, valueB: CellValue) {
  const isBlankA = isBlank(valueA);
  const isBlankB = isBlank(valueB);
  let result = 0;

  if (isBlankA && !isBlankB) {
    result = -1;
  } else if (!isBlankA && isBlankB) {
    result = 1;
  } else if (valueA! < valueB!) {
    result = -1;
  } else if (valueA! > valueB!) {
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

function sortRawData(columns: SortedColumn[]) {
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

function sortViewData(columns: SortedColumn[]) {
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

export function getSortedData(data: Data) {
  const rawData = [...data.rawData];
  const viewData = [...data.viewData];
  const options: SortedColumn[] = [...data.sortOptions.columns];

  if (
    data.sortOptions.columns.length !== 1 ||
    data.sortOptions.columns[0].columnName !== 'sortKey'
  ) {
    // Columns that are not sorted by sortOptions must be sorted by sortKey
    options.push({ columnName: 'sortKey', ascending: true });
  }

  rawData.sort(sortRawData(options));
  viewData.sort(sortViewData(options));

  return { rawData, viewData };
}
