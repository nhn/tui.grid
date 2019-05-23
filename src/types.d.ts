import {
  CellValue,
  Dictionary,
  Relations,
  SelectionUnit,
  Formatter,
  ClipboardCopyOptions,
  RowAttributes
} from './store/types';
import { CellRendererClass } from './renderer/types';
import { CellEditorClass } from './editor/types';

export interface OptGrid {
  el: HTMLElement;
  data?: OptRow[];
  columns: OptColumn[];
  columnOptions?: OptColumnOptions;
  width?: number | 'auto';
  bodyHeight?: number | 'fitToParent' | 'auto';
  minBodyHeight?: number;
  rowHeight?: number | 'auto';
  minRowHeight?: number;
  scrollX?: boolean;
  scrollY?: boolean;
  rowHeaders?: OptRowHeader[];
  summary?: OptSummaryData;
  selectionUnit?: SelectionUnit;
  showDummyRows?: boolean;
  copyOptions?: ClipboardCopyOptions;
}

export type CellValue = number | string | boolean | null | undefined;

export type SummaryPosition = 'top' | 'bottom';

export type OptRow = Dictionary<CellValue> & {
  _attributes?: Partial<RowAttributes>;
};

export type OptRowHeader = string | OptColumn;

interface OptValidation {
  required?: boolean;
  dataType?: 'string' | 'number';
}

export interface OptColumn {
  name: string;
  header?: string;
  hidden?: boolean;
  width?: number | 'auto';
  renderer?: CellRendererClass;
  rendererOptions?: Dictionary<any>;
  editor?: string | CellEditorClass;
  editorOptions?: Dictionary<any>;
  formatter?: Formatter;
  defaultValue?: CellValue;
  prefix?: Formatter;
  postfix?: Formatter;
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
  validation?: OptValidation;
}

export interface OptColumnOptions {
  minWidth?: number;
  frozenCount?: number;
  frozenBorderWidth?: number;
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
  head?: OptCellStyle;
  selectedHead?: OptBasicCellStyle;
  rowHead?: OptCellStyle;
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
  head?: OptCellStyle;
  selectedHead?: OptBasicCellStyle;
  rowHead?: OptCellStyle;
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
