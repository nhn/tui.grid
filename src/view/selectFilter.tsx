import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import Grid from '../grid';
import { getInstance } from '../instance';
import { cls } from '../helper/dom';
import { ActiveColumnAddress, CellValue, ColumnInfo, Filter } from '../store/types';
import { some, debounce } from '../helper/common';
import { FILTER_DEBOUNCE_TIME, getUniqColumnData } from '../helper/filter';

interface ColumnData {
  value: CellValue;
  checked: boolean;
}

interface StoreProps {
  grid: Grid;
  columnInfo: ColumnInfo;
  filters: Filter[] | null;
  columnData: ColumnData[];
  isAllSelected: boolean;
}

interface OwnProps {
  columnAddress: ActiveColumnAddress;
  filterState: Filter;
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
  }, FILTER_DEBOUNCE_TIME);

  private toggleAllColumnCheckbox = debounce((ev: Event) => {
    const { checked } = ev.target as HTMLInputElement;
    this.props.dispatch('toggleSelectAllCheckbox', checked);
  }, FILTER_DEBOUNCE_TIME);

  private searchColumnData = debounce((ev: KeyboardEvent) => {
    const { value } = ev.target as HTMLInputElement;
    this.setState({ searchInput: value });
  }, FILTER_DEBOUNCE_TIME);

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

export const SelectFilter = connect<StoreProps, OwnProps>(
  (store, { columnAddress, filterState }) => {
    const { column, id, data } = store;
    const { filters, rawData } = data;
    const { allColumnMap } = column;
    const { state } = filterState;
    const { name: columnName } = columnAddress;

    const uniqueColumnData = getUniqColumnData(rawData, columnName);
    const columnData = uniqueColumnData.map(value => ({
      value,
      checked: some(item => value === item.value, state)
    })) as ColumnData[];

    return {
      grid: getInstance(id),
      columnData,
      columnInfo: allColumnMap[columnName],
      columnAddress,
      filters,
      isAllSelected: state.length === uniqueColumnData.length
    };
  }
)(SelectFilterComp);
