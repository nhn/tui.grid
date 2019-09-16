import { FilterItem, FilterItemProps } from './types';
import { createInput, createSelect } from './createElement';
import TuiDatePicker from 'tui-date-picker';
import { deepMergedCopy, findProp, isNumber, isString } from '../helper/common';
import { composeConditionFn, filterSelectOption, getFilterConditionFn } from '../helper/filter';
import {
  CellValue,
  ColumnInfo,
  FilterInfo,
  NumberFilterCode,
  TextFilterCode
} from '../store/types';
import Grid from '../grid';

export class DatePickerFilter implements FilterItem {
  private readonly columnName: string;

  private readonly columnInfo: ColumnInfo;

  public el: HTMLDivElement;

  private grid: Grid;

  private inputEl: HTMLInputElement;

  public selectEl: HTMLSelectElement;

  private datePickerEl: TuiDatePicker;

  public filterIndex?: number;

  private getPreviousColumnData = (filterInfo: FilterInfo, columnData: CellValue[]) => {
    if (filterInfo.filters) {
      const filter = findProp('columnName', this.columnName, filterInfo.filters);
      // if (filter) {
      // }
    }
  };

  private applyFilter = () => {
    //@TODO: datepicker의 취소 조건
    if (this.columnInfo.filter!.showApplyBtn) {
      return;
    }

    const code = this.selectEl.value as NumberFilterCode | TextFilterCode;
    const value = this.inputEl.value;

    const state = { code, value };
    const fn = getFilterConditionFn(code, value, 'date') as Function;
    this.grid.filter(this.columnName, composeConditionFn([fn]), [state], this.filterIndex);
  };

  private createCalendarWrapper() {
    const calendarWrapper = document.createElement('div');
    calendarWrapper.style.marginTop = '-4px';
    this.el.appendChild(calendarWrapper);

    return calendarWrapper;
  }

  public constructor(props: FilterItemProps) {
    const { columnInfo, grid, index } = props;
    const { usageStatistics } = grid;

    this.columnInfo = columnInfo;
    this.columnName = columnInfo.name;
    this.grid = grid;
    this.filterIndex = index;
    this.el = document.createElement('div');
    this.inputEl = createInput([{ type: 'change', handler: this.applyFilter }]);
    const selectContainer = createSelect(filterSelectOption.date, [
      { type: 'change', handler: this.applyFilter }
    ]);

    this.selectEl = selectContainer.querySelector('select')!;
    this.el.appendChild(selectContainer);
    this.el.appendChild(this.inputEl);

    // @TODO: datepicker 엘리먼트 만드는 것 util로 분리
    const calendarWrapper = this.createCalendarWrapper();
    // @TODO: 이전 값 가져와서 세팅
    let value;
    const { options } = columnInfo.filter!;
    let date;
    let format = 'yyyy/MM/dd';

    if (options) {
      if (options.format) {
        format = options.format;
        delete options.format;
      }
    }

    if (isNumber(value) || isString(value)) {
      // date = new Date(value);
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
      calendarWrapper,
      deepMergedCopy(defaultOptions, options || {})
    );

    this.datePickerEl.on('change', this.applyFilter);
  }

  public getFilterState() {
    return {
      select: this.selectEl.value,
      value: this.inputEl.value
    };
  }

  public setFilterState() {}

  public getElement() {
    return this.el;
  }

  public mounted() {}
}
