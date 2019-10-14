import { Store, RowKey, Data, Row, Dictionary, Column, SortState } from '../store/types';
import {
  isFunction,
  findPropIndex,
  isNull,
  isUndefined,
  isEmpty,
  uniq,
  mapProp,
  isNumber
} from '../helper/common';
import { getDataManager } from '../instance';
import { isRowSpanEnabled } from './rowSpan';
import { isHiddenColumn } from './column';

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

export function isEditableCell(data: Data, column: Column, rowIndex: number, columnName: string) {
  const { disabled, filteredViewData } = data;
  const { disabled: rowDisabled, editable } = filteredViewData[rowIndex].valueMap[columnName];
  return !isHiddenColumn(column, columnName) && editable && !disabled && !rowDisabled;
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

export function findIndexByRowKey(
  data: Data,
  column: Column,
  id: number,
  rowKey?: RowKey | null,
  filtered = true
) {
  if (isUndefined(rowKey) || isNull(rowKey)) {
    return -1;
  }

  const { filteredRawData, rawData, sortState } = data;
  const targetData = filtered ? filteredRawData : rawData;
  const dataManager = getDataManager(id);
  const hasAppendedData = dataManager ? dataManager.isModifiedByType('CREATE') : false;

  if (!isRowSpanEnabled(sortState) || column.keyColumnName || hasAppendedData) {
    return findPropIndex('rowKey', rowKey, targetData);
  }

  let start = 0;
  let end = targetData.length - 1;

  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const { rowKey: comparedRowKey } = targetData[mid];

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

export function getUniqColumnData(targetData: Row[], columnName: string) {
  return uniq(mapProp(columnName, targetData));
}

export function isSortable(sortState: SortState, column: Column, columnName: string) {
  if (columnName === 'sortKey') {
    return true;
  }
  const { sortable, hidden } = column.allColumnMap[columnName];
  return sortState.useClient && !hidden && sortable;
}

export function isInitialSortState({ columns }: SortState) {
  return columns.length === 1 && columns[0].columnName === 'sortKey';
}

export function getRowHeight(row: Row, defaultRowHeight: number) {
  const { height, tree } = row._attributes;
  const rowHeight = tree && tree.hidden ? 0 : height;

  return isNumber(rowHeight) ? rowHeight : defaultRowHeight;
}

export function getLoadingState(rawData: Row[]) {
  return rawData.length ? 'DONE' : 'EMPTY';
}
