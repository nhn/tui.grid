export type CellValue = number | string | boolean | null;

export type Range = [number, number];

export type Side = 'L' | 'R';

export interface Row {
  [propName: string]: CellValue;
}

export interface Column {
  readonly name: string;
  readonly title: string;
  width: number;
}
export interface Store {
  readonly data: Row[];
  readonly columns: Column[];
  readonly dimension: Dimension;
  readonly viewport: Viewport;
}

export interface Dimension {
  width: number;
  bodyHeight: number;
  rowHeight: number;
  readonly totalRowHeight: number;
  readonly rowOffsets: number[];
  readonly colOffsets: number[];
}

export interface Viewport {
  scrollX: number;
  scrollY: number;
  readonly offsetY: number;
  readonly rowRange: Range;
  readonly colRange: Range;
  readonly colsL: Column[],
  readonly colsR: Column[],
  readonly rowsL: Row[],
  readonly rowsR: Row[]
}
