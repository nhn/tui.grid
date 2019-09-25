import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import Grid from '../grid';
import { getInstance } from '../instance';
import { cls } from '../helper/dom';
import {
  ActiveColumnAddress,
  CellValue,
  ColumnInfo,
  FilterInfo,
  ActiveFilterState,
  FilterState,
  Row
} from '../store/types';
import { pluck, some, uniq, debounce } from '../helper/common';

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
}

interface OwnProps {
  columnAddress: ActiveColumnAddress;
}

type Props = StoreProps & OwnProps & DispatchProps;

class SelectFilterComp extends Component<Props> {
  public state = {
    searchInput: ''
  };

  private handleChange = debounce((ev: Event) => {
    const { dispatch } = this.props;
    const { id, checked } = ev.target as HTMLInputElement;

    dispatch('setActiveSelectFilterState', id, checked);
  }, 50);

  private toggleAllColumnCheckbox = debounce((ev: Event) => {
    const { checked } = ev.target as HTMLInputElement;
    this.props.dispatch('toggleSelectAllCheckbox', checked);
  }, 50);

  private searchColumnData = debounce((ev: KeyboardEvent) => {
    const { value } = ev.target as HTMLInputElement;
    this.setState({ searchInput: value });
  }, 50);

  public render() {
    const { columnData, isAllSelected } = this.props;
    const { searchInput } = this.state;
    const data = searchInput.length
      ? columnData.filter(item => String(item.value).indexOf(searchInput) !== -1)
      : columnData;

    return (
      <div className={cls('filter-list-container')}>
        <input
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
                <input type="checkbox" id={text} checked={checked} onChange={this.handleChange} />
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

export const SelectFilter = connect<StoreProps, OwnProps>((store, { columnAddress }) => {
  const { column, id, data, filterLayerState } = store;
  const { rawData, filterInfo } = data;
  const { allColumnMap } = column;

  const activeFilterState: FilterState[] = (filterLayerState.activeFilterState as ActiveFilterState)
    .state;
  const uniqueColumnData = uniq(pluck(rawData as Row[], columnAddress.name));
  const columnData = uniqueColumnData.map(value => ({
    value,
    checked: some(item => value === item.value, activeFilterState)
  }));

  return {
    grid: getInstance(id),
    columnData,
    columnInfo: allColumnMap[columnAddress.name],
    columnAddress,
    filterInfo,
    isAllSelected: activeFilterState.length === uniqueColumnData.length
  };
})(SelectFilterComp);
