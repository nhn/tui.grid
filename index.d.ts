// Type definitions for TOAST UI Grid v3.5.0
// TypeScript Version: 3.2.2

/// <reference types="jquery" />

declare namespace tuiGrid {
    type RowKeyType = number | string;
    type ColumnValueType = number | string | object | null;
    type ColumnNameType = string;
    type RowStateType = 'DISABLED' | 'DISABLED_CHECK' | 'CHECKED';
    type TreeStateType = 'EXPAND' | 'COLLAPSE';
    type ErrorCodeType = 'REQUIRED' | 'TYPE_NUMBER';
    type CustomEventType = 'click' | 'check' | 'uncheck' | 'dblclick' |
        'mouseover' | 'mouseout' | 'mousedown' | 'focusChange' |
        'expanded' | 'expandedAll' | 'collapsed' | 'collapsedAll' |
        'beforeRequest' | 'response' | 'successResponse' | 'failResponse' |
        'errorResponse' | 'selection' | 'deleteRange';
    type RowConditionType = {key: string, value: RowKeyType} | ((row: IRow) => boolean);
    type PostPrefixConverterFunc = (cellValue: string, rowAttrs: IRow) => string;
    type RowType = IRow | ITreeRow;
    type Pagination = any;

    interface IRow {
        [propName: string]: ColumnValueType;
        _extraData?: {
            rowState?: RowStateType;
        };
    }

    interface ITreeRow {
        [propName: string]: ColumnValueType;
        _extraData?: {
            rowState?: RowStateType;
            treeState?: TreeStateType;
        };
        _children: ITreeRow[];
    }

    interface IComplexColumnsOptions {
        title: string;
        name: string;
        childNames: string[];
    }

    interface IHeaderOptions {
        height?: number;
        complexColumns?: IComplexColumnsOptions[];
    }

    interface IValueMap {
        sum: number;
        avg: number;
        min: number;
        max: number;
        cnt: number;
    }

    interface ICopyOptions {
        useFormattedValue: boolean;
    }

    interface IRowHeaderProps {
        className: string;
        type: string;
        name: string;
        disabled: boolean;
        checked: boolean;
    }

    interface IRowHeadersOptions {
        type?: string;
        title?: string;
        width?: number;
        template?: (props: IRowHeaderProps) => string;
    }
    interface IValidationOptions {
        required?: boolean;
        dataType?: boolean | string | number;
    }

    interface IEditingItemOptions {
        text: string;
        value: string;
    }

    interface ICellAddressOptions {
        columnName: string;
        rowKey: number;
    }

    interface IEditingUIOptions {
        name?: string;
        useViewMode?: boolean;
        listItems?: IEditingItemOptions[];
        onFocus?: (ev: JQuery.Event, cellAddress: ICellAddressOptions) => void;
        onBlur?: (ev: JQuery.Event, cellAddress: ICellAddressOptions) => void;
        onKeyDown?: (ev: JQuery.Event, cellAddress: ICellAddressOptions) => void;
        prefix?: string | PostPrefixConverterFunc;
        postfix?: string | PostPrefixConverterFunc;
        converter?: PostPrefixConverterFunc;
    }

    interface IClipboardCopyOptions {
        useFormattedValue?: boolean;
        useListItemText?: boolean;
        customValue?: (cellValue: string, rowAttrs: IRow, column: IColumnInfoOptions) => string;
    }

    interface IRelationOptions {
        targetNames?: string[];
        disabled?: (value: string) => boolean;
        editable?: (value: string) => boolean;
        listItems?: (value: string) => IEditingItemOptions[];
    }

    interface IColumnEventOptions {
        columnName: string;
        rowKey: number;
        instance: Grid;
        value: string;
        _stopped: boolean;
    }

    interface IColumnInfoOptions {
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
        validation?: IValidationOptions;
        defaultValue?: string;
        formatter?: (cellValue: string, rowAttrs: IRow, column: IColumnInfoOptions) => string;
        useHtmlEntity?: boolean;
        ignored?: boolean;
        sortable?: boolean;
        onBeforeChange?: (ev: IColumnEventOptions) => void;
        onAfterChange?: (ev: IColumnEventOptions) => void;
        editOptions?: IEditingUIOptions;
        copyOptions?: IClipboardCopyOptions;
        relations?: IRelationOptions[];
        whiteSpace?: string;
        component?: {
            name?: string;
            options?: any;
        };
    }

    interface ISummaryColumnContentOptions {
        useAutoSummary?: boolean;
        template?: string | ((valueMap: IValueMap) => string);
    }

    interface ISummaryObject {
        height?: number;
        position?: string;
        defaultContent: string | ISummaryColumnContentOptions;
        columnContent?: {
            [propName: string]: string | ISummaryColumnContentOptions;
        };
    }

    interface ISummaryColumnValues {
        sum: number;
        avg: number;
        max: number;
        min: number;
        cnt: number;
    }

    interface ISummaryAllValues {
        [propName: string]: ISummaryColumnValues
    }

    interface IColumnOptions {
        minWidth?: number;
        resizable?: boolean;
        frozenCount?: number;
        frozenBorderWidth?: number;
    }

    interface ITreeColumnOptions {
        name?: string;
        useIcon: boolean;
        useCascadingCheckbox?: boolean;
    }

    interface IGridOptions {
        el: Element | JQuery;
        data?: IRow[] | ITreeRow[];
        header?: IHeaderOptions;
        virtualScrolling?: boolean;
        rowHeight?: string | number;
        minRowHeight?: number;
        bodyHeight?: string | number;
        minBodyHeight?: number;
        columnOptions?: IColumnOptions;
        treeColumnOptions?: ITreeColumnOptions;
        copyOptions?: ICopyOptions;
        useClientSort?: boolean;
        editingEvent?: string;
        scrollX?: boolean;
        scrollY?: boolean;
        showDummyRows?: boolean;
        keyColumnName?: string | null;
        heightResizable?: boolean;
        pagination?: boolean | Pagination;
        selectionUnit?: string;
        rowHeaders?: IRowHeadersOptions;
        columns: IColumnInfoOptions[];
        summary?: ISummaryObject;
        usageStatistics?: boolean;
    }

    interface ITableOutlineStyleOptions {
        border?: string;
        showVerticalBorder?: boolean;
    }

    interface ISelectionLayerStyleOptions {
        background?: string;
        border?: string;
    }

    interface IScrollbarStyleOptions {
        border?: string;
        background?: string;
        emptySpace?: string;
        thumb?: string;
        active?: string;
    }

    interface ITableHeaderStyleOptions {
        background?: string;
        border?: string;
    }

    interface ITableSummaryStyleOptions {
        background?: string;
        border?: string;
    }

    interface ITableAreaStyleOptions {
        header?: ITableHeaderStyleOptions;
        body?: {background?: string};
        summary?: ITableSummaryStyleOptions;
    }

    interface ICellStyleOptions {
        background?: string;
        border?: string;
        text?: string;
        showVerticalBorder?: boolean;
        showHorizontalBorder?: boolean;
    }

    interface IBasicCellStyleOptions {
        background?: string;
        text?: string;
    }

    interface ITableCellStyleOptions {
        normal?: ICellStyleOptions;
        head?: ICellStyleOptions;
        selectedHead?: {background?: string};
        rowHead?: ICellStyleOptions;
        selectedRowHead?: {background?: string};
        summary?: ICellStyleOptions;
        focused?: {
            background?: string;
            border?: string;
        };
        focusedInactive?: {border?: string};
        required?: IBasicCellStyleOptions;
        editable?: IBasicCellStyleOptions;
        disabled?: IBasicCellStyleOptions;
        invalid?: IBasicCellStyleOptions;
        currentRow?: IBasicCellStyleOptions;
        evenRow?: IBasicCellStyleOptions;
        oddRow?: IBasicCellStyleOptions;
        dummy?: {background?: string};
    }

    interface IPresetOptions {
        outline?: ITableOutlineStyleOptions;
        selection?: ISelectionLayerStyleOptions;
        scrollbar?: IScrollbarStyleOptions;
        frozenBorder?: {border?: string};
        area?: ITableAreaStyleOptions;
        cell?: ITableCellStyleOptions;
    }

    interface IRemoveRowOptions {
        removeOriginalData?: boolean;
        keepRowSpanData?: boolean;
    }

    interface IRowOptions {
        at?: number;
        extendPrevRowSpan?: boolean;
        focus?: boolean;
        parentRowKey?: number | string;
        offset?: number;
    }

    interface IModifiedOptions {
        checkedOnly?: boolean;
        withRawData?: boolean;
        rowKeyOnly?: boolean;
        ignoredColumns?: ColumnNameType[];
    }

    interface IRequestOptions {
        url?: string;
        hasDataParam?: boolean;
        checkedOnly?: boolean;
        modifiedOnly?: boolean;
        showConfirm?: boolean;
        updateOriginal?: boolean;
        withCredentials?: boolean;
    }

    class AddOn {
        public reloadData(): void;
        public readData(page: number, data?: object | null, resetData?: boolean): void;
        public request(requestType: string, options: IRequestOptions): boolean;
        public download(type: string): void;
        public setPerPage(perPage: number): void;
    }

    interface IUrlMapObject {
        readData?: string;
        createData?: string;
        updateData?: string;
        modifyData?: string;
        deleteData?: string;
        downloadExcel?: string;
        downloadExcelAll?: string;
    }

    interface IAddOnOptions {
        el?: JQuery;
        initialRequest?: boolean;
        readDataMethod?: string;
        api?: IUrlMapObject;
        perPage?: number;
        enableAjaxHistory?: boolean;
        withCredentials?: boolean;
    }

    interface ILanguageOptions {
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

    interface ISortedCommonState {
        columnName: string;
        ascending: boolean;
        useClient: boolean;
    }

    interface IRowSpanData {
        count: number;
        isMainRow: boolean;
        mainRowKey: string | number;
    }

    interface IError {
        columnName: string;
        errorCode: ErrorCodeType;
    }

    interface IValidation {
        rowKey: number | string;
        errors: IError[];
    }

    class Grid {
        public static getInstanceById(id: number): Grid;
        public static applyTheme(parseName: string, extOptions?: IPresetOptions): void;
        public static setLanguage(localeCode: string, data?: ILanguageOptions): void;

        constructor(options: IGridOptions);

        public disable(): void;
        public enable(): void;
        public disableRow(rowKey: RowKeyType): void;
        public enableRow(rowKey: RowKeyType): void;
        public getValue(rowKey: RowKeyType, columnName: ColumnNameType, isOriginal?: boolean): number | string;
        public getColumnValues(columnName: ColumnNameType, isJsonString?: boolean): ColumnValueType[] | string;
        public getRow(rowKey: RowKeyType, isJsonString?: boolean): RowType | string;
        public getRowAt(index: number, isJsonString?: boolean): RowType | string;
        public getRowCount(): number;
        public getFocusedCell(): number;
        public getElement(rowKey: RowKeyType, columnName: ColumnNameType): JQuery;
        public setValue(rowKey: RowKeyType, columnName: ColumnNameType, columnValue: ColumnValueType): void;
        public setColumnValues(columnName: ColumnNameType, columnValue: ColumnValueType,
                               sCheckCellState?: boolean): void;
        public resetData(data: RowType[]): void;
        public setData(data: RowType[], callback: () => void): void;
        public setBodyHeight(value: number): void;
        public focus(rowKey: RowKeyType, columnName: ColumnNameType, isScrollable?: boolean): void;
        public focusAt(rowIndex: RowKeyType, columnIndex: string, isScrollable?: boolean): void;
        public focusIn(rowKey: RowKeyType, columnName: ColumnNameType, isScrollable?: boolean): void;
        public focusInAt(rowIndex: RowKeyType, columnIndex: string, isScrollable?: boolean): void;
        public activateFocus(): void;
        public blur(): void;
        public checkAll(): void;
        public check(rowKey: RowKeyType): void;
        public uncheckAll(): void;
        public uncheck(rowKey: RowKeyType): void;
        public clear(): void;
        public removeRow(rowKey: RowKeyType, options: boolean | IRemoveRowOptions): void;
        public removeCheckedRows(showConfirm: boolean): boolean;
        public enableCheck(rowKey: RowKeyType): boolean;
        public disableCheck(rowKey: RowKeyType): boolean;
        public getCheckedRowKeys(isJsonString?: boolean): RowKeyType[] | string;
        public getCheckedRows(useJson?: boolean): RowType[] | string;
        public getColumns(): IColumnInfoOptions[];
        public getModifiedRows(options?: IModifiedOptions): RowType[];
        public appendRow(row?: RowType | RowType[], options?: IRowOptions): void;
        public prependRow(row?: RowType | RowType[], options?: {focus?: boolean}): void;
        public isModified(): boolean;
        public getAddOn(name: string): AddOn;
        public restore(): void;
        public setFrozenColumnCount(count: number): void;
        public setColumns(columns: IColumnInfoOptions[]): void;
        public use(name: string, options: IAddOnOptions): Grid;
        public getRows(): IRow[];
        public sort(columnName: ColumnNameType, ascending?: boolean): void;
        public unSort(): void;
        public getSortState(): ISortedCommonState;
        public addCellClassName(rowKey: RowKeyType, columnName: ColumnNameType, className: string): void;
        public addRowClassName(rowKey: RowKeyType, className: string): void;
        public removeCellClassName(rowKey: RowKeyType, columnName: ColumnNameType, className: string): void;
        public removeRowClassName(rowKey: RowKeyType, className: string): void;
        public getRowSpanData(rowKey: RowKeyType, columnName: ColumnNameType): IRowSpanData;
        public getIndexOfRow(rowKey: RowKeyType): number;
        public getIndexOfColumn(columnName: ColumnNameType): number;
        public getPagination(): Pagination;
        public setWidth(width: number): void;
        public setHeight(height: number): void;
        public refreshLayout(): void;
        public resetColumnWidths(): void;
        public showColumn(...args: string[]): void;
        public hideColumn(...args: string[]): void;
        public setSummaryColumnContent(columnName: ColumnNameType, contents: string | ISummaryColumnContentOptions): void;
        public getSummaryValues(): ISummaryAllValues;
        public getSummaryValues(columnName: ColumnNameType): ISummaryColumnValues;
        public setFooterColumnContent(columnName: ColumnNameType, contents: string): void;
        public validate(): IValidation[];
        public findRows(conditions: RowConditionType): IRow[];
        public copyToClipboard(): void;
        public selection(range: Range): void;
        public expand(rowKey: RowKeyType, recursive: boolean): RowKeyType[];
        public expandAll(): void;
        public collapse(rowKey: RowKeyType, recursive: boolean): ITreeRow[];
        public collapseAll(): void;
        public getAncestors(rowKey: RowKeyType): ITreeRow[];
        public getParent(rowKey: RowKeyType): ITreeRow;
        public getChildren(rowKey: RowKeyType): ITreeRow[];
        public getDepth(rowKey: RowKeyType): number;
        public destroy(): void;
        public on(eventName: CustomEventType, handler: (ev: any) => void): void;
    }
}

declare module 'tui-grid' {
    export default tuiGrid.Grid;
}
