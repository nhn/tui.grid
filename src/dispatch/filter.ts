import { ActivatedColumnAddress, FilterState, Store } from '../store/types';
import { notify } from '../helper/observable';
import { findProp, findPropIndex } from '../helper/common';
import { composeConditionFn, getFilterConditionFn } from '../helper/filter';
import { SingleFilterOptionType } from '../types';

export function setActivatedColumnAddress(
  { data, column }: Store,
  address: ActivatedColumnAddress | null
) {
  data.filterInfo.activatedColumnAddress = address;
  if (address) {
    const { type, operator } = column.allColumnMap[address.name].filter!;
    const initialState = operator
      ? [{ code: null, value: null }, { code: null, value: null }]
      : [{ code: null, value: null }];

    data.filterInfo.filterLayerState = {
      columnName: address.name,
      type,
      operator,
      conditionFn: null,
      state: initialState
    };
  } else {
    data.filterInfo.activatedColumnAddress = null;
  }

  notify(data, 'filterInfo');
}

export function setFilterLayerState(store: Store, state: FilterState, filterIndex: number) {
  const { data, column } = store;
  data.filterInfo.filterLayerState!.state[filterIndex] = state;
  notify(data, 'filterInfo');

  const columnName = data.filterInfo.activatedColumnAddress!.name;
  const columnInfo = column.allColumnMap[columnName];
  if (!columnInfo.filter!.showApplyBtn) {
    const filterLayerState = data.filterInfo.filterLayerState!;
    const fns = filterLayerState.state.map(st =>
      getFilterConditionFn(st.code!, st.value, filterLayerState.type as SingleFilterOptionType)
    ) as Function[];

    filter(
      store,
      columnName,
      composeConditionFn(fns, filterLayerState.operator),
      filterLayerState.state
    );
  }
}

export function filter(
  store: Store,
  columnName: string,
  conditionFn: Function,
  state: FilterState[]
) {
  const { data, column } = store;
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
    console.log(data.filterInfo.filters, conditionFn, state);
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
}

export function unfilter({ data }: Store, columnName: string) {
  const { filterInfo } = data;
  const { filters } = filterInfo;
  if (filters) {
    const filterIndex = findPropIndex('columnName', columnName, filters);
    if (filterIndex >= 0) {
      filterInfo.filterLayerState!.state.forEach((st, idx) => {
        filterInfo.filterLayerState!.state[idx] = { code: null, value: null };
      });
      filterInfo.filters!.splice(filterIndex, 1);
      if (filterInfo.filters!.length === 0) {
        filterInfo.filters = null;
      }
    }
  }

  notify(data, 'filterInfo');
}
