import { h, Component } from 'preact';
import { CellValue } from '@t/store/data';
import { ColumnInfo } from '@t/store/column';
import { Filter, ActiveColumnAddress } from '@t/store/filterLayerState';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import Grid from '../grid';
import { getInstance } from '../instance';
import { cls } from '../helper/dom';
import { some, debounce, isBlank } from '../helper/common';
import { getUniqColumnData } from '../query/data';
import { FILTER_DEBOUNCE_TIME } from '../helper/constant';
import i18n from '../i18n';

interface ColumnData {
  value: CellValue;
  text: string;
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
    searchInput: '',
  };

  private handleChange = debounce((ev: Event, value: string) => {
    const { dispatch } = this.props;
    const { checked } = ev.target as HTMLInputElement;

    dispatch('setActiveSelectFilterState', value, checked);
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
      ? columnData.filter((item) => String(item.value).indexOf(searchInput) !== -1)
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
        <li className={cls('filter-list-item', [isAllSelected, 'filter-list-item-checked'])}>
          <label>
            <input
              type="checkbox"
              onChange={this.toggleAllColumnCheckbox}
              checked={isAllSelected}
            />
            <span>{i18n.get('filter.selectAll')}</span>
          </label>
        </li>
        <ul className={cls('filter-list')}>
          {data.map((item) => {
            const { value, text, checked } = item;

            return (
              <li
                className={cls('filter-list-item', [checked, 'filter-list-item-checked'])}
                key={text}
              >
                <label>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(ev) => this.handleChange(ev, value)}
                  />
                  <span>{text}</span>
                </label>
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

    const uniqueColumnData = getUniqColumnData(rawData, column, columnName);
    const columnData = uniqueColumnData
      .filter((value) => value)
      .map((value) => ({
        value,
        text: String(value),
        checked: some((item) => value === item.value, state),
      }));
    const isExistEmptyValue = uniqueColumnData.some((value) => isBlank(value));
    if (isExistEmptyValue) {
      columnData.push({
        value: '',
        text: i18n.get('filter.emptyValue'),
        checked: some(({ value }) => isBlank(value), state),
      });
    }

    return {
      grid: getInstance(id),
      columnData,
      columnInfo: allColumnMap[columnName],
      columnAddress,
      filters,
      isAllSelected: state.length === uniqueColumnData.length,
    };
  }
)(SelectFilterComp);
