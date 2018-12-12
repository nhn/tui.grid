/**
 * Type definitions for tui.grid v3.3.0
 * TypeScript Version: 3.2
 */

type HeaderOptions = any;
type anyFunc = (...args: Array<any>) => any;
type rowKeyType = number | string;
type ColumnValueType = number | string;
type jQuery = any;
type Row = any;
type Pagination = any;
type TreeRow = any;
type ColumnNameType = string;
type SummaryColumnConfig = any;

interface ColumnOptions {
    minWidth?: number;
    resizable?: boolean;
    frozenCount?: number;
    frozenBorderWidth?: number;
}

interface TreeColumnOptions {
    name?: string,
    useIcon: boolean,
    useCascadingCheckbox?: boolean
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
    listItems?: Array<EditingItemOptions>;
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
    targetNames?: Array<string>;
    disabled?: anyFunc;
    editable?: anyFunc;
    listItems?: anyFunc;

}

interface ColumnConfig {
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
    relations?: Array<RelationOptions>;
    whiteSpace?: string;
    component?: {
        name?: string;
        options?: any;
    }
}

interface SummaryObject {
    height?: number;
    position?: string;
    columnContent?: SummaryColumnConfig;
}

interface GridOptions {
    el: Element | jQuery;
    data?: Array<any>;
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
    columns: Array<ColumnConfig>;
    summary?: SummaryObject;
    usageStatistics?: boolean;
}

interface TableOutlineStyleConfig {
    border?: string;
    showVerticalBorder?: boolean;
}

interface SelectionLayerStyleConfig {
    background?: string;
    border?: string;
}

interface ScrollbarStyleConfig {
    border?: string;
    background?: string;
    emptySpace?: string;
    thumb?: string;
    active?: string;
}

interface TableHeaderStyleConfig {
    background?: string;
    border?: string;
}

interface TableSummaryStyleConfig {
    background?: string;
    border?: string;
}

interface TableAreaStyleConfig {
    header?: TableHeaderStyleConfig;
    body?: {background?: string};
    summary?: TableSummaryStyleConfig;
}

interface CellStyleConfig {
    background?: string;
    border?: string;
    text?: string;
    showVerticalBorder?: boolean;
    showHorizontalBorder?: boolean;
}

interface BasicCellStyleConfig {
    background?: string;
    text?: string;
}

interface TableCellStyleConfig {
    normal?: CellStyleConfig;
    head?: CellStyleConfig;
    selectedHead?: {background?: string};
    rowHead?: CellStyleConfig;
    selectedRowHead?: {background?: string};
    summary?: CellStyleConfig;
    focused?: BasicCellStyleConfig;
    focusedInactive?: {border?: string};
    required?: BasicCellStyleConfig;
    editable?: BasicCellStyleConfig;
    disabled?: BasicCellStyleConfig;
    invalid?: BasicCellStyleConfig;
    currentRow?: BasicCellStyleConfig;
    evenRow?: BasicCellStyleConfig;
    dummy?: {backgorund?: string};
}

interface PresetOptions {
    outline?: TableOutlineStyleConfig;
    selection?: SelectionLayerStyleConfig;
    scrollbar?: ScrollbarStyleConfig;
    frozenBorder?: {area?: string};
    area?: TableAreaStyleConfig;
    cell?: TableCellStyleConfig;
}

interface RemoveRowOptions {
    removeOriginalData?: boolean;
    keepRowSpanData?: boolean;
}

interface RowConfig {
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
    ignoredColumns?: Array<ColumnNameType>;
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

interface AddOnConfig {
    el?: jQuery;
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
    enable():void;
    disableRow(rowKey: rowKeyType): void;
    enableRow(rowKey: rowKeyType): void;
    getValue(rowKey: rowKeyType, columnName: ColumnNameType, isOriginal?: boolean): number | string;
    getColumnValues(columnName: ColumnNameType, isJsonString?: boolean): Array<any> | string;
    getRow(rowKey: rowKeyType, isJsonString?: boolean): any | string;
    getRowAt(index: number, isJsonString?: boolean): any | string;
    getRowCount(): number;
    getFocusedCell(): number;
    getElement(rowKey: rowKeyType, columnName: ColumnNameType): jQuery;
    setValue(rowKey: rowKeyType, columnNamme: ColumnNameType, columnValue: ColumnValueType): void;
    setColumnValues(columnName: ColumnNameType, columnValue: ColumnValueType, isCheckCellState?: boolean): void;
    resetData(data: Array<any>): void;
    setData(data: Array<any>, callback: (...args: Array<any>) => any): void;
    setBodyHeight(value: number): void;
    focus(rowKey: rowKeyType, columnName: ColumnNameType, isScrollable?: boolean): void;
    focusAt(rowIndex: rowKeyType, columnIndex: string, isScrollable?: boolean): void;
    focusIn(rowKey: rowKeyType, columnName: ColumnNameType, isScrollable?: boolean): void;
    focusInAt(rowIndex: rowKeyType, columnIndex: string, isScrollable?: boolean): void;
    activateFocus(): void;
    blur(): void;
    checkAll(): void;
    check(rowKey: rowKeyType): void;
    uncheckAll():void;
    uncheck(rowKey: rowKeyType): void;
    clear(): void;
    removeRow(rowKey: rowKeyType, options: boolean | RemoveRowOptions);
    removeCheckedRows(showConfirm: boolean): boolean;
    enableCheck(rowKey: rowKeyType): boolean;
    disableCheck(rowKey: rowKeyType): boolean;
    getCheckedRowKeys(isJsonString?: boolean): Array<rowKeyType> | string;
    getCheckedRows(useJson?: boolean): Array<any> | string;
    getColumns(): Array<ColumnConfig>;
    getModifiedRows(options?: ModifiedOptions): Array<any>;
    appendRow(row?: Row, options?: RowConfig): void;
    prependRow(row?: Row, options?: {focus?: boolean}): void;
    isModified(): boolean;
    getAddOn(name: string): AddOn;
    restore(): void;
    setFrozenColumnCount(count: number): void;
    setColumns(columns: Array<ColumnConfig>): void;
    use(name: string, options: AddOnConfig): Grid;
    getRows(): Array<Row>;
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
    showColumn(...args: Array<any>): void;
    hideColumn(...args: Array<any>): void;
    setSummaryColumnContent(columnName: ColumnNameType, contents: string): void;
    setFooterColumnContent(columnName: ColumnNameType, contents: string): void;
    validate(): Array<any>;
    findRows(conditions: {key: string, value: any}| anyFunc): Array<Row>;
    copyToClipboard(): void;
    selection(range: Range): void;
    expand(rowKey: rowKeyType, recursive: boolean): Array<any>;
    expandAll(): void;
    collapse(rowKey: rowKeyType, recursive: boolean): Array<any>;
    collapseAll(): void;
    getAncestors(rowKey: rowKeyType): Array<TreeRow>;
    getParent(rowKey: rowKeyType): TreeRow;
    getChildren(rowKey: rowKeyType): Array<TreeRow>;
    getDepth(rowKey: rowKeyType): number;
    destroy(): void;
    on(eventName: string, handler: anyFunc): void;
}

declare module "tui-grid" {
    export = Grid
}
