import { FilterItem, FilterItemProps } from './types';
import { ColumnInfo, NumberFilterCode, TextFilterCode } from '../store/types';
import Grid from '../grid';
import { createInput, createSelect } from './createElement';
import { composeConditionFn, filterSelectOption, getFilterConditionFn } from '../helper/filter';
import { SingleFilterOptionType } from '../types';

export class TextFilter implements FilterItem {
  private readonly columnInfo: ColumnInfo;

  private grid: Grid;

  public el: HTMLDivElement;

  public selectEl?: HTMLSelectElement;

  public searchInputEl?: HTMLInputElement;

  public filterIndex?: number;

  private onKeyUpInput = () => {
    const { name, filter } = this.columnInfo;
    if (filter && !filter.showApplyBtn) {
      const code = this.selectEl!.value as NumberFilterCode | TextFilterCode;
      const value = this.searchInputEl!.value;
      // @TODO: operator 고려해야함, index에 따른 업데이트는 어떻게?

      if (value.length) {
        const state = { code, value };
        const fn = getFilterConditionFn(
          code,
          value,
          filter.type as SingleFilterOptionType
        ) as Function;
        this.grid.filter(name, composeConditionFn([fn]), [state], this.filterIndex);
      }
    } else {
      this.grid.unfilter(name);
    }
  };

  private oncChangeSelect = () => {
    //@TODO: input 값이 있고 select가 변하면 값이 갱신되어야 함.
  };

  private getFilterElement = () => {
    const el = document.createElement('div');
    const filterType = this.columnInfo.filter!.type as 'number' | 'text';
    const selectContainer = createSelect(filterSelectOption[filterType]);
    const input = createInput(this.onKeyUpInput);

    this.searchInputEl = input;
    this.selectEl = selectContainer.querySelector('select')!;

    el.appendChild(selectContainer);
    el.appendChild(input);

    // @TODO: store props와 연동 필요. select도. 이건 이전에 검색한 결과가 있을때나 나타내주는것
    input.value = '';

    return el;
  };

  public constructor(props: FilterItemProps) {
    const { grid, columnInfo, index } = props;

    this.grid = grid;
    this.columnInfo = columnInfo;
    this.filterIndex = index;
    this.el = this.getFilterElement();
  }

  public getFilterState() {
    return {
      select: this.selectEl!.value,
      searchInput: this.searchInputEl!.value
    };
  }

  public setFilterState() {}

  public getElement() {
    return this.el;
  }

  public mounted() {}
}
