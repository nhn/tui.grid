import { Store, RowKey, Data, Row, Dictionary, Column } from '../store/types';
import { findProp, isFunction, findPropIndex, isNull, isUndefined } from '../helper/common';
import { getDataManager } from '../instance';
import { isRowSpanEnabled } from '../helper/rowSpan';

export function getCellAddressByIndex(
  { data, column }: Store,
  rowIndex: number,
  columnIndex: number
) {
  return {
    rowKey: data.filteredViewData[rowIndex].rowKey,
    columnName: column.visibleColumns[columnIndex].name
  };
}

export function isCellDisabled(data: Data, rowKey: RowKey, columnName: string) {
  const { viewData, disabled } = data;
  const row = findProp('rowKey', rowKey, viewData)!;
  const rowDisabled = row.valueMap[columnName].disabled;

  return disabled || rowDisabled;
}

export function isCellEditable(data: Data, column: Column, rowKey: RowKey, columnName: string) {
  const { viewData } = data;
  const row = findProp('rowKey', rowKey, viewData)!;
  const { hidden } = column.allColumnMap[columnName];

  return !hidden && !isCellDisabled(data, rowKey, columnName) && row.valueMap[columnName].editable;
}

export function getCheckedRows({ data }: Store) {
  return data.rawData.filter(({ _attributes }) => _attributes.checked);
}

export function getConditionalRows(
  { data }: Store,
  conditions: ((row: Row) => boolean) | Dictionary<any>
) {
  const { rawData } = data;

  if (isFunction(conditions)) {
    return rawData.filter(conditions);
  }

  let result: Row[] = rawData;

  Object.keys(conditions).forEach(key => {
    result = result.filter(row => row[key] === conditions[key]);
  });

  return result;
}

export function findIndexByRowKey(data: Data, column: Column, id: number, rowKey?: RowKey | null) {
  if (isUndefined(rowKey) || isNull(rowKey)) {
    return -1;
  }

  const { filteredRawData, sortState } = data;
  const dataManager = getDataManager(id);
  const hasAppendedData = dataManager ? dataManager.isModifiedByType('CREATE') : false;

  if (!isRowSpanEnabled(sortState) || column.keyColumnName || hasAppendedData) {
    return findPropIndex('rowKey', rowKey, filteredRawData);
  }

  let start = 0;
  let end = filteredRawData.length - 1;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const { rowKey: comparedRowKey } = filteredRawData[mid];

    if (rowKey > comparedRowKey) {
      start = mid + 1;
    } else if (rowKey < comparedRowKey) {
      end = mid - 1;
    } else {
      return mid;
    }
  }

  return -1;
}

export function findRowByRowKey(
  data: Data,
  column: Column,
  id: number,
  rowKey?: RowKey | null
): Row | undefined {
  return data.filteredRawData[findIndexByRowKey(data, column, id, rowKey)];
}

export function getFilterStateWithOperator(data: Data, column: Column) {
  const { allColumnMap } = column;
  let { filters } = data;
  if (filters) {
    filters = filters.map(filter => {
      if (filter.state.length > 1) {
        const { columnName } = filter;
        const operator = allColumnMap[columnName].filter!.operator!;
        return {
          ...filter,
          operator
        };
      }

      return filter;
    });
  }

  return filters;
}
