import { ActiveColumnAddress, FilterState, Store } from '../store/types';
import { notify } from '../helper/observable';
import { findProp, findPropIndex, mapProp, uniq, isNull } from '../helper/common';
import { composeConditionFn, getFilterConditionFn } from '../helper/filter';
import { FilterOpt, OperatorType, FilterOptionType } from '../types';
import { getRowHeight } from '../store/rowCoords';
import { getFilterOptions } from '../store/column';
import { setScrollTop } from './viewport';
import { initSelection } from './selection';
import { initFocus } from './focus';
import { getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';

export function setActiveFilterOperator(store: Store, operator: OperatorType) {
  const { column, filterLayerState } = store;
  const activeFilterState = filterLayerState.activeFilterState!;
  const columnInfo = column.allColumnMap[activeFilterState.columnName];

  activeFilterState.operator = operator;

  if (!columnInfo.filter!.showApplyBtn) {
    columnInfo.filter!.operator = operator;
    applyActiveFilterState(store);
  }
}

export function toggleSelectAllCheckbox(store: Store, checked: boolean) {
  const { data, column, filterLayerState } = store;
  const { rawData } = data;
  const { activeFilterState } = filterLayerState;
  const { columnName } = activeFilterState!;

  const columnInfo = column.allColumnMap[columnName];

  if (checked) {
    const columnData = uniq(mapProp(columnName, rawData));
    activeFilterState!.state = columnData.map(value => ({ code: 'eq', value })) as FilterState[];
  } else {
    activeFilterState!.state = [];
    unfilter(store, columnName);
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
    const index = findPropIndex('value', value, activeFilterState!.state!);
    activeFilterState!.state!.splice(index, 1);
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
  if (address) {
    const { type, operator } = column.allColumnMap[address.name].filter!;
    let initialState: FilterState[] = [];

    if (filters) {
      const prevFilter = findProp('columnName', address.name, filters);
      if (prevFilter) {
        initialState = prevFilter.state;
      }
    }

    if (type === 'select' && !initialState.length) {
      const columnData = uniq(mapProp(address.name, filteredRawData));
      initialState = columnData.map(value => ({ code: 'eq', value })) as FilterState[];
    }

    filterLayerState.activeFilterState = {
      columnName: address.name,
      type,
      operator,
      state: initialState
    };
  } else {
    resetActiveColumnAddress(store);
  }
}

function resetActiveColumnAddress(store: Store) {
  const { data, filterLayerState } = store;
  const { rawData } = data;
  const { activeFilterState } = filterLayerState;

  if (isNull(activeFilterState)) {
    return;
  }

  const { type, state, columnName } = activeFilterState;
  if (type !== 'select' && !state.length) {
    unfilter(store, columnName);
  } else if (type === 'select') {
    const columnData = uniq(mapProp(columnName, rawData));
    if (columnData.length === state.length) {
      unfilter(store, columnName);
    }
  }
}

export function applyActiveFilterState(store: Store) {
  const { filterLayerState } = store;
  const columnName = filterLayerState.activeColumnAddress!.name;
  const { state, type, operator } = filterLayerState.activeFilterState!;
  const validState = state.filter(item => String(item.value).length);
  filterLayerState.activeFilterState!.state = validState;

  const fns = validState.map(st =>
    getFilterConditionFn(st.code!, st.value, type as FilterOptionType)
  ) as Function[];

  filter(store, columnName, composeConditionFn(fns, operator), state);
}

export function clearActiveFilterState(store: Store) {
  const { filterLayerState } = store;
  const activeFilterState = filterLayerState.activeFilterState!;
  activeFilterState.state = [];
  unfilter(store, activeFilterState.columnName);
}

export function setActiveFilterState(store: Store, state: FilterState, filterIndex: number) {
  const { column, filterLayerState } = store;
  const columnName = filterLayerState.activeColumnAddress!.name;
  const columnInfo = column.allColumnMap[columnName];

  filterLayerState.activeFilterState!.state[filterIndex] = state as FilterState;

  if (!columnInfo.filter!.showApplyBtn) {
    // If first filter has no value, turn off the filtering.
    if (filterIndex === 0 && !String(state.value).length) {
      unfilter(store, columnName);
    } else {
      applyActiveFilterState(store);
    }
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
  const { data, column, id } = store;
  const columnFilterInfo = column.allColumnMap[columnName].filter;
  if (!columnFilterInfo) {
    return;
  }

  const filters = data.filters || [];
  const { type } = columnFilterInfo;
  const filterOption = findProp('columnName', columnName, filters);
  if (filterOption) {
    filterOption.conditionFn = conditionFn;
    filterOption.state = state;
  } else {
    data.filters = filters.concat({ columnName, type, conditionFn, state });
  }

  notify(data, 'filters');

  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({ filterState: data.filters });

  /**
   * Occurs when filtering
   * @event Grid#filter
   * @property {Grid} instance - Current grid instance
   * @property {Object} filterState - filterState
   */
  eventBus.trigger('filter', gridEvent);
  initLayerAndScrollAfterFiltering(store);
}

export function unfilter(store: Store, columnName: string) {
  const { data } = store;
  const { filters } = data;
  if (filters) {
    const filterIndex = findPropIndex('columnName', columnName, filters);
    if (filterIndex >= 0) {
      data.filters!.splice(filterIndex, 1);

      if (data.filters!.length === 0) {
        data.filters = null;
      }
    }
    notify(data, 'filters');
    initLayerAndScrollAfterFiltering(store);
  }
}

function initLayerAndScrollAfterFiltering(store: Store) {
  const { rowCoords, data, dimension } = store;

  rowCoords.heights = data.filteredRawData.map(row => getRowHeight(row, dimension.rowHeight));

  setScrollTop(store, 0);
  initSelection(store);
  initFocus(store);
}

export function setFilter(
  store: Store,
  columnName: string,
  filterOpt: FilterOptionType | FilterOpt
) {
  const { column } = store;
  const filterOptions = getFilterOptions(filterOpt);
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
