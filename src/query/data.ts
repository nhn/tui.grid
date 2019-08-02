import { Store, RowKey, Data, Row, Dictionary, Column } from '../store/types';
import { findProp, isFunction, findPropIndex } from '../helper/common';
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

export function findIndexByRowKey(data: Data, column: Column, id: number, rowKey: RowKey) {
  const { rawData, sortOptions } = data;
  const dataManager = getDataManager(id);

  if (sortOptions.columns[0].columnName !== 'sortKey' || column.keyColumnName) {
    return findPropIndex('rowKey', rowKey, rawData);
  }

  if (dataManager) {
    const foundAppendedRowIndex = dataManager.getAppendedRowIndex(rowKey);

    if (foundAppendedRowIndex !== -1) {
      return foundAppendedRowIndex;
    }
  }

  let start = 0;
  let end = rawData.length - 1;
  let result = -1;

  while (start <= end) {
    const index = Math.floor((start + end) / 2);
    if (rowKey > index) {
      start = index + 1;
    } else if (rowKey < index) {
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
