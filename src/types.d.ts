import { CellValue } from './store/types';

export interface OptGrid {
  el: HTMLElement;
  data?: OptRow[];
  columns: OptColumn[];
  columnOptions: OptColumnOptions;
  width?: number;
  bodyHeight?: number;
  rowHeight?: number;
}

export interface OptRow {
  [propName: string]: CellValue;
}

export interface OptColumn {
  name: string;
  title?: string;
  width?: number | 'auto';
  minWidth?: number;
}

export interface OptColumnOptions {
  minWidth?: number;
}
