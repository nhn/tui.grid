import { Store, RowKey, Data, Row, Dictionary, Column } from '../store/types';
import { findProp, isFunction, findPropIndex, isNull, isUndefined } from '../helper/common';
import { getDataManager } from '../instance';

export function getCellAddressByIndex(
  { data, column }: Store,
  rowIndex: number,
  columnIndex: number
) {
  return {
    rowKey: data.viewData[rowIndex].rowKey,
    columnName: column.visibleColumns[columnIndex].name
  };
}

export function isCellDisabled(data: Data, rowKey: RowKey, columnName: string) {
  const { viewData, disabled } = data;
  const row = findProp('rowKey', rowKey, viewData)!;
  const rowDisabled = row.valueMap[columnName].disabled;

  return disabled || rowDisabled;
}

export function isCellEditable(data: Data, rowKey: RowKey, columnName: string) {
  const { viewData } = data;
  const row = findProp('rowKey', rowKey, viewData)!;

  return !isCellDisabled(data, rowKey, columnName) && row.valueMap[columnName].editable;
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
  const { rawData, sortOptions } = data;
  const dataManager = getDataManager(id);

  if (isUndefined(rowKey) || isNull(rowKey)) {
    return -1;
  }

  const hasAppendedData = dataManager ? dataManager.isModifiedByType('CREATE') : false;

  if (sortOptions.columns[0].columnName !== 'sortKey' || column.keyColumnName || hasAppendedData) {
    return findPropIndex('rowKey', rowKey, rawData);
  }

  let start = 0;
  let end = rawData.length - 1;
  let result = -1;

  while (start <= end) {
    const index = Math.floor((start + end) / 2);
    const comparedRowKey = rawData[index].rowKey;
    if (rowKey > comparedRowKey) {
      start = index + 1;
    } else if (rowKey < comparedRowKey) {
      end = index - 1;
    } else {
      result = index;
      break;
    }
  }

  return result;
}

export function findRowByRowKey(data: Data, column: Column, id: number, rowKey: RowKey) {
  return data.rawData[findIndexByRowKey(data, column, id, rowKey)];
}
