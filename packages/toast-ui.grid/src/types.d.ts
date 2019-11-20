import {
  CellValue,
  Dictionary,
  Relations,
  SelectionUnit,
  Formatter,
  ClipboardCopyOptions,
  RowAttributes,
  EditingEvent,
  PageOptions,
  Validation,
  RowKey,
  SortingType,
  TabMode
} from './store/types';
import { CellRendererClass, HeaderRendererClass } from './renderer/types';
import { CellEditorClass } from './editor/types';
import { DataSource } from './dataSource/types';
import { keyNameMap } from './helper/keyboard';

export type VAlignType = 'top' | 'middle' | 'bottom';
export type AlignType = 'left' | 'center' | 'right';

export type KeyNameMap = typeof keyNameMap & {
  [keyCode: number]: string | undefined;
};

export interface OptGrid {
  el: HTMLElement;
  data?: OptRow[] | DataSource;
  columns: OptColumn[];
  columnOptions?: OptColumnOptions;
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
  onGridMounted?: Function;
  onGridBeforeDestroy?: Function;
}

export type SummaryPosition = 'top' | 'bottom';

type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };

export type RowSpanAttributeValue = RowSpanAttribute[keyof RowSpanAttribute];
export interface RowSpanAttribute {
  rowSpan?: Dictionary<number>;
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

type RowHeaderType = 'rowNum' | 'checkbox';

interface OptRowHeaderColumn extends Partial<OptColumn> {
  type: RowHeaderType;
}

export type OptRowHeader = RowHeaderType | OptRowHeaderColumn;

interface OptTree {
  name: string;
  useIcon?: boolean;
  useCascadingCheckbox?: boolean;
}

type TypeObjectOptions<T> =
  | T
  | {
      type: T;
      options?: Dictionary<any>;
    };

export type OptCellEditor = TypeObjectOptions<string | CellEditorClass>;
export type OptCellRenderer = TypeObjectOptions<string | CellRendererClass>;

export type FilterOptionType = 'text' | 'number' | 'date' | 'select';
export type OperatorType = 'AND' | 'OR';

export interface FilterOpt {
  type: Exclude<FilterOptionType, 'select'>;
  options?: Dictionary<any>;
  operator?: OperatorType;
  showApplyBtn?: boolean;
  showClearBtn?: boolean;
}

export interface OptColumn {
  name: string;
  header?: string;
  hidden?: boolean;
  width?: number | 'auto';
  renderer?: OptCellRenderer;
  editor?: OptCellEditor;
  formatter?: Formatter;
  defaultValue?: CellValue;
  resizable?: boolean;
  minWidth?: number;
  escapeHTML?: false;
  relations?: Relations[];
  align?: AlignType;
  valign?: VAlignType;
  whiteSpace?: 'pre' | 'normal' | 'nowrap' | 'pre-wrap' | 'pre-line';
  ellipsis?: boolean;
  sortable?: boolean;
  sortingType?: SortingType;
  copyOptions?: ClipboardCopyOptions;
  onBeforeChange?: Function;
  onAfterChange?: Function;
  ignored?: boolean;
  validation?: Validation;
  filter?: FilterOptionType | FilterOpt;
  className?: string;
}

export interface OptColumnOptions {
  minWidth?: number;
  frozenCount?: number;
  frozenBorderWidth?: number;
  resizable?: boolean;
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

export interface OptSummaryData {
  height?: number;
  position?: SummaryPosition;
  defaultContent?: string | OptSummaryColumnContentMap;
  columnContent?: {
    [propName: string]: string | OptSummaryColumnContentMap;
  };
}

export interface OptSummaryColumnContentMap {
  useAutoSummary?: boolean;
  template?: (valueMap: OptSummaryValueMap) => string;
}

export interface OptSummaryValueMap {
  sum: number;
  avg: number;
  min: number;
  max: number;
  cnt: number;
  filtered: {
    sum: number;
    avg: number;
    min: number;
    max: number;
    cnt: number;
  };
}

export interface OptColumnHeaderInfo {
  name: string;
  align?: AlignType;
  valign?: VAlignType;
  renderer?: HeaderRendererClass;
}

export interface OptHeader {
  height?: number;
  complexColumns?: OptComplexColumnInfo[];
  align?: AlignType;
  valign?: VAlignType;
  columns?: OptColumnHeaderInfo[];
}

export interface OptComplexColumnInfo {
  header: string;
  name: string;
  childNames: string[];
  sortable?: boolean;
  sortingType?: SortingType;
  headerAlign?: AlignType;
  headerVAlign?: VAlignType;
  renderer?: HeaderRendererClass;
  hideChildHeaders?: boolean;
  resizable?: boolean;
}
