// Type definitions for TOAST UI Grid v4.16.1
// TypeScript Version: 3.9.5

import { CellValue, RowKey, Row, SortState, RowSpan, InvalidRow } from './store/data';
import { SummaryColumnContentMap, SummaryValueMap } from './store/summary';
import { ColumnInfo } from './store/column';
import { Range } from './store/selection';
import {
  Dictionary,
  GridEventName,
  GridEventListener,
  OptThemePresetNames,
  OptPreset,
  OptI18nData,
  OptGrid,
  OptAppendRow,
  OptPrependRow,
  OptRemoveRow,
  OptHeader,
  OptRow,
  OptColumn,
  ResetOptions,
} from './options';
import {
  ModifiedRowsOptions,
  ModifiedRows,
  Params,
  RequestType,
  ModificationTypeCode,
  RequestOptions,
} from './dataSource';
import { FilterOptionType, Filter, FilterState } from './store/filterLayerState';

type InternalProp =
  | 'sortKey'
  | 'uniqueKey'
  | 'rowSpanMap'
  | '_relationListItemMap'
  | '_disabledPriority';

export interface Pagination {
  getCurrentPage(): number;

  movePageTo(targetPage: number): void;

  reset(totalItems: number): void;

  setItemsPerPage(itemCount: number): void;

  setTotalItems(itemCount: number): void;

  on(eventType: string, callback: (evt: any) => void): void;

  off(eventType: string): void;
}

declare namespace tui {
  export class Grid {
    public static applyTheme(presetName: OptThemePresetNames, extOptions?: OptPreset): void;

    public static setLanguage(localeCode: string, data?: OptI18nData): void;

    constructor(optGrid: OptGrid);

    public setWidth(width: number): void;

    public setHeight(height: number): void;

    public setBodyHeight(bodyHeight: number): void;

    public setHeader({ height, complexColumns }: OptHeader): void;

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

    public setColumns(columns: OptColumn[]): void;

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

    public appendRow(row?: OptRow, options?: OptAppendRow): void;

    public prependRow(row: OptRow, options?: OptPrependRow): void;

    public removeRow(rowKey: RowKey, options?: OptRemoveRow): void;

    public getRow(rowKey: RowKey): Row | null;

    public getRowAt(rowIdx: number): Row | null;

    public getIndexOfRow(rowKey: RowKey): number;

    public getData(): Omit<Row, InternalProp>[];

    public getRowCount(): number;

    public clear(): void;

    public resetData(data: OptRow[], options?: ResetOptions): void;

    public addCellClassName(rowKey: RowKey, columnName: string, className: string): void;

    public addRowClassName(rowKey: RowKey, className: string): void;

    public removeCellClassName(rowKey: RowKey, columnName: string, className: string): void;

    public removeRowClassName(rowKey: RowKey, className: string): void;

    public on(eventName: GridEventName, fn: GridEventListener): void;

    public off(eventName: GridEventName, fn?: GridEventListener): void;

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

    public setFilter(
      columnName: string,
      filterOptionType: FilterOptionType | FilterOptionType
    ): void;

    public getFilterState(): Filter[] | null;

    public filter(columnName: string, state: FilterState[]): void;

    public unfilter(columnName?: string): void;

    public addColumnClassName(columnName: string, className: string): void;

    public removeColumnClassName(columnName: string, className: string): void;

    public setRow(rowKey: RowKey, row: OptRow): void;

    public moveRow(rowKey: RowKey, targetIndex: number): void;

    public setRequestParams(params: Dictionary<any>): void;

    public clearModifiedData(type?: ModificationTypeCode): void;

    public appendRows(data: OptRow[]): void;

    public getFormattedValue(rowKey: RowKey, columnName: string): string | null;

    public setPaginationTotalCount(totalCount: number): void;

    public getPaginationTotalCount(): number;
  }
}

// typesciprt doesn't support the nested namespace
// export as namespace tui.Grid;

export {
  CellValue,
  RowKey,
  Row,
  SortState,
  RowSpan,
  InvalidRow,
  SummaryColumnContentMap,
  SummaryValueMap,
  ColumnInfo,
  Range,
  Dictionary,
  GridEventName,
  GridEventListener,
  OptThemePresetNames as ThemePresetNameOptions,
  OptPreset as PresetOptions,
  OptI18nData as I18nDataOptions,
  OptGrid as GridOptions,
  OptAppendRow as AppendRowOptions,
  OptPrependRow as PrependRowOptions,
  OptRemoveRow as RemoveRowOptions,
  OptHeader as HeaderOptions,
  OptRow as RowOptions,
  OptColumn as ColumnOptions,
  ModifiedRowsOptions,
  ModifiedRows,
  Params,
  RequestType,
  ModificationTypeCode,
  RequestOptions,
  FilterOptionType,
  Filter,
  FilterState,
};
export default tui.Grid;
