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
  Filter,
  NumberFilterCode,
  TextFilterCode
} from '../store/types';
import { FILTER_DEBOUNCE_TIME, filterSelectOption } from '../helper/filter';
import { debounce, deepMergedCopy, isString } from '../helper/common';
import { keyNameMap, isNotCharacterKey } from '../helper/keyboard';
import { KeyNameMap } from '../types';

interface StoreProps {
  grid: Grid;
  columnInfo: ColumnInfo;
  filters: Filter[] | null;
}

interface OwnProps {
  columnAddress: ActiveColumnAddress;
  filterState: Filter;
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

  private handleKeyUp = debounce((ev: KeyboardEvent) => {
    const { keyCode } = ev;
    const keyName = (keyNameMap as KeyNameMap)[keyCode];
    const { dispatch } = this.props;

    if (isNotCharacterKey(keyCode)) {
      return;
    }

    if (keyName === 'enter') {
      dispatch('applyActiveFilterState');
    } else {
      this.handleChange();
    }
  }, FILTER_DEBOUNCE_TIME);

  private handleChange = () => {
    const { dispatch } = this.props;

    const { filterIndex } = this.props;
    const value = this.inputEl!.value;
    const code = this.selectEl!.value as NumberFilterCode | TextFilterCode;
    dispatch('setActiveFilterState', { value, code }, filterIndex);
  };

  private getPreviousValue = () => {
    const { filterIndex, filterState } = this.props;
    const { state } = filterState;

    let code = 'eq';
    let value = '';

    if (state.length && state[filterIndex]) {
      const { code: prevCode, value: prevValue } = state[filterIndex];
      code = prevCode!;
      value = String(prevValue);
    }

    return { value, code };
  };

  public render() {
    const { columnInfo } = this.props;
    const { options } = columnInfo.filter!;
    const showIcon = !(options && options.showIcon === false);
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
        <div className={cls('datepicker-input-container')}>
          <input
            ref={ref => {
              this.inputEl = ref;
            }}
            type="text"
            className={cls('filter-input', [showIcon, 'datepicker-input'])}
            onKeyUp={this.handleKeyUp}
            value={value}
          />
          {showIcon && <i className={cls('date-icon')} />}
        </div>
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
  (store, { filterIndex, columnAddress, filterState }) => {
    const { column, id, data } = store;
    const { allColumnMap } = column;
    const { filters } = data;

    return {
      grid: getInstance(id),
      columnInfo: allColumnMap[columnAddress.name],
      columnAddress,
      filterIndex,
      filters,
      filterState
    };
  }
)(DatePickerFilterComp);
