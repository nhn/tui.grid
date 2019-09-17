import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import Grid from '../grid';
import { getInstance } from '../instance';
import { cls } from '../helper/dom';
import {
  ActivatedColumnAddress,
  CellValue,
  ColumnInfo,
  FilterInfo,
  FilterLayerState,
  FilterState,
  Row
} from '../store/types';
import { pluck, some, uniq } from '../helper/common';

interface ColumnData {
  value: CellValue;
  checked: boolean;
}

interface StoreProps {
  grid: Grid;
  columnInfo: ColumnInfo;
  filterInfo: FilterInfo;
  columnData: ColumnData[];
  isAllSelected: boolean;
  searchInput: string | null;
  columnAddress: ActivatedColumnAddress;
}

type Props = StoreProps & DispatchProps;

class SelectFilterComp extends Component<Props> {
  private searchInputEl?: HTMLInputElement;

  private handleLayerStateChange = (ev: Event) => {
    const { dispatch } = this.props;
    const { id, checked } = ev.target as HTMLInputElement;

    dispatch('setSelectFilterLayerState', id, checked);
  };

  private toggleAllColumnCheckbox = (ev: Event) => {
    const { checked } = ev.target as HTMLInputElement;
    this.props.dispatch('toggleSelectAllCheckbox', checked);
  };

  private searchColumnData = (ev: KeyboardEvent) => {
    const { value } = ev.target as HTMLInputElement;
    this.props.dispatch('updateFilterLayerSearchInput', value);
  };

  public render() {
    const { columnData, isAllSelected, searchInput } = this.props;
    const data = searchInput
      ? columnData.filter(item => String(item.value).includes(searchInput))
      : columnData;

    return (
      <div className={cls('filter-list-container')}>
        <input
          ref={el => {
            this.searchInputEl = el;
          }}
          type="text"
          className={cls('filter-input')}
          placeholder="Search..."
          onKeyUp={this.searchColumnData}
          value={searchInput ? String(searchInput) : ''}
        />
        <li className={cls('filter-list-item')}>
          <input
            type="checkbox"
            id="filter_select_all"
            value="select_all"
            onChange={this.toggleAllColumnCheckbox}
            checked={isAllSelected}
          />
          <label for="filter_select_all" />
          <span>Select All</span>
        </li>
        <ul className={cls('filter-list')}>
          {data.map(item => {
            const { value, checked } = item;
            const text = String(value);

            return (
              <li
                className={cls('filter-list-item', [checked, 'filter-list-item-checked'])}
                key={text}
              >
                <input
                  type="checkbox"
                  id={text}
                  checked={checked}
                  onChange={this.handleLayerStateChange}
                />
                <label for={text} />
                <span>{value}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export const SelectFilter = connect<StoreProps>(store => {
  const { column, id, data } = store;
  const { rawData, filterInfo } = data;
  const { allColumnMap } = column;
  const columnAddress = data.filterInfo.activatedColumnAddress!;

  const searchInput = filterInfo.filterLayerState!.searchInput;
  const filterLayerState: FilterState[] = (filterInfo.filterLayerState! as FilterLayerState).state;
  const uniqueColumnData = uniq(pluck(rawData as Row[], columnAddress.name));
  const columnData = uniqueColumnData.map(value => ({
    value,
    checked: some(item => value === item.value, filterLayerState)
  }));

  return {
    grid: getInstance(id),
    columnData,
    columnInfo: allColumnMap[columnAddress.name],
    columnAddress,
    filterInfo,
    isAllSelected: filterLayerState.length === uniqueColumnData.length,
    searchInput
  };
})(SelectFilterComp);
