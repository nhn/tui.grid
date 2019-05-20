import { CellValue, Data } from '../store/types';
import { isBlank } from './common';

export function comparator(valueA: CellValue, valueB: CellValue, ascending: boolean) {
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

  return ascending ? result : -result;
}

export function getSortedData(data: Data, sortKey: string, ascending: boolean) {
  const rawData = [...data.rawData];
  const viewData = [...data.viewData];
  rawData.sort((a, b) => comparator(a[sortKey], b[sortKey], ascending));
  viewData.sort((a, b) => {
    const [valueA, valueB] =
      sortKey === 'rowKey'
        ? [a.rowKey, b.rowKey]
        : [a.valueMap[sortKey].value, b.valueMap[sortKey].value];
    return comparator(valueA, valueB, ascending);
  });

  return { rawData, viewData };
}
