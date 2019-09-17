import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls } from '../helper/dom';
import {
  ActivatedColumnAddress,
  ColumnInfo,
  FilterInfo,
  NumberFilterCode,
  TextFilterCode
} from '../store/types';
import { filterSelectOption } from '../helper/filter';

type SelectOption = { [key in NumberFilterCode | TextFilterCode]: string };

interface StoreProps {
  columnInfo: ColumnInfo;
  filterInfo: FilterInfo;
  columnAddress: ActivatedColumnAddress;
}

interface OwnProps {
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
      // @TODO: 해당 state를 지워주는 식으로 해야함
      // dispatch('unfilter', this.props.columnAddress.name);
    }
  };

  private getPreviousValue = () => {
    const { filterInfo, filterIndex } = this.props;
    const filterState = filterInfo.filterLayerState!.state;

    let code = 'eq';
    let value = '';

    if (filterState.length > 0 && filterState[filterIndex]) {
      const { code: prevCode, value: prevValue } = filterState[filterIndex];
      code = prevCode!;
      value = String(prevValue);
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

export const TextFilter = connect<StoreProps, OwnProps>((store, { filterIndex }) => {
  const { column, data } = store;
  const { allColumnMap } = column;
  const columnAddress = data.filterInfo.activatedColumnAddress!;

  return {
    columnInfo: allColumnMap[columnAddress.name],
    columnAddress,
    filterIndex,
    filterInfo: data.filterInfo
  };
})(TextFilterComp);
