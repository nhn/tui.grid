export type CellValue = number | string | boolean | null | undefined;

export type Range = [number, number];

export type Side = 'L' | 'R';

export type VisibleColumnsBySide = { [key in Side]: ColumnInfo[] };

export interface Row {
  rowKey: number | string;
  [propName: string]: CellValue;
}

export interface Data {
  rawData: Row[];
  viewData: Row[];
}

export interface ColumnInfo {
  readonly name: string;
  readonly title: string;
  readonly minWidth: number;
  hidden: boolean;
  baseWidth: number;
  resizable: boolean;
  fixedWidth: boolean;
}

export interface Column {
  frozenCount: number;
  visibleFrozenCount: number;
  rowHeaders: ColumnInfo[];
  allColumns: ColumnInfo[];
  visibleColumns: ColumnInfo[];
  visibleColumnsBySide: VisibleColumnsBySide;
}

export interface Dimension {
  width: number;
  autoWidth: boolean;
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
  scrollbarWidth: number;
  tableBorderWidth: number;
  cellBorderWidth: number;
  scrollX: boolean;
  scrollY: boolean;
  readonly contentsWidth: number;
  readonly frozenBorderWidth: number;
  readonly totalRowHeight: number;
}

export interface Viewport {
  scrollLeft: number;
  scrollTop: number;
  readonly offsetY: number;
  readonly rowRange: Range;
  readonly colRange: Range;
  readonly rows: Row[];
}

export interface ColumnCoords {
  readonly widths: { [key in Side]: number[] };
  readonly areaWidth: { [key in Side]: number };
  readonly offsets: { [key in Side]: number[] };
}

export interface RowCoords {
  readonly heights: number[];
  readonly offsets: number[];
}

export interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface Focus {
  active: boolean;
  rowKey: number | string | null;
  columnName: string | null;
  readonly side: Side | null;
  readonly columnIndex: number | null;
  readonly rowIndex: number | null;
  readonly cellPosRect: Rect | null;
}

export interface Selection {
  active: boolean;
  selectionUnit: number | string | null;
  range: string | null;
  // readonly side: Side | null;
  // readonly columnIndex: number | null;
  // readonly rowIndex: number | null;
  // readonly cellPosRect: Rect | null;
}

export interface Store {
  readonly data: Data;
  readonly column: Column;
  readonly dimension: Dimension;
  readonly viewport: Viewport;
  readonly columnCoords: ColumnCoords;
  readonly rowCoords: RowCoords;
  readonly focus: Focus;
}
