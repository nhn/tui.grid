import { DataSource } from './dataSource';
import { EditingEvent, TabMode } from './store/focus';
import { CellValue, PageOptions, RowAttributes, RowKey, RowSpanAttribute } from './store/data';
import {
  AlignType,
  ClipboardCopyOptions,
  ColumnFilterOption,
  ColumnOptions,
  CommonColumnInfo,
  ComplexColumnInfo,
  Relations,
  RowHeaderType,
  VAlignType,
} from './store/column';
import { SelectionUnit } from './store/selection';
import { FilterOptionType, FilterState } from './store/filterLayerState';
import { CreateMenuGroups } from './store/contextMenu';
import { SummaryColumnContentMapOnlyFn, SummaryPosition } from './store/summary';
import { GridEventProps, TuiGridEvent } from './event';
import { CellRendererClass, CellRendererProps, HeaderRendererClass } from './renderer';
import { CellEditorClass } from './editor';
import { EnterCommandType } from '../src/helper/keyboard';
import { Exports } from '@t/store/export';

export interface Dictionary<T> {
  [index: string]: T;
}

export type TypeObjectOptions<T> =
  | T
  | {
      type?: T;
      options?: Dictionary<any>;
      styles?: Record<string, string | ((props: CellRendererProps) => string)>;
      attributes?: Record<string, string | ((props: CellRendererProps) => string)>;
      classNames?: string[];
    };

export type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };

export type LifeCycleEventName = 'onGridMounted' | 'onGridUpdated' | 'onGridBeforeDestroy';
// @TODO: 'sort', 'filter' event will be deprecated

export enum GridEventType {
  CLICK = 'click',
  DBL_CLICK = 'dblclick',
  MOUSEDOWN = 'mousedown',
  MOUSEOVER = 'mouseover',
  MOUSEOUT = 'mouseout',
  FOCUS_CHANGE = 'focusChange',
  COLUMN_RESIZE = 'columnResize',
  CHECK = 'check',
  UNCHECK = 'uncheck',
  CHECK_ALL = 'checkAll',
  UNCHECK_ALL = 'uncheckAll',
  BEFORE_CHECK_BETWEEN = 'beforeCheckBetween',
  SELECTION = 'selection',
  EDITING_START = 'editingStart',
  EDITING_FINISH = 'editingFinish',
  SORT = 'sort',
  FILTER = 'filter',
  SCROLL_END = 'scrollEnd',
  BEFORE_REQUEST = 'beforeRequest',
  RESPONSE = 'response',
  SUCCESS_RESPONSE = 'successResponse',
  FAIL_RESPONSE = 'failResponse',
  ERROR_RESPONSE = 'errorResponse',
  EXPAND = 'expand',
  COLLAPSE = 'collapse',
  BEFORE_SORT = 'beforeSort',
  AFTER_SORT = 'afterSort',
  BEFORE_UNSORT = 'beforeUnsort',
  AFTER_UNSORT = 'afterUnsort',
  BEFORE_FILTER = 'beforeFilter',
  AFTER_FILTER = 'afterFilter',
  BEFORE_UNFILTER = 'beforeUnfilter',
  AFTER_UNFILTER = 'afterUnfilter',
  BEFORE_PAGE_MOVE = 'beforePageMove',
  AFTER_PAGE_MOVE = 'afterPageMove',
  BEFORE_CHANGE = 'beforeChange',
  AFTER_CHANGE = 'afterChange',
  DRAG_START = 'dragStart',
  DRAG = 'drag',
  DROP = 'drop',
  KEYDOWN = 'keydown',
  BEFORE_EXPORT = 'beforeExport',
  AFTER_EXPORT = 'afterExport',
}

export type GridEventName = `${GridEventType}`;

export type GridEventListener<T extends Partial<GridEventProps> = {}> = (gridEvent: TuiGridEvent & T) => void;

export interface OptGrid {
  el: HTMLElement;
  data?: OptRow[] | DataSource;
  columns: OptColumn[];
  columnOptions?: ColumnOptions;
  keyColumnName?: string;
  width?: number | 'auto';
  bodyHeight?: number | 'fitToParent' | 'auto';
  heightResizable?: boolean;
  minBodyHeight?: number;
  rowHeight?: number | 'auto';
  minRowHeight?: number;
  scrollX?: boolean;
  scrollY?: boolean;
  editingEvent?: EditingEvent;
  tabMode?: TabMode;
  rowHeaders?: OptRowHeader[];
  summary?: OptSummaryData;
  useClientSort?: boolean;
  selectionUnit?: SelectionUnit;
  showDummyRows?: boolean;
  copyOptions?: ClipboardCopyOptions;
  pageOptions?: PageOptions;
  treeColumnOptions?: OptTree;
  header?: OptHeader;
  usageStatistics?: boolean;
  disabled?: boolean;
  onGridMounted?: GridEventListener;
  onGridUpdated?: GridEventListener;
  onGridBeforeDestroy?: GridEventListener;
  draggable?: boolean;
  contextMenu?: CreateMenuGroups;
  moveDirectionOnEnter?: EnterCommandType;
  exportOptions?: Exports;
}

export interface GridEventTypeMap {
  [index: string]: Partial<GridEventProps>;
  [GridEventType.AFTER_CHANGE]: Pick<GridEventProps, 'changes' | 'origin'>;
  [GridEventType.AFTER_EXPORT]: Pick<
    GridEventProps,
    'exportFormat' | 'exportOptions' | 'data' | 'complexHeaderData'
  >;
  [GridEventType.AFTER_FILTER]: Pick<GridEventProps, 'filterState' | 'columnName'>;
  [GridEventType.AFTER_PAGE_MOVE]: Pick<GridEventProps, 'page'>;
  [GridEventType.AFTER_SORT]: Pick<GridEventProps, 'columnName' | 'sortState'>;
  [GridEventType.AFTER_UNFILTER]: Pick<GridEventProps, 'filterState' | 'columnName'>;
  [GridEventType.AFTER_UNSORT]: Pick<GridEventProps, 'sortState' | 'columnName'>;
  [GridEventType.BEFORE_CHANGE]: Pick<GridEventProps, 'changes' | 'origin'>;
  [GridEventType.BEFORE_CHECK_BETWEEN]: Pick<GridEventProps, 'rowKey' | 'rowKeys'>;
  [GridEventType.BEFORE_EXPORT]: Pick<
    GridEventProps,
    'exportFormat' | 'exportOptions' | 'data' | 'complexHeaderData' | 'exportFn'
  >;
  [GridEventType.BEFORE_FILTER]: Pick<
    GridEventProps,
    'filterState' | 'columnFilterState' | 'conditionFn' | 'type' | 'columnName' | 'operator'
  >;
  [GridEventType.BEFORE_PAGE_MOVE]: Pick<GridEventProps, 'page'>;
  [GridEventType.BEFORE_REQUEST]: Pick<GridEventProps, 'xhr'>;
  [GridEventType.BEFORE_SORT]: Pick<
    GridEventProps,
    'columnName' | 'ascending' | 'multiple' | 'sortState'
  >;
  [GridEventType.BEFORE_UNFILTER]: Pick<GridEventProps, 'filterState' | 'columnName'>;
  [GridEventType.BEFORE_UNSORT]: Pick<GridEventProps, 'columnName' | 'multiple' | 'sortState'>;
  [GridEventType.CHECK]: Pick<GridEventProps, 'rowKey' | 'rowKeys'>;
  [GridEventType.CHECK_ALL]: {};
  [GridEventType.CLICK]: Pick<GridEventProps, 'event'>;
  [GridEventType.COLLAPSE]: Pick<GridEventProps, 'rowKey'>;
  [GridEventType.COLUMN_RESIZE]: Pick<GridEventProps, 'resizedColumns'>;
  [GridEventType.DBL_CLICK]: Pick<GridEventProps, 'event'>;
  [GridEventType.DRAG]: Pick<
    GridEventProps,
    'rowKey' | 'targetRowKey' | 'appended' | 'targetColumnName'
  >;
  [GridEventType.DRAG_START]: Pick<
    GridEventProps,
    'rowKey' | 'floatingRow' | 'columnName' | 'floatingColumn'
  >;
  [GridEventType.DROP]: Pick<
    GridEventProps,
    'rowKey' | 'targetRowKey' | 'appended' | 'columnName' | 'targetColumnName'
  >;
  [GridEventType.EDITING_FINISH]: Pick<
    GridEventProps,
    'rowKey' | 'columnName' | 'value' | 'save' | 'triggeredByKey'
  >;
  [GridEventType.EDITING_START]: Pick<GridEventProps, 'rowKey' | 'columnName' | 'value'>;
  [GridEventType.ERROR_RESPONSE]: Pick<GridEventProps, 'xhr'>;
  [GridEventType.EXPAND]: Pick<GridEventProps, 'rowKey'>;
  [GridEventType.FAIL_RESPONSE]: Pick<GridEventProps, 'xhr'>;
  [GridEventType.FILTER]: Pick<GridEventProps, 'filterState' | 'columnName'>;
  [GridEventType.FOCUS_CHANGE]: Pick<
    GridEventProps,
    'rowKey' | 'columnName' | 'prevColumnName' | 'prevRowKey'
  >;
  [GridEventType.KEYDOWN]: Pick<GridEventProps, 'keyboardEvent' | 'rowKey'>;
  [GridEventType.MOUSEDOWN]: Pick<GridEventProps, 'event'>;
  [GridEventType.MOUSEOUT]: Pick<GridEventProps, 'event'>;
  [GridEventType.MOUSEOVER]: Pick<GridEventProps, 'event'>;
  [GridEventType.RESPONSE]: Pick<GridEventProps, 'xhr'>;
  [GridEventType.SCROLL_END]: {};
  [GridEventType.SORT]: Pick<GridEventProps, 'sortState' | 'columnName'>;
  [GridEventType.SUCCESS_RESPONSE]: Pick<GridEventProps, 'xhr'>;
  [GridEventType.UNCHECK]: Pick<GridEventProps, 'rowKey' | 'rowKeys'>;
  [GridEventType.UNCHECK_ALL]: {};
}

export type OptRowProp = CellValue | RecursivePartial<RowAttributes & RowSpanAttribute> | OptRow[];

export interface OptRow {
  [prop: string]: OptRowProp;
  _attributes?: RecursivePartial<RowAttributes & RowSpanAttribute>;
  _children?: OptRow[];
}

export interface OptAppendRow {
  at?: number;
  focus?: boolean;
  parentRowKey?: RowKey | null;
  extendPrevRowSpan?: boolean;
}

export interface OptPrependRow {
  focus?: boolean;
}

export interface OptRemoveRow {
  removeOriginalData?: boolean;
  keepRowSpanData?: boolean;
}

export interface OptAppendTreeRow {
  parentRowKey?: RowKey | null;
  offset?: number;
  focus?: boolean;
}

export interface OptMoveRow {
  appended?: boolean;
}

export interface OptTree {
  name: string;
  useIcon?: boolean;
  useCascadingCheckbox?: boolean;
  indentWidth?: number;
}

export interface OptColumn extends Partial<CommonColumnInfo> {
  name: string;
  width?: number | 'auto';
  renderer?: OptCellRenderer;
  editor?: OptCellEditor;
  relations?: Relations[];
  filter?: FilterOptionType | OptFilter;
}

export interface OptColumnHeaderInfo {
  name: string;
  align?: AlignType;
  valign?: VAlignType;
  renderer?: HeaderRendererClass;
}

export interface OptRowHeaderColumn extends Partial<OptColumn> {
  type: RowHeaderType;
}

export type OptRowHeader = RowHeaderType | OptRowHeaderColumn;

export interface OptFilter extends Partial<ColumnFilterOption> {
  type: Exclude<FilterOptionType, 'select'>;
}

export interface OptHeader {
  height?: number;
  complexColumns?: OptComplexColumnInfo[];
  align?: AlignType;
  valign?: VAlignType;
  columns?: OptColumnHeaderInfo[];
}

export interface OptComplexColumnInfo extends Omit<ComplexColumnInfo, 'headerRenderer'> {
  renderer?: HeaderRendererClass;
}

export type OptCellEditor = TypeObjectOptions<string | CellEditorClass>;
export type OptCellRenderer = TypeObjectOptions<string | CellRendererClass>;

export interface OptSummaryData {
  height?: number;
  position?: SummaryPosition;
  defaultContent?: string | SummaryColumnContentMapOnlyFn;
  columnContent?: {
    [propName: string]: string | SummaryColumnContentMapOnlyFn;
  };
}

/* theme type */
export type OptThemePresetNames = 'default' | 'striped' | 'clean';

export interface OptHeightResizeHandleStyle {
  background?: string;
  border?: string;
}

export interface OptFrozenBorderStyle {
  border?: string;
}

export interface OptPaginationStyle {
  background?: string;
  border?: string;
}

export interface OptTableOutlineStyle {
  border?: string;
  showVerticalBorder?: boolean;
}

export interface OptSelectionLayerStyle {
  background?: string;
  border?: string;
}

export interface OptRowHoverStyle {
  background?: string;
}

export interface OptScrollbarStyle {
  border?: string;
  background?: string;
  emptySpace?: string;
  thumb?: string;
  active?: string;
}

export interface OptTableHeaderStyle {
  background?: string;
  border?: string;
}

export interface OptTableSummaryStyle {
  background?: string;
  border?: string;
}

export interface OptTableBodyStyle {
  background?: string;
}

export interface OptTableAreaStyle {
  header?: OptTableHeaderStyle;
  body?: OptTableBodyStyle;
  summary?: OptTableSummaryStyle;
}

export interface OptCellStyle {
  background?: string;
  border?: string;
  text?: string;
  showVerticalBorder?: boolean;
  showHorizontalBorder?: boolean;
}

export interface OptTableRowStyle {
  even?: OptBasicCellStyle;
  odd?: OptBasicCellStyle;
  dummy?: OptCellDummyStyle;
  hover?: OptRowHoverStyle;
}

export interface OptBasicCellStyle {
  background?: string;
  text?: string;
}

export interface OptCellFocusedStyle {
  background?: string;
  border?: string;
}

export interface OptCellDummyStyle {
  background?: string;
}

export interface OptTableCellStyle {
  normal?: OptCellStyle;
  header?: OptCellStyle;
  selectedHeader?: OptBasicCellStyle;
  rowHeader?: OptCellStyle;
  selectedRowHeader?: OptBasicCellStyle;
  summary?: OptCellStyle;
  focused?: OptCellFocusedStyle;
  focusedInactive?: OptCellFocusedStyle;
  required?: OptBasicCellStyle;
  editable?: OptBasicCellStyle;
  disabled?: OptBasicCellStyle;
  invalid?: OptBasicCellStyle;
  // deprecated
  currentRow?: OptBasicCellStyle;
  evenRow?: OptBasicCellStyle;
  oddRow?: OptBasicCellStyle;
  dummy?: OptCellDummyStyle;
}

export interface OptPreset {
  outline?: OptTableOutlineStyle;
  selection?: OptSelectionLayerStyle;
  scrollbar?: OptScrollbarStyle;
  frozenBorder?: OptFrozenBorderStyle;
  area?: OptTableAreaStyle;
  cell?: OptTableCellStyle;
  heightResizeHandle?: OptHeightResizeHandleStyle;
  pagination?: OptPaginationStyle;
}

export interface OptHeightResizeHandleStyle {
  background?: string;
  border?: string;
}

export interface OptFrozenBorderStyle {
  border?: string;
}

export interface OptPaginationStyle {
  background?: string;
  border?: string;
}

export interface OptTableOutlineStyle {
  border?: string;
  showVerticalBorder?: boolean;
}

export interface OptSelectionLayerStyle {
  background?: string;
  border?: string;
}

export interface OptScrollbarStyle {
  border?: string;
  background?: string;
  emptySpace?: string;
  thumb?: string;
  active?: string;
}

export interface OptTableHeaderStyle {
  background?: string;
  border?: string;
}

export interface OptTableSummaryStyle {
  background?: string;
  border?: string;
}

export interface OptTableBodyStyle {
  background?: string;
}

export interface OptTableAreaStyle {
  header?: OptTableHeaderStyle;
  body?: OptTableBodyStyle;
  summary?: OptTableSummaryStyle;
}

export interface OptCellStyle {
  background?: string;
  border?: string;
  text?: string;
  showVerticalBorder?: boolean;
  showHorizontalBorder?: boolean;
}

export interface OptBasicCellStyle {
  background?: string;
  text?: string;
}

export interface OptCellFocusedStyle {
  background?: string;
  border?: string;
}

export interface OptCellDummyStyle {
  background?: string;
}

export interface OptTableCellStyle {
  normal?: OptCellStyle;
  header?: OptCellStyle;
  selectedHeader?: OptBasicCellStyle;
  rowHeader?: OptCellStyle;
  selectedRowHead?: OptBasicCellStyle;
  summary?: OptCellStyle;
  focused?: OptCellFocusedStyle;
  focusedInactive?: OptCellFocusedStyle;
  required?: OptBasicCellStyle;
  editable?: OptBasicCellStyle;
  disabled?: OptBasicCellStyle;
  invalid?: OptBasicCellStyle;
  currentRow?: OptBasicCellStyle;
  evenRow?: OptBasicCellStyle;
  oddRow?: OptBasicCellStyle;
  dummy?: OptCellDummyStyle;
}

export interface OptPreset {
  outline?: OptTableOutlineStyle;
  selection?: OptSelectionLayerStyle;
  scrollbar?: OptScrollbarStyle;
  frozenBorder?: OptFrozenBorderStyle;
  area?: OptTableAreaStyle;
  cell?: OptTableCellStyle;
  row?: OptTableRowStyle;
  heightResizeHandle?: OptHeightResizeHandleStyle;
  pagination?: OptPaginationStyle;
}

/* i18n */
export interface OptI18nLanguage {
  [propName: string]: OptI18nData;
}

export interface OptI18nData {
  display?: {
    noData?: string;
    loadingData?: string;
    resizeHandleGuide?: string;
  };
  net?: {
    confirmCreate?: string;
    confirmUpdate?: string;
    confirmDelete?: string;
    confirmModify?: string;
    noDataToCreate?: string;
    noDataToUpdate?: string;
    noDataToDelete?: string;
    noDataToModify?: string;
    failResponse?: string;
  };
  filter?: {
    contains?: string;
    eq?: string;
    ne?: string;
    start?: string;
    end?: string;
    after?: string;
    afterEq?: string;
    before?: string;
    beforeEq?: string;
    apply?: string;
    clear?: string;
    selectAll?: string;
    emptyValue?: string;
  };
  contextMenu?: {
    copy?: string;
    copyColumns?: string;
    copyRows?: string;
    export?: string;
    txtExport?: string;
    csvExport?: string;
    excelExport?: string;
  };
}

export interface SortStateResetOption {
  columnName: string;
  ascending: boolean;
  multiple: boolean;
}

export interface FilterStateResetOption {
  columnName: string;
  columnFilterState?: FilterState[];
}

export interface PageStateResetOption {
  page: number;
  totalCount?: number;
  perPage?: number;
}

export interface ResetOptions {
  sortState?: SortStateResetOption;
  filterState?: FilterStateResetOption;
  pageState?: PageStateResetOption;
}
