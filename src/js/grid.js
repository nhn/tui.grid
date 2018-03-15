/**
 * @fileoverview The tui.Grid class for the external API.
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');
var snippet = require('tui-code-snippet');

var View = require('./base/view');
var ModelManager = require('./model/manager');
var ViewFactory = require('./view/factory');
var DomEventBus = require('./event/domEventBus');
var DomState = require('./domState');
var PublicEventEmitter = require('./publicEventEmitter');
var PainterManager = require('./painter/manager');
var PainterController = require('./painter/controller');
var NetAddOn = require('./addon/net');
var ComponentHolder = require('./componentHolder');

var util = require('./common/util');
var i18n = require('./common/i18n');
var themeManager = require('./theme/manager');
var themeNameConst = require('./common/constMap').themeName;

var instanceMap = {};

/**
 * Grid public API
 * @class Grid
 * @param {object} options
 *      @param {Array} [options.data] - Grid data for making rows.
 *      @param {Object} [options.header] - Options object for header.
 *      @param {number} [options.header.height=35] - The height of the header area.
 *      @param {array} [options.header.complexColumns] - This options creates new parent headers of the multiple columns
 *          which includes the headers of spcified columns, and sets up the hierarchy.
 *      @param {string|number} [options.rowHeight] - The height of each rows. The default value is 'auto',
 *          the height of each rows expands to dom's height. If set to number, the height is fixed.
 *      @param {number} [options.minRowHeight=27] - The minimum height of each rows. When this value is larger than
 *          the row's height, it set to the row's height.
 *      @param {string|number} [options.bodyHeight] - The height of body area. The default value is 'auto',
 *          the height of body area expands to total height of rows. If set to 'fitToParent', the height of the grid
 *          will expand to fit the height of parent element. If set to number, the height is fixed.
 *      @param {number} [options.minBodyHeight=minRowHeight] - The minimum height of body area. When this value
 *          is larger than the body's height, it set to the body's height.
 *      @param {Object} [options.columnOptions] - Option object for all columns
 *      @param {number} [options.columnOptions.minWidth=50] - Minimum width of each columns
 *      @param {boolean} [options.columnOptions.resizable=true] - If set to true, resize-handles of each columns
 *          will be shown.
 *      @param {number} [options.columnOptions.frozenCount=0] - The number of frozen columns.
 *          The columns indexed from 0 to this value will always be shown on the left side.
 *          {@link Grid#setFrozenColumnCount} can be used for setting this value dynamically.
 *      @param {boolean} [options.columnOptions.frozenBorderWidth=1] - The value of frozen border width.
 *          When the frozen columns are created by "frozenCount" option, the frozen border width set.
 *      @param {Object} [options.copyOptions] - Option object for clipboard copying
 *      @param {boolean} [options.copyOptions.useFormattedValue] - Whether to use formatted values or original values
 *          as a string to be copied to the clipboard
 *      @param {boolean} [options.useClientSort=true] - If set to true, sorting will be executed by client itself
 *          without server.
 *      @param {boolean} [options.virtualScrolling=true] - If set to true, use virtual-scrolling so that large
 *          amount of data can be processed performantly.
 *      @param {boolean} [options.editingEvent='dblclick'] - If set to 'click', editable cell in the view-mode will be
 *          changed to edit-mode by a single click.
 *      @param {boolean} [options.scrollX=true] - Specifies whether to show horizontal scrollbar.
 *      @param {boolean} [options.scrollY=true] - Specifies whether to show vertical scrollbar.
 *      @param {boolean} [options.showDummyRows=false] - If set to true, empty area will be filled with dummy rows.
 *      @param {string} [options.keyColumnName=null] - The name of the column to be used to identify each rows.
 *          If not specified, unique value for each rows will be created internally.
 *      @param {boolean} [options.heightResizable=false] - If set to true, a handle for resizing height will be shown.
 *      @param {Object} [options.pagination=null] - Options for tui.component.Pagination.
 *          If set to null or false, pagination will not be used.
 *      @param {string} [options.selectionUnit=cell] - The unit of selection on Grid. ('cell', 'row')
 *      @param {array} [options.rowHeaders] - Options for making the row header. The row header content is number of
 *          each row or input element. The value of each item is enable to set string type. (ex: ['rowNum', 'checkbox'])
 *          @param {string} [options.rowHeaders.type] - The type of the row header. ('rowNum', 'checkbox', 'radio')
 *          @param {string} [options.rowHeaders.title] - The title of the row header on the grid header area.
 *          @param {number} [options.rowHeaders.width] - The width of the row header.
 *          @param {function} [options.rowHeaders.template] - Template function which returns the content(HTML) of
 *              the row header. This function takes a parameter an K-V object as a parameter to match template values.
 *      @param {array} options.columns - The configuration of the grid columns.
 *          @param {string} options.columns.name - The name of the column.
 *          @param {boolean} [options.columns.ellipsis=false] - If set to true, ellipsis will be used
 *              for overflowing content.
 *          @param {string} [options.columns.align=left] - Horizontal alignment of the column content.
 *              Available values are 'left', 'center', 'right'.
 *          @param {string} [options.columns.valign=middle] - Vertical alignment of the column content.
 *              Available values are 'top', 'middle', 'bottom'.
 *          @param {string} [options.columns.className] - The name of the class to be used for all cells of
 *              the column.
 *          @param {string} [options.columns.title] - The title of the column to be shown on the header.
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
 *          @param {boolean} [options.columns.validation.dataType='string'] - Specifies the type of the cell value.
 *              Avilable types are 'string' and 'number'.
 *          @param {string} [options.columns.defaultValue] - The default value to be shown when the column
 *              doesn't have a value.
 *          @param {function} [options.columns.formatter] - The function that formats the value of the cell.
 *              The retrurn value of the function will be shown as the value of the cell.
 *          @param {boolean} [options.columns.useHtmlEntity=true] - If set to true, the value of the cell
 *              will be encoded as HTML entities.
 *          @param {boolean} [options.columns.ignored=false] - If set to true, the value of the column will be
 *               ignored when setting up the list of modified rows.
 *          @param {boolean} [options.columns.sortable=false] - If set to true, sort button will be shown on
 *              the right side of the column header, which executes the sort action when clicked.
 *          @param {function} [options.columns.onBeforeChange] - The function that will be
 *              called before changing the value of the cell. If stop() method in event object is called,
 *              the changing will be canceled.
 *          @param {function} [options.columns.onAfterChange] - The function that will be
 *              called after changing the value of the cell.
 *          @param {Object} [options.columns.editOptions] - The object for configuring editing UI.
 *              @param {string} [options.columns.editOptions.type='text'] - The string value that specifies
 *                  the type of the editing UI.
 *                  Available values are 'text', 'password', 'select', 'radio', 'checkbox'.
 *              @param {boolean} [options.columns.editOptions.useViewMode=true] - If set to true, default mode
 *                  of the cell will be the 'view-mode'. The mode will be switched to 'edit-mode' only when user
 *                  double click or press 'ENTER' key on the cell. If set to false, the cell will always show the
 *                  input elements as a default.
 *              @param {Array} [options.columns.editOptions.listItems] - Specifies the option items for the
 *                  'select', 'radio', 'checkbox' type. The item of the array must contain properties named
 *                  'text' and 'value'. (e.g. [{text: 'option1', value: 1}, {...}])
 *              @param {function} [options.columns.editOptions.onFocus] - The function that will be
 *                  called when a 'focus' event occurred on an input element
 *              @param {function} [options.columns.editOptions.onBlur] - The function that will be
 *                  called when a 'blur' event occurred on an input element
 *              @param {function} [options.columns.editOptions.onKeyDown] - The function that will be
 *                  called when a 'keydown' event occurred on an input element
 *              @param {(string|function)} [options.columns.editOptions.prefix] - The HTML string to be
 *                  shown left to the input element. If it's a function, the return value will be used.
 *              @param {(string|function)} [options.columns.editOptions.postfix] - The HTML string to be
 *                  shown right to the input element. If it's a function, the return value will be used.
 *              @param {function} [options.columns.editOptions.converter] - The function whose
 *                  return value (HTML) represents the UI of the cell. If the return value is
 *                  falsy(null|undefined|false), default UI will be shown.
 *              @param {Object} [options.columns.copyOptions] - Option object for clipboard copying.
 *                  This option is column specific, and overrides the global copyOptions.
 *              @param {boolean} [options.columns.copyOptions.useFormattedValue] - Whether to use
 *                  formatted values or original values as a string to be copied to the clipboard
 *              @param {boolean} [options.columns.copyOptions.useListItemText] - Whether to use
 *                  concatenated text or original values as a string to be copied to the clipboard
 *              @param {function} [options.columns.copyOptions.customValue] - Whether to use
 *                  customized value from "customValue" callback or original values as a string to be copied to the clipboard
 *          @param {Array} [options.columns.relations] - Specifies relation between this and other column.
 *              @param {array} [options.columns.relations.targetNames] - Array of the names of target columns.
 *              @param {function} [options.columns.relations.disabled] - If returns true, target columns
 *                  will be disabled.
 *              @param {function} [options.columns.relations.editable] - If returns true, target columns
 *                  will be editable.
 *              @param {function} [options.columns.relations.listItems] - The function whose return
 *                  value specifies the option list for the 'select', 'radio', 'checkbox' type.
 *                  The options list of target columns will be replaced with the return value of this function.
 *          @param {Array} [options.columns.whiteSpace='nowrap'] - If set to 'normal', the text line is broken
 *              by fitting to the column's width. If set to 'pre', spaces are preserved and the text is braken by
 *              new line characters. If set to 'pre-wrap', spaces are preserved, the text line is broken by
 *              fitting to the column's width and new line characters. If set to 'pre-line', spaces are merged,
 *              the text line is broken by fitting to the column's width and new line characters.
 *          @param {Object} [options.columns.component] - Option for using tui-component
 *              @param {string} [options.columns.component.name] - The name of the compnent to use
 *                  for this column
 *              @param {Object} [options.columns.component.options] - The options object to be used for
 *                  creating the component
 *      @param {Object} [options.summary] - The object for configuring summary area.
 *          @param {number} [options.summary.height] - The height of the summary area.
 *          @param {Object.<string, Object>} [options.summary.columnContent]
 *              The object for configuring each column in the summary.
 *              Sub options below are keyed by each column name.
 *              @param {boolean} [options.summary.columnContent.useAutoSummary=true]
 *                  If set to true, the summary value of each column is served as a paramater to the template
 *                  function whenever data is changed.
 *              @param {function} [options.summary.columnContent.template] - Template function which returns the
 *                  content(HTML) of the column of the summary. This function takes an K-V object as a parameter
 *                  which contains a summary values keyed by 'sum', 'avg', 'min', 'max' and 'cnt'.
 *      @param {Object} [options.footer] - Deprecated: The object for configuring summary area. This option is replaced by "summary" option.
 *          @param {number} [options.footer.height] - Deprecated: The height of the summary area.
 *          @param {Object.<string, Object>} [options.footer.columnContent]
 *              Deprecated: The object for configuring each column in the summary.
 *                          Sub options below are keyed by each column name.
 *              @param {boolean} [options.footer.columnContent.useAutoSummary=true]
 *                  Deprecated: If set to true, the summary value of each column is served as a paramater to the template
 *                              function whenever data is changed.
 *              @param {function} [options.footer.columnContent.template] - Deprecated: Template function which returns the
 *                  content(HTML) of the column of the summary. This function takes an K-V object as a parameter
 *                  which contains a summary values keyed by 'sum', 'avg', 'min', 'max' and 'cnt'.
 */
var Grid = View.extend(/** @lends Grid.prototype */{
    initialize: function(options) {
        if (options.footer) {
            util.warning('The "footer" option is deprecated since 2.5.0 and replaced by "summary" option.');
            options.summary = options.footer;
        }

        this.id = util.getUniqueKey();
        this.domState = new DomState(this.$el);
        this.domEventBus = DomEventBus.create();
        this.modelManager = this._createModelManager(options);
        this.painterManager = this._createPainterManager();
        this.componentHolder = this._createComponentHolder(options.pagination);
        this.viewFactory = this._createViewFactory(options);
        this.container = this.viewFactory.createContainer();
        this.publicEventEmitter = this._createPublicEventEmitter();

        this.container.render();
        this.refreshLayout();

        if (!themeManager.isApplied()) {
            themeManager.apply(themeNameConst.DEFAULT);
        }

        this.addOn = {};

        instanceMap[this.id] = this;

        if (options.data) {
            this.setData(options.data);
        }
    },

    /**
     * Creates core model and returns it.
     * @param {Object} options - Options set by user
     * @returns {module:model/manager} - New model manager object
     * @private
     */
    _createModelManager: function(options) {
        var modelOptions = _.assign({}, options, {
            gridId: this.id,
            publicObject: this
        });

        _.omit(modelOptions, 'el');

        return new ModelManager(modelOptions, this.domState, this.domEventBus);
    },

    /**
     * Creates painter manager and returns it
     * @returns {module:painter/manager}
     * @private
     */
    _createPainterManager: function() {
        var controller = new PainterController({
            focusModel: this.modelManager.focusModel,
            dataModel: this.modelManager.dataModel,
            columnModel: this.modelManager.columnModel,
            selectionModel: this.modelManager.selectionModel
        });

        return new PainterManager({
            gridId: this.id,
            selectType: this.modelManager.columnModel.get('selectType'),
            fixedRowHeight: this.modelManager.dimensionModel.get('fixedRowHeight'),
            domEventBus: this.domEventBus,
            controller: controller
        });
    },

    /**
     * Creates a view factory.
     * @param {options} options - options
     * @returns {module:view/factory}
     * @private
     */
    _createViewFactory: function(options) {
        var viewOptions = _.pick(options, [
            'heightResizable', 'summary'
        ]);
        var dependencies = {
            modelManager: this.modelManager,
            painterManager: this.painterManager,
            componentHolder: this.componentHolder,
            domEventBus: this.domEventBus,
            domState: this.domState
        };

        return new ViewFactory(_.assign(dependencies, viewOptions));
    },

    /**
     * Creates a pagination component.
     * @param {Object} pgOptions - pagination options
     * @returns {module:component/pagination}
     * @private
     */
    _createComponentHolder: function(pgOptions) {
        return new ComponentHolder({
            pagination: pgOptions
        });
    },

    /**
     * Creates public event emitter and returns it.
     * @returns {module:publicEventEmitter} - New public event emitter
     * @private
     */
    _createPublicEventEmitter: function() {
        var emitter = new PublicEventEmitter(this);

        emitter.listenToFocusModel(this.modelManager.focusModel);
        emitter.listenToDomEventBus(this.domEventBus);
        emitter.listenToDataModel(this.modelManager.dataModel);
        emitter.listenToSelectionModel(this.modelManager.selectionModel);

        return emitter;
    },

    /**
     * Disables all rows.
     */
    disable: function() {
        this.modelManager.dataModel.setDisabled(true);
    },

    /**
     * Enables all rows.
     */
    enable: function() {
        this.modelManager.dataModel.setDisabled(false);
    },

    /**
     * Disables the row identified by the rowkey.
     * @param {(number|string)} rowKey - The unique key of the target row
     */
    disableRow: function(rowKey) {
        this.modelManager.dataModel.disableRow(rowKey);
    },

    /**
     * Enables the row identified by the rowKey.
     * @param {(number|string)} rowKey - The unique key of the target row
     */
    enableRow: function(rowKey) {
        this.modelManager.dataModel.enableRow(rowKey);
    },

    /**
     * Returns the value of the cell identified by the rowKey and columnName.
     * @param {(number|string)} rowKey - The unique key of the target row.
     * @param {string} columnName - The name of the column
     * @param {boolean} [isOriginal] - It set to true, the original value will be return.
     * @returns {(number|string)} - The value of the cell
     */
    getValue: function(rowKey, columnName, isOriginal) {
        return this.modelManager.dataModel.getValue(rowKey, columnName, isOriginal);
    },

    /**
     * Returns a list of all values in the specified column.
     * @param {string} columnName - The name of the column
     * @param {boolean} [isJsonString=false] - It set to true, return value will be converted to JSON string.
     * @returns {(Array|string)} - A List of all values in the specified column. (or JSON string of the list)
     */
    getColumnValues: function(columnName, isJsonString) {
        return this.modelManager.dataModel.getColumnValues(columnName, isJsonString);
    },

    /**
     * Returns the object that contains all values in the specified row.
     * @param {(number|string)} rowKey - The unique key of the target row
     * @param {boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @returns {(Object|string)} - The object that contains all values in the row. (or JSON string of the object)
     */
    getRow: function(rowKey, isJsonString) {
        return this.modelManager.dataModel.getRowData(rowKey, isJsonString);
    },

    /**
     * Returns the object that contains all values in the row at specified index.
     * @param {number} index - The index of the row
     * @param {Boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @returns {Object|string} - The object that contains all values in the row. (or JSON string of the object)
     */
    getRowAt: function(index, isJsonString) {
        return this.modelManager.dataModel.getRowDataAt(index, isJsonString);
    },

    /**
     * Returns the total number of the rows.
     * @returns {number} - The total number of the rows
     */
    getRowCount: function() {
        return this.modelManager.dataModel.length;
    },

    /**
     * Returns data of currently focused cell
     * @returns {number} rowKey - The unique key of the row
     * @returns {string} columnName - The name of the column
     * @returns {string} value - The value of the cell
     */
    getFocusedCell: function() {
        var addr = this.modelManager.focusModel.which();
        var value = this.getValue(addr.rowKey, addr.columnName);

        return {
            rowKey: addr.rowKey,
            columnName: addr.columnName,
            value: value
        };
    },

    /**
     * Returns the jquery object of the cell identified by the rowKey and columnName.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @returns {jQuery} - The jquery object of the cell element
     */
    getElement: function(rowKey, columnName) {
        return this.modelManager.dataModel.getElement(rowKey, columnName);
    },

    /**
     * Sets the value of the cell identified by the specified rowKey and columnName.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {(number|string)} columnValue - The value to be set
     */
    setValue: function(rowKey, columnName, columnValue) {
        this.modelManager.dataModel.setValue(rowKey, columnName, columnValue);
    },

    /**
     * Sets the all values in the specified column.
     * @param {string} columnName - The name of the column
     * @param {(number|string)} columnValue - The value to be set
     * @param {Boolean} [isCheckCellState=true] - If set to true, only editable and not disabled cells will be affected.
     */
    setColumnValues: function(columnName, columnValue, isCheckCellState) {
        this.modelManager.dataModel.setColumnValues(columnName, columnValue, isCheckCellState);
    },

    /**
     * Replace all rows with the specified list. This will not change the original data.
     * @param {Array} data - A list of new rows
     */
    resetData: function(data) {
        this.modelManager.dataModel.resetData(data);
    },

    /**
     * Replace all rows with the specified list. This will change the original data.
     * @param {Array} data - A list of new rows
     * @param {function} callback - The function that will be called when done.
     */
    setData: function(data, callback) {
        this.modelManager.dataModel.setData(data, true, callback);
    },

    /**
     * Sets the height of body-area.
     * @param {number} value - The number of pixel
     */
    setBodyHeight: function(value) {
        this.modelManager.dimensionModel.set('bodyHeight', value);
    },

    /**
     * Sets focus on the cell identified by the specified rowKey and columnName.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.
     */
    focus: function(rowKey, columnName, isScrollable) {
        this.modelManager.focusModel.focusClipboard();
        this.modelManager.focusModel.focus(rowKey, columnName, isScrollable);
    },

    /**
     * Sets focus on the cell at the specified index of row and column.
     * @param {(number|string)} rowIndex - The index of the row
     * @param {string} columnIndex - The index of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.
     */
    focusAt: function(rowIndex, columnIndex, isScrollable) {
        this.modelManager.focusModel.focusAt(rowIndex, columnIndex, isScrollable);
    },

    /**
     * Sets focus on the cell at the specified index of row and column and starts to edit.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.
     */
    focusIn: function(rowKey, columnName, isScrollable) {
        this.modelManager.focusModel.focusIn(rowKey, columnName, isScrollable);
    },

    /**
     * Sets focus on the cell at the specified index of row and column and starts to edit.
     * @param {(number|string)} rowIndex - The index of the row
     * @param {string} columnIndex - The index of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.
     */
    focusInAt: function(rowIndex, columnIndex, isScrollable) {
        this.modelManager.focusModel.focusInAt(rowIndex, columnIndex, isScrollable);
    },

    /**
     * Makes view ready to get keyboard input.
     */
    activateFocus: function() {
        this.modelManager.focusModel.focusClipboard();
    },

    /**
     * Removes focus from the focused cell.
     */
    blur: function() {
        this.modelManager.focusModel.blur();
    },

    /**
     * Checks all rows.
     */
    checkAll: function() {
        this.modelManager.dataModel.checkAll();
    },

    /**
     * Checks the row identified by the specified rowKey.
     * @param {(number|string)} rowKey - The unique key of the row
     */
    check: function(rowKey) {
        this.modelManager.dataModel.check(rowKey);
    },

    /**
     * Unchecks all rows.
     */
    uncheckAll: function() {
        this.modelManager.dataModel.uncheckAll();
    },

    /**
     * Unchecks the row identified by the specified rowKey.
     * @param {(number|string)} rowKey - The unique key of the row
     */
    uncheck: function(rowKey) {
        this.modelManager.dataModel.uncheck(rowKey);
    },

    /**
     * Removes all rows.
     */
    clear: function() {
        this.modelManager.dataModel.setData([]);
    },

    /**
     * Removes the row identified by the specified rowKey.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {(boolean|object)} [options] - Options. If the type is boolean, this value is equivalent to
     *     options.removeOriginalData.
     * @param {boolean} [options.removeOriginalData] - If set to true, the original data will be removed.
     * @param {boolean} [options.keepRowSpanData] - If set to true, the value of the merged cells will not be
     *     removed although the target is first cell of them.
     */
    removeRow: function(rowKey, options) {
        if (snippet.isBoolean(options) && options) {
            options = {
                removeOriginalData: true
            };
        }
        this.modelManager.dataModel.removeRow(rowKey, options);
    },

    /**
     * Removes all checked rows.
     * @param {boolean} showConfirm - If set to true, confirm message will be shown before remove.
     * @returns {boolean} - True if there's at least one row removed.
     */
    removeCheckedRows: function(showConfirm) {
        var rowKeys = this.getCheckedRowKeys();
        var confirmMessage = i18n.get('net.confirmDelete', {
            count: rowKeys.length
        });

        if (rowKeys.length > 0 && (!showConfirm || confirm(confirmMessage))) {
            _.each(rowKeys, function(rowKey) {
                this.modelManager.dataModel.removeRow(rowKey);
            }, this);

            return true;
        }

        return false;
    },

    /**
     * Enables the row identified by the rowKey to be able to check.
     * @param {(number|string)} rowKey - The unique key of the row
     */
    enableCheck: function(rowKey) {
        this.modelManager.dataModel.enableCheck(rowKey);
    },

    /**
     * Disables the row identified by the spcified rowKey to not be abled to check.
     * @param {(number|string)} rowKey - The unique keyof the row.
     */
    disableCheck: function(rowKey) {
        this.modelManager.dataModel.disableCheck(rowKey);
    },

    /**
     * Returns a list of the rowKey of checked rows.
     * @param {Boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @returns {Array|string} - A list of the rowKey. (or JSON string of the list)
     */
    getCheckedRowKeys: function(isJsonString) {
        var checkedRowList = this.modelManager.dataModel.getRows(true);
        var checkedRowKeyList = _.pluck(checkedRowList, 'rowKey');

        return isJsonString ? JSON.stringify(checkedRowKeyList) : checkedRowKeyList;
    },

    /**
     * Returns a list of the checked rows.
     * @param {Boolean} [useJson=false] - If set to true, return value will be converted to JSON string.
     * @returns {Array|string} - A list of the checked rows. (or JSON string of the list)
     */
    getCheckedRows: function(useJson) {
        var checkedRowList = this.modelManager.dataModel.getRows(true);

        return useJson ? JSON.stringify(checkedRowList) : checkedRowList;
    },

    /**
     * Returns a list of the column model.
     * @returns {Array} - A list of the column model.
     */
    getColumns: function() {
        return this.modelManager.columnModel.get('dataColumns');
    },

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
    getModifiedRows: function(options) {
        return this.modelManager.dataModel.getModifiedRows(options);
    },

    /**
     * Insert the new row with specified data to the end of table.
     * @param {object} [row] - The data for the new row
     * @param {object} [options] - Options
     * @param {number} [options.at] - The index at which new row will be inserted
     * @param {boolean} [options.extendPrevRowSpan] - If set to true and the previous row at target index
     *        has a rowspan data, the new row will extend the existing rowspan data.
     * @param {boolean} [options.focus] - If set to true, move focus to the new row after appending
     */
    appendRow: function(row, options) {
        this.modelManager.dataModel.append(row, options);
    },

    /**
     * Insert the new row with specified data to the beginning of table.
     * @param {object} [row] - The data for the new row
     * @param {object} [options] - Options
     * @param {boolean} [options.focus] - If set to true, move focus to the new row after appending
     */
    prependRow: function(row, options) {
        this.modelManager.dataModel.prepend(row, options);
    },

    /**
     * Returns true if there are at least one row modified.
     * @returns {boolean} - True if there are at least one row modified.
     */
    isModified: function() {
        return this.modelManager.dataModel.isModified();
    },

    /**
     * Returns the instance of specified AddOn.
     * @param {string} name - The name of the AddOn
     * @returns {instance} addOn - The instance of the AddOn
     */
    getAddOn: function(name) {
        return name ? this.addOn[name] : this.addOn;
    },

    /**
     * Restores the data to the original data.
     * (Original data is set by {@link Grid#setData|setData}
     */
    restore: function() {
        this.modelManager.dataModel.restore();
    },

    /**
     * Sets the count of frozen columns.
     * @param {number} count - The count of columns to be frozen
     */
    setFrozenColumnCount: function(count) {
        this.modelManager.columnModel.set('frozenCount', count);
    },

    /**
     * Sets the list of column model.
     * @param {Array} columns - A new list of column model
     */
    setColumns: function(columns) {
        this.modelManager.columnModel.set('columns', columns);
    },

    /**
     * Create an specified AddOn and use it on this instance.
     * @param {string} name - The name of the AddOn to use.
     * @param {object} options - The option objects for configuring the AddON.
     * @returns {tui.Grid} - This instance.
     */
    use: function(name, options) {
        if (name === 'Net') {
            options = _.assign({
                domEventBus: this.domEventBus,
                renderModel: this.modelManager.renderModel,
                dataModel: this.modelManager.dataModel,
                pagination: this.componentHolder.getInstance('pagination')
            }, options);

            this.addOn.Net = new NetAddOn(options);
            this.publicEventEmitter.listenToNetAddon(this.addOn.Net);
        }

        return this;
    },

    /**
     * Returns a list of all rows.
     * @returns {Array} - A list of all rows
     */
    getRows: function() {
        return this.modelManager.dataModel.getRows();
    },

    /**
     * Sorts all rows by the specified column.
     * @param {string} columnName - The name of the column to be used to compare the rows
     * @param {boolean} [ascending] - Whether the sort order is ascending.
     *        If not specified, use the negative value of the current order.
     */
    sort: function(columnName, ascending) {
        this.modelManager.dataModel.sortByField(columnName, ascending);
    },

    /**
     * Unsorts all rows. (Sorts by rowKey).
     */
    unSort: function() {
        this.sort('rowKey');
    },

    /**
     * Get state of the sorted column in rows
     * @returns {{columnName: string, ascending: boolean, useClient: boolean}} Sorted column's state
     */
    getSortState: function() {
        return this.modelManager.dataModel.sortOptions;
    },

    /**
     * Adds the specified css class to cell element identified by the rowKey and className
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {string} className - The css class name to add
     */
    addCellClassName: function(rowKey, columnName, className) {
        this.modelManager.dataModel.get(rowKey).addCellClassName(columnName, className);
    },

    /**
     * Adds the specified css class to all cell elements in the row identified by the rowKey
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} className - The css class name to add
     */
    addRowClassName: function(rowKey, className) {
        this.modelManager.dataModel.get(rowKey).addClassName(className);
    },

    /**
     * Removes the specified css class from the cell element indentified by the rowKey and columnName.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {string} className - The css class name to be removed
     */
    removeCellClassName: function(rowKey, columnName, className) {
        this.modelManager.dataModel.get(rowKey).removeCellClassName(columnName, className);
    },

    /**
     * Removes the specified css class from all cell elements in the row identified by the rowKey.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} className - The css class name to be removed
     */
    removeRowClassName: function(rowKey, className) {
        this.modelManager.dataModel.get(rowKey).removeClassName(className);
    },

    /**
     * Returns the rowspan data of the cell identified by the rowKey and columnName.
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @returns {Object} - Row span data
     */
    getRowSpanData: function(rowKey, columnName) {
        return this.modelManager.dataModel.getRowSpanData(rowKey, columnName);
    },

    /**
     * Returns the index of the row indentified by the rowKey.
     * @param {number|string} rowKey - The unique key of the row
     * @returns {number} - The index of the row
     */
    getIndexOfRow: function(rowKey) {
        return this.modelManager.dataModel.indexOfRowKey(rowKey);
    },

    /**
     * Returns the index of the column indentified by the column name.
     * @param {string} columnName - The unique key of the column
     * @returns {number} - The index of the column
     */
    getIndexOfColumn: function(columnName) {
        return this.modelManager.columnModel.indexOfColumnName(columnName);
    },

    /**
     * Returns an instance of tui.component.Pagination.
     * @returns {tui.component.Pagination}
     */
    getPagination: function() {
        return this.componentHolder.getInstance('pagination');
    },

    /**
     * Set the width of the dimension.
     * @param {number} width - The width of the dimension
     */
    setWidth: function(width) {
        this.modelManager.dimensionModel.setWidth(width);
    },

    /**
     * Set the height of the dimension.
     * @param {number} height - The height of the dimension
     */
    setHeight: function(height) {
        this.modelManager.dimensionModel.setHeight(height);
    },

    /**
     * Refresh the layout view. Use this method when the view was rendered while hidden.
     */
    refreshLayout: function() {
        this.modelManager.dimensionModel.refreshLayout();
    },

    /**
     * Reset the width of each column by using initial setting of column models.
     */
    resetColumnWidths: function() {
        this.modelManager.coordColumnModel.resetColumnWidths();
    },

    /**
     * Show columns
     * @param {...string} arguments - Column names to show
     */
    showColumn: function() {
        var args = snippet.toArray(arguments);
        this.modelManager.columnModel.setHidden(args, false);
    },

    /**
     * Hide columns
     * @param {...string} arguments - Column names to hide
     */
    hideColumn: function() {
        var args = snippet.toArray(arguments);
        this.modelManager.columnModel.setHidden(args, true);
    },

    /**
     * Sets the HTML string of given column summary.
     * @param {string} columnName - column name
     * @param {string} contents - HTML string
     */
    setSummaryColumnContent: function(columnName, contents) {
        this.modelManager.columnModel.setSummaryContent(columnName, contents);
    },

    /**
     * Sets the HTML string of given column summary.
     * @deprecated since version 2.5.0 and is replaced by "setSummaryColumnContent" API
     * @param {string} columnName - column name
     * @param {string} contents - HTML string
     */
    setFooterColumnContent: function(columnName, contents) {
        this.modelManager.columnModel.setSummaryContent(columnName, contents);
    },

    /**
     * Validates all data and returns the result.
     * Return value is an array which contains only rows which have invalid cell data.
     * @returns {Array.<Object>} An array of error object
     * @example
     // return value example
    [
        {
            rowKey: 1,
            errors: [
                {
                    columnName: 'c1',
                    errorCode: 'REQUIRED'
                },
                {
                    columnName: 'c2',
                    errorCode: 'REQUIRED'
                }
            ]
        },
        {
            rowKey: 3,
            errors: [
                {
                    columnName: 'c2',
                    errorCode: 'REQUIRED'
                }
            ]
        }
    ]
     */
    validate: function() {
        return this.modelManager.dataModel.validate();
    },

    /**
     * Find rows by conditions
     * @param {object} conditions - K-V object to find rows (K: column name, V: column value)
     * @returns {array} Row list
     */
    findRows: function(conditions) {
        var rowList = this.modelManager.dataModel.getRows();

        return _.where(rowList, conditions);
    },

    /**
     * Copy to clipboard
     */
    copyToClipboard: function() {
        this.modelManager.clipboardModel.setClipboardText();

        if (!window.clipboardData) { // Accessing the clipboard is a security concern on chrome
            document.execCommand('copy');
        }
    },

    /**
     * Select cells or rows by range
     * @param {object} range - Selection range
     *     @param {array} [range.start] - Index info of start selection (ex: [rowIndex, columnIndex])
     *     @param {array} [range.end] - Index info of end selection (ex: [rowIndex, columnIndex])
     */
    selection: function(range) {
        var selectionModel = this.modelManager.selectionModel;
        var start = range.start;
        var end = range.end;
        var unit = selectionModel.getSelectionUnit();

        selectionModel.start(start[0], start[1], unit);
        selectionModel.update(end[0], end[1], unit);
    },

    /**
     * Destroys the instance.
     */
    destroy: function() {
        this.modelManager.destroy();
        this.container.destroy();
        this.modelManager = this.container = null;
    }
});

/**
 * Returns an instance of the grid associated to the id.
 * @static
 * @param  {number} id - ID of the target grid
 * @returns {tui.Grid} - Grid instance
 * var Grid = tui.Grid; // or require('tui-grid')
 *
 * Grid.getInstanceById(id);
 */
Grid.getInstanceById = function(id) {
    return instanceMap[id];
};

/**
 * Apply theme to all grid instances with the preset options of a given name.
 * @static
 * @param {String} presetName - preset theme name. Available values are 'default', 'striped' and 'clean'.
 * @param {Object} [extOptions] - if exist, extend preset options with this object.
 *   @param {Object} [extOptions.grid] - Styles for the grid (container)
 *     @param {String} [extOptions.grid.background] - Background color of the grid.
 *     @param {number} [extOptions.grid.border] - Border color of the grid
 *     @param {number} [extOptions.grid.text] - Text color of the grid.
 *   @param {Object} [extOptions.selection] - Styles for a selection layer.
 *     @param {String} [extOptions.selection.background] - Background color of a selection layer.
 *     @param {String} [extOptions.selection.border] - Border color of a selection layer.
 *   @param {Object} [extOptions.scrollbar] - Styles for scrollbars.
 *     @param {String} [extOptions.scrollbar.background] - Background color of scrollbars.
 *     @param {String} [extOptions.scrollbar.thumb] - Color of thumbs in scrollbars.
 *     @param {String} [extOptions.scrollbar.active] - Color of arrows(for IE) or
 *          thumb:hover(for other browsers) in scrollbars.
 *   @param {Object} [extOptions.cell] - Styles for the table cells.
 *     @param {Object} [extOptions.cell.normal] - Styles for normal cells.
 *       @param {String} [extOptions.cell.normal.background] - Background color of normal cells.
 *       @param {String} [extOptions.cell.normal.border] - Border color of normal cells.
 *       @param {String} [extOptions.cell.normal.text] - Text color of normal cells.
 *       @param {Boolean} [extOptions.cell.normal.showVerticalBorder] - Whether vertical borders of
 *           normal cells are visible.
 *       @param {Boolean} [extOptions.cell.normal.showHorizontalBorder] - Whether horizontal borders of
 *           normal cells are visible.
 *     @param {Object} [extOptions.cell.head] - Styles for the head cells.
 *       @param {String} [extOptions.cell.head.background] - Background color of head cells.
 *       @param {String} [extOptions.cell.head.border] - border color of head cells.
 *       @param {String} [extOptions.cell.head.text] - text color of head cells.
 *       @param {Boolean} [extOptions.cell.head.showVerticalBorder] - Whether vertical borders of
 *           head cells are visible.
 *       @param {Boolean} [extOptions.cell.head.showHorizontalBorder] - Whether horizontal borders of
 *           head cells are visible.
 *     @param {Object} [extOptions.cell.selectedHead] - Styles for selected head cells.
 *       @param {String} [extOptions.cell.selectedHead.background] - background color of selected haed cells.
 *       @param {String} [extOptions.cell.selectedHead.text] - text color of selected head cells.
 *     @param {Object} [extOptions.cell.focused] - Styles for a focused cell.
 *       @param {String} [extOptions.cell.focused.background] - background color of a focused cell.
 *       @param {String} [extOptions.cell.focused.border] - border color of a focused cell.
 *     @param {Object} [extOptions.cell.focusedInactive] - Styles for a inactive focus cell.
 *       @param {String} [extOptions.cell.focusedInactive.border] - border color of a inactive focus cell.
 *     @param {Object} [extOptions.cell.required] - Styles for required cells.
 *       @param {String} [extOptions.cell.required.background] - background color of required cells.
 *       @param {String} [extOptions.cell.required.text] - text color of required cells.
 *     @param {Object} [extOptions.cell.editable] - Styles for editable cells.
 *       @param {String} [extOptions.cell.editable.background] - background color of the editable cells.
 *       @param {String} [extOptions.cell.editable.text] - text color of the selected editable cells.
 *     @param {Object} [extOptions.cell.disabled] - Styles for disabled cells.
 *       @param {String} [extOptions.cell.disabled.background] - background color of disabled cells.
 *       @param {String} [extOptions.cell.disabled.text] - text color of disabled cells.
 *     @param {Object} [extOptions.cell.invalid] - Styles for invalid cells.
 *       @param {String} [extOptions.cell.invalid.background] - background color of invalid cells.
 *       @param {String} [extOptions.cell.invalid.text] - text color of invalid cells.
 *     @param {Object} [extOptions.cell.currentRow] - Styles for cells in a current row.
 *       @param {String} [extOptions.cell.currentRow.background] - background color of cells in a current row.
 *       @param {String} [extOptions.cell.currentRow.text] - text color of cells in a current row.
 *     @param {Object} [extOptions.cell.evenRow] - Styles for cells in even rows.
 *       @param {String} [extOptions.cell.evenRow.background] - background color of cells in even rows.
 *       @param {String} [extOptions.cell.evenRow.text] - text color of cells in even rows.
 *     @param {Object} [extOptions.cell.dummy] - Styles for dummy cells.
 *       @param {String} [extOptions.cell.dummy.background] - background color of dummy cells.
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
Grid.applyTheme = function(presetName, extOptions) {
    themeManager.apply(presetName, extOptions);
};

/**
 * Set language
 * @static
 * @param {string} localeCode - Code to set locale messages and
 *     this is the language or language-region combination (ex: en-US)
 * @param {object} [data] - Messages using in Grid
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
Grid.setLanguage = function(localeCode, data) {
    i18n.setLanguage(localeCode, data);
};

module.exports = Grid;
