import { Store } from '@t/store';
import { SortedColumn, Data } from '@t/store/data';
import { SortingType } from '@t/store/column';
import { findPropIndex, deepCopy } from '../helper/common';
import { notify } from '../helper/observable';
import { sortRawData, sortViewData } from '../helper/sort';
import { getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';
import { createObservableData, updateRowNumber, setCheckedAllRows } from './data';
import { isSortable, isInitialSortState, isScrollPagination } from '../query/data';
import { isComplexHeader } from '../query/column';

function sortData(store: Store) {
  // @TODO: find more practical way to make observable
  // makes all data observable to sort the data properly;
  createObservableData(store, true);
  const { data } = store;
  const { sortState, rawData, viewData, pageRowRange } = data;
  const { columns } = sortState;
  const options: SortedColumn[] = [...columns];

  if (columns.length !== 1 || columns[0].columnName !== 'sortKey') {
    // Columns that are not sorted by sortState must be sorted by sortKey
    options.push({ columnName: 'sortKey', ascending: true });
  }

  if (isScrollPagination(data, true)) {
    // should sort the sliced data which is displayed in viewport in case of client infinite scrolling
    const targetRawData = rawData.slice(...pageRowRange);
    const targetViewData = viewData.slice(...pageRowRange);
    targetRawData.sort(sortRawData(options));
    targetViewData.sort(sortViewData(options));

    data.rawData = targetRawData.concat(rawData.slice(pageRowRange[1]));
    data.viewData = targetViewData.concat(viewData.slice(pageRowRange[1]));
  } else {
    rawData.sort(sortRawData(options));
    viewData.sort(sortViewData(options));
  }
}

function setInitialSortState(data: Data) {
  data.sortState.columns = [{ columnName: 'sortKey', ascending: true }];
}

function setSortStateForEmptyState(data: Data) {
  if (!data.sortState.columns.length) {
    setInitialSortState(data);
  }
}

function toggleSortAscending(
  data: Data,
  index: number,
  ascending: boolean,
  sortingType: SortingType,
  cancelable: boolean
) {
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
    const index = findPropIndex('columnName', columnName, sortState.columns);
    toggleSortAscending(data, index, ascending, sortingType, cancelable);
  } else {
    data.sortState.columns = [sortedColumn];
  }
  setSortStateForEmptyState(data);
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
    toggleSortAscending(data, index, ascending, sortingType, cancelable);
  }
}

export function changeSortState(
  { data, column }: Store,
  columnName: string,
  ascending: boolean,
  multiple: boolean,
  cancelable = true
) {
  if (columnName === 'sortKey') {
    setInitialSortState(data);
  } else {
    const { sortingType } = column.allColumnMap[columnName];

    if (multiple) {
      changeMultiSortState(data, columnName, ascending, sortingType!, cancelable);
    } else {
      changeSingleSortState(data, columnName, ascending, sortingType!, cancelable);
    }
  }

  if (!data.sortState.useClient) {
    notify(data, 'sortState');
  }
}

function applySortedData(store: Store) {
  sortData(store);
  notify(store.data, 'sortState');
  updateRowNumber(store, 0);
  setCheckedAllRows(store);
}

export function sort(
  store: Store,
  columnName: string,
  ascending: boolean,
  multiple = false,
  cancelable = true
) {
  const { data, column } = store;
  const { sortState } = data;

  if (isComplexHeader(column, columnName) || !isSortable(sortState, column, columnName)) {
    return;
  }

  const gridEvent = emitBeforeSort(store, columnName, ascending, multiple, cancelable);

  if (gridEvent.isStopped()) {
    return;
  }

  changeSortState(store, columnName, ascending, multiple, cancelable);
  applySortedData(store);

  emitAfterSort(store);
}

export function unsort(store: Store, columnName = 'sortKey') {
  const { data, column } = store;
  const { sortState } = data;

  if (isComplexHeader(column, columnName) || !isSortable(sortState, column, columnName)) {
    return;
  }

  if (columnName === 'sortKey') {
    setInitialSortState(data);
  } else {
    const index = findPropIndex('columnName', columnName, data.sortState.columns);

    if (index !== -1) {
      data.sortState.columns.splice(index, 1);
      setSortStateForEmptyState(data);
    }
  }
  applySortedData(store);
}

export function initSortState(data: Data) {
  setInitialSortState(data);
  notify(data, 'sortState');
}

export function emitBeforeSort(
  store: Store,
  columnName: string,
  ascending: boolean,
  multiple = false,
  cancelable = true
) {
  const { data, column, id } = store;
  const { sortState } = data;
  const eventBus = getEventBus(id);
  const index = findPropIndex('columnName', columnName, sortState.columns);
  const { sortingType } = column.allColumnMap[columnName];
  const defaultAscending = sortingType === 'asc';
  const unsorted = cancelable && ascending === defaultAscending && index !== -1;
  const nextColumnSortState = { columnName, ascending, multiple, unsorted };

  const gridEvent = new GridEvent({
    sortState: deepCopy(sortState),
    nextColumnSortState,
    columnName
  });

  /**
   * Occurs before sorting.
   * @event Grid#beforeSort
   * @property {string} columnName - Target column name
   * @property {Object} sortState - Current sort state of the grid
   * @property {Object} nextColumnSortState - The next sort state of a column.
   * If the event is not stopped this sort state will be applied to grid
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('beforeSort', gridEvent);

  return gridEvent;
}

export function emitAfterSort(store: Store) {
  const eventBus = getEventBus(store.id);
  const getGridEvent = () => new GridEvent({ sortState: deepCopy(store.data.sortState) });

  /**
   * Occurs after sorting. This event will be deprecated. Use the 'afterSort' event
   * @event Grid#sort
   * @property {Object} sortState - sort state
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('sort', getGridEvent());
  /**
   * Occurs after sorting.
   * @event Grid#afterSort
   * @property {Object} sortState - sort state
   * @property {Grid} instance - Current grid instance
   */
  eventBus.trigger('afterSort', getGridEvent());
}
