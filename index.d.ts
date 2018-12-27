// Type definitions for TOAST UI Grid v3.3.0
// TypeScript Version: 3.2.2

type HeaderOptions = any;
type anyFunc = (...args : any[]) => any;
type rowKeyType = number | string;
type ColumnValueType = number | string;
type jQueryObj = any;
type Row = any;
type Pagination = any;
type TreeRow = any;
type ColumnNameType = string;

interface SummaryColumnContentOptions {
    useAutoSummary?: boolean;
    template?: (...args: any[]) => string;
}

interface ColumnOptions {
    minWidth?: number;
    resizable?: boolean;
    frozenCount?: number;
    frozenBorderWidth?: number;
}

interface TreeColumnOptions {
    name?: string;
    useIcon: boolean;
    useCascadingCheckbox?: boolean;
}

interface CopyOptions {
    useFormattedValue: boolean;
}

interface RowHeadersOptions {
    type?: string;
    title?: string;
    width?: number;
    template?: anyFunc;
}
interface ValidationOptions {
    required?: boolean;
    dataType?: boolean | string | number;
}

interface EditingItemOptions {
    text: string;
    value: any;
}

interface EditingUIOptions {
    name?: string;
    useViewMode?: boolean;
    listItems?: EditingItemOptions[];
    onFocus?: anyFunc;
    onBlur?: anyFunc;
    onKeyDown?: anyFunc;
    prefix?: string | anyFunc;
    converter?: anyFunc;
}

interface ClipboardCopyOptions {
    useFormattedValue?: boolean;
    useListItemText?: boolean;
    customValue?: anyFunc;
}

interface RelationOptions {
    targetNames?: string[];
    disabled?: anyFunc;
    editable?: anyFunc;
    listItems?: anyFunc;

}

interface ColumnInfoOptions {
    name: string;
    ellipsis?: boolean;
    align?: string;
    valign?: string;
    className?: string;
    title?: string;
    width?: number;
    minWidth?: number;
    hidden?: boolean;
    resizable?: boolean;
    validation?: ValidationOptions;
    defaultValue?: string;
    formatter?: anyFunc;
    useHtmlEntity?: boolean;
    ignored?: boolean;
    sortable?: boolean;
    onBeforeChange?: anyFunc;
    onAfterChange?: anyFunc;
    editOptions?: EditingUIOptions;
    copyOptions?: ClipboardCopyOptions;
    relations?: RelationOptions[];
    whiteSpace?: string;
    component?: {
        name?: string;
        options?: any;
    };
}

interface SummaryObject {
    height?: number;
    position?: string;
    columnContent?: SummaryColumnContentOptions;
}

interface GridOptions {
    el: Element | jQueryObj;
    data?: any[];
    header?: HeaderOptions;
    virtualScrolling?: boolean;
    rowHeight?: string | number;
    minRowHeight?: number;
    bodyHeight?: string | number;
    minBodyHeight?: number;
    columnOptions?: ColumnOptions;
    treeColumnOptions?: TreeColumnOptions;
    copyOptions?: CopyOptions;
    useClientSort?: boolean;
    editingEvent?: string;
    scrollX?: boolean;
    scrollY?: boolean;
    showDummyRows?: boolean;
    keyColumnName?: string | null;
    heightResizable?: boolean;
    pagination?: Pagination;
    selectionUnit?: string;
    rowHeaders?: RowHeadersOptions;
    columns: ColumnInfoOptions[];
    summary?: SummaryObject;
    usageStatistics?: boolean;
}

interface TableOutlineStyleOptions {
    border?: string;
    showVerticalBorder?: boolean;
}

interface SelectionLayerStyleOptions {
    background?: string;
    border?: string;
}

interface ScrollbarStyleOptions {
    border?: string;
    background?: string;
    emptySpace?: string;
    thumb?: string;
    active?: string;
}

interface TableHeaderStyleOptions {
    background?: string;
    border?: string;
}

interface TableSummaryStyleOptions {
    background?: string;
    border?: string;
}

interface TableAreaStyleOptions {
    header?: TableHeaderStyleOptions;
    body?: {background?: string};
    summary?: TableSummaryStyleOptions;
}

interface CellStyleOptions {
    background?: string;
    border?: string;
    text?: string;
    showVerticalBorder?: boolean;
    showHorizontalBorder?: boolean;
}

interface BasicCellStyleOptions {
    background?: string;
    text?: string;
}

interface TableCellStyleOptions {
    normal?: CellStyleOptions;
    head?: CellStyleOptions;
    selectedHead?: {background?: string};
    rowHead?: CellStyleOptions;
    selectedRowHead?: {background?: string};
    summary?: CellStyleOptions;
    focused?: {
        background?: string;
        border?: string;
    };
    focusedInactive?: {border?: string};
    required?: BasicCellStyleOptions;
    editable?: BasicCellStyleOptions;
    disabled?: BasicCellStyleOptions;
    invalid?: BasicCellStyleOptions;
    currentRow?: BasicCellStyleOptions;
    evenRow?: BasicCellStyleOptions;
    oddRow?: BasicCellStyleOptions;
    dummy?: {background?: string};
}

interface PresetOptions {
    outline?: TableOutlineStyleOptions;
    selection?: SelectionLayerStyleOptions;
    scrollbar?: ScrollbarStyleOptions;
    frozenBorder?: {border?: string};
    area?: TableAreaStyleOptions;
    cell?: TableCellStyleOptions;
}

interface RemoveRowOptions {
    removeOriginalData?: boolean;
    keepRowSpanData?: boolean;
}

interface RowOptions {
    at?: number;
    extendPrevRowSpan?: boolean;
    focus?: boolean;
    parentRowKey?: number | string;
    offset?: number;
}

interface ModifiedOptions {
    checkedOnly?: boolean;
    withRawData?: boolean;
    rowKeyOnly?: boolean;
    ignoredColumns?: ColumnNameType[];
}

interface RequestOptions {
    url?: string;
    hasDataParam?: boolean;
    checkedOnly?: boolean;
    modifiedOnly?: boolean;
    showConfirm?: boolean;
    updateOriginal?: boolean;
    withCredentials?: boolean;
}

interface AddOn {
    reloadData(): void;
    readData(page: number, data: any, resetData: boolean): void;
    request(requestType: string, options: RequestOptions): boolean;
    download(type: string): void;
    setPerPage(perPage: number): void;
}

interface UrlMapObject {
    readData?: string;
    createData?: string;
    updateData?: string;
    modifyData?: string;
    deleteData?: string;
    downloadExcel?: string;
    downloadExcelAll?: string;
}

interface AddOnOptions {
    el?: jQueryObj;
    initialRequest?: boolean;
    readDataMethod?: string;
    api?: UrlMapObject;
    perPage?: number;
    enableAjaxHistory?: boolean;
    withCredentials?: boolean;
}

declare class Grid {
    constructor(options: GridOptions);

    static getInstanceById(id: number): Grid;
    static applyTheme(parseName: string, extOptions?: PresetOptions): void;
    static setLanguage(localeCode: string, data?: any): void;

    disable(): void;
    enable(): void;
    disableRow(rowKey: rowKeyType): void;
    enableRow(rowKey: rowKeyType): void;
    getValue(rowKey: rowKeyType, columnName: ColumnNameType, isOriginal?: boolean): number | string;
    getColumnValues(columnName: ColumnNameType, isJsonString?: boolean): any[] | string;
    getRow(rowKey: rowKeyType, isJsonString?: boolean): any | string;
    getRowAt(index: number, isJsonString?: boolean): any | string;
    getRowCount(): number;
    getFocusedCell(): number;
    getElement(rowKey: rowKeyType, columnName: ColumnNameType): jQueryObj;
    setValue(rowKey: rowKeyType, columnNamme: ColumnNameType, columnValue: ColumnValueType): void;
    setColumnValues(columnName: ColumnNameType, columnValue: ColumnValueType, isCheckCellState?: boolean): void;
    resetData(data: any[]): void;
    setData(data: any[], callback: (...args: any[]) => any): void;
    setBodyHeight(value: number): void;
    focus(rowKey: rowKeyType, columnName: ColumnNameType, isScrollable?: boolean): void;
    focusAt(rowIndex: rowKeyType, columnIndex: string, isScrollable?: boolean): void;
    focusIn(rowKey: rowKeyType, columnName: ColumnNameType, isScrollable?: boolean): void;
    focusInAt(rowIndex: rowKeyType, columnIndex: string, isScrollable?: boolean): void;
    activateFocus(): void;
    blur(): void;
    checkAll(): void;
    check(rowKey: rowKeyType): void;
    uncheckAll(): void;
    uncheck(rowKey: rowKeyType): void;
    clear(): void;
    removeRow(rowKey: rowKeyType, options: boolean | RemoveRowOptions);
    removeCheckedRows(showConfirm: boolean): boolean;
    enableCheck(rowKey: rowKeyType): boolean;
    disableCheck(rowKey: rowKeyType): boolean;
    getCheckedRowKeys(isJsonString?: boolean): rowKeyType[] | string;
    getCheckedRows(useJson?: boolean): any[] | string;
    getColumns(): ColumnInfoOptions[];
    getModifiedRows(options?: ModifiedOptions): any[];
    appendRow(row?: Row, options?: RowOptions): void;
    prependRow(row?: Row, options?: {focus?: boolean}): void;
    isModified(): boolean;
    getAddOn(name: string): AddOn;
    restore(): void;
    setFrozenColumnCount(count: number): void;
    setColumns(columns: ColumnInfoOptions[]): void;
    use(name: string, options: AddOnOptions): Grid;
    getRows(): Row[];
    sort(columnName: ColumnNameType, ascending?: boolean): void;
    unSort(): void;
    getSortState(): any;
    addCellClassName(rowKey: rowKeyType, columnName: ColumnNameType, className: string): void;
    addRowClassName(rowKey: rowKeyType, className: string): void;
    removeCellClassName(rowKey: rowKeyType, columnName: ColumnNameType, className: string): void;
    removeRowClassName(rowKey: rowKeyType, className: string): void;
    getRowSpanData(rowKey: rowKeyType, columnName: ColumnNameType): any;
    getIndexOfRow(rowKey: rowKeyType): number;
    getIndexOfColumn(columnName: ColumnNameType): number;
    getPagination(): Pagination;
    setWidth(width: number): void;
    setHeight(height: number): void;
    refreshLayout(): void;
    resetColumnWidths(): void;
    showColumn(...args: any[]): void;
    hideColumn(...args: any[]): void;
    setSummaryColumnContent(columnName: ColumnNameType, contents: string): void;
    setFooterColumnContent(columnName: ColumnNameType, contents: string): void;
    validate(): any[];
    findRows(conditions: {key: string, value: any}| anyFunc): Row[];
    copyToClipboard(): void;
    selection(range: Range): void;
    expand(rowKey: rowKeyType, recursive: boolean): any[];
    expandAll(): void;
    collapse(rowKey: rowKeyType, recursive: boolean): any[];
    collapseAll(): void;
    getAncestors(rowKey: rowKeyType): TreeRow[];
    getParent(rowKey: rowKeyType): TreeRow;
    getChildren(rowKey: rowKeyType): TreeRow[];
    getDepth(rowKey: rowKeyType): number;
    destroy(): void;
    on(eventName: string, handler: anyFunc): void;
}

declare module 'tui-grid' {
    export = Grid;
}
