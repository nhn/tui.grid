/*!
 * bundle created at "Wed Jan 04 2017 12:39:59 GMT+0900 (KST)"
 * version: 1.7.0
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview The tui.Grid class for the external API.
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var View = __webpack_require__(2);
	var ModelManager = __webpack_require__(6);
	var ViewFactory = __webpack_require__(29);
	var DomState = __webpack_require__(50);
	var PublicEventEmitter = __webpack_require__(51);
	var PainterManager = __webpack_require__(52);
	var PainterController = __webpack_require__(62);
	var NetAddOn = __webpack_require__(63);
	var ComponentHolder = __webpack_require__(66);
	var util = __webpack_require__(9);
	var themeManager = __webpack_require__(67);
	var themeNameConst = __webpack_require__(10).themeName;

	var instanceMap = {};

	__webpack_require__(73);

	 /**
	  * Toast UI Namespace
	  * @namespace
	  */
	tui = window.tui = tui || {};

	/**
	 * Grid public API
	 * @class
	 * @param {PropertiesHash} options
	 *      @param {number} [options.columnFixCount=0] - Column index for fixed column. The columns indexed from 0 to this
	 *          value will always be shown on the left side. {@link tui.Grid#setColumnFixCount|setColumnFixCount}
	 *          can be used for setting this value dynamically.
	 *      @param {string} [options.selectType=''] - Type of buttons shown next to the _number(rowKey) column.
	 *          The string value 'checkbox' or 'radio' can be used.
	 *          If not specified, the button column will not be shown.
	 *      @param {boolean} [options.autoNumbering=true] - Specifies whether to assign a auto increasing number
	 *          to each rows when rendering time.
	 *      @param {number} [options.headerHeight=35] - The height of the header area.
	 *          When rows in header are multiple (merged column), this value must be the total height of rows.
	 *      @param {number} [options.rowHeight=27] - The height of each rows.
	 *      @param {boolean} [options.isFixedRowHeight=false] - If set to true, the height of each rows does not
	 *          expand with content.
	 *      @param {number} [options.bodyHeight] - The height of body area. If this value is empty, the height of body
	 *          area expands.
	 *          to total height of rows.
	 *      @param {number} [options.displayRowCount=10] - Deprecated.
	 *          <del>The number of rows to be shown in the table area.
	 *          Total height of grid will be set based on this value.</del>
	 *      @param {number} [options.minimumColumnWidth=50] - Minimum width of each columns.
	 *      @param {boolean} [options.useClientSort=true] - If set to true, sorting will be executed by client itself
	 *          without server.
	 *      @param {boolean} [options.singleClickEdit=false] - If set to true, editable cell in the view-mode will be
	 *          changed to edit-mode by a single click.
	 *      @param {boolean} [options.scrollX=true] - Specifies whether to show horizontal scrollbar.
	 *      @param {boolean} [options.scrollY=true] - Specifies whether to show vertical scrollbar.
	 *      @param {boolean} [options.fitToParentHeight=false] - If set to true, the height of the grid will expand to
	 *          fit the height of parent element.
	 *      @param {boolean} [options.showDummyRows=false] - If set to true, empty area will be filled with dummy rows.
	 *      @param {string} [options.keyColumnName=null] - The name of the column to be used to identify each rows.
	 *          If not specified, unique value for each rows will be created internally.
	 *      @param {boolean} [options.toolbar=false] - If set to true, toolbar area will be shown.
	 *      @param {boolean} [options.resizeHandle=false] - If set to true, a handle for resizing height will be shown.
	 *      @param {Object} [options.pagination=null] - Options for tui.component.Pagination.
	 *          If set to null or false, pagination will not be used.
	 *      @param {array} options.columnModelList - The configuration of the grid columns.
	 *          @param {string} options.columnModelList.columnName - The name of the column.
	 *          @param {boolean} [options.columnModelList.isEllipsis=false] - If set to true, ellipsis will be used
	 *              for overflowing content.
	 *          @param {string} [options.columnModelList.align=left] - Horizontal alignment of the column content.
	 *              Available values are 'left', 'center', 'right'.
	 *          @param {string} [options.columnModelList.valign=middle] - Vertical alignment of the column content.
	 *              Available values are 'top', 'middle', 'bottom'.
	 *      @param {number} [options.valign=27] - The height of each rows.
	 *          @param {string} [options.columnModelList.className] - The name of the class to be used for all cells of
	 *              the column.
	 *          @param {string} [options.columnModelList.title] - The title of the column to be shown on the header.
	 *          @param {number} [options.columnModelList.width] - The width of the column. The unit is pixel.
	 *          @param {boolean} [options.columnModelList.isHidden] - If set to true, the column will not be shown.
	 *          @param {boolean} [options.columnModelList.isFixedWidth=false] - If set to true, the width of the column
	 *              will not be changed.
	 *          @param {boolean} [options.columnModelList.isRequired=false] - If set to true, the data of the column
	 *              will be checked to be not empty whenever data is changed or calling {@link tui.Grid#validate}.
	 *          @param {string} [options.columnModelList.defaultValue] - The default value to be shown when the column
	 *              doesn't have a value.
	 *          @param {function} [options.columnModelList.formatter] - The function that formats the value of the cell.
	 *              The retrurn value of the function will be shown as the value of the cell.
	 *          @param {boolean} [options.columnModelList.notUseHtmlEntity=false] - If set to true, the value of the cell
	 *              will not be encoded as HTML entities.
	 *          @param {boolean} [options.columnModelList.isIgnore=false] - If set to true, the value of the column will be
	 *               ignored when setting up the list of modified rows.
	 *          @param {boolean} [options.columnModelList.isSortable=false] - If set to true, sort button will be shown on
	 *              the right side of the column header, which executes the sort action when clicked.
	 *          @param {Array} [options.columnModelList.editOption] - The object for configuring editing UI.
	 *              @param {string} [options.columnModelList.editOption.type='normal'] - The string value that specifies
	 *                  the type of the editing UI.
	 *                  Available values are 'text', 'password', 'select', 'radio', 'checkbox'.
	 *              @param {boolean} [options.columnModelList.editOption.useViewMode=true] - If set to true, default mode
	 *                  of the cell will be the 'view-mode'. The mode will be switched to 'edit-mode' only when user
	 *                  double click or press 'ENTER' key on the cell. If set to false, the cell will always show the
	 *                  input elements as a default.
	 *              @param {Array} [options.columnModelList.editOption.list] - Specifies the option list for the
	 *                  'select', 'radio', 'checkbox' type. The item of the array must contain properties named
	 *                  'text' and 'value'. (e.g. [{text: 'option1', value: 1}, {...}])
	 *              @param {function} [options.columnModelList.editOption.changeBeforeCallback] - The function that will be
	 *                  called before changing the value of the cell. If returns false, the changing will be canceled.
	 *              @param {function} [options.columnModelList.editOption.changeAfterCallback] - The function that will be
	 *                  called after changing the value of the cell.
	 *              @param {(string|function)} [options.columnModelList.editOption.beforeContent] - The HTML string to be
	 *                  shown left to the value. If it's a function, the return value will be used.
	 *              @param {(string|function)} [options.columnModelList.editOption.afterContent] - The HTML string to be
	 *                  shown right to the value. If it's a function, the return value will be used.
	 *              @param {function} [options.columnModelList.editOption.converter] - The function whose
	 *                  return value (HTML) represents the UI of the cell. If the return value is
	 *                  falsy(null|undefined|false), default UI will be shown.
	 *              @param {Object} [options.columnModelList.editOption.inputEvents] - The object that has an event name
	 *                  as a key and event handler as a value for events on input element.
	 *          @param {Array} [options.columnModelList.relationList] - Specifies relation between this and other column.
	 *              @param {array} [options.columnModelList.relationList.columnList] - Array of the names of target columns.
	 *              @param {function} [options.columnModelList.relationList.isDisabled] - If returns true, target columns
	 *                  will be disabled.
	 *              @param {function} [options.columnModelList.relationList.isEditable] - If returns true, target columns
	 *                  will be editable.
	 *              @param {function} [options.columnModelList.relationList.optionListChange] - The function whose return
	 *                  value specifies the option list for the 'select', 'radio', 'checkbox' type.
	 *                  The options list of target columns will be replaced with the return value of this function.
	 *          @param {Object} [options.columnModelList.component] - Option for using tui-component
	 *              @param {string} [options.columnModelList.component.name] - The name of the compnent to use
	 *                  for this column
	 *              @param {Object} [options.columnModelList.component.option] - The option object to be used for
	 *                  creating the component
	 *      @param {array} [options.columnMerge] - The array that specifies the merged column.
	 *          This options does not merge the cells of multiple columns into a single cell.
	 *          This options only effects to the headers of the multiple columns, creates a new parent header
	 *          that includes the headers of spcified columns, and sets up the hierarchy.
	 *      @param {Object} [options.footer] - The object for configuring footer area.
	 *          @param {number} [options.footer.height] - The height of the footer area.
	 *          @param {Object.<string, Object>} [options.footer.columnContent]
	 *              The object for configuring each column in the footer.
	 *              Sub options below are keyed by each column name.
	 *              @param {boolean} [options.footer.columnContent.useAutoSummary=true]
	 *                  If set to true, the summary value of each column is served as a paramater to the template
	 *                  function whenever data is changed.
	 *              @param {function} [options.footer.columnContent.template] - Template function which returns the
	 *                  content(HTML) of the column of the footer. This function takes an K-V object as a parameter
	 *                  which contains a summary values keyed by 'sum', 'avg', 'min', 'max' and 'cnt'.
	 * @param {Object} options - Options set by user
	 */
	tui.Grid = View.extend(/**@lends tui.Grid.prototype */{
	    initialize: function(options) {
	        var domState = new DomState(this.$el);

	        options = util.enableDeprecatedOptions(options);
	        this.id = util.getUniqueKey();
	        this.modelManager = this._createModelManager(options, domState);
	        this.painterManager = this._createPainterManager();
	        this.componentHolder = this._createComponentHolder(options.pagination);
	        this.viewFactory = this._createViewFactory(domState, options);
	        this.container = this.viewFactory.createContainer();
	        this.publicEventEmitter = this._createPublicEventEmitter();
	        this.domState = domState;

	        this.container.render();
	        this.refreshLayout();

	        if (!themeManager.isApplied()) {
	            themeManager.apply(themeNameConst.DEFAULT);
	        }

	        this.addOn = {};
	        instanceMap[this.id] = this;
	    },

	    /**
	     * Creates core model and returns it.
	     * @param {Object} options - Options set by user
	     * @param {module:domState} domState - domState
	     * @returns {module:model/manager} - New model manager object
	     * @private
	     */
	    _createModelManager: function(options, domState) {
	        var modelOptions = _.assign({}, options, {
	            gridId: this.id
	        });

	        _.omit(modelOptions, 'el', 'singleClickEdit');

	        return new ModelManager(modelOptions, domState);
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
	            isFixedRowHeight: this.modelManager.dimensionModel.get('isFixedRowHeight'),
	            controller: controller
	        });
	    },

	    /**
	     * Creates a view factory.
	     * @param {module:domState} domState - dom state
	     * @param {options} options - options
	     * @returns {module:view/factory}
	     * @private
	     */
	    _createViewFactory: function(domState, options) {
	        var viewOptions = _.pick(options, [
	            'singleClickEdit', 'resizeHandle', 'toolbar', 'copyOption', 'footer'
	        ]);
	        var dependencies = {
	            modelManager: this.modelManager,
	            painterManager: this.painterManager,
	            componentHolder: this.componentHolder,
	            domState: domState
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
	        emitter.listenToContainerView(this.container);

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
	     * Returns the rowKey of the currently selected row.
	     * @returns {(number|string)} - The rowKey of the row
	     */
	    getSelectedRowKey: function() {
	        return this.modelManager.focusModel.which().rowKey;
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
	     * @param {Array} rowList - A list of new rows
	     */
	    replaceRowList: function(rowList) {
	        this.modelManager.dataModel.replaceRowList(rowList);
	    },

	    /**
	     * Replace all rows with the specified list. This will change the original data.
	     * @param {Array} rowList - A list of new rows
	     * @param {function} callback - The function that will be called when done.
	     */
	    setRowList: function(rowList, callback) {
	        this.modelManager.dataModel.setRowList(rowList, true, callback);
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
	    readyForKeyControl: function() {
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
	        this.modelManager.dataModel.setRowList([]);
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
	        if (tui.util.isBoolean(options) && options) {
	            options = {
	                removeOriginalData: true
	            };
	        }
	        this.modelManager.dataModel.removeRow(rowKey, options);
	    },

	    /**
	     * Removes all checked rows.
	     * @param {boolean} isConfirm - If set to true, confirm message will be shown before remove.
	     * @returns {boolean} - True if there's at least one row removed.
	     */
	    removeCheckedRows: function(isConfirm) {
	        var rowKeyList = this.getCheckedRowKeyList(),
	            message = rowKeyList.length + '건의 데이터를 삭제하시겠습니까?';

	        if (rowKeyList.length > 0 && (!isConfirm || confirm(message))) {
	            _.each(rowKeyList, function(rowKey) {
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
	    getCheckedRowKeyList: function(isJsonString) {
	        var checkedRowList = this.modelManager.dataModel.getRowList(true);
	        var checkedRowKeyList = _.pluck(checkedRowList, 'rowKey');

	        return isJsonString ? JSON.stringify(checkedRowKeyList) : checkedRowKeyList;
	    },

	    /**
	     * Returns a list of the checked rows.
	     * @param {Boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
	     * @returns {Array|string} - A list of the checked rows. (or JSON string of the list)
	     */
	    getCheckedRowList: function(isJsonString) {
	        var checkedRowList = this.modelManager.dataModel.getRowList(true);

	        return isJsonString ? JSON.stringify(checkedRowList) : checkedRowList;
	    },

	    /**
	     * Returns a list of the column model.
	     * @returns {Array} - A list of the column model.
	     */
	    getColumnModelList: function() {
	        return this.modelManager.columnModel.get('dataColumnModelList');
	    },

	    /**
	     * Returns the object that contains the lists of changed data compared to the original data.
	     * The object has properties 'createList', 'updateList', 'deleteList'.
	     * @param {Object} [options] Options
	     *      @param {boolean} [options.isOnlyChecked=false] - If set to true, only checked rows will be considered.
	     *      @param {boolean} [options.isRaw=false] - If set to true, the data will contains
	     *          the row data for internal use.
	     *      @param {boolean} [options.isOnlyRowKeyList=false] - If set to true, only keys of the changed
	     *          rows will be returned.
	     *      @param {Array} [options.filteringColumnList] - A list of column name to be excluded.
	     * @returns {{createList: Array, updateList: Array, deleteList: Array}} - Object that contains the result list.
	     */
	    getModifiedRowList: function(options) {
	        return this.modelManager.dataModel.getModifiedRowList(options);
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
	     * Returns true if there are at least one row changed.
	     * @returns {boolean} - True if there are at least one row changed.
	     */
	    isChanged: function() {
	        return this.modelManager.dataModel.isChanged();
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
	     * (Original data is set by {@link tui.Grid#setRowList|setRowList}
	     */
	    restore: function() {
	        this.modelManager.dataModel.restore();
	    },

	    /**
	     * Selects the row identified by the rowKey.
	     * @param {(number|string)} rowKey - The unique key of the row
	     */
	    select: function(rowKey) {
	        var firstColumn = this.modelManager.columnModel.at(0, true);

	        this.modelManager.focusModel.focus(rowKey, firstColumn.columnName);
	    },

	    /**
	     * Unselects selected rows.
	     */
	    unselect: function() {
	        this.modelManager.focusModel.unselect(true);
	    },

	    /**
	     * Sets the count of fixed column.
	     * @param {number} count - The count of column to be fixed
	     */
	    setColumnFixCount: function(count) {
	        this.modelManager.columnModel.set('columnFixCount', count);
	    },

	    /**
	     * Sets the list of column model.
	     * @param {Array} columnModelList - A new list of column model
	     */
	    setColumnModelList: function(columnModelList) {
	        this.modelManager.columnModel.set('columnModelList', columnModelList);
	    },

	    /**
	     * Create an specified AddOn and use it on this instance.
	     * @param {string} name - The name of the AddOn to use.
	     * @param {object} options - The option objects for configuring the AddON.
	     * @returns {tui.Grid} - This instance.
	     */
	    use: function(name, options) {
	        if (name === 'Net') {
	            options = $.extend({
	                toolbarModel: this.modelManager.toolbarModel,
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
	    getRowList: function() {
	        return this.modelManager.dataModel.getRowList();
	    },

	    /**
	     * Sorts all rows by the specified column.
	     * @param {string} columnName - The name of the column to be used to compare the rows
	     * @param {boolean} [isAscending] - Whether the sort order is ascending.
	     *        If not specified, use the negative value of the current order.
	     */
	    sort: function(columnName, isAscending) {
	        this.modelManager.dataModel.sortByField(columnName, isAscending);
	    },

	    /**
	     * Unsorts all rows. (Sorts by rowKey).
	     */
	    unSort: function() {
	        this.sort('rowKey');
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
	     * Returns an instance of tui.component.Pagination.
	     * @returns {tui.component.Pagination}
	     */
	    getPagination: function() {
	        return this.componentHolder.getInstance('pagination');
	    },

	    /**
	     * Sets the number of rows to be shown in the table area.
	     * @deprecated
	     * @param {number} count - The number of rows
	     */
	    setDisplayRowCount: function(count) {
	        this.modelManager.dimensionModel.setBodyHeightWithRowCount(count);
	    },

	    /**
	     * Sets the width and height of the dimension.
	     * @param  {(number|null)} width - The width of the dimension
	     * @param  {(number|null)} height - The height of the dimension
	     */
	    setSize: function(width, height) {
	        this.modelManager.dimensionModel.setSize(width, height);
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
	        var args = tui.util.toArray(arguments);
	        this.modelManager.columnModel.setHidden(args, false);
	    },

	    /**
	     * Hide columns
	     * @param {...string} arguments - Column names to hide
	     */
	    hideColumn: function() {
	        var args = tui.util.toArray(arguments);
	        this.modelManager.columnModel.setHidden(args, true);
	    },

	    /**
	     * Sets the HTML string of given column footer.
	     * @param {string} columnName - column name
	     * @param {string} contents - HTML string
	     */
	    setFooterColumnContent: function(columnName, contents) {
	        this.modelManager.columnModel.setFooterContent(columnName, contents);
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
	 * @api
	 * @static
	 * @param  {number} id - ID of the target grid
	 * @returns {tui.Grid} - Grid instance
	 */
	tui.Grid.getInstanceById = function(id) {
	    return instanceMap[id];
	};

	/**
	 * Apply theme to all grid instances with the preset options of a given name.
	 * @api
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
	 *   @param {Object} [extOptions.toolbar] - Styles for a toolbar area.
	 *     @param {String} [extOptions.toolbar.background] - Background color of a toolbar area.
	 *     @param {String} [extOptions.toolbar.border] - Border color of a toolbar area.
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
	tui.Grid.applyTheme('striped', {
	    grid: {
	        border: '#aaa',
	        text: '#333'
	    },
	    cell: {
	        disabled: {
	            text: '#999'
	        }
	    }
	});
	 */
	tui.Grid.applyTheme = function(presetName, extOptions) {
	    themeManager.apply(presetName, extOptions);
	};


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.3
	//     http://underscorejs.org
	//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	(function() {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var
	    push             = ArrayProto.push,
	    slice            = ArrayProto.slice,
	    toString         = ObjProto.toString,
	    hasOwnProperty   = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind,
	    nativeCreate       = Object.create;

	  // Naked function reference for surrogate-prototype-swapping.
	  var Ctor = function(){};

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.8.3';

	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var optimizeCb = function(func, context, argCount) {
	    if (context === void 0) return func;
	    switch (argCount == null ? 3 : argCount) {
	      case 1: return function(value) {
	        return func.call(context, value);
	      };
	      case 2: return function(value, other) {
	        return func.call(context, value, other);
	      };
	      case 3: return function(value, index, collection) {
	        return func.call(context, value, index, collection);
	      };
	      case 4: return function(accumulator, value, index, collection) {
	        return func.call(context, accumulator, value, index, collection);
	      };
	    }
	    return function() {
	      return func.apply(context, arguments);
	    };
	  };

	  // A mostly-internal function to generate callbacks that can be applied
	  // to each element in a collection, returning the desired result — either
	  // identity, an arbitrary callback, a property matcher, or a property accessor.
	  var cb = function(value, context, argCount) {
	    if (value == null) return _.identity;
	    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
	    if (_.isObject(value)) return _.matcher(value);
	    return _.property(value);
	  };
	  _.iteratee = function(value, context) {
	    return cb(value, context, Infinity);
	  };

	  // An internal function for creating assigner functions.
	  var createAssigner = function(keysFunc, undefinedOnly) {
	    return function(obj) {
	      var length = arguments.length;
	      if (length < 2 || obj == null) return obj;
	      for (var index = 1; index < length; index++) {
	        var source = arguments[index],
	            keys = keysFunc(source),
	            l = keys.length;
	        for (var i = 0; i < l; i++) {
	          var key = keys[i];
	          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
	        }
	      }
	      return obj;
	    };
	  };

	  // An internal function for creating a new object that inherits from another.
	  var baseCreate = function(prototype) {
	    if (!_.isObject(prototype)) return {};
	    if (nativeCreate) return nativeCreate(prototype);
	    Ctor.prototype = prototype;
	    var result = new Ctor;
	    Ctor.prototype = null;
	    return result;
	  };

	  var property = function(key) {
	    return function(obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  };

	  // Helper for collection methods to determine whether a collection
	  // should be iterated as an array or as an object
	  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
	  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	  var getLength = property('length');
	  var isArrayLike = function(collection) {
	    var length = getLength(collection);
	    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	  };

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles raw objects in addition to array-likes. Treats all
	  // sparse array-likes as if they were dense.
	  _.each = _.forEach = function(obj, iteratee, context) {
	    iteratee = optimizeCb(iteratee, context);
	    var i, length;
	    if (isArrayLike(obj)) {
	      for (i = 0, length = obj.length; i < length; i++) {
	        iteratee(obj[i], i, obj);
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (i = 0, length = keys.length; i < length; i++) {
	        iteratee(obj[keys[i]], keys[i], obj);
	      }
	    }
	    return obj;
	  };

	  // Return the results of applying the iteratee to each element.
	  _.map = _.collect = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length,
	        results = Array(length);
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      results[index] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Create a reducing function iterating left or right.
	  function createReduce(dir) {
	    // Optimized iterator function as using arguments.length
	    // in the main function will deoptimize the, see #1991.
	    function iterator(obj, iteratee, memo, keys, index, length) {
	      for (; index >= 0 && index < length; index += dir) {
	        var currentKey = keys ? keys[index] : index;
	        memo = iteratee(memo, obj[currentKey], currentKey, obj);
	      }
	      return memo;
	    }

	    return function(obj, iteratee, memo, context) {
	      iteratee = optimizeCb(iteratee, context, 4);
	      var keys = !isArrayLike(obj) && _.keys(obj),
	          length = (keys || obj).length,
	          index = dir > 0 ? 0 : length - 1;
	      // Determine the initial value if none is provided.
	      if (arguments.length < 3) {
	        memo = obj[keys ? keys[index] : index];
	        index += dir;
	      }
	      return iterator(obj, iteratee, memo, keys, index, length);
	    };
	  }

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`.
	  _.reduce = _.foldl = _.inject = createReduce(1);

	  // The right-associative version of reduce, also known as `foldr`.
	  _.reduceRight = _.foldr = createReduce(-1);

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, predicate, context) {
	    var key;
	    if (isArrayLike(obj)) {
	      key = _.findIndex(obj, predicate, context);
	    } else {
	      key = _.findKey(obj, predicate, context);
	    }
	    if (key !== void 0 && key !== -1) return obj[key];
	  };

	  // Return all the elements that pass a truth test.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, predicate, context) {
	    var results = [];
	    predicate = cb(predicate, context);
	    _.each(obj, function(value, index, list) {
	      if (predicate(value, index, list)) results.push(value);
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, predicate, context) {
	    return _.filter(obj, _.negate(cb(predicate)), context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (!predicate(obj[currentKey], currentKey, obj)) return false;
	    }
	    return true;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Aliased as `any`.
	  _.some = _.any = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (predicate(obj[currentKey], currentKey, obj)) return true;
	    }
	    return false;
	  };

	  // Determine if the array or object contains a given item (using `===`).
	  // Aliased as `includes` and `include`.
	  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
	    if (!isArrayLike(obj)) obj = _.values(obj);
	    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
	    return _.indexOf(obj, item, fromIndex) >= 0;
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function(obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function(value) {
	      var func = isFunc ? method : value[method];
	      return func == null ? func : func.apply(value, args);
	    });
	  };

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, _.property(key));
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs) {
	    return _.filter(obj, _.matcher(attrs));
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.find(obj, _.matcher(attrs));
	  };

	  // Return the maximum element (or element-based computation).
	  _.max = function(obj, iteratee, context) {
	    var result = -Infinity, lastComputed = -Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value > result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iteratee, context) {
	    var result = Infinity, lastComputed = Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value < result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed < lastComputed || computed === Infinity && result === Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Shuffle a collection, using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  _.shuffle = function(obj) {
	    var set = isArrayLike(obj) ? obj : _.values(obj);
	    var length = set.length;
	    var shuffled = Array(length);
	    for (var index = 0, rand; index < length; index++) {
	      rand = _.random(0, index);
	      if (rand !== index) shuffled[index] = shuffled[rand];
	      shuffled[rand] = set[index];
	    }
	    return shuffled;
	  };

	  // Sample **n** random values from a collection.
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function(obj, n, guard) {
	    if (n == null || guard) {
	      if (!isArrayLike(obj)) obj = _.values(obj);
	      return obj[_.random(obj.length - 1)];
	    }
	    return _.shuffle(obj).slice(0, Math.max(0, n));
	  };

	  // Sort the object's values by a criterion produced by an iteratee.
	  _.sortBy = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    return _.pluck(_.map(obj, function(value, index, list) {
	      return {
	        value: value,
	        index: index,
	        criteria: iteratee(value, index, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function(behavior) {
	    return function(obj, iteratee, context) {
	      var result = {};
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index) {
	        var key = iteratee(value, index, obj);
	        behavior(result, value, key);
	      });
	      return result;
	    };
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
	  });

	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function(result, value, key) {
	    result[key] = value;
	  });

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key]++; else result[key] = 1;
	  });

	  // Safely create a real, live array from anything iterable.
	  _.toArray = function(obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (isArrayLike(obj)) return _.map(obj, _.identity);
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) return 0;
	    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	  };

	  // Split a collection into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var pass = [], fail = [];
	    _.each(obj, function(value, key, obj) {
	      (predicate(value, key, obj) ? pass : fail).push(value);
	    });
	    return [pass, fail];
	  };

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[0];
	    return _.initial(array, array.length - n);
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array.
	  _.last = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[array.length - 1];
	    return _.rest(array, Math.max(0, array.length - n));
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, n == null || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, _.identity);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, strict, startIndex) {
	    var output = [], idx = 0;
	    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
	      var value = input[i];
	      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
	        //flatten current level of array or arguments object
	        if (!shallow) value = flatten(value, shallow, strict);
	        var j = 0, len = value.length;
	        output.length += len;
	        while (j < len) {
	          output[idx++] = value[j++];
	        }
	      } else if (!strict) {
	        output[idx++] = value;
	      }
	    }
	    return output;
	  };

	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, false);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function(array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
	    if (!_.isBoolean(isSorted)) {
	      context = iteratee;
	      iteratee = isSorted;
	      isSorted = false;
	    }
	    if (iteratee != null) iteratee = cb(iteratee, context);
	    var result = [];
	    var seen = [];
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var value = array[i],
	          computed = iteratee ? iteratee(value, i, array) : value;
	      if (isSorted) {
	        if (!i || seen !== computed) result.push(value);
	        seen = computed;
	      } else if (iteratee) {
	        if (!_.contains(seen, computed)) {
	          seen.push(computed);
	          result.push(value);
	        }
	      } else if (!_.contains(result, value)) {
	        result.push(value);
	      }
	    }
	    return result;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function() {
	    return _.uniq(flatten(arguments, true, true));
	  };

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    var result = [];
	    var argsLength = arguments.length;
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var item = array[i];
	      if (_.contains(result, item)) continue;
	      for (var j = 1; j < argsLength; j++) {
	        if (!_.contains(arguments[j], item)) break;
	      }
	      if (j === argsLength) result.push(item);
	    }
	    return result;
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function(array) {
	    var rest = flatten(arguments, true, true, 1);
	    return _.filter(array, function(value){
	      return !_.contains(rest, value);
	    });
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function() {
	    return _.unzip(arguments);
	  };

	  // Complement of _.zip. Unzip accepts an array of arrays and groups
	  // each array's elements on shared indices
	  _.unzip = function(array) {
	    var length = array && _.max(array, getLength).length || 0;
	    var result = Array(length);

	    for (var index = 0; index < length; index++) {
	      result[index] = _.pluck(array, index);
	    }
	    return result;
	  };

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function(list, values) {
	    var result = {};
	    for (var i = 0, length = getLength(list); i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // Generator function to create the findIndex and findLastIndex functions
	  function createPredicateIndexFinder(dir) {
	    return function(array, predicate, context) {
	      predicate = cb(predicate, context);
	      var length = getLength(array);
	      var index = dir > 0 ? 0 : length - 1;
	      for (; index >= 0 && index < length; index += dir) {
	        if (predicate(array[index], index, array)) return index;
	      }
	      return -1;
	    };
	  }

	  // Returns the first index on an array-like that passes a predicate test
	  _.findIndex = createPredicateIndexFinder(1);
	  _.findLastIndex = createPredicateIndexFinder(-1);

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iteratee, context) {
	    iteratee = cb(iteratee, context, 1);
	    var value = iteratee(obj);
	    var low = 0, high = getLength(array);
	    while (low < high) {
	      var mid = Math.floor((low + high) / 2);
	      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
	    }
	    return low;
	  };

	  // Generator function to create the indexOf and lastIndexOf functions
	  function createIndexFinder(dir, predicateFind, sortedIndex) {
	    return function(array, item, idx) {
	      var i = 0, length = getLength(array);
	      if (typeof idx == 'number') {
	        if (dir > 0) {
	            i = idx >= 0 ? idx : Math.max(idx + length, i);
	        } else {
	            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
	        }
	      } else if (sortedIndex && idx && length) {
	        idx = sortedIndex(array, item);
	        return array[idx] === item ? idx : -1;
	      }
	      if (item !== item) {
	        idx = predicateFind(slice.call(array, i, length), _.isNaN);
	        return idx >= 0 ? idx + i : -1;
	      }
	      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
	        if (array[idx] === item) return idx;
	      }
	      return -1;
	    };
	  }

	  // Return the position of the first occurrence of an item in an array,
	  // or -1 if the item is not included in the array.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
	  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
	    if (stop == null) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = step || 1;

	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var range = Array(length);

	    for (var idx = 0; idx < length; idx++, start += step) {
	      range[idx] = start;
	    }

	    return range;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Determines whether to execute a function as a constructor
	  // or a normal function with the provided arguments
	  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
	    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	    var self = baseCreate(sourceFunc.prototype);
	    var result = sourceFunc.apply(self, args);
	    if (_.isObject(result)) return result;
	    return self;
	  };

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function(func, context) {
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
	    var args = slice.call(arguments, 2);
	    var bound = function() {
	      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
	    };
	    return bound;
	  };

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder, allowing any combination of arguments to be pre-filled.
	  _.partial = function(func) {
	    var boundArgs = slice.call(arguments, 1);
	    var bound = function() {
	      var position = 0, length = boundArgs.length;
	      var args = Array(length);
	      for (var i = 0; i < length; i++) {
	        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return executeBound(func, bound, this, this, args);
	    };
	    return bound;
	  };

	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = function(obj) {
	    var i, length = arguments.length, key;
	    if (length <= 1) throw new Error('bindAll must be passed function names');
	    for (i = 1; i < length; i++) {
	      key = arguments[i];
	      obj[key] = _.bind(obj[key], obj);
	    }
	    return obj;
	  };

	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memoize = function(key) {
	      var cache = memoize.cache;
	      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
	      return cache[address];
	    };
	    memoize.cache = {};
	    return memoize;
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function(func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function(){
	      return func.apply(null, args);
	    }, wait);
	  };

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = _.partial(_.delay, _, 1);

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function(func, wait, options) {
	    var context, args, result;
	    var timeout = null;
	    var previous = 0;
	    if (!options) options = {};
	    var later = function() {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    };
	    return function() {
	      var now = _.now();
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0 || remaining > wait) {
	        if (timeout) {
	          clearTimeout(timeout);
	          timeout = null;
	        }
	        previous = now;
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;

	    var later = function() {
	      var last = _.now() - timestamp;

	      if (last < wait && last >= 0) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          if (!timeout) context = args = null;
	        }
	      }
	    };

	    return function() {
	      context = this;
	      args = arguments;
	      timestamp = _.now();
	      var callNow = immediate && !timeout;
	      if (!timeout) timeout = setTimeout(later, wait);
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }

	      return result;
	    };
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return _.partial(wrapper, func);
	  };

	  // Returns a negated version of the passed-in predicate.
	  _.negate = function(predicate) {
	    return function() {
	      return !predicate.apply(this, arguments);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var args = arguments;
	    var start = args.length - 1;
	    return function() {
	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) result = args[i].call(this, result);
	      return result;
	    };
	  };

	  // Returns a function that will only be executed on and after the Nth call.
	  _.after = function(times, func) {
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Returns a function that will only be executed up to (but not including) the Nth call.
	  _.before = function(times, func) {
	    var memo;
	    return function() {
	      if (--times > 0) {
	        memo = func.apply(this, arguments);
	      }
	      if (times <= 1) func = null;
	      return memo;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = _.partial(_.before, 2);

	  // Object Functions
	  // ----------------

	  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
	                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	  function collectNonEnumProps(obj, keys) {
	    var nonEnumIdx = nonEnumerableProps.length;
	    var constructor = obj.constructor;
	    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

	    // Constructor is a special case.
	    var prop = 'constructor';
	    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

	    while (nonEnumIdx--) {
	      prop = nonEnumerableProps[nonEnumIdx];
	      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
	        keys.push(prop);
	      }
	    }
	  }

	  // Retrieve the names of an object's own properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    if (nativeKeys) return nativeKeys(obj);
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve all the property names of an object.
	  _.allKeys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };

	  // Returns the results of applying the iteratee to each element of the object
	  // In contrast to _.map it returns an object
	  _.mapObject = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys =  _.keys(obj),
	          length = keys.length,
	          results = {},
	          currentKey;
	      for (var index = 0; index < length; index++) {
	        currentKey = keys[index];
	        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	      }
	      return results;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = createAssigner(_.allKeys);

	  // Assigns a given object with all the own properties in the passed-in object(s)
	  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	  _.extendOwn = _.assign = createAssigner(_.keys);

	  // Returns the first key on an object that passes a predicate test
	  _.findKey = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = _.keys(obj), key;
	    for (var i = 0, length = keys.length; i < length; i++) {
	      key = keys[i];
	      if (predicate(obj[key], key, obj)) return key;
	    }
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function(object, oiteratee, context) {
	    var result = {}, obj = object, iteratee, keys;
	    if (obj == null) return result;
	    if (_.isFunction(oiteratee)) {
	      keys = _.allKeys(obj);
	      iteratee = optimizeCb(oiteratee, context);
	    } else {
	      keys = flatten(arguments, false, false, 1);
	      iteratee = function(value, key, obj) { return key in obj; };
	      obj = Object(obj);
	    }
	    for (var i = 0, length = keys.length; i < length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      if (iteratee(value, key, obj)) result[key] = value;
	    }
	    return result;
	  };

	   // Return a copy of the object without the blacklisted properties.
	  _.omit = function(obj, iteratee, context) {
	    if (_.isFunction(iteratee)) {
	      iteratee = _.negate(iteratee);
	    } else {
	      var keys = _.map(flatten(arguments, false, false, 1), String);
	      iteratee = function(value, key) {
	        return !_.contains(keys, key);
	      };
	    }
	    return _.pick(obj, iteratee, context);
	  };

	  // Fill in a given object with default properties.
	  _.defaults = createAssigner(_.allKeys, true);

	  // Creates an object that inherits from the given prototype object.
	  // If additional properties are provided then they will be added to the
	  // created object.
	  _.create = function(prototype, props) {
	    var result = baseCreate(prototype);
	    if (props) _.extendOwn(result, props);
	    return result;
	  };

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Returns whether an object has a given set of `key:value` pairs.
	  _.isMatch = function(object, attrs) {
	    var keys = _.keys(attrs), length = keys.length;
	    if (object == null) return !length;
	    var obj = Object(object);
	    for (var i = 0; i < length; i++) {
	      var key = keys[i];
	      if (attrs[key] !== obj[key] || !(key in obj)) return false;
	    }
	    return true;
	  };


	  // Internal recursive comparison function for `isEqual`.
	  var eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a === 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	      case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return '' + a === '' + b;
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN
	        if (+a !== +a) return +b !== +b;
	        // An `egal` comparison is performed for other numeric values.
	        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a === +b;
	    }

	    var areArrays = className === '[object Array]';
	    if (!areArrays) {
	      if (typeof a != 'object' || typeof b != 'object') return false;

	      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	      // from different frames are.
	      var aCtor = a.constructor, bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
	                               _.isFunction(bCtor) && bCtor instanceof bCtor)
	                          && ('constructor' in a && 'constructor' in b)) {
	        return false;
	      }
	    }
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

	    // Initializing stack of traversed objects.
	    // It's done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] === a) return bStack[length] === b;
	    }

	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);

	    // Recursively compare objects and arrays.
	    if (areArrays) {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      length = a.length;
	      if (length !== b.length) return false;
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (length--) {
	        if (!eq(a[length], b[length], aStack, bStack)) return false;
	      }
	    } else {
	      // Deep compare objects.
	      var keys = _.keys(a), key;
	      length = keys.length;
	      // Ensure that both objects contain the same number of properties before comparing deep equality.
	      if (_.keys(b).length !== length) return false;
	      while (length--) {
	        // Deep compare each member
	        key = keys[length];
	        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return true;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) return true;
	    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
	    return _.keys(obj).length === 0;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) === '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
	  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) === '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE < 9), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return _.has(obj, 'callee');
	    };
	  }

	  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	  // IE 11 (#1621), and in Safari 8 (#1929).
	  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
	    _.isFunction = function(obj) {
	      return typeof obj == 'function' || false;
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && obj !== +obj;
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, key) {
	    return obj != null && hasOwnProperty.call(obj, key);
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iteratees.
	  _.identity = function(value) {
	    return value;
	  };

	  // Predicate-generating functions. Often useful outside of Underscore.
	  _.constant = function(value) {
	    return function() {
	      return value;
	    };
	  };

	  _.noop = function(){};

	  _.property = property;

	  // Generates a function for a given object that returns a given property.
	  _.propertyOf = function(obj) {
	    return obj == null ? function(){} : function(key) {
	      return obj[key];
	    };
	  };

	  // Returns a predicate for checking whether an object has a given set of
	  // `key:value` pairs.
	  _.matcher = _.matches = function(attrs) {
	    attrs = _.extendOwn({}, attrs);
	    return function(obj) {
	      return _.isMatch(obj, attrs);
	    };
	  };

	  // Run a function **n** times.
	  _.times = function(n, iteratee, context) {
	    var accum = Array(Math.max(0, n));
	    iteratee = optimizeCb(iteratee, context, 1);
	    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function() {
	    return new Date().getTime();
	  };

	   // List of HTML entities for escaping.
	  var escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#x27;',
	    '`': '&#x60;'
	  };
	  var unescapeMap = _.invert(escapeMap);

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function(map) {
	    var escaper = function(match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped
	    var source = '(?:' + _.keys(map).join('|') + ')';
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, 'g');
	    return function(string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  };
	  _.escape = createEscaper(escapeMap);
	  _.unescape = createEscaper(unescapeMap);

	  // If the value of the named `property` is a function then invoke it with the
	  // `object` as context; otherwise, return it.
	  _.result = function(object, property, fallback) {
	    var value = object == null ? void 0 : object[property];
	    if (value === void 0) {
	      value = fallback;
	    }
	    return _.isFunction(value) ? value.call(object) : value;
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate    : /<%([\s\S]+?)%>/g,
	    interpolate : /<%=([\s\S]+?)%>/g,
	    escape      : /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'":      "'",
	    '\\':     '\\',
	    '\r':     'r',
	    '\n':     'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	  var escapeChar = function(match) {
	    return '\\' + escapes[match];
	  };

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function(text, settings, oldSettings) {
	    if (!settings && oldSettings) settings = oldSettings;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escaper, escapeChar);
	      index = offset + match.length;

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }

	      // Adobe VMs need the match returned to produce the correct offest.
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + 'return __p;\n';

	    try {
	      var render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    var template = function(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function. Start chaining a wrapped Underscore object.
	  _.chain = function(obj) {
	    var instance = _(obj);
	    instance._chain = true;
	    return instance;
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var result = function(instance, obj) {
	    return instance._chain ? _(obj).chain() : obj;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    _.each(_.functions(obj), function(name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result(this, func.apply(_, args));
	      };
	    });
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
	      return result(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  _.each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return result(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  // Extracts the result from a wrapped and chained object.
	  _.prototype.value = function() {
	    return this._wrapped;
	  };

	  // Provide unwrapping proxy for some methods used in engine operations
	  // such as arithmetic and JSON stringification.
	  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

	  _.prototype.toString = function() {
	    return '' + this._wrapped;
	  };

	  // AMD registration happens at the end for compatibility with AMD loaders
	  // that may not enforce next-turn semantics on modules. Even though general
	  // practice for AMD registration is to be anonymous, underscore registers
	  // as a named module because, like jQuery, it is a base library that is
	  // popular enough to be bundled in a third party lib, but not be part of
	  // an AMD load request. Those cases could generate an error when an
	  // anonymous define() is called outside of a loader request.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}.call(this));


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Base class for Views
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);
	var Backbone = __webpack_require__(3);

	var common = __webpack_require__(5);

	/**
	 * Base class for Views
	 * @module base/view
	 * @mixes module:base/common
	 * @ignore
	 */
	var View = Backbone.View.extend(/**@lends module:base/view.prototype */{
	    initialize: function() {
	        this._children = [];
	    },

	    /**
	     * 에러 객체를 반환한다.
	     * @param {String} message - Error message
	     * @returns {error} 에러객체
	     */
	    error: function(message) {
	        var GridError = function() {
	            this.name = 'Grid Exception';
	            this.message = message || 'error';
	        };
	        GridError.prototype = new Error();

	        return new GridError();
	    },

	    /**
	     * Add children views
	     * @param {(Object|Array)} views - View instance of Array of view instances
	     * @private
	     */
	    _addChildren: function(views) {
	        if (!_.isArray(views)) {
	            views = [views];
	        }
	        [].push.apply(this._children, _.compact(views));
	    },

	    /**
	     * Render children and returns thier elements as array.
	     * @returns {array.<HTMLElement>} An array of element of children
	     */
	    _renderChildren: function() {
	        var elements = _.map(this._children, function(view) {
	            return view.render().el;
	        });

	        return elements;
	    },

	    /**
	     * Trigger 'appended' event on child view.
	     * @private
	     */
	    _triggerChildrenAppended: function() {
	        _.each(this._children, function(view) {
	            view.trigger('appended');
	        });
	    },

	    /**
	     * 자식 View를 제거한 뒤 자신도 제거한다.
	     */
	    destroy: function() {
	        this.stopListening();
	        this._destroyChildren();
	        this.remove();
	    },

	    /**
	     * 등록되어있는 자식 View 들을 제거한다.
	     */
	    _destroyChildren: function() {
	        if (this._children) {
	            while (this._children.length > 0) {
	                this._children.pop().destroy();
	            }
	        }
	    }
	});

	_.assign(View.prototype, common);

	module.exports = View;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(global) {//     Backbone.js 1.3.3

	//     (c) 2010-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Backbone may be freely distributed under the MIT license.
	//     For all details and documentation:
	//     http://backbonejs.org

	(function(factory) {

	  // Establish the root object, `window` (`self`) in the browser, or `global` on the server.
	  // We use `self` instead of `window` for `WebWorker` support.
	  var root = (typeof self == 'object' && self.self === self && self) ||
	            (typeof global == 'object' && global.global === global && global);

	  // Set up Backbone appropriately for the environment. Start with AMD.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1), __webpack_require__(4), exports], __WEBPACK_AMD_DEFINE_RESULT__ = function(_, $, exports) {
	      // Export global even in AMD case in case this script is loaded with
	      // others that may still expect a global Backbone.
	      root.Backbone = factory(root, exports, _, $);
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

	  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
	  } else if (typeof exports !== 'undefined') {
	    var _ = require('underscore'), $;
	    try { $ = require('jquery'); } catch (e) {}
	    factory(root, exports, _, $);

	  // Finally, as a browser global.
	  } else {
	    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
	  }

	})(function(root, Backbone, _, $) {

	  // Initial Setup
	  // -------------

	  // Save the previous value of the `Backbone` variable, so that it can be
	  // restored later on, if `noConflict` is used.
	  var previousBackbone = root.Backbone;

	  // Create a local reference to a common array method we'll want to use later.
	  var slice = Array.prototype.slice;

	  // Current version of the library. Keep in sync with `package.json`.
	  Backbone.VERSION = '1.3.3';

	  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
	  // the `$` variable.
	  Backbone.$ = $;

	  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
	  // to its previous owner. Returns a reference to this Backbone object.
	  Backbone.noConflict = function() {
	    root.Backbone = previousBackbone;
	    return this;
	  };

	  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
	  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
	  // set a `X-Http-Method-Override` header.
	  Backbone.emulateHTTP = false;

	  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
	  // `application/json` requests ... this will encode the body as
	  // `application/x-www-form-urlencoded` instead and will send the model in a
	  // form param named `model`.
	  Backbone.emulateJSON = false;

	  // Proxy Backbone class methods to Underscore functions, wrapping the model's
	  // `attributes` object or collection's `models` array behind the scenes.
	  //
	  // collection.filter(function(model) { return model.get('age') > 10 });
	  // collection.each(this.addView);
	  //
	  // `Function#apply` can be slow so we use the method's arg count, if we know it.
	  var addMethod = function(length, method, attribute) {
	    switch (length) {
	      case 1: return function() {
	        return _[method](this[attribute]);
	      };
	      case 2: return function(value) {
	        return _[method](this[attribute], value);
	      };
	      case 3: return function(iteratee, context) {
	        return _[method](this[attribute], cb(iteratee, this), context);
	      };
	      case 4: return function(iteratee, defaultVal, context) {
	        return _[method](this[attribute], cb(iteratee, this), defaultVal, context);
	      };
	      default: return function() {
	        var args = slice.call(arguments);
	        args.unshift(this[attribute]);
	        return _[method].apply(_, args);
	      };
	    }
	  };
	  var addUnderscoreMethods = function(Class, methods, attribute) {
	    _.each(methods, function(length, method) {
	      if (_[method]) Class.prototype[method] = addMethod(length, method, attribute);
	    });
	  };

	  // Support `collection.sortBy('attr')` and `collection.findWhere({id: 1})`.
	  var cb = function(iteratee, instance) {
	    if (_.isFunction(iteratee)) return iteratee;
	    if (_.isObject(iteratee) && !instance._isModel(iteratee)) return modelMatcher(iteratee);
	    if (_.isString(iteratee)) return function(model) { return model.get(iteratee); };
	    return iteratee;
	  };
	  var modelMatcher = function(attrs) {
	    var matcher = _.matches(attrs);
	    return function(model) {
	      return matcher(model.attributes);
	    };
	  };

	  // Backbone.Events
	  // ---------------

	  // A module that can be mixed in to *any object* in order to provide it with
	  // a custom event channel. You may bind a callback to an event with `on` or
	  // remove with `off`; `trigger`-ing an event fires all callbacks in
	  // succession.
	  //
	  //     var object = {};
	  //     _.extend(object, Backbone.Events);
	  //     object.on('expand', function(){ alert('expanded'); });
	  //     object.trigger('expand');
	  //
	  var Events = Backbone.Events = {};

	  // Regular expression used to split event strings.
	  var eventSplitter = /\s+/;

	  // Iterates over the standard `event, callback` (as well as the fancy multiple
	  // space-separated events `"change blur", callback` and jQuery-style event
	  // maps `{event: callback}`).
	  var eventsApi = function(iteratee, events, name, callback, opts) {
	    var i = 0, names;
	    if (name && typeof name === 'object') {
	      // Handle event maps.
	      if (callback !== void 0 && 'context' in opts && opts.context === void 0) opts.context = callback;
	      for (names = _.keys(name); i < names.length ; i++) {
	        events = eventsApi(iteratee, events, names[i], name[names[i]], opts);
	      }
	    } else if (name && eventSplitter.test(name)) {
	      // Handle space-separated event names by delegating them individually.
	      for (names = name.split(eventSplitter); i < names.length; i++) {
	        events = iteratee(events, names[i], callback, opts);
	      }
	    } else {
	      // Finally, standard events.
	      events = iteratee(events, name, callback, opts);
	    }
	    return events;
	  };

	  // Bind an event to a `callback` function. Passing `"all"` will bind
	  // the callback to all events fired.
	  Events.on = function(name, callback, context) {
	    return internalOn(this, name, callback, context);
	  };

	  // Guard the `listening` argument from the public API.
	  var internalOn = function(obj, name, callback, context, listening) {
	    obj._events = eventsApi(onApi, obj._events || {}, name, callback, {
	      context: context,
	      ctx: obj,
	      listening: listening
	    });

	    if (listening) {
	      var listeners = obj._listeners || (obj._listeners = {});
	      listeners[listening.id] = listening;
	    }

	    return obj;
	  };

	  // Inversion-of-control versions of `on`. Tell *this* object to listen to
	  // an event in another object... keeping track of what it's listening to
	  // for easier unbinding later.
	  Events.listenTo = function(obj, name, callback) {
	    if (!obj) return this;
	    var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
	    var listeningTo = this._listeningTo || (this._listeningTo = {});
	    var listening = listeningTo[id];

	    // This object is not listening to any other events on `obj` yet.
	    // Setup the necessary references to track the listening callbacks.
	    if (!listening) {
	      var thisId = this._listenId || (this._listenId = _.uniqueId('l'));
	      listening = listeningTo[id] = {obj: obj, objId: id, id: thisId, listeningTo: listeningTo, count: 0};
	    }

	    // Bind callbacks on obj, and keep track of them on listening.
	    internalOn(obj, name, callback, this, listening);
	    return this;
	  };

	  // The reducing API that adds a callback to the `events` object.
	  var onApi = function(events, name, callback, options) {
	    if (callback) {
	      var handlers = events[name] || (events[name] = []);
	      var context = options.context, ctx = options.ctx, listening = options.listening;
	      if (listening) listening.count++;

	      handlers.push({callback: callback, context: context, ctx: context || ctx, listening: listening});
	    }
	    return events;
	  };

	  // Remove one or many callbacks. If `context` is null, removes all
	  // callbacks with that function. If `callback` is null, removes all
	  // callbacks for the event. If `name` is null, removes all bound
	  // callbacks for all events.
	  Events.off = function(name, callback, context) {
	    if (!this._events) return this;
	    this._events = eventsApi(offApi, this._events, name, callback, {
	      context: context,
	      listeners: this._listeners
	    });
	    return this;
	  };

	  // Tell this object to stop listening to either specific events ... or
	  // to every object it's currently listening to.
	  Events.stopListening = function(obj, name, callback) {
	    var listeningTo = this._listeningTo;
	    if (!listeningTo) return this;

	    var ids = obj ? [obj._listenId] : _.keys(listeningTo);

	    for (var i = 0; i < ids.length; i++) {
	      var listening = listeningTo[ids[i]];

	      // If listening doesn't exist, this object is not currently
	      // listening to obj. Break out early.
	      if (!listening) break;

	      listening.obj.off(name, callback, this);
	    }

	    return this;
	  };

	  // The reducing API that removes a callback from the `events` object.
	  var offApi = function(events, name, callback, options) {
	    if (!events) return;

	    var i = 0, listening;
	    var context = options.context, listeners = options.listeners;

	    // Delete all events listeners and "drop" events.
	    if (!name && !callback && !context) {
	      var ids = _.keys(listeners);
	      for (; i < ids.length; i++) {
	        listening = listeners[ids[i]];
	        delete listeners[listening.id];
	        delete listening.listeningTo[listening.objId];
	      }
	      return;
	    }

	    var names = name ? [name] : _.keys(events);
	    for (; i < names.length; i++) {
	      name = names[i];
	      var handlers = events[name];

	      // Bail out if there are no events stored.
	      if (!handlers) break;

	      // Replace events if there are any remaining.  Otherwise, clean up.
	      var remaining = [];
	      for (var j = 0; j < handlers.length; j++) {
	        var handler = handlers[j];
	        if (
	          callback && callback !== handler.callback &&
	            callback !== handler.callback._callback ||
	              context && context !== handler.context
	        ) {
	          remaining.push(handler);
	        } else {
	          listening = handler.listening;
	          if (listening && --listening.count === 0) {
	            delete listeners[listening.id];
	            delete listening.listeningTo[listening.objId];
	          }
	        }
	      }

	      // Update tail event if the list has any events.  Otherwise, clean up.
	      if (remaining.length) {
	        events[name] = remaining;
	      } else {
	        delete events[name];
	      }
	    }
	    return events;
	  };

	  // Bind an event to only be triggered a single time. After the first time
	  // the callback is invoked, its listener will be removed. If multiple events
	  // are passed in using the space-separated syntax, the handler will fire
	  // once for each event, not once for a combination of all events.
	  Events.once = function(name, callback, context) {
	    // Map the event into a `{event: once}` object.
	    var events = eventsApi(onceMap, {}, name, callback, _.bind(this.off, this));
	    if (typeof name === 'string' && context == null) callback = void 0;
	    return this.on(events, callback, context);
	  };

	  // Inversion-of-control versions of `once`.
	  Events.listenToOnce = function(obj, name, callback) {
	    // Map the event into a `{event: once}` object.
	    var events = eventsApi(onceMap, {}, name, callback, _.bind(this.stopListening, this, obj));
	    return this.listenTo(obj, events);
	  };

	  // Reduces the event callbacks into a map of `{event: onceWrapper}`.
	  // `offer` unbinds the `onceWrapper` after it has been called.
	  var onceMap = function(map, name, callback, offer) {
	    if (callback) {
	      var once = map[name] = _.once(function() {
	        offer(name, once);
	        callback.apply(this, arguments);
	      });
	      once._callback = callback;
	    }
	    return map;
	  };

	  // Trigger one or many events, firing all bound callbacks. Callbacks are
	  // passed the same arguments as `trigger` is, apart from the event name
	  // (unless you're listening on `"all"`, which will cause your callback to
	  // receive the true name of the event as the first argument).
	  Events.trigger = function(name) {
	    if (!this._events) return this;

	    var length = Math.max(0, arguments.length - 1);
	    var args = Array(length);
	    for (var i = 0; i < length; i++) args[i] = arguments[i + 1];

	    eventsApi(triggerApi, this._events, name, void 0, args);
	    return this;
	  };

	  // Handles triggering the appropriate event callbacks.
	  var triggerApi = function(objEvents, name, callback, args) {
	    if (objEvents) {
	      var events = objEvents[name];
	      var allEvents = objEvents.all;
	      if (events && allEvents) allEvents = allEvents.slice();
	      if (events) triggerEvents(events, args);
	      if (allEvents) triggerEvents(allEvents, [name].concat(args));
	    }
	    return objEvents;
	  };

	  // A difficult-to-believe, but optimized internal dispatch function for
	  // triggering events. Tries to keep the usual cases speedy (most internal
	  // Backbone events have 3 arguments).
	  var triggerEvents = function(events, args) {
	    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
	    switch (args.length) {
	      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
	      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
	      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
	      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
	      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
	    }
	  };

	  // Aliases for backwards compatibility.
	  Events.bind   = Events.on;
	  Events.unbind = Events.off;

	  // Allow the `Backbone` object to serve as a global event bus, for folks who
	  // want global "pubsub" in a convenient place.
	  _.extend(Backbone, Events);

	  // Backbone.Model
	  // --------------

	  // Backbone **Models** are the basic data object in the framework --
	  // frequently representing a row in a table in a database on your server.
	  // A discrete chunk of data and a bunch of useful, related methods for
	  // performing computations and transformations on that data.

	  // Create a new model with the specified attributes. A client id (`cid`)
	  // is automatically generated and assigned for you.
	  var Model = Backbone.Model = function(attributes, options) {
	    var attrs = attributes || {};
	    options || (options = {});
	    this.cid = _.uniqueId(this.cidPrefix);
	    this.attributes = {};
	    if (options.collection) this.collection = options.collection;
	    if (options.parse) attrs = this.parse(attrs, options) || {};
	    var defaults = _.result(this, 'defaults');
	    attrs = _.defaults(_.extend({}, defaults, attrs), defaults);
	    this.set(attrs, options);
	    this.changed = {};
	    this.initialize.apply(this, arguments);
	  };

	  // Attach all inheritable methods to the Model prototype.
	  _.extend(Model.prototype, Events, {

	    // A hash of attributes whose current and previous value differ.
	    changed: null,

	    // The value returned during the last failed validation.
	    validationError: null,

	    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
	    // CouchDB users may want to set this to `"_id"`.
	    idAttribute: 'id',

	    // The prefix is used to create the client id which is used to identify models locally.
	    // You may want to override this if you're experiencing name clashes with model ids.
	    cidPrefix: 'c',

	    // Initialize is an empty function by default. Override it with your own
	    // initialization logic.
	    initialize: function(){},

	    // Return a copy of the model's `attributes` object.
	    toJSON: function(options) {
	      return _.clone(this.attributes);
	    },

	    // Proxy `Backbone.sync` by default -- but override this if you need
	    // custom syncing semantics for *this* particular model.
	    sync: function() {
	      return Backbone.sync.apply(this, arguments);
	    },

	    // Get the value of an attribute.
	    get: function(attr) {
	      return this.attributes[attr];
	    },

	    // Get the HTML-escaped value of an attribute.
	    escape: function(attr) {
	      return _.escape(this.get(attr));
	    },

	    // Returns `true` if the attribute contains a value that is not null
	    // or undefined.
	    has: function(attr) {
	      return this.get(attr) != null;
	    },

	    // Special-cased proxy to underscore's `_.matches` method.
	    matches: function(attrs) {
	      return !!_.iteratee(attrs, this)(this.attributes);
	    },

	    // Set a hash of model attributes on the object, firing `"change"`. This is
	    // the core primitive operation of a model, updating the data and notifying
	    // anyone who needs to know about the change in state. The heart of the beast.
	    set: function(key, val, options) {
	      if (key == null) return this;

	      // Handle both `"key", value` and `{key: value}` -style arguments.
	      var attrs;
	      if (typeof key === 'object') {
	        attrs = key;
	        options = val;
	      } else {
	        (attrs = {})[key] = val;
	      }

	      options || (options = {});

	      // Run validation.
	      if (!this._validate(attrs, options)) return false;

	      // Extract attributes and options.
	      var unset      = options.unset;
	      var silent     = options.silent;
	      var changes    = [];
	      var changing   = this._changing;
	      this._changing = true;

	      if (!changing) {
	        this._previousAttributes = _.clone(this.attributes);
	        this.changed = {};
	      }

	      var current = this.attributes;
	      var changed = this.changed;
	      var prev    = this._previousAttributes;

	      // For each `set` attribute, update or delete the current value.
	      for (var attr in attrs) {
	        val = attrs[attr];
	        if (!_.isEqual(current[attr], val)) changes.push(attr);
	        if (!_.isEqual(prev[attr], val)) {
	          changed[attr] = val;
	        } else {
	          delete changed[attr];
	        }
	        unset ? delete current[attr] : current[attr] = val;
	      }

	      // Update the `id`.
	      if (this.idAttribute in attrs) this.id = this.get(this.idAttribute);

	      // Trigger all relevant attribute changes.
	      if (!silent) {
	        if (changes.length) this._pending = options;
	        for (var i = 0; i < changes.length; i++) {
	          this.trigger('change:' + changes[i], this, current[changes[i]], options);
	        }
	      }

	      // You might be wondering why there's a `while` loop here. Changes can
	      // be recursively nested within `"change"` events.
	      if (changing) return this;
	      if (!silent) {
	        while (this._pending) {
	          options = this._pending;
	          this._pending = false;
	          this.trigger('change', this, options);
	        }
	      }
	      this._pending = false;
	      this._changing = false;
	      return this;
	    },

	    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
	    // if the attribute doesn't exist.
	    unset: function(attr, options) {
	      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
	    },

	    // Clear all attributes on the model, firing `"change"`.
	    clear: function(options) {
	      var attrs = {};
	      for (var key in this.attributes) attrs[key] = void 0;
	      return this.set(attrs, _.extend({}, options, {unset: true}));
	    },

	    // Determine if the model has changed since the last `"change"` event.
	    // If you specify an attribute name, determine if that attribute has changed.
	    hasChanged: function(attr) {
	      if (attr == null) return !_.isEmpty(this.changed);
	      return _.has(this.changed, attr);
	    },

	    // Return an object containing all the attributes that have changed, or
	    // false if there are no changed attributes. Useful for determining what
	    // parts of a view need to be updated and/or what attributes need to be
	    // persisted to the server. Unset attributes will be set to undefined.
	    // You can also pass an attributes object to diff against the model,
	    // determining if there *would be* a change.
	    changedAttributes: function(diff) {
	      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
	      var old = this._changing ? this._previousAttributes : this.attributes;
	      var changed = {};
	      for (var attr in diff) {
	        var val = diff[attr];
	        if (_.isEqual(old[attr], val)) continue;
	        changed[attr] = val;
	      }
	      return _.size(changed) ? changed : false;
	    },

	    // Get the previous value of an attribute, recorded at the time the last
	    // `"change"` event was fired.
	    previous: function(attr) {
	      if (attr == null || !this._previousAttributes) return null;
	      return this._previousAttributes[attr];
	    },

	    // Get all of the attributes of the model at the time of the previous
	    // `"change"` event.
	    previousAttributes: function() {
	      return _.clone(this._previousAttributes);
	    },

	    // Fetch the model from the server, merging the response with the model's
	    // local attributes. Any changed attributes will trigger a "change" event.
	    fetch: function(options) {
	      options = _.extend({parse: true}, options);
	      var model = this;
	      var success = options.success;
	      options.success = function(resp) {
	        var serverAttrs = options.parse ? model.parse(resp, options) : resp;
	        if (!model.set(serverAttrs, options)) return false;
	        if (success) success.call(options.context, model, resp, options);
	        model.trigger('sync', model, resp, options);
	      };
	      wrapError(this, options);
	      return this.sync('read', this, options);
	    },

	    // Set a hash of model attributes, and sync the model to the server.
	    // If the server returns an attributes hash that differs, the model's
	    // state will be `set` again.
	    save: function(key, val, options) {
	      // Handle both `"key", value` and `{key: value}` -style arguments.
	      var attrs;
	      if (key == null || typeof key === 'object') {
	        attrs = key;
	        options = val;
	      } else {
	        (attrs = {})[key] = val;
	      }

	      options = _.extend({validate: true, parse: true}, options);
	      var wait = options.wait;

	      // If we're not waiting and attributes exist, save acts as
	      // `set(attr).save(null, opts)` with validation. Otherwise, check if
	      // the model will be valid when the attributes, if any, are set.
	      if (attrs && !wait) {
	        if (!this.set(attrs, options)) return false;
	      } else if (!this._validate(attrs, options)) {
	        return false;
	      }

	      // After a successful server-side save, the client is (optionally)
	      // updated with the server-side state.
	      var model = this;
	      var success = options.success;
	      var attributes = this.attributes;
	      options.success = function(resp) {
	        // Ensure attributes are restored during synchronous saves.
	        model.attributes = attributes;
	        var serverAttrs = options.parse ? model.parse(resp, options) : resp;
	        if (wait) serverAttrs = _.extend({}, attrs, serverAttrs);
	        if (serverAttrs && !model.set(serverAttrs, options)) return false;
	        if (success) success.call(options.context, model, resp, options);
	        model.trigger('sync', model, resp, options);
	      };
	      wrapError(this, options);

	      // Set temporary attributes if `{wait: true}` to properly find new ids.
	      if (attrs && wait) this.attributes = _.extend({}, attributes, attrs);

	      var method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
	      if (method === 'patch' && !options.attrs) options.attrs = attrs;
	      var xhr = this.sync(method, this, options);

	      // Restore attributes.
	      this.attributes = attributes;

	      return xhr;
	    },

	    // Destroy this model on the server if it was already persisted.
	    // Optimistically removes the model from its collection, if it has one.
	    // If `wait: true` is passed, waits for the server to respond before removal.
	    destroy: function(options) {
	      options = options ? _.clone(options) : {};
	      var model = this;
	      var success = options.success;
	      var wait = options.wait;

	      var destroy = function() {
	        model.stopListening();
	        model.trigger('destroy', model, model.collection, options);
	      };

	      options.success = function(resp) {
	        if (wait) destroy();
	        if (success) success.call(options.context, model, resp, options);
	        if (!model.isNew()) model.trigger('sync', model, resp, options);
	      };

	      var xhr = false;
	      if (this.isNew()) {
	        _.defer(options.success);
	      } else {
	        wrapError(this, options);
	        xhr = this.sync('delete', this, options);
	      }
	      if (!wait) destroy();
	      return xhr;
	    },

	    // Default URL for the model's representation on the server -- if you're
	    // using Backbone's restful methods, override this to change the endpoint
	    // that will be called.
	    url: function() {
	      var base =
	        _.result(this, 'urlRoot') ||
	        _.result(this.collection, 'url') ||
	        urlError();
	      if (this.isNew()) return base;
	      var id = this.get(this.idAttribute);
	      return base.replace(/[^\/]$/, '$&/') + encodeURIComponent(id);
	    },

	    // **parse** converts a response into the hash of attributes to be `set` on
	    // the model. The default implementation is just to pass the response along.
	    parse: function(resp, options) {
	      return resp;
	    },

	    // Create a new model with identical attributes to this one.
	    clone: function() {
	      return new this.constructor(this.attributes);
	    },

	    // A model is new if it has never been saved to the server, and lacks an id.
	    isNew: function() {
	      return !this.has(this.idAttribute);
	    },

	    // Check if the model is currently in a valid state.
	    isValid: function(options) {
	      return this._validate({}, _.extend({}, options, {validate: true}));
	    },

	    // Run validation against the next complete set of model attributes,
	    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
	    _validate: function(attrs, options) {
	      if (!options.validate || !this.validate) return true;
	      attrs = _.extend({}, this.attributes, attrs);
	      var error = this.validationError = this.validate(attrs, options) || null;
	      if (!error) return true;
	      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
	      return false;
	    }

	  });

	  // Underscore methods that we want to implement on the Model, mapped to the
	  // number of arguments they take.
	  var modelMethods = {keys: 1, values: 1, pairs: 1, invert: 1, pick: 0,
	      omit: 0, chain: 1, isEmpty: 1};

	  // Mix in each Underscore method as a proxy to `Model#attributes`.
	  addUnderscoreMethods(Model, modelMethods, 'attributes');

	  // Backbone.Collection
	  // -------------------

	  // If models tend to represent a single row of data, a Backbone Collection is
	  // more analogous to a table full of data ... or a small slice or page of that
	  // table, or a collection of rows that belong together for a particular reason
	  // -- all of the messages in this particular folder, all of the documents
	  // belonging to this particular author, and so on. Collections maintain
	  // indexes of their models, both in order, and for lookup by `id`.

	  // Create a new **Collection**, perhaps to contain a specific type of `model`.
	  // If a `comparator` is specified, the Collection will maintain
	  // its models in sort order, as they're added and removed.
	  var Collection = Backbone.Collection = function(models, options) {
	    options || (options = {});
	    if (options.model) this.model = options.model;
	    if (options.comparator !== void 0) this.comparator = options.comparator;
	    this._reset();
	    this.initialize.apply(this, arguments);
	    if (models) this.reset(models, _.extend({silent: true}, options));
	  };

	  // Default options for `Collection#set`.
	  var setOptions = {add: true, remove: true, merge: true};
	  var addOptions = {add: true, remove: false};

	  // Splices `insert` into `array` at index `at`.
	  var splice = function(array, insert, at) {
	    at = Math.min(Math.max(at, 0), array.length);
	    var tail = Array(array.length - at);
	    var length = insert.length;
	    var i;
	    for (i = 0; i < tail.length; i++) tail[i] = array[i + at];
	    for (i = 0; i < length; i++) array[i + at] = insert[i];
	    for (i = 0; i < tail.length; i++) array[i + length + at] = tail[i];
	  };

	  // Define the Collection's inheritable methods.
	  _.extend(Collection.prototype, Events, {

	    // The default model for a collection is just a **Backbone.Model**.
	    // This should be overridden in most cases.
	    model: Model,

	    // Initialize is an empty function by default. Override it with your own
	    // initialization logic.
	    initialize: function(){},

	    // The JSON representation of a Collection is an array of the
	    // models' attributes.
	    toJSON: function(options) {
	      return this.map(function(model) { return model.toJSON(options); });
	    },

	    // Proxy `Backbone.sync` by default.
	    sync: function() {
	      return Backbone.sync.apply(this, arguments);
	    },

	    // Add a model, or list of models to the set. `models` may be Backbone
	    // Models or raw JavaScript objects to be converted to Models, or any
	    // combination of the two.
	    add: function(models, options) {
	      return this.set(models, _.extend({merge: false}, options, addOptions));
	    },

	    // Remove a model, or a list of models from the set.
	    remove: function(models, options) {
	      options = _.extend({}, options);
	      var singular = !_.isArray(models);
	      models = singular ? [models] : models.slice();
	      var removed = this._removeModels(models, options);
	      if (!options.silent && removed.length) {
	        options.changes = {added: [], merged: [], removed: removed};
	        this.trigger('update', this, options);
	      }
	      return singular ? removed[0] : removed;
	    },

	    // Update a collection by `set`-ing a new list of models, adding new ones,
	    // removing models that are no longer present, and merging models that
	    // already exist in the collection, as necessary. Similar to **Model#set**,
	    // the core operation for updating the data contained by the collection.
	    set: function(models, options) {
	      if (models == null) return;

	      options = _.extend({}, setOptions, options);
	      if (options.parse && !this._isModel(models)) {
	        models = this.parse(models, options) || [];
	      }

	      var singular = !_.isArray(models);
	      models = singular ? [models] : models.slice();

	      var at = options.at;
	      if (at != null) at = +at;
	      if (at > this.length) at = this.length;
	      if (at < 0) at += this.length + 1;

	      var set = [];
	      var toAdd = [];
	      var toMerge = [];
	      var toRemove = [];
	      var modelMap = {};

	      var add = options.add;
	      var merge = options.merge;
	      var remove = options.remove;

	      var sort = false;
	      var sortable = this.comparator && at == null && options.sort !== false;
	      var sortAttr = _.isString(this.comparator) ? this.comparator : null;

	      // Turn bare objects into model references, and prevent invalid models
	      // from being added.
	      var model, i;
	      for (i = 0; i < models.length; i++) {
	        model = models[i];

	        // If a duplicate is found, prevent it from being added and
	        // optionally merge it into the existing model.
	        var existing = this.get(model);
	        if (existing) {
	          if (merge && model !== existing) {
	            var attrs = this._isModel(model) ? model.attributes : model;
	            if (options.parse) attrs = existing.parse(attrs, options);
	            existing.set(attrs, options);
	            toMerge.push(existing);
	            if (sortable && !sort) sort = existing.hasChanged(sortAttr);
	          }
	          if (!modelMap[existing.cid]) {
	            modelMap[existing.cid] = true;
	            set.push(existing);
	          }
	          models[i] = existing;

	        // If this is a new, valid model, push it to the `toAdd` list.
	        } else if (add) {
	          model = models[i] = this._prepareModel(model, options);
	          if (model) {
	            toAdd.push(model);
	            this._addReference(model, options);
	            modelMap[model.cid] = true;
	            set.push(model);
	          }
	        }
	      }

	      // Remove stale models.
	      if (remove) {
	        for (i = 0; i < this.length; i++) {
	          model = this.models[i];
	          if (!modelMap[model.cid]) toRemove.push(model);
	        }
	        if (toRemove.length) this._removeModels(toRemove, options);
	      }

	      // See if sorting is needed, update `length` and splice in new models.
	      var orderChanged = false;
	      var replace = !sortable && add && remove;
	      if (set.length && replace) {
	        orderChanged = this.length !== set.length || _.some(this.models, function(m, index) {
	          return m !== set[index];
	        });
	        this.models.length = 0;
	        splice(this.models, set, 0);
	        this.length = this.models.length;
	      } else if (toAdd.length) {
	        if (sortable) sort = true;
	        splice(this.models, toAdd, at == null ? this.length : at);
	        this.length = this.models.length;
	      }

	      // Silently sort the collection if appropriate.
	      if (sort) this.sort({silent: true});

	      // Unless silenced, it's time to fire all appropriate add/sort/update events.
	      if (!options.silent) {
	        for (i = 0; i < toAdd.length; i++) {
	          if (at != null) options.index = at + i;
	          model = toAdd[i];
	          model.trigger('add', model, this, options);
	        }
	        if (sort || orderChanged) this.trigger('sort', this, options);
	        if (toAdd.length || toRemove.length || toMerge.length) {
	          options.changes = {
	            added: toAdd,
	            removed: toRemove,
	            merged: toMerge
	          };
	          this.trigger('update', this, options);
	        }
	      }

	      // Return the added (or merged) model (or models).
	      return singular ? models[0] : models;
	    },

	    // When you have more items than you want to add or remove individually,
	    // you can reset the entire set with a new list of models, without firing
	    // any granular `add` or `remove` events. Fires `reset` when finished.
	    // Useful for bulk operations and optimizations.
	    reset: function(models, options) {
	      options = options ? _.clone(options) : {};
	      for (var i = 0; i < this.models.length; i++) {
	        this._removeReference(this.models[i], options);
	      }
	      options.previousModels = this.models;
	      this._reset();
	      models = this.add(models, _.extend({silent: true}, options));
	      if (!options.silent) this.trigger('reset', this, options);
	      return models;
	    },

	    // Add a model to the end of the collection.
	    push: function(model, options) {
	      return this.add(model, _.extend({at: this.length}, options));
	    },

	    // Remove a model from the end of the collection.
	    pop: function(options) {
	      var model = this.at(this.length - 1);
	      return this.remove(model, options);
	    },

	    // Add a model to the beginning of the collection.
	    unshift: function(model, options) {
	      return this.add(model, _.extend({at: 0}, options));
	    },

	    // Remove a model from the beginning of the collection.
	    shift: function(options) {
	      var model = this.at(0);
	      return this.remove(model, options);
	    },

	    // Slice out a sub-array of models from the collection.
	    slice: function() {
	      return slice.apply(this.models, arguments);
	    },

	    // Get a model from the set by id, cid, model object with id or cid
	    // properties, or an attributes object that is transformed through modelId.
	    get: function(obj) {
	      if (obj == null) return void 0;
	      return this._byId[obj] ||
	        this._byId[this.modelId(obj.attributes || obj)] ||
	        obj.cid && this._byId[obj.cid];
	    },

	    // Returns `true` if the model is in the collection.
	    has: function(obj) {
	      return this.get(obj) != null;
	    },

	    // Get the model at the given index.
	    at: function(index) {
	      if (index < 0) index += this.length;
	      return this.models[index];
	    },

	    // Return models with matching attributes. Useful for simple cases of
	    // `filter`.
	    where: function(attrs, first) {
	      return this[first ? 'find' : 'filter'](attrs);
	    },

	    // Return the first model with matching attributes. Useful for simple cases
	    // of `find`.
	    findWhere: function(attrs) {
	      return this.where(attrs, true);
	    },

	    // Force the collection to re-sort itself. You don't need to call this under
	    // normal circumstances, as the set will maintain sort order as each item
	    // is added.
	    sort: function(options) {
	      var comparator = this.comparator;
	      if (!comparator) throw new Error('Cannot sort a set without a comparator');
	      options || (options = {});

	      var length = comparator.length;
	      if (_.isFunction(comparator)) comparator = _.bind(comparator, this);

	      // Run sort based on type of `comparator`.
	      if (length === 1 || _.isString(comparator)) {
	        this.models = this.sortBy(comparator);
	      } else {
	        this.models.sort(comparator);
	      }
	      if (!options.silent) this.trigger('sort', this, options);
	      return this;
	    },

	    // Pluck an attribute from each model in the collection.
	    pluck: function(attr) {
	      return this.map(attr + '');
	    },

	    // Fetch the default set of models for this collection, resetting the
	    // collection when they arrive. If `reset: true` is passed, the response
	    // data will be passed through the `reset` method instead of `set`.
	    fetch: function(options) {
	      options = _.extend({parse: true}, options);
	      var success = options.success;
	      var collection = this;
	      options.success = function(resp) {
	        var method = options.reset ? 'reset' : 'set';
	        collection[method](resp, options);
	        if (success) success.call(options.context, collection, resp, options);
	        collection.trigger('sync', collection, resp, options);
	      };
	      wrapError(this, options);
	      return this.sync('read', this, options);
	    },

	    // Create a new instance of a model in this collection. Add the model to the
	    // collection immediately, unless `wait: true` is passed, in which case we
	    // wait for the server to agree.
	    create: function(model, options) {
	      options = options ? _.clone(options) : {};
	      var wait = options.wait;
	      model = this._prepareModel(model, options);
	      if (!model) return false;
	      if (!wait) this.add(model, options);
	      var collection = this;
	      var success = options.success;
	      options.success = function(m, resp, callbackOpts) {
	        if (wait) collection.add(m, callbackOpts);
	        if (success) success.call(callbackOpts.context, m, resp, callbackOpts);
	      };
	      model.save(null, options);
	      return model;
	    },

	    // **parse** converts a response into a list of models to be added to the
	    // collection. The default implementation is just to pass it through.
	    parse: function(resp, options) {
	      return resp;
	    },

	    // Create a new collection with an identical list of models as this one.
	    clone: function() {
	      return new this.constructor(this.models, {
	        model: this.model,
	        comparator: this.comparator
	      });
	    },

	    // Define how to uniquely identify models in the collection.
	    modelId: function(attrs) {
	      return attrs[this.model.prototype.idAttribute || 'id'];
	    },

	    // Private method to reset all internal state. Called when the collection
	    // is first initialized or reset.
	    _reset: function() {
	      this.length = 0;
	      this.models = [];
	      this._byId  = {};
	    },

	    // Prepare a hash of attributes (or other model) to be added to this
	    // collection.
	    _prepareModel: function(attrs, options) {
	      if (this._isModel(attrs)) {
	        if (!attrs.collection) attrs.collection = this;
	        return attrs;
	      }
	      options = options ? _.clone(options) : {};
	      options.collection = this;
	      var model = new this.model(attrs, options);
	      if (!model.validationError) return model;
	      this.trigger('invalid', this, model.validationError, options);
	      return false;
	    },

	    // Internal method called by both remove and set.
	    _removeModels: function(models, options) {
	      var removed = [];
	      for (var i = 0; i < models.length; i++) {
	        var model = this.get(models[i]);
	        if (!model) continue;

	        var index = this.indexOf(model);
	        this.models.splice(index, 1);
	        this.length--;

	        // Remove references before triggering 'remove' event to prevent an
	        // infinite loop. #3693
	        delete this._byId[model.cid];
	        var id = this.modelId(model.attributes);
	        if (id != null) delete this._byId[id];

	        if (!options.silent) {
	          options.index = index;
	          model.trigger('remove', model, this, options);
	        }

	        removed.push(model);
	        this._removeReference(model, options);
	      }
	      return removed;
	    },

	    // Method for checking whether an object should be considered a model for
	    // the purposes of adding to the collection.
	    _isModel: function(model) {
	      return model instanceof Model;
	    },

	    // Internal method to create a model's ties to a collection.
	    _addReference: function(model, options) {
	      this._byId[model.cid] = model;
	      var id = this.modelId(model.attributes);
	      if (id != null) this._byId[id] = model;
	      model.on('all', this._onModelEvent, this);
	    },

	    // Internal method to sever a model's ties to a collection.
	    _removeReference: function(model, options) {
	      delete this._byId[model.cid];
	      var id = this.modelId(model.attributes);
	      if (id != null) delete this._byId[id];
	      if (this === model.collection) delete model.collection;
	      model.off('all', this._onModelEvent, this);
	    },

	    // Internal method called every time a model in the set fires an event.
	    // Sets need to update their indexes when models change ids. All other
	    // events simply proxy through. "add" and "remove" events that originate
	    // in other collections are ignored.
	    _onModelEvent: function(event, model, collection, options) {
	      if (model) {
	        if ((event === 'add' || event === 'remove') && collection !== this) return;
	        if (event === 'destroy') this.remove(model, options);
	        if (event === 'change') {
	          var prevId = this.modelId(model.previousAttributes());
	          var id = this.modelId(model.attributes);
	          if (prevId !== id) {
	            if (prevId != null) delete this._byId[prevId];
	            if (id != null) this._byId[id] = model;
	          }
	        }
	      }
	      this.trigger.apply(this, arguments);
	    }

	  });

	  // Underscore methods that we want to implement on the Collection.
	  // 90% of the core usefulness of Backbone Collections is actually implemented
	  // right here:
	  var collectionMethods = {forEach: 3, each: 3, map: 3, collect: 3, reduce: 0,
	      foldl: 0, inject: 0, reduceRight: 0, foldr: 0, find: 3, detect: 3, filter: 3,
	      select: 3, reject: 3, every: 3, all: 3, some: 3, any: 3, include: 3, includes: 3,
	      contains: 3, invoke: 0, max: 3, min: 3, toArray: 1, size: 1, first: 3,
	      head: 3, take: 3, initial: 3, rest: 3, tail: 3, drop: 3, last: 3,
	      without: 0, difference: 0, indexOf: 3, shuffle: 1, lastIndexOf: 3,
	      isEmpty: 1, chain: 1, sample: 3, partition: 3, groupBy: 3, countBy: 3,
	      sortBy: 3, indexBy: 3, findIndex: 3, findLastIndex: 3};

	  // Mix in each Underscore method as a proxy to `Collection#models`.
	  addUnderscoreMethods(Collection, collectionMethods, 'models');

	  // Backbone.View
	  // -------------

	  // Backbone Views are almost more convention than they are actual code. A View
	  // is simply a JavaScript object that represents a logical chunk of UI in the
	  // DOM. This might be a single item, an entire list, a sidebar or panel, or
	  // even the surrounding frame which wraps your whole app. Defining a chunk of
	  // UI as a **View** allows you to define your DOM events declaratively, without
	  // having to worry about render order ... and makes it easy for the view to
	  // react to specific changes in the state of your models.

	  // Creating a Backbone.View creates its initial element outside of the DOM,
	  // if an existing element is not provided...
	  var View = Backbone.View = function(options) {
	    this.cid = _.uniqueId('view');
	    _.extend(this, _.pick(options, viewOptions));
	    this._ensureElement();
	    this.initialize.apply(this, arguments);
	  };

	  // Cached regex to split keys for `delegate`.
	  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

	  // List of view options to be set as properties.
	  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

	  // Set up all inheritable **Backbone.View** properties and methods.
	  _.extend(View.prototype, Events, {

	    // The default `tagName` of a View's element is `"div"`.
	    tagName: 'div',

	    // jQuery delegate for element lookup, scoped to DOM elements within the
	    // current view. This should be preferred to global lookups where possible.
	    $: function(selector) {
	      return this.$el.find(selector);
	    },

	    // Initialize is an empty function by default. Override it with your own
	    // initialization logic.
	    initialize: function(){},

	    // **render** is the core function that your view should override, in order
	    // to populate its element (`this.el`), with the appropriate HTML. The
	    // convention is for **render** to always return `this`.
	    render: function() {
	      return this;
	    },

	    // Remove this view by taking the element out of the DOM, and removing any
	    // applicable Backbone.Events listeners.
	    remove: function() {
	      this._removeElement();
	      this.stopListening();
	      return this;
	    },

	    // Remove this view's element from the document and all event listeners
	    // attached to it. Exposed for subclasses using an alternative DOM
	    // manipulation API.
	    _removeElement: function() {
	      this.$el.remove();
	    },

	    // Change the view's element (`this.el` property) and re-delegate the
	    // view's events on the new element.
	    setElement: function(element) {
	      this.undelegateEvents();
	      this._setElement(element);
	      this.delegateEvents();
	      return this;
	    },

	    // Creates the `this.el` and `this.$el` references for this view using the
	    // given `el`. `el` can be a CSS selector or an HTML string, a jQuery
	    // context or an element. Subclasses can override this to utilize an
	    // alternative DOM manipulation API and are only required to set the
	    // `this.el` property.
	    _setElement: function(el) {
	      this.$el = el instanceof Backbone.$ ? el : Backbone.$(el);
	      this.el = this.$el[0];
	    },

	    // Set callbacks, where `this.events` is a hash of
	    //
	    // *{"event selector": "callback"}*
	    //
	    //     {
	    //       'mousedown .title':  'edit',
	    //       'click .button':     'save',
	    //       'click .open':       function(e) { ... }
	    //     }
	    //
	    // pairs. Callbacks will be bound to the view, with `this` set properly.
	    // Uses event delegation for efficiency.
	    // Omitting the selector binds the event to `this.el`.
	    delegateEvents: function(events) {
	      events || (events = _.result(this, 'events'));
	      if (!events) return this;
	      this.undelegateEvents();
	      for (var key in events) {
	        var method = events[key];
	        if (!_.isFunction(method)) method = this[method];
	        if (!method) continue;
	        var match = key.match(delegateEventSplitter);
	        this.delegate(match[1], match[2], _.bind(method, this));
	      }
	      return this;
	    },

	    // Add a single event listener to the view's element (or a child element
	    // using `selector`). This only works for delegate-able events: not `focus`,
	    // `blur`, and not `change`, `submit`, and `reset` in Internet Explorer.
	    delegate: function(eventName, selector, listener) {
	      this.$el.on(eventName + '.delegateEvents' + this.cid, selector, listener);
	      return this;
	    },

	    // Clears all callbacks previously bound to the view by `delegateEvents`.
	    // You usually don't need to use this, but may wish to if you have multiple
	    // Backbone views attached to the same DOM element.
	    undelegateEvents: function() {
	      if (this.$el) this.$el.off('.delegateEvents' + this.cid);
	      return this;
	    },

	    // A finer-grained `undelegateEvents` for removing a single delegated event.
	    // `selector` and `listener` are both optional.
	    undelegate: function(eventName, selector, listener) {
	      this.$el.off(eventName + '.delegateEvents' + this.cid, selector, listener);
	      return this;
	    },

	    // Produces a DOM element to be assigned to your view. Exposed for
	    // subclasses using an alternative DOM manipulation API.
	    _createElement: function(tagName) {
	      return document.createElement(tagName);
	    },

	    // Ensure that the View has a DOM element to render into.
	    // If `this.el` is a string, pass it through `$()`, take the first
	    // matching element, and re-assign it to `el`. Otherwise, create
	    // an element from the `id`, `className` and `tagName` properties.
	    _ensureElement: function() {
	      if (!this.el) {
	        var attrs = _.extend({}, _.result(this, 'attributes'));
	        if (this.id) attrs.id = _.result(this, 'id');
	        if (this.className) attrs['class'] = _.result(this, 'className');
	        this.setElement(this._createElement(_.result(this, 'tagName')));
	        this._setAttributes(attrs);
	      } else {
	        this.setElement(_.result(this, 'el'));
	      }
	    },

	    // Set attributes from a hash on this view's element.  Exposed for
	    // subclasses using an alternative DOM manipulation API.
	    _setAttributes: function(attributes) {
	      this.$el.attr(attributes);
	    }

	  });

	  // Backbone.sync
	  // -------------

	  // Override this function to change the manner in which Backbone persists
	  // models to the server. You will be passed the type of request, and the
	  // model in question. By default, makes a RESTful Ajax request
	  // to the model's `url()`. Some possible customizations could be:
	  //
	  // * Use `setTimeout` to batch rapid-fire updates into a single request.
	  // * Send up the models as XML instead of JSON.
	  // * Persist models via WebSockets instead of Ajax.
	  //
	  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
	  // as `POST`, with a `_method` parameter containing the true HTTP method,
	  // as well as all requests with the body as `application/x-www-form-urlencoded`
	  // instead of `application/json` with the model in a param named `model`.
	  // Useful when interfacing with server-side languages like **PHP** that make
	  // it difficult to read the body of `PUT` requests.
	  Backbone.sync = function(method, model, options) {
	    var type = methodMap[method];

	    // Default options, unless specified.
	    _.defaults(options || (options = {}), {
	      emulateHTTP: Backbone.emulateHTTP,
	      emulateJSON: Backbone.emulateJSON
	    });

	    // Default JSON-request options.
	    var params = {type: type, dataType: 'json'};

	    // Ensure that we have a URL.
	    if (!options.url) {
	      params.url = _.result(model, 'url') || urlError();
	    }

	    // Ensure that we have the appropriate request data.
	    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
	      params.contentType = 'application/json';
	      params.data = JSON.stringify(options.attrs || model.toJSON(options));
	    }

	    // For older servers, emulate JSON by encoding the request into an HTML-form.
	    if (options.emulateJSON) {
	      params.contentType = 'application/x-www-form-urlencoded';
	      params.data = params.data ? {model: params.data} : {};
	    }

	    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
	    // And an `X-HTTP-Method-Override` header.
	    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
	      params.type = 'POST';
	      if (options.emulateJSON) params.data._method = type;
	      var beforeSend = options.beforeSend;
	      options.beforeSend = function(xhr) {
	        xhr.setRequestHeader('X-HTTP-Method-Override', type);
	        if (beforeSend) return beforeSend.apply(this, arguments);
	      };
	    }

	    // Don't process data on a non-GET request.
	    if (params.type !== 'GET' && !options.emulateJSON) {
	      params.processData = false;
	    }

	    // Pass along `textStatus` and `errorThrown` from jQuery.
	    var error = options.error;
	    options.error = function(xhr, textStatus, errorThrown) {
	      options.textStatus = textStatus;
	      options.errorThrown = errorThrown;
	      if (error) error.call(options.context, xhr, textStatus, errorThrown);
	    };

	    // Make the request, allowing the user to override any Ajax options.
	    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
	    model.trigger('request', model, xhr, options);
	    return xhr;
	  };

	  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
	  var methodMap = {
	    'create': 'POST',
	    'update': 'PUT',
	    'patch': 'PATCH',
	    'delete': 'DELETE',
	    'read': 'GET'
	  };

	  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
	  // Override this if you'd like to use a different library.
	  Backbone.ajax = function() {
	    return Backbone.$.ajax.apply(Backbone.$, arguments);
	  };

	  // Backbone.Router
	  // ---------------

	  // Routers map faux-URLs to actions, and fire events when routes are
	  // matched. Creating a new one sets its `routes` hash, if not set statically.
	  var Router = Backbone.Router = function(options) {
	    options || (options = {});
	    if (options.routes) this.routes = options.routes;
	    this._bindRoutes();
	    this.initialize.apply(this, arguments);
	  };

	  // Cached regular expressions for matching named param parts and splatted
	  // parts of route strings.
	  var optionalParam = /\((.*?)\)/g;
	  var namedParam    = /(\(\?)?:\w+/g;
	  var splatParam    = /\*\w+/g;
	  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

	  // Set up all inheritable **Backbone.Router** properties and methods.
	  _.extend(Router.prototype, Events, {

	    // Initialize is an empty function by default. Override it with your own
	    // initialization logic.
	    initialize: function(){},

	    // Manually bind a single named route to a callback. For example:
	    //
	    //     this.route('search/:query/p:num', 'search', function(query, num) {
	    //       ...
	    //     });
	    //
	    route: function(route, name, callback) {
	      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
	      if (_.isFunction(name)) {
	        callback = name;
	        name = '';
	      }
	      if (!callback) callback = this[name];
	      var router = this;
	      Backbone.history.route(route, function(fragment) {
	        var args = router._extractParameters(route, fragment);
	        if (router.execute(callback, args, name) !== false) {
	          router.trigger.apply(router, ['route:' + name].concat(args));
	          router.trigger('route', name, args);
	          Backbone.history.trigger('route', router, name, args);
	        }
	      });
	      return this;
	    },

	    // Execute a route handler with the provided parameters.  This is an
	    // excellent place to do pre-route setup or post-route cleanup.
	    execute: function(callback, args, name) {
	      if (callback) callback.apply(this, args);
	    },

	    // Simple proxy to `Backbone.history` to save a fragment into the history.
	    navigate: function(fragment, options) {
	      Backbone.history.navigate(fragment, options);
	      return this;
	    },

	    // Bind all defined routes to `Backbone.history`. We have to reverse the
	    // order of the routes here to support behavior where the most general
	    // routes can be defined at the bottom of the route map.
	    _bindRoutes: function() {
	      if (!this.routes) return;
	      this.routes = _.result(this, 'routes');
	      var route, routes = _.keys(this.routes);
	      while ((route = routes.pop()) != null) {
	        this.route(route, this.routes[route]);
	      }
	    },

	    // Convert a route string into a regular expression, suitable for matching
	    // against the current location hash.
	    _routeToRegExp: function(route) {
	      route = route.replace(escapeRegExp, '\\$&')
	                   .replace(optionalParam, '(?:$1)?')
	                   .replace(namedParam, function(match, optional) {
	                     return optional ? match : '([^/?]+)';
	                   })
	                   .replace(splatParam, '([^?]*?)');
	      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
	    },

	    // Given a route, and a URL fragment that it matches, return the array of
	    // extracted decoded parameters. Empty or unmatched parameters will be
	    // treated as `null` to normalize cross-browser behavior.
	    _extractParameters: function(route, fragment) {
	      var params = route.exec(fragment).slice(1);
	      return _.map(params, function(param, i) {
	        // Don't decode the search params.
	        if (i === params.length - 1) return param || null;
	        return param ? decodeURIComponent(param) : null;
	      });
	    }

	  });

	  // Backbone.History
	  // ----------------

	  // Handles cross-browser history management, based on either
	  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
	  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
	  // and URL fragments. If the browser supports neither (old IE, natch),
	  // falls back to polling.
	  var History = Backbone.History = function() {
	    this.handlers = [];
	    this.checkUrl = _.bind(this.checkUrl, this);

	    // Ensure that `History` can be used outside of the browser.
	    if (typeof window !== 'undefined') {
	      this.location = window.location;
	      this.history = window.history;
	    }
	  };

	  // Cached regex for stripping a leading hash/slash and trailing space.
	  var routeStripper = /^[#\/]|\s+$/g;

	  // Cached regex for stripping leading and trailing slashes.
	  var rootStripper = /^\/+|\/+$/g;

	  // Cached regex for stripping urls of hash.
	  var pathStripper = /#.*$/;

	  // Has the history handling already been started?
	  History.started = false;

	  // Set up all inheritable **Backbone.History** properties and methods.
	  _.extend(History.prototype, Events, {

	    // The default interval to poll for hash changes, if necessary, is
	    // twenty times a second.
	    interval: 50,

	    // Are we at the app root?
	    atRoot: function() {
	      var path = this.location.pathname.replace(/[^\/]$/, '$&/');
	      return path === this.root && !this.getSearch();
	    },

	    // Does the pathname match the root?
	    matchRoot: function() {
	      var path = this.decodeFragment(this.location.pathname);
	      var rootPath = path.slice(0, this.root.length - 1) + '/';
	      return rootPath === this.root;
	    },

	    // Unicode characters in `location.pathname` are percent encoded so they're
	    // decoded for comparison. `%25` should not be decoded since it may be part
	    // of an encoded parameter.
	    decodeFragment: function(fragment) {
	      return decodeURI(fragment.replace(/%25/g, '%2525'));
	    },

	    // In IE6, the hash fragment and search params are incorrect if the
	    // fragment contains `?`.
	    getSearch: function() {
	      var match = this.location.href.replace(/#.*/, '').match(/\?.+/);
	      return match ? match[0] : '';
	    },

	    // Gets the true hash value. Cannot use location.hash directly due to bug
	    // in Firefox where location.hash will always be decoded.
	    getHash: function(window) {
	      var match = (window || this).location.href.match(/#(.*)$/);
	      return match ? match[1] : '';
	    },

	    // Get the pathname and search params, without the root.
	    getPath: function() {
	      var path = this.decodeFragment(
	        this.location.pathname + this.getSearch()
	      ).slice(this.root.length - 1);
	      return path.charAt(0) === '/' ? path.slice(1) : path;
	    },

	    // Get the cross-browser normalized URL fragment from the path or hash.
	    getFragment: function(fragment) {
	      if (fragment == null) {
	        if (this._usePushState || !this._wantsHashChange) {
	          fragment = this.getPath();
	        } else {
	          fragment = this.getHash();
	        }
	      }
	      return fragment.replace(routeStripper, '');
	    },

	    // Start the hash change handling, returning `true` if the current URL matches
	    // an existing route, and `false` otherwise.
	    start: function(options) {
	      if (History.started) throw new Error('Backbone.history has already been started');
	      History.started = true;

	      // Figure out the initial configuration. Do we need an iframe?
	      // Is pushState desired ... is it available?
	      this.options          = _.extend({root: '/'}, this.options, options);
	      this.root             = this.options.root;
	      this._wantsHashChange = this.options.hashChange !== false;
	      this._hasHashChange   = 'onhashchange' in window && (document.documentMode === void 0 || document.documentMode > 7);
	      this._useHashChange   = this._wantsHashChange && this._hasHashChange;
	      this._wantsPushState  = !!this.options.pushState;
	      this._hasPushState    = !!(this.history && this.history.pushState);
	      this._usePushState    = this._wantsPushState && this._hasPushState;
	      this.fragment         = this.getFragment();

	      // Normalize root to always include a leading and trailing slash.
	      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

	      // Transition from hashChange to pushState or vice versa if both are
	      // requested.
	      if (this._wantsHashChange && this._wantsPushState) {

	        // If we've started off with a route from a `pushState`-enabled
	        // browser, but we're currently in a browser that doesn't support it...
	        if (!this._hasPushState && !this.atRoot()) {
	          var rootPath = this.root.slice(0, -1) || '/';
	          this.location.replace(rootPath + '#' + this.getPath());
	          // Return immediately as browser will do redirect to new url
	          return true;

	        // Or if we've started out with a hash-based route, but we're currently
	        // in a browser where it could be `pushState`-based instead...
	        } else if (this._hasPushState && this.atRoot()) {
	          this.navigate(this.getHash(), {replace: true});
	        }

	      }

	      // Proxy an iframe to handle location events if the browser doesn't
	      // support the `hashchange` event, HTML5 history, or the user wants
	      // `hashChange` but not `pushState`.
	      if (!this._hasHashChange && this._wantsHashChange && !this._usePushState) {
	        this.iframe = document.createElement('iframe');
	        this.iframe.src = 'javascript:0';
	        this.iframe.style.display = 'none';
	        this.iframe.tabIndex = -1;
	        var body = document.body;
	        // Using `appendChild` will throw on IE < 9 if the document is not ready.
	        var iWindow = body.insertBefore(this.iframe, body.firstChild).contentWindow;
	        iWindow.document.open();
	        iWindow.document.close();
	        iWindow.location.hash = '#' + this.fragment;
	      }

	      // Add a cross-platform `addEventListener` shim for older browsers.
	      var addEventListener = window.addEventListener || function(eventName, listener) {
	        return attachEvent('on' + eventName, listener);
	      };

	      // Depending on whether we're using pushState or hashes, and whether
	      // 'onhashchange' is supported, determine how we check the URL state.
	      if (this._usePushState) {
	        addEventListener('popstate', this.checkUrl, false);
	      } else if (this._useHashChange && !this.iframe) {
	        addEventListener('hashchange', this.checkUrl, false);
	      } else if (this._wantsHashChange) {
	        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
	      }

	      if (!this.options.silent) return this.loadUrl();
	    },

	    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
	    // but possibly useful for unit testing Routers.
	    stop: function() {
	      // Add a cross-platform `removeEventListener` shim for older browsers.
	      var removeEventListener = window.removeEventListener || function(eventName, listener) {
	        return detachEvent('on' + eventName, listener);
	      };

	      // Remove window listeners.
	      if (this._usePushState) {
	        removeEventListener('popstate', this.checkUrl, false);
	      } else if (this._useHashChange && !this.iframe) {
	        removeEventListener('hashchange', this.checkUrl, false);
	      }

	      // Clean up the iframe if necessary.
	      if (this.iframe) {
	        document.body.removeChild(this.iframe);
	        this.iframe = null;
	      }

	      // Some environments will throw when clearing an undefined interval.
	      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
	      History.started = false;
	    },

	    // Add a route to be tested when the fragment changes. Routes added later
	    // may override previous routes.
	    route: function(route, callback) {
	      this.handlers.unshift({route: route, callback: callback});
	    },

	    // Checks the current URL to see if it has changed, and if it has,
	    // calls `loadUrl`, normalizing across the hidden iframe.
	    checkUrl: function(e) {
	      var current = this.getFragment();

	      // If the user pressed the back button, the iframe's hash will have
	      // changed and we should use that for comparison.
	      if (current === this.fragment && this.iframe) {
	        current = this.getHash(this.iframe.contentWindow);
	      }

	      if (current === this.fragment) return false;
	      if (this.iframe) this.navigate(current);
	      this.loadUrl();
	    },

	    // Attempt to load the current URL fragment. If a route succeeds with a
	    // match, returns `true`. If no defined routes matches the fragment,
	    // returns `false`.
	    loadUrl: function(fragment) {
	      // If the root doesn't match, no routes can match either.
	      if (!this.matchRoot()) return false;
	      fragment = this.fragment = this.getFragment(fragment);
	      return _.some(this.handlers, function(handler) {
	        if (handler.route.test(fragment)) {
	          handler.callback(fragment);
	          return true;
	        }
	      });
	    },

	    // Save a fragment into the hash history, or replace the URL state if the
	    // 'replace' option is passed. You are responsible for properly URL-encoding
	    // the fragment in advance.
	    //
	    // The options object can contain `trigger: true` if you wish to have the
	    // route callback be fired (not usually desirable), or `replace: true`, if
	    // you wish to modify the current URL without adding an entry to the history.
	    navigate: function(fragment, options) {
	      if (!History.started) return false;
	      if (!options || options === true) options = {trigger: !!options};

	      // Normalize the fragment.
	      fragment = this.getFragment(fragment || '');

	      // Don't include a trailing slash on the root.
	      var rootPath = this.root;
	      if (fragment === '' || fragment.charAt(0) === '?') {
	        rootPath = rootPath.slice(0, -1) || '/';
	      }
	      var url = rootPath + fragment;

	      // Strip the hash and decode for matching.
	      fragment = this.decodeFragment(fragment.replace(pathStripper, ''));

	      if (this.fragment === fragment) return;
	      this.fragment = fragment;

	      // If pushState is available, we use it to set the fragment as a real URL.
	      if (this._usePushState) {
	        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

	      // If hash changes haven't been explicitly disabled, update the hash
	      // fragment to store history.
	      } else if (this._wantsHashChange) {
	        this._updateHash(this.location, fragment, options.replace);
	        if (this.iframe && fragment !== this.getHash(this.iframe.contentWindow)) {
	          var iWindow = this.iframe.contentWindow;

	          // Opening and closing the iframe tricks IE7 and earlier to push a
	          // history entry on hash-tag change.  When replace is true, we don't
	          // want this.
	          if (!options.replace) {
	            iWindow.document.open();
	            iWindow.document.close();
	          }

	          this._updateHash(iWindow.location, fragment, options.replace);
	        }

	      // If you've told us that you explicitly don't want fallback hashchange-
	      // based history, then `navigate` becomes a page refresh.
	      } else {
	        return this.location.assign(url);
	      }
	      if (options.trigger) return this.loadUrl(fragment);
	    },

	    // Update the hash location, either replacing the current entry, or adding
	    // a new one to the browser history.
	    _updateHash: function(location, fragment, replace) {
	      if (replace) {
	        var href = location.href.replace(/(javascript:|#).*$/, '');
	        location.replace(href + '#' + fragment);
	      } else {
	        // Some browsers require that `hash` contains a leading #.
	        location.hash = '#' + fragment;
	      }
	    }

	  });

	  // Create the default Backbone.history.
	  Backbone.history = new History;

	  // Helpers
	  // -------

	  // Helper function to correctly set up the prototype chain for subclasses.
	  // Similar to `goog.inherits`, but uses a hash of prototype properties and
	  // class properties to be extended.
	  var extend = function(protoProps, staticProps) {
	    var parent = this;
	    var child;

	    // The constructor function for the new subclass is either defined by you
	    // (the "constructor" property in your `extend` definition), or defaulted
	    // by us to simply call the parent constructor.
	    if (protoProps && _.has(protoProps, 'constructor')) {
	      child = protoProps.constructor;
	    } else {
	      child = function(){ return parent.apply(this, arguments); };
	    }

	    // Add static properties to the constructor function, if supplied.
	    _.extend(child, parent, staticProps);

	    // Set the prototype chain to inherit from `parent`, without calling
	    // `parent`'s constructor function and add the prototype properties.
	    child.prototype = _.create(parent.prototype, protoProps);
	    child.prototype.constructor = child;

	    // Set a convenience property in case the parent's prototype is needed
	    // later.
	    child.__super__ = parent.prototype;

	    return child;
	  };

	  // Set up inheritance for the model, collection, router, view and history.
	  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

	  // Throw an error when a URL is needed, and none is supplied.
	  var urlError = function() {
	    throw new Error('A "url" property or function must be specified');
	  };

	  // Wrap an optional error callback with a fallback error event.
	  var wrapError = function(model, options) {
	    var error = options.error;
	    options.error = function(resp) {
	      if (error) error.call(options.context, model, resp, options);
	      model.trigger('error', model, resp, options);
	    };
	  };

	  return Backbone;
	});

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = $;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Mixin object for base class
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	/**
	 * Mixin object for base class
	 * @mixin
	 * @exports module:base/common
	 * @ignore
	 */
	var common = {
	    /**
	     * 주어진 객체의 프라퍼티들을 this에 복사해서 추가한다.
	     * @param  {object} properties 추가할 프라퍼티 객체
	     */
	    setOwnProperties: function(properties) {
	        _.each(properties, function(value, key) {
	            this[key] = value;
	        }, this);
	    }
	};
	module.exports = common;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Model Manager
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var ColumnModelData = __webpack_require__(7);
	var RowListData = __webpack_require__(11);
	var ToolbarModel = __webpack_require__(16);
	var DimensionModel = __webpack_require__(17);
	var CoordRowModel = __webpack_require__(18);
	var CoordColumnModel = __webpack_require__(19);
	var CoordConverterModel = __webpack_require__(20);
	var FocusModel = __webpack_require__(21);
	var RenderModel = __webpack_require__(23);
	var SmartRenderModel = __webpack_require__(26);
	var SelectionModel = __webpack_require__(27);
	var SummaryModel = __webpack_require__(28);
	var util = __webpack_require__(9);

	var defaultOptions = {
	    columnFixCount: 0,
	    columnModelList: [],
	    keyColumnName: null,
	    selectType: '',
	    autoNumbering: true,
	    headerHeight: 35,
	    rowHeight: 27,
	    fitToParentHeight: false,
	    showDummyRows: false,
	    minimumColumnWidth: 50,
	    notUseSmartRendering: false,
	    columnMerge: [],
	    scrollX: true,
	    scrollY: true,
	    useClientSort: true,
	    toolbar: null
	};

	/**
	 * Model Manager
	 * @module model/manager
	 * @param {Object} options - Options to create models
	 * @param {module/domState} domState - DomState instance
	 * @ignore
	 */
	var ModelManager = tui.util.defineClass(/**@lends module:modelManager.prototype */{
	    init: function(options, domState) {
	        options = $.extend(true, {}, defaultOptions, options);

	        this.gridId = options.gridId;

	        this.columnModel = this._createColumnModel(options);
	        this.dataModel = this._createDataModel(options, domState);
	        this.toolbarModel = this._createToolbarModel(options);
	        this.dimensionModel = this._createDimensionModel(options, domState);
	        this.coordRowModel = this._createCoordRowModel(domState);
	        this.coordColumnModel = this._createCoordColumnModel();
	        this.focusModel = this._createFocusModel(domState);
	        this.renderModel = this._createRenderModel(options);
	        this.coordConverterModel = this._createCoordConverterModel();
	        this.selectionModel = this._createSelectionModel();
	        this.summaryModel = this._createSummaryModel(options.footer);

	        // todo: remove dependency
	        this.focusModel.renderModel = this.renderModel;
	    },

	    /**
	     * Creates an instance of column model and returns it.
	     * @param  {Object} options - Options
	     * @returns {module:data/columnModel} A new instance
	     * @private
	     */
	    _createColumnModel: function(options) {
	        return new ColumnModelData({
	            hasNumberColumn: options.autoNumbering,
	            keyColumnName: options.keyColumnName,
	            columnFixCount: options.columnFixCount,
	            selectType: options.selectType,
	            columnMerge: options.columnMerge,
	            columnModelList: options.columnModelList
	        });
	    },

	    /**
	     * Creates an instance of data model and returns it.
	     * @param  {Object} options - Options
	     * @param  {module:domState} domState - domState
	     * @returns {module:data/rowList} - A new instance
	     * @private
	     */
	    _createDataModel: function(options, domState) {
	        return new RowListData([], {
	            gridId: this.gridId,
	            domState: domState,
	            columnModel: this.columnModel,
	            useClientSort: options.useClientSort
	        });
	    },

	    /**
	     * Creates an instance of toolbar model and returns it.
	     * @param  {Object} options - Options
	     * @returns {module:model/toolbar} - A new instance
	     * @private
	     */
	    _createToolbarModel: function(options) {
	        return new ToolbarModel(options.toolbar);
	    },

	    /**
	     * Creates an instance of dimension model and returns it.
	     * @param  {Object} options - Options
	     * @param  {module:domState} domState - domState
	     * @returns {module:model/dimension} - A new instance
	     * @private
	     */
	    _createDimensionModel: function(options, domState) {
	        var dimensionModel;
	        var attrs = {
	            headerHeight: options.headerHeight,
	            bodyHeight: options.bodyHeight,
	            footerHeight: options.footer ? options.footer.height : 0,
	            rowHeight: options.rowHeight,
	            fitToParentHeight: options.fitToParentHeight,
	            scrollX: !!options.scrollX,
	            scrollY: !!options.scrollY,
	            minimumColumnWidth: options.minimumColumnWidth,
	            isFixedRowHeight: options.isFixedRowHeight,
	            isFixedHeight: options.isFixedHeight
	        };

	        // isfixedRowHeight and notUseSmartRendering can not be false at the same time.
	        if (options.isFixedRowHeight === false && !options.notUseSmartRendering) {
	            util.warning('The isFixedRowHeight can\'t be false if the notUseSmartRendering is not set to false.');
	            attrs.isFixedRowHeight = true;
	        }

	        dimensionModel = new DimensionModel(attrs, {
	            columnModel: this.columnModel,
	            dataModel: this.dataModel,
	            domState: domState
	        });

	        // The displayRowCount option is deprecated.
	        // This code should be removed after the option is removed.
	        if (_.isUndefined(options.bodyHeight) && options.displayRowCount) {
	            dimensionModel.setBodyHeightWithRowCount(options.displayRowCount);
	        }

	        return dimensionModel;
	    },

	    /**
	     * Creates an instance of coordRow model and returns it
	     * @param {module:domState} domState - domState
	     * @returns {module:model/coordRow}
	     * @private
	     */
	    _createCoordRowModel: function(domState) {
	        return new CoordRowModel(null, {
	            dataModel: this.dataModel,
	            dimensionModel: this.dimensionModel,
	            domState: domState
	        });
	    },

	    /**
	     * Creates an instance of coordColumn model and returns it
	     * @returns {module:model/coordColumnModel}
	     * @private
	     */
	    _createCoordColumnModel: function() {
	        return new CoordColumnModel(null, {
	            columnModel: this.columnModel,
	            dimensionModel: this.dimensionModel
	        });
	    },

	    /**
	     * Creates an instance of coordConvert model and returns it
	     * @returns {module:model/coordConverterModel}
	     * @private
	     */
	    _createCoordConverterModel: function() {
	        return new CoordConverterModel(null, {
	            columnModel: this.columnModel,
	            dataModel: this.dataModel,
	            dimensionModel: this.dimensionModel,
	            focusModel: this.focusModel,
	            coordRowModel: this.coordRowModel,
	            renderModel: this.renderModel,
	            coordColumnModel: this.coordColumnModel
	        });
	    },

	    /**
	     * Creates an instance of focus model and returns it.
	     * @param  {module:domState} domState - DomState instance
	     * @returns {module:model/focus} - A new instance
	     * @private
	     */
	    _createFocusModel: function(domState) {
	        return new FocusModel(null, {
	            columnModel: this.columnModel,
	            dataModel: this.dataModel,
	            dimensionModel: this.dimensionModel,
	            renderModel: this.renderModel,
	            domState: domState
	        });
	    },

	    /**
	     * Creates an instance of seleciton model and returns it.
	     * @returns {module:model/selection} - A new instance
	     * @private
	     */
	    _createSelectionModel: function() {
	        return new SelectionModel(null, {
	            columnModel: this.columnModel,
	            dataModel: this.dataModel,
	            dimensionModel: this.dimensionModel,
	            coordConverterModel: this.coordConverterModel,
	            renderModel: this.renderModel,
	            focusModel: this.focusModel
	        });
	    },

	    /**
	     * Creates an instance of render model and returns it.
	     * @param  {Object} options - Options
	     * @returns {module:model/render} - A new instance
	     * @private
	     */
	    _createRenderModel: function(options) {
	        var attrs, renderOptions, Constructor;

	        attrs = {
	            emptyMessage: options.emptyMessage,
	            showDummyRows: options.showDummyRows
	        };
	        renderOptions = {
	            columnModel: this.columnModel,
	            dataModel: this.dataModel,
	            dimensionModel: this.dimensionModel,
	            focusModel: this.focusModel,
	            coordRowModel: this.coordRowModel,
	            coordColumnModel: this.coordColumnModel
	        };
	        Constructor = options.notUseSmartRendering ? RenderModel : SmartRenderModel;

	        return new Constructor(attrs, renderOptions);
	    },

	    /**
	     * Creates an instance of summary model and returns it.
	     * @param  {Object} footerOptions - footer options
	     * @returns {module:model/summary} - A new instance
	     * @private
	     */
	    _createSummaryModel: function(footerOptions) {
	        var autoColumnNames = [];

	        if (!footerOptions || !footerOptions.columnContent) {
	            return null;
	        }

	        _.each(footerOptions.columnContent, function(options, columnName) {
	            if (_.isFunction(options.template) && options.useAutoSummary !== false) {
	                autoColumnNames.push(columnName);
	            }
	        });

	        return new SummaryModel(null, {
	            dataModel: this.dataModel,
	            autoColumnNames: autoColumnNames
	        });
	    },

	    /**
	     * Destroy
	     */
	    destroy: function() {
	        _.each(this, function(value, property) {
	            if (value && tui.util.isFunction(value._destroy)) {
	                value._destroy();
	            }
	            if (value && tui.util.isFunction(value.stopListening)) {
	                value.stopListening();
	            }
	            this[property] = null;
	        }, this);
	    }
	});

	module.exports = ModelManager;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview 컬럼 모델
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var Model = __webpack_require__(8);
	var util = __webpack_require__(9);
	var frameConst = __webpack_require__(10).frame;

	/**
	 * 컬럼 모델 데이터를 다루는 객체
	 * @module model/data/columnModel
	 * @extends module:base/model
	 * @ignore
	 */
	var ColumnModel = Model.extend(/**@lends module:model/data/columnModel.prototype */{
	    initialize: function() {
	        Model.prototype.initialize.apply(this, arguments);
	        this.textType = {
	            normal: true,
	            text: true,
	            password: true
	        };
	        this._setColumnModelList(this.get('columnModelList'));
	        this.on('change', this._onChange, this);
	    },

	    defaults: {
	        keyColumnName: null,
	        columnFixCount: 0,
	        metaColumnModelList: [],
	        dataColumnModelList: [],
	        visibleList: [], // 이 리스트는 메타컬럼/데이터컬럼 구분하지 않고 저장
	        hasNumberColumn: true,
	        selectType: '',
	        columnModelMap: {},
	        relationListMap: {},
	        columnMerge: []
	    },

	    /**
	     * 메타컬럼모델들을 초기화한다.
	     * @param {Array} source - 사용자가 입력한 메타컬럼의 셋팅값
	     * @returns {Array} dest - 초기화가 완료된 메타컬럼 모델 리스트
	     * @private
	     */
	    _initializeMetaColumns: function(source) {
	        var dest = [];

	        this._initializeButtonColumn(dest);
	        this._initializeNumberColumn(dest);
	        this._overwriteColumnModelList(dest, source);
	        return dest;
	    },

	    /**
	     * overwrite column model list
	     * @param {Array} dest - destination model list
	     * @param {Array} source - source model list
	     * @private
	     */
	    _overwriteColumnModelList: function(dest, source) {
	        _.each(source, function(columnModel) {
	            this._extendColumnList(columnModel, dest);
	        }, this);
	    },

	    /**
	     * 인자로 넘어온 metaColumnModelList 에 설정값에 맞게 number column 을 추가한다.
	     * @param {Array} metaColumnModelList - Meta column model list
	     * @private
	     */
	    _initializeNumberColumn: function(metaColumnModelList) {
	        var hasNumberColumn = this.get('hasNumberColumn');
	        var numberColumn = {
	            columnName: '_number',
	            align: 'center',
	            title: 'No.',
	            isFixedWidth: true,
	            width: 60
	        };

	        if (!hasNumberColumn) {
	            numberColumn.isHidden = true;
	        }

	        this._extendColumnList(numberColumn, metaColumnModelList);
	    },

	    /**
	     * 인자로 넘어온 metaColumnModelList 에 설정값에 맞게 button column 을 추가한다.
	     * @param {Array} metaColumnModelList - Meta column model listt
	     * @private
	     */
	    _initializeButtonColumn: function(metaColumnModelList) {
	        var selectType = this.get('selectType');
	        var buttonColumn = {
	            columnName: '_button',
	            isHidden: false,
	            align: 'center',
	            editOption: {
	                type: 'mainButton'
	            },
	            isFixedWidth: true,
	            width: 40
	        };

	        if (selectType === 'checkbox') {
	            buttonColumn.title = '<input type="checkbox"/>';
	        } else if (selectType === 'radio') {
	            buttonColumn.title = '선택';
	        } else {
	            buttonColumn.isHidden = true;
	        }

	        this._extendColumnList(buttonColumn, metaColumnModelList);
	    },

	    /**
	     * column을 추가(push)한다.
	     * - 만약 columnName 에 해당하는 columnModel 이 이미 존재한다면 해당 columnModel 을 columnObj 로 확장한다.
	     * @param {object} columnObj 추가할 컬럼모델
	     * @param {Array} columnModelList 컬럼모델 배열
	     * @private
	     */
	    _extendColumnList: function(columnObj, columnModelList) {
	        var columnName = columnObj.columnName;
	        var index = _.findIndex(columnModelList, {columnName: columnName});

	        if (index === -1) {
	            columnModelList.push(columnObj);
	        } else {
	            columnModelList[index] = $.extend(columnModelList[index], columnObj);
	        }
	    },

	    /**
	     * index 에 해당하는 columnModel 을 반환한다.
	     * @param {Number} index    조회할 컬럼모델의 인덱스 값
	     * @param {Boolean} isVisible [isVisible=false] 화면에 노출되는 컬럼모델 기준으로 찾을것인지 여부.
	     * @returns {object} 조회한 컬럼 모델
	     */
	    at: function(index, isVisible) {
	        var columnModelList = isVisible ? this.getVisibleColumnModelList() : this.get('dataColumnModelList');

	        return columnModelList[index];
	    },

	    /**
	     * columnName 에 해당하는 index를 반환한다.
	     * @param {string} columnName   컬럼명
	     * @param {Boolean} isVisible [isVisible=false] 화면에 노출되는 컬럼모델 기준으로 반환할 것인지 여부.
	     * @returns {number} index   컬럼명에 해당하는 인덱스 값
	     */
	    indexOfColumnName: function(columnName, isVisible) {
	        var columnModelList;

	        if (isVisible) {
	            columnModelList = this.getVisibleColumnModelList();
	        } else {
	            columnModelList = this.get('dataColumnModelList');
	        }
	        return _.findIndex(columnModelList, {columnName: columnName});
	    },

	    /**
	     * columnName 이 열고정 영역에 있는 column 인지 반환한다.
	     * @param {String} columnName   컬럼명
	     * @returns {Boolean} 열고정 영역에 존재하는 컬럼인지 여부
	     */
	    isLside: function(columnName) {
	        var index = this.indexOfColumnName(columnName, true);

	        return (index > -1) && (index < this.get('columnFixCount'));
	    },

	    /**
	     * 화면에 노출되는 (!isHidden) 컬럼 모델 리스트를 반환한다.
	     * @param {String} [whichSide] 열고정 영역인지, 열고정이 아닌 영역인지 여부. 지정하지 않았을 경우 전체 visibleList를 반환한다.
	     * @param {boolean} [withMeta=false] 메타컬럼 포함 여부. 지정하지 않으면 데이터컬럼리스트 기준으로 반환한다.
	     * @returns {Array}  조회한 컬럼모델 배열
	     */
	    getVisibleColumnModelList: function(whichSide, withMeta) {
	        var startIndex = withMeta ? 0 : this.getVisibleMetaColumnCount();
	        var visibleColumnFixCount = this.getVisibleColumnFixCount(withMeta);
	        var columnModelList;

	        whichSide = whichSide && whichSide.toUpperCase();

	        if (whichSide === frameConst.L) {
	            columnModelList = this.get('visibleList').slice(startIndex, visibleColumnFixCount);
	        } else if (whichSide === frameConst.R) {
	            columnModelList = this.get('visibleList').slice(visibleColumnFixCount);
	        } else {
	            columnModelList = this.get('visibleList').slice(startIndex);
	        }

	        return columnModelList;
	    },

	    /**
	     * 현재 보여지고 있는 메타컬럼의 카운트를 반환한다.
	     * @returns {number} count
	     */
	    getVisibleMetaColumnCount: function() {
	        var models = this.get('metaColumnModelList');
	        var totalLength = models.length;
	        var hiddenLength = _.where(models, {
	            isHidden: true
	        }).length;

	        return (totalLength - hiddenLength);
	    },

	    /**
	     * 현재 노출되는 컬럼들 중, 고정된 컬럼들(L-side)의 갯수를 반환한다.
	     * @param {boolean} [withMeta=false] 현재 보여지고 있는 메타컬럼의 count를 합칠지 여부
	     * @returns {number} Visible columnFix count
	     */
	    getVisibleColumnFixCount: function(withMeta) {
	        var count = this.get('columnFixCount');
	        var fixedColumns = _.first(this.get('dataColumnModelList'), count);
	        var visibleFixedColumns, visibleCount;

	        visibleFixedColumns = _.filter(fixedColumns, function(column) {
	            return !column.isHidden;
	        });
	        visibleCount = visibleFixedColumns.length;

	        if (withMeta) {
	            visibleCount += this.getVisibleMetaColumnCount();
	        }

	        return visibleCount;
	    },

	    /**
	     * 인자로 받은 columnName 에 해당하는 columnModel 을 반환한다.
	     * @param {String} columnName   컬럼명
	     * @returns {Object} 컬럼명에 해당하는 컬럼모델
	     */
	    getColumnModel: function(columnName) {
	        return this.get('columnModelMap')[columnName];
	    },

	    /**
	     * columnName 에 해당하는 컬럼의 타입이 textType 인지 확인한다.
	     * 랜더링시 html 태그 문자열을 제거할때 사용됨.
	     * @param {String} columnName 컬럼명
	     * @returns {boolean} text 타입인지 여부
	     */
	    isTextType: function(columnName) {
	        return !!this.textType[this.getEditType(columnName)];
	    },

	    /**
	     * 컬럼 모델로부터 editType 을 반환한다.
	     * @param {string} columnName The name of the target column
	     * @returns {string} 해당하는 columnName 의 editType 을 반환한다.
	     */
	    getEditType: function(columnName) {
	        var columnModel = this.getColumnModel(columnName);
	        var editType = 'normal';

	        if (columnName === '_button' || columnName === '_number') {
	            editType = columnName;
	        } else if (columnModel && columnModel.editOption && columnModel.editOption.type) {
	            editType = columnModel.editOption.type;
	        }

	        return editType;
	    },

	    /**
	     * 인자로 받은 컬럼 모델에서 !isHidden 를 만족하는 리스트를 추려서 반환한다.
	     * @param {Array} metaColumnModelList 메타 컬럼 모델 리스트
	     * @param {Array} dataColumnModelList 데이터 컬럼 모델 리스트
	     * @returns {Array}  isHidden 이 설정되지 않은 전체 컬럼 모델 리스트
	     * @private
	     */
	    _makeVisibleColumnModelList: function(metaColumnModelList, dataColumnModelList) {
	        metaColumnModelList = metaColumnModelList || this.get('metaColumnModelList');
	        dataColumnModelList = dataColumnModelList || this.get('dataColumnModelList');

	        return _.filter(metaColumnModelList.concat(dataColumnModelList), function(item) {
	            return !item.isHidden;
	        });
	    },

	    /**
	     * 각 columnModel 의 relationList 를 모아 주체가 되는 columnName 기준으로 relationListMap 를 생성하여 반환한다.
	     * @param {Array} columnModelList - Column Model List
	     * @returns {{}|{columnName1: Array, columnName1: Array}} columnName 기준으로 생성된 relationListMap
	     * @private
	     */
	    _getRelationListMap: function(columnModelList) {
	        var relationListMap = {};

	        _.each(columnModelList, function(columnModel) {
	            var columnName = columnModel.columnName;
	            if (columnModel.relationList) {
	                relationListMap[columnName] = columnModel.relationList;
	            }
	        });
	        return relationListMap;
	    },

	    /**
	     * isIgnore 가 true 로 설정된 columnName 의 list 를 반환한다.
	     * @returns {Array} isIgnore 가 true 로 설정된 columnName 배열.
	     */
	    getIgnoredColumnNameList: function() {
	        var columnModelLsit = this.get('dataColumnModelList');
	        var ignoreColumnNameList = [];

	        _.each(columnModelLsit, function(columnModel) {
	            if (columnModel.isIgnore) {
	                ignoreColumnNameList.push(columnModel.columnName);
	            }
	        });
	        return ignoreColumnNameList;
	    },

	    /**
	     * 인자로 받은 columnModel 을 _number, _button 에 대하여 기본 형태로 가공한 뒤,
	     * 메타컬럼과 데이터컬럼을 분리하여 저장한다.
	     * @param {Array} columnModelList   컬럼모델 배열
	     * @param {number} [columnFixCount]   열고정 카운트
	     * @private
	     */
	    _setColumnModelList: function(columnModelList, columnFixCount) {
	        var division, relationListMap, visibleList, metaColumnModelList, dataColumnModelList;

	        columnModelList = $.extend(true, [], columnModelList);
	        if (tui.util.isUndefined(columnFixCount)) {
	            columnFixCount = this.get('columnFixCount');
	        }

	        division = _.partition(columnModelList, function(model) {
	            return util.isMetaColumn(model.columnName);
	        }, this);
	        metaColumnModelList = this._initializeMetaColumns(division[0]);
	        dataColumnModelList = division[1];

	        relationListMap = this._getRelationListMap(dataColumnModelList);
	        visibleList = this._makeVisibleColumnModelList(metaColumnModelList, dataColumnModelList);
	        this.set({
	            metaColumnModelList: metaColumnModelList,
	            dataColumnModelList: dataColumnModelList,
	            columnModelMap: _.indexBy(metaColumnModelList.concat(dataColumnModelList), 'columnName'),
	            relationListMap: relationListMap,
	            columnFixCount: Math.max(0, columnFixCount),
	            visibleList: visibleList
	        }, {
	            silent: true
	        });
	        this.unset('columnModelList', {
	            silent: true
	        });
	        this.trigger('columnModelChange');
	    },

	    /**
	     * change 이벤트 발생시 핸들러
	     * @param {Object} model change 이벤트가 발생한 model 객체
	     * @private
	     */
	    _onChange: function(model) {
	        var changed = model.changed;
	        var columnFixCount = changed.columnFixCount;
	        var columnModelList = changed.columnModelList;

	        if (!columnModelList) {
	            columnModelList = this.get('dataColumnModelList');
	        }
	        this._setColumnModelList(columnModelList, columnFixCount);
	    },

	    /**
	     * Set 'isHidden' property of column model to true or false
	     * @param {Array} columnNames - Column names to set 'isHidden' property
	     * @param {boolean} isHidden - Hidden flag for setting
	     */
	    setHidden: function(columnNames, isHidden) {
	        var name, names, columnModel, visibleList;

	        while (columnNames.length) {
	            name = columnNames.shift();
	            columnModel = this.getColumnModel(name);

	            if (columnModel) {
	                columnModel.isHidden = isHidden;
	            } else {
	                names = this.getUnitColumnNamesIfMerged(name);
	                columnNames.push.apply(columnNames, names);
	            }
	        }

	        visibleList = this._makeVisibleColumnModelList(
	            this.get('metaColumnModelList'),
	            this.get('dataColumnModelList')
	        );
	        this.set('visibleList', visibleList, {
	            silent: true
	        });
	        this.trigger('columnModelChange');
	    },

	    /**
	     * Get unit column names
	     * @param {string} columnName - columnName
	     * @returns {Array.<string>} Unit column names
	     */
	    getUnitColumnNamesIfMerged: function(columnName) {
	        var columnMergeInfoList = this.get('columnMerge');
	        var stackForSearch = [];
	        var searchedNames = [];
	        var name, columnModel, columnMergeInfoItem;

	        stackForSearch.push(columnName);
	        while (stackForSearch.length) {
	            name = stackForSearch.shift();
	            columnModel = this.getColumnModel(name);

	            if (columnModel) {
	                searchedNames.push(name);
	            } else {
	                columnMergeInfoItem = _.findWhere(columnMergeInfoList, {
	                    columnName: name
	                });
	                if (columnMergeInfoItem) {
	                    stackForSearch.push.apply(stackForSearch, columnMergeInfoItem.columnNameList);
	                }
	            }
	        }
	        return _.uniq(searchedNames);
	    },

	    /**
	     * Set footer contents.
	     * (Just trigger 'setFooterContent')
	     * @param {string} columnName - columnName
	     * @param {string} contents - HTML string
	     */
	    setFooterContent: function(columnName, contents) {
	        this.trigger('setFooterContent', columnName, contents);
	    }
	});

	module.exports = ColumnModel;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Base class for Models
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var Backbone = __webpack_require__(3);
	var _ = __webpack_require__(1);

	var common = __webpack_require__(5);

	/**
	 * Base class for Models
	 * @module base/model
	 * @mixes module:base/common
	 * @ignore
	 */
	var Model = Backbone.Model.extend(/**@lends module:base/model.prototype*/{});

	_.assign(Model.prototype, common);

	module.exports = Model;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/**
	* @fileoverview 유틸리티 메서드 모음
	* @author NHN Ent. FE Development Team
	*/
	'use strict';

	var _ = __webpack_require__(1);

	var CELL_BORDER_WIDTH = __webpack_require__(10).dimension.CELL_BORDER_WIDTH;

	/**
	* util 모듈
	* @module util
	* @ignore
	*/
	var util = {
	    uniqueId: 0,
	    /**
	     * HTML Attribute 설정 시 필요한 문자열을 가공한다.
	     * @memberof module:util
	     * @param {{key:value}} attributes  문자열로 가공할 attribute 데이터
	     * @returns {string} html 마크업에 포함될 문자열
	     * @example
	     var str = util.getAttributesString({
	            'class': 'focused disabled',
	            'width': '100',
	            'height': '200'
	      });

	     =>
	     class="focused disabled" width="100" height="200"
	     */
	    getAttributesString: function(attributes) {
	        var str = '';
	        _.each(attributes, function(value, key) {
	            str += ' ' + key + '="' + value + '"';
	        }, this);

	        return str;
	    },

	    /**
	     * 배열의 합을 반환한다.
	     * @memberof module:util
	     * @param {number[]} list   총 합을 구할 number 타입 배열
	     * @returns {number} 합산한 결과값
	     */
	    sum: function(list) {
	        return _.reduce(list, function(memo, value) {
	            memo += value;

	            return memo;
	        }, 0);
	    },

	    /**
	     * Returns the minimum value and the maximum value of the values in array.
	     * @param {Array} arr - Target array
	     * @returns {{min: number, max: number}} Min and Max
	     * @see {@link http://jsperf.com/getminmax}
	     */
	    getMinMax: function(arr) {
	        return {
	            min: Math.min.apply(null, arr),
	            max: Math.max.apply(null, arr)
	        };
	    },

	    /**
	     * Returns the table height including height of rows and borders.
	     * @memberof module:util
	     * @param {number} rowCount - row count
	     * @param {number} rowHeight - row height
	     * @returns {number}
	     */
	    getHeight: function(rowCount, rowHeight) {
	        return rowCount === 0 ? rowCount : rowCount * (rowHeight + CELL_BORDER_WIDTH);
	    },

	    /**
	     * Returns the total number of rows by using the table height and row height.
	     * @memberof module:util
	     * @param {number} tableHeight - table height
	     * @param {number} rowHeight - individual row height
	     * @returns {number}
	     */
	    getDisplayRowCount: function(tableHeight, rowHeight) {
	        return Math.ceil(tableHeight / (rowHeight + CELL_BORDER_WIDTH));
	    },

	    /**
	     * Returns the individual height of a row bsaed on the total number of rows and table height.
	     * @memberof module:util
	     * @param {number} rowCount - row count
	     * @param {number} tableHeight - table height
	     * @returns {number} 한 행당 높이값
	     */
	    getRowHeight: function(rowCount, tableHeight) {
	        return rowCount === 0 ? 0 : Math.floor(((tableHeight - CELL_BORDER_WIDTH) / rowCount));
	    },

	    /**
	     * Returns whether the column of a given name is meta-column.
	     * @param {String} columnName - column name
	     * @returns {Boolean}
	     */
	    isMetaColumn: function(columnName) {
	        return _.contains(['_button', '_number'], columnName);
	    },

	    /**
	     * target 과 dist 의 값을 비교하여 같은지 여부를 확인하는 메서드
	     * === 비교 연산자를 사용하므로, object 의 경우 1depth 까지만 지원함.
	     * @memberof module:util
	     * @param {*} target    동등 비교할 target
	     * @param {*} dist      동등 비교할 dist
	     * @returns {boolean}    동일한지 여부
	     */
	    isEqual: function(target, dist) {
	        var isDiff,
	            compareObject = function(targetObj, distObj) {
	                var result = false;

	                tui.util.forEach(targetObj, function(item, key) {
	                    result = (item === distObj[key]);
	                    return result;
	                });
	                return result;
	            };

	        if (typeof target !== typeof dist) {
	            return false;
	        } else if (_.isArray(target) && target.length !== dist.length) {
	            return false;
	        } else if (_.isObject(target)) {
	            isDiff = !compareObject(target, dist) || !compareObject(dist, target);
	            return !isDiff;
	        } else if (target !== dist) {
	            return false;
	        }
	        return true;
	    },

	    /**
	     * Returns whether the string blank.
	     * @memberof module:util
	     * @param {*} target - target object
	     * @returns {boolean} True if target is undefined or null or ''
	     */
	    isBlank: function(target) {
	        if (_.isString(target)) {
	            return !target.length;
	        }
	        return _.isUndefined(target) || _.isNull(target);
	    },

	    /**
	     * Grid 에서 필요한 형태로 HTML tag 를 제거한다.
	     * @memberof module:util
	     * @param {string} htmlString   html 마크업 문자열
	     * @returns {String} HTML tag 에 해당하는 부분을 제거한 문자열
	     */
	    stripTags: function(htmlString) {
	        var matchResult;
	        htmlString = htmlString.replace(/[\n\r\t]/g, '');
	        if (tui.util.hasEncodableString(htmlString)) {
	            if (/<img/i.test(htmlString)) {
	                matchResult = htmlString.match(/<img[^>]*\ssrc=["']?([^>"']+)["']?[^>]*>/i);
	                htmlString = matchResult ? matchResult[1] : '';
	            } else {
	                htmlString = htmlString.replace(/<button.*?<\/button>/gi, '');
	            }
	            htmlString = $.trim(tui.util.decodeHTMLEntity(
	                htmlString.replace(/<\/?(?:h[1-5]|[a-z]+(?::[a-z]+)?)[^>]*>/ig, '')
	            ));
	        }
	        return htmlString;
	    },

	    /**
	     * Converts the given value to String and returns it.
	     * If the value is undefined or null, returns the empty string.
	     * @param {*} value - value
	     * @returns {String}
	     */
	    toString: function(value) {
	        if (_.isUndefined(value) || _.isNull(value)) {
	            return '';
	        }
	        return String(value);
	    },

	    /**
	     * Create unique key
	     * @memberof module:util
	     * @returns {number} unique key 를 반환한다.
	     */
	    getUniqueKey: function() {
	        this.uniqueId += 1;
	        return this.uniqueId;
	    },

	    /**
	     * object 를 query string 으로 변경한다.
	     * @memberof module:util
	     * @param {object} dataObj  쿼리 문자열으로 반환할 객체
	     * @returns {string} 변환된 쿼리 문자열
	     */
	    toQueryString: function(dataObj) {
	        var queryList = [];

	        _.each(dataObj, function(value, name) {
	            if (!_.isString(value) && !_.isNumber(value)) {
	                value = JSON.stringify(value);
	            }
	            value = encodeURIComponent(value);
	            if (value) {
	                queryList.push(name + '=' + value);
	            }
	        });

	        return queryList.join('&');
	    },

	    /**
	     * queryString 을 object 형태로 변형한다.
	     * @memberof module:util
	     * @param {String} queryString 쿼리 문자열
	     * @returns {Object} 변환한 Object
	     */
	    toQueryObject: function(queryString) {
	        var queryList = queryString.split('&'),
	            obj = {};

	        _.each(queryList, function(query) {
	            var tmp = query.split('='),
	                key, value;

	            key = tmp[0];
	            value = decodeURIComponent(tmp[1]);
	            try {
	                value = JSON.parse(value);
	            } catch(e) {} // eslint-disable-line

	            if (!_.isNull(value)) {
	                obj[key] = value;
	            }
	        });

	        return obj;
	    },

	    /**
	     * type 인자에 맞게 value type 을 convert 한다.
	     * Data.Row 의 List 형태에서 editOption.list 에서 검색을 위해,
	     * value type 해당 type 에 맞게 변환한다.
	     * @memberof module:util
	     * @param {*} value 컨버팅할 value
	     * @param {String} type 컨버팅 될 타입
	     * @returns {*}  타입 컨버팅된 value
	     */
	    convertValueType: function(value, type) {
	        if (type === 'string') {
	            return String(value);
	        } else if (type === 'number') {
	            return Number(value);
	        } else if (type === 'boolean') {
	            return Boolean(value);
	        }
	        return value;
	    },

	    /**
	     * Capitalize first character of the target string.
	     * @param  {string} string Target string
	     * @returns {string} Converted new string
	     */
	    toUpperCaseFirstLetter: function(string) {
	        return string.charAt(0).toUpperCase() + string.slice(1);
	    },

	    /**
	     * Returns a number whose value is limited to the given range.
	     * @param {Number} value - A number to force within given min-max range
	     * @param {Number} min - The lower boundary of the output range
	     * @param {Number} max - The upper boundary of the output range
	     * @returns {number} A number in the range [min, max]
	     * @Example
	     *      // limit the output of this computation to between 0 and 255
	     *      value = clamp(value, 0, 255);
	     */
	    clamp: function(value, min, max) {
	        var temp;
	        if (min > max) { // swap
	            temp = min;
	            min = max;
	            max = temp;
	        }
	        return Math.max(min, Math.min(value, max));
	    },

	    /**
	     * Returns whether the given option is enabled. (Only for values the type of which can be Boolean or Object)
	     * @param {*} option - option value
	     * @returns {Boolean}
	     */
	    isOptionEnabled: function(option) {
	        return _.isObject(option) || option === true;
	    },

	    /**
	     * create style element and append it into the head element.
	     * @param {String} id - element id
	     * @param {String} cssString - css string
	     */
	    appendStyleElement: function(id, cssString) {
	        var style = document.createElement('style');

	        style.type = 'text/css';
	        style.id = id;

	        if (style.styleSheet) {
	            style.styleSheet.cssText = cssString;
	        } else {
	            style.appendChild(document.createTextNode(cssString));
	        }

	        document.getElementsByTagName('head')[0].appendChild(style);
	    },

	    /**
	     * Converts deprecated option values to valid option values.
	     * (For toolbar option which is deprecated since 1.4.0)
	     * @param {Object} options - options (by user)
	     * @returns {Object} converted options
	     */
	    enableDeprecatedOptions: function(options) {
	        var toolbar = options.toolbar;
	        var toolbarDefault = {
	            hasControlPanel: true,
	            hasResizeHandler: true,
	            hasPagination: true
	        };

	        options = $.extend(true, {}, options);

	        if (_.isObject(toolbar)) {
	            _.defaults(toolbar, toolbarDefault);
	        } else {
	            toolbar = {};
	        }

	        if (!util.isOptionEnabled(options.pagination) && toolbar.hasPagination) {
	            options.pagination = true;
	        }
	        if (!util.isOptionEnabled(options.resizeHandle) && toolbar.hasResizeHandler) {
	            options.resizeHandle = true;
	        }
	        if (_.isObject(options.toolbar) && !toolbar.hasControlPanel) {
	            options.toolbar = false;
	        } else if (util.isOptionEnabled(options.toolbar)) {
	            options.toolbar = true;
	        }

	        return options;
	    },

	    /**
	     * Outputs a warning message to the web console.
	     * @param {string} message - message
	     */
	    warning: function(message) {
	        /* eslint-disable no-console */
	        if (console && console.warn) {
	            console.warn(message);
	        }
	        /* eslint-enable no-console */
	    }
	};

	module.exports = util;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/**
	* @fileoverview Object that conatins constant values
	* @author NHN Ent. FE Development Team
	*/
	'use strict';

	var _ = __webpack_require__(1);

	var keyCode = {
	    TAB: 9,
	    ENTER: 13,
	    CTRL: 17,
	    ESC: 27,
	    LEFT_ARROW: 37,
	    UP_ARROW: 38,
	    RIGHT_ARROW: 39,
	    DOWN_ARROW: 40,
	    CHAR_A: 65,
	    CHAR_C: 67,
	    CHAR_F: 70,
	    CHAR_R: 82,
	    CHAR_V: 86,
	    LEFT_WINDOW_KEY: 91,
	    F5: 116,
	    BACKSPACE: 8,
	    SPACE: 32,
	    PAGE_UP: 33,
	    PAGE_DOWN: 34,
	    HOME: 36,
	    END: 35,
	    DEL: 46,
	    UNDEFINED: 229
	};

	module.exports = {
	    keyCode: keyCode,
	    keyName: _.invert(keyCode),
	    renderState: {
	        LOADING: 'LOADING',
	        DONE: 'DONE',
	        EMPTY: 'EMPTY'
	    },
	    dimension: {
	        CELL_BORDER_WIDTH: 1,
	        TABLE_BORDER_WIDTH: 1,
	        RESIZE_HANDLE_WIDTH: 7
	    },
	    frame: {
	        L: 'L',
	        R: 'R'
	    },
	    attrName: {
	        ROW_KEY: 'data-row-key',
	        COLUMN_NAME: 'data-column-name',
	        COLUMN_INDEX: 'data-column-index',
	        EDIT_TYPE: 'data-edit-type',
	        GRID_ID: 'data-grid-id'
	    },
	    themeName: {
	        DEFAULT: 'default',
	        STRIPED: 'striped',
	        CLEAN: 'clean'
	    },
	    selectionType: {
	        CELL: 'CELL',
	        ROW: 'ROW',
	        COLUMN: 'COLUMN'
	    },
	    summaryType: {
	        SUM: 'sum',
	        AVG: 'avg',
	        CNT: 'cnt',
	        MAX: 'max',
	        MIN: 'min'
	    }
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Grid 의 Data Source 에 해당하는 Collection 정의
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var Collection = __webpack_require__(12);
	var Row = __webpack_require__(13);

	/**
	 * Raw 데이터 RowList 콜렉션. (DataSource)
	 * Grid.setRowList 를 사용하여 콜렉션을 설정한다.
	 * @module model/data/rowList
	 * @extends module:base/collection
	 * @param {Array} models - 콜랙션에 추가할 model 리스트
	 * @param {Object} options - 생성자의 option 객체
	 * @ignore
	 */
	var RowList = Collection.extend(/**@lends module:model/data/rowList.prototype */{
	    initialize: function(models, options) {
	        Collection.prototype.initialize.apply(this, arguments);
	        this.setOwnProperties({
	            columnModel: options.columnModel,
	            domState: options.domState,
	            gridId: options.gridId,
	            lastRowKey: -1,
	            originalRowList: [],
	            originalRowMap: {},
	            startIndex: options.startIndex || 1,
	            sortOptions: {
	                columnName: 'rowKey',
	                isAscending: true,
	                useClient: (_.isBoolean(options.useClientSort) ? options.useClientSort : true)
	            },

	            /**
	             * Whether the all rows are disabled.
	             * This state is not related to individual state of each rows.
	             * @type {Boolean}
	             */
	            isDisabled: false
	        });
	        if (!this.sortOptions.useClient) {
	            this.comparator = null;
	        }
	    },

	    model: Row,

	    /**
	     * Backbone 이 collection 생성 시 내부적으로 parse 를 호출하여 데이터를 포멧에 맞게 파싱한다.
	     * @param {Array} data  원본 데이터
	     * @returns {Array}  파싱하여 가공된 데이터
	     */
	    parse: function(data) {
	        data = data && data.contents || data;
	        return this._formatData(data);
	    },

	    /**
	     * 데이터의 _extraData 를 분석하여, Model 에서 사용할 수 있도록 가공한다.
	     * _extraData 필드에 rowSpanData 를 추가한다.
	     * @param {Array} data  가공할 데이터
	     * @returns {Array} 가공된 데이터
	     * @private
	     */
	    _formatData: function(data) {
	        var rowList = _.filter(data, _.isObject);

	        _.each(rowList, function(row, i) {
	            rowList[i] = this._baseFormat(rowList[i]);
	            if (this.isRowSpanEnable()) {
	                this._setExtraRowSpanData(rowList, i);
	            }
	        }, this);

	        return rowList;
	    },

	    /**
	     * row 를 기본 포멧으로 wrapping 한다.
	     * 추가적으로 rowKey 를 할당하고, rowState 에 따라 checkbox 의 값을 할당한다.
	     *
	     * @param {object} row  대상 row 데이터
	     * @param {number} index    해당 row 의 인덱스 정보. rowKey 를 자동 생성할 경우 사용된다.
	     * @returns {object} 가공된 row 데이터
	     * @private
	     */
	    _baseFormat: function(row) {
	        var defaultExtraData = {
	                rowSpan: null,
	                rowSpanData: null,
	                rowState: null
	            },
	            keyColumnName = this.columnModel.get('keyColumnName'),
	            rowKey = (keyColumnName === null) ? this._createRowKey() : row[keyColumnName];

	        row._extraData = $.extend(defaultExtraData, row._extraData);
	        row._button = row._extraData.rowState === 'CHECKED';
	        row.rowKey = rowKey;
	        return row;
	    },

	    /**
	     * 새로운 rowKey를 생성해서 반환한다.
	     * @returns {number} 생성된 rowKey
	     * @private
	     */
	    _createRowKey: function() {
	        this.lastRowKey += 1;
	        return this.lastRowKey;
	    },

	    /**
	     * 랜더링시 사용될 extraData 필드에 rowSpanData 값을 세팅한다.
	     * @param {Array} rowList - 전체 rowList 배열. rowSpan 된 경우 자식 row 의 데이터도 가공해야 하기 때문에 전체 list 를 인자로 넘긴다.
	     * @param {number} index - 해당 배열에서 extraData 를 설정할 배열
	     * @returns {Array} rowList - 가공된 rowList
	     * @private
	     */
	    _setExtraRowSpanData: function(rowList, index) {
	        var row = rowList[index],
	            rowSpan = row && row._extraData && row._extraData.rowSpan,
	            rowKey = row && row.rowKey,
	            subCount, childRow, i;

	        function hasRowSpanData(row, columnName) { // eslint-disable-line no-shadow, require-jsdoc
	            var extraData = row._extraData;
	            return !!(extraData.rowSpanData && extraData.rowSpanData[columnName]);
	        }
	        function setRowSpanData(row, columnName, rowSpanData) { // eslint-disable-line no-shadow, require-jsdoc
	            var extraData = row._extraData;
	            extraData.rowSpanData = extraData && extraData.rowSpanData || {};
	            extraData.rowSpanData[columnName] = rowSpanData;
	            return extraData;
	        }

	        if (rowSpan) {
	            _.each(rowSpan, function(count, columnName) {
	                if (!hasRowSpanData(row, columnName)) {
	                    setRowSpanData(row, columnName, {
	                        count: count,
	                        isMainRow: true,
	                        mainRowKey: rowKey
	                    });
	                    //rowSpan 된 row 의 자식 rowSpanData 를 가공한다.
	                    subCount = -1;
	                    for (i = index + 1; i < index + count; i += 1) {
	                        childRow = rowList[i];
	                        childRow[columnName] = row[columnName];
	                        childRow._extraData = childRow._extraData || {};
	                        setRowSpanData(childRow, columnName, {
	                            count: subCount,
	                            isMainRow: false,
	                            mainRowKey: rowKey
	                        });
	                        subCount -= 1;
	                    }
	                }
	            });
	        }
	        return rowList;
	    },

	    /**
	     * originalRowList 와 originalRowMap 을 생성한다.
	     * @param {Array} [rowList] rowList 가 없을 시 현재 collection 데이터를 originalRowList 로 저장한다.
	     * @returns {Array} format 을 거친 데이터 리스트.
	     */
	    setOriginalRowList: function(rowList) {
	        this.originalRowList = rowList ? this._formatData(rowList) : this.toJSON();
	        this.originalRowMap = _.indexBy(this.originalRowList, 'rowKey');
	        return this.originalRowList;
	    },

	    /**
	     * 원본 데이터 리스트를 반환한다.
	     * @param {boolean} [isClone=true]  데이터 복제 여부.
	     * @returns {Array}  원본 데이터 리스트 배열.
	     */
	    getOriginalRowList: function(isClone) {
	        isClone = _.isUndefined(isClone) ? true : isClone;
	        return isClone ? _.clone(this.originalRowList) : this.originalRowList;
	    },

	    /**
	     * 원본 row 데이터를 반환한다.
	     * @param {(Number|String)} rowKey  데이터의 키값
	     * @returns {Object} 해당 행의 원본 데이터값
	     */
	    getOriginalRow: function(rowKey) {
	        return _.clone(this.originalRowMap[rowKey]);
	    },

	    /**
	     * rowKey 와 columnName 에 해당하는 원본 데이터를 반환한다.
	     * @param {(Number|String)} rowKey  데이터의 키값
	     * @param {String} columnName   컬럼명
	     * @returns {(Number|String)}    rowKey 와 컬럼명에 해당하는 셀의 원본 데이터값
	     */
	    getOriginal: function(rowKey, columnName) {
	        return _.clone(this.originalRowMap[rowKey][columnName]);
	    },

	    /**
	     * mainRowKey 를 반환한다.
	     * @param {(Number|String)} rowKey  데이터의 키값
	     * @param {String} columnName   컬럼명
	     * @returns {(Number|String)}    rowKey 와 컬럼명에 해당하는 셀의 main row 키값
	     */
	    getMainRowKey: function(rowKey, columnName) {
	        var row = this.get(rowKey),
	            rowSpanData;
	        if (this.isRowSpanEnable()) {
	            rowSpanData = row && row.getRowSpanData(columnName);
	            rowKey = rowSpanData ? rowSpanData.mainRowKey : rowKey;
	        }
	        return rowKey;
	    },

	    /**
	     * rowKey 에 해당하는 index를 반환한다.
	     * @param {(Number|String)} rowKey 데이터의 키값
	     * @returns {Number} 키값에 해당하는 row의 인덱스
	     */
	    indexOfRowKey: function(rowKey) {
	        return this.indexOf(this.get(rowKey));
	    },

	    /**
	     * rowSpan 이 적용되어야 하는지 여부를 반환한다.
	     * 랜더링시 사용된다.
	     * - sorted, 혹은 filterd 된 경우 false 를 리턴한다.
	     * @returns {boolean}    랜더링 시 rowSpan 을 해야하는지 여부
	     */
	    isRowSpanEnable: function() {
	        return !this.isSortedByField();
	    },

	    /**
	     * 현재 RowKey가 아닌 다른 컬럼에 의해 정렬된 상태인지 여부를 반환한다.
	     * @returns {Boolean}    정렬된 상태인지 여부
	     */
	    isSortedByField: function() {
	        return this.sortOptions.columnName !== 'rowKey';
	    },

	    /**
	     * 정렬옵션 객체의 값을 변경하고, 변경된 값이 있을 경우 sortChanged 이벤트를 발생시킨다.
	     * @param {string} columnName 정렬할 컬럼명
	     * @param {boolean} isAscending 오름차순 여부
	     * @param {boolean} isRequireFetch 서버 데이타의 갱신이 필요한지 여부
	     */
	    setSortOptionValues: function(columnName, isAscending, isRequireFetch) {
	        var options = this.sortOptions,
	            isChanged = false;

	        if (_.isUndefined(columnName)) {
	            columnName = 'rowKey';
	        }
	        if (_.isUndefined(isAscending)) {
	            isAscending = true;
	        }

	        if (options.columnName !== columnName || options.isAscending !== isAscending) {
	            isChanged = true;
	        }
	        options.columnName = columnName;
	        options.isAscending = isAscending;

	        if (isChanged) {
	            this.trigger('sortChanged', {
	                columnName: columnName,
	                isAscending: isAscending,
	                isRequireFetch: isRequireFetch
	            });
	        }
	    },

	    /**
	     * 주어진 컬럼명을 기준으로 오름/내림차순 정렬한다.
	     * @param {string} columnName 정렬할 컬럼명
	     * @param {boolean} isAscending 오름차순 여부
	     */
	    sortByField: function(columnName, isAscending) {
	        var options = this.sortOptions;

	        if (_.isUndefined(isAscending)) {
	            isAscending = (options.columnName === columnName) ? !options.isAscending : true;
	        }
	        this.setSortOptionValues(columnName, isAscending, !options.useClient);

	        if (options.useClient) {
	            this.sort();
	        }
	    },

	    /**
	     * rowList 를 반환한다.
	     * @param {boolean} [isOnlyChecked=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
	     * @param {boolean} [isRaw=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
	     * @returns {Array} Row List
	     */
	    getRowList: function(isOnlyChecked, isRaw) {
	        var rowList, checkedRowList;

	        if (isOnlyChecked) {
	            checkedRowList = this.where({
	                '_button': true
	            });
	            rowList = [];
	            _.each(checkedRowList, function(checkedRow) {
	                rowList.push(checkedRow.attributes);
	            }, this);
	        } else {
	            rowList = this.toJSON();
	        }
	        return isRaw ? rowList : this._removePrivateProp(rowList);
	    },

	    /**
	     * row Data 값에 변경이 발생했을 경우, sorting 되지 않은 경우에만
	     * rowSpan 된 데이터들도 함께 update 한다.
	     *
	     * @param {object} row row 모델
	     * @param {String} columnName   변경이 발생한 컬럼명
	     * @param {(String|Number)} value 변경된 값
	     */
	    syncRowSpannedData: function(row, columnName, value) {
	        var index, rowSpanData, i;

	        //정렬 되지 않았을 때만 rowSpan 된 데이터들도 함께 update 한다.
	        if (this.isRowSpanEnable()) {
	            rowSpanData = row.getRowSpanData(columnName);
	            if (!rowSpanData.isMainRow) {
	                this.get(rowSpanData.mainRowKey).set(columnName, value);
	            } else {
	                index = this.indexOfRowKey(row.get('rowKey'));
	                for (i = 0; i < rowSpanData.count - 1; i += 1) {
	                    this.at(i + 1 + index).set(columnName, value);
	                }
	            }
	        }
	    },

	    /**
	     * Backbone 에서 sort() 실행시 내부적으로 사용되는 메소드.
	     * @param {Row} a 비교할 앞의 모델
	     * @param {Row} b 비교할 뒤의 모델
	     * @returns {number} a가 b보다 작으면 -1, 같으면 0, 크면 1. 내림차순이면 반대.
	     */
	    comparator: function(a, b) {
	        var columnName = this.sortOptions.columnName;
	        var isAscending = this.sortOptions.isAscending;
	        var valueA = a.get(columnName);
	        var valueB = b.get(columnName);

	        var isEmptyA = _.isNull(valueA) || _.isUndefined(valueA) || valueA === '';
	        var isEmptyB = _.isNull(valueB) || _.isUndefined(valueB) || valueB === '';
	        var result = 0;

	        if (isEmptyA && !isEmptyB) {
	            result = -1;
	        } else if (!isEmptyA && isEmptyB) {
	            result = 1;
	        } else if (valueA < valueB) {
	            result = -1;
	        } else if (valueA > valueB) {
	            result = 1;
	        }

	        if (!isAscending) {
	            result = -result;
	        }
	        return result;
	    },

	    /**
	     * rowList 에서 내부에서만 사용하는 property 를 제거하고 반환한다.
	     * @param {Array} rowList   내부에 설정된 rowList 배열
	     * @returns {Array}  private 프로퍼티를 제거한 결과값
	     * @private
	     */
	    _removePrivateProp: function(rowList) {
	        return _.map(rowList, function(row) {
	            return _.omit(row, Row.privateProperties);
	        });
	    },

	    /**
	     * rowKey 에 해당하는 그리드 데이터를 삭제한다.
	     * @param {(Number|String)} rowKey - 행 데이터의 고유 키
	     * @param {object} options - 삭제 옵션
	     * @param {boolean} options.removeOriginalData - 원본 데이터도 함께 삭제할 지 여부
	     * @param {boolean} options.keepRowSpanData - rowSpan이 mainRow를 삭제하는 경우 데이터를 유지할지 여부
	     */
	    removeRow: function(rowKey, options) {
	        var row = this.get(rowKey),
	            rowSpanData, nextRow, removedData;

	        if (!row) {
	            return;
	        }

	        if (options && options.keepRowSpanData) {
	            removedData = _.clone(row.attributes);
	        }
	        rowSpanData = _.clone(row.getRowSpanData());
	        nextRow = this.at(this.indexOf(row) + 1);

	        this.remove(row, {
	            silent: true
	        });
	        this._syncRowSpanDataForRemove(rowSpanData, nextRow, removedData);

	        if (options && options.removeOriginalData) {
	            this.setOriginalRowList();
	        }
	        this.trigger('remove');
	    },

	    /**
	     * 삭제된 행에 rowSpan이 적용되어 있었을 때, 관련된 행들의 rowSpan데이터를 갱신한다.
	     * @param {object} rowSpanData - 삭제된 행의 rowSpanData
	     * @param {Row} nextRow - 삭제된 다음 행의 모델
	     * @param {object} [removedData] - 삭제된 행의 데이터 (삭제옵션의 keepRowSpanData가 true인 경우에만 넘겨짐)
	     * @private
	     */
	    _syncRowSpanDataForRemove: function(rowSpanData, nextRow, removedData) {
	        if (!rowSpanData) {
	            return;
	        }
	        _.each(rowSpanData, function(data, columnName) {
	            var mainRowSpanData = {},
	                mainRow, startOffset, spanCount;

	            if (data.isMainRow) {
	                if (data.count === 1) {
	                    // if isMainRow is true and count is 1, rowSpanData is meaningless
	                    return;
	                }
	                mainRow = nextRow;
	                spanCount = data.count - 1;
	                startOffset = 1;
	                if (spanCount > 1) {
	                    mainRowSpanData.mainRowKey = mainRow.get('rowKey');
	                    mainRowSpanData.isMainRow = true;
	                }
	                mainRow.set(columnName, (removedData ? removedData[columnName] : ''), {
	                    silent: true
	                });
	            } else {
	                mainRow = this.get(data.mainRowKey);
	                spanCount = mainRow.getRowSpanData(columnName).count - 1;
	                startOffset = -data.count;
	            }

	            if (spanCount > 1) {
	                mainRowSpanData.count = spanCount;
	                mainRow.setRowSpanData(columnName, mainRowSpanData);
	                this._updateSubRowSpanData(mainRow, columnName, startOffset, spanCount);
	            } else {
	                mainRow.setRowSpanData(columnName, null);
	            }
	        }, this);
	    },

	    /**
	     * append, prepend 시 사용할 dummy row를 생성한다.
	     * @returns {Object} 값이 비어있는 더미 row 데이터
	     * @private
	     */
	    _createDummyRow: function() {
	        var columnModelList = this.columnModel.get('dataColumnModelList'),
	            data = {};

	        _.each(columnModelList, function(columnModel) {
	            data[columnModel.columnName] = '';
	        }, this);

	        return data;
	    },

	    /**
	     * Insert the new row with specified data to the end of table.
	     * @param {(Array|Object)} [rowData] - The data for the new row
	     * @param {Object} [options] - Options
	     * @param {Number} [options.at] - The index at which new row will be inserted
	     * @param {Boolean} [options.extendPrevRowSpan] - If set to true and the previous row at target index
	     *        has a rowspan data, the new row will extend the existing rowspan data.
	     * @param {Boolean} [options.focus] - If set to true, move focus to the new row after appending
	     * @returns {Array.<module:model/data/row>} Row model list
	     */
	    append: function(rowData, options) {
	        var modelList = this._createModelList(rowData),
	            addOptions;

	        options = _.extend({at: this.length}, options);
	        addOptions = {
	            at: options.at,
	            add: true,
	            silent: true
	        };

	        this.add(modelList, addOptions);
	        this._syncRowSpanDataForAppend(options.at, modelList.length, options.extendPrevRowSpan);
	        this.trigger('add', modelList, options);

	        return modelList;
	    },

	    /**
	     * 현재 rowList 에 최상단에 데이터를 append 한다.
	     * @param {Object} rowData  prepend 할 행 데이터
	     * @param {object} [options] - Options
	     * @param {boolean} [options.focus] - If set to true, move focus to the new row after appending
	     * @returns {Array.<module:model/data/row>} Row model list
	     */
	    prepend: function(rowData, options) {
	        options = options || {};
	        options.at = 0;

	        return this.append(rowData, options);
	    },

	    /**
	     * rowKey에 해당하는 행의 데이터를 리턴한다. isJsonString을 true로 설정하면 결과를 json객체로 변환하여 리턴한다.
	     * @param {(Number|String)} rowKey  행 데이터의 고유 키
	     * @param {Boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
	     * @returns {Object} 행 데이터
	     */
	    getRowData: function(rowKey, isJsonString) {
	        var row = this.get(rowKey),
	            rowData = row ? row.toJSON() : null;

	        return isJsonString ? JSON.stringify(rowData) : rowData;
	    },

	    /**
	     * 그리드 전체 데이터 중에서 index에 해당하는 순서의 데이터 객체를 리턴한다.
	     * @param {Number} index 행의 인덱스
	     * @param {Boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
	     * @returns {Object} 행 데이터
	     */
	    getRowDataAt: function(index, isJsonString) {
	        var row = this.at(index),
	            rowData = row ? row.toJSON() : null;

	        return isJsonString ? JSON.stringify(row) : rowData;
	    },

	    /**
	     * rowKey 와 columnName 에 해당하는 값을 반환한다.
	     * @param {(Number|String)} rowKey    행 데이터의 고유 키
	     * @param {String} columnName   컬럼 이름
	     * @param {boolean} [isOriginal]  원본 데이터 리턴 여부
	     * @returns {(Number|String|undefined)}    조회한 셀의 값.
	     */
	    getValue: function(rowKey, columnName, isOriginal) {
	        var value, row;

	        if (isOriginal) {
	            value = this.getOriginal(rowKey, columnName);
	        } else {
	            row = this.get(rowKey);
	            value = row && row.get(columnName);
	        }
	        return value;
	    },


	    /**
	     * Sets the vlaue of the cell identified by the specified rowKey and columnName.
	     * @param {(Number|String)} rowKey - rowKey
	     * @param {String} columnName - columnName
	     * @param {(Number|String)} value - value
	     * @param {Boolean} [silent=false] - whether set silently
	     * @returns {Boolean} True if affected row exists
	     */
	    setValue: function(rowKey, columnName, value, silent) {
	        var row = this.get(rowKey);

	        if (row) {
	            row.set(columnName, value, {
	                silent: silent
	            });
	            return true;
	        }
	        return false;
	    },

	    /**
	     * columnName에 해당하는 column data list를 리턴한다.
	     * @param {String} columnName   컬럼명
	     * @param {boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
	     * @returns {Array} 컬럼명에 해당하는 셀들의 데이터 리스트
	     */
	    getColumnValues: function(columnName, isJsonString) {
	        var valueList = this.pluck(columnName);
	        return isJsonString ? JSON.stringify(valueList) : valueList;
	    },

	    /**
	     * columnName 에 해당하는 값을 전부 변경한다.
	     * @param {String} columnName 컬럼명
	     * @param {(Number|String)} columnValue 변경할 컬럼 값
	     * @param {Boolean} [isCheckCellState=true] 셀의 편집 가능 여부 와 disabled 상태를 체크할지 여부
	     * @param {Boolean} [silent=false] change 이벤트 trigger 할지 여부.
	     */
	    setColumnValues: function(columnName, columnValue, isCheckCellState, silent) {
	        var obj = {},
	            cellState = {
	                isDisabled: false,
	                isEditable: true
	            };

	        obj[columnName] = columnValue;
	        isCheckCellState = _.isUndefined(isCheckCellState) ? true : isCheckCellState;

	        this.forEach(function(row) {
	            if (isCheckCellState) {
	                cellState = row.getCellState(columnName);
	            }
	            if (!cellState.isDisabled && cellState.isEditable) {
	                row.set(obj, {
	                    silent: silent
	                });
	            }
	        }, this);
	    },

	    /**
	     * rowKey 와 columnName 에 해당하는 Cell 의 rowSpanData 를 반환한다.
	     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
	     * @param {String} columnName 컬럼 이름
	     * @returns {object} rowSpanData
	     */
	    getRowSpanData: function(rowKey, columnName) {
	        var row = this.get(rowKey);
	        return row ? row.getRowSpanData(columnName) : null;
	    },

	    /**
	     * Returns true if there are at least one row changed.
	     * @returns {boolean} - True if there are at least one row changed.
	     */
	    isChanged: function() {
	        var modifiedRowsArr = _.values(this.getModifiedRowList());

	        return _.some(modifiedRowsArr, function(modifiedRows) {
	            return modifiedRows.length > 0;
	        });
	    },

	    /**
	     * Enables or Disables all rows.
	     * @param  {Boolean} isDisabled - Whether disabled or not
	     */
	    setDisabled: function(isDisabled) {
	        if (this.isDisabled !== isDisabled) {
	            this.isDisabled = isDisabled;
	            this.trigger('disabledChanged');
	        }
	    },

	    /**
	     * rowKey에 해당하는 행을 활성화시킨다.
	     * @param {(Number|String)} rowKey 행 데이터의 고유 키
	     */
	    enableRow: function(rowKey) {
	        this.get(rowKey).setRowState('');
	    },

	    /**
	     * rowKey에 해당하는 행을 비활성화 시킨다.
	     * @param {(Number|String)} rowKey    행 데이터의 고유 키
	     */
	    disableRow: function(rowKey) {
	        this.get(rowKey).setRowState('DISABLED');
	    },

	    /**
	     * rowKey에 해당하는 행의 메인 체크박스를 체크할 수 있도록 활성화 시킨다.
	     * @param {(Number|String)} rowKey 행 데이터의 고유 키
	     */
	    enableCheck: function(rowKey) {
	        this.get(rowKey).setRowState('');
	    },

	    /**
	     * rowKey에 해당하는 행의 메인 체크박스를 체크하지 못하도록 비활성화 시킨다.
	     * @param {(Number|String)} rowKey 행 데이터의 고유 키
	     */
	    disableCheck: function(rowKey) {
	        this.get(rowKey).setRowState('DISABLED_CHECK');
	    },

	    /**
	     * rowKey에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
	     * @param {(Number|String)} rowKey    행 데이터의 고유 키
	     * @param {Boolean} [silent] 이벤트 발생 여부
	     */
	    check: function(rowKey, silent) {
	        var isDisabledCheck = this.get(rowKey).getRowState().isDisabledCheck;
	        var selectType = this.columnModel.get('selectType');

	        if (!isDisabledCheck && selectType) {
	            if (selectType === 'radio') {
	                this.uncheckAll();
	            }
	            this.setValue(rowKey, '_button', true, silent);
	        }
	    },

	    /**
	     * rowKey 에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
	     * @param {(Number|String)} rowKey    행 데이터의 고유 키
	     * @param {Boolean} [silent] 이벤트 발생 여부
	     */
	    uncheck: function(rowKey, silent) {
	        this.setValue(rowKey, '_button', false, silent);
	    },

	    /**
	     * 전체 행을 선택한다.
	     * TODO: disableCheck 행 처리
	     */
	    checkAll: function() {
	        this.setColumnValues('_button', true);
	    },

	    /**
	     * 모든 행을 선택 해제 한다.
	     */
	    uncheckAll: function() {
	        this.setColumnValues('_button', false);
	    },

	    /**
	     * 주어진 데이터로 모델 목록을 생성하여 반환한다.
	     * @param {object|array} rowData - 모델을 생성할 데이터. Array일 경우 여러개를 동시에 생성한다.
	     * @returns {Row[]} 생성된 모델 목록
	     */
	    _createModelList: function(rowData) {
	        var modelList = [],
	            rowList;

	        rowData = rowData || this._createDummyRow();
	        if (!_.isArray(rowData)) {
	            rowData = [rowData];
	        }
	        rowList = this._formatData(rowData);

	        _.each(rowList, function(row) {
	            var model = new Row(row, {
	                collection: this,
	                parse: true
	            });
	            modelList.push(model);
	        }, this);

	        return modelList;
	    },

	    /**
	     * 새로운 행이 추가되었을 때, 관련된 주변 행들의 rowSpan 데이터를 갱신한다.
	     * @param {number} index - 추가된 행의 인덱스
	     * @param {number} length - 추가된 행의 개수
	     * @param {boolean} extendPrevRowSpan - 이전 행의 rowSpan 데이터가 있는 경우 합칠지 여부
	     */
	    _syncRowSpanDataForAppend: function(index, length, extendPrevRowSpan) {
	        var prevRow = this.at(index - 1);

	        if (!prevRow) {
	            return;
	        }
	        _.each(prevRow.getRowSpanData(), function(data, columnName) {
	            var mainRow, mainRowData, startOffset, spanCount;

	            // count 값은 mainRow인 경우 '전체 rowSpan 개수', 아닌 경우는 'mainRow까지의 거리 (음수)'를 의미한다.
	            // 0이면 rowSpan 되어 있지 않다는 의미이다.
	            if (data.count === 0) {
	                return;
	            }
	            if (data.isMainRow) {
	                mainRow = prevRow;
	                mainRowData = data;
	                startOffset = 1;
	            } else {
	                mainRow = this.get(data.mainRowKey);
	                mainRowData = mainRow.getRowSpanData()[columnName];
	                // 루프를 순회할 때 의미를 좀더 명확하게 하기 위해 양수값으로 변경해서 offset 처럼 사용한다.
	                startOffset = -data.count + 1;
	            }

	            if (mainRowData.count > startOffset || extendPrevRowSpan) {
	                mainRowData.count += length;
	                spanCount = mainRowData.count;

	                this._updateSubRowSpanData(mainRow, columnName, startOffset, spanCount);
	            }
	        }, this);
	    },

	    /**
	     * 특정 컬럼의 rowSpan 데이터를 주어진 범위만큼 갱신한다.
	     * @param {Row} mainRow - rowSpan의 첫번째 행
	     * @param {string} columnName - 컬럼명
	     * @param {number} startOffset - mainRow로부터 몇번째 떨어진 행부터 갱신할지를 지정하는 값
	     * @param {number} spanCount - span이 적용될 행의 개수
	     */
	    _updateSubRowSpanData: function(mainRow, columnName, startOffset, spanCount) {
	        var mainRowIdx = this.indexOf(mainRow),
	            mainRowKey = mainRow.get('rowKey'),
	            row, offset;

	        for (offset = startOffset; offset < spanCount; offset += 1) {
	            row = this.at(mainRowIdx + offset);
	            row.set(columnName, mainRow.get(columnName), {
	                silent: true
	            });
	            row.setRowSpanData(columnName, {
	                count: -offset,
	                mainRowKey: mainRowKey,
	                isMainRow: false
	            });
	        }
	    },

	    /**
	     * 해당 row가 수정된 Row인지 여부를 반환한다.
	     * @param {Object} row - row 데이터
	     * @param {Object} originalRow - 원본 row 데이터
	     * @param {Array} filteringColumnList - 비교에서 제외할 컬럼명
	     * @returns {boolean} - 수정여부
	     */
	    _isModifiedRow: function(row, originalRow, filteringColumnList) {
	        var filtered = _.omit(row, filteringColumnList);
	        var result = _.some(filtered, function(value, columnName) {
	            if (typeof value === 'object') {
	                return (JSON.stringify(value) !== JSON.stringify(originalRow[columnName]));
	            }
	            return value !== originalRow[columnName];
	        }, this);

	        return result;
	    },

	    /**
	     * 수정된 rowList 를 반환한다.
	     * @param {Object} options 옵션 객체
	     *      @param {boolean} [options.isOnlyChecked=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
	     *      @param {boolean} [options.isRaw=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
	     *      @param {boolean} [options.isOnlyRowKeyList=false] true 로 설정된 경우 키값만 저장하여 리턴한다.
	     *      @param {Array} [options.filteringColumnList]   행 데이터 중에서 데이터 변경으로 간주하지 않을 컬럼 이름을 배열로 설정한다.
	     * @returns {{createList: Array, updateList: Array, deleteList: Array}} options 조건에 해당하는 수정된 rowList 정보
	     */
	    getModifiedRowList: function(options) {
	        var isRaw = options && options.isRaw,
	            isOnlyChecked = options && options.isOnlyChecked,
	            isOnlyRowKeyList = options && options.isOnlyRowKeyList,
	            original = isRaw ? this.originalRowList : this._removePrivateProp(this.originalRowList),
	            current = isRaw ? this.toJSON() : this._removePrivateProp(this.toJSON()),
	            filteringColumnList = options && options.filteringColumnList,
	            result = {
	                createList: [],
	                updateList: [],
	                deleteList: []
	            };

	        original = _.indexBy(original, 'rowKey');
	        current = _.indexBy(current, 'rowKey');
	        filteringColumnList = _.union(filteringColumnList, this.columnModel.getIgnoredColumnNameList());

	        // 추가/ 수정된 행 추출
	        _.each(current, function(row, rowKey) {
	            var originalRow = original[rowKey],
	                item = isOnlyRowKeyList ? row.rowKey : _.omit(row, filteringColumnList);

	            if (!isOnlyChecked || (isOnlyChecked && this.get(rowKey).get('_button'))) {
	                if (!originalRow) {
	                    result.createList.push(item);
	                } else if (this._isModifiedRow(row, originalRow, filteringColumnList)) {
	                    result.updateList.push(item);
	                }
	            }
	        }, this);

	        //삭제된 행 추출
	        _.each(original, function(obj, rowKey) {
	            var item = isOnlyRowKeyList ? obj.rowKey : _.omit(obj, filteringColumnList);
	            if (!current[rowKey]) {
	                result.deleteList.push(item);
	            }
	        }, this);
	        return result;
	    },

	    /**
	     * rowList 를 설정한다. setRowList 와 다르게 setOriginalRowList 를 호출하여 원본데이터를 갱신하지 않는다.
	     * @param {Array} rowList 설정할 데이터 배열 값
	     * @param {boolean} [isParse=true]  backbone 의 parse 로직을 수행할지 여부
	     * @param {Function} [callback] callback function
	     */
	    replaceRowList: function(rowList, isParse, callback) {
	        if (!rowList) {
	            rowList = [];
	        }
	        if (_.isUndefined(isParse)) {
	            isParse = true;
	        }
	        this.trigger('beforeReset', rowList.length);

	        this.lastRowKey = -1;
	        this.reset(rowList, {
	            parse: isParse
	        });

	        if (_.isFunction(callback)) {
	            callback();
	        }
	    },

	    /**
	     * rowList 를 설정하고, setOriginalRowList 를 호출하여 원본데이터를 갱신한다.
	     * @param {Array} rowList 설정할 데이터 배열 값
	     * @param {boolean} [isParse=true]  backbone 의 parse 로직을 수행할지 여부
	     * @param {function} [callback] 완료시 호출될 함수
	     */
	    setRowList: function(rowList, isParse, callback) {
	        var wrappedCallback = _.bind(function() {
	            this.setOriginalRowList();
	            if (_.isFunction(callback)) {
	                callback();
	            }
	        }, this);

	        this.replaceRowList(rowList, isParse, wrappedCallback);
	    },

	    /**
	     * setRowList()를 통해 그리드에 설정된 초기 데이터 상태로 복원한다.
	     * 그리드에서 수정되었던 내용을 초기화하는 용도로 사용한다.
	     */
	    restore: function() {
	        var originalRowList = this.getOriginalRowList();
	        this.replaceRowList(originalRowList, true);
	    },

	    /**
	     * rowKey 와 columnName 에 해당하는 text 형태의 셀의 값을 삭제한다.
	     * @param {(Number|String)} rowKey 행 데이터의 고유 키
	     * @param {String} columnName 컬럼 이름
	     * @param {Boolean} [silent=false] 이벤트 발생 여부. true 로 변경할 상황은 거의 없다.
	     */
	    del: function(rowKey, columnName, silent) {
	        var mainRowKey = this.getMainRowKey(rowKey, columnName),
	            cellState = this.get(mainRowKey).getCellState(columnName),
	            editType = this.columnModel.getEditType(columnName),
	            isDeletableType = _.contains(['text', 'password'], editType);

	        if (isDeletableType && cellState.isEditable && !cellState.isDisabled) {
	            this.setValue(mainRowKey, columnName, '', silent);
	        }
	    },

	    /**
	     * Calls del() method for multiple cells silently, and trigger 'delRange' event
	     * @param {{row: Array.<number>, column: Array.<number>}} range - visible indexes
	     */
	    delRange: function(range) {
	        var columnModels = this.columnModel.getVisibleColumnModelList();
	        var rowIdxes = _.range(range.row[0], range.row[1] + 1);
	        var columnIdxes = _.range(range.column[0], range.column[1] + 1);
	        var rowKeys, columnNames;

	        rowKeys = _.map(rowIdxes, function(idx) {
	            return this.at(idx).get('rowKey');
	        }, this);

	        columnNames = _.map(columnIdxes, function(idx) {
	            return columnModels[idx].columnName;
	        });

	        _.each(rowKeys, function(rowKey) {
	            _.each(columnNames, function(columnName) {
	                this.del(rowKey, columnName, true);
	                this.get(rowKey).validateCell(columnName, true);
	            }, this);
	        }, this);

	        this.trigger('delRange', rowKeys, columnNames);
	    },

	    /**
	     * 2차원 배열로 된 데이터를 받아 현재 Focus된 셀을 기준으로 하여 각각의 인덱스의 해당하는 만큼 우측 아래 방향으로
	     * 이동하며 셀의 값을 변경한다. 완료한 후 적용된 셀 범위에 Selection을 지정한다.
	     * @param {Array[]} data - 2차원 배열 데이터. 내부배열의 사이즈는 모두 동일해야 한다.
	     * @param {{row: number, column: number}} startIdx - 시작점이 될 셀의 인덱스
	     */
	    paste: function(data, startIdx) {
	        var endIdx = this._getEndIndexToPaste(data, startIdx);

	        _.each(data, function(row, index) {
	            this._setValueForPaste(row, startIdx.row + index, startIdx.column, endIdx.column);
	        }, this);

	        this.trigger('paste', {
	            startIdx: startIdx,
	            endIdx: endIdx
	        });
	    },

	    /**
	     * Validates all data and returns the result.
	     * Return value is an array which contains only rows which have invalid cell data.
	     * @returns {Array.<Object>} An array of error object
	     * @example
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
	        var errorRows = [],
	            requiredColumnNames = _.chain(this.columnModel.getVisibleColumnModelList())
	                .filter(function(columnModel) {
	                    return columnModel.isRequired === true;
	                })
	                .pluck('columnName')
	                .value();

	        this.each(function(row) {
	            var errorCells = [];
	            _.each(requiredColumnNames, function(columnName) {
	                var errorCode = row.validateCell(columnName);
	                if (errorCode) {
	                    errorCells.push({
	                        columnName: columnName,
	                        errorCode: errorCode
	                    });
	                }
	            });
	            if (errorCells.length) {
	                errorRows.push({
	                    rowKey: row.get('rowKey'),
	                    errors: errorCells
	                });
	            }
	        });
	        return errorRows;
	    },

	    /**
	     * 붙여넣기를 실행할 때 끝점이 될 셀의 인덱스를 반환한다.
	     * @param  {Array[]} data - 붙여넣기할 데이터
	     * @param  {{row: number, column: number}} startIdx - 시작점이 될 셀의 인덱스
	     * @returns {{row: number, column: number}} 행과 열의 인덱스 정보를 가진 객체
	     */
	    _getEndIndexToPaste: function(data, startIdx) {
	        var columnModelList = this.columnModel.getVisibleColumnModelList(),
	            rowIdx = data.length + startIdx.row - 1,
	            columnIdx = Math.min(data[0].length + startIdx.column, columnModelList.length) - 1;

	        return {
	            row: rowIdx,
	            column: columnIdx
	        };
	    },

	    /**
	     * 주어진 행 데이터를 지정된 인덱스의 컬럼에 반영한다.
	     * 셀이 수정 가능한 상태일 때만 값을 변경하며, RowSpan이 적용된 셀인 경우 MainRow인 경우에만 값을 변경한다.
	     * @param  {rowData} rowData - 붙여넣을 행 데이터
	     * @param  {number} rowIdx - 행 인덱스
	     * @param  {number} columnStartIdx - 열 시작 인덱스
	     * @param  {number} columnEndIdx - 열 종료 인덱스
	     */
	    _setValueForPaste: function(rowData, rowIdx, columnStartIdx, columnEndIdx) {
	        var row = this.at(rowIdx),
	            columnModel = this.columnModel,
	            attributes = {},
	            columnIdx, columnName, cellState, rowSpanData;

	        if (!row) {
	            row = this.append({})[0];
	        }
	        for (columnIdx = columnStartIdx; columnIdx <= columnEndIdx; columnIdx += 1) {
	            columnName = columnModel.at(columnIdx, true).columnName;
	            cellState = row.getCellState(columnName);
	            rowSpanData = row.getRowSpanData(columnName);

	            if (cellState.isEditable && !cellState.isDisabled && (!rowSpanData || rowSpanData.count >= 0)) {
	                attributes[columnName] = rowData[columnIdx - columnStartIdx];
	            }
	        }
	        row.set(attributes);
	    },

	    /**
	     * rowKey 와 columnName 에 해당하는 td element 를 반환한다.
	     * 내부적으로 자동으로 mainRowKey 를 찾아 반환한다.
	     * @param {(Number|String)} rowKey    행 데이터의 고유 키
	     * @param {String} columnName   컬럼 이름
	     * @returns {jQuery} 해당 jQuery Element
	     */
	    getElement: function(rowKey, columnName) {
	        var mainRowKey = this.getMainRowKey(rowKey, columnName);
	        return this.domState.getElement(mainRowKey, columnName);
	    },

	    /**
	     * Returns the count of check-available rows and checked rows.
	     * @returns {{available: number, checked: number}}
	     */
	    getCheckedState: function() {
	        var available = 0;
	        var checked = 0;

	        this.forEach(function(row) {
	            var buttonState = row.getCellState('_button');

	            if (!buttonState.isDisabled && buttonState.isEditable) {
	                available += 1;
	                if (row.get('_button')) {
	                    checked += 1;
	                }
	            }
	        });

	        return {
	            available: available,
	            checked: checked
	        };
	    }
	});

	module.exports = RowList;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Base class for Collections
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var Backbone = __webpack_require__(3);
	var _ = __webpack_require__(1);

	var common = __webpack_require__(5);

	/**
	 * Base class for Collection
	 * @module base/collection
	 * @mixes module:base/common
	 * @ignore
	 */
	var Collection = Backbone.Collection.extend(/**@lends module:base/collection.prototype */{
	    /**
	     * collection 내 model 들의 event listener 를 제거하고 메모리에서 해제한다.
	     * @returns {object} this object
	     */
	    clear: function() {
	        this.each(function(model) {
	            model.stopListening();
	            model = null;
	        });
	        this.reset([], {silent: true});

	        return this;
	    }
	});

	_.assign(Collection.prototype, common);

	module.exports = Collection;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Grid 의 Data Source 에 해당하는 Model 정의
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var Model = __webpack_require__(8);
	var ExtraDataManager = __webpack_require__(14);
	var util = __webpack_require__(9);
	var classNameConst = __webpack_require__(15);

	// Propertie names that indicate meta data
	var PRIVATE_PROPERTIES = [
	    '_button',
	    '_number',
	    '_extraData'
	];

	// Error code for validtaion
	var VALID_ERR_REQUIRED = 'REQUIRED';
	var VALID_ERR_TYPE_NUMBER = 'TYPE_NUMBER';

	/**
	 * Data 중 각 행의 데이터 모델 (DataSource)
	 * @module model/data/row
	 * @extends module:base/model
	 * @ignore
	 */
	var Row = Model.extend(/**@lends module:model/data/row.prototype */{
	    initialize: function() {
	        Model.prototype.initialize.apply(this, arguments);
	        this.extraDataManager = new ExtraDataManager(this.get('_extraData'));

	        this.columnModel = this.collection.columnModel;
	        this.validateMap = {};
	        this.on('change', this._onChange, this);
	    },

	    idAttribute: 'rowKey',

	    /**
	     * Overrides Backbone's parse method for extraData not to be null.
	     * @override
	     * @param  {object} data - initial data
	     * @returns {object} - parsed data
	     */
	    parse: function(data) {
	        if (!data._extraData) {
	            data._extraData = {};
	        }
	        return data;
	    },

	    /**
	     * Event handler for change event in _extraData.
	     * Reset _extraData value with cloned object to trigger 'change:_extraData' event.
	     * @private
	     */
	    _triggerExtraDataChangeEvent: function() {
	        this.trigger('extraDataChanged', this.get('_extraData'));
	    },

	    /**
	     * Event handler for 'change' event.
	     * Executes callback functions, sync rowspan data, and validate data.
	     * @private
	     */
	    _onChange: function() {
	        var publicChanged = _.omit(this.changed, PRIVATE_PROPERTIES);

	        if (this.isDuplicatedPublicChanged(publicChanged)) {
	            return;
	        }
	        _.each(publicChanged, function(value, columnName) {
	            var columnModel = this.columnModel.getColumnModel(columnName);
	            if (!columnModel) {
	                return;
	            }
	            if (!this._executeChangeBeforeCallback(columnName)) {
	                return;
	            }
	            this.collection.syncRowSpannedData(this, columnName, value);
	            this._executeChangeAfterCallback(columnName);
	            this.validateCell(columnName, true);
	        }, this);
	    },

	    /**
	     * Validate the cell data of given columnName and returns the error code.
	     * @param  {Object} columnName - Column name
	     * @returns {String} Error code
	     * @private
	     */
	    _validateCellData: function(columnName) {
	        var columnModel = this.columnModel.getColumnModel(columnName);
	        var value = this.get(columnName);
	        var errorCode = '';

	        if (columnModel.isRequired && util.isBlank(value)) {
	            errorCode = VALID_ERR_REQUIRED;
	        } else if (columnModel.dataType === 'number' && !_.isNumber(value)) {
	            errorCode = VALID_ERR_TYPE_NUMBER;
	        }
	        return errorCode;
	    },

	    /**
	     * Validate a cell of given columnName.
	     * If the data is invalid, add 'invalid' class name to the cell.
	     * @param {String} columnName - Target column name
	     * @param {Boolean} isDataChanged - True if data is changed (called by onChange handler)
	     * @returns {String} - Error code
	     */
	    validateCell: function(columnName, isDataChanged) {
	        var errorCode;

	        if (!isDataChanged && (columnName in this.validateMap)) {
	            return this.validateMap[columnName];
	        }

	        errorCode = this._validateCellData(columnName);
	        if (errorCode) {
	            this.addCellClassName(columnName, classNameConst.CELL_INVALID);
	        } else {
	            this.removeCellClassName(columnName, classNameConst.CELL_INVALID);
	        }
	        this.validateMap[columnName] = errorCode;

	        return errorCode;
	    },

	    /**
	     * columnModel 에 정의된 changeCallback 을 수행할 때 전달핼 이벤트 객체를 생성한다.
	     * @param {String} columnName 컬럼명
	     * @returns {{rowKey: (number|string), columnName: string, columnData: *, instance: {object}}}
	     *          changeCallback 에 전달될 이벤트 객체
	     * @private
	     */
	    _createChangeCallbackEvent: function(columnName) {
	        return {
	            rowKey: this.get('rowKey'),
	            columnName: columnName,
	            value: this.get(columnName),
	            instance: tui.Grid.getInstanceById(this.collection.gridId)
	        };
	    },

	    /**
	     * columnModel 에 정의된 changeBeforeCallback 을 수행한다.
	     * changeBeforeCallback 의 결과가 false 일 때, 데이터를 복원후 false 를 반환한다.
	     * @param {String} columnName   컬럼명
	     * @returns {boolean} changeBeforeCallback 수행 결과값
	     * @private
	     */
	    _executeChangeBeforeCallback: function(columnName) {
	        var columnModel = this.columnModel.getColumnModel(columnName),
	            changeEvent, obj;

	        if (columnModel.editOption && columnModel.editOption.changeBeforeCallback) {
	            changeEvent = this._createChangeCallbackEvent(columnName);

	            if (columnModel.editOption.changeBeforeCallback(changeEvent) === false) {
	                obj = {};
	                obj[columnName] = this.previous(columnName);
	                this.set(obj);
	                this.trigger('restore', columnName);
	                return false;
	            }
	        }
	        return true;
	    },

	    /**
	     * columnModel 에 정의된 changeAfterCallback 을 수행한다.
	     * @param {String} columnName - 컬럼명
	     * @returns {boolean} changeAfterCallback 수행 결과값
	     * @private
	     */
	    _executeChangeAfterCallback: function(columnName) {
	        var columnModel = this.columnModel.getColumnModel(columnName),
	            changeEvent;

	        if (columnModel.editOption && columnModel.editOption.changeAfterCallback) {
	            changeEvent = this._createChangeCallbackEvent(columnName);
	            return !!(columnModel.editOption.changeAfterCallback(changeEvent));
	        }
	        return true;
	    },

	    /**
	     * Returns the Array of private property names
	     * @returns {array} An array of private property names
	     */
	    getPrivateProperties: function() {
	        return PRIVATE_PROPERTIES;
	    },

	    /**
	     * Returns the object that contains rowState info.
	     * @returns {{isDisabled: boolean, isDisabledCheck: boolean, isChecked: boolean}} rowState 정보
	     */
	    getRowState: function() {
	        return this.extraDataManager.getRowState();
	    },

	    /**
	     * Returns an array of all className, related with given columnName.
	     * @param {String} columnName - Column name
	     * @returns {Array.<String>} - An array of classNames
	     */
	    getClassNameList: function(columnName) {
	        var columnModel = this.columnModel.getColumnModel(columnName),
	            isMetaColumn = util.isMetaColumn(columnName),
	            classNameList = this.extraDataManager.getClassNameList(columnName),
	            cellState = this.getCellState(columnName);

	        if (columnModel.className) {
	            classNameList.push(columnModel.className);
	        }
	        if (columnModel.isEllipsis) {
	            classNameList.push(classNameConst.CELL_ELLIPSIS);
	        }
	        if (columnModel.isRequired) {
	            classNameList.push(classNameConst.CELL_REQUIRED);
	        }
	        if (isMetaColumn) {
	            classNameList.push(classNameConst.CELL_HEAD);
	        } else if (cellState.isEditable) {
	            classNameList.push(classNameConst.CELL_EDITABLE);
	        }
	        if (cellState.isDisabled) {
	            classNameList.push(classNameConst.CELL_DISABLED);
	        }

	        return this._makeUniqueStringArray(classNameList);
	    },

	    /**
	     * Returns a new array, which splits all comma-separated strings in the targetList and removes duplicated item.
	     * @param  {Array} targetArray - Target array
	     * @returns {Array} - New array
	     */
	    _makeUniqueStringArray: function(targetArray) {
	        var singleStringArray = _.uniq(targetArray.join(' ').split(' '));
	        return _.without(singleStringArray, '');
	    },

	    /**
	     * Returns the state of the cell identified by a given column name.
	     * @param {String} columnName - column name
	     * @returns {{isEditable: boolean, isDisabled: boolean}}
	     */
	    getCellState: function(columnName) {
	        var notEditableTypeList = ['_number', 'normal'],
	            columnModel = this.columnModel,
	            isDisabled = this.collection.isDisabled,
	            isEditable = true,
	            editType = columnModel.getEditType(columnName),
	            rowState, relationResult;

	        relationResult = this.executeRelationCallbacksAll(['isDisabled', 'isEditable'])[columnName];
	        rowState = this.getRowState();

	        if (!isDisabled) {
	            if (columnName === '_button') {
	                isDisabled = rowState.isDisabledCheck;
	            } else {
	                isDisabled = rowState.isDisabled;
	            }
	            isDisabled = isDisabled || !!(relationResult && relationResult.isDisabled);
	        }

	        if (_.contains(notEditableTypeList, editType)) {
	            isEditable = false;
	        } else {
	            isEditable = !(relationResult && relationResult.isEditable === false);
	        }

	        return {
	            isEditable: isEditable,
	            isDisabled: isDisabled
	        };
	    },

	    /**
	     * Returns whether the cell identified by a given column name is editable.
	     * @param {String} columnName - column name
	     * @returns {Boolean}
	     */
	    isEditable: function(columnName) {
	        var cellState = this.getCellState(columnName);

	        return !cellState.isDisabled && cellState.isEditable;
	    },

	    /**
	     * Returns whether the cell identified by a given column name is disabled.
	     * @param {String} columnName - column name
	     * @returns {Boolean}
	     */
	    isDisabled: function(columnName) {
	        var cellState = this.getCellState(columnName);

	        return cellState.isDisabled;
	    },

	    /**
	     * getRowSpanData
	     * rowSpan 설정값을 반환한다.
	     * @param {String} [columnName] 인자가 존재하지 않을 경우, 행 전체의 rowSpanData 를 맵 형태로 반환한다.
	     * @returns {*|{count: number, isMainRow: boolean, mainRowKey: *}}   rowSpan 설정값
	     */
	    getRowSpanData: function(columnName) {
	        var isRowSpanEnable = this.collection.isRowSpanEnable(),
	            rowKey = this.get('rowKey');

	        return this.extraDataManager.getRowSpanData(columnName, rowKey, isRowSpanEnable);
	    },

	    /**
	     * Returns the _extraData.height
	     * @returns {number}
	     */
	    getHeight: function() {
	        return this.extraDataManager.getHeight();
	    },

	    /**
	     * Sets the height of the row
	     * @param {number} height - height
	     */
	    setHeight: function(height) {
	        this.extraDataManager.setHeight(height);
	        this._triggerExtraDataChangeEvent();
	    },

	    /**
	     * rowSpanData를 설정한다.
	     * @param {string} columnName - 컬럼명
	     * @param {object} data - rowSpan 정보를 가진 객체
	     */
	    setRowSpanData: function(columnName, data) {
	        this.extraDataManager.setRowSpanData(columnName, data);
	        this._triggerExtraDataChangeEvent();
	    },

	    /**
	     * rowState 를 설정한다.
	     * @param {string} rowState 해당 행의 상태값. 'DISABLED|DISABLED_CHECK|CHECKED' 중 하나를 설정한다.
	     * @param {boolean} silent 내부 change 이벤트 발생 여부
	     */
	    setRowState: function(rowState, silent) {
	        this.extraDataManager.setRowState(rowState);
	        if (!silent) {
	            this._triggerExtraDataChangeEvent();
	        }
	    },

	    /**
	     * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 설정한다.
	     * @param {String} columnName 컬럼 이름
	     * @param {String} className 지정할 디자인 클래스명
	     */
	    addCellClassName: function(columnName, className) {
	        this.extraDataManager.addCellClassName(columnName, className);
	        this._triggerExtraDataChangeEvent();
	    },

	    /**
	     * rowKey에 해당하는 행 전체에 CSS className 을 설정한다.
	     * @param {String} className 지정할 디자인 클래스명
	     */
	    addClassName: function(className) {
	        this.extraDataManager.addClassName(className);
	        this._triggerExtraDataChangeEvent();
	    },

	    /**
	     * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 제거한다.
	     * @param {String} columnName 컬럼 이름
	     * @param {String} className 지정할 디자인 클래스명
	     */
	    removeCellClassName: function(columnName, className) {
	        this.extraDataManager.removeCellClassName(columnName, className);
	        this._triggerExtraDataChangeEvent();
	    },

	    /**
	     * rowKey 에 해당하는 행 전체에 CSS className 을 제거한다.
	     * @param {String} className 지정할 디자인 클래스명
	     */
	    removeClassName: function(className) {
	        this.extraDataManager.removeClassName(className);
	        this._triggerExtraDataChangeEvent();
	    },

	    /**
	     * ctrl + c 로 복사 기능을 사용할 때 list 형태(select, button, checkbox)의 cell 의 경우, 해당 value 에 부합하는 text로 가공한다.
	     * List type 의 경우 데이터 값과 editOption.list 의 text 값이 다르기 때문에
	     * text 로 전환해서 반환할 때 처리를 하여 변환한다.
	     *
	     * @param {String} columnName   컬럼명
	     * @returns {String} text 형태로 가공된 문자열
	     * @private
	     */
	    _getListTypeVisibleText: function(columnName) {
	        var value = this.get(columnName);
	        var columnModel = this.columnModel.getColumnModel(columnName);
	        var resultOptionList, editOptionList, typeExpected, valueList;

	        if (tui.util.isExisty(tui.util.pick(columnModel, 'editOption', 'list'))) {
	            resultOptionList = this.executeRelationCallbacksAll(['optionListChange'])[columnName];
	            editOptionList = resultOptionList && resultOptionList.optionList ?
	                    resultOptionList.optionList : columnModel.editOption.list;

	            typeExpected = typeof editOptionList[0].value;
	            valueList = util.toString(value).split(',');
	            if (typeExpected !== typeof valueList[0]) {
	                valueList = _.map(valueList, function(val) {
	                    return util.convertValueType(val, typeExpected);
	                });
	            }
	            _.each(valueList, function(val, index) {
	                var item = _.findWhere(editOptionList, {value: val});
	                valueList[index] = item && item.value || '';
	            }, this);

	            return valueList.join(',');
	        }
	        return '';
	    },

	    /**
	     * Returns whether the given edit type is list type.
	     * @param {String} editType - edit type
	     * @returns {Boolean}
	     * @private
	     */
	    _isListType: function(editType) {
	        return _.contains(['select', 'radio', 'checkbox'], editType);
	    },

	    /**
	     * change 이벤트 발생시 동일한 changed 객체의 public 프라퍼티가 동일한 경우 중복 처리를 막기 위해 사용한다.
	     * 10ms 내에 같은 객체로 함수 호출이 일어나면 true를 반환한다.
	     * @param {object} publicChanged 비교할 객체
	     * @returns {boolean} 중복이면 true, 아니면 false
	     */
	    isDuplicatedPublicChanged: function(publicChanged) {
	        if (this._timeoutIdForChanged && _.isEqual(this._lastPublicChanged, publicChanged)) {
	            return true;
	        }
	        clearTimeout(this._timeoutIdForChanged);
	        this._timeoutIdForChanged = setTimeout(_.bind(function() {
	            this._timeoutIdForChanged = null;
	        }, this), 10); // eslint-disable-line no-magic-numbers
	        this._lastPublicChanged = publicChanged;

	        return false;
	    },

	    /**
	     * Returns the text string to be used when copying the cell value to clipboard.
	     * @param {String} columnName - column name
	     * @returns {String}
	     */
	    getValueString: function(columnName) {
	        var editType = this.columnModel.getEditType(columnName);
	        var column = this.columnModel.getColumnModel(columnName);
	        var value = this.get(columnName);

	        if (this._isListType(editType)) {
	            if (tui.util.isExisty(tui.util.pick(column, 'editOption', 'list', 0, 'value'))) {
	                value = this._getListTypeVisibleText(columnName);
	            } else {
	                throw this.error('Check "' + columnName + '"\'s editOption.list property out in your ColumnModel.');
	            }
	        } else if (editType === 'password') {
	            value = '';
	        }

	        return util.toString(value);
	    },

	    /**
	     * 컬럼모델에 정의된 relation 들을 수행한 결과를 반환한다. (기존 affectOption)
	     * @param {Array} callbackNameList 반환값의 결과를 확인할 대상 callbackList.
	     *        (default : ['optionListChange', 'isDisabled', 'isEditable'])
	     * @returns {{}|{columnName: {attribute: *}}} row 의 columnName 에 적용될 속성값.
	     */
	    executeRelationCallbacksAll: function(callbackNameList) {
	        var rowData = this.attributes,
	            relationListMap = this.columnModel.get('relationListMap'),
	            result = {};

	        if (_.isEmpty(callbackNameList)) {
	            callbackNameList = ['optionListChange', 'isDisabled', 'isEditable'];
	        }

	        _.each(relationListMap, function(relationList, columnName) {
	            var value = rowData[columnName];

	            _.each(relationList, function(relation) {
	                this._executeRelationCallback(relation, callbackNameList, value, rowData, result);
	            }, this);
	        }, this);

	        return result;
	    },

	    /**
	     * Returns a name of attribute matching given callbackName.
	     * @param {string} callbackName - callback name
	     * @private
	     * @returns {string}
	     */
	    _getRelationResultAttrName: function(callbackName) {
	        switch (callbackName) {
	            case 'optionListChange':
	                return 'optionList';
	            case 'isDisabled':
	                return 'isDisabled';
	            case 'isEditable':
	                return 'isEditable';
	            default:
	                return '';
	        }
	    },

	    /**
	     * Executes relation callback
	     * @param {object} relation - relation object
	     *   @param {array} relation.columnList - target column list
	     *   @param {function} [relation.isDisabled] - callback function for isDisabled attribute
	     *   @param {function} [relation.isEditable] - callback function for isDisabled attribute
	     *   @param {function} [relation.optionListChange] - callback function for changing option list
	     * @param {array} callbackNameList - an array of callback names
	     * @param {(string|number)} value - cell value
	     * @param {object} rowData - all value of the row
	     * @param {object} result - object to store the result of callback functions
	     * @private
	     */
	    _executeRelationCallback: function(relation, callbackNameList, value, rowData, result) {
	        var rowState = this.getRowState(),
	            targetColumnNames = relation.columnList;

	        _.each(callbackNameList, function(callbackName) {
	            var attrName, callback;

	            if (!rowState.isDisabled || callbackName !== 'isDisabled') {
	                callback = relation[callbackName];
	                if (typeof callback === 'function') {
	                    attrName = this._getRelationResultAttrName(callbackName);
	                    if (attrName) {
	                        _.each(targetColumnNames, function(targetColumnName) {
	                            result[targetColumnName] = result[targetColumnName] || {};
	                            result[targetColumnName][attrName] = callback(value, rowData);
	                        }, this);
	                    }
	                }
	            }
	        }, this);
	    }
	}, {
	    privateProperties: PRIVATE_PROPERTIES
	});

	module.exports = Row;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Grid 의 Data Source 에 해당하는 Model 정의
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	/**
	 * Data 중 각 행의 데이터 모델 (DataSource)
	 * @module data/row
	 * @param {Object} data - Data object
	 * @extends module:base/model
	 * @ignore
	 */
	var ExtraDataManager = tui.util.defineClass(/**@lends module:model/data/extraData.prototype */{
	    init: function(data) {
	        this.data = data || {};
	    },

	    /**
	     * Returns rowSpan data
	     * @param  {string} columnName - column name
	     * @param  {(number|string)} rowKey - rowKey
	     * @param  {boolean} isRowSpanEnable - Boolean value whether row span is enable.
	     * @returns {*|{count: number, isMainRow: boolean, mainRowKey: *}} rowSpan data
	     */
	    getRowSpanData: function(columnName, rowKey, isRowSpanEnable) {
	        var rowSpanData = null;

	        if (isRowSpanEnable) {
	            rowSpanData = this.data.rowSpanData;
	            if (columnName && rowSpanData) {
	                rowSpanData = rowSpanData[columnName];
	            }
	        }

	        if (!rowSpanData && columnName) {
	            rowSpanData = {
	                count: 0,
	                isMainRow: true,
	                mainRowKey: rowKey
	            };
	        }
	        return rowSpanData;
	    },

	    /**
	     * Returns the object that contains rowState info.
	     * @returns {{isDisabled: boolean, isDisabledCheck: boolean, isChecked: boolean}} rowState 정보
	     */
	    getRowState: function() {
	        var result = {
	            isDisabledCheck: false,
	            isDisabled: false,
	            isChecked: false
	        };

	        switch (this.data.rowState) {
	            case 'DISABLED':
	                result.isDisabled = true;
	                // intentional no break
	            case 'DISABLED_CHECK': // eslint-disable-line no-fallthrough
	                result.isDisabledCheck = true;
	                break;
	            case 'CHECKED':
	                result.isChecked = true;
	            default: // eslint-disable-line no-fallthrough
	        }
	        return result;
	    },

	    /**
	     * Sets the rowSate.
	     * @param {string} rowState - 'DISABLED' | 'DISABLED_CHECK' | 'CHECKED'
	     */
	    setRowState: function(rowState) {
	        this.data.rowState = rowState;
	    },

	    /**
	     * Sets the rowSpanData.
	     * @param {string} columnName - Column name
	     * @param {object} data - Data
	     */
	    setRowSpanData: function(columnName, data) {
	        var rowSpanData = _.assign({}, this.data.rowSpanData);

	        if (!columnName) {
	            return;
	        }
	        if (!data) {
	            if (rowSpanData[columnName]) {
	                delete rowSpanData[columnName];
	            }
	        } else {
	            rowSpanData[columnName] = data;
	        }
	        this.data.rowSpanData = rowSpanData;
	    },

	    /**
	     * Adds className to the cell
	     * @param {String} columnName - Column name
	     * @param {String} className - Class name
	     */
	    addCellClassName: function(columnName, className) {
	        var classNameData, classNameList;

	        classNameData = this.data.className || {};
	        classNameData.column = classNameData.column || {};
	        classNameList = classNameData.column[columnName] || [];

	        if (!_.contains(classNameList, className)) {
	            classNameList.push(className);
	            classNameData.column[columnName] = classNameList;
	            this.data.className = classNameData;
	        }
	    },

	    /**
	     * Adds className to the row
	     * @param {String} className - Class name
	     */
	    addClassName: function(className) {
	        var classNameData, classNameList;

	        classNameData = this.data.className || {};
	        classNameList = classNameData.row || [];

	        if (tui.util.inArray(className, classNameList) === -1) {
	            classNameList.push(className);
	            classNameData.row = classNameList;
	            this.data.className = classNameData;
	        }
	    },

	    /**
	     * Returns the list of className.
	     * @param {String} [columnName] - If specified, the result will only conatins class names of cell.
	     * @returns {Array} - The array of class names.
	     */
	    getClassNameList: function(columnName) {
	        var classNameData = this.data.className,
	            arrayPush = Array.prototype.push,
	            classNameList = [];

	        if (classNameData) {
	            if (classNameData.row) {
	                arrayPush.apply(classNameList, classNameData.row);
	            }
	            if (columnName && classNameData.column && classNameData.column[columnName]) {
	                arrayPush.apply(classNameList, classNameData.column[columnName]);
	            }
	        }
	        return classNameList;
	    },

	    /**
	     * className 이 담긴 배열로부터 특정 className 을 제거하여 반환한다.
	     * @param {Array} classNameList 디자인 클래스명 리스트
	     * @param {String} className    제거할 클래스명
	     * @returns {Array}  제거된 디자인 클래스명 리스트
	     * @private
	     */
	    _removeClassNameFromArray: function(classNameList, className) {
	        //배열 요소가 'class1 class2' 와 같이 두개 이상의 className을 포함할 수 있어, join & split 함.
	        var singleNameList = classNameList.join(' ').split(' ');
	        return _.without(singleNameList, className);
	    },

	    /**
	     * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 제거한다.
	     * @param {String} columnName 컬럼 이름
	     * @param {String} className 지정할 디자인 클래스명
	     */
	    removeCellClassName: function(columnName, className) {
	        var classNameData = this.data.className;

	        if (tui.util.pick(classNameData, 'column', columnName)) {
	            classNameData.column[columnName] =
	                this._removeClassNameFromArray(classNameData.column[columnName], className);
	            this.data.className = classNameData;
	        }
	    },

	    /**
	     * rowKey 에 해당하는 행 전체에 CSS className 을 제거한다.
	     * @param {String} className 지정할 디자인 클래스명
	     */
	    removeClassName: function(className) {
	        var classNameData = this.data.className;

	        if (classNameData && classNameData.row) {
	            classNameData.row = this._removeClassNameFromArray(classNameData.row, className);
	            this.className = classNameData;
	        }
	    },

	    /**
	     * Sets the height of the row
	     * @param {number} value - value
	     */
	    setHeight: function(value) {
	        this.data.height = value;
	    },

	    /**
	     * Returns the height of the row
	     * @returns {number}
	     */
	    getHeight: function() {
	        return this.data.height;
	    }
	});

	module.exports = ExtraDataManager;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/**
	* @fileoverview class name constants.
	* @author NHN Ent. FE Development Team
	*/
	'use strict';

	var _ = __webpack_require__(1);

	var PREFIX = 'tui-grid-';

	var classNames = {
	    CONTAINER: 'container',
	    CLIPBOARD: 'clipboard',

	    // common
	    NO_SCROLL_X: 'no-scroll-x',
	    NO_SCROLL_Y: 'no-scroll-y',

	    // icon
	    ICO_ARROW: 'icon-arrow',
	    ICO_ARROW_LEFT: 'icon-arrow-left',
	    ICO_ARROW_RIGHT: 'icon-arrow-right',

	    // layer
	    LAYER_STATE: 'layer-state',
	    LAYER_STATE_CONTENT: 'layer-state-content',
	    LAYER_STATE_LOADING: 'layer-state-loading',
	    LAYER_EDITING: 'layer-editing',
	    LAYER_FOCUS: 'layer-focus',
	    LAYER_FOCUS_BORDER: 'layer-focus-border',
	    LAYER_SELECTION: 'layer-selection',
	    LAYER_DATE_PICKER: 'layer-datepicker',

	    // border line
	    BORDER_LINE: 'border-line',
	    BORDER_TOP: 'border-line-top',
	    BORDER_LEFT: 'border-line-left',
	    BORDER_RIGHT: 'border-line-right',
	    BORDER_BOTTOM: 'border-line-bottom',

	    // layout (area)
	    CONTENT_AREA: 'content-area',
	    LSIDE_AREA: 'lside-area',
	    RSIDE_AREA: 'rside-area',
	    HEAD_AREA: 'head-area',
	    BODY_AREA: 'body-area',
	    FOOT_AREA: 'foot-area',
	    FOOT_AREA_RIGHT: 'foot-area-right',

	    // header
	    COLUMN_RESIZE_CONTAINER: 'column-resize-container',
	    COLUMN_RESIZE_HANDLE: 'column-resize-handle',
	    COLUMN_RESIZE_HANDLE_LAST: 'column-resize-handle-last',

	    // body
	    BODY_CONTAINER: 'body-container',
	    BODY_TABLE_CONTAINER: 'table-container',

	    // scrollbar
	    SCROLLBAR_HEAD: 'scrollbar-head',
	    SCROLLBAR_BORDER: 'scrollbar-border',
	    SCROLLBAR_RIGHT_BOTTOM: 'scrollbar-right-bottom',
	    SCROLLBAR_LEFT_BOTTOM: 'scrollbar-left-bottom',

	    // pagination
	    PAGINATION: 'pagination',
	    PAGINATION_PRE: 'pre',
	    PAGINATION_PRE_OFF: 'pre-off',
	    PAGINATION_PRE_END: 'pre-end',
	    PAGINATION_PRE_END_OFF: 'pre-end-off',
	    PAGINATION_NEXT: 'next',
	    PAGINATION_NEXT_OFF: 'next-off',
	    PAGINATION_NEXT_END: 'next-end',
	    PAGINATION_NEXT_END_OFF: 'next-end-off',

	    // table
	    TABLE: 'table',

	    // cell style
	    CELL: 'cell',
	    CELL_HEAD: 'cell-head',
	    CELL_ROW_ODD: 'cell-row-odd',
	    CELL_ROW_EVEN: 'cell-row-even',
	    CELL_EDITABLE: 'cell-editable',
	    CELL_DUMMY: 'cell-dummy',
	    CELL_REQUIRED: 'cell-required',
	    CELL_DISABLED: 'cell-disabled',
	    CELL_SELECTED: 'cell-selected',
	    CELL_INVALID: 'cell-invalid',
	    CELL_ELLIPSIS: 'cell-ellipsis',
	    CELL_CURRENT_ROW: 'cell-current-row',
	    CELL_MAIN_BUTTON: 'cell-main-button',

	    // cell content
	    CELL_CONTENT: 'cell-content',
	    CELL_CONTENT_BEFORE: 'content-before',
	    CELL_CONTENT_AFTER: 'content-after',
	    CELL_CONTENT_INPUT: 'content-input',
	    CELL_CONTENT_TEXT: 'content-text',

	    // buttons
	    BTN_TEXT: 'btn-text',
	    BTN_SORT: 'btn-sorting',
	    BTN_SORT_UP: 'btn-sorting-up',
	    BTN_SORT_DOWN: 'btn-sorting-down',
	    BTN_EXCEL: 'btn-excel-download',
	    BTN_EXCEL_ICON: 'btn-excel-icon',
	    BTN_EXCEL_PAGE: 'btn-excel-page',
	    BTN_EXCEL_ALL: 'btn-excel-all',

	    // toolbar
	    TOOLBAR: 'toolbar',
	    TOOLBAR_BTN_HOLDER: 'toolbar-btn-holder',
	    HEIGHT_RESIZE_BAR: 'height-resize-bar',
	    HEIGHT_RESIZE_HANDLE: 'height-resize-handle',

	    // etc
	    CALENDAR: 'calendar',
	    CALENDAR_BTN_PREV_YEAR: 'calendar-btn-prev-year',
	    CALENDAR_BTN_NEXT_YEAR: 'calendar-btn-next-year',
	    CALENDAR_BTN_PREV_MONTH: 'calendar-btn-prev-month',
	    CALENDAR_BTN_NEXT_MONTH: 'calendar-btn-next-month',
	    CALENDAR_SELECTABLE: 'calendar-selectable',
	    CALENDAR_SELECTED: 'calendar-selected'
	};

	var exports = _.mapObject(classNames, function(className) {
	    return PREFIX + className;
	});
	exports.PREFIX = PREFIX;

	module.exports = exports;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Toolbar model class
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var Model = __webpack_require__(8);
	var isOptionEnabled = __webpack_require__(9).isOptionEnabled;

	/**
	 * Toolbar Model
	 * @module model/toolbar
	 * @extends module:base/model
	 * @ignore
	 */
	var Toolbar = Model.extend(/**@lends module:model/toolbar.prototype */{
	    initialize: function(options) {
	        this.options = options;
	    },

	    defaults: {
	        // deprecated (since 1.4.0)
	        hasControlPanel: false,
	        hasPagination: false,
	        hasResizeHandler: false,

	        // excel button visibility
	        isExcelButtonVisible: false,
	        isExcelAllButtonVisible: false
	    },

	    /**
	     * Returns whether the toolbar is enabled
	     * @returns {Boolean} True if the toolbar is enbaled
	     */
	    isEnabled: function() {
	        return isOptionEnabled(this.options);
	    }
	});

	module.exports = Toolbar;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview module:model/dimension
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var Model = __webpack_require__(8);
	var dimensionConstMap = __webpack_require__(10).dimension;

	var TABLE_BORDER_WIDTH = dimensionConstMap.TABLE_BORDER_WIDTH;
	var CELL_BORDER_WIDTH = dimensionConstMap.CELL_BORDER_WIDTH;

	/**
	 * Manage values about dimension (layout)
	 * @module model/dimension
	 * @param {Object} attrs - Attributes
	 * @param {Object} options - Options
	 * @extends module:base/model
	 * @ignore
	 */
	var Dimension = Model.extend(/**@lends module:model/dimension.prototype */{
	    initialize: function(attrs, options) {
	        Model.prototype.initialize.apply(this, arguments);

	        this.columnModel = options.columnModel;
	        this.dataModel = options.dataModel;
	        this.domState = options.domState;

	        this.on('change:isFixedHeight', this._resetSyncHeightHandler);

	        this._resetSyncHeightHandler();
	    },

	    defaults: {
	        offsetLeft: 0,
	        offsetTop: 0,

	        width: 0,

	        headerHeight: 0,
	        bodyHeight: 0,
	        footerHeight: 0,

	        toolbarHeight: 0,
	        resizeHandleHeight: 0,
	        paginationHeight: 0,

	        rowHeight: 0,
	        totalRowHeight: 0,
	        isFixedRowHeight: true,

	        rsideWidth: 0,
	        lsideWidth: 0,

	        minimumColumnWidth: 0,
	        scrollBarSize: 17,
	        scrollX: true,
	        scrollY: true,
	        fitToParentHeight: false,
	        isFixedHeight: false
	    },

	    /**
	     * Attach/Detach event handler of change:totalRowHeight event based on the isFixedHeight.
	     * @private
	     */
	    _resetSyncHeightHandler: function() {
	        if (this.get('isFixedHeight')) {
	            this.off('change:totalRowHeight');
	        } else {
	            this.on('change:totalRowHeight', this._syncBodyHeightWithTotalRowHeight);
	        }
	    },

	    /**
	     * Sets the bodyHeight value based on the totalRowHeight value.
	     * @private
	     */
	    _syncBodyHeightWithTotalRowHeight: function() {
	        var currBodyHeight = this.get('bodyHeight');
	        var realBodyHeight = this.get('totalRowHeight') + this.getScrollXHeight();

	        this.set('bodyHeight', Math.max(currBodyHeight, realBodyHeight));
	    },

	    /**
	     * Returns whether division border (between meta column and data column) is doubled or not.
	     * Division border should be doubled only if visible fixed data column exists.
	     * @returns {Boolean}
	     */
	    isDivisionBorderDoubled: function() {
	        return this.columnModel.getVisibleColumnFixCount() > 0;
	    },

	    /**
	     * 전체 넓이에서 스크롤바, border등의 넓이를 제외하고 실제 셀의 넓이에 사용되는 값만 반환한다.
	     * @param {number} columnLength - 컬럼의 개수
	     * @returns {number} 사용가능한 전체 셀의 넓이
	     * @private
	     */
	    getAvailableTotalWidth: function(columnLength) {
	        var totalWidth = this.get('width');
	        var borderCount = columnLength + 1 + (this.isDivisionBorderDoubled() ? 1 : 0);
	        var totalBorderWidth = borderCount * CELL_BORDER_WIDTH;
	        var availableTotalWidth = totalWidth - this.getScrollYWidth() - totalBorderWidth;

	        return availableTotalWidth;
	    },

	    /**
	     * Calc body size of grid except scrollBar
	     * @returns {{height: number, totalWidth: number, rsideWidth: number}} Body size
	     */
	    getBodySize: function() {
	        var lsideWidth = this.get('lsideWidth'),
	            rsideWidth = this.get('rsideWidth') - this.getScrollYWidth(),
	            height = this.get('bodyHeight') - this.getScrollXHeight();

	        return {
	            height: height,
	            rsideWidth: rsideWidth,
	            totalWidth: lsideWidth + rsideWidth
	        };
	    },

	    /**
	     * Calc and get overflow values from container position
	     * @param {Number} pageX - Mouse X-position based on page
	     * @param {Number} pageY - Mouse Y-position based on page
	     * @returns {{x: number, y: number}} Mouse-overflow
	     */
	    getOverflowFromMousePosition: function(pageX, pageY) {
	        var containerPos = this.getPositionFromBodyArea(pageX, pageY);
	        var bodySize = this.getBodySize();

	        return this._judgeOverflow(containerPos, bodySize);
	    },

	    /**
	     * Judge overflow
	     * @param {{x: number, y: number}} containerPosition - Position values based on container
	     * @param {{height: number, totalWidth: number, rsideWidth: number}} bodySize - Real body size
	     * @returns {{x: number, y: number}} Overflow values
	     * @private
	     */
	    _judgeOverflow: function(containerPosition, bodySize) {
	        var containerX = containerPosition.x;
	        var containerY = containerPosition.y;
	        var overflowY = 0;
	        var overflowX = 0;

	        if (containerY < 0) {
	            overflowY = -1;
	        } else if (containerY > bodySize.height) {
	            overflowY = 1;
	        }

	        if (containerX < 0) {
	            overflowX = -1;
	        } else if (containerX > bodySize.totalWidth) {
	            overflowX = 1;
	        }

	        return {
	            x: overflowX,
	            y: overflowY
	        };
	    },

	    /**
	     * Return height of X-scrollBar.
	     * If no X-scrollBar, return 0
	     * @returns {number} Height of X-scrollBar
	     */
	    getScrollXHeight: function() {
	        return (this.get('scrollX') ? this.get('scrollBarSize') : 0);
	    },

	    /**
	     * Return width of Y-scrollBar.
	     * If no Y-scrollBar, return 0
	     * @returns {number} Width of Y-scrollBar
	     */
	    getScrollYWidth: function() {
	        return (this.get('scrollY') ? this.get('scrollBarSize') : 0);
	    },

	    /**
	     * Returns the height of table body.
	     * @param  {number} height - The height of the dimension
	     * @returns {number} The height of the table body
	     * @private
	     */
	    _calcRealBodyHeight: function(height) {
	        var extraHeight = this.get('headerHeight') + this.get('footerHeight') +
	            this.get('toolbarHeight') + TABLE_BORDER_WIDTH;

	        return height - extraHeight;
	    },

	    /**
	     * Returns the minimum height of table body.
	     * @returns {number} The minimum height of table body
	     * @private
	     */
	    _getMinBodyHeight: function() {
	        return this.get('rowHeight') + (CELL_BORDER_WIDTH * 2) + this.getScrollXHeight();
	    },

	    /**
	     * Sets the height of the dimension.
	     * (Resets the bodyHeight relative to the dimension height)
	     * @param  {number} height - The height of the dimension
	     * @private
	     */
	    _setHeight: function(height) {
	        this.set('bodyHeight', Math.max(this._calcRealBodyHeight(height), this._getMinBodyHeight()));
	    },

	    /**
	     * 열 고정 영역의 minimum width 값을 구한다.
	     * @returns {number} 열고정 영역의 최소 너비값.
	     * @private
	     */
	    _getMinLeftSideWidth: function() {
	        var minimumColumnWidth = this.get('minimumColumnWidth');
	        var columnFixCount = this.columnModel.getVisibleColumnFixCount(true);
	        var minWidth = 0;
	        var borderWidth;

	        if (columnFixCount) {
	            borderWidth = (columnFixCount + 1) * CELL_BORDER_WIDTH;
	            minWidth = borderWidth + (minimumColumnWidth * columnFixCount);
	        }

	        return minWidth;
	    },

	    /**
	     * 열 고정 영역의 maximum width 값을 구한다.
	     * @returns {number} 열고정 영역의 최대 너비값.
	     * @private
	     */
	    getMaxLeftSideWidth: function() {
	        var maxWidth = Math.ceil(this.get('width') * 0.9); // eslint-disable-line no-magic-number

	        if (maxWidth) {
	            maxWidth = Math.max(maxWidth, this._getMinLeftSideWidth());
	        }

	        return maxWidth;
	    },

	    /**
	     * Sets the width and height of the dimension.
	     * @param {(Number|Null)} width - Width
	     * @param {(Number|Null)} height - Height
	     */
	    setSize: function(width, height) {
	        if (width > 0) {
	            this.set('width', width);
	            this.trigger('setWidth', width);
	        }
	        if (height > 0) {
	            this._setHeight(height);
	        }
	    },

	    /**
	     * Returns the height of the dimension.
	     * @returns {Number} Height
	     */
	    getHeight: function() {
	        return this.get('bodyHeight') + this.get('headerHeight') + this.get('toolbarHeight');
	    },

	    /**
	     * layout 에 필요한 크기 및 위치 데이터를 갱신한다.
	     */
	    refreshLayout: function() {
	        var domState = this.domState;
	        var offset = domState.getOffset();

	        this.set({
	            offsetTop: offset.top,
	            offsetLeft: offset.left,
	            width: domState.getWidth()
	        });

	        if (this.get('fitToParentHeight')) {
	            this._setHeight(domState.getParentHeight());
	        }
	    },

	    /**
	     * Set bodyHeight value based on the count of row.
	     * (This method is temporary and required only until the displayRowCount option is removed)
	     * @param {number} rowCount - row count
	     */
	    setBodyHeightWithRowCount: function(rowCount) {
	        var rowHeight = this.get('rowHeight');
	        var scrollXHeight = this.getScrollXHeight();

	        this.set({
	            isFixedHeight: true,
	            bodyHeight: (rowHeight + CELL_BORDER_WIDTH) * rowCount + scrollXHeight
	        });
	    },

	    /**
	     * Returns the offset.top of body
	     * @returns {number}
	     */
	    getBodyOffsetTop: function() {
	        return this.get('offsetTop') + this.get('headerHeight') + this.get('toolbarHeight')
	            + CELL_BORDER_WIDTH + TABLE_BORDER_WIDTH;
	    },

	    /**
	     * Returns the position relative to the body-area.
	     * @param {Number} pageX - x-pos relative to document
	     * @param {Number} pageY - y-pos relative to document
	     * @returns {{x: number, y: number}}
	     * @private
	     */
	    getPositionFromBodyArea: function(pageX, pageY) {
	        var bodyOffsetX = this.get('offsetLeft');
	        var bodyOffsetY = this.getBodyOffsetTop();

	        return {
	            x: pageX - bodyOffsetX,
	            y: pageY - bodyOffsetY
	        };
	    }
	});

	module.exports = Dimension;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Manage coordinates of rows
	 * @author NHN Ent. FE Development Lab
	 */
	'use strict';

	var Model = __webpack_require__(8);
	var CELL_BORDER_WIDTH = __webpack_require__(10).dimension.CELL_BORDER_WIDTH;

	/**
	 * @module model/coordRow
	 * @param {Object} attrs - Attributes
	 * @param {Object} options - Options
	 * @extends module:base/model
	 * @ignore
	 */
	var CoordRow = Model.extend(/**@lends module:model/coordRow.prototype */{
	    initialize: function(attrs, options) {
	        this.dataModel = options.dataModel;
	        this.dimensionModel = options.dimensionModel;
	        this.domState = options.domState;

	        /**
	         * Height of each rows
	         * @type {Array}
	         */
	        this.rowHeights = [];

	        /**
	         * Offset of each rows
	         * @type {Array}
	         */
	        this.rowOffsets = [];

	        // Sync height and offest data when dataModel is changed only if the isFixedRowHeight is true.
	        // If the isFixedRowHeight is false, as the height of each row should be synced with DOM,
	        // syncWithDom() method is called instead at the end of rendering process.
	        if (this.dimensionModel.get('isFixedRowHeight')) {
	            this.listenTo(this.dataModel, 'add remove reset sort', this.syncWithDataModel);
	        }
	    },

	    /**
	     * Refresh coordinate data with real DOM height of cells
	     */
	    syncWithDom: function() {
	        var domRowHeights, dataRowHeights, rowHeights;
	        var i, len;


	        if (this.dimensionModel.get('isFixedRowHeight')) {
	            return;
	        }

	        domRowHeights = this.domState.getRowHeights();
	        dataRowHeights = this._getHeightFromData();
	        rowHeights = [];

	        for (i = 0, len = dataRowHeights.length; i < len; i += 1) {
	            rowHeights[i] = Math.max(domRowHeights[i], dataRowHeights[i]);
	        }
	        this._reset(rowHeights);
	    },

	    /**
	     * Returns the height of rows from dataModel as an array
	     * @returns {Array.<number>}
	     * @private
	     */
	    _getHeightFromData: function() {
	        var defHeight = this.dimensionModel.get('rowHeight');
	        var rowHeights = [];

	        this.dataModel.each(function(row, index) {
	            rowHeights[index] = (row.getHeight() || defHeight);
	        });

	        return rowHeights;
	    },

	    /**
	     * Refresh coordinate data with extraData.height
	     */
	    syncWithDataModel: function() {
	        this._reset(this._getHeightFromData());
	    },

	    /**
	     * Initialize the values of rowHeights and rowOffsets
	     * @param {Array.<number>} rowHeights - array of row height
	     * @private
	     */
	    _reset: function(rowHeights) {
	        var rowOffsets = [];
	        var totalRowHeight = 0;

	        _.each(rowHeights, function(height, index) {
	            var prevOffset = index ? (rowOffsets[index - 1] + CELL_BORDER_WIDTH) : 0;
	            var prevHeight = index ? rowHeights[index - 1] : 0;

	            rowOffsets[index] = prevOffset + prevHeight;
	        });

	        this.rowHeights = rowHeights;
	        this.rowOffsets = rowOffsets;

	        if (rowHeights.length) {
	            totalRowHeight = _.last(rowOffsets) + _.last(rowHeights) + CELL_BORDER_WIDTH;
	        }
	        this.dimensionModel.set('totalRowHeight', totalRowHeight);
	        this.trigger('reset');
	    },

	    /**
	     * Returns the height of the row of given index
	     * @param {number} index - row index
	     * @returns {number}
	     */
	    getHeightAt: function(index) {
	        return this.rowHeights[index];
	    },

	    /**
	     * Returns the offset of the row of given index
	     * @param {number} index - row index
	     * @returns {number}
	     */
	    getOffsetAt: function(index) {
	        return this.rowOffsets[index];
	    },

	    /**
	     * Returns the height of the row of the given rowKey
	     * @param {number} rowKey - rowKey
	     * @returns {number}
	     */
	    getHeight: function(rowKey) {
	        var index = this.dataModel.indexOfRowKey(rowKey);
	        return this.getHeightAt(index);
	    },

	    /**
	     * Returns the offset of the row of the given rowKey
	     * @param {number} rowKey - rowKey
	     * @returns {number}
	     */
	    getOffset: function(rowKey) {
	        var index = this.dataModel.indexOfRowKey(rowKey);
	        return this.getOffsetAt(index);
	    },

	    /**
	     * Returns the index of the row which contains given position
	     * @param {number} position - target position
	     * @returns {number}
	     */
	    indexOf: function(position) {
	        var rowOffsets = this.rowOffsets;
	        var idx = 0;

	        position += CELL_BORDER_WIDTH;
	        while (rowOffsets[idx] <= position) {
	            idx += 1;
	        }

	        return idx - 1;
	    }
	});

	module.exports = CoordRow;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Manage coordinates of rows
	 * @author NHN Ent. FE Development Lab
	 */
	'use strict';

	var Model = __webpack_require__(8);
	var util = __webpack_require__(9);
	var constMap = __webpack_require__(10);
	var dimensionConst = constMap.dimension;
	var frameConst = constMap.frame;

	var CELL_BORDER_WIDTH = dimensionConst.CELL_BORDER_WIDTH;

	/**
	 * @module model/coordColumn
	 * @param {Object} attrs - Attributes
	 * @param {Object} options - Options
	 * @extends module:base/model
	 * @ignore
	 */
	var CoordColumn = Model.extend(/**@lends module:model/coordColumn.prototype */{
	    initialize: function(attrs, options) {
	        this.dimensionModel = options.dimensionModel;
	        this.columnModel = options.columnModel;

	        /**
	         * An array of the fixed flags of the columns
	         * @private
	         * @type {boolean[]}
	         */
	        this._columnWidthFixedFlags = null;

	        /**
	         * An array of the minimum width of the columns
	         * @private
	         * @type {number[]}
	         */
	        this._minColumnWidthList = null;

	        /**
	         * Whether the column width is modified by user.
	         * @type {boolean}
	         */
	        this._isModified = false;

	        this.listenTo(this.columnModel, 'columnModelChange', this.resetColumnWidths);
	        this.listenTo(this.dimensionModel, 'change:width', this._onDimensionWidthChange);
	        this.resetColumnWidths();
	    },

	    defaults: {
	        columnWidthList: []
	    },

	    /**
	     * Reset the width of each column by using initial setting of column models.
	     */
	    resetColumnWidths: function() {
	        var columnModelList = this.columnModel.getVisibleColumnModelList(null, true);
	        var commonMinWidth = this.dimensionModel.get('minimumColumnWidth');
	        var widthList = [];
	        var fixedFlags = [];
	        var minWidthList = [];

	        _.each(columnModelList, function(columnModel) {
	            var width = columnModel.width > 0 ? columnModel.width : 0;
	            var minWidth = Math.max(width, commonMinWidth);

	            // Meta columns are not affected by common 'minimumColumnWidth' value
	            if (util.isMetaColumn(columnModel.columnName)) {
	                minWidth = width;
	            }

	            // If the width is not assigned (in other words, the width is not positive number),
	            // set it to zero (no need to worry about minimum width at this point)
	            // so that #_fillEmptyColumnWidth() can detect which one is empty.
	            // After then, minimum width will be applied by #_applyMinimumColumnWidth().
	            widthList.push(width ? minWidth : 0);
	            minWidthList.push(minWidth);
	            fixedFlags.push(!!columnModel.isFixedWidth);
	        }, this);

	        this._columnWidthFixedFlags = fixedFlags;
	        this._minColumnWidthList = minWidthList;

	        this._setColumnWidthVariables(this._calculateColumnWidth(widthList), true);
	    },

	    /**
	     * columnWidthList 로 부터, lside 와 rside 의 전체 너비를 계산하여 저장한다.
	     * @param {array} columnWidthList - 컬럼 넓이값 배열
	     * @param {boolean} [isSaveWidthList] - 저장 여부. true이면 넓이값 배열을 originalWidthList로 저장한다.
	     * @private
	     */
	    _setColumnWidthVariables: function(columnWidthList, isSaveWidthList) {
	        var totalWidth = this.dimensionModel.get('width');
	        var maxLeftSideWidth = this.dimensionModel.getMaxLeftSideWidth();
	        var columnFixCount = this.columnModel.getVisibleColumnFixCount(true);
	        var rsideWidth, lsideWidth, lsideWidthList, rsideWidthList;

	        lsideWidthList = columnWidthList.slice(0, columnFixCount);
	        rsideWidthList = columnWidthList.slice(columnFixCount);

	        lsideWidth = this._getFrameWidth(lsideWidthList);
	        if (maxLeftSideWidth && maxLeftSideWidth < lsideWidth) {
	            lsideWidthList = this._adjustLeftSideWidthList(lsideWidthList, maxLeftSideWidth);
	            lsideWidth = this._getFrameWidth(lsideWidthList);
	            columnWidthList = lsideWidthList.concat(rsideWidthList);
	        }
	        rsideWidth = totalWidth - lsideWidth;

	        this.set({
	            columnWidthList: columnWidthList
	        });
	        this.dimensionModel.set({
	            rsideWidth: rsideWidth,
	            lsideWidth: lsideWidth
	        });

	        if (isSaveWidthList) {
	            this.set('originalWidthList', _.clone(columnWidthList));
	        }
	        this.trigger('columnWidthChanged');
	    },

	    /**
	     * columnFixCount 가 적용되었을 때, window resize 시 left side 의 너비를 조정한다.
	     * @param {Array} lsideWidthList    열고정 영역의 너비 리스트 배열
	     * @param {Number} totalWidth   grid 전체 너비
	     * @returns {Array} 열고정 영역의 너비 리스트
	     * @private
	     */
	    _adjustLeftSideWidthList: function(lsideWidthList, totalWidth) {
	        var i = lsideWidthList.length - 1;
	        var minimumColumnWidth = this.dimensionModel.get('minimumColumnWidth');
	        var currentWidth = this._getFrameWidth(lsideWidthList);
	        var diff = currentWidth - totalWidth;
	        var changedWidth;

	        if (diff > 0) {
	            while (i >= 0 && diff > 0) {
	                changedWidth = Math.max(minimumColumnWidth, lsideWidthList[i] - diff);
	                diff -= lsideWidthList[i] - changedWidth;
	                lsideWidthList[i] = changedWidth;
	                i -= 1;
	            }
	        } else if (diff < 0) {
	            lsideWidthList[i] += Math.abs(diff);
	        }

	        return lsideWidthList;
	    },

	    /**
	     * calculate column width list
	     * @param {Array.<Number>} widthList - widthList
	     * @returns {Array.<Number>}
	     * @private
	     */
	    _calculateColumnWidth: function(widthList) {
	        widthList = this._fillEmptyColumnWidth(widthList);
	        widthList = this._applyMinimumColumnWidth(widthList);
	        widthList = this._adjustColumnWidthList(widthList);

	        return widthList;
	    },

	    /**
	     * Sets the width of columns whose width is not assigned by distributing extra width to them equally.
	     * @param {number[]} columnWidthList - An array of column widths
	     * @returns {number[]} - A new array of column widths
	     * @private
	     */
	    _fillEmptyColumnWidth: function(columnWidthList) {
	        var totalWidth = this.dimensionModel.getAvailableTotalWidth(columnWidthList.length);
	        var remainTotalWidth = totalWidth - util.sum(columnWidthList);
	        var emptyIndexes = [];

	        _.each(columnWidthList, function(width, index) {
	            if (!width) {
	                emptyIndexes.push(index);
	            }
	        });

	        return this._distributeExtraWidthEqually(columnWidthList, remainTotalWidth, emptyIndexes);
	    },

	    /**
	     * widthList 로부터 보더 값을 포함하여 계산한 frameWidth 를 구한다.
	     * @param {Array} widthList 너비 리스트 배열
	     * @returns {Number} 계산된 frame 너비값
	     * @private
	     */
	    _getFrameWidth: function(widthList) {
	        var frameWidth = 0;

	        if (widthList.length) {
	            frameWidth = util.sum(widthList) + ((widthList.length + 1) * CELL_BORDER_WIDTH);
	        }

	        return frameWidth;
	    },

	    /**
	     * Adds extra widths of the column equally.
	     * @param {number[]} columnWidthList - An array of column widths
	     * @param {number} totalExtraWidth - Total extra width
	     * @returns {number[]} - A new array of column widths
	     * @private
	     */
	    _addExtraColumnWidth: function(columnWidthList, totalExtraWidth) {
	        var fixedFlags = this._columnWidthFixedFlags;
	        var columnIndexes = [];

	        _.each(fixedFlags, function(flag, index) {
	            if (!flag) {
	                columnIndexes.push(index);
	            }
	        });
	        return this._distributeExtraWidthEqually(columnWidthList, totalExtraWidth, columnIndexes);
	    },

	    /**
	     * Reduces excess widths of the column equally.
	     * @param {number[]} columnWidthList - An array of column widths
	     * @param {number} totalExcessWidth - Total excess width (negative number)
	     * @returns {number[]} - A new array of column widths
	     * @private
	     */
	    _reduceExcessColumnWidth: function(columnWidthList, totalExcessWidth) {
	        var minWidthList = this._minColumnWidthList;
	        var fixedFlags = this._columnWidthFixedFlags;
	        var availableList = [];

	        _.each(columnWidthList, function(width, index) {
	            if (!fixedFlags[index]) {
	                availableList.push({
	                    index: index,
	                    width: width - minWidthList[index]
	                });
	            }
	        });

	        return this._reduceExcessColumnWidthSub(_.clone(columnWidthList), totalExcessWidth, availableList);
	    },

	    /**
	     * Reduce the (remaining) excess widths of the column.
	     * This method will be called recursively by _reduceExcessColumnWidth.
	     * @param {number[]} columnWidthList - An array of column Width
	     * @param {number} totalRemainWidth - Remaining excess width (negative number)
	     * @param {object[]} availableList - An array of infos about available column.
	     *                                 Each item of the array has {index:number, width:number}.
	     * @returns {number[]} - A new array of column widths
	     * @private
	     */
	    _reduceExcessColumnWidthSub: function(columnWidthList, totalRemainWidth, availableList) {
	        var avgValue = Math.round(totalRemainWidth / availableList.length);
	        var newAvailableList = [];
	        var columnIndexes;

	        _.each(availableList, function(available) {
	            // note that totalRemainWidth and avgValue are negative number.
	            if (available.width < Math.abs(avgValue)) {
	                totalRemainWidth += available.width;
	                columnWidthList[available.index] -= available.width;
	            } else {
	                newAvailableList.push(available);
	            }
	        });
	        // call recursively until all available width are less than average
	        if (availableList.length > newAvailableList.length) {
	            return this._reduceExcessColumnWidthSub(columnWidthList, totalRemainWidth, newAvailableList);
	        }
	        columnIndexes = _.pluck(availableList, 'index');

	        return this._distributeExtraWidthEqually(columnWidthList, totalRemainWidth, columnIndexes);
	    },

	    /**
	     * Distributes the extra width equally to each column at specified indexes.
	     * @param {number[]} columnWidthList - An array of column width
	     * @param {number} extraWidth - Extra width
	     * @param {number[]} columnIndexes - An array of indexes of target columns
	     * @returns {number[]} - A new array of column widths
	     * @private
	     */
	    _distributeExtraWidthEqually: function(columnWidthList, extraWidth, columnIndexes) {
	        var length = columnIndexes.length;
	        var avgValue = Math.round(extraWidth / length);
	        var errorValue = (avgValue * length) - extraWidth; // to correct total width
	        var resultList = _.clone(columnWidthList);

	        _.each(columnIndexes, function(columnIndex) {
	            resultList[columnIndex] += avgValue;
	        });

	        if (columnIndexes.length) {
	            resultList[_.last(columnIndexes)] -= errorValue;
	        }

	        return resultList;
	    },

	    /**
	     * Makes all width of columns not less than minimumColumnWidth.
	     * @param {number[]} columnWidthList - 컬럼 넓이값 배열
	     * @returns {number[]} - 수정된 새로운 넓이값 배열
	     * @private
	     */
	    _applyMinimumColumnWidth: function(columnWidthList) {
	        var minWidthList = this._minColumnWidthList;
	        var appliedList = _.clone(columnWidthList);

	        _.each(appliedList, function(width, index) {
	            var minWidth = minWidthList[index];
	            if (width < minWidth) {
	                appliedList[index] = minWidth;
	            }
	        });

	        return appliedList;
	    },

	    /**
	     * Adjust the column widths to make them fit into the dimension.
	     * @param {number[]} columnWidthList - An array of column width
	     * @param {boolean} [fitToReducedTotal] - If set to true and the total width is smaller than dimension(width),
	     *                                    the column widths will be reduced.
	     * @returns {number[]} - A new array of column widths
	     * @private
	     */
	    _adjustColumnWidthList: function(columnWidthList, fitToReducedTotal) {
	        var columnLength = columnWidthList.length;
	        var availableWidth = this.dimensionModel.getAvailableTotalWidth(columnLength);
	        var totalExtraWidth = availableWidth - util.sum(columnWidthList);
	        var fixedCount = _.filter(this._columnWidthFixedFlags).length;
	        var adjustedList;

	        if (totalExtraWidth > 0) {
	            if (columnLength > fixedCount) {
	                adjustedList = this._addExtraColumnWidth(columnWidthList, totalExtraWidth);
	            } else {
	                // If all column has fixed width, add extra width to the last column.
	                adjustedList = _.clone(columnWidthList);
	                adjustedList[columnLength - 1] += totalExtraWidth;
	            }
	        } else if (fitToReducedTotal && totalExtraWidth < 0) {
	            adjustedList = this._reduceExcessColumnWidth(columnWidthList, totalExtraWidth);
	        } else {
	            adjustedList = columnWidthList;
	        }

	        return adjustedList;
	    },

	    /**
	     * width 값 변경시 각 column 별 너비를 계산한다.
	     * @private
	     */
	    _onDimensionWidthChange: function() {
	        var widthList = this.get('columnWidthList');

	        if (!this._isModified) {
	            widthList = this._adjustColumnWidthList(widthList, true);
	        }
	        this._setColumnWidthVariables(widthList);
	    },

	    /**
	     * L side 와 R side 에 따른 columnWidthList 를 반환한다.
	     * @param {String} [whichSide] 어느 영역인지 여부. L,R 중 하나를 인자로 넘긴다. 생략시 전체 columnList 반환
	     * @returns {Array}  조회한 영역의 columnWidthList
	     */
	    getColumnWidthList: function(whichSide) {
	        var columnFixCount = this.columnModel.getVisibleColumnFixCount(true);
	        var columnWidthList = [];

	        switch (whichSide) {
	            case frameConst.L:
	                columnWidthList = this.get('columnWidthList').slice(0, columnFixCount);
	                break;
	            case frameConst.R:
	                columnWidthList = this.get('columnWidthList').slice(columnFixCount);
	                break;
	            default :
	                columnWidthList = this.get('columnWidthList');
	                break;
	        }

	        return columnWidthList;
	    },

	    /**
	     * L, R 중 하나를 입력받아 frame 의 너비를 구한다.
	     * @param {String} [whichSide]  지정하지 않을 경우 전체 너비.
	     * @returns {Number} 해당 frame 의 너비
	     */
	    getFrameWidth: function(whichSide) {
	        var columnFixCount = this.columnModel.getVisibleColumnFixCount(true);
	        var columnWidthList = this.getColumnWidthList(whichSide);
	        var frameWidth = this._getFrameWidth(columnWidthList);

	        if (_.isUndefined(whichSide) && columnFixCount > 0) {
	            frameWidth += CELL_BORDER_WIDTH;
	        }

	        return frameWidth;
	    },

	    /**
	     * columnResize 발생 시 index 에 해당하는 컬럼의 width 를 변경하여 반영한다.
	     * @param {Number} index    너비를 변경할 컬럼의 인덱스
	     * @param {Number} width    변경할 너비 pixel값
	     */
	    setColumnWidth: function(index, width) {
	        var columnWidthList = this.get('columnWidthList');
	        var fixedFlags = this._columnWidthFixedFlags;
	        var minWidth = this._minColumnWidthList[index];

	        if (!fixedFlags[index] && columnWidthList[index]) {
	            columnWidthList[index] = Math.max(width, minWidth);
	            this._setColumnWidthVariables(columnWidthList);
	            this._isModified = true;
	        }
	    },

	    /**
	     * Returns column index from X-position relative to the body-area
	     * @param {number} posX - X-position relative to the body-area
	     * @param {boolean} withMeta - Whether the meta columns go with this calculation
	     * @returns {number} Column index
	     * @private
	     */
	    indexOf: function(posX, withMeta) {
	        var columnWidthList = this.getColumnWidthList();
	        var totalColumnWidth = this.getFrameWidth();
	        var adjustableIndex = (withMeta) ? 0 : this.columnModel.getVisibleMetaColumnCount();
	        var columnIndex = 0;

	        if (posX >= totalColumnWidth) {
	            columnIndex = columnWidthList.length - 1;
	        } else {
	            tui.util.forEachArray(columnWidthList, function(width, index) { // eslint-disable-line consistent-return
	                width += CELL_BORDER_WIDTH;
	                columnIndex = index;

	                if (posX > width) {
	                    posX -= width;
	                } else {
	                    return false;
	                }
	            });
	        }

	        return Math.max(0, columnIndex - adjustableIndex);
	    },

	    /**
	     * Restore a column to the default width.
	     * @param {Number} index - target column index
	     */
	    restoreColumnWidth: function(index) {
	        var orgWidth = this.get('originalWidthList')[index];

	        this.setColumnWidth(index, orgWidth);
	    }
	});

	module.exports = CoordColumn;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Converts coordinates to index of rows and columns
	 * @author NHN Ent. FE Development Lab
	 */
	'use strict';

	var Model = __webpack_require__(8);
	var dimensionConstMap = __webpack_require__(10).dimension;

	var TABLE_BORDER_WIDTH = dimensionConstMap.TABLE_BORDER_WIDTH;
	var CELL_BORDER_WIDTH = dimensionConstMap.CELL_BORDER_WIDTH;

	/**
	 * @module model/coordConverter
	 * @param {Object} attrs - Attributes
	 * @param {Object} options - Options
	 * @extends module:base/model
	 * @ignore
	 */
	var CoordConverter = Model.extend(/**@lends module:model/coordConverter.prototype */{
	    initialize: function(attrs, options) {
	        this.dataModel = options.dataModel;
	        this.columnModel = options.columnModel;
	        this.focusModel = options.focusModel;
	        this.dimensionModel = options.dimensionModel;
	        this.renderModel = options.renderModel;
	        this.coordRowModel = options.coordRowModel;
	        this.coordColumnModel = options.coordColumnModel;

	        this.listenTo(this.focusModel, 'focus', this._onFocus);
	    },

	    /**
	     * Get cell index from mouse position
	     * @param {Number} pageX - Mouse X-position based on page
	     * @param {Number} pageY - Mouse Y-position based on page
	     * @param {boolean} [withMeta] - Whether the meta columns go with this calculation
	     * @returns {{row: number, column: number}} Cell index
	     */
	    getIndexFromMousePosition: function(pageX, pageY, withMeta) {
	        var position = this.dimensionModel.getPositionFromBodyArea(pageX, pageY);
	        var posWithScroll = this._getScrolledPosition(position);

	        return {
	            row: this.coordRowModel.indexOf(posWithScroll.y),
	            column: this.coordColumnModel.indexOf(posWithScroll.x, withMeta)
	        };
	    },

	    /**
	     * Returns the scrolled position in addition to given position
	     * @param {{x: number, y: number}} position - position
	     * @returns {{x: number, y: number}}
	     * @private
	     */
	    _getScrolledPosition: function(position) {
	        var renderModel = this.renderModel;
	        var isRside = position.x > this.dimensionModel.get('lsideWidth');
	        var scrollLeft = isRside ? renderModel.get('scrollLeft') : 0;
	        var scrollTop = renderModel.get('scrollTop');

	        return {
	            x: position.x + scrollLeft,
	            y: position.y + scrollTop
	        };
	    },

	    /**
	     * Returns the count of rowspan of given cell
	     * @param {Number} rowKey - row key
	     * @param {String} columnName - column name
	     * @returns {Number}
	     * @private
	     */
	    _getRowSpanCount: function(rowKey, columnName) {
	        var rowSpanData = this.dataModel.get(rowKey).getRowSpanData(columnName);

	        if (!rowSpanData.isMainRow) {
	            rowKey = rowSpanData.mainRowKey;
	            rowSpanData = this.dataModel.get(rowKey).getRowSpanData(columnName);
	        }

	        return rowSpanData.count || 1;
	    },

	    /**
	     * Returns the vertical position of the given row
	     * @param {Number} rowKey - row key
	     * @param {Number} rowSpanCount - the count of rowspan
	     * @returns {{top: Number, bottom: Number}}
	     * @private
	     */
	    _getCellVerticalPosition: function(rowKey, rowSpanCount) {
	        var firstIdx, lastIdx, top, bottom;
	        var coordRowModel = this.coordRowModel;

	        firstIdx = this.dataModel.indexOfRowKey(rowKey);
	        lastIdx = firstIdx + rowSpanCount - 1;
	        top = coordRowModel.getOffsetAt(firstIdx);
	        bottom = coordRowModel.getOffsetAt(lastIdx) +
	            coordRowModel.getHeightAt(lastIdx) + CELL_BORDER_WIDTH;

	        return {
	            top: top,
	            bottom: bottom
	        };
	    },

	    /**
	     * Returns the horizontal position of the given column
	     * @param {String} columnName - column name
	     * @returns {{left: Number, right: Number}}
	     * @private
	     */
	    _getCellHorizontalPosition: function(columnName) {
	        var columnModel = this.columnModel;
	        var metaColumnCount = columnModel.getVisibleMetaColumnCount();
	        var columnWidthList = this.coordColumnModel.get('columnWidthList');
	        var leftColumnCount = columnModel.getVisibleColumnFixCount() + metaColumnCount;
	        var targetIdx = columnModel.indexOfColumnName(columnName, true) + metaColumnCount;
	        var idx = leftColumnCount > targetIdx ? 0 : leftColumnCount;
	        var left = 0;

	        for (; idx < targetIdx; idx += 1) {
	            left += columnWidthList[idx] + CELL_BORDER_WIDTH;
	        }

	        return {
	            left: left,
	            right: left + columnWidthList[targetIdx] + CELL_BORDER_WIDTH
	        };
	    },

	    /**
	     * Returns the bounds of the cell identified by given address
	     * @param {Number|String} rowKey - row key
	     * @param {String} columnName - column name
	     * @returns {{top: number, left: number, right: number, bottom: number}}
	     * @todo TC
	     */
	    getCellPosition: function(rowKey, columnName) {
	        var rowSpanCount, vPos, hPos;

	        rowKey = this.dataModel.getMainRowKey(rowKey, columnName);

	        if (!this.dataModel.get(rowKey)) {
	            return {};
	        }

	        rowSpanCount = this._getRowSpanCount(rowKey, columnName);
	        vPos = this._getCellVerticalPosition(rowKey, rowSpanCount);
	        hPos = this._getCellHorizontalPosition(columnName);

	        return {
	            top: vPos.top,
	            bottom: vPos.bottom,
	            left: hPos.left,
	            right: hPos.right
	        };
	    },

	    /**
	     * Judge scroll direction.
	     * @param {{top: number, bottom: number, left: number, right: number}} targetPosition - Position of target element
	     * @param {boolean} isRsideColumn - Whether the target cell is in rside
	     * @param {{height: number, rsideWidth: number}} bodySize - Using cached bodySize
	     * @returns {{isUp: boolean, isDown: boolean, isLeft: boolean, isRight: boolean}} Direction
	     * @private
	     */
	    _judgeScrollDirection: function(targetPosition, isRsideColumn, bodySize) {
	        var renderModel = this.renderModel;
	        var currentTop = renderModel.get('scrollTop');
	        var currentLeft = renderModel.get('scrollLeft');
	        var isUp, isDown, isLeft, isRight;

	        isUp = targetPosition.top < currentTop;
	        isDown = !isUp && (targetPosition.bottom > (currentTop + bodySize.height));
	        if (isRsideColumn) {
	            isLeft = targetPosition.left < currentLeft;
	            isRight = !isLeft && (targetPosition.right > (currentLeft + bodySize.rsideWidth - 1));
	        } else {
	            isLeft = isRight = false;
	        }

	        return {
	            isUp: isUp,
	            isDown: isDown,
	            isLeft: isLeft,
	            isRight: isRight
	        };
	    },

	    /**
	     * Scroll to focus
	     * @param {number} rowKey - row key
	     * @param {string} columnName - column name
	     * @param {boolean} shouldScroll - whether scroll to the target cell
	     * @private
	     */
	    _onFocus: function(rowKey, columnName, shouldScroll) {
	        var scrollPosition;

	        if (!shouldScroll) {
	            return;
	        }
	        scrollPosition = this.getScrollPosition(rowKey, columnName);

	        if (!tui.util.isEmpty(scrollPosition)) {
	            this.renderModel.set(scrollPosition);
	        }
	    },

	    /**
	     * Make scroll position
	     * @param {{isUp: boolean, isDown: boolean, isLeft: boolean, isRight: boolean}} scrollDirection - Direction
	     * @param {{top: number, bottom: number, left: number, right: number}} targetPosition - Position of target element
	     * @param {{height: number, rsideWidth: number}} bodySize - Using cached bodySize
	     * @returns {{scrollLeft: ?Number, scrollTop: ?Number}} Position to scroll
	     * @private
	     */
	    _makeScrollPosition: function(scrollDirection, targetPosition, bodySize) {
	        var pos = {};

	        if (scrollDirection.isUp) {
	            pos.scrollTop = targetPosition.top;
	        } else if (scrollDirection.isDown) {
	            pos.scrollTop = targetPosition.bottom - bodySize.height;
	        }

	        if (scrollDirection.isLeft) {
	            pos.scrollLeft = targetPosition.left;
	        } else if (scrollDirection.isRight) {
	            pos.scrollLeft = targetPosition.right - bodySize.rsideWidth + TABLE_BORDER_WIDTH;
	        }

	        return pos;
	    },

	    /**
	     * Return scroll position from the received index
	     * @param {Number|String} rowKey - Row-key of target cell
	     * @param {String} columnName - Column name of target cell
	     * @returns {{scrollLeft: ?Number, scrollTop: ?Number}} Position to scroll
	     */
	    getScrollPosition: function(rowKey, columnName) {
	        var isRsideColumn = !this.columnModel.isLside(columnName);
	        var targetPosition = this.getCellPosition(rowKey, columnName);
	        var bodySize = this.dimensionModel.getBodySize();
	        var scrollDirection = this._judgeScrollDirection(targetPosition, isRsideColumn, bodySize);

	        return this._makeScrollPosition(scrollDirection, targetPosition, bodySize);
	    }
	});

	module.exports = CoordConverter;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Focus 관련 데이터 처리름 담당한다.
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var Model = __webpack_require__(8);
	var util = __webpack_require__(9);
	var GridEvent = __webpack_require__(22);

	/**
	 * Focus model
	 * RowList collection 이 focus class 를 listen 한다.
	 * @param {Object} attrs - Attributes
	 * @param {Object} options - Options
	 * @module model/focus
	 * @extends module:base/model
	 * @ignore
	 */
	var Focus = Model.extend(/**@lends module:model/focus.prototype */{
	    initialize: function(attrs, options) {
	        Model.prototype.initialize.apply(this, arguments);

	        this.dataModel = options.dataModel;
	        this.columnModel = options.columnModel;
	        this.dimensionModel = options.dimensionModel;
	        this.domState = options.domState;

	        this.listenTo(this.dataModel, 'reset', this._onResetData);
	    },

	    defaults: {
	        /**
	         * row key of the current cell
	         * @type {String|Number}
	         */
	        rowKey: null,

	        /**
	         * column name of the current cell
	         * @type {String}
	         */
	        columnName: '',

	        /**
	         * row key of the previously focused cell
	         * @type {String|Number}
	         */
	        prevRowKey: null,

	        /**
	         * column name of the previously focused cell
	         * @type {String}
	         */
	        prevColumnName: '',

	        /**
	         * address of the editing cell.
	         * @type {{rowKey:(String|Number), columnName:String}}
	         */
	        editingAddress: null
	    },

	    /**
	     * Event handler for 'reset' event on dataModel.
	     * @private
	     */
	    _onResetData: function() {
	        this.unselect(true);
	    },

	    /**
	     * Saves previous data.
	     * @private
	     */
	    _savePrevious: function() {
	        if (this.get('rowKey') !== null) {
	            this.set('prevRowKey', this.get('rowKey'));
	        }
	        if (this.get('columnName')) {
	            this.set('prevColumnName', this.get('columnName'));
	        }
	    },

	    /**
	     * Clear previous data.
	     * @private
	     */
	    _clearPrevious: function() {
	        this.set({
	            prevRowKey: null,
	            prevColumnName: ''
	        });
	    },

	    /**
	     * Returns whether given rowKey and columnName is equal to current value
	     * @param {(Number|String)} rowKey - row key
	     * @param {String} columnName - column name
	     * @param {Boolean} isMainRowKey - true if the target row key is main row
	     * @returns {Boolean} - True if equal
	     */
	    isCurrentCell: function(rowKey, columnName, isMainRowKey) {
	        var curColumnName = this.get('columnName');
	        var curRowKey = this.get('rowKey');

	        if (isMainRowKey) {
	            curRowKey = this.dataModel.getMainRowKey(curRowKey, curColumnName);
	        }

	        return String(curRowKey) === String(rowKey) && curColumnName === columnName;
	    },

	    /**
	     * Selects the given row
	     * @param {Number|String} rowKey - Rowkey of the target row
	     * @returns {Boolean} True is success
	     */
	    select: function(rowKey) {
	        var eventData = new GridEvent();
	        var currentRowKey = this.get('rowKey');

	        if (String(currentRowKey) === String(rowKey)) {
	            return true;
	        }

	        eventData.setData({
	            rowKey: rowKey,
	            prevRowKey: currentRowKey,
	            rowData: this.dataModel.getRowData(rowKey)
	        });

	        /**
	         * Occurs when a table row is selected
	         * @api
	         * @event tui.Grid#selectRow
	         * @type {module:common/gridEvent}
	         * @property {number} rowKey - rowKey of the target row
	         * @property {number} prevRowKey - previously selected rowKey
	         * @property {Object} rowData - data of the target row
	         */
	        this.trigger('select', eventData);
	        if (eventData.isStopped()) {
	            this._cancelSelect();
	            return false;
	        }

	        this.set('rowKey', rowKey);
	        if (this.columnModel.get('selectType') === 'radio') {
	            this.dataModel.check(rowKey);
	        }
	        return true;
	    },

	    /**
	     * Cancel select
	     * @private
	     */
	    _cancelSelect: function() {
	        var prevColumnName = this.get('prevColumnName');

	        this.set('columnName', prevColumnName);
	        this.trigger('focus', this.get('rowKey'), prevColumnName);
	    },

	    /**
	     * 행을 unselect 한다.
	     * @param {boolean} blur - The boolean value whether to invoke blur
	     */
	    unselect: function(blur) {
	        if (blur) {
	            this.blur();
	        }
	        this.set({
	            rowKey: null
	        });
	    },

	    /**
	     * Focus to the cell identified by given rowKey and columnName.
	     * @param {Number|String} rowKey - rowKey
	     * @param {String} columnName - columnName
	     * @param {Boolean} isScrollable - if set to true, move scroll position to focused position
	     * @returns {Boolean} true if focused cell is changed
	     */
	    focus: function(rowKey, columnName, isScrollable) {
	        if (!this._isValidCell(rowKey, columnName) ||
	            util.isMetaColumn(columnName) ||
	            this.isCurrentCell(rowKey, columnName)) {
	            return true;
	        }

	        this.blur();
	        if (!this.select(rowKey)) {
	            return false;
	        }

	        this.set('columnName', columnName);
	        this.trigger('focus', rowKey, columnName, isScrollable);

	        return true;
	    },

	    /**
	     * Focus to the cell identified by given rowIndex and columnIndex.
	     * @param {(Number|String)} rowIndex - rowIndex
	     * @param {String} columnIndex - columnIndex
	     * @param {boolean} [isScrollable=false] - if set to true, scroll to focused cell
	     * @returns {Boolean} true if success
	     */
	    focusAt: function(rowIndex, columnIndex, isScrollable) {
	        var row = this.dataModel.at(rowIndex);
	        var column = this.columnModel.at(columnIndex, true);
	        var result = false;

	        if (row && column) {
	            result = this.focus(row.get('rowKey'), column.columnName, isScrollable);
	        }

	        return result;
	    },

	    /**
	     * Focus to the cell identified by given rowKey and columnName and change it to edit-mode if editable.
	     * @param {(Number|String)} rowKey - rowKey
	     * @param {String} columnName - columnName
	     * @param {boolean} [isScrollable=false] - if set to true, scroll to focused cell
	     * @returns {Boolean} true if success
	     */
	    focusIn: function(rowKey, columnName, isScrollable) {
	        var result = this.focus(rowKey, columnName, isScrollable);

	        if (result) {
	            rowKey = this.dataModel.getMainRowKey(rowKey, columnName);

	            if (this.dataModel.get(rowKey).isEditable(columnName)) {
	                this.finishEditing();
	                this.startEditing(rowKey, columnName);
	            } else {
	                this.focusClipboard();
	            }
	        }

	        return result;
	    },

	    /**
	     * Focus to the cell identified by given rowIndex and columnIndex and change it to edit-mode if editable.
	     * @param {(Number|String)} rowIndex - rowIndex
	     * @param {String} columnIndex - columnIndex
	     * @param {Boolean} [isScrollable=false] - if set to true, scroll to focused cell
	     * @returns {Boolean} true if success
	     */
	    focusInAt: function(rowIndex, columnIndex, isScrollable) {
	        var row = this.dataModel.at(rowIndex);
	        var column = this.columnModel.at(columnIndex, true);
	        var result = false;

	        if (row && column) {
	            result = this.focusIn(row.get('rowKey'), column.columnName, isScrollable);
	        }
	        return result;
	    },

	    /**
	     * clipboard 에 focus 한다.
	     */
	    focusClipboard: function() {
	        this.trigger('focusClipboard');
	    },

	    /**
	     * If the grid has an element which has a focus, make sure that focusModel has a valid data,
	     * Otherwise call focusModel.blur().
	     */
	    refreshState: function() {
	        var restored;

	        if (!this.domState.hasFocusedElement()) {
	            this.blur();
	        } else if (!this.has()) {
	            restored = this.restore();
	            if (!restored) {
	                this.focusAt(0, 0);
	            }
	        }
	    },

	    /**
	     * 디자인 blur 처리한다.
	     * @returns {Model.Focus} This object
	     */
	    blur: function() {
	        var columnName = this.get('columnName');

	        if (!this.has()) {
	            return this;
	        }

	        if (this.has(true)) {
	            this._savePrevious();
	        }

	        if (this.get('rowKey') !== null) {
	            this.set('columnName', '');
	        }
	        this.trigger('blur', this.get('rowKey'), columnName);

	        return this;
	    },

	    /**
	     * 현재 focus 정보를 반환한다.
	     * @returns {{rowKey: (number|string), columnName: string}} 현재 focus 정보에 해당하는 rowKey, columnName
	     */
	    which: function() {
	        return {
	            rowKey: this.get('rowKey'),
	            columnName: this.get('columnName')
	        };
	    },

	    /**
	     * 현재 focus 정보를 index 기준으로 반환한다.
	     * @param {boolean} isPrevious 이전 focus 정보를 반환할지 여부
	     * @returns {{row: number, column: number}} The object that contains index info
	     */
	    indexOf: function(isPrevious) {
	        var rowKey = isPrevious ? this.get('prevRowKey') : this.get('rowKey');
	        var columnName = isPrevious ? this.get('prevColumnName') : this.get('columnName');

	        return {
	            row: this.dataModel.indexOfRowKey(rowKey),
	            column: this.columnModel.indexOfColumnName(columnName, true)
	        };
	    },

	    /**
	     * Returns whether has focus.
	     * @param {boolean} checkValid - if set to true, check whether the current cell is valid.
	     * @returns {boolean} True if has focus.
	     */
	    has: function(checkValid) {
	        var rowKey = this.get('rowKey');
	        var columnName = this.get('columnName');

	        if (checkValid) {
	            return this._isValidCell(rowKey, columnName);
	        }
	        return !util.isBlank(rowKey) && !util.isBlank(columnName);
	    },

	    /**
	     * Restore previous focus data.
	     * @returns {boolean} True if restored
	     */
	    restore: function() {
	        var prevRowKey = this.get('prevRowKey');
	        var prevColumnName = this.get('prevColumnName');
	        var restored = false;

	        if (this._isValidCell(prevRowKey, prevColumnName)) {
	            this.focus(prevRowKey, prevColumnName);
	            restored = true;
	        }
	        return restored;
	    },

	    /**
	     * Returns whether the cell identified by given rowKey and columnName is editing now.
	     * @param {Number} rowKey - row key
	     * @param {String} columnName - column name
	     * @returns {Boolean}
	     */
	    isEditingCell: function(rowKey, columnName) {
	        var address = this.get('editingAddress');

	        return address &&
	            (String(address.rowKey) === String(rowKey)) &&
	            (address.columnName === columnName);
	    },

	    /**
	     * Starts editing a cell identified by given rowKey and columnName, and returns the result.
	     * @param {(String|Number)} rowKey - row key
	     * @param {String} columnName - column name
	     * @returns {Boolean} true if succeeded, false otherwise.
	     */
	    startEditing: function(rowKey, columnName) {
	        if (this.get('editingAddress')) {
	            return false;
	        }

	        if (_.isUndefined(rowKey) && _.isUndefined(columnName)) {
	            rowKey = this.get('rowKey');
	            columnName = this.get('columnName');
	        } else if (!this.isCurrentCell(rowKey, columnName, true)) {
	            return false;
	        }

	        rowKey = this.dataModel.getMainRowKey(rowKey, columnName);
	        if (!this.dataModel.get(rowKey).isEditable(columnName)) {
	            return false;
	        }
	        this.set('editingAddress', {
	            rowKey: rowKey,
	            columnName: columnName
	        });

	        return true;
	    },

	    /**
	     * Finishes editing the current cell, and returns the result.
	     * @returns {Boolean} - true if an editing cell exist, false otherwise.
	     */
	    finishEditing: function() {
	        if (!this.get('editingAddress')) {
	            return false;
	        }

	        this.set('editingAddress', null);

	        return true;
	    },

	    /**
	     * Returns whether the specified cell is exist
	     * @param {String|Number} rowKey - Rowkey
	     * @param {String} columnName - ColumnName
	     * @returns {boolean} True if exist
	     * @private
	     */
	    _isValidCell: function(rowKey, columnName) {
	        var isValidRowKey = !util.isBlank(rowKey) && !!this.dataModel.get(rowKey);
	        var isValidColumnName = !util.isBlank(columnName) && !!this.columnModel.getColumnModel(columnName);

	        return isValidRowKey && isValidColumnName;
	    },

	    /**
	     * 현재 focus 된 row 기준으로 offset 만큼 이동한 rowKey 를 반환한다.
	     * @param {Number} offset   이동할 offset
	     * @returns {?Number|String} rowKey   offset 만큼 이동한 위치의 rowKey
	     * @private
	     */
	    _findRowKey: function(offset) {
	        var dataModel = this.dataModel;
	        var rowKey = null;
	        var index, row;

	        if (this.has(true)) {
	            index = Math.max(
	                Math.min(
	                    dataModel.indexOfRowKey(this.get('rowKey')) + offset,
	                    this.dataModel.length - 1
	                ), 0
	            );
	            row = dataModel.at(index);
	            if (row) {
	                rowKey = row.get('rowKey');
	            }
	        }
	        return rowKey;
	    },

	    /**
	     * 현재 focus 된 column 기준으로 offset 만큼 이동한 columnName 을 반환한다.
	     * @param {Number} offset   이동할 offset
	     * @returns {?String} columnName  offset 만큼 이동한 위치의 columnName
	     * @private
	     */
	    _findColumnName: function(offset) {
	        var columnModel = this.columnModel;
	        var columnModelList = columnModel.getVisibleColumnModelList();
	        var columnIndex = columnModel.indexOfColumnName(this.get('columnName'), true);
	        var columnName = null;
	        var index;

	        if (this.has(true)) {
	            index = Math.max(Math.min(columnIndex + offset, columnModelList.length - 1), 0);
	            columnName = columnModelList[index] && columnModelList[index].columnName;
	        }
	        return columnName;
	    },

	    /**
	     * rowSpanData 를 반환한다.
	     * @param {Number|String} rowKey    조회할 데이터의 키값
	     * @param {String} columnName   컬럼명
	     * @returns {*|{count: number, isMainRow: boolean, mainRowKey: *}|*} rowSpanData 정보
	     * @private
	     */
	    _getRowSpanData: function(rowKey, columnName) {
	        return this.dataModel.get(rowKey).getRowSpanData(columnName);
	    },

	    /**
	     * offset 만큼 뒤로 이동한 row 의 index 를 반환한다.
	     * @param {number} offset   이동할 offset
	     * @returns {Number} 이동한 위치의 row index
	     */
	    nextRowIndex: function(offset) {
	        var rowKey = this.nextRowKey(offset);

	        return this.dataModel.indexOfRowKey(rowKey);
	    },

	    /**
	     * offset 만큼 앞으로 이동한 row의 index를 반환한다.
	     * @param {number} offset 이동할 offset
	     * @returns {Number} 이동한 위치의 row index
	     */
	    prevRowIndex: function(offset) {
	        var rowKey = this.prevRowKey(offset);

	        return this.dataModel.indexOfRowKey(rowKey);
	    },

	    /**
	     * 다음 컬럼의 인덱스를 반환한다.
	     * @returns {Number} 다음 컬럼의 index
	     */
	    nextColumnIndex: function() {
	        var columnName = this.nextColumnName();

	        return this.columnModel.indexOfColumnName(columnName, true);
	    },

	    /**
	     * 이전 컬럼의 인덱스를 반환한다.
	     * @returns {Number} 이전 컬럼의 인덱스
	     */
	    prevColumnIndex: function() {
	        var columnName = this.prevColumnName();

	        return this.columnModel.indexOfColumnName(columnName, true);
	    },

	    /**
	     * keyEvent 발생 시 호출될 메서드로,
	     * rowSpan 정보 까지 계산된 다음 rowKey 를 반환한다.
	     * @param {number}  offset 이동할 offset
	     * @returns {Number|String} offset 만큼 이동한 위치의 rowKey
	     */
	    nextRowKey: function(offset) {
	        var focused = this.which();
	        var rowKey = focused.rowKey;
	        var count, rowSpanData;

	        offset = (typeof offset === 'number') ? offset : 1;
	        if (offset > 1) {
	            rowKey = this._findRowKey(offset);
	            rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
	            if (!rowSpanData.isMainRow) {
	                rowKey = this._findRowKey(rowSpanData.count + offset);
	            }
	        } else {
	            rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
	            if (rowSpanData.isMainRow && rowSpanData.count > 0) {
	                rowKey = this._findRowKey(rowSpanData.count);
	            } else if (!rowSpanData.isMainRow) {
	                count = rowSpanData.count;
	                rowSpanData = this._getRowSpanData(rowSpanData.mainRowKey, focused.columnName);
	                rowKey = this._findRowKey(rowSpanData.count + count);
	            } else {
	                rowKey = this._findRowKey(1);
	            }
	        }

	        return rowKey;
	    },

	    /**
	     * keyEvent 발생 시 호출될 메서드로,
	     * rowSpan 정보 까지 계산된 이전 rowKey 를 반환한다.
	     * @param {number}  offset 이동할 offset
	     * @returns {Number|String} offset 만큼 이동한 위치의 rowKey
	     */
	    prevRowKey: function(offset) {
	        var focused = this.which();
	        var rowKey = focused.rowKey;
	        var rowSpanData;

	        offset = typeof offset === 'number' ? offset : 1;
	        offset *= -1;

	        if (offset < -1) {
	            rowKey = this._findRowKey(offset);
	            rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
	            if (!rowSpanData.isMainRow) {
	                rowKey = this._findRowKey(rowSpanData.count + offset);
	            }
	        } else {
	            rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
	            if (!rowSpanData.isMainRow) {
	                rowKey = this._findRowKey(rowSpanData.count - 1);
	            } else {
	                rowKey = this._findRowKey(-1);
	            }
	        }

	        return rowKey;
	    },

	    /**
	     * keyEvent 발생 시 호출될 메서드로, 다음 columnName 을 반환한다.
	     * @returns {String} 다음 컬럼명
	     */
	    nextColumnName: function() {
	        return this._findColumnName(1);
	    },

	    /**
	     * keyEvent 발생 시 호출될 메서드로, 이전 columnName 을 반환한다.
	     * @returns {String} 이전 컬럼명
	     */
	    prevColumnName: function() {
	        return this._findColumnName(-1);
	    },

	    /**
	     * 첫번째 row 의 key 를 반환한다.
	     * @returns {(string|number)} 첫번째 row 의 키값
	     */
	    firstRowKey: function() {
	        return this.dataModel.at(0).get('rowKey');
	    },

	    /**
	     * 마지막 row의 key 를 반환한다.
	     * @returns {(string|number)} 마지막 row 의 키값
	     */
	    lastRowKey: function() {
	        return this.dataModel.at(this.dataModel.length - 1).get('rowKey');
	    },

	    /**
	     * 첫번째 columnName 을 반환한다.
	     * @returns {string} 첫번째 컬럼명
	     */
	    firstColumnName: function() {
	        var columnModelList = this.columnModel.getVisibleColumnModelList();

	        return columnModelList[0].columnName;
	    },

	    /**
	     * 마지막 columnName 을 반환한다.
	     * @returns {string} 마지막 컬럼명
	     */
	    lastColumnName: function() {
	        var columnModelList = this.columnModel.getVisibleColumnModelList();
	        var lastIndex = columnModelList.length - 1;

	        return columnModelList[lastIndex].columnName;
	    },

	    /**
	     * Returns the address of previous cell.
	     * @returns {{rowKey: number, columnName: string}}
	     */
	    prevAddress: function() {
	        var rowKey = this.get('rowKey');
	        var columnName = this.get('columnName');
	        var isFirstColumn = columnName === this.firstColumnName();
	        var isFirstRow = rowKey === this.firstRowKey();
	        var prevRowKey, prevColumnName;

	        if (isFirstRow && isFirstColumn) {
	            prevRowKey = rowKey;
	            prevColumnName = columnName;
	        } else if (isFirstColumn) {
	            prevRowKey = this.prevRowKey();
	            prevColumnName = this.lastColumnName();
	        } else {
	            prevRowKey = rowKey;
	            prevColumnName = this.prevColumnName();
	        }

	        return {
	            rowKey: prevRowKey,
	            columnName: prevColumnName
	        };
	    },

	    /**
	     * Returns the address of next cell.
	     * @returns {{rowKey: number, columnName: string}}
	     */
	    nextAddress: function() {
	        var rowKey = this.get('rowKey');
	        var columnName = this.get('columnName');
	        var isLastColumn = columnName === this.lastColumnName();
	        var isLastRow = rowKey === this.lastRowKey();
	        var nextRowKey, nextColumnName;

	        if (isLastRow && isLastColumn) {
	            nextRowKey = rowKey;
	            nextColumnName = columnName;
	        } else if (isLastColumn) {
	            nextRowKey = this.nextRowKey();
	            nextColumnName = this.firstColumnName();
	        } else {
	            nextRowKey = rowKey;
	            nextColumnName = this.nextColumnName();
	        }

	        return {
	            rowKey: nextRowKey,
	            columnName: nextColumnName
	        };
	    }
	});

	module.exports = Focus;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Event class for public event of Grid
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	/**
	 * Event class for public event of Grid
	 * @module common/gridEvent
	 * @param {Object} data - Event data for handler
	 * @ignore
	 */
	var GridEvent = tui.util.defineClass(/**@lends module:common/gridEvent.prototype */{
	    init: function(data) {
	        this._stopped = false;
	        this.setData(data);
	    },

	    /**
	     * Sets data
	     * @param {Object} data - data
	     */
	    setData: function(data) {
	        _.extend(this, data);
	    },

	    /**
	     * Stops propogation of this event.
	     * @api
	     */
	    stop: function() {
	        this._stopped = true;
	    },

	    /**
	     * Returns whether this event is stopped.
	     * @returns {Boolean}
	     */
	    isStopped: function() {
	        return this._stopped;
	    }
	});

	module.exports = GridEvent;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Rendering 모델
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var Model = __webpack_require__(8);
	var RowList = __webpack_require__(24);
	var renderStateMap = __webpack_require__(10).renderState;
	var CELL_BORDER_WIDTH = __webpack_require__(10).dimension.CELL_BORDER_WIDTH;

	var DATA_LENGTH_FOR_LOADING = 1000;

	/**
	 * View 에서 Rendering 시 사용할 객체
	 * @module model/renderer
	 * @extends module:base/model
	 * @param {Object} attrs - Attributes
	 * @param {Object} options - Options
	 * @ignore
	 */
	var Renderer = Model.extend(/**@lends module:model/renderer.prototype */{
	    initialize: function(attrs, options) {
	        var lside, rside, rowListOptions;

	        this.setOwnProperties({
	            dataModel: options.dataModel,
	            columnModel: options.columnModel,
	            focusModel: options.focusModel,
	            dimensionModel: options.dimensionModel,
	            coordRowModel: options.coordRowModel,
	            coordColumnModel: options.coordColumnModel
	        });

	        rowListOptions = {
	            dataModel: this.dataModel,
	            columnModel: this.columnModel,
	            focusModel: this.focusModel
	        };

	        lside = new RowList([], rowListOptions);
	        rside = new RowList([], rowListOptions);
	        this.set({
	            lside: lside,
	            rside: rside
	        });

	        this.listenTo(this.columnModel, 'columnModelChange change', this._onColumnModelChange)
	            .listenTo(this.dataModel, 'add remove sort reset delRange', this._onDataListChange)
	            .listenTo(this.dataModel, 'add', this._onAddDataModel)
	            .listenTo(this.dataModel, 'beforeReset', this._onBeforeResetData)
	            .listenTo(lside, 'valueChange', this._executeRelation)
	            .listenTo(rside, 'valueChange', this._executeRelation)
	            .listenTo(this.focusModel, 'change:editingAddress', this._onEditingAddressChange)
	            .listenTo(this.coordRowModel, 'reset', this._onChangeRowHeights)
	            .listenTo(this.dimensionModel, 'change:width', this._updateMaxScrollLeft)
	            .listenTo(this.dimensionModel, 'change:totalRowHeight change:scrollBarSize change:bodyHeight',
	                this._updateMaxScrollTop);

	        if (this.get('showDummyRows')) {
	            this.listenTo(this.dimensionModel, 'change:bodyHeight change:totalRowHeight', this._resetDummyRowCount);
	            this.on('change:dummyRowCount', this._resetDummyRows);
	        }

	        this._onChangeLayoutBound = _.bind(this._onChangeLayout, this);

	        this.listenTo(this.dimensionModel, 'columnWidthChanged', this.finishEditing);

	        this._updateMaxScrollLeft();
	    },

	    defaults: {
	        top: 0,
	        bottom: 0,
	        scrollTop: 0,
	        scrollLeft: 0,
	        maxScrollLeft: 0,
	        maxScrollTop: 0,
	        startIndex: 0,
	        endIndex: 0,
	        startNumber: 1,
	        lside: null,
	        rside: null,
	        showDummyRows: false,
	        dummyRowCount: 0,

	        // text that will be shown if no data to render (custom value set by user)
	        emptyMessage: null,

	        // constMap.renderState
	        state: renderStateMap.DONE
	    },

	    /**
	     * Event handler for change:scrollTop and change:scrollLeft.
	     * @private
	     */
	    _onChangeLayout: function() {
	        this.focusModel.finishEditing();
	        this.focusModel.focusClipboard();
	    },

	    /**
	     * Event handler for 'reset' event on coordRowModel
	     * @private
	     */
	    _onChangeRowHeights: function() {
	        var coordRowModel = this.coordRowModel;
	        var lside = this.get('lside');
	        var rside = this.get('rside');
	        var len = lside.length;
	        var i = 0;
	        var height;

	        for (; i < len; i += 1) {
	            height = coordRowModel.getHeightAt(i);
	            lside.at(i).set('height', height);
	            rside.at(i).set('height', height);
	        }
	    },

	    /**
	     * Event handler for 'chage:width' event on Dimension.
	     * @private
	     */
	    _updateMaxScrollLeft: function() {
	        var dimension = this.dimensionModel;
	        var maxScrollLeft = this.coordColumnModel.getFrameWidth('R') - dimension.get('rsideWidth') +
	                dimension.getScrollYWidth();

	        this.set('maxScrollLeft', maxScrollLeft);
	    },

	    /**
	     * Event handler to reset 'maxScrollTop' attribute.
	     * @private
	     */
	    _updateMaxScrollTop: function() {
	        var dimension = this.dimensionModel;
	        var maxScrollTop = dimension.get('totalRowHeight') - dimension.get('bodyHeight') +
	            dimension.getScrollXHeight();

	        this.set('maxScrollTop', maxScrollTop);
	    },

	    /**
	     * Event handler for 'beforeReset' event on dataModel
	     * @param {number} dataLength - the length of data
	     * @private
	     */
	    _onBeforeResetData: function(dataLength) {
	        if (dataLength > DATA_LENGTH_FOR_LOADING) {
	            this.set('state', renderStateMap.LOADING);
	        }
	    },

	    /**
	     * Event handler for 'change:editingAddress' event on focusModel
	     * @param {module:model/focus} focusModel - focus model
	     * @param {{rowKey: Number, columnName: String}} address - address
	     * @private
	     */
	    _onEditingAddressChange: function(focusModel, address) {
	        var target = address;
	        var editing = true;
	        var self = this;

	        if (!address) {
	            target = focusModel.previous('editingAddress');
	            editing = false;
	        }
	        this._updateCellData(target.rowKey, target.columnName, {
	            isEditing: editing
	        });

	        this._triggerEditingStateChanged(target.rowKey, target.columnName);

	        // defered call to prevent 'change:scrollLeft' or 'change:scrollTop' event
	        // triggered by module:view/layout/body._onScroll()
	        // when module:model/focus.scrollToFocus() method is called.
	        _.defer(function() {
	            self._toggleChangeLayoutEventHandlers(editing);
	        });
	    },

	    /**
	     * Toggle event handler for change:scrollTop and change:scrollLeft event.
	     * @param {Boolean} editing - whether currently editing
	     * @private
	     */
	    _toggleChangeLayoutEventHandlers: function(editing) {
	        var renderEventName = 'change:scrollTop change:scrollLeft';
	        var dimensionEventName = 'columnWidthChanged';

	        if (editing) {
	            this.listenToOnce(this.dimensionModel, dimensionEventName, this._onChangeLayoutBound);
	            this.once(renderEventName, this._onChangeLayoutBound);
	        } else {
	            this.stopListening(this.dimensionModel, dimensionEventName, this._onChangeLayoutBound);
	            this.off(renderEventName, this._onChangeLayoutBound);
	        }
	    },

	    /**
	     * Triggers the 'editingStateChanged' event if the cell data identified by
	     * given row key and column name has the useViewMode:true option.
	     * @param {String} rowKey - row key
	     * @param {String} columnName - column name
	     * @private
	     */
	    _triggerEditingStateChanged: function(rowKey, columnName) {
	        var cellData = this.getCellData(rowKey, columnName);

	        if (tui.util.pick(cellData, 'columnModel', 'editOption', 'useViewMode') !== false) {
	            this.trigger('editingStateChanged', cellData);
	        }
	    },

	    /**
	     * Updates the view-data of the cell identified by given rowKey and columnName.
	     * @param {(String|Number)} rowKey - row key
	     * @param {String} columnName - column name
	     * @param {Object} cellData - cell data
	     * @private
	     */
	    _updateCellData: function(rowKey, columnName, cellData) {
	        var rowModel = this._getRowModel(rowKey, columnName);

	        if (rowModel) {
	            rowModel.setCell(columnName, cellData);
	        }
	    },

	    /**
	     * Initializes own properties.
	     * (called by module:addon/net)
	     */
	    initializeVariables: function() {
	        this.set({
	            top: 0,
	            scrollTop: 0,
	            scrollLeft: 0,
	            startIndex: 0,
	            endIndex: 0,
	            startNumber: 1
	        });
	    },

	    /**
	     * 열고정 영역 또는 열고정이 아닌 영역에 대한 Render Collection 을 반환한다.
	     * @param {String} [whichSide='R']    어느 영역인지 여부. 'L|R' 중에 하나의 값을 넘긴다.
	     * @returns {Object} collection  해당 영역의 랜더 데이터 콜랙션
	     */
	    getCollection: function(whichSide) {
	        return this.get(tui.util.isString(whichSide) ? whichSide.toLowerCase() + 'side' : 'rside');
	    },

	    /**
	     * Data.ColumnModel 이 변경되었을 때 열고정 영역 frame, 열고정 영역이 아닌 frame 의 list 를 재생성 하기 위한 이벤트 핸들러
	     * @private
	     */
	    _onColumnModelChange: function() {
	        this.set({
	            scrollTop: 0,
	            top: 0,
	            startIndex: 0,
	            endIndex: 0
	        });
	        this.refresh({
	            columnModelChanged: true
	        });
	    },

	    /**
	     * Event handler for changing data list
	     * @private
	     */
	    _onDataListChange: function() {
	        this.refresh({
	            dataListChanged: true
	        });
	    },

	    /**
	     * Event handler for 'add' event on dataModel.
	     * @param  {module:model/data/rowList} dataModel - data model
	     * @param  {Object} options - options for appending. See {@link module:model/data/rowList#append}
	     * @private
	     */
	    _onAddDataModel: function(dataModel, options) {
	        if (options.focus) {
	            this.focusModel.focusAt(options.at, 0);
	        }
	    },

	    /**
	     * Resets dummy rows and trigger 'dataListChanged' event.
	     * @private
	     */
	    _resetDummyRows: function() {
	        this._clearDummyRows();
	        this._fillDummyRows();
	        this.trigger('rowListChanged');
	    },

	    /**
	     * rendering 할 index 범위를 결정한다.
	     * Smart rendering 을 사용하지 않을 경우 전체 범위로 랜더링한다.
	     * @private
	     */
	    _setRenderingRange: function() {
	        this.set({
	            startIndex: 0,
	            endIndex: this.dataModel.length - 1
	        });
	    },

	    /**
	     * Returns the new data object for rendering based on rowDataModel and specified column names.
	     * @param  {Object} rowDataModel - Instance of module:model/data/row
	     * @param  {Array.<String>} columnNames - Column names
	     * @param  {Number} height - the height of the row
	     * @param  {Number} rowNum - Row number
	     * @returns {Object} - view data object
	     * @private
	     */
	    _createViewDataFromDataModel: function(rowDataModel, columnNames, height, rowNum) {
	        var viewData = {
	            height: height,
	            rowNum: rowNum,
	            rowKey: rowDataModel.get('rowKey'),
	            _extraData: rowDataModel.get('_extraData')
	        };

	        _.each(columnNames, function(columnName) {
	            var value = rowDataModel.get(columnName);

	            if (columnName === '_number' && !_.isNumber(value)) {
	                value = rowNum;
	            }
	            viewData[columnName] = value;
	        });

	        return viewData;
	    },

	    /**
	     * Returns the object that contains two array of column names splitted by columnFixCount.
	     * @returns {{lside: Array, rside: Array}} - Column names map
	     * @private
	     */
	    _getColumnNamesOfEachSide: function() {
	        var columnFixCount = this.columnModel.getVisibleColumnFixCount(true);
	        var columnModels = this.columnModel.getVisibleColumnModelList(null, true);
	        var columnNames = _.pluck(columnModels, 'columnName');

	        return {
	            lside: columnNames.slice(0, columnFixCount),
	            rside: columnNames.slice(columnFixCount)
	        };
	    },

	    /**
	     * Resets specified view model list.
	     * @param  {String} attrName - 'lside' or 'rside'
	     * @param  {Object} viewData - Converted data for rendering view
	     * @private
	     */
	    _resetViewModelList: function(attrName, viewData) {
	        this.get(attrName).clear().reset(viewData, {
	            parse: true
	        });
	    },

	    /**
	     * Resets both sides(lside, rside) of view model list with given range of data model list.
	     * @param  {Number} startIndex - Start index
	     * @param  {Number} endIndex - End index
	     * @private
	     */
	    _resetAllViewModelListWithRange: function(startIndex, endIndex) {
	        var columnNamesMap = this._getColumnNamesOfEachSide();
	        var rowNum = this.get('startNumber') + startIndex;
	        var lsideData = [];
	        var rsideData = [];
	        var rowDataModel, height, i;

	        for (i = startIndex; i <= endIndex; i += 1) {
	            rowDataModel = this.dataModel.at(i);
	            height = this.coordRowModel.getHeightAt(i);

	            lsideData.push(this._createViewDataFromDataModel(rowDataModel, columnNamesMap.lside, height, rowNum));
	            rsideData.push(this._createViewDataFromDataModel(rowDataModel, columnNamesMap.rside, height, rowNum));
	            rowNum += 1;
	        }

	        this._resetViewModelList('lside', lsideData);
	        this._resetViewModelList('rside', rsideData);
	    },

	    /**
	     * Returns the count of rows (except dummy rows) in view model list
	     * @returns {Number} Count of rows
	     * @private
	     */
	    _getActualRowCount: function() {
	        return this.get('endIndex') - this.get('startIndex') + 1;
	    },

	    /**
	     * Removes all dummy rows in the view model list.
	     * @private
	     */
	    _clearDummyRows: function() {
	        var dataRowCount = this.get('endIndex') - this.get('startIndex') + 1;

	        _.each(['lside', 'rside'], function(attrName) {
	            var rowList = this.get(attrName);

	            while (rowList.length > dataRowCount) {
	                rowList.pop();
	            }
	        }, this);
	    },

	    /**
	     * Calculate required count of dummy rows and set the 'dummyRowCount' attribute.
	     * @param {boolean} silent - whether sets the dummyRowCount silently
	     * @private
	     */
	    _resetDummyRowCount: function() {
	        var dimensionModel = this.dimensionModel;
	        var totalRowHeight = dimensionModel.get('totalRowHeight');
	        var rowHeight = dimensionModel.get('rowHeight') + CELL_BORDER_WIDTH;
	        var bodyHeight = dimensionModel.get('bodyHeight') - dimensionModel.getScrollXHeight();
	        var dummyRowCount = 0;

	        if (totalRowHeight < bodyHeight) {
	            dummyRowCount = Math.ceil((bodyHeight - totalRowHeight) / rowHeight);
	        }

	        this.set('dummyRowCount', dummyRowCount);
	    },

	    /**
	     * fills the empty area with dummy rows.
	     * @private
	     */
	    _fillDummyRows: function() {
	        var dummyRowCount = this.get('dummyRowCount');
	        var rowNum, rowHeight;


	        if (dummyRowCount) {
	            rowNum = this.get('startNumber') + this.get('endIndex') + 1;
	            rowHeight = this.dimensionModel.get('rowHeight');

	            _.times(dummyRowCount, function() {
	                _.each(['lside', 'rside'], function(listName) {
	                    this.get(listName).add({
	                        height: rowHeight,
	                        rowNum: rowNum
	                    });
	                }, this);
	                rowNum += 1;
	            }, this);
	        }
	    },

	    /**
	     * Refreshes the rendering range and the list of view models, and triggers events.
	     * @param {Object} options - options
	     * @param {Boolean} [options.columnModelChanged] - The boolean value whether columnModel has changed
	     * @param {Boolean} [options.dataListChanged] - The boolean value whether dataModel has changed
	     */
	    refresh: function(options) {
	        var columnModelChanged = !!options && options.columnModelChanged;
	        var dataListChanged = !!options && options.dataListChanged;
	        var startIndex, endIndex, i;

	        this._setRenderingRange(this.get('scrollTop'));
	        startIndex = this.get('startIndex');
	        endIndex = this.get('endIndex');

	        this._resetAllViewModelListWithRange(startIndex, endIndex);

	        for (i = startIndex; i <= endIndex; i += 1) {
	            this._executeRelation(i);
	        }

	        if (columnModelChanged) {
	            this.trigger('columnModelChanged');
	        } else {
	            this.trigger('rowListChanged', dataListChanged);
	            if (dataListChanged) {
	                this.coordRowModel.syncWithDom();
	            }
	        }
	        this._refreshState();
	    },

	    /**
	     * Set state value based on the DataModel.length
	     * @private
	     */
	    _refreshState: function() {
	        if (this.dataModel.length) {
	            this.set('state', renderStateMap.DONE);
	        } else {
	            this.set('state', renderStateMap.EMPTY);
	        }
	    },

	    /**
	     * columnName 으로 lside 와 rside rendering collection 중 하나를 반환한다.
	     * @param {String} columnName   컬럼명
	     * @returns {Collection} 컬럼명에 해당하는 영역의 콜랙션
	     * @private
	     */
	    _getCollectionByColumnName: function(columnName) {
	        var lside = this.get('lside');
	        var collection;

	        if (lside.at(0) && lside.at(0).get(columnName)) {
	            collection = lside;
	        } else {
	            collection = this.get('rside');
	        }
	        return collection;
	    },

	    /**
	     * Returns the specified row model.
	     * @param {(Number|String)} rowKey - row key
	     * @param {String} columnName - column name
	     * @returns {module:model/row}
	     * @private
	     */
	    _getRowModel: function(rowKey, columnName) {
	        var collection = this._getCollectionByColumnName(columnName);

	        return collection.get(rowKey);
	    },

	    /**
	     * 셀 데이터를 반환한다.
	     * @param {number} rowKey   데이터의 키값
	     * @param {String} columnName   컬럼명
	     * @returns {object} cellData 셀 데이터
	     * @example
	     =>
	     {
	         rowKey: rowKey,
	         columnName: columnName,
	         value: value,
	         rowSpan: rowSpanData.count,
	         isMainRow: rowSpanData.isMainRow,
	         mainRowKey: rowSpanData.mainRowKey,
	         isEditable: isEditable,
	         isDisabled: isDisabled,
	         optionList: [],
	         className: row.getClassNameList(columnName).join(' '),
	         changed: []    //names of changed properties
	     }
	     */
	    getCellData: function(rowKey, columnName) {
	        var row = this._getRowModel(rowKey, columnName);
	        var cellData = null;

	        if (row) {
	            cellData = row.get(columnName);
	        }

	        return cellData;
	    },

	    /**
	     * Executes the relation of the row identified by rowIndex
	     * @param {Number} rowIndex - Row index
	     * @private
	     */
	    _executeRelation: function(rowIndex) {
	        var row = this.dataModel.at(rowIndex);
	        var renderIdx = rowIndex - this.get('startIndex');
	        var rowModel, relationResult;

	        relationResult = row.executeRelationCallbacksAll();

	        _.each(relationResult, function(changes, columnName) {
	            rowModel = this._getCollectionByColumnName(columnName).at(renderIdx);
	            if (rowModel) {
	                rowModel.setCell(columnName, changes);
	            }
	        }, this);
	    }
	});

	module.exports = Renderer;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview RowList 클래스파일
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var Collection = __webpack_require__(12);
	var Row = __webpack_require__(25);

	/**
	  * View Model rowList collection
	  * @module model/rowList
	  * @extends module:base/collection
	  * @param {Object} rawData - Raw data
	  * @param {Object} options - Options
	  * @ignore
	  */
	var RowList = Collection.extend(/**@lends module:model/rowList.prototype */{
	    initialize: function(rawData, options) {
	        this.setOwnProperties({
	            dataModel: options.dataModel,
	            columnModel: options.columnModel,
	            focusModel: options.focusModel
	        });
	    },

	    model: Row
	});

	module.exports = RowList;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Row Model for Rendering (View Model)
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var Model = __webpack_require__(8);
	var util = __webpack_require__(9);

	/**
	 * Row Model
	 * @module model/row
	 * @param  {object} attributes - Attributes
	 * @param  {object} options - Options
	 * @extends module:base/model
	 * @ignore
	 */
	var Row = Model.extend(/**@lends module:model/row.prototype */{
	    initialize: function(attributes) {
	        var rowKey = attributes && attributes.rowKey;
	        var dataModel = this.collection.dataModel;
	        var rowData = dataModel.get(rowKey);

	        this.dataModel = dataModel;
	        this.columnModel = this.collection.columnModel;
	        this.focusModel = this.collection.focusModel;

	        if (rowData) {
	            this.listenTo(rowData, 'change', this._onDataModelChange);
	            this.listenTo(rowData, 'restore', this._onDataModelRestore);
	            this.listenTo(rowData, 'extraDataChanged', this._setRowExtraData);
	            this.listenTo(dataModel, 'disabledChanged', this._onDataModelDisabledChanged);
	            this.rowData = rowData;
	        }
	    },

	    idAttribute: 'rowKey',

	    /**
	     * Event handler for 'change' event on module:data/row
	     * @param {Object} rowData - RowData model on which event occurred
	     * @private
	     */
	    _onDataModelChange: function(rowData) {
	        _.each(rowData.changed, function(value, columnName) {
	            var column, isTextType;

	            if (this.has(columnName)) {
	                column = this.columnModel.getColumnModel(columnName);
	                isTextType = this.columnModel.isTextType(columnName);

	                this.setCell(columnName, this._getValueAttrs(value, rowData, column, isTextType));
	            }
	        }, this);
	    },

	    /**
	     * Event handler for 'restore' event on module:data/row
	     * @param {String} columnName - columnName
	     * @private
	     */
	    _onDataModelRestore: function(columnName) {
	        var cellData = this.get(columnName);

	        if (cellData) {
	            this.trigger('restore', cellData);
	        }
	    },

	    /**
	     * Returns an array of visible column names.
	     * @returns {Array.<String>} Visible column names
	     * @private
	     */
	    _getColumnNameList: function() {
	        var columnModels = this.collection.columnModel.getVisibleColumnModelList(null, true);

	        return _.pluck(columnModels, 'columnName');
	    },

	    /**
	     * Event handler for 'disabledChanged' event on dataModel
	     */
	    _onDataModelDisabledChanged: function() {
	        var columnNames = this._getColumnNameList();

	        _.each(columnNames, function(columnName) {
	            this.setCell(columnName, {
	                isDisabled: this.rowData.isDisabled(columnName),
	                className: this._getClassNameString(columnName)
	            });
	        }, this);
	    },

	    /**
	     * Sets the 'isDisabled', 'isEditable', 'className' property of each cell data.
	     * @private
	     */
	    _setRowExtraData: function() {
	        if (tui.util.isUndefined(this.collection)) {
	            return;
	        }

	        _.each(this._getColumnNameList(), function(columnName) {
	            var cellData = this.get(columnName);
	            var cellState;

	            if (!tui.util.isUndefined(cellData) && cellData.isMainRow) {
	                cellState = this.rowData.getCellState(columnName);

	                this.setCell(columnName, {
	                    isDisabled: cellState.isDisabled,
	                    isEditable: cellState.isEditable,
	                    className: this._getClassNameString(columnName)
	                });
	            }
	        }, this);
	    },

	    /**
	     * Overrides Backbone.Model.parse
	     * (this method is called before initialize method)
	     * @param {Array} data - Original data
	     * @param {Object} options - Options
	     * @returns {Array} - Converted data.
	     * @override
	     */
	    parse: function(data, options) {
	        var collection = options.collection;

	        return this._formatData(data, collection.dataModel, collection.columnModel, collection.focusModel);
	    },

	    /**
	     * Convert the original data to the rendering data.
	     * @param {Array} data - Original data
	     * @param {module:model/data/rowList} dataModel - Data model
	     * @param {module:model/data/columnModel} columnModel - Column model
	     * @param {module:model/data/focusModel} focusModel - focus model
	     * @param {Number} rowHeight - The height of a row
	     * @returns {Array} - Converted data
	     * @private
	     */
	    _formatData: function(data, dataModel, columnModel, focusModel) {
	        var rowKey = data.rowKey;
	        var rowNum = data.rowNum;
	        var rowHeight = data.height;
	        var columnData, row;

	        if (_.isUndefined(rowKey)) {
	            return data;
	        }

	        row = dataModel.get(rowKey);
	        columnData = _.omit(data, 'rowKey', '_extraData', 'height', 'rowNum');

	        _.each(columnData, function(value, columnName) {
	            var rowSpanData = this._getRowSpanData(columnName, data, dataModel.isRowSpanEnable());
	            var cellState = row.getCellState(columnName);
	            var isTextType = columnModel.isTextType(columnName);
	            var column = columnModel.getColumnModel(columnName);

	            data[columnName] = {
	                rowKey: rowKey,
	                rowNum: rowNum,
	                height: rowHeight,
	                columnName: columnName,
	                rowSpan: rowSpanData.count,
	                isMainRow: rowSpanData.isMainRow,
	                mainRowKey: rowSpanData.mainRowKey,
	                isEditable: cellState.isEditable,
	                isDisabled: cellState.isDisabled,
	                isEditing: focusModel.isEditingCell(rowKey, columnName),
	                whiteSpace: column.whiteSpace || 'nowrap',
	                valign: column.valign,
	                optionList: tui.util.pick(column, 'editOption', 'list'),
	                className: this._getClassNameString(columnName, row, focusModel),
	                columnModel: column,
	                changed: [] //changed property names
	            };
	            _.assign(data[columnName], this._getValueAttrs(value, row, column, isTextType));
	        }, this);

	        return data;
	    },

	    /**
	     * Returns the class name string of the a cell.
	     * @param {String} columnName - column name
	     * @param {module:model/data/row} [row] - data model of a row
	     * @param {module:model/focus} [focusModel] - focus model
	     * @returns {String}
	     */
	    _getClassNameString: function(columnName, row, focusModel) {
	        var classNames;

	        if (!row) {
	            row = this.dataModel.get(this.get('rowKey'));
	            if (!row) {
	                return '';
	            }
	        }
	        if (!focusModel) {
	            focusModel = this.focusModel;
	        }
	        classNames = row.getClassNameList(columnName);

	        return classNames.join(' ');
	    },

	    /**
	     * Returns the values of the attributes related to the cell value.
	     * @param {String|Number} value - Value
	     * @param {module:model/data/row} row - Row data model
	     * @param {Object} column - Column model object
	     * @param {Boolean} isTextType - True if the cell is the text-type
	     * @returns {Object}
	     * @private
	     */
	    _getValueAttrs: function(value, row, column, isTextType) {
	        var beforeContent = tui.util.pick(column, 'editOption', 'beforeContent');
	        var afterContent = tui.util.pick(column, 'editOption', 'afterContent');
	        var converter = tui.util.pick(column, 'editOption', 'converter');
	        var rowAttrs = row.toJSON();

	        return {
	            value: this._getValueToDisplay(value, column, isTextType),
	            formattedValue: this._getFormattedValue(value, rowAttrs, column),
	            beforeContent: this._getExtraContent(beforeContent, value, rowAttrs),
	            afterContent: this._getExtraContent(afterContent, value, rowAttrs),
	            convertedHTML: this._getConvertedHTML(converter, value, rowAttrs)
	        };
	    },

	    /**
	     * If the column has a 'formatter' function, exeucute it and returns the result.
	     * @param {String} value - value to display
	     * @param {Object} rowAttrs - All attributes of the row
	     * @param {Object} column - Column info
	     * @returns {String}
	     * @private
	     */
	    _getFormattedValue: function(value, rowAttrs, column) {
	        var result;

	        if (_.isFunction(column.formatter)) {
	            result = column.formatter(value, rowAttrs, column);
	        } else {
	            result = value;
	        }

	        if (_.isNumber(result)) {
	            result = String(result);
	        } else if (!result) {
	            result = '';
	        }

	        return result;
	    },

	    /**
	     * Returns the value of the 'beforeContent' or 'afterContent'.
	     * @param {(String|Function)} content - content
	     * @param {String} cellValue - cell value
	     * @param {Object} rowAttrs - All attributes of the row
	     * @returns {string}
	     * @private
	     */
	    _getExtraContent: function(content, cellValue, rowAttrs) {
	        var result = '';

	        if (_.isFunction(content)) {
	            result = content(cellValue, rowAttrs);
	        } else if (tui.util.isExisty(content)) {
	            result = content;
	        }

	        return result;
	    },

	    /**
	     * If the 'converter' function exist, execute it and returns the result.
	     * @param {Function} converter - converter
	     * @param {String} cellValue - cell value
	     * @param {Object} rowAttrs - All attributes of the row
	     * @returns {(String|Null)} - HTML string or Null
	     * @private
	     */
	    _getConvertedHTML: function(converter, cellValue, rowAttrs) {
	        var convertedHTML = null;

	        if (_.isFunction(converter)) {
	            convertedHTML = converter(cellValue, rowAttrs);
	        }
	        if (convertedHTML === false) {
	            convertedHTML = null;
	        }
	        return convertedHTML;
	    },

	    /**
	     * Returns the value to display
	     * @param {String|Number} value - value
	     * @param {String} column - column name
	     * @param {Boolean} isTextType - True if the cell is the text-typee
	     * @returns {String}
	     * @private
	     */
	    _getValueToDisplay: function(value, column, isTextType) {
	        var isExisty = tui.util.isExisty;
	        var notUseHtmlEntity = column.notUseHtmlEntity;
	        var defaultValue = column.defaultValue;

	        if (!isExisty(value)) {
	            value = isExisty(defaultValue) ? defaultValue : '';
	        }

	        if (isTextType && !notUseHtmlEntity && tui.util.hasEncodableString(value)) {
	            value = tui.util.encodeHTMLEntity(value);
	        }

	        return value;
	    },

	    /**
	     * Returns the rowspan data.
	     * @param {String} columnName - column name
	     * @param {Object} data - data
	     * @param {Boolean} isRowSpanEnable - Whether the rowspan enable
	     * @returns {Object} rowSpanData
	     * @private
	     */
	    _getRowSpanData: function(columnName, data, isRowSpanEnable) {
	        var rowSpanData = tui.util.pick(data, '_extraData', 'rowSpanData', columnName);

	        if (!isRowSpanEnable || !rowSpanData) {
	            rowSpanData = {
	                mainRowKey: data.rowKey,
	                count: 0,
	                isMainRow: true
	            };
	        }
	        return rowSpanData;
	    },

	    /**
	     * Updates the className attribute of the cell identified by a given column name.
	     * @param {String} columnName - column name
	     */
	    updateClassName: function(columnName) {
	        this.setCell(columnName, {
	            className: this._getClassNameString(columnName)
	        });
	    },

	    /**
	     * Sets the cell data.
	     * (Each cell data is reference type, so do not change the cell data directly and
	     *  use this method to trigger change event)
	     * @param {String} columnName - Column name
	     * @param {Object} param - Key-Value pair of the data to change
	     */
	    setCell: function(columnName, param) {
	        var isValueChanged = false;
	        var changed = [];
	        var rowIndex, rowKey, data;

	        if (!this.has(columnName)) {
	            return;
	        }

	        rowKey = this.get('rowKey');
	        data = _.clone(this.get(columnName));

	        _.each(param, function(changeValue, name) {
	            if (!util.isEqual(data[name], changeValue)) {
	                isValueChanged = (name === 'value') ? true : isValueChanged;
	                data[name] = changeValue;
	                changed.push(name);
	            }
	        }, this);

	        if (changed.length) {
	            data.changed = changed;
	            this.set(columnName, data, {
	                silent: this._shouldSetSilently(data, isValueChanged)
	            });
	            if (isValueChanged) {
	                rowIndex = this.collection.dataModel.indexOfRowKey(rowKey);
	                this.trigger('valueChange', rowIndex);
	            }
	        }
	    },

	    /**
	     * Returns whether the 'set' method should be called silently.
	     * @param {Object} cellData - cell data
	     * @param {Boolean} valueChanged - true if value changed
	     * @returns {Boolean}
	     * @private
	     */
	    _shouldSetSilently: function(cellData, valueChanged) {
	        var valueChangedOnEditing = cellData.isEditing && valueChanged;
	        var useViewMode = tui.util.pick(cellData, 'columnModel', 'editOption', 'useViewMode') !== false;
	        var editingChangedToTrue = _.contains(cellData.changed, 'isEditing') && cellData.isEditing;

	        // Silent Cases
	        // 1: If values have been changed while the isEditing is true,
	        //    prevent the related cell-view from changing its value-state until editing is finished.
	        // 2: If useViewMode is true and isEditing is changing to true,
	        //    prevent the related cell-view from changing its state to enable editing,
	        //    as the editing-layer will be used for editing instead.
	        return valueChangedOnEditing || (useViewMode && editingChangedToTrue);
	    }
	});

	module.exports = Row;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Render model to be used for smart-rendering
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var Renderer = __webpack_require__(23);
	var dimensionConst = __webpack_require__(10).dimension;

	var CELL_BORDER_WIDTH = dimensionConst.CELL_BORDER_WIDTH;

	// The ratio of buffer size to bodyHeight
	var BUFFER_RATIO = 0.3;

	// The ratio of the size bodyHeight which can cause to refresh the rendering range
	var BUFFER_HIT_RATIO = 0.1;

	/**
	 * Render model to be used for smart-rendering
	 * @module model/renderer-smart
	 * @extends module:model/renderer
	 * @ignore
	 */
	var SmartRenderer = Renderer.extend(/**@lends module:model/renderer-smart.prototype */{
	    initialize: function() {
	        Renderer.prototype.initialize.apply(this, arguments);

	        this.on('change:scrollTop', this._onChangeScrollTop, this);
	        this.listenTo(this.dimensionModel, 'change:bodyHeight', this.refresh);
	    },

	    /**
	     * Event handler for change:scrollTop event
	     * @private
	     */
	    _onChangeScrollTop: function() {
	        if (this._shouldRefresh(this.get('scrollTop'))) {
	            this.refresh();
	        }
	    },

	    /**
	     * Calculate the range to render and set the attributes.
	     * @param {number} scrollTop - scrollTop
	     * @private
	     */
	    _setRenderingRange: function(scrollTop) {
	        var dimensionModel = this.dimensionModel;
	        var dataModel = this.dataModel;
	        var coordRowModel = this.coordRowModel;
	        var bodyHeight = dimensionModel.get('bodyHeight');
	        var bufferSize = parseInt(bodyHeight * BUFFER_RATIO, 10);
	        var startIndex = Math.max(coordRowModel.indexOf(scrollTop - bufferSize), 0);
	        var endIndex = Math.min(coordRowModel.indexOf(scrollTop + bodyHeight + bufferSize), dataModel.length - 1);
	        var top = coordRowModel.getOffsetAt(startIndex);
	        var bottom = coordRowModel.getOffsetAt(endIndex) +
	            coordRowModel.getHeightAt(endIndex) + CELL_BORDER_WIDTH;

	        if (dataModel.isRowSpanEnable()) {
	            startIndex += this._getStartRowSpanMinCount(startIndex);
	            endIndex += this._getEndRowSpanMaxCount(endIndex);
	        }

	        this.set({
	            top: top,
	            bottom: bottom,
	            startIndex: startIndex,
	            endIndex: endIndex
	        });
	    },

	    /**
	     * 렌더링을 시작하는 행에 rowSpan 정보가 있으면, count 값이 가장 작은 행의 값을 반환한다.
	     * @param {number} startIndex 시작하는 행의 Index
	     * @returns {number} rowSpan의 count 값 (0 이하)
	     * @private
	     */
	    _getStartRowSpanMinCount: function(startIndex) {
	        var firstRow = this.dataModel.at(startIndex),
	            result = 0,
	            counts;

	        if (firstRow) {
	            counts = _.pluck(firstRow.getRowSpanData(), 'count');
	            counts.push(0); // count가 음수인 경우(mainRow가 아닌 경우)에만 최소값을 구함. 없으면 0
	            result = _.min(counts);
	        }
	        return result;
	    },

	    /**
	     * 렌더링할 마지막 행에 rowSpan 정보가 있으면, count 값이 가장 큰 행의 값을 반환한다.
	     * @param {number} endIndex 마지막 행의 Index
	     * @returns {number} rowSpan의 count 값 (0 이상)
	     * @private
	     */
	    _getEndRowSpanMaxCount: function(endIndex) {
	        var lastRow = this.dataModel.at(endIndex),
	            result = 0,
	            counts;

	        if (lastRow) {
	            counts = _.pluck(lastRow.getRowSpanData(), 'count');
	            counts.push(0); // count가 양수인 경우(mainRow인 경우)에만 최대값을 구함. 없으면 0
	            result = _.max(counts);
	        }
	        return result;
	    },

	    /**
	     * Returns whether the scroll potision hits the buffer limit or not.
	     * @param {number} scrollTop - scroll top
	     * @returns {boolean}
	     * @private
	     */
	    _shouldRefresh: function(scrollTop) {
	        var bodyHeight = this.dimensionModel.get('bodyHeight');
	        var scrollBottom = scrollTop + bodyHeight;
	        var totalRowHeight = this.dimensionModel.get('totalRowHeight');
	        var top = this.get('top');
	        var bottom = this.get('bottom');
	        var bufferHitSize = parseInt(bodyHeight * BUFFER_HIT_RATIO, 10);
	        var hitTopBuffer = (scrollTop - top) < bufferHitSize;
	        var hitBottomBuffer = (bottom - scrollBottom) < bufferHitSize;

	        return (hitTopBuffer && top > 0) || (hitBottomBuffer && bottom < totalRowHeight);
	    }
	});

	// exports consts for external use
	SmartRenderer.BUFFER_RATIO = BUFFER_RATIO;
	SmartRenderer.BUFFER_HIT_RATIO = BUFFER_HIT_RATIO;

	module.exports = SmartRenderer;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Selection Model class
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var Model = __webpack_require__(8);
	var util = __webpack_require__(9);
	var typeConstMap = __webpack_require__(10).selectionType;

	/**
	 * Selection Model class
	 * @module model/selection
	 * @extends module:base/view
	 * @param {Object} attr - Attributes
	 * @param {Object} options - Options
	 * @ignore
	 */
	var Selection = Model.extend(/**@lends module:model/selection.prototype */{
	    initialize: function(attr, options) {
	        Model.prototype.initialize.apply(this, arguments);

	        this.setOwnProperties({
	            dataModel: options.dataModel,
	            columnModel: options.columnModel,
	            dimensionModel: options.dimensionModel,
	            focusModel: options.focusModel,
	            renderModel: options.renderModel,
	            coordConverterModel: options.coordConverterModel,

	            inputRange: null,
	            intervalIdForAutoScroll: null,
	            scrollPixelScale: 40,
	            enabled: true,
	            selectionType: typeConstMap.CELL
	        });

	        this.listenTo(this.dataModel, 'add remove sort reset', this.end);
	        this.listenTo(this.dataModel, 'paste', this._onPasteData);
	    },

	    defaults: {
	        /**
	         * Selection range
	         * ex) {row: [0, 1], column: [1, 2]}
	         * @type {{row: array, column: array}}
	         */
	        range: null
	    },

	    /**
	     * Event handler for 'paste' event on DataModel
	     * @param {Object} range - Range
	     */
	    _onPasteData: function(range) {
	        this.start(range.startIdx.row, range.startIdx.column);
	        this.update(range.endIdx.row, range.endIdx.column);
	    },

	    /**
	     * Set selection type
	     * @param {string} type - Selection type (CELL, ROW, COLUMN)
	     */
	    setType: function(type) {
	        this.selectionType = typeConstMap[type] || this.selectionType;
	    },

	    /**
	     * Return the selection type
	     * @returns {string} type - Selection type (CELL, ROW, COLUMN)
	     */
	    getType: function() {
	        return this.selectionType;
	    },

	    /**
	     * Enables the selection.
	     */
	    enable: function() {
	        this.enabled = true;
	    },

	    /**
	     * Disables the selection.
	     */
	    disable: function() {
	        this.end();
	        this.enabled = false;
	    },

	    /**
	     * Returns whether the selection is enabled.
	     * @returns {boolean} True if the selection is enabled.
	     */
	    isEnabled: function() {
	        return this.enabled;
	    },

	    /**
	     * Starts the selection.
	     * @param {Number} rowIndex - Row index
	     * @param {Number} columnIndex - Column index
	     * @param {string} type - Selection type
	     */
	    start: function(rowIndex, columnIndex, type) {
	        if (!this.isEnabled()) {
	            return;
	        }

	        this.setType(type);
	        this.inputRange = {
	            row: [rowIndex, rowIndex],
	            column: [columnIndex, columnIndex]
	        };
	        this._resetRangeAttribute();
	    },

	    /**
	     * Updates the selection range.
	     * @param {number} rowIndex - Row index
	     * @param {number} columnIndex - Column index
	     * @param {string} [type] - Selection type
	     */
	    update: function(rowIndex, columnIndex, type) {
	        var focusedIndex;

	        if (!this.enabled || rowIndex < 0 || columnIndex < 0) {
	            return;
	        }

	        if (!this.hasSelection()) {
	            focusedIndex = this.focusModel.indexOf();
	            this.start(focusedIndex.row, focusedIndex.column, type);
	        } else {
	            this.setType(type);
	        }

	        this._updateInputRange(rowIndex, columnIndex);
	        this._resetRangeAttribute();
	    },

	    /**
	     * Update input range (end range, not start range)
	     * @param {number} rowIndex - Row index
	     * @param {number} columnIndex - Column index
	     * @private
	     */
	    _updateInputRange: function(rowIndex, columnIndex) {
	        var inputRange = this.inputRange;

	        if (this.selectionType === typeConstMap.ROW) {
	            columnIndex = this.columnModel.getVisibleColumnModelList().length - 1;
	        } else if (this.selectionType === typeConstMap.COLUMN) {
	            rowIndex = this.dataModel.length - 1;
	        }

	        inputRange.row[1] = rowIndex;
	        inputRange.column[1] = columnIndex;
	    },

	    /**
	     * Extend column selection
	     * @param {undefined|Array} columnIndexes - Column indexes
	     * @param {number} pageX - Mouse position X
	     * @param {number} pageY - Mouse positino Y
	     */
	    extendColumnSelection: function(columnIndexes, pageX, pageY) {
	        var minimumColumnRange = this._minimumColumnRange;
	        var index = this.coordConverterModel.getIndexFromMousePosition(pageX, pageY);
	        var range = {
	            row: [0, this.dataModel.length - 1],
	            column: []
	        };
	        var minMax;

	        if (!columnIndexes || !columnIndexes.length) {
	            columnIndexes = [index.column];
	        }

	        this._setScrolling(pageX, pageY);
	        if (minimumColumnRange) {
	            minMax = util.getMinMax(columnIndexes.concat(minimumColumnRange));
	        } else {
	            columnIndexes.push(this.inputRange.column[0]);
	            minMax = util.getMinMax(columnIndexes);
	        }
	        range.column.push(minMax.min, minMax.max);
	        this._resetRangeAttribute(range);
	    },

	    /**
	     * Set auto scrolling for selection
	     * @param {number} pageX - Mouse position X
	     * @param {number} pageY - Mouse positino Y
	     * @private
	     */
	    _setScrolling: function(pageX, pageY) {
	        var overflow = this.dimensionModel.getOverflowFromMousePosition(pageX, pageY);

	        this.stopAutoScroll();
	        if (this._isAutoScrollable(overflow.x, overflow.y)) {
	            this.intervalIdForAutoScroll = setInterval(
	                _.bind(this._adjustScroll, this, overflow.x, overflow.y)
	            );
	        }
	    },

	    /**
	     * Updates the selection range by mouse position.
	     * @param {number} pageX - X position relative to the document
	     * @param {number} pageY - Y position relative to the document
	     * @param {string} [type] - Selection type
	     */
	    updateByMousePosition: function(pageX, pageY, type) {
	        var index = this.coordConverterModel.getIndexFromMousePosition(pageX, pageY);

	        this._setScrolling(pageX, pageY);
	        this.update(index.row, index.column, type);
	    },

	    /**
	     * selection 영역 선택을 종료하고 selection 데이터를 초기화한다.
	     */
	    end: function() {
	        this.inputRange = null;
	        this.unset('range');
	        this.unsetMinimumColumnRange();
	    },

	    /**
	     * Stops the auto-scroll interval.
	     */
	    stopAutoScroll: function() {
	        if (!_.isNull(this.intervalIdForAutoScroll)) {
	            clearInterval(this.intervalIdForAutoScroll);
	            this.intervalIdForAutoScroll = null;
	        }
	    },

	    /**
	     * Select all data in a row
	     * @param {Number} rowIndex - Row idnex
	     */
	    selectRow: function(rowIndex) {
	        if (this.isEnabled()) {
	            this.focusModel.focusAt(rowIndex, 0);
	            this.start(rowIndex, 0, typeConstMap.ROW);
	            this.update(rowIndex, this.columnModel.getVisibleColumnModelList().length - 1);
	        }
	    },

	    /**
	     * Select all data in a column
	     * @param {Number} columnIdx - Column index
	     */
	    selectColumn: function(columnIdx) {
	        if (this.isEnabled()) {
	            this.focusModel.focusAt(0, columnIdx);
	            this.start(0, columnIdx, typeConstMap.COLUMN);
	            this.update(this.dataModel.length - 1, columnIdx);
	        }
	    },

	    /**
	     * Selects all data range.
	     */
	    selectAll: function() {
	        if (this.isEnabled()) {
	            this.start(0, 0, typeConstMap.CELL);
	            this.update(this.dataModel.length - 1, this.columnModel.getVisibleColumnModelList().length - 1);
	        }
	    },

	    /**
	     * Returns the row and column indexes of the starting position.
	     * @returns {{row: number, column: number}} Objects containing indexes
	     */
	    getStartIndex: function() {
	        var range = this.get('range');

	        return {
	            row: range.row[0],
	            column: range.column[0]
	        };
	    },

	    /**
	     * Returns the row and column indexes of the ending position.
	     * @returns {{row: number, column: number}} Objects containing indexes
	     */
	    getEndIndex: function() {
	        var range = this.get('range');

	        return {
	            row: range.row[1],
	            column: range.column[1]
	        };
	    },

	    /**
	     * selection 데이터가 존재하는지 확인한다.
	     * @returns {boolean} selection 데이터 존재여부
	     */
	    hasSelection: function() {
	        return !!this.get('range');
	    },

	    /**
	     * Returns whether given range is a single cell. (include merged cell)
	     * @param {Array.<String>} columnNameList - columnNameList
	     * @param {Array.<Object>} rowList - rowList
	     * @returns {Boolean}
	     */
	    _isSingleCell: function(columnNameList, rowList) {
	        var isSingleColumn = columnNameList.length === 1;
	        var isSingleRow = rowList.length === 1;
	        var isSingleMergedCell = isSingleColumn && !isSingleRow &&
	            (rowList[0].getRowSpanData(columnNameList[0]).count === rowList.length);

	        return (isSingleColumn && isSingleRow) || isSingleMergedCell;
	    },

	    /**
	     * Returns the string value of all cells in the selection range as a single string.
	     * @param {Boolean} useFormattedValue - Whether using rendered value or data value
	     * @returns {String}
	     */
	    getValuesToString: function(useFormattedValue) {
	        var range = this.get('range');
	        var renderModel = this.renderModel;
	        var rowList = this.dataModel.slice(range.row[0], range.row[1] + 1);
	        var columnModelList = this.columnModel.getVisibleColumnModelList().slice(range.column[0], range.column[1] + 1);
	        var columnNames = _.pluck(columnModelList, 'columnName');
	        var rowValues = _.map(rowList, function(row) {
	            return _.map(columnNames, function(columnName) {
	                if (useFormattedValue) {
	                    return renderModel.getCellData(row.get('rowKey'), columnName).formattedValue;
	                }
	                return row.getValueString(columnName);
	            }).join('\t');
	        });

	        if (this._isSingleCell(columnNames, rowList)) {
	            return rowValues[0];
	        }
	        return rowValues.join('\n');
	    },

	    /**
	     * 마우스 드래그로 selection 선택 시 auto scroll 조건에 해당하는지 반환한다.
	     * @param {Number} overflowX    가로축 기준 영역 overflow 값
	     * @param {Number} overflowY    세로축 기준 영역 overflow 값
	     * @returns {boolean} overflow 되었는지 여부
	     * @private
	     */
	    _isAutoScrollable: function(overflowX, overflowY) {
	        return !(overflowX === 0 && overflowY === 0);
	    },

	    /**
	     * Adjusts scrollTop and scrollLeft value.
	     * @param {Number} overflowX    가로축 기준 영역 overflow 값
	     * @param {Number} overflowY    세로축 기준 영역 overflow 값
	     * @private
	     */
	    _adjustScroll: function(overflowX, overflowY) {
	        var renderModel = this.renderModel;

	        if (overflowX) {
	            this._adjustScrollLeft(overflowX, renderModel.get('scrollLeft'), renderModel.get('maxScrollLeft'));
	        }
	        if (overflowY) {
	            this._adjustScrollTop(overflowY, renderModel.get('scrollTop'), renderModel.get('maxScrollTop'));
	        }
	    },

	    /**
	     * Adjusts scrollLeft value.
	     * @param  {number} overflowX - 1 | 0 | -1
	     * @param  {number} scrollLeft - Current scrollLeft value
	     * @param  {number} maxScrollLeft - Max scrollLeft value
	     * @private
	     */
	    _adjustScrollLeft: function(overflowX, scrollLeft, maxScrollLeft) {
	        var adjusted = scrollLeft;
	        var pixelScale = this.scrollPixelScale;

	        if (overflowX < 0) {
	            adjusted = Math.max(0, scrollLeft - pixelScale);
	        } else if (overflowX > 0) {
	            adjusted = Math.min(maxScrollLeft, scrollLeft + pixelScale);
	        }
	        this.renderModel.set('scrollLeft', adjusted);
	    },

	    /**
	     * Adjusts scrollTop value.
	     * @param  {number} overflowY - 1 | 0 | -1
	     * @param  {number} scrollTop - Current scrollTop value
	     * @param  {number} maxScrollTop - Max scrollTop value
	     * @private
	     */
	    _adjustScrollTop: function(overflowY, scrollTop, maxScrollTop) {
	        var adjusted = scrollTop;
	        var pixelScale = this.scrollPixelScale;

	        if (overflowY < 0) {
	            adjusted = Math.max(0, scrollTop - pixelScale);
	        } else if (overflowY > 0) {
	            adjusted = Math.min(maxScrollTop, scrollTop + pixelScale);
	        }
	        this.renderModel.set('scrollTop', adjusted);
	    },

	    /**
	     * Expands the 'this.inputRange' if rowspan data exists, and resets the 'range' attributes to the value.
	     * @param {{column: number[], row: number[]}} [inputRange] - Input range. Default is this.inputRange
	     * @private
	     */
	    _resetRangeAttribute: function(inputRange) {
	        var dataModel = this.dataModel;
	        var hasSpannedRange, spannedRange, tmpRowRange;

	        inputRange = inputRange || this.inputRange;
	        if (!inputRange) {
	            this.set('range', null);
	            return;
	        }

	        spannedRange = {
	            row: _.sortBy(inputRange.row),
	            column: _.sortBy(inputRange.column)
	        };

	        if (dataModel.isRowSpanEnable() && this.selectionType === typeConstMap.CELL) {
	            do {
	                tmpRowRange = _.assign([], spannedRange.row);
	                spannedRange = this._getRowSpannedIndex(spannedRange);

	                hasSpannedRange = (
	                    spannedRange.row[0] !== tmpRowRange[0] ||
	                    spannedRange.row[1] !== tmpRowRange[1]
	                );
	            } while (hasSpannedRange);
	            this._setRangeMinMax(spannedRange.row, spannedRange.column);
	        }

	        this.set('range', spannedRange);
	    },

	    /**
	     * Set minimum column range
	     * @param {Array} range - Minimum column range
	     */
	    setMinimumColumnRange: function(range) {
	        this._minimumColumnRange = _.extend(range);
	    },

	    /**
	     * Unset minimum column range
	     */
	    unsetMinimumColumnRange: function() {
	        this._minimumColumnRange = null;
	    },

	    /**
	     * Set min, max value of range(row, column)
	     * @param {Array} rowRange - Row range
	     * @param {Array} columnRange - Column range
	     * @private
	     */
	    _setRangeMinMax: function(rowRange, columnRange) {
	        if (rowRange) {
	            rowRange[0] = Math.max(0, rowRange[0]);
	            rowRange[1] = Math.min(this.dataModel.length - 1, rowRange[1]);
	        }

	        if (columnRange) {
	            columnRange[0] = Math.max(0, columnRange[0]);
	            columnRange[1] = Math.min(this.columnModel.getVisibleColumnModelList().length - 1, columnRange[1]);
	        }
	    },

	    /**
	     * row start index 기준으로 rowspan 을 확인하며 startRangeList 업데이트 하는 함수
	     * @param {object} param - parameters
	     * @private
	     */
	    _concatRowSpanIndexFromStart: function(param) {
	        var startIndex = param.startIndex;
	        var endIndex = param.endIndex;
	        var columnName = param.columnName;
	        var rowSpanData = param.startRowSpanDataMap && param.startRowSpanDataMap[columnName];
	        var startIndexList = param.startIndexList;
	        var endIndexList = param.endIndexList;
	        var spannedIndex;

	        if (!rowSpanData) {
	            return;
	        }

	        if (!rowSpanData.isMainRow) {
	            spannedIndex = startIndex + rowSpanData.count;
	            startIndexList.push(spannedIndex);
	        } else {
	            spannedIndex = startIndex + rowSpanData.count - 1;
	            if (spannedIndex > endIndex) {
	                endIndexList.push(spannedIndex);
	            }
	        }
	    },

	    /**
	     * row end index 기준으로 rowspan 을 확인하며 endRangeList 를 업데이트 하는 함수
	     * @param {object} param - parameters
	     * @private
	     */
	    _concatRowSpanIndexFromEnd: function(param) {
	        var endIndex = param.endIndex;
	        var columnName = param.columnName;
	        var rowSpanData = param.endRowSpanDataMap && param.endRowSpanDataMap[columnName];
	        var endIndexList = param.endIndexList;
	        var dataModel = param.dataModel;
	        var spannedIndex, tmpRowSpanData;

	        if (!rowSpanData) {
	            return;
	        }

	        if (!rowSpanData.isMainRow) {
	            spannedIndex = endIndex + rowSpanData.count;
	            tmpRowSpanData = dataModel.at(spannedIndex).getRowSpanData(columnName);
	            spannedIndex += tmpRowSpanData.count - 1;
	            if (spannedIndex > endIndex) {
	                endIndexList.push(spannedIndex);
	            }
	        } else {
	            spannedIndex = endIndex + rowSpanData.count - 1;
	            endIndexList.push(spannedIndex);
	        }
	    },

	    /**
	     * rowSpan 된 Index range 를 반환한다.
	     * @param {{row: Array, column: Array}} spannedRange 인덱스 정보
	     * @returns {{row: Array, column: Array}} New Range
	     * @private
	     */
	    _getRowSpannedIndex: function(spannedRange) {
	        var columnModelList = this.columnModel.getVisibleColumnModelList()
	            .slice(spannedRange.column[0], spannedRange.column[1] + 1);
	        var dataModel = this.dataModel;
	        var startIndexList = [spannedRange.row[0]];
	        var endIndexList = [spannedRange.row[1]];
	        var startRow = dataModel.at(spannedRange.row[0]);
	        var endRow = dataModel.at(spannedRange.row[1]);
	        var newSpannedRange = $.extend({}, spannedRange);
	        var startRowSpanDataMap, endRowSpanDataMap, columnName, param;

	        if (!startRow || !endRow) {
	            return newSpannedRange;
	        }

	        startRowSpanDataMap = dataModel.at(spannedRange.row[0]).getRowSpanData();
	        endRowSpanDataMap = dataModel.at(spannedRange.row[1]).getRowSpanData();

	        //모든 열을 순회하며 각 열마다 설정된 rowSpan 정보에 따라 인덱스를 업데이트 한다.
	        _.each(columnModelList, function(columnModel) {
	            columnName = columnModel.columnName;
	            param = {
	                columnName: columnName,
	                startIndex: spannedRange.row[0],
	                endIndex: spannedRange.row[1],
	                endRowSpanDataMap: endRowSpanDataMap,
	                startRowSpanDataMap: startRowSpanDataMap,
	                startIndexList: startIndexList,
	                endIndexList: endIndexList,
	                dataModel: dataModel
	            };
	            this._concatRowSpanIndexFromStart(param);
	            this._concatRowSpanIndexFromEnd(param);
	        }, this);

	        newSpannedRange.row = [Math.min.apply(null, startIndexList), Math.max.apply(null, endIndexList)];
	        return newSpannedRange;
	    }
	});

	module.exports = Selection;


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Focus 관련 데이터 처리름 담당한다.
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var Model = __webpack_require__(8);
	var typeConst = __webpack_require__(10).summaryType;

	/**
	 * Summary Model
	 * @module model/summary
	 * @extends module:base/model
	 * @param {Object} attr - attributes
	 * @param {Object} options - options
	 * @ignore
	 */
	var Summary = Model.extend(/**@lends module:model/summary.prototype */{
	    initialize: function(attr, options) {
	        this.dataModel = options.dataModel;

	        /**
	         * An array of columnNames using auto calculation
	         * @type {Array.<string>}
	         */
	        this.autoColumnNames = options.autoColumnNames;

	        /**
	         * Summary value map (KV)
	         * K: column name {string}
	         * V: value map {object}
	         * @type {object}
	         * @example
	         * {
	         *    columnName1: {
	         *        [typeConst.SUM]: 200,
	         *        [typeConst.AVG]: 200,
	         *    },
	         *    columnName2: {
	         *        [typeConst.MAX]: 100
	         *    }
	         * }
	         */
	        this.columnSummaryMap = {};

	        this.listenTo(this.dataModel, 'add remove reset', this._resetSummaryMap);
	        this.listenTo(this.dataModel, 'change', this._onChangeData);
	        this.listenTo(this.dataModel, 'delRange', this._onDeleteRangeData);

	        this._resetSummaryMap();
	    },

	    /**
	     * Calculate summaries of given array.
	     * Values which can not be converted to Number type will be considered as 0.
	     * @param {Array} values - An array of values (to be converted to Number type)
	     * @returns {Object}
	     * @private
	     */
	    _calculate: function(values) {
	        var min = Number.MAX_VALUE;
	        var max = Number.MIN_VALUE;
	        var sum = 0;
	        var count = values.length;
	        var resultMap = {};
	        var i, value;

	        for (i = 0; i < count; i += 1) {
	            value = Number(values[i]);
	            if (isNaN(value)) {
	                value = 0;
	            }

	            sum += value;
	            if (min > value) {
	                min = value;
	            }
	            if (max < value) {
	                max = value;
	            }
	        }

	        resultMap[typeConst.SUM] = sum;
	        resultMap[typeConst.MIN] = min;
	        resultMap[typeConst.MAX] = max;
	        resultMap[typeConst.AVG] = count ? (sum / count) : 0;
	        resultMap[typeConst.CNT] = count;

	        return resultMap;
	    },

	    /**
	     * Initialize summary map of columns specified in 'columnSummries' property.
	     * @private
	     */
	    _resetSummaryMap: function() {
	        this._resetFooterSummaryValue();
	    },

	    /**
	     * Reset summary values of given columnName
	     * @param {Array.<string>} columnNames - An array of column names
	     * @private
	     */
	    _resetFooterSummaryValue: function(columnNames) {
	        var targetColumnNames = this.autoColumnNames;

	        if (columnNames) {
	            targetColumnNames = _.intersection(columnNames, this.autoColumnNames);
	        }
	        _.each(targetColumnNames, function(columnName) {
	            var values = this.dataModel.getColumnValues(columnName);
	            var valueMap = this._calculate(values);

	            this.columnSummaryMap[columnName] = valueMap;
	            this.trigger('change', columnName, valueMap);
	        }, this);
	    },

	    /**
	     * Event handler for 'change' event on dataModel
	     * @param {object} model - row model
	     * @private
	     */
	    _onChangeData: function(model) {
	        this._resetFooterSummaryValue(_.keys(model.changed));
	    },

	    /**
	     * Event handler for 'changeRange' event on dataModel
	     * @param {Array.<number>} rowKeys - An array of rowkeys
	     * @param {Array.<number>} columnNames - An arrya of columnNames
	     * @private
	     */
	    _onDeleteRangeData: function(rowKeys, columnNames) {
	        this._resetFooterSummaryValue(columnNames);
	    },

	    /**
	     * Returns the summary value of given column and type.
	     * If the summaryType is not specified, returns all values of types as an object
	     * @param {string} columnName - column name
	     * @param {string} [summaryType] - summary type
	     * @returns {number|Object}
	     */
	    getValue: function(columnName, summaryType) {
	        var valueMap = this.columnSummaryMap[columnName];
	        var value;

	        if (!summaryType) {
	            return _.isUndefined(valueMap) ? null : valueMap;
	        }

	        value = tui.util.pick(valueMap, summaryType);
	        return _.isUndefined(value) ? null : value;
	    }
	});

	module.exports = Summary;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview View factory
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var ContainerView = __webpack_require__(30);
	var ContentAreaView = __webpack_require__(31);
	var ToolbarView = __webpack_require__(32);
	var PaginationView = __webpack_require__(33);
	var HeightResizeHandleView = __webpack_require__(34);
	var StateLayerView = __webpack_require__(35);
	var ClipboardView = __webpack_require__(36);
	var LsideFrameView = __webpack_require__(37);
	var RsideFrameView = __webpack_require__(39);
	var HeaderView = __webpack_require__(40);
	var HeaderResizeHandlerView = __webpack_require__(41);
	var BodyView = __webpack_require__(42);
	var BodyTableView = __webpack_require__(43);
	var FooterView = __webpack_require__(44);
	var RowListView = __webpack_require__(45);
	var SelectionLayerView = __webpack_require__(46);
	var EditingLayerView = __webpack_require__(47);
	var DatePickeLayerView = __webpack_require__(48);
	var FocusLayerView = __webpack_require__(49);
	var isOptionEnabled = __webpack_require__(9).isOptionEnabled;
	var frameConst = __webpack_require__(10).frame;

	/**
	 * View Factory
	 * @module viewFactory
	 * @ignore
	 */
	var ViewFactory = tui.util.defineClass({
	    init: function(options) {
	        // dependencies
	        this.domState = options.domState;
	        this.modelManager = options.modelManager;
	        this.painterManager = options.painterManager;
	        this.componentHolder = options.componentHolder;

	        // view options
	        this.footerOptions = options.footer;
	        this.singleClickEdit = options.singleClickEdit;
	        this.resizeHandle = options.resizeHandle;
	        this.copyOption = options.copyOption;
	    },

	    /**
	     * Creates container view and returns it.
	     * @param {Object} options - Options set by user
	     * @returns {module:view/container}
	     */
	    createContainer: function() {
	        return new ContainerView({
	            el: this.domState.$el,
	            singleClickEdit: this.singleClickEdit,
	            dataModel: this.modelManager.dataModel,
	            dimensionModel: this.modelManager.dimensionModel,
	            focusModel: this.modelManager.focusModel,
	            gridId: this.modelManager.gridId,
	            viewFactory: this
	        });
	    },

	    /**
	     * Creates a view instance for the contents area.
	     * @returns {module:view/layout/content-area}
	     */
	    createContentArea: function() {
	        return new ContentAreaView({
	            dimensionModel: this.modelManager.dimensionModel,
	            viewFactory: this
	        });
	    },

	    /**
	     * Creates toolbar view and returns it.
	     * @returns {module:view/toolbar} - New toolbar view instance
	     */
	    createToolbar: function() {
	        if (!this.modelManager.toolbarModel.isEnabled()) {
	            return null;
	        }
	        return new ToolbarView({
	            gridId: this.modelManager.gridId,
	            dimensionModel: this.modelManager.dimensionModel,
	            toolbarModel: this.modelManager.toolbarModel
	        });
	    },

	    /**
	     * Creates toolbar pagination view and returns it.
	     * @returns {module:view/pagination} - New pagination view instance
	     */
	    createPagination: function() {
	        if (!isOptionEnabled(this.componentHolder.getOptions('pagination'))) {
	            return null;
	        }
	        return new PaginationView({
	            componentHolder: this.componentHolder,
	            dimensionModel: this.modelManager.dimensionModel
	        });
	    },

	    /**
	     * Creates height resize handle view and returns it.
	     * @returns {module:view/resizeHandle} - New resize hander view instance
	     */
	    createHeightResizeHandle: function() {
	        if (!isOptionEnabled(this.resizeHandle)) {
	            return null;
	        }
	        return new HeightResizeHandleView({
	            dimensionModel: this.modelManager.dimensionModel
	        });
	    },

	    /**
	     * Creates state layer view and returns it.
	     * @returns {module:view/stateLayer} - New state layer view instance
	     */
	    createStateLayer: function() {
	        return new StateLayerView({
	            dimensionModel: this.modelManager.dimensionModel,
	            renderModel: this.modelManager.renderModel
	        });
	    },

	    /**
	     * Creates clipboard view and returns it.
	     * @returns {module:view/clipboard} - New clipboard view instance
	     */
	    createClipboard: function() {
	        return new ClipboardView({
	            columnModel: this.modelManager.columnModel,
	            dataModel: this.modelManager.dataModel,
	            dimensionModel: this.modelManager.dimensionModel,
	            selectionModel: this.modelManager.selectionModel,
	            focusModel: this.modelManager.focusModel,
	            renderModel: this.modelManager.renderModel,
	            coordRowModel: this.modelManager.coordRowModel,
	            coordConverterModel: this.modelManager.coordConverterModel,
	            copyOption: this.copyOption
	        });
	    },

	    /**
	     * Creates frame view and returns it.
	     * @param  {String} whichSide - L(left) or R(right)
	     * @returns {module:view/layout/frame} New frame view instance
	     */
	    createFrame: function(whichSide) {
	        var Constructor = whichSide === frameConst.L ? LsideFrameView : RsideFrameView;

	        return new Constructor({
	            dimensionModel: this.modelManager.dimensionModel,
	            renderModel: this.modelManager.renderModel,
	            viewFactory: this
	        });
	    },

	    /**
	     * Creates header view and returns it.
	     * @param  {String} whichSide - 'L'(left) or 'R'(right)
	     * @returns {module:view/layout/header} New header view instance
	     */
	    createHeader: function(whichSide) {
	        return new HeaderView({
	            whichSide: whichSide,
	            renderModel: this.modelManager.renderModel,
	            dimensionModel: this.modelManager.dimensionModel,
	            focusModel: this.modelManager.focusModel,
	            selectionModel: this.modelManager.selectionModel,
	            dataModel: this.modelManager.dataModel,
	            columnModel: this.modelManager.columnModel,
	            coordRowModel: this.modelManager.coordRowModel,
	            coordColumnModel: this.modelManager.coordColumnModel,
	            viewFactory: this
	        });
	    },

	    /**
	     * Creates footer view and returns it.
	     * @param {string} whichSide - 'L'(left) or 'R'(right)
	     * @returns {object}
	     */
	    createFooter: function(whichSide) {
	        var templateMap = {};

	        if (!this.footerOptions) {
	            return null;
	        }

	        _.each(this.footerOptions.columnContent, function(options, columnName) {
	            if (_.isFunction(options.template)) {
	                templateMap[columnName] = options.template;
	            }
	        });

	        return new FooterView({
	            whichSide: whichSide,
	            columnModel: this.modelManager.columnModel,
	            renderModel: this.modelManager.renderModel,
	            dimensionModel: this.modelManager.dimensionModel,
	            coordColumnModel: this.modelManager.coordColumnModel,
	            summaryModel: this.modelManager.summaryModel,
	            columnTemplateMap: templateMap
	        });
	    },

	    /**
	     * Creates resize handler of header view and returns it.
	     * @param  {String} whichSide - 'L'(left) or 'R'(right)
	     * @returns {module:view/layout/header} New resize handler view instance
	     */
	    createHeaderResizeHandler: function(whichSide) {
	        return new HeaderResizeHandlerView({
	            whichSide: whichSide,
	            dimensionModel: this.modelManager.dimensionModel,
	            columnModel: this.modelManager.columnModel,
	            coordColumnModel: this.modelManager.coordColumnModel
	        });
	    },

	    /**
	     * Creates body view and returns it.
	     * @param  {String} whichSide - 'L'(left) or 'R'(right)
	     * @returns {module:view/layout/body} New body view instance
	     */
	    createBody: function(whichSide) {
	        return new BodyView({
	            whichSide: whichSide,
	            renderModel: this.modelManager.renderModel,
	            dimensionModel: this.modelManager.dimensionModel,
	            coordConverterModel: this.modelManager.coordConverterModel,
	            dataModel: this.modelManager.dataModel,
	            columnModel: this.modelManager.columnModel,
	            selectionModel: this.modelManager.selectionModel,
	            focusModel: this.modelManager.focusModel,
	            viewFactory: this
	        });
	    },

	    /**
	     * Creates body-table view and returns it.
	     * @param  {String} whichSide - 'L'(left) or 'R'(right)
	     * @returns {module:view/layout/bodyTable} New body-table view instance
	     */
	    createBodyTable: function(whichSide) {
	        return new BodyTableView({
	            whichSide: whichSide,
	            dimensionModel: this.modelManager.dimensionModel,
	            coordColumnModel: this.modelManager.coordColumnModel,
	            renderModel: this.modelManager.renderModel,
	            columnModel: this.modelManager.columnModel,
	            painterManager: this.painterManager,
	            viewFactory: this
	        });
	    },

	    /**
	     * Creates row list view and returns it.
	     * @param  {Object} options - Options
	     * @param  {jQuery} options.el - jquery object wrapping tbody html element
	     * @param  {String} options.whichSide - 'L'(left) or 'R'(right)
	     * @param  {module:view/layout/bodyTable} options.bodyTableView - body table view
	     * @returns {module:view/rowList} New row list view instance
	     */
	    createRowList: function(options) {
	        return new RowListView({
	            el: options.el,
	            whichSide: options.whichSide,
	            bodyTableView: options.bodyTableView,
	            dataModel: this.modelManager.dataModel,
	            columnModel: this.modelManager.columnModel,
	            dimensionModel: this.modelManager.dimensionModel,
	            selectionModel: this.modelManager.selectionModel,
	            renderModel: this.modelManager.renderModel,
	            focusModel: this.modelManager.focusModel,
	            coordRowModel: this.modelManager.coordRowModel,
	            painterManager: this.painterManager
	        });
	    },

	    /**
	     * Creates selection view and returns it.
	     * @param  {String} whichSide - 'L'(left) or 'R'(right)
	     * @returns {module:view/selectionLayer} New selection layer view instance
	     */
	    createSelectionLayer: function(whichSide) {
	        return new SelectionLayerView({
	            whichSide: whichSide,
	            selectionModel: this.modelManager.selectionModel,
	            dimensionModel: this.modelManager.dimensionModel,
	            columnModel: this.modelManager.columnModel,
	            coordRowModel: this.modelManager.coordRowModel,
	            coordColumnModel: this.modelManager.coordColumnModel
	        });
	    },

	    /**
	     * Creates editing layer view and returns it.
	     * @returns {module:view/editingLayer}
	     */
	    createEditingLayer: function() {
	        return new EditingLayerView({
	            renderModel: this.modelManager.renderModel,
	            inputPainters: this.painterManager.getInputPainters(true),
	            domState: this.domState
	        });
	    },

	    /**
	     * Creates an instance of date-picker layer view.
	     * @returns {module:view/datePickerLayer}
	     */
	    createDatePickerLayer: function() {
	        if (!tui.component ||
	            !tui.component.DatePicker ||
	            !tui.component.Calendar) {
	            return null;
	        }

	        return new DatePickeLayerView({
	            columnModel: this.modelManager.columnModel,
	            textPainter: this.painterManager.getInputPainters().text,
	            domState: this.domState
	        });
	    },

	    /**
	     * Creates focus layer view and returns it.
	     * @param  {String} whichSide - 'L'(left) or 'R'(right)
	     * @returns {module:view/focusLayer} New focus layer view instance
	     */
	    createFocusLayer: function(whichSide) {
	        return new FocusLayerView({
	            whichSide: whichSide,
	            dimensionModel: this.modelManager.dimensionModel,
	            columnModel: this.modelManager.columnModel,
	            focusModel: this.modelManager.focusModel,
	            coordRowModel: this.modelManager.coordRowModel,
	            coordColumnModel: this.modelManager.coordColumnModel,
	            coordConverterModel: this.modelManager.coordConverterModel
	        });
	    }
	});

	module.exports = ViewFactory;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview View class that conaints a top element of the DOM structure of the grid.
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var View = __webpack_require__(2);
	var GridEvent = __webpack_require__(22);
	var attrNameConst = __webpack_require__(10).attrName;
	var classNameConst = __webpack_require__(15);

	/**
	 * Container View
	 * @module view/container
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	var Container = View.extend(/**@lends module:view/container.prototype */{
	    initialize: function(options) {
	        View.prototype.initialize.call(this);

	        this.gridId = options.gridId;
	        this.singleClickEdit = options.singleClickEdit;
	        this.dimensionModel = options.dimensionModel;
	        this.focusModel = options.focusModel;
	        this.dataModel = options.dataModel;
	        this.viewFactory = options.viewFactory;

	        this._createChildViews();

	        this.listenTo(this.dimensionModel, 'setWidth', this._onSetWidth);
	        $(window).on('resize.grid', $.proxy(this._onResizeWindow, this));

	        this.__$el = this.$el.clone();
	    },

	    events: {
	        'click': '_onClick',
	        'dblclick': '_onDblClick',
	        'mousedown': '_onMouseDown',
	        'mouseover': '_onMouseOver',
	        'mouseout': '_onMouseOut',

	        // for preventing drag
	        'selectstart': '_preventDrag',
	        'dragstart': '_preventDrag'
	    },

	    /**
	     * 내부에서 사용할 view 인스턴스들을 초기화한다.
	     * @private
	     */
	    _createChildViews: function() {
	        var factory = this.viewFactory;

	        this._addChildren([
	            factory.createToolbar(),
	            factory.createContentArea(),
	            factory.createHeightResizeHandle(),
	            factory.createPagination(),
	            factory.createStateLayer(),
	            factory.createEditingLayer(),
	            factory.createDatePickerLayer(),
	            factory.createClipboard()
	        ]);
	    },

	    /**
	     * Event handler for resize event on window.
	     * @private
	     */
	    _onResizeWindow: function() {
	        this.dimensionModel.refreshLayout();
	    },

	    /**
	     * drag 이벤트 발생시 이벤트 핸들러
	     * @returns {boolean} false
	     * @private
	     */
	    _preventDrag: function() {
	        return false;
	    },

	    /**
	     * Event handler for 'setSize' event on Dimension
	     * @private
	     */
	    _onSetWidth: function() {
	        this.$el.width(this.dimensionModel.get('width'));
	    },

	    /**
	     * click 이벤트 핸들러
	     * @param {MouseEvent} mouseEvent 이벤트 객체
	     * @private
	     */
	    _onClick: function(mouseEvent) {
	        var eventData = new GridEvent(mouseEvent);
	        var $target = $(mouseEvent.target);
	        var cellInfo;

	        /**
	         * Occurs when a mouse button is clicked on the Grid.
	         * The properties of the event object is the same as the native MouseEvent.
	         * @api
	         * @event tui.Grid#click
	         * @type {module:common/gridEvent}
	         */
	        this.trigger('click', eventData);
	        if (eventData.isStopped()) {
	            return;
	        }
	        if (this._isCellElement($target, true)) {
	            cellInfo = this._getCellInfoFromElement($target.closest('td'));
	            if (!_.isNull(cellInfo.rowKey) && this.singleClickEdit && !$target.is('input, textarea')) {
	                this.focusModel.focusIn(cellInfo.rowKey, cellInfo.columnName);
	            }

	            /**
	             * Occurs when a mouse button is clicked on a table cell
	             * The event object has all properties copied from the native MouseEvent.
	             * @api
	             * @event tui.Grid#clickCell
	             * @type {module:common/gridEvent}
	             * @property {number} rowKey - rowKey of the target cell
	             * @property {string} columnName - columnName of the target cell
	             * @property {Object} rowData - row data
	             */
	            this._triggerCellMouseEvent('clickCell', eventData, cellInfo);
	        }
	    },

	    /**
	     * doubleClick 이벤트 핸들러
	     * @param {MouseEvent} mouseEvent 이벤트 객체
	     * @private
	     */
	    _onDblClick: function(mouseEvent) {
	        var eventData = new GridEvent(mouseEvent);
	        var $target = $(mouseEvent.target);

	        /**
	         * Occurs when a mouse button is double clicked on the Grid.
	         * The event object has all properties copied from the native MouseEvent.
	         * @api
	         * @event tui.Grid#dblclick
	         * @type {module:common/gridEvent}
	         */
	        this.trigger('dblclick', eventData);
	        if (eventData.isStopped()) {
	            return;
	        }
	        if (this._isCellElement($target, true)) {
	            /**
	             * Occurs when a mouse button is double clicked on a table cell
	             * The event object has all properties copied from the native MouseEvent.
	             * @api
	             * @event tui.Grid#dblclickCell
	             * @type {module:common/gridEvent}
	             * @property {number} rowKey - rowKey of the target cell
	             * @property {string} columnName - columnName of the target cell
	             * @property {Object} rowData - row data containing the target cell
	             */
	            this._triggerCellMouseEvent('dblclickCell', eventData, $target.closest('td'));
	            if (eventData.rowKey === null && !eventData.isStopped()) {
	                this.dataModel.append({}, {focus: true});
	            }
	        }
	    },

	    /**
	     * mouseover 이벤트 발생시 실행될 핸들러
	     * @private
	     * @param {MouseEvent} mouseEvent 마우스 이벤트 객체
	     */
	    _onMouseOver: function(mouseEvent) {
	        var $target = $(mouseEvent.target),
	            eventData;

	        if (this._isCellElement($target)) {
	            eventData = new GridEvent(mouseEvent);
	            /**
	             * Occurs when a mouse pointer is moved onto a table cell
	             * The event object has all properties copied from the native MouseEvent.
	             * @api
	             * @event tui.Grid#mouseoverCell
	             * @type {module:common/gridEvent}
	             * @property {number} rowKey - rowKey of the target cell
	             * @property {string} columnName - columnName of the target cell
	             * @property {Object} rowData - row data containing the target cell
	             */
	            this._triggerCellMouseEvent('mouseoverCell', eventData, $target);
	        }
	    },

	    /**
	     * mouseout 이벤트 발생시 실행될 핸들러
	     * @private
	     * @param {MouseEvent} mouseEvent 마우스 이벤트 객체
	     */
	    _onMouseOut: function(mouseEvent) {
	        var $target = $(mouseEvent.target);
	        var eventData;

	        if (this._isCellElement($target)) {
	            eventData = new GridEvent(mouseEvent);
	            /**
	             * Occurs when a mouse pointer is moved off from a table cell
	             * The event object has all properties copied from the native MouseEvent.
	             * @api
	             * @event tui.Grid#mouseoutCell
	             * @type {module:common/gridEvent}
	             * @property {number} rowKey - rowKey of the target cell
	             * @property {string} columnName - columnName of the target cell
	             * @property {Object} rowData - row data containing the target cell
	             */
	            this._triggerCellMouseEvent('mouseoutCell', eventData, $target);
	        }
	    },

	    /**
	     * 셀과 관련된 커스텀 마우스 이벤트를 발생시킨다.
	     * @private
	     * @param {string} eventName 이벤트명
	     * @param {MouseEvent} eventData 커스터마이징 된 마우스 이벤트 객체
	     * @param {(jQuery|object)} cell 이벤트가 발생한 cell (jquery 객체이거나 rowKey, columnName, rowData를 갖는 plain 객체)
	     */
	    _triggerCellMouseEvent: function(eventName, eventData, cell) {
	        var cellInfo = cell;

	        if (cell instanceof $) {
	            cellInfo = this._getCellInfoFromElement(cell);
	        }
	        _.extend(eventData, cellInfo);
	        this.trigger(eventName, eventData);
	    },

	    /**
	     * 해당 HTML요소가 셀인지 여부를 반환한다.
	     * @private
	     * @param {jQuery} $target 검사할 HTML요소의 jQuery 객체
	     * @param {boolean} isIncludeChild true이면 셀의 자식요소까지 포함한다.
	     * @returns {boolean} 셀이면 true, 아니면 false
	     */
	    _isCellElement: function($target, isIncludeChild) {
	        var $cell = isIncludeChild ? $target.closest('td') : $target;

	        return !!($cell.is('td') && $cell.attr(attrNameConst.COLUMN_NAME));
	    },

	    /**
	     * HTML요소에서 셀의 rowKey와 columnName값을 찾아서 rowData와 함께 객체로 반환한다.
	     * @private
	     * @param {jQuery} $cell TD요소의 jquery 객체
	     * @returns {{rowKey: string, rowData: Data.Row, columnName: string}} 셀 관련 정보를 담은 객체
	     */
	    _getCellInfoFromElement: function($cell) {
	        var rowKey = Number($cell.attr(attrNameConst.ROW_KEY));
	        var columnName = $cell.attr(attrNameConst.COLUMN_NAME);

	        if (isNaN(rowKey)) {
	            rowKey = null;
	        }
	        return {
	            rowKey: rowKey,
	            columnName: columnName,
	            rowData: this.dataModel.getRowData(rowKey)
	        };
	    },

	    /**
	     * mousedown 이벤트 핸들러
	     * @param {event} mouseEvent 이벤트 객체
	     * @private
	     */
	    _onMouseDown: function(mouseEvent) {
	        var $target = $(mouseEvent.target);
	        var eventData = new GridEvent(mouseEvent);

	        /**
	         * Occurs when a mouse button is pressed on the Grid.
	         * The properties of the event object is the same as the native MouseEvent.
	         * @api
	         * @event tui.Grid#mousedown
	         * @type {module:common/gridEvent}
	         */
	        this.trigger('mousedown', eventData);
	        if (eventData.isStopped()) {
	            return;
	        }
	        if (!$target.is('input, a, button, select, textarea')) {
	            mouseEvent.preventDefault();
	            this.focusModel.focusClipboard();
	        }
	    },

	    /**
	     * Render
	     * @returns {module:view/container} this object
	     */
	    render: function() {
	        var childElements = this._renderChildren();

	        this.$el.addClass(classNameConst.CONTAINER)
	            .attr(attrNameConst.GRID_ID, this.gridId)
	            .append(childElements);

	        this._triggerChildrenAppended();
	        this.trigger('rendered');

	        return this;
	    },

	    /**
	     * 소멸자
	     */
	    destroy: function() {
	        this.stopListening();
	        $(window).off('resize.grid');
	        this._destroyChildren();

	        this.$el.replaceWith(this.__$el);
	        this.$el = this.__$el = null;
	    }
	});

	module.exports = Container;


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Class for the content area
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var View = __webpack_require__(2);
	var classNameConst = __webpack_require__(15);
	var frameConst = __webpack_require__(10).frame;
	var ContentArea;

	/**
	 * Create DIV element to draw border
	 * @param {String} className - border class name
	 * @returns {jQuery}
	 * @ignore
	 */
	function borderDIV(className) {
	    return $('<div>')
	        .addClass(classNameConst.BORDER_LINE)
	        .addClass(className);
	}

	/**
	 * Content area
	 * @module view/layout/content-area
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	ContentArea = View.extend(/**@lends module:view/layout/content-area.prototype */{
	    initialize: function(options) {
	        View.prototype.initialize.call(this);

	        this.viewFactory = options.viewFactory;
	        this.dimensionModel = options.dimensionModel;
	        this._addFrameViews();
	    },

	    className: classNameConst.CONTENT_AREA,

	    /**
	     * Creates Frame views and add them as children.
	     * @private
	     */
	    _addFrameViews: function() {
	        var factory = this.viewFactory;

	        this._addChildren([
	            factory.createFrame(frameConst.L),
	            factory.createFrame(frameConst.R)
	        ]);
	    },

	    /**
	     * Renders
	     * @returns {Object} this object
	     */
	    render: function() {
	        var dimensionModel = this.dimensionModel;
	        var scrollXHeight = dimensionModel.getScrollXHeight();
	        var footerHeight = dimensionModel.get('footerHeight');
	        var childElements = this._renderChildren().concat([
	            borderDIV(classNameConst.BORDER_TOP),
	            borderDIV(classNameConst.BORDER_LEFT),
	            borderDIV(classNameConst.BORDER_RIGHT),
	            borderDIV(classNameConst.BORDER_BOTTOM).css('bottom', scrollXHeight + footerHeight)
	        ]);

	        if (!dimensionModel.get('scrollX')) {
	            this.$el.addClass(classNameConst.NO_SCROLL_X);
	        }
	        if (!dimensionModel.get('scrollY')) {
	            this.$el.addClass(classNameConst.NO_SCROLL_Y);
	        }

	        this.$el.append(childElements);

	        return this;
	    }
	});

	module.exports = ContentArea;


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Toolbar View
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var View = __webpack_require__(2);
	var classNameConst = __webpack_require__(15);

	/**
	 * Toolbar View
	 * @module view/toolbar
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	var Toolbar = View.extend(/**@lends module:view/toolbar.prototype */{
	    initialize: function(options) {
	        this.setOwnProperties({
	            gridId: options.gridId,
	            toolbarModel: options.toolbarModel,
	            dimensionModel: options.dimensionModel
	        });

	        this.on('appended', this._onAppended);
	        this.listenTo(this.toolbarModel,
	            'change:isExcelButtonVisible change:isExcelAllButtonVisible', this.render);
	    },

	    className: classNameConst.TOOLBAR,

	    events: function() {
	        var hash = {};
	        hash['click .' + classNameConst.BTN_EXCEL] = '_onClickExcel';
	        return hash;
	    },

	    templateExcelBtn: _.template(
	        '<a href="#" class="' + classNameConst.BTN_EXCEL + ' ' + classNameConst.BTN_TEXT + ' <%=className%>">' +
	        '<span><em class="' + classNameConst.BTN_EXCEL_ICON + '"></em><%=text%></span>' +
	        '</a>'
	    ),

	    /**
	     * Event handler for 'appended' event
	     * @private
	     */
	    _onAppended: function() {
	        this.dimensionModel.set('toolbarHeight', this.$el.outerHeight());
	    },

	    /**
	     * Click event handler for excel download buttons
	     * @param  {MouseEvent} mouseEvent - MouseEvent object
	     * @private
	     */
	    _onClickExcel: function(mouseEvent) {
	        var grid = tui.Grid.getInstanceById(this.gridId);
	        var net = grid.getAddOn('Net');
	        var $target;

	        mouseEvent.preventDefault();

	        if (net) {
	            $target = $(mouseEvent.target).closest('a');

	            if ($target.hasClass(classNameConst.BTN_EXCEL_PAGE)) {
	                net.download('excel');
	            } else if ($target.hasClass(classNameConst.BTN_EXCEL_ALL)) {
	                net.download('excelAll');
	            }
	        }
	    },

	    /**
	     * Render
	     * @returns {module:view/toolbar} this object
	     */
	    render: function() {
	        var toolbarModel = this.toolbarModel;
	        var $inner = $('<div>');

	        if (toolbarModel.get('isExcelButtonVisible')) {
	            $inner.append(this.templateExcelBtn({
	                className: classNameConst.BTN_EXCEL_PAGE,
	                text: '엑셀 다운로드'
	            }));
	        }
	        if (toolbarModel.get('isExcelAllButtonVisible')) {
	            $inner.append(this.templateExcelBtn({
	                className: classNameConst.BTN_EXCEL_ALL,
	                text: '전체 엑셀 다운로드'
	            }));
	        }
	        this.$el.empty().append($inner);

	        return this;
	    }
	});

	module.exports = Toolbar;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Class for the pagination in the toolbar
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var View = __webpack_require__(2);
	var classNameConst = __webpack_require__(15);

	var HTML_BTNS =
	    '<a href="#" class="' + classNameConst.PAGINATION_PRE_END + '" title="First page">First</a>' +
	    '<a href="#" class="' + classNameConst.PAGINATION_PRE + '" title="Previous page">Prev</a> ' +
	    '<a href="#" class="' + classNameConst.PAGINATION_NEXT + '" title="Next page">Next</a>' +
	    '<a href="#" class="' + classNameConst.PAGINATION_NEXT_END + '" title="Last page">Last</a>' +
	    '<span class="' + classNameConst.PAGINATION_PRE_END_OFF + '">First Off</span>' +
	    '<span class="' + classNameConst.PAGINATION_PRE_OFF + '">Prev Off</span>' +
	    '<span class="' + classNameConst.PAGINATION_NEXT_OFF + '">Next Off</span>' +
	    '<span class="' + classNameConst.PAGINATION_NEXT_END_OFF + '">Last Off</span>';

	var defaultOptions = {
	    classPrefix: classNameConst.PREFIX,
	    itemCount: 1,
	    pagePerPageList: 5,
	    itemPerPage: 10,
	    isCenterAlign: true,
	    moveUnit: 'page'
	};

	/**
	 * Class for the pagination in the toolbar
	 * @module view/pagination
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	var Pagination = View.extend(/**@lends module:view/pagination.prototype */{
	    initialize: function(options) {
	        this.dimensionModel = options.dimensionModel;
	        this.componentHolder = options.componentHolder;
	        this.on('appended', this._onAppended);
	    },

	    className: classNameConst.PAGINATION,

	    /**
	     * Render
	     * @returns {Object} this object
	     */
	    render: function() {
	        this._destroyChildren();
	        this.$el.empty().html(HTML_BTNS);

	        this.componentHolder.setInstance('pagination', this._createComponent());
	        return this;
	    },

	    /**
	     * Event handler for 'appended' event
	     * @private
	     */
	    _onAppended: function() {
	        this.dimensionModel.set('paginationHeight', this.$el.outerHeight());
	    },

	    /**
	     * Create an option object for creating a tui.component.Pagination component.
	     * @returns {Object}
	     */
	    _createOptionObject: function() {
	        var customOptions = this.componentHolder.getOptions('pagination');
	        var btnOptions = {
	            $preOff: this.$el.find('.' + classNameConst.PAGINATION_PRE_OFF),
	            $pre_endOff: this.$el.find('.' + classNameConst.PAGINATION_PRE_END_OFF), // eslint-disable-line
	            $nextOff: this.$el.find('.' + classNameConst.PAGINATION_NEXT_OFF),
	            $lastOff: this.$el.find('.' + classNameConst.PAGINATION_NEXT_END_OFF)
	        };

	        if (customOptions === true) {
	            customOptions = {};
	        }

	        return _.assign({}, defaultOptions, btnOptions, customOptions);
	    },

	    /**
	     * Create new tui.component.Pagination instance
	     * @returns {tui.component.Pagination}
	     * @private
	     */
	    _createComponent: function() {
	        var ComponentClass = tui.util.pick(tui, 'component', 'Pagination');

	        if (!ComponentClass) {
	            throw new Error('Cannot find component \'tui.component.Pagination\'');
	        }
	        return new ComponentClass(this._createOptionObject(), this.$el);
	    }
	});

	module.exports = Pagination;


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Class for the height resize handle
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var View = __webpack_require__(2);
	var classNameConst = __webpack_require__(15);
	var HTML_INNER = '<a href="#"><span></span></a>';

	/**
	 * Class for the height resize handle
	 * @module view/layout/heightResizeHandle
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	var HeightResizeHandle = View.extend(/**@lends module:view/layout/heightResizeHandle.prototype */{
	    initialize: function(options) {
	        this.dimensionModel = options.dimensionModel;
	        this.timeoutIdForResize = 0;

	        /**
	         * Relative Y-position of the mouse pointer in the element when starting dragging
	         * @type {Number}
	         */
	        this.mouseOffsetY = 0;

	        this.on('appended', this._onAppended);
	    },

	    className: classNameConst.HEIGHT_RESIZE_HANDLE,

	    events: {
	        'mousedown': '_onMouseDown'
	    },

	    /**
	     * Event handler for 'appended' event
	     * @private
	     */
	    _onAppended: function() {
	        this.dimensionModel.set('resizeHandleHeight', this.$el.outerHeight());
	    },

	    /**
	     * Attach event handlers to start 'drag' action
	     * @private
	     */
	    _attachMouseEvent: function() {
	        $(document).on('mousemove', $.proxy(this._onMouseMove, this));
	        $(document).on('mouseup', $.proxy(this._onMouseUp, this));
	        $(document).on('selectstart', $.proxy(this._onSelectStart, this));
	    },

	    /**
	     * Detach event handler to cancel 'drag' action
	     * @private
	     */

	    _detachMouseEvent: function() {
	        $(document).off('mousemove', $.proxy(this._onMouseMove, this));
	        $(document).off('mouseup', $.proxy(this._onMouseUp, this));
	        $(document).off('selectstart', $.proxy(this._onSelectStart, this));
	    },

	    /**
	     * Event handler for 'mousedown' event
	     * @param {MouseEvent} mouseEvent - MouseEvent object
	     * @private
	     */
	    _onMouseDown: function(mouseEvent) {
	        mouseEvent.preventDefault();
	        $(document.body).css('cursor', 'row-resize');
	        this.mouseOffsetY = mouseEvent.offsetY;
	        this._attachMouseEvent();
	    },

	    /**
	     * Event handler for 'mousemove' event
	     * @param {MouseEvent} mouseEvent - MouseEvent object
	     * @private
	     */
	    _onMouseMove: function(mouseEvent) {
	        var dimensionModel = this.dimensionModel;
	        var gridOffsetY = dimensionModel.get('offsetTop');
	        var mouseOffsetY = this.mouseOffsetY;

	        clearTimeout(this.timeoutIdForResize);

	        this.timeoutIdForResize = setTimeout(function() {
	            dimensionModel.setSize(null, mouseEvent.pageY - gridOffsetY - mouseOffsetY);
	        }, 0);
	    },

	    /**
	     * Event handler for 'mouseup' event
	     * @private
	     */
	    _onMouseUp: function() {
	        $(document.body).css('cursor', 'default');
	        this._detachMouseEvent();
	    },

	    /**
	     * Event handler for 'selectstart' event
	     * @param {Event} event - Event object
	     * @returns {boolean}
	     * @private
	     */
	    _onSelectStart: function(event) {
	        event.preventDefault();
	        return false;
	    },

	    /**
	     * Render
	     * @returns {Object} this object
	     */
	    render: function() {
	        this._destroyChildren();
	        this.$el.html(HTML_INNER);

	        return this;
	    },

	    /**
	     * Destroy
	     */
	    destroy: function() {
	        this.stopListening();
	        this._onMouseUp();
	        this._destroyChildren();
	        this.remove();
	    }
	});

	module.exports = HeightResizeHandle;


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Layer class that represents the state of rendering phase
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var View = __webpack_require__(2);
	var stateConst = __webpack_require__(10).renderState;
	var classNameConst = __webpack_require__(15);
	var TABLE_BORDER_WIDTH = __webpack_require__(10).dimension.TABLE_BORDER_WIDTH;

	var MESSAGE_LOADING = '요청을 처리 중입니다.';
	var MESSAGE_EMPTY = '데이터가 존재하지 않습니다.';

	/**
	 * Layer class that represents the state of rendering phase.
	 * @module view/stateLayer
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	var StateLayer = View.extend(/**@lends module:view/stateLayer.prototype */{
	    initialize: function(options) {
	        this.dimensionModel = options.dimensionModel;
	        this.renderModel = options.renderModel;

	        this.listenTo(this.dimensionModel, 'change', this._refreshLayout);
	        this.listenTo(this.renderModel, 'change:state', this.render);
	    },

	    className: classNameConst.LAYER_STATE,

	    template: _.template(
	        '<div class="' + classNameConst.LAYER_STATE_CONTENT + '">' +
	        '    <p><%= text %></p>' +
	        '    <% if (isLoading) { %>' +
	        '    <div class="' + classNameConst.LAYER_STATE_LOADING + '"></div>' +
	        '    <% } %>' +
	        '</div>'
	    ),

	    /**
	     * Render
	     * @returns {object} This object
	     */
	    render: function() {
	        var renderState = this.renderModel.get('state');

	        if (renderState === stateConst.DONE) {
	            this.$el.hide();
	        } else {
	            this._showLayer(renderState);
	        }

	        return this;
	    },

	    /**
	     * Shows the state layer.
	     * @param {string} renderState - Render state {@link module:common/constMap#renderState}
	     * @private
	     */
	    _showLayer: function(renderState) {
	        var layerHtml = this.template({
	            text: this._getMessage(renderState),
	            isLoading: (renderState === stateConst.LOADING)
	        });

	        this.$el.html(layerHtml).show();
	        this._refreshLayout();
	    },

	    /**
	     * Returns the message based on the renderState value
	     * @param  {string} renderState - Renderer.state value
	     * @returns {string} - Message
	     */
	    _getMessage: function(renderState) {
	        switch (renderState) {
	            case stateConst.LOADING:
	                return MESSAGE_LOADING;
	            case stateConst.EMPTY:
	                return (this.renderModel.get('emptyMessage') || MESSAGE_EMPTY);
	            default:
	                return null;
	        }
	    },

	    /**
	     * Sets the marginTop and height value.
	     * @private
	     */
	    _refreshLayout: function() {
	        var dimensionModel = this.dimensionModel;
	        var headerHeight = dimensionModel.get('headerHeight');
	        var bodyHeight = dimensionModel.get('bodyHeight');
	        var toolbarHeight = dimensionModel.get('toolbarHeight');
	        var scrollXHeight = dimensionModel.getScrollXHeight();
	        var scrollYWidth = dimensionModel.getScrollYWidth();

	        this.$el.css({
	            top: headerHeight + toolbarHeight - TABLE_BORDER_WIDTH,
	            height: bodyHeight - scrollXHeight - TABLE_BORDER_WIDTH,
	            left: 0,
	            right: scrollYWidth
	        });
	    }
	});

	StateLayer.MESSAGE_LOADING = MESSAGE_LOADING;
	StateLayer.MESSAGE_EMPTY = MESSAGE_EMPTY;

	module.exports = StateLayer;


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview 키 이벤트 핸들링 담당하는 Clipboard 정의
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var View = __webpack_require__(2);
	var util = __webpack_require__(9);
	var classNameConst = __webpack_require__(15);
	var constMap = __webpack_require__(10);
	var keyCodeMap = constMap.keyCode;
	var selTypeConst = constMap.selectionType;

	/**
	 * Clipboard view class
	 * @module view/clipboard
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	var Clipboard = View.extend(/**@lends module:view/clipboard.prototype */{
	    initialize: function(options) {
	        this.setOwnProperties({
	            dataModel: options.dataModel,
	            columnModel: options.columnModel,
	            focusModel: options.focusModel,
	            selectionModel: options.selectionModel,
	            dimensionModel: options.dimensionModel,
	            coordRowModel: options.coordRowModel,
	            coordConverterModel: options.coordConverterModel,
	            renderModel: options.renderModel,
	            useFormattedValue: !!tui.util.pick(options, 'copyOption', 'useFormattedValue'),
	            timeoutIdForKeyIn: 0,
	            isLocked: false
	        });

	        this.listenTo(this.focusModel, 'focusClipboard', this._onFocus);
	    },

	    tagName: 'textarea',

	    className: classNameConst.CLIPBOARD,

	    events: {
	        'keydown': '_onKeyDown',
	        'blur': '_onBlur'
	    },

	    /**
	     * Event handler for blur event.
	     * @private
	     */
	    _onBlur: function() {
	        var focusModel = this.focusModel;

	        setTimeout(function() {
	            focusModel.refreshState();
	        }, 0);
	    },

	    /**
	     * Event handler for 'focusClipboard' event on focusModel
	     * @private
	     */
	    _onFocus: function() {
	        try {
	            if (!this.$el.is(':focus')) {
	                this.$el.focus();
	                this.focusModel.refreshState();
	            }
	        } catch (e) {
	            // Do nothing.
	            // This try/catch block is just for preventing 'Unspecified error'
	            // in IE9(and under) when running test using karma.
	        }
	    },

	    /**
	     * 랜더링 한다.
	     * @returns {View.Clipboard} this object
	     */
	    render: function() {
	        return this;
	    },

	    /**
	     * keyEvent 의 중복 호출을 방지하는 lock 을 설정한다.
	     * @private
	     */
	    _lock: function() {
	        clearTimeout(this.timeoutIdForKeyIn);
	        this.isLocked = true;
	        this.timeoutIdForKeyIn = setTimeout($.proxy(this._unlock, this), 10); // eslint-disable-line no-magic-numbers
	    },

	    /**
	     * keyEvent 의 중복 호출을 방지하는 lock 을 해제한다.
	     * @private
	     */
	    _unlock: function() {
	        this.isLocked = false;
	    },

	    /**
	     * keyDown 이벤트 핸들러
	     * @param {Event} keyDownEvent 이벤트 객체
	     * @private
	     */
	    _onKeyDown: function(keyDownEvent) { // eslint-disable-line complexity
	        if (this.isLocked) {
	            keyDownEvent.preventDefault();
	            return;
	        }

	        if (keyDownEvent.shiftKey && (keyDownEvent.ctrlKey || keyDownEvent.metaKey)) {
	            this._keyInWithShiftAndCtrl(keyDownEvent);
	        } else if (keyDownEvent.shiftKey) {
	            this._keyInWithShift(keyDownEvent);
	        } else if (keyDownEvent.ctrlKey || keyDownEvent.metaKey) {
	            this._keyInWithCtrl(keyDownEvent);
	        } else {
	            this._keyIn(keyDownEvent);
	        }
	        this._lock();
	    },

	    /**
	     * ctrl, shift 둘다 눌리지 않은 상태에서의 key down 이벤트 핸들러
	     * @param {Event} keyDownEvent 이벤트 객체
	     * @private
	     */
	    _keyIn: function(keyDownEvent) { // eslint-disable-line complexity
	        var focusModel = this.focusModel;
	        var selectionModel = this.selectionModel;
	        var focused = focusModel.which();
	        var rowKey = focused.rowKey;
	        var columnName = focused.columnName;
	        var rowIdx = this.dataModel.indexOfRowKey(rowKey);
	        var columnIdx = this.columnModel.indexOfColumnName(columnName, true);
	        var isKeyIdentified = true;
	        var keyCode = keyDownEvent.keyCode || keyDownEvent.which;
	        var address;

	        if (util.isBlank(focused.rowKey)) {
	            return;
	        }

	        switch (keyCode) {
	            case keyCodeMap.UP_ARROW:
	                focusModel.focus(focusModel.prevRowKey(), columnName, true);
	                break;
	            case keyCodeMap.DOWN_ARROW:
	                focusModel.focus(focusModel.nextRowKey(), columnName, true);
	                break;
	            case keyCodeMap.LEFT_ARROW:
	                focusModel.focus(rowKey, focusModel.prevColumnName(), true);
	                break;
	            case keyCodeMap.RIGHT_ARROW:
	                focusModel.focus(rowKey, focusModel.nextColumnName(), true);
	                break;
	            case keyCodeMap.PAGE_UP:
	                focusModel.focusAt(this._getPageMovedRowIndex(rowIdx, false), columnIdx, true);
	                break;
	            case keyCodeMap.PAGE_DOWN:
	                focusModel.focusAt(this._getPageMovedRowIndex(rowIdx, true), columnIdx, true);
	                break;
	            case keyCodeMap.HOME:
	                focusModel.focus(rowKey, focusModel.firstColumnName(), true);
	                break;
	            case keyCodeMap.END:
	                focusModel.focus(rowKey, focusModel.lastColumnName(), true);
	                break;
	            //space 와 enter 는 동일동작
	            case keyCodeMap.SPACE:
	            case keyCodeMap.ENTER:
	                this._onEnterSpace(rowKey, columnName);
	                break;
	            case keyCodeMap.DEL:
	                this._del(rowKey, columnName);
	                break;
	            case keyCodeMap.TAB:
	                address = focusModel.nextAddress();
	                focusModel.focusIn(address.rowKey, address.columnName, true);
	                break;
	            default:
	                isKeyIdentified = false;
	                break;
	        }
	        if (isKeyIdentified) {
	            keyDownEvent.preventDefault();
	        }
	        selectionModel.end();
	    },

	    /**
	     * enter 또는 space 가 입력되었을 때, 처리하는 로직
	     * @param {(number|string)} rowKey 키 입력이 발생한 엘리먼트의 rowKey
	     * @param {string} columnName 키 입력이 발생한 엘리먼트의 컬럼명
	     * @private
	     */
	    _onEnterSpace: function(rowKey, columnName) {
	        this.focusModel.focusIn(rowKey, columnName);
	    },

	    /**
	     * Return index for reference of selection before moving by key event.
	     * @returns {{row: number, column:number}} index
	     * @private
	     */
	    _getIndexBeforeMove: function() {
	        var focusedIndex = this.focusModel.indexOf();
	        var selectionRange = this.selectionModel.get('range');
	        var index = _.extend({}, focusedIndex);
	        var selectionRowRange, selectionColumnRange;

	        if (selectionRange) {
	            selectionRowRange = selectionRange.row;
	            selectionColumnRange = selectionRange.column;

	            index.row = selectionRowRange[0];
	            index.column = selectionColumnRange[0];

	            if (selectionRowRange[1] > focusedIndex.row) {
	                index.row = selectionRowRange[1];
	            }
	            if (selectionColumnRange[1] > focusedIndex.column) {
	                index.column = selectionColumnRange[1];
	            }
	        }
	        return index;
	    },

	    /**
	     * Returns the row index moved by body height from given row.
	     * @param {number} rowIdx - current row index
	     * @param {Boolean} isDownDir - true: down, false: up
	     * @returns {number}
	     * @private
	     */
	    _getPageMovedRowIndex: function(rowIdx, isDownDir) {
	        var curOffset = this.coordRowModel.getOffsetAt(rowIdx);
	        var distance = this.dimensionModel.get('bodyHeight');
	        var movedIdx;

	        if (!isDownDir) {
	            distance = -distance;
	        }
	        movedIdx = this.coordRowModel.indexOf(curOffset + distance);

	        return util.clamp(movedIdx, 0, this.dataModel.length - 1);
	    },

	    /**
	     * shift 가 눌린 상태에서의 key down event handler
	     * @param {Event} keyDownEvent 이벤트 객체
	     * @private
	     */
	    _keyInWithShift: function(keyDownEvent) { // eslint-disable-line complexity
	        var focusModel = this.focusModel;
	        var columnModelList = this.columnModel.getVisibleColumnModelList();
	        var coordConverterModel = this.coordConverterModel;
	        var keyCode = keyDownEvent.keyCode || keyDownEvent.which;
	        var index = this._getIndexBeforeMove();
	        var isKeyIdentified = true;
	        var isSelection = true;
	        var columnModel, scrollPosition, isValid, selectionType, address;

	        switch (keyCode) {
	            case keyCodeMap.UP_ARROW:
	                index.row -= 1;
	                break;
	            case keyCodeMap.DOWN_ARROW:
	                index.row += 1;
	                break;
	            case keyCodeMap.LEFT_ARROW:
	                index.column -= 1;
	                break;
	            case keyCodeMap.RIGHT_ARROW:
	                index.column += 1;
	                break;
	            case keyCodeMap.PAGE_UP:
	                index.row = this._getPageMovedRowIndex(index.row, false);
	                break;
	            case keyCodeMap.PAGE_DOWN:
	                index.row = this._getPageMovedRowIndex(index.row, true);
	                break;
	            case keyCodeMap.HOME:
	                index.column = 0;
	                break;
	            case keyCodeMap.END:
	                index.column = columnModelList.length - 1;
	                break;
	            case keyCodeMap.ENTER:
	                isSelection = false;
	                break;
	            case keyCodeMap.TAB:
	                isSelection = false;
	                address = focusModel.prevAddress();
	                focusModel.focusIn(address.rowKey, address.columnName, true);
	                break;
	            default:
	                isSelection = false;
	                isKeyIdentified = false;
	                break;
	        }

	        columnModel = columnModelList[index.column];
	        isValid = !!(columnModel && this.dataModel.getRowData(index.row));

	        if (isSelection && isValid) {
	            this._updateSelectionByKeyIn(index.row, index.column);
	            scrollPosition = coordConverterModel.getScrollPosition(index.row, columnModel.columnName);
	            if (scrollPosition) {
	                selectionType = this.selectionModel.getType();
	                if (selectionType === selTypeConst.COLUMN) {
	                    delete scrollPosition.scrollTop;
	                } else if (selectionType === selTypeConst.ROW) {
	                    delete scrollPosition.scrollLeft;
	                }
	                this.renderModel.set(scrollPosition);
	            }
	        }

	        if (isKeyIdentified) {
	            keyDownEvent.preventDefault();
	        }
	    },

	    /**
	     * ctrl 가 눌린 상태에서의 key down event handler
	     * @param {Event} keyDownEvent 이벤트 객체
	     * @private
	     */
	    _keyInWithCtrl: function(keyDownEvent) {  // eslint-disable-line complexity
	        var focusModel = this.focusModel;
	        var keyCode = keyDownEvent.keyCode || keyDownEvent.which;

	        switch (keyCode) {
	            case keyCodeMap.CHAR_A:
	                this.selectionModel.selectAll();
	                break;
	            case keyCodeMap.CHAR_C:
	                this._copyToClipboard();
	                break;
	            case keyCodeMap.HOME:
	                focusModel.focus(focusModel.firstRowKey(), focusModel.firstColumnName(), true);
	                break;
	            case keyCodeMap.END:
	                focusModel.focus(focusModel.lastRowKey(), focusModel.lastColumnName(), true);
	                break;
	            case keyCodeMap.CHAR_V:
	                this._pasteWhenKeyupCharV();
	                break;
	            default:
	                break;
	        }
	    },

	    /**
	     * paste date
	     * @private
	     */
	    _pasteWhenKeyupCharV: function() {
	        var self = this;

	        // pressing v long time, clear clipboard to keep final paste date
	        this._clearClipBoard();
	        if (this.pasting) {
	            return;
	        }

	        this.pasting = true;
	        this.$el.on('keyup', function() {
	            self._pasteToGrid();
	            self.pasting = false;
	        });
	    },

	   /**
	     * clipboard textarea clear
	     * @private
	     */
	    _clearClipBoard: function() {
	        this.$el.val('');
	    },

	    /**
	     * paste text data
	     * @private
	     */
	    _pasteToGrid: function() {
	        var selectionModel = this.selectionModel;
	        var focusModel = this.focusModel;
	        var dataModel = this.dataModel;
	        var startIdx, data;

	        if (selectionModel.hasSelection()) {
	            startIdx = selectionModel.getStartIndex();
	        } else {
	            startIdx = focusModel.indexOf();
	        }
	        data = this._getProcessClipBoardData();

	        this.$el.off('keyup');
	        dataModel.paste(data, startIdx);
	    },

	    /**
	     * process data for paste to grid
	     * @private
	     * @returns {Array.<Array.<string>>} result
	     */
	    _getProcessClipBoardData: function() {
	        var text = this.$el.val();
	        var result = text.split('\n');
	        var i = 0;
	        var len = result.length;

	        for (; i < len; i += 1) {
	            result[i] = result[i].split('\t');
	        }

	        return result;
	    },

	    /**
	     * ctrl, shift 둘다 눌린 상태에서의 key down event handler
	     * @param {Event} keyDownEvent 이벤트 객체
	     * @private
	     */
	    _keyInWithShiftAndCtrl: function(keyDownEvent) {
	        var isKeyIdentified = true;
	        var columnModelList = this.columnModel.getVisibleColumnModelList();
	        var keyCode = keyDownEvent.keyCode || keyDownEvent.which;

	        switch (keyCode) {
	            case keyCodeMap.HOME:
	                this._updateSelectionByKeyIn(0, 0);
	                break;
	            case keyCodeMap.END:
	                this._updateSelectionByKeyIn(this.dataModel.length - 1, columnModelList.length - 1);
	                break;
	            default:
	                isKeyIdentified = false;
	                break;
	        }
	        if (isKeyIdentified) {
	            keyDownEvent.preventDefault();
	        }
	    },

	    /**
	     * text type 의 editOption cell 의 data 를 빈 스트링으로 세팅한다.
	     * selection 영역이 지정되어 있다면 selection 영역에 해당하는 모든 셀.
	     * selection 영역이 지정되어 있지 않다면 focus된 셀
	     * @private
	     */
	    _del: function() {
	        var selectionModel = this.selectionModel;
	        var dataModel = this.dataModel;
	        var focused = this.focusModel.which();
	        var rowKey = focused.rowKey;
	        var columnName = focused.columnName;

	        if (selectionModel.hasSelection()) {
	            dataModel.delRange(selectionModel.get('range'));
	        } else {
	            dataModel.del(rowKey, columnName);
	        }
	    },

	    /**
	     * keyIn 으로 selection 영역을 update 한다. focus 로직도 함께 수행한다.
	     * @param {Number} rowIndex 행의 index 정보
	     * @param {Number} columnIndex 열의 index 정보
	     * @private
	     */
	    _updateSelectionByKeyIn: function(rowIndex, columnIndex) {
	        var selectionModel = this.selectionModel;

	        selectionModel.update(rowIndex, columnIndex);
	    },

	    /**
	     * clipboard 에 설정될 문자열 반환한다.
	     * @returns {String} 데이터를 text 형태로 변환한 문자열
	     * @private
	     */
	    _getClipboardString: function() {
	        var selectionModel = this.selectionModel;
	        var focused = this.focusModel.which();
	        var text;

	        if (selectionModel.hasSelection()) {
	            text = this.selectionModel.getValuesToString(this.useFormattedValue);
	        } else if (this.useFormattedValue) {
	            text = this.renderModel.getCellData(focused.rowKey, focused.columnName).formattedValue;
	        } else {
	            text = this.dataModel.get(focused.rowKey).getValueString(focused.columnName);
	        }

	        return text;
	    },


	    /**
	     * 현재 그리드의 data 를 clipboard 에 copy 한다.
	     * @private
	     */
	    _copyToClipboard: function() {
	        var text = this._getClipboardString();

	        if (window.clipboardData) {
	            window.clipboardData.setData('Text', text);
	        } else {
	            this.$el.val(text).select();
	        }
	    }
	});

	module.exports = Clipboard;


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Left Side Frame
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var Frame = __webpack_require__(38);
	var classNameConst = __webpack_require__(15);
	var frameConst = __webpack_require__(10).frame;

	/**
	 * Left Side Frame
	 * @module view/layout/frame-lside
	 * @extends module:view/layout/frame
	 * @ignore
	 */
	var LsideFrame = Frame.extend(/**@lends module:view/layout/frame-lside.prototype */{
	    initialize: function() {
	        Frame.prototype.initialize.apply(this, arguments);
	        this.setOwnProperties({
	            whichSide: frameConst.L
	        });

	        this.listenTo(this.dimensionModel, 'change:lsideWidth', this._onFrameWidthChanged);
	    },

	    className: classNameConst.LSIDE_AREA,

	    /**
	     * Event handler for 'change:lsideWidth' event on module:model/dimension
	     * @private
	     */
	    _onFrameWidthChanged: function() {
	        this.$el.css({
	            width: this.dimensionModel.get('lsideWidth')
	        });
	    },

	    /**
	     * To be called at the beginning of the 'render' method.
	     * @override
	     */
	    beforeRender: function() {
	        this.$el.css({
	            display: 'block',
	            width: this.dimensionModel.get('lsideWidth')
	        });
	    },

	    /**
	     * To be called at the end of the 'render' method.
	     * @override
	     */
	    afterRender: function() {
	        if (!this.dimensionModel.get('scrollX')) {
	            return;
	        }

	        this.$el.append($('<div>').addClass(classNameConst.SCROLLBAR_LEFT_BOTTOM));
	    }
	});

	module.exports = LsideFrame;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Frame Base
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var View = __webpack_require__(2);
	var frameConst = __webpack_require__(10).frame;

	/**
	 * Base class for frame view.
	 * @module view/layout/frame
	 * @extends module:base/view
	 * @param {Object} options Options
	 *      @param {String} [options.whichSide=R] R for Right side, L for Left side
	 * @ignore
	 */
	var Frame = View.extend(/**@lends module:view/layout/frame.prototype */{
	    initialize: function(options) {
	        View.prototype.initialize.call(this);

	        this.setOwnProperties({
	            viewFactory: options.viewFactory,
	            renderModel: options.renderModel,
	            dimensionModel: options.dimensionModel,
	            whichSide: options.whichSide || frameConst.R
	        });

	        this.listenTo(this.renderModel, 'columnModelChanged', this.render);
	    },

	    /**
	     * Render
	     * @returns {module:view/layout/frame} This object
	     */
	    render: function() {
	        var factory = this.viewFactory;

	        this.$el.empty();
	        this._destroyChildren();

	        this.beforeRender();
	        this._addChildren([
	            factory.createHeader(this.whichSide),
	            factory.createBody(this.whichSide),
	            factory.createFooter(this.whichSide)
	        ]);
	        this.$el.append(this._renderChildren());
	        this.afterRender();

	        return this;
	    },

	    /**
	     * To be called at the beginning of the 'render' method.
	     * @abstract
	     */
	    beforeRender: function() {},

	    /**
	     * To be called at the end of the 'render' method.
	     * @abstract
	     */
	    afterRender: function() {}
	});

	module.exports = Frame;


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Right Side Frame
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var Frame = __webpack_require__(38);
	var classNameConst = __webpack_require__(15);
	var constMap = __webpack_require__(10);
	var frameConst = constMap.frame;
	var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;

	/**
	 * right side frame class
	 * @module view/layout/frame-rside
	 * @extends module:view/layout/frame
	 * @ignore
	 */
	var RsideFrame = Frame.extend(/**@lends module:view/layout/frame-rside.prototype */{
	    initialize: function() {
	        Frame.prototype.initialize.apply(this, arguments);
	        this.setOwnProperties({
	            whichSide: frameConst.R,
	            $scrollBorder: null
	        });
	        this.listenTo(this.dimensionModel, 'change:lsideWidth change:rsideWidth', this._onFrameWidthChanged);
	        this.listenTo(this.dimensionModel, 'change:bodyHeight change:headerHeight',
	            this._resetScrollBorderHeight);
	    },

	    className: classNameConst.RSIDE_AREA,

	    /**
	     * Event handler for 'change:rsideWidth' event on dimensionModel
	     * @private
	     * @override
	     */
	    _onFrameWidthChanged: function() {
	        this._refreshLayout();
	    },

	    /**
	     * Refresh layout
	     * @private
	     */
	    _refreshLayout: function() {
	        var dimensionModel = this.dimensionModel;
	        var width = dimensionModel.get('rsideWidth');
	        var marginLeft = dimensionModel.get('lsideWidth');

	        // If the left side exists and the division border should not be doubled,
	        // left side should cover the right side by border-width to hide the left border of the right side.
	        if (marginLeft > 0 && !dimensionModel.isDivisionBorderDoubled()) {
	            width += CELL_BORDER_WIDTH;
	            marginLeft -= CELL_BORDER_WIDTH;
	        }

	        this.$el.css({
	            width: width,
	            marginLeft: marginLeft
	        });
	    },

	    /**
	     * Resets the height of a vertical scroll-bar border
	     * @private
	     */
	    _resetScrollBorderHeight: function() {
	        var dimensionModel, height;

	        if (this.$scrollBorder) {
	            dimensionModel = this.dimensionModel;
	            height = dimensionModel.get('bodyHeight') - dimensionModel.getScrollXHeight();
	            this.$scrollBorder.height(height);
	        }
	    },

	    /**
	     * To be called at the beginning of the 'render' method.
	     * @override
	     */
	    beforeRender: function() {
	        this.$el.css('display', 'block');
	        this._refreshLayout();
	    },

	    /**
	     * To be called at the end of the 'render' method.
	     * @override
	     */
	    afterRender: function() {
	        var dimensionModel = this.dimensionModel;
	        var headerHeight, footerHeight;
	        var $space, $scrollBorder;

	        if (!dimensionModel.get('scrollY')) {
	            return;
	        }
	        headerHeight = dimensionModel.get('headerHeight');
	        footerHeight = dimensionModel.get('footerHeight');

	        // Empty DIV for hiding scrollbar in the header area
	        $space = $('<div />').addClass(classNameConst.SCROLLBAR_HEAD);

	        // Empty DIV for showing a left-border of vertical scrollbar in the body area
	        $scrollBorder = $('<div />').addClass(classNameConst.SCROLLBAR_BORDER);

	        $space.height(headerHeight - 2); // subtract 2px for border-width (top and bottom)
	        $scrollBorder.css('top', headerHeight + 'px');

	        this.$el.append($space, $scrollBorder);

	        // Empty DIV for filling gray color in the right-bottom corner of the scrollbar.
	        // (For resolving the issue that styling scrollbar-corner with '-webkit-scrollbar-corner'
	        //  casues to be stuck in the same position in Chrome)
	        if (dimensionModel.get('scrollX')) {
	            this.$el.append($('<div>').addClass(classNameConst.SCROLLBAR_RIGHT_BOTTOM));
	        }

	        // Empty DIV for filling gray color in the right side of the footer.
	        if (footerHeight && dimensionModel.get('scrollY')) {
	            this.$el.append($('<div>')
	                .addClass(classNameConst.FOOT_AREA_RIGHT)
	                .css('height', footerHeight - CELL_BORDER_WIDTH)
	            );
	        }

	        this.$scrollBorder = $scrollBorder;
	        this._resetScrollBorderHeight();
	    }
	});

	module.exports = RsideFrame;


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Header View
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var View = __webpack_require__(2);
	var util = __webpack_require__(9);
	var constMap = __webpack_require__(10);
	var classNameConst = __webpack_require__(15);
	var frameConst = constMap.frame;

	var DELAY_SYNC_CHECK = 10;
	var keyCodeMap = constMap.keyCode;
	var SEL_TYPE_COLUMN = constMap.selectionType.COLUMN;
	var ATTR_COLUMN_NAME = constMap.attrName.COLUMN_NAME;
	var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;
	var TABLE_BORDER_WIDTH = constMap.dimension.TABLE_BORDER_WIDTH;

	/**
	 * Header Layout View
	 * @module view/layout/header
	 * @extends module:base/view
	 * @param {Object} options - options
	 * @param {String} [options.whichSide=R]  R: Right, L: Left
	 * @ignore
	 */
	var Header = View.extend(/**@lends module:view/layout/header.prototype */{
	    initialize: function(options) {
	        View.prototype.initialize.call(this);

	        this.setOwnProperties({
	            renderModel: options.renderModel,
	            coordColumnModel: options.coordColumnModel,
	            dimensionModel: options.dimensionModel,
	            selectionModel: options.selectionModel,
	            focusModel: options.focusModel,
	            columnModel: options.columnModel,
	            dataModel: options.dataModel,
	            viewFactory: options.viewFactory,
	            coordRowModel: options.coordRowModel,
	            whichSide: options.whichSide || frameConst.R
	        });

	        this.listenTo(this.renderModel, 'change:scrollLeft', this._onScrollLeftChange)
	            .listenTo(this.coordColumnModel, 'columnWidthChanged', this._onColumnWidthChanged)
	            .listenTo(this.selectionModel, 'change:range', this._refreshSelectedHeaders)
	            .listenTo(this.focusModel, 'change:columnName', this._refreshSelectedHeaders)
	            .listenTo(this.dataModel, 'sortChanged', this._updateBtnSortState);

	        if (this.whichSide === frameConst.L && this.columnModel.get('selectType') === 'checkbox') {
	            this.listenTo(this.dataModel,
	                'change:_button disabledChanged extraDataChanged add remove reset',
	                _.debounce(_.bind(this._syncCheckedState, this), DELAY_SYNC_CHECK));
	        }
	    },

	    className: classNameConst.HEAD_AREA,

	    events: {
	        'click': '_onClick',
	        'keydown input': '_onKeydown',
	        'mousedown th': '_onMouseDown'
	    },

	    /**
	     * template
	     */
	    template: _.template(
	        '<table class="' + classNameConst.TABLE + '">' +
	            '<colgroup><%=colGroup%></colgroup>' +
	            '<tbody><%=tBody%></tbody>' +
	        '</table>'
	    ),

	    /**
	     * template for <th>
	     */
	    templateHeader: _.template(
	        '<th <%=attrColumnName%>="<%=columnName%>" ' +
	            'class="<%=className%>" ' +
	            'height="<%=height%>" ' +
	            '<%if(colspan > 0) {%>' +
	               'colspan=<%=colspan%> ' +
	            '<%}%>' +
	            '<%if(rowspan > 0) {%>' +
	                'rowspan=<%=rowspan%> ' +
	            '<%}%>' +
	        '>' +
	        '<%=title%><%=btnSort%>' +
	        '</th>'
	    ),

	    /**
	     * templse for <col>
	     */
	    templateCol: _.template(
	        '<col ' +
	            '<%=attrColumnName%>="<%=columnName%>" ' +
	            'style="width:<%=width%>px">'
	    ),

	    /**
	     * HTML string for a button
	     */
	    markupBtnSort: '<a class="' + classNameConst.BTN_SORT + '"></a>',

	    /**
	     * col group 마크업을 생성한다.
	     * @returns {string} <colgroup>에 들어갈 html 마크업 스트링
	     * @private
	     */
	    _getColGroupMarkup: function() {
	        var columnData = this._getColumnData();
	        var columnWidthList = columnData.widthList;
	        var columnModelList = columnData.modelList;
	        var htmlList = [];

	        _.each(columnWidthList, function(width, index) {
	            htmlList.push(this.templateCol({
	                attrColumnName: ATTR_COLUMN_NAME,
	                columnName: columnModelList[index].columnName,
	                width: width + CELL_BORDER_WIDTH
	            }));
	        }, this);

	        return htmlList.join('');
	    },

	    /**
	     * Returns an array of names of columns in selection range.
	     * @private
	     * @returns {Array.<String>}
	     */
	    _getSelectedColumnNames: function() {
	        var columnRange = this.selectionModel.get('range').column,
	            visibleColumns = this.columnModel.getVisibleColumnModelList(),
	            selectedColumns = visibleColumns.slice(columnRange[0], columnRange[1] + 1);

	        return _.pluck(selectedColumns, 'columnName');
	    },

	    /**
	     * Returns an array of names of merged-column which contains every column name in the given array.
	     * @param {Array.<String>} columnNames - an array of column names to test
	     * @returns {Array.<String>}
	     * @private
	     */
	    _getContainingMergedColumnNames: function(columnNames) {
	        var columnModel = this.columnModel,
	            mergedColumnNames = _.pluck(columnModel.get('columnMerge'), 'columnName');

	        return _.filter(mergedColumnNames, function(mergedColumnName) {
	            var unitColumnNames = columnModel.getUnitColumnNamesIfMerged(mergedColumnName);
	            return _.every(unitColumnNames, function(name) {
	                return _.contains(columnNames, name);
	            });
	        });
	    },

	    /**
	     * Refreshes selected class of every header element (th)
	     * @private
	     */
	    _refreshSelectedHeaders: function() {
	        var $ths = this.$el.find('th'),
	            columnNames, mergedColumnNames;

	        if (this.selectionModel.hasSelection()) {
	            columnNames = this._getSelectedColumnNames();
	        } else if (this.focusModel.has(true)) {
	            columnNames = [this.focusModel.get('columnName')];
	        }

	        $ths.removeClass(classNameConst.CELL_SELECTED);
	        if (columnNames) {
	            mergedColumnNames = this._getContainingMergedColumnNames(columnNames);
	            _.each(columnNames.concat(mergedColumnNames), function(columnName) {
	                $ths.filter('[' + ATTR_COLUMN_NAME + '="' + columnName + '"]').addClass(classNameConst.CELL_SELECTED);
	            });
	        }
	    },

	    /**
	     * Event handler for 'keydown' event on checkbox input
	     * @param {KeyboardEvent} event - event
	     * @private
	     */
	    _onKeydown: function(event) {
	        if (event.keyCode === keyCodeMap.TAB) {
	            event.preventDefault();
	            this.focusModel.focusClipboard();
	        }
	    },

	    /**
	     * Mousedown event handler
	     * @param {jQuery.Event} event - MouseDown event
	     * @private
	     */
	    _onMouseDown: function(event) {
	        var columnName, columnNames;

	        if (!this.selectionModel.isEnabled() || $(event.target).is('a.' + classNameConst.BTN_SORT)) {
	            return;
	        }

	        columnName = $(event.target).closest('th').attr(ATTR_COLUMN_NAME);
	        if (!columnName) {
	            return;
	        }

	        columnNames = this.columnModel.getUnitColumnNamesIfMerged(columnName);

	        if (!this._hasMetaColumn(columnNames)) {
	            this._controlStartAction(columnNames, event.pageX, event.pageY, event.shiftKey);
	        }
	    },

	    /**
	     * Control selection action when started
	     * @param {Array} columnNames - An array of column names
	     * @param {number} pageX - Mouse position X
	     * @param {number} pageY - Mouse position Y
	     * @param {boolean} shiftKey - Whether the shift-key is pressed.
	     * @private
	     */
	    _controlStartAction: function(columnNames, pageX, pageY, shiftKey) {
	        var columnModel = this.columnModel,
	            columnIndexes = _.map(columnNames, function(name) {
	                return columnModel.indexOfColumnName(name, true);
	            });

	        if (shiftKey) {
	            this._startColumnSelectionWithShiftKey(columnIndexes, pageX, pageY);
	        } else {
	            this._startColumnSelectionWithoutShiftKey(columnIndexes);
	        }
	        this._attachDragEvents();
	    },

	    /**
	     * Start column selection with shiftKey pressed
	     * @param {Array.<number>} columnIndexes - Indexes of columns
	     * @param {number} pageX - Mouse position X
	     * @param {number} pageY - Mouse position Y
	     * @private
	     */
	    _startColumnSelectionWithShiftKey: function(columnIndexes, pageX, pageY) {
	        var selectionModel = this.selectionModel;
	        var max = Math.max.apply(null, columnIndexes);

	        selectionModel.update(0, max, SEL_TYPE_COLUMN);
	        selectionModel.extendColumnSelection(columnIndexes, pageX, pageY);
	    },

	    /**
	     * Start column selection when shiftKey is not pressed
	     * @param {Array.<number>} columnIndexes - Indexes of columns
	     * @private
	     */
	    _startColumnSelectionWithoutShiftKey: function(columnIndexes) {
	        var selectionModel = this.selectionModel;
	        var minMax = util.getMinMax(columnIndexes);
	        var min = minMax.min;
	        var max = minMax.max;

	        selectionModel.setMinimumColumnRange([min, max]);
	        selectionModel.selectColumn(min);
	        selectionModel.update(0, max);
	    },

	    /**
	     * Attach mouse drag event
	     * @private
	     */
	    _attachDragEvents: function() {
	        $(document)
	            .on('mousemove', $.proxy(this._onMouseMove, this))
	            .on('mouseup', $.proxy(this._detachDragEvents, this))
	            .on('selectstart', $.proxy(this._onSelectStart, this));
	    },

	    /**
	     * Detach mouse drag event
	     * @private
	     */
	    _detachDragEvents: function() {
	        this.selectionModel.stopAutoScroll();
	        $(document)
	            .off('mousemove', this._onMouseMove)
	            .off('mouseup', this._detachDragEvents)
	            .off('selectstart', this._onSelectStart);
	    },

	    /**
	     * Mousemove event handler
	     * @param {jQuery.Event} event - MouseMove event
	     * @private
	     */
	    _onMouseMove: function(event) {
	        var columnModel = this.columnModel;
	        var isExtending = true;
	        var columnName = $(event.target).closest('th').attr(ATTR_COLUMN_NAME);
	        var columnNames, columnIndexes;

	        if (columnName) {
	            columnNames = columnModel.getUnitColumnNamesIfMerged(columnName);
	            columnIndexes = _.map(columnNames, function(name) {
	                return columnModel.indexOfColumnName(name, true);
	            });
	        } else if ($.contains(this.el, event.target)) {
	            isExtending = false;
	        }

	        if (isExtending) {
	            this.selectionModel.extendColumnSelection(columnIndexes, event.pageX, event.pageY);
	        }
	    },

	    /**
	     * Whether this columnNames array has a meta column name.
	     * @param {Array} columnNames - An array of column names
	     * @returns {boolean} Has a meta column name or not.
	     * @private
	     */
	    _hasMetaColumn: function(columnNames) {
	        return _.some(columnNames, function(name) {
	            return util.isMetaColumn(name);
	        });
	    },

	    /**
	     * Selectstart event handler
	     * @param {jQuery.Event} event - Mouse event
	     * @returns {boolean} false for preventDefault
	     * @private
	     */
	    _onSelectStart: function(event) {
	        event.preventDefault();
	        return false;
	    },

	    /**
	     * selectType 이 checkbox 일 때 랜더링 되는 header checkbox 엘리먼트를 반환한다.
	     * @returns {jQuery} _butoon 컬럼 헤더의 checkbox input 엘리먼트
	     * @private
	     */
	    _getHeaderMainCheckbox: function() {
	        return this.$el.find('th[' + ATTR_COLUMN_NAME + '="_button"] input');
	    },

	    /**
	     * header 영역의 input 상태를 실제 checked 된 count 에 맞추어 반영한다.
	     * @private
	     */
	    _syncCheckedState: function() {
	        var checkedState = this.dataModel.getCheckedState();
	        var $input, props;

	        $input = this._getHeaderMainCheckbox();
	        if (!$input.length) {
	            return;
	        }

	        if (!checkedState.available) {
	            props = {
	                checked: false,
	                disabled: true
	            };
	        } else {
	            props = {
	                checked: checkedState.available === checkedState.checked,
	                disabled: false
	            };
	        }
	        $input.prop(props);
	    },

	    /**
	     * column width 변경시 col 엘리먼트들을 조작하기 위한 헨들러
	     * @private
	     */
	    _onColumnWidthChanged: function() {
	        var columnWidthList = this.coordColumnModel.getColumnWidthList(this.whichSide);
	        var $colList = this.$el.find('col');
	        var coordRowModel = this.coordRowModel;
	        var totalWidth = 0;

	        _.each(columnWidthList, function(columnWidth, index) {
	            $colList.eq(index).css('width', columnWidth + CELL_BORDER_WIDTH);
	            totalWidth += columnWidth;
	        });
	        this.$el.find('table').css('width', totalWidth);

	        // Calls syncWithDom only from the Rside to prevent calling twice.
	        // Defered call to ensure that the execution occurs after both sides are rendered.
	        if (this.whichSide === frameConst.R) {
	            _.defer(function() {
	                coordRowModel.syncWithDom();
	            });
	        }
	    },

	    /**
	     * scroll left 값이 변경되었을 때 header 싱크를 맞추는 이벤트 핸들러
	     * @param {Object} model    변경이 발생한 model 인스턴스
	     * @param {Number} value    scrollLeft 값
	     * @private
	     */
	    /* istanbul ignore next: scrollLeft 를 확인할 수 없음 */
	    _onScrollLeftChange: function(model, value) {
	        if (this.whichSide === frameConst.R) {
	            this.el.scrollLeft = value;
	        }
	    },

	    /**
	     * 클릭 이벤트 핸들러
	     * @param {jQuery.Event} clickEvent 클릭이벤트
	     * @private
	     */
	    _onClick: function(clickEvent) {
	        var $target = $(clickEvent.target);
	        var columnName = $target.closest('th').attr(ATTR_COLUMN_NAME);

	        if (columnName === '_button' && $target.is('input')) {
	            if ($target.prop('checked')) {
	                this.dataModel.checkAll();
	            } else {
	                this.dataModel.uncheckAll();
	            }
	        } else if ($target.is('a.' + classNameConst.BTN_SORT)) {
	            this.dataModel.sortByField(columnName);
	        }
	    },

	    /**
	     * 정렬 버튼의 상태를 변경한다.
	     * @private
	     * @param {object} sortOptions 정렬 옵션
	     * @param {string} sortOptions.columnName 정렬할 컬럼명
	     * @param {boolean} sortOptions.isAscending 오름차순 여부
	     */
	    _updateBtnSortState: function(sortOptions) {
	        if (this._$currentSortBtn) {
	            this._$currentSortBtn.removeClass(classNameConst.BTN_SORT_DOWN + ' ' + classNameConst.BTN_SORT_UP);
	        }
	        this._$currentSortBtn = this.$el.find(
	            'th[' + ATTR_COLUMN_NAME + '="' + sortOptions.columnName + '"] a.' + classNameConst.BTN_SORT
	        );
	        this._$currentSortBtn.addClass(sortOptions.isAscending ?
	            classNameConst.BTN_SORT_UP : classNameConst.BTN_SORT_DOWN
	        );
	    },

	    /**
	     * 랜더링
	     * @returns {View.Layout.Header} this
	     */
	    render: function() {
	        this._destroyChildren();

	        this.$el.css({
	            height: this.dimensionModel.get('headerHeight') - TABLE_BORDER_WIDTH
	        }).html(this.template({
	            colGroup: this._getColGroupMarkup(),
	            tBody: this._getTableBodyMarkup()
	        }));

	        this._addChildren(this.viewFactory.createHeaderResizeHandler(this.whichSide));
	        this.$el.append(this._renderChildren());
	        return this;
	    },

	    /**
	     * 컬럼 정보를 반환한다.
	     * @returns {{widthList: (Array|*), modelList: (Array|*)}}   columnWidthList 와 columnModelList 를 함께 반환한다.
	     * @private
	     */
	    _getColumnData: function() {
	        var columnWidthList = this.coordColumnModel.getColumnWidthList(this.whichSide);
	        var columnModelList = this.columnModel.getVisibleColumnModelList(this.whichSide, true);

	        return {
	            widthList: columnWidthList,
	            modelList: columnModelList
	        };
	    },

	    /**
	     * Header 의 body markup 을 생성한다.
	     * @returns {string} header 의 테이블 body 영역에 들어갈 html 마크업 스트링
	     * @private
	     */
	    _getTableBodyMarkup: function() {
	        var hierarchyList = this._getColumnHierarchyList();
	        var maxRowCount = this._getHierarchyMaxRowCount(hierarchyList);
	        var headerHeight = this.dimensionModel.get('headerHeight');
	        var rowMarkupList = new Array(maxRowCount);
	        var columnNameList = new Array(maxRowCount);
	        var colSpanList = [];
	        var rowHeight = util.getRowHeight(maxRowCount, headerHeight) - 1;
	        var rowSpan = 1;
	        var height;
	        var headerMarkupList;

	        _.each(hierarchyList, function(hierarchy, i) {
	            var length = hierarchyList[i].length;
	            var curHeight = 0;

	            _.each(hierarchy, function(columnModel, j) {
	                var columnName = columnModel.columnName;
	                var classNames = [
	                    classNameConst.CELL,
	                    classNameConst.CELL_HEAD
	                ];

	                if (columnModel.isRequired) {
	                    classNames.push(classNameConst.CELL_REQRUIRED);
	                }

	                rowSpan = (length - 1 === j && (maxRowCount - length + 1) > 1) ? (maxRowCount - length + 1) : 1;
	                height = rowHeight * rowSpan;

	                if (j === length - 1) {
	                    height = (headerHeight - curHeight) - 2;
	                } else {
	                    curHeight += height + 1;
	                }
	                if (columnNameList[j] === columnName) {
	                    rowMarkupList[j].pop();
	                    colSpanList[j] += 1;
	                } else {
	                    colSpanList[j] = 1;
	                }
	                columnNameList[j] = columnName;
	                rowMarkupList[j] = rowMarkupList[j] || [];
	                rowMarkupList[j].push(this.templateHeader({
	                    attrColumnName: ATTR_COLUMN_NAME,
	                    columnName: columnName,
	                    className: classNames.join(' '),
	                    height: height,
	                    colspan: colSpanList[j],
	                    rowspan: rowSpan,
	                    title: columnModel.title,
	                    btnSort: columnModel.isSortable ? this.markupBtnSort : ''
	                }));
	            }, this);
	        }, this);
	        headerMarkupList = _.map(rowMarkupList, function(rowMarkup) {
	            return '<tr>' + rowMarkup.join('') + '</tr>';
	        });

	        return headerMarkupList.join('');
	    },

	    /**
	     * column merge 가 설정되어 있을 때 헤더의 max row count 를 가져온다.
	     * @param {Array} hierarchyList 헤더 마크업 생성시 사용될 계층구조 데이터
	     * @returns {number} 헤더 영역의 row 최대값
	     * @private
	     */
	    _getHierarchyMaxRowCount: function(hierarchyList) {
	        var lengthList = [0];
	        _.each(hierarchyList, function(hierarchy) {
	            lengthList.push(hierarchy.length);
	        }, this);
	        return Math.max.apply(Math, lengthList);
	    },

	    /**
	     * column merge 가 설정되어 있을 때 헤더의 계층구조 리스트를 가져온다.
	     * @returns {Array}  계층구조 리스트
	     * @private
	     */
	    _getColumnHierarchyList: function() {
	        var columnModelList = this._getColumnData().modelList,
	            hierarchyList;

	        hierarchyList = _.map(columnModelList, function(columnModel) {
	            return this._getColumnHierarchy(columnModel).reverse();
	        }, this);

	        return hierarchyList;
	    },

	    /**
	     * column merge 가 설정되어 있을 때 재귀적으로 돌면서 계층구조를 형성한다.
	     *
	     * @param {Object} columnModel 컬럼모델
	     * @param {Array} [resultList]  결과로 메모이제이션을 이용하기 위한 인자값
	     * @returns {Array} 계층구조 결과값
	     * @private
	     */
	    _getColumnHierarchy: function(columnModel, resultList) {
	        var columnMergeList = this.columnModel.get('columnMerge');
	        resultList = resultList || [];
	        /* istanbul ignore else */
	        if (columnModel) {
	            resultList.push(columnModel);
	            /* istanbul ignore else */
	            if (columnMergeList) {
	                _.each(columnMergeList, function(columnMerge) {
	                    if ($.inArray(columnModel.columnName, columnMerge.columnNameList) !== -1) {
	                        this._getColumnHierarchy(columnMerge, resultList);
	                    }
	                }, this);
	            }
	        }
	        return resultList;
	    }
	});

	Header.DELAY_SYNC_CHECK = DELAY_SYNC_CHECK;

	module.exports = Header;


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview ResizeHandler for the Header
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var View = __webpack_require__(2);
	var constMap = __webpack_require__(10);
	var classNameConst = __webpack_require__(15);
	var attrNameConst = constMap.attrName;
	var frameConst = constMap.frame;
	var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;
	var RESIZE_HANDLE_WIDTH = constMap.dimension.RESIZE_HANDLE_WIDTH;

	/**
	 * Reside Handler class
	 * @module view/layout/resizeHandler
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	var ResizeHandler = View.extend(/**@lends module:view/layout/resizeHandler.prototype */ {
	    initialize: function(options) {
	        this.setOwnProperties({
	            dimensionModel: options.dimensionModel,
	            columnModel: options.columnModel,
	            coordColumnModel: options.coordColumnModel,
	            whichSide: options.whichSide || frameConst.R,

	            isResizing: false,
	            $target: null,
	            differenceLeft: 0,
	            initialWidth: 0,
	            initialOffsetLeft: 0,
	            initialLeft: 0
	        });

	        this.listenTo(this.coordColumnModel, 'columnWidthChanged', this._refreshHandlerPosition);
	    },

	    className: classNameConst.COLUMN_RESIZE_CONTAINER,

	    events: function() {
	        var eventHash = {};

	        eventHash['mousedown .' + classNameConst.COLUMN_RESIZE_HANDLE] = '_onMouseDown';
	        eventHash['dblclick .' + classNameConst.COLUMN_RESIZE_HANDLE] = '_onDblClick';

	        return eventHash;
	    },

	    template: _.template(
	        '<div ' +
	        attrNameConst.COLUMN_INDEX + '="<%=columnIndex%>" ' +
	        attrNameConst.COLUMN_NAME + '="<%=columnName%>" ' +
	        'class="' + classNameConst.COLUMN_RESIZE_HANDLE + ' <%=lastClass%>" ' +
	        'style="<%=height%>" ' +
	        'title="마우스 드래그를 통해 컬럼의 넓이를 변경할 수 있고,더블클릭을 통해 넓이를 초기화할 수 있습니다.">' +
	        '</div>'
	    ),

	    /**
	     * Return an object that contains an array of column width and an array of column model.
	     * @returns {{widthList: (Array|*), modelList: (Array|*)}} Column Data
	     * @private
	     */
	    _getColumnData: function() {
	        var columnWidthList = this.coordColumnModel.getColumnWidthList(this.whichSide);
	        var columnModelList = this.columnModel.getVisibleColumnModelList(this.whichSide, true);

	        return {
	            widthList: columnWidthList,
	            modelList: columnModelList
	        };
	    },

	    /**
	     * Returns the HTML string of all handler.
	     * @returns {String}
	     * @private
	     */
	    _getResizeHandlerMarkup: function() {
	        var columnData = this._getColumnData();
	        var columnModelList = columnData.modelList;
	        var headerHeight = this.dimensionModel.get('headerHeight');
	        var length = columnModelList.length;
	        var resizeHandleMarkupList = _.map(columnModelList, function(columnModel, index) {
	            return this.template({
	                lastClass: (index + 1 === length) ? classNameConst.COLUMN_RESIZE_HANDLE_LAST : '',
	                columnIndex: index,
	                columnName: columnModel.columnName,
	                height: headerHeight
	            });
	        }, this);

	        return resizeHandleMarkupList.join('');
	    },

	    /**
	     * Render
	     * @returns {module:view/layout/resizeHandler} This object
	     */
	    render: function() {
	        var headerHeight = this.dimensionModel.get('headerHeight'),
	            htmlStr = this._getResizeHandlerMarkup();

	        this.$el.empty().html(htmlStr).css({
	            marginTop: -headerHeight,
	            height: headerHeight,
	            display: 'block'
	        });
	        this._refreshHandlerPosition();

	        return this;
	    },

	    /**
	     * Refresh the position of every handler.
	     * @private
	     */
	    _refreshHandlerPosition: function() {
	        var columnData = this._getColumnData();
	        var columnWidthList = columnData.widthList;
	        var $resizeHandleList = this.$el.find('.' + classNameConst.COLUMN_RESIZE_HANDLE);
	        var handlerWidthHalf = Math.floor(RESIZE_HANDLE_WIDTH / 2);
	        var curPos = 0;

	        tui.util.forEachArray($resizeHandleList, function(item, index) {
	            var $handler = $resizeHandleList.eq(index);
	            curPos += columnWidthList[index] + CELL_BORDER_WIDTH;
	            $handler.css('left', curPos - handlerWidthHalf);
	        });
	    },

	    /**
	     * Returns whether resizing is in progress or not.
	     * @returns {boolean}
	     * @private
	     */
	    _isResizing: function() {
	        return !!this.isResizing;
	    },

	    /**
	     * Event handler for the 'mousedown' event
	     * @param {MouseEvent} mouseEvent - mouse event
	     * @private
	     */
	    _onMouseDown: function(mouseEvent) {
	        this._startResizing($(mouseEvent.target));
	    },

	    /**
	     * Event handler for the 'dblclick' event
	     * @param {MouseEvent} mouseEvent - mouse event
	     * @private
	     */
	    _onDblClick: function(mouseEvent) {
	        var $target = $(mouseEvent.target);
	        var index = parseInt($target.attr(attrNameConst.COLUMN_INDEX), 10);

	        this.coordColumnModel.restoreColumnWidth(this._getHandlerColumnIndex(index));
	        this._refreshHandlerPosition();
	    },

	    /**
	     * Event handler for the 'mouseup' event
	     * @private
	     */
	    _onMouseUp: function() {
	        this._stopResizing();
	    },

	    /**
	     * Event handler for the 'mousemove' event
	     * @param {MouseEvent} mouseEvent - mouse event
	     * @private
	     */
	    _onMouseMove: function(mouseEvent) {
	        var width, index;

	        if (this._isResizing()) {
	            mouseEvent.preventDefault();

	            width = this._calculateWidth(mouseEvent.pageX);
	            index = parseInt(this.$target.attr(attrNameConst.COLUMN_INDEX), 10);

	            this.coordColumnModel.setColumnWidth(this._getHandlerColumnIndex(index), width);
	            this._refreshHandlerPosition();
	        }
	    },

	    /**
	     * Returns the width of the column based on given mouse position and the initial offset.
	     * @param {number} pageX - mouse x position
	     * @returns {number}
	     * @private
	     */
	    _calculateWidth: function(pageX) {
	        var difference = pageX - this.initialOffsetLeft - this.initialLeft;
	        return this.initialWidth + difference;
	    },

	    /**
	     * Find the real index (based on visibility) of the column using index value of the handler and returns it.
	     * @param {number} index - index value of the handler
	     * @returns {number}
	     * @private
	     */
	    _getHandlerColumnIndex: function(index) {
	        return (this.whichSide === frameConst.R) ? (index + this.columnModel.getVisibleColumnFixCount(true)) : index;
	    },

	    /**
	     * Start resizing
	     * @param {jQuery} $target - target element
	     * @private
	     */
	    _startResizing: function($target) {
	        var columnData = this._getColumnData();
	        var columnWidthList = columnData.widthList;

	        this.isResizing = true;
	        this.$target = $target;
	        this.initialLeft = parseInt($target.css('left').replace('px', ''), 10);
	        this.initialOffsetLeft = this.$el.offset().left;
	        this.initialWidth = columnWidthList[$target.attr(attrNameConst.COLUMN_INDEX)];
	        $('body').css('cursor', 'col-resize');
	        $(document)
	            .on('mousemove', $.proxy(this._onMouseMove, this))
	            .on('mouseup', $.proxy(this._onMouseUp, this));

	        // for IE8 and under
	        if ($target[0].setCapture) {
	            $target[0].setCapture();
	        }
	    },

	    /**
	     * Stop resizing
	     * @private
	     */
	    _stopResizing: function() {
	        // for IE8 and under
	        if (this.$target && this.$target[0].releaseCapture) {
	            this.$target[0].releaseCapture();
	        }

	        this.isResizing = false;
	        this.$target = null;
	        this.initialLeft = 0;
	        this.initialOffsetLeft = 0;
	        this.initialWidth = 0;

	        $('body').css('cursor', 'default');
	        $(document)
	            .unbind('mousemove', $.proxy(this._onMouseMove, this))
	            .unbind('mouseup', $.proxy(this._onMouseUp, this));
	    },

	    /**
	     * Destroy
	     */
	    destroy: function() {
	        this.stopListening();
	        this._stopResizing();
	        this.remove();
	    }
	});

	module.exports = ResizeHandler;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Class for the body layout
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var View = __webpack_require__(2);
	var util = __webpack_require__(9);
	var constMap = __webpack_require__(10);
	var classNameConst = __webpack_require__(15);
	var attrNameConst = constMap.attrName;
	var selTypeConst = constMap.selectionType;
	var frameConst = constMap.frame;

	// Minimum time (ms) to detect if an alert or confirm dialog has been displayed.
	var MIN_INTERVAL_FOR_PAUSED = 200;

	// Minimum distance (pixel) to detect if user wants to drag when moving mouse with button pressed.
	var MIN_DISATNCE_FOR_DRAG = 10;

	/**
	 * Class for the body layout
	 * @module view/layout/body
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @param {String} [options.whichSide=R] L or R (which side)
	 * @ignore
	 */
	var Body = View.extend(/**@lends module:view/layout/body.prototype */{
	    initialize: function(options) {
	        View.prototype.initialize.call(this);

	        this.setOwnProperties({
	            dimensionModel: options.dimensionModel,
	            dataModel: options.dataModel,
	            columnModel: options.columnModel,
	            renderModel: options.renderModel,
	            coordConverterModel: options.coordConverterModel,
	            selectionModel: options.selectionModel,
	            focusModel: options.focusModel,
	            viewFactory: options.viewFactory,

	            // DIV for setting rendering position of entire child-nodes of $el.
	            $container: null,
	            whichSide: options && options.whichSide || frameConst.R
	        });

	        this.listenTo(this.dimensionModel, 'change:bodyHeight', this._onBodyHeightChange)
	            .listenTo(this.dimensionModel, 'change:totalRowHeight', this._resetContainerHeight)
	            .listenTo(this.renderModel, 'change:scrollTop', this._onScrollTopChange)
	            .listenTo(this.renderModel, 'change:scrollLeft', this._onScrollLeftChange);
	    },

	    className: classNameConst.BODY_AREA,

	    events: function() {
	        var hash = {};
	        hash.scroll = '_onScroll';
	        hash['mousedown .' + classNameConst.BODY_CONTAINER] = '_onMouseDown';

	        return hash;
	    },

	    /**
	     * Event handler for 'change:bodyHeight' event on module:model/dimension
	     * @param {Object} model - changed model
	     * @param {Number} value - new height value
	     * @private
	     */
	    _onBodyHeightChange: function(model, value) {
	        this.$el.css('height', value + 'px');
	    },

	    /**
	     * Resets the height of a container DIV
	     * @private
	     */
	    _resetContainerHeight: function() {
	        this.$container.css({
	            height: this.dimensionModel.get('totalRowHeight')
	        });
	    },

	    /**
	     * Event handler for 'scroll' event on DOM
	     * @param {UIEvent} event - event object
	     * @private
	     */
	    _onScroll: function(event) {
	        var attrs = {
	            scrollTop: event.target.scrollTop
	        };

	        if (this.whichSide === frameConst.R) {
	            attrs.scrollLeft = event.target.scrollLeft;
	        }
	        this.renderModel.set(attrs);
	    },

	    /**
	     * Event handler for 'change:scrollLeft' event on module:model/renderer
	     * @param {Object} model - changed model
	     * @param {Number} value - new scrollLeft value
	     * @private
	     */
	    _onScrollLeftChange: function(model, value) {
	        if (this.whichSide === frameConst.R) {
	            this.el.scrollLeft = value;
	        }
	    },

	    /**
	     * Event handler for 'chage:scrollTop' event on module:model/renderer
	     * @param {Object} model - changed model instance
	     * @param {Number} value - new scrollTop value
	     * @private
	     */
	    _onScrollTopChange: function(model, value) {
	        this.el.scrollTop = value;
	    },

	    /**
	     * Returns the name of the visible data columns at given index
	     * @param  {Number} columnIndex - Column index
	     * @returns {String} - Column name
	     * @private
	     */
	    _getColumnNameByVisibleIndex: function(columnIndex) {
	        var columns = this.columnModel.getVisibleColumnModelList(null, false);
	        return columns[columnIndex].columnName;
	    },

	    /**
	     * Mousedown event handler
	     * @param {MouseEvent} event - Mousedown event
	     * @private
	     */
	    _onMouseDown: function(event) {
	        var columnModel = this.columnModel;
	        var $target = $(event.target);
	        var $td = $target.closest('td');
	        var $tr = $target.closest('tr');
	        var columnName = $td.attr(attrNameConst.COLUMN_NAME);
	        var rowKey = $tr.attr(attrNameConst.ROW_KEY);
	        var startAction = true;
	        var inputData = _.pick(event, 'pageX', 'pageY', 'shiftKey');
	        var indexData;

	        if (!$td.length) { // selection layer, focus layer
	            indexData = this.coordConverterModel.getIndexFromMousePosition(event.pageX, event.pageY);
	            columnName = this._getColumnNameByVisibleIndex(indexData.column);
	        } else if (rowKey && columnName) { // valid cell
	            indexData = {
	                column: columnModel.indexOfColumnName(columnName, true),
	                row: this.dataModel.indexOfRowKey(rowKey)
	            };
	            if (this.columnModel.get('selectType') === 'radio') {
	                this.dataModel.check(rowKey);
	            }
	        } else { // dummy cell
	            startAction = false;
	        }

	        if (startAction) {
	            this._controlStartAction(inputData, indexData, columnName, $target.is('input, textarea'));
	        }
	    },

	    /**
	     * Control selection action when started
	     * @param {Object} inputData - Mouse position X
	     * @param   {number} inputData.pageY - Mouse position Y
	     * @param   {number} inputData.pageY - Mouse position Y
	     * @param   {boolean} inputData.shiftKey - Whether the shift-key is pressed.
	     * @param {{column:number, row:number}} indexData - Index map object
	     * @param {String} columnName - column name
	     * @param {boolean} isInput - Whether the target is input element.
	     * @private
	     */
	    _controlStartAction: function(inputData, indexData, columnName, isInput) {
	        var selectionModel = this.selectionModel,
	            columnIndex = indexData.column,
	            rowIndex = indexData.row,
	            startDrag = true;

	        if (!selectionModel.isEnabled()) {
	            return;
	        }

	        if (!util.isMetaColumn(columnName)) {
	            selectionModel.setType(selTypeConst.CELL);
	            if (inputData.shiftKey && !isInput) {
	                selectionModel.update(rowIndex, columnIndex);
	            } else {
	                startDrag = this._doFocusAtAndCheckDraggable(rowIndex, columnIndex);
	                selectionModel.end();
	            }
	        } else if (columnName === '_number') {
	            this._updateSelectionByRow(rowIndex, inputData.shiftKey);
	        } else {
	            startDrag = false;
	        }

	        if (!isInput && startDrag) {
	            this.dimensionModel.refreshLayout();
	            this._attachDragEvents(inputData.pageX, inputData.pageY);
	        }
	    },

	    /**
	     * Update selection model by row unit.
	     * @param {number} rowIndex - row index
	     * @param {boolean} shiftKey - true if the shift key is pressed
	     * @private
	     */
	    _updateSelectionByRow: function(rowIndex, shiftKey) {
	        if (shiftKey) {
	            this.selectionModel.update(rowIndex, 0, selTypeConst.ROW);
	        } else {
	            this.selectionModel.selectRow(rowIndex);
	        }
	    },

	    /**
	     * Executes the `focusModel.focusAt()` and returns the boolean value which indicates whether to start drag.
	     * @param {number} rowIndex - row index
	     * @param {number} columnIndex - column index
	     * @returns {boolean}
	     * @private
	     */
	    _doFocusAtAndCheckDraggable: function(rowIndex, columnIndex) {
	        var startTime = (new Date()).getTime(),
	            focusSuccessed = this.focusModel.focusAt(rowIndex, columnIndex),
	            endTime = (new Date()).getTime(),
	            hasPaused = (endTime - startTime) > MIN_INTERVAL_FOR_PAUSED;

	        if (!focusSuccessed || hasPaused) {
	            return false;
	        }
	        return true;
	    },

	    /**
	     * Attach event handlers for drag event.
	     * @param {Number} pageX - initial pageX value
	     * @param {Number} pageY - initial pageY value
	     * @private
	     */
	    _attachDragEvents: function(pageX, pageY) {
	        this.setOwnProperties({
	            mouseDownX: pageX,
	            mouseDownY: pageY
	        });
	        $(document)
	            .on('mousemove', $.proxy(this._onMouseMove, this))
	            .on('mouseup', $.proxy(this._detachDragEvents, this))
	            .on('selectstart', $.proxy(this._onSelectStart, this));
	    },

	    /**
	     * Detach all handlers which are used for drag event.
	     * @private
	     */
	    _detachDragEvents: function() {
	        this.selectionModel.stopAutoScroll();
	        $(document)
	            .off('mousemove', this._onMouseMove)
	            .off('mouseup', this._detachDragEvents)
	            .off('selectstart', this._onSelectStart);
	    },

	    /**
	     * Event handler for 'mousemove' event during drag
	     * @param {MouseEvent} event - MouseEvent object
	     * @private
	     */
	    _onMouseMove: function(event) {
	        var dragged = this._getMouseMoveDistance(event.pageX, event.pageY) > MIN_DISATNCE_FOR_DRAG;

	        if (this.selectionModel.hasSelection() || dragged) {
	            this.selectionModel.updateByMousePosition(event.pageX, event.pageY);
	        }
	    },

	    /**
	     * Returns the distance between 'mousedown' position and specified position.
	     * @param {number} pageX - X position relative to the document
	     * @param {number} pageY - Y position relative to the document
	     * @returns {number} Distance
	     * @private
	     */
	    _getMouseMoveDistance: function(pageX, pageY) {
	        var dx = Math.abs(this.mouseDownX - pageX);
	        var dy = Math.abs(this.mouseDownY - pageY);

	        return Math.round(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));
	    },

	    /**
	     * Event handler to prevent default action on `selectstart` event.
	     * @param {Event} event - event object
	     * @returns {boolean} false
	     * @private
	     */
	    _onSelectStart: function(event) {
	        event.preventDefault();
	        return false;
	    },

	    /**
	     * renders
	     * @returns {module:view/layout/body}
	     */
	    render: function() {
	        var whichSide = this.whichSide;

	        this._destroyChildren();

	        if (!this.dimensionModel.get('scrollX')) {
	            this.$el.css('overflow-x', 'hidden');
	        }
	        if (!this.dimensionModel.get('scrollY') && whichSide === frameConst.R) {
	            this.$el.css('overflow-y', 'hidden');
	        }
	        this.$el.css('height', this.dimensionModel.get('bodyHeight'));

	        this.$container = $('<div>').addClass(classNameConst.BODY_CONTAINER);
	        this.$el.append(this.$container);

	        this._addChildren([
	            this.viewFactory.createBodyTable(whichSide),
	            this.viewFactory.createSelectionLayer(whichSide),
	            this.viewFactory.createFocusLayer(whichSide)
	        ]);
	        this.$container.append(this._renderChildren());
	        this._resetContainerHeight();
	        return this;
	    }
	});

	module.exports = Body;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Class for the table layout in the body(data) area
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var View = __webpack_require__(2);
	var constMap = __webpack_require__(10);
	var classNameConst = __webpack_require__(15);

	var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;
	var ATTR_COLUMN_NAME = constMap.attrName.COLUMN_NAME;

	/**
	 * Class for the table layout in the body(data) area
	 * @module view/layout/bodyTable
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @param {String} [options.whichSide='R'] L or R (which side)
	 * @ignore
	 */
	var BodyTable = View.extend(/**@lends module:view/layout/bodyTable.prototype */{
	    initialize: function(options) {
	        View.prototype.initialize.call(this);

	        this.setOwnProperties({
	            dimensionModel: options.dimensionModel,
	            coordColumnModel: options.coordColumnModel,
	            renderModel: options.renderModel,
	            columnModel: options.columnModel,
	            viewFactory: options.viewFactory,
	            painterManager: options.painterManager,
	            whichSide: options.whichSide || 'R'
	        });

	        this.listenTo(this.coordColumnModel, 'columnWidthChanged', this._onColumnWidthChanged);

	        // To prevent issue of appearing vertical scrollbar when dummy rows exist
	        this.listenTo(this.renderModel, 'change:dummyRowCount', this._onChangeDummyRowCount);
	        this.listenTo(this.dimensionModel, 'change:bodyHeight', this._resetHeight);

	        this._attachAllTableEventHandlers();
	    },

	    className: classNameConst.BODY_TABLE_CONTAINER,

	    template: _.template(
	        '<table class="' + classNameConst.TABLE + '">' +
	        '   <colgroup><%=colGroup%></colgroup>' +
	        '   <tbody><%=tbody%></tbody>' +
	        '</table>'),

	    templateCol: _.template(
	        '<col <%=attrColumnName%>="<%=columnName%>" style="width:<%=width%>px">'
	    ),

	    /**
	     * Event handler for 'columnWidthChanged' event on a dimension model.
	     * @private
	     */
	    _onColumnWidthChanged: function() {
	        var columnWidthList = this.coordColumnModel.getColumnWidthList(this.whichSide);
	        var $colList = this.$el.find('col');
	        var totalWidth = 0;

	        _.each(columnWidthList, function(width, index) {
	            $colList.eq(index).css('width', width + CELL_BORDER_WIDTH);
	            totalWidth += width;
	        }, this);

	        this.$el.find('table').css('width', totalWidth);
	    },

	    /**
	     * Event handler for 'change:dummyRowCount' event on the renderModel.
	     * @private
	     */
	    _onChangeDummyRowCount: function() {
	        this._resetOverflow();
	        this._resetHeight();
	    },

	    /**
	     * Resets the overflow of element based on the dummyRowCount in renderModel.
	     * @private
	     */
	    _resetOverflow: function() {
	        var overflow = 'visible';

	        if (this.renderModel.get('dummyRowCount') > 0) {
	            overflow = 'hidden';
	        }
	        this.$el.css('overflow', overflow);
	    },

	    /**
	     * Resets the height of element based on the dummyRowCount in renderModel
	     * @private
	     */
	    _resetHeight: function() {
	        var dimensionModel = this.dimensionModel;

	        if (this.renderModel.get('dummyRowCount') > 0) {
	            this.$el.height(dimensionModel.get('bodyHeight') - dimensionModel.getScrollXHeight());
	        } else {
	            this.$el.css('height', '');
	        }
	    },

	    /**
	     * Reset position of a table container
	     * @param {number} top  조정할 top 위치 값
	     */
	    resetTablePosition: function() {
	        this.$el.css('top', this.renderModel.get('top'));
	    },

	    /**
	     * Renders elements
	     * @returns {View.Layout.Body} This object
	     */
	    render: function() {
	        this._destroyChildren();

	        this.$el.html(this.template({
	            colGroup: this._getColGroupMarkup(),
	            tbody: ''
	        }));

	        this._addChildren(this.viewFactory.createRowList({
	            bodyTableView: this,
	            el: this.$el.find('tbody'),
	            whichSide: this.whichSide
	        }));
	        this._renderChildren();

	        // To prevent issue of appearing vertical scrollbar when dummy rows exists
	        this._resetHeight();
	        this._resetOverflow();
	        return this;
	    },

	    /**
	     * 테이블 내부(TR,TD)에서 발생하는 이벤트를 this.el로 넘겨 해당 요소들에게 위임하도록 설정한다.
	     * @private
	     */
	    _attachAllTableEventHandlers: function() {
	        var cellPainters = this.painterManager.getCellPainters();

	        _.each(cellPainters, function(painter) {
	            painter.attachEventHandlers(this.$el, '');
	        }, this);
	    },

	    /**
	     * table 요소를 새로 생성한다.
	     * (IE8-9에서 tbody의 innerHTML 변경할 수 없는 문제를 해결하여 성능개선을 하기 위해 사용)
	     * @param {string} tbodyHtml - tbody의 innerHTML 문자열
	     * @returns {jquery} - 새로 생성된 table의 tbody 요소
	     */
	    redrawTable: function(tbodyHtml) {
	        this.$el[0].innerHTML = this.template({
	            colGroup: this._getColGroupMarkup(),
	            tbody: tbodyHtml
	        });

	        return this.$el.find('tbody');
	    },

	    /**
	     * Table 열 각각의 width 조정을 위한 columnGroup 마크업을 반환한다.
	     * @returns {string} <colgroup> 안에 들어갈 마크업 문자열
	     * @private
	     */
	    _getColGroupMarkup: function() {
	        var whichSide = this.whichSide;
	        var columnWidthList = this.coordColumnModel.getColumnWidthList(whichSide);
	        var columnModelList = this.columnModel.getVisibleColumnModelList(whichSide, true);
	        var html = '';

	        _.each(columnModelList, function(columnModel, index) {
	            html += this.templateCol({
	                attrColumnName: ATTR_COLUMN_NAME,
	                columnName: columnModel.columnName,
	                width: columnWidthList[index] + CELL_BORDER_WIDTH
	            });
	        }, this);

	        return html;
	    }
	});

	module.exports = BodyTable;


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Footer
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);
	var View = __webpack_require__(2);
	var classNameConst = __webpack_require__(15);
	var constMap = __webpack_require__(10);
	var frameConst = constMap.frame;

	var ATTR_COLUMN_NAME = constMap.attrName.COLUMN_NAME;

	/**
	 * Footer area
	 * @module view/layout/footer
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	var Footer = View.extend(/**@lends module:view/layout/footer.prototype */{
	    initialize: function(options) {
	        /**
	         * Store template functions of each column
	         * K: column name
	         * V: template function
	         * @example
	         * {
	         *     c1: function() {},
	         *     c2: function() {}
	         * }
	         * @type {Object}
	         */
	        this.columnTemplateMap = options.columnTemplateMap || {};

	        /**
	         * L: Left, R: Right
	         * @type {string}
	         */
	        this.whichSide = options.whichSide;

	        // models
	        this.columnModel = options.columnModel;
	        this.dimensionModel = options.dimensionModel;
	        this.coordColumnModel = options.coordColumnModel;
	        this.renderModel = options.renderModel;
	        this.summaryModel = options.summaryModel;

	        // events
	        this.listenTo(this.renderModel, 'change:scrollLeft', this._onChangeScrollLeft);
	        this.listenTo(this.coordColumnModel, 'columnWidthChanged', this._onChangeColumnWidth);
	        this.listenTo(this.columnModel, 'setFooterContent', this._setcolumnContent);
	        if (this.summaryModel) {
	            this.listenTo(this.summaryModel, 'change', this._onChangeSummaryValue);
	        }
	    },

	    className: classNameConst.FOOT_AREA,

	    events: {
	        scroll: '_onScrollView'
	    },

	    /**
	     * template
	     */
	    template: _.template(
	        '<table class="<%=className%>" style="height:<%=height%>px">' +
	            '<tbody><%=tbody%></tbody>' +
	        '</table>'
	    ),

	    /**
	     * Template for <th>
	     */
	    templateHeader: _.template(
	        '<th <%=attrColumnName%>="<%=columnName%>" ' +
	            'class="<%=className%>" ' +
	            'style="width:<%=width%>px"' +
	        '>' +
	        '<%=value%>' +
	        '</th>'
	    ),

	    /**
	     * Event handler for 'scroll' event
	     * @param {UIEvent} event - scroll event
	     * @private
	     */
	    _onScrollView: function(event) {
	        if (this.whichSide === frameConst.R) {
	            this.renderModel.set('scrollLeft', event.target.scrollLeft);
	        }
	    },

	    /**
	     * Sync scroll-left position with the value of body
	     * @param {Object} model - render model
	     * @param {Number} value - scrollLeft value
	     * @private
	     */
	    _onChangeScrollLeft: function(model, value) {
	        if (this.whichSide === frameConst.R) {
	            this.el.scrollLeft = value;
	        }
	    },

	    _onChangeColumnWidth: function() {
	        var columnWidthList = this.coordColumnModel.getColumnWidthList(this.whichSide);
	        var $ths = this.$el.find('th');

	        _.each(columnWidthList, function(columnWidth, index) {
	            $ths.eq(index).css('width', columnWidth);
	        });
	    },

	    /**
	     * Sets the HTML string of <th> of given column
	     * @param {string} columnName - column name
	     * @param {string} contents - HTML string
	     * @private
	     */
	    _setcolumnContent: function(columnName, contents) {
	        var $th = this.$el.find('th[' + ATTR_COLUMN_NAME + '="' + columnName + '"]');

	        $th.html(contents);
	    },

	    /**
	     * Refresh <th> tag whenever summary value is changed.
	     * @param {string} columnName - column name
	     * @param {object} valueMap - value map
	     * @private
	     */
	    _onChangeSummaryValue: function(columnName, valueMap) {
	        var contents = this._generateValueHTML(columnName, valueMap);

	        this._setcolumnContent(columnName, contents);
	    },

	    /**
	     * Generates a HTML string of column summary value and returns it.
	     * @param {object} columnName - column name
	     * @param {object} valueMap - value map
	     * @returns {string} HTML string
	     * @private
	     */
	    _generateValueHTML: function(columnName, valueMap) {
	        var template = this.columnTemplateMap[columnName];
	        var html = '';

	        if (_.isFunction(template)) {
	            html = template(valueMap);
	        }

	        return html;
	    },

	    /**
	     * Generates a HTML string of <tbody> and returns it
	     * @returns {string} - HTML String
	     * @private
	     */
	    _generateTbodyHTML: function() {
	        var summaryModel = this.summaryModel;
	        var columnModelList = this.columnModel.getVisibleColumnModelList(this.whichSide, true);
	        var columnWidthList = this.coordColumnModel.getColumnWidthList(this.whichSide);

	        return _.reduce(columnModelList, function(memo, column, index) {
	            var columnName = column.columnName;
	            var valueMap;

	            if (summaryModel) {
	                valueMap = summaryModel.getValue(column.columnName);
	            }

	            return memo + this.templateHeader({
	                attrColumnName: ATTR_COLUMN_NAME,
	                columnName: columnName,
	                className: classNameConst.CELL_HEAD + ' ' + classNameConst.CELL,
	                width: columnWidthList[index],
	                value: this._generateValueHTML(columnName, valueMap)
	            });
	        }, '', this);
	    },

	    /**
	     * Render
	     * @returns {object}
	     */
	    render: function() {
	        var footerHeight = this.dimensionModel.get('footerHeight');

	        if (footerHeight) {
	            this.$el.html(this.template({
	                className: classNameConst.TABLE,
	                height: footerHeight,
	                tbody: this._generateTbodyHTML()
	            }));
	        }

	        return this;
	    }
	});

	module.exports = Footer;


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview RowList View
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var View = __webpack_require__(2);
	var constMap = __webpack_require__(10);
	var classNameConst = __webpack_require__(15);

	var attrNameConst = constMap.attrName;
	var frameConst = constMap.frame;
	var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;

	/**
	 * RowList View
	 * @module view/rowList
	 * @extends module:baes/view
	 * @param {object} options - Options
	 * @param {string} [options.whichSide='R']   어느 영역에 속하는 rowList 인지 여부. 'L|R' 중 하나를 지정한다.
	 * @ignore
	 */
	var RowList = View.extend(/**@lends module:view/rowList.prototype */{
	    initialize: function(options) {
	        var focusModel = options.focusModel;
	        var renderModel = options.renderModel;
	        var selectionModel = options.selectionModel;
	        var coordRowModel = options.coordRowModel;
	        var whichSide = options.whichSide || 'R';

	        this.setOwnProperties({
	            whichSide: whichSide,
	            bodyTableView: options.bodyTableView,
	            focusModel: focusModel,
	            renderModel: renderModel,
	            selectionModel: selectionModel,
	            coordRowModel: coordRowModel,
	            dataModel: options.dataModel,
	            columnModel: options.columnModel,
	            collection: renderModel.getCollection(whichSide),
	            painterManager: options.painterManager,
	            sortOptions: null,
	            renderedRowKeys: null
	        });

	        this.listenTo(this.collection, 'change', this._onModelChange)
	            .listenTo(this.collection, 'restore', this._onModelRestore)
	            .listenTo(focusModel, 'change:rowKey', this._refreshFocusedRow)
	            .listenTo(renderModel, 'rowListChanged', this.render);

	        if (this.whichSide === frameConst.L) {
	            this.listenTo(focusModel, 'change:rowKey', this._refreshSelectedMetaColumns)
	                .listenTo(selectionModel, 'change:range', this._refreshSelectedMetaColumns)
	                .listenTo(renderModel, 'rowListChanged', this._refreshSelectedMetaColumns);
	        }
	    },

	    /**
	     * Returns the list of column models in it's own side
	     * @returns {Array} - Column model list
	     */
	    _getColumnModelList: function() {
	        return this.columnModel.getVisibleColumnModelList(this.whichSide, true);
	    },

	    /**
	     * 기존에 생성되어 있던 TR요소들 중 새로 렌더링할 데이터와 중복되지 않은 목록의 TR요소만 삭제한다.
	     * @param {array} dupRowKeys 중복된 데이터의 rowKey 목록
	     */
	    _removeOldRows: function(dupRowKeys) {
	        var firstIdx = _.indexOf(this.renderedRowKeys, dupRowKeys[0]);
	        var lastIdx = _.indexOf(this.renderedRowKeys, _.last(dupRowKeys));
	        var $rows = this.$el.children('tr');

	        $rows.slice(0, firstIdx).remove();
	        $rows.slice(lastIdx + 1).remove();
	    },

	    /**
	     * 기존의 렌더링된 데이터와 중복되지 않은 목록에 대해서만 TR요소를 추가한다.
	     * @param {array} rowKeys 렌더링할 데이터의 rowKey 목록
	     * @param {array} dupRowKeys 중복된 데이터의 rowKey 목록
	     */
	    _appendNewRows: function(rowKeys, dupRowKeys) {
	        var beforeRows = this.collection.slice(0, _.indexOf(rowKeys, dupRowKeys[0])),
	            afterRows = this.collection.slice(_.indexOf(rowKeys, _.last(dupRowKeys)) + 1);

	        this.$el.prepend(this._getRowsHtml(beforeRows));
	        this.$el.append(this._getRowsHtml(afterRows));
	    },

	    /**
	     * Redraw all rows.
	     * @private
	     */
	    _resetRows: function() {
	        var html = this._getRowsHtml(this.collection.models),
	            $tbody;

	        if (RowList.isInnerHtmlOfTbodyReadOnly) {
	            $tbody = this.bodyTableView.redrawTable(html);
	            this.setElement($tbody, false); // table이 다시 생성되었기 때문에 tbody의 참조를 갱신해준다.
	        } else {
	            // As using a compatibility mode in IE makes it hard to detect the actual version of the browser,
	            // use try/catch block to make in correct.
	            try {
	                this.$el[0].innerHTML = html;
	            } catch (e) {
	                RowList.isInnerHtmlOfTbodyReadOnly = true;
	                this._resetRows();
	            }
	        }
	    },

	    /**
	     * 행데이터 목록을 받아, HTML 문자열을 생성해서 반환한다.
	     * @param {Model.Row[]} rows - 행데이터 목록
	     * @returns {string} 생성된 HTML 문자열
	     */
	    _getRowsHtml: function(rows) {
	        var rowPainter = this.painterManager.getRowPainter(),
	            columnNames = _.pluck(this._getColumnModelList(), 'columnName');

	        return _.map(rows, function(row) {
	            return rowPainter.generateHtml(row, columnNames);
	        }).join('');
	    },

	    /**
	     * Returns a TR element of given rowKey
	     * @param {(string|number)} rowKey - rowKey
	     * @returns {jquery}
	     * @private
	     */
	    _getRowElement: function(rowKey) {
	        return this.$el.find('tr[' + attrNameConst.ROW_KEY + '=' + rowKey + ']');
	    },

	    /**
	     * Refreshes 'selected' class of meta columns.
	     * @private
	     */
	    _refreshSelectedMetaColumns: function() {
	        var $rows = this.$el.find('tr');
	        var metaSelector = '.' + classNameConst.CELL_HEAD;
	        var $filteredRows;

	        if (this.selectionModel.hasSelection()) {
	            $filteredRows = this._filterRowsByIndexRange($rows, this.selectionModel.get('range').row);
	        } else {
	            $filteredRows = this._filterRowByKey($rows, this.focusModel.get('rowKey'));
	        }

	        $rows.find(metaSelector).removeClass(classNameConst.CELL_SELECTED);
	        $filteredRows.find(metaSelector).addClass(classNameConst.CELL_SELECTED);
	    },

	    /**
	     * Filters the rows by given range(index) and returns them.
	     * @param {jQuery} $rows - rows (tr elements)
	     * @param {Array.<Number>} rowRange - [startIndex, endIndex]
	     * @returns {jQuery}
	     * @private
	     */
	    _filterRowsByIndexRange: function($rows, rowRange) {
	        var renderModel = this.renderModel,
	            renderStartIndex = renderModel.get('startIndex'),
	            startIndex, endIndex;

	        startIndex = Math.max(rowRange[0] - renderStartIndex, 0);
	        endIndex = Math.max(rowRange[1] - renderStartIndex + 1, 0); // add 1 for exclusive value

	        if (!startIndex && !endIndex) {
	            return $();
	        }
	        return $rows.slice(startIndex, endIndex);
	    },

	    /**
	     * Filters the row by given rowKey
	     * @param {jQuery} $rows - rows (tr elements)
	     * @param {Number} rowKey - rowKey
	     * @returns {jQuery}
	     * @private
	     */
	    _filterRowByKey: function($rows, rowKey) {
	        var rowIndex = this.dataModel.indexOfRowKey(rowKey),
	            renderStartIndex = this.renderModel.get('startIndex');

	        if (renderStartIndex > rowIndex) {
	            return $();
	        }
	        return $rows.eq(rowIndex - renderStartIndex);
	    },

	    /**
	     * Removes the CURRENT_ROW class from the cells in the previously focused row and
	     * adds it to the cells in the currently focused row.
	     * @private
	     */
	    _refreshFocusedRow: function() {
	        var rowKey = this.focusModel.get('rowKey');
	        var prevRowKey = this.focusModel.get('prevRowKey');

	        this._setFocusedRowClass(prevRowKey, false);
	        this._setFocusedRowClass(rowKey, true);
	    },

	    /**
	     * Finds all cells in the row indentified by given rowKey and toggles the CURRENT_ROW on them.
	     * @param {Number|String} rowKey - rowKey
	     * @param {Boolean} focused - if set to true, the class will be added, otherwise be removed.
	     * @private
	     */
	    _setFocusedRowClass: function(rowKey, focused) {
	        var columnNames = _.pluck(this._getColumnModelList(), 'columnName');
	        var trMap = {};

	        _.each(columnNames, function(columnName) {
	            var mainRowKey = this.dataModel.getMainRowKey(rowKey, columnName),
	                $td;

	            if (!trMap[mainRowKey]) {
	                trMap[mainRowKey] = this._getRowElement(mainRowKey);
	            }
	            $td = trMap[mainRowKey].find('td[' + attrNameConst.COLUMN_NAME + '="' + columnName + '"]');
	            $td.toggleClass(classNameConst.CELL_CURRENT_ROW, focused);
	        }, this);
	    },

	    /**
	     * Renders.
	     * @param {boolean} dataListChanged - 데이터 목록이 변경된 경우(add, remove..) true, 아니면(스크롤 변경 등) false
	     * @returns {View.RowList} this 객체
	     */
	    render: function(dataListChanged) {
	        var rowKeys = this.collection.pluck('rowKey');
	        var dupRowKeys;

	        this.bodyTableView.resetTablePosition();

	        if (dataListChanged) {
	            this._resetRows();
	        } else {
	            dupRowKeys = _.intersection(rowKeys, this.renderedRowKeys);
	            if (_.isEmpty(rowKeys) || _.isEmpty(dupRowKeys) ||
	                // 중복된 데이터가 70% 미만일 경우에는 성능을 위해 innerHTML을 사용.
	                (dupRowKeys.length / rowKeys.length < 0.7)) { // eslint-disable-line no-magic-numbers
	                this._resetRows();
	            } else {
	                this._removeOldRows(dupRowKeys);
	                this._appendNewRows(rowKeys, dupRowKeys);
	            }
	        }
	        this.renderedRowKeys = rowKeys;

	        return this;
	    },

	    /**
	     * modelChange 이벤트 발생시 실행되는 핸들러 함수.
	     * @param {Model.Row} model Row 모델 객체
	     * @private
	     */
	    _onModelChange: function(model) {
	        var rowKey = model.get('rowKey');
	        var $tr = this._getRowElement(rowKey);

	        if ('height' in model.changed) {
	            $tr.css('height', model.get('height') + CELL_BORDER_WIDTH);
	        } else {
	            this.painterManager.getRowPainter().refresh(model.changed, $tr);
	            this.coordRowModel.syncWithDom();
	        }
	    },

	    /**
	     * Event handler for 'restore' event on module:model/row
	     * @param {Object} cellData - CellData
	     * @private
	     */
	    _onModelRestore: function(cellData) {
	        var $td = this.dataModel.getElement(cellData.rowKey, cellData.columnName);
	        var editType = this.columnModel.getEditType(cellData.columnName);

	        this.painterManager.getCellPainter(editType).refresh(cellData, $td);
	        this.coordRowModel.syncWithDom();
	    }
	}, {
	    /**
	     * Whether the innerHTML property of a tbody element is readonly.
	     * @memberof RowList
	     * @static
	     */
	    isInnerHtmlOfTbodyReadOnly: (tui.util.browser.msie &&
	        tui.util.browser.version <= 9) // eslint-disable-line no-magic-numbers
	});

	module.exports = RowList;


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Class for the selection layer
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var View = __webpack_require__(2);
	var classNameConst = __webpack_require__(15);
	var CELL_BORDER_WIDTH = __webpack_require__(10).dimension.CELL_BORDER_WIDTH;
	var frameConst = __webpack_require__(10).frame;

	/**
	 * Class for the selection layer
	 * @module view/selectionLayer
	 * @extends module:base/view
	 * @param {object} options Options
	 * @param {array} options.columnWidthList  selection 레이어에 해당하는 영역의 컬럼 너비 리스트 정보
	 * @ignore
	 */
	var SelectionLayer = View.extend(/**@lends module:view/selectionLayer.prototype */{
	    initialize: function(options) {
	        this.setOwnProperties({
	            whichSide: options.whichSide || frameConst.R,
	            dimensionModel: options.dimensionModel,
	            coordRowModel: options.coordRowModel,
	            coordColumnModel: options.coordColumnModel,
	            columnModel: options.columnModel,
	            selectionModel: options.selectionModel
	        });
	        this._updateColumnWidthList();

	        this.listenTo(this.coordColumnModel, 'columnWidthChanged', this._onChangeColumnWidth);
	        this.listenTo(this.selectionModel, 'change:range', this.render);
	    },

	    className: classNameConst.LAYER_SELECTION,

	    /**
	     * Updates this.columnWidthList
	     * @private
	     */
	    _updateColumnWidthList: function() {
	        this.columnWidthList = this.coordColumnModel.getColumnWidthList(this.whichSide);
	    },

	    /**
	     * Event handler for 'columnWidthChanged' evnet on Dimension model.
	     * @private
	     */
	    _onChangeColumnWidth: function() {
	        this._updateColumnWidthList();
	        this.render();
	    },

	    /**
	     * Returns relative column range based on 'this.whichSide'
	     * @private
	     * @param {array} columnRange - Column range indexes. [start, end]
	     * @returns {array} - Relative column range indexes. [start, end]
	     */
	    _getOwnSideColumnRange: function(columnRange) {
	        var columnFixCount = this.columnModel.getVisibleColumnFixCount();
	        var ownColumnRange = null;

	        if (this.whichSide === frameConst.L) {
	            if (columnRange[0] < columnFixCount) {
	                ownColumnRange = [
	                    columnRange[0],
	                    Math.min(columnRange[1], columnFixCount - 1)
	                ];
	            }
	        } else if (columnRange[1] >= columnFixCount) {
	            ownColumnRange = [
	                Math.max(columnRange[0], columnFixCount) - columnFixCount,
	                columnRange[1] - columnFixCount
	            ];
	        }

	        return ownColumnRange;
	    },

	    /**
	     * Returns the object containing 'top' and 'height' css value.
	     * @private
	     * @param  {array} rowRange - Row range indexes. [start, end]
	     * @returns {{top: string, height: string}} - css values
	     */
	    _getVerticalStyles: function(rowRange) {
	        var coordRowModel = this.coordRowModel;
	        var top = coordRowModel.getOffsetAt(rowRange[0]);
	        var bottom = coordRowModel.getOffsetAt(rowRange[1]) + coordRowModel.getHeightAt(rowRange[1]);

	        return {
	            top: top + 'px',
	            height: (bottom - top) + 'px'
	        };
	    },

	    /**
	     * Returns the object containing 'left' and 'width' css value.
	     * @private
	     * @param  {array} columnRange - Column range indexes. [start, end]
	     * @returns {{left: string, width: string}} - css values
	     */
	    _getHorizontalStyles: function(columnRange) {
	        var columnWidthList = this.columnWidthList;
	        var metaColumnCount = this.columnModel.getVisibleMetaColumnCount();
	        var startIndex = columnRange[0];
	        var endIndex = columnRange[1];
	        var left = 0;
	        var width = 0;
	        var i = 0;

	        if (this.whichSide === frameConst.L) {
	            startIndex += metaColumnCount;
	            endIndex += metaColumnCount;
	        }
	        endIndex = Math.min(endIndex, columnWidthList.length - 1);

	        for (; i <= endIndex; i += 1) {
	            if (i < startIndex) {
	                left += columnWidthList[i] + CELL_BORDER_WIDTH;
	            } else {
	                width += columnWidthList[i] + CELL_BORDER_WIDTH;
	            }
	        }
	        width -= CELL_BORDER_WIDTH; // subtract last border width

	        return {
	            left: left + 'px',
	            width: width + 'px'
	        };
	    },

	    /**
	     * Render.
	     * @returns {SelectionLayer} this object
	     */
	    render: function() {
	        var range = this.selectionModel.get('range');
	        var styles, columnRange;

	        if (range) {
	            columnRange = this._getOwnSideColumnRange(range.column);
	        }
	        if (columnRange) {
	            styles = _.assign({},
	                this._getVerticalStyles(range.row),
	                this._getHorizontalStyles(columnRange)
	            );
	            this.$el.show().css(styles);
	        } else {
	            this.$el.hide();
	        }

	        return this;
	    }
	});

	module.exports = SelectionLayer;


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Layer class that represents the state of rendering phase
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var View = __webpack_require__(2);
	var CELL_BORDER_WIDTH = __webpack_require__(10).dimension.CELL_BORDER_WIDTH;
	var attrNameConst = __webpack_require__(10).attrName;
	var classNameConst = __webpack_require__(15);

	/**
	 * Layer class that represents the state of rendering phase.
	 * @module view/editingLayer
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	var EditingLayer = View.extend(/**@lends module:view/editingLayer.prototype */{
	    initialize: function(options) {
	        this.renderModel = options.renderModel;
	        this.domState = options.domState;
	        this.inputPainters = options.inputPainters;

	        this.listenTo(this.renderModel, 'editingStateChanged', this._onEditingStateChanged);
	    },

	    className: classNameConst.LAYER_EDITING + ' ' + classNameConst.CELL_CONTENT,

	    /**
	     * Starts editing the given cell.
	     * @param {Object} cellData - cell data
	     * @private
	     */
	    _startEditing: function(cellData) {
	        var rowKey = cellData.rowKey;
	        var columnName = cellData.columnName;
	        var editType = tui.util.pick(cellData, 'columnModel', 'editOption', 'type');
	        var styleMap = this._calculateLayoutStyle(rowKey, columnName, this._isWidthExpandable(editType));
	        var painter = this.inputPainters[editType];

	        this.$el.html(painter.generateHtml(cellData))
	            .attr(attrNameConst.ROW_KEY, rowKey)
	            .attr(attrNameConst.COLUMN_NAME, columnName)
	            .css(styleMap).show();

	        this._adjustLeftPosition();
	        painter.focus(this.$el);
	    },

	    /**
	     * Returns whether the width is expandable.
	     * @param {String} editType - edit type
	     * @returns {Boolean}
	     * @private
	     */
	    _isWidthExpandable: function(editType) {
	        return _.contains(['checkbox', 'radio'], editType);
	    },

	    /**
	     * Fisishes editing the current cell.
	     * @private
	     */
	    _finishEditing: function() {
	        this.$el.removeAttr(attrNameConst.ROW_KEY);
	        this.$el.removeAttr(attrNameConst.COLUMN_NAME);
	        this.$el.empty().hide();
	    },

	    /**
	     * Adjust the left position of the layer not to lay beyond the boundary of the grid.
	     * @private
	     */
	    _adjustLeftPosition: function() {
	        var gridWidth = this.domState.getWidth();
	        var layerWidth = this.$el.outerWidth();
	        var layerLeftPos = this.$el.position().left;

	        if (layerLeftPos + layerWidth > gridWidth) {
	            this.$el.css('left', gridWidth - layerWidth);
	        }
	    },

	    /**
	     * Adjust offset value of TD, because it varies from browsers to browsers when borders are callapsed.
	     * @param {Number} offsetValue - offset value (offset.top or offset.left)
	     * @returns {Number}
	     * @private
	     */
	    _adjustCellOffsetValue: function(offsetValue) {
	        var browser = tui.util.browser;
	        var result = offsetValue;

	        if (browser.msie) {
	            if (browser.version === 9) {
	                result = offsetValue - 1;
	            } else if (browser.version > 9) {
	                result = Math.floor(offsetValue);
	            }
	        }

	        return result;
	    },

	    /**
	     * Calculates the position and the dimension of the layer and returns the object that contains css properties.
	     * @param {Stirng} rowKey - row key
	     * @param {String} columnName - column name
	     * @param {Boolean} expandable - true if the width of layer is expandable
	     * @returns {Object}
	     * @private
	     */
	    _calculateLayoutStyle: function(rowKey, columnName, expandable) {
	        var wrapperOffset = this.domState.getOffset();
	        var $cell = this.domState.getElement(rowKey, columnName);
	        var cellOffset = $cell.offset();
	        var cellHeight = $cell.outerHeight() + CELL_BORDER_WIDTH;
	        var cellWidth = $cell.outerWidth() + CELL_BORDER_WIDTH;

	        return {
	            top: this._adjustCellOffsetValue(cellOffset.top) - wrapperOffset.top,
	            left: this._adjustCellOffsetValue(cellOffset.left) - wrapperOffset.left,
	            height: cellHeight,
	            minWidth: expandable ? cellWidth : '',
	            width: expandable ? '' : cellWidth,
	            lineHeight: cellHeight + 'px'
	        };
	    },

	    /**
	     * Event handler for 'editingStateChanged' event on the render model.
	     * @param {Object} cellData - cell data
	     * @private
	     */
	    _onEditingStateChanged: function(cellData) {
	        if (cellData.isEditing) {
	            this._startEditing(cellData);
	        } else {
	            this._finishEditing();
	        }
	    },

	    /**
	     * Render
	     * @returns {Object} this instance
	     */
	    render: function() {
	        _.each(this.inputPainters, function(painter) {
	            painter.attachEventHandlers(this.$el, '');
	        }, this);

	        return this;
	    }
	});


	module.exports = EditingLayer;


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Layer View class which contains the 'tui-component-date-picker'
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var View = __webpack_require__(2);
	var classNameConst = __webpack_require__(15);
	var DEFAULT_DATE_FORMAT = 'yyyy-mm-dd';
	var DatePickerLayer;

	/**
	 * Returns a HTML string of a span element to represent an arrow-icon
	 * @param {String} dirClassName - className to indicate direction of the arrow
	 * @returns {String}
	 * @ignore
	 */
	function arrowHTML(dirClassName) {
	    var classNameStr = classNameConst.ICO_ARROW + ' ' + dirClassName;

	    return '<span class="' + classNameStr + '"></span>';
	}

	/**
	 * Layer View class which contains the 'tui-component-date-picker'
	 * @module view/datePickerLayer
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	DatePickerLayer = View.extend(/**@lends module:view/datePickerLayer.prototype */{
	    initialize: function(options) {
	        this.textPainter = options.textPainter;
	        this.columnModel = options.columnModel;
	        this.domState = options.domState;
	        this.calendar = this._createCalendar();
	        this.datePicker = this._createDatePicker();

	        this._customizeCalendarBtns();

	        this.listenTo(this.textPainter, 'focusIn', this._onFocusInTextInput);
	        this.listenTo(this.textPainter, 'focusOut', this._onFocusOutTextInput);
	    },

	    className: classNameConst.LAYER_DATE_PICKER,

	    /**
	     * Creates an instance of 'tui-component-calendar'
	     * @returns {tui.component.Calendar}
	     * @private
	     */
	    _createCalendar: function() {
	        var $calendarEl = $('<div>').addClass(classNameConst.CALENDAR);

	        // prevent blur event from occuring in the input element
	        $calendarEl.mousedown(function(ev) {
	            ev.preventDefault();
	            ev.target.unselectable = true;  // trick for IE8
	            return false;
	        });

	        return new tui.component.Calendar({
	            element: $calendarEl,
	            classPrefix: classNameConst.CALENDAR + '-'
	        });
	    },

	    /**
	     * Customize the buttons of the calendar.
	     * @private
	     */
	    _customizeCalendarBtns: function() {
	        var $header = this.calendar.$header;
	        var leftArrowHTML = arrowHTML(classNameConst.ICO_ARROW_LEFT);
	        var rightArrowHTML = arrowHTML(classNameConst.ICO_ARROW_RIGHT);

	        $header.find('.' + classNameConst.CALENDAR_BTN_PREV_YEAR).html(leftArrowHTML + leftArrowHTML);
	        $header.find('.' + classNameConst.CALENDAR_BTN_NEXT_YEAR).html(rightArrowHTML + rightArrowHTML);
	        $header.find('.' + classNameConst.CALENDAR_BTN_PREV_MONTH).html(leftArrowHTML);
	        $header.find('.' + classNameConst.CALENDAR_BTN_NEXT_MONTH).html(rightArrowHTML);
	    },

	    /**
	     * Creates an instance of 'tui-component-date-picker'
	     * @returns {tui.component.DatePicker}
	     * @private
	     */
	    _createDatePicker: function() {
	        var datePicker = new tui.component.DatePicker({
	            parentElement: this.$el,
	            enableSetDateByEnterKey: false,
	            selectableClassName: classNameConst.CALENDAR_SELECTABLE,
	            selectedClassName: classNameConst.CALENDAR_SELECTED,
	            pos: {
	                top: 0,
	                left: 0
	            }
	        }, this.calendar);

	        datePicker.on('update', function() {
	            datePicker.close();
	        });

	        return datePicker;
	    },

	    /**
	     * Creates date object for now
	     * @returns {{year: Number, month: Number, date: Number}}
	     * @private
	     */
	    _createDateForNow: function() {
	        var now = new Date();

	        return {
	            year: now.getFullYear(),
	            month: now.getMonth() + 1,
	            date: now.getDate()
	        };
	    },

	    /**
	     * Resets date picker options
	     * @param {Object} options - datePicker options
	     * @param {jQuery} $input - target input element
	     * @private
	     */
	    _resetDatePicker: function(options, $input) {
	        var datePicker = this.datePicker;
	        var date = options.date || this._createDateForNow();

	        datePicker.setDateForm(options.dateForm || DEFAULT_DATE_FORMAT);
	        datePicker.setRanges(options.selectableRanges || []);
	        datePicker.setDate(date.year, date.month, date.date);
	        datePicker.setElement($input);
	    },

	    /**
	     * Calculates the position of the layer and returns the object that contains css properties.
	     * @param {jQuery} $input - input element
	     * @returns {Object}
	     * @private
	     */
	    _calculatePosition: function($input) {
	        var inputOffset = $input.offset();
	        var inputHeight = $input.outerHeight();
	        var wrapperOffset = this.domState.getOffset();

	        return {
	            top: inputOffset.top - wrapperOffset.top + inputHeight,
	            left: inputOffset.left - wrapperOffset.left
	        };
	    },

	    /**
	     * Event handler for 'focusIn' event of module:painter/input/text
	     * @param {jQuery} $input - target input element
	     * @param {{rowKey: String, columnName: String}} address - target cell address
	     * @private
	     */
	    _onFocusInTextInput: function($input, address) {
	        var columnName = address.columnName;
	        var component = this.columnModel.getColumnModel(columnName).component;
	        var editType = this.columnModel.getEditType(columnName);

	        if (editType === 'text' && component && component.name === 'datePicker') {
	            this.$el.css(this._calculatePosition($input)).show();
	            this._resetDatePicker(component.option || {}, $input);
	            this.datePicker.open();
	        }
	    },

	    /**
	     * Event handler for 'focusOut' event of module:painter/input/text
	     * @private
	     */
	    _onFocusOutTextInput: function() {
	        this.datePicker.close();
	        this.$el.hide();
	    },

	    /**
	     * Render
	     * @returns {Object} this object
	     */
	    render: function() {
	        this.$el.hide();
	        return this;
	    }
	});

	module.exports = DatePickerLayer;


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Class for the layer view that represents the currently focused cell
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var View = __webpack_require__(2);
	var constMap = __webpack_require__(10);
	var classNameConst = __webpack_require__(15);

	var frameConst = constMap.frame;
	var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;
	var HTML_BORDER_DIV = '<div class="' + classNameConst.LAYER_FOCUS_BORDER + '"></div>';

	/**
	 * Class for the layer view that represents the currently focused cell
	 * @module view/focusLayer
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	var FocusLayer = View.extend(/**@lends module:view/focusLayer.prototype */{
	    initialize: function(options) {
	        this.focusModel = options.focusModel;
	        this.columnModel = options.columnModel;
	        this.coordRowModel = options.coordRowModel;
	        this.coordColumnModel = options.coordColumnModel;
	        this.coordConverterModel = options.coordConverterModel;
	        this.whichSide = options.whichSide;

	        this.borderEl = {
	            $top: $(HTML_BORDER_DIV),
	            $left: $(HTML_BORDER_DIV),
	            $right: $(HTML_BORDER_DIV),
	            $bottom: $(HTML_BORDER_DIV)
	        };

	        this.listenTo(this.coordColumnModel, 'columnWidthChanged', this._refreshCurrentLayout);
	        this.listenTo(this.coordRowModel, 'reset', this._refreshCurrentLayout);
	        this.listenTo(this.focusModel, 'blur', this._onBlur);
	        this.listenTo(this.focusModel, 'focus', this._onFocus);
	    },

	    className: classNameConst.LAYER_FOCUS,

	    /**
	     * Refresh the layout of current layer
	     * @private
	     */
	    _refreshCurrentLayout: function() {
	        var focusModel = this.focusModel;

	        if (this.$el.css('display') !== 'none') {
	            this._refreshBorderLayout(focusModel.get('rowKey'), focusModel.get('columnName'));
	        }
	    },

	    /**
	     * Event handler for 'blur' event on the module:model/focus
	     * @private
	     */
	    _onBlur: function() {
	        this.$el.hide();
	    },

	    /**
	     * Event handler for 'focus' event on module:model/focus
	     * @param {Number} rowKey - target row key
	     * @param {String} columnName - target column name
	     * @private
	     */
	    _onFocus: function(rowKey, columnName) {
	        var targetSide = this.columnModel.isLside(columnName) ? frameConst.L : frameConst.R;

	        if (targetSide === this.whichSide) {
	            this._refreshBorderLayout(rowKey, columnName);
	            this.$el.show();
	        }
	    },

	    /**
	     * Resets the position and the dimension of the layer.
	     * @param {Number} rowKey - row key
	     * @param {String} columnName - column name
	     * @private
	     */
	    _refreshBorderLayout: function(rowKey, columnName) {
	        var pos = this.coordConverterModel.getCellPosition(rowKey, columnName);
	        var width = pos.right - pos.left;
	        var height = pos.bottom - pos.top;

	        this.borderEl.$left.css({
	            top: pos.top,
	            left: pos.left,
	            width: CELL_BORDER_WIDTH,
	            height: height + CELL_BORDER_WIDTH
	        });

	        this.borderEl.$top.css({
	            top: pos.top === 0 ? CELL_BORDER_WIDTH : pos.top,
	            left: pos.left,
	            width: width + CELL_BORDER_WIDTH,
	            height: CELL_BORDER_WIDTH
	        });

	        this.borderEl.$right.css({
	            top: pos.top,
	            left: pos.left + width,
	            width: CELL_BORDER_WIDTH,
	            height: height + CELL_BORDER_WIDTH
	        });

	        this.borderEl.$bottom.css({
	            top: pos.top + height,
	            left: pos.left,
	            width: width + CELL_BORDER_WIDTH,
	            height: CELL_BORDER_WIDTH
	        });
	    },

	    /**
	     * Render
	     * @returns {Object} this instance
	     */
	    render: function() {
	        var $el = this.$el;

	        _.each(this.borderEl, function($border) {
	            $el.append($border);
	        });
	        $el.hide();

	        return this;
	    }
	});

	module.exports = FocusLayer;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview This class offers methods that can be used to get the current state of DOM element.
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var attrNameConst = __webpack_require__(10).attrName;
	var classNameConst = __webpack_require__(15);

	/**
	 * Class for offering methods that can be used to get the current state of DOM element.
	 * @module domState
	 * @param {jQuery} $el - jQuery object of the container element.
	 * @ignore
	 */
	var DomState = tui.util.defineClass(/**@lends module:domState.prototype */{
	    init: function($el) {
	        this.$el = $el;
	    },

	    /**
	     * Returns a jquery object contains the tr elements
	     * @param {string} frameClassName - class name of frame
	     * @returns {jQuery}
	     * @private
	     */
	    _getBodyTableRows: function(frameClassName) {
	        return this.$el.find('.' + frameClassName)
	            .find('.' + classNameConst.BODY_TABLE_CONTAINER).find('tr[' + attrNameConst.ROW_KEY + ']');
	    },

	    /**
	     * Returns max height of cells in the given row.
	     * @param {jQuery} $row - traget row
	     * @returns {number}
	     * @private
	     */
	    _getMaxCellHeight: function($row) {
	        var heights = $row.find('.' + classNameConst.CELL_CONTENT).map(function() {
	            return this.scrollHeight;
	        }).get();

	        return _.max(heights);
	    },

	    /**
	     * Returns an element of the table-cell identified by rowKey and columnName
	     * @param {(Number|String)} rowKey - Row key
	     * @param {String} columnName - Column name
	     * @returns {jQuery} Cell(TD) element
	     */
	    getElement: function(rowKey, columnName) {
	        return this.$el.find('tr[' + attrNameConst.ROW_KEY + '=' + rowKey + ']')
	            .find('td[' + attrNameConst.COLUMN_NAME + '="' + columnName + '"]');
	    },

	    /**
	     * Returns an array of heights of all rows
	     * @returns {Array.<number>}
	     */
	    getRowHeights: function() {
	        var $lsideRows = this._getBodyTableRows(classNameConst.LSIDE_AREA);
	        var $rsideRows = this._getBodyTableRows(classNameConst.RSIDE_AREA);
	        var lsideHeight, rsideHeight;
	        var heights = [];
	        var i, len;

	        for (i = 0, len = $lsideRows.length; i < len; i += 1) {
	            lsideHeight = this._getMaxCellHeight($lsideRows.eq(i));
	            rsideHeight = this._getMaxCellHeight($rsideRows.eq(i));
	            heights[i] = Math.max(lsideHeight, rsideHeight) + 1;
	        }

	        return heights;
	    },

	    /**
	     * Returns the offset of the container element
	     * @returns {{top: Number, left: Number}} Offset object
	     */
	    getOffset: function() {
	        return this.$el.offset();
	    },

	    /**
	     * Returns the width of the container element
	     * @returns {Number} Width of the container element
	     */
	    getWidth: function() {
	        return this.$el.width();
	    },

	    /**
	     * Returns the height of the parent of container element.
	     * @returns {Number} Height of the parent of container element
	     */
	    getParentHeight: function() {
	        return this.$el.parent().height();
	    },

	    /**
	     * Returns whether there's child element having focus.
	     * @returns {boolean} True if there's child element having focus
	     */
	    hasFocusedElement: function() {
	        return !!this.$el.find(':focus').length;
	    }
	});

	module.exports = DomState;


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Public Event Emitter
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);
	var Backbone = __webpack_require__(3);

	/**
	 * Class that listens public events (for external user) to the other object and
	 * triggers them on the public object(module:grid).
	 * @module publicEventEmitter
	 * @param {Object} publicObject - Object on which event will be triggered.
	 *            This object should have methods of Backbone.Events.
	 * @ignore
	 */
	var PublicEventEmitter = tui.util.defineClass(/**@lends module:publicEventEmitter.prototype */{
	    init: function(publicObject) {
	        this.publicObject = publicObject;
	    },

	    /**
	     * Listen and trigger specified events with same event name.
	     * @param {Object} target - Target object
	     * @param {String[]} eventNames - An array of the event names
	     * @private
	     */
	    _listenForThrough: function(target, eventNames) {
	        _.each(eventNames, function(eventName) {
	            this.listenTo(target, eventName, _.bind(this._triggerOnPublic, this, eventName));
	        }, this);
	    },

	    /**
	     * Listen specified event and rename it to public name and trigger it.
	     * @param  {Object} target - Target object
	     * @param  {String} eventName - Event name
	     * @param  {String} publicEventName - New event name for public use
	     * @private
	     */
	    _listenForRename: function(target, eventName, publicEventName) {
	        this.listenTo(target, eventName, _.bind(this._triggerOnPublic, this, publicEventName));
	    },

	    /**
	     * Trigger specified event on the public object.
	     * @param  {String} eventName - Event name
	     * @param  {Object} eventData - Event data
	     * @private
	     */
	    _triggerOnPublic: function(eventName, eventData) {
	        this.publicObject.trigger(eventName, eventData);
	    },

	    /**
	     * Listen to Net addon.
	     * @param {module:addon/net} net - Net addon object
	     */
	    listenToNetAddon: function(net) {
	        this._listenForThrough(net, [
	            'beforeRequest',
	            'response',
	            'successResponse',
	            'failResponse',
	            'errorResponse'
	        ]);
	    },

	    /**
	     * Listen to Conatiner view.
	     * @param  {module:view/container} container - Container view object
	     */
	    listenToContainerView: function(container) {
	        this._listenForThrough(container, [
	            'click',
	            'dblclick',
	            'mousedown',
	            'clickCell',
	            'dblclickCell',
	            'mouseoverCell',
	            'mouseoutCell',
	            'rendered'
	        ]);
	    },

	    /**
	     * Listen to Focus model
	     * @param  {module:model/focus} focusModel - Focus model
	     */
	    listenToFocusModel: function(focusModel) {
	        this._listenForRename(focusModel, 'select', 'selectRow');
	    }
	});

	_.extend(PublicEventEmitter.prototype, Backbone.Events);

	module.exports = PublicEventEmitter;


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Painter Manager
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var RowPainter = __webpack_require__(53);
	var CellPainter = __webpack_require__(55);
	var DummyCellPainter = __webpack_require__(56);
	var TextPainter = __webpack_require__(57);
	var SelectPainter = __webpack_require__(59);
	var ButtonPainter = __webpack_require__(60);
	var MainButtonPainter = __webpack_require__(61);

	/**
	 * Painter manager
	 * @module painter/manager
	 * @param {Object} options - Options
	 * @ignore
	 */
	var PainterManager = tui.util.defineClass(/**@lends module:painter/manager.prototype */{
	    init: function(options) {
	        this.gridId = options.gridId;
	        this.selectType = options.selectType;
	        this.isFixedRowHeight = options.isFixedRowHeight;

	        this.inputPainters = this._createInputPainters(options.controller);
	        this.cellPainters = this._createCellPainters(options.controller);
	        this.rowPainter = this._createRowPainter();
	    },

	    /**
	     * Creates instances of input painters and returns the object that stores them
	     * using 'inputType' as keys.
	     * @param {module:painter/controller} controller - painter controller
	     * @returns {Object}
	     * @private
	     */
	    _createInputPainters: function(controller) {
	        return {
	            text: new TextPainter({
	                controller: controller,
	                inputType: 'text'
	            }),
	            password: new TextPainter({
	                controller: controller,
	                inputType: 'password'
	            }),
	            checkbox: new ButtonPainter({
	                controller: controller,
	                inputType: 'checkbox'
	            }),
	            radio: new ButtonPainter({
	                controller: controller,
	                inputType: 'radio'
	            }),
	            select: new SelectPainter({
	                controller: controller
	            }),
	            mainButton: new MainButtonPainter({
	                controller: controller,
	                inputType: this.selectType,
	                gridId: this.gridId
	            })
	        };
	    },

	    /**
	     * Creates instances of cell painters and returns the object that stores them
	     * using 'editType' as keys.
	     * @param {module:painter/controller} controller - painter controller
	     * @returns {Object} Key-value object
	     * @private
	     */
	    _createCellPainters: function(controller) {
	        var cellPainters = {
	            dummy: new DummyCellPainter({
	                controller: controller
	            }),
	            normal: new CellPainter({
	                controller: controller,
	                isFixedRowHeight: this.isFixedRowHeight,
	                editType: 'normal'
	            })
	        };

	        _.each(this.inputPainters, function(inputPainter, editType) {
	            cellPainters[editType] = new CellPainter({
	                editType: editType,
	                controller: controller,
	                isFixedRowHeight: this.isFixedRowHeight,
	                inputPainter: inputPainter
	            });
	        }, this);

	        return cellPainters;
	    },

	    /**
	     * Creates row painter and returns it.
	     * @returns {module:painter/row} New row painter instance
	     * @private
	     */
	    _createRowPainter: function() {
	        return new RowPainter({
	            painterManager: this
	        });
	    },

	    /**
	     * Returns an instance of cell painter which has given editType
	     * @param {String} editType - Edit type
	     * @returns {Object} - Cell painter instance
	     */
	    getCellPainter: function(editType) {
	        return this.cellPainters[editType];
	    },

	    /**
	     * Returns all cell painters
	     * @returns {Object} Object that has edit-type as a key and cell painter as a value
	     */
	    getCellPainters: function() {
	        return this.cellPainters;
	    },

	    /**
	     * Returns all input painters
	     * @param {Boolean} withoutMeta - if set to true, returns without meta cell painters
	     * @returns {Object} Object that has edit-type as a key and input painter as a value
	     */
	    getInputPainters: function(withoutMeta) {
	        var result = this.inputPainters;
	        if (withoutMeta) {
	            result = _.omit(result, 'mainButton');
	        }

	        return result;
	    },

	    /**
	     * Returns a row painter
	     * @returns {module:painter/row} Row painter
	     */
	    getRowPainter: function() {
	        return this.rowPainter;
	    }
	});

	module.exports = PainterManager;


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Painter class for the row(TR) views
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var Painter = __webpack_require__(54);
	var constMap = __webpack_require__(10);
	var attrNameConst = constMap.attrName;
	var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;

	/**
	 * Painter class for the row(TR) views
	 * @module painter/row
	 * @extends module:base/painter
	 * @param {object} options - Options
	 * @ignore
	 */
	var RowPainter = tui.util.defineClass(Painter, /**@lends module:painter/row.prototype */{
	    init: function(options) {
	        Painter.apply(this, arguments);
	        this.painterManager = options.painterManager;
	    },

	    /**
	     * css selector to find its own element(s) from a parent element.
	     * @type {String}
	     */
	    selector: 'tr',

	    /**
	     * markup template
	     * @returns {String} HTML string
	     */
	    template: _.template(
	        '<tr ' +
	        '<%=rowKeyAttr%>" ' +
	        'class="<%=className%>" ' +
	        'style="height: <%=height%>px;">' +
	        '<%=contents%>' +
	        '</tr>'
	    ),

	    /**
	     * cellData 의 isEditable 프로퍼티에 따른 editType 을 반환한다.
	     * editable 프로퍼티가 false 라면 normal type 으로 설정한다.
	     * @param {string} columnName 컬럼명
	     * @param {Object} cellData 셀 데이터
	     * @returns {string} cellFactory 에서 사용될 editType
	     * @private
	     */
	    _getEditType: function(columnName, cellData) {
	        var editType = tui.util.pick(cellData.columnModel, 'editOption', 'type');

	        return editType || 'normal';
	    },

	    /**
	     * Returns the HTML string of all cells in Dummy row.
	     * @param {Number} rowNum - row number
	     * @param {Array.<String>} columnNames - An array of column names
	     * @returns {String} HTLM string
	     * @private
	     */
	    _generateHtmlForDummyRow: function(rowNum, columnNames) {
	        var cellPainter = this.painterManager.getCellPainter('dummy'),
	            html = '';

	        _.each(columnNames, function(columnName) {
	            html += cellPainter.generateHtml(rowNum, columnName);
	        });

	        return html;
	    },

	    /**
	     * Returns the HTML string of all cells in Actual row.
	     * @param  {module:model/row} model - View model instance
	     * @param  {Array.<String>} columnNames - An array of column names
	     * @returns {String} HTLM string
	     * @private
	     */
	    _generateHtmlForActualRow: function(model, columnNames) {
	        var html = '';

	        _.each(columnNames, function(columnName) {
	            var cellData = model.get(columnName),
	                editType, cellPainter;

	            if (cellData && cellData.isMainRow) {
	                editType = this._getEditType(columnName, cellData);
	                cellPainter = this.painterManager.getCellPainter(editType);
	                html += cellPainter.generateHtml(cellData);
	            }
	        }, this);

	        return html;
	    },

	    /**
	     * Returns the HTML string of all cells in the given model (row).
	     * @param  {module:model/row} model - View model instance
	     * @param  {Array.<String>} columnNames - An array of column names
	     * @returns {String} HTLM string
	     */
	    generateHtml: function(model, columnNames) {
	        var rowKey = model.get('rowKey');
	        var rowNum = model.get('rowNum');
	        var className = '';
	        var rowKeyAttr = '';
	        var html;

	        if (_.isUndefined(rowKey)) {
	            html = this._generateHtmlForDummyRow(rowNum, columnNames);
	        } else {
	            rowKeyAttr = attrNameConst.ROW_KEY + '="' + rowKey + '"';
	            html = this._generateHtmlForActualRow(model, columnNames);
	        }

	        return this.template({
	            rowKeyAttr: rowKeyAttr,
	            height: model.get('height') + CELL_BORDER_WIDTH,
	            contents: html,
	            className: className
	        });
	    },

	    /**
	     * Refreshes the row(TR) element.
	     * @param {object} changed - object that contains the changed data using columnName as keys
	     * @param {jQuery} $tr - jquery object for tr element
	     */
	    refresh: function(changed, $tr) {
	        _.each(changed, function(cellData, columnName) {
	            var editType, cellPainter, $td;

	            if (columnName !== '_extraData') {
	                $td = $tr.find('td[' + attrNameConst.COLUMN_NAME + '="' + columnName + '"]');
	                editType = this._getEditType(columnName, cellData);
	                cellPainter = this.painterManager.getCellPainter(editType);
	                cellPainter.refresh(cellData, $td);
	            }
	        }, this);
	    }
	});

	module.exports = RowPainter;


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Base class for Painters
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);
	var attrNameConst = __webpack_require__(10).attrName;

	/**
	 * Base class for Painters
	 * The Painter class is implentation of 'flyweight' pattern for the View class.
	 * This aims to act like a View class but doesn't create an instance of each view items
	 * to improve rendering performance.
	 * @module base/painter
	 * @param {Object} options - options
	 * @ignore
	 */
	var Painter = tui.util.defineClass(/**@lends module:base/painter.prototype */{
	    init: function(options) {
	        this.controller = options.controller;
	    },

	    /**
	     * key-value object contains event names as keys and handler names as values
	     * @type {Object}
	     */
	    events: {},

	    /**
	     * css selector to use delegated event handlers by '$.on()' method.
	     * @type {String}
	     */
	    selector: '',

	    /**
	     * Returns the cell address of the target element.
	     * @param {jQuery} $target - target element
	     * @returns {{rowKey: String, columnName: String}}
	     * @private
	     */
	    _getCellAddress: function($target) {
	        var $addressHolder = $target.closest('[' + attrNameConst.ROW_KEY + ']');

	        return {
	            rowKey: $addressHolder.attr(attrNameConst.ROW_KEY),
	            columnName: $addressHolder.attr(attrNameConst.COLUMN_NAME)
	        };
	    },

	    /**
	     * Attaches all event handlers to the $target element.
	     * @param {jquery} $target - target element
	     * @param {String} parentSelector - selector of a parent element
	     */
	    attachEventHandlers: function($target, parentSelector) {
	        _.each(this.events, function(methodName, eventName) {
	            var boundHandler = _.bind(this[methodName], this),
	                selector = parentSelector + ' ' + this.selector;

	            $target.on(eventName, selector, boundHandler);
	        }, this);
	    },

	    /**
	     * Generates a HTML string from given data, and returns it.
	     * @abstract
	     */
	    generateHtml: function() {
	        throw new Error('implement generateHtml() method');
	    }
	});

	module.exports = Painter;


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Painter class for cell(TD) views
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var Painter = __webpack_require__(54);
	var util = __webpack_require__(9);
	var attrNameConst = __webpack_require__(10).attrName;
	var classNameConst = __webpack_require__(15);

	/**
	 * Painter class for cell(TD) views
	 * @module painter/cell
	 * @extends module:base/painter
	 * @param {Object} options - options
	 * @ignore
	 */
	var Cell = tui.util.defineClass(Painter, /**@lends module:painter/cell.prototype */{
	    init: function(options) {
	        Painter.apply(this, arguments);

	        this.editType = options.editType;
	        this.isFixedRowHeight = options.isFixedRowHeight;
	        this.inputPainter = options.inputPainter;
	        this.selector = 'td[' + attrNameConst.EDIT_TYPE + '="' + this.editType + '"]';
	    },

	    /**
	     * key-value object contains event names as keys and handler names as values
	     * @type {Object}
	     */
	    events: {
	        dblclick: '_onDblClick'
	    },

	    /**
	     * template for TD
	     * @returns {string} template
	     */
	    template: _.template(
	        '<td <%=attributeString%> style="<%=style%>"><%=contentHtml%></td>'
	    ),

	    /**
	     * template for DIV (inner content of TD)
	     */
	    contentTemplate: _.template(
	        '<div class="<%=className%>" style="<%=style%>"><%=content%></div>'
	    ),

	    /**
	     * Event handler for 'dblclick' DOM event.
	     * @param {MouseEvent} event - mouse event object
	     */
	    _onDblClick: function(event) {
	        var address;

	        if (this._isEditableType()) {
	            address = this._getCellAddress($(event.target));
	            this.controller.startEditing(address, true);
	        }
	    },

	    /**
	     * Returns whether the instance is editable type.
	     * @returns {Boolean}
	     */
	    _isEditableType: function() {
	        return !_.contains(['normal', 'mainButton'], this.editType);
	    },

	    /**
	     * Returns css style string for given cellData
	     * @param {Object} cellData - cell data
	     * @returns {string}
	     */
	    _getContentStyle: function(cellData) {
	        var whiteSpace = cellData.columnModel.whiteSpace || 'nowrap';
	        var styles = [];

	        if (whiteSpace) {
	            styles.push('white-space:' + whiteSpace);
	        }
	        if (this.isFixedRowHeight) {
	            styles.push('max-height:' + cellData.height + 'px');
	        }

	        return styles.join(';');
	    },

	    /**
	     * Returns the HTML string of the contents containg the value of the 'beforeContent' and 'afterContent'.
	     * @param {Object} cellData - cell data
	     * @returns {String}
	     * @private
	     */
	    _getContentHtml: function(cellData) {
	        var content = cellData.formattedValue;
	        var beforeContent = cellData.beforeContent;
	        var afterContent = cellData.afterContent;
	        var fullContent;

	        if (this.inputPainter) {
	            content = this.inputPainter.generateHtml(cellData);

	            if (this._shouldContentBeWrapped() && !this._isUsingViewMode(cellData)) {
	                beforeContent = this._getSpanWrapContent(beforeContent, classNameConst.CELL_CONTENT_BEFORE);
	                afterContent = this._getSpanWrapContent(afterContent, classNameConst.CELL_CONTENT_AFTER);
	                content = this._getSpanWrapContent(content, classNameConst.CELL_CONTENT_INPUT);
	                // notice the order of concatenation
	                fullContent = beforeContent + afterContent + content;
	            }
	        }

	        if (!fullContent) {
	            fullContent = beforeContent + content + afterContent;
	        }

	        return this.contentTemplate({
	            content: fullContent,
	            className: classNameConst.CELL_CONTENT,
	            style: this._getContentStyle(cellData)
	        });
	    },

	    /**
	     * Returns whether the cell has view mode.
	     * @param {Object} cellData - cell data
	     * @returns {Boolean}
	     * @private
	     */
	    _isUsingViewMode: function(cellData) {
	        return tui.util.pick(cellData, 'columnModel', 'editOption', 'useViewMode') !== false;
	    },

	    /**
	     * Returns whether the contents should be wrapped with span tags to display them correctly.
	     * @returns {Boolean}
	     * @private
	     */
	    _shouldContentBeWrapped: function() {
	        return _.contains(['text', 'password', 'select'], this.editType);
	    },

	    /**
	     * 주어진 문자열을 span 태그로 감싼 HTML 코드를 반환한다.
	     * @param {string} content - 감싸질 문자열
	     * @param {string} className - span 태그의 클래스명
	     * @returns {string} span 태그로 감싼 HTML 코드
	     * @private
	     */
	    _getSpanWrapContent: function(content, className) {
	        if (tui.util.isFalsy(content)) {
	            content = '';
	        }

	        return '<span class="' + className + '">' + content + '</span>';
	    },

	    /**
	     * Returns the object contains attributes of a TD element.
	     * @param {Object} cellData - cell data
	     * @returns {Object}
	     * @private
	     */
	    _getAttributes: function(cellData) {
	        var classNames = [
	            cellData.className,
	            classNameConst.CELL,
	            (cellData.rowNum % 2) ? classNameConst.CELL_ROW_ODD : classNameConst.CELL_ROW_EVEN
	        ];
	        var attrs = {
	            'align': cellData.columnModel.align || 'left'
	        };
	        attrs['class'] = classNames.join(' ');

	        attrs[attrNameConst.EDIT_TYPE] = this.editType;
	        attrs[attrNameConst.ROW_KEY] = cellData.rowKey;
	        attrs[attrNameConst.COLUMN_NAME] = cellData.columnName;
	        if (cellData.rowSpan) {
	            attrs.rowspan = cellData.rowSpan;
	        }

	        return attrs;
	    },

	    /**
	     * Attaches all event handlers to the $target element.
	     * @param {jquery} $target - target element
	     * @param {String} parentSelector - selector of a parent element
	     * @override
	     */
	    attachEventHandlers: function($target, parentSelector) {
	        Painter.prototype.attachEventHandlers.call(this, $target, parentSelector);

	        if (this.inputPainter) {
	            this.inputPainter.attachEventHandlers($target, parentSelector + ' ' + this.selector);
	        }
	    },

	    /**
	     * Generates a HTML string from given data, and returns it.
	     * @param {object} cellData - cell data
	     * @returns {string} HTML string of the cell (TD)
	     * @implements {module:base/painter}
	     */
	    generateHtml: function(cellData) {
	        var attributeString = util.getAttributesString(this._getAttributes(cellData));
	        var contentHtml = this._getContentHtml(cellData);
	        var valign = cellData.columnModel.valign;
	        var styles = [];

	        if (valign) {
	            styles.push('vertical-align:' + valign);
	        }

	        return this.template({
	            attributeString: attributeString,
	            style: styles.join(';'),
	            contentHtml: contentHtml
	        });
	    },

	    /**
	     * Refreshes the cell(td) element.
	     * @param {object} cellData - cell data
	     * @param {jQuery} $td - cell element
	     */
	    refresh: function(cellData, $td) {
	        var contentProps = ['value', 'isEditing', 'isDisabled', 'optionList'];
	        var editingChangedToTrue = _.contains(cellData.changed, 'isEditing') && cellData.isEditing;
	        var shouldUpdateContent = _.intersection(contentProps, cellData.changed).length > 0;
	        var attrs = this._getAttributes(cellData);

	        $td.attr(attrs);

	        if (editingChangedToTrue && !this._isUsingViewMode(cellData)) {
	            this.inputPainter.focus($td);
	        } else if (shouldUpdateContent) {
	            $td.html(this._getContentHtml(cellData));
	            $td.scrollLeft(0);
	        }
	    }
	});

	module.exports = Cell;


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Dummy cell painter
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var Painter = __webpack_require__(54);
	var util = __webpack_require__(9);
	var attrNameConst = __webpack_require__(10).attrName;
	var classNameConst = __webpack_require__(15);

	/**
	 * Dummy Cell Painter
	 * @module painter/dummyCell
	 * @extends module:base/painter
	 * @ignore
	 */
	var DummyCell = tui.util.defineClass(Painter, /**@lends module:painter/dummyCell.prototype */{
	    init: function() {
	        Painter.apply(this, arguments);
	    },

	    /**
	     * css selector to find its own element(s) from a parent element.
	     * @type {String}
	     */
	    selector: 'td[' + attrNameConst.EDIT_TYPE + '="dummy"]',

	    /**
	     * Template function
	     * @returns {String} HTML string
	     */
	    template: _.template(
	        '<td ' +
	            attrNameConst.COLUMN_NAME + '="<%=columnName%>" ' +
	            attrNameConst.EDIT_TYPE + '="dummy" ' +
	            'class="<%=className%>">' +
	        '</td>'
	    ),

	    /**
	     * Generates a HTML string from given data, and returns it.
	     * @param {Number} rowNum - row number
	     * @param {String} columnName - column name
	     * @returns {string} HTML string
	     * @implements {module:base/painter}
	     */
	    generateHtml: function(rowNum, columnName) {
	        var classNames = [
	            classNameConst.CELL,
	            classNameConst.CELL_DUMMY,
	            (rowNum % 2) ? classNameConst.CELL_ROW_ODD : classNameConst.CELL_ROW_EVEN
	        ];

	        if (util.isMetaColumn(columnName)) {
	            classNames.push(classNameConst.CELL_HEAD);
	        }

	        return this.template({
	            columnName: columnName,
	            className: classNames.join(' ')
	        });
	    }
	});

	module.exports = DummyCell;


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Painter class for the 'input[type=text]' and 'input[type=password]'.
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var InputPainter = __webpack_require__(58);
	var util = __webpack_require__(9);
	var classNameConst = __webpack_require__(15);

	var SELECTOR_TEXT = '.' + classNameConst.CELL_CONTENT_TEXT;
	var SELECTOR_PASSWORD = 'input[type=password]';

	/**
	 * Painter class for the 'input[type=text]' and 'input[type=password]'
	 * @module painter/input/text
	 * @extends module:painter/input/base
	 * @param {Object} options - options
	 * @ignore
	 */
	var TextPainter = tui.util.defineClass(InputPainter, /**@lends module:painter/input/text.prototype */{
	    init: function(options) {
	        InputPainter.apply(this, arguments);

	        this.inputType = options.inputType;

	        /**
	         * css selector to use delegated event handlers by '$.on()' method.
	         * @type {String}
	         */
	        this.selector = (options.inputType === 'text') ? SELECTOR_TEXT : SELECTOR_PASSWORD;

	        this._extendEvents({
	            selectstart: '_onSelectStart'
	        });
	    },

	    /**
	     * template for input
	     * @returns {string} html
	     */
	    templateInput: _.template(
	        '<input' +
	        ' class="<%=className%>"' +
	        ' type="<%=type%>"' +
	        ' value="<%=value%>"' +
	        ' name="<%=name%>"' +
	        ' align="center"' +
	        ' maxLength="<%=maxLength%>"' +
	        ' <%=disabled%>' +
	        '/>'
	    ),

	    /**
	     * template for textarea
	     * @returns {string} html
	     */
	    templateTextArea: _.template(
	        '<textarea' +
	        ' class="<%=className%>"' +
	        ' name="<%=name%>"' +
	        ' maxLength="<%=maxLength%>"' +
	        ' <%=disabled%>><%=value%>' +
	        '</textarea>'
	    ),

	    /**
	     * Event handler for the 'selectstart' event.
	     * (To prevent 'selectstart' event be prevented by module:view/layout/body in IE)
	     * @param {Event} event - DOM event object
	     * @private
	     */
	    _onSelectStart: function(event) {
	        event.stopPropagation();
	    },

	    /**
	     * Convert each character in the given string to '*' and returns them as a string.
	     * @param {String} value - value string
	     * @returns {String}
	     * @private
	     */
	    _convertStringToAsterisks: function(value) {
	        return Array(value.length + 1).join('*');
	    },

	    /**
	     * Returns the value string of given data to display in the cell.
	     * @param {Object} cellData - cell data
	     * @implements {module:painter/input/base}
	     * @returns {String}
	     * @protected
	     */
	    _getDisplayValue: function(cellData) {
	        var value = cellData.formattedValue;

	        if (this.inputType === 'password') {
	            value = this._convertStringToAsterisks(cellData.value);
	        }

	        return value;
	    },

	    /**
	     * Generates an input HTML string from given data, and returns it.
	     * @param {object} cellData - cell data
	     * @implements {module:painter/input/base}
	     * @returns {string}
	     * @protected
	     */
	    _generateInputHtml: function(cellData) {
	        var maxLength = tui.util.pick(cellData, 'columnModel', 'editOption', 'maxLength');
	        var params = {
	            type: this.inputType,
	            className: classNameConst.CELL_CONTENT_TEXT,
	            value: cellData.value,
	            name: util.getUniqueKey(),
	            disabled: cellData.isDisabled ? 'disabled' : '',
	            maxLength: maxLength
	        };

	        if (cellData.whiteSpace === 'normal') {
	            return this.templateTextArea(params);
	        }
	        return this.templateInput(params);
	    },

	    /**
	     * Finds an element from the given parent element with 'this.selector', and moves focus to it.
	     * @param {jquery} $parent - parent element
	     * @override
	     */
	    focus: function($parent) {
	        var $input = $parent.find(this.selector);

	        if ($input.length === 1 && !$input.is(':focus')) {
	            $input.select();
	        }
	    }
	});

	module.exports = TextPainter;


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Base class for the Input Painter
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var Painter = __webpack_require__(54);
	var keyNameMap = __webpack_require__(10).keyName;

	/**
	 * Input Painter Base
	 * @module painter/input/base
	 * @extends module:base/painter
	 * @param {Object} options - options
	 * @ignore
	 */
	var InputPainter = tui.util.defineClass(Painter, /**@lends module:painter/input/base.prototype */{
	    init: function() {
	        Painter.apply(this, arguments);
	    },

	    /**
	     * key-value object contains event names as keys and handler names as values
	     * @type {Object}
	     */
	    events: {
	        keydown: '_onKeyDown',
	        focusin: '_onFocusIn',
	        focusout: '_onFocusOut'
	    },

	    /**
	     * keydown Actions
	     * @type {Object}
	     */
	    keyDownActions: {
	        ESC: function(param) {
	            this.controller.finishEditing(param.address, true);
	        },
	        ENTER: function(param) {
	            this.controller.finishEditing(param.address, true, param.value);
	        },
	        TAB: function(param) {
	            this.controller.finishEditing(param.address, true, param.value);
	            this.controller.focusInToNextCell(param.shiftKey);
	        }
	    },

	    /**
	     * Extends the default keydown actions.
	     * @param {Object} actions - Object that contains the action functions
	     * @private
	     */
	    _extendKeydownActions: function(actions) {
	        this.keyDownActions = _.assign({}, this.keyDownActions, actions);
	    },

	    /**
	     * Extends the default event object
	     * @param {Object} events - Object that contains the names of event handlers
	     */
	    _extendEvents: function(events) {
	        this.events = _.assign({}, this.events, events);
	    },

	    /**
	     * Executes the custom handler (defined by user) of the input events.
	     * @param {Event} event - DOM event object
	     * @private
	     */
	    _executeCustomEventHandler: function(event) {
	        var $input = $(event.target);
	        var address = this._getCellAddress($input);

	        this.controller.executeCustomInputEventHandler(event, address);
	    },

	    /**
	     * Event handler for the 'focusin' event.
	     * @param {Event} event - DOM event object
	     * @private
	     */
	    _onFocusIn: function(event) {
	        var $target = $(event.target);
	        var address = this._getCellAddress($target);
	        var self = this;

	        // Defers starting editing
	        // as button-type(checkbox, radio) defers finishing editing for detecting blurred state.
	        // see {@link module:painter/input/button#_onFocusOut}
	        _.defer(function() {
	            self._executeCustomEventHandler(event);
	            self.trigger('focusIn', $target, address);
	            self.controller.startEditing(address);
	        });
	    },

	    /**
	     * Event handler for the 'focusout' event.
	     * @param {Event} event - DOM event object
	     * @private
	     */
	    _onFocusOut: function(event) {
	        var $target = $(event.target);
	        var address = this._getCellAddress($target);

	        this._executeCustomEventHandler(event);
	        this.trigger('focusOut', $target, address);
	        this.controller.finishEditing(address, false, $target.val());
	    },

	    /**
	     * Event handler for the 'keydown' event.
	     * @param  {KeyboardEvent} event - KeyboardEvent object
	     * @private
	     */
	    _onKeyDown: function(event) {
	        var keyCode = event.keyCode || event.which;
	        var keyName = keyNameMap[keyCode];
	        var action = this.keyDownActions[keyName];
	        var $target = $(event.target);
	        var param = {
	            $target: $target,
	            address: this._getCellAddress($target),
	            shiftKey: event.shiftKey,
	            value: $target.val()
	        };

	        this._executeCustomEventHandler(event);

	        if (action) {
	            action.call(this, param);
	            event.preventDefault();
	        }
	    },

	    /**
	     * Returns the value string of given data to display in the cell.
	     * @abstract
	     * @protected
	     */
	    _getDisplayValue: function() {
	        throw new Error('implement _getDisplayValue() method');
	    },

	    /**
	     * Generates an input HTML string from given data, and returns it.
	     * @abstract
	     * @protected
	     */
	    _generateInputHtml: function() {
	        throw new Error('implement _generateInputHtml() method');
	    },

	    /**
	     * Returns whether the cell has view mode.
	     * @param {Object} cellData - cell data
	     * @returns {Boolean}
	     * @private
	     */
	    _isUsingViewMode: function(cellData) {
	        return tui.util.pick(cellData, 'columnModel', 'editOption', 'useViewMode') !== false;
	    },

	    /**
	     * Generates a HTML string from given data, and returns it.
	     * @param {Object} cellData - cell data
	     * @returns {String}
	     * @implements {module:painter/input/base}
	     */
	    generateHtml: function(cellData) {
	        var result;

	        if (!_.isNull(cellData.convertedHTML)) {
	            result = cellData.convertedHTML;
	        } else if (!this._isUsingViewMode(cellData) || cellData.isEditing) {
	            result = this._generateInputHtml(cellData);
	        } else {
	            result = this._getDisplayValue(cellData);
	        }

	        return result;
	    },

	    /**
	     * Finds an element from the given parent element with 'this.selector', and moves focus to it.
	     * @param {jquery} $parent - parent element
	     */
	    focus: function($parent) {
	        var $input = $parent.find(this.selector);

	        if (!$input.is(':focus')) {
	            $input.eq(0).focus();
	        }
	    }
	});

	_.assign(InputPainter.prototype, Backbone.Events);

	module.exports = InputPainter;


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Painter class for 'select' input.
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var InputPainter = __webpack_require__(58);
	var util = __webpack_require__(9);

	/**
	 * Painter class for 'select' input.
	 * @module painter/input/select
	 * @extends module:painter/input/base
	 * @ignore
	 */
	var SelectPainter = tui.util.defineClass(InputPainter, /**@lends module:painter/input/select.prototype */{
	    init: function() {
	        InputPainter.apply(this, arguments);

	        /**
	         * css selector to use delegated event handlers by '$.on()' method.
	         * @type {String}
	         */
	        this.selector = 'select';
	    },

	    /**
	     * Content markup template
	     * @returns {string} html
	     */
	    template: _.template(
	        '<select name="<%=name%>" <%=disabled%>><%=options%></select>'
	    ),

	    /**
	     * Options markup template
	     * @returns {string} html
	     */
	    optionTemplate: _.template(
	        '<option value="<%=value%>" <%=selected%>><%=text%></option>'
	    ),

	    /**
	     * Returns the value string of given data to display in the cell.
	     * @param {Object} cellData - cell data
	     * @implements {module:painter/input/base}
	     * @returns {String}
	     * @protected
	     */
	    _getDisplayValue: function(cellData) {
	        var selectedOption = _.find(cellData.optionList, function(item) {
	            return String(item.value) === String(cellData.value);
	        });

	        return selectedOption ? selectedOption.text : '';
	    },

	    /**
	     * Generates an input HTML string from given data, and returns it.
	     * @param {object} cellData - cell data
	     * @implements {module:painter/input/base}
	     * @returns {string}
	     * @protected
	     */
	    _generateInputHtml: function(cellData) {
	        var optionHtml = _.reduce(cellData.optionList, function(html, item) {
	            return html + this.optionTemplate({
	                value: item.value,
	                text: item.text,
	                selected: (String(cellData.value) === String(item.value)) ? 'selected' : ''
	            });
	        }, '', this);

	        return this.template({
	            name: util.getUniqueKey(),
	            disabled: cellData.isDisabled ? 'disabled' : '',
	            options: optionHtml
	        });
	    }
	});

	module.exports = SelectPainter;


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Painter class for 'checkbox' and 'radio button'.
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var InputPainter = __webpack_require__(58);
	var util = __webpack_require__(9);

	/**
	 * Painter class for 'checkbox' and 'radio button'.
	 * @module painter/input/button
	 * @extends module:painter/input/base
	 * @param {Object} options - options
	 * @ignore
	 */
	var ButtonPainter = tui.util.defineClass(InputPainter, /**@lends module:painter/input/button.prototype */{
	    init: function(options) {
	        InputPainter.apply(this, arguments);

	        this.inputType = options.inputType;

	        /**
	         * css selector to use delegated event handlers by '$.on()' method.
	         * @type {String}
	         */
	        this.selector = 'fieldset[data-type=' + this.inputType + ']';

	        this._extendEvents({
	            mousedown: '_onMouseDown'
	        });

	        this._extendKeydownActions({
	            TAB: function(param) {
	                var value;
	                if (!this._focusNextInput(param.$target, param.shiftKey)) {
	                    value = this._getCheckedValueString(param.$target);
	                    this.controller.finishEditing(param.address, true, value);
	                    this.controller.focusInToNextCell(param.shiftKey);
	                }
	            },
	            ENTER: function(param) {
	                var value = this._getCheckedValueString(param.$target);
	                this.controller.finishEditing(param.address, true, value);
	            },
	            LEFT_ARROW: function(param) {
	                this._focusNextInput(param.$target, true);
	            },
	            RIGHT_ARROW: function(param) {
	                this._focusNextInput(param.$target);
	            },
	            UP_ARROW: function() {},
	            DOWN_ARROW: function() {}
	        });
	    },

	    /**
	     * fieldset markup template
	     * @returns {String}
	     */
	    template: _.template(
	        '<fieldset data-type="<%=type%>"><%=content%></fieldset>'
	    ),

	    /**
	     * Input markup template
	     * @returns {String}
	     */
	    inputTemplate: _.template(
	        '<input type="<%=type%>" data-value-type="<%=valueType%>" name="<%=name%>" id="<%=id%>" value="<%=value%>"' +
	        ' <%=checked%> <%=disabled%> />'
	    ),

	    /**
	     * Label markup template
	     * @returns {String}
	     */
	    labelTemplate: _.template(
	        '<label for="<%=id%>"><%=labelText%></label>'
	    ),

	    /**
	     * Event handler for 'blur' event
	     * @param {Event} event - event object
	     * @override
	     * @private
	     */
	    _onFocusOut: function(event) {
	        var $target = $(event.target);
	        var self = this;

	        _.defer(function() {
	            var address, value;

	            if (!$target.siblings('input:focus').length) {
	                address = self._getCellAddress($target);
	                value = self._getCheckedValueString($target);
	                self.controller.finishEditing(address, false, value);
	            }
	        });
	    },

	    /**
	     * Event handler for 'mousedown' DOM event
	     * @param {MouseEvent} event - mouse event object
	     * @private
	     */
	    _onMouseDown: function(event) {
	        var $target = $(event.target);
	        var hasFocusedInput = $target.closest('fieldset').find('input:focus').length > 0;

	        if (!$target.is('input') && hasFocusedInput) {
	            event.stopPropagation();
	            event.preventDefault();
	        }
	    },

	    /**
	     * Moves focus to the next input element.
	     * @param {jquery} $target - target element
	     * @param {Boolean} reverse - if set to true, find previous element instead of next element.
	     * @returns {Boolean} - false if no element exist, true otherwise.
	     * @private
	     */
	    _focusNextInput: function($target, reverse) {
	        var traverseFuncName = reverse ? 'prevAll' : 'nextAll',
	            $nextInputs = $target[traverseFuncName]('input');

	        if ($nextInputs.length) {
	            $nextInputs.first().focus();
	            return true;
	        }
	        return false;
	    },

	    /**
	     * Returns the comma seperated value of all checked inputs
	     * @param {jQuery} $target - target element
	     * @returns {String}
	     * @private
	     */
	    _getCheckedValueString: function($target) {
	        var $checkedInputs = $target.parent().find('input:checked');
	        var checkedValues = [];
	        var result;

	        $checkedInputs.each(function() {
	            var $input = $(this);
	            var valueType = $input.attr('data-value-type');
	            var value = util.convertValueType($input.val(), valueType);

	            checkedValues.push(value);
	        });

	        if (checkedValues.length === 1) {
	            result = checkedValues[0];
	        } else {
	            result = checkedValues.join(',');
	        }

	        return result;
	    },

	    /**
	     * Returns the set object that contains the checked value.
	     * @param {String} value - value
	     * @returns {Object}
	     * @private
	     */
	    _getCheckedValueSet: function(value) {
	        var checkedMap = {};

	        _.each(String(value).split(','), function(itemValue) {
	            checkedMap[itemValue] = true;
	        });

	        return checkedMap;
	    },

	    /**
	     * Returns the value string of given data to display in the cell.
	     * @param {Object} cellData - cell data
	     * @implements {module:painter/input/base}
	     * @returns {String}
	     * @protected
	     */
	    _getDisplayValue: function(cellData) {
	        var checkedSet = this._getCheckedValueSet(cellData.value);
	        var optionTexts = [];

	        _.each(cellData.optionList, function(item) {
	            if (checkedSet[item.value]) {
	                optionTexts.push(item.text);
	            }
	        });

	        return optionTexts.join(',');
	    },

	    /**
	     * Generates an input HTML string from given data, and returns it.
	     * @param {object} cellData - cell data
	     * @implements {module:painter/input/base}
	     * @returns {string}
	     * @protected
	     */
	    _generateInputHtml: function(cellData) {
	        var checkedSet = this._getCheckedValueSet(cellData.value);
	        var name = util.getUniqueKey();
	        var contentHtml = '';

	        _.each(cellData.optionList, function(item) {
	            var id = name + '_' + item.value;

	            contentHtml += this.inputTemplate({
	                type: this.inputType,
	                id: id,
	                name: name,
	                value: item.value,
	                valueType: typeof item.value,
	                checked: checkedSet[item.value] ? 'checked' : '',
	                disabled: cellData.isDisabled ? 'disabled' : ''
	            });
	            if (item.text) {
	                contentHtml += this.labelTemplate({
	                    id: id,
	                    labelText: item.text
	                });
	            }
	        }, this);

	        return this.template({
	            type: this.inputType,
	            content: contentHtml
	        });
	    },

	    /**
	     * Finds an element from the given parent element with 'this.selector', and moves focus to it.
	     * @param {jquery} $parent - parent element
	     * @override
	     */
	    focus: function($parent) {
	        var $input = $parent.find('input');

	        if (!$input.is(':focus')) {
	            $input.eq(0).focus();
	        }
	    }
	});

	module.exports = ButtonPainter;


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Main Button Painter
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	var Painter = __webpack_require__(54);
	var classNameConst = __webpack_require__(15);
	var keyCodeMap = __webpack_require__(10).keyCode;

	/**
	 * Main Button Painter
	 * (This class does not extend from module:painter/input/base but from module:base/painter directly)
	 * @module painter/input/mainButton
	 * @extends module:base/painter
	 * @param {Object} options - options
	 * @ignore
	 */
	var InputPainter = tui.util.defineClass(Painter, /**@lends module:painter/input/mainButton.prototype */{
	    init: function(options) {
	        Painter.apply(this, arguments);

	        this.selector = 'input.' + classNameConst.CELL_MAIN_BUTTON;
	        this.inputType = options.inputType;
	        this.gridId = options.gridId;
	    },

	    /**
	     * key-value object contains event names as keys and handler names as values
	     * @type {Object}
	     */
	    events: {
	        change: '_onChange',
	        keydown: '_onKeydown'
	    },

	    /**
	     * markup template
	     * @returns {String}
	     */
	    template: _.template(
	        '<input class="' + classNameConst.CELL_MAIN_BUTTON + '"' +
	        ' type="<%=type%>" name="<%=name%>" <%=checked%> <%=disabled%> />'
	    ),

	     /**
	     * Event handler for 'change' DOM event.
	     * @param {Event} event - DOM event object
	     * @private
	     */
	    _onChange: function(event) {
	        var $target = $(event.target);
	        var address = this._getCellAddress($target);

	        this.controller.setValue(address, $target.is(':checked'));
	    },

	    /**
	     * Event handler for 'keydown' DOM event
	     * @param {KeyboardEvent} event [description]
	     */
	    _onKeydown: function(event) {
	        var address;

	        if (event.keyCode === keyCodeMap.TAB) {
	            event.preventDefault();
	            address = this._getCellAddress($(event.target));
	            this.controller.focusInToRow(address.rowKey);
	        }
	    },

	    /**
	     * Generates a HTML string from given data, and returns it.
	     * @param {Object} cellData - cell data
	     * @returns {String}
	     * @implements {module:painter/input/base}
	     */
	    generateHtml: function(cellData) {
	        return this.template({
	            type: this.inputType,
	            name: this.gridId,
	            checked: cellData.value ? 'checked' : '',
	            disabled: cellData.isDisabled ? 'disabled' : ''
	        });
	    }
	});

	module.exports = InputPainter;


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Controller class to handle actions from the painters
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);
	var util = __webpack_require__(9);

	/**
	 * Controller class to handle actions from the painters
	 * @module painter/controller
	 * @param {Object} options - options
	 * @ignore
	 */
	var PainterController = tui.util.defineClass(/**@lends module:painter/controller.prototype */{
	    init: function(options) {
	        this.focusModel = options.focusModel;
	        this.dataModel = options.dataModel;
	        this.columnModel = options.columnModel;
	        this.selectionModel = options.selectionModel;
	    },

	    /**
	     * Starts editing a cell identified by a given address, and returns the result.
	     * @param {{rowKey:String, columnName:String}} address - cell address
	     * @param {Boolean} force - if set to true, finish current editing before start.
	     * @returns {Boolean} true if succeeded, false otherwise
	     */
	    startEditing: function(address, force) {
	        var result;

	        if (force) {
	            this.focusModel.finishEditing();
	        }

	        result = this.focusModel.startEditing(address.rowKey, address.columnName);

	        if (result) {
	            this.selectionModel.end();
	        }

	        return result;
	    },

	    /**
	     * Check if given column has 'maxLength' property and returns the substring limited by maxLength.
	     * @param {string} columnName - columnName
	     * @param {string} value - value
	     * @returns {string}
	     * @private
	     */
	    _checkMaxLength: function(columnName, value) {
	        var column = this.columnModel.getColumnModel(columnName);
	        var maxLength = tui.util.pick(column, 'editOption', 'maxLength');

	        if (maxLength > 0 && value.length > maxLength) {
	            return value.substring(0, maxLength);
	        }
	        return value;
	    },

	    /**
	     * Ends editing a cell identified by a given address, and returns the result.
	     * @param {{rowKey:String, columnName:String}} address - cell address
	     * @param {Boolean} shouldBlur - if set to true, make the current input lose focus.
	     * @param {String} [value] - if exists, set the value of the data model to this value.
	     * @returns {Boolean} - true if succeeded, false otherwise
	     */
	    finishEditing: function(address, shouldBlur, value) {
	        var focusModel = this.focusModel;
	        var row, currentValue;

	        if (!focusModel.isEditingCell(address.rowKey, address.columnName)) {
	            return false;
	        }

	        this.selectionModel.enable();

	        if (!_.isUndefined(value)) {
	            row = this.dataModel.get(address.rowKey);
	            currentValue = row.get(address.columnName);

	            if (!(util.isBlank(value) && util.isBlank(currentValue))) {
	                this.setValue(address, this._checkMaxLength(address.columnName, value));
	            }
	        }
	        focusModel.finishEditing();

	        if (shouldBlur) {
	            focusModel.focusClipboard();
	        } else {
	            _.defer(function() {
	                focusModel.refreshState();
	            });
	        }

	        return true;
	    },

	    /**
	     * Moves focus to the next cell, and starts editing the cell.
	     * @param {Boolean} reverse - if set to true, find the previous cell instead of next cell
	     */
	    focusInToNextCell: function(reverse) {
	        var focusModel = this.focusModel;
	        var address = reverse ? focusModel.prevAddress() : focusModel.nextAddress();

	        focusModel.focusIn(address.rowKey, address.columnName, true);
	    },

	    /**
	     * Moves focus to the first cell of the given row, and starts editing the cell.
	     * @param {number} rowKey - rowKey
	     */
	    focusInToRow: function(rowKey) {
	        var focusModel = this.focusModel;
	        focusModel.focusIn(rowKey, focusModel.firstColumnName(), true);
	    },

	    /**
	     * Executes the custom handler (defined by user) of the input events.
	     * @param {Event} event - DOM Event object
	     * @param {{rowKey:String, columnName:String}} address - cell address
	     */
	    executeCustomInputEventHandler: function(event, address) {
	        var columnModel = this.columnModel.getColumnModel(address.columnName);
	        var eventType = event.type;
	        var eventHandler;

	        if (eventType === 'focusin') {
	            eventType = 'focus';
	        } else if (eventType === 'focusout') {
	            eventType = 'blur';
	        }

	        eventHandler = tui.util.pick(columnModel, 'editOption', 'inputEvents', eventType);

	        if (_.isFunction(eventHandler)) {
	            eventHandler.call(event.target, event, address);
	        }
	    },

	    /**
	     * Sets the value of the given cell.
	     * @param {{rowKey:String, columnName:String}} address - cell address
	     * @param {(Number|String|Boolean)} value - value
	     */
	    setValue: function(address, value) {
	        var columnModel = this.columnModel.getColumnModel(address.columnName);

	        if (_.isString(value)) {
	            value = $.trim(value);
	        }
	        if (columnModel.dataType === 'number') {
	            value = convertToNumber(value);
	        }

	        this.dataModel.setValue(address.rowKey, address.columnName, value);
	    }
	});

	/**
	 * Converts given value to a number type and returns it.
	 * If the value is not a number type, returns the original value.
	 * @param {*} value - value
	 * @returns {*}
	 */
	function convertToNumber(value) {
	    if (_.isString(value)) {
	        value = value.replace(/,/g, '');
	    }

	    if (_.isNumber(value) || isNaN(value) || util.isBlank(value)) {
	        return value;
	    }
	    return Number(value);
	}

	module.exports = PainterController;


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Add-on for binding to remote data
	 * @author NHN Ent. FE Development Lab
	 */
	'use strict';

	var Backbone = __webpack_require__(3);
	var _ = __webpack_require__(1);

	var View = __webpack_require__(2);
	var Router = __webpack_require__(64);
	var util = __webpack_require__(9);
	var formUtil = __webpack_require__(65);
	var GridEvent = __webpack_require__(22);

	var renderStateMap = __webpack_require__(10).renderState;
	var DELAY_FOR_LOADING_STATE = 200;

	/**
	 * Add-on for binding to remote data
	 * @module addon/net
	 * @param {object} options
	 *      @param {jquery} [options.el] - Form element (to be used for ajax request)
	 *      @param {boolean} [options.initialRequest=true] - Whether to request 'readData' after initialized
	 *      @param {string} [options.readDataMethod='POST'] - Http method to be used for 'readData' API ('POST' or 'GET')
	 *      @param {object} [options.api] - URL map
	 *          @param {string} [options.api.readData] - URL for read-data
	 *          @param {string} [options.api.createData] - URL for create
	 *          @param {string} [options.api.updateData] - URL for update
	 *          @param {string} [options.api.modifyData] - URL for modify (create/update/delete at once)
	 *          @param {string} [options.api.deleteData] - URL for delete
	 *          @param {string} [options.api.downloadExcel] - URL for download data of this page as an excel-file
	 *          @param {string} [options.api.downloadExcelAll] - URL for download all data as an excel-file
	 *      @param {number} [options.perPage=500] - The number of items to be shown in a page
	 *      @param {boolean} [options.enableAjaxHistory=true] - Whether to use the browser history for the ajax requests
	 * @example
	 *   <form id="data_form">
	 *   <input type="text" name="query"/>
	 *   </form>
	 *   <script>
	 *      var net;
	 *      var grid = new tui.Grid({
	 *          //...options...
	 *      });
	 *
	 *      // Activate 'Net' addon
	 *      grid.use('Net', {
	 *         el: $('#data_form'),
	 *         initialRequest: true,
	 *         readDataMethod: 'GET',
	 *         perPage: 500,
	 *         enableAjaxHistory: true,
	 *         api: {
	 *             'readData': './api/read',
	 *             'createData': './api/create',
	 *             'updateData': './api/update',
	 *             'deleteData': './api/delete',
	 *             'modifyData': './api/modify',
	 *             'downloadExcel': './api/download/excel',
	 *             'downloadExcelAll': './api/download/excelAll'
	 *         }
	 *      });
	 *
	 *      // Bind event handlers
	 *      grid.on('beforeRequest', function(data) {
	 *          // For all requests
	 *      }).on('response', function(data) {
	 *          // For all response (regardless of success or failure)
	 *      }).on('successResponse', function(data) {
	 *          // Only if response.result is true
	 *      }).on('failResponse', function(data) {
	 *          // Only if response.result is false
	 *      }).on('errorResponse', function(data) {
	 *          // For error response
	 *      });
	 *
	 *      net = grid.getAddOn('Net');
	 *
	 *      // Request create
	 *      net.request('createData');
	 *
	 *      // Request update
	 *      net.request('updateData');
	 *
	 *      // Request delete
	 *      net.request('deleteData');
	 *
	 *      // Request create/update/delete at once
	 *      net.request('modifyData');
	 *   </script>
	 */
	var Net = View.extend(/**@lends module:addon/net.prototype */{
	    initialize: function(options) {
	        var defaultOptions;

	        defaultOptions = {
	            initialRequest: true,
	            api: {
	                readData: '',
	                createData: '',
	                updateData: '',
	                deleteData: '',
	                modifyData: '',
	                downloadExcel: '',
	                downloadExcelAll: ''
	            },
	            perPage: 500,
	            enableAjaxHistory: true
	        };
	        options = $.extend(true, defaultOptions, options); // deep extend

	        this.setOwnProperties({
	            // models
	            dataModel: options.dataModel,
	            toolbarModel: options.toolbarModel,
	            renderModel: options.renderModel,

	            // extra objects
	            router: null,
	            pagination: options.pagination,

	            // configs
	            api: options.api,
	            enableAjaxHistory: options.enableAjaxHistory,
	            readDataMethod: options.readDataMethod || 'POST',
	            perPage: options.perPage,

	            // state data
	            curPage: 1,
	            timeoutIdForDelay: null,
	            requestedFormData: null,
	            isLocked: false,
	            lastRequestedReadData: null
	        });

	        this._initializeDataModelNetwork();
	        this._initializeRouter();
	        this._initializePagination();
	        this._showToolbarExcelBtns();

	        this.listenTo(this.dataModel, 'sortChanged', this._onSortChanged, this);

	        if (options.initialRequest) {
	            if (!this.lastRequestedReadData) {
	                this._readDataAt(1, false);
	            }
	        }
	    },

	    tagName: 'form',

	    events: {
	        submit: '_onSubmit'
	    },

	    /**
	     * pagination instance 를 초기화 한다.
	     * @private
	     */
	    _initializePagination: function() {
	        var pagination = this.pagination;

	        if (pagination) {
	            pagination.setOption('itemPerPage', this.perPage);
	            pagination.setOption('itemCount', 1);
	            pagination.on('beforeMove', $.proxy(this._onPageBeforeMove, this));
	        }
	    },

	    /**
	     * Event listener for 'route:read' event on Router
	     * @param  {String} queryStr - Query string
	     * @private
	     */
	    _onRouterRead: function(queryStr) {
	        var data = util.toQueryObject(queryStr);
	        this._requestReadData(data);
	    },

	    /**
	     * dataModel 이 network 통신을 할 수 있도록 설정한다.
	     * @private
	     */
	    _initializeDataModelNetwork: function() {
	        this.dataModel.url = this.api.readData;
	        this.dataModel.sync = $.proxy(this._sync, this);
	    },

	    /**
	     * ajax history 를 사용하기 위한 router 를 초기화한다.
	     * @private
	     */
	    _initializeRouter: function() {
	        if (this.enableAjaxHistory) {
	            this.router = new Router({
	                net: this
	            });
	            this.listenTo(this.router, 'route:read', this._onRouterRead);

	            if (!Backbone.History.started) {
	                Backbone.history.start();
	            }
	        }
	    },

	    /**
	     * Shows the excel-buttons in a toolbar (control-panel) area if the matching api exist.
	     * @private
	     */
	    _showToolbarExcelBtns: function() {
	        var toolbarModel = this.toolbarModel;
	        var api = this.api;

	        if (!toolbarModel) {
	            return;
	        }

	        if (api.downloadExcel) {
	            toolbarModel.set('isExcelButtonVisible', true);
	        }
	        if (api.downloadExcelAll) {
	            toolbarModel.set('isExcelAllButtonVisible', true);
	        }
	    },

	    /**
	     * pagination 에서 before page move가 발생했을 때 이벤트 핸들러
	     * @param {{page:number}} customEvent pagination 으로부터 전달받는 이벤트 객체
	     * @private
	     */
	    _onPageBeforeMove: function(customEvent) {
	        var page = customEvent.page;
	        if (this.curPage !== page) {
	            this._readDataAt(page, true);
	        }
	    },

	    /**
	     * form 의 submit 이벤트 발생시 이벤트 핸들러
	     * @param {event} submitEvent   submit 이벤트 객체
	     * @private
	     */
	    _onSubmit: function(submitEvent) {
	        submitEvent.preventDefault();
	        this._readDataAt(1, false);
	    },

	    /**
	     * 폼 데이터를 설정한다.
	     * @param {Object} data - 폼 데이터 정보
	     * @private
	     */
	    _setFormData: function(data) {
	        var formData = _.clone(data);

	        _.each(this.lastRequestedReadData, function(value, key) {
	            if ((_.isUndefined(formData[key]) || _.isNull(formData[key])) && value) {
	                formData[key] = '';
	            }
	        });
	        formUtil.setFormData(this.$el, formData);
	    },

	    /**
	     * fetch 수행 이후 custom ajax 동작 처리를 위해 Backbone 의 기본 sync 를 오버라이드 하기위한 메서드.
	     * @param {String} method   router 로부터 전달받은 method 명
	     * @param {Object} model    fetch 를 수행한 dataModel
	     * @param {Object} options  request 정보
	     * @private
	     */
	    _sync: function(method, model, options) {
	        var params;
	        if (method === 'read') {
	            options = options || {};
	            params = $.extend({}, options);
	            if (!options.url) {
	                params.url = _.result(model, 'url');
	            }
	            this._ajax(params);
	        } else {
	            Backbone.sync(Backbone, method, model, options);
	        }
	    },

	    /**
	     * network 통신에 대한 _lock 을 건다.
	     * @private
	     */
	    _lock: function() {
	        var renderModel = this.renderModel;

	        this.timeoutIdForDelay = setTimeout(function() {
	            renderModel.set('state', renderStateMap.LOADING);
	        }, DELAY_FOR_LOADING_STATE);

	        this.isLocked = true;
	    },

	    /**
	     * network 통신에 대해 unlock 한다.
	     * loading layer hide 는 rendering 하는 로직에서 수행한다.
	     * @private
	     */
	    _unlock: function() {
	        if (this.timeoutIdForDelay !== null) {
	            clearTimeout(this.timeoutIdForDelay);
	            this.timeoutIdForDelay = null;
	        }

	        this.isLocked = false;
	    },

	    /**
	     * form 으로 지정된 엘리먼트의 Data 를 반환한다.
	     * @returns {object} formData 데이터 오브젝트
	     * @private
	     */
	    _getFormData: function() {
	        return formUtil.getFormData(this.$el);
	    },

	    /**
	     * DataModel 에서 Backbone.fetch 수행 이후 success 콜백
	     * @param {object} dataModel grid 의 dataModel
	     * @param {object} responseData 응답 데이터
	     * @private
	     */
	    _onReadSuccess: function(dataModel, responseData) {
	        var pagination = this.pagination;
	        var page, totalCount;

	        dataModel.setOriginalRowList();

	        if (pagination && responseData.pagination) {
	            page = responseData.pagination.page;
	            totalCount = responseData.pagination.totalCount;
	            pagination.setOption('itemPerPage', this.perPage);
	            // If the totalCount is 0, set itemCount to 1 to show pagination
	            pagination.setOption('itemCount', totalCount || 1);
	            pagination.movePageTo(page);
	            this.curPage = page;
	        }
	    },

	    /**
	     * DataModel 에서 Backbone.fetch 수행 이후 error 콜백
	     * @param {object} dataModel grid 의 dataModel
	     * @param {object} responseData 응답 데이터
	     * @param {object} options  ajax 요청 정보
	     * @private
	     */
	    _onReadError: function(dataModel, responseData, options) {}, // eslint-disable-line

	    /**
	     * Requests 'readData' with last requested data.
	     */
	    reloadData: function() {
	        this._requestReadData(this.lastRequestedReadData);
	    },

	    /**
	     * Requests 'readData' to the server. The last requested data will be extended with new data.
	     * @param {Number} page - Page number
	     * @param {Object} data - Data(parameters) to send to the server
	     * @param {Boolean} resetData - If set to true, last requested data will be ignored.
	     */
	    readData: function(page, data, resetData) {
	        if (resetData) {
	            if (!data) {
	                data = {};
	            }
	            data.perPage = this.perPage;
	            this._changeSortOptions(data, this.dataModel.sortOptions);
	        } else {
	            data = _.assign({}, this.lastRequestedReadData, data);
	        }
	        data.page = page;
	        this._requestReadData(data);
	    },

	    /**
	     * 데이터 조회 요청.
	     * @param {object} data 요청시 사용할 request 파라미터
	     * @private
	     */
	    _requestReadData: function(data) {
	        var startNumber = 1;

	        this._setFormData(data);

	        if (!this.isLocked) {
	            this.renderModel.initializeVariables();
	            this._lock();

	            this.requestedFormData = _.clone(data);
	            this.curPage = data.page || this.curPage;
	            startNumber = (this.curPage - 1) * this.perPage + 1;
	            this.renderModel.set({
	                startNumber: startNumber
	            });

	            //마지막 요청한 reloadData에서 사용하기 위해 data 를 저장함.
	            this.lastRequestedReadData = _.clone(data);
	            this.dataModel.fetch({
	                requestType: 'readData',
	                data: data,
	                type: this.readDataMethod,
	                success: $.proxy(this._onReadSuccess, this),
	                error: $.proxy(this._onReadError, this),
	                reset: true
	            });
	            this.dataModel.setSortOptionValues(data.sortColumn, data.sortAscending);
	        }

	        if (this.router) {
	            this.router.navigate('read/' + util.toQueryString(data), {
	                trigger: false
	            });
	        }
	    },

	    /**
	     * sortChanged 이벤트 발생시 실행되는 함수
	     * @private
	     * @param {object} sortOptions 정렬 옵션
	     * @param {string} sortOptions.sortColumn 정렬할 컬럼명
	     * @param {boolean} sortOptions.isAscending 오름차순 여부
	     */
	    _onSortChanged: function(sortOptions) {
	        if (sortOptions.isRequireFetch) {
	            this._readDataAt(1, true, sortOptions);
	        }
	    },

	    /**
	     * 데이터 객체의 정렬 옵션 관련 값을 변경한다.
	     * @private
	     * @param {object} data 데이터 객체
	     * @param {object} sortOptions 정렬 옵션
	     * @param {string} sortOptions.sortColumn 정렬할 컬럼명
	     * @param {boolean} sortOptions.isAscending 오름차순 여부
	     */
	    _changeSortOptions: function(data, sortOptions) {
	        if (!sortOptions) {
	            return;
	        }
	        if (sortOptions.columnName === 'rowKey') {
	            delete data.sortColumn;
	            delete data.sortAscending;
	        } else {
	            data.sortColumn = sortOptions.columnName;
	            data.sortAscending = sortOptions.isAscending;
	        }
	    },

	    /**
	     * 현재 form data 기준으로, page 에 해당하는 데이터를 조회 한다.
	     * @param {Number} page 조회할 페이지 정보
	     * @param {Boolean} [isUsingRequestedData=true] page 단위 검색이므로, form 수정여부와 관계없이 처음 보낸 form 데이터로 조회할지 여부를 결정한다.
	     * @param {object} sortOptions 정렬 옵션
	     * @param {string} sortOptions.sortColumn 정렬할 컬럼명
	     * @param {boolean} sortOptions.isAscending 오름차순 여부
	     * @private
	     */
	    _readDataAt: function(page, isUsingRequestedData, sortOptions) {
	        var data;

	        isUsingRequestedData = _.isUndefined(isUsingRequestedData) ? true : isUsingRequestedData;
	        data = isUsingRequestedData ? this.requestedFormData : this._getFormData();
	        data.page = page;
	        data.perPage = this.perPage;
	        this._changeSortOptions(data, sortOptions);
	        this._requestReadData(data);
	    },

	    /**
	     * Send request to server to sync data
	     * @param {String} requestType - 'createData|updateData|deleteData|modifyData'
	     * @param {object} options - Options
	     *      @param {String} [options.url] - URL to send the request
	     *      @param {String} [options.hasDataParam=true] - Whether the row-data to be included in the request param
	     *      @param {String} [options.isOnlyChecked=true] - Whether the request param only contains checked rows
	     *      @param {String} [options.isOnlyModified=true] - Whether the request param only contains modified rows
	     *      @param {String} [options.isSkipConfirm=false] - Whether to show confirm dialog before sending request
	     */
	    request: function(requestType, options) {
	        var defaultOptions = {
	                url: this.api[requestType],
	                type: null,
	                hasDataParam: true,
	                isOnlyChecked: true,
	                isOnlyModified: true,
	                isSkipConfirm: false
	            },
	            newOptions = $.extend(defaultOptions, options),
	            param = this._getRequestParam(requestType, newOptions);

	        if (param) {
	            this._ajax(param);
	        }
	    },

	    /**
	     * Change window.location to registered url for downloading data
	     * @param {string} type - Download type. 'excel' or 'excelAll'.
	     *        Will be matched with API 'downloadExcel', 'downloadExcelAll'.
	     */
	    download: function(type) {
	        var apiName = 'download' + util.toUpperCaseFirstLetter(type),
	            data = this.requestedFormData,
	            url = this.api[apiName],
	            paramStr;

	        if (type === 'excel') {
	            data.page = this.curPage;
	            data.perPage = this.perPage;
	        } else {
	            data = _.omit(data, 'page', 'perPage');
	        }

	        paramStr = $.param(data);
	        window.location = url + '?' + paramStr;
	    },

	    /**
	     * Set number of rows per page and reload current page
	     * @param {number} perPage - Number of rows per page
	     */
	    setPerPage: function(perPage) {
	        this.perPage = perPage;
	        this._readDataAt(1);
	    },

	    /**
	     * 서버로 요청시 사용될 파라미터 중 Grid 의 데이터에 해당하는 데이터를 Option 에 맞추어 반환한다.
	     * @param {String} requestType  요청 타입. 'createData|updateData|deleteData|modifyData' 중 하나를 인자로 넘긴다.
	     * @param {Object} [options] Options
	     *      @param {boolean} [options.hasDataParam=true] request 데이터에 rowList 관련 데이터가 포함될 지 여부.
	     *      @param {boolean} [options.isOnlyModified=true] rowList 관련 데이터 중 수정된 데이터만 포함할 지 여부
	     *      @param {boolean} [options.isOnlyChecked=true] rowList 관련 데이터 중 checked 된 데이터만 포함할 지 여부
	     * @returns {{count: number, data: {requestType: string, url: string, data: object,
	     *      type: string, dataType: string}}} 옵션 조건에 해당하는 그리드 데이터 정보
	     * @private
	     */
	    _getDataParam: function(requestType, options) {
	        var dataModel = this.dataModel,
	            checkMap = {
	                createData: ['createList'],
	                updateData: ['updateList'],
	                deleteData: ['deleteList'],
	                modifyData: ['createList', 'updateList', 'deleteList']
	            },
	            checkList = checkMap[requestType],
	            data = {},
	            count = 0,
	            dataMap;

	        options = _.defaults(options || {}, {
	            hasDataParam: true,
	            isOnlyModified: true,
	            isOnlyChecked: true
	        });

	        if (options.hasDataParam) {
	            if (options.isOnlyModified) {
	                //{createList: [], updateList:[], deleteList: []} 에 담는다.
	                dataMap = dataModel.getModifiedRowList({
	                    isOnlyChecked: options.isOnlyChecked
	                });
	                _.each(dataMap, function(list, name) {
	                    if (_.contains(checkList, name) && list.length) {
	                        count += list.length;
	                        data[name] = JSON.stringify(list);
	                    }
	                }, this);
	            } else {
	                //{rowList: []} 에 담는다.
	                data.rowList = dataModel.getRowList(options.isOnlyChecked);
	                count = data.rowList.length;
	            }
	        }

	        return {
	            data: data,
	            count: count
	        };
	    },

	    /**
	     * requestType 에 따라 서버에 요청할 파라미터를 반환한다.
	     * @param {String} requestType 요청 타입. 'createData|updateData|deleteData|modifyData' 중 하나를 인자로 넘긴다.
	     * @param {Object} [options] Options
	     *      @param {String} [options.url=this.api[requestType]] 요청할 url.
	     *      지정하지 않을 시 option 으로 넘긴 API 중 request Type 에 해당하는 url 로 지정됨
	     *      @param {String} [options.type='POST'] request method 타입
	     *      @param {boolean} [options.hasDataParam=true] request 데이터에 rowList 관련 데이터가 포함될 지 여부.
	     *      @param {boolean} [options.isOnlyModified=true] rowList 관련 데이터 중 수정된 데이터만 포함할 지 여부
	     *      @param {boolean} [options.isOnlyChecked=true] rowList 관련 데이터 중 checked 된 데이터만 포함할 지 여부
	     * @returns {{requestType: string, url: string, data: object, type: string, dataType: string}}
	     *      ajax 호출시 사용될 option 파라미터
	     * @private
	     */
	    _getRequestParam: function(requestType, options) {
	        var defaultOptions = {
	            url: this.api[requestType],
	            type: null,
	            hasDataParam: true,
	            isOnlyModified: true,
	            isOnlyChecked: true
	        };
	        var newOptions = $.extend(defaultOptions, options);
	        var dataParam = this._getDataParam(requestType, newOptions);
	        var param = null;

	        if (newOptions.isSkipConfirm || this._isConfirmed(requestType, dataParam.count)) {
	            param = {
	                requestType: requestType,
	                url: newOptions.url,
	                data: dataParam.data,
	                type: newOptions.type
	            };
	        }

	        return param;
	    },

	    /**
	     * requestType 에 따른 컨펌 메세지를 노출한다.
	     * @param {String} requestType 요청 타입. 'createData|updateData|deleteData|modifyData' 중 하나를 인자로 넘긴다.
	     * @param {Number} count   전송될 데이터 개수
	     * @returns {boolean}    계속 진행할지 여부를 반환한다.
	     * @private
	     */
	    _isConfirmed: function(requestType, count) {
	        var result = false;

	        if (count > 0) {
	            result = confirm(this._getConfirmMessage(requestType, count));
	        } else {
	            alert(this._getConfirmMessage(requestType, count));
	        }

	        return result;
	    },

	    /**
	     * confirm message 를 반환한다.
	     * @param {String} requestType 요청 타입. 'createData|updateData|deleteData|modifyData' 중 하나를 인자로 넘긴다.
	     * @param {Number} count 전송될 데이터 개수
	     * @returns {string} 생성된 confirm 메세지
	     * @private
	     */
	    _getConfirmMessage: function(requestType, count) {
	        var textMap = {
	            createData: '입력',
	            updateData: '수정',
	            deleteData: '삭제',
	            modifyData: '반영'
	        };
	        var actionName = textMap[requestType];
	        var message;

	        if (count > 0) {
	            message = count + '건의 데이터를 ' + actionName + '하시겠습니까?';
	        } else {
	            message = actionName + '할 데이터가 없습니다.';
	        }

	        return message;
	    },

	    /**
	     * ajax 통신을 한다.
	     * @param {{requestType: string, url: string, data: object, type: string, dataType: string}} options ajax 요청 파라미터
	     * @private
	     */
	    _ajax: function(options) {
	        var eventData = new GridEvent(options.data);
	        var params;

	        /**
	         * Occurs before the http request is sent
	         * @event tui.Grid#beforeRequest
	         * @type {module:common/gridEvent}
	         */
	        this.trigger('beforeRequest', eventData);
	        if (eventData.isStopped()) {
	            return;
	        }

	        options = $.extend({requestType: ''}, options);
	        params = {
	            url: options.url,
	            data: options.data || {},
	            type: options.type || 'POST',
	            dataType: options.dataType || 'json',
	            complete: $.proxy(this._onComplete, this, options.complete, options),
	            success: $.proxy(this._onSuccess, this, options.success, options),
	            error: $.proxy(this._onError, this, options.error, options)
	        };
	        if (options.url) {
	            $.ajax(params);
	        }
	    },

	    /**
	     * ajax complete 이벤트 핸들러
	     * @param {Function} callback   통신 완료 이후 수행할 콜백함수
	     * @param {object} jqXHR    jqueryXHR  객체
	     * @param {number} status   http status 정보
	     * @private
	     */
	    _onComplete: function(callback, jqXHR, status) { // eslint-disable-line no-unused-vars
	        this._unlock();
	    },

	    /**
	     * ajax success 이벤트 핸들러
	     * @param {Function} callback Callback function
	     * @param {{requestType: string, url: string, data: object, type: string, dataType: string}} options ajax 요청 파라미터
	     * @param {Object} responseData 응답 데이터
	     * @param {number} status   http status 정보
	     * @param {object} jqXHR    jqueryXHR  객체
	     * @private
	     */
	    _onSuccess: function(callback, options, responseData, status, jqXHR) {
	        var message = responseData && responseData.message;
	        var eventData = new GridEvent({
	            httpStatus: status,
	            requestType: options.requestType,
	            requestParameter: options.data,
	            responseData: responseData
	        });

	        /**
	         * Occurs when the response is received from the server
	         * @event tui.Grid#reponse
	         * @type {module:common/gridEvent}
	         * @property {number} httpStatus - HTTP status
	         * @property {string} requestType - Request type
	         * @property {string} requestParameter - Request parameters
	         * @property {Object} responseData - response data
	         */
	        this.trigger('response', eventData);
	        if (eventData.isStopped()) {
	            return;
	        }
	        if (responseData && responseData.result) {
	            /**
	             * Occurs after the response event, if the result is true
	             * @event tui.Grid#successReponse
	             * @type {module:common/gridEvent}
	             * @property {number} httpStatus - HTTP status
	             * @property {string} requestType - Request type
	             * @property {string} requestParameter - Request parameter
	             * @property {Object} responseData - response data
	             */
	            this.trigger('successResponse', eventData);
	            if (eventData.isStopped()) {
	                return;
	            }
	            if (_.isFunction(callback)) {
	                callback(responseData.data || {}, status, jqXHR);
	            }
	        } else {
	            /**
	             * Occurs after the response event, if the result is false
	             * @event tui.Grid#failResponse
	             * @type {module:common/gridEvent}
	             * @property {number} httpStatus - HTTP status
	             * @property {string} requestType - Request type
	             * @property {string} requestParameter - Request parameter
	             * @property {Object} responseData - response data
	             */
	            this.trigger('failResponse', eventData);
	            if (eventData.isStopped()) {
	                return;
	            }
	            if (message) {
	                alert(message);
	            }
	        }
	    },

	    /**
	     * ajax error 이벤트 핸들러
	     * @param {Function} callback Callback function
	     * @param {{requestType: string, url: string, data: object, type: string, dataType: string}} options ajax 요청 파라미터
	     * @param {object} jqXHR    jqueryXHR  객체
	     * @param {number} status   http status 정보
	     * @param {String} errorMessage 에러 메세지
	     * @private
	     */
	    _onError: function(callback, options, jqXHR, status) {
	        var eventData = new GridEvent({
	            httpStatus: status,
	            requestType: options.requestType,
	            requestParameter: options.data,
	            responseData: null
	        });
	        this.renderModel.set('state', renderStateMap.DONE);

	        this.trigger('response', eventData);
	        if (eventData.isStopped()) {
	            return;
	        }

	        /**
	         * Occurs after the response event, if the response is Error
	         * @event tui.Grid#errorResponse
	         * @type {module:common/gridEvent}
	         * @property {number} httpStatus - HTTP status
	         * @property {string} requestType - Request type
	         * @property {string} requestParameter - Request parameters
	         */
	        this.trigger('errorResponse', eventData);
	        if (eventData.isStopped()) {
	            return;
	        }

	        if (jqXHR.readyState > 1) {
	            alert('데이터 요청 중에 에러가 발생하였습니다.\n\n다시 시도하여 주시기 바랍니다.');
	        }
	    }
	});

	module.exports = Net;


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Router for Addon.Net
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var Backbone = __webpack_require__(3);

	/**
	 * Router for Addon.Net
	 * @module addon/net-router
	 * @param  {object} attributes - Attributes
	 * @ignore
	 */
	var Router = Backbone.Router.extend(/**@lends module:addon/net-router.prototype */{
	    initialize: function(attributes) {
	        this.net = attributes.net;
	    },

	    routes: {
	        'read/:queryStr': 'read'
	    }
	});

	module.exports = Router;


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Utilities for form data, form element
	 * @author NHN Ent. Fe Development Team
	 */
	'use strict';

	var _ = __webpack_require__(1);

	/**
	 * @module formUtil
	 * @ignore
	 */
	var formUtil = {
	    /**
	     * form 의 input 요소 값을 설정하기 위한 객체
	     * @alias form.setInput
	     * @memberof module:util
	     */
	    setInput: {
	        /**
	         * 배열의 값들을 전부 String 타입으로 변환한다.
	         * @ignore
	         * @param {Array}  arr 변환할 배열
	         * @returns {Array} 변환된 배열 결과 값
	         */
	        '_changeToStringInArray': function(arr) {
	            _.each(arr, function(value, i) {
	                arr[i] = String(value);
	            });

	            return arr;
	        },

	        /**
	         * radio type 의 input 요소의 값을 설정한다.
	         * @ignore
	         * @param {HTMLElement} targetElement - Target element
	         * @param {String} formValue - Form value
	         */
	        'radio': function(targetElement, formValue) {
	            targetElement.checked = (targetElement.value === formValue);
	        },

	        /**
	         * radio type 의 input 요소의 값을 설정한다.
	         * @ignore
	         * @memberof module:util
	         * @param {HTMLElement} targetElement - Target element
	         * @param {String} formValue - Form value
	         */
	        'checkbox': function(targetElement, formValue) {
	            if (_.isArray(formValue)) {
	                targetElement.checked = $.inArray(targetElement.value, this._changeToStringInArray(formValue)) !== -1;
	            } else {
	                targetElement.checked = (targetElement.value === formValue);
	            }
	        },

	        /**
	         * select-one type 의 input 요소의 값을 설정한다.
	         * @ignore
	         * @param {HTMLElement} targetElement - Target element
	         * @param {String} formValue - Form value
	         */
	        'select-one': function(targetElement, formValue) {
	            var options = tui.util.toArray(targetElement.options);

	            targetElement.selectedIndex = _.findIndex(options, function(option) {
	                return option.value === formValue || option.text === formValue;
	            });
	        },

	        /**
	         * select-multiple type 의 input 요소의 값을 설정한다.
	         * @ignore
	         * @param {HTMLElement} targetElement - Target element
	         * @param {String} formValue - Form value
	         */
	        'select-multiple': function(targetElement, formValue) {
	            var options = tui.util.toArray(targetElement.options);

	            if (_.isArray(formValue)) {
	                formValue = this._changeToStringInArray(formValue);
	                _.each(options, function(targetOption) {
	                    targetOption.selected = $.inArray(targetOption.value, formValue) !== -1 ||
	                    $.inArray(targetOption.text, formValue) !== -1;
	                });
	            } else {
	                this['select-one'].apply(this, arguments);
	            }
	        },

	        /**
	         * input 요소의 값을 설정하는 default 로직
	         * @memberof module:util
	         * @param {HTMLElement} targetElement - Target element
	         * @param {String} formValue - Form value
	         */
	        'defaultAction': function(targetElement, formValue) {
	            targetElement.value = formValue;
	        }
	    },

	    /**
	     * $form 에 정의된 인풋 엘리먼트들의 값을 모아서 DataObject 로 구성하여 반환한다.
	     * @memberof module:util
	     * @alias form.getFormData
	     * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
	     * @returns {object} form 내의 데이터들을 key:value 형태의 DataObject 로 반환한다.
	     **/
	    getFormData: function($form) {
	        var result = {},
	            valueList = $form.serializeArray(),
	            isExisty = tui.util.isExisty;

	        _.each(valueList, function(obj) {
	            var value = obj.value || '',
	                name = obj.name;

	            if (isExisty(result[name])) {
	                result[name] = [].concat(result[name], value);
	            } else {
	                result[name] = value;
	            }
	        });

	        return result;
	    },

	    /**
	     * 폼 안에 있는 모든 인풋 엘리먼트를 배열로 리턴하거나, elementName에 해당하는 인풋 엘리먼트를 리턴한다.
	     * @memberof module:util
	     * @alias form.getFormElement
	     * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
	     * @param {String} [elementName] 특정 이름의 인풋 엘리먼트만 가져오고 싶은 경우 전달하며, 생략할 경우 모든 인풋 엘리먼트를 배열 형태로 리턴한다.
	     * @returns {jQuery} jQuery 로 감싼 엘리먼트를 반환한다.
	     */
	    getFormElement: function($form, elementName) {
	        var formElement;
	        if ($form && $form.length) {
	            if (elementName) {
	                formElement = $form.prop('elements')[String(elementName)];
	            } else {
	                formElement = $form.prop('elements');
	            }
	        }

	        return $(formElement);
	    },

	    /**
	     * 파라미터로 받은 데이터 객체를 이용하여 폼내에 해당하는 input 요소들의 값을 설정한다.
	     * @memberof module:util
	     * @alias form.setFormData
	     * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
	     * @param {Object} formData 폼에 설정할 폼 데이터 객체
	     **/
	    setFormData: function($form, formData) {
	        _.each(formData, function(value, property) {
	            this.setFormElementValue($form, property, value);
	        }, this);
	    },

	    /**
	     * elementName에 해당하는 인풋 엘리먼트에 formValue 값을 설정한다.
	     * -인풋 엘리먼트의 이름을 기준으로 하기에 라디오나 체크박스 엘리먼트에 대해서도 쉽게 값을 설정할 수 있다.
	     * @memberof module:util
	     * @alias form.setFormElementValue
	     * @param {jQuery} $form jQuery()로 감싼 폼엘리먼트
	     * @param {String}  elementName 값을 설정할 인풋 엘리먼트의 이름
	     * @param {String|Array} formValue 인풋 엘리먼트에 설정할 값으로 체크박스나 멀티플 셀렉트박스인 경우에는 배열로 설정할 수 있다.
	     **/
	    setFormElementValue: function($form, elementName, formValue) {
	        var $elementList = this.getFormElement($form, elementName),
	            type;

	        if (!$elementList.length) {
	            return;
	        }
	        if (!_.isArray(formValue)) {
	            formValue = String(formValue);
	        }

	        $elementList = tui.util.isHTMLTag($elementList) ? [$elementList] : $elementList;
	        $elementList = tui.util.toArray($elementList);
	        _.each($elementList, function(targetElement) {
	            type = this.setInput[targetElement.type] ? targetElement.type : 'defaultAction';
	            this.setInput[type](targetElement, formValue);
	        }, this);
	    },

	    /**
	     * input 타입의 엘리먼트의 커서를 가장 끝으로 이동한다.
	     * @memberof module:util
	     * @alias form.setCursorToEnd
	     * @param {HTMLElement} target HTML input 엘리먼트
	     */
	    setCursorToEnd: function(target) {
	        var length = target.value.length,
	            range;

	        target.focus();
	        if (target.setSelectionRange) {
	            try {
	                target.setSelectionRange(length, length);
	            } catch (e) {
	                // to prevent unspecified error in IE (occurs when running test)
	            }
	        } else if (target.createTextRange) {
	            range = target.createTextRange();
	            range.collapse(true);
	            range.moveEnd('character', length);
	            range.moveStart('character', length);
	            try {
	                range.select();
	            } catch (e) {
	                // to prevent unspecified error in IE (occurs when running test)
	            }
	        }
	    }
	};

	module.exports = formUtil;


/***/ },
/* 66 */
/***/ function(module, exports) {

	/**
	 * @fileoverview Component holder
	 * @author NHN Ent. FE Development Team
	 */
	'use strict';

	var defaultOptionsMap = {
	    pagination: null
	};

	/**
	 * Component holder
	 * @module componentHolder
	 * @ignore
	 */
	var ComponentHolder = tui.util.defineClass(/**@lends module:componentHolder.prototype */{
	    init: function(optionsMap) {
	        this.optionsMap = $.extend(true, defaultOptionsMap, optionsMap);
	        this.instanceMap = {};
	    },

	    /**
	     * Returns an instance of tui.component.Pagination
	     * @param {String} key - component key
	     * @returns {tui.component.Pagination}
	     */
	    getInstance: function(key) {
	        return this.instanceMap[key];
	    },

	    /**
	     * Sets an instance of tui.component.Pagination
	     * @param {String} key - component key
	     * @param {tui.component.Pagination} instance - pagination instance
	     */
	    setInstance: function(key, instance) {
	        this.instanceMap[key] = instance;
	    },

	    /**
	     * Returns an option object.
	     * @param {String} key - component key
	     * @returns {Object}
	     */
	    getOptions: function(key) {
	        return this.optionsMap[key];
	    }
	});

	module.exports = ComponentHolder;


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	/**
	* @fileoverview theme manager
	* @author NHN Ent. FE Development Team
	*/
	'use strict';

	var util = __webpack_require__(9);
	var styleGen = __webpack_require__(68);
	var themeNameConst = __webpack_require__(10).themeName;

	var STYLE_ELEMENT_ID = 'tui-grid-theme-style';

	var presetOptions = {};
	presetOptions[themeNameConst.DEFAULT] = __webpack_require__(70);
	presetOptions[themeNameConst.STRIPED] = __webpack_require__(71);
	presetOptions[themeNameConst.CLEAN] = __webpack_require__(72);

	/**
	 * build css string with given options.
	 * @param {Object} options - options
	 * @returns {String}
	 * @ignore
	 */
	function buildCssString(options) {
	    var styles = [
	        styleGen.grid(options.grid),
	        styleGen.scrollbar(options.scrollbar),
	        styleGen.toolbar(options.toolbar),
	        styleGen.heightResizeHandle(options.heightResizeHandle),
	        styleGen.pagination(options.pagination),
	        styleGen.selection(options.selection)
	    ];
	    var cell = options.cell;

	    if (cell) {
	        styles = styles.concat([
	            styleGen.cell(cell.normal),
	            styleGen.cellDummy(cell.dummy),
	            styleGen.cellEditable(cell.editable),
	            styleGen.cellHead(cell.head),
	            styleGen.cellOddRow(cell.oddRow),
	            styleGen.cellEvenRow(cell.evenRow),
	            styleGen.cellRequired(cell.required),
	            styleGen.cellDisabled(cell.disabled),
	            styleGen.cellInvalid(cell.invalid),
	            styleGen.cellCurrentRow(cell.currentRow),
	            styleGen.cellSelectedHead(cell.selectedHead),
	            styleGen.cellFocused(cell.focused)
	        ]);
	    }

	    return styles.join('');
	}

	/**
	 * Set document style with given options.
	 * @param {Object} options - options
	 * @ignore
	 */
	function setDocumentStyle(options) {
	    var cssString = buildCssString(options);

	    $('#' + STYLE_ELEMENT_ID).remove();
	    util.appendStyleElement(STYLE_ELEMENT_ID, cssString);
	}

	module.exports = {
	    /**
	     * Creates a style element using theme options identified by given name,
	     * and appends it to the document.
	     * @param {String} themeName - preset theme name
	     * @param {Object} extOptions - if exist, extend preset theme options with it.
	     */
	    apply: function(themeName, extOptions) {
	        var options = presetOptions[themeName];

	        if (!options) {
	            options = presetOptions[themeNameConst.DEFAULT];
	        }
	        options = $.extend(true, {}, options, extOptions);
	        setDocumentStyle(options);
	    },

	    /**
	     * Returns whether the style of a theme is applied.
	     * @returns {Boolean}
	     */
	    isApplied: function() {
	        return $('#' + STYLE_ELEMENT_ID).length === 1;
	    }
	};


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	/**
	* @fileoverview css style generator
	* @author NHN Ent. FE Development Team
	*/
	'use strict';

	var _ = __webpack_require__(1);

	var builder = __webpack_require__(69);
	var classNameConst = __webpack_require__(15);

	/**
	 * Shortcut for the builder.createClassRule() method.
	 * @ignore
	 */
	var classRule = _.bind(builder.createClassRule, builder);

	/**
	 * Creates a rule string for background and text colors.
	 * @param {String} className - class name
	 * @param {Objecr} options - options
	 * @returns {String}
	 * @ignore
	 */
	function bgTextRuleString(className, options) {
	    return classRule(className)
	        .bg(options.background)
	        .text(options.text)
	        .build();
	}

	/**
	 * Creates a rule string for background and border colors.
	 * @param {String} className - class name
	 * @param {Objecr} options - options
	 * @returns {String}
	 * @ignore
	 */
	function bgBorderRuleString(className, options) {
	    return classRule(className)
	        .bg(options.background)
	        .border(options.border)
	        .build();
	}

	module.exports = {
	    /**
	     * Generates a css string for the grid.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    grid: function(options) {
	        var containerRule = classRule(classNameConst.CONTAINER)
	            .bg(options.background)
	            .text(options.text);
	        var contentAreaRule = classRule(classNameConst.CONTENT_AREA).border(options.border);
	        var tableRule = classRule(classNameConst.TABLE).border(options.border);
	        var headRule = classRule(classNameConst.HEAD_AREA).border(options.border);
	        var borderLineRule = classRule(classNameConst.BORDER_LINE).bg(options.border);
	        var scrollHeadRule = classRule(classNameConst.SCROLLBAR_HEAD).border(options.border);
	        var scrollBorderRule = classRule(classNameConst.SCROLLBAR_BORDER).bg(options.border);
	        var footerRightRule = classRule(classNameConst.FOOT_AREA_RIGHT).border(options.border);

	        return builder.buildAll([
	            containerRule,
	            contentAreaRule,
	            tableRule,
	            headRule,
	            borderLineRule,
	            scrollHeadRule,
	            scrollBorderRule,
	            footerRightRule
	        ]);
	    },

	    /**
	     * Generates a css string for scrollbars.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    scrollbar: function(options) {
	        var webkitScrollbarRules = builder.createWebkitScrollbarRules('.' + classNameConst.CONTAINER, options);
	        var ieScrollbarRule = builder.createIEScrollbarRule('.' + classNameConst.CONTAINER, options);
	        var rightBottomRule = classRule(classNameConst.SCROLLBAR_RIGHT_BOTTOM).bg(options.background);
	        var leftBottomRule = classRule(classNameConst.SCROLLBAR_LEFT_BOTTOM).bg(options.background);
	        var scrollHeadRule = classRule(classNameConst.SCROLLBAR_HEAD).bg(options.background);
	        var footerRightRule = classRule(classNameConst.FOOT_AREA_RIGHT).bg(options.background);
	        var bodyAreaRule = classRule(classNameConst.BODY_AREA).bg(options.background);

	        return builder.buildAll(webkitScrollbarRules.concat([
	            ieScrollbarRule,
	            rightBottomRule,
	            leftBottomRule,
	            scrollHeadRule,
	            footerRightRule,
	            bodyAreaRule
	        ]));
	    },

	    /**
	     * Generates a css string for a toolbar.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    toolbar: function(options) {
	        return bgBorderRuleString(classNameConst.TOOLBAR, options);
	    },

	    /**
	     * Generates a css string for a resize-handle.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    heightResizeHandle: function(options) {
	        return bgBorderRuleString(classNameConst.HEIGHT_RESIZE_HANDLE, options);
	    },

	    /**
	     * Generates a css string for a pagination.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    pagination: function(options) {
	        return bgBorderRuleString(classNameConst.PAGINATION, options);
	    },

	    /**
	     * Generates a css string for selection layers.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    selection: function(options) {
	        return bgBorderRuleString(classNameConst.LAYER_SELECTION, options);
	    },

	    /**
	     * Generates a css string for table cells.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    cell: function(options) {
	        var cellRule = classRule(classNameConst.CELL)
	            .bg(options.background)
	            .border(options.border)
	            .borderWidth(options)
	            .text(options.text);

	        return cellRule.build();
	    },

	    /*
	     * Generates a css string for head cells.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    cellHead: function(options) {
	        var headRule = classRule(classNameConst.CELL_HEAD)
	            .bg(options.background)
	            .border(options.border)
	            .borderWidth(options)
	            .text(options.text);

	        var headAreaRule = classRule(classNameConst.HEAD_AREA)
	            .bg(options.background);

	        return builder.buildAll([headRule, headAreaRule]);
	    },

	    /**
	     * Generates a css string for the cells in even rows.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    cellEvenRow: function(options) {
	        return classRule(classNameConst.CELL_ROW_EVEN)
	            .bg(options.background)
	            .build();
	    },

	    /**
	     * Generates a css string for the cells in odd rows.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    cellOddRow: function(options) {
	        return classRule(classNameConst.CELL_ROW_ODD)
	            .bg(options.background)
	            .build();
	    },

	    /**
	     * Generates a css string for selected head cells.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    cellSelectedHead: function(options) {
	        return builder.create('.' + classNameConst.CELL_HEAD + '.' + classNameConst.CELL_SELECTED)
	            .bg(options.background)
	            .text(options.text)
	            .build();
	    },

	    /**
	     * Generates a css string for focused cells.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    cellFocused: function(options) {
	        var focusLayerRule = classRule(classNameConst.LAYER_FOCUS_BORDER).bg(options.border);
	        var editingLayerRule = classRule(classNameConst.LAYER_EDITING).border(options.border);

	        return builder.buildAll([focusLayerRule, editingLayerRule]);
	    },

	    /**
	     * Generates a css string for editable cells.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    cellEditable: function(options) {
	        return bgTextRuleString(classNameConst.CELL_EDITABLE, options);
	    },

	    /**
	     * Generates a css string for required cells.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    cellRequired: function(options) {
	        return bgTextRuleString(classNameConst.CELL_REQUIRED, options);
	    },

	    /**
	     * Generates a css string for disabled cells.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    cellDisabled: function(options) {
	        return bgTextRuleString(classNameConst.CELL_DISABLED, options);
	    },

	    /**
	     * Generates a css string for dummy cells.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    cellDummy: function(options) {
	        return bgTextRuleString(classNameConst.CELL_DUMMY, options);
	    },

	    /**
	     * Generates a css string for invalid cells.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    cellInvalid: function(options) {
	        return bgTextRuleString(classNameConst.CELL_INVALID, options);
	    },

	    /**
	     * Generates a css string for cells in a current row.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    cellCurrentRow: function(options) {
	        return bgTextRuleString(classNameConst.CELL_CURRENT_ROW, options);
	    }
	};


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	/**
	* @fileoverview CSS Rule string builder
	* @author NHN Ent. FE Development Team
	*/
	'use strict';

	var _ = __webpack_require__(1);

	/**
	 * create css rule string and returns it
	 * @module {theme/cssBuilder}
	 * @param {String} selector - css selector
	 * @param {String} property - css property
	 * @param {String} value - css value
	 * @ignore
	 */
	var CSSRuleBuilder = tui.util.defineClass({
	    init: function(selector) {
	        if (!_.isString(selector) || !selector) {
	            throw new Error('The Selector must be a string and not be empty.');
	        }
	        this._selector = selector;
	        this._propValues = [];
	    },

	    /**
	     * Add a set of css property and value.
	     * @param {String} property - css property
	     * @param {String} value - css value
	     * @returns {CSSRuleBuilder}
	     */
	    add: function(property, value) {
	        if (value) {
	            this._propValues.push(property + ':' + value);
	        }
	        return this;
	    },

	    /**
	     * Shortcut for add('border-color', value)
	     * @param {String} value - css value
	     * @returns {CSSRuleBuilder}
	     */
	    border: function(value) {
	        return this.add('border-color', value);
	    },

	    /**
	     * Add a border-width style to the rule.
	     * @param {Object} options - visible options
	     * @param {Boolean} [options.showVerticalBorder] - whether the vertical border is visible
	     * @param {Boolean} [options.showHorizontalBorder] - whether the horizontal border is visible
	     * @returns {CSSRuleBuilder}
	     */
	    borderWidth: function(options) {
	        var vertical = options.showVerticalBorder;
	        var horizontal = options.showHorizontalBorder;
	        var value;

	        if (_.isBoolean(vertical)) {
	            value = vertical ? '1px' : '0';
	            this.add('border-left-width', value)
	                .add('border-right-width', value);
	        }
	        if (_.isBoolean(horizontal)) {
	            value = horizontal ? '1px' : '0';
	            this.add('border-top-width', value)
	                .add('border-bottom-width', value);
	        }
	        return this;
	    },

	    /**
	     * Shortcut for add('background-color', value)
	     * @param {String} value - css value
	     * @returns {CSSRuleBuilder}
	     */
	    bg: function(value) {
	        return this.add('background-color', value);
	    },

	    /**
	     * Shortcut for add('color', value)
	     * @param {String} value - css value
	     * @returns {CSSRuleBuilder}
	     */
	    text: function(value) {
	        return this.add('color', value);
	    },

	    /**
	     * Create a CSS rule string with a selector and prop-values.
	     * @returns {String}
	     */
	    build: function() {
	        var result = '';

	        if (this._propValues.length) {
	            result = this._selector + '{' + this._propValues.join(';') + '}';
	        }

	        return result;
	    }
	});

	module.exports = {
	    /**
	     * Creates new Builder instance.
	     * @param {String} selector - selector
	     * @returns {CSSRuleBuilder}
	     */
	    create: function(selector) {
	        return new CSSRuleBuilder(selector);
	    },

	    /**
	     * Creates a new Builder instance with a class name selector.
	     * @param {String} className - class name
	     * @returns {Builder}
	     */
	    createClassRule: function(className) {
	        return this.create('.' + className);
	    },

	    /**
	     * Creates an array of new Builder instances for the -webkit-scrollbar styles.
	     * @param {String} selector - selector
	     * @param {Object} options - options
	     * @returns {Array.<CSSRuleBuilder>}
	     */
	    createWebkitScrollbarRules: function(selector, options) {
	        return [
	            this.create(selector + ' ::-webkit-scrollbar').bg(options.background),
	            this.create(selector + ' ::-webkit-scrollbar-thumb').bg(options.thumb),
	            this.create(selector + ' ::-webkit-scrollbar-thumb:hover').bg(options.active)
	        ];
	    },

	    /**
	     * Creates a builder instance for the IE scrollbar styles.
	     * @param {String} selector - selector
	     * @param {Object} options - options
	     * @returns {Array.<CSSRuleBuilder>}
	     */
	    createIEScrollbarRule: function(selector, options) {
	        var bgProps = [
	            'scrollbar-3dlight-color',
	            'scrollbar-darkshadow-color',
	            'scrollbar-track-color',
	            'scrollbar-shadow-color'
	        ];
	        var thumbProps = [
	            'scrollbar-face-color',
	            'scrollbar-highlight-color'
	        ];
	        var ieScrollbarRule = this.create(selector);

	        _.each(bgProps, function(prop) {
	            ieScrollbarRule.add(prop, options.background);
	        });
	        _.each(thumbProps, function(prop) {
	            ieScrollbarRule.add(prop, options.thumb);
	        });
	        ieScrollbarRule.add('scrollbar-arrow-color', options.active);

	        return ieScrollbarRule;
	    },

	    /**
	     * Build all rules and returns the concatenated string.
	     * @param {Array.<Rule>} rules - rule builders
	     * @returns {String}
	     */
	    buildAll: function(rules) {
	        return _.map(rules, function(rule) {
	            return rule.build();
	        }).join('');
	    }
	};


/***/ },
/* 70 */
/***/ function(module, exports) {

	/**
	* @fileoverview default theme preset
	* @author NHN Ent. FE Development Team
	*/
	'use strict';

	module.exports = {
	    grid: {
	        background: '#fff',
	        border: '#ccc',
	        text: '#444'
	    },
	    selection: {
	        background: '#4daaf9',
	        border: '#004082'
	    },
	    toolbar: {
	        border: 'transparent',
	        background: 'transparent'
	    },
	    heightResizeHandle: {
	        border: '#ccc',
	        background: '#fff'
	    },
	    pagination: {
	        border: 'transparent',
	        background: 'transparent'
	    },
	    scrollbar: {
	        background: '#f5f5f5',
	        thumb: '#d9d9d9',
	        active: '#c1c1c1'
	    },
	    cell: {
	        normal: {
	            background: '#fbfbfb',
	            border: '#e0e0e0',
	            showVerticalBorder: true,
	            showHorizontalBorder: true
	        },
	        head: {
	            background: '#eee',
	            border: '#ccc',
	            showVerticalBorder: true,
	            showHorizontalBorder: true
	        },
	        selectedHead: {
	            background: '#d8d8d8'
	        },
	        focused: {
	            border: '#418ed4'
	        },
	        required: {
	            background: '#fffdeb'
	        },
	        editable: {
	            background: '#fff'
	        },
	        disabled: {
	            text: '#b0b0b0'
	        },
	        dummy: {
	            background: '#fff'
	        },
	        invalid: {
	            background: '#ff8080'
	        },
	        evenRow: {},
	        oddRow: {},
	        currentRow: {}
	    }
	};


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	/**
	* @fileoverview default theme preset
	* @author NHN Ent. FE Development Team
	*/
	'use strict';

	var presetDefault = __webpack_require__(70);

	module.exports = $.extend(true, {}, presetDefault, {
	    cell: {
	        normal: {
	            background: '#fff',
	            border: '#e8e8e8',
	            showVerticalBorder: false,
	            showHorizontalBorder: false
	        },
	        oddRow: {
	            background: '#f3f3f3'
	        },
	        evenRow: {
	            background: '#fff'
	        },
	        head: {
	            background: '#fff',
	            showVerticalBorder: false,
	            showHorizontalBorder: false
	        }
	    }
	});


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	/**
	* @fileoverview default theme preset
	* @author NHN Ent. FE Development Team
	*/
	'use strict';

	var presetDefault = __webpack_require__(70);

	module.exports = $.extend(true, {}, presetDefault, {
	    grid: {
	        border: '#c0c0c0'
	    },
	    toolbar: {
	        border: '#e0e0e0'
	    },
	    cell: {
	        normal: {
	            background: '#fff',
	            border: '#e0e0e0',
	            showVerticalBorder: false,
	            showHorizontalBorder: true
	        },
	        head: {
	            background: '#fff',
	            border: '#e0e0e0',
	            showVerticalBorder: false,
	            showHorizontalBorder: true
	        },
	        selectedHead: {
	            background: '#e0e0e0'
	        }
	    }
	});


/***/ },
/* 73 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }
/******/ ]);