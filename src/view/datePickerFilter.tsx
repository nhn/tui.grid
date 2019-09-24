import { h, Component } from 'preact';
import TuiDatePicker from 'tui-date-picker';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import Grid from '../grid';
import { getInstance } from '../instance';
import { cls } from '../helper/dom';
import {
  ActiveColumnAddress,
  ColumnInfo,
  DateFilterCode,
  FilterInfo,
  NumberFilterCode,
  TextFilterCode
} from '../store/types';
import { filterSelectOption } from '../helper/filter';
import { debounce, deepMergedCopy, isString } from '../helper/common';

interface StoreProps {
  grid: Grid;
  columnInfo: ColumnInfo;
  filterInfo: FilterInfo;
}

interface OwnProps {
  columnAddress: ActiveColumnAddress;
  filterIndex: number;
}

type Props = StoreProps & OwnProps & DispatchProps;

class DatePickerFilterComp extends Component<Props> {
  private inputEl?: HTMLInputElement;

  private selectEl?: HTMLSelectElement;

  private datePickerEl?: TuiDatePicker;

  private calendarWrapper?: HTMLDivElement;

  public componentDidMount() {
    this.createDatePicker();
  }

  public componentWillUnmount() {
    this.datePickerEl!.destroy();
  }

  private createDatePicker = () => {
    const { columnInfo, grid } = this.props;
    const { options } = columnInfo.filter!;
    const { usageStatistics } = grid;
    const { value } = this.getPreviousValue();

    let date;
    let format = 'yyyy/MM/dd';

    if (options) {
      if (options.format) {
        format = options.format;
        delete options.format;
      }
    }

    if (isString(value) && value.length) {
      date = new Date(value);
    }

    const defaultOptions = {
      date,
      type: 'date',
      input: {
        element: this.inputEl,
        format
      },
      usageStatistics
    };

    this.datePickerEl = new TuiDatePicker(
      this.calendarWrapper!,
      deepMergedCopy(defaultOptions, options || {})
    );

    this.datePickerEl.on('change', this.handleChange);
  };

  private handleChange = debounce(() => {
    const { filterIndex, dispatch } = this.props;
    const value = this.inputEl!.value;
    const code = this.selectEl!.value as NumberFilterCode | TextFilterCode;
    dispatch('setActiveFilterState', { value, code }, filterIndex);
  }, 50);

  private getPreviousValue = () => {
    const { filterInfo, filterIndex } = this.props;
    const filterState = filterInfo.activeFilterState!.state;

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
    const selectOption = filterSelectOption.date;
    const { value, code } = this.getPreviousValue();

    return (
      <div>
        <div className={cls('filter-dropdown')}>
          <select
            ref={ref => {
              this.selectEl = ref;
            }}
            onChange={this.handleChange}
          >
            {Object.keys(selectOption).map(key => {
              return (
                <option value={key} key={key} selected={code === key}>
                  {selectOption[key as DateFilterCode]}
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
          onKeyUp={this.handleChange}
          value={value}
        />
        <div
          ref={ref => {
            this.calendarWrapper = ref;
          }}
          style={{ marginTop: '-4px' }}
        />
      </div>
    );
  }
}

export const DatePickerFilter = connect<StoreProps, OwnProps>(
  (store, { filterIndex, columnAddress }) => {
    const { column, id, data } = store;
    const { allColumnMap } = column;

    return {
      grid: getInstance(id),
      columnInfo: allColumnMap[columnAddress.name],
      columnAddress,
      filterIndex,
      filterInfo: data.filterInfo
    };
  }
)(DatePickerFilterComp);
