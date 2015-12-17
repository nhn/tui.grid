/**
 * @fileoverview The tui.Grid class for the external API.
 * @author NHN Ent. FE Development Team
 */
'use strict';

/**
 * Grid public API
 *
 * @param {Object} options
 *      @param {number} [options.columnFixCount=0] - Column index for fixed column. The columns indexed from 0 to this value will always be shown on the left side. {@link tui.Grid#setColumnFixCount|setColumnFixCount} can be used for setting this value dynamically.
 *      @param {string} [options.selectType=''] - Type of buttons shown next to the _number(rowKey) column. The string value 'checkbox' or 'radiobox' can be used. If not specified, the button column will not be shown.
 *      @param {boolean} [options.autoNumbering=true] - Specifies whether to assign a auto increasing number to each rows when rendering time.
 *      @param {number} [options.headerHeight=35] - The height of header area. When rows in header are multiple (merged column), this value must be the total height of rows.
 *      @param {number} [options.rowHeight=27] - The height of each rows.
 *      @param {number} [options.displayRowCount=10] - The number of rows to be shown in the table area. Total height of grid will be set based on this value.
 *      @param {number} [options.minimumColumnWidth=50] - Minimum width of each columns.
 *      @param {boolean} [options.useClientSort=true] - If set to true, sorting will be executed by client itself without server.
 *      @param {boolean} [options.singleClickEdit=false] - If set to true, text-convertible cell will be changed to edit-mode with a single click.
 *      @param {boolean} [options.scrollX=true] - Specifies whether to show horizontal scrollbar.
 *      @param {boolean} [options.scrollY=true] - Specifies whether to show vertical scrollbar.
 *      @param {string} [options.keyColumnName=null] - The name of the column to be used to identify each rows. If not specified, unique value for each rows will be created internally.
 *      @param {Object} [options.toolbar] - The object for configuring toolbar UI.
 *          @param {boolean} [options.toolbar.hasResizeHandler=true] - Specifies whether to use the resize hendler.
 *          @param {boolean} [options.toolbar.hasControlPanel=true] - Specifies whether to use the control panel.
 *          @param {boolean} [options.toolbar.hasPagination=true] - Specifies whether to use the pagination.
 *      @param {array} options.columnModelList - The configuration of the grid columns.
 *          @param {string} options.columnModelList.columnName - The name of the column.
 *          @param {boolean} [options.columnModelList.isEllipsis=false] - If set to true, ellipsis will be used for overflowing content.
 *          @param {string} [options.columnModelList.align=left] - Horizontal alignment of the column content. Available values are 'left', 'center', 'right'.
 *          @param {string} [options.columnModelList.className] - The name of the class to be used for all cells of the column.
 *          @param {string} [options.columnModelList.title] - The title of the column to be shown on the header.
 *          @param {number} [options.columnModelList.width] - The width of the column. The unit is pixel.
 *          @param {boolean} [options.columnModelList.isHidden] - If set to true, the column will not be shown.
 *          @param {boolean} [options.columnModelList.isFixedWidth=false] - If set to true, the width of the column will not be changed.
 *          @param {string} [options.columnModelList.defaultValue] - The default value to be shown when the column doesn't have a value.
 *          @param {function} [options.columnModelList.formatter] - The function that formats the value of the cell. The retrurn value of the function will be shown as the value of the cell.
 *          @param {boolean} [options.columnModelList.notUseHtmlEntity=false] - If set to true, the value of the cell will not be encoded as HTML entities.
 *          @param {boolean} [options.columnModelList.isIgnore=false] - If set to true, the value of the column will be ignored when setting up the list of modified rows.
 *          @param {boolean} [options.columnModelList.isSortable=false] - If set to true, sort button will be shown on the right side of the column header, which executes the sort action when clicked.
 *          @param {Array} [options.columnModelList.editOption] - The object for configuring editing UI.
 *              @param {string} [options.columnModelList.editOption.type='normal'] - The string value that specifies the type of the editing UI. Available values are 'text', 'text-password', 'text-convertible', 'select', 'radio', 'checkbox'.
 *              @param {Array} [options.columnModelList.editOption.list] - Specifies the option list for the 'select', 'radio', 'checkbox' type. The item of the array must contain properties named 'text' and 'value'. (e.g. [{text: 'option1', value: 1}, {...}])
 *              @param {function} [options.columnModelList.editOption.changeBeforeCallback] - The function that will be called before changing the value of the cell. If returns false, the changing will be canceled.
 *              @param {function} [options.columnModelList.editOption.changeAfterCallback] - The function that will be called after changing the value of the cell.
 *              @param {string} [options.columnModelList.editOption.beforeText] <em>Deprecated</em>. (replaced with {@link beforeContent})
 *              @param {(string|function)} [options.columnModelList.editOption.beforeContent] - The HTML string to be shown left to the value. If it's a function, the return value will be used.
 *              @param {string} [options.columnModelList.editOption.afterText] <em>Deprecated</em>. (replaced with {@link afterContent})
 *              @param {(string|function)} [options.columnModelList.editOption.afterContent] - The HTML string to be shown right to the value. If it's a function, the return value will be used.
 *              @param {function} [options.columnModelList.editOption.converter] - The function whose return value (HTML) represents the UI of the cell. If the return value is falsy(null|undefined|false), default UI will be shown. This option is available for the 'text', 'text-password', 'select', 'checkbox', 'radio' type.
 *              @param {Object} [options.columnModelList.editOption.inputEvents] - The object that has an event name as a key and event handler as a value for events on input element.
 *          @param {Array} [options.columnModelList.relationList] - Specifies relation between this and other column.
 *              @param {array} [options.columnModelList.relationList.columnList] - Array of the names of target columns.
 *              @param {function} [options.columnModelList.relationList.isDisabled] - If returns true, target columns will be disabled.
 *              @param {function} [options.columnModelList.relationList.isEditable] - If returns true, target columns will be editable.
 *              @param {function} [options.columnModelList.relationList.optionListChange] - The function whose return value specifies the option list for the 'select', 'radio', 'checkbox' type. The options list of target columns will be replaced with the return value of this function.
 *      @param {array} options.columnMerge - The array that specifies the merged column. This options does not merge the cells of multiple columns into a single cell. This options only effects to the headers of the multiple columns, creates a new parent header that includes the headers of spcified columns, and sets up the hierarchy.
 * @constructor tui.Grid
 * @example
     <div id='grid'></div>
     <script>
 var grid = new tui.Grid({
    el: $('#grid'),
    columnFixCount: 2,  //(default=0)
    selectType: 'checkbox', //(default='')
    autoNumbering: true, //(default=true)
    headerHeight: 100, //(default=35)
    rowHeight: 27, // (default=27)
    displayRowCount: 10, //(default=10)
    minimumColumnWidth: 50, //(default=50)
    scrollX: true, //(default:true)
    scrollY: true, //(default:true)
    keyColumnName: 'column1', //(default:null)
    toolbar: {
        hasResizeHandler: true, //(default:true)
        hasControlPanel: true,  //(default:true)
        hasPagination: true     //(default:true)
    },
    columnModelList: [
        {
            title: 'normal title',
            columnName: 'column0',
            className: 'bg_red',
            width: 100,
            isEllipsis: false,
            notUseHtmlEntity: false,
            defaultValue: 'empty',
            isIgnore: false
        },
        {
            title: 'hidden column',
            columnName: 'column1',
            isHidden: true
        },
        {
            title: 'formatter example',
            columnName: 'column2',
            formatter: function(value, row) {
                return '<img src="' + value + '" />';
            }
        },
        {
            title: 'converter example',
            columnName: 'column3',
            editOption: {
                type: 'text',
                converter: function(value, row) {
                    if (row.rowKey % 2 === 0) {
                        return 'Plain text value : ' + value;
                    }
                }
            }
        },
        {
            title: 'normal text input column',
            columnName: 'column4',
            editOption: {
                type: 'text',
                beforeContent: 'price:',
                afterContent: '$'
            },
            // - param {Object}  changeEvent
            //      - param {(number|string)} changeEvent.rowKey - The rowKey of the target cell
            //      - param {(number|string)} changeEvent.columnName - The field(column) name of the target cell
            //      - param {*} changeEvent.value - The changed value of the target cell
            //      - param {Object} changeEvent.instance - The instance of the Grid
            // - returns {boolean}
            changeBeforeCallback: function(changeEvent) {
                if (!/[0-9]+/.test(changeEvent.value)) {
                    alert('Integer only.');
                    return false;
                }
            },
            // - param {Object}  changeEvent
            //      - param {(number|string)} changeEvent.rowKey - The rowKey of the target cell
            //      - param {(number|string)} changeEvent.columnName - The field(column) name of the target
            //      - param {*} changeEvent.value - The changed value of the target cell
            //      - param {Object} changeEvent.instance - - The instance of the Grid
            // - returns {boolean}
            //
            changeAfterCallback: function(changeEvent) {}
        },
        {
            title: 'password input column',
            columnName: 'column5',
            width: 100,
            isFixedWidth: true,
            editOption: {
                type: 'text-password',
                beforeContent: 'password:'
            }
        },
        {
            title: 'text input when editing mode',
            columnName: 'column6',
            editOption: {
                type: 'text-convertible'
            },
            isIgnore: true
        },
        {
            title: 'select box',
            columnName: 'column7',
            editOption: {
                type: 'select',
                list: [
                    {text: '1', value: 1},
                    {text: '2', value: 2},
                    {text: '3', value: 3},
                    {text: '4', value: 4}
                ]
            },
            relationList: [
                {
                    columnList: ['column8', 'column9'],
                    // - param {*} value - The changed value of the target cell
                    // - param {Object} rowData - The data of the row that contains the target cell
                    // - return {boolean}
                    isDisabled: function(value, rowData) {
                        return value == 2;
                    },
                    // - param {*} value - The changed value of the target cell
                    // - param {Object} rowData - The data of the row that contains the target cell
                    // - return {boolean}
                    //
                    isEditable: function(value, rowData) {
                        return value != 3;
                    },
                    // - param {*} value - The changed value of the target cell
                    // - param {Object} rowData - The data of the row that contains the target cell
                    // - return {{text: string, value: number}[]}
                    optionListChange: function(value, rowData) {
                        if (value == 1) {
                            console.log('changev return');
                            return [
                                { text: 'option 1', value: 1},
                                { text: 'option 2', value: 2},
                                { text: 'option 3', value: 3},
                                { text: 'option 4', value: 4}
                            ];
                        }
                    }
                }
            ]
        },
        {
            title: 'checkbox',
            columnName: 'column8',
            editOption: {
                type: 'checkbox',
                list: [
                    {text: 'option 1', value: 1},
                    {text: 'option 2', value: 2},
                    {text: 'option 3', value: 3},
                    {text: 'option 4', value: 4}
                ]
            }
        },
        {
            title: 'radio button',
            columnName: 'column9',
            editOption: {
                type: 'radio',
                list: [
                    {text: 'option 1', value: 1},
                    {text: 'option 2', value: 2},
                    {text: 'option 3', value: 3},
                    {text: 'option 4', value: 4}
                ]
            }
        },
    ],
    columnMerge: [
        {
            'columnName' : 'mergeColumn1',
            'title' : '1 + 2',
            'columnNameList' : ['column1', 'column2']
        },
        {
            'columnName' : 'mergeColumn2',
            'title' : '1 + 2 + 3',
            'columnNameList' : ['mergeColumn1', 'column3']
        },
        {
            'columnName' : 'mergeColumn3',
            'title' : '1 + 2 + 3 + 4 + 5',
            'columnNameList' : ['mergeColumn2', 'column4', 'column5']
        }
    ]
});

     </script>
 *
 */

var View = require('./base/view');
var Core = require('./core');
var ContainerView = require('./view/container');
var DomState = require('./domState');

var instanceMap = {};

 /**
  * Toast UI
  * @namespace
  */
tui = window.tui = tui || {};

tui.Grid = View.extend(/**@lends tui.Grid.prototype */{
    /**
     * Initializes the instance.
     * @param {Object} options - Options set by user
     */
    initialize: function(options) {
        var core, container, domState;

        this.core = core = this._createCore(options);
        this.container = container = this._createContainerView(options, core);

        this.listenTo(core, 'all', this._relayEvent, this);

        container.render();
        this.refreshLayout();

        instanceMap[core.id] = core;
    },

    /**
     * Creates core model and returns it.
     * @param {Object} options - Options set by user
     * @return {Core} - New core object
     */
    _createCore: function(options) {
        var coreOptions = _.assign({}, options),
            domState = new DomState(this.$el);

        _.omit(coreOptions, 'el', 'singleClickEdit');

        return new Core(coreOptions, domState, this);
    },

    /**
     * Creates container view and returns it.
     * @param {Core} core - Core object
     * @param {Object} options - Options set by user
     * @return {ContainerView} - New container view
     */
    _createContainerView: function(options, core) {
        var containerOptions = {
            el: this.$el,
            singleClickEdit: options.singleClickEdit
        };

        return new ContainerView(containerOptions, core);
    },

    /**
     * Relay the internal events to the external.
     * @private
     */
    _relayEvent: function() {
        this.trigger.apply(this, arguments);
    },
    /**
     * Disables the row identified by the rowkey.
     * @param {(number|string)} rowKey - The unique key of the target row
     */
    disableRow: function(rowKey) {
        this.core.disableRow(rowKey);
    },
    /**
     * Enables the row identified by the rowKey.
     * @param {(number|string)} rowKey - The unique key of the target row
     */
    enableRow: function(rowKey) {
        this.core.enableRow(rowKey);
    },
    /**
     * Returns the value of the cell identified by the rowKey and columnName.
     * @param {(number|string)} rowKey - The unique key of the target row.
     * @param {string} columnName - The name of the column
     * @param {boolean} [isOriginal] - It set to true, the original value will be return.
     * @return {(number|string)} - The value of the cell
     */
    getValue: function(rowKey, columnName, isOriginal) {
        return this.core.getValue(rowKey, columnName, isOriginal);
    },
    /**
     * Returns a list of all values in the specified column.
     * @param {string} columnName - The name of the column
     * @param {boolean} [isJsonString=false] - It set to true, return value will be converted to JSON string.
     * @return {(Array|string)} - A List of all values in the specified column. (or JSON string of the list)
     */
    getColumnValues: function(columnName, isJsonString) {
        return this.core.getColumnValues(columnName, isJsonString);
    },

    /**
     * Returns the object that contains all values in the specified row.
     * @param {(number|string)} rowKey - The unique key of the target row
     * @param {boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @return {(Object|string)} - The object that contains all values in the row. (or JSON string of the object)
     */
    getRow: function(rowKey, isJsonString) {
        return this.core.dataModel.getRowData(rowKey, isJsonString);
    },

    /**
     * Returns the object that contains all values in the row at specified index.
     * @param {number} index - The index of the row
     * @param {Boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @return {Object|string} - The object that contains all values in the row. (or JSON string of the object)
     */
    getRowAt: function(index, isJsonString) {
        return this.core.dataModel.getRowData(index, isJsonString);
    },

    /**
     * Returns the total number of the rows.
     * @return {number} - The total number of the rows
     */
    getRowCount: function() {
        return this.core.dataModel.length;
    },
    /**
     * Returns the rowKey of the currently selected row.
     * @return {(number|string)} - The rowKey of the row
     */
    getSelectedRowKey: function() {
        return this.core.focusModel.which().rowKey;
    },
    /**
     * Returns the jquery object of the cell identified by the rowKey and columnName.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @return {jQuery} - The jquery object of the cell element
     */
    getElement: function(rowKey, columnName) {
        return this.core.getElement(rowKey, columnName);
    },
    /**
     * Sets the value of the cell identified by the specified rowKey and columnName.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {(number|string)} columnValue - The value to be set
     */
    setValue: function(rowKey, columnName, columnValue) {
        this.core.setValue(rowKey, columnName, columnValue);
    },
    /**
     * Sets the all values in the specified column.
     * @param {string} columnName - The name of the column
     * @param {(number|string)} columnValue - The value to be set
     * @param {Boolean} [isCheckCellState=true] - If set to true, only editable and not disabled cells will be affected.
     */
    setColumnValues: function(columnName, columnValue, isCheckCellState) {
        this.core.setColumnValues(columnName, columnValue, isCheckCellState);
    },
    /**
     * Replace all rows with the specified list. This will not change the original data.
     * @param {Array} rowList - A list of new rows
     */
    replaceRowList: function(rowList) {
        this.core.replaceRowList(rowList);
    },
    /**
     * Replace all rows with the specified list. This will change the original data.
     * @param {Array} rowList - A list of new rows
     * @param {function} callback - The function that will be called when done.
     */
    setRowList: function(rowList, callback) {
        this.core.setRowList(rowList, true, callback);
    },
    /**
     * Sets focus on the cell identified by the specified rowKey and columnName.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.
     */
    focus: function(rowKey, columnName, isScrollable) {
        this.core.focusClipboard();
        this.core.focus(rowKey, columnName, isScrollable);
    },
    /**
     * Sets focus on the cell at the specified index of row and column.
     * @param {(number|string)} rowIndex - The index of the row
     * @param {string} columnIndex - The index of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.
     */
    focusAt: function(rowIndex, columnIndex, isScrollable) {
        this.core.focusAt(rowIndex, columnIndex, isScrollable);
    },
    /**
     * Sets focus on the cell at the specified index of row and column and starts to edit.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.
     */
    focusIn: function(rowKey, columnName, isScrollable) {
        this.core.focusIn(rowKey, columnName, isScrollable);
    },
    /**
     * Sets focus on the cell at the specified index of row and column and starts to edit.
     * @param {(number|string)} rowIndex - The index of the row
     * @param {string} columnIndex - The index of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.     */
    focusInAt: function(rowIndex, columnIndex, isScrollable) {
        this.core.focusInAt(rowIndex, columnIndex, isScrollable);
    },
    /**
     * Makes view ready to get keyboard input.
     */
    readyForKeyControl: function() {
        this.core.focusClipboard();
    },
    /**
     * Removes focus from the focused cell.
     */
    blur: function() {
        this.core.blur();
    },
    /**
     * Checks all rows.
     */
    checkAll: function() {
        this.core.checkAll();
    },
    /**
     * Checks the row identified by the specified rowKey.
     * @param {(number|string)} rowKey - The unique key of the row
     */
    check: function(rowKey) {
        this.core.check(rowKey);
    },
    /**
     * Unchecks all rows.
     */
    uncheckAll: function() {
        this.core.uncheckAll();
    },
    /**
     * Unchecks the row identified by the specified rowKey.
     * @param {(number|string)} rowKey - The unique key of the row
     */
    uncheck: function(rowKey) {
        this.core.uncheck(rowKey);
    },
    /**
     * Removes all rows.
     */
    clear: function() {
        this.core.clear();
    },
    /**
     * Removes the row identified by the specified rowKey.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {(boolean|object)} [options] - Options. If the type is boolean, this value is equivalent to  options.removeOriginalData.
     * @param {boolean} [options.removeOriginalData] - If set to true, the original data will be removed.
     * @param {boolean} [options.keepRowSpanData] - If set to true, the value of the merged cells will not be removed although the target is first cell of them.
     */
    removeRow: function(rowKey, options) {
        if (tui.util.isBoolean(options) && options) {
            options = {
                removeOriginalData: true
            };
        }
        this.core.removeRow(rowKey, options);
    },
    /**
     * Removes all checked rows.
     * @param {boolean} isConfirm - If set to true, confirm message will be shown before remove.
     * @return {boolean} - True if there's at least one row removed.
     */
    removeCheckedRows: function(isConfirm) {
        return this.core.removeCheckedRows(isConfirm);
    },
    /**
     * Enables the row identified by the rowKey to be able to check.
     * @param {(number|string)} rowKey - The unique key of the row
     */
    enableCheck: function(rowKey) {
        this.core.enableCheck(rowKey);
    },
    /**
      * Disables the row identified by the spcified rowKey to not be abled to check.
     * @param {(number|string)} rowKey - The unique keyof the row.
     */
    disableCheck: function(rowKey) {
        this.core.disableCheck(rowKey);
    },
    /**
     * Returns a list of the rowKey of checked rows.
     * @param {Boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @return {Array|string} - A list of the rowKey. (or JSON string of the list)
     */
    getCheckedRowKeyList: function(isJsonString) {
        var checkedRowKeyList = this.core.getCheckedRowKeyList();
        return isJsonString ? $.toJSON(checkedRowKeyList) : checkedRowKeyList;
    },
    /**
     * Returns a list of the checked rows.
     * @param {Boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @return {Array|string} - A list of the checked rows. (or JSON string of the list)
     */
    getCheckedRowList: function(isJsonString) {
        var checkedRowList = this.core.getCheckedRowList();
        return isJsonString ? $.toJSON(checkedRowList) : checkedRowList;
    },
    /**
     * Returns a list of the column model.
     * @return {Array} - A list of the column model.
     */
    getColumnModelList: function() {
        return this.core.getColumnModelList();
    },
    /**
     * Returns the object that contains the lists of changed data compared to the original data.
     * The object has properties 'createList', 'updateList', 'deleteList'.
     * @param {Object} [options] Options
     *      @param {boolean} [options.isOnlyChecked=false] - If set to true, only checked rows will be considered.
     *      @param {boolean} [options.isRaw=false] - If set to true, the data will contains the row data for internal use.
     *      @param {boolean} [options.isOnlyRowKeyList=false] - If set to true, only keys of the changed rows will be returned.
     *      @param {Array} [options.filteringColumnList] - A list of column name to be excluded.
     * @return {{createList: Array, updateList: Array, deleteList: Array}} - Object that contains the result list.
     */
    getModifiedRowList: function(options) {
        return this.core.getModifiedRowList(options);
    },
    /**
     * Insert the new row with specified data to the end of table.
     * @param {object} [row] - The data for the new row
     * @param {object} [options] - Options
     * @param {number} [options.at] - The index at which new row will be inserted
     * @param {boolean} [options.extendPrevRowSpan] - If set to true and the previous row at target index has a rowspan data, the new row will extend the existing rowspan data.
     */
    appendRow: function(row, options) {
        this.core.appendRow(row, options);
    },
    /**
     * Insert the new row with specified data to the beginning of table.
     * @param {object} [row] - The data for the new row
     */
    prependRow: function(row) {
        this.core.prependRow(row);
    },
    /**
     * Returns true if there are at least one row changed.
     * @return {boolean} - True if there are at least one row changed.
     */
    isChanged: function() {
        return this.core.isChanged();
    },
    /**
     * Returns the instance of specified AddOn.
     * @param {string} name - The name of the AddOn
     * @return {instance} addOn - The instance of the AddOn
     */
    getAddOn: function(name) {
        return name ? this.core.addOn[name] : this.core.addOn;
    },
    /**
     * Restores the data to the original data.
     * (Original data is set by {@link tui.Grid#setRowList|setRowList}
     */
    restore: function() {
        this.core.restore();
    },
    /**
     * Selects the row identified by the rowKey.
     * @param {(number|string)} rowKey - The unique key of the row
     */
    select: function(rowKey) {
        this.core.select(rowKey);
    },
    /**
     * Unselects selected rows.
     */
    unselect: function() {
        this.core.unselect();
    },
    /**
     * Sets the index of fixed column.
     * @param {number} index - The index of column to be fixed
     */
    setColumnFixCount: function(index) {
        this.core.setColumnFixCount(index);
    },
    /**
     * Sets the list of column model.
     * @param {Array} columnModelList - A new list of column model
     */
    setColumnModelList: function(columnModelList) {
        this.core.setColumnModelList(columnModelList);
    },
    /**
     * Create an specified AddOn and use it on this instance.
     * @param {string} name - The name of the AddOn to use.
     * @param {object} options - The option objects for configuring the AddON.
     * @return {tui.Grid} - This instance.
     */
    use: function(name, options) {
        this.core.use(name, options);
        return this;
    },
    /**
     * Returns a list of all rows.
     * @return {Array} - A list of all rows
     */
    getRowList: function() {
        return this.core.getRowList();
    },
    /**
     * Sorts all rows by the specified column.
     * @param {string} columnName - The name of the column to be used to compare the rows
     */
    sort: function(columnName) {
        this.core.sort(columnName);
    },
    /**
     * Unsorts all rows. (Sorts by rowKey).
     */
    unSort: function() {
        this.core.sort('rowKey');
    },
    /**
     * Adds the specified css class to cell element identified by the rowKey and className
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {string} className - The css class name to add
     */
    addCellClassName: function(rowKey, columnName, className) {
        this.core.addCellClassName(rowKey, columnName, className);
    },
    /**
     * Adds the specified css class to all cell elements in the row identified by the rowKey
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} className - The css class name to add
     */
    addRowClassName: function(rowKey, className) {
        this.core.addRowClassName(rowKey, className);
    },
    /**
     * Removes the specified css class from the cell element indentified by the rowKey and columnName.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {string} className - The css class name to be removed
     */
    removeCellClassName: function(rowKey, columnName, className) {
        this.core.removeCellClassName(rowKey, columnName, className);
    },
    /**
     * Removes the specified css class from all cell elements in the row identified by the rowKey.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} className - The css class name to be removed
     */
    removeRowClassName: function(rowKey, className) {
        this.core.removeRowClassName(rowKey, className);
    },
    /**
     * Returns the rowspan data of the cell identified by the rowKey and columnName.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     */
    getRowSpanData: function(rowKey, columnName) {
        this.core.getRowSpanData(rowKey, columnName);
    },
    /**
     * Returns the index of the row indentified by the rowKey.
     * @param {number|string} rowKey - The unique key of the row
     * @return {number} - The index of the row
     */
    getIndexOfRow: function(rowKey) {
        return this.core.getIndexOfRow(rowKey);
    },
    /**
     * Sets the number of rows to be shown in the table area.
     * @param {number} count - The number of rows
     */
    setDisplayRowCount: function(count) {
        this.core.setDisplayRowCount(count);
    },
     /**
      * Sets the width and height of the dimension.
      * @param  {(number|null)} width - The width of the dimension
      * @param  {(number|null)} height - The height of the dimension
      */
    setSize: function(width, height) {
        this.core.setSize(width, height);
    },
    /**
     * Refresh the layout view. Use this method when the view was rendered while hidden.
     */
    refreshLayout: function() {
        this.core.dimensionModel.refreshLayout();
    },
    /**
     * Show columns
     * @param {...string} arguments - Column names to show
     */
    showColumn: function() {
        var args = tui.util.toArray(arguments);
        this.core.columnModel.setHidden(args, false);
    },
    /**
     * Hide columns
     * @param {...string} arguments - Column names to hide
     */
    hideColumn: function() {
        var args = tui.util.toArray(arguments);
        this.core.columnModel.setHidden(args, true);
    },
    /**
     * Destroys the instance.
     */
    destroy: function() {
        this.core.destroy();
        this.container.destroy();
        this.core = this.container = null;
    }
});

tui.Grid.getInstanceById = function(id) {
    return instanceMap[id];
};
