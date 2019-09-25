import { ActiveColumnAddress, CellValue, FilterState, Row, Store } from '../store/types';
import { notify } from '../helper/observable';
import { findProp, findPropIndex, pluck, uniq } from '../helper/common';
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
  const { data, column } = store;
  const activeFilterState = data.filterInfo.activeFilterState!;
  const columnInfo = column.allColumnMap[activeFilterState.columnName];

  activeFilterState.operator = operator;
  notify(data, 'filterInfo');

  if (!columnInfo.filter!.showApplyBtn) {
    columnInfo.filter!.operator = operator;
    applyActiveFilterState(store);
  }
}

export function toggleSelectAllCheckbox(store: Store, checked: boolean) {
  const { data, column } = store;
  const { filterInfo, rawData } = data;
  const { activeFilterState } = filterInfo;
  const { columnName } = activeFilterState!;

  const columnInfo = column.allColumnMap[columnName];

  if (checked) {
    const columnData = uniq(pluck(rawData as Row[], columnName));
    activeFilterState!.state = columnData.map(value => ({ code: 'eq', value }));
  } else {
    activeFilterState!.state = [];
    unfilter(store, columnName);
  }

  if (!columnInfo.filter!.showApplyBtn) {
    applyActiveFilterState(store);
  } else {
    notify(data, 'filterInfo');
  }
}

export function setActiveSelectFilterState(store: Store, value: CellValue, checked: boolean) {
  const { data, column } = store;
  const {
    filterInfo: { activeFilterState }
  } = data;
  const columnName = data.filterInfo.activeColumnAddress!.name;
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
    notify(data, 'filterInfo');
  }
}

export function setActiveColumnAddress(store: Store, address: ActiveColumnAddress | null) {
  const { data, column } = store;
  const { filterInfo, filteredRawData, rawData } = data;
  filterInfo.activeColumnAddress = address;
  if (address) {
    const { type, operator } = column.allColumnMap[address.name].filter!;
    let initialState: FilterState[] = [];

    if (filterInfo.filters) {
      const prevFilter = findProp('columnName', address.name, filterInfo.filters);
      if (prevFilter) {
        initialState = prevFilter.state;
      }
    }

    if (type === 'select' && !initialState.length) {
      const columnData = uniq(pluck(filteredRawData as Row[], address.name));
      initialState = columnData.map(value => ({ code: 'eq', value }));
    }

    data.filterInfo.activeFilterState = {
      columnName: address.name,
      type,
      operator,
      state: initialState,
      searchInput: null
    };
  } else {
    const { type, state, columnName } = data.filterInfo.activeFilterState!;
    if (type !== 'select' && !state.length) {
      unfilter(store, columnName);
    } else if (type === 'select') {
      const columnData = uniq(pluck(rawData as Row[], columnName));
      if (columnData.length === state.length) {
        unfilter(store, columnName);
      }
    }
  }

  notify(data, 'filterInfo');
}

export function applyActiveFilterState(store: Store) {
  const { data } = store;
  const columnName = data.filterInfo.activeColumnAddress!.name;
  const { state, type, operator } = data.filterInfo.activeFilterState!;

  const fns = state
    .filter(item => String(item.value).length)
    .map(st => getFilterConditionFn(st.code!, st.value, type as FilterOptionType)) as Function[];

  filter(store, columnName, composeConditionFn(fns, operator), state);
}

export function clearActiveFilterState(store: Store) {
  const { data } = store;
  const activeFilterState = data.filterInfo.activeFilterState!;
  activeFilterState.state = [];
  unfilter(store, activeFilterState.columnName);
}

export function setActiveFilterState(store: Store, state: FilterState, filterIndex: number) {
  const { data, column } = store;
  const columnName = data.filterInfo.activeColumnAddress!.name;
  const columnInfo = column.allColumnMap[columnName];

  data.filterInfo.activeFilterState!.state[filterIndex] = state as FilterState;

  if (!columnInfo.filter!.showApplyBtn) {
    // If first filter has no value, turn off the filtering.
    if (filterIndex === 0 && !String(state.value).length) {
      unfilter(store, columnName);
    } else {
      applyActiveFilterState(store);
    }
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

  const filters = data.filterInfo.filters || [];
  const { type } = columnFilterInfo;
  const filterOption = findProp('columnName', columnName, filters);
  if (filterOption) {
    filterOption.conditionFn = conditionFn;
    filterOption.state = state;
  } else {
    data.filterInfo.filters = filters.concat({ columnName, type, conditionFn, state });
  }

  notify(data, 'filterInfo');

  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({ filterState: data.filterInfo.filters });

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
  const { filterInfo } = data;
  const { filters } = filterInfo;
  if (filters) {
    const filterIndex = findPropIndex('columnName', columnName, filters);
    if (filterIndex >= 0) {
      if (filterInfo.activeFilterState) {
        filterInfo.activeFilterState.state = [];
      }

      filterInfo.filters!.splice(filterIndex, 1);

      if (filterInfo.filters!.length === 0) {
        filterInfo.filters = null;
      }
    }
    notify(data, 'filterInfo');
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
