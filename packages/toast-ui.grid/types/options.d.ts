import { DataSource } from './dataSource';
import { EditingEvent, TabMode } from './store/focus';
import { PageOptions, RowKey, CellValue, RowAttributes, RowSpanAttribute } from './store/data';
import {
  ColumnOptions,
  ClipboardCopyOptions,
  CommonColumnInfo,
  Relations,
  AlignType,
  VAlignType,
  RowHeaderType,
  ColumnFilterOption,
  ComplexColumnInfo,
} from './store/column';
import { SelectionUnit } from './store/selection';
import { FilterOptionType, FilterState } from './store/filterLayerState';
import { SummaryPosition, SummaryColumnContentMapOnlyFn } from './store/summary';
import { TuiGridEvent } from './event';
import { HeaderRendererClass, CellRendererClass, CellRendererProps } from './renderer';
import { CellEditorClass } from './editor';

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
export type GridEventName =
  | 'click'
  | 'dblclick'
  | 'mousedown'
  | 'mouseover'
  | 'mouseout'
  | 'focusChange'
  | 'columnResize'
  | 'check'
  | 'uncheck'
  | 'checkAll'
  | 'uncheckAll'
  | 'selection'
  | 'editingStart'
  | 'editingFinish'
  | 'sort'
  | 'filter'
  | 'scrollEnd'
  | 'beforeRequest'
  | 'response'
  | 'successResponse'
  | 'failResponse'
  | 'errorResponse'
  | 'expand'
  | 'collapse'
  | 'beforeSort'
  | 'afterSort'
  | 'beforeUnsort'
  | 'afterUnsort'
  | 'beforeFilter'
  | 'afterFilter'
  | 'beforeUnfilter'
  | 'afterUnfilter'
  | 'beforePageMove'
  | 'afterPageMove'
  | 'beforeChange'
  | 'afterChange';
export type GridEventListener = (gridEvent: TuiGridEvent) => void;

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
}

export interface OptRow {
  [prop: string]: CellValue | RecursivePartial<RowAttributes & RowSpanAttribute> | OptRow[];
  _attributes?: RecursivePartial<RowAttributes & RowSpanAttribute>;
  _children?: OptRow[];
}

export interface OptAppendRow {
  at?: number;
  focus?: boolean;
  parentRowKey?: RowKey;
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
  parentRowKey?: RowKey;
  offset?: number;
  focus?: boolean;
}

export interface OptTree {
  name: string;
  useIcon?: boolean;
  useCascadingCheckbox?: boolean;
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
