// Type definitions for TOAST UI Grid v4.8.1
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

  interface ICellStyle {
    background?: string;
    border?: string;
    text?: string;
    showVerticalBorder?: boolean;
    showHorizontalBorder?: boolean;
  }

  interface IBasicCellStyle {
    background?: string;
    text?: string;
  }

  interface ICellFocusedStyle {
    background?: string;
    border?: string;
  }

  interface ICellDummyStyle {
    background?: string;
  }

  // Table Style
  interface ITableHeaderStyle {
    background?: string;
    border?: string;
  }

  interface ITableSummaryStyle {
    background?: string;
    border?: string;
  }

  interface ITableBodyStyle {
    background?: string;
  }

  interface ITableOutlineStyle {
    border?: string;
    showVerticalBorder?: boolean;
  }

  interface ISelectionLayerStyle {
    background?: string;
    border?: string;
  }

  interface IScrollbarStyle {
    border?: string;
    background?: string;
    emptySpace?: string;
    thumb?: string;
    active?: string;
  }

  interface IFrozenBorderStyle {
    border?: string;
  }

  interface ITableAreaStyle {
    header?: ITableHeaderStyle;
    body?: ITableBodyStyle;
    summary?: ITableSummaryStyle;
  }

  interface ITableCellStyle {
    normal?: ICellStyle;
    header?: ICellStyle;
    selectedHeader?: IBasicCellStyle;
    rowHeader?: ICellStyle;
    selectedRowHead?: IBasicCellStyle;
    summary?: ICellStyle;
    focused?: ICellFocusedStyle;
    focusedInactive?: ICellFocusedStyle;
    required?: IBasicCellStyle;
    editable?: IBasicCellStyle;
    disabled?: IBasicCellStyle;
    invalid?: IBasicCellStyle;
    currentRow?: IBasicCellStyle;
    evenRow?: IBasicCellStyle;
    oddRow?: IBasicCellStyle;
    dummy?: ICellDummyStyle;
  }

  interface IHeightResizeHandleStyle {
    background?: string;
    border?: string;
  }

  interface IPaginationStyle {
    background?: string;
    border?: string;
  }

  interface IPreset {
    outline?: ITableOutlineStyle;
    selection?: ISelectionLayerStyle;
    scrollbar?: IScrollbarStyle;
    frozenBorder?: IFrozenBorderStyle;
    area?: ITableAreaStyle;
    cell?: ITableCellStyle;
    heightResizeHandle?: IHeightResizeHandleStyle;
    pagination?: IPaginationStyle;
  }

  type RowKey = number | string;
  type Row = Dictionary<CellValue> & {
    rowKey: RowKey;
    rowSpanMap: RowSpanMap;
    _attributes: IRowAttributes;
  };

  interface IRow {
    [prop: string]: CellValue | RecursivePartial<IRowAttributes & IRowSpanAttribute> | IRow[];
    _attributes?: RecursivePartial<IRowAttributes & IRowSpanAttribute>;
    _children?: IRow[];
  }

  type RowSpanMap = Dictionary<IRowSpan>;

  interface IRowSpan {
    mainRow: boolean;
    mainRowKey: RowKey;
    count: number;
    spanCount: number;
  }

  interface IRowSpanAttribute {
    rowSpan?: Dictionary<number>;
  }

  type RowHeader = RowHeaderType | IRowHeaderColumn;
  type RowHeaderType = 'rowNum' | 'checkbox';

  interface IRowHeaderColumn extends Partial<IColumn> {
    type: RowHeaderType;
  }

  interface IRowAttributes {
    rowNum: number;
    checked: boolean;
    disabled: boolean;
    checkDisabled: boolean;
    className: { row: string[]; column: Dictionary<string[]> };
    height?: number;
    tree?: TreeRowInfo;
    expanded?: boolean;
  }

  interface IAppendRowOptions {
    at?: number;
    focus?: boolean;
    parentRowKey?: RowKey;
    extendPrevRowSpan?: boolean;
  }

  interface IPrependRowOptions {
    focus?: boolean;
  }

  interface IRemoveRowOptions {
    removeOriginalData?: boolean;
    keepRowSpanData?: boolean;
  }

  type IFilterOptionType = 'text' | 'number' | 'date' | 'select';
  type IOperatorType = 'AND' | 'OR';
  type INumberFilterCode = 'eq' | 'lt' | 'gt' | 'lte' | 'gte' | 'ne';
  type ITextFilterCode = 'eq' | 'ne' | 'contain' | 'start' | 'end';
  type IDateFilterCode = 'eq' | 'ne' | 'after' | 'afterEq' | 'before' | 'beforeEq';

  interface IFilterOpt {
    type: Exclude<IFilterOptionType, 'select'>;
    options?: Dictionary<any>;
    operator?: IOperatorType;
    showApplyBtn?: boolean;
    showClearBtn?: boolean;
  }

  interface IFilterState {
    code: INumberFilterCode | ITextFilterCode | IDateFilterCode | null;
    value: string;
  }

  interface IFilter {
    columnName: string;
    type: IFilterOptionType;
    operator?: IOperatorType;
    conditionFn?: Function;
    state: IFilterState[];
  }

  interface IColumn {
    name: string;
    header?: string;
    hidden?: boolean;
    width?: number | 'auto';
    renderer?: CellRenderer;
    editor?: CellEditor;
    formatter?: Formatter;
    defaultValue?: CellValue;
    resizable?: boolean;
    minWidth?: number;
    escapeHTML?: boolean;
    relations?: IRelations[];
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
    validation?: IValidation;
    filter?: IFilterOptionType | IFilterOpt;
    className?: string;
  }

  interface IColumnInfo {
    readonly name: string;
    header: string;
    minWidth: number;
    editor?: ICellEditorOptions;
    renderer: ICellRendererOptions;
    copyOptions?: ClipboardCopyOptions;
    hidden: boolean;
    formatter?: Formatter;
    baseWidth: number;
    resizable: boolean;
    fixedWidth: boolean;
    relationMap?: Dictionary<IRelations>;
    related?: boolean;
    align?: AlignType;
    valign?: VAlignType;
    whiteSpace?: 'pre' | 'normal' | 'norwap' | 'pre-wrap' | 'pre-line';
    ellipsis?: boolean;
    escapeHTML?: boolean;
    defaultValue?: CellValue;
    sortable?: boolean;
    sortingType?: SortingType;
    validation?: IValidation;
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

  interface IColumnOptions {
    minWidth?: number;
    frozenCount?: number;
    frozenBorderWidth?: number;
    resizable?: boolean;
  }

  type SummaryPosition = 'top' | 'bottom';

  interface ISummaryData {
    height?: number;
    position?: SummaryPosition;
    defaultContent?: string | ISummaryColumnContentMap;
    columnContent?: {
      [propName: string]: string | ISummaryColumnContentMap;
    };
  }

  interface ISummaryColumnContentMap {
    useAutoSummary?: boolean;
    template?: (valueMap: ISummaryValueMap) => string;
  }

  interface ISummaryValueMap {
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

  interface IRelations {
    targetNames?: string[];
    listItems?: (relationParams: IRelationCallbackData) => IListItem[];
    editable?: (relationParams: IRelationCallbackData) => boolean;
    disabled?: (relationParams: IRelationCallbackData) => boolean;
  }

  interface IListItem {
    text: string;
    value: CellValue;
  }

  interface IRelationCallbackData {
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

  interface IValidation {
    required?: boolean;
    dataType?: 'string' | 'number';
    min?: number;
    max?: number;
    regExp?: RegExp;
    validatorFn?: (value: CellValue) => boolean;
  }

  interface IInvalidColumn {
    columnName: string;
    errorCode: ValidationType[];
  }

  interface IInvalidRow {
    rowKey: RowKey;
    errors: IInvalidColumn[];
  }

  interface ITree {
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

  interface II18nData {
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

  type CustomValue = string | ((value: CellValue, rowAttrs: Row[], column: IColumnInfo) => string);

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

  type RequestType = 'createData' | 'updateData' | 'deleteData' | 'modifyData';

  type Params = {
    rows?: Row[] | RowKey[];
    createdRows?: Row[] | RowKey[];
    updatedRows?: Row[] | RowKey[];
    deletedRows?: Row[] | RowKey[];
    page?: number;
    perPage?: number;
    sortColumn?: string;
    sortAscending?: boolean;
  } & Dictionary<any>;

  interface IDataSource {
    initialRequest?: boolean;
    withCredentials?: boolean;
    api: IApi;
  }

  interface IApi {
    createData?: IApiInfo;
    readData: IApiInfo;
    updateData?: IApiInfo;
    deleteData?: IApiInfo;
    modifyData?: IApiInfo;
  }

  interface IApiInfo {
    url: string;
    method: string;
  }

  interface IRequestOptions {
    url?: string;
    method?: string;
    checkedOnly?: boolean;
    modifiedOnly?: boolean;
    showConfirm?: boolean;
    withCredentials?: boolean;
  }

  interface IModifiedRowsOptions {
    checkedOnly?: boolean;
    withRawData?: boolean;
    rowKeyOnly?: boolean;
    ignoredColumns?: string[];
  }

  type CellEditor = TypeObjectOptions<string | ICellEditorClass>;

  interface ICellEditorClass {
    new (props: ICellEditorProps): ICellEditor;
  }

  interface ICellEditorProps {
    grid: Grid;
    rowKey: RowKey;
    columnInfo: IColumnInfo;
    value: CellValue;
  }

  interface ICellEditorOptions {
    type: ICellEditorClass;
    options?: Dictionary<any>;
  }

  interface ICellEditor {
    getElement(): HTMLElement | undefined;
    getValue(): string;
    mounted?(): void;
    beforeDestroy?(): void;
  }

  type CellRenderer = TypeObjectOptions<string | ICellRendererClass>;
  type CellRendererProps = ICellRenderData & {
    grid: Grid;
    rowKey: RowKey;
    columnInfo: IColumnInfo;
    allDisabled: boolean;
  };

  interface ICellRenderData {
    editable: boolean;
    disabled: boolean;
    invalidStates: ValidationType[];
    formattedValue: string;
    value: CellValue;
    className: string;
  }

  interface ICellRendererClass {
    new (params: CellRendererProps, options?: any): ICellRenderer;
  }

  interface ICellRendererOptions {
    type: ICellRendererClass;
    options?: Dictionary<any>;
  }

  interface ICellRenderer {
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
    filter?: IFilterOpt | null;
    headerRenderer?: HeaderRendererClass | null;
  }

  type HeaderRendererProps = {
    grid: Grid;
    columnInfo: ColumnHeaderInfo;
  };

  interface HeaderRenderer {
    getElement(): HTMLElement;
    render(props: HeaderRendererProps): void;
    mounted?(parent: HTMLElement): void;
    beforeDestroy?(): void;
  }

  interface HeaderRendererClass {
    new (params: HeaderRendererProps, options?: any): HeaderRenderer;
  }

  type Formatter = ((props: IFormatterProps) => string) | string;

  interface IFormatterProps {
    row: Row;
    column: IColumnInfo;
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

  interface IGridOptions {
    el: HTMLElement;
    data?: IRow[] | IDataSource;
    columns: IColumn[];
    columnOptions?: IColumnOptions;
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
    summary?: ISummaryData;
    useClientSort?: boolean;
    selectionUnit?: SelectionUnit;
    showDummyRows?: boolean;
    copyOptions?: ClipboardCopyOptions;
    pageOptions?: PageOptions;
    treeColumnOptions?: ITree;
    header?: IHeader;
    usageStatistics?: boolean;
    onGridMounted?: Function;
    onGridBeforeDestroy?: Function;
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

  class Grid {
    public static applyTheme(presetName: ThemeOptionPresetNames, extOptions?: IPreset): void;

    public static setLanguage(localeCode: string, data?: II18nData): void;

    constructor(options: IGridOptions);

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

    public focusAt(rowIndex: number, columnIndex: number, isScrollable?: boolean): boolean;

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
      columnContent: string | ISummaryColumnContentMap
    ): void;

    public getSummaryValues(columnName: string): ISummaryValueMap | null;

    public getColumns(): IColumnInfo[];

    public setColumns(columns: IColumn[]): void;

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

    public validate(): IInvalidRow[];

    public enable(): void;

    public disable(): void;

    public disableRow(rowKey: RowKey, withCheckbox?: boolean): void;

    public enableRow(rowKey: RowKey, withCheckbox?: boolean): void;

    public disableRowCheck(rowKey: RowKey): void;

    public enableRowCheck(rowKey: RowKey): void;

    public appendRow(row?: IRow, options?: IAppendRowOptions): void;

    public prependRow(row: IRow, options?: IPrependRowOptions): void;

    public removeRow(rowKey: RowKey, options?: IRemoveRowOptions): void;

    public getRow(rowKey: RowKey): Row | null;

    public getRowAt(rowIdx: number): Row | null;

    public getIndexOfRow(rowKey: RowKey): number;

    public getData(): Row[];

    public getRowCount(): number;

    public clear(): void;

    public resetData(data: IRow[]): void;

    public addCellClassName(rowKey: RowKey, columnName: string, className: string): void;

    public addRowClassName(rowKey: RowKey, className: string): void;

    public removeCellClassName(rowKey: RowKey, columnName: string, className: string): void;

    public removeRowClassName(rowKey: RowKey, className: string): void;

    public on(eventName: string, fn: Function): void;

    public off(eventName: string, fn?: Function): void;

    public getPagination(): Pagination | null;

    public setPerPage(perPage: number): void;

    public isModified(): boolean;

    public getModifiedRows(options?: IModifiedRowsOptions): Dictionary<Row[] | RowKey[]>;

    public readData(page: number, data?: Params, resetData?: boolean): void;

    public request(requestType: RequestType, options?: IRequestOptions): void;

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

    public getRowSpanData(rowKey: RowKey, columnName: string): IRowSpan | null;

    public resetOriginData(): void;

    public removeCheckedRows(showConfirm?: boolean): boolean;

    public refreshLayout(): void;

    public destroy(): void;

    public setFilter(columnName: string, filterOpt: IFilterOpt | IFilterOptionType): void;

    public getFilterState(): IFilter[] | null;

    public filter(columnName: string, state: IFilterState[]): void;

    public unfilter(columnName: string): void;

    public addColumnClassName(columnName: string, className: string): void;

    public removeColumnClassName(columnName: string, className: string): void;

    public setRow(rowKey: RowKey, row: IRow): void;

    public moveRow(rowKey: RowKey, targetIndex: number): void;
  }
}

declare module 'tui-grid' {
  export default tuiGrid.Grid;
}
