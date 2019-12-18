import { CellRendererClass, HeaderRendererClass } from '../renderer/types';
import { CellEditorClass } from '../editor/types';
import {
  AlignType,
  OptColumnOptions,
  OptTree,
  VAlignType,
  OptSummaryColumnContentMap,
  FilterOptionType,
  OperatorType,
  OptColumnHeaderInfo
} from '../types';

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

export type TabMode = 'move' | 'moveAndEdit';

export type SortingType = 'asc' | 'desc';

export type EditingAddress = {
  rowKey: RowKey;
  columnName: string;
} | null;

export type CellHeightMap = Dictionary<Dictionary<number>>;

export interface Dictionary<T> {
  [index: string]: T;
}

export type Row = Dictionary<CellValue> & {
  rowKey: RowKey;
  sortKey: number;
  uniqueKey: string;
  rowSpanMap: RowSpanMap;
  _attributes: RowAttributes;
  _relationListItemMap: Dictionary<ListItem[]>;
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

export type SummaryPosition = 'top' | 'bottom';

export type SummaryColumnContent = SummaryColumnContentMap | null;

export type SummaryColumnContents = Dictionary<SummaryColumnContent>;

export type SummaryValues = Dictionary<SummaryValueMap>;

export type CustomValue =
  | string
  | ((value: CellValue, rowAttrs: Row[], column: ColumnInfo) => string);

export type LoadingState = 'DONE' | 'EMPTY' | 'LOADING';

export interface ClipboardCopyOptions {
  useFormattedValue?: boolean;
  useListItemText?: boolean;
  customValue?: CustomValue;
}

export type ValidationType =
  | 'REQUIRED'
  | 'TYPE_STRING'
  | 'TYPE_NUMBER'
  | 'MIN'
  | 'MAX'
  | 'REGEXP'
  | 'VALIDATOR_FN';

export interface CellRenderData {
  editable: boolean;
  disabled: boolean;
  invalidStates: ValidationType[];
  formattedValue: string;
  value: CellValue;
  className: string;
}

export interface ViewRow {
  rowKey: RowKey;
  rowSpanMap: RowSpanMap;
  sortKey: number;
  uniqueKey: string;
  valueMap: Dictionary<CellRenderData>;
  treeInfo?: TreeCellInfo;
  __unobserveFns__: Function[];
}

export interface DragStartData {
  pageX: number | null;
  pageY: number | null;
}

export interface PagePosition {
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
  min?: number;
  max?: number;
  regExp?: RegExp;
  validatorFn?: (value: CellValue) => boolean;
}

export interface InvalidColumn {
  columnName: string;
  errorCode: ValidationType[];
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

export interface ActiveColumnAddress {
  name: string;
  left: number;
}

export interface Data {
  rawData: Row[];
  viewData: ViewRow[];
  sortState: SortState;
  filteredIndex: number[] | null;
  filteredRawData: Row[];
  filteredViewData: ViewRow[];
  disabled: boolean;
  checkedAllRows: boolean;
  pageOptions: Required<PageOptions>;
  pageRowRange: Range;
  filters: Filter[] | null;
  loadingState: LoadingState;
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

export interface ColumnFilterOption {
  type: FilterOptionType;
  options?: Dictionary<any>;
  operator?: OperatorType;
  showApplyBtn: boolean;
  showClearBtn: boolean;
}

export type NumberFilterCode = 'eq' | 'lt' | 'gt' | 'lte' | 'gte' | 'ne';
export type TextFilterCode = 'eq' | 'ne' | 'contain' | 'start' | 'end';
export type DateFilterCode = 'eq' | 'ne' | 'after' | 'afterEq' | 'before' | 'beforeEq';

export interface FilterState {
  code: NumberFilterCode | TextFilterCode | DateFilterCode | null;
  value: string;
}

export interface ResizedColumn {
  columnName: string;
  width: number;
}

export interface Filter {
  columnName: string;
  type: FilterOptionType;
  operator?: OperatorType;
  conditionFn?: Function;
  state: FilterState[];
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
  align?: AlignType;
  valign?: VAlignType;
  whiteSpace?: 'pre' | 'normal' | 'nowrap' | 'pre-wrap' | 'pre-line';
  ellipsis?: boolean;
  escapeHTML?: boolean;
  defaultValue?: CellValue;
  sortable?: boolean;
  sortingType?: SortingType;
  validation?: Validation;
  onBeforeChange?: Function;
  onAfterChange?: Function;
  ignored?: boolean;
  headerAlign: AlignType;
  headerVAlign: VAlignType;
  filter?: ColumnFilterOption | null;
  headerRenderer?: HeaderRendererClass | null;
  className?: string;
}

export interface SortedColumn {
  columnName: string;
  ascending: boolean;
}

export interface SortState {
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

export interface ColumnHeaderInfo {
  columnHeaders: OptColumnHeaderInfo[];
  align: AlignType;
  valign: VAlignType;
}

export interface Column {
  frozenCount: number;
  dataForColumnCreation: DataForColumnCreation;
  keyColumnName?: string;
  allColumns: ColumnInfo[];
  complexColumnHeaders: ComplexColumnInfo[];
  readonly columnHeaderInfo: ColumnHeaderInfo;
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
  readonly columnMapWithRelation: Dictionary<ColumnInfo>;
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
  editingAddress: EditingAddress;
  navigating: boolean;
  rowKey: RowKey | null;
  editingEvent: EditingEvent;
  tabMode: TabMode;
  columnName: string | null;
  prevRowKey: RowKey | null;
  prevColumnName: string | null;
  forcedDestroyEditing: boolean;
  readonly side: Side | null;
  readonly columnIndex: number | null;
  readonly totalColumnIndex: number | null;
  readonly rowIndex: number | null;
  readonly originalRowIndex: number | null;
  readonly cellPosRect: Rect | null;
}

export type SummaryValueMap = SummaryValue & FilteredSummaryValue;

export interface SummaryColumnContentMap {
  useAutoSummary?: boolean;
  template?: string | ((valueMap: SummaryValueMap) => string);
}

export interface SummaryValue {
  sum: number;
  avg: number;
  min: number;
  max: number;
  cnt: number;
}

export interface FilteredSummaryValue {
  filtered: SummaryValue;
}

export interface Summary {
  summaryColumnContents: SummaryColumnContents;
  summaryValues: SummaryValues;
  defaultContent?: string | OptSummaryColumnContentMap;
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
  };
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
  readonly originalRange: SelectionRange | null;
}

export interface RenderState {
  hoveredRowKey: RowKey | null;
  cellHeightMap: CellHeightMap;
}

export interface FilterLayerState {
  activeColumnAddress: ActiveColumnAddress | null;
  activeFilterState: Filter | null;
}

export interface PageOptions {
  useClient?: boolean;
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
  readonly filterLayerState: FilterLayerState;
}

export interface ComplexColumnInfo {
  header: string;
  name: string;
  childNames: string[];
  headerAlign?: AlignType;
  headerVAlign?: VAlignType;
  headerRenderer?: HeaderRendererClass | null;
  hideChildHeaders?: boolean;
  resizable?: boolean;
}

export interface RawRowOptions {
  keyColumnName?: string;
  prevRow?: Row;
  lazyObservable?: boolean;
}
