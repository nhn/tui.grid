// Type definitions for TOAST UI Grid v4.9.1
// TypeScript Version: 3.7.2

declare namespace tuiGrid {
  type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };
  type TypeObjectOptions<T> =
    | T
    | {
        type: T;
        options?: Dictionary<any>;
      };
  interface Dictionary<T> {
    [index: string]: T;
  }

  type CellValue = number | string | boolean | null | undefined;

  type ThemeOptionPresetNames = 'default' | 'striped' | 'clean';

  type SortingType = 'asc' | 'desc';

  type VAlignType = 'top' | 'middle' | 'bottom';

  type AlignType = 'left' | 'center' | 'right';

  interface CellStyle {
    background?: string;
    border?: string;
    text?: string;
    showVerticalBorder?: boolean;
    showHorizontalBorder?: boolean;
  }

  interface BasicCellStyle {
    background?: string;
    text?: string;
  }

  interface CellFocusedStyle {
    background?: string;
    border?: string;
  }

  interface CellDummyStyle {
    background?: string;
  }

  // Table Style
  interface TableHeaderStyle {
    background?: string;
    border?: string;
  }

  interface TableSummaryStyle {
    background?: string;
    border?: string;
  }

  interface TableBodyStyle {
    background?: string;
  }

  interface TableOutlineStyle {
    border?: string;
    showVerticalBorder?: boolean;
  }

  interface SelectionLayerStyle {
    background?: string;
    border?: string;
  }

  interface ScrollbarStyle {
    border?: string;
    background?: string;
    emptySpace?: string;
    thumb?: string;
    active?: string;
  }

  interface FrozenBorderStyle {
    border?: string;
  }

  interface TableAreaStyle {
    header?: TableHeaderStyle;
    body?: TableBodyStyle;
    summary?: TableSummaryStyle;
  }

  interface TableCellStyle {
    normal?: CellStyle;
    header?: CellStyle;
    selectedHeader?: BasicCellStyle;
    rowHeader?: CellStyle;
    selectedRowHead?: BasicCellStyle;
    summary?: CellStyle;
    focused?: CellFocusedStyle;
    focusedInactive?: CellFocusedStyle;
    required?: BasicCellStyle;
    editable?: BasicCellStyle;
    disabled?: BasicCellStyle;
    invalid?: BasicCellStyle;
    currentRow?: BasicCellStyle;
    evenRow?: BasicCellStyle;
    oddRow?: BasicCellStyle;
    dummy?: CellDummyStyle;
  }

  interface HeightResizeHandleStyle {
    background?: string;
    border?: string;
  }

  interface PaginationStyle {
    background?: string;
    border?: string;
  }

  interface Preset {
    outline?: TableOutlineStyle;
    selection?: SelectionLayerStyle;
    scrollbar?: ScrollbarStyle;
    frozenBorder?: FrozenBorderStyle;
    area?: TableAreaStyle;
    cell?: TableCellStyle;
    heightResizeHandle?: HeightResizeHandleStyle;
    pagination?: PaginationStyle;
  }

  type RowKey = number | string;
  type Row = Dictionary<CellValue> & {
    rowKey: RowKey;
    sortKey: number;
    uniqueKey: string;
    rowSpanMap: RowSpanMap;
    _attributes: RowAttributes;
    _relationListItemMap: Dictionary<ListItem[]>;
  };

  interface RowData {
    [prop: string]: CellValue | RecursivePartial<RowAttributes & RowSpanAttribute> | RowData[];
    _attributes?: RecursivePartial<RowAttributes & RowSpanAttribute>;
    _children?: RowData[];
  }

  type RowSpanMap = Dictionary<RowSpan>;

  interface RowSpan {
    mainRow: boolean;
    mainRowKey: RowKey;
    count: number;
    spanCount: number;
  }

  interface RowSpanAttribute {
    rowSpan?: Dictionary<number>;
  }

  type RowHeader = RowHeaderType | RowHeaderColumn;
  type RowHeaderType = 'rowNum' | 'checkbox';

  interface RowHeaderColumn extends Partial<Column> {
    type: RowHeaderType;
  }

  interface RowAttributes {
    rowNum: number;
    checked: boolean;
    disabled: boolean;
    checkDisabled: boolean;
    className: { row: string[]; column: Dictionary<string[]> };
    height?: number;
    tree?: TreeRowInfo;
    expanded?: boolean;
  }

  interface AppendRowOptions {
    at?: number;
    focus?: boolean;
    parentRowKey?: RowKey;
    extendPrevRowSpan?: boolean;
  }

  interface PrependRowOptions {
    focus?: boolean;
  }

  interface RemoveRowOptions {
    removeOriginalData?: boolean;
    keepRowSpanData?: boolean;
  }

  type FilterOptionType = 'text' | 'number' | 'date' | 'select';
  type OperatorType = 'AND' | 'OR';
  type NumberFilterCode = 'eq' | 'lt' | 'gt' | 'lte' | 'gte' | 'ne';
  type TextFilterCode = 'eq' | 'ne' | 'contain' | 'start' | 'end';
  type DateFilterCode = 'eq' | 'ne' | 'after' | 'afterEq' | 'before' | 'beforeEq';

  interface FilterOpt {
    type: Exclude<FilterOptionType, 'select'>;
    options?: Dictionary<any>;
    operator?: OperatorType;
    showApplyBtn?: boolean;
    showClearBtn?: boolean;
  }

  interface FilterState {
    code: NumberFilterCode | TextFilterCode | DateFilterCode | null;
    value: string;
  }

  interface Filter {
    columnName: string;
    type: FilterOptionType;
    operator?: OperatorType;
    conditionFn?: Function;
    state: FilterState[];
  }

  interface Column {
    name: string;
    header?: string;
    hidden?: boolean;
    width?: number | 'auto';
    renderer?: CellRendererInfo;
    editor?: CellEditorInfo;
    formatter?: Formatter;
    defaultValue?: CellValue;
    resizable?: boolean;
    minWidth?: number;
    escapeHTML?: boolean;
    relations?: Relations[];
    align?: AlignType;
    valign?: VAlignType;
    whiteSpace?: 'pre' | 'normal' | 'norwap' | 'pre-wrap' | 'pre-line';
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

  interface ColumnInfo {
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

  interface ComplexColumnInfo {
    header: string;
    name: string;
    childNames: string[];
    headerAlign?: AlignType;
    headerVAlign?: VAlignType;
    renderer?: HeaderRendererClass;
    hideChildHeaders?: boolean;
  }

  interface ColumnOptions {
    minWidth?: number;
    frozenCount?: number;
    frozenBorderWidth?: number;
    resizable?: boolean;
  }

  type SummaryPosition = 'top' | 'bottom';

  interface SummaryData {
    height?: number;
    position?: SummaryPosition;
    defaultContent?: string | SummaryColumnContentMap;
    columnContent?: {
      [propName: string]: string | SummaryColumnContentMap;
    };
  }

  interface SummaryColumnContentMap {
    useAutoSummary?: boolean;
    template?: (valueMap: SummaryValueMap) => string;
  }

  interface SummaryValueMap {
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

  interface Relations {
    targetNames?: string[];
    listItems?: (relationParams: RelationCallbackData) => ListItem[];
    editable?: (relationParams: RelationCallbackData) => boolean;
    disabled?: (relationParams: RelationCallbackData) => boolean;
  }

  interface ListItem {
    text: string;
    value: CellValue;
  }

  interface RelationCallbackData {
    value?: CellValue;
    editable?: boolean;
    disabled?: boolean;
    row?: Row;
  }

  export type ValidationType =
    | 'REQUIRED'
    | 'TYPE_STRING'
    | 'TYPE_NUMBER'
    | 'MIN'
    | 'MAX'
    | 'REGEXP'
    | 'VALIDATOR_FN';

  interface Validation {
    required?: boolean;
    dataType?: 'string' | 'number';
    min?: number;
    max?: number;
    regExp?: RegExp;
    validatorFn?: (value: CellValue, row: Row, columnName: string) => boolean;
  }

  interface InvalidColumn {
    columnName: string;
    errorCode: ValidationType[];
  }

  interface InvalidRow {
    rowKey: RowKey;
    errors: InvalidColumn[];
  }

  interface Tree {
    name: string;
    useIcon?: boolean;
    useCascadingCheckbox?: boolean;
  }

  interface TreeRowInfo {
    parentRowKey: RowKey | null;
    childRowKeys: RowKey[];
    expanded?: boolean;
    hiddenChild?: boolean;
  }

  interface I18nData {
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

  interface SortState {
    useClient: boolean;
    columns: {
      columnName: string;
      ascending: boolean;
    }[];
  }

  type CustomValue = string | ((value: CellValue, rowAttrs: Row[], column: ColumnInfo) => string);

  interface ClipboardCopyOptions {
    useFormattedValue?: boolean;
    useListItemText?: boolean;
    customValue?: CustomValue;
  }

  interface PageOptions {
    useClient?: boolean;
    perPage?: number;
    page?: number;
    totalCount?: number;
  }

  type Serializer = (params: Params) => string;

  type AjaxConfig = {
    contentType?: ContentType;
    mimeType?: string;
    withCredentials?: boolean;
    headers?: Dictionary<string>;
    serializer?: Serializer;
  };

  type ContentType = 'application/x-www-form-urlencoded' | 'application/json';

  type RequestType = 'createData' | 'updateData' | 'deleteData' | 'modifyData';

  type Url = string | (() => string);

  type ModifiedRows = {
    createdRows?: Row[] | RowKey[];
    updatedRows?: Row[] | RowKey[];
    deletedRows?: Row[] | RowKey[];
  };

  type Params = {
    rows?: Row[] | RowKey[];
    page?: number;
    perPage?: number;
    sortColumn?: string;
    sortAscending?: boolean;
  } & ModifiedRows &
    Dictionary<any>;

  type ApiInfo = {
    url: Url;
    method: string;
    initParams?: Dictionary<any>;
  } & AjaxConfig;

  type DataSource = {
    initialRequest?: boolean;
    api: Api;
    hideLoadingBar?: boolean;
  } & AjaxConfig;

  interface Api {
    createData?: ApiInfo;
    readData: ApiInfo;
    updateData?: ApiInfo;
    deleteData?: ApiInfo;
    modifyData?: ApiInfo;
  }

  interface RequestOptions {
    url?: string;
    method?: string;
    checkedOnly?: boolean;
    modifiedOnly?: boolean;
    showConfirm?: boolean;
    withCredentials?: boolean;
  }

  interface ModifiedRowsOptions {
    checkedOnly?: boolean;
    withRawData?: boolean;
    rowKeyOnly?: boolean;
    ignoredColumns?: string[];
  }

  type CellEditorInfo = TypeObjectOptions<string | CellEditorClass>;

  interface CellEditorClass {
    new (props: CellEditorProps): CellEditor;
  }

  interface CellEditorProps {
    grid: Grid;
    rowKey: RowKey;
    columnInfo: ColumnInfo;
    value: CellValue;
  }

  interface CellEditorOptions {
    type: CellEditorClass;
    options?: Dictionary<any>;
  }

  interface CellEditor {
    getElement(): HTMLElement | undefined;
    getValue(): string;
    mounted?(): void;
    beforeDestroy?(): void;
  }

  type CellRendererInfo = TypeObjectOptions<string | CellRendererClass>;
  type CellRendererProps = CellRenderData & {
    grid: Grid;
    rowKey: RowKey;
    columnInfo: ColumnInfo;
  };

  interface CellRenderData {
    editable: boolean;
    disabled: boolean;
    invalidStates: ValidationType[];
    formattedValue: string;
    value: CellValue;
    className: string;
  }

  interface CellRendererClass {
    new (params: CellRendererProps, options?: any): CellRenderer;
  }

  interface CellRendererOptions {
    type: CellRendererClass;
    options?: Dictionary<any>;
  }

  interface CellRenderer {
    getElement(): HTMLElement;
    focused?(): void;
    mounted?(parent: HTMLElement): void;
    render(props: CellRendererProps): void;
    beforeDestroy?(): void;
  }

  interface ColumnHeaderInfo {
    name: string;
    header: string;
    headerAlign?: AlignType;
    headerVAlign?: VAlignType;
    sortable?: boolean;
    sortingType?: SortingType;
    filter?: FilterOpt | null;
    headerRenderer?: HeaderRendererClass | null;
  }

  type HeaderRendererProps = {
    grid: Grid;
    columnInfo: ColumnHeaderInfo;
  };

  type ModificationTypeCode = 'CREATE' | 'UPDATE' | 'DELETE';

  interface HeaderRenderer {
    getElement(): HTMLElement;
    render(props: HeaderRendererProps): void;
    mounted?(parent: HTMLElement): void;
    beforeDestroy?(): void;
  }

  interface HeaderRendererClass {
    new (params: HeaderRendererProps, options?: any): HeaderRenderer;
  }

  type Formatter = ((props: FormatterProps) => string) | string;

  interface FormatterProps {
    row: Row;
    column: ColumnInfo;
    value: CellValue;
  }

  interface ColumnHeaderOption {
    name: string;
    align?: AlignType;
    valign?: VAlignType;
    renderer?: HeaderRendererClass;
  }

  interface IHeader {
    height?: number;
    complexColumns?: ComplexColumnInfo[];
    align?: AlignType;
    valign?: VAlignType;
    columns?: ColumnHeaderOption[];
  }

  type SelectionUnit = 'cell' | 'row';
  type EditingEvent = 'click' | 'dblclick';
  type TabMode = 'move' | 'moveAndEdit';

  interface GridOptions {
    el: HTMLElement;
    data?: RowData[] | DataSource;
    columns: Column[];
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
    rowHeaders?: RowHeader[];
    summary?: SummaryData;
    useClientSort?: boolean;
    selectionUnit?: SelectionUnit;
    showDummyRows?: boolean;
    copyOptions?: ClipboardCopyOptions;
    pageOptions?: PageOptions;
    treeColumnOptions?: Tree;
    header?: IHeader;
    usageStatistics?: boolean;
    onGridMounted?: (ev: GridEvent) => void;
    onGridUpdated?: (ev: GridEvent) => void;
    onGridBeforeDestroy?: (ev: GridEvent) => void;
    tabMode?: TabMode;
    disabled?: boolean;
  }

  class Pagination {
    constructor(element: string | HTMLElement, options?: object);

    getCurrentPage(): number;

    movePageTo(targetPage: number): void;

    reset(totalItems: number): void;

    setItemsPerPage(itemCount: number): void;

    setTotalItems(itemCount: number): void;

    on(eventType: string, callback: (evt: any) => void): void;

    off(eventType: string): void;
  }

  type Range = [number, number];

  interface SelectionRange {
    row: Range;
    column: Range;
  }

  interface ResizedColumn {
    columnName: string;
    width: number;
  }

  interface GridEventProps {
    value?: CellValue;
    prevValue?: CellValue;
    nextValue?: CellValue;
    event?: MouseEvent;
    rowKey?: RowKey | null;
    columnName?: string | null;
    prevRowKey?: RowKey | null;
    prevColumnName?: string | null;
    range?: SelectionRange | null;
    xhr?: XMLHttpRequest;
    sortState?: SortState;
    filterState?: Filter[] | null;
    resizedColumns?: ResizedColumn[];
  }

  class GridEvent {
    constructor(props: GridEventProps);

    public stop(): void;

    public isStopped(): boolean;

    public assignData(data: GridEventProps): void;
  }

  class Grid {
    public static applyTheme(presetName: ThemeOptionPresetNames, extOptions?: Preset): void;

    public static setLanguage(localeCode: string, data?: I18nData): void;

    constructor(options: GridOptions);

    public setWidth(width: number): void;

    public setHeight(height: number): void;

    public setBodyHeight(bodyHeight: number): void;

    public setHeader({ height, complexColumns }: IHeader): void;

    public setFrozenColumnCount(count: number): void;

    public hideColumn(columnName: string): void;

    public showColumn(columnName: string): void;

    public setSelectionRange(range: { start: Range; end: Range }): void;

    public getFocusedCell(): {
      rowKey: string | number | null;
      columnName: string | null;
      value: CellValue;
    };

    public blur(): void;

    public focus(rowKey: RowKey, columnName: string, setScroll?: boolean): boolean;

    public focusAt(rowIndex: number, columnIndex: number, setScroll?: boolean): boolean;

    public activateFocus(): void;

    public startEditing(rowKey: RowKey, columnName: string, setScroll?: boolean): void;

    public startEditingAt(rowIndex: number, columnIndex: number, setScroll?: boolean): void;

    public finishEditing(rowKey?: RowKey, columnName?: string, value?: string): void;

    public setValue(rowKey: RowKey, columnName: string, value: CellValue): void;

    public getValue(rowKey: RowKey, columnName: string): CellValue | null;

    public setColumnValues(
      columnName: string,
      columnValue: CellValue,
      checkCellState?: boolean
    ): void;

    public getElement(rowKey: RowKey, columnName: string): Element | null;

    public setSummaryColumnContent(
      columnName: string,
      columnContent: string | SummaryColumnContentMap
    ): void;

    public getSummaryValues(columnName: string): SummaryValueMap | null;

    public getColumns(): ColumnInfo[];

    public setColumns(columns: Column[]): void;

    public setColumnHeaders(columnsMap: Dictionary<string>): void;

    public resetColumnWidths(widths: number[]): void;

    public getColumnValues(columnName: string): CellValue[];

    public getIndexOfColumn(columnName: string): number;

    public check(rowKey: RowKey): void;

    public uncheck(rowKey: RowKey): void;

    public checkAll(): void;

    public uncheckAll(): void;

    public getCheckedRowKeys(): RowKey[];

    public getCheckedRows(): Row[];

    public findRows(conditions: ((row: Row) => boolean) | Dictionary<any>): Row[];

    public sort(columnName: string, ascending: boolean, multiple?: boolean): void;

    public unsort(columnName?: string): void;

    public getSortState(): SortState;

    public copyToClipboard(): void;

    public validate(): InvalidRow[];

    public enable(): void;

    public disable(): void;

    public disableRow(rowKey: RowKey, withCheckbox?: boolean): void;

    public enableRow(rowKey: RowKey, withCheckbox?: boolean): void;

    public disableColumn(columnName: string): void;

    public enableColumn(columnName: string): void;

    public disableRowCheck(rowKey: RowKey): void;

    public enableRowCheck(rowKey: RowKey): void;

    public appendRow(row?: RowData, options?: AppendRowOptions): void;

    public prependRow(row: RowData, options?: PrependRowOptions): void;

    public removeRow(rowKey: RowKey, options?: RemoveRowOptions): void;

    public getRow(rowKey: RowKey): Row | null;

    public getRowAt(rowIdx: number): Row | null;

    public getIndexOfRow(rowKey: RowKey): number;

    public getData(): Row[];

    public getRowCount(): number;

    public clear(): void;

    public resetData(data: RowData[]): void;

    public addCellClassName(rowKey: RowKey, columnName: string, className: string): void;

    public addRowClassName(rowKey: RowKey, className: string): void;

    public removeCellClassName(rowKey: RowKey, columnName: string, className: string): void;

    public removeRowClassName(rowKey: RowKey, className: string): void;

    public on(eventName: string, fn: Function): void;

    public off(eventName: string, fn?: Function): void;

    public getPagination(): Pagination | null;

    public setPerPage(perPage: number): void;

    public isModified(): boolean;

    public getModifiedRows(options?: ModifiedRowsOptions): ModifiedRows;

    public readData(page: number, data?: Params, resetData?: boolean): void;

    public request(requestType: RequestType, options?: RequestOptions): void;

    public reloadData(): void;

    public restore(): void;

    public expand(rowKey: RowKey, recursive?: boolean): void;

    public expandAll(): void;

    public collapse(rowKey: RowKey, recursive?: boolean): void;

    public collapseAll(): void;

    public getParentRow(rowKey: RowKey): Row | null;

    public getChildRows(rowKey: RowKey): Row[];

    public getAncestorRows(rowKey: RowKey): Row[];

    public getDescendantRows(rowKey: RowKey): Row[];

    public getDepth(rowKey: RowKey): number;

    public getRowSpanData(rowKey: RowKey, columnName: string): RowSpan | null;

    public resetOriginData(): void;

    public removeCheckedRows(showConfirm?: boolean): boolean;

    public refreshLayout(): void;

    public destroy(): void;

    public setFilter(columnName: string, filterOpt: FilterOpt | FilterOptionType): void;

    public getFilterState(): Filter[] | null;

    public filter(columnName: string, state: FilterState[]): void;

    public unfilter(columnName: string): void;

    public addColumnClassName(columnName: string, className: string): void;

    public removeColumnClassName(columnName: string, className: string): void;

    public setRow(rowKey: RowKey, row: RowData): void;

    public moveRow(rowKey: RowKey, targetIndex: number): void;

    public setRequestParams(params: Dictionary<any>): void;

    public clearModifiedData(type?: ModificationTypeCode): void;

    public appendRows(data: RowData[]): void;
  }
}

declare module 'tui-grid' {
  export default tuiGrid.Grid;
}
