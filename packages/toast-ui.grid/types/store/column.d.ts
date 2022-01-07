import { Side } from './focus';
import { CellValue, Row } from './data';
import { OptTree, Dictionary, OptColumnHeaderInfo, GridEventListener } from '../options';
import { HeaderRendererClass, CellRendererClass, CellRendererProps } from '../renderer';
import { CellEditorClass } from '../editor';
import { FilterOptionType, OperatorType } from './filterLayerState';

export type VisibleColumnsBySide = { [key in Side]: ColumnInfo[] };
export type CustomValue =
  | string
  | ((value: CellValue, rowAttrs: Row[], column: ColumnInfo) => string);
export type VAlignType = 'top' | 'middle' | 'bottom';
export type AlignType = 'left' | 'center' | 'right';
export type Formatter = ((props: FormatterProps) => string) | string;
export type RowHeaderType = 'rowNum' | 'checkbox' | 'draggable';
export type SortingType = 'asc' | 'desc';
export type ErrorCode =
  | 'REQUIRED'
  | 'TYPE_STRING'
  | 'TYPE_NUMBER'
  | 'MIN'
  | 'MAX'
  | 'REGEXP'
  | 'VALIDATOR_FN'
  | 'UNIQUE';
export type ErrorInfo = {
  code: ErrorCode;
} & Record<string, any>;
export type CustomValidatorResultWithMeta = { valid: boolean; meta: Record<string, any> };
export type CustomValidator = (
  value: CellValue,
  row: Row,
  columnName: string
) => boolean | CustomValidatorResultWithMeta;

export type Comparator = (valueA: CellValue, valueB: CellValue, rowA: Row, rowB: Row) => number;

export interface ClipboardCopyOptions {
  useFormattedValue?: boolean;
  useListItemText?: boolean;
  customValue?: CustomValue;
}

export interface ColumnOptions {
  minWidth?: number;
  frozenCount?: number;
  frozenBorderWidth?: number;
  resizable?: boolean;
}

export interface DataForColumnCreation {
  copyOptions: ClipboardCopyOptions;
  columnOptions: ColumnOptions;
  rowHeaders: ColumnInfo[];
  relationColumns: string[];
  treeColumnOptions: OptTree;
}

export interface CellEditorOptions {
  type: CellEditorClass;
  options?: Record<string, any>;
}

export interface CellRendererOptions {
  type: CellRendererClass;
  options?: Record<string, any>;
  styles?: Record<string, string | ((props: CellRendererProps) => string)>;
  attributes?: Record<string, string | ((props: CellRendererProps) => string)>;
  classNames?: string[];
}

export interface ColumnFilterOption {
  type: FilterOptionType;
  options?: Record<string, any>;
  operator?: OperatorType;
  showApplyBtn: boolean;
  showClearBtn: boolean;
}

export interface Validation {
  required?: boolean;
  dataType?: 'string' | 'number';
  min?: number;
  max?: number;
  regExp?: RegExp;
  unique?: boolean;
  validatorFn?: CustomValidator;
}

export interface FormatterProps {
  row: Row;
  column: ColumnInfo;
  value: CellValue;
}

export interface ListItem {
  text: string;
  value: CellValue;
}

export interface Relations {
  targetNames?: string[];
  listItems?: (relationParams: RelationCallbackData) => ListItem[];
  editable?: (relationParams: RelationCallbackData) => boolean;
  disabled?: (relationParams: RelationCallbackData) => boolean;
}

export interface RelationCallbackData {
  value?: CellValue;
  editable?: boolean;
  disabled?: boolean;
  row?: Row;
}

export interface ResizedColumn {
  columnName: string;
  width: number;
}

export interface InvalidColumn {
  columnName: string;
  errorCode: ErrorCode[];
  errorInfo: ErrorInfo[];
}

export interface CommonColumnInfo {
  header: string;
  hidden: boolean;
  align: AlignType;
  valign: VAlignType;
  minWidth: number;
  whiteSpace?: 'pre' | 'normal' | 'nowrap' | 'pre-wrap' | 'pre-line';
  ellipsis?: boolean;
  sortable?: boolean;
  escapeHTML?: boolean;
  validation?: Validation;
  className?: string;
  disabled?: boolean;
  ignored?: boolean;
  copyOptions?: ClipboardCopyOptions;
  defaultValue?: CellValue;
  resizable?: boolean;
  formatter?: Formatter;
  sortingType?: SortingType;
  onBeforeChange?: GridEventListener;
  onAfterChange?: GridEventListener;
  comparator?: Comparator;
  rowSpan?: boolean;
}

export interface ColumnInfo extends CommonColumnInfo {
  readonly name: string;
  headerAlign: AlignType;
  headerVAlign: VAlignType;
  baseWidth: number;
  fixedWidth: boolean;
  renderer: CellRendererOptions;
  editor?: CellEditorOptions;
  relationMap?: Dictionary<Relations>;
  related?: boolean;
  filter?: ColumnFilterOption | null;
  headerRenderer?: HeaderRendererClass | null;
  autoResizing: boolean;
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
  readonly visibleRowSpanEnabledColumns: ColumnInfo[];
  readonly defaultValues: { name: string; value: CellValue }[];
  readonly validationColumns: ColumnInfo[];
  readonly ignoredColumns: string[];
  readonly columnMapWithRelation: Dictionary<ColumnInfo>;
  readonly columnsWithoutRowHeader: ColumnInfo[];
  readonly emptyRow: Record<string, null>;
  readonly autoResizingColumn: ColumnInfo[];
  readonly treeColumnName?: string;
  readonly treeIcon?: boolean;
  readonly treeCascadingCheckbox?: boolean;
  readonly treeIndentWidth?: number;
  readonly draggable: boolean;
}
