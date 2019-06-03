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

export type GridId = number;

export type EditingEvent = 'click' | 'dblclick';

export type State = 'DONE' | 'EMPTY' | 'LOADING';

export interface Dictionary<T> {
  [index: string]: T;
}

export type Row = Dictionary<CellValue> & {
  rowKey: RowKey;
  _attributes: RowAttributes;
};

export interface RowAttributes {
  rowNum: number;
  checked: boolean;
  disabled: boolean;
  checkDisabled: boolean;
  className: { row: string[]; column: Dictionary<string[]> };
  height?: number;
}

export type RowAttributeValue = RowAttributes[keyof RowAttributes];

export type SummaryPosition = 'top' | 'bottom';

export type SummaryColumnContent = SummaryColumnContentMap | null;

export type SummaryColumnContents = Dictionary<SummaryColumnContent>;

export type SummaryValues = Dictionary<SummaryValue>;

export type CustomValue =
  | string
  | ((value: CellValue, rowAttrs: Row[], column: ColumnInfo) => string);

export interface ClipboardCopyOptions {
  useFormattedValue?: boolean;
  useListItemText?: boolean;
  customValue?: CustomValue;
}
export type ValidationType = 'REQUIRED' | 'TYPE_STRING' | 'TYPE_NUMBER';

export interface CellRenderData {
  editable: boolean;
  disabled: boolean;
  invalidState: '' | ValidationType;
  formattedValue: string;
  prefix: string;
  postfix: string;
  value: CellValue;
  editorOptions: Dictionary<any>;
  className: string;
}

export interface ViewRow {
  rowKey: RowKey;
  valueMap: Dictionary<CellRenderData>;
}

export interface DragStartData {
  pageX: number | null;
  pageY: number | null;
}

export interface DragData {
  pageX: number;
  pageY: number;
}

export interface SelectionRange {
  row: Range;
  column: Range;
}

export interface Validation {
  required?: boolean;
  dataType?: 'string' | 'number';
}

export interface InvalidColumn {
  columnName: string;
  errorCode: '' | ValidationType;
}

export interface InvalidRow {
  rowKey: RowKey;
  errors: InvalidColumn[];
}

export interface Data {
  rawData: Row[];
  viewData: ViewRow[];
  sortOptions: SortOptions;
  disabled: boolean;
  checkedAllRows: boolean;
  pageOptions: PageOptions;
}

export interface FormatterProps {
  row: Row;
  column: ColumnInfo;
  value: CellValue;
}

export type Formatter = ((props: FormatterProps) => string) | string;

export interface ColumnInfo {
  readonly name: string;
  header: string;
  minWidth: number;
  editor?: CellEditorClass;
  editorOptions?: Dictionary<any>;
  renderer: CellRendererClass;
  rendererOptions?: Dictionary<any>;
  copyOptions?: ClipboardCopyOptions;
  hidden: boolean;
  formatter?: Formatter;
  prefix?: Formatter;
  postfix?: Formatter;
  baseWidth: number;
  resizable: boolean;
  fixedWidth: boolean;
  relationMap?: Dictionary<Relations>;
  related?: boolean;
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  whiteSpace?: 'pre' | 'normal' | 'norwap' | 'pre-wrap' | 'pre-line';
  ellipsis?: boolean;
  escapeHTML?: boolean;
  defaultValue?: CellValue;
  sortable?: boolean;
  validation?: Validation;
  onBeforeChange?: Function;
  onAfterChange?: Function;
  ignored?: boolean;
}

export interface SortOptions {
  columnName: string;
  ascending: boolean;
  useClient: boolean;
}

export interface Column {
  frozenCount: number;
  keyColumnName?: string;
  allColumns: ColumnInfo[];
  readonly allColumnMap: Dictionary<ColumnInfo>;
  readonly rowHeaderCount: number;
  readonly visibleColumns: ColumnInfo[];
  readonly visibleFrozenCount: number;
  readonly visibleColumnsBySide: VisibleColumnsBySide;
  readonly defaultValues: { name: string; value: CellValue }[];
  readonly validationColumns: ColumnInfo[];
  readonly ignoredColumns: string[];
}

export interface Relations {
  targetNames?: string[];
  listItems?: (relationParams: RelationCallbackData) => ListItem[];
  editable?: (relationParams: RelationCallbackData) => boolean;
  disabled?: (relationParams: RelationCallbackData) => boolean;
}

export interface ListItem {
  text: string;
  value: CellValue;
}

export interface RelationCallbackData {
  value?: CellValue;
  editable?: boolean;
  disabled?: boolean;
  row?: Row;
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
  readonly scrollXHeight: number;
  readonly scrollYWidth: number;
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
  readonly dummyRowCount: number;
}

export interface ColumnCoords {
  readonly widths: { [key in Side]: number[] };
  readonly areaWidth: { [key in Side]: number };
  readonly offsets: { [key in Side]: number[] };
}

export interface RowCoords {
  heights: number[];
  readonly offsets: number[];
  readonly totalRowHeight: number;
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
  rowKey: RowKey | null;
  editingEvent: EditingEvent;
  columnName: string | null;
  prevRowKey: RowKey | null;
  prevColumnName: string | null;
  readonly side: Side | null;
  readonly columnIndex: number | null;
  readonly totalColumnIndex: number | null;
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
}

export interface RenderState {
  state: State;
}

export interface PageOptions {
  perPage?: number;
  page?: number;
  totalCount?: number;
}

export interface Store {
  readonly id: GridId;
  readonly data: Data;
  readonly column: Column;
  readonly dimension: Dimension;
  readonly viewport: Viewport;
  readonly columnCoords: ColumnCoords;
  readonly rowCoords: RowCoords;
  readonly focus: Focus;
  readonly selection: Selection;
  readonly summary: Summary;
  readonly renderState: RenderState;
}
