import { CellValue, ColumnInfo } from '../store/types';
import Grid from '../grid';

export interface FilterItemProps {
  grid: Grid;
  index?: number;
  columnInfo: ColumnInfo;
  columnData: CellValue[];
}

export interface FilterItem {
  getElement(): HTMLElement | undefined;
  setFilterState(): void;
  getFilterState(): void;
  mounted?(): void;
  beforeDestroy?(): void;
  el?: HTMLElement;
}

export interface FilterItemClass {
  new (props: FilterItemProps): FilterItem;
}
