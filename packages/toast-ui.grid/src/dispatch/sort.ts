import { Store } from '@t/store';
import { Data, ViewRow, Row } from '@t/store/data';
import { SortingType } from '@t/store/column';
import { SortStateResetOption } from '@t/options';
import { findPropIndex, isUndefined } from '../helper/common';
import { isObservable, notify } from '../helper/observable';
import { sortRawData } from '../helper/sort';
import { getEventBus } from '../event/eventBus';
import { updateRowNumber, setCheckedAllRows, makeObservable } from './data';
import { isSortable, isInitialSortState, isScrollPagination, isSorted } from '../query/data';
import { isComplexHeader } from '../query/column';
import { isCancelSort, createSortEvent, EventType, EventParams } from '../query/sort';
import { updateRowSpan } from './rowSpan';

function createSortedViewData(rawData: Row[]) {
  return rawData.map(
    ({ rowKey, sortKey, uniqueKey }) => ({ rowKey, sortKey, uniqueKey } as ViewRow)
  );
}

function sortData(store: Store) {
  const { data, column, viewport } = store;
  const { sortState, rawData, viewData, pageRowRange } = data;
  const { columns } = sortState;
  const sortedColumns = columns.map((sortedColumn) => ({
    ...sortedColumn,
    comparator: column.allColumnMap[sortedColumn.columnName]?.comparator,
  }));

  if (isScrollPagination(data, true)) {
    // should sort the sliced data which is displayed in viewport in case of client infinite scrolling
    const targetRawData = rawData.slice(...pageRowRange);

    targetRawData.sort(sortRawData(sortedColumns));

    const targetViewData = createSortedViewData(targetRawData);

    data.rawData = targetRawData.concat(rawData.slice(pageRowRange[1]));
    data.viewData = targetViewData.concat(viewData.slice(pageRowRange[1]));
  } else {
    rawData.sort(sortRawData(sortedColumns));
    data.viewData = createSortedViewData(rawData);
  }

  const rowKeysInViewport = viewport.rows.map(({ rowKey }) => rowKey);

  data.rawData.forEach((rawRow, index) => {
    const { rowKey } = rawRow;

    if (isObservable(rawRow) || rowKeysInViewport.includes(rowKey)) {
      makeObservable({
        store,
        rowIndex: index,
        silent: false,
        lazyObservable: false,
        forced: true,
      });
    }
  });
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
    const columnIndex = findPropIndex('columnName', columnName, sortState.columns);
    toggleSortAscending(data, columnIndex, ascending, sortingType, cancelable);
  } else {
    data.sortState.columns = [sortedColumn];
  }
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
  const columnIndex = findPropIndex('columnName', columnName, columns);

  if (columnIndex === -1) {
    data.sortState.columns = isInitialSortState(sortState)
      ? [sortedColumn]
      : [...columns, sortedColumn];
  } else {
    toggleSortAscending(data, columnIndex, ascending, sortingType, cancelable);
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
    setSortStateForEmptyState(data);
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

  updateRowSpan(store);
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

  updateRowSpan(store);
}

export function initSortState(data: Data) {
  setInitialSortState(data);
  notify(data, 'sortState');
}

export function emitBeforeSort(
  store: Store,
  cancelSort: boolean,
  eventParams: Omit<EventParams, 'sortState'>
) {
  const { id, data } = store;
  const eventBus = getEventBus(id);
  const eventType = cancelSort ? 'beforeUnsort' : 'beforeSort';
  const gridEvent = createSortEvent(eventType, { ...eventParams, sortState: data.sortState });

  eventBus.trigger(eventType, gridEvent);

  return gridEvent;
}

export function emitAfterSort(store: Store, cancelSort: boolean, columnName: string) {
  const { id, data } = store;
  const eventBus = getEventBus(id);
  // @TODO: `sort` event will be deprecated. This event is replaced with `afterSort` event
  const eventTypes = (cancelSort ? ['afterUnsort'] : ['afterSort', 'sort']) as EventType[];

  eventTypes.forEach((eventType) => {
    const gridEvent = createSortEvent(eventType, { columnName, sortState: data.sortState });
    eventBus.trigger(eventType, gridEvent);
  });
}

export function updateSortKey(data: Data, sortKey: number, appended = true) {
  const incremental = appended ? 1 : -1;
  const { rawData, viewData } = data;

  for (let idx = 0; idx < rawData.length; idx += 1) {
    if (rawData[idx].sortKey >= sortKey) {
      rawData[idx].sortKey += incremental;
      viewData[idx].sortKey += incremental;
    }
  }
  if (appended) {
    rawData[sortKey].sortKey = sortKey;
    viewData[sortKey].sortKey = sortKey;
  }
}

export function resetSortKey(data: Data, start: number) {
  const { rawData, viewData } = data;
  for (let idx = start; idx < rawData.length; idx += 1) {
    rawData[idx].sortKey = idx;
    viewData[idx].sortKey = idx;
  }
}

export function sortByCurrentState(store: Store) {
  const { data } = store;
  if (isSorted(data)) {
    const { columnName, ascending } = data.sortState.columns[0];
    sort(store, columnName, ascending, true, false);
  }
}

export function resetSortState(store: Store, sortState?: SortStateResetOption) {
  const { data, column } = store;
  if (sortState) {
    const { columnName, ascending, multiple } = sortState;
    const { sortingType, sortable } = column.allColumnMap[columnName];

    if (sortable) {
      const cancelable = isUndefined(ascending);
      const nextAscending = cancelable ? sortingType === 'asc' : ascending;

      changeSortState(store, columnName, nextAscending, multiple, cancelable);
      notify(data, 'sortState');
    }
  } else {
    initSortState(data);
  }
}
