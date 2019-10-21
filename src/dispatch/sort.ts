import { Data, Store, SortingType, SortedColumn } from '../store/types';
import { arrayEqual, findPropIndex } from '../helper/common';
import { notify } from '../helper/observable';
import { sortRawData, sortViewData } from '../helper/sort';
import { getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';
import { createObservableData, updateRowNumber, setCheckedAllRows } from './data';
import { isSortable, isInitialSortState } from '../query/data';

function sortData(store: Store) {
  // makes all data observable to sort the data properly;
  createObservableData(store, true);
  const { data, id } = store;
  const {
    sortState: { columns },
    rawData: orgRawData,
    viewData: orgViewData
  } = data;
  const rawData = [...orgRawData];
  const viewData = [...orgViewData];
  const options: SortedColumn[] = [...columns];

  if (columns.length !== 1 || columns[0].columnName !== 'sortKey') {
    // Columns that are not sorted by sortState must be sorted by sortKey
    options.push({ columnName: 'sortKey', ascending: true });
  }

  rawData.sort(sortRawData(options));
  viewData.sort(sortViewData(options));

  if (!arrayEqual(rawData, orgRawData)) {
    data.rawData = rawData;
    data.viewData = viewData;
  }

  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({ sortState: data.sortState });

  /**
   * Occurs when sorting.
   * @event Grid#sort
   * @property {number} sortState - sort state
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('sort', gridEvent);
}

function notifySortState(data: Data) {
  if (!data.sortState.columns.length) {
    initSortState(data);
    return;
  }
  notify(data, 'sortState');
}

function toggleSortAscending(
  data: Data,
  columnName: string,
  ascending: boolean,
  sortingType: SortingType,
  cancelable: boolean
) {
  const { sortState } = data;
  const index = findPropIndex('columnName', columnName, sortState.columns);
  const defaultAscending = sortingType === 'asc';

  if (defaultAscending === ascending && cancelable) {
    data.sortState.columns.splice(index, 1);
  } else {
    data.sortState.columns[index].ascending = ascending;
  }
}

function changeSingleSortState(
  data: Data,
  columnName: string,
  ascending: boolean,
  sortingType: SortingType,
  cancelable: boolean
) {
  const { sortState } = data;
  const { columns } = sortState;
  const sortedColumn = { columnName, ascending };

  if (columns.length === 1 && columns[0].columnName === columnName) {
    toggleSortAscending(data, columnName, ascending, sortingType, cancelable);
  } else {
    data.sortState.columns = [sortedColumn];
  }
  notifySortState(data);
}

function changeMultiSortState(
  data: Data,
  columnName: string,
  ascending: boolean,
  sortingType: SortingType,
  cancelable: boolean
) {
  const sortedColumn = { columnName, ascending };
  const { sortState } = data;
  const { columns } = sortState;
  const index = findPropIndex('columnName', columnName, columns);

  if (index === -1) {
    data.sortState.columns = isInitialSortState(sortState)
      ? [sortedColumn]
      : [...columns, sortedColumn];
  } else {
    toggleSortAscending(data, columnName, ascending, sortingType, cancelable);
  }
  notifySortState(data);
}

export function changeSortState(
  { data, column }: Store,
  columnName: string,
  ascending: boolean,
  withCtrl: boolean,
  cancelable = true
) {
  if (columnName === 'sortKey') {
    initSortState(data);
  } else {
    const { sortingType } = column.allColumnMap[columnName];

    if (withCtrl) {
      changeMultiSortState(data, columnName, ascending, sortingType!, cancelable);
    } else {
      changeSingleSortState(data, columnName, ascending, sortingType!, cancelable);
    }
  }
}

export function sort(
  store: Store,
  columnName: string,
  ascending: boolean,
  withCtrl = false,
  cancelable = true
) {
  const { data, column } = store;
  const { sortState } = data;

  if (!isSortable(sortState, column, columnName)) {
    return;
  }

  changeSortState(store, columnName, ascending, withCtrl, cancelable);
  sortData(store);
  updateRowNumber(store, 0);
  setCheckedAllRows(store);
}

export function unsort(store: Store, columnName = 'sortKey') {
  const { data, column } = store;
  const { sortState } = data;

  if (!isSortable(sortState, column, columnName)) {
    return;
  }

  if (columnName === 'sortKey') {
    initSortState(data);
  } else {
    const index = findPropIndex('columnName', columnName, data.sortState.columns);

    if (index !== -1) {
      data.sortState.columns.splice(index, 1);
      notifySortState(data);
    }
  }

  sortData(store);
  updateRowNumber(store, 0);
  setCheckedAllRows(store);
}

export function initSortState(data: Data) {
  data.sortState.columns = [{ columnName: 'sortKey', ascending: true }];
  notify(data, 'sortState');
}
