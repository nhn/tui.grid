import { CellValue } from './store/types';

export interface OptGrid {
  el: HTMLElement;
  data?: OptRow[];
  columns: OptColumn[];
  columnOptions?: OptColumnOptions;
  width?: number | 'auto';
  bodyHeight?: number | 'fitToParent' | 'auto';
  minBodyHeight?: number;
  rowHeight?: number | 'auto';
  minRowHeight?: number;
  scrollX?: boolean;
  scrollY?: boolean;
}

export interface ExtraData {
  height?: number;
}

export type CellValue = number | string | boolean | null | undefined;

export type OptRow = {
  [propName: string]: CellValue;
} & {
  _extraData?: ExtraData;
};

export interface OptColumn {
  name: string;
  title?: string;
  width?: number | 'auto';
  resizable?: boolean;
  minWidth?: number;
}

export interface OptColumnOptions {
  minWidth?: number;
  frozenCount?: number;
}
