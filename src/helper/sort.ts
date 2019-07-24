import { CellValue, Data, Row, SortOptionColumn, ViewRow } from '../store/types';
import { isBlank } from './common';

export function defaultComparator(valueA: CellValue, valueB: CellValue) {
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

function getCmpFunc(ascending: boolean) {
  if (!ascending) {
    return function(valueA: CellValue, valueB: CellValue) {
      return -defaultComparator(valueA, valueB);
    };
  }
  return defaultComparator;
}

function getComparators(columns: SortOptionColumn[]) {
  const comparators: { name: string; cmp: Function }[] = [];

  columns.forEach((column) => {
    comparators.push({
      name: column.columnName,
      cmp: getCmpFunc(column.ascending)
    });
  });

  return comparators;
}

const sortRawData = function(columns: SortOptionColumn[]) {
  const comparators = getComparators(columns);

  return function(rowA: Row, rowB: Row) {
    let result = 0;
    for (let i = 0, columnsLen = columns.length; i < columnsLen; i += 1) {
      const comparator = comparators[i];
      const columnName = comparator.name;
      result = 0;

      result = comparator.cmp(rowA[columnName], rowB[columnName]);
      if (result !== 0) {
        break;
      }
    }
    return result;
  };
};

const sortViewData = function(columns: SortOptionColumn[]) {
  const comparators = getComparators(columns);

  return function(rowA: ViewRow, rowB: ViewRow) {
    let result = 0;
    for (let i = 0, columnsLen = columns.length; i < columnsLen; i += 1) {
      const comparator = comparators[i];
      const columnName = comparator.name;
      result = 0;

      const valueA = columnName === 'sortKey' ? rowA.sortKey : rowA.valueMap[columnName].value;
      const valueB = columnName === 'sortKey' ? rowB.sortKey : rowB.valueMap[columnName].value;

      result = comparator.cmp(valueA, valueB);
      if (result !== 0) {
        break;
      }
    }
    return result;
  };
};

export function getSortedData(data: Data) {
  const rawData = [...data.rawData];
  const viewData = [...data.viewData];
  const options: SortOptionColumn[] = [...data.sortOptions.columns];

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
