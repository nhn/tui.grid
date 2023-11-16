import { h, render } from 'preact';
import TuiGrid from '@t/index';
import {
  Dictionary,
  GridEventListener,
  GridEventName,
  LifeCycleEventName,
  OptAppendRow,
  OptAppendTreeRow,
  OptColumn,
  OptFilter,
  OptGrid,
  OptHeader,
  OptI18nData,
  OptMoveRow,
  OptPrependRow,
  OptPreset,
  OptRemoveRow,
  OptRow,
  ResetOptions,
} from '@t/options';
import { Store } from '@t/store';
import { CellValue, InvalidRow, Row, RowKey } from '@t/store/data';
import { ColumnInfo } from '@t/store/column';
import { Range } from '@t/store/selection';
import { FilterOptionType, FilterState } from '@t/store/filterLayerState';
import { SummaryColumnContentMapOnlyFn } from '@t/store/summary';
import {
  DataProvider,
  ModificationTypeCode,
  ModifiedDataManager,
  ModifiedRowsOptions,
  Params,
  RequestOptions,
  RequestType,
} from '@t/dataSource';
import { ExportFormat, OptExport } from '@t/store/export';
import { createStore } from './store/create';
import { Root } from './view/root';
import { createDispatcher, Dispatch } from './dispatch/create';
import themeManager, { ThemeOptionPresetNames } from './theme/manager';
import { register, registerDataSources } from './instance';
import i18n from './i18n';
import { getInvalidRows } from './query/validation';
import { cls, dataAttr } from './helper/dom';
import {
  deepCopy,
  find,
  findPropIndex,
  hasOwnProp,
  includes,
  isEmpty,
  isNil,
  isUndefined,
  mapProp,
  pick,
} from './helper/common';
import { getOriginObject, Observable } from './helper/observable';
import { createEventBus, EventBus } from './event/eventBus';
import {
  findIndexByRowKey,
  findRowByRowKey,
  getCellAddressByIndex,
  getCheckedRowInfoList,
  getConditionalRows,
  getFormattedValue,
  getOmittedInternalProp,
  getRemoveRowInfoList,
  getRowHeight,
} from './query/data';
import { isRowHeader } from './helper/column';
import { createProvider } from './dataSource/serverSideDataProvider';
import { createManager } from './dataSource/manager/modifiedDataManager';
import { getConfirmMessage } from './i18n/message';
import { createPaginationManager, PaginationManager } from './pagination/paginationManager';
import {
  getAncestorRows,
  getChildRows,
  getDepth,
  getDescendantRows,
  getParentRow,
  isTreeColumnName,
} from './query/tree';
import { getRowSpanByRowKey } from './query/rowSpan';
import { sendHostname } from './helper/googleAnalytics';
import { composeConditionFn, getFilterConditionFn } from './helper/filter';
import { getFilterState } from './query/filter';
import { execCopy } from './dispatch/clipboard';
import { clearTreeRowKeyMap } from './store/helper/tree';

/* eslint-disable global-require */
if ((module as any).hot) {
  require('preact/devtools');
}

/**
 * Grid public API
 * @param {Object} options
 *      @param {HTMLElement} el - The target element to create grid.
 *      @param {Array|Object} [options.data] - Grid data for making rows. When using the data source, sets to object.
 *      @param {Object} [options.pageOptions={}] The object for the pagination options.
 *      @param {Object} [options.header] - Options object for header.
 *      @param {number} [options.header.height=40] - The height of the header area.
 *      @param {number} [options.header.align=center] - Horizontal alignment of the header content.
 *              Available values are 'left', 'center', 'right'.
 *      @param {number} [options.header.valign=middle] - Vertical alignment of the row header content.
 *              Available values are 'top', 'middle', 'bottom'.
 *      @param {Array} [options.header.complexColumns] - This options creates new parent headers of the multiple columns
 *          which includes the headers of specified columns, and sets up the hierarchy.
 *          @param {string} [options.header.complexColumns.header] - The header of the complex column to be shown on the header.
 *          @param {string} [options.header.complexColumns.name] - The name of column that makes tree column.
 *          @param {Array} [options.header.complexColumns.childNames] - The name of the child header(subheader).
 *          @param {function} [options.header.complexColumns.renderer] - Sets the custom renderer to customize the header content.
 *          @param {string} [options.header.complexColumns.headerAlign=center] - Horizontal alignment of the header content.
 *              Available values are 'left', 'center', 'right'.
 *          @param {string} [options.header.complexColumns.headerVAlign=middle] - Vertical alignment of the row header content.
 *              Available values are 'top', 'middle', 'bottom'.
 *          @param {boolean} [options.header.complexColumns.hideChildHeaders=false] - If set to true, the child columns header are hidden.
 *          @param {boolean} [options.header.complexColumns.resizable=false] - If set to true, resize-handles of each complex columns will be shown.
 *      @param {string|number} [options.width='auto'] - Options for grid width.
 *      @param {string|number} [options.rowHeight=40] - The height of each rows.
 *          The height of each rows expands to dom's height. If set to number, the height is fixed and the minimum is 9.
 *      @param {number} [options.minRowHeight=40] - The minimum height of each rows.
 *      @param {string|number} [options.bodyHeight] - The height of body area. The default value is 'auto',
 *          the height of body area expands to total height of rows. If set to 'fitToParent', the height of the grid
 *          will expand to fit the height of parent element. If set to number, the height is fixed.
 *      @param {number} [options.minBodyHeight=130] - The minimum height of body area. When this value
 *          is larger than the body's height, it set to the body's height.
 *      @param {Object} [options.columnOptions] - Option object for all columns
 *      @param {number} [options.columnOptions.minWidth=50] - Minimum width of each columns
 *      @param {boolean} [options.columnOptions.resizable=false] - If set to true, resize-handles of each columns
 *          will be shown.
 *      @param {number} [options.columnOptions.frozenCount=0] - The number of frozen columns.
 *          The columns indexed from 0 to this value will always be shown on the left side.
 *          {@link Grid#setFrozenColumnCount} can be used for setting this value dynamically.
 *      @param {number} [options.columnOptions.frozenBorderWidth=1] - The value of frozen border width.
 *          When the frozen columns are created by "frozenCount" option, the frozen border width set.
 *      @param {Object} [options.treeColumnOptions] - Option object for the tree column.
 *      @param {string} [options.treeColumnOptions.name] - The name of column that makes tree column.
 *      @param {boolean} [options.treeColumnOptions.useIcon=true] - If set to true, the folder or file icon is created on
 *          the left side of the tree cell data.
 *      @param {boolean} [options.treeColumnOptions.useCascadingCheckbox] - If set to true, a cascading relationship is
 *          created in the checkbox between parent and child rows.
 *      @param {boolean} [options.treeColumnOptions.indentWidth=22] - Base indent width to set for child nodes
 *      @param {Object} [options.copyOptions] - Option object for clipboard copying
 *      @param {boolean} [options.copyOptions.useFormattedValue] - Whether to use formatted values or original values
 *          as a string to be copied to the clipboard
 *      @param {boolean} [options.copyOptions.useListItemText] - Copy select or checkbox cell values to 'text'
 *          rather than 'value' of the listItem option.
 *      @param {string|function} [options.copyOptions.customValue] - Copy text with 'formatter' in cell.
 *      @param {boolean} [options.useClientSort=true] - If set to true, sorting will be executed by client itself
 *          without server.
 *      @param {string} [options.editingEvent='dblclick'] - If set to 'click', editable cell in the view-mode will be
 *          changed to edit-mode by a single click.
 *      @param {boolean} [options.scrollX=true] - Specifies whether to show horizontal scrollbar.
 *      @param {boolean} [options.scrollY=true] - Specifies whether to show vertical scrollbar.
 *      @param {boolean} [options.showDummyRows=false] - If set to true, empty area will be filled with dummy rows.
 *      @param {string} [options.keyColumnName] - The name of the column to be used to identify each rows.
 *          If not specified, unique value for each rows will be created internally.
 *      @param {boolean} [options.heightResizable=false] - If set to true, a handle for resizing height will be shown.
 *      @param {string} [options.selectionUnit='cell'] - The unit of selection on Grid. ('cell', 'row')
 *      @param {Array} [options.rowHeaders] - Options for making the row header. The row header content is number of
 *          each row or input element. The value of each item is enable to set string type. (ex: ['rowNum', 'checkbox'])
 *          @param {string} [options.rowHeaders.type] - The type of the row header. ('rowNum', 'checkbox')
 *          @param {string} [options.rowHeaders.header] - The header of the row header.
 *          @param {number} [options.rowHeaders.width] - The width of the row header column. The unit is pixel.
 *              If this value isn't set, the column's width sets to default value.
 *          @param {string} [options.rowHeaders.align=left] - Horizontal alignment of the row header content.
 *              Available values are 'left', 'center', 'right'.
 *          @param {string} [options.rowHeaders.valign=middle] - Vertical alignment of the row header content.
 *              Available values are 'top', 'middle', 'bottom'.
 *          @param {function} [options.rowHeaders.renderer] - Sets the custom renderer to customize the header content.
 *      @param {Array} options.columns - The configuration of the grid columns.
 *          @param {string} options.columns.name - The name of the column.
 *          @param {boolean} [options.columns.ellipsis=false] - If set to true, ellipsis will be used
 *              for overflowing content.(This option will be deprecated)
 *          @param {string} [options.columns.align=left] - Horizontal alignment of the column content.
 *              Available values are 'left', 'center', 'right'.
 *          @param {string} [options.columns.valign=middle] - Vertical alignment of the column content.
 *              Available values are 'top', 'middle', 'bottom'.
 *          @param {string} [options.columns.className] - The name of the class to be used for all cells of
 *              the column.
 *          @param {string} [options.columns.header] - The header of the column to be shown on the header.
 *          @param {number} [options.columns.width] - The width of the column. The unit is pixel. If this value
 *              isn't set, the column's width is automatically resized.
 *          @param {number} [options.columns.minWidth=50] - The minimum width of the column. The unit is pixel.
 *          @param {boolean} [options.columns.hidden] - If set to true, the column will not be shown.
 *          @param {boolean} [options.columns.resizable] - If set to false, the width of the column
 *              will not be changed.
 *          @param {Object} [options.columns.validation] - The options to be used for validation.
 *              Validation is executed whenever data is changed or the {@link Grid#validate} is called.
 *          @param {boolean} [options.columns.validation.required=false] - If set to true, the data of the column
 *              will be checked to be not empty.
 *          @param {number|string} [options.columns.validation.dataType='string'] - Specifies the type of the cell value.
 *              Available types are 'string' and 'number'.
 *          @param {number} [options.columns.validation.min] - If set to numeric value, the data of the column
 *              will be checked to be greater than 'min' value.
 *              Available types are 'string' and 'number'.
 *          @param {number} [options.columns.validation.max] - If set to numeric value, the data of the column
 *              will be checked to be less than 'max' value.
 *          @param {RegExp} [options.columns.validation.regExp] - If set to regular expression, the data of the column
 *              will be checked using the regular expression.
 *          @param {function} [options.columns.validation.validatorFn] - If set to function, the data of the column
 *              will be checked using the result of the custom validator.
 *          @param {boolean} [options.columns.validation.unique] - If set to true, check the uniqueness on the data of the column.
 *          @param {string} [options.columns.defaultValue] - The default value to be shown when the column
 *              doesn't have a value.
 *          @param {function|string} [options.columns.formatter] - The function that formats the value of the cell.
 *              The return value of the function will be shown as the value of the cell. If set to 'listItemText',
 *              the value will be shown the text.
 *          @param {boolean} [options.columns.escapeHTML=false] - If set to true, the value of the cell
 *              will be encoded as HTML entities.
 *          @param {boolean} [options.columns.ignored=false] - If set to true, the value of the column will be
 *               ignored when setting up the list of modified rows.
 *          @param {boolean} [options.columns.sortable=false] - If set to true, sort button will be shown on
 *              the right side of the column header, which executes the sort action when clicked.
 *          @param {string} [options.columns.sortingType='asc'] - If set to 'desc', will execute descending sort initially
 *              when sort button is clicked.
 *          @param {function} [options.columns.comparator] - The custom comparator that sorts the data of the column.
 *              The return value should be same as the result of general 'compareFunction'.
 *          @param {function} [options.columns.onBeforeChange] - The function that will be
 *              called before changing the value of the cell. If stop() method in event object is called,
 *              the changing will be canceled.
 *          @param {function} [options.columns.onAfterChange] - The function that will be
 *              called after changing the value of the cell.
 *          @param {Object} [options.columns.editor] - The object for configuring editing UI.
 *              @param {string|function} [options.columns.editor.type='text'] - The string value that specifies
 *                  the type of the editing UI. Available values are 'text', 'password', 'select', 'radio', 'checkbox'.
 *                  When using the custom editor, sets to the customized renderer constructor.
 *              @param {Object} [options.columns.editor.options] - Option object using editor
 *                  @param {Array} [options.columns.editor.options.listItems] - Specifies the option items for the
 *                       'select', 'radio', 'checkbox' type. The item of the array must contain properties named
 *                       'text' and 'value'. (e.g. [{text: 'option1', value: 1}, {...}])
 *              @param {Object} [options.columns.copyOptions] - Option object for clipboard copying.
 *                  This option is column specific, and overrides the global copyOptions.
 *              @param {boolean} [options.columns.copyOptions.useFormattedValue] - Whether to use
 *                  formatted values or original values as a string to be copied to the clipboard
 *              @param {boolean} [options.columns.copyOptions.useListItemText] - Whether to use
 *                  concatenated text or original values as a string to be copied to the clipboard
 *              @param {function} [options.columns.copyOptions.customValue] - Whether to use
 *                  customized value from "customValue" callback or original values as a string to be copied to the clipboard
 *          @param {Array} [options.columns.relations] - Specifies relation between this and other column.
 *              @param {Array} [options.columns.relations.targetNames] - Array of the names of target columns.
 *              @param {function} [options.columns.relations.disabled] - If returns true, target columns
 *                  will be disabled.
 *              @param {function} [options.columns.relations.editable] - If returns true, target columns
 *                  will be editable.
 *              @param {function} [options.columns.relations.listItems] - The function whose return
 *                  value specifies the option list for the 'select', 'radio', 'checkbox' type.
 *                  The options list of target columns will be replaced with the return value of this function.
 *          @param {string} [options.columns.whiteSpace='nowrap'] - If set to 'normal', the text line is broken
 *              by fitting to the column's width. If set to 'pre', spaces are preserved and the text is braken by
 *              new line characters. If set to 'pre-wrap', spaces are preserved, the text line is broken by
 *              fitting to the column's width and new line characters. If set to 'pre-line', spaces are merged,
 *              the text line is broken by fitting to the column's width and new line characters.(This option will be deprecated)
 *          @param {boolean} [options.columns.rowSpan=false] - If set to true, apply dynamic rowspan to column data.
 *              If it is not a top-level relational column of a column relationship or the grid has tree data, dynamic rowspan is not applied.
 *          @param {HTMLElement} [options.columns.customHeader] - If set HTML element, the element will render in header cell.
 *              If set without header property, the text content of element will be set to header property.
 *      @param {Object} [options.summary] - The object for configuring summary area.
 *          @param {number} [options.summary.height] - The height of the summary area.
 *          @param {string} [options.summary.position='bottom'] - The position of the summary area. ('bottom', 'top')
 *          @param {(string|Object)} [options.summary.defaultContent]
 *              The configuring of summary cell for every column.
 *              This options can be overriden for each column by columnContent options.
 *              If type is string, the value is used as HTML of summary cell for every columns
 *              without auto-calculation.
 *              @param {boolean} [options.summary.defaultContent.useAutoSummary=true]
 *                  If set to true, the summary value of every column is served as a parameter to the template
 *                  function whenever data is changed.
 *              @param {function} [options.summary.defaultContent.template] - Template function which returns the
 *                  content(HTML) of the column of the summary. This function takes an K-V object as a parameter
 *                  which contains a summary values keyed by 'sum', 'avg', 'min', 'max' and 'cnt'.
 *          @param {Object} [options.summary.columnContent]
 *              The configuring of summary cell for each column.
 *              Sub options below are keyed by each column name.
 *              If type of value of this object is string, the value is used as HTML of summary cell for
 *              the column without auto-calculation.
 *              @param {boolean} [options.summary.columnContent.useAutoSummary=true]
 *                  If set to true, the summary value of each column is served as a parameter to the template
 *                  function whenever data is changed.
 *              @param {function} [options.summary.columnContent.template] - Template function which returns the
 *                  content(HTML) of the column of the summary. This function takes an K-V object as a parameter
 *                  which contains a summary values keyed by 'sum', 'avg', 'min', 'max' and 'cnt'.
 *      @param {boolean} [options.usageStatistics=true] Send the hostname to google analytics.
 *          If you do not want to send the hostname, this option set to false.
 *      @param {function} [options.onGridMounted] - The function that will be called after rendering the grid.
 *      @param {function} [options.onGridUpdated] - The function that will be called after updating the all data of the grid and rendering the grid.
 *      @param {function} [options.onGridBeforeDestroy] - The function that will be called before destroying the grid.
 *      @param {boolean} [options.draggable] - Whether to enable to drag the row for changing the order of rows.
 *      @param {Array} [options.contextMenu] - Option array for the context menu.
 *      @param {string} [options.moveDirectionOnEnter] - Define moving focus direction on Enter. If not set, the focus does not move.
 */
export default class Grid implements TuiGrid {
  el: HTMLElement;

  private gridEl: Element;

  private store: Store;

  private dispatch: Dispatch;

  private eventBus: EventBus;

  private dataProvider: DataProvider;

  private dataManager: ModifiedDataManager;

  private paginationManager: PaginationManager;

  public usageStatistics: boolean;

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
    this.usageStatistics = usageStatistics;

    if (this.usageStatistics) {
      sendHostname();
    }

    registerDataSources(id, dataProvider, dataManager, paginationManager);

    if (!themeManager.isApplied()) {
      themeManager.apply('default');
    }
    if (Array.isArray(options.data)) {
      this.dataManager.setOriginData(options.data);
    }

    const lifeCycleEvent = pick(options, 'onGridMounted', 'onGridBeforeDestroy', 'onGridUpdated');
    Object.keys(lifeCycleEvent).forEach((eventName) => {
      this.eventBus.on(
        eventName as LifeCycleEventName,
        lifeCycleEvent[eventName as LifeCycleEventName]!
      );
    });

    this.gridEl = render(<Root store={store} dispatch={dispatch} rootElement={el} />, el);
    this.dispatch('setColumnWidthsByText');

    this.dispatch('updateRowSpan');
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
   *     @param {Object} [extOptions.row] - Styles for the table rows.
   *         @param {Object} [extOptions.row.even] - Styles for even row.
   *             @param {string} [extOptions.row.even.background] - background color of even row.
   *             @param {string} [extOptions.row.even.text] - text color of even row.
   *         @param {Object} [extOptions.row.odd] - Styles for odd row.
   *             @param {string} [extOptions.row.odd.background] - background color of cells in odd row.
   *             @param {string} [extOptions.row.odd.text] - text color of odd row.
   *         @param {Object} [extOptions.row.dummy] - Styles of dummy row.
   *             @param {string} [extOptions.row.dummy.background] - background color of dummy row.
   *         @param {Object} [extOptions.row.hover] - Styles of hovered row.
   *             @param {string} [extOptions.row.hover.background] - background color of hovered row.
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
   *         @param {Object} [extOptions.cell.currentRow] - Styles for cells in a current row.(deprecated since version 4.4.0)
   *             @param {string} [extOptions.cell.currentRow.background] - background color of cells in a current row.
   *             @param {string} [extOptions.cell.currentRow.text] - text color of cells in a current row.
   *         @param {Object} [extOptions.cell.evenRow] - Styles for cells in even rows.(deprecated since version 4.4.0)
   *             @param {string} [extOptions.cell.evenRow.background] - background color of cells in even rows.
   *             @param {string} [extOptions.cell.evenRow.text] - text color of cells in even rows.
   *         @param {Object} [extOptions.cell.oddRow] - Styles for cells in even rows.(deprecated since version 4.4.0)
   *             @param {string} [extOptions.cell.oddRow.background] - background color of cells in odd rows.
   *             @param {string} [extOptions.cell.oddRow.text] - text color of cells in odd rows.
   *         @param {Object} [extOptions.cell.dummy] - Styles for dummy cells.(deprecated since version 4.4.0)
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
   * Set the width of the dimension.
   * @param {number} width - The width of the dimension
   */
  public setWidth(width: number) {
    this.dispatch('setWidth', width, false);
  }

  /**
   * Set the height of the dimension.
   * @param {number} height - The height of the dimension
   */
  public setHeight(height: number) {
    this.dispatch('setHeight', height);
  }

  /**
   * Set the height of body-area.
   * @param {number} bodyHeight - The number of pixel
   */
  public setBodyHeight(bodyHeight: number) {
    this.dispatch('setBodyHeight', bodyHeight);
  }

  /**
   * Set options for header.
   * @param {Object} options - Options for header
   * @param {number} [options.height] -  The height value
   * @param {Array} [options.complexColumns] - The complex columns info
   */
  public setHeader({ height, complexColumns }: OptHeader) {
    if (height) {
      this.dispatch('setHeaderHeight', height);
    }

    if (complexColumns) {
      this.dispatch('setComplexColumnHeaders', complexColumns);
    }
  }

  /**
   * Set the count of frozen columns.
   * @param {number} count - The count of columns to be frozen
   */
  public setFrozenColumnCount(count: number) {
    this.dispatch('setFrozenColumnCount', count);
  }

  /**
   * Hide columns
   * @param {...string} arguments - Column names to hide
   */
  public hideColumn(columnName: string) {
    this.dispatch('hideColumn', columnName);
  }

  /**
   * Show columns
   * @param {...string} arguments - Column names to show
   */
  public showColumn(columnName: string) {
    this.dispatch('showColumn', columnName);
  }

  /**
   * Select cells or rows by range
   * @param {Object} range - Selection range
   *     @param {Array} [range.start] - Index info of start selection (ex: [rowIndex, columnIndex])
   *     @param {Array} [range.end] - Index info of end selection (ex: [rowIndex, columnIndex])
   */
  public setSelectionRange(range: { start: Range; end: Range }) {
    this.dispatch('setSelection', range);
  }

  /**
   * get Selection range
   * @returns {Object | null} range - Selection range
   *     @returns {Array} [range.start] - Index info of start selection (ex: [rowIndex, columnIndex])
   *     @returns {Array} [range.end] - Index info of end selection (ex: [rowIndex, columnIndex])
   */
  public getSelectionRange() {
    const { rangeWithRowHeader } = this.store.selection;

    if (rangeWithRowHeader) {
      const { column, row } = rangeWithRowHeader;

      return {
        start: [row[0], column[0]],
        end: [row[1], column[1]],
      };
    }

    return null;
  }

  /**
   * Return data of currently focused cell
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
   * Remove focus from the focused cell.
   */
  public blur() {
    this.dispatch('setFocusInfo', null, null, false);
  }

  /**
   * Focus to the cell identified by given rowKey and columnName.
   * @param {Number|String} rowKey - rowKey
   * @param {String} columnName - columnName
   * @param {Boolean} [setScroll=true] - if set to true, move scroll position to focused position
   * @returns {Boolean} true if focused cell is changed
   */
  public focus(rowKey: RowKey, columnName: string, setScroll = true) {
    const row = this.getRow(rowKey);

    if (!row || !getRowHeight(row, this.store.dimension.rowHeight)) {
      return false;
    }

    this.dispatch('setFocusInfo', rowKey, columnName, true);

    if (setScroll) {
      // Use setTimeout to wait until the DOM element is actually mounted or updated.
      // For example, when expands the tree row at bottom of the grid area with scroll,
      // grid needs to wait for mounting the expanded tree DOM element to detect the accurate scrolling position.
      setTimeout(() => {
        this.dispatch('setScrollToFocus');
      });
    }

    return true;
  }

  /**
   * Focus to the cell identified by given rowIndex and columnIndex.
   * @param {Number} rowIndex - rowIndex
   * @param {Number} columnIndex - columnIndex
   * @param {boolean} [setScroll=true] - if set to true, scroll to focused cell
   * @returns {Boolean} true if success
   */
  public focusAt(rowIndex: number, columnIndex: number, setScroll?: boolean) {
    const { rowKey, columnName } = getCellAddressByIndex(this.store, rowIndex, columnIndex);

    if (!isUndefined(rowKey) && columnName) {
      return this.focus(rowKey, columnName, setScroll);
    }
    return false;
  }

  /**
   * Make view ready to get keyboard input.
   */
  public activateFocus() {
    this.dispatch('setNavigating', true);
  }

  /**
   * Set focus on the cell at the specified index of row and column and starts to edit.
   * @param {number|string} rowKey - The unique key of the row
   * @param {string} columnName - The name of the column
   * @param {boolean} [setScroll=true] - If set to true, the view will scroll to the cell element.
   */
  public startEditing(rowKey: RowKey, columnName: string, setScroll?: boolean) {
    if (this.focus(rowKey, columnName, setScroll)) {
      if (this.store.focus.rowKey === rowKey && this.store.focus.columnName === columnName) {
        this.dispatch('startEditing', rowKey, columnName);
      }
    }
  }

  /**
   * Set focus on the cell at the specified index of row and column and starts to edit.
   * @param {number|string} rowIndex - The index of the row
   * @param {string} columnIndex - The index of the column
   * @param {boolean} [setScroll=true] - If set to true, the view will scroll to the cell element.
   */
  public startEditingAt(rowIndex: number, columnIndex: number, setScroll?: boolean) {
    const { rowKey, columnName } = getCellAddressByIndex(this.store, rowIndex, columnIndex);

    this.startEditing(rowKey, columnName, setScroll);
  }

  /**
   * Save editing value and finishes to edit.
   */
  public finishEditing(rowKey?: RowKey | boolean, columnName?: string, value?: string) {
    // @TODO: should change the function signature as removing all current paramaters.
    // The signature will be as below.
    // ex) finishEditing()
    this.dispatch('saveAndFinishEditing', value);
  }

  /**
   * Cancel the editing.
   */
  public cancelEditing() {
    const { editingAddress } = this.store.focus;
    if (editingAddress) {
      const { rowKey, columnName } = editingAddress;
      const value = this.getValue(rowKey, columnName) as string;
      this.dispatch('finishEditing', rowKey, columnName, value, { save: false });
    }
  }

  /**
   * Set the value of the cell identified by the specified rowKey and columnName.
   * @param {number|string} rowKey - The unique key of the row
   * @param {string} columnName - The name of the column
   * @param {number|string} value - The value to be set
   * @param {boolean} [checkCellState=false] - If set to true, only editable and not disabled cells will be affected.
   */
  public setValue(rowKey: RowKey, columnName: string, value: CellValue, checkCellState?: boolean) {
    this.dispatch('setValue', rowKey, columnName, value, checkCellState);
  }

  /**
   * Return the value of the cell identified by the rowKey and columnName.
   * @param {number|string} rowKey - The unique key of the target row.
   * @param {string} columnName - The name of the column
   * @returns {number|string|boolean|null} - The value of the cell
   */
  public getValue(rowKey: RowKey, columnName: string): CellValue | null {
    const { data, column, id } = this.store;
    const targetRow = findRowByRowKey(data, column, id, rowKey, false);

    if (targetRow) {
      return targetRow[columnName] ?? null;
    }

    return null;
  }

  /**
   * Set the all values in the specified column.
   * @param {string} columnName - The name of the column
   * @param {number|string} columnValue - The value to be set
   * @param {boolean} [checkCellState=false] - If set to true, only editable and not disabled cells will be affected.
   */
  public setColumnValues(columnName: string, columnValue: CellValue, checkCellState?: boolean) {
    this.dispatch('setColumnValues', columnName, columnValue, checkCellState);
  }

  /**
   * Return the HTMLElement of the cell identified by the rowKey and columnName.
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
   * Set the HTML string of given column summary.
   * The type of content is the same as the options.summary.columnContent of the constructor.
   * @param {string} columnName - column name
   * @param {string|object} columnContent - HTML string or options object.
   */
  public setSummaryColumnContent(
    columnName: string,
    columnContent: string | SummaryColumnContentMapOnlyFn
  ) {
    this.dispatch('setSummaryColumnContent', columnName, columnContent);
  }

  /**
   * Return the values of given column summary.
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
   *     cnt: 5,
   *     filtered: {
   *       sum: 1000,
   *       avg: 200,
   *       max: 300,
   *       min: 50,
   *       cnt: 5
   *     }
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
   * Return a specific column model.
   * @param {string} columnName - The name of the column
   * @returns {Object|null} - A column model.
   */
  public getColumn(columnName: string) {
    const column = find(({ name }) => name === columnName, this.store.column.allColumns);

    return column ? getOriginObject(column as Observable<ColumnInfo>) : null;
  }

  /**
   * Return a list of the column model.
   * @returns {Array} - A list of the column model.
   */
  public getColumns() {
    return this.store.column.allColumns
      .filter(({ name }) => !isRowHeader(name))
      .map((column) => getOriginObject(column as Observable<ColumnInfo>));
  }

  /**
   * Set the list of column model.
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
   * Reset the width of each column by using initial setting of column models.
   * @param {Array.<number>} [widths] - An array of column widths to set. If there's no parameter, it reset auto-resizing column width.
   */
  public resetColumnWidths(widths?: number[]) {
    if (widths) {
      this.dispatch('resetColumnWidths', widths);
    } else {
      this.dispatch('setAutoResizingColumnWidths');
    }
  }

  /**
   * Return a list of all values in the specified column.
   * @param {string} columnName - The name of the column
   * @returns {(Array|string)} - A List of all values in the specified column. (or JSON string of the list)
   */
  public getColumnValues(columnName: string) {
    return mapProp(columnName, this.store.data.rawData);
  }

  /**
   * Return the index of the column indentified by the column name.
   * @param {string} columnName - The unique key of the column
   * @returns {number} - The index of the column
   */
  public getIndexOfColumn(columnName: string) {
    return findPropIndex(
      'name',
      columnName,
      this.store.column.allColumns.filter(({ name }) => !isRowHeader(name))
    );
  }

  /**
   * Check the row identified by the specified rowKey.
   * @param {number|string} rowKey - The unique key of the row
   */
  public check(rowKey: RowKey) {
    this.dispatch('check', rowKey);
  }

  /**
   * Uncheck the row identified by the specified rowKey.
   * @param {number|string} rowKey - The unique key of the row
   */
  public uncheck(rowKey: RowKey) {
    this.dispatch('uncheck', rowKey);
  }

  /**
   * Check the rows between the specified rowKeys. If endRowKey is not passed, perform 'check' on the row of startRowKey.
   * @param {number|string} startRowKey - The unique key of the row
   * @param {number|string} [endRowKey] - The unique key of the row
   */
  public checkBetween(startRowKey: RowKey, endRowKey?: RowKey) {
    this.dispatch('setCheckboxBetween', true, startRowKey, endRowKey);
  }

  /**
   * Uncheck the rows between the specified rowKeys. If endRowKey is not passed, perform 'uncheck' on the row of startRowKey.
   * @param {number|string} startRowKey - The unique key of the row
   * @param {number|string} [endRowKey] - The unique key of the row
   */
  public uncheckBetween(startRowKey: RowKey, endRowKey?: RowKey) {
    this.dispatch('setCheckboxBetween', false, startRowKey, endRowKey);
  }

  /**
   * Check all rows.
   * @param {boolean} [allPage] - check all rows when using pagination. The default value is 'true'.
   */
  public checkAll(allPage?: boolean) {
    this.dispatch('checkAll', allPage);
  }

  /**
   * Uncheck all rows.
   * @param {boolean} [allPage] - Uncheck all rows when using pagination. The default value is 'true'.
   */
  public uncheckAll(allPage?: boolean) {
    this.dispatch('uncheckAll', allPage);
  }

  /**
   * Return a list of the rowKey of checked rows.
   * @returns {Array.<string|number>} - A list of the rowKey.
   */
  public getCheckedRowKeys(): RowKey[] {
    const { rows } = getCheckedRowInfoList(this.store);
    return rows.map(({ rowKey }) => rowKey);
  }

  /**
   * Return a list of the checked rows.
   * @returns {Array.<object>} - A list of the checked rows.
   */
  public getCheckedRows(): Row[] {
    const { rows } = getCheckedRowInfoList(this.store);
    return rows.map((row) => getOriginObject(row as Observable<Row>));
  }

  /**
   * Find rows by conditions
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
   * Sort all rows by the specified column.
   * @param {string} columnName - The name of the column to be used to compare the rows
   * @param {boolean} [ascending] - Whether the sort order is ascending.
   *        If not specified, use the negative value of the current order.
   * @param {boolean} [multiple] - Whether using multiple sort
   */
  public sort(columnName: string, ascending: boolean, multiple?: boolean) {
    if (this.store.data.sortState.useClient) {
      this.dispatch('sort', columnName, ascending, multiple, false);
    } else {
      // @TODO: apply multi sort to dataSource
      this.dataProvider.sort(columnName, ascending, false);
    }
  }

  /**
   * If the parameter exists, unsort only column with columnName. If not exist, unsort all rows
   * @param {string} [columnName] - The name of the column to be used to compare the rows
   */
  public unsort(columnName?: string) {
    if (this.store.data.sortState.useClient) {
      this.dispatch('unsort', columnName);
    } else {
      this.dataProvider.unsort(columnName);
    }
  }

  /**
   * Get state of the sorted column in rows
   * @returns {{columns: [{columnName: string, ascending: boolean}], useClient: boolean}} Sorted column's state
   */
  public getSortState() {
    return deepCopy(this.store.data.sortState);
  }

  /**
   * Copy to clipboard
   */
  public copyToClipboard() {
    execCopy(this.store);
  }

  /**
   * Validate all data and returns the result.
   * Return value is an array which contains only rows which have invalid cell data.
   * @param {Array<number|string>} [rowKeys] - Array of rowKeys to validate.
   *        Validate only for the given rows, but validations that should be performed on all rows, such as unique, may not work correctly.
   * @returns {Array.<Object>} An array of error object
   * @example
   * // return value example
   * [
   *     {
   *         rowKey: 1,
   *         errors: [
   *             {
   *                 columnName: 'c1',
   *                 errorCode: ['REQUIRED'],
   *                 errorInfo: [{ code: 'REQUIRED' }]
   *             },
   *             {
   *                 columnName: 'c2',
   *                 errorCode: ['VALIDATOR_FN'],
   *                 errorInfo: [{ code: 'VALIDATOR_FN', customCode: 'CUSTOM_CODE' }]
   *             }
   *         ]
   *     },
   *     {
   *         rowKey: 3,
   *         errors: [
   *             {
   *                 columnName: 'c2',
   *                 errorCode: ['MIN'],
   *                 errorInfo: [{ code: 'MIN', min: 1000 }]
   *             }
   *         ]
   *     }
   * ]
   */
  public validate(rowKeys?: RowKey[]): InvalidRow[] {
    return getInvalidRows(this.store, rowKeys);
  }

  /**
   * Enable all rows.
   */
  public enable() {
    this.dispatch('setDisabled', false);
  }

  /**
   * Disable all rows.
   */
  public disable() {
    this.dispatch('setDisabled', true);
  }

  /**
   * Disable the row identified by the rowkey.
   * @param {number|string} rowKey - The unique key of the target row
   * @param {boolean} [withCheckbox] - change including checkbox. The default value is 'true'
   */
  public disableRow(rowKey: RowKey, withCheckbox = true) {
    this.dispatch('setRowDisabled', true, rowKey, withCheckbox);
  }

  /**
   * Enable the row identified by the rowKey.
   * @param {number|string} rowKey - The unique key of the target row
   * @param {boolean} [withCheckbox] - change including checkbox. The default value is 'true'
   */
  public enableRow(rowKey: RowKey, withCheckbox = true) {
    this.dispatch('setRowDisabled', false, rowKey, withCheckbox);
  }

  /**
   * Disable the row identified by the specified rowKey to not be able to check.
   * @param {number|string} rowKey - The unique key of the row.
   */
  public disableRowCheck(rowKey: RowKey) {
    this.dispatch('setRowCheckDisabled', true, rowKey);
  }

  /**
   * Enable the row identified by the rowKey to be able to check.
   * @param {number|string} rowKey - The unique key of the row
   */
  public enableRowCheck(rowKey: RowKey) {
    this.dispatch('setRowCheckDisabled', false, rowKey);
  }

  /**
   * Disable the column identified by the column name.
   * @param {string} columnName - column name
   */
  public disableColumn(columnName: string) {
    this.dispatch('setColumnDisabled', true, columnName);
  }

  /**
   * Enable the column identified by the column name.
   * @param {string} columnName - column name
   */
  public enableColumn(columnName: string) {
    this.dispatch('setColumnDisabled', false, columnName);
  }

  /**
   * Disable the cell identified by the row key and column name.
   * @param {number|string} rowKey - The unique key of the row.
   * @param {string} columnName - column name
   */
  public disableCell(rowKey: RowKey, columnName: string) {
    this.dispatch('setCellDisabled', true, rowKey, columnName);
  }

  /**
   * Enable the cell identified by the row key and column name.
   * @param {number|string} rowKey - The unique key of the row.
   * @param {string} columnName - column name
   */
  public enableCell(rowKey: RowKey, columnName: string) {
    this.dispatch('setCellDisabled', false, rowKey, columnName);
  }

  /**
   * Insert the new row with specified data to the end of table.
   * @param {Object} [row] - The data for the new row
   * @param {Object} [options] - Options
   * @param {number} [options.at] - The index at which new row will be inserted
   * @param {boolean} [options.extendPrevRowSpan] - If set to true and the previous row at target index
   *        has a rowspan data, the new row will extend the existing rowspan data.
   * @param {boolean} [options.focus] - If set to true, move focus to the new row after appending
   * @param {number|string} [options.parentRowKey] - Deprecated: Tree row key of the parent which appends given rows
   */
  public appendRow(row: OptRow = {}, options: OptAppendRow = {}) {
    const { treeColumnName } = this.store.column;

    if (treeColumnName) {
      const { at: offset, focus, parentRowKey } = options;
      this.dispatch('appendTreeRow', row, { offset, focus, parentRowKey });
    } else {
      this.dispatch('appendRow', row, options);
    }

    if (options.focus) {
      const rowIdx = isUndefined(options.at) ? this.getRowCount() - 1 : options.at;
      this.focusAt(rowIdx, 0);
    }
  }

  /**
   * Insert the new row with specified data to the beginning of table.
   * @param {Object} [row] - The data for the new row
   * @param {Object} [options] - Options
   * @param {boolean} [options.focus] - If set to true, move focus to the new row after appending
   */
  public prependRow(row: OptRow, options: OptPrependRow = {}) {
    this.appendRow(row, { ...options, at: 0 });
  }

  /**
   * Remove the row identified by the specified rowKey.
   * @param {number|string} rowKey - The unique key of the row
   * @param {boolean} [options.removeOriginalData] - If set to true, the original data will be removed.
   * @param {boolean} [options.keepRowSpanData] - If set to true, the value of the merged cells will not be
   *     removed although the target is first cell of them.
   */
  public removeRow(rowKey: RowKey, options: OptRemoveRow = {}) {
    const { treeColumnName } = this.store.column;

    if (treeColumnName) {
      this.removeTreeRow(rowKey);
    } else {
      this.dispatch('removeRow', rowKey, options);
    }
  }

  /**
   * Remove the rows identified by the specified rowKeys.
   * @param {Array<RowKey>} rowKeys - The array of unique keys of the row
   */
  public removeRows(rowKeys: RowKey[]) {
    const removeRowInfoList = getRemoveRowInfoList(this.store, rowKeys);
    const removeRowsCount = removeRowInfoList.rows.length;

    if (removeRowsCount > 0) {
      this.dispatch('removeRows', removeRowInfoList);
    }
  }

  /**
   * Return the object that contains all values in the specified row.
   * @param {number|string} rowKey - The unique key of the target row
   * @returns {Object} - The object that contains all values in the row.
   */
  public getRow(rowKey: RowKey) {
    return this.getRowAt(this.getIndexOfRow(rowKey));
  }

  /**
   * Return the object that contains all values in the row at specified index.
   * @param {number} rowIdx - The index of the row
   * @returns {Object} - The object that contains all values in the row.
   */
  public getRowAt(rowIdx: number) {
    const row = this.store.data.rawData[rowIdx];
    return row ? getOriginObject(row as Observable<Row>) : null;
  }

  /**
   * Return the index of the row indentified by the rowKey.
   * @param {number|string} rowKey - The unique key of the row
   * @returns {number} - The index of the row
   */
  public getIndexOfRow(rowKey: RowKey) {
    const { data, column, id } = this.store;
    return findIndexByRowKey(data, column, id, rowKey, false);
  }

  /**
   * Return a list of all rows.
   * @returns {Array} - A list of all rows
   */
  public getData() {
    return this.store.data.rawData.map((row) => getOmittedInternalProp(row));
  }

  /**
   * Return a list of filtered rows.
   * @returns {Array} - A list of filtered rows
   */
  public getFilteredData() {
    return this.store.data.filteredRawData.map((row) => getOmittedInternalProp(row));
  }

  /**
   * Return the total number of the rows.
   * @returns {number} - The total number of the rows
   */
  public getRowCount() {
    return this.store.data.rawData.length;
  }

  /**
   * Remove all rows.
   */
  public clear() {
    this.dispatch('clearData');
  }

  /**
   * Replace all rows with the specified list. This will not change the original data.
   * @param {Array} data - A list of new rows
   * @param {Object} [options] - Options
   *     @param {Object} [options.sortState] - If set the sortState, the sort state will be applied when the new rows are set.
   *       It is recommended that you do not use it unless you are getting the sorted data by communicating with the server without DataSource.
   *         @param {string} [options.sortState.columnName] - Target column name.
   *         @param {boolean} [options.sortState.ascending] - The ascending state of specific column which will apply to the grid.
   *         @param {boolean} [options.sortState.multiple] - Whether to use multiple sorting.
   *     @param {Object} [options.filterState] - If set the filterState, the filter state will be applied when the new rows are set.
   *       It is recommended that you do not use it unless you are getting the filtered data by communicating with the server without DataSource.
   *         @param {string} [options.filterState.columnName] - Target column name.
   *         @param {Object} [options.filterState.columnFilterState] - The column filter state of column which will apply to the grid.
   *             @param {string} [options.filterState.columnFilterState.code] - Code for column filter(ex. 'eq', 'gt').
   *             @param {string} [options.filterState.columnFilterState.value] - Input value for column filter.
   *     @param {Object} [options.pageState] - If set the pageState, the pagination state will be applied when the new rows are set.
   *       It is recommended that you do not use it unless you are getting the paginated data by communicating with the server without DataSource.
   *         @param {number} [options.pageState.page] - Target page number.
   *         @param {number} [options.pageState.totalCount] - The total pagination count.
   *         @param {number} [options.pageState.perPage] - Number of rows per page.
   */
  public resetData(data: OptRow[], options: ResetOptions = {}) {
    this.dispatch('resetData', data, options);
  }

  /**
   * Add the specified css class to cell element identified by the rowKey and className
   * @param {number|string} rowKey - The unique key of the row
   * @param {string} columnName - The name of the column
   * @param {string} className - The css class name to add
   */
  public addCellClassName(rowKey: RowKey, columnName: string, className: string) {
    this.dispatch('addCellClassName', rowKey, columnName, className);
  }

  /**
   * Add the specified css class to all cell elements in the row identified by the rowKey
   * @param {number|string} rowKey - The unique key of the row
   * @param {string} className - The css class name to add
   */
  public addRowClassName(rowKey: RowKey, className: string) {
    this.dispatch('addRowClassName', rowKey, className);
  }

  /**
   * Remove the specified css class from the cell element indentified by the rowKey and columnName.
   * @param {number|string} rowKey - The unique key of the row
   * @param {string} columnName - The name of the column
   * @param {string} className - The css class name to be removed
   */
  public removeCellClassName(rowKey: RowKey, columnName: string, className: string) {
    this.dispatch('removeCellClassName', rowKey, columnName, className);
  }

  /**
   * Remove the specified css class from all cell elements in the row identified by the rowKey.
   * @param {number|string} rowKey - The unique key of the row
   * @param {string} className - The css class name to be removed
   */
  public removeRowClassName(rowKey: RowKey, className: string) {
    this.dispatch('removeRowClassName', rowKey, className);
  }

  /**
   * Return a list of class names of specific cell.
   * @param {number|string} rowKey - The unique key of the row
   * @param {string} columnName - The name of the column
   * @returns {Array} - A list of class names
   */
  public getCellClassName(rowKey: RowKey, columnName: string) {
    const targetRow = this.getRow(rowKey);
    const isExistColumnName = this.store.column.allColumns.some(({ name }) => name === columnName);

    if (!isNil(targetRow) && isExistColumnName) {
      const { row, column } = targetRow._attributes.className;

      return [...row, ...(column[columnName] ?? [])];
    }

    return [];
  }

  /**
   * Return a list of class names of specific row.
   * @param {number|string} rowKey - The unique key of the row
   * @returns {Array} - A list of class names
   */
  public getRowClassName(rowKey: RowKey) {
    const targetRow = this.getRow(rowKey);

    return isNil(targetRow) ? [] : targetRow._attributes.className.row;
  }

  /**
   * Add custom event to grid.
   * @param {string} eventName - custom event name
   * @param {function} fn - event handler
   */
  public on(eventName: GridEventName, fn: GridEventListener) {
    this.eventBus.on(eventName, fn);
  }

  /**
   * Remove custom event to grid.
   * @param {string} eventName - custom event name
   * @param {function} fn - event handler
   */
  public off(eventName: GridEventName, fn?: GridEventListener) {
    this.eventBus.off(eventName, fn);
  }

  /**
   * Return an instance of tui.Pagination.
   * @deprecated
   * @returns {tui.Pagination}
   */
  public getPagination() {
    return this.paginationManager.getPagination();
  }

  /**
   * Set number of rows per page and reload current page
   * @param {number} perPage - Number of rows per page
   * @param {Params} data - Data(parameters) to send to the server
   */
  public setPerPage(perPage: number, data?: Params) {
    const pagination = this.getPagination();
    if (pagination) {
      const { pageOptions } = this.store.data;
      if (pageOptions.useClient) {
        this.dispatch('updatePageOptions', { perPage, page: 1 });
        this.dispatch('updateHeights');
      } else {
        this.readData(1, { ...data, perPage });
      }
    }
  }

  /**
   * Return true if there are at least one row modified.
   * @returns {boolean} - True if there are at least one row modified.
   */
  public isModified() {
    return this.dataManager.isModified();
  }

  /**
   * Return the object that contains the lists of changed data compared to the original data.
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
   * Request 'readData' to the server. The last requested data will be extended with new data.
   * @param {Number} page - Page number
   * @param {Object} data - Data(parameters) to send to the server
   * @param {Boolean} resetData - If set to true, last requested data will be ignored.
   */
  public readData(page: number, data?: Params, resetData?: boolean) {
    if (data && data.sortColumn) {
      this.dataProvider.sort(data.sortColumn, data.sortAscending!, false);
    } else {
      this.dataProvider.readData(page, data, resetData);
    }
  }

  /**
   * Send request to server to sync data
   * @param {String} requestType - 'createData|updateData|deleteData|modifyData'
   * @param {object} options - Options
   *      @param {String} [options.url] - URL to send the request
   *      @param {String} [options.method] - method to send the request
   *      @param {boolean} [options.checkedOnly=false] - Whether the request param only contains checked rows
   *      @param {boolean} [options.modifiedOnly=true] - Whether the request param only contains modified rows
   *      @param {boolean} [options.showConfirm=true] - Whether to show confirm dialog before sending request
   *      @param {boolean} [options.withCredentials=false] - Use withCredentials flag of XMLHttpRequest for ajax requests if true
   */
  public request(requestType: RequestType, options: RequestOptions = {}) {
    this.dataProvider.request(requestType, options);
  }

  /**
   * Request 'readData' with last requested data.
   */
  public reloadData() {
    this.dataProvider.reloadData();
  }

  /**
   * Restore the data to the original data.
   * (Original data is set by {@link Grid#resetData|resetData}
   */
  public restore() {
    this.resetData(this.dataManager.getOriginData());
  }

  /**
   * Insert the new tree row with specified data.
   * @param {Object} [row] - The tree data for the new row
   * @param {Object} [options] - Options
   * @param {number|string} [options.parentRowKey] - Tree row key of the parent which appends given rows
   * @param {number} [options.offset] - The offset value to insert new tree row
   * @param {boolean} [options.focus] - If set to true, move focus to the new tree row after appending
   */
  public appendTreeRow(row: OptRow = {}, options: OptAppendTreeRow = {}) {
    const { treeColumnName } = this.store.column;
    const { parentRowKey } = options;

    if (!treeColumnName || isUndefined(parentRowKey)) {
      return;
    }

    this.dispatch('appendTreeRow', row, options);

    if (options.focus) {
      const { offset } = options;
      const childRows = getChildRows(this.store, parentRowKey!);

      if (childRows.length) {
        const { rowKey } = isUndefined(offset)
          ? childRows[childRows.length - 1]
          : childRows[offset];
        const rowIdx = this.getIndexOfRow(rowKey);

        this.focusAt(rowIdx, 0);
      }
    }
  }

  /**
   * Remove the tree row identified by the specified rowKey.
   * @param {number|string} rowKey - The unique key of the row
   */
  public removeTreeRow(rowKey: RowKey) {
    const { treeColumnName } = this.store.column;

    if (treeColumnName) {
      this.dispatch('removeTreeRow', rowKey);
    }
  }

  /**
   * Expand tree row.
   * @param {number|string} rowKey - The unique key of the row
   * @param {boolean} recursive - true for recursively expand all descendant
   */
  public expand(rowKey: RowKey, recursive?: boolean) {
    this.dispatch('expandByRowKey', rowKey, recursive);
  }

  /**
   * Expand all tree row.
   */
  public expandAll() {
    this.dispatch('expandAll');
  }

  /**
   * Expand tree row.
   * @param {number|string} rowKey - The unique key of the row
   * @param {boolean} recursive - true for recursively expand all descendant
   */
  public collapse(rowKey: RowKey, recursive?: boolean) {
    this.dispatch('collapseByRowKey', rowKey, recursive);
  }

  /**
   * Collapse all tree row.
   */
  public collapseAll() {
    this.dispatch('collapseAll');
  }

  /**
   * Get the parent of the row which has the given row key.
   * @param {number|string} rowKey - The unique key of the row
   * @returns {Object} - the parent row
   */
  public getParentRow(rowKey: RowKey) {
    return getParentRow(this.store, rowKey, true);
  }

  /**
   * Get the children of the row which has the given row key.
   * @param {number|string} rowKey - The unique key of the row
   * @returns {Array.<Object>} - the children rows
   */
  public getChildRows(rowKey: RowKey) {
    return getChildRows(this.store, rowKey, true);
  }

  /**
   * Get the ancestors of the row which has the given row key.
   * @param {number|string} rowKey - The unique key of the row
   * @returns {Array.<TreeRow>} - the ancestor rows
   */
  public getAncestorRows(rowKey: RowKey) {
    return getAncestorRows(this.store, rowKey);
  }

  /**
   * Get the descendants of the row which has the given row key.
   * @param {number|string} rowKey - The unique key of the row
   * @returns {Array.<Object>} - the descendant rows
   */
  public getDescendantRows(rowKey: RowKey) {
    return getDescendantRows(this.store, rowKey);
  }

  /**
   * Get the depth of the row which has the given row key.
   * @param {number|string} rowKey - The unique key of the row
   * @returns {number} - the depth
   */
  public getDepth(rowKey: RowKey) {
    const { data, column, id } = this.store;
    const { rawData } = data;
    const row = findRowByRowKey(data, column, id, rowKey);

    return row ? getDepth(rawData, row) : 0;
  }

  /**
   * Return the rowspan data of the cell identified by the rowKey and columnName.
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
    this.dataManager.setOriginData(this.store.data.rawData);
  }

  /** Remove all checked rows.
   * @param {boolean} [showConfirm] - If set to true, confirm message will be shown before remove.
   * @returns {boolean} - True if there's at least one row removed.
   */
  public removeCheckedRows(showConfirm?: boolean) {
    const checkedRowInfoList = getCheckedRowInfoList(this.store);
    const deletedCount = checkedRowInfoList.rows.length;
    const confirmMessage = getConfirmMessage('DELETE', deletedCount);

    if (deletedCount > 0 && (!showConfirm || confirm(confirmMessage))) {
      this.dispatch('removeRows', checkedRowInfoList);

      return true;
    }
    return false;
  }

  /**
   * Refresh the layout view. Use this method when the view was rendered while hidden.
   */
  public refreshLayout() {
    const containerEl = this.el.querySelector(`.${cls('container')}`) as HTMLElement;
    const { parentElement } = this.el;

    this.dispatch('refreshLayout', containerEl, parentElement!);
  }

  /**
   * Destroy the instance.
   */
  public destroy() {
    render('', this.el, this.gridEl);
    clearTreeRowKeyMap(this.store.id);
    for (const key in this) {
      if (hasOwnProp(this, key)) {
        delete this[key];
      }
    }
  }

  /**
   * Set the option of column filter.
   * @param {string} columnName - columnName
   * @param {string | FilterOpt} filterOpt - filter type
   */
  public setFilter(columnName: string, filterOpt: OptFilter | FilterOptionType) {
    this.dispatch('setFilter', columnName, filterOpt);
  }

  /**
   * Get filter state.
   * @returns {Array.<FilterState>} - filter state
   */
  public getFilterState() {
    // @TODO: unify the structure to ResetOptions.filterState type definition
    return getFilterState(this.store);
  }

  /**
   * Filter the data.
   * @param {string} columnName - column name to filter
   * @param {Array.<FilterState>} state - filter state
   * @example
   * grid.filter('name', [{code: 'eq', value: 3}, {code: 'eq', value: 4}]);
   */
  public filter(columnName: string, state: FilterState[]) {
    const { filter } = this.store.column.allColumnMap[columnName];
    if (filter) {
      const { type, operator } = filter;
      const conditionFn = state.map(({ code, value }) => getFilterConditionFn(code!, value, type));
      this.dispatch('filter', columnName, composeConditionFn(conditionFn, operator), state);
    }
  }

  /**
   * Remove filter state of specific column.
   * @param {string} columnName - column name to unfilter
   */
  public unfilter(columnName?: string) {
    this.dispatch('unfilter', columnName);
  }

  /**
   * Add class name to all cell data of specific column.
   * @param {string} columnName - column name to add className
   * @param {string} className - class name
   */
  public addColumnClassName(columnName: string, className: string) {
    this.dispatch('addColumnClassName', columnName, className);
  }

  /**
   * Remove class name to all cell data of specific column.
   * @param {string} columnName - column name to add className
   * @param {string} className - class name
   */
  public removeColumnClassName(columnName: string, className: string) {
    this.dispatch('removeColumnClassName', columnName, className);
  }

  /**
   * Return a list of class names of specific column.
   * @param {string} columnName - The name of the column
   * @returns {Array} - A list of class names
   */
  public getColumnClassName(columnName: string) {
    const { rawData } = this.store.data;
    const classNamesOfFirstRow: string[] = rawData[0]._attributes.className.column[columnName];

    if (isEmpty(classNamesOfFirstRow)) {
      return [];
    }

    return rawData.slice(1).reduce((acc, row, _, arr) => {
      const classNames = row._attributes.className.column[columnName];

      if (isEmpty(classNames) || isEmpty(acc)) {
        arr.splice(0);

        return [];
      }

      return acc.filter((className) => includes(classNames, className));
    }, classNamesOfFirstRow);
  }

  /**
   * Set new data to the row identified by the specified rowKey.
   * @param {number|string} rowKey - The unique key of the row
   * @param {object} row - The object that contains all values in the row.
   */
  public setRow(rowKey: RowKey, row: OptRow) {
    const { data, column, id } = this.store;
    const rowIndex = findIndexByRowKey(data, column, id, rowKey, false);
    this.dispatch('setRow', rowIndex, row);
  }

  /**
   * Set new data to the all rows identified by the specified rowKey.
   * Use setRows for a lot of data, as using setRow can cause performance issues.
   * @param {object} rows - The object that contains all values in the row with rowKey.
   */
  public setRows(rows: OptRow[]) {
    this.dispatch('setRows', rows);
  }

  /**
   * Move the row identified by the specified rowKey to target index.
   * Use setRows for a lot of data, as using setRow can cause performance issues.
   * If data is sorted or filtered, this couldn't be used.
   * @param {number|string} rowKey - The unique key of the row
   * @param {number} targetIndex - Target index for moving
   * @param {Object} [options] - Options
   * @param {number} [options.appended] - This option for only tree data. Whether the row is appended to other row as the child.
   */
  public moveRow(rowKey: RowKey, targetIndex: number, options: OptMoveRow = { appended: false }) {
    const { column, data } = this.store;

    if (column.treeColumnName) {
      let moveToLast = false;

      if (!options.appended) {
        if (targetIndex === data.rawData.length - 1) {
          moveToLast = true;
        } else if (this.getIndexOfRow(rowKey) < targetIndex) {
          targetIndex += 1;
        }
      }
      this.dispatch('moveTreeRow', rowKey, targetIndex, { ...options, moveToLast });
    } else {
      this.dispatch('moveRow', rowKey, targetIndex);
    }
    this.dispatch('updateRowSpan');
  }

  /**
   * Set parameters to be sent with the request to communicate with the server.
   * @param {Object} params - parameters to send to the server
   */
  public setRequestParams(params: Dictionary<any>) {
    this.dataProvider.setRequestParams(params);
  }

  /**
   * clear the modified data that is returned as the result of 'getModifiedRows' method.
   * If the 'type' parameter is undefined, all modified data is cleared.
   * @param {string} type - The modified type
   */
  public clearModifiedData(type?: ModificationTypeCode) {
    if (type) {
      this.dataManager.clear(type);
    } else {
      this.dataManager.clearAll();
    }
  }

  /**
   * append rows.
   * @param {Array} data - A list of new rows
   */
  public appendRows(data: OptRow[]) {
    this.dispatch('appendRows', data);
  }

  /**
   * Return the formatted value of the cell identified by the rowKey and columnName.
   * @param {number|string} rowKey - The unique key of the target row.
   * @param {string} columnName - The name of the column
   * @returns {string|null} - The formatted value of the cell
   */
  public getFormattedValue(rowKey: RowKey, columnName: string): string | null {
    return getFormattedValue(this.store, rowKey, columnName);
  }

  /**
   * Set total count of items for calculating the pagination.
   * @param {number} totalCount - total count
   */
  public setPaginationTotalCount(totalCount: number) {
    this.dispatch('updatePageOptions', { totalCount });
  }

  /**
   * Get total count of items with the current pagination
   * @returns {number} - total count
   */
  public getPaginationTotalCount() {
    return this.store.data.pageOptions.totalCount;
  }

  /**
   * Export a file in the specified format
   * @param {string} format - Format of export file
   * @param {Object} [options] - Options for export
   *    @param {boolean} [options.includeHeader=true] - Whether to include headers
   *    @param {boolean} [options.includeHiddenColumns=false] - Whether to include hidden columns
   *    @param {string[]} [options.columnNames=[...allVisibleColumnNames]] - Columns names to export
   *    @param {boolean} [options.onlySelected=false] - Whether to export only the selected range
   *    @param {boolean} [options.onlyFiltered=true] - Whether to export only the filtered data
   *    @param {boolean} [options.useFormattedValue=false] - Whether to export formatted values or original values
   *    @param {','|';'|'\\t'|'|'} [options.delimiter=','] - Delimiter to export CSV
   *    @param {string} [options.fileName='grid-export'] - File name to export
   */
  public export(format: ExportFormat, options?: OptExport) {
    this.dispatch('execExport', format, options);
  }

  /**
   * Move the column identified by the specified column name to target index.
   * If there is hidden columns or use complex columns, this couldn't be used.
   * If the column of column name is row header column or tree column, this couldn't be used.
   * @param {string} columnName - The column name of the column
   * @param {number} targetIndex - Target index for moving
   */
  public moveColumn(columnName: string, targetIndex: number) {
    const { allColumns } = this.store.column;
    const column = find(({ name }) => name === columnName, allColumns);

    if (
      !column ||
      targetIndex < 0 ||
      targetIndex >= allColumns.length ||
      isRowHeader(columnName) ||
      isTreeColumnName(this.store.column, columnName)
    ) {
      return;
    }

    this.dispatch('moveColumn', columnName, targetIndex);
  }
}
