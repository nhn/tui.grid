export type CellValue = number | string | boolean | null;

export type Range = [number, number];

export type Side = 'L' | 'R';

export interface Row {
  [propName: string]: CellValue;
}

export interface Column {
  name: string;
  title: string;
  width: number;
}
export interface Store {
  data: Row[];
  columns: Column[];
  dimension: Dimension;
  viewport: Viewport;
}

export interface Dimension {
  width: number;
  bodyHeight: number;
  totalRowHeight: number;
  rowOffsets: number[];
  colOffsets: number[];
}

export interface Viewport {
  rowRange: Range;
  colRange: Range;
  scrollX: number;
  scrollY: number;
  offsetY: number;
  colsL: Column[],
  colsR: Column[],
  rowsL: Row[],
  rowsR: Row[]
}
