import {
  OperatorType,
  FilterOptionType,
  FilterState,
  ActiveColumnAddress,
  Filter,
} from '@t/store/filterLayerState';
import { OptFilter, FilterStateResetOption } from '@t/options';
import { Store } from '@t/store';
import { notify } from '../helper/observable';
import { findProp, findPropIndex } from '../helper/common';
import { composeConditionFn, getFilterConditionFn } from '../helper/filter';
import { getUniqColumnData } from '../query/data';
import { createColumnFilterOption } from '../store/column';
import { initScrollPosition } from './viewport';
import { initSelection } from './selection';
import { initFocus } from './focus';
import { getEventBus } from '../event/eventBus';
import { isHiddenColumn, isComplexHeader } from '../query/column';
import { setCheckedAllRows, updateHeights } from './data';
import { updateAllSummaryValues } from './summary';
import { createFilterEvent, EventType, EventParams } from '../query/filter';
import { updatePageOptions } from './pagination';
import { updateRowSpan } from './rowSpan';

function initLayerAndScrollAfterFiltering(store: Store) {
  const { data } = store;

  initScrollPosition(store);
  initSelection(store);
  initFocus(store);
  updatePageOptions(store, { totalCount: data.filteredRawData.length, page: 1 });
  updateHeights(store);
  setCheckedAllRows(store);
}

export function setActiveFilterOperator(store: Store, operator: OperatorType) {
  const { column, filterLayerState } = store;
  const activeFilterState = filterLayerState.activeFilterState!;
  const columnInfo = column.allColumnMap[activeFilterState.columnName];
  const columnFilterOption = columnInfo.filter!;

  activeFilterState.operator = operator;

  if (!columnFilterOption.showApplyBtn) {
    columnFilterOption.operator = operator;
    applyActiveFilterState(store);
  }
}

export function toggleSelectAllCheckbox(store: Store, checked: boolean) {
  const { column, filterLayerState, data } = store;
  const { activeFilterState } = filterLayerState;
  const { columnName } = activeFilterState!;
  const columnInfo = column.allColumnMap[columnName];

  if (checked) {
    const columnData = getUniqColumnData(data.rawData, column, columnName);
    activeFilterState!.state = columnData.map((value) => ({ code: 'eq', value })) as FilterState[];
  } else {
    activeFilterState!.state = [];
  }

  if (!columnInfo.filter!.showApplyBtn) {
    applyActiveFilterState(store);
  }
}

export function setActiveSelectFilterState(store: Store, value: string, checked: boolean) {
  const { column, filterLayerState } = store;
  const { activeFilterState } = filterLayerState;
  const columnName = filterLayerState.activeColumnAddress!.name;
  const columnInfo = column.allColumnMap[columnName];

  if (checked) {
    activeFilterState!.state.push({ value, code: 'eq' });
  } else {
    const index = findPropIndex('value', value, activeFilterState!.state);
    activeFilterState!.state.splice(index, 1);
  }

  if (!columnInfo.filter!.showApplyBtn) {
    applyActiveFilterState(store);
  } else {
    notify(filterLayerState, 'activeFilterState');
  }
}

export function setActiveColumnAddress(store: Store, address: ActiveColumnAddress | null) {
  const { data, column, filterLayerState } = store;
  const { filters, filteredRawData } = data;

  filterLayerState.activeColumnAddress = address;

  if (!address) {
    filterLayerState.activeFilterState = null;
    return;
  }

  const { name: columnName } = address;
  const { type, operator } = column.allColumnMap[columnName].filter!;
  let initialState: FilterState[] = [];

  if (filters) {
    const prevFilter = findProp('columnName', columnName, filters);
    if (prevFilter) {
      initialState = prevFilter.state;
    }
  }

  if (type === 'select' && !initialState.length) {
    const columnData = getUniqColumnData(filteredRawData, column, columnName);
    initialState = columnData.map((value) => ({ code: 'eq', value })) as FilterState[];
  }

  filterLayerState.activeFilterState = {
    columnName,
    type,
    operator,
    state: initialState,
  };
}

export function applyActiveFilterState(store: Store) {
  const { filterLayerState, data, column } = store;
  const columnName = filterLayerState.activeColumnAddress!.name;
  const { state, type, operator } = filterLayerState.activeFilterState!;
  const validState = state.filter((item) => String(item.value).length);

  if (type !== 'select' && !validState.length) {
    unfilter(store, columnName);
    return;
  }

  filterLayerState.activeFilterState!.state = state;

  if (type === 'select') {
    const columnData = getUniqColumnData(data.rawData, column, columnName);
    const updatedState = state.filter(({ value }) => columnData.includes(value));

    filterLayerState.activeFilterState!.state = updatedState;

    if (columnData.length === updatedState.length) {
      unfilter(store, columnName);
      return;
    }
  }

  const fns = state.map(({ code, value }) => getFilterConditionFn(code!, value, type));

  filter(store, columnName, composeConditionFn(fns, operator), state);
}

export function clearActiveFilterState(store: Store) {
  const { filterLayerState } = store;
  const activeFilterState = filterLayerState.activeFilterState!;
  activeFilterState.state = [];
  unfilter(store, activeFilterState.columnName);
  notify(filterLayerState, 'activeFilterState');
}

export function setActiveFilterState(store: Store, state: FilterState, filterIndex: number) {
  const { column, filterLayerState } = store;
  const columnName = filterLayerState.activeColumnAddress!.name;
  const columnInfo = column.allColumnMap[columnName];

  filterLayerState.activeFilterState!.state[filterIndex] = state;

  if (!columnInfo.filter!.showApplyBtn) {
    applyActiveFilterState(store);
  } else {
    notify(filterLayerState, 'activeFilterState');
  }
}

export function filter(
  store: Store,
  columnName: string,
  conditionFn: Function,
  state: FilterState[]
) {
  const { column } = store;
  const columnFilterInfo = column.allColumnMap[columnName].filter;

  if (
    isComplexHeader(column, columnName) ||
    !columnFilterInfo ||
    isHiddenColumn(column, columnName)
  ) {
    return;
  }

  const { type, operator } = columnFilterInfo;
  const nextColumnFilterState = { columnName, type, conditionFn, state, operator };
  const gridEvent = emitBeforeFilter(store, 'beforeFilter', nextColumnFilterState);

  if (gridEvent.isStopped()) {
    return;
  }

  updatePageOptions(store, { page: 1 });
  updateFilters(store, columnName, nextColumnFilterState);
  initLayerAndScrollAfterFiltering(store);
  updateAllSummaryValues(store);
  emitAfterFilter(store, 'afterFilter', columnName);

  updateRowSpan(store);
}

export function updateFilters({ data }: Store, columnName: string, nextColumnFilterState: Filter) {
  const filters = data.filters || [];
  const filterIndex = findPropIndex('columnName', columnName, filters);

  if (filterIndex >= 0) {
    filters.splice(filterIndex, 1, nextColumnFilterState);
  } else {
    data.filters = filters.concat(nextColumnFilterState);
  }
}

export function clearFilter({ data }: Store, columnName: string) {
  const filters = data.filters || [];
  const filterIndex = findPropIndex('columnName', columnName, filters);

  if (filterIndex >= 0) {
    if (filters.length === 1) {
      data.filters = null;
    } else {
      filters.splice(filterIndex, 1);
    }
  }
}

function clearAll(store: Store) {
  const gridEvent = emitBeforeFilter(store, 'beforeUnfilter', { columnName: null });

  if (gridEvent.isStopped()) {
    return;
  }
  initFilter(store);
  initLayerAndScrollAfterFiltering(store);
  updateAllSummaryValues(store);
  emitAfterFilter(store, 'afterUnfilter', null);
}

export function unfilter(store: Store, columnName?: string) {
  const { data, column } = store;
  const { filters } = data;

  if (!columnName) {
    clearAll(store);
    return;
  }

  if (isComplexHeader(column, columnName) || isHiddenColumn(column, columnName)) {
    return;
  }

  if (filters) {
    const gridEvent = emitBeforeFilter(store, 'beforeUnfilter', { columnName });

    if (gridEvent.isStopped()) {
      return;
    }
    clearFilter(store, columnName);
    initLayerAndScrollAfterFiltering(store);
    updateAllSummaryValues(store);
    emitAfterFilter(store, 'afterUnfilter', columnName);
  }

  updateRowSpan(store);
}

export function setFilter(
  store: Store,
  columnName: string,
  filterOpt: FilterOptionType | OptFilter
) {
  const { column } = store;
  const filterOptions = createColumnFilterOption(filterOpt);
  const index = findPropIndex('name', columnName, column.allColumns);

  if (index !== -1) {
    if (column.allColumns[index].filter) {
      unfilter(store, columnName);
    }

    column.allColumns[index].filter = filterOptions;
    notify(column, 'allColumns');
  }
}

export function initFilter(store: Store) {
  const { filterLayerState, data } = store;
  filterLayerState.activeFilterState = null;
  filterLayerState.activeColumnAddress = null;
  data.filters = null;
}

function emitBeforeFilter(store: Store, eventType: EventType, eventParams: EventParams) {
  const eventBus = getEventBus(store.id);
  const gridEvent = createFilterEvent(store, eventType, eventParams);
  eventBus.trigger(eventType, gridEvent);

  return gridEvent;
}

export function emitAfterFilter(store: Store, eventType: EventType, columnName: string | null) {
  const { id } = store;
  const eventBus = getEventBus(id);
  // @TODO: `filter` event will be deprecated. This event is replaced with `afterFilter` event
  const eventTypes = (eventType === 'afterFilter'
    ? ['afterFilter', 'filter']
    : ['afterUnfilter']) as EventType[];

  eventTypes.forEach((type) => {
    const gridEvent = createFilterEvent(store, type, { columnName });
    eventBus.trigger(type, gridEvent);
  });
}

export function resetFilterState(store: Store, filterState?: FilterStateResetOption) {
  if (filterState) {
    const { columnFilterState, columnName } = filterState;
    const columnFilterOption = store.column.allColumnMap[columnName].filter;

    if (columnFilterOption) {
      if (columnFilterState) {
        const nextState = {
          conditionFn: () => true,
          type: columnFilterOption.type,
          state: columnFilterState,
          columnName,
          operator: columnFilterOption.operator,
        };
        updateFilters(store, columnName, nextState);
      } else {
        clearFilter(store, columnName);
      }
    }
  } else {
    initFilter(store);
  }
}
