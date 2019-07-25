import { Store, RowKey, Data, Row, Dictionary, SortOptionColumn } from '../store/types';
import { arrayEqual, findProp, findPropIndex, isFunction } from '../helper/common';
import { notify } from '../helper/observable';
import { getSortedData } from '../helper/sort';
import { getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';

type SortingType = 'asc' | 'desc';

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

  Object.keys(conditions).forEach((key) => {
    result = result.filter((row) => row[key] === conditions[key]);
  });

  return result;
}

export function initSortOptions(data: Data) {
  data.sortOptions.columns = [
    {
      columnName: 'sortKey',
      ascending: true
    }
  ];

  notify(data, 'sortOptions');
}

function isInitialSortOptions(columns: SortOptionColumn[]) {
  return columns.length === 1 && columns[0].columnName === 'sortKey';
}

function toggleSortAscending(
  data: Data,
  columnName: string,
  ascending: boolean,
  sortingType: SortingType,
  canBeCanceled: boolean
) {
  const { sortOptions } = data;
  const index = findPropIndex('columnName', columnName, sortOptions.columns);
  const defaultAscending = sortingType === 'asc';

  if (defaultAscending === ascending && canBeCanceled) {
    data.sortOptions.columns.splice(index, 1);
  } else {
    data.sortOptions.columns[index].ascending = ascending;
  }

  if (!sortOptions.columns.length) {
    initSortOptions(data);
  }
}

export function singleSort(
  data: Data,
  columnName: string,
  ascending: boolean,
  sortingType: SortingType,
  canBeCanceled: boolean
) {
  const { sortOptions } = data;
  const { columns } = sortOptions;
  const sortOptionColumn = {
    columnName,
    ascending
  };

  if (isInitialSortOptions(columns)) {
    data.sortOptions.columns = [sortOptionColumn];
  } else if (columns.length === 1) {
    const isExist = columns[0].columnName === columnName;
    if (isExist) {
      toggleSortAscending(data, columnName, ascending, sortingType, canBeCanceled);
    } else {
      data.sortOptions.columns = [sortOptionColumn];
    }
  } else {
    const index = findPropIndex('columnName', columnName, sortOptions.columns);
    if (index === -1) {
      data.sortOptions.columns = [sortOptionColumn];
    } else {
      const column = { ...sortOptions.columns[index] };
      column.ascending = ascending;
      data.sortOptions.columns = [column];
    }
  }
}

export function multiSort(
  data: Data,
  columnName: string,
  ascending: boolean,
  sortingType: SortingType,
  canBeCanceled: boolean
) {
  const sortOptionColumn = {
    columnName,
    ascending
  };
  const { sortOptions } = data;
  const { columns } = sortOptions;
  const index = findPropIndex('columnName', columnName, columns);
  if (index === -1) {
    if (isInitialSortOptions(columns)) {
      data.sortOptions.columns = [sortOptionColumn];
    } else {
      data.sortOptions.columns = [...columns, sortOptionColumn];
    }
  } else {
    toggleSortAscending(data, columnName, ascending, sortingType, canBeCanceled);
  }
}

export function sortData(data: Data, id: number) {
  const { rawData, viewData } = getSortedData(data);
  if (!arrayEqual(rawData, data.rawData)) {
    data.rawData = rawData;
    data.viewData = viewData;
  }

  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({ sortOptions: data.sortOptions });

  /**
   * Occurs when sorting.
   * @event Grid#sort
   * @property {number} sortOptions - sort options
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('sort', gridEvent);
}
