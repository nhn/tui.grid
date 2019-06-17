import {
  OptGrid,
  OptPreset,
  OptI18nData,
  OptSummaryColumnContentMap,
  OptRow,
  OptAppendRow,
  OptPrependRow,
  OptRemoveRow,
  OptColumn,
  OptHeader
} from './types';
import { createStore } from './store/create';
import { Root } from './view/root';
import { h, render } from 'preact';
import { createDispatcher, Dispatch } from './dispatch/create';
import {
  Store,
  CellValue,
  RowKey,
  Range,
  Row,
  InvalidRow,
  ColumnInfo,
  Dictionary
} from './store/types';
import themeManager, { ThemeOptionPresetNames } from './theme/manager';
import { register, registerDataSources } from './instance';
import i18n from './i18n';
import { getText } from './query/clipboard';
import { getInvalidRows } from './query/validation';
import { isSupportWindowClipboardData } from './helper/clipboard';
import { findPropIndex, isUndefined, mapProp, findProp } from './helper/common';
import { Observable, getOriginObject } from './helper/observable';
import { createEventBus, EventBus } from './event/eventBus';
import { getConditionalRows, getCellAddressByIndex, getCheckedRows } from './query/data';
import { isRowHeader } from './helper/column';
import { createProvider } from './dataSource/serverSideDataProvider';
import { createManager } from './dataSource/modifiedDataManager';
import { getConfirmMessage } from './dataSource/helper/message';
import { PaginationManager, createPaginationManager } from './pagination/paginationManager';
import {
  RequestOptions,
  RequestType,
  DataProvider,
  ModifiedRowsOptions,
  Params,
  ModifiedDataManager
} from './dataSource/types';
import { getParentRow, getChildRows, getAncestorRows, getDescendantRows } from './query/tree';
import { getDepth } from './helper/tree';
import { cls, dataAttr } from './helper/dom';
import { getRowSpanByRowKey } from './helper/rowSpan';
import { sendHostname } from './helper/googleAnalytics';

/* eslint-disable */
if ((module as any).hot) {
  require('preact/devtools');
}
/* eslint-enable */

export default class Grid {
  private el: HTMLElement;

  private store: Store;

  private dispatch: Dispatch;

  private eventBus: EventBus;

  private dataProvider: DataProvider;

  private dataManager: ModifiedDataManager;

  private paginationManager: PaginationManager;

  public constructor(options: OptGrid) {
    const { el, usageStatistics = true } = options;
    const id = register(this);
    const store = createStore(id, options);
    const dispatch = createDispatcher(store);
    const eventBus = createEventBus(id);
    const dataProvider = createProvider(store, dispatch, options.data);
    const dataManager = createManager();
    const paginationManager = createPaginationManager();

    this.el = el;
    this.store = store;
    this.dispatch = dispatch;
    this.eventBus = eventBus;
    this.dataProvider = dataProvider;
    this.dataManager = dataManager;
    this.paginationManager = paginationManager;

    if (usageStatistics) {
      sendHostname();
    }

    registerDataSources(id, dataProvider, dataManager, paginationManager);

    // @TODO: Only for Development env
    // eslint-disable-next-line
    (window as any).store = store;

    if (!themeManager.isApplied()) {
      themeManager.apply('default');
    }
    if (Array.isArray(options.data)) {
      this.dataManager.setOriginData(options.data);
    }

    render(<Root store={store} dispatch={dispatch} rootElement={el} />, el);
  }

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
  public static applyTheme(presetName: ThemeOptionPresetNames, extOptions?: OptPreset) {
    themeManager.apply(presetName, extOptions);
  }

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
  public static setLanguage(localeCode: string, data?: OptI18nData) {
    i18n.setLanguage(localeCode, data);
  }

  /**
   * Sets the width of the dimension.
   * @param {number} width - The width of the dimension
   */
  public setWidth(width: number) {
    this.dispatch('setWidth', width, false);
  }

  /**
   * Sets the height of the dimension.
   * @param {number} height - The height of the dimension
   */
  public setHeight(height: number) {
    this.dispatch('setHeight', height);
  }

  /**
   * Sets the height of body-area.
   * @param {number} value - The number of pixel
   */
  public setBodyHeight(bodyHeight: number) {
    this.dispatch('setBodyHeight', bodyHeight);
  }

  /**
   * Sets options for header.
   * @param {Object} options - Options for header
   * @param {number} [options.height] -  The height value
   * @param {Array} [options.complexColumns] - The complex columns info
   */
  public setHeader({ height, complexColumns }: OptHeader) {
    if (height) {
      this.dispatch('setHeaderHeight', height);
    }

    if (complexColumns) {
      this.dispatch('setComplexHeaderColumns', complexColumns);
    }
  }

  /**
   * Sets the count of frozen columns.
   * @param {number} count - The count of columns to be frozen
   */
  public setFrozenColumnCount(count: number) {
    this.dispatch('setFrozenColumnCount', count);
  }

  /**
   * Hides columns
   * @param {...string} arguments - Column names to hide
   */
  public hideColumn(columnName: string) {
    this.dispatch('hideColumn', columnName);
  }

  /**
   * Shows columns
   * @param {...string} arguments - Column names to show
   */
  public showColumn(columnName: string) {
    this.dispatch('showColumn', columnName);
  }

  /**
   * Selects cells or rows by range
   * @param {Object} range - Selection range
   *     @param {Array} [range.start] - Index info of start selection (ex: [rowIndex, columnIndex])
   *     @param {Array} [range.end] - Index info of end selection (ex: [rowIndex, columnIndex])
   */
  public setSelectionRange(range: { start: Range; end: Range }) {
    this.dispatch('setSelection', range);
  }

  /**
   * Returns data of currently focused cell
   * @returns {number|string} rowKey - The unique key of the row
   * @returns {string} columnName - The name of the column
   * @returns {string} value - The value of the cell
   */
  public getFocusedCell() {
    const { columnName, rowKey } = this.store.focus;
    let value = null;

    if (rowKey !== null && columnName !== null) {
      value = this.getValue(rowKey, columnName);
    }

    return { rowKey, columnName, value };
  }

  /**
   * Removes focus from the focused cell.
   */
  public blur() {
    // @TODO: save previous 이후 추가 필요.
    this.dispatch('setFocusInfo', null, null, false);
  }

  /**
   * Focus to the cell identified by given rowKey and columnName.
   * @param {Number|String} rowKey - rowKey
   * @param {String} columnName - columnName
   * @param {Boolean} [setScroll=false] - if set to true, move scroll position to focused position
   * @returns {Boolean} true if focused cell is changed
   */
  public focus(rowKey: RowKey, columnName: string, setScroll?: boolean) {
    this.dispatch('setFocusInfo', rowKey, columnName, true);

    if (setScroll) {
      this.dispatch('setScrollToFocus');
    }

    // @TODO: radio button인지 확인, radio 버튼인 경우 체크해주기
    return true;
  }

  /**
   * Focus to the cell identified by given rowIndex and columnIndex.
   * @param {Number} rowIndex - rowIndex
   * @param {Number} columnIndex - columnIndex
   * @param {boolean} [setScroll=false] - if set to true, scroll to focused cell
   * @returns {Boolean} true if success
   */
  public focusAt(rowIndex: number, columnIndex: number, isScrollable?: boolean) {
    const { rowKey, columnName } = getCellAddressByIndex(this.store, rowIndex, columnIndex);

    if (!isUndefined(rowKey) && columnName) {
      return this.focus(rowKey, columnName, isScrollable);
    }
    return false;
  }

  /**
   * Makes view ready to get keyboard input.
   */
  public activateFocus() {
    this.dispatch('setNavigating', true);
  }

  /**
   * Sets focus on the cell at the specified index of row and column and starts to edit.
   * @param {number|string} rowKey - The unique key of the row
   * @param {string} columnName - The name of the column
   * @param {boolean} [setScroll=false] - If set to true, the view will scroll to the cell element.
   */
  public startEditing(rowKey: RowKey, columnName: string, setScroll?: boolean) {
    if (this.focus(rowKey, columnName, setScroll)) {
      this.dispatch('startEditing', rowKey, columnName);
    }
  }

  /**
   * Sets focus on the cell at the specified index of row and column and starts to edit.
   * @param {number|string} rowIndex - The index of the row
   * @param {string} columnIndex - The index of the column
   * @param {boolean} [setScroll=false] - If set to true, the view will scroll to the cell element.
   */
  public startEditingAt(rowIndex: number, columnIndex: number, setScroll?: boolean) {
    const { rowKey, columnName } = getCellAddressByIndex(this.store, rowIndex, columnIndex);

    this.startEditing(rowKey, columnName, setScroll);
  }

  /**
   * Sets the value of the cell identified by the specified rowKey and columnName.
   * @param {number|string} rowKey - The unique key of the row
   * @param {string} columnName - The name of the column
   * @param {number|string} value - The value to be set
   */
  public setValue(rowKey: RowKey, columnName: string, value: CellValue) {
    this.dispatch('setValue', rowKey, columnName, value);
  }

  /**
   * Returns the value of the cell identified by the rowKey and columnName.
   * @param {number|string} rowKey - The unique key of the target row.
   * @param {string} columnName - The name of the column
   * @param {boolean} [isOriginal] - It set to true, the original value will be return.
   * @returns {number|string} - The value of the cell
   */
  public getValue(rowKey: RowKey, columnName: string): CellValue | null {
    const targetRow = this.store.data.rawData.find((row) => row.rowKey === rowKey);

    // @TODO: isOriginal 처리 original 개념 추가되면 필요(getOriginal)
    if (targetRow) {
      return targetRow[columnName];
    }

    return null;
  }

  /**
   * Sets the all values in the specified column.
   * @param {string} columnName - The name of the column
   * @param {number|string} columnValue - The value to be set
   * @param {boolean} [checkCellState=true] - If set to true, only editable and not disabled cells will be affected.
   */
  public setColumnValues(columnName: string, columnValue: CellValue, checkCellState?: boolean) {
    this.dispatch('setColumnValues', columnName, columnValue, checkCellState);
  }

  /**
   * Returns the HTMLElement of the cell identified by the rowKey and columnName.
   * @param {number|string} rowKey - The unique key of the row
   * @param {string} columnName - The name of the column
   * @returns {HTMLElement} - The HTMLElement of the cell element
   */
  public getElement(rowKey: RowKey, columnName: string) {
    return this.el.querySelector(
      `.${cls('cell')}[${dataAttr.ROW_KEY}="${rowKey}"][${dataAttr.COLUMN_NAME}="${columnName}"]`
    );
  }

  /**
   * Sets the HTML string of given column summary.
   * The type of content is the same as the options.summary.columnContent of the constructor.
   * @param {string} columnName - column name
   * @param {string|object} columnContent - HTML string or options object.
   */
  public setSummaryColumnContent(
    columnName: string,
    columnContent: string | OptSummaryColumnContentMap
  ) {
    this.dispatch('setSummaryColumnContent', columnName, columnContent);
  }

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
  public getSummaryValues(columnName: string) {
    const { summary } = this.store;
    const content = summary.summaryColumnContents[columnName];
    if (content && content.useAutoSummary) {
      return summary.summaryValues[columnName];
    }
    return null;
  }

  /**
   * Returns a list of the column model.
   * @returns {Array} - A list of the column model.
   */
  public getColumns() {
    return this.store.column.allColumns
      .filter(({ name }) => !isRowHeader(name))
      .map((column) => getOriginObject(column as Observable<ColumnInfo>));
  }

  /**
   * Sets the list of column model.
   * @param {Array} columns - A new list of column model
   */
  public setColumns(columns: OptColumn[]) {
    this.dispatch('setColumns', columns);
  }

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
  public setColumnHeaders(columnsMap: Dictionary<string>) {
    this.dispatch('changeColumnHeadersByName', columnsMap);
  }

  /**
   * Resets the width of each column by using initial setting of column models.
   */
  public resetColumnWidths(widths: number[]) {
    this.dispatch('resetColumnWidths', widths);
  }

  /**
   * Returns a list of all values in the specified column.
   * @param {string} columnName - The name of the column
   * @returns {(Array|string)} - A List of all values in the specified column. (or JSON string of the list)
   */
  public getColumnValues(columnName: string) {
    return mapProp(columnName, this.store.data.rawData);
  }

  /**
   * Returns the index of the column indentified by the column name.
   * @param {string} columnName - The unique key of the column
   * @returns {number} - The index of the column
   */
  public getIndexOfColumn(columnName: string) {
    return findPropIndex('name', columnName, this.store.column.allColumns);
  }

  /**
   * Checks the row identified by the specified rowKey.
   * @param {number|string} rowKey - The unique key of the row
   */
  public check(rowKey: RowKey) {
    this.dispatch('check', rowKey);
  }

  /**
   * Unchecks the row identified by the specified rowKey.
   * @param {number|string} rowKey - The unique key of the row
   */
  public uncheck(rowKey: RowKey) {
    this.dispatch('uncheck', rowKey);
  }

  /**
   * Checks all rows.
   */
  public checkAll() {
    this.dispatch('checkAll');
  }

  /**
   * Unchecks all rows.
   */
  public uncheckAll() {
    this.dispatch('uncheckAll');
  }

  /**
   * Returns a list of the rowKey of checked rows.
   * @returns {Array.<string|number>} - A list of the rowKey.
   */
  public getCheckedRowKeys(): RowKey[] {
    return getCheckedRows(this.store).map(({ rowKey }) => rowKey);
  }

  /**
   * Returns a list of the checked rows.
   * @returns {Array.<object>} - A list of the checked rows.
   */
  public getCheckedRows(): Row[] {
    return getCheckedRows(this.store).map((row) => getOriginObject(row as Observable<Row>));
  }

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
  public findRows(conditions: ((row: Row) => boolean) | Dictionary<any>) {
    return getConditionalRows(this.store, conditions);
  }

  /**
   * Sorts all rows by the specified column.
   * @param {string} columnName - The name of the column to be used to compare the rows
   * @param {boolean} [ascending] - Whether the sort order is ascending.
   *        If not specified, use the negative value of the current order.
   */
  public sort(columnName: string, ascending: boolean) {
    this.dispatch('sort', columnName, ascending);
  }

  /**
   * Unsorts all rows. (Sorts by rowKey).
   */
  public unsort() {
    // @TODO need to multi sort(rowSpan mainkey, rowKey) for rowSpan
    this.dispatch('sort', 'rowKey', true);
  }

  /**
   * Gets state of the sorted column in rows
   * @returns {{columnName: string, ascending: boolean, useClient: boolean}} Sorted column's state
   */
  public getSortState() {
    return this.store.data.sortOptions;
  }

  /**
   * Copy to clipboard
   */
  public copyToClipboard() {
    document.querySelector('.tui-grid-clipboard')!.innerHTML = getText(this.store);

    if (!isSupportWindowClipboardData()) {
      // Accessing the clipboard is a security concern on chrome
      document.execCommand('copy');
    }
  }

  /*
   * Validates all data and returns the result.
   * Return value is an array which contains only rows which have invalid cell data.
   * @returns {Array.<Object>} An array of error object
   * @example
   * // return value example
   * [
   *     {
   *         rowKey: 1,
   *         errors: [
   *             {
   *                 columnName: 'c1',
   *                 errorCode: 'REQUIRED'
   *             },
   *             {
   *                 columnName: 'c2',
   *                 errorCode: 'REQUIRED'
   *             }
   *         ]
   *     },
   *     {
   *         rowKey: 3,
   *         errors: [
   *             {
   *                 columnName: 'c2',
   *                 errorCode: 'REQUIRED'
   *             }
   *         ]
   *     }
   * ]
   */
  public validate(): InvalidRow[] {
    return getInvalidRows(this.store);
  }

  /**
   * Enables all rows.
   */
  public enable() {
    this.dispatch('setDisabled', false);
  }

  /**
   * Disables all rows.
   */
  public disable() {
    this.dispatch('setDisabled', true);
  }

  /**
   * Disables the row identified by the rowkey.
   * @param {number|string} rowKey - The unique key of the target row
   * @param {boolean} [withCheckbox] - change including checkbox. The default value is 'true'
   */
  public disableRow(rowKey: RowKey, withCheckbox: boolean = true) {
    this.dispatch('setRowDisabled', true, rowKey, withCheckbox);
  }

  /**
   * Enables the row identified by the rowKey.
   * @param {number|string} rowKey - The unique key of the target row
   * @param {boolean} [withCheckbox] - change including checkbox. The default value is 'true'
   */
  public enableRow(rowKey: RowKey, withCheckbox: boolean = true) {
    this.dispatch('setRowDisabled', false, rowKey, withCheckbox);
  }

  /**
   * Disables the row identified by the spcified rowKey to not be able to check.
   * @param {number|string} rowKey - The unique keyof the row.
   */
  public disableRowCheck(rowKey: RowKey) {
    this.dispatch('setRowCheckDisabled', true, rowKey);
  }

  /**
   * Enables the row identified by the rowKey to be able to check.
   * @param {number|string} rowKey - The unique key of the row
   */
  public enableRowCheck(rowKey: RowKey) {
    this.dispatch('setRowCheckDisabled', false, rowKey);
  }

  /*
   * Inserts the new row with specified data to the end of table.
   * @param {Object} [row] - The data for the new row
   * @param {Object} [options] - Options
   * @param {number} [options.at] - The index at which new row will be inserted
   * @param {boolean} [options.extendPrevRowSpan] - If set to true and the previous row at target index
   *        has a rowspan data, the new row will extend the existing rowspan data.
   * @param {boolean} [options.focus] - If set to true, move focus to the new row after appending
   * @param {(Number|String)} [options.parentRowKey] - Tree row key of the parent which appends given rows
   * @param {number} [options.offset] - Tree offset from first sibling
   */
  public appendRow(row: OptRow = {}, options: OptAppendRow = {}) {
    const { treeColumnName } = this.store.column;

    if (treeColumnName) {
      this.dispatch('appendTreeRow', row, options);
    } else {
      this.dispatch('appendRow', row, options);
    }

    if (options.focus) {
      const rowIdx = isUndefined(options.at) ? this.getRowCount() - 1 : options.at;
      this.focusAt(rowIdx, 0);
    }
  }

  /**
   * Inserts the new row with specified data to the beginning of table.
   * @param {Object} [row] - The data for the new row
   * @param {Object} [options] - Options
   * @param {boolean} [options.focus] - If set to true, move focus to the new row after appending
   */
  public prependRow(row: OptRow, options: OptPrependRow = {}) {
    this.appendRow(row, { ...options, at: 0 });
  }

  /**
   * Removes the row identified by the specified rowKey.
   * @param {number|string} rowKey - The unique key of the row
   * @param {boolean} [options.removeOriginalData] - If set to true, the original data will be removed.
   * @param {boolean} [options.keepRowSpanData] - If set to true, the value of the merged cells will not be
   *     removed although the target is first cell of them.
   */
  public removeRow(rowKey: RowKey, options: OptRemoveRow = {}) {
    const { treeColumnName } = this.store.column;

    if (treeColumnName) {
      this.dispatch('removeTreeRow', rowKey, options);
    } else {
      this.dispatch('removeRow', rowKey, options);
    }
  }

  /**
   * Returns the object that contains all values in the specified row.
   * @param {number|string} rowKey - The unique key of the target row
   * @returns {Object} - The object that contains all values in the row.
   */
  public getRow(rowKey: RowKey) {
    return this.getRowAt(this.getIndexOfRow(rowKey));
  }

  /**
   * Returns the object that contains all values in the row at specified index.
   * @param {number} rowIdx - The index of the row
   * @returns {Object} - The object that contains all values in the row.
   */
  public getRowAt(rowIdx: number) {
    const row = this.store.data.rawData[rowIdx];
    return row ? getOriginObject(row as Observable<Row>) : null;
  }

  /**
   * Returns the index of the row indentified by the rowKey.
   * @param {number|string} rowKey - The unique key of the row
   * @returns {number} - The index of the row
   */
  public getIndexOfRow(rowKey: RowKey) {
    return findPropIndex('rowKey', rowKey, this.store.data.rawData);
  }

  /**
   * Returns a list of all rows.
   * @returns {Array} - A list of all rows
   */
  public getData() {
    return this.store.data.rawData.map((row) => getOriginObject(row as Observable<Row>));
  }

  /**
   * Returns the total number of the rows.
   * @returns {number} - The total number of the rows
   */
  public getRowCount() {
    return this.store.data.rawData.length;
  }

  /**
   * Removes all rows.
   */
  public clear() {
    this.dispatch('clearData');
  }

  /**
   * Replaces all rows with the specified list. This will not change the original data.
   * @param {Array} data - A list of new rows
   */
  public resetData(data: OptRow[]) {
    this.dispatch('resetData', data);
  }

  /**
   * Adds the specified css class to cell element identified by the rowKey and className
   * @param {number|string} rowKey - The unique key of the row
   * @param {string} columnName - The name of the column
   * @param {string} className - The css class name to add
   */
  public addCellClassName(rowKey: RowKey, columnName: string, className: string) {
    this.dispatch('addCellClassName', rowKey, columnName, className);
  }

  /**
   * Adds the specified css class to all cell elements in the row identified by the rowKey
   * @param {number|string} rowKey - The unique key of the row
   * @param {string} className - The css class name to add
   */
  public addRowClassName(rowKey: RowKey, className: string) {
    this.dispatch('addRowClassName', rowKey, className);
  }

  /**
   * Removes the specified css class from the cell element indentified by the rowKey and columnName.
   * @param {number|string} rowKey - The unique key of the row
   * @param {string} columnName - The name of the column
   * @param {string} className - The css class name to be removed
   */
  public removeCellClassName(rowKey: RowKey, columnName: string, className: string) {
    this.dispatch('removeCellClassName', rowKey, columnName, className);
  }

  /**
   * Removes the specified css class from all cell elements in the row identified by the rowKey.
   * @param {number|string} rowKey - The unique key of the row
   * @param {string} className - The css class name to be removed
   */
  public removeRowClassName(rowKey: RowKey, className: string) {
    this.dispatch('removeRowClassName', rowKey, className);
  }

  public on(eventName: string, fn: Function) {
    this.eventBus.on(eventName, fn);
  }

  public off(eventName: string, fn?: Function) {
    this.eventBus.off(eventName, fn);
  }

  /**
   * Returns an instance of tui.Pagination.
   * @returns {tui.Pagination}
   */
  public getPagination() {
    return this.paginationManager.getPagination();
  }

  /**
   * Set number of rows per page and reload current page
   * @param {number} perPage - Number of rows per page
   */
  public setPerPage(perPage: number) {
    const pagination = this.getPagination();
    if (pagination) {
      pagination.setItemsPerPage(perPage);
      this.readData(1, { perPage });
    }
  }

  /**
   * Returns true if there are at least one row modified.
   * @returns {boolean} - True if there are at least one row modified.
   */
  public isModified() {
    return this.dataManager.isModified();
  }

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
  public getModifiedRows(options: ModifiedRowsOptions = {}) {
    const { ignoredColumns } = options;
    const { ignoredColumns: originIgnoredColumns } = this.store.column;
    options.ignoredColumns = Array.isArray(ignoredColumns)
      ? ignoredColumns.concat(originIgnoredColumns)
      : originIgnoredColumns;
    return this.dataManager.getAllModifiedData(options);
  }

  /**
   * Requests 'readData' to the server. The last requested data will be extended with new data.
   * @param {Number} page - Page number
   * @param {Object} data - Data(parameters) to send to the server
   * @param {Boolean} resetData - If set to true, last requested data will be ignored.
   */
  public readData(page: number, data?: Params, resetData?: boolean) {
    this.dataProvider.readData(page, data, resetData);
  }

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
  public request(requestType: RequestType, options: RequestOptions = {}) {
    this.dataProvider.request(requestType, options);
  }

  /**
   * Requests 'readData' with last requested data.
   */
  public reloadData() {
    this.dataProvider.reloadData();
  }

  /**
   * Restores the data to the original data.
   * (Original data is set by {@link Grid#resetData|resetData}
   */
  public restore() {
    this.resetData(this.dataManager.getOriginData());
  }

  /**
   * Expands tree row.
   * @param {number|string} rowKey - The unique key of the row
   * @param {boolean} recursive - true for recursively expand all descendant
   */
  public expand(rowKey: RowKey, recursive?: boolean) {
    this.dispatch('expandByRowKey', rowKey, recursive);
  }

  /**
   * Expands all tree row.
   */
  public expandAll() {
    this.dispatch('expandAll');
  }

  /**
   * Expands tree row.
   * @param {number|string} rowKey - The unique key of the row
   * @param {boolean} recursive - true for recursively expand all descendant
   */
  public collapse(rowKey: RowKey, recursive?: boolean) {
    this.dispatch('collapseByRowKey', rowKey, recursive);
  }

  /**
   * Collapses all tree row.
   */
  public collapseAll() {
    this.dispatch('collapseAll');
  }

  /**
   * Gets the parent of the row which has the given row key.
   * @param {number|string} rowKey - The unique key of the row
   * @returns {Object} - the parent row
   */
  public getParentRow(rowKey: RowKey) {
    return getParentRow(this.store, rowKey, true);
  }

  /**
   * Gets the children of the row which has the given row key.
   * @param {number|string} rowKey - The unique key of the row
   * @returns {Array.<Object>} - the children rows
   */
  public getChildRows(rowKey: RowKey) {
    return getChildRows(this.store, rowKey, true);
  }

  /**
   * Gets the ancestors of the row which has the given row key.
   * @param {number|string} rowKey - The unique key of the row
   * @returns {Array.<TreeRow>} - the ancestor rows
   */
  public getAncestorRows(rowKey: RowKey) {
    return getAncestorRows(this.store, rowKey);
  }

  /**
   * Gets the descendants of the row which has the given row key.
   * @param {number|string} rowKey - The unique key of the row
   * @returns {Array.<Object>} - the descendant rows
   */
  public getDescendantRows(rowKey: RowKey) {
    return getDescendantRows(this.store, rowKey);
  }

  /**
   * Gets the depth of the row which has the given row key.
   * @param {number|string} rowKey - The unique key of the row
   * @returns {number} - the depth
   */
  public getDepth(rowKey: RowKey) {
    const { rawData } = this.store.data;
    const row = findProp('rowKey', rowKey, rawData);

    return row ? getDepth(rawData, row) : 0;
  }

  /**
   * Returns the rowspan data of the cell identified by the rowKey and columnName.
   * @param {number|string} rowKey - The unique key of the row
   * @param {string} columnName - The name of the column
   * @returns {Object} - Row span data
   */
  public getRowSpanData(rowKey: RowKey, columnName: string) {
    return getRowSpanByRowKey(rowKey, columnName, this.store.data.rawData);
  }

  /**
   * reset original data to current data.
   * (Original data is set by {@link Grid#resetData|resetData}
   */
  public resetOriginData() {
    this.dataManager.setOriginData(this.getData());
  }

  /** Removes all checked rows.
   * @param {boolean} [showConfirm] - If set to true, confirm message will be shown before remove.
   * @returns {boolean} - True if there's at least one row removed.
   */
  public removeCheckedRows(showConfirm?: boolean) {
    const rowKeys = this.getCheckedRowKeys();
    const confirmMessage = getConfirmMessage('DELETE', rowKeys.length);

    if (rowKeys.length > 0 && (!showConfirm || confirm(confirmMessage))) {
      rowKeys.forEach((rowKey) => {
        this.removeRow(rowKey);
      });

      return true;
    }

    return false;
  }

  /**
   * Refreshs the layout view. Use this method when the view was rendered while hidden.
   */
  public refreshLayout() {
    const containerEl = this.el.querySelector(`.${cls('container')}`) as HTMLElement;
    const { parentElement } = this.el;

    this.dispatch('refreshLayout', containerEl, parentElement!);
  }
}
