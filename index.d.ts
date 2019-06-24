// Type definitions for TOAST UI Grid v4.0.0
// TypeScript Version: 3.4.5

declare namespace TuiGrid {

  // src/datasource
  export type ModificationTypeCode = 'CREATE' | 'UPDATE' | 'DELETE';

  export type ModifiedDataMap = { [type in ModificationTypeCode]: Row[] };

  export type RequestTypeCode = ModificationTypeCode | 'MODIFY';

  export type RequestType = 'createData' | 'updateData' | 'deleteData' | 'modifyData';

  export type RequestFunction = (url: string, method: string, options: RequestOptions) => void;

  export type Request = { [type in RequestType]: RequestFunction };

  export type DataProvider = Request & {
    request: (requestType: RequestType, options: RequestOptions) => void;
    readData: (page: number, data?: Params, resetData?: boolean) => void;
    reloadData: () => void;
  };

  export type Params = {
    rows?: Row[] | RowKey[];
    createdRows?: Row[] | RowKey[];
    updatedRows?: Row[] | RowKey[];
    deletedRows?: Row[] | RowKey[];
    page?: number;
    perPage?: number;
    sortColumn?: string;
    sortAscending?: boolean;
  } & Dictionary<any>;

  export interface APIInfo {
    url: string;
    method: string;
  }

  export interface API {
    createData?: APIInfo;
    readData: APIInfo;
    updateData?: APIInfo;
    deleteData?: APIInfo;
    modifyData?: APIInfo;
  }

  export interface DataSource {
    initialRequest?: boolean;
    withCredentials?: boolean;
    api: API;
  }

  export interface RequestOptions {
    url?: string;
    method?: string;
    checkedOnly?: boolean;
    modifiedOnly?: boolean;
    showConfirm?: boolean;
    withCredentials?: boolean;
  }

  export interface ModifiedRowsOptions {
    checkedOnly?: boolean;
    withRawData?: boolean;
    rowKeyOnly?: boolean;
    ignoredColumns?: string[];
  }

  export interface Response {
    result: boolean;
    data?: {
      contents: OptRow[];
      pagination: {
        page: number;
        totalCount: number;
      };
    };
    message?: string;
  }

  export interface XHROptions {
    method: string;
    url: string;
    withCredentials: boolean;
    params: Params;
  }

  export interface ModifiedDataManager {
    setOriginData: (data: OptRow[]) => void;
    getOriginData: () => OptRow[];
    getModifiedData: (
      type: ModificationTypeCode,
      options: ModifiedRowsOptions
    ) => Dictionary<Row[] | RowKey[]>;
    getAllModifiedData: (options: ModifiedRowsOptions) => Dictionary<Row[] | RowKey[]>;
    isModified: () => boolean;
    push: (type: ModificationTypeCode, row: Row) => void;
    clear: (type: Dictionary<Row[] | RowKey[]>) => void;
    clearAll: () => void;
  }


  // src/editor/types

  export interface CellEditorProps {
    grid: Grid;
    rowKey: RowKey;
    columnInfo: ColumnInfo;
    value: CellValue;
  }

  export interface CellEditor {
    getElement(): HTMLElement | undefined;
    getValue(): string;
    mounted?(): void;
    beforeDestroy?(): void;
    el?: HTMLElement;
  }

  export interface ListItemOptions {
    listItems: ListItem[];
    relationListItemMap?: Dictionary<ListItem[]>;
  }

  export interface CellEditorClass {
    new(props: CellEditorProps): CellEditor;
  }

  // src/renderer/types.d.ts
  export type CellRendererProps = CellRenderData & {
    grid: Grid;
    rowKey: RowKey;
    columnInfo: ColumnInfo;
    allDisabled: boolean;
  };

  export interface CellRenderer {
    getElement(): HTMLElement;
    focused?(): void;
    mounted?(parent: HTMLElement): void;
    render(props: CellRendererProps): void;
    beforeDestroy?(): void;
  }

  export interface CellRendererClass {
    new(params: CellRendererProps, options?: any): CellRenderer;
  }

  // src/store/types.ts
  export type ColumnDefaultValues = { name: string; value: CellValue }[];

  export type CellValue = number | string | boolean | null | undefined;

  export type Range = [number, number];

  export type Side = 'L' | 'R';

  export type SelectionType = 'cell' | 'row' | 'column';

  export type SelectionUnit = 'cell' | 'row';

  export type VisibleColumnsBySide = { [key in Side]: ColumnInfo[] };

  export type RowKey = number | string;

  export type CellIndex = [number, number];

  export type GridId = number;

  export type EditingEvent = 'click' | 'dblclick';

  export type State = 'DONE' | 'EMPTY' | 'LOADING';

  export interface Dictionary<T> {
    [index: string]: T;
  }

  export type Row = Dictionary<CellValue> & {
    rowKey: RowKey;
    rowSpanMap: RowSpanMap;
    _attributes: RowAttributes;
  };

  export type RowSpanMap = Dictionary<RowSpan>;

  export interface RowSpan {
    mainRow: boolean;
    mainRowKey: RowKey;
    count: number;
    spanCount: number;
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

  export type RowAttributeValue = RowAttributes[keyof RowAttributes];

  export type SummaryPosition = 'top' | 'bottom';

  export type SummaryColumnContent = SummaryColumnContentMap | null;

  export type SummaryColumnContents = Dictionary<SummaryColumnContent>;

  export type SummaryValues = Dictionary<SummaryValue>;

  export type CustomValue =
    | string
    | ((value: CellValue, rowAttrs: Row[], column: ColumnInfo) => string);

  export interface ClipboardCopyOptions {
    useFormattedValue?: boolean;
    useListItemText?: boolean;
    customValue?: CustomValue;
  }

  export type ValidationType = 'REQUIRED' | 'TYPE_STRING' | 'TYPE_NUMBER';

  export interface CellRenderData {
    editable: boolean;
    disabled: boolean;
    invalidState: '' | ValidationType;
    formattedValue: string;
    value: CellValue;
    className: string;
  }

  export interface ViewRow {
    rowKey: RowKey;
    valueMap: Dictionary<CellRenderData>;
    treeInfo?: TreeCellInfo;
    __unobserveFns__: Function[];
  }

  export interface DragStartData {
    pageX: number | null;
    pageY: number | null;
  }

  export interface DragData {
    pageX: number;
    pageY: number;
  }

  export interface SelectionRange {
    row: Range;
    column: Range;
  }

  export interface Validation {
    required?: boolean;
    dataType?: 'string' | 'number';
  }

  export interface InvalidColumn {
    columnName: string;
    errorCode: '' | ValidationType;
  }

  export interface InvalidRow {
    rowKey: RowKey;
    errors: InvalidColumn[];
  }

  export interface TreeRowInfo {
    parentRowKey: RowKey | null;
    childRowKeys: RowKey[];
    expanded?: boolean;
    hiddenChild?: boolean;
  }

  export interface TreeCellInfo {
    depth: number;
    indentWidth: number;
    leaf: boolean;
    expanded?: boolean;
  }

  export interface Data {
    rawData: Row[];
    viewData: ViewRow[];
    sortOptions: SortOptions;
    disabled: boolean;
    checkedAllRows: boolean;
    pageOptions: PageOptions;
  }

  export interface FormatterProps {
    row: Row;
    column: ColumnInfo;
    value: CellValue;
  }

  export type Formatter = ((props: FormatterProps) => string) | string;

  export interface CellEditorOptions {
    type: CellEditorClass;
    options?: Dictionary<any>;
  }

  export interface CellRendererOptions {
    type: CellRendererClass;
    options?: Dictionary<any>;
  }

  export interface ColumnInfo {
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
    align?: 'left' | 'center' | 'right';
    valign?: 'top' | 'middle' | 'bottom';
    whiteSpace?: 'pre' | 'normal' | 'norwap' | 'pre-wrap' | 'pre-line';
    ellipsis?: boolean;
    escapeHTML?: boolean;
    defaultValue?: CellValue;
    sortable?: boolean;
    validation?: Validation;
    onBeforeChange?: Function;
    onAfterChange?: Function;
    ignored?: boolean;
  }

  export interface SortOptions {
    columnName: string;
    ascending: boolean;
    useClient: boolean;
  }

  interface DataForColumnCreation {
    copyOptions: ClipboardCopyOptions;
    columnOptions: OptColumnOptions;
    rowHeaders: ColumnInfo[];
    relationColumns: string[];
    treeColumnOptions: OptTree;
  }

  export interface Column {
    frozenCount: number;
    dataForColumnCreation: DataForColumnCreation;
    keyColumnName?: string;
    allColumns: ColumnInfo[];
    complexHeaderColumns: ComplexColumnInfo[];
    readonly allColumnMap: Dictionary<ColumnInfo>;
    readonly rowHeaderCount: number;
    readonly visibleColumns: ColumnInfo[];
    readonly visibleFrozenCount: number;
    readonly visibleColumnsBySide: VisibleColumnsBySide;
    readonly defaultValues: { name: string; value: CellValue }[];
    readonly validationColumns: ColumnInfo[];
    readonly ignoredColumns: string[];
    readonly treeColumnName?: string;
    readonly treeIcon?: boolean;
    readonly treeCascadingCheckbox?: boolean;
  }

  export interface Relations {
    targetNames?: string[];
    listItems?: (relationParams: RelationCallbackData) => ListItem[];
    editable?: (relationParams: RelationCallbackData) => boolean;
    disabled?: (relationParams: RelationCallbackData) => boolean;
  }

  export interface ListItem {
    text: string;
    value: CellValue;
  }

  export interface RelationCallbackData {
    value?: CellValue;
    editable?: boolean;
    disabled?: boolean;
    row?: Row;
  }

  export interface Dimension {
    offsetLeft: number;
    offsetTop: number;
    width: number;
    autoWidth: boolean;
    bodyHeight: number;
    autoHeight: boolean;
    minBodyHeight: number;
    fitToParentHeight: boolean;
    heightResizable: boolean;
    rowHeight: number;
    minRowHeight: number;
    autoRowHeight: boolean;
    headerHeight: number;
    summaryPosition: SummaryPosition;
    summaryHeight: number;
    scrollbarWidth: number;
    tableBorderWidth: number;
    cellBorderWidth: number;
    scrollX: boolean;
    scrollY: boolean;
    readonly contentsWidth: number;
    readonly frozenBorderWidth: number;
    readonly scrollXHeight: number;
    readonly scrollYWidth: number;
  }

  export interface Viewport {
    scrollLeft: number;
    scrollTop: number;
    readonly scrollPixelScale: number;
    readonly maxScrollLeft: number;
    readonly maxScrollTop: number;
    readonly offsetLeft: number;
    readonly offsetTop: number;
    readonly rowRange: Range;
    readonly colRange: Range;
    readonly columns: ColumnInfo[];
    readonly rows: ViewRow[];
    readonly dummyRowCount: number;
  }

  export interface ColumnCoords {
    readonly widths: { [key in Side]: number[] };
    readonly areaWidth: { [key in Side]: number };
    readonly offsets: { [key in Side]: number[] };
    readonly totalColumnWidth: { [key in Side]: number };
  }

  export interface RowCoords {
    heights: number[];
    readonly offsets: number[];
    readonly totalRowHeight: number;
  }

  export interface Rect {
    top: number;
    left: number;
    right: number;
    bottom: number;
  }

  export interface Focus {
    editingAddress: {
      rowKey: RowKey;
      columnName: string;
    } | null;
    navigating: boolean;
    rowKey: RowKey | null;
    editingEvent: EditingEvent;
    columnName: string | null;
    prevRowKey: RowKey | null;
    prevColumnName: string | null;
    readonly side: Side | null;
    readonly columnIndex: number | null;
    readonly totalColumnIndex: number | null;
    readonly rowIndex: number | null;
    readonly cellPosRect: Rect | null;
  }

  export interface SummaryColumnContentMap {
    useAutoSummary?: boolean;
    template?: string | ((valueMap: SummaryValue) => string);
  }

  export interface SummaryValue {
    sum: number;
    avg: number;
    min: number;
    max: number;
    cnt: number;
  }

  export interface Summary {
    summaryColumnContents: SummaryColumnContents;
    summaryValues: SummaryValues;
  }

  export interface AreaInfo {
    top: number;
    height: number;
    left: number;
    width: number;
  }

  export type RangeAreaInfo = { [key in Side]: AreaInfo | null };
  export type RangeBySide = {
    [key in Side]: {
      row: Range;
      column: Range | null;
    }
  };

  export interface Selection {
    type: SelectionType;
    unit: SelectionUnit;
    intervalIdForAutoScroll: number | null;
    inputRange: SelectionRange | null;
    readonly range: SelectionRange | null;
    readonly rangeBySide: RangeBySide | null;
    readonly rangeAreaInfo: RangeAreaInfo | null;
  }

  export interface RenderState {
    state: State;
  }

  export interface PageOptions {
    perPage?: number;
    page?: number;
    totalCount?: number;
  }

  export interface Store {
    readonly id: GridId;
    readonly data: Data;
    readonly column: Column;
    readonly dimension: Dimension;
    readonly viewport: Viewport;
    readonly columnCoords: ColumnCoords;
    readonly rowCoords: RowCoords;
    readonly focus: Focus;
    readonly selection: Selection;
    readonly summary: Summary;
    readonly renderState: RenderState;
  }

  export interface ComplexColumnInfo {
    header: string;
    name: string;
    childNames?: string[];
    sortable?: boolean;
  }



  // src/types.d.ts
  interface OptGrid {
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

  // type CellValue = number | string | boolean | null | undefined;

  // type SummaryPosition = 'top' | 'bottom';

  type RecursivePartial<T> = { [P in keyof T]?: RecursivePartial<T[P]> };

  type RowSpanAttributeValue = RowSpanAttribute[keyof RowSpanAttribute];
  interface RowSpanAttribute {
    rowSpan?: Dictionary<number>;
  }

  interface OptRow {
    [prop: string]: CellValue | RecursivePartial<RowAttributes & RowSpanAttribute> | OptRow[];
    _attributes?: RecursivePartial<RowAttributes & RowSpanAttribute>;
    _children?: OptRow[];
  }

  interface OptAppendRow {
    at?: number;
    focus?: boolean;
    parentRowKey?: RowKey;
    extendPrevRowSpan?: boolean;
  }

  interface OptPrependRow {
    focus?: boolean;
  }

  interface OptRemoveRow {
    removeOriginalData?: boolean;
    keepRowSpanData?: boolean;
  }

  type RowHeaderType = 'rowNum' | 'checkbox';

  interface OptRowHeaderColumn extends Partial<OptColumn> {
    type: RowHeaderType;
  }

  type OptRowHeader = RowHeaderType | OptRowHeaderColumn;

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

  type OptCellEditor = TypeObjectOptions<string | CellEditorClass>;
  type OptCellRenderer = TypeObjectOptions<string | CellRendererClass>;

  interface OptColumn {
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

  interface OptColumnOptions {
    minWidth?: number;
    frozenCount?: number;
    frozenBorderWidth?: number;
    resizable?: boolean;
  }

  interface OptHeightResizeHandleStyle {
    background?: string;
    border?: string;
  }

  interface OptFrozenBorderStyle {
    border?: string;
  }

  interface OptPaginationStyle {
    background?: string;
    border?: string;
  }

  interface OptTableOutlineStyle {
    border?: string;
    showVerticalBorder?: boolean;
  }

  interface OptSelectionLayerStyle {
    background?: string;
    border?: string;
  }

  interface OptScrollbarStyle {
    border?: string;
    background?: string;
    emptySpace?: string;
    thumb?: string;
    active?: string;
  }

  interface OptTableHeaderStyle {
    background?: string;
    border?: string;
  }

  interface OptTableSummaryStyle {
    background?: string;
    border?: string;
  }

  interface OptTableBodyStyle {
    background?: string;
  }

  interface OptTableAreaStyle {
    header?: OptTableHeaderStyle;
    body?: OptTableBodyStyle;
    summary?: OptTableSummaryStyle;
  }

  interface OptCellStyle {
    background?: string;
    border?: string;
    text?: string;
    showVerticalBorder?: boolean;
    showHorizontalBorder?: boolean;
  }

  interface OptBasicCellStyle {
    background?: string;
    text?: string;
  }

  interface OptCellFocusedStyle {
    background?: string;
    border?: string;
  }

  interface OptCellDummyStyle {
    background?: string;
  }

  interface OptTableCellStyle {
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

  interface OptPreset {
    outline?: OptTableOutlineStyle;
    selection?: OptSelectionLayerStyle;
    scrollbar?: OptScrollbarStyle;
    frozenBorder?: OptFrozenBorderStyle;
    area?: OptTableAreaStyle;
    cell?: OptTableCellStyle;
    heightResizeHandle?: OptHeightResizeHandleStyle;
    pagination?: OptPaginationStyle;
  }

  interface OptHeightResizeHandleStyle {
    background?: string;
    border?: string;
  }

  interface OptFrozenBorderStyle {
    border?: string;
  }

  interface OptPaginationStyle {
    background?: string;
    border?: string;
  }

  interface OptTableOutlineStyle {
    border?: string;
    showVerticalBorder?: boolean;
  }

  interface OptSelectionLayerStyle {
    background?: string;
    border?: string;
  }

  interface OptScrollbarStyle {
    border?: string;
    background?: string;
    emptySpace?: string;
    thumb?: string;
    active?: string;
  }

  interface OptTableHeaderStyle {
    background?: string;
    border?: string;
  }

  interface OptTableSummaryStyle {
    background?: string;
    border?: string;
  }

  interface OptTableBodyStyle {
    background?: string;
  }

  interface OptTableAreaStyle {
    header?: OptTableHeaderStyle;
    body?: OptTableBodyStyle;
    summary?: OptTableSummaryStyle;
  }

  interface OptCellStyle {
    background?: string;
    border?: string;
    text?: string;
    showVerticalBorder?: boolean;
    showHorizontalBorder?: boolean;
  }

  interface OptBasicCellStyle {
    background?: string;
    text?: string;
  }

  interface OptCellFocusedStyle {
    background?: string;
    border?: string;
  }

  interface OptCellDummyStyle {
    background?: string;
  }

  interface OptTableCellStyle {
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

  interface OptPreset {
    outline?: OptTableOutlineStyle;
    selection?: OptSelectionLayerStyle;
    scrollbar?: OptScrollbarStyle;
    frozenBorder?: OptFrozenBorderStyle;
    area?: OptTableAreaStyle;
    cell?: OptTableCellStyle;
    heightResizeHandle?: OptHeightResizeHandleStyle;
    pagination?: OptPaginationStyle;
  }

  interface OptI18nLanguage {
    [propName: string]: OptI18nData;
  }

  interface OptI18nData {
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

  interface OptSummaryData {
    height?: number;
    position?: SummaryPosition;
    defaultContent?: string | OptSummaryColumnContentMap;
    columnContent?: {
      [propName: string]: string | OptSummaryColumnContentMap;
    };
  }

  interface OptSummaryColumnContentMap {
    useAutoSummary?: boolean;
    template?: (valueMap: OptSummaryValueMap) => string;
  }

  interface OptSummaryValueMap {
    sum: number;
    avg: number;
    min: number;
    max: number;
    cnt: number;
  }

  interface OptHeader {
    height?: number;
    complexColumns?: ComplexColumnInfo[];
  }

  export type ThemeOptionPresetNames = 'default' | 'striped' | 'clean';

  export class Grid {
    private el;
    private store;
    private dispatch;
    private eventBus;
    private dataProvider;
    private dataManager;
    private paginationManager;
    constructor(options: OptGrid);
    /**
     * Apply theme to all grid instances with the preset options of a given name.
     * @static
     * @param {string} presetName - preset theme name. Available values are 'default', 'striped' and 'clean'.
     * @param {Object} [extOptions] - if exist, extend preset options with this object.
     *     @param {Object} [extOptions.outline] - Styles for the table outline.
     *         @param {string} [extOptions.outline.border] - Color of the table outline.
     *         @param {boolean} [extOptions.outline.showVerticalBorder] - Whether vertical outlines of
     *             the table are visible.
     *     @param {Object} [extOptions.selection] - Styles for a selection layer.
     *         @param {string} [extOptions.selection.background] - Background color of a selection layer.
     *         @param {string} [extOptions.selection.border] - Border color of a selection layer.
     *     @param {Object} [extOptions.scrollbar] - Styles for scrollbars.
     *         @param {string} [extOptions.scrollbar.border] - Border color of scrollbars.
     *         @param {string} [extOptions.scrollbar.background] - Background color of scrollbars.
     *         @param {string} [extOptions.scrollbar.emptySpace] - Color of extra spaces except scrollbar.
     *         @param {string} [extOptions.scrollbar.thumb] - Color of thumbs in scrollbars.
     *         @param {string} [extOptions.scrollbar.active] - Color of arrows(for IE) or
     *              thumb:hover(for other browsers) in scrollbars.
     *     @param {Object} [extOptions.frozenBorder] - Styles for a frozen border.
     *         @param {string} [extOptions.frozenBorder.border] - Border color of a frozen border.
     *     @param {Object} [extOptions.area] - Styles for the table areas.
     *         @param {Object} [extOptions.area.header] - Styles for the header area in the table.
     *             @param {string} [extOptions.area.header.background] - Background color of the header area
     *                 in the table.
     *             @param {string} [extOptions.area.header.border] - Border color of the header area
     *                 in the table.
     *         @param {Object} [extOptions.area.body] - Styles for the body area in the table.
     *             @param {string} [extOptions.area.body.background] - Background color of the body area
     *                 in the table.
     *         @param {Object} [extOptions.area.summary] - Styles for the summary area in the table.
     *             @param {string} [extOptions.area.summary.background] - Background color of the summary area
     *                 in the table.
     *             @param {string} [extOptions.area.summary.border] - Border color of the summary area
     *                 in the table.
     *     @param {Object} [extOptions.cell] - Styles for the table cells.
     *         @param {Object} [extOptions.cell.normal] - Styles for normal cells.
     *             @param {string} [extOptions.cell.normal.background] - Background color of normal cells.
     *             @param {string} [extOptions.cell.normal.border] - Border color of normal cells.
     *             @param {string} [extOptions.cell.normal.text] - Text color of normal cells.
     *             @param {boolean} [extOptions.cell.normal.showVerticalBorder] - Whether vertical borders of
     *                 normal cells are visible.
     *             @param {boolean} [extOptions.cell.normal.showHorizontalBorder] - Whether horizontal borders of
     *                 normal cells are visible.
     *         @param {Object} [extOptions.cell.header] - Styles for header cells.
     *             @param {string} [extOptions.cell.header.background] - Background color of header cells.
     *             @param {string} [extOptions.cell.header.border] - border color of header cells.
     *             @param {string} [extOptions.cell.header.text] - text color of header cells.
     *             @param {boolean} [extOptions.cell.header.showVerticalBorder] - Whether vertical borders of
     *                 header cells are visible.
     *             @param {boolean} [extOptions.cell.header.showHorizontalBorder] - Whether horizontal borders of
     *                 header cells are visible.
     *         @param {Object} [extOptions.cell.selectedHeader] - Styles for selected header cells.
     *             @param {string} [extOptions.cell.selectedHeader.background] - background color of selected header cells.
     *         @param {Object} [extOptions.cell.rowHeader] - Styles for row's header cells.
     *             @param {string} [extOptions.cell.rowHeader.background] - Background color of row's header cells.
     *             @param {string} [extOptions.cell.rowHeader.border] - border color of row's header cells.
     *             @param {string} [extOptions.cell.rowHeader.text] - text color of row's header cells.
     *             @param {boolean} [extOptions.cell.rowHeader.showVerticalBorder] - Whether vertical borders of
     *                 row's header cells are visible.
     *             @param {boolean} [extOptions.cell.rowHeader.showHorizontalBorder] - Whether horizontal borders of
     *                 row's header cells are visible.
     *         @param {Object} [extOptions.cell.selectedRowHeader] - Styles for selected row's header cells.
     *             @param {string} [extOptions.cell.selectedRowHeader.background] - background color of selected row's haed cells.
     *         @param {Object} [extOptions.cell.summary] - Styles for cells in the summary area.
     *             @param {string} [extOptions.cell.summary.background] - Background color of cells in the summary area.
     *             @param {string} [extOptions.cell.summary.border] - border color of cells in the summary area.
     *             @param {string} [extOptions.cell.summary.text] - text color of cells in the summary area.
     *             @param {boolean} [extOptions.cell.summary.showVerticalBorder] - Whether vertical borders of
     *                 cells in the summary area are visible.
     *             @param {boolean} [extOptions.cell.summary.showHorizontalBorder] - Whether horizontal borders of
     *                 cells in the summary area are visible.
     *         @param {Object} [extOptions.cell.focused] - Styles for a focused cell.
     *             @param {string} [extOptions.cell.focused.background] - background color of a focused cell.
     *             @param {string} [extOptions.cell.focused.border] - border color of a focused cell.
     *         @param {Object} [extOptions.cell.focusedInactive] - Styles for a inactive focus cell.
     *             @param {string} [extOptions.cell.focusedInactive.border] - border color of a inactive focus cell.
     *         @param {Object} [extOptions.cell.required] - Styles for required cells.
     *             @param {string} [extOptions.cell.required.background] - background color of required cells.
     *             @param {string} [extOptions.cell.required.text] - text color of required cells.
     *         @param {Object} [extOptions.cell.editable] - Styles for editable cells.
     *             @param {string} [extOptions.cell.editable.background] - background color of the editable cells.
     *             @param {string} [extOptions.cell.editable.text] - text color of the selected editable cells.
     *         @param {Object} [extOptions.cell.disabled] - Styles for disabled cells.
     *             @param {string} [extOptions.cell.disabled.background] - background color of disabled cells.
     *             @param {string} [extOptions.cell.disabled.text] - text color of disabled cells.
     *         @param {Object} [extOptions.cell.invalid] - Styles for invalid cells.
     *             @param {string} [extOptions.cell.invalid.background] - background color of invalid cells.
     *             @param {string} [extOptions.cell.invalid.text] - text color of invalid cells.
     *         @param {Object} [extOptions.cell.currentRow] - Styles for cells in a current row.
     *             @param {string} [extOptions.cell.currentRow.background] - background color of cells in a current row.
     *             @param {string} [extOptions.cell.currentRow.text] - text color of cells in a current row.
     *         @param {Object} [extOptions.cell.evenRow] - Styles for cells in even rows.
     *             @param {string} [extOptions.cell.evenRow.background] - background color of cells in even rows.
     *             @param {string} [extOptions.cell.evenRow.text] - text color of cells in even rows.
     *         @param {Object} [extOptions.cell.oddRow] - Styles for cells in even rows.
     *             @param {string} [extOptions.cell.oddRow.background] - background color of cells in odd rows.
     *             @param {string} [extOptions.cell.oddRow.text] - text color of cells in odd rows.
     *         @param {Object} [extOptions.cell.dummy] - Styles for dummy cells.
     *             @param {string} [extOptions.cell.dummy.background] - background color of dummy cells.
     * @example
     * var Grid = tui.Grid; // or require('tui-grid')
     *
     * Grid.applyTheme('striped', {
     *     grid: {
     *         border: '#aaa',
     *         text: '#333'
     *     },
     *     cell: {
     *         disabled: {
     *             text: '#999'
     *         }
     *     }
     * });
     */
    static applyTheme(presetName: ThemeOptionPresetNames, extOptions?: OptPreset): void;
    /**
     * Set language
     * @static
     * @param {string} localeCode - Code to set locale messages and
     *     this is the language or language-region combination (ex: en-US)
     * @param {Object} [data] - Messages using in Grid
     * @example
     * var Grid = tui.Grid; // or require('tui-grid')
     *
     * Grid.setLanguage('en'); // default and set English
     * Grid.setLanguage('ko'); // set Korean
     * Grid.setLanguage('en-US', { // set new language
     *      display: {
     *          noData: 'No data.',
     *          loadingData: 'Loading data.',
     *          resizeHandleGuide: 'You can change the width of the column by mouse drag, ' +
     *                              'and initialize the width by double-clicking.'
     *      },
     *      net: {
     *          confirmCreate: 'Are you sure you want to create {{count}} data?',
     *          confirmUpdate: 'Are you sure you want to update {{count}} data?',
     *          confirmDelete: 'Are you sure you want to delete {{count}} data?',
     *          confirmModify: 'Are you sure you want to modify {{count}} data?',
     *          noDataToCreate: 'No data to create.',
     *          noDataToUpdate: 'No data to update.',
     *          noDataToDelete: 'No data to delete.',
     *          noDataToModify: 'No data to modify.',
     *          failResponse: 'An error occurred while requesting data.\nPlease try again.'
     *      }
     * });
     */
    static setLanguage(localeCode: string, data?: OptI18nData): void;
    /**
     * Sets the width of the dimension.
     * @param {number} width - The width of the dimension
     */
    setWidth(width: number): void;
    /**
     * Sets the height of the dimension.
     * @param {number} height - The height of the dimension
     */
    setHeight(height: number): void;
    /**
     * Sets the height of body-area.
     * @param {number} value - The number of pixel
     */
    setBodyHeight(bodyHeight: number): void;
    /**
     * Sets options for header.
     * @param {Object} options - Options for header
     * @param {number} [options.height] -  The height value
     * @param {Array} [options.complexColumns] - The complex columns info
     */
    setHeader({ height, complexColumns }: OptHeader): void;
    /**
     * Sets the count of frozen columns.
     * @param {number} count - The count of columns to be frozen
     */
    setFrozenColumnCount(count: number): void;
    /**
     * Hides columns
     * @param {...string} arguments - Column names to hide
     */
    hideColumn(columnName: string): void;
    /**
     * Shows columns
     * @param {...string} arguments - Column names to show
     */
    showColumn(columnName: string): void;
    /**
     * Selects cells or rows by range
     * @param {Object} range - Selection range
     *     @param {Array} [range.start] - Index info of start selection (ex: [rowIndex, columnIndex])
     *     @param {Array} [range.end] - Index info of end selection (ex: [rowIndex, columnIndex])
     */
    setSelectionRange(range: {
      start: Range;
      end: Range;
    }): void;
    /**
     * Returns data of currently focused cell
     * @returns {number|string} rowKey - The unique key of the row
     * @returns {string} columnName - The name of the column
     * @returns {string} value - The value of the cell
     */
    getFocusedCell(): {
      rowKey: string | number | null;
      columnName: string | null;
      value: CellValue;
    };
    /**
     * Removes focus from the focused cell.
     */
    blur(): void;
    /**
     * Focus to the cell identified by given rowKey and columnName.
     * @param {Number|String} rowKey - rowKey
     * @param {String} columnName - columnName
     * @param {Boolean} [setScroll=false] - if set to true, move scroll position to focused position
     * @returns {Boolean} true if focused cell is changed
     */
    focus(rowKey: RowKey, columnName: string, setScroll?: boolean): boolean;
    /**
     * Focus to the cell identified by given rowIndex and columnIndex.
     * @param {Number} rowIndex - rowIndex
     * @param {Number} columnIndex - columnIndex
     * @param {boolean} [setScroll=false] - if set to true, scroll to focused cell
     * @returns {Boolean} true if success
     */
    focusAt(rowIndex: number, columnIndex: number, isScrollable?: boolean): boolean;
    /**
     * Makes view ready to get keyboard input.
     */
    activateFocus(): void;
    /**
     * Sets focus on the cell at the specified index of row and column and starts to edit.
     * @param {number|string} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {boolean} [setScroll=false] - If set to true, the view will scroll to the cell element.
     */
    startEditing(rowKey: RowKey, columnName: string, setScroll?: boolean): void;
    /**
     * Sets focus on the cell at the specified index of row and column and starts to edit.
     * @param {number|string} rowIndex - The index of the row
     * @param {string} columnIndex - The index of the column
     * @param {boolean} [setScroll=false] - If set to true, the view will scroll to the cell element.
     */
    startEditingAt(rowIndex: number, columnIndex: number, setScroll?: boolean): void;
    /**
     * Sets the value of the cell identified by the specified rowKey and columnName.
     * @param {number|string} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {number|string} value - The value to be set
     */
    setValue(rowKey: RowKey, columnName: string, value: CellValue): void;
    /**
     * Returns the value of the cell identified by the rowKey and columnName.
     * @param {number|string} rowKey - The unique key of the target row.
     * @param {string} columnName - The name of the column
     * @param {boolean} [isOriginal] - It set to true, the original value will be return.
     * @returns {number|string} - The value of the cell
     */
    getValue(rowKey: RowKey, columnName: string): CellValue | null;
    /**
     * Sets the all values in the specified column.
     * @param {string} columnName - The name of the column
     * @param {number|string} columnValue - The value to be set
     * @param {boolean} [checkCellState=true] - If set to true, only editable and not disabled cells will be affected.
     */
    setColumnValues(columnName: string, columnValue: CellValue, checkCellState?: boolean): void;
    /**
     * Returns the HTMLElement of the cell identified by the rowKey and columnName.
     * @param {number|string} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @returns {HTMLElement} - The HTMLElement of the cell element
     */
    getElement(rowKey: RowKey, columnName: string): Element | null;
    /**
     * Sets the HTML string of given column summary.
     * The type of content is the same as the options.summary.columnContent of the constructor.
     * @param {string} columnName - column name
     * @param {string|object} columnContent - HTML string or options object.
     */
    setSummaryColumnContent(columnName: string, columnContent: string | OptSummaryColumnContentMap): void;
    /**
     * Returns the values of given column summary.
     * If the column name is not specified, all values of available columns are returned.
     * The shape of returning object looks like the example below.
     * @param {string} [columnName] - column name
     * @returns {Object}
     * @example
     * {
     *     sum: 1000,
     *     avg: 200,
     *     max: 300,
     *     min: 50,
     *     cnt: 5
     * }
     */
    getSummaryValues(columnName: string): SummaryValue | null;
    /**
     * Returns a list of the column model.
     * @returns {Array} - A list of the column model.
     */
    getColumns(): ColumnInfo[];
    /**
     * Sets the list of column model.
     * @param {Array} columns - A new list of column model
     */
    setColumns(columns: OptColumn[]): void;
    /**
     * Set columns title
     * @param {Object} columnsMap - columns map to be change
     * @example
     * {
     *      columnName1: 'title1',
     *      columnName2: 'title2',
     *      columnName3: 'title3'
     * }
     */
    setColumnHeaders(columnsMap: Dictionary<string>): void;
    /**
     * Resets the width of each column by using initial setting of column models.
     */
    resetColumnWidths(widths: number[]): void;
    /**
     * Returns a list of all values in the specified column.
     * @param {string} columnName - The name of the column
     * @returns {(Array|string)} - A List of all values in the specified column. (or JSON string of the list)
     */
    getColumnValues(columnName: string): CellValue[];
    /**
     * Returns the index of the column indentified by the column name.
     * @param {string} columnName - The unique key of the column
     * @returns {number} - The index of the column
     */
    getIndexOfColumn(columnName: string): number;
    /**
     * Checks the row identified by the specified rowKey.
     * @param {number|string} rowKey - The unique key of the row
     */
    check(rowKey: RowKey): void;
    /**
     * Unchecks the row identified by the specified rowKey.
     * @param {number|string} rowKey - The unique key of the row
     */
    uncheck(rowKey: RowKey): void;
    /**
     * Checks all rows.
     */
    checkAll(): void;
    /**
     * Unchecks all rows.
     */
    uncheckAll(): void;
    /**
     * Returns a list of the rowKey of checked rows.
     * @returns {Array.<string|number>} - A list of the rowKey.
     */
    getCheckedRowKeys(): RowKey[];
    /**
     * Returns a list of the checked rows.
     * @returns {Array.<object>} - A list of the checked rows.
     */
    getCheckedRows(): Row[];
    /**
     * Finds rows by conditions
     * @param {Object|Function} conditions - object (key: column name, value: column value) or
     *     function that check the value and returns true/false result to find rows
     * @returns {Array} Row list
     * @example <caption>Conditions type is object.</caption>
     * grid.findRows({
     *     artist: 'Birdy',
     *     price: 10000
     * });
     * @example <caption>Conditions type is function.</caption>
     * grid.findRows((row) => {
     *     return (/b/ig.test(row.artist) && row.price > 10000);
     * });
     */
    findRows(conditions: ((row: Row) => boolean) | Dictionary<any>): Row[];
    /**
     * Sorts all rows by the specified column.
     * @param {string} columnName - The name of the column to be used to compare the rows
     * @param {boolean} [ascending] - Whether the sort order is ascending.
     *        If not specified, use the negative value of the current order.
     */
    sort(columnName: string, ascending: boolean): void;
    /**
     * Unsorts all rows. (Sorts by rowKey).
     */
    unsort(): void;
    /**
     * Gets state of the sorted column in rows
     * @returns {{columnName: string, ascending: boolean, useClient: boolean}} Sorted column's state
     */
    getSortState(): SortOptions;
    /**
     * Copy to clipboard
     */
    copyToClipboard(): void;
    validate(): InvalidRow[];
    /**
     * Enables all rows.
     */
    enable(): void;
    /**
     * Disables all rows.
     */
    disable(): void;
    /**
     * Disables the row identified by the rowkey.
     * @param {number|string} rowKey - The unique key of the target row
     * @param {boolean} [withCheckbox] - change including checkbox. The default value is 'true'
     */
    disableRow(rowKey: RowKey, withCheckbox?: boolean): void;
    /**
     * Enables the row identified by the rowKey.
     * @param {number|string} rowKey - The unique key of the target row
     * @param {boolean} [withCheckbox] - change including checkbox. The default value is 'true'
     */
    enableRow(rowKey: RowKey, withCheckbox?: boolean): void;
    /**
     * Disables the row identified by the spcified rowKey to not be able to check.
     * @param {number|string} rowKey - The unique keyof the row.
     */
    disableRowCheck(rowKey: RowKey): void;
    /**
     * Enables the row identified by the rowKey to be able to check.
     * @param {number|string} rowKey - The unique key of the row
     */
    enableRowCheck(rowKey: RowKey): void;
    appendRow(row?: OptRow, options?: OptAppendRow): void;
    /**
     * Inserts the new row with specified data to the beginning of table.
     * @param {Object} [row] - The data for the new row
     * @param {Object} [options] - Options
     * @param {boolean} [options.focus] - If set to true, move focus to the new row after appending
     */
    prependRow(row: OptRow, options?: OptPrependRow): void;
    /**
     * Removes the row identified by the specified rowKey.
     * @param {number|string} rowKey - The unique key of the row
     * @param {boolean} [options.removeOriginalData] - If set to true, the original data will be removed.
     * @param {boolean} [options.keepRowSpanData] - If set to true, the value of the merged cells will not be
     *     removed although the target is first cell of them.
     */
    removeRow(rowKey: RowKey, options?: OptRemoveRow): void;
    /**
     * Returns the object that contains all values in the specified row.
     * @param {number|string} rowKey - The unique key of the target row
     * @returns {Object} - The object that contains all values in the row.
     */
    getRow(rowKey: RowKey): Row | null;
    /**
     * Returns the object that contains all values in the row at specified index.
     * @param {number} rowIdx - The index of the row
     * @returns {Object} - The object that contains all values in the row.
     */
    getRowAt(rowIdx: number): Row | null;
    /**
     * Returns the index of the row indentified by the rowKey.
     * @param {number|string} rowKey - The unique key of the row
     * @returns {number} - The index of the row
     */
    getIndexOfRow(rowKey: RowKey): number;
    /**
     * Returns a list of all rows.
     * @returns {Array} - A list of all rows
     */
    getData(): Row[];
    /**
     * Returns the total number of the rows.
     * @returns {number} - The total number of the rows
     */
    getRowCount(): number;
    /**
     * Removes all rows.
     */
    clear(): void;
    /**
     * Replaces all rows with the specified list. This will not change the original data.
     * @param {Array} data - A list of new rows
     */
    resetData(data: OptRow[]): void;
    /**
     * Adds the specified css class to cell element identified by the rowKey and className
     * @param {number|string} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {string} className - The css class name to add
     */
    addCellClassName(rowKey: RowKey, columnName: string, className: string): void;
    /**
     * Adds the specified css class to all cell elements in the row identified by the rowKey
     * @param {number|string} rowKey - The unique key of the row
     * @param {string} className - The css class name to add
     */
    addRowClassName(rowKey: RowKey, className: string): void;
    /**
     * Removes the specified css class from the cell element indentified by the rowKey and columnName.
     * @param {number|string} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {string} className - The css class name to be removed
     */
    removeCellClassName(rowKey: RowKey, columnName: string, className: string): void;
    /**
     * Removes the specified css class from all cell elements in the row identified by the rowKey.
     * @param {number|string} rowKey - The unique key of the row
     * @param {string} className - The css class name to be removed
     */
    removeRowClassName(rowKey: RowKey, className: string): void;
    on(eventName: string, fn: Function): void;
    off(eventName: string, fn?: Function): void;
    /**
     * Returns an instance of tui.Pagination.
     * @returns {tui.Pagination}
     */
    getPagination(): import("tui-pagination").default | null;
    /**
     * Set number of rows per page and reload current page
     * @param {number} perPage - Number of rows per page
     */
    setPerPage(perPage: number): void;
    /**
     * Returns true if there are at least one row modified.
     * @returns {boolean} - True if there are at least one row modified.
     */
    isModified(): boolean;
    /**
     * Returns the object that contains the lists of changed data compared to the original data.
     * The object has properties 'createdRows', 'updatedRows', 'deletedRows'.
     * @param {Object} [options] Options
     *     @param {boolean} [options.checkedOnly=false] - If set to true, only checked rows will be considered.
     *     @param {boolean} [options.withRawData=false] - If set to true, the data will contains
     *         the row data for internal use.
     *     @param {boolean} [options.rowKeyOnly=false] - If set to true, only keys of the changed
     *         rows will be returned.
     *     @param {Array} [options.ignoredColumns] - A list of column name to be excluded.
     * @returns {{createdRows: Array, updatedRows: Array, deletedRows: Array}} - Object that contains the result list.
     */
    getModifiedRows(options?: ModifiedRowsOptions): Dictionary<(string | number)[] | Row[]>;
    /**
     * Requests 'readData' to the server. The last requested data will be extended with new data.
     * @param {Number} page - Page number
     * @param {Object} data - Data(parameters) to send to the server
     * @param {Boolean} resetData - If set to true, last requested data will be ignored.
     */
    readData(page: number, data?: Params, resetData?: boolean): void;
    /**
     * Send request to server to sync data
     * @param {String} requestType - 'createData|updateData|deleteData|modifyData'
     * @param {object} options - Options
     *      @param {String} [options.url] - URL to send the request
     *      @param {boolean} [options.hasDataParam=true] - Whether the row-data to be included in the request param
     *      @param {boolean} [options.checkedOnly=true] - Whether the request param only contains checked rows
     *      @param {boolean} [options.modifiedOnly=true] - Whether the request param only contains modified rows
     *      @param {boolean} [options.showConfirm=true] - Whether to show confirm dialog before sending request
     *      @param {boolean} [options.withCredentials=false] - Use withCredentials flag of XMLHttpRequest for ajax requests if true
     */
    request(requestType: RequestType, options?: RequestOptions): void;
    /**
     * Requests 'readData' with last requested data.
     */
    reloadData(): void;
    /**
     * Restores the data to the original data.
     * (Original data is set by {@link Grid#resetData|resetData}
     */
    restore(): void;
    /**
     * Expands tree row.
     * @param {number|string} rowKey - The unique key of the row
     * @param {boolean} recursive - true for recursively expand all descendant
     */
    expand(rowKey: RowKey, recursive?: boolean): void;
    /**
     * Expands all tree row.
     */
    expandAll(): void;
    /**
     * Expands tree row.
     * @param {number|string} rowKey - The unique key of the row
     * @param {boolean} recursive - true for recursively expand all descendant
     */
    collapse(rowKey: RowKey, recursive?: boolean): void;
    /**
     * Collapses all tree row.
     */
    collapseAll(): void;
    /**
     * Gets the parent of the row which has the given row key.
     * @param {number|string} rowKey - The unique key of the row
     * @returns {Object} - the parent row
     */
    getParentRow(rowKey: RowKey): Row | null;
    /**
     * Gets the children of the row which has the given row key.
     * @param {number|string} rowKey - The unique key of the row
     * @returns {Array.<Object>} - the children rows
     */
    getChildRows(rowKey: RowKey): Row[];
    /**
     * Gets the ancestors of the row which has the given row key.
     * @param {number|string} rowKey - The unique key of the row
     * @returns {Array.<TreeRow>} - the ancestor rows
     */
    getAncestorRows(rowKey: RowKey): Row[];
    /**
     * Gets the descendants of the row which has the given row key.
     * @param {number|string} rowKey - The unique key of the row
     * @returns {Array.<Object>} - the descendant rows
     */
    getDescendantRows(rowKey: RowKey): Row[];
    /**
     * Gets the depth of the row which has the given row key.
     * @param {number|string} rowKey - The unique key of the row
     * @returns {number} - the depth
     */
    getDepth(rowKey: RowKey): number;
    /**
     * Returns the rowspan data of the cell identified by the rowKey and columnName.
     * @param {number|string} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @returns {Object} - Row span data
     */
    getRowSpanData(rowKey: RowKey, columnName: string): RowSpan | null;
    /**
     * reset original data to current data.
     * (Original data is set by {@link Grid#resetData|resetData}
     */
    resetOriginData(): void;
    /** Removes all checked rows.
     * @param {boolean} [showConfirm] - If set to true, confirm message will be shown before remove.
     * @returns {boolean} - True if there's at least one row removed.
     */
    removeCheckedRows(showConfirm?: boolean): boolean;
    /**
     * Refreshs the layout view. Use this method when the view was rendered while hidden.
     */
    refreshLayout(): void;
  }
}

declare module 'tui-grid' {
  export default TuiGrid.Grid;
}
