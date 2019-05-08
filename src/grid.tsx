import { OptGrid, OptPreset, OptI18nData } from './types';
import { createStore } from './store/create';
import { Root } from './view/root';
import { h, render } from 'preact';
import { createDispatcher, Dispatch } from './dispatch/create';
import { Store } from './store/types';
import themeManager, { ThemeOptionPresetNames } from './theme/manager';
import i18n from './i18n';

/* eslint-disable */
if ((module as any).hot) {
  require('preact/devtools');
}
/* eslint-enable */

export default class Grid {
  private store: Store;

  private dispatch: Dispatch;

  public constructor(options: OptGrid) {
    const { el } = options;
    const store = createStore(options);
    const dispatch = createDispatcher(store);

    this.store = store;
    this.dispatch = dispatch;

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

  public static setLanguage(localeCode: string, data?: OptI18nData) {
    i18n.setLanguage(localeCode, data);
  }

  public setWidth(width: number) {
    this.dispatch('setWidth', width, false);
  }

  public setHeight(height: number) {
    this.dispatch('setHeight', height);
  }

  public setBodyHeight(bodyHeight: number) {
    this.dispatch('setBodyHeight', bodyHeight);
  }

  public setFrozenColumnCount(count: number) {
    this.dispatch('setFrozenColumnCount', count);
  }

  public hideColumn(columnName: string) {
    this.dispatch('hideColumn', columnName);
  }

  public showColumn(columnName: string) {
    this.dispatch('showColumn', columnName);
  }

  /**
   * Returns the value of the cell identified by the rowKey and columnName.
   * @param {number} rowKey - The unique key of the target row.
   * @param {string} columnName - The name of the column
   * @param {boolean} [isOriginal] - It set to true, the original value will be return.
   * @returns {number|string} - The value of the cell
   */
  public getValue(rowKey: number | string | null, columnName: string | null, isOriginal?: boolean) {
    const {
      data: { viewData }
    } = this.store;
    let rowIndex = -1;

    // @TODO: isOriginal 처리 original 개념 추가되면 필요(getOriginal)
    if (rowKey) {
      rowIndex = viewData.findIndex((data) => data.rowKey === rowKey);
    }

    return rowIndex !== -1 && columnName && viewData[rowIndex][columnName];
  }

  /**
   * Returns data of currently focused cell
   * @returns {number} rowKey - The unique key of the row
   * @returns {string} columnName - The name of the column
   * @returns {string} value - The value of the cell
   */
  public getFocusedCell() {
    const {
      focus: { columnName, rowKey }
    } = this.store;

    return {
      rowKey,
      columnName,
      value: this.getValue(rowKey, columnName)
    };
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
  public focus(rowKey: number | string, columnName: string, isScrollable?: boolean) {
    this.blur();
    // @TODO: focus change event 발생

    this.dispatch('setFocusInfo', rowKey, columnName, true);
    this.dispatch('setScrollPosition');

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
    let result = false;

    const { rowKey } = this.store.data.viewData[rowIndex];
    const { name } = this.store.column.visibleColumns[columnIndex];

    if (typeof rowKey !== 'undefined' && name) {
      result = this.focus(rowKey, name, isScrollable);
    }

    return result;
  }
}
