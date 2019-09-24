import { Data, Store } from '../store/types';
import { arrayEqual, findPropIndex } from '../helper/common';
import { notify } from '../helper/observable';
import { getSortedData, isInitialSortState } from '../helper/sort';
import { getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';
import { createObservableData } from './data';

type SortingType = 'asc' | 'desc';

export function changeSortState(
  { data, column }: Store,
  columnName: string,
  ascending: boolean,
  withCtrl: boolean,
  cancelable: boolean = true
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
  withCtrl: boolean = false,
  cancelable: boolean = true
) {
  const { data, column } = store;
  const { sortState } = data;

  if (!sortState.useClient || !column.allColumnMap[columnName].sortable) {
    return;
  }

  changeSortState(store, columnName, ascending, withCtrl, cancelable);
  sortData(store);
}

export function unsort(store: Store, columnName: string = 'sortKey') {
  const { data } = store;

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
}

export function initSortState(data: Data) {
  data.sortState.columns = [{ columnName: 'sortKey', ascending: true }];
  notify(data, 'sortState');
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
    data.sortState.columns = isInitialSortState(columns)
      ? [sortedColumn]
      : [...columns, sortedColumn];
  } else {
    toggleSortAscending(data, columnName, ascending, sortingType, cancelable);
  }
  notifySortState(data);
}

function sortData(store: Store) {
  // makes all data observable to sort the data properly;
  createObservableData(store, true);
  const { data, id } = store;
  const { rawData, viewData } = getSortedData(data);
  if (!arrayEqual(rawData, data.rawData)) {
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
