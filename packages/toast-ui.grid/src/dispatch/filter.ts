import { ActiveColumnAddress, FilterState, Store } from '../store/types';
import { notify } from '../helper/observable';
import { findProp, findPropIndex } from '../helper/common';
import { composeConditionFn, getFilterConditionFn } from '../helper/filter';
import { getUniqColumnData } from '../query/data';
import { FilterOpt, OperatorType, FilterOptionType } from '../types';
import { createColumnFilterOption } from '../store/column';
import { setScrollTop } from './viewport';
import { initSelection } from './selection';
import { initFocus } from './focus';
import { getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';
import { isHiddenColumn, isComplexHeader } from '../query/column';
import { updateRowNumber, setCheckedAllRows, updateHeights, updatePageOptions } from './data';
import { updateAllSummaryValues } from './summary';

function initLayerAndScrollAfterFiltering(store: Store) {
  const { data } = store;

  initSelection(store);
  initFocus(store);
  updatePageOptions(store, { totalCount: data.filteredRawData.length, page: 1 });
  updateHeights(store);
  setScrollTop(store, 0);
  updateRowNumber(store, 0);
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
    activeFilterState!.state = columnData.map(value => ({ code: 'eq', value })) as FilterState[];
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
    initialState = columnData.map(value => ({ code: 'eq', value })) as FilterState[];
  }

  filterLayerState.activeFilterState = {
    columnName,
    type,
    operator,
    state: initialState
  };
}

export function applyActiveFilterState(store: Store) {
  const { filterLayerState, data, column } = store;
  const columnName = filterLayerState.activeColumnAddress!.name;
  const { state, type, operator } = filterLayerState.activeFilterState!;
  const validState = state.filter(item => String(item.value).length);

  if (type !== 'select' && !validState.length) {
    unfilter(store, columnName);
    return;
  }

  filterLayerState.activeFilterState!.state = validState;

  if (type === 'select') {
    const columnData = getUniqColumnData(data.rawData, column, columnName);
    if (columnData.length === state.length) {
      unfilter(store, columnName);
      return;
    }
  }

  const fns = validState.map(({ code, value }) => getFilterConditionFn(code!, value, type));

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
  const { data, column, id } = store;
  const columnFilterInfo = column.allColumnMap[columnName].filter;

  if (
    isComplexHeader(column, columnName) ||
    !columnFilterInfo ||
    isHiddenColumn(column, columnName)
  ) {
    return;
  }

  const filters = data.filters || [];
  const { type } = columnFilterInfo;
  const filterIndex = findPropIndex('columnName', columnName, filters);

  updatePageOptions(store, { page: 1 });

  if (filterIndex >= 0) {
    const columnFilter = filters[filterIndex];
    filters.splice(filterIndex, 1, { ...columnFilter, conditionFn, state });
  } else {
    data.filters = filters.concat({ columnName, type, conditionFn, state });
  }

  const eventBus = getEventBus(id);
  const gridEvent = new GridEvent({ filterState: data.filters });

  /**
   * Occurs when filtering
   * @event Grid#filter
   * @property {Grid} instance - Current grid instance
   * @property {Object} filterState - filterState
   */
  eventBus.trigger('filter', gridEvent);
  initLayerAndScrollAfterFiltering(store);
  updateAllSummaryValues(store);
}

export function unfilter(store: Store, columnName: string) {
  const { data, column } = store;
  const { filters } = data;

  if (isComplexHeader(column, columnName) || isHiddenColumn(column, columnName)) {
    return;
  }

  if (filters) {
    const filterIndex = findPropIndex('columnName', columnName, filters);
    if (filterIndex >= 0) {
      if (filters.length === 1) {
        data.filters = null;
      } else {
        filters.splice(filterIndex, 1);
      }
    }
    initLayerAndScrollAfterFiltering(store);
    updateAllSummaryValues(store);
  }
}

export function setFilter(
  store: Store,
  columnName: string,
  filterOpt: FilterOptionType | FilterOpt
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
