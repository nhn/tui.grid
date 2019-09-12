import { FilterItem, FilterItemProps } from './types';
import { cls } from '../helper/dom';
import { CellValue, ColumnInfo, FilterState } from '../store/types';
import Grid from '../grid';
import { createInput, createListItem } from './createElement';
import { findProp } from '../helper/common';
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

  private handleClickCheckbox = (ev: Event) => {
    const { value } = ev.target as HTMLInputElement;
    this.toggleCheckbox(value);
    if (!this.columnInfo.filter!.showApplyBtn) {
      //  @TODO: filter
      const checkedValues = this.getSelectedCheckboxValue();
      const states = checkedValues.map(checkedValue => ({
        code: 'eq',
        value: checkedValue
      })) as FilterState[];
      const conditionFn = checkedValues.map(checkedValue =>
        getFilterConditionFn('eq', checkedValue, 'select')
      ) as Function[];
      this.grid.filter(this.columnName, composeConditionFn(conditionFn, 'OR'), states);
    }
  };

  private handleClickAllCheckbox = (ev: Event) => {
    // this.columnData.forEach((data) => {
    // });
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

  private getFilterElement() {
    const div = document.createElement('div');
    const searchInput = createInput(this.onKeyUpSearchInput, 'Search...');
    const selectAllLi = createListItem(
      { columnName: 'Select All', checked: true },
      this.handleClickAllCheckbox,
      true
    );

    div.className = cls('filter-list-container');

    div.appendChild(searchInput);
    div.appendChild(selectAllLi!);

    return div;
  }

  public constructor(props: FilterItemProps) {
    this.grid = props.grid;
    this.columnName = props.columnInfo.name;
    this.el = this.getFilterElement();
    this.columnData = props.columnData.map(data => ({
      columnName: data,
      checked: true
    }));
    this.columnInfo = props.columnInfo;

    this.renderList(this.columnData);
  }

  public getFilterState() {
    this.getSelectedCheckboxValue();
    // return this.filterState.condition;
  }

  public setFilterState() {}

  public getElement() {
    return this.el;
  }
}
