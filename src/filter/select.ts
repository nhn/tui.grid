import { FilterItem, FilterItemProps } from './types';
import { cls } from '../helper/dom';
import { CellValue } from '../store/types';
import Grid from '../grid';
import { createInput, createListItem } from './createElement';

export class SelectFilter implements FilterItem {
  private columnName: string;

  private grid: Grid;

  public el: HTMLDivElement;

  private onKeyDownSearchInput(ev: Event) {
    // console.log((ev.target as HTMLInputElement).value, 'target');
  }

  private getSelectedCheckboxId = () => {
    return 0;
  };

  private getFilterElement(columnData: CellValue[]) {
    const div = document.createElement('div');
    const searchInput = createInput(this.onKeyDownSearchInput, 'Search...');
    const selectAllLi = createListItem('Select All');
    const ul = document.createElement('ul');

    div.className = cls('filter-list-container');
    ul.className = cls('filter-list');

    columnData.forEach(item => {
      const li = createListItem(item);
      if (li) {
        ul.appendChild(li);
      }
    });

    div.appendChild(searchInput);
    div.appendChild(selectAllLi!);
    div.appendChild(ul);

    return div;
  }

  public constructor(props: FilterItemProps) {
    this.grid = props.grid;
    this.columnName = props.columnInfo.name;
    console.log(props.columnData);
    this.el = this.getFilterElement(props.columnData);
  }

  public getFilterState() {
    // return this.filterState.condition;
  }

  public setFilterState() {}

  public getElement() {
    return this.el;
  }
}
