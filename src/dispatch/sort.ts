import { Data, SortedColumn, Store } from '../store/types';
import { arrayEqual, findPropIndex } from '../helper/common';
import { notify } from '../helper/observable';
import { getSortedData } from '../helper/sort';
import { getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';

type SortingType = 'asc' | 'desc';

export function changeSortOptions(
  { data, column }: Store,
  columnName: string,
  ascending: boolean,
  withCtrl: boolean,
  cancelable: boolean = true
) {
  if (columnName === 'sortKey') {
    initSortOptions(data);
  } else {
    const { sortingType } = column.allColumnMap[columnName];

    if (withCtrl) {
      changeMultiSortOptions(data, columnName, ascending, sortingType!, cancelable);
    } else {
      changeSingleSortOptions(data, columnName, ascending, sortingType!, cancelable);
    }
  }

  notify(data, 'sortOptions');
}

export function sort(
  store: Store,
  columnName: string,
  ascending: boolean,
  withCtrl: boolean = false,
  cancelable: boolean = true
) {
  const { data, id } = store;
  const { sortOptions } = data;
  if (!sortOptions.useClient) {
    return;
  }

  changeSortOptions(store, columnName, ascending, withCtrl, cancelable);
  sortData(data, id);
}

export function unsort(store: Store, columnName: string = 'sortKey') {
  const { data, id } = store;

  if (columnName === 'sortKey') {
    initSortOptions(data);
  } else {
    const index = findPropIndex('columnName', columnName, data.sortOptions.columns);

    if (index !== -1) {
      data.sortOptions.columns.splice(index, 1);
      if (!data.sortOptions.columns.length) {
        initSortOptions(data);
      }

      notify(data, 'sortOptions');
    }
  }

  sortData(data, id);
}

export function initSortOptions(data: Data) {
  data.sortOptions.columns = [
    {
      columnName: 'sortKey',
      ascending: true
    }
  ];
}

function isInitialSortOptions(columns: SortedColumn[]) {
  return columns.length === 1 && columns[0].columnName === 'sortKey';
}

function toggleSortAscending(
  data: Data,
  columnName: string,
  ascending: boolean,
  sortingType: SortingType,
  cancelable: boolean
) {
  const { sortOptions } = data;
  const index = findPropIndex('columnName', columnName, sortOptions.columns);
  const defaultAscending = sortingType === 'asc';

  if (defaultAscending === ascending && cancelable) {
    data.sortOptions.columns.splice(index, 1);
  } else {
    data.sortOptions.columns[index].ascending = ascending;
  }

  if (!sortOptions.columns.length) {
    initSortOptions(data);
  }
}

function changeSingleSortOptions(
  data: Data,
  columnName: string,
  ascending: boolean,
  sortingType: SortingType,
  cancelable: boolean
) {
  const { sortOptions } = data;
  const { columns } = sortOptions;
  const sortedColumn = {
    columnName,
    ascending
  };

  if (isInitialSortOptions(columns)) {
    data.sortOptions.columns = [sortedColumn];
  } else if (columns.length === 1) {
    const isExist = columns[0].columnName === columnName;
    if (isExist) {
      toggleSortAscending(data, columnName, ascending, sortingType, cancelable);
    } else {
      data.sortOptions.columns = [sortedColumn];
    }
  } else {
    const index = findPropIndex('columnName', columnName, sortOptions.columns);
    if (index === -1) {
      data.sortOptions.columns = [sortedColumn];
    } else {
      const column = { ...sortOptions.columns[index] };
      column.ascending = ascending;
      data.sortOptions.columns = [column];
    }
  }
}

function changeMultiSortOptions(
  data: Data,
  columnName: string,
  ascending: boolean,
  sortingType: SortingType,
  cancelable: boolean
) {
  const sortedColumn = {
    columnName,
    ascending
  };
  const { sortOptions } = data;
  const { columns } = sortOptions;
  const index = findPropIndex('columnName', columnName, columns);
  if (index === -1) {
    if (isInitialSortOptions(columns)) {
      data.sortOptions.columns = [sortedColumn];
    } else {
      data.sortOptions.columns = [...columns, sortedColumn];
    }
  } else {
    toggleSortAscending(data, columnName, ascending, sortingType, cancelable);
  }
}

function sortData(data: Data, id: number) {
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
