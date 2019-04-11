export type CellValue = number | string | boolean | null | undefined;

export type Range = [number, number];

export type Side = 'L' | 'R';

export interface Row {
  [propName: string]: CellValue;
}

export interface ColumnInfo {
  readonly name: string;
  readonly title: string;
  readonly minWidth: number;
  baseWidth: number;
  resizable: boolean;
  fixedWidth: boolean;
}

export interface Column {
  frozenCount: number;
  visibleFrozenCount: number;
  rowHeaders: ColumnInfo[];
  dataColumns: ColumnInfo[];
  visibleColumns: { [key in Side]: ColumnInfo[] };
}

export interface Dimension {
  width: number;
  autoWidth: boolean;
  rsideWidth: number;
  lsideWidth: number;
  bodyHeight: number;
  autoHeight: boolean;
  minBodyHeight: number;
  fitToParentHeight: boolean;
  rowHeight: number;
  minRowHeight: number;
  autoRowHeight: boolean;
  headerHeight: number;
  summaryPosition: 'top' | 'bottom';
  summaryHeight: number;
  frozenBorderWidth: number;
  scrollbarWidth: number;
  tableBorderWidth: number;
  cellBorderWidth: number;
  scrollX: boolean;
  scrollY: boolean;
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
  readonly rows: Row[];
}

export interface ColumnCoords {
  readonly contentsWidth: number;
  readonly frozenBorderWidth: number;
  readonly widths: { [key in Side]: number[] };
  readonly areaWidth: { [key in Side]: number };
  readonly offsets: { [key in Side]: number[] };
}

export interface Store {
  readonly data: Row[];
  readonly column: Column;
  readonly dimension: Dimension;
  readonly viewport: Viewport;
  readonly columnCoords: ColumnCoords;
}
