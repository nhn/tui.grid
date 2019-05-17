import { CellRendererClass } from '../renderer/types';
import { CellEditorClass } from '../editor/types';

export type CellValue = number | string | boolean | null | undefined;

export type Range = [number, number];

export type Side = 'L' | 'R';

export type SelectionType = 'cell' | 'row' | 'column';

export type SelectionUnit = 'cell' | 'row';

export type VisibleColumnsBySide = { [key in Side]: ColumnInfo[] };

export type RowKey = number | string;

export type CellIndex = [number, number];

export interface Dictionary<T> {
  [index: string]: T;
}

export type Row = Dictionary<CellValue> & {
  rowKey: RowKey;
  _number: number;
  _checked: boolean;
  _extraData?: any;
};

export type SummaryPosition = 'top' | 'bottom';

export type SummaryColumnContent = SummaryColumnContentMap | null;

export type SummaryColumnContents = Dictionary<SummaryColumnContent>;

export type SummaryValues = Dictionary<SummaryValue>;

export interface ClipboardCopyOptions {
  useFormattedValue?: boolean;
  useListItemText?: boolean;
  customValue?: string;
}

export interface Clipboard {
  text: string | null;
}

export interface CellRenderData {
  editable: boolean;
  disabled: boolean;
  formattedValue: string;
  prefix: string;
  postfix: string;
  value: CellValue;
}

export interface ViewRow {
  rowKey: RowKey;
  valueMap: Dictionary<CellRenderData>;
}

export interface DragData {
  pageX: number | null;
  pageY: number | null;
}

export interface SelectionRange {
  row: Range;
  column: Range;
}

export interface Data {
  rawData: Row[];
  viewData: ViewRow[];
  checkedAllRows: boolean;
}

export type Formatter = (value: CellValue) => string | string;

export interface ColumnInfo {
  readonly name: string;
  readonly header: string;
  readonly minWidth: number;
  readonly align: string;
  editor?: CellEditorClass;
  editorOptions?: Dictionary<any>;
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
  rowHeaderCount: number;
  allColumns: ColumnInfo[];
  allColumnMap: Dictionary<ColumnInfo>;
  visibleColumns: ColumnInfo[];
  visibleColumnsBySide: VisibleColumnsBySide;
}

export interface Dimension {
  offsetLeft: number;
  offsetTop: number;
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
  readonly scrollPixelScale: number;
  readonly maxScrollLeft: number;
  readonly maxScrollTop: number;
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
  readonly totalColumnIndex: number | null;
  readonly rowIndex: number | null;
  readonly cellPosRect: Rect | null;
  readonly text: string | null;
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

export interface AreaInfo {
  top: number;
  height: number;
  left: number;
  width: number;
}

export type RangeAreaInfo = { [key in Side]: AreaInfo | null };
export type RangeBySide = {
  [key in Side]: {
    row: Range;
    column: Range | null;
  }
};

export interface Selection {
  type: SelectionType;
  unit: SelectionUnit;
  intervalIdForAutoScroll: number | null;
  inputRange: SelectionRange | null;
  readonly range: SelectionRange | null;
  readonly rangeBySide: RangeBySide | null;
  readonly rangeAreaInfo: RangeAreaInfo | null;
  readonly text: string | null;
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
  readonly selection: Selection;
  readonly summary: Summary;
  readonly clipboard: Clipboard;
}
