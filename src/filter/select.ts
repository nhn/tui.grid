import { FilterItem, FilterItemProps } from './types';
import { cls } from '../helper/dom';
import { CellValue, ColumnInfo, FilterInfo, FilterState } from '../store/types';
import Grid from '../grid';
import { createInput, createListItem } from './createElement';
import { findProp, some } from '../helper/common';
import { composeConditionFn, getFilterConditionFn } from '../helper/filter';

export interface CheckboxColumn {
  columnName: CellValue;
  checked: boolean;
}

export class SelectFilter implements FilterItem {
  private columnName: string;

  private grid: Grid;

  public el: HTMLDivElement;

  private ul?: HTMLUListElement;

  private columnData: CheckboxColumn[];

  private columnInfo: ColumnInfo;

  private onKeyUpSearchInput = (ev: Event) => {
    const inputValue = (ev.target as HTMLInputElement).value;
    const filteredColumnData = this.columnData.filter(item =>
      String(item.columnName).includes(inputValue)
    );
    this.renderList(filteredColumnData);
  };

  private getSelectedCheckboxValue = () => {
    const result: CellValue[] = [];

    const checkedList = this.el.querySelectorAll('input[name=filter_select]:checked');
    checkedList.forEach(input => {
      const inputWithType = input as HTMLInputElement;
      result.push(inputWithType.value);
    });

    return result;
  };

  private toggleCheckbox = (columnName: string) => {
    const column = findProp('columnName', columnName, this.columnData)!;
    column.checked = !column.checked;
  };

  private changeAllCheckboxState = (checked: boolean) => {
    const allCheckbox = this.el.querySelector('input[name=filter_select_all]');
    (allCheckbox as HTMLInputElement).checked = checked;
  };

  private changeAllRowState = (checked: boolean) => {
    const checkedList = this.el.querySelectorAll('input[name=filter_select]');
    checkedList.forEach(input => {
      const inputWithType = input as HTMLInputElement;
      inputWithType.checked = checked;
    });
  };

  private handleClickCheckbox = (ev: Event) => {
    const { value } = ev.target as HTMLInputElement;
    this.toggleCheckbox(value);
    if (!this.columnInfo.filter!.showApplyBtn) {
      const checkedValues = this.getSelectedCheckboxValue();

      if (this.columnData.length === checkedValues.length) {
        this.grid.unfilter(this.columnName);
        this.changeAllCheckboxState(true);
      } else {
        const states = checkedValues.map(checkedValue => ({
          code: 'eq',
          value: checkedValue
        })) as FilterState[];
        const conditionFn = checkedValues.map(checkedValue =>
          getFilterConditionFn('eq', checkedValue, 'select')
        ) as Function[];

        this.grid.filter(this.columnName, composeConditionFn(conditionFn, 'OR'), states);
        this.changeAllCheckboxState(false);
      }
    }
  };

  private handleClickAllCheckbox = (ev: Event) => {
    const checked = (ev.target as HTMLInputElement).checked;
    if (checked) {
      this.changeAllRowState(true);
      this.grid.unfilter(this.columnName);
    } else {
      this.changeAllRowState(false);
      this.grid.filter(this.columnName, () => false, []);
    }
  };

  private renderList = (columnData: CheckboxColumn[]) => {
    if (this.ul) {
      this.el.removeChild(this.ul);
    }

    const ul = document.createElement('ul');
    ul.className = cls('filter-list');

    columnData.forEach(item => {
      const li = createListItem(item, this.handleClickCheckbox);
      if (li) {
        ul.appendChild(li);
      }
    });

    this.ul = ul;
    this.el.appendChild(ul);
  };

  private getFilterElement = (filterInfo: FilterInfo) => {
    const div = document.createElement('div');
    const searchInput = createInput(
      [{ type: 'keyup', handler: this.onKeyUpSearchInput }],
      'Search...'
    );

    const selectAllLi = createListItem(
      { columnName: 'Select All', checked: !filterInfo.filters },
      this.handleClickAllCheckbox,
      true
    );

    div.className = cls('filter-list-container');

    div.appendChild(searchInput);
    div.appendChild(selectAllLi!);

    return div;
  };

  private getPreviousColumnData = (filterInfo: FilterInfo, columnData: CellValue[]) => {
    if (filterInfo.filters) {
      const filter = findProp('columnName', this.columnName, filterInfo.filters);
      if (filter) {
        const { state } = filter;
        return columnData.map(data => ({
          columnName: data,
          checked: some(item => item.value === data, state)
        }));
      }
    }

    return columnData.map(data => ({
      columnName: data,
      checked: true
    }));
  };

  public constructor(props: FilterItemProps) {
    this.grid = props.grid;
    this.columnName = props.columnInfo.name;
    this.columnInfo = props.columnInfo;
    this.el = this.getFilterElement(props.filterInfo);
    this.columnData = this.getPreviousColumnData(props.filterInfo, props.columnData);

    this.renderList(this.columnData);
  }

  public getFilterState() {
    this.getSelectedCheckboxValue();
  }

  public setFilterState() {}

  public getElement() {
    return this.el;
  }
}
