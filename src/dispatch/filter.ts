import { ActivatedColumnAddress, FilterParams, FilterState, Store } from '../store/types';
import { notify } from '../helper/observable';
import { findProp, findPropIndex } from '../helper/common';

export function setActivatedColumnAddress({ data }: Store, address: ActivatedColumnAddress | null) {
  data.filterInfo.activatedColumnAddress = address;
  notify(data, 'filterInfo');
}

function getFilterStateWithIndex(
  filterOption: FilterParams,
  state: FilterState[] | number[],
  conditionFn: Function,
  filterIndex?: number
) {
  if (!filterIndex) {
    return {
      conditionFn,
      state
    };
  }

  console.log(filterOption);

  if (filterOption.operator) {
    console.log('operator 있어');
  }

  return null;
  // 1. filterIndex가 존재하는가
  // 2. operator가 존재하는가.
  // 3. 존재한다면 해당 인덱스거 엎어치기
  //    존재하지 않는다면 스킵
  //  이때 conditionFn도 다시 만들어야 한다
}

export function filter(
  store: Store,
  columnName: string,
  conditionFn: Function,
  state: FilterState[] | number[],
  filterIndex?: number
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
      // @TODO: filterIndex가 있으면 state
      // console.log(getFilterStateWithIndex(filterOption, state, conditionFn, filterIndex));

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
}

export function unfilter({ data }: Store, columnName: string) {
  const { filters } = data.filterInfo;
  if (filters) {
    const filterIndex = findPropIndex('columnName', columnName, filters);
    if (filterIndex >= 0) {
      data.filterInfo.filters!.splice(filterIndex, 1);
      if (data.filterInfo.filters!.length === 0) {
        data.filterInfo.filters = null;
      }
    }
  }

  notify(data, 'filterInfo');
}
