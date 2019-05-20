import { CellValue, Data } from '../store/types';

function isEmpty(value: CellValue) {
  return typeof value !== 'number' && !value;
}

export function comparator(valueA: CellValue, valueB: CellValue, ascending: boolean) {
  const isEmptyA = isEmpty(valueA);
  const isEmptyB = isEmpty(valueB);
  let result = 0;

  if (isEmptyA && !isEmptyB) {
    result = -1;
  } else if (!isEmptyA && isEmptyB) {
    result = 1;
  } else if (valueA! < valueB!) {
    result = -1;
  } else if (valueA! > valueB!) {
    result = 1;
  }

  return !ascending ? -result : result;
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
