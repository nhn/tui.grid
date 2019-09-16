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
  TextFilterCode
} from '../store/types';
import { filterSelectOption } from '../helper/filter';
import { findProp } from '../helper/common';

type SelectOption = { [key in NumberFilterCode | TextFilterCode]: string };

interface StoreProps {
  grid: Grid;
  columnInfo: ColumnInfo;
  filterInfo: FilterInfo;
}

interface OwnProps {
  columnAddress: ActivatedColumnAddress;
  filterIndex: number;
}

type Props = StoreProps & OwnProps & DispatchProps;

class TextFilterComp extends Component<Props> {
  private inputEl?: HTMLInputElement;

  private selectEl?: HTMLSelectElement;

  public componentDidMount() {
    const { code, value } = this.getPreviousValue();
    this.selectEl!.value = code;
    this.inputEl!.value = value;
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
    const { columnInfo } = this.props;
    const selectOption = filterSelectOption[
      columnInfo.filter!.type as 'number' | 'text'
    ] as SelectOption;

    return (
      <div>
        <div className={cls('filter-dropdown')}>
          <select
            ref={ref => {
              this.selectEl = ref;
            }}
            onChange={this.handleLayerStateChange}
          >
            {Object.keys(selectOption).map(key => {
              const keyWithType = key as NumberFilterCode | TextFilterCode;
              return (
                <option value={key} key={key}>
                  {selectOption[keyWithType]}
                </option>
              );
            })}
          </select>
        </div>
        <input
          ref={ref => {
            this.inputEl = ref;
          }}
          type="text"
          className={cls('filter-input')}
          onKeyUp={this.handleLayerStateChange}
        />
      </div>
    );
  }
}

export const TextFilter = connect<StoreProps, OwnProps>((store, { columnAddress, filterIndex }) => {
  const { column, id, data } = store;
  const { allColumnMap } = column;

  return {
    grid: getInstance(id),
    columnInfo: allColumnMap[columnAddress.name],
    columnAddress,
    filterIndex,
    filterInfo: data.filterInfo
  };
})(TextFilterComp);
