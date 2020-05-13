import { Store } from '@t/store';
import { SortedColumn, Data, SortState } from '@t/store/data';
import { SortingType } from '@t/store/column';
import { findPropIndex, deepCopy } from '../helper/common';
import { notify } from '../helper/observable';
import { sortRawData, sortViewData } from '../helper/sort';
import { getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';
import { createObservableData, updateRowNumber, setCheckedAllRows } from './data';
import { isSortable, isInitialSortState, isScrollPagination } from '../query/data';
import { isComplexHeader } from '../query/column';
import { GridEventProps } from '@t/event';

type EventType = 'beforeSort' | 'beforeCancelSort' | 'afterSort' | 'afterCancelSort' | 'sort';
interface EventParams {
  columnName: string;
  ascending?: boolean;
  multiple?: boolean;
  sortState: SortState;
}

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
  setSortStateForEmptyState(data);
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

  const cancelSort = isCancelSort(store, columnName, ascending, cancelable);
  const gridEvent = emitBeforeSort(store, cancelSort, { columnName, ascending, multiple });

  if (gridEvent.isStopped()) {
    return;
  }

  changeSortState(store, columnName, ascending, multiple, cancelable);
  applySortedData(store);

  emitAfterSort(store, cancelSort, columnName);
}

export function unsort(store: Store, columnName = 'sortKey') {
  const { data, column } = store;
  const { sortState } = data;

  if (isComplexHeader(column, columnName) || !isSortable(sortState, column, columnName)) {
    return;
  }

  emitBeforeSort(store, true, { columnName, multiple: true });

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
  emitAfterSort(store, true, columnName);
}

export function initSortState(data: Data) {
  setInitialSortState(data);
  notify(data, 'sortState');
}

// eslint-disable-next-line prettier/prettier
export function emitBeforeSort(store: Store, cancelSort: boolean, eventParams: Omit<EventParams, 'sortState'>) {
  const { id, data } = store;
  const eventBus = getEventBus(id);
  const eventType = cancelSort ? 'beforeCancelSort' : 'beforeSort';
  const gridEvent = createGridEvent(eventType, { ...eventParams, sortState: data.sortState });

  eventBus.trigger(eventType, gridEvent);

  return gridEvent;
}

// eslint-disable-next-line prettier/prettier
export function emitAfterSort(store: Store, cancelSort: boolean, columnName: string) {
  const { id, data } = store;
  const eventBus = getEventBus(id);
  // @TODO: `sort` event will be deprecated. This event is replaced with `afterSort` event
  const eventTypes = (cancelSort ? ['afterCancelSort'] : ['afterSort', 'sort']) as EventType[];

  eventTypes.forEach(eventType => {
    const gridEvent = createGridEvent(eventType, { columnName, sortState: data.sortState });
    eventBus.trigger(eventType, gridEvent);
  });
}

export function isCancelSort(
  { data, column }: Store,
  columnName: string,
  ascending: boolean,
  cancelable: boolean
) {
  const index = findPropIndex('columnName', columnName, data.sortState.columns);
  const defaultAscending = column.allColumnMap[columnName].sortingType === 'asc';

  return cancelable && ascending === defaultAscending && index !== -1;
}

export function createGridEvent(eventType: EventType, eventParams: EventParams) {
  const { columnName, ascending, multiple } = eventParams;
  const sortState = deepCopy(eventParams.sortState);
  let props: GridEventProps = {};

  /* eslint-disable no-fallthrough */
  switch (eventType) {
    /**
     * Occurs before sorting.
     * @event Grid#beforeSort
     * @property {Object} sortState - Current sort state
     * @property {string} columnName - Target column name
     * @property {boolean} ascending - The next ascending state of a column.
     * If the event is not stopped this ascending state will be applied to grid
     * @property {boolean} multiple - Whether to use multiple sort
     * @property {Grid} instance - Current grid instance
     */
    case 'beforeSort':
      props = {
        sortState,
        columnName,
        ascending,
        multiple
      };
      break;
    /**
     * Occurs before canceling to sort.
     * @event Grid#beforeCancelSort
     * @property {Object} sortState - Current sort state of the grid
     * @property {string} columnName - Target column name
     * @property {boolean} multiple - Whether to use multiple sort
     * @property {Grid} instance - Current grid instance
     */
    case 'beforeCancelSort':
    /**
     * Occurs after sorting.
     * @event Grid#sort
     * @property {Object} sortState - sort state
     * @property {string} columnName - Target column name
     * @property {boolean} multiple - Whether to use multiple sort
     * @property {Grid} instance - Current grid instance
     */
    case 'sort':
    /**
     * Occurs after sorting.
     * @event Grid#afterSort
     * @property {Object} sortState - sort state
     * @property {string} columnName - Target column name
     * @property {boolean} multiple - Whether to use multiple sort
     * @property {Grid} instance - Current grid instance
     */
    case 'afterSort':
    /**
     * Occurs after calceling to sort.
     * @event Grid#afterCancelSort
     * @property {Object} sortState - sort state
     * @property {string} columnName - Target column name
     * @property {boolean} multiple - Whether to use multiple sort
     * @property {Grid} instance - Current grid instance
     */
    case 'afterCancelSort':
      props = {
        sortState,
        columnName
      };
      break;
    default: // do nothing
  }
  /* eslint-disable no-fallthrough */

  return new GridEvent(props);
}
