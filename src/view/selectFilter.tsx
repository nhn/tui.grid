import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import Grid from '../grid';
import { getInstance } from '../instance';
import { cls } from '../helper/dom';
import {
  ActivatedColumnAddress,
  ColumnInfo,
  FilterInfo,
  NumberFilterCode,
  Row,
  TextFilterCode
} from '../store/types';
import { filterSelectOption } from '../helper/filter';
import { findProp, pluck, uniq } from '../helper/common';

type SelectOption = { [key in NumberFilterCode | TextFilterCode]: string };

interface StoreProps {
  grid: Grid;
  columnInfo: ColumnInfo;
  filterInfo: FilterInfo;
  columnData: string[];
}

interface OwnProps {
  columnAddress: ActivatedColumnAddress;
  filterIndex: number;
}

type Props = StoreProps & OwnProps & DispatchProps;

class SelectFilterComp extends Component<Props> {
  private inputEl?: HTMLInputElement;

  private selectEl?: HTMLSelectElement;

  private columnData?: string[];

  public componentDidMount() {
    this.columnData = this.props.columnData;
    const { code, value } = this.getPreviousValue();
    // this.selectEl!.value = code;
    // this.inputEl!.value = value;
  }

  private handleLayerStateChange = () => {
    const { filterIndex, dispatch } = this.props;
    const value = this.inputEl!.value;
    const code = this.selectEl!.value as NumberFilterCode | TextFilterCode;

    if (value && code) {
      dispatch('setFilterLayerState', { value, code }, filterIndex);
    } else if (!value.length) {
      dispatch('unfilter', this.props.columnAddress.name);
    }
  };

  private toggleAllColumnCheckbox = () => {};

  private searchColumnData = (ev: KeyboardEvent) => {
    const value = (ev.target as HTMLInputElement).value;
    console.log(value);
  };

  private getPreviousValue = () => {
    const { columnInfo, filterInfo, filterIndex } = this.props;

    let code = 'eq';
    let value = '';

    if (filterInfo.filters) {
      const prevFilter = findProp('columnName', columnInfo.name, filterInfo.filters);
      if (prevFilter) {
        const state = prevFilter.state[filterIndex];
        code = state.code ? state.code : code;
        value = state.code ? String(state.value) : value;
      }
    }

    return { value, code };
  };

  public render() {
    return (
      <div className={cls('filter-list-container')}>
        <input
          type="text"
          className={cls('filter-input')}
          placeholder="Search..."
          onKeyUp={this.searchColumnData}
        />
        <li className={cls('filter-list-item')}>
          <input
            type="checkbox"
            id="filter_select_all"
            value="select_all"
            onChange={this.toggleAllColumnCheckbox}
          />
          <label for="filter_select_all" />
          <span>Select All</span>
        </li>
        <ul className={cls('filter-list')}>
          {this.props.columnData.map(text => {
            return (
              <li className={cls('filter-list-item', 'filter-list-item-checked')} key={text}>
                <input type="checkbox" id={text} checked={true} />
                <label for={text} />
                <span>{text}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export const SelectFilter = connect<StoreProps, OwnProps>(
  (store, { columnAddress, filterIndex }) => {
    const { column, id, data } = store;
    const { rawData } = data;
    const { allColumnMap } = column;

    return {
      grid: getInstance(id),
      columnData: uniq(pluck(rawData as Row[], columnAddress.name)),
      columnInfo: allColumnMap[columnAddress.name],
      columnAddress,
      filterIndex,
      filterInfo: data.filterInfo
    };
  }
)(SelectFilterComp);
