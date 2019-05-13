import { CellRendererClass } from '../renderer/types';

export type CellValue = number | string | boolean | null | undefined;

export type Range = [number, number];

export type Side = 'L' | 'R';

export type VisibleColumnsBySide = { [key in Side]: ColumnInfo[] };

export type RowKey = number | string;

export interface Dictionary<T> {
  [index: string]: T;
}

export type Row = Dictionary<CellValue> & {
  rowKey: RowKey;
  _number: number;
  _extraData?: any;
};

export type SummaryPosition = 'top' | 'bottom';

export type SummaryColumnContent = SummaryColumnContentMap | null;

export type SummaryColumnContents = Dictionary<SummaryColumnContent>;

export type SummaryValues = Dictionary<SummaryValue>;

export interface CellRenderData {
  formattedValue: string;
  prefix: string;
  postfix: string;
  value: CellValue;
}

export interface ViewRow {
  rowKey: RowKey;
  valueMap: Dictionary<CellRenderData>;
}

export interface Data {
  rawData: Row[];
  viewData: ViewRow[];
}

export interface CellEditorOptions {
  type: string;
  [propName: string]: any;
}

export type Formatter = (value: CellValue) => string | string;

export interface ColumnInfo {
  readonly name: string;
  readonly title: string;
  readonly minWidth: number;
  readonly align: string;
  editor?: CellEditorOptions;
  renderer: CellRendererClass;
  rendererOptions?: Dictionary<any>;
  hidden: boolean;
  formatter?: Formatter;
  prefix?: Formatter;
  postfix?: Formatter;
  baseWidth: number;
  resizable: boolean;
  fixedWidth: boolean;
}

export interface Column {
  frozenCount: number;
  visibleFrozenCount: number;
  rowHeaders: ColumnInfo[];
  allColumns: ColumnInfo[];
  allColumnMap: Dictionary<ColumnInfo>;
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
  summaryPosition: SummaryPosition;
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
  readonly rows: ViewRow[];
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
  editingAddress: {
    rowKey: RowKey;
    columnName: string;
  } | null;
  navigating: boolean;
  rowKey: RowKey | string | null;
  columnName: string | null;
  readonly side: Side | null;
  readonly columnIndex: number | null;
  readonly rowIndex: number | null;
  readonly cellPosRect: Rect | null;
}

export interface SummaryColumnContentMap {
  useAutoSummary?: boolean;
  template?: string | ((valueMap: SummaryValue) => string);
}

export interface SummaryValue {
  sum: number;
  avg: number;
  min: number;
  max: number;
  cnt: number;
}

export interface Summary {
  summaryColumnContents: SummaryColumnContents;
  summaryValues: SummaryValues;
}

export interface Store {
  readonly id: number;
  readonly data: Data;
  readonly column: Column;
  readonly dimension: Dimension;
  readonly viewport: Viewport;
  readonly columnCoords: ColumnCoords;
  readonly rowCoords: RowCoords;
  readonly focus: Focus;
  readonly summary: Summary;
}

export interface DefaultRowHeaders {
  [propName: string]: any;
}
