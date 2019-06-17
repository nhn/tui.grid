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
  ComplexColumnInfo
} from './store/types';
import { CellRendererClass } from './renderer/types';
import { CellEditorClass } from './editor/types';
import { DataSource } from './dataSource/types';

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
}

export type CellValue = number | string | boolean | null | undefined;

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

export interface OptColumn {
  name: string;
  header?: string;
  hidden?: boolean;
  width?: number | 'auto';
  renderer?: OptCellRenderer;
  editor?: OptCellEditor;
  formatter?: Formatter;
  defaultValue?: CellValue;
  viewer?: string | boolean;
  resizable?: boolean;
  minWidth?: number;
  escapeHTML?: false;
  relations?: Relations[];
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  whiteSpace?: 'pre' | 'normal' | 'norwap' | 'pre-wrap' | 'pre-line';
  ellipsis?: boolean;
  sortable?: boolean;
  copyOptions?: ClipboardCopyOptions;
  onBeforeChange?: Function;
  onAfterChange?: Function;
  ignored?: boolean;
  validation?: Validation;
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
  selectedRowHeader?: OptBasicCellStyle;
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
}

export interface OptHeader {
  height?: number;
  complexColumns?: ComplexColumnInfo[];
}
