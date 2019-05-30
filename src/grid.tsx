import {
  OptGrid,
  OptPreset,
  OptI18nData,
  OptSummaryColumnContentMap,
  OptRow,
  OptAppendRow,
  OptPrependRow,
  OptRemoveRow
} from './types';
import { createStore } from './store/create';
import { Root } from './view/root';
import { h, render } from 'preact';
import { createDispatcher, Dispatch } from './dispatch/create';
import { Store, CellValue, RowKey, Range, Row, InvalidRow } from './store/types';
import themeManager, { ThemeOptionPresetNames } from './theme/manager';
import { register } from './instance';
import i18n from './i18n';
import { getText } from './query/clipboard';
import { getInvalidRows } from './query/validation';
import { isSupportWindowClipboardData } from './helper/clipboard';
import { findPropIndex, isUndefined } from './helper/common';
import { Observable, getOriginObject } from './helper/observable';
import { createEventBus, EventBus } from './event/eventBus';
import { getCellAddressByIndex } from './query/data';

/* eslint-disable */
if ((module as any).hot) {
  require('preact/devtools');
}
/* eslint-enable */

export default class Grid {
  private store: Store;

  private dispatch: Dispatch;

  private eventBus: EventBus;

  public constructor(options: OptGrid) {
    const { el } = options;
    const id = register(this);

    const store = createStore(id, options);
    const dispatch = createDispatcher(store);
    const eventBus = createEventBus(id);

    this.store = store;
    this.dispatch = dispatch;
    this.eventBus = eventBus;

    // @TODO: Only for Development env
    // eslint-disable-next-line
    (window as any).store = store;

    if (!themeManager.isApplied()) {
      themeManager.apply('default');
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
   *         @param {Object} [extOptions.cell.head] - Styles for head cells.
   *             @param {string} [extOptions.cell.head.background] - Background color of head cells.
   *             @param {string} [extOptions.cell.head.border] - border color of head cells.
   *             @param {string} [extOptions.cell.head.text] - text color of head cells.
   *             @param {boolean} [extOptions.cell.head.showVerticalBorder] - Whether vertical borders of
   *                 head cells are visible.
   *             @param {boolean} [extOptions.cell.head.showHorizontalBorder] - Whether horizontal borders of
   *                 head cells are visible.
   *         @param {Object} [extOptions.cell.selectedHead] - Styles for selected head cells.
   *             @param {string} [extOptions.cell.selectedHead.background] - background color of selected haed cells.
   *         @param {Object} [extOptions.cell.rowHead] - Styles for row's head cells.
   *             @param {string} [extOptions.cell.rowHead.background] - Background color of row's head cells.
   *             @param {string} [extOptions.cell.rowHead.border] - border color of row's head cells.
   *             @param {string} [extOptions.cell.rowHead.text] - text color of row's head cells.
   *             @param {boolean} [extOptions.cell.rowHead.showVerticalBorder] - Whether vertical borders of
   *                 row's head cells are visible.
   *             @param {boolean} [extOptions.cell.rowHead.showHorizontalBorder] - Whether horizontal borders of
   *                 row's head cells are visible.
   *         @param {Object} [extOptions.cell.selectedRowHead] - Styles for selected row's head cells.
   *             @param {string} [extOptions.cell.selectedRowHead.background] - background color of selected row's haed cells.
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
  public selection(range: { start: Range; end: Range }) {
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
   * @param {Boolean} isScrollable - if set to true, move scroll position to focused position
   * @returns {Boolean} true if focused cell is changed
   */
  public focus(rowKey: RowKey, columnName: string, isScrollable?: boolean) {
    this.dispatch('setFocusInfo', rowKey, columnName, true);
    this.dispatch('setScrollToFocus');

    // @TODO: radio button인지 확인, radio 버튼인 경우 체크해주기
    return true;
  }

  /**
   * Focus to the cell identified by given rowIndex and columnIndex.
   * @param {Number} rowIndex - rowIndex
   * @param {Number} columnIndex - columnIndex
   * @param {boolean} [isScrollable=false] - if set to true, scroll to focused cell
   * @returns {Boolean} true if success
   */
  public focusAt(rowIndex: number, columnIndex: number, isScrollable?: boolean) {
    const { rowKey, columnName } = getCellAddressByIndex(this.store, rowIndex, columnIndex);

    if (isUndefined(rowKey) && columnName) {
      return this.focus(rowKey, columnName, isScrollable);
    }
    return false;
  }

  /**
   * Sets focus on the cell at the specified index of row and column and starts to edit.
   * @param {number|string} rowKey - The unique key of the row
   * @param {string} columnName - The name of the column
   * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.
   */
  public startEditing(rowKey: RowKey, columnName: string) {
    if (this.focus(rowKey, columnName)) {
      this.dispatch('startEditing', rowKey, columnName);
    }
  }

  /**
   * Sets focus on the cell at the specified index of row and column and starts to edit.
   * @param {number|string} rowIndex - The index of the row
   * @param {string} columnIndex - The index of the column
   * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.
   */
  public startEditingAt(rowIndex: number, columnIndex: number) {
    const { rowKey, columnName } = getCellAddressByIndex(this.store, rowIndex, columnIndex);

    this.startEditing(rowKey, columnName);
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
    return this.store.data.rawData.filter(({ _checked }) => _checked).map(({ rowKey }) => rowKey);
  }

  /**
   * Returns a list of the checked rows.
   * @returns {Array.<object>} - A list of the checked rows.
   */
  public getCheckedRows(): Row[] {
    // @TODO 반환되는 값 - 순수 객체 처리 변환
    return this.store.data.rawData.filter(({ _checked }) => _checked);
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
  public unSort() {
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
    this.dispatch('appendRow', row, options);

    if (options.focus) {
      const rowIdx =
        typeof options.at !== 'undefined' ? options.at : this.store.data.rawData.length - 1;
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
    this.dispatch('removeRow', rowKey, options);
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
}
