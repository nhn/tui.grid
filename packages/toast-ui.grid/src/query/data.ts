import { OptRow, Dictionary } from '@t/options';
import { Store } from '@t/store';
import { Data, Row, RowKey, SortState, RemoveTargetRows, CellValue } from '@t/store/data';
import { Column } from '@t/store/column';
import {
  isFunction,
  findPropIndex,
  isNull,
  isUndefined,
  uniq,
  mapProp,
  isNumber,
  removeArrayItem,
  uniqByProp,
  isEmpty,
  isNil,
  omit,
} from '../helper/common';
import { getDataManager } from '../instance';
import { isHiddenColumn } from './column';
import { createRawRow, generateDataCreationKey } from '../store/data';
import { getFormattedValue as formattedValue } from '../store/helper/data';
import { makeObservable } from '../dispatch/data';
import { replaceColumnUniqueInfoMap } from '../store/helper/validation';
import { getOriginObject, Observable } from '../helper/observable';

export function getCellAddressByIndex(
  { data, column }: Store,
  rowIndex: number,
  columnIndex: number
) {
  return {
    rowKey: data.filteredViewData[rowIndex].rowKey,
    columnName: column.visibleColumns[columnIndex].name,
  };
}

export function isEditableCell(store: Store, rowIndex: number, columnName: string) {
  const { data, column } = store;
  const { filteredIndex, filteredViewData } = data;

  if (filteredIndex && isNil(filteredIndex[rowIndex])) {
    return false;
  }

  // get index based on whole data(not filtered data)
  const index = filteredIndex ? filteredIndex[rowIndex] : rowIndex;
  makeObservable({ store, rowIndex: index, silent: true });

  const { disabled, editable } = filteredViewData[rowIndex].valueMap[columnName];

  return !isHiddenColumn(column, columnName) && editable && !disabled;
}

export function getCheckedRowInfoList({ data }: Store) {
  const targetRows: RemoveTargetRows = {
    rowIndices: [],
    rows: [],
    nextRows: [],
  };
  data.rawData.reduce((acc, row, index) => {
    if (row._attributes.checked) {
      acc.rowIndices.push(index);
      acc.rows.push(row);
      acc.nextRows.push(data.rawData[index + 1]);
    }
    return acc;
  }, targetRows);

  return targetRows;
}

export function getRemoveRowInfoList({ data }: Store, rowKeys: RowKey[]) {
  const targetRows: RemoveTargetRows = {
    rowIndices: [],
    rows: [],
    nextRows: [],
  };
  data.rawData.reduce((acc, row, index) => {
    const rowKeyIndex = rowKeys.indexOf(row.rowKey);
    if (rowKeyIndex !== -1) {
      acc.rowIndices.push(index);
      acc.rows.push(row);
      acc.nextRows.push(data.rawData[index + 1]);
      rowKeys.splice(rowKeyIndex, 1);
    }
    return acc;
  }, targetRows);

  return targetRows;
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

  Object.keys(conditions).forEach((key) => {
    result = result.filter((row) => row[key] === conditions[key]);
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
  if (isNil(rowKey)) {
    return -1;
  }

  const { filteredRawData, rawData } = data;
  const targetData = filtered ? filteredRawData : rawData;
  const dataManager = getDataManager(id);
  const modified = dataManager ? dataManager.isMixedOrder() : false;

  if (isSorted(data) || column.keyColumnName || modified) {
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
  rowKey?: RowKey | null,
  filtered = true
): Row | undefined {
  const targetData = filtered ? data.filteredRawData : data.rawData;
  return targetData[findIndexByRowKey(data, column, id, rowKey, filtered)];
}

export function getUniqColumnData(targetData: Row[], column: Column, columnName: string) {
  const columnInfo = column.allColumnMap[columnName];
  const uniqColumnData = uniqByProp(
    columnName,
    targetData.map((data) => ({
      ...data,
      [columnName]: isNil(data[columnName]) ? '' : data[columnName],
    }))
  );

  return uniqColumnData.map((row) => {
    const value = row[columnName];
    const formatterProps = {
      row,
      value,
      column: columnInfo,
    };
    const relationListItems = row._relationListItemMap[columnName];

    return formattedValue(formatterProps, columnInfo.formatter, value, relationListItems);
  });
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

export function getAddedClassName(className: string, prevClassNames?: string[]) {
  const classNames = className.split(' ');
  const columnClassNames = prevClassNames ? prevClassNames : [];

  return uniq([...classNames, ...columnClassNames]);
}

export function getRemovedClassName(className: string, prevClassNames: string[]) {
  const classNames = className.split(' ');
  const removedClassNames = prevClassNames;

  classNames.forEach((clsName) => {
    removeArrayItem(clsName, removedClassNames);
  });

  return removedClassNames;
}

export function getCreatedRowInfo(store: Store, rowIndex: number, row: OptRow, rowKey?: RowKey) {
  generateDataCreationKey();

  const { data, column, id } = store;
  const { rawData } = data;
  const prevRow = rawData[rowIndex - 1];
  const options = { prevRow, lazyObservable: true };

  if (!isUndefined(rowKey)) {
    row.rowKey = rowKey;
  }

  const index = getMaxRowKey(data);
  const rawRow = createRawRow(id, { ...column.emptyRow, ...row }, index, column, options);
  const viewRow = { rowKey: row.rowKey, sortKey: row.sortKey, uniqueKey: row.uniqueKey };

  return { rawRow, viewRow, prevRow };
}

export function getCreatedRowInfos(
  store: Store,
  indexedRows: { rowIndex: number; row: OptRow; orgRow: Row }[]
) {
  const { data, column, id } = store;
  const { rawData } = data;
  const index = getMaxRowKey(data);

  return indexedRows.map(({ rowIndex, row, orgRow }, i) => {
    generateDataCreationKey();

    const prevRow = rawData[rowIndex - 1];
    const options = { prevRow, lazyObservable: true };

    const rawRow = createRawRow(id, { ...column.emptyRow, ...row }, index + i, column, options);
    const viewRow = { rowKey: row.rowKey, sortKey: row.sortKey, uniqueKey: row.uniqueKey };

    return { rowIndex, row: { rawRow, viewRow, prevRow }, orgRow };
  });
}

export function isSorted(data: Data) {
  return data.sortState.columns[0].columnName !== 'sortKey';
}

export function isFiltered(data: Data) {
  return !isNull(data.filters);
}

export function getMaxRowKey(data: Data) {
  return Math.max(-1, ...(mapProp('rowKey', data.rawData) as number[])) + 1;
}

export function isScrollPagination({ pageOptions }: Data, useClient?: boolean) {
  if (isUndefined(useClient)) {
    return pageOptions.type === 'scroll';
  }
  return useClient && pageOptions.type === 'scroll';
}

export function isClientPagination({ pageOptions }: Data) {
  return !isEmpty(pageOptions) && pageOptions.useClient && pageOptions.type === 'pagination';
}

export function getRowIndexPerPage(data: Data, rowIndex: number) {
  return isClientPagination(data) ? rowIndex % data.pageOptions.perPage : rowIndex;
}

export function getRowKeyByIndexWithPageRange(data: Data, rowIndex: number) {
  if (isClientPagination(data)) {
    rowIndex += data.pageRowRange[0];
  }
  return data.filteredRawData[rowIndex].rowKey;
}

export function getFormattedValue(store: Store, rowKey: RowKey, columnName: string) {
  const { data, column, id } = store;
  const rowIndex = findIndexByRowKey(data, column, id, rowKey, false);
  const { viewData } = data;

  if (rowIndex !== -1) {
    makeObservable({ store, rowIndex });
    const viewCell = viewData[rowIndex].valueMap[columnName];
    return viewCell ? viewCell.formattedValue : null;
  }
  return null;
}

export function createChangeInfo(
  store: Store,
  row: Row,
  columnName: string,
  pastingValue: CellValue,
  index: number
) {
  const { id, column } = store;
  const { rowKey } = row;
  const prevChange = { rowKey, columnName, value: row[columnName], nextValue: pastingValue };
  const nextChange = { rowKey, columnName, prevValue: row[columnName], value: pastingValue };
  const changeValue = () => {
    const { value, nextValue } = prevChange;
    replaceColumnUniqueInfoMap(id, column, {
      rowKey,
      columnName,
      prevValue: value,
      value: nextValue,
    });
    nextChange.value = nextValue;
    row[columnName] = nextValue;

    return index;
  };

  return { prevChange, nextChange, changeValue };
}

export function getOmittedInternalProp(row: Row, ...additaional: string[]) {
  return omit(
    getOriginObject(row as Observable<Row>),
    'sortKey',
    'uniqueKey',
    'rowSpanMap',
    '_relationListItemMap',
    '_disabledPriority',
    ...additaional
  ) as Row;
}

function changeRowToOriginRowForTree(row: Row) {
  const originRow = getOmittedInternalProp(row, 'rowKey', '_attributes');

  if (originRow._children) {
    originRow._children = originRow._children.map((childRow) =>
      changeRowToOriginRowForTree(childRow)
    );
  }
  return originRow;
}

export function changeRawDataToOriginDataForTree(rawData: Row[]) {
  return rawData
    .filter((row) => isNil(row._attributes?.tree?.parentRowKey))
    .map((row) => changeRowToOriginRowForTree(row));
}

export function getCheckStateChangedRowkeysInRange(
  store: Store,
  checkState: boolean,
  range: [number, number]
) {
  const { data } = store;
  const { filteredRawData } = data;

  const rowKeys: RowKey[] = [];
  for (let i = range[0]; i < range[1]; i += 1) {
    if (filteredRawData[i]._attributes.checked !== checkState) {
      rowKeys.push(getRowKeyByIndexWithPageRange(data, i));
    }
  }

  return rowKeys;
}
