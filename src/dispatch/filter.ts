import { ActivatedColumnAddress, CellValue, FilterState, Row, Store } from '../store/types';
import { notify } from '../helper/observable';
import { findProp, findPropIndex, pluck, uniq } from '../helper/common';
import { composeConditionFn, getFilterConditionFn } from '../helper/filter';
import { FilterOpt, SingleFilterOptionType } from '../types';
import { getRowHeight } from '../store/rowCoords';
import { getFilterOptions } from '../store/column';
import { setScrollTop } from './viewport';
import { initSelection } from './selection';
import { initFocus } from './focus';
import { getEventBus } from '../event/eventBus';
import GridEvent from '../event/gridEvent';

export function setFilterLayerOperator(store: Store, value: 'AND' | 'OR') {
  const { data, column } = store;
  const filterLayerState = data.filterInfo.filterLayerState!;
  filterLayerState.operator = value;

  const columnInfo = column.allColumnMap[filterLayerState.columnName];

  notify(data, 'filterInfo');

  if (!columnInfo.filter!.showApplyBtn) {
    columnInfo.filter!.operator = value;
    applyFilterLayerState(store);
  }
}

export function updateFilterLayerSearchInput({ data }: Store, value: string) {
  data.filterInfo.filterLayerState!.searchInput = value;
  notify(data, 'filterInfo');
}

export function toggleSelectAllCheckbox(store: Store, checked: boolean) {
  const { data, column } = store;
  const { filterInfo, rawData } = data;
  const { filterLayerState } = filterInfo;
  const { columnName } = filterLayerState!;

  const columnInfo = column.allColumnMap[columnName];

  if (checked) {
    const columnData = uniq(pluck(rawData as Row[], columnName));
    filterLayerState!.state = columnData.map(value => ({ code: 'eq', value }));
    notify(data, 'filterInfo');
  } else {
    filterLayerState!.state = [];
    notify(data, 'filterInfo');
    unfilter(store, columnName);
  }

  if (!columnInfo.filter!.showApplyBtn) {
    applyFilterLayerState(store);
  }
}

export function setSelectFilterLayerState(store: Store, value: CellValue, checked: boolean) {
  const { data, column } = store;
  const {
    filterInfo: { filterLayerState }
  } = data;

  if (checked) {
    filterLayerState!.state.push({ value, code: 'eq' });
  } else {
    const index = findPropIndex('value', value, filterLayerState!.state!);
    filterLayerState!.state!.splice(index, 1);
  }

  notify(data, 'filterInfo');

  const columnName = data.filterInfo.activatedColumnAddress!.name;
  const columnInfo = column.allColumnMap[columnName];

  if (!columnInfo.filter!.showApplyBtn) {
    applyFilterLayerState(store);
  }
}

export function setActivatedColumnAddress(store: Store, address: ActivatedColumnAddress | null) {
  const { data, column } = store;
  const { filterInfo, filteredRawData, rawData } = data;
  filterInfo.activatedColumnAddress = address;
  if (address) {
    const { type, operator } = column.allColumnMap[address.name].filter!;
    let initialState: FilterState[] | null = null;

    if (filterInfo.filters) {
      const prevFilter = findProp('columnName', address.name, filterInfo.filters);
      if (prevFilter) {
        initialState = prevFilter.state;
      }
    }

    if (!initialState) {
      if (type === 'select') {
        const columnData = uniq(pluck(filteredRawData as Row[], address.name));
        initialState = columnData.map(value => ({ code: 'eq', value }));
      } else {
        initialState = [];
      }
    }

    data.filterInfo.filterLayerState = {
      columnName: address.name,
      type,
      operator,
      state: initialState,
      searchInput: null
    };
  } else {
    data.filterInfo.activatedColumnAddress = null;

    const { type, state, columnName } = data.filterInfo.filterLayerState!;
    if (type !== 'select' && state.length === 0) {
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

export function applyFilterLayerState(store: Store) {
  const { data } = store;
  const columnName = data.filterInfo.activatedColumnAddress!.name;
  const filterLayerState = data.filterInfo.filterLayerState!;

  const fns = filterLayerState.state
    .filter(state => String(state.value).length)
    .map(st =>
      getFilterConditionFn(st.code!, st.value, filterLayerState.type as SingleFilterOptionType)
    ) as Function[];

  filter(
    store,
    columnName,
    composeConditionFn(fns, filterLayerState.operator),
    filterLayerState.state!
  );
}

export function clearFilterLayerState(store: Store) {
  const { data } = store;
  const filterLayerState = data.filterInfo.filterLayerState!;
  filterLayerState.state = [];
  unfilter(store, filterLayerState.columnName);
  notify(data, 'filterInfo');
}

export function setFilterLayerState(store: Store, state: FilterState, filterIndex: number) {
  const { data, column } = store;
  data.filterInfo.filterLayerState!.state[filterIndex] = state as FilterState;

  notify(data, 'filterInfo');

  const columnName = data.filterInfo.activatedColumnAddress!.name;
  const columnInfo = column.allColumnMap[columnName];

  if (!columnInfo.filter!.showApplyBtn) {
    if (filterIndex === 0 && !String(state.value).length) {
      unfilter(store, columnName);
    } else {
      applyFilterLayerState(store);
    }
  }
}

export function filter(
  store: Store,
  columnName: string,
  conditionFn: Function,
  state: FilterState[]
) {
  const { data, column, rowCoords, dimension, id } = store;
  const columnFilterInfo = column.allColumnMap[columnName].filter;
  if (!columnFilterInfo) {
    return;
  }

  const filters = data.filterInfo.filters;
  if (filters) {
    const filterOption = findProp('columnName', columnName, filters);
    if (filterOption) {
      filterOption.conditionFn = conditionFn;
      filterOption.state = state;
    } else {
      filters.push({
        columnName,
        type: columnFilterInfo.type,
        conditionFn,
        state
      });
    }
  } else {
    data.filterInfo.filters = [
      {
        columnName,
        type: columnFilterInfo.type,
        conditionFn,
        state
      }
    ];
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

  rowCoords.heights = data.filteredRawData.map(row => getRowHeight(row, dimension.rowHeight));
  notify(rowCoords, 'heights');

  setScrollTop(store, 0);
  initSelection(store);
  initFocus(store);
}

export function unfilter(store: Store, columnName: string) {
  const { data, rowCoords, dimension } = store;
  const { filterInfo } = data;
  const { filters } = filterInfo;
  if (filters) {
    const filterIndex = findPropIndex('columnName', columnName, filters);
    if (filterIndex >= 0) {
      if (filterInfo.filterLayerState) {
        filterInfo.filterLayerState.state = [];
      }
      filterInfo.filters!.splice(filterIndex, 1);
      if (filterInfo.filters!.length === 0) {
        filterInfo.filters = null;
      }
    }
  }
  notify(data, 'filterInfo');

  rowCoords.heights = data.filteredRawData.map(row => getRowHeight(row, dimension.rowHeight));
  notify(rowCoords, 'heights');

  setScrollTop(store, 0);
  initSelection(store);
  initFocus(store);
}

export function setFilter(
  store: Store,
  columnName: string,
  filterOpt: SingleFilterOptionType | FilterOpt
) {
  const { column } = store;
  const filterOptions = getFilterOptions(filterOpt);
  const index = findPropIndex('name', columnName, column.allColumns);
  if (index !== -1) {
    column.allColumns[index].filter = filterOptions;
    notify(column, 'allColumns');
  }
}
