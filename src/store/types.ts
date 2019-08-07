import { CellRendererClass } from '../renderer/types';
import { CellEditorClass } from '../editor/types';
import { OptColumnOptions, OptTree } from '../types';

export type ColumnDefaultValues = { name: string; value: CellValue }[];

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

export type SortingType = 'asc' | 'desc';

export interface Dictionary<T> {
  [index: string]: T;
}

export type Row = Dictionary<CellValue> & {
  rowKey: RowKey;
  sortKey: number;
  rowSpanMap: RowSpanMap;
  _attributes: RowAttributes;
};

export type RowSpanMap = Dictionary<RowSpan>;

export interface RowSpan {
  mainRow: boolean;
  mainRowKey: RowKey;
  count: number;
  spanCount: number;
}

export interface RowAttributes {
  rowNum: number;
  checked: boolean;
  disabled: boolean;
  checkDisabled: boolean;
  className: { row: string[]; column: Dictionary<string[]> };
  height?: number;
  tree?: TreeRowInfo;
  expanded?: boolean;
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
  value: CellValue;
  className: string;
}

export interface ViewRow {
  rowKey: RowKey;
  rowSpanMap: RowSpanMap;
  sortKey: number;
  valueMap: Dictionary<CellRenderData>;
  treeInfo?: TreeCellInfo;
  __unobserveFns__: Function[];
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

export interface TreeRowInfo {
  parentRowKey: RowKey | null;
  childRowKeys: RowKey[];
  expanded?: boolean;
  hidden: boolean;
}

export interface TreeCellInfo {
  depth: number;
  indentWidth: number;
  leaf: boolean;
  expanded?: boolean;
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

export interface CellEditorOptions {
  type: CellEditorClass;
  options?: Dictionary<any>;
}

export interface CellRendererOptions {
  type: CellRendererClass;
  options?: Dictionary<any>;
}

export interface ColumnInfo {
  readonly name: string;
  header: string;
  minWidth: number;
  editor?: CellEditorOptions;
  renderer: CellRendererOptions;
  copyOptions?: ClipboardCopyOptions;
  hidden: boolean;
  formatter?: Formatter;
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
  sortingType?: SortingType;
  validation?: Validation;
  onBeforeChange?: Function;
  onAfterChange?: Function;
  ignored?: boolean;
}

export interface SortedColumn {
  columnName: string;
  ascending: boolean;
}

export interface SortOptions {
  useClient: boolean;
  columns: SortedColumn[];
}

interface DataForColumnCreation {
  copyOptions: ClipboardCopyOptions;
  columnOptions: OptColumnOptions;
  rowHeaders: ColumnInfo[];
  relationColumns: string[];
  treeColumnOptions: OptTree;
}

export interface Column {
  frozenCount: number;
  dataForColumnCreation: DataForColumnCreation;
  keyColumnName?: string;
  allColumns: ColumnInfo[];
  complexHeaderColumns: ComplexColumnInfo[];
  readonly allColumnMap: Dictionary<ColumnInfo>;
  readonly rowHeaderCount: number;
  readonly visibleColumns: ColumnInfo[];
  readonly visibleColumnsWithRowHeader: ColumnInfo[];
  readonly visibleFrozenCount: number;
  readonly visibleColumnsBySide: VisibleColumnsBySide;
  readonly visibleColumnsBySideWithRowHeader: VisibleColumnsBySide;
  readonly defaultValues: { name: string; value: CellValue }[];
  readonly validationColumns: ColumnInfo[];
  readonly ignoredColumns: string[];
  readonly treeColumnName?: string;
  readonly treeIcon?: boolean;
  readonly treeCascadingCheckbox?: boolean;
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
  heightResizable: boolean;
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
  readonly offsetLeft: number;
  readonly offsetTop: number;
  readonly rowRange: Range;
  readonly colRange: Range;
  readonly columns: ColumnInfo[];
  readonly rows: ViewRow[];
  readonly dummyRowCount: number;
}

export interface ColumnCoords {
  readonly widths: { [key in Side]: number[] };
  readonly areaWidth: { [key in Side]: number };
  readonly offsets: { [key in Side]: number[] };
  readonly totalColumnWidth: { [key in Side]: number };
}

export interface RowCoords {
  heights: number[];
  cellHeightMap: Dictionary<number[]>;
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
  readonly rangeWithRowHeader: SelectionRange | null;
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

export interface ComplexColumnInfo {
  header: string;
  name: string;
  childNames?: string[];
  sortable?: boolean;
  sortingType?: SortingType;
}
