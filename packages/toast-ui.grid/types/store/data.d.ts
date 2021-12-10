import { Dictionary, RecursivePartial } from '../options';
import { Filter } from './filterLayerState';
import { InvalidColumn, Comparator, ErrorInfo } from './column';
import { Range } from './selection';

// Add object type for in case of handling object data in custom renderer
// related issue(https://github.com/nhn/tui.grid/issues/1014)
export type CellValue = number | string | boolean | null | undefined | object;
export type RowKey = number | string;
export type RowSpanMap = Dictionary<RowSpan>;

export type Row = Dictionary<CellValue> & {
  rowKey: RowKey;
  sortKey: number;
  uniqueKey: string;
  rowSpanMap: RowSpanMap;
  _attributes: RowAttributes;
  _relationListItemMap: Dictionary<ListItem[]>;
  _disabledPriority: DisabledPriority;
  _children?: Row[];
  _leaf?: boolean;
};
export type RowSpanAttributeValue = RowSpanAttribute[keyof RowSpanAttribute];
export type DisabledPriority = Dictionary<'CELL' | 'ROW' | 'COLUMN' | 'NONE'>;
export type LoadingState = 'DONE' | 'EMPTY' | 'LOADING';
export type ColumnDefaultValues = { name: string; value: CellValue }[];

export interface RawRowOptions {
  keyColumnName?: string;
  prevRow?: Row;
  lazyObservable?: boolean;
  disabled?: boolean;
}

export interface TreeRowInfo {
  parentRowKey: RowKey | null;
  childRowKeys: RowKey[];
  expanded?: boolean;
  hidden: boolean;
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

export interface RowSpanAttribute {
  rowSpan: Dictionary<number>;
}

export interface RowSpan {
  mainRow: boolean;
  mainRowKey: RowKey;
  count: number;
  spanCount: number;
}

export interface TreeCellInfo {
  depth: number;
  indentWidth: number;
  leaf: boolean;
  expanded?: boolean;
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

export interface CellRenderData {
  editable: boolean;
  disabled: boolean;
  invalidStates: ErrorInfo[];
  formattedValue: string;
  value: CellValue;
  className: string;
}

export interface SortState {
  useClient: boolean;
  columns: SortedColumn[];
}

export interface SortedColumn {
  columnName: string;
  ascending: boolean;
}

export type SortedColumnWithComprator = SortedColumn & { comparator?: Comparator };

export interface ListItem {
  text: string;
  value: CellValue;
}

export interface PageOptions {
  useClient?: boolean;
  perPage?: number;
  page?: number;
  totalCount?: number;
  type?: 'scroll' | 'pagination';
  position?: 'top' | 'bottom';
  visiblePages?: number;
  centerAlign?: boolean;
  firstItemClassName?: string;
  lastItemClassName?: string;
  template?: Record<string, string | Function>;
}

export interface InvalidRow {
  rowKey: RowKey;
  errors: InvalidColumn[];
}

export interface Data {
  rawData: Row[];
  viewData: ViewRow[];
  sortState: SortState;
  filteredIndex: number[] | null;
  filteredRawData: Row[];
  filteredViewData: ViewRow[];
  checkedAllRows: boolean;
  disabledAllCheckbox: boolean;
  pageOptions: Required<PageOptions>;
  pageRowRange: Range;
  filters: Filter[] | null;
  loadingState: LoadingState;
  clickedCheckboxRowkey: RowKey | null;
}

export type RemoveTargetRows = {
  rowIndexes: number[];
  rows: Row[];
  nextRows: Row[];
};
