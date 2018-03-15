/*!
 * bundle created at "Thu Mar 15 2018 17:28:13 GMT+0900 (KST)"
 * version: 2.9.0
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("underscore"), require("tui-code-snippet"), require("backbone"), require("jquery"), require("tui-date-picker"), require("tui-pagination"));
	else if(typeof define === 'function' && define.amd)
		define(["underscore", "tui-code-snippet", "backbone", "jquery", "tui-date-picker", "tui-pagination"], factory);
	else if(typeof exports === 'object')
		exports["Grid"] = factory(require("underscore"), require("tui-code-snippet"), require("backbone"), require("jquery"), require("tui-date-picker"), require("tui-pagination"));
	else
		root["tui"] = root["tui"] || {}, root["tui"]["Grid"] = factory(root["_"], (root["tui"] && root["tui"]["util"]), root["Backbone"], root["$"], (root["tui"] && root["tui"]["DatePicker"]), (root["tui"] && root["tui"]["Pagination"]));
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_7__, __WEBPACK_EXTERNAL_MODULE_32__, __WEBPACK_EXTERNAL_MODULE_36__) {
return /******/ (function(modules) { // webpackBootstrap
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
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview The entry file of Grid
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var Grid = __webpack_require__(1);

	__webpack_require__(80);

	Grid.setLanguage('en');

	module.exports = Grid;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview The tui.Grid class for the external API.
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var View = __webpack_require__(4);
	var ModelManager = __webpack_require__(6);
	var ViewFactory = __webpack_require__(31);
	var DomEventBus = __webpack_require__(56);
	var DomState = __webpack_require__(57);
	var PublicEventEmitter = __webpack_require__(58);
	var PainterManager = __webpack_require__(59);
	var PainterController = __webpack_require__(69);
	var NetAddOn = __webpack_require__(70);
	var ComponentHolder = __webpack_require__(73);

	var util = __webpack_require__(16);
	var i18n = __webpack_require__(40);
	var themeManager = __webpack_require__(74);
	var themeNameConst = __webpack_require__(10).themeName;

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


/***/ }),
/* 2 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Base class for Views
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var Backbone = __webpack_require__(5);

	/**
	 * Base class for Views
	 * @module base/view
	 * @ignore
	 */
	var View = Backbone.View.extend(/** @lends module:base/view.prototype */{
	    initialize: function() {
	        this._children = [];
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

	module.exports = View;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Model Manager
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var ColumnModelData = __webpack_require__(8);
	var RowListData = __webpack_require__(11);
	var DimensionModel = __webpack_require__(19);
	var CoordRowModel = __webpack_require__(20);
	var CoordColumnModel = __webpack_require__(21);
	var CoordConverterModel = __webpack_require__(22);
	var FocusModel = __webpack_require__(23);
	var RenderModel = __webpack_require__(24);
	var SmartRenderModel = __webpack_require__(27);
	var SelectionModel = __webpack_require__(28);
	var SummaryModel = __webpack_require__(29);
	var ClipboardModel = __webpack_require__(30);
	var util = __webpack_require__(16);

	var defaultOptions = {
	    data: [],
	    columns: [],
	    keyColumnName: null,
	    selectType: '',
	    autoNumbering: true,
	    header: {
	        height: 35,
	        complexColumns: []
	    },
	    columnOptions: {
	        minWidth: 50,
	        resizable: true,
	        frozenCount: 0
	    },
	    fitToParentHeight: false,
	    fixedRowHeight: false,
	    fixedHeight: false,
	    showDummyRows: false,
	    virtualScrolling: false,
	    copyOptions: null,
	    scrollX: true,
	    scrollY: true,
	    useClientSort: true,
	    editingEvent: 'dblclick',
	    rowHeight: 'auto',
	    bodyHeight: 'auto',
	    minRowHeight: 27,
	    minBodyHeight: 130,
	    selectionUnit: 'cell'
	};

	/**
	 * Model Manager
	 * @module model/manager
	 * @param {Object} options - Options to create models
	 * @param {module/domState} domState - DomState instance
	 * @ignore
	 */
	var ModelManager = snippet.defineClass(/** @lends module:modelManager.prototype */{
	    init: function(options, domState, domEventBus) {
	        options = $.extend(true, {}, defaultOptions, options);

	        this.gridId = options.gridId;

	        this.columnModel = this._createColumnModel(options);
	        this.dataModel = this._createDataModel(options, domState, domEventBus);
	        this.dimensionModel = this._createDimensionModel(options, domState, domEventBus);
	        this.coordRowModel = this._createCoordRowModel(domState);
	        this.focusModel = this._createFocusModel(options, domState, domEventBus);
	        this.coordColumnModel = this._createCoordColumnModel(options.columnOptions, domEventBus);
	        this.renderModel = this._createRenderModel(options);
	        this.coordConverterModel = this._createCoordConverterModel();
	        this.selectionModel = this._createSelectionModel(options, domEventBus);
	        this.summaryModel = this._createSummaryModel(options.summary);
	        this.clipboardModel = this._createClipboardModel(options, domEventBus);
	    },

	    /**
	     * Creates an instance of column model and returns it.
	     * @param  {Object} options - Options
	     * @returns {module:data/columnModel} A new instance
	     * @private
	     */
	    _createColumnModel: function(options) {
	        return new ColumnModelData({
	            keyColumnName: options.keyColumnName,
	            frozenCount: options.columnOptions.frozenCount,
	            complexHeaderColumns: options.header.complexColumns,
	            copyOptions: options.copyOptions,
	            columns: options.columns,
	            rowHeaders: options.rowHeaders
	        });
	    },

	    /**
	     * Creates an instance of data model and returns it.
	     * @param  {Object} options - Options
	     * @param  {module:domState} domState - domState
	     * @param  {module:event/domEventBus} domEventBus - domEventBus
	     * @returns {module:data/rowList} - A new instance
	     * @private
	     */
	    _createDataModel: function(options, domState, domEventBus) {
	        return new RowListData([], {
	            gridId: this.gridId,
	            domState: domState,
	            domEventBus: domEventBus,
	            columnModel: this.columnModel,
	            useClientSort: options.useClientSort,
	            publicObject: options.publicObject
	        });
	    },

	    /* eslint-disable complexity */
	    /**
	     * Creates an instance of dimension model and returns it.
	     * @param  {Object} options - Options
	     * @param  {module:domState} domState - domState
	     * @param  {module:event/domEventBus} domEventBus - domEventBus
	     * @returns {module:model/dimension} - A new instance
	     * @private
	     */
	    _createDimensionModel: function(options, domState, domEventBus) {
	        var dimensionModel;
	        var columnOptions = options.columnOptions;
	        var fixedRowHeight = !isNaN(options.rowHeight);
	        var fixedHeight = options.bodyHeight !== 'auto';
	        var minRowHeight = options.minRowHeight;
	        var minBodyHeight = options.minBodyHeight;
	        var rowHeight = fixedRowHeight ? Math.max(minRowHeight, options.rowHeight) : minRowHeight;
	        var bodyHeight = fixedHeight ? Math.max(minBodyHeight, options.bodyHeight) : minBodyHeight;
	        var frozenBorderWidth = _.isUndefined(columnOptions.frozenBorderWidth) ? 1 : columnOptions.frozenBorderWidth;
	        var attrs = {
	            headerHeight: options.header.height,
	            bodyHeight: bodyHeight,
	            summaryHeight: options.summary ? options.summary.height : 0,
	            summaryPosition: options.summary ? (options.summary.position || 'bottom') : null,
	            rowHeight: rowHeight,
	            fitToParentHeight: (options.bodyHeight === 'fitToParent'),
	            scrollX: !!options.scrollX,
	            scrollY: !!options.scrollY,
	            fixedRowHeight: fixedRowHeight,
	            fixedHeight: fixedHeight,
	            minRowHeight: minRowHeight,
	            minBodyHeight: minBodyHeight || rowHeight,
	            minimumColumnWidth: columnOptions.minWidth,
	            frozenBorderWidth: columnOptions.frozenCount ? frozenBorderWidth : null
	        };

	        if (fixedRowHeight === false && options.virtualScrolling) {
	            util.warning('If the virtualScrolling is set to true, the rowHeight must be set to number type.');
	            attrs.fixedRowHeight = true;
	        }

	        dimensionModel = new DimensionModel(attrs, {
	            columnModel: this.columnModel,
	            dataModel: this.dataModel,
	            domState: domState,
	            domEventBus: domEventBus
	        });

	        return dimensionModel;
	    },
	    /* eslint-enable complexity */

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
	     * @param  {Object} columnOptions - Column options
	     * @param {module:event/domEventBus} domEventBus - domEventBus
	     * @returns {module:model/coordColumnModel}
	     * @private
	     */
	    _createCoordColumnModel: function(columnOptions, domEventBus) {
	        var attrs = {
	            resizable: columnOptions.resizable
	        };

	        return new CoordColumnModel(attrs, {
	            columnModel: this.columnModel,
	            dimensionModel: this.dimensionModel,
	            domEventBus: domEventBus
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
	     * @param  {Object} options - options
	     * @param  {module:domState} domState - DomState instance
	     * @param  {module:event/domState} domEventBus - Dom event bus
	     * @returns {module:model/focus} - A new instance
	     * @private
	     */
	    _createFocusModel: function(options, domState, domEventBus) {
	        return new FocusModel(null, {
	            columnModel: this.columnModel,
	            dataModel: this.dataModel,
	            coordRowModel: this.coordRowModel,
	            domEventBus: domEventBus,
	            domState: domState,
	            editingEvent: options.editingEvent
	        });
	    },

	    /**
	     * Creates an instance of seleciton model and returns it.
	     * @param {Object} options - options
	     * @param {module:event/domEventBus} domEventBus - domEventBus
	     * @returns {module:model/selection} - A new instance
	     * @private
	     */
	    _createSelectionModel: function(options, domEventBus) {
	        return new SelectionModel({
	            selectionUnit: options.selectionUnit
	        }, {
	            columnModel: this.columnModel,
	            dataModel: this.dataModel,
	            dimensionModel: this.dimensionModel,
	            coordConverterModel: this.coordConverterModel,
	            coordRowModel: this.coordRowModel,
	            renderModel: this.renderModel,
	            focusModel: this.focusModel,
	            domEventBus: domEventBus
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
	        Constructor = options.virtualScrolling ? SmartRenderModel : RenderModel;

	        return new Constructor(attrs, renderOptions);
	    },

	    /**
	     * Creates an instance of summary model and returns it.
	     * @param  {Object} summaryOptions - summary options
	     * @returns {module:model/summary} - A new instance
	     * @private
	     */
	    _createSummaryModel: function(summaryOptions) {
	        var autoColumnNames = [];

	        if (!summaryOptions || !summaryOptions.columnContent) {
	            return null;
	        }

	        _.each(summaryOptions.columnContent, function(options, columnName) {
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
	     * Creates an instance of clipboard model and returns it
	     * @param {Object} options - options
	     * @param {module:event/domEventBus} domEventBus - domEventBus
	     * @returns {module:model/clipboard}
	     * @private
	     */
	    _createClipboardModel: function(options, domEventBus) {
	        return new ClipboardModel(null, {
	            columnModel: this.columnModel,
	            dataModel: this.dataModel,
	            selectionModel: this.selectionModel,
	            renderModel: this.renderModel,
	            focusModel: this.focusModel,
	            copyOptions: options.copyOptions,
	            domEventBus: domEventBus
	        });
	    },

	    /**
	     * Destroy
	     */
	    destroy: function() {
	        _.each(this, function(value, property) {
	            if (value && snippet.isFunction(value._destroy)) {
	                value._destroy();
	            }
	            if (value && snippet.isFunction(value.stopListening)) {
	                value.stopListening();
	            }
	            this[property] = null;
	        }, this);
	    }
	});

	module.exports = ModelManager;


/***/ }),
/* 7 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_7__;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview 컬럼 모델
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var Model = __webpack_require__(9);
	var frameConst = __webpack_require__(10).frame;

	var defaultRowHeaders = {
	    rowNum: {
	        type: 'rowNum',
	        title: 'No.',
	        name: '_number',
	        align: 'center',
	        fixedWidth: true,
	        width: 60,
	        hidden: false
	    },
	    checkbox: {
	        type: 'checkbox',
	        title: '<input type="checkbox" />',
	        name: '_button',
	        align: 'center',
	        fixedWidth: true,
	        width: 40,
	        hidden: false,
	        editOptions: {
	            type: 'mainButton'
	        }
	    },
	    radio: {
	        type: 'radio',
	        title: 'select',
	        name: '_button',
	        align: 'center',
	        fixedWidth: true,
	        width: 40,
	        hidden: false,
	        editOptions: {
	            type: 'mainButton'
	        }
	    }
	};

	/**
	 * 컬럼 모델 데이터를 다루는 객체
	 * @module model/data/columnModel
	 * @extends module:base/model
	 * @ignore
	 */
	var ColumnModel = Model.extend(/** @lends module:model/data/columnModel.prototype */{
	    initialize: function() {
	        Model.prototype.initialize.apply(this, arguments);
	        this.textType = {
	            normal: true,
	            text: true,
	            password: true
	        };
	        this._setColumns(this.get('rowHeaders'), this.get('columns'));
	        this.on('change', this._onChange, this);
	    },

	    defaults: {
	        keyColumnName: null,
	        frozenCount: 0,
	        rowHeaders: [],
	        dataColumns: [],
	        visibleColumns: [], // 이 리스트는 메타컬럼/데이터컬럼 구분하지 않고 저장
	        selectType: '',
	        columnModelMap: {},
	        relationsMap: {},
	        complexHeaderColumns: [],
	        copyOptions: {
	            useFormattedValue: false
	        }
	    },

	    /**
	     * index 에 해당하는 columnModel 을 반환한다.
	     * @param {Number} index    조회할 컬럼모델의 인덱스 값
	     * @param {Boolean} isVisible [isVisible=false] 화면에 노출되는 컬럼모델 기준으로 찾을것인지 여부.
	     * @returns {object} 조회한 컬럼 모델
	     */
	    at: function(index, isVisible) {
	        var columns = isVisible ? this.getVisibleColumns() : this.get('dataColumns');

	        return columns[index];
	    },

	    /**
	     * columnName 에 해당하는 index를 반환한다.
	     * @param {string} columnName   컬럼명
	     * @param {Boolean} isVisible [isVisible=false] 화면에 노출되는 컬럼모델 기준으로 반환할 것인지 여부.
	     * @returns {number} index   컬럼명에 해당하는 인덱스 값
	     */
	    indexOfColumnName: function(columnName, isVisible) {
	        var columns;

	        if (isVisible) {
	            columns = this.getVisibleColumns();
	        } else {
	            columns = this.get('dataColumns');
	        }

	        return _.findIndex(columns, {name: columnName});
	    },

	    /**
	     * Returns state that the column is included in left side by column name
	     * @param {String} columnName - Column name
	     * @returns {Boolean} Whether the column is included in left side or not
	     */
	    isLside: function(columnName) {
	        var index = this.indexOfColumnName(columnName, true);
	        var frozenCount = this.getVisibleFrozenCount(false);

	        return (index > -1) && (index < frozenCount);
	    },

	    /**
	     * 화면에 노출되는 (!hidden) 컬럼 모델 리스트를 반환한다.
	     * @param {String} [whichSide] 열고정 영역인지, 열고정이 아닌 영역인지 여부. 지정하지 않았을 경우 전체 visibleList를 반환한다.
	     * @param {boolean} [withMeta=false] 메타컬럼 포함 여부. 지정하지 않으면 데이터컬럼리스트 기준으로 반환한다.
	     * @returns {Array}  조회한 컬럼모델 배열
	     */
	    getVisibleColumns: function(whichSide, withMeta) {
	        var startIndex = withMeta ? 0 : this.getVisibleMetaColumnCount();
	        var visibleColumnFixCount = this.getVisibleFrozenCount(withMeta);
	        var columns;

	        whichSide = whichSide && whichSide.toUpperCase();

	        if (whichSide === frameConst.L) {
	            columns = this.get('visibleColumns').slice(startIndex, visibleColumnFixCount);
	        } else if (whichSide === frameConst.R) {
	            columns = this.get('visibleColumns').slice(visibleColumnFixCount);
	        } else {
	            columns = this.get('visibleColumns').slice(startIndex);
	        }

	        return columns;
	    },

	    /**
	     * 현재 보여지고 있는 메타컬럼의 카운트를 반환한다.
	     * @returns {number} count
	     */
	    getVisibleMetaColumnCount: function() {
	        var models = this.get('rowHeaders');
	        var totalLength = models.length;
	        var hiddenLength = _.where(models, {hidden: true}).length;

	        return (totalLength - hiddenLength);
	    },

	    /**
	     * 현재 노출되는 컬럼들 중, 고정된 컬럼들(L-side)의 갯수를 반환한다.
	     * @param {boolean} [withMeta=false] 현재 보여지고 있는 메타컬럼의 count를 합칠지 여부
	     * @returns {number} Visible frozen count
	     */
	    getVisibleFrozenCount: function(withMeta) {
	        var count = this.get('frozenCount');
	        var fixedColumns = _.first(this.get('dataColumns'), count);
	        var visibleFixedColumns, visibleCount;

	        visibleFixedColumns = _.filter(fixedColumns, function(column) {
	            return !column.hidden;
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
	        } else if (columnModel && columnModel.editOptions && columnModel.editOptions.type) {
	            editType = columnModel.editOptions.type;
	        }

	        return editType;
	    },

	    /**
	     * Whether copying the visible text or not
	     * @param {string} columnName - Column name
	     * @returns {boolena} State
	     */
	    copyVisibleTextOfEditingColumn: function(columnName) {
	        var columnModel = this.getColumnModel(columnName);

	        if (snippet.pick(columnModel, 'editOptions', 'listItems')) {
	            return !!snippet.pick(columnModel, 'copyOptions', 'useListItemText');
	        }

	        return false;
	    },

	    /**
	     * 인자로 받은 컬럼 모델에서 !hidden을 만족하는 리스트를 추려서 반환한다.
	     * @param {Array} rowHeaders 메타 컬럼 모델 리스트
	     * @param {Array} dataColumns 데이터 컬럼 모델 리스트
	     * @returns {Array} hidden 이 설정되지 않은 전체 컬럼 모델 리스트
	     * @private
	     */
	    _makeVisibleColumns: function(rowHeaders, dataColumns) {
	        rowHeaders = rowHeaders || this.get('rowHeaders');
	        dataColumns = dataColumns || this.get('dataColumns');

	        return _.filter(rowHeaders.concat(dataColumns), function(item) {
	            return !item.hidden;
	        });
	    },

	    /**
	     * 각 columnModel 의 relations 를 모아 주체가 되는 columnName 기준으로 relationsMap 를 생성하여 반환한다.
	     * @param {Array} columns - Column Model List
	     * @returns {{}|{columnName1: Array, columnName1: Array}} columnName 기준으로 생성된 relationsMap
	     * @private
	     */
	    _getRelationListMap: function(columns) {
	        var relationsMap = {};

	        _.each(columns, function(columnModel) {
	            var columnName = columnModel.name;
	            if (columnModel.relations) {
	                relationsMap[columnName] = columnModel.relations;
	            }
	        });

	        return relationsMap;
	    },

	    /**
	     * ignored 가 true 로 설정된 columnName 의 list 를 반환한다.
	     * @returns {Array} ignored 가 true 로 설정된 columnName 배열.
	     */
	    getIgnoredColumnNames: function() {
	        var dataColumns = this.get('dataColumns');
	        var ignoredColumnNames = [];

	        _.each(dataColumns, function(columnModel) {
	            if (columnModel.ignored) {
	                ignoredColumnNames.push(columnModel.name);
	            }
	        });

	        return ignoredColumnNames;
	    },

	    /**
	     * Set column model by data
	     * @param {array} rowHeaders - Data of row headers
	     * @param {array} columns - Data of columns
	     * @param {number} [frozenCount] Count of frozen column
	     * @private
	     */
	    _setColumns: function(rowHeaders, columns, frozenCount) {
	        var relationsMap, visibleColumns, dataColumns;

	        if (snippet.isUndefined(frozenCount)) {
	            frozenCount = this.get('frozenCount');
	        }

	        rowHeaders = this._getRowHeadersData(rowHeaders);
	        dataColumns = $.extend(true, [], columns);

	        relationsMap = this._getRelationListMap(dataColumns);
	        visibleColumns = this._makeVisibleColumns(rowHeaders, dataColumns);

	        this.set({
	            selectType: this._getSelectType(rowHeaders),
	            rowHeaders: rowHeaders,
	            dataColumns: dataColumns,
	            columnModelMap: _.indexBy(rowHeaders.concat(dataColumns), 'name'),
	            relationsMap: relationsMap,
	            frozenCount: Math.max(0, frozenCount),
	            visibleColumns: visibleColumns
	        }, {
	            silent: true
	        });

	        this.unset('columns', {
	            silent: true
	        });
	        this.trigger('columnModelChange');
	    },

	    /**
	     * Get data of row headers
	     * @param {object} options - Options to set each row header
	     * @returns {array} Row headers data
	     * @private
	     */
	    _getRowHeadersData: function(options) {
	        var rowHeadersData = [];
	        var type, isObject;
	        var defaultData;
	        var hasTitle;

	        _.each(options, function(data) {
	            isObject = _.isObject(data);
	            type = isObject ? data.type : data;
	            defaultData = defaultRowHeaders[type];

	            if (!isObject) {
	                data = defaultData;
	            } else {
	                hasTitle = data.title;
	                data = $.extend({}, defaultData, data);
	            }

	            // Customizing the cell data in the row header
	            if (data.template && !hasTitle && type !== 'rowNum') {
	                data.title = data.template({
	                    className: '',
	                    name: '',
	                    disabled: '',
	                    checked: ''
	                });
	            }

	            // "checkbox" and "radio" should not exist in duplicate
	            if (_.findIndex(rowHeadersData, {name: data.name}) === -1) {
	                rowHeadersData.push(data);
	            }
	        }, this);

	        return rowHeadersData;
	    },

	    /**
	     * Get select type in row headers
	     * @param {array} rowHeaders - Row headers data
	     * @returns {string} Select type
	     * @private
	     */
	    _getSelectType: function(rowHeaders) {
	        var rowHeader = _.findWhere(rowHeaders, {name: '_button'});

	        return rowHeader ? rowHeader.type : '';
	    },

	    /**
	     * change 이벤트 발생시 핸들러
	     * @param {Object} model change 이벤트가 발생한 model 객체
	     * @private
	     */
	    _onChange: function(model) {
	        var changed = model.changed;
	        var frozenCount = changed.frozenCount;
	        var columns = changed.columns || this.get('dataColumns');
	        var rowHeaders = changed.rowHeaders || this.get('rowHeaders');

	        this._setColumns(rowHeaders, columns, frozenCount);
	    },

	    /**
	     * Set 'hidden' property of column model to true or false
	     * @param {Array} columnNames - Column names to set 'hidden' property
	     * @param {boolean} hidden - Hidden flag for setting
	     */
	    setHidden: function(columnNames, hidden) {
	        var name, names, columnModel, visibleColumns;

	        while (columnNames.length) {
	            name = columnNames.shift();
	            columnModel = this.getColumnModel(name);

	            if (columnModel) {
	                columnModel.hidden = hidden;
	            } else {
	                names = this.getUnitColumnNamesIfMerged(name);
	                columnNames.push.apply(columnNames, names);
	            }
	        }

	        visibleColumns = this._makeVisibleColumns(
	            this.get('rowHeaders'),
	            this.get('dataColumns')
	        );
	        this.set('visibleColumns', visibleColumns, {
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
	        var complexHeaderColumns = this.get('complexHeaderColumns');
	        var stackForSearch = [];
	        var searchedNames = [];
	        var name, columnModel, complexHeaderColumn;

	        stackForSearch.push(columnName);
	        while (stackForSearch.length) {
	            name = stackForSearch.shift();
	            columnModel = this.getColumnModel(name);

	            if (columnModel) {
	                searchedNames.push(name);
	            } else {
	                complexHeaderColumn = _.findWhere(complexHeaderColumns, {
	                    name: name
	                });
	                if (complexHeaderColumn) {
	                    stackForSearch.push.apply(stackForSearch, complexHeaderColumn.childNames);
	                }
	            }
	        }

	        return _.uniq(searchedNames);
	    },

	    /**
	     * Returns the copy option of given column.
	     * @param {string} columnName - column name
	     * @returns {{useFormattedValue: boolean}}
	     */
	    getCopyOptions: function(columnName) {
	        var columnModel = this.getColumnModel(columnName);

	        return _.extend({}, this.get('copyOptions'), columnModel.copyOptions);
	    },

	    /**
	     * Set summary contents.
	     * (Just trigger 'setSummaryContent')
	     * @param {string} columnName - columnName
	     * @param {string} contents - HTML string
	     */
	    setSummaryContent: function(columnName, contents) {
	        this.trigger('setSummaryContent', columnName, contents);
	    }
	});

	ColumnModel._defaultRowHeaders = defaultRowHeaders;

	module.exports = ColumnModel;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Base class for Models
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var Backbone = __webpack_require__(5);

	/**
	 * Base class for Models
	 * @module base/model
	 * @ignore
	 */
	var Model = Backbone.Model.extend(/** @lends module:base/model.prototype*/{});

	module.exports = Model;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	* @fileoverview Object that conatins constant values
	* @author NHN Ent. FE Development Team
	*/

	'use strict';

	var _ = __webpack_require__(2);

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
	    },
	    summaryPosition: {
	        TOP: 'top',
	        BOTTOM: 'bottom'
	    }
	};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Grid 의 Data Source 에 해당하는 Collection 정의
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);

	var Collection = __webpack_require__(12);
	var Row = __webpack_require__(13);
	var GridEvent = __webpack_require__(15);

	/**
	 * Raw 데이터 RowList 콜렉션. (DataSource)
	 * Grid.setData 를 사용하여 콜렉션을 설정한다.
	 * @module model/data/rowList
	 * @extends module:base/collection
	 * @param {Array} models - 콜랙션에 추가할 model 리스트
	 * @param {Object} options - 생성자의 option 객체
	 * @ignore
	 */
	var RowList = Collection.extend(/** @lends module:model/data/rowList.prototype */{
	    initialize: function(models, options) {
	        Collection.prototype.initialize.apply(this, arguments);
	        _.assign(this, {
	            columnModel: options.columnModel,
	            domState: options.domState,
	            gridId: options.gridId,
	            lastRowKey: -1,
	            originalRows: [],
	            originalRowMap: {},
	            startIndex: options.startIndex || 1,
	            sortOptions: {
	                columnName: 'rowKey',
	                ascending: true,
	                useClient: (_.isBoolean(options.useClientSort) ? options.useClientSort : true)
	            },

	            /**
	             * Whether the all rows are disabled.
	             * This state is not related to individual state of each rows.
	             * @type {Boolean}
	             */
	            disabled: false,
	            publicObject: options.publicObject
	        });

	        if (!this.sortOptions.useClient) {
	            this.comparator = null;
	        }

	        if (options.domEventBus) {
	            this.listenTo(options.domEventBus, 'click:headerCheck', this._onClickHeaderCheck);
	            this.listenTo(options.domEventBus, 'click:headerSort', this._onClickHeaderSort);
	        }
	    },

	    model: Row,

	    /**
	     * Backbone 이 collection 생성 시 내부적으로 parse 를 호출하여 데이터를 포멧에 맞게 파싱한다.
	     * @param {Array} data  원본 데이터
	     * @returns {Array}  파싱하여 가공된 데이터
	     */
	    parse: function(data) {
	        data = (data && data.contents) || data;

	        return this._formatData(data);
	    },

	    /**
	     * Event handler for 'click:headerCheck' event on domEventBus
	     * @param {module:event/gridEvent} ev - GridEvent
	     * @private
	     */
	    _onClickHeaderCheck: function(ev) {
	        if (ev.checked) {
	            this.checkAll();
	        } else {
	            this.uncheckAll();
	        }
	    },

	    /**
	     * Event handler for 'click:headerSort' event on domEventBus
	     * @param {module:event/gridEvent} ev - GridEvent
	     * @private
	     */
	    _onClickHeaderSort: function(ev) {
	        this.sortByField(ev.columnName);
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
	            extraData.rowSpanData = (extraData && extraData.rowSpanData) || {};
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
	                    // rowSpan 된 row 의 자식 rowSpanData 를 가공한다.
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
	     * originalRows 와 originalRowMap 을 생성한다.
	     * @param {Array} [rowList] rowList 가 없을 시 현재 collection 데이터를 originalRows 로 저장한다.
	     * @returns {Array} format 을 거친 데이터 리스트.
	     */
	    setOriginalRowList: function(rowList) {
	        this.originalRows = rowList ? this._formatData(rowList) : this.toJSON();
	        this.originalRowMap = _.indexBy(this.originalRows, 'rowKey');

	        return this.originalRows;
	    },

	    /**
	     * 원본 데이터 리스트를 반환한다.
	     * @param {boolean} [isClone=true]  데이터 복제 여부.
	     * @returns {Array}  원본 데이터 리스트 배열.
	     */
	    getOriginalRowList: function(isClone) {
	        isClone = _.isUndefined(isClone) ? true : isClone;

	        return isClone ? _.clone(this.originalRows) : this.originalRows;
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
	     * @param {boolean} ascending 오름차순 여부
	     * @param {boolean} requireFetch 서버 데이타의 갱신이 필요한지 여부
	     */
	    setSortOptionValues: function(columnName, ascending, requireFetch) {
	        var options = this.sortOptions,
	            isChanged = false;

	        if (_.isUndefined(columnName)) {
	            columnName = 'rowKey';
	        }
	        if (_.isUndefined(ascending)) {
	            ascending = true;
	        }

	        if (options.columnName !== columnName || options.ascending !== ascending) {
	            isChanged = true;
	        }
	        options.columnName = columnName;
	        options.ascending = ascending;

	        if (isChanged) {
	            this.trigger('sortChanged', {
	                columnName: columnName,
	                ascending: ascending,
	                requireFetch: requireFetch
	            });
	        }
	    },

	    /**
	     * 주어진 컬럼명을 기준으로 오름/내림차순 정렬한다.
	     * @param {string} columnName 정렬할 컬럼명
	     * @param {boolean} ascending 오름차순 여부
	     */
	    sortByField: function(columnName, ascending) {
	        var options = this.sortOptions;

	        if (_.isUndefined(ascending)) {
	            ascending = (options.columnName === columnName) ? !options.ascending : true;
	        }
	        this.setSortOptionValues(columnName, ascending, !options.useClient);

	        if (options.useClient) {
	            this.sort();
	        }
	    },

	    /**
	     * rowList 를 반환한다.
	     * @param {boolean} [checkedOnly=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
	     * @param {boolean} [withRawData=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
	     * @returns {Array} Row List
	     */
	    getRows: function(checkedOnly, withRawData) {
	        var rows, checkedRows;

	        if (checkedOnly) {
	            checkedRows = this.where({
	                '_button': true
	            });
	            rows = [];
	            _.each(checkedRows, function(checkedRow) {
	                rows.push(checkedRow.attributes);
	            }, this);
	        } else {
	            rows = this.toJSON();
	        }

	        return withRawData ? rows : this._removePrivateProp(rows);
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

	        // 정렬 되지 않았을 때만 rowSpan 된 데이터들도 함께 update 한다.
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

	    /* eslint-disable complexity */
	    /**
	     * Backbone 에서 sort() 실행시 내부적으로 사용되는 메소드.
	     * @param {Row} a 비교할 앞의 모델
	     * @param {Row} b 비교할 뒤의 모델
	     * @returns {number} a가 b보다 작으면 -1, 같으면 0, 크면 1. 내림차순이면 반대.
	     */
	    comparator: function(a, b) {
	        var columnName = this.sortOptions.columnName;
	        var ascending = this.sortOptions.ascending;
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

	        if (!ascending) {
	            result = -result;
	        }

	        return result;
	    },
	    /* eslint-enable complexity */

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
	        var row = this.get(rowKey);
	        var rowSpanData, nextRow, removedData, currentIndex;

	        if (!row) {
	            return;
	        }

	        if (options && options.keepRowSpanData) {
	            removedData = _.clone(row.attributes);
	        }

	        currentIndex = this.indexOf(row);
	        rowSpanData = _.clone(row.getRowSpanData());
	        nextRow = this.at(currentIndex + 1);

	        this.remove(row, {
	            silent: true
	        });
	        this._syncRowSpanDataForRemove(rowSpanData, nextRow, removedData);

	        if (options && options.removeOriginalData) {
	            this.setOriginalRowList();
	        }
	        this.trigger('remove', rowKey, currentIndex);
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
	        var columns = this.columnModel.get('dataColumns');
	        var data = {};

	        _.each(columns, function(columnModel) {
	            data[columnModel.name] = '';
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
	                disabled: false,
	                editable: true
	            };

	        obj[columnName] = columnValue;
	        isCheckCellState = _.isUndefined(isCheckCellState) ? true : isCheckCellState;

	        this.forEach(function(row) {
	            if (isCheckCellState) {
	                cellState = row.getCellState(columnName);
	            }
	            if (!cellState.disabled && cellState.editable) {
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
	     * Returns true if there are at least one row modified.
	     * @returns {boolean} - True if there are at least one row modified.
	     */
	    isModified: function() {
	        var modifiedRowsArr = _.values(this.getModifiedRows());

	        return _.some(modifiedRowsArr, function(modifiedRows) {
	            return modifiedRows.length > 0;
	        });
	    },

	    /**
	     * Enables or Disables all rows.
	     * @param  {Boolean} disabled - Whether disabled or not
	     */
	    setDisabled: function(disabled) {
	        if (this.disabled !== disabled) {
	            this.disabled = disabled;
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
	     * @param {Array} ignoredColumns - 비교에서 제외할 컬럼명
	     * @returns {boolean} - 수정여부
	     */
	    _isModifiedRow: function(row, originalRow, ignoredColumns) {
	        var filtered = _.omit(row, ignoredColumns);
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
	     *      @param {boolean} [options.checkedOnly=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
	     *      @param {boolean} [options.withRawData=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
	     *      @param {boolean} [options.rowKeyOnly=false] true 로 설정된 경우 키값만 저장하여 리턴한다.
	     *      @param {Array} [options.ignoredColumns]   행 데이터 중에서 데이터 변경으로 간주하지 않을 컬럼 이름을 배열로 설정한다.
	     * @returns {{createdRows: Array, updatedRows: Array, deletedRows: Array}} options 조건에 해당하는 수정된 rowList 정보
	     */
	    getModifiedRows: function(options) {
	        var withRawData = options && options.withRawData;
	        var checkedOnly = options && options.checkedOnly;
	        var rowKeyOnly = options && options.rowKeyOnly;
	        var original = withRawData ? this.originalRows : this._removePrivateProp(this.originalRows);
	        var current = withRawData ? this.toJSON() : this._removePrivateProp(this.toJSON());
	        var ignoredColumns = options && options.ignoredColumns;
	        var result = {
	            createdRows: [],
	            updatedRows: [],
	            deletedRows: []
	        };

	        original = _.indexBy(original, 'rowKey');
	        current = _.indexBy(current, 'rowKey');
	        ignoredColumns = _.union(ignoredColumns, this.columnModel.getIgnoredColumnNames());

	        // 추가/ 수정된 행 추출
	        _.each(current, function(row, rowKey) {
	            var originalRow = original[rowKey],
	                item = rowKeyOnly ? row.rowKey : _.omit(row, ignoredColumns);

	            if (!checkedOnly || (checkedOnly && this.get(rowKey).get('_button'))) {
	                if (!originalRow) {
	                    result.createdRows.push(item);
	                } else if (this._isModifiedRow(row, originalRow, ignoredColumns)) {
	                    result.updatedRows.push(item);
	                }
	            }
	        }, this);

	        // 삭제된 행 추출
	        _.each(original, function(obj, rowKey) {
	            var item = rowKeyOnly ? obj.rowKey : _.omit(obj, ignoredColumns);
	            if (!current[rowKey]) {
	                result.deletedRows.push(item);
	            }
	        }, this);

	        return result;
	    },

	    /**
	     * data 를 설정한다. setData 와 다르게 setOriginalRowList 를 호출하여 원본데이터를 갱신하지 않는다.
	     * @param {Array} data - 설정할 데이터 배열 값
	     * @param {boolean} [parse=true]  backbone 의 parse 로직을 수행할지 여부
	     * @param {Function} [callback] callback function
	     */
	    resetData: function(data, parse, callback) {
	        if (!data) {
	            data = [];
	        }
	        if (_.isUndefined(parse)) {
	            parse = true;
	        }
	        this.trigger('beforeReset', data.length);

	        this.lastRowKey = -1;
	        this.reset(data, {
	            parse: parse
	        });

	        if (_.isFunction(callback)) {
	            callback();
	        }
	    },

	    /**
	     * data 를 설정하고, setOriginalRowList 를 호출하여 원본데이터를 갱신한다.
	     * @param {Array} data - 설정할 데이터 배열 값
	     * @param {boolean} [parse=true]  backbone 의 parse 로직을 수행할지 여부
	     * @param {function} [callback] 완료시 호출될 함수
	     */
	    setData: function(data, parse, callback) {
	        var wrappedCallback = _.bind(function() {
	            this.setOriginalRowList();
	            if (_.isFunction(callback)) {
	                callback();
	            }
	        }, this);

	        this.resetData(data, parse, wrappedCallback);
	    },

	    /**
	     * setData()를 통해 그리드에 설정된 초기 데이터 상태로 복원한다.
	     * 그리드에서 수정되었던 내용을 초기화하는 용도로 사용한다.
	     */
	    restore: function() {
	        var originalRows = this.getOriginalRowList();
	        this.resetData(originalRows, true);
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

	        if (isDeletableType && cellState.editable && !cellState.disabled) {
	            this.setValue(mainRowKey, columnName, '', silent);
	        }
	    },

	    /**
	     * Calls del() method for multiple cells silently, and trigger 'deleteRange' event
	     * @param {{row: Array.<number>, column: Array.<number>}} range - visible indexes
	     */
	    delRange: function(range) {
	        var columnModels = this.columnModel.getVisibleColumns();
	        var rowIdxes = _.range(range.row[0], range.row[1] + 1);
	        var columnIdxes = _.range(range.column[0], range.column[1] + 1);
	        var rowKeys, columnNames;

	        rowKeys = _.map(rowIdxes, function(idx) {
	            return this.at(idx).get('rowKey');
	        }, this);

	        columnNames = _.map(columnIdxes, function(idx) {
	            return columnModels[idx].name;
	        });

	        _.each(rowKeys, function(rowKey) {
	            _.each(columnNames, function(columnName) {
	                this.del(rowKey, columnName, true);
	                this.get(rowKey).validateCell(columnName, true);
	            }, this);
	        }, this);

	        /**
	         * Occurs when cells are deleted by 'del' key
	         * @event Grid#deleteRange
	         * @type {module:event/gridEvent}
	         * @property {Array} columnNames - columName list of deleted cell
	         * @property {Array} rowKeys - rowKey list of deleted cell
	         * @property {Grid} instance - Current grid instance
	         */
	        this.trigger('deleteRange', new GridEvent(null, {
	            rowKeys: rowKeys,
	            columnNames: columnNames
	        }));
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
	        var errorRows = [];
	        var requiredColumnNames = _.chain(this.columnModel.getVisibleColumns())
	            .filter(function(columnModel) {
	                return columnModel.validation && columnModel.validation.required === true;
	            })
	            .pluck('name')
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
	        var columns = this.columnModel.getVisibleColumns(),
	            rowIdx = data.length + startIdx.row - 1,
	            columnIdx = Math.min(data[0].length + startIdx.column, columns.length) - 1;

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
	            columnName = columnModel.at(columnIdx, true).name;
	            cellState = row.getCellState(columnName);
	            rowSpanData = row.getRowSpanData(columnName);

	            if (cellState.editable && !cellState.disabled && (!rowSpanData || rowSpanData.count >= 0)) {
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

	            if (!buttonState.disabled && buttonState.editable) {
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


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Base class for Collections
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var Backbone = __webpack_require__(5);

	/**
	 * Base class for Collection
	 * @module base/collection
	 * @ignore
	 */
	var Collection = Backbone.Collection.extend(/** @lends module:base/collection.prototype */{
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

	module.exports = Collection;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Grid 의 Data Source 에 해당하는 Model 정의
	 * @author NHN Ent. FE Development Lab
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var Backbone = __webpack_require__(5);
	var snippet = __webpack_require__(3);

	var Model = __webpack_require__(9);
	var ExtraDataManager = __webpack_require__(14);
	var GridEvent = __webpack_require__(15);

	var util = __webpack_require__(16);
	var clipboardUtil = __webpack_require__(17);
	var classNameConst = __webpack_require__(18);

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
	var Row = Model.extend(/** @lends module:model/data/row.prototype */{
	    initialize: function() {
	        Model.prototype.initialize.apply(this, arguments);
	        this.extraDataManager = new ExtraDataManager(this.get('_extraData'));

	        this.columnModel = this.collection.columnModel;
	        this.validateMap = {};
	        this.on('change', this._onChange, this);
	    },

	    idAttribute: 'rowKey',

	    /**
	     * Overrides Backbone's set method for executing onBeforeChange before firing change event.
	     * @override
	     * @param {(Object|string)} key - Model's attribute(s)
	     * @param {*} value - Model's value or options when type of key paramater is object
	     * @param {?Object} options - The value of key or the options object
	     */
	    set: function(key, value, options) {
	        var isObject = _.isObject(key);
	        var changedColumns;

	        // When the "key" parameter's type is object,
	        // the "options" parameter is replaced by the "value" parameter.
	        if (isObject) {
	            options = value;
	        }

	        // When calling set method on initialize, the value of columnModel is undefined.
	        if (this.columnModel && !(options && options.silent)) {
	            if (isObject) {
	                changedColumns = key;
	            } else {
	                changedColumns = {};
	                changedColumns[key] = value;
	            }

	            _.each(changedColumns, function(columnValue, columnName) {
	                if (!this._executeOnBeforeChange(columnName, columnValue)) {
	                    delete changedColumns[columnName];
	                }
	            }, this);

	            Backbone.Model.prototype.set.call(this, changedColumns, options);
	        } else {
	            Backbone.Model.prototype.set.apply(this, arguments);
	        }
	    },

	    /**
	     * Overrides Backbone's parse method for extraData not to be null.
	     * @override
	     * @param  {Object} data - initial data
	     * @returns {Object} - parsed data
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
	     * Event handler for change event in _button (=checkbox)
	     * @param {boolean} checked - Checked state
	     * @private
	     */
	    _triggerCheckboxChangeEvent: function(checked) {
	        var eventObj = {
	            rowKey: this.get('rowKey')
	        };

	        if (checked) {
	            /**
	             * Occurs when a checkbox in row header is checked
	             * @event Grid#check
	             * @type {module:event/gridEvent}
	             * @property {number} rowKey - rowKey of the checked row
	             * @property {Grid} instance - Current grid instance
	             */
	            this.trigger('check', eventObj);
	        } else {
	            /**
	             * Occurs when a checkbox in row header is unchecked
	             * @event Grid#uncheck
	             * @type {module:event/gridEvent}
	             * @property {number} rowKey - rowKey of the unchecked row
	             * @property {Grid} instance - Current grid instance
	             */
	            this.trigger('uncheck', eventObj);
	        }
	    },

	    /**
	     * Event handler for 'change' event.
	     * Executes callback functions, sync rowspan data, and validate data.
	     * @private
	     */
	    _onChange: function() {
	        var publicChanged = _.omit(this.changed, PRIVATE_PROPERTIES);

	        if (_.has(this.changed, '_button')) {
	            this._triggerCheckboxChangeEvent(this.changed._button);
	        }

	        if (this.isDuplicatedPublicChanged(publicChanged)) {
	            return;
	        }

	        _.each(publicChanged, function(value, columnName) {
	            var columnModel = this.columnModel.getColumnModel(columnName);

	            if (!columnModel) {
	                return;
	            }

	            this.collection.syncRowSpannedData(this, columnName, value);
	            this._executeOnAfterChange(columnName);
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
	        var validation = this.columnModel.getColumnModel(columnName).validation;
	        var errorCode = '';
	        var value;

	        if (validation) {
	            value = this.get(columnName);

	            if (validation.required && util.isBlank(value)) {
	                errorCode = VALID_ERR_REQUIRED;
	            } else if (validation.dataType === 'number' && !_.isNumber(value)) {
	                errorCode = VALID_ERR_TYPE_NUMBER;
	            }
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
	     * Create the GridEvent object when executing changeCallback defined on columnModel
	     * @param {String} columnName - Column name
	     * @param {?String} columnValue - Column value
	     * @returns {GridEvent} Event object to be passed to changeCallback
	     * @private
	     */
	    _createChangeCallbackEvent: function(columnName, columnValue) {
	        return new GridEvent(null, {
	            rowKey: this.get('rowKey'),
	            columnName: columnName,
	            value: columnValue,
	            instance: this.collection.publicObject
	        });
	    },

	    /**
	     * Executes the onChangeBefore callback function.
	     * @param {String} columnName - Column name
	     * @param {String} columnValue - Column value
	     * @returns {boolean}
	     * @private
	     */
	    _executeOnBeforeChange: function(columnName, columnValue) {
	        var columnModel = this.columnModel.getColumnModel(columnName);
	        var changed = (this.get(columnName) !== columnValue);
	        var gridEvent;

	        if (changed && columnModel && columnModel.onBeforeChange) {
	            gridEvent = this._createChangeCallbackEvent(columnName, columnValue);
	            columnModel.onBeforeChange(gridEvent);

	            return !gridEvent.isStopped();
	        }

	        return true;
	    },

	    /**
	     * Execuetes the onAfterChange callback function.
	     * @param {String} columnName - Column name
	     * @returns {boolean}
	     * @private
	     */
	    _executeOnAfterChange: function(columnName) {
	        var columnModel = this.columnModel.getColumnModel(columnName);
	        var columnValue = this.get(columnName);
	        var gridEvent;

	        if (columnModel.onAfterChange) {
	            gridEvent = this._createChangeCallbackEvent(columnName, columnValue);
	            columnModel.onAfterChange(gridEvent);

	            return !gridEvent.isStopped();
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
	     * @returns {{disabled: boolean, isDisabledCheck: boolean, isChecked: boolean}} rowState 정보
	     */
	    getRowState: function() {
	        return this.extraDataManager.getRowState();
	    },

	    /* eslint-disable complexity */
	    /**
	     * Returns an array of all className, related with given columnName.
	     * @param {String} columnName - Column name
	     * @returns {Array.<String>} - An array of classNames
	     */
	    getClassNameList: function(columnName) {
	        var columnModel = this.columnModel.getColumnModel(columnName);
	        var isMetaColumn = util.isMetaColumn(columnName);
	        var classNameList = this.extraDataManager.getClassNameList(columnName);
	        var cellState = this.getCellState(columnName);

	        if (columnModel.className) {
	            classNameList.push(columnModel.className);
	        }
	        if (columnModel.ellipsis) {
	            classNameList.push(classNameConst.CELL_ELLIPSIS);
	        }
	        if (columnModel.validation && columnModel.validation.required) {
	            classNameList.push(classNameConst.CELL_REQUIRED);
	        }
	        if (isMetaColumn) {
	            classNameList.push(classNameConst.CELL_HEAD);
	        } else if (cellState.editable) {
	            classNameList.push(classNameConst.CELL_EDITABLE);
	        }
	        if (cellState.disabled) {
	            classNameList.push(classNameConst.CELL_DISABLED);
	        }

	        return this._makeUniqueStringArray(classNameList);
	    },
	    /* eslint-enable complexity */

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
	     * @returns {{editable: boolean, disabled: boolean}}
	     */
	    getCellState: function(columnName) {
	        var notEditableTypeList = ['_number', 'normal'],
	            columnModel = this.columnModel,
	            disabled = this.collection.disabled,
	            editable = true,
	            editType = columnModel.getEditType(columnName),
	            rowState, relationResult;

	        relationResult = this.executeRelationCallbacksAll(['disabled', 'editable'])[columnName];
	        rowState = this.getRowState();

	        if (!disabled) {
	            if (columnName === '_button') {
	                disabled = rowState.disabledCheck;
	            } else {
	                disabled = rowState.disabled;
	            }
	            disabled = disabled || !!(relationResult && relationResult.disabled);
	        }

	        if (_.contains(notEditableTypeList, editType)) {
	            editable = false;
	        } else {
	            editable = !(relationResult && relationResult.editable === false);
	        }

	        return {
	            editable: editable,
	            disabled: disabled
	        };
	    },

	    /**
	     * Returns whether the cell identified by a given column name is editable.
	     * @param {String} columnName - column name
	     * @returns {Boolean}
	     */
	    isEditable: function(columnName) {
	        var cellState = this.getCellState(columnName);

	        return !cellState.disabled && cellState.editable;
	    },

	    /**
	     * Returns whether the cell identified by a given column name is disabled.
	     * @param {String} columnName - column name
	     * @returns {Boolean}
	     */
	    isDisabled: function(columnName) {
	        var cellState = this.getCellState(columnName);

	        return cellState.disabled;
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
	     * @param {Object} data - rowSpan 정보를 가진 객체
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
	     * List type 의 경우 데이터 값과 editOptions.listItems 의 text 값이 다르기 때문에
	     * text 로 전환해서 반환할 때 처리를 하여 변환한다.
	     *
	     * @param {string} columnName - Column name
	     * @param {boolean} useText - Whether returns concatenated text or values
	     * @returns {string} Concatenated text or values of "listItems" option
	     * @private
	     */
	    _getStringOfListItems: function(columnName, useText) {
	        var value = this.get(columnName);
	        var columnModel = this.columnModel.getColumnModel(columnName);
	        var resultListItems, editOptionList, typeExpected, valueList, hasListItems;

	        if (snippet.isExisty(snippet.pick(columnModel, 'editOptions', 'listItems'))) {
	            resultListItems = this.executeRelationCallbacksAll(['listItems'])[columnName];
	            hasListItems = resultListItems && resultListItems.listItems;
	            editOptionList = hasListItems ? resultListItems.listItems : columnModel.editOptions.listItems;

	            typeExpected = typeof editOptionList[0].value;
	            valueList = util.toString(value).split(',');

	            if (typeExpected !== typeof valueList[0]) {
	                valueList = _.map(valueList, function(val) {
	                    return util.convertValueType(val, typeExpected);
	                });
	            }

	            _.each(valueList, function(val, index) {
	                var item = _.findWhere(editOptionList, {value: val});
	                var str = (item && (useText ? item.text : item.value)) || '';

	                valueList[index] = str;
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
	     * @param {Object} publicChanged 비교할 객체
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
	     * @param {string} columnName - column name
	     * @returns {string}
	     */
	    getValueString: function(columnName) {
	        var columnModel = this.columnModel;
	        var copyText = columnModel.copyVisibleTextOfEditingColumn(columnName);
	        var editType = columnModel.getEditType(columnName);
	        var column = columnModel.getColumnModel(columnName);
	        var value = this.get(columnName);

	        if (this._isListType(editType)) {
	            if (snippet.isExisty(snippet.pick(column, 'editOptions', 'listItems', 0, 'value'))) {
	                value = this._getStringOfListItems(columnName, copyText);
	            } else {
	                throw new Error('Check "' + columnName +
	                    '"\'s editOptions.listItems property out in your ColumnModel.');
	            }
	        } else if (editType === 'password') {
	            value = '';
	        }

	        value = util.toString(value);

	        // When the value is indcluding newline text,
	        // adding one more quotation mark and putting quotation marks on both sides.
	        value = clipboardUtil.addDoubleQuotes(value);

	        return value;
	    },

	    /**
	     * 컬럼모델에 정의된 relation 들을 수행한 결과를 반환한다. (기존 affectOption)
	     * @param {Array} attrNames 반환값의 결과를 확인할 대상 callbackList.
	     *        (default : ['listItems', 'disabled', 'editable'])
	     * @returns {{}|{columnName: {attribute: *}}} row 의 columnName 에 적용될 속성값.
	     */
	    executeRelationCallbacksAll: function(attrNames) {
	        var rowData = this.attributes;
	        var relationsMap = this.columnModel.get('relationsMap');
	        var result = {};

	        if (_.isEmpty(attrNames)) {
	            attrNames = ['listItems', 'disabled', 'editable'];
	        }

	        _.each(relationsMap, function(relations, columnName) {
	            var value = rowData[columnName];

	            _.each(relations, function(relation) {
	                this._executeRelationCallback(relation, attrNames, value, rowData, result);
	            }, this);
	        }, this);

	        return result;
	    },

	    /**
	     * Executes relation callback
	     * @param {Object} relation - relation object
	     *   @param {array} relation.targetNames - target column list
	     *   @param {function} [relation.disabled] - callback function for disabled attribute
	     *   @param {function} [relation.editable] - callback function for disabled attribute
	     *   @param {function} [relation.listItems] - callback function for changing option list
	     * @param {array} attrNames - an array of callback names
	     * @param {(string|number)} value - cell value
	     * @param {Object} rowData - all value of the row
	     * @param {Object} result - object to store the result of callback functions
	     * @private
	     */
	    _executeRelationCallback: function(relation, attrNames, value, rowData, result) {
	        var rowState = this.getRowState();
	        var targetNames = relation.targetNames;

	        _.each(attrNames, function(attrName) {
	            var callback;

	            if (!rowState.disabled || attrName !== 'disabled') {
	                callback = relation[attrName];
	                if (typeof callback === 'function') {
	                    _.each(targetNames, function(targetName) {
	                        result[targetName] = result[targetName] || {};
	                        result[targetName][attrName] = callback(value, rowData);
	                    }, this);
	                }
	            }
	        }, this);
	    }
	}, {
	    privateProperties: PRIVATE_PROPERTIES
	});

	module.exports = Row;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Grid 의 Data Source 에 해당하는 Model 정의
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	/**
	 * Data 중 각 행의 데이터 모델 (DataSource)
	 * @module data/row
	 * @param {Object} data - Data object
	 * @extends module:base/model
	 * @ignore
	 */
	var ExtraDataManager = snippet.defineClass(/** @lends module:model/data/extraData.prototype */{
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
	     * @returns {{disabled: boolean, disabledCheck: boolean, checked: boolean}} rowState 정보
	     */
	    getRowState: function() {
	        var result = {
	            disabledCheck: false,
	            disabled: false,
	            checked: false
	        };

	        switch (this.data.rowState) {
	            case 'DISABLED':
	                result.disabled = true;
	                // intentional no break
	            case 'DISABLED_CHECK': // eslint-disable-line no-fallthrough
	                result.disabledCheck = true;
	                break;
	            case 'CHECKED':
	                result.checked = true;
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

	        if (snippet.inArray(className, classNameList) === -1) {
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
	        // 배열 요소가 'class1 class2' 와 같이 두개 이상의 className을 포함할 수 있어, join & split 함.
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

	        if (snippet.pick(classNameData, 'column', columnName)) {
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


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Event class for public event of Grid
	 * @author NHN Ent. FE Development Lab
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var util = __webpack_require__(16);
	var attrNameConst = __webpack_require__(10).attrName;
	var targetTypeConst = {
	    ROW_HEAD: 'rowHead',
	    COLUMN_HEAD: 'columnHead',
	    DUMMY: 'dummy',
	    CELL: 'cell',
	    ETC: 'etc'
	};

	/**
	 * Event class for public event of Grid
	 * @module event/gridEvent
	 * @param {Object} data - Event data for handler
	 */
	var GridEvent = snippet.defineClass(/** @lends module:event/gridEvent.prototype */{
	    init: function(nativeEvent, data) {
	        this._stopped = false;
	        if (nativeEvent) {
	            this.nativeEvent = nativeEvent;
	        }
	        if (data) {
	            this.setData(data);
	        }
	    },

	    /**
	     * Sets data
	     * @param {Object} data - data
	     * @ignore
	     */
	    setData: function(data) {
	        _.extend(this, data);
	    },

	    /**
	     * Stops propogation of this event.
	     */
	    stop: function() {
	        this._stopped = true;
	    },

	    /**
	     * Returns whether this event is stopped.
	     * @returns {Boolean}
	     * @ignore
	     */
	    isStopped: function() {
	        return this._stopped;
	    }
	});

	/**
	 * Returns the information of event target
	 * @param {jQuery} $target - event target
	 * @returns {{targetType: string, rowKey: (number|string), columnName: string}}
	 * @ignore
	 */
	GridEvent.getTargetInfo = function($target) {
	    var $cell = $target.closest('td');
	    var targetType = targetTypeConst.ETC;
	    var rowKey, columnName;

	    if ($cell.length === 1) {
	        rowKey = $cell.attr(attrNameConst.ROW_KEY);
	        columnName = $cell.attr(attrNameConst.COLUMN_NAME);

	        if (rowKey && columnName) {
	            if (util.isMetaColumn(columnName)) {
	                targetType = targetTypeConst.ROW_HEAD;
	            } else {
	                targetType = targetTypeConst.CELL;
	            }
	        } else {
	            targetType = targetTypeConst.DUMMY;
	        }
	    } else {
	        $cell = $target.closest('th');

	        if ($cell.length === 1) {
	            columnName = $cell.attr(attrNameConst.COLUMN_NAME);
	            targetType = targetTypeConst.COLUMN_HEAD;
	        }
	    }

	    return util.pruneObject({
	        targetType: targetType,
	        rowKey: util.strToNumber(rowKey),
	        columnName: columnName
	    });
	};

	GridEvent.targetTypeConst = targetTypeConst;

	module.exports = GridEvent;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	* @fileoverview 유틸리티 메서드 모음
	* @author NHN Ent. FE Development Team
	*/

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var CELL_BORDER_WIDTH = __webpack_require__(10).dimension.CELL_BORDER_WIDTH;
	var util;

	/**
	 * Decode URI
	 * @param {string} uri - URI
	 * @param {boolean} mod - Whether maintaining "%25" or not
	 * @returns {string} Decoded URI
	 * @ignore
	 */
	function decodeURIComponentSafe(uri, mod) {
	    var decodedURI = '';
	    var i = 0;
	    var length, arr, tempDecodedURI;

	    mod = !!(mod);
	    arr = uri.split(/(%(?:d0|d1)%.{2})/);

	    for (length = arr.length; i < length; i += 1) {
	        try {
	            tempDecodedURI = decodeURIComponent(arr[i]);
	        } catch (e) {
	            tempDecodedURI = mod ? arr[i].replace(/%(?!\d+)/g, '%25') : arr[i];
	        }

	        decodedURI += tempDecodedURI;
	    }

	    return decodedURI;
	}

	/**
	* util 모듈
	* @module util
	* @ignore
	*/
	util = {
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
	     * Convert a string value to number.
	     * If the value cannot be converted to number, returns original value.
	     * @param {string} str - string value
	     * @returns {number|string}
	     */
	    strToNumber: function(str) {
	        var converted = Number(str);

	        return isNaN(converted) ? str : converted;
	    },

	    /**
	     * Omits all undefined or null properties of given object.
	     * @param {Object} obj - object
	     * @returns {Object}
	     */
	    pruneObject: function(obj) {
	        var pruned = {};
	        _.each(obj, function(value, key) {
	            if (!_.isUndefined(value) && !_.isNull(value)) {
	                pruned[key] = value;
	            }
	        });

	        return pruned;
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
	    isEqual: function(target, dist) { // eslint-disable-line complexity
	        var compareObject = function(targetObj, distObj) {
	            var result = false;

	            snippet.forEach(targetObj, function(item, key) {
	                result = (item === distObj[key]);

	                return result;
	            });

	            return result;
	        };
	        var result = true;
	        var isDiff;

	        if (typeof target !== typeof dist) {
	            result = false;
	        } else if (_.isArray(target) && target.length !== dist.length) {
	            result = false;
	        } else if (_.isObject(target)) {
	            isDiff = !compareObject(target, dist) || !compareObject(dist, target);

	            result = !isDiff;
	        } else if (target !== dist) {
	            result = false;
	        }

	        return result;
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
	        if (snippet.hasEncodableString(htmlString)) {
	            if (/<img/i.test(htmlString)) {
	                matchResult = htmlString.match(/<img[^>]*\ssrc=["']?([^>"']+)["']?[^>]*>/i);
	                htmlString = matchResult ? matchResult[1] : '';
	            } else {
	                htmlString = htmlString.replace(/<button.*?<\/button>/gi, '');
	            }
	            htmlString = $.trim(snippet.decodeHTMLEntity(
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
	            value = encodeURIComponent(unescape(value));
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
	            value = decodeURIComponentSafe(tmp[1]);

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
	     * Data.Row 의 List 형태에서 editOptions.listItems 에서 검색을 위해,
	     * value type 해당 type 에 맞게 변환한다.
	     * @memberof module:util
	     * @param {*} value 컨버팅할 value
	     * @param {String} type 컨버팅 될 타입
	     * @returns {*}  타입 컨버팅된 value
	     */
	    convertValueType: function(value, type) {
	        var result = value;

	        if (type === 'string') {
	            result = String(value);
	        } else if (type === 'number') {
	            result = Number(value);
	        } else if (type === 'boolean') {
	            result = Boolean(value);
	        }

	        return result;
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
	     * Outputs a warning message to the web console.
	     * @param {string} message - message
	     */
	    warning: function(message) {
	        /* eslint-disable no-console */
	        if (console && console.warn) {
	            console.warn(message);
	        }
	        /* eslint-enable no-console */
	    },

	    /**
	     * Replace text
	     * @param {string} text - Text including handlebar expression
	     * @param {Object} values - Replaced values
	     * @returns {string} Replaced text
	     */
	    replaceText: function(text, values) {
	        return text.replace(/\{\{(\w*)\}\}/g, function(value, prop) {
	            return values.hasOwnProperty(prop) ? values[prop] : '';
	        });
	    },

	    /**
	     * Detect right button by mouse event
	     * @param {object} ev - Mouse event
	     * @returns {boolea} State
	     */
	    isRightClickEvent: function(ev) {
	        var rightClick;

	        ev = ev || window.event;

	        if (ev.which) {
	            rightClick = ev.which === 3;
	        } else if (ev.button) {
	            rightClick = ev.button === 2;
	        }

	        return rightClick;
	    }
	};

	module.exports = util;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Utilities for clipboard data
	 * @author NHN Ent. Fe Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);

	var CUSTOM_LF_SUBCHAR = '___tui_grid_lf___';
	var CUSTOM_CR_SUBCHAR = '___tui_grid_cr___';
	var CUSTOM_LF_REGEXP = new RegExp(CUSTOM_LF_SUBCHAR, 'g');
	var CUSTOM_CR_REGEXP = new RegExp(CUSTOM_CR_SUBCHAR, 'g');
	var LF = '\n';
	var CR = '\r';

	var clipboardUtil;

	/**
	 * Set to the data matrix as colspan & rowspan range
	 * @param {string} value - Text from getting td element
	 * @param {array} data - Data matrix to set value
	 * @param {array} colspanRange - colspan range (ex: [start,Index endIndex])
	 * @param {array} rowspanRange - rowspan range (ex: [start,Index endIndex])
	 * @private
	 */
	function setDataInSpanRange(value, data, colspanRange, rowspanRange) {
	    var startColspan = colspanRange[0];
	    var endColspan = colspanRange[1];
	    var startRowspan = rowspanRange[0];
	    var endRowspan = rowspanRange[1];
	    var cIndex, rIndex;

	    for (rIndex = startRowspan; rIndex < endRowspan; rIndex += 1) {
	        for (cIndex = startColspan; cIndex < endColspan; cIndex += 1) {
	            data[rIndex][cIndex] = ((startRowspan === rIndex) &&
	                                    (startColspan === cIndex)) ? value : ' ';
	        }
	    }
	}

	/**
	 * @module clipboardUtil
	 * @ignore
	 */
	clipboardUtil = {
	    /**
	     * Convert cell data of table to clipboard data
	     * @param {HTMLElement} table - Table element
	     * @returns {array} clipboard data (2*2 matrix)
	     */
	    convertTableToData: function(table) {
	        var data = [];
	        var rows = table.rows;
	        var index = 0;
	        var length = rows.length;
	        var columnIndex, colspanRange, rowspanRange;

	        // Step 1: Init the data matrix
	        for (; index < length; index += 1) {
	            data[index] = [];
	        }

	        // Step 2: Traverse the table
	        _.each(rows, function(tr, rowIndex) {
	            columnIndex = 0;

	            _.each(tr.cells, function(td) {
	                while (data[rowIndex][columnIndex]) {
	                    columnIndex += 1;
	                }

	                colspanRange = [columnIndex, columnIndex + (td.colSpan || 1)];
	                rowspanRange = [rowIndex, rowIndex + (td.rowSpan || 1)];

	                // Step 3: Set the value of td element to the data matrix as colspan and rowspan ranges
	                setDataInSpanRange(td.innerText, data, colspanRange, rowspanRange);

	                columnIndex = colspanRange[1];
	            });
	        });

	        return data;
	    },

	    /**
	     * Convert plain text to clipboard data
	     * @param {string} text - Copied plain text
	     * @returns {array} clipboard data (2*2 matrix)
	     */
	    convertTextToData: function(text) {
	        // Each newline cell data is wrapping double quotes in the text and
	        // newline characters should be replaced with substitution characters temporarily
	        // before spliting the text by newline characters.
	        text = clipboardUtil.replaceNewlineToSubchar(text);

	        return _.map(text.split(/\r?\n/), function(row) {
	            return _.map(row.split('\t'), function(column) {
	                column = clipboardUtil.removeDoubleQuotes(column);

	                return column.replace(CUSTOM_LF_REGEXP, LF)
	                    .replace(CUSTOM_CR_REGEXP, CR);
	            });
	        });
	    },

	    /**
	     * Add double quotes on text when including newline characters
	     * @param {string} text - Original text
	     * @returns {string} Replaced text
	     */
	    addDoubleQuotes: function(text) {
	        if (text.match(/\r?\n/g)) {
	            text = '"' + text.replace(/"/g, '""') + '"';
	        }

	        return text;
	    },

	    /**
	     * Remove double quetes on text when including substitution characters
	     * @param {string} text - Original text
	     * @returns {string} Replaced text
	     */
	    removeDoubleQuotes: function(text) {
	        if (text.match(CUSTOM_LF_REGEXP)) {
	            text = text.substring(1, text.length - 1)
	                .replace(/""/g, '"');
	        }

	        return text;
	    },

	    /**
	     * Replace newline characters to substitution characters
	     * @param {string} text - Original text
	     * @returns {string} Replaced text
	     */
	    replaceNewlineToSubchar: function(text) {
	        return text.replace(/"([^"]|"")*"/g, function(value) {
	            return value.replace(LF, CUSTOM_LF_SUBCHAR)
	                .replace(CR, CUSTOM_CR_SUBCHAR);
	        });
	    }
	};

	clipboardUtil.CUSTOM_LF_SUBCHAR = CUSTOM_LF_SUBCHAR;
	clipboardUtil.CUSTOM_CR_SUBCHAR = CUSTOM_CR_SUBCHAR;

	module.exports = clipboardUtil;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	* @fileoverview class name constants.
	* @author NHN Ent. FE Development Team
	*/

	'use strict';

	var _ = __webpack_require__(2);

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
	    LAYER_FOCUS_DEACTIVE: 'layer-focus-deactive',
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
	    SUMMARY_AREA: 'summary-area',
	    SUMMARY_AREA_TOP: 'summary-area-top',
	    SUMMARY_AREA_BOTTOM: 'summary-area-bottom',
	    SUMMARY_AREA_RIGHT: 'summary-area-right',
	    SUMMARY_AREA_RIGHT_TOP: 'summary-area-right-top',
	    SUMMARY_AREA_RIGHT_BOTTOM: 'summary-area-right-bottom',

	    FROZEN_BORDER_TOP: 'frozen-border-top',
	    FROZEN_BORDER_BOTTOM: 'frozen-border-bottom',

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

	    // row style
	    ROW_ODD: 'row-odd',
	    ROW_EVEN: 'row-even',

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

	    // height resize handle
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


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview module:model/dimension
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);

	var Model = __webpack_require__(9);
	var constMap = __webpack_require__(10);
	var dimensionConstMap = constMap.dimension;
	var summaryPositionConst = constMap.summaryPosition;

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
	var Dimension = Model.extend(/** @lends module:model/dimension.prototype */{
	    initialize: function(attrs, options) {
	        Model.prototype.initialize.apply(this, arguments);

	        this.columnModel = options.columnModel;
	        this.dataModel = options.dataModel;
	        this.domState = options.domState;

	        this.on('change:fixedHeight', this._resetSyncHeightHandler);
	        this.on('change:bodyHeight', this._onChangeBodyHeight);

	        if (options.domEventBus) {
	            this.listenTo(options.domEventBus, 'windowResize', this._onResizeWindow);
	            this.listenTo(options.domEventBus, 'dragmove:resizeHeight',
	                _.debounce(_.bind(this._onDragMoveForHeight, this)));
	        }

	        this._resetSyncHeightHandler();
	    },

	    defaults: {
	        offsetLeft: 0,
	        offsetTop: 0,

	        width: 0,

	        headerHeight: 0,
	        bodyHeight: 0,

	        summaryHeight: 0,
	        summaryPosition: null,

	        resizeHandleHeight: 0,
	        paginationHeight: 0,

	        rowHeight: 0,
	        totalRowHeight: 0,
	        fixedRowHeight: true,

	        rsideWidth: 0,
	        lsideWidth: 0,

	        minimumColumnWidth: 0,
	        scrollBarSize: 17,
	        scrollX: true,
	        scrollY: true,
	        fitToParentHeight: false,
	        fixedHeight: false,

	        minRowHeight: 0,
	        minBodyHeight: 0,

	        frozenBorderWidth: null
	    },

	    /**
	     * Event handler for 'windowResize' event on domEventBus
	     * @private
	     */
	    _onResizeWindow: function() {
	        this.refreshLayout();
	    },

	    /**
	     * Event handler for 'dragmmove:resizeHgith' event on domEventBus
	     * @param {module:event/gridEvent} ev - GridEvent
	     * @private
	     */
	    _onDragMoveForHeight: function(ev) {
	        var height = ev.pageY - this.get('offsetTop') - ev.startData.mouseOffsetY;

	        this.setHeight(height);
	    },

	    /**
	     * Event handler for changing 'bodyHeight' value
	     * @param {object} model - dimension model
	     * @private
	     */
	    _onChangeBodyHeight: function(model) {
	        var changed = model.changed;
	        var changedTotalRowHeight = changed.totalRowHeight;
	        var changedBodyHeight = changed.bodyHeight;

	        if (!changedTotalRowHeight && changedBodyHeight) {
	            this.set('fixedHeight', (changedBodyHeight !== 'auto'));
	        }
	    },

	    /**
	     * Attach/Detach event handler of change:totalRowHeight event based on the fixedHeight.
	     * @private
	     */
	    _resetSyncHeightHandler: function() {
	        if (this.get('fixedHeight')) {
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
	        var realBodyHeight = this.get('totalRowHeight') + this.getScrollXHeight();
	        var minBodyHeight = this.get('minBodyHeight');
	        var bodyHeight = Math.max(minBodyHeight, realBodyHeight);

	        this.set('bodyHeight', bodyHeight);
	    },

	    /**
	     * Returns whether division border (between meta column and data column) is doubled or not.
	     * Division border should be doubled only if visible fixed data column exists.
	     * @returns {Boolean}
	     */
	    isDivisionBorderDoubled: function() {
	        return this.columnModel.getVisibleFrozenCount() > 0;
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

	        if (this.hasFrozenBorder()) {
	            availableTotalWidth -= this.get('frozenBorderWidth');
	        }

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
	        var extraHeight = this.get('headerHeight') + this.get('summaryHeight') + TABLE_BORDER_WIDTH;

	        return height - extraHeight;
	    },

	    /**
	     * Returns the minimum height of table body.
	     * @returns {number} The minimum height of table body
	     * @private
	     */
	    _getMinBodyHeight: function() {
	        return this.get('minBodyHeight') + (CELL_BORDER_WIDTH * 2) + this.getScrollXHeight();
	    },

	    /**
	     * 열 고정 영역의 minimum width 값을 구한다.
	     * @returns {number} 열고정 영역의 최소 너비값.
	     * @private
	     */
	    _getMinLeftSideWidth: function() {
	        var minimumColumnWidth = this.get('minimumColumnWidth');
	        var columnFrozenCount = this.columnModel.getVisibleFrozenCount(true);
	        var minWidth = 0;
	        var borderWidth;

	        if (columnFrozenCount) {
	            borderWidth = (columnFrozenCount + 1) * CELL_BORDER_WIDTH;
	            minWidth = borderWidth + (minimumColumnWidth * columnFrozenCount);
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
	     * Set the width of the dimension.
	     * @param {number} width - Width
	     */
	    setWidth: function(width) {
	        if (width > 0) {
	            this.set('width', width);
	            this.trigger('setWidth', width);
	        }
	    },

	    /**
	     * Sets the height of the dimension.
	     * (Resets the bodyHeight relative to the dimension height)
	     * @param  {number} height - The height of the dimension
	     * @private
	     */
	    setHeight: function(height) {
	        if (height > 0) {
	            this.set('bodyHeight', Math.max(this._calcRealBodyHeight(height), this._getMinBodyHeight()));
	        }
	    },

	    /**
	     * Returns the height of the dimension.
	     * @returns {Number} Height
	     */
	    getHeight: function() {
	        return this.get('bodyHeight') + this.get('headerHeight');
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
	            this.setHeight(domState.getParentHeight());
	        }
	    },

	    /**
	     * Returns the offset.top of body
	     * @returns    {number}
	     */
	    getBodyOffsetTop: function() {
	        var offsetTop = this.domState.getOffset().top;
	        var summaryHeight = this.get('summaryPosition') === summaryPositionConst.TOP ? this.get('summaryHeight') : 0;

	        return offsetTop + this.get('headerHeight') + summaryHeight
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
	        var bodyOffsetX = this.domState.getOffset().left;
	        var bodyOffsetY = this.getBodyOffsetTop();

	        return {
	            x: pageX - bodyOffsetX,
	            y: pageY - bodyOffsetY
	        };
	    },

	    /**
	     * Whether the frozen border width is set or not
	     * @returns {boolean} State of the frozen border width
	     */
	    hasFrozenBorder: function() {
	        return _.isNumber(this.get('frozenBorderWidth'));
	    }
	});

	module.exports = Dimension;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Manage coordinates of rows
	 * @author NHN Ent. FE Development Lab
	 */

	'use strict';

	var _ = __webpack_require__(2);

	var util = __webpack_require__(16);
	var Model = __webpack_require__(9);
	var CELL_BORDER_WIDTH = __webpack_require__(10).dimension.CELL_BORDER_WIDTH;

	/**
	 * @module model/coordRow
	 * @param {Object} attrs - Attributes
	 * @param {Object} options - Options
	 * @extends module:base/model
	 * @ignore
	 */
	var CoordRow = Model.extend(/** @lends module:model/coordRow.prototype */{
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

	        // Sync height and offest data when dataModel is changed only if the fixedRowHeight is true.
	        // If the fixedRowHeight is false, as the height of each row should be synced with DOM,
	        // syncWithDom() method is called instead at the end of rendering process.
	        if (this.dimensionModel.get('fixedRowHeight')) {
	            this.listenTo(this.dataModel, 'add remove reset sort', this.syncWithDataModel);
	        }
	    },

	    /**
	     * Refresh coordinate data with real DOM height of cells
	     */
	    syncWithDom: function() {
	        var domRowHeights, dataRowHeights, rowHeights;
	        var i, len;

	        if (this.dimensionModel.get('fixedRowHeight')) {
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

	        position += CELL_BORDER_WIDTH * 2;

	        while (rowOffsets[idx] - CELL_BORDER_WIDTH <= position) {
	            idx += 1;
	        }

	        return idx - 1;
	    },

	    /**
	     * Returns the row index moved by body height from given row.
	     * @param {number} rowIdx - current row index
	     * @param {Boolean} isDownDir - true: down, false: up
	     * @returns {number}
	     */
	    getPageMovedIndex: function(rowIdx, isDownDir) {
	        var curOffset = this.getOffsetAt(rowIdx);
	        var distance = this.dimensionModel.get('bodyHeight');
	        var movedIdx;

	        if (!isDownDir) {
	            distance = -distance;
	        }
	        movedIdx = this.indexOf(curOffset + distance);

	        return util.clamp(movedIdx, 0, this.dataModel.length - 1);
	    }
	});

	module.exports = CoordRow;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Manage coordinates of rows
	 * @author NHN Ent. FE Development Lab
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var Model = __webpack_require__(9);
	var util = __webpack_require__(16);
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
	var CoordColumn = Model.extend(/** @lends module:model/coordColumn.prototype */{
	    initialize: function(attrs, options) {
	        this.dimensionModel = options.dimensionModel;
	        this.columnModel = options.columnModel;

	        /**
	         * An array of the fixed flags of the columns
	         * @private
	         * @type {boolean[]}
	         */
	        this._fixedWidthFlags = null;

	        /**
	         * An array of the minimum width of the columns
	         * @private
	         * @type {number[]}
	         */
	        this._minWidths = null;

	        /**
	         * Whether the column width is modified by user.
	         * @type {boolean}
	         */
	        this._isModified = false;

	        this.listenTo(this.columnModel, 'columnModelChange', this.resetColumnWidths);
	        this.listenTo(this.dimensionModel, 'change:width', this._onDimensionWidthChange);

	        if (options.domEventBus) {
	            this.listenTo(options.domEventBus, 'dragmove:resizeColumn', this._onDragResize);
	            this.listenTo(options.domEventBus, 'dblclick:resizeColumn', this._onDblClick);
	        }
	        this.resetColumnWidths();
	    },

	    defaults: {
	        widths: [],
	        resizable: true
	    },

	    /**
	     * Reset the width of each column by using initial setting of column models.
	     */
	    resetColumnWidths: function() {
	        var columns = this.columnModel.getVisibleColumns(null, true);
	        var commonMinWidth = this.dimensionModel.get('minimumColumnWidth');
	        var widths = [];
	        var fixedFlags = [];
	        var minWidths = [];

	        _.each(columns, function(columnModel) {
	            var columnWidth = columnModel.width || 'auto';
	            var fixedWidth = !isNaN(columnWidth);
	            var width, minWidth;

	            // Meta columns are not affected by common 'minimumColumnWidth' value
	            if (util.isMetaColumn(columnModel.name)) {
	                minWidth = width;
	            } else {
	                minWidth = columnModel.minWidth || commonMinWidth;
	            }

	            width = fixedWidth ? columnWidth : minWidth;

	            if (width < minWidth) {
	                width = minWidth;
	            }

	            // If the width is not assigned (in other words, the width is not positive number),
	            // set it to zero (no need to worry about minimum width at this point)
	            // so that #_fillEmptyWidth() can detect which one is empty.
	            // After then, minimum width will be applied by #_applyMinimumWidth().
	            widths.push(width);
	            minWidths.push(minWidth);
	            fixedFlags.push(fixedWidth);
	        }, this);

	        this._fixedWidthFlags = fixedFlags;
	        this._minWidths = minWidths;

	        this._setColumnWidthVariables(this._calculateColumnWidth(widths), true);
	    },

	    /**
	     * Event handler for dragmove event on domEventBus
	     * @param {module:event/gridEvent} ev - GridEvent
	     * @private
	     */
	    _onDragResize: function(ev) {
	        this.setColumnWidth(ev.columnIndex, ev.width);
	    },

	    /**
	     * Event handler for dblclick event on domEventBus
	     * @param {module:event/gridEventd} ev - GridEvent
	     * @private
	     */
	    _onDblClick: function(ev) {
	        this.restoreColumnWidth(ev.columnIndex);
	    },

	    /**
	     * widths 로 부터, lside 와 rside 의 전체 너비를 계산하여 저장한다.
	     * @param {array} widths - 컬럼 넓이값 배열
	     * @param {boolean} [saveWidths] - 저장 여부. true이면 넓이값 배열을 originalWidths로 저장한다.
	     * @private
	     */
	    _setColumnWidthVariables: function(widths, saveWidths) {
	        var totalWidth = this.dimensionModel.get('width');
	        var maxLeftSideWidth = this.dimensionModel.getMaxLeftSideWidth();
	        var frozenCount = this.columnModel.getVisibleFrozenCount(true);
	        var rsideWidth, lsideWidth, lsideWidths, rsideWidths;

	        lsideWidths = widths.slice(0, frozenCount);
	        rsideWidths = widths.slice(frozenCount);

	        lsideWidth = this._getFrameWidth(lsideWidths);
	        if (maxLeftSideWidth && maxLeftSideWidth < lsideWidth) {
	            lsideWidths = this._adjustLeftSideWidths(lsideWidths, maxLeftSideWidth);
	            lsideWidth = this._getFrameWidth(lsideWidths);
	            widths = lsideWidths.concat(rsideWidths);
	        }
	        rsideWidth = totalWidth - lsideWidth;

	        this.set({
	            widths: widths
	        });
	        this.dimensionModel.set({
	            rsideWidth: rsideWidth,
	            lsideWidth: lsideWidth
	        });

	        if (saveWidths) {
	            this.set('originalWidths', _.clone(widths));
	        }
	        this.trigger('columnWidthChanged');
	    },

	    /**
	     * columnFrozenCount 가 적용되었을 때, window resize 시 left side 의 너비를 조정한다.
	     * @param {Array} lsideWidths    열고정 영역의 너비 리스트 배열
	     * @param {Number} totalWidth   grid 전체 너비
	     * @returns {Array} 열고정 영역의 너비 리스트
	     * @private
	     */
	    _adjustLeftSideWidths: function(lsideWidths, totalWidth) {
	        var i = lsideWidths.length - 1;
	        var minimumColumnWidth = this.dimensionModel.get('minimumColumnWidth');
	        var currentWidth = this._getFrameWidth(lsideWidths);
	        var diff = currentWidth - totalWidth;
	        var changedWidth;

	        if (diff > 0) {
	            while (i >= 0 && diff > 0) {
	                changedWidth = Math.max(minimumColumnWidth, lsideWidths[i] - diff);
	                diff -= lsideWidths[i] - changedWidth;
	                lsideWidths[i] = changedWidth;
	                i -= 1;
	            }
	        } else if (diff < 0) {
	            lsideWidths[i] += Math.abs(diff);
	        }

	        return lsideWidths;
	    },

	    /**
	     * calculate column width list
	     * @param {Array.<Number>} widths - widths
	     * @returns {Array.<Number>}
	     * @private
	     */
	    _calculateColumnWidth: function(widths) {
	        widths = this._fillEmptyWidth(widths);
	        widths = this._applyMinimumWidth(widths);
	        widths = this._adjustWidths(widths);

	        return widths;
	    },

	    /**
	     * Sets the width of columns whose width is not assigned by distributing extra width to them equally.
	     * @param {number[]} widths - An array of column widths
	     * @returns {number[]} - A new array of column widths
	     * @private
	     */
	    _fillEmptyWidth: function(widths) {
	        var totalWidth = this.dimensionModel.getAvailableTotalWidth(widths.length);
	        var remainTotalWidth = totalWidth - util.sum(widths);
	        var emptyIndexes = [];

	        _.each(widths, function(width, index) {
	            if (!width) {
	                emptyIndexes.push(index);
	            }
	        });

	        return this._distributeExtraWidthEqually(widths, remainTotalWidth, emptyIndexes);
	    },

	    /**
	     * widths 로부터 보더 값을 포함하여 계산한 frameWidth 를 구한다.
	     * @param {Array} widths 너비 리스트 배열
	     * @returns {Number} 계산된 frame 너비값
	     * @private
	     */
	    _getFrameWidth: function(widths) {
	        var frameWidth = 0;

	        if (widths.length) {
	            frameWidth = util.sum(widths) + ((widths.length + 1) * CELL_BORDER_WIDTH);
	        }

	        return frameWidth;
	    },

	    /**
	     * Adds extra widths of the column equally.
	     * @param {number[]} widths - An array of column widths
	     * @param {number} totalExtraWidth - Total extra width
	     * @returns {number[]} - A new array of column widths
	     * @private
	     */
	    _addExtraColumnWidth: function(widths, totalExtraWidth) {
	        var fixedFlags = this._fixedWidthFlags;
	        var columnIndexes = [];

	        _.each(fixedFlags, function(flag, index) {
	            if (!flag) {
	                columnIndexes.push(index);
	            }
	        });

	        return this._distributeExtraWidthEqually(widths, totalExtraWidth, columnIndexes);
	    },

	    /**
	     * Reduces excess widths of the column equally.
	     * @param {number[]} widths - An array of column widths
	     * @param {number} totalExcessWidth - Total excess width (negative number)
	     * @returns {number[]} - A new array of column widths
	     * @private
	     */
	    _reduceExcessColumnWidth: function(widths, totalExcessWidth) {
	        var minWidths = this._minWidths;
	        var fixedFlags = this._fixedWidthFlags;
	        var availableList = [];

	        _.each(widths, function(width, index) {
	            if (!fixedFlags[index]) {
	                availableList.push({
	                    index: index,
	                    width: width - minWidths[index]
	                });
	            }
	        });

	        return this._reduceExcessColumnWidthSub(_.clone(widths), totalExcessWidth, availableList);
	    },

	    /**
	     * Reduce the (remaining) excess widths of the column.
	     * This method will be called recursively by _reduceExcessColumnWidth.
	     * @param {number[]} widths - An array of column Width
	     * @param {number} totalRemainWidth - Remaining excess width (negative number)
	     * @param {object[]} availableList - An array of infos about available column.
	     *                                 Each item of the array has {index:number, width:number}.
	     * @returns {number[]} - A new array of column widths
	     * @private
	     */
	    _reduceExcessColumnWidthSub: function(widths, totalRemainWidth, availableList) {
	        var avgValue = Math.round(totalRemainWidth / availableList.length);
	        var newAvailableList = [];
	        var columnIndexes;

	        _.each(availableList, function(available) {
	            // note that totalRemainWidth and avgValue are negative number.
	            if (available.width < Math.abs(avgValue)) {
	                totalRemainWidth += available.width;
	                widths[available.index] -= available.width;
	            } else {
	                newAvailableList.push(available);
	            }
	        });
	        // call recursively until all available width are less than average
	        if (availableList.length > newAvailableList.length) {
	            return this._reduceExcessColumnWidthSub(widths, totalRemainWidth, newAvailableList);
	        }
	        columnIndexes = _.pluck(availableList, 'index');

	        return this._distributeExtraWidthEqually(widths, totalRemainWidth, columnIndexes);
	    },

	    /**
	     * Distributes the extra width equally to each column at specified indexes.
	     * @param {number[]} widths - An array of column width
	     * @param {number} extraWidth - Extra width
	     * @param {number[]} columnIndexes - An array of indexes of target columns
	     * @returns {number[]} - A new array of column widths
	     * @private
	     */
	    _distributeExtraWidthEqually: function(widths, extraWidth, columnIndexes) {
	        var length = columnIndexes.length;
	        var avgValue = Math.round(extraWidth / length);
	        var errorValue = (avgValue * length) - extraWidth; // to correct total width
	        var resultList = _.clone(widths);

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
	     * @param {number[]} widths - 컬럼 넓이값 배열
	     * @returns {number[]} - 수정된 새로운 넓이값 배열
	     * @private
	     */
	    _applyMinimumWidth: function(widths) {
	        var minWidths = this._minWidths;
	        var appliedList = _.clone(widths);

	        _.each(appliedList, function(width, index) {
	            var minWidth = minWidths[index];
	            if (width < minWidth) {
	                appliedList[index] = minWidth;
	            }
	        });

	        return appliedList;
	    },

	    /**
	     * Adjust the column widths to make them fit into the dimension.
	     * @param {number[]} widths - An array of column width
	     * @param {boolean} [fitToReducedTotal] - If set to true and the total width is smaller than dimension(width),
	     *                                    the column widths will be reduced.
	     * @returns {number[]} - A new array of column widths
	     * @private
	     */
	    _adjustWidths: function(widths, fitToReducedTotal) {
	        var columnLength = widths.length;
	        var availableWidth = this.dimensionModel.getAvailableTotalWidth(columnLength);
	        var totalExtraWidth = availableWidth - util.sum(widths);
	        var fixedCount = _.filter(this._fixedWidthFlags).length;
	        var adjustedWidths;

	        if (totalExtraWidth > 0 && (columnLength > fixedCount)) {
	            adjustedWidths = this._addExtraColumnWidth(widths, totalExtraWidth);
	        } else if (fitToReducedTotal && totalExtraWidth < 0) {
	            adjustedWidths = this._reduceExcessColumnWidth(widths, totalExtraWidth);
	        } else {
	            adjustedWidths = widths;
	        }

	        return adjustedWidths;
	    },

	    /**
	     * width 값 변경시 각 column 별 너비를 계산한다.
	     * @private
	     */
	    _onDimensionWidthChange: function() {
	        var widths = this.get('widths');

	        if (!this._isModified) {
	            widths = this._adjustWidths(widths, true);
	        }
	        this._setColumnWidthVariables(widths);
	    },

	    /**
	     * L side 와 R side 에 따른 widths 를 반환한다.
	     * @param {String} [whichSide] 어느 영역인지 여부. L,R 중 하나를 인자로 넘긴다. 생략시 전체 columnList 반환
	     * @returns {Array}  조회한 영역의 widths
	     */
	    getWidths: function(whichSide) {
	        var columnFrozenCount = this.columnModel.getVisibleFrozenCount(true);
	        var widths = [];

	        switch (whichSide) {
	            case frameConst.L:
	                widths = this.get('widths').slice(0, columnFrozenCount);
	                break;
	            case frameConst.R:
	                widths = this.get('widths').slice(columnFrozenCount);
	                break;
	            default:
	                widths = this.get('widths');
	                break;
	        }

	        return widths;
	    },

	    /**
	     * L, R 중 하나를 입력받아 frame 의 너비를 구한다.
	     * @param {String} [whichSide]  지정하지 않을 경우 전체 너비.
	     * @returns {Number} 해당 frame 의 너비
	     */
	    getFrameWidth: function(whichSide) {
	        var columnFrozenCount = this.columnModel.getVisibleFrozenCount(true);
	        var widths = this.getWidths(whichSide);
	        var frameWidth = this._getFrameWidth(widths);

	        if (_.isUndefined(whichSide) && columnFrozenCount > 0) {
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
	        var widths = this.get('widths');
	        var minWidth = this._minWidths[index];

	        if (widths[index]) {
	            widths[index] = Math.max(width, minWidth);
	            this._setColumnWidthVariables(widths);
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
	        var widths = this.getWidths();
	        var totalColumnWidth = this.getFrameWidth();
	        var adjustableIndex = (withMeta) ? 0 : this.columnModel.getVisibleMetaColumnCount();
	        var columnIndex = 0;

	        if (posX >= totalColumnWidth) {
	            columnIndex = widths.length - 1;
	        } else {
	            snippet.forEachArray(widths, function(width, index) { // eslint-disable-line consistent-return
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
	        var orgWidth = this.get('originalWidths')[index];

	        this.setColumnWidth(index, orgWidth);
	    }
	});

	module.exports = CoordColumn;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Converts coordinates to index of rows and columns
	 * @author NHN Ent. FE Development Lab
	 */

	'use strict';

	var snippet = __webpack_require__(3);

	var Model = __webpack_require__(9);
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
	var CoordConverter = Model.extend(/** @lends module:model/coordConverter.prototype */{
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
	        var widths = this.coordColumnModel.get('widths');
	        var leftColumnCount = columnModel.getVisibleFrozenCount() + metaColumnCount;
	        var targetIdx = columnModel.indexOfColumnName(columnName, true) + metaColumnCount;
	        var idx = leftColumnCount > targetIdx ? 0 : leftColumnCount;
	        var left = 0;

	        for (; idx < targetIdx; idx += 1) {
	            left += widths[idx] + CELL_BORDER_WIDTH;
	        }

	        return {
	            left: left,
	            right: left + widths[targetIdx] + CELL_BORDER_WIDTH
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

	        if (!snippet.isEmpty(scrollPosition)) {
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


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Focus Model
	 * @author NHN Ent. FE Development Lab
	 */

	'use strict';

	var _ = __webpack_require__(2);

	var Model = __webpack_require__(9);
	var util = __webpack_require__(16);
	var GridEvent = __webpack_require__(15);

	/**
	 * Focus model
	 * @param {Object} attrs - Attributes
	 * @param {Object} options - Options
	 * @module model/focus
	 * @extends module:base/model
	 * @ignore
	 */
	var Focus = Model.extend(/** @lends module:model/focus.prototype */{
	    initialize: function(attrs, options) {
	        var editEventName = options.editingEvent + ':cell';
	        var domEventBus;

	        Model.prototype.initialize.apply(this, arguments);

	        _.assign(this, {
	            dataModel: options.dataModel,
	            columnModel: options.columnModel,
	            coordRowModel: options.coordRowModel,
	            domEventBus: options.domEventBus,
	            domState: options.domState
	        });

	        this.listenTo(this.dataModel, 'reset', this._onResetData);
	        this.listenTo(this.dataModel, 'add', this._onAddDataModel);

	        if (this.domEventBus) {
	            domEventBus = this.domEventBus;
	            this.listenTo(domEventBus, editEventName, this._onMouseClickEdit);
	            this.listenTo(domEventBus, 'mousedown:focus', this._onMouseDownFocus);
	            this.listenTo(domEventBus, 'key:move', this._onKeyMove);
	            this.listenTo(domEventBus, 'key:edit', this._onKeyEdit);
	        }
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
	        columnName: null,

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
	         * address of the editing cell
	         * @type {{rowKey:(String|Number), columnName:String}}
	         */
	        editingAddress: null,

	        /**
	         * Whether focus state is active or not
	         * @type {Boolean}
	         */
	        active: false
	    },

	    /**
	     * Event handler for 'reset' event on dataModel.
	     * @private
	     */
	    _onResetData: function() {
	        this.blur();
	    },

	    /**
	     * Event handler for 'add' event on dataModel.
	     * @param  {module:model/data/rowList} dataModel - data model
	     * @param  {Object} options - options for appending. See {@link module:model/data/rowList#append}
	     * @private
	     */
	    _onAddDataModel: function(dataModel, options) {
	        if (options.focus) {
	            this.focusAt(options.at, 0);
	        }
	    },

	    /**
	     * Event handler for 'click:cell' or 'dblclick:cell' event on domEventBus
	     * @param {module:event/gridEvent} ev - event data
	     * @private
	     */
	    _onMouseClickEdit: function(ev) {
	        this.focusIn(ev.rowKey, ev.columnName);
	    },

	    /* eslint-disable complexity */
	    /**
	     * Event handler for key:move event
	     * @param {module:event/gridEvent} ev - GridEvent
	     * @private
	     */
	    _onKeyMove: function(ev) {
	        var rowKey, columnName;

	        switch (ev.command) {
	            case 'up':
	                rowKey = this.prevRowKey();
	                break;
	            case 'down':
	                rowKey = this.nextRowKey();
	                break;
	            case 'left':
	                columnName = this.prevColumnName();
	                break;
	            case 'right':
	                columnName = this.nextColumnName();
	                break;
	            case 'pageUp':
	                rowKey = this._getPageMovedRowKey(false);
	                break;
	            case 'pageDown':
	                rowKey = this._getPageMovedRowKey(true);
	                break;
	            case 'firstColumn':
	                columnName = this.firstColumnName();
	                break;
	            case 'lastColumn':
	                columnName = this.lastColumnName();
	                break;
	            case 'firstCell':
	                rowKey = this.firstRowKey();
	                columnName = this.firstColumnName();
	                break;
	            case 'lastCell':
	                rowKey = this.lastRowKey();
	                columnName = this.lastColumnName();
	                break;
	            default:
	        }

	        rowKey = _.isUndefined(rowKey) ? this.get('rowKey') : rowKey;
	        columnName = columnName || this.get('columnName');

	        this.focus(rowKey, columnName, true);
	    },
	    /* eslint-enable complexity */

	    /**
	     * Event handler for key:edit event
	     * @param {module:event/gridEvent} ev - GridEvent
	     * @private
	     */
	    _onKeyEdit: function(ev) {
	        var address;

	        switch (ev.command) {
	            case 'currentCell':
	                address = this.which();
	                break;
	            case 'nextCell':
	                address = this.nextAddress();
	                break;
	            case 'prevCell':
	                address = this.prevAddress();
	                break;
	            default:
	        }

	        if (address) {
	            this.focusIn(address.rowKey, address.columnName, true);
	        }
	    },

	    /**
	     * Returns the moved rowKey by page unit from current position
	     * @param {boolean} isDownDir - true: down, false: up
	     * @returns {number}
	     * @private
	     */
	    _getPageMovedRowKey: function(isDownDir) {
	        var rowIndex = this.dataModel.indexOfRowKey(this.get('rowKey'));
	        var prevPageRowIndex = this.coordRowModel.getPageMovedIndex(rowIndex, isDownDir);
	        var rowKey;

	        if (isDownDir) {
	            rowKey = this.nextRowKey(prevPageRowIndex - rowIndex);
	        } else {
	            rowKey = this.prevRowKey(rowIndex - prevPageRowIndex);
	        }

	        return rowKey;
	    },

	    /**
	     * Event handler for 'mousedown' event on domEventBus
	     * @private
	     */
	    _onMouseDownFocus: function() {
	        this.focusClipboard();
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

	    /* eslint-disable complexity */
	    /**
	     * Focus to the cell identified by given rowKey and columnName.
	     * @param {Number|String} rowKey - rowKey
	     * @param {String} columnName - columnName
	     * @param {Boolean} isScrollable - if set to true, move scroll position to focused position
	     * @returns {Boolean} true if focused cell is changed
	     */
	    focus: function(rowKey, columnName, isScrollable) {
	        if (!this.get('active')) {
	            this.set('active', true);
	        }

	        if (!this._isValidCell(rowKey, columnName) ||
	            util.isMetaColumn(columnName) ||
	            this.isCurrentCell(rowKey, columnName)) {
	            return true;
	        }

	        if (!this._triggerFocusChangeEvent(rowKey, columnName)) {
	            return false;
	        }

	        this.blur();
	        this.set({
	            rowKey: rowKey,
	            columnName: columnName
	        });

	        this.trigger('focus', rowKey, columnName, isScrollable);

	        if (this.columnModel.get('selectType') === 'radio') {
	            this.dataModel.check(rowKey);
	        }

	        return true;
	    },
	    /* eslint-enable complexity */

	    /**
	     * Trigger 'focusChange' event and returns the result
	     * @param {(number|string)} rowKey - rowKey
	     * @param {stringd} columnName - columnName
	     * @returns {boolean}
	     * @private
	     */
	    _triggerFocusChangeEvent: function(rowKey, columnName) {
	        var gridEvent = new GridEvent(null, {
	            rowKey: rowKey,
	            prevRowKey: this.get('rowKey'),
	            columnName: columnName,
	            prevColumnName: this.get('columnName')
	        });

	        /**
	         * Occurs when focused cell is about to change
	         * @api
	         * @event Grid#focusChange
	         * @type {module:event/gridEvent}
	         * @property {number} rowKey - rowKey of the target cell
	         * @property {number} columnName - columnName of the target cell
	         * @property {number} prevRowKey - rowKey of the currently focused cell
	         * @property {number} prevColumnName - columnName of the currently focused cell
	         * @property {Grid} instance - Current grid instance
	         */
	        this.trigger('focusChange', gridEvent);

	        return !gridEvent.isStopped();
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
	            result = this.focus(row.get('rowKey'), column.name, isScrollable);
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
	            result = this.focusIn(row.get('rowKey'), column.name, isScrollable);
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
	     * Otherwise change the focus state.
	     */
	    refreshState: function() {
	        var restored;

	        if (!this.domState.hasFocusedElement()) {
	            this.set('active', false);
	        } else if (!this.has()) {
	            restored = this.restore();
	            if (!restored) {
	                this.focusAt(0, 0);
	            }
	        }
	    },

	    /**
	     * Apply blur state on cell
	     * @returns {Model.Focus} This object
	     */
	    blur: function() {
	        if (!this.has()) {
	            return this;
	        }

	        if (this.has(true)) {
	            this._savePrevious();
	        }

	        this.trigger('blur', this.get('rowKey'), this.get('columnName'));

	        this.set({
	            rowKey: null,
	            columnName: null
	        });

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
	            this.set({
	                prevRowKey: null,
	                prevColumnName: null
	            });
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
	        var columns = columnModel.getVisibleColumns();
	        var columnIndex = columnModel.indexOfColumnName(this.get('columnName'), true);
	        var columnName = null;
	        var index;

	        if (this.has(true)) {
	            index = Math.max(Math.min(columnIndex + offset, columns.length - 1), 0);
	            columnName = columns[index] && columns[index].name;
	        }

	        return columnName;
	    },

	    /**
	     * Returns data of rowSpan
	     * @param {Number|String} rowKey - Row key
	     * @param {String} columnName - Column name
	     * @returns {boolean|{count: number, isMainRow: boolean, mainRowKey: *}} rowSpanData - Data of rowSpan
	     * @private
	     */
	    _getRowSpanData: function(rowKey, columnName) {
	        if (rowKey && columnName) {
	            return this.dataModel.get(rowKey).getRowSpanData(columnName);
	        }

	        return false;
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
	            if (rowSpanData && !rowSpanData.isMainRow) {
	                rowKey = this._findRowKey(rowSpanData.count + offset);
	            }
	        } else {
	            rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
	            if (rowSpanData.isMainRow && rowSpanData.count > 0) {
	                rowKey = this._findRowKey(rowSpanData.count);
	            } else if (rowSpanData && !rowSpanData.isMainRow) {
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
	            if (rowSpanData && !rowSpanData.isMainRow) {
	                rowKey = this._findRowKey(rowSpanData.count + offset);
	            }
	        } else {
	            rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
	            if (rowSpanData && !rowSpanData.isMainRow) {
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
	        var columns = this.columnModel.getVisibleColumns();

	        return columns[0].name;
	    },

	    /**
	     * 마지막 columnName 을 반환한다.
	     * @returns {string} 마지막 컬럼명
	     */
	    lastColumnName: function() {
	        var columns = this.columnModel.getVisibleColumns();
	        var lastIndex = columns.length - 1;

	        return columns[lastIndex].name;
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


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Rendering 모델
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var Model = __webpack_require__(9);
	var Row = __webpack_require__(25);
	var RowList = __webpack_require__(26);
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
	var Renderer = Model.extend(/** @lends module:model/renderer.prototype */{
	    initialize: function(attrs, options) {
	        var rowListOptions;
	        var partialLside, partialRside;

	        _.assign(this, {
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

	        partialLside = new RowList([], rowListOptions);
	        partialRside = new RowList([], rowListOptions);

	        this.set({
	            lside: [],
	            rside: [],
	            partialLside: partialLside,
	            partialRside: partialRside
	        });

	        this.listenTo(this.columnModel, 'columnModelChange change', this._onColumnModelChange)
	            .listenTo(this.dataModel, 'sort reset', this._onDataModelChange)
	            .listenTo(this.dataModel, 'deleteRange', this._onRangeDataModelChange)
	            .listenTo(this.dataModel, 'add', this._onAddDataModelChange)
	            .listenTo(this.dataModel, 'remove', this._onRemoveDataModelChange)
	            .listenTo(this.dataModel, 'beforeReset', this._onBeforeResetData)
	            .listenTo(this.focusModel, 'change:editingAddress', this._onEditingAddressChange)
	            .listenTo(partialLside, 'valueChange', this._executeRelation)
	            .listenTo(partialRside, 'valueChange', this._executeRelation)
	            .listenTo(this.coordRowModel, 'reset', this._onChangeRowHeights)
	            .listenTo(this.dimensionModel, 'columnWidthChanged', this.finishEditing)
	            .listenTo(this.dimensionModel, 'change:width', this._updateMaxScrollLeft)
	            .listenTo(this.dimensionModel, 'change:totalRowHeight change:scrollBarSize change:bodyHeight',
	                this._updateMaxScrollTop);

	        if (this.get('showDummyRows')) {
	            this.listenTo(this.dimensionModel, 'change:bodyHeight change:totalRowHeight', this._resetDummyRowCount);
	            this.on('change:dummyRowCount', this._resetDummyRows);
	        }

	        this.on('change', this._onChangeIndex, this);
	        this._onChangeLayoutBound = _.bind(this._onChangeLayout, this);
	    },

	    defaults: {
	        top: 0,
	        bottom: 0,
	        scrollTop: 0,
	        scrollLeft: 0,
	        maxScrollLeft: 0,
	        maxScrollTop: 0,
	        startIndex: -1,
	        endIndex: -1,
	        startNumber: 1,
	        lside: null,
	        rside: null,
	        partialLside: null,
	        partialRside: null,
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
	     * Event handler for changing startIndex or endIndex.
	     * @param {Object} model - Renderer model fired event
	     * @private
	     */
	    _onChangeIndex: function(model) {
	        var changedData = model.changed;
	        var changedStartIndex = _.has(changedData, 'startIndex');
	        var changedEndIndex = _.has(changedData, 'endIndex');

	        if (changedStartIndex || changedEndIndex) {
	            this.refresh();
	        }
	    },

	    /**
	     * Event handler for 'reset' event on coordRowModel
	     * @private
	     */
	    _onChangeRowHeights: function() {
	        var coordRowModel = this.coordRowModel;
	        var lside = this.get('partialLside');
	        var rside = this.get('partialRside');
	        var i = 0;
	        var len = lside.length;
	        var height;

	        for (; i < len; i += 1) {
	            height = coordRowModel.getHeightAt(i);

	            lside.at(i).set('height', height);
	            rside.at(i).set('height', height);
	        }
	    },

	    /**
	     * Event handler for 'change:width' event on Dimension.
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
	            editing: editing
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

	        if (snippet.pick(cellData, 'columnModel', 'editOptions', 'useViewMode') !== false &&
	            cellData.convertedHTML === null) {
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
	            startNumber: 1
	        });
	    },

	    /**
	     * 열고정 영역 또는 열고정이 아닌 영역에 대한 Render Collection 을 반환한다.
	     * @param {String} [whichSide='R']    어느 영역인지 여부. 'L|R' 중에 하나의 값을 넘긴다.
	     * @returns {Object} collection  해당 영역의 랜더 데이터 콜랙션
	     */
	    getCollection: function(whichSide) {
	        var attrName = this._getPartialWhichSideType(whichSide);

	        return this.get(attrName);
	    },

	    /**
	     * Get string of partial which side type
	     * @param {string} whichSide - Type of which side (L|R)
	     * @returns {string} String of appened prefix value 'partial'
	     * @private
	     */
	    _getPartialWhichSideType: function(whichSide) {
	        return snippet.isString(whichSide) ? 'partial' + whichSide + 'side' : 'partialRside';
	    },

	    /**
	     * Event handler for regenerating left and right side frames when the Data.ColumnModel is changed
	     * @private
	     */
	    _onColumnModelChange: function() {
	        this.set({
	            scrollLeft: 0,
	            scrollTop: 0
	        }, {silent: true});

	        this._resetViewModelList();
	        this._setRenderingRange(true);

	        this.refresh({
	            change: false,
	            columnModelChanged: true
	        });

	        this._updateMaxScrollLeft();
	    },

	    /**
	     * Event handler for changing data list
	     * @private
	     */
	    _onDataModelChange: function() {
	        this._resetViewModelList();
	        this._setRenderingRange(true);

	        this.refresh({
	            type: 'reset',
	            dataListChanged: true
	        });
	    },

	    /**
	     * Event handler for adding data list
	     * @param {array} modelList - List of added item
	     * @param {object} options - Info of added item
	     * @private
	     */
	    _onAddDataModelChange: function(modelList, options) {
	        var columnNamesMap = this._getColumnNamesOfEachSide();
	        var at = options.at;
	        var height, viewData, rowNum;
	        var viewModel;

	        this._setRenderingRange(true);

	        // the type of modelList is array or collection
	        modelList = _.isArray(modelList) ? modelList : modelList.models;

	        _.each(modelList, function(model, index) {
	            height = this.coordRowModel.getHeightAt(index);

	            _.each(['lside', 'rside'], function(attrName) {
	                rowNum = at + index + 1;
	                viewData = this._createViewDataFromDataModel(
	                    model, columnNamesMap[attrName], height, rowNum);

	                viewModel = this._createRowModel(viewData, true);

	                this.get(attrName).splice(at + index, 0, viewModel);
	            }, this);
	        }, this);

	        this.refresh({
	            type: 'add',
	            dataListChanged: true
	        });

	        if (options.focus) {
	            this.focusModel.focusAt(options.at, 0);
	        }
	    },

	    /**
	     * Event handler for removing data list
	     * @param {number|string} rowKey - rowKey of the removed row
	     * @param {number} removedIndex - Index of the removed row
	     * @private
	     */
	    _onRemoveDataModelChange: function(rowKey, removedIndex) {
	        _.each(['lside', 'rside'], function(attrName) {
	            this.get(attrName).splice(removedIndex, 1);
	        }, this);

	        this._setRenderingRange(true);

	        this.refresh({
	            dataListChanged: true
	        });
	    },

	    /**
	     * Event handler for deleting cell data
	     * @param {GridEvent} ev - event object when "delRange" event is fired
	     * @private
	     */
	    _onRangeDataModelChange: function(ev) {
	        var columnModel = this.columnModel;
	        var rowKeys = ev.rowKeys;
	        var columnNames = ev.columnNames;

	        this._setRenderingRange(true);

	        _.each(['partialLside', 'partialRside'], function(attrName) {
	            _.each(this.get(attrName).models, function(model) {
	                var rowKey = model.get('rowKey');
	                var changedRow = _.contains(rowKeys, rowKey);

	                if (changedRow) {
	                    _.each(columnNames, function(columnName) {
	                        if (columnModel.getColumnModel(columnName).editOptions) {
	                            this._updateCellData(rowKey, columnName, {
	                                value: '',
	                                formattedValue: ''
	                            });
	                        }
	                    }, this);
	                }
	            }, this);
	        }, this);

	        this.refresh({
	            type: 'deleteRange',
	            dataListChanged: true
	        });
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
	     * Set index-range to render
	     * @param {boolean} silent - whether set attributes silently
	     * @private
	     */
	    _setRenderingRange: function(silent) {
	        var dataLength = this.dataModel.length;

	        this.set({
	            startIndex: dataLength ? 0 : -1,
	            endIndex: dataLength - 1
	        }, {
	            silent: silent
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
	            rowNum: rowNum,
	            height: height,
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
	     * Returns the object that contains two array of column names splitted by frozenCount.
	     * @returns {{lside: Array, rside: Array}} - Column names map
	     * @private
	     */
	    _getColumnNamesOfEachSide: function() {
	        var frozenCount = this.columnModel.getVisibleFrozenCount(true);
	        var columnModels = this.columnModel.getVisibleColumns(null, true);
	        var columnNames = _.pluck(columnModels, 'name');

	        return {
	            lside: columnNames.slice(0, frozenCount),
	            rside: columnNames.slice(frozenCount)
	        };
	    },

	    /**
	     * Add view model list by range
	     * @param {number} startIndex - Index of start row
	     * @param {number} endIndex - Index of end row
	     * @private
	     */
	    _addViewModelListWithRange: function(startIndex, endIndex) {
	        var columnNamesMap = this._getColumnNamesOfEachSide();
	        var rowDataModel, height, index;

	        if (startIndex >= 0 && endIndex >= 0) {
	            for (index = startIndex; index <= endIndex; index += 1) {
	                rowDataModel = this.dataModel.at(index);
	                height = this.coordRowModel.getHeightAt(index);

	                this._addViewModelList(rowDataModel, columnNamesMap, height, index);
	            }
	        }
	    },

	    /**
	     * Add view model list on each side
	     * @param {object} rowDataModel - Data model of row
	     * @param {object} columnNamesMap - Map of column names
	     * @param {number} height - Height of row
	     * @param {number} index - Index of row
	     * @private
	     */
	    _addViewModelList: function(rowDataModel, columnNamesMap, height, index) {
	        _.each(['lside', 'rside'], function(attrName) {
	            var viewData;

	            if (!this.get(attrName)[index]) {
	                viewData = this._createViewDataFromDataModel(
	                    rowDataModel, columnNamesMap[attrName], height, index + 1);

	                this.get(attrName)[index] = this._createRowModel(viewData, true);
	            }
	        }, this);
	    },

	    /**
	     * Update the row number
	     * @param {number} startIndex - Start index
	     * @param {number} endIndex - End index
	     * @private
	     */
	    _updateRowNumber: function(startIndex, endIndex) {
	        var collection = this.get('lside');
	        var index = startIndex;
	        var currentModel, rowNum, newRowNum;

	        for (; index <= endIndex; index += 1) {
	            currentModel = collection[index];
	            newRowNum = index + 1;

	            if (currentModel) {
	                rowNum = currentModel.get('rowNum');
	                newRowNum = index + 1;

	                if (rowNum !== newRowNum) {
	                    currentModel.set({
	                        rowNum: newRowNum
	                    }, {
	                        silent: true
	                    });

	                    currentModel.setCell('_number', {
	                        formattedValue: newRowNum,
	                        value: newRowNum
	                    });
	                }
	            }
	        }
	    },

	    /**
	     * Reset partial view model list
	     * @param {number} startIndex - Index of start row
	     * @param {number} endIndex - Index of end row
	     * @private
	     */
	    _resetPartialViewModelList: function(startIndex, endIndex) {
	        var originalWhichSide, partialWhichSide;
	        var viewModelList, partialViewModelList;

	        _.each(['L', 'R'], function(whichSide) {
	            originalWhichSide = whichSide.toLowerCase() + 'side';
	            partialWhichSide = this._getPartialWhichSideType(whichSide);
	            viewModelList = this.get(originalWhichSide);
	            partialViewModelList = viewModelList.slice(startIndex, endIndex + 1);

	            this.get(partialWhichSide).reset(partialViewModelList);
	        }, this);
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
	                    this.get(listName).push(this._createRowModel({
	                        height: rowHeight,
	                        rowNum: rowNum
	                    }));
	                }, this);

	                rowNum += 1;
	            }, this);
	        }
	    },

	    /* eslint-disable complexity */
	    /**
	     * Refreshes the rendering range and the list of view models, and triggers events.
	     * @param {object} options - options
	     * @param {boolean} [options.columnModelChanged] - The boolean value whether columnModel has changed
	     * @param {boolean} [options.dataListChanged] - The boolean value whether dataModel has changed
	     * @param {string} [options.type] - Event type (reset|add|remove)
	     */
	    refresh: function(options) {
	        var columnModelChanged = !!options && options.columnModelChanged;
	        var dataListChanged = !!options && options.dataListChanged;
	        var eventType = !!options && options.type;
	        var startIndex, endIndex, i;

	        startIndex = this.get('startIndex');
	        endIndex = this.get('endIndex');

	        if (eventType !== 'add' && eventType !== 'deleteRange') {
	            this._addViewModelListWithRange(startIndex, endIndex);
	        }

	        if (eventType !== 'deleteRange') {
	            this._updateRowNumber(startIndex, endIndex);
	        }

	        this._resetPartialViewModelList(startIndex, endIndex);
	        this._fillDummyRows();

	        if (startIndex >= 0 && endIndex >= 0) {
	            for (i = startIndex; i <= endIndex; i += 1) {
	                this._executeRelation(i);
	            }
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
	    /* eslint-enable complexity */

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
	        var lside = this.get('partialLside');
	        var collection;

	        if (lside.at(0) && lside.at(0).get(columnName)) {
	            collection = lside;
	        } else {
	            collection = this.get('partialRside');
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
	     {
	         rowKey: rowKey,
	         columnName: columnName,
	         value: value,
	         rowSpan: rowSpanData.count,
	         isMainRow: rowSpanData.isMainRow,
	         mainRowKey: rowSpanData.mainRowKey,
	         editable: editable,
	         disabled: disabled,
	         listItems: [],
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
	    },

	    /**
	     * Create row model
	     * @param {object} attrs - Attributes to create
	     * @param {boolean} parse - Whether calling parse or not
	     * @returns {object} Row model
	     * @private
	     */
	    _createRowModel: function(attrs, parse) {
	        return new Row(attrs, {
	            parse: parse,
	            dataModel: this.dataModel,
	            columnModel: this.columnModel,
	            focusModel: this.focusModel
	        });
	    },

	    /**
	     * Reset view models when value of columModel or dataModel is changed
	     * @private
	     */
	    _resetViewModelList: function() {
	        _.each(['lside', 'rside'], function(attrName) {
	            this.set(attrName, new Array(this.dataModel.length));
	        }, this);
	    }
	});

	module.exports = Renderer;


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Row Model for Rendering (View Model)
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var Model = __webpack_require__(9);
	var util = __webpack_require__(16);

	/**
	 * Row Model
	 * @module model/row
	 * @param  {object} attributes - Attributes
	 * @param  {object} options - Options
	 * @extends module:base/model
	 * @ignore
	 */
	var Row = Model.extend(/** @lends module:model/row.prototype */{
	    initialize: function(attributes, options) {
	        var rowKey = attributes && attributes.rowKey;
	        var dataModel = options.dataModel;
	        var rowData = dataModel.get(rowKey);

	        this.dataModel = dataModel;
	        this.columnModel = options.columnModel;
	        this.focusModel = options.focusModel;

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
	        var columnModels = this.columnModel.getVisibleColumns(null, true);

	        return _.pluck(columnModels, 'name');
	    },

	    /**
	     * Event handler for 'disabledChanged' event on dataModel
	     */
	    _onDataModelDisabledChanged: function() {
	        var columnNames = this._getColumnNameList();

	        _.each(columnNames, function(columnName) {
	            this.setCell(columnName, {
	                disabled: this.rowData.isDisabled(columnName),
	                className: this._getClassNameString(columnName)
	            });
	        }, this);
	    },

	    /**
	     * Sets the 'disabled', 'editable', 'className' property of each cell data.
	     * @private
	     */
	    _setRowExtraData: function() {
	        _.each(this._getColumnNameList(), function(columnName) {
	            var cellData = this.get(columnName);
	            var cellState;

	            if (!snippet.isUndefined(cellData) && cellData.isMainRow) {
	                cellState = this.rowData.getCellState(columnName);

	                this.setCell(columnName, {
	                    disabled: cellState.disabled,
	                    editable: cellState.editable,
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
	        return this._formatData(data, options.dataModel, options.columnModel, options.focusModel);
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
	                height: rowHeight,
	                columnName: columnName,
	                rowSpan: rowSpanData.count,
	                isMainRow: rowSpanData.isMainRow,
	                mainRowKey: rowSpanData.mainRowKey,
	                editable: cellState.editable,
	                disabled: cellState.disabled,
	                editing: focusModel.isEditingCell(rowKey, columnName),
	                whiteSpace: column.whiteSpace || 'nowrap',
	                valign: column.valign,
	                listItems: snippet.pick(column, 'editOptions', 'listItems'),
	                className: this._getClassNameString(columnName, row, focusModel),
	                columnModel: column,
	                changed: [] // changed property names
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
	        var prefix = snippet.pick(column, 'editOptions', 'prefix');
	        var postfix = snippet.pick(column, 'editOptions', 'postfix');
	        var converter = snippet.pick(column, 'editOptions', 'converter');
	        var rowAttrs = row.toJSON();

	        return {
	            value: this._getValueToDisplay(value, column, isTextType),
	            formattedValue: this._getFormattedValue(value, rowAttrs, column),
	            prefix: this._getExtraContent(prefix, value, rowAttrs),
	            postfix: this._getExtraContent(postfix, value, rowAttrs),
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
	     * Returns the value of the 'prefix' or 'postfix'.
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
	        } else if (snippet.isExisty(content)) {
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
	        var isExisty = snippet.isExisty;
	        var useHtmlEntity = column.useHtmlEntity;
	        var defaultValue = column.defaultValue;

	        if (!isExisty(value)) {
	            value = isExisty(defaultValue) ? defaultValue : '';
	        }

	        if (isTextType && useHtmlEntity && snippet.hasEncodableString(value)) {
	            value = snippet.encodeHTMLEntity(value);
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
	        var rowSpanData = snippet.pick(data, '_extraData', 'rowSpanData', columnName);

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
	                rowIndex = this.dataModel.indexOfRowKey(rowKey);
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
	        var valueChangedOnEditing = cellData.editing && valueChanged;
	        var useViewMode = snippet.pick(cellData, 'columnModel', 'editOptions', 'useViewMode') !== false;
	        var editingChangedToTrue = _.contains(cellData.changed, 'editing') && cellData.editing;

	        // Silent Cases
	        // 1: If values have been changed while the editing is true,
	        //    prevent the related cell-view from changing its value-state until editing is finished.
	        // 2: If useViewMode is true and editing is changing to true,
	        //    prevent the related cell-view from changing its state to enable editing,
	        //    as the editing-layer will be used for editing instead.
	        return valueChangedOnEditing || (useViewMode && editingChangedToTrue);
	    }
	});

	module.exports = Row;


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview RowList 클래스파일
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);

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
	var RowList = Collection.extend(/** @lends module:model/rowList.prototype */{
	    initialize: function(rawData, options) {
	        _.assign(this, {
	            dataModel: options.dataModel,
	            columnModel: options.columnModel,
	            focusModel: options.focusModel
	        });
	    },

	    model: Row
	});

	module.exports = RowList;


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Render model to be used for smart-rendering
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);

	var Renderer = __webpack_require__(24);
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
	var SmartRenderer = Renderer.extend(/** @lends module:model/renderer-smart.prototype */{
	    initialize: function() {
	        Renderer.prototype.initialize.apply(this, arguments);

	        this.on('change:scrollTop', this._onChangeScrollTop, this);
	        this.listenTo(this.dimensionModel, 'change:bodyHeight', this._onChangeBodyHeight);
	    },

	    /**
	     * Event handler for change:scrollTop event
	     * @private
	     */
	    _onChangeScrollTop: function() {
	        if (this._shouldRefresh(this.get('scrollTop'))) {
	            this._setRenderingRange();
	        }
	    },

	    /**
	     * Event handler for change:bodyHeight event on model/dimension
	     * @private
	     */
	    _onChangeBodyHeight: function() {
	        this._setRenderingRange();
	    },

	    /**
	     * Calculate the range to render and set the attributes.
	     * @param {boolean} silent - whether set attributes silently
	     * @private
	     */
	    _setRenderingRange: function(silent) {
	        var scrollTop = this.get('scrollTop');
	        var dimensionModel = this.dimensionModel;
	        var dataModel = this.dataModel;
	        var coordRowModel = this.coordRowModel;
	        var bodyHeight = dimensionModel.get('bodyHeight');
	        var bufferSize = parseInt(bodyHeight * BUFFER_RATIO, 10);
	        var startIndex = Math.max(coordRowModel.indexOf(scrollTop - bufferSize), 0);
	        var endIndex = Math.min(coordRowModel.indexOf(scrollTop + bodyHeight + bufferSize), dataModel.length - 1);
	        var top, bottom;

	        if (dataModel.isRowSpanEnable()) {
	            startIndex += this._getStartRowSpanMinCount(startIndex);
	            endIndex += this._getEndRowSpanMaxCount(endIndex);
	        }

	        top = coordRowModel.getOffsetAt(startIndex);
	        bottom = coordRowModel.getOffsetAt(endIndex) +
	            coordRowModel.getHeightAt(endIndex) + CELL_BORDER_WIDTH;

	        this.set({
	            top: top,
	            bottom: bottom,
	            startIndex: startIndex,
	            endIndex: endIndex
	        }, {
	            silent: silent
	        });
	    },

	    /**
	     * 렌더링을 시작하는 행에 rowSpan 정보가 있으면, count 값이 가장 작은 행의 값을 반환한다.
	     * @param {number} startIndex 시작하는 행의 Index
	     * @returns {number} rowSpan의 count 값 (0 이하)
	     * @private
	     */
	    _getStartRowSpanMinCount: function(startIndex) {
	        var firstRow = this.dataModel.at(startIndex);
	        var result = 0;
	        var counts;

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
	        var lastRow = this.dataModel.at(endIndex);
	        var result = 0;
	        var counts;

	        if (lastRow) {
	            counts = _.pluck(lastRow.getRowSpanData(), 'count');
	            counts.push(0); // count가 양수인 경우(mainRow인 경우)에만 최대값을 구함. 없으면 0
	            result = _.max(counts);
	        }

	        // subtract 1, as the count includes main-cell itself
	        if (result > 0) {
	            result -= 1;
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


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Selection Model class
	 * @author NHN Ent. FE Development Lab
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);

	var Model = __webpack_require__(9);
	var GridEvent = __webpack_require__(15);

	var util = __webpack_require__(16);
	var typeConst = __webpack_require__(10).selectionType;

	/**
	 * Selection Model class
	 * @module model/selection
	 * @extends module:base/view
	 * @param {Object} attr - Attributes
	 * @param {Object} options - Options
	 * @ignore
	 */
	var Selection = Model.extend(/** @lends module:model/selection.prototype */{
	    initialize: function(attr, options) {
	        var domEventBus;

	        Model.prototype.initialize.apply(this, arguments);

	        _.assign(this, {
	            dataModel: options.dataModel,
	            columnModel: options.columnModel,
	            dimensionModel: options.dimensionModel,
	            focusModel: options.focusModel,
	            renderModel: options.renderModel,
	            coordRowModel: options.coordRowModel,
	            coordConverterModel: options.coordConverterModel,
	            domEventBus: options.domEventBus,

	            inputRange: null,
	            minimumColumnRange: null,
	            intervalIdForAutoScroll: null,
	            scrollPixelScale: 40,
	            enabled: true,
	            selectionType: typeConst.CELL,
	            selectionUnit: attr.selectionUnit
	        });

	        this.listenTo(this.dataModel, 'add remove sort reset', this.end);
	        this.listenTo(this.dataModel, 'paste', this._onPasteData);

	        if (this.isEnabled() && options.domEventBus) {
	            domEventBus = options.domEventBus;
	            this.listenTo(domEventBus, 'dragstart:header', this._onDragStartHeader);
	            this.listenTo(domEventBus, 'dragmove:header', this._onDragMoveHeader);
	            this.listenTo(domEventBus, 'dragmove:body', this._onDragMoveBody);
	            this.listenTo(domEventBus, 'dragend:body', this._onDragEndBody);
	            this.listenTo(domEventBus, 'mousedown:body', this._onMouseDownBody);
	            this.listenTo(domEventBus, 'key:move key:edit', this._onKeyMoveOrEdit);
	            this.listenTo(domEventBus, 'key:select', this._onKeySelect);
	            this.listenTo(domEventBus, 'key:delete', this._onKeyDelete);
	        }

	        this.on('change:range', this._triggerSelectionEvent);
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
	     * Event handler for 'dragstart:header' event on domEventBus
	     * @param {module:event/gridEvent} gridEvent - GridEvent
	     * @private
	     */
	    _onDragStartHeader: function(gridEvent) {
	        var columnModel = this.columnModel;
	        var columnNames = columnModel.getUnitColumnNamesIfMerged(gridEvent.columnName);
	        var columnRange;

	        if (_.some(columnNames, util.isMetaColumn)) {
	            gridEvent.stop();

	            return;
	        }

	        columnRange = this._getColumnRangeWithNames(columnNames);

	        if (gridEvent.shiftKey) {
	            this.update(0, columnRange[1], typeConst.COLUMN);
	            this._extendColumnSelection(columnRange, gridEvent.pageX, gridEvent.pageY);
	        } else {
	            this.minimumColumnWidth = columnRange;
	            this.selectColumn(columnRange[0]);
	            this.update(0, columnRange[1]);
	        }
	    },

	    /**
	     * Event handler for 'dragmove:header' event on domEventBus
	     * @param {module:event/gridEvent} gridEvent - GridEvent
	     * @private
	     */
	    _onDragMoveHeader: function(gridEvent) {
	        var columnModel = this.columnModel;
	        var columnNames, columnRange;

	        if (gridEvent.isOnHeaderArea && !gridEvent.columnName) {
	            return;
	        }

	        columnNames = columnModel.getUnitColumnNamesIfMerged(gridEvent.columnName);
	        if (columnNames.length) {
	            columnRange = this._getColumnRangeWithNames(columnNames);
	        }
	        this._extendColumnSelection(columnRange, gridEvent.pageX, gridEvent.pageY);
	    },

	    /**
	     * Event handler for key:move/key:edit fevent on domEventBus
	     * @private
	     */
	    _onKeyMoveOrEdit: function() {
	        this.end();
	    },

	    /**
	     * Event handler for key:select event on domEventBus
	     * @param {module:event/gridEvent} ev - GridEvent
	     * @private
	     */
	    _onKeySelect: function(ev) { // eslint-disable-line complexity
	        var address = this._getRecentAddress();
	        var lastRowIndex = this.dataModel.length - 1;
	        var lastColummnIndex = this.columnModel.getVisibleColumns().length - 1;

	        switch (ev.command) {
	            case 'up':
	                address.row -= 1;
	                break;
	            case 'down':
	                address.row += 1;
	                break;
	            case 'left':
	                address.column -= 1;
	                break;
	            case 'right':
	                address.column += 1;
	                break;
	            case 'pageUp':
	                address.row = this.coordRowModel.getPageMovedIndex(address.row, false);
	                break;
	            case 'pageDown':
	                address.row = this.coordRowModel.getPageMovedIndex(address.row, true);
	                break;
	            case 'firstColumn':
	                address.column = 0;
	                break;
	            case 'lastColumn':
	                address.column = lastColummnIndex;
	                break;
	            case 'firstCell':
	                address.row = 0;
	                address.column = 0;
	                break;
	            case 'lastCell':
	                address.row = lastRowIndex;
	                address.column = lastColummnIndex;
	                break;
	            case 'all':
	                this.selectAll();
	                address = null;
	                break;
	            default:
	                address = null;
	        }

	        if (address) {
	            this.update(address.row, address.column, this.getSelectionUnit());
	            this._scrollTo(address.row, address.column);
	        }
	    },

	    /**
	     * Event handler for key:delete event on domEventBus
	     * @private
	     */
	    _onKeyDelete: function() {
	        var dataModel = this.dataModel;
	        var focused;

	        if (this.hasSelection()) {
	            dataModel.delRange(this.get('range'));
	        } else {
	            focused = this.focusModel.which();
	            dataModel.del(focused.rowKey, focused.columnName);
	        }
	    },

	    /**
	     * Return an address of recently extended cell
	     * @returns {{row: number, column:number}} index
	     * @private
	     */
	    _getRecentAddress: function() {
	        var focusedIndex = this.focusModel.indexOf();
	        var selectionRange = this.get('range');
	        var index = _.assign({}, focusedIndex);
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
	     * Returns whether the given address is valid
	     * @param {{row: number, column: number}} address - address
	     * @returns {boolean}
	     * @private
	     */
	    _isValidAddress: function(address) {
	        return !!this.dataModel.at(address.row) && !!this.columnModel.at(address.colummn);
	    },

	    /**
	     * Scrolls to the position of given address
	     * @param {number} rowIndex - row index
	     * @param {number} columnIndex - column index
	     * @private
	     */
	    _scrollTo: function(rowIndex, columnIndex) {
	        var row = this.dataModel.at(rowIndex);
	        var column = this.columnModel.at(columnIndex);
	        var rowKey, columnName, selectionType, scrollPosition;

	        if (!row || !column) {
	            return;
	        }

	        rowKey = row.get('rowKey');
	        columnName = column.name;
	        scrollPosition = this.coordConverterModel.getScrollPosition(rowKey, columnName);
	        if (scrollPosition) {
	            selectionType = this.getType();
	            if (selectionType === typeConst.COLUMN) {
	                delete scrollPosition.scrollTop;
	            } else if (selectionType === typeConst.ROW) {
	                delete scrollPosition.scrollLeft;
	            }
	            this.renderModel.set(scrollPosition);
	        }
	    },

	    /**
	     * Examine the type of selection with given column index
	     * @param {Number} columnIndex - columnIndex
	     * @returns {String}
	     * @private
	     */
	    _getTypeByColumnIndex: function(columnIndex) {
	        var visibleColumns = this.columnModel.getVisibleColumns(null, true);
	        var columnName = visibleColumns[columnIndex].name;

	        switch (columnName) {
	            case '_button':
	                return null;
	            case '_number':
	                return typeConst.ROW;
	            default:
	                return typeConst.CELL;
	        }
	    },

	    /**
	     * Event handler for 'mousedown:body' event on domEventBus
	     * @param {module:event/gridEvent} gridEvent - GridEvent
	     * @private
	     */
	    _onMouseDownBody: function(gridEvent) {
	        var address = this.coordConverterModel.getIndexFromMousePosition(gridEvent.pageX, gridEvent.pageY, true);
	        var selType = this._getTypeByColumnIndex(address.column);
	        var rowIndex, columnIndex;

	        if (!selType) {
	            return;
	        }

	        rowIndex = address.row;
	        columnIndex = address.column - this.columnModel.getVisibleMetaColumnCount();

	        if (gridEvent.shiftKey) {
	            this.update(rowIndex, Math.max(columnIndex, 0));
	        } else if (selType === typeConst.ROW) {
	            this.selectRow(rowIndex);
	        } else {
	            this.focusModel.focusAt(rowIndex, columnIndex);
	            this.end();
	        }
	    },

	    /**
	     * Event handler for 'dragmove:body' event on domEventBus
	     * @param {module:event/gridEvent} gridEvent - GridEvent
	     * @private
	     */
	    _onDragMoveBody: function(gridEvent) {
	        var address = this.coordConverterModel.getIndexFromMousePosition(gridEvent.pageX, gridEvent.pageY);

	        this.update(address.row, address.column, this.getSelectionUnit());
	        this._setScrolling(gridEvent.pageX, gridEvent.pageY);
	    },

	    /**
	     * Event handler for 'dragend:body' event on domEventBus
	     * @private
	     */
	    _onDragEndBody: function() {
	        this.stopAutoScroll();
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
	     * Returns the range of column index of given column names
	     * @param {Array.<string>} columnNames - column names
	     * @returns {Array.<number>}
	     * @private
	     */
	    _getColumnRangeWithNames: function(columnNames) {
	        var columnModel = this.columnModel;
	        var columnIndexes = _.map(columnNames, function(name) {
	            return columnModel.indexOfColumnName(name, true);
	        });
	        var minMax = util.getMinMax(columnIndexes);

	        return [minMax.min, minMax.max];
	    },

	    /**
	     * Set selection type
	     * @param {string} type - Selection type (CELL, ROW, COLUMN)
	     */
	    setType: function(type) {
	        this.selectionType = typeConst[type] || this.selectionType;
	    },

	    /**
	     * Returns the selection type (using internal state)
	     * @returns {string} type - Selection type (CELL, ROW, COLUMN)
	     */
	    getType: function() {
	        return this.selectionType;
	    },

	    /**
	     * Returns the selection unit (by options)
	     * @returns {string} unit - Selection unit (CELL, ROW)
	     */
	    getSelectionUnit: function() {
	        return this.get('selectionUnit').toUpperCase();
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
	    update: function(rowIndex, columnIndex, type) { // eslint-disable-line complexity
	        var focusedIndex;

	        if (!this.enabled ||
	            (type !== typeConst.COLUMN && rowIndex < 0) ||
	            (type !== typeConst.ROW && columnIndex < 0)) {
	            return;
	        }

	        if (!this.hasSelection()) {
	            focusedIndex = this.focusModel.indexOf();
	            if (type === typeConst.ROW) {
	                this.start(focusedIndex.row, 0, typeConst.ROW);
	            } else {
	                this.start(focusedIndex.row, focusedIndex.column, typeConst.CELL);
	            }
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

	        if (this.selectionType === typeConst.ROW) {
	            columnIndex = this.columnModel.getVisibleColumns().length - 1;
	        } else if (this.selectionType === typeConst.COLUMN) {
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
	     * @private
	     */
	    _extendColumnSelection: function(columnIndexes, pageX, pageY) {
	        var minimumColumnRange = this.minimumColumnRange;
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
	     * selection 영역 선택을 종료하고 selection 데이터를 초기화한다.
	     */
	    end: function() {
	        this.inputRange = null;
	        this.unset('range');
	        this.minimumColumnRange = null;
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
	            this.start(rowIndex, 0, typeConst.ROW);
	            this.update(rowIndex, this.columnModel.getVisibleColumns().length - 1);
	        }
	    },

	    /**
	     * Select all data in a column
	     * @param {Number} columnIdx - Column index
	     */
	    selectColumn: function(columnIdx) {
	        if (this.isEnabled()) {
	            this.focusModel.focusAt(0, columnIdx);
	            this.start(0, columnIdx, typeConst.COLUMN);
	            this.update(this.dataModel.length - 1, columnIdx);
	        }
	    },

	    /**
	     * Selects all data range.
	     */
	    selectAll: function() {
	        if (this.isEnabled()) {
	            this.start(0, 0, typeConst.CELL);
	            this.update(this.dataModel.length - 1, this.columnModel.getVisibleColumns().length - 1);
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
	     * @param {Array.<String>} columnNames - columnNames
	     * @param {Array.<Object>} rowList - rowList
	     * @returns {Boolean}
	     */
	    _isSingleCell: function(columnNames, rowList) {
	        var isSingleColumn = columnNames.length === 1;
	        var isSingleRow = rowList.length === 1;
	        var isSingleMergedCell = isSingleColumn && !isSingleRow &&
	            (rowList[0].getRowSpanData(columnNames[0]).count === rowList.length);

	        return (isSingleColumn && isSingleRow) || isSingleMergedCell;
	    },

	    /**
	     * Returns the string value of all cells in the selection range as a single string.
	     * @returns {String}
	     */
	    getValuesToString: function() {
	        var self = this;
	        var rowList = this._getRangeRowList();
	        var columnNames = this._getRangeColumnNames();
	        var rowValues = _.map(rowList, function(row) {
	            return _.map(columnNames, function(columnName) {
	                return self.getValueToString(row.get('rowKey'), columnName);
	            }).join('\t');
	        });

	        if (this._isSingleCell(columnNames, rowList)) {
	            return rowValues[0];
	        }

	        return rowValues.join('\n');
	    },

	    /**
	     * Returns the string value of a single cell by copy options.
	     * @param {Nubmer} rowKey - Row key
	     * @param {Number} columnName - Column name
	     * @returns {String}
	     */
	    getValueToString: function(rowKey, columnName) {
	        var columnModel = this.columnModel;
	        var cellData = this.renderModel.getCellData(rowKey, columnName);
	        var copyOptions = columnModel.getCopyOptions(columnName);
	        var column = columnModel.getColumnModel(columnName);
	        var row = this.dataModel.get(rowKey);
	        var value = row.getValueString(columnName);
	        var text;

	        if (copyOptions.customValue) {
	            text = this._getCustomValue(
	                copyOptions.customValue,
	                value,
	                row.toJSON(),
	                column
	            );
	        } else if (copyOptions.useListItemText) {
	            text = value;
	        } else if (copyOptions.useFormattedValue) {
	            text = cellData.formattedValue;
	        } else {
	            text = value;
	        }

	        return text;
	    },

	    /**
	     * If the column has a 'copyOptions.customValue' function, exeucute it and returns the result.
	     * @param {String} customValue - value to display
	     * @param {String} value - value to display
	     * @param {Object} rowAttrs - All attributes of the row
	     * @param {Object} column - Column info
	     * @returns {String}
	     * @private
	     */
	    _getCustomValue: function(customValue, value, rowAttrs, column) {
	        var result;

	        if (_.isFunction(customValue)) {
	            result = customValue(value, rowAttrs, column);
	        } else {
	            result = customValue;
	        }

	        return result;
	    },

	    /**
	     * Returns an array of selected row list
	     * @returns {Array.<module:model/data/row>}
	     * @private
	     */
	    _getRangeRowList: function() {
	        var rowRange = this.get('range').row;

	        return this.dataModel.slice(rowRange[0], rowRange[1] + 1);
	    },

	    /**
	     * Returns an array of selected column names
	     * @returns {Array.<string>}
	     * @private
	     */
	    _getRangeColumnNames: function() {
	        var columnRange = this.get('range').column;
	        var columns = this.columnModel.getVisibleColumns().slice(columnRange[0], columnRange[1] + 1);

	        return _.pluck(columns, 'name');
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
	    _resetRangeAttribute: function(inputRange) { // eslint-disable-line complexity
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

	        if (dataModel.isRowSpanEnable() && this.selectionType === typeConst.CELL) {
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
	     * Trigger 'selection' event
	     * @private
	     */
	    _triggerSelectionEvent: function() {
	        var range = this.get('range');
	        var dataModel = this.dataModel;
	        var columnModel = this.columnModel;
	        var rowRange, columnRange, gridEvent;
	        var startRow, endRow, startColumn, endColumn;

	        if (!range) {
	            return;
	        }

	        rowRange = range.row;
	        columnRange = range.column;

	        startRow = dataModel.getRowDataAt(rowRange[0]);
	        startColumn = columnModel.at(columnRange[0]);
	        endRow = dataModel.getRowDataAt(rowRange[1]);
	        endColumn = columnModel.at(columnRange[1]);

	        if (!startRow || !endRow || !startColumn || !endColumn) {
	            return;
	        }

	        gridEvent = new GridEvent(null, {
	            range: {
	                start: [startRow.rowKey, startColumn.name],
	                end: [endRow.rowKey, endColumn.name]
	            }
	        });

	        /**
	         * Occurs when selecting cells
	         * @event Grid#selection
	         * @type {module:event/gridEvent}
	         * @property {Object} range - Range of selection
	         * @property {Array} range.start - Info of start cell (ex: [rowKey, columName])
	         * @property {Array} range.end - Info of end cell (ex: [rowKey, columnName])
	         * @property {Grid} instance - Current grid instance
	         */
	        this.trigger('selection', gridEvent);
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
	            columnRange[1] = Math.min(this.columnModel.getVisibleColumns().length - 1, columnRange[1]);
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
	        var columns = this.columnModel.getVisibleColumns()
	            .slice(spannedRange.column[0], spannedRange.column[1] + 1);
	        var dataModel = this.dataModel;
	        var startIndexList = [spannedRange.row[0]];
	        var endIndexList = [spannedRange.row[1]];
	        var startRow = dataModel.at(spannedRange.row[0]);
	        var endRow = dataModel.at(spannedRange.row[1]);
	        var newSpannedRange = $.extend({}, spannedRange);
	        var startRowSpanDataMap, endRowSpanDataMap, param;

	        if (!startRow || !endRow) {
	            return newSpannedRange;
	        }

	        startRowSpanDataMap = dataModel.at(spannedRange.row[0]).getRowSpanData();
	        endRowSpanDataMap = dataModel.at(spannedRange.row[1]).getRowSpanData();

	        // 모든 열을 순회하며 각 열마다 설정된 rowSpan 정보에 따라 인덱스를 업데이트 한다.
	        _.each(columns, function(columnModel) {
	            param = {
	                columnName: columnModel.name,
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


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Focus 관련 데이터 처리름 담당한다.
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var Model = __webpack_require__(9);
	var typeConst = __webpack_require__(10).summaryType;

	/**
	 * Summary Model
	 * @module model/summary
	 * @extends module:base/model
	 * @param {Object} attr - attributes
	 * @param {Object} options - options
	 * @ignore
	 */
	var Summary = Model.extend(/** @lends module:model/summary.prototype */{
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
	        this.listenTo(this.dataModel, 'deleteRange', this._onDeleteRangeData);

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
	        this._resetSummarySummaryValue();
	    },

	    /**
	     * Reset summary values of given columnName
	     * @param {Array.<string>} columnNames - An array of column names
	     * @private
	     */
	    _resetSummarySummaryValue: function(columnNames) {
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
	        this._resetSummarySummaryValue(_.keys(model.changed));
	    },

	    /**
	     * Event handler for 'deleteRange' event on dataModel
	     * @param {GridEvent} ev - event object when "delRange" event is fired
	     * @private
	     */
	    _onDeleteRangeData: function(ev) {
	        this._resetSummarySummaryValue(ev.columnNames);
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

	        value = snippet.pick(valueMap, summaryType);

	        return _.isUndefined(value) ? null : value;
	    }
	});

	module.exports = Summary;


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Clipboard Model
	 * @author NHN Ent. FE Development Lab
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);
	var Model = __webpack_require__(9);

	/**
	 * Clipboard Model
	 * @module model/clipboard
	 * @extends module:base/model
	 * @param {Object} attr - Attributes
	 * @param {Object} options - Options
	 * @ignore
	 */
	var Clipboard = Model.extend(/** @lends module:model/clipboard.prototype*/{
	    initialize: function(attr, options) {
	        Model.prototype.initialize.apply(this, arguments);

	        _.assign(this, {
	            columnModel: options.columnModel,
	            dataModel: options.dataModel,
	            selectionModel: options.selectionModel,
	            renderModel: options.renderModel,
	            focusModel: options.focusModel,
	            copyOptions: options.copyOptions,
	            domEventBus: options.domEventBus
	        });

	        this.listenTo(options.domEventBus, 'key:clipboard', this._onKeyClipboard);
	    },

	    defaults: {
	        /**
	         * String value to be stored in the system clipboard
	         * @type {String}
	         */
	        text: null
	    },

	    /**
	     * Set clipboard text to trigger event
	     */
	    setClipboardText: function() {
	        this.set('text', this._getClipboardText());
	    },

	    /**
	     * Paste the text from clipboard to Grid
	     * @param {array} data - clipboard data
	     */
	    pasteClipboardDataToGrid: function(data) {
	        var selectionModel = this.selectionModel;
	        var focusModel = this.focusModel;
	        var dataModel = this.dataModel;
	        var selRange, selRowLen, selColLen;
	        var startIdx;

	        if (selectionModel.hasSelection()) {
	            selRange = selectionModel.get('range');
	            selRowLen = selRange.row[1] - selRange.row[0] + 1;
	            selColLen = selRange.column[1] - selRange.column[0] + 1;
	            data = this._duplicateData(data, selRowLen, selColLen);
	            startIdx = selectionModel.getStartIndex();
	        } else {
	            startIdx = focusModel.indexOf();
	        }

	        dataModel.paste(data, startIdx);
	    },

	    /**
	     * Event handler for key:clipboard event on the domEventBus
	     * @param {module:event/gridEvent} gridEvent - GridEvent
	     * @private
	     */
	    _onKeyClipboard: function(gridEvent) {
	        var command = gridEvent.command;

	        if (command === 'copy') {
	            this.setClipboardText();
	        }
	    },

	    /**
	     * Duplicate given data based on the selection range
	     * @param {Array.<Array.<string>>} data - 2D array of string values
	     * @param {number} selRowLen - row length of selection range
	     * @param {number} selColLen - column length of selection range
	     * @returns {Array.<Array.<string>>}
	     * @private
	     */
	    _duplicateData: function(data, selRowLen, selColLen) {
	        var dataRowLen = data.length;
	        var dataColLen = data[0].length;
	        var rowDupCount = Math.floor(selRowLen / dataRowLen) - 1;
	        var colDupCount = Math.floor(selColLen / dataColLen) - 1;
	        var result = $.extend(true, [], data);

	        // duplicate rows
	        _.times(rowDupCount, function() {
	            _.forEach(data, function(row) {
	                result.push(row.slice(0));
	            });
	        });

	        // duplicate columns
	        _.forEach(result, function(row) {
	            var rowData = row.slice(0);

	            _.times(colDupCount, function() {
	                [].push.apply(row, rowData);
	            });
	        });

	        return result;
	    },

	    /**
	     * Returns the text to be stored in the clipboard
	     * @returns {String}
	     * @private
	     */
	    _getClipboardText: function() {
	        var selectionModel = this.selectionModel;
	        var focused = this.focusModel.which();
	        var text;

	        if (selectionModel.hasSelection()) {
	            text = selectionModel.getValuesToString();
	        } else {
	            text = selectionModel.getValueToString(focused.rowKey, focused.columnName);
	        }

	        return text;
	    }
	});

	module.exports = Clipboard;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview View factory
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);
	var DatePicker = __webpack_require__(32);

	var ContainerView = __webpack_require__(33);
	var ContentAreaView = __webpack_require__(34);
	var PaginationView = __webpack_require__(35);
	var HeightResizeHandleView = __webpack_require__(37);
	var StateLayerView = __webpack_require__(39);
	var ClipboardView = __webpack_require__(41);
	var LsideFrameView = __webpack_require__(43);
	var RsideFrameView = __webpack_require__(45);
	var HeaderView = __webpack_require__(46);
	var HeaderResizeHandleView = __webpack_require__(47);
	var BodyView = __webpack_require__(48);
	var BodyTableView = __webpack_require__(49);
	var SummaryView = __webpack_require__(50);
	var RowListView = __webpack_require__(51);
	var SelectionLayerView = __webpack_require__(52);
	var EditingLayerView = __webpack_require__(53);
	var DatePickeLayerView = __webpack_require__(54);
	var FocusLayerView = __webpack_require__(55);
	var isOptionEnabled = __webpack_require__(16).isOptionEnabled;
	var frameConst = __webpack_require__(10).frame;

	/**
	 * View Factory
	 * @module viewFactory
	 * @ignore
	 */
	var ViewFactory = snippet.defineClass({
	    init: function(options) {
	        // dependencies
	        this.domState = options.domState;
	        this.domEventBus = options.domEventBus;
	        this.modelManager = options.modelManager;
	        this.painterManager = options.painterManager;
	        this.componentHolder = options.componentHolder;

	        // view options
	        this.summaryOptions = options.summary;
	        this.heightResizable = options.heightResizable;
	    },

	    /**
	     * Creates container view and returns it.
	     * @param {Object} options - Options set by user
	     * @returns {module:view/container}
	     */
	    createContainer: function() {
	        return new ContainerView({
	            el: this.domState.$el,
	            gridId: this.modelManager.gridId,
	            domEventBus: this.domEventBus,
	            dataModel: this.modelManager.dataModel,
	            dimensionModel: this.modelManager.dimensionModel,
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
	     * Creates pagination view and returns it.
	     * @returns {module:view/pagination} - New pagination view instance
	     */
	    createPagination: function() {
	        if (!isOptionEnabled(this.componentHolder.getOptions('pagination'))) {
	            return null;
	        }

	        return new PaginationView({
	            componentHolder: this.componentHolder,
	            dimensionModel: this.modelManager.dimensionModel,
	            focusModel: this.modelManager.focusModel
	        });
	    },

	    /**
	     * Creates height resize handle view and returns it.
	     * @returns {module:view/resizeHandle} - New resize hander view instance
	     */
	    createHeightResizeHandle: function() {
	        if (!isOptionEnabled(this.heightResizable)) {
	            return null;
	        }

	        return new HeightResizeHandleView({
	            dimensionModel: this.modelManager.dimensionModel,
	            domEventBus: this.domEventBus
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
	            clipboardModel: this.modelManager.clipboardModel,
	            focusModel: this.modelManager.focusModel,
	            domEventBus: this.domEventBus
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
	            headerHeight: this.modelManager.dimensionModel.get('headerHeight'),
	            renderModel: this.modelManager.renderModel,
	            focusModel: this.modelManager.focusModel,
	            selectionModel: this.modelManager.selectionModel,
	            dataModel: this.modelManager.dataModel,
	            columnModel: this.modelManager.columnModel,
	            coordRowModel: this.modelManager.coordRowModel,
	            coordColumnModel: this.modelManager.coordColumnModel,
	            domEventBus: this.domEventBus,
	            viewFactory: this
	        });
	    },

	    /**
	     * Creates summary view and returns it.
	     * @param {string} whichSide - 'L'(left) or 'R'(right)
	     * @returns {object}
	     */
	    createSummary: function(whichSide) {
	        var templateMap = {};

	        if (!this.summaryOptions) {
	            return null;
	        }

	        _.each(this.summaryOptions.columnContent, function(options, columnName) {
	            if (_.isFunction(options.template)) {
	                templateMap[columnName] = options.template;
	            }
	        });

	        return new SummaryView({
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
	     * @param {string} whichSide - 'L'(left) or 'R'(right)
	     * @param {array} handleHeights - Height values of each resize handle
	     * @param {boolean} frozenBorder - Whether the resize handle is matching the frozen border or not
	     * @returns {module:view/layout/header} New resize handler view instance
	     */
	    createHeaderResizeHandle: function(whichSide, handleHeights, frozenBorder) {
	        return new HeaderResizeHandleView({
	            whichSide: whichSide,
	            handleHeights: handleHeights,
	            frozenBorder: frozenBorder,
	            columnModel: this.modelManager.columnModel,
	            dimensionModel: this.modelManager.dimensionModel,
	            coordColumnModel: this.modelManager.coordColumnModel,
	            domEventBus: this.domEventBus
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
	            domEventBus: this.domEventBus,
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
	        if (!DatePicker) {
	            return null;
	        }

	        return new DatePickeLayerView({
	            focusModel: this.modelManager.focusModel,
	            columnModel: this.modelManager.columnModel,
	            textPainter: this.painterManager.getInputPainters().text,
	            domState: this.domState,
	            domEventBus: this.domEventBus
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


/***/ }),
/* 32 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_32__;

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview View class that conaints a top element of the DOM structure of the grid.
	 * @author NHN Ent. FE Development Lab
	 */

	'use strict';

	var $ = __webpack_require__(7);

	var View = __webpack_require__(4);
	var GridEvent = __webpack_require__(15);
	var targetTypeConst = GridEvent.targetTypeConst;
	var attrNameConst = __webpack_require__(10).attrName;
	var classNameConst = __webpack_require__(18);

	/**
	 * Container View
	 * @module view/container
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	var Container = View.extend(/** @lends module:view/container.prototype */{
	    initialize: function(options) {
	        View.prototype.initialize.call(this);

	        this.gridId = options.gridId;
	        this.dimensionModel = options.dimensionModel;
	        this.dataModel = options.dataModel;
	        this.viewFactory = options.viewFactory;
	        this.domEventBus = options.domEventBus;

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
	        this.domEventBus.trigger('windowResize');
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
	     * Event handler for 'setWidth' event on Dimension
	     * @private
	     */
	    _onSetWidth: function() {
	        this.$el.width(this.dimensionModel.get('width'));
	    },

	    /**
	     * Event handler for click event
	     * The reason for using 'elementFromPoint' is because of the selection.
	     * @param {MouseEvent} ev - Mouse event
	     * @private
	     */
	    _onClick: function(ev) {
	        var pointX = ev.pageX - window.pageXOffset;
	        var pointY = ev.pageY - window.pageYOffset;
	        var $target = $(document.elementFromPoint(pointX, pointY));
	        var gridEvent = new GridEvent(ev, GridEvent.getTargetInfo($target));

	        /**
	         * Occurs when a mouse button is clicked on the Grid.
	         * The properties of the event object include the native event object.
	         * @event Grid#click
	         * @type {module:event/gridEvent}
	         * @property {jQueryEvent} nativeEvent - Event object
	         * @property {string} targetType - Type of event target
	         * @property {number} rowKey - rowKey of the target cell
	         * @property {string} columnName - columnName of the target cell
	         * @property {Grid} instance - Current grid instance
	         */
	        this.domEventBus.trigger('click', gridEvent);

	        if (!gridEvent.isStopped() && gridEvent.targetType === targetTypeConst.CELL) {
	            this.domEventBus.trigger('click:cell', gridEvent);
	        }
	    },

	    /**
	     * Event handler for the dblclick event
	     * @param {MouseEvent} ev - MouseEvent
	     * @private
	     */
	    _onDblClick: function(ev) {
	        var $target = $(ev.target);
	        var gridEvent = new GridEvent(ev, GridEvent.getTargetInfo($target));

	        /**
	         * Occurs when a mouse button is double clicked on the Grid.
	         * The properties of the event object include the native event object.
	         * @event Grid#dblclick
	         * @type {module:event/gridEvent}
	         * @property {jQueryEvent} nativeEvent - Event object
	         * @property {string} targetType - Type of event target
	         * @property {number} rowKey - rowKey of the target cell
	         * @property {string} columnName - columnName of the target cell
	         * @property {Grid} instance - Current grid instance
	         */
	        this.domEventBus.trigger('dblclick', gridEvent);

	        if (!gridEvent.isStopped() && gridEvent.targetType === targetTypeConst.CELL) {
	            this.domEventBus.trigger('dblclick:cell', gridEvent);
	        }
	    },

	    /**
	     * Event listener for the mouseover event
	     * @param {MouseEvent} ev - MouseEvent
	     * @private
	     */
	    _onMouseOver: function(ev) {
	        var $target = $(ev.target);
	        var gridEvent = new GridEvent(ev, GridEvent.getTargetInfo($target));

	        /**
	         * Occurs when a mouse pointer is moved onto the Grid.
	         * The properties of the event object include the native MouseEvent object.
	         * @event Grid#mouseover
	         * @type {module:event/gridEvent}
	         * @property {jQueryEvent} nativeEvent - Event object
	         * @property {string} targetType - Type of event target
	         * @property {number} rowKey - rowKey of the target cell
	         * @property {string} columnName - columnName of the target cell
	         * @property {Grid} instance - Current grid instance
	         */
	        this.domEventBus.trigger('mouseover', gridEvent);
	    },

	    /**
	     * Event listener for the mouseout event
	     * @param {MouseEvent} ev - MouseEvent
	     * @private
	     */
	    _onMouseOut: function(ev) {
	        var $target = $(ev.target);
	        var gridEvent = new GridEvent(ev, GridEvent.getTargetInfo($target));

	        /**
	         * Occurs when a mouse pointer is moved off from the Grid.
	         * The event object has all properties copied from the native MouseEvent.
	         * @event Grid#mouseout
	         * @type {module:event/gridEvent}
	         * @property {jQueryEvent} nativeEvent - Event object
	         * @property {string} targetType - Type of event target
	         * @property {number} rowKey - rowKey of the target cell
	         * @property {string} columnName - columnName of the target cell
	         * @property {Grid} instance - Current grid instance
	         */
	        this.domEventBus.trigger('mouseout', gridEvent);
	    },

	    /**
	     * Event handler for 'mousedown' event
	     * @param {MouseEvent} ev - Mouse event
	     * @private
	     */
	    _onMouseDown: function(ev) {
	        var $target = $(ev.target);
	        var gridEvent = new GridEvent(ev, GridEvent.getTargetInfo($target));
	        var shouldFocus = !$target.is('input, a, button, select, textarea');
	        var mainButton = gridEvent.columnName === '_button' && $target.parent().is('label');

	        if (shouldFocus && !mainButton) {
	            ev.preventDefault();

	            // fix IE8 bug (cancelling event doesn't prevent focused element from losing foucs)
	            $target[0].unselectable = true;

	            /**
	             * Occurs when a mouse button is downed on the Grid.
	             * The event object has all properties copied from the native MouseEvent.
	             * @event Grid#mousedown
	             * @type {module:event/gridEvent}
	             * @property {jQueryEvent} nativeEvent - Event object
	             * @property {string} targetType - Type of event target
	             * @property {number} rowKey - rowKey of the target cell
	             * @property {string} columnName - columnName of the target cell
	             * @property {Grid} instance - Current grid instance
	             */
	            this.domEventBus.trigger('mousedown:focus', gridEvent);
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

	        return this;
	    },

	    /**
	     * Destroy
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


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Class for the content area
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var View = __webpack_require__(4);
	var classNameConst = __webpack_require__(18);
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
	ContentArea = View.extend(/** @lends module:view/layout/content-area.prototype */{
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
	        var childElements = this._renderChildren().concat([
	            borderDIV(classNameConst.BORDER_TOP),
	            borderDIV(classNameConst.BORDER_LEFT),
	            borderDIV(classNameConst.BORDER_RIGHT),
	            borderDIV(classNameConst.BORDER_BOTTOM).css('bottom', scrollXHeight)
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


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Class for the pagination
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);

	var TuiPaginaton = __webpack_require__(36);

	var View = __webpack_require__(4);
	var defaultOptions = {
	    totalItems: 1,
	    itemsPerPage: 10,
	    visiblePages: 5,
	    centerAlign: true
	};
	var TUI_PAGINATION_CLASSNAME = 'tui-pagination';

	/**
	 * Class for the pagination
	 * @module view/pagination
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	var Pagination = View.extend(/** @lends module:view/pagination.prototype */{
	    initialize: function(options) {
	        this.dimensionModel = options.dimensionModel;
	        this.componentHolder = options.componentHolder;

	        this._stopEventPropagation();

	        this.on('appended', this._onAppended);
	    },

	    className: TUI_PAGINATION_CLASSNAME,

	    /**
	     * Render
	     * @returns {Object} this object
	     */
	    render: function() {
	        this._destroyChildren();
	        this.componentHolder.setInstance('pagination', this._createComponent());

	        return this;
	    },

	    /**
	     * Stop propagation of mouse down event
	     * @private
	     */
	    _stopEventPropagation: function() {
	        this.$el.mousedown(function(ev) {
	            ev.stopPropagation();
	        });
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

	        if (customOptions === true) {
	            customOptions = {};
	        }

	        return _.assign({}, defaultOptions, customOptions);
	    },

	    /**
	     * Create new tui.component.Pagination instance
	     * @returns {tui.component.Pagination}
	     * @private
	     */
	    _createComponent: function() {
	        var ComponentClass = TuiPaginaton;

	        if (!ComponentClass) {
	            throw new Error('Cannot find component \'tui.component.Pagination\'');
	        }

	        return new ComponentClass(this.$el, this._createOptionObject());
	    }
	});

	module.exports = Pagination;


/***/ }),
/* 36 */
/***/ (function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_36__;

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Class for the height resize handle
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var View = __webpack_require__(4);
	var classNameConst = __webpack_require__(18);
	var DragEventEmitter = __webpack_require__(38);

	/**
	 * Class for the height resize handle
	 * @module view/layout/heightResizeHandle
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	var HeightResizeHandle = View.extend(/** @lends module:view/layout/heightResizeHandle.prototype */{
	    initialize: function(options) {
	        this.dimensionModel = options.dimensionModel;
	        this.domEventBus = options.domEventBus;

	        this.dragEmitter = new DragEventEmitter({
	            type: 'resizeHeight',
	            cursor: 'row-resize',
	            domEventBus: this.domEventBus
	        });

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
	     * Event handler for 'mousedown' event
	     * @param {MouseEvent} ev - MouseEvent object
	     * @private
	     */
	    _onMouseDown: function(ev) {
	        ev.preventDefault();

	        this.dragEmitter.start(ev, {
	            mouseOffsetY: ev.offsetY
	        });
	    },

	    /**
	     * Render
	     * @returns {Object} this object
	     */
	    render: function() {
	        this.$el.html('<button><span></span></button>');

	        return this;
	    }
	});

	module.exports = HeightResizeHandle;


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Drag event emitter
	 * @author NHN Ent. FE Development Lab
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var GridEvent = __webpack_require__(15);

	/* Drag event emitter
	 * @module event/dragEventEmitter
	 * @ignore
	 */
	var DragEventEmitter = snippet.defineClass(/** @lends module:event/dragEventEmitter.prototype */{
	    init: function(options) {
	        _.assign(this, {
	            type: options.type,
	            domEventBus: options.domEventBus,
	            onDragMove: options.onDragMove,
	            onDragEnd: options.onDragEnd,
	            cursor: options.cursor,
	            startData: null
	        });
	    },

	    /**
	     * Starts drag
	     * @param {MouseEvent} ev - MouseEvent
	     * @param {Object} data - start data (to be used in dragmove, dragend event)
	     */
	    start: function(ev, data) {
	        var gridEvent = new GridEvent(ev, data);

	        this.domEventBus.trigger('dragstart:' + this.type, gridEvent);

	        if (!gridEvent.isStopped()) {
	            this._startDrag(ev.target, data);
	        }
	    },

	    /**
	     * Starts drag
	     * @param {HTMLElement} target - drag target
	     * @param {Object} data - start data
	     * @private
	     */
	    _startDrag: function(target, data) {
	        this.startData = data;
	        this._attachDragEvents();

	        if (this.cursor) {
	            $('body').css('cursor', this.cursor);
	        }

	        // for IE8 and under
	        if (target.setCapture) {
	            target.setCapture();
	        }
	    },

	    /**
	     * Ends drag
	     * @private
	     */
	    _endDrag: function() {
	        this.startData = null;
	        this._detachDragEvents();

	        if (this.cursor) {
	            $('body').css('cursor', 'default');
	        }

	        // for IE8 and under
	        if (document.releaseCapture) {
	            document.releaseCapture();
	        }
	    },

	    /**
	     * Event handler for 'mousemove' event on document
	     * @param {MouseEvent} ev - MouseEvent
	     * @private
	     */
	    _onMouseMove: function(ev) {
	        var gridEvent = new GridEvent(ev, {
	            startData: this.startData,
	            pageX: ev.pageX,
	            pageY: ev.pageY
	        });

	        if (_.isFunction(this.onDragMove)) {
	            this.onDragMove(gridEvent);
	        }

	        if (!gridEvent.isStopped()) {
	            this.domEventBus.trigger('dragmove:' + this.type, gridEvent);
	        }
	    },

	    /**
	     * Event handler for 'mouseup' event on document
	     * @param {MouseEvent} ev - MouseEvent
	     * @private
	     */
	    _onMouseUp: function(ev) {
	        var gridEvent = new GridEvent(ev, {
	            startData: this.startData
	        });

	        if (_.isFunction(this.onDragEnd)) {
	            this.onDragEnd(gridEvent);
	        }

	        if (!gridEvent.isStopped()) {
	            this.domEventBus.trigger('dragend:' + this.type, gridEvent);
	            this._endDrag();
	        }
	    },

	    /**
	     * Event handler for 'selectstart' event on document
	     * @param {MouseEvent} ev - MouseEvent
	     * @private
	     */
	    _onSelectStart: function(ev) {
	        ev.preventDefault();
	    },

	    /**
	     * Attach mouse event handlers for drag to document
	     * @private
	     */
	    _attachDragEvents: function() {
	        $(document)
	            .on('mousemove.grid', _.bind(this._onMouseMove, this))
	            .on('mouseup.grid', _.bind(this._onMouseUp, this))
	            .on('selectstart.grid', _.bind(this._onSelectStart, this));
	    },

	    /**
	     * Detach mouse event handlers drag from document
	     * @private
	     */
	    _detachDragEvents: function() {
	        $(document).off('.grid');
	    }
	});

	module.exports = DragEventEmitter;


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Layer class that represents the state of rendering phase
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);

	var View = __webpack_require__(4);
	var stateConst = __webpack_require__(10).renderState;
	var classNameConst = __webpack_require__(18);
	var i18n = __webpack_require__(40);
	var TABLE_BORDER_WIDTH = __webpack_require__(10).dimension.TABLE_BORDER_WIDTH;

	/**
	 * Layer class that represents the state of rendering phase.
	 * @module view/stateLayer
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	var StateLayer = View.extend(/** @lends module:view/stateLayer.prototype */{
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
	                return i18n.get('display.loadingData');
	            case stateConst.EMPTY:
	                return i18n.get('display.noData');
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
	        var scrollXHeight = dimensionModel.getScrollXHeight();
	        var scrollYWidth = dimensionModel.getScrollYWidth();

	        this.$el.css({
	            top: headerHeight - TABLE_BORDER_WIDTH,
	            height: bodyHeight - scrollXHeight - TABLE_BORDER_WIDTH,
	            left: 0,
	            right: scrollYWidth
	        });
	    }
	});

	module.exports = StateLayer;


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview i18n module file
	 * @author NHN Ent. Fe Development Lab
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var util = __webpack_require__(16);

	var messages = {
	    en: {
	        display: {
	            noData: 'No data.',
	            loadingData: 'Loading data.',
	            resizeHandleGuide: 'You can change the width of the column by mouse drag, ' +
	                                'and initialize the width by double-clicking.'
	        },
	        net: {
	            confirmCreate: 'Are you sure you want to create {{count}} data?',
	            confirmUpdate: 'Are you sure you want to update {{count}} data?',
	            confirmDelete: 'Are you sure you want to delete {{count}} data?',
	            confirmModify: 'Are you sure you want to modify {{count}} data?',
	            noDataToCreate: 'No data to create.',
	            noDataToUpdate: 'No data to update.',
	            noDataToDelete: 'No data to delete.',
	            noDataToModify: 'No data to modify.',
	            failResponse: 'An error occurred while requesting data.\nPlease try again.'
	        }
	    },
	    ko: {
	        display: {
	            noData: '데이터가 존재하지 않습니다.',
	            loadingData: '데이터를 불러오는 중입니다.',
	            resizeHandleGuide: '마우스 드래그하여 컬럼 너비를 조정할 수 있고, ' +
	                                '더블 클릭으로 컬럼 너비를 초기화할 수 있습니다.'
	        },
	        net: {
	            confirmCreate: '{{count}}건의 데이터를 생성하겠습니까?',
	            confirmUpdate: '{{count}}건의 데이터를 수정하겠습니까?',
	            confirmDelete: '{{count}}건의 데이터를 삭제하겠습니까?',
	            confirmModify: '{{count}}건의 데이터를 처리하겠습니까?',
	            noDataToCreate: '생성할 데이터가 없습니다.',
	            noDataToUpdate: '수정할 데이터가 없습니다.',
	            noDataToDelete: '삭제할 데이터가 없습니다.',
	            noDataToModify: '처리할 데이터가 없습니다.',
	            failResponse: '데이터 요청 중에 에러가 발생하였습니다.\n다시 시도하여 주시기 바랍니다.'
	        }
	    }
	};

	var messageMap = {};

	/**
	 * Flatten message map
	 * @param {object} data - Messages
	 * @returns {object} Flatten message object (key foramt is 'key.subKey')
	 * @ignore
	 */
	function flattenMessageMap(data) {
	    var obj = {};
	    var newKey;

	    _.each(data, function(groupMessages, key) {
	        _.each(groupMessages, function(message, subKey) {
	            newKey = [key, subKey].join('.');
	            obj[newKey] = message;
	        });
	    }, this);

	    return obj;
	}

	module.exports = {
	    /**
	     * Set messages
	     * @param {string} localeCode - Code to set locale messages and
	     *     this is the language or language-region combination. (ex: en-US)
	     * @param {object} [data] - Messages using in Grid
	     */
	    setLanguage: function(localeCode, data) {
	        var localeMessages = messages[localeCode];
	        var originData, newData;

	        if (!localeMessages && !data) {
	            throw new Error('You should set messages to map the locale code.');
	        }

	        newData = flattenMessageMap(data);

	        if (localeMessages) {
	            originData = flattenMessageMap(localeMessages);
	            messageMap = _.extend(originData, newData);
	        } else {
	            messageMap = newData;
	        }
	    },

	    /**
	     * Get message
	     * @param {string} key - Key to find message (ex: 'net.confirmCreate')
	     * @param {object} [replacements] - Values to replace string
	     * @returns {string} Message
	     */
	    get: function(key, replacements) {
	        var message = messageMap[key];

	        if (replacements) {
	            message = util.replaceText(message, replacements);
	        }

	        return message;
	    }
	};


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Hidden Textarea View for handling key navigation events and emulating clipboard actions
	 * @author NHN Ent. FE Development Lab
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var View = __webpack_require__(4);
	var clipboardUtil = __webpack_require__(17);
	var keyEvent = __webpack_require__(42);
	var classNameConst = __webpack_require__(18);
	var KEYDOWN_LOCK_TIME = 10;
	var Clipboard;

	var isEdge = snippet.browser.edge;
	var supportWindowClipboardData = !!window.clipboardData;

	/**
	 * Returns whether the ev.preventDefault should be called
	 * @param {module:event/gridEvent} gridEvent - GridEvent
	 * @returns {boolean}
	 * @ignore
	 */
	function shouldPreventDefault(gridEvent) {
	    return gridEvent.type !== 'key:clipboard';
	}

	/**
	 * Returns whether given GrivEvent instance is paste event
	 * @param {module:event/gridEvent} gridEvent - GridEvent
	 * @returns {boolean}
	 * @ignore
	 */
	function isPasteEvent(gridEvent) {
	    return gridEvent.type === 'key:clipboard' && gridEvent.command === 'paste';
	}

	/**
	 * Clipboard view class
	 * @module view/clipboard
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	Clipboard = View.extend(/** @lends module:view/clipboard.prototype */{
	    initialize: function(options) {
	        _.assign(this, {
	            focusModel: options.focusModel,
	            clipboardModel: options.clipboardModel,
	            domEventBus: options.domEventBus,

	            isLocked: false,
	            lockTimerId: null
	        });

	        this.listenTo(this.focusModel, 'focusClipboard', this._onFocusClipboard);
	        this.listenTo(this.clipboardModel, 'change:text', this._onClipboardTextChange);
	    },

	    tagName: 'div',

	    className: classNameConst.CLIPBOARD,

	    attributes: {
	        contenteditable: true
	    },

	    events: {
	        keydown: '_onKeyDown',
	        copy: '_onCopy',
	        paste: '_onPaste',
	        blur: '_onBlur'
	    },

	    /**
	     * Render
	     * @returns {module:view/clipboard}
	     */
	    render: function() {
	        return this;
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
	     * Event handler for the keydown event
	     * @param {Event} ev - Event
	     * @private
	     */
	    _onKeyDown: function(ev) {
	        var gridEvent;

	        if (this.isLocked) {
	            ev.preventDefault();

	            return;
	        }

	        gridEvent = keyEvent.generate(ev);

	        if (!gridEvent) {
	            return;
	        }

	        this._lock();

	        if (shouldPreventDefault(gridEvent)) {
	            ev.preventDefault();
	        }

	        if (!isPasteEvent(gridEvent)) {
	            this.domEventBus.trigger(gridEvent.type, gridEvent);
	        }
	    },

	    /**
	     * oncopy event handler
	     * - Step 1: When the keys(ctrl+c) are downed on grid, 'key:clipboard' is triggered.
	     * - Step 2: To listen 'change:text event on the clipboard model.
	     * - Step 3: When 'change:text' event is fired,
	     *           IE browsers set copied data to window.clipboardData in event handler and
	     *           other browsers append copied data and focus to contenteditable element.
	     * - Step 4: Finally, when 'copy' event is fired on browsers except IE,
	     *           setting copied data to ClipboardEvent.clipboardData.
	     * @param {jQueryEvent} ev - Event object
	     * @private
	     */
	    _onCopy: function(ev) {
	        var text = this.clipboardModel.get('text');

	        if (!supportWindowClipboardData) {
	            (ev.originalEvent || ev).clipboardData.setData('text/plain', text);
	        }

	        ev.preventDefault();
	    },

	    /**
	     * onpaste event handler
	     * The original 'paste' event should be prevented on browsers except MS
	     * to block that copied data is appending on contenteditable element.
	     * @param {jQueryEvent} ev - Event object
	     * @private
	     */
	    _onPaste: function(ev) {
	        var clipboardData = (ev.originalEvent || ev).clipboardData || window.clipboardData;

	        if (!isEdge && !supportWindowClipboardData) {
	            ev.preventDefault();
	            this._pasteInOtherBrowsers(clipboardData);
	        } else {
	            this._pasteInMSBrowsers(clipboardData);
	        }
	    },

	    /**
	     * Event handler for 'focusClipboard' event on focusModel
	     * @private
	     */
	    _onFocusClipboard: function() {
	        try {
	            if (!this._hasFocus()) {
	                this.$el.focus();

	                // bug fix for IE8 (calling focus() only once doesn't work)
	                if (!this._hasFocus()) {
	                    this.$el.focus();
	                }
	            }
	        } catch (e) {
	            // Do nothing.
	            // This try/catch block is just for preventing 'Unspecified error'
	            // in IE9(and under) when running test using karma.
	        }
	    },

	    /**
	     * Event handler for the 'change:text' event on the model/clipboard module
	     * @private
	     */
	    _onClipboardTextChange: function() {
	        var text = this.clipboardModel.get('text');

	        if (supportWindowClipboardData) {
	            window.clipboardData.setData('Text', text);
	        } else {
	            this.$el.html(text).focus();
	        }
	    },

	    /**
	     * Paste copied data in other browsers (chrome, safari, firefox)
	     * [if] condition is copying from ms-excel,
	     * [else] condition is copying from the grid or the copied data is plain text.
	     * @param {object} clipboardData - clipboard object
	     * @private
	     */
	    _pasteInOtherBrowsers: function(clipboardData) {
	        var clipboardModel = this.clipboardModel;
	        var data = clipboardData.getData('text/html');
	        var table;

	        if (data && $(data).find('tbody').length > 0) {
	            // step 1: Append copied data on contenteditable element to parsing correctly table data.
	            this.$el.html('<table>' + $(data).find('tbody').html() + '</table>');

	            // step 2: Make grid data from cell data of appended table element.
	            table = this.$el.find('table')[0];
	            data = clipboardUtil.convertTableToData(table);

	            // step 3: Empty contenteditable element to reset.
	            this.$el.html('');
	        } else {
	            data = clipboardData.getData('text/plain');
	            data = clipboardUtil.convertTextToData(data);
	        }

	        clipboardModel.pasteClipboardDataToGrid(data);
	    },

	    /**
	     * Paste copied data in MS-browsers (IE, edge)
	     * @param {object} clipboardData - clipboard object
	     * @private
	     */
	    _pasteInMSBrowsers: function(clipboardData) {
	        var self = this;
	        var clipboardModel = this.clipboardModel;
	        var data = clipboardData.getData('Text');
	        var table;

	        data = clipboardUtil.convertTextToData(data);

	        setTimeout(function() {
	            if (self.$el.find('table').length > 0) {
	                table = self.$el.find('table')[0];
	                data = clipboardUtil.convertTableToData(table);
	            }

	            self.$el.html('');
	            clipboardModel.pasteClipboardDataToGrid(data);
	        }, 0);
	    },

	    /**
	     * Lock for a moment to reduce event frequency
	     * @private
	     */
	    _lock: function() {
	        this.isLocked = true;
	        this.lockTimerId = setTimeout(_.bind(this._unlock, this), KEYDOWN_LOCK_TIME);
	    },

	    /**
	     * Unlock
	     * @private
	     */
	    _unlock: function() {
	        this.isLocked = false;
	        this.lockTimerId = null;
	    },

	    /**
	     * Returns whether the element has focus
	     * @returns {boolean}
	     * @private
	     */
	    _hasFocus: function() {
	        return this.$el.is(':focus');
	    }
	});

	Clipboard.KEYDOWN_LOCK_TIME = KEYDOWN_LOCK_TIME;

	module.exports = Clipboard;


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Key event generator
	 * @author NHN Ent. FE Development Lab
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var GridEvent = __webpack_require__(15);

	var keyCodeMap = {
	    backspace: 8,
	    tab: 9,
	    enter: 13,
	    ctrl: 17,
	    esc: 27,
	    left: 37,
	    up: 38,
	    right: 39,
	    down: 40,
	    a: 65,
	    c: 67,
	    v: 86,
	    space: 32,
	    pageUp: 33,
	    pageDown: 34,
	    home: 36,
	    end: 35,
	    del: 46
	};
	var keyNameMap = _.invert(keyCodeMap);

	/**
	 * K-V object for matching keystroke and event command
	 * K: keystroke (order : ctrl -> shift -> keyName)
	 * V: [key event type, command]
	 * @type {Object}
	 * @ignore
	 */
	var keyStrokeCommandMap = {
	    'up': ['move', 'up'],
	    'down': ['move', 'down'],
	    'left': ['move', 'left'],
	    'right': ['move', 'right'],
	    'pageUp': ['move', 'pageUp'],
	    'pageDown': ['move', 'pageDown'],
	    'home': ['move', 'firstColumn'],
	    'end': ['move', 'lastColumn'],
	    'enter': ['edit', 'currentCell'],
	    'space': ['edit', 'currentCell'],
	    'tab': ['edit', 'nextCell'],
	    'backspace': ['delete'],
	    'del': ['delete'],
	    'shift-tab': ['edit', 'prevCell'],
	    'shift-up': ['select', 'up'],
	    'shift-down': ['select', 'down'],
	    'shift-left': ['select', 'left'],
	    'shift-right': ['select', 'right'],
	    'shift-pageUp': ['select', 'pageUp'],
	    'shift-pageDown': ['select', 'pageDown'],
	    'shift-home': ['select', 'firstColumn'],
	    'shift-end': ['select', 'lastColumn'],
	    'ctrl-a': ['select', 'all'],
	    'ctrl-c': ['clipboard', 'copy'],
	    'ctrl-v': ['clipboard', 'paste'],
	    'ctrl-home': ['move', 'firstCell'],
	    'ctrl-end': ['move', 'lastCell'],
	    'ctrl-shift-home': ['select', 'firstCell'],
	    'ctrl-shift-end': ['select', 'lastCell']
	};

	/**
	 * Returns the keyStroke string
	 * @param {Event} ev - Keyboard event
	 * @returns {String}
	 * @ignore
	 */
	function getKeyStrokeString(ev) {
	    var keys = [];

	    if (ev.ctrlKey || ev.metaKey) {
	        keys.push('ctrl');
	    }
	    if (ev.shiftKey) {
	        keys.push('shift');
	    }
	    keys.push(keyNameMap[ev.keyCode]);

	    return keys.join('-');
	}

	/* Keyboard Event Generator
	 * @module event/keyEvent
	 * @ignore
	 */
	module.exports = {
	    generate: function(ev) {
	        var keyStroke = getKeyStrokeString(ev);
	        var commandInfo = keyStrokeCommandMap[keyStroke];
	        var gridEvent;

	        if (commandInfo) {
	            gridEvent = new GridEvent(ev, {
	                type: 'key:' + commandInfo[0],
	                command: commandInfo[1]
	            });
	        }

	        return gridEvent;
	    }
	};


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Left Side Frame
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);

	var Frame = __webpack_require__(44);
	var classNameConst = __webpack_require__(18);
	var frameConst = __webpack_require__(10).frame;

	/**
	 * Left Side Frame
	 * @module view/layout/frame-lside
	 * @extends module:view/layout/frame
	 * @ignore
	 */
	var LsideFrame = Frame.extend(/** @lends module:view/layout/frame-lside.prototype */{
	    initialize: function() {
	        Frame.prototype.initialize.apply(this, arguments);
	        _.assign(this, {
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


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Frame Base
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);

	var View = __webpack_require__(4);
	var constMap = __webpack_require__(10);
	var frameConst = constMap.frame;
	var summaryPositionConst = constMap.summaryPosition;

	/**
	 * Base class for frame view.
	 * @module view/layout/frame
	 * @extends module:base/view
	 * @param {Object} options Options
	 *      @param {String} [options.whichSide=R] R for Right side, L for Left side
	 * @ignore
	 */
	var Frame = View.extend(/** @lends module:view/layout/frame.prototype */{
	    initialize: function(options) {
	        View.prototype.initialize.call(this);

	        _.assign(this, {
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
	        this.$el.empty();
	        this._destroyChildren();

	        this.beforeRender();

	        this._addChildren(this._createChildren());
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
	    afterRender: function() {},

	    /**
	     * Create children view to append on frame element
	     * @returns {array} View elements
	     * @private
	     */
	    _createChildren: function() {
	        var factory = this.viewFactory;
	        var summaryPosition = this.dimensionModel.get('summaryPosition');
	        var header = factory.createHeader(this.whichSide);
	        var body = factory.createBody(this.whichSide);
	        var summary = factory.createSummary(this.whichSide, summaryPosition);
	        var children;

	        if (summaryPosition === summaryPositionConst.TOP) {
	            children = [header, summary, body];
	        } else if (summaryPosition === summaryPositionConst.BOTTOM) {
	            children = [header, body, summary];
	        } else {
	            children = [header, body];
	        }

	        return children;
	    }
	});

	module.exports = Frame;


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Right Side Frame
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);

	var Frame = __webpack_require__(44);
	var classNameConst = __webpack_require__(18);
	var constMap = __webpack_require__(10);
	var frameConst = constMap.frame;
	var summaryPositionConst = constMap.summaryPosition;

	var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;

	/**
	 * right side frame class
	 * @module view/layout/frame-rside
	 * @extends module:view/layout/frame
	 * @ignore
	 */
	var RsideFrame = Frame.extend(/** @lends module:view/layout/frame-rside.prototype */{
	    initialize: function() {
	        Frame.prototype.initialize.apply(this, arguments);

	        _.assign(this, {
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
	        var scrollX = dimensionModel.get('scrollX');
	        var scrollY = dimensionModel.get('scrollY');
	        var headerHeight = dimensionModel.get('headerHeight');
	        var summaryHeight = dimensionModel.get('summaryHeight');
	        var summaryPosition = dimensionModel.get('summaryPosition');

	        if (dimensionModel.hasFrozenBorder()) {
	            this._setFrozenBorder(headerHeight, scrollX);
	        }

	        if (!scrollY) {
	            return;
	        }

	        this._setScrollbar(headerHeight, summaryHeight, summaryPosition, scrollX);

	        if (summaryHeight) {
	            this._applyStyleToSummary(headerHeight, summaryHeight, summaryPosition, scrollX);
	        }

	        this._resetScrollBorderHeight();
	    },

	    /**
	     * Create scrollbar area and set styles
	     * @param {number} headerHeight - Height of the header area
	     * @param {number} summaryHeight - Height of summary area by setting "summary" option
	     * @param {string} summaryPosition - Position of summary area ('top' or 'bottom')
	     * @param {boolean} scrollX - Whether the grid has x-scroll or not
	     * @private
	     */
	    _setScrollbar: function(headerHeight, summaryHeight, summaryPosition, scrollX) {
	        var $space, $scrollBorder;

	        // Empty DIV for hiding scrollbar in the header area
	        $space = $('<div />').addClass(classNameConst.SCROLLBAR_HEAD);

	        // Empty DIV for showing a left-border of vertical scrollbar in the body area
	        $scrollBorder = $('<div />').addClass(classNameConst.SCROLLBAR_BORDER);

	        if (summaryPosition === summaryPositionConst.TOP) {
	            headerHeight += summaryHeight;
	        }

	        $space.height(headerHeight - 2); // subtract 2px for border-width (top and bottom)
	        $scrollBorder.css('top', headerHeight + 'px');

	        this.$el.append($space, $scrollBorder);

	        // Empty DIV for filling gray color in the right-bottom corner of the scrollbar.
	        // (For resolving the issue that styling scrollbar-corner with '-webkit-scrollbar-corner'
	        //  casues to be stuck in the same position in Chrome)
	        if (scrollX) {
	            this.$el.append($('<div>').addClass(classNameConst.SCROLLBAR_RIGHT_BOTTOM));
	        }

	        this.$scrollBorder = $scrollBorder;
	    },

	    /**
	     * Create frozen border and set styles
	     * @param {number} headerHeight - Height of the header area
	     * @param {boolean} scrollX - Whether the grid has x-scroll or not
	     * @private
	     */
	    _setFrozenBorder: function(headerHeight, scrollX) {
	        var frozenBorderWidth = this.dimensionModel.get('frozenBorderWidth');
	        var resizeHandleView = this.viewFactory.createHeaderResizeHandle(frameConst.L, [headerHeight], true);
	        var $el = this.$el;

	        $el.append(resizeHandleView.render().$el);

	        $el.find('.' + classNameConst.HEAD_AREA).css('border-left-width', frozenBorderWidth);
	        $el.find('.' + classNameConst.BODY_AREA).css('border-left-width', frozenBorderWidth);
	        $el.find('.' + classNameConst.SUMMARY_AREA).css('border-left-width', frozenBorderWidth);

	        // If you don't initialize the table left-border to 0,
	        // the left-border moves when the right side area is scrolled.
	        $el.find('.' + classNameConst.TABLE).css('border-left-width', 0);

	        if (scrollX) {
	            $el.append($('<div>')
	                .addClass(classNameConst.FROZEN_BORDER_BOTTOM)
	                .css('width', frozenBorderWidth)
	            );
	        }
	    },

	    /**
	     * Apply style to summary area on right-side frame
	     * @param {number} headerHeight - Height of header area
	     * @param {number} summaryHeight - Height of summary area by setting "summary" option
	     * @param {string} summaryPosition - Position of summary area ('top' or 'bottom')
	     * @param {boolean} scrollX - Whether the grid has x-scroll or not
	     * @private
	     */
	    _applyStyleToSummary: function(headerHeight, summaryHeight, summaryPosition, scrollX) {
	        var styles = {};
	        var subClassName;

	        if (summaryPosition === summaryPositionConst.TOP) {
	            styles.top = headerHeight;
	            subClassName = classNameConst.SUMMARY_AREA_RIGHT_TOP;
	        } else {
	            styles.bottom = scrollX ? this.dimensionModel.getScrollXHeight() : 0;
	            subClassName = classNameConst.SUMMARY_AREA_RIGHT_BOTTOM;
	        }

	        styles.height = summaryHeight;

	        this.$el.append($('<div>')
	            .addClass(classNameConst.SUMMARY_AREA_RIGHT)
	            .addClass(subClassName)
	            .css(styles)
	        );
	    }
	});

	module.exports = RsideFrame;


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Header View
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);

	var View = __webpack_require__(4);
	var util = __webpack_require__(16);
	var constMap = __webpack_require__(10);
	var classNameConst = __webpack_require__(18);
	var GridEvent = __webpack_require__(15);
	var DragEventEmitter = __webpack_require__(38);
	var frameConst = constMap.frame;

	var DELAY_SYNC_CHECK = 10;
	var keyCodeMap = constMap.keyCode;
	var ATTR_COLUMN_NAME = constMap.attrName.COLUMN_NAME;
	var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;
	var TABLE_BORDER_WIDTH = constMap.dimension.TABLE_BORDER_WIDTH;

	// Minimum time (ms) to detect if an alert or confirm dialog has been displayed.
	var MIN_INTERVAL_FOR_PAUSED = 200;

	var Header;

	/**
	 * Get count of same columns in complex columns
	 * @param {array} currentColumn - Current column's model
	 * @param {array} prevColumn - Previous column's model
	 * @returns {number} Count of same columns
	 * @ignore
	 */
	function getSameColumnCount(currentColumn, prevColumn) {
	    var index = 0;
	    var len = Math.min(currentColumn.length, prevColumn.length);

	    for (; index < len; index += 1) {
	        if (currentColumn[index].name !== prevColumn[index].name) {
	            break;
	        }
	    }

	    return index;
	}

	/**
	 * Header Layout View
	 * @module view/layout/header
	 * @extends module:base/view
	 * @param {Object} options - options
	 * @param {String} [options.whichSide=R]  R: Right, L: Left
	 * @ignore
	 */
	Header = View.extend(/** @lends module:view/layout/header.prototype */{
	    initialize: function(options) {
	        View.prototype.initialize.call(this);

	        _.assign(this, {
	            renderModel: options.renderModel,
	            coordColumnModel: options.coordColumnModel,
	            selectionModel: options.selectionModel,
	            focusModel: options.focusModel,
	            columnModel: options.columnModel,
	            dataModel: options.dataModel,
	            coordRowModel: options.coordRowModel,

	            viewFactory: options.viewFactory,
	            domEventBus: options.domEventBus,

	            headerHeight: options.headerHeight,
	            whichSide: options.whichSide || frameConst.R
	        });

	        this.dragEmitter = new DragEventEmitter({
	            type: 'header',
	            domEventBus: this.domEventBus,
	            onDragMove: _.bind(this._onDragMove, this)
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
	        var columnWidths = columnData.widths;
	        var columns = columnData.columns;
	        var htmlList = [];

	        _.each(columnWidths, function(width, index) {
	            htmlList.push(this.templateCol({
	                attrColumnName: ATTR_COLUMN_NAME,
	                columnName: columns[index].name,
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
	        var columnRange = this.selectionModel.get('range').column;
	        var visibleColumns = this.columnModel.getVisibleColumns();
	        var selectedColumns = visibleColumns.slice(columnRange[0], columnRange[1] + 1);

	        return _.pluck(selectedColumns, 'name');
	    },

	    _onDragMove: function(gridEvent) {
	        var $target = $(gridEvent.target);

	        gridEvent.setData({
	            columnName: $target.closest('th').attr(ATTR_COLUMN_NAME),
	            isOnHeaderArea: $.contains(this.el, $target[0])
	        });
	    },

	    /**
	     * Returns an array of names of merged-column which contains every column name in the given array.
	     * @param {Array.<String>} columnNames - an array of column names to test
	     * @returns {Array.<String>}
	     * @private
	     */
	    _getContainingMergedColumnNames: function(columnNames) {
	        var columnModel = this.columnModel;
	        var mergedColumnNames = _.pluck(columnModel.get('complexHeaderColumns'), 'name');

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
	        var $ths = this.$el.find('th');
	        var columnNames, mergedColumnNames;

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
	     * @param {jQuery.Event} ev - MouseDown event
	     * @private
	     */
	    _onMouseDown: function(ev) {
	        var $target = $(ev.target);
	        var columnName;

	        if (!this._triggerPublicMousedown(ev)) {
	            return;
	        }

	        if ($target.hasClass(classNameConst.BTN_SORT)) {
	            return;
	        }

	        columnName = $target.closest('th').attr(ATTR_COLUMN_NAME);
	        if (columnName) {
	            this.dragEmitter.start(ev, {
	                columnName: columnName
	            });
	        }
	    },

	    /**
	     * Trigger mousedown:body event on domEventBus and returns the result
	     * @param {MouseEvent} ev - MouseEvent
	     * @returns {module:event/gridEvent}
	     * @private
	     */
	    _triggerPublicMousedown: function(ev) {
	        var startTime, endTime;
	        var gridEvent = new GridEvent(ev, GridEvent.getTargetInfo($(ev.target)));
	        var paused;

	        startTime = (new Date()).getTime();
	        this.domEventBus.trigger('mousedown', gridEvent);
	        endTime = (new Date()).getTime();

	        // check if the model window (alert or confirm) was popped up
	        paused = (endTime - startTime) > MIN_INTERVAL_FOR_PAUSED;

	        return !gridEvent.isStopped() && !paused;
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
	        var columnWidths = this.coordColumnModel.getWidths(this.whichSide);
	        var $colList = this.$el.find('col');
	        var coordRowModel = this.coordRowModel;

	        _.each(columnWidths, function(columnWidth, index) {
	            $colList.eq(index).css('width', columnWidth + CELL_BORDER_WIDTH);
	        });

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
	     * Event handler for click event
	     * @param {jQuery.Event} ev - MouseEvent
	     * @private
	     */
	    _onClick: function(ev) {
	        var $target = $(ev.target);
	        var columnName = $target.closest('th').attr(ATTR_COLUMN_NAME);
	        var eventData = new GridEvent(ev);

	        if (columnName === '_button' && $target.is('input')) {
	            eventData.setData({
	                checked: $target.prop('checked')
	            });
	            this.domEventBus.trigger('click:headerCheck', eventData);
	        } else if ($target.is('a.' + classNameConst.BTN_SORT)) {
	            eventData.setData({
	                columnName: columnName
	            });
	            this.domEventBus.trigger('click:headerSort', eventData);
	        }
	    },

	    /**
	     * 정렬 버튼의 상태를 변경한다.
	     * @private
	     * @param {object} sortOptions 정렬 옵션
	     * @param {string} sortOptions.columnName 정렬할 컬럼명
	     * @param {boolean} sortOptions.ascending 오름차순 여부
	     */
	    _updateBtnSortState: function(sortOptions) {
	        var className;

	        if (this._$currentSortBtn) {
	            this._$currentSortBtn.removeClass(classNameConst.BTN_SORT_DOWN + ' ' + classNameConst.BTN_SORT_UP);
	        }
	        this._$currentSortBtn = this.$el.find(
	            'th[' + ATTR_COLUMN_NAME + '="' + sortOptions.columnName + '"] a.' + classNameConst.BTN_SORT
	        );

	        className = sortOptions.ascending ? classNameConst.BTN_SORT_UP : classNameConst.BTN_SORT_DOWN;

	        this._$currentSortBtn.addClass(className);
	    },

	    /**
	     * 랜더링
	     * @returns {View.Layout.Header} this
	     */
	    render: function() {
	        var resizeHandleHeights;

	        this._destroyChildren();

	        this.$el.css({
	            height: this.headerHeight - TABLE_BORDER_WIDTH
	        }).html(this.template({
	            colGroup: this._getColGroupMarkup(),
	            tBody: this._getTableBodyMarkup()
	        }));

	        if (this.coordColumnModel.get('resizable')) {
	            resizeHandleHeights = this._getResizeHandleHeights();
	            this._addChildren(this.viewFactory.createHeaderResizeHandle(this.whichSide, resizeHandleHeights));
	            this.$el.append(this._renderChildren());
	        }

	        return this;
	    },

	    /**
	     * 컬럼 정보를 반환한다.
	     * @returns {{widths: (Array|*), columns: (Array|*)}}   columnWidths 와 columns 를 함께 반환한다.
	     * @private
	     */
	    _getColumnData: function() {
	        var columnWidths = this.coordColumnModel.getWidths(this.whichSide);
	        var columns = this.columnModel.getVisibleColumns(this.whichSide, true);

	        return {
	            widths: columnWidths,
	            columns: columns
	        };
	    },

	    /* eslint-disable complexity */
	    /**
	     * Header 의 body markup 을 생성한다.
	     * @returns {string} header 의 테이블 body 영역에 들어갈 html 마크업 스트링
	     * @private
	     */
	    _getTableBodyMarkup: function() {
	        var hierarchyList = this._getColumnHierarchyList();
	        var maxRowCount = this._getHierarchyMaxRowCount(hierarchyList);
	        var headerHeight = this.headerHeight;
	        var rowMarkupList = new Array(maxRowCount);
	        var columnNames = new Array(maxRowCount);
	        var colSpanList = [];
	        var rowHeight = util.getRowHeight(maxRowCount, headerHeight) - 1;
	        var rowSpan = 1;
	        var height;
	        var headerMarkupList;

	        _.each(hierarchyList, function(hierarchy, i) {
	            var length = hierarchyList[i].length;
	            var curHeight = 0;

	            _.each(hierarchy, function(columnModel, j) {
	                var columnName = columnModel.name;
	                var classNames = [
	                    classNameConst.CELL,
	                    classNameConst.CELL_HEAD
	                ];

	                if (columnModel.validation && columnModel.validation.required) {
	                    classNames.push(classNameConst.CELL_REQRUIRED);
	                }

	                rowSpan = (length - 1 === j && (maxRowCount - length + 1) > 1) ? (maxRowCount - length + 1) : 1;
	                height = rowHeight * rowSpan;

	                if (j === length - 1) {
	                    height = (headerHeight - curHeight) - 2;
	                } else {
	                    curHeight += height + 1;
	                }
	                if (columnNames[j] === columnName) {
	                    rowMarkupList[j].pop();
	                    colSpanList[j] += 1;
	                } else {
	                    colSpanList[j] = 1;
	                }
	                columnNames[j] = columnName;
	                rowMarkupList[j] = rowMarkupList[j] || [];
	                rowMarkupList[j].push(this.templateHeader({
	                    attrColumnName: ATTR_COLUMN_NAME,
	                    columnName: columnName,
	                    className: classNames.join(' '),
	                    height: height,
	                    colspan: colSpanList[j],
	                    rowspan: rowSpan,
	                    title: columnModel.title,
	                    btnSort: columnModel.sortable ? this.markupBtnSort : ''
	                }));
	            }, this);
	        }, this);
	        headerMarkupList = _.map(rowMarkupList, function(rowMarkup) {
	            return '<tr>' + rowMarkup.join('') + '</tr>';
	        });

	        return headerMarkupList.join('');
	    },
	    /* eslint-enable complexity */

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
	        var columns = this._getColumnData().columns;
	        var hierarchyList;

	        hierarchyList = _.map(columns, function(column) {
	            return this._getColumnHierarchy(column).reverse();
	        }, this);

	        return hierarchyList;
	    },

	    /**
	     * complexHeaderColumns 가 설정되어 있을 때 재귀적으로 돌면서 계층구조를 형성한다.
	     * @param {Object} column - column
	     * @param {Array} [results] - 결과로 메모이제이션을 이용하기 위한 인자값
	     * @returns {Array}
	     * @private
	     */
	    _getColumnHierarchy: function(column, results) {
	        var complexHeaderColumns = this.columnModel.get('complexHeaderColumns');

	        results = results || [];
	        if (column) {
	            results.push(column);
	            if (complexHeaderColumns) {
	                _.each(complexHeaderColumns, function(headerColumn) {
	                    if ($.inArray(column.name, headerColumn.childNames) !== -1) {
	                        this._getColumnHierarchy(headerColumn, results);
	                    }
	                }, this);
	            }
	        }

	        return results;
	    },

	    /**
	     * Get height values of resize handlers
	     * @returns {array} Height values of resize handles
	     */
	    _getResizeHandleHeights: function() {
	        var hierarchyList = this._getColumnHierarchyList();
	        var maxRowCount = this._getHierarchyMaxRowCount(hierarchyList);
	        var rowHeight = util.getRowHeight(maxRowCount, this.headerHeight) - 1;
	        var handleHeights = [];
	        var index = 1;
	        var coulmnLen = hierarchyList.length;
	        var sameColumnCount, handleHeight;

	        for (; index < coulmnLen; index += 1) {
	            sameColumnCount = getSameColumnCount(hierarchyList[index], hierarchyList[index - 1]);
	            handleHeight = rowHeight * (maxRowCount - sameColumnCount);

	            handleHeights.push(handleHeight);
	        }

	        handleHeights.push(rowHeight * maxRowCount); // last resize handle

	        return handleHeights;
	    }
	});

	Header.DELAY_SYNC_CHECK = DELAY_SYNC_CHECK;

	module.exports = Header;


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview ResizeHandle for the Header
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var View = __webpack_require__(4);
	var constMap = __webpack_require__(10);
	var classNameConst = __webpack_require__(18);
	var DragEventEmitter = __webpack_require__(38);
	var i18n = __webpack_require__(40);
	var attrNameConst = constMap.attrName;
	var frameConst = constMap.frame;

	var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;
	var RESIZE_HANDLE_WIDTH = constMap.dimension.RESIZE_HANDLE_WIDTH;

	var EXTRA_WIDTH = 3;
	var DEFAULT_WIDTH = 7;

	/**
	 * Resize Handler class
	 * @module view/layout/resizeHandle
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	var ResizeHandle = View.extend(/** @lends module:view/layout/resizeHandle.prototype */ {
	    initialize: function(options) {
	        _.assign(this, {
	            columnModel: options.columnModel,
	            coordColumnModel: options.coordColumnModel,
	            dimensionModel: options.dimensionModel,
	            domEventBus: options.domEventBus,
	            handleHeights: options.handleHeights,
	            whichSide: options.whichSide || frameConst.R,
	            frozenBorder: options.frozenBorder || false
	        });

	        this.dragEmitter = new DragEventEmitter({
	            type: 'resizeColumn',
	            cursor: 'col-resize',
	            domEventBus: this.domEventBus,
	            onDragMove: _.bind(this._onDragMove, this)
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
	        'title="<%=title%>"' +
	        'style="width:<%=width%>;height:<%=height%>;display:<%=displayType%>">' +
	        '</div>'
	    ),

	    /**
	     * Return an object that contains an array of column width and an array of column model.
	     * @returns {{widths: (Array|*), columns: (Array|*)}} Column Data
	     * @private
	     */
	    _getColumnData: function() {
	        var columnWidths = this.coordColumnModel.getWidths(this.whichSide);
	        var columns = this.columnModel.getVisibleColumns(this.whichSide, true);

	        return {
	            widths: columnWidths,
	            columns: columns
	        };
	    },

	    /**
	     * Returns the HTML string of all handler.
	     * @returns {String}
	     * @private
	     */
	    _getResizeHandlerMarkup: function() {
	        var frozenBorder = this.frozenBorder;
	        var columns = this._getColumnData().columns;
	        var length = columns.length;
	        var width = frozenBorder ? this.dimensionModel.get('frozenBorderWidth') + EXTRA_WIDTH : DEFAULT_WIDTH;
	        var resizeHandleMarkupList = _.map(frozenBorder ? [_.last(columns)] : columns, function(column, index) {
	            var columnName = column.name;

	            return this.template({
	                lastClass: (index + 1 === length) ? classNameConst.COLUMN_RESIZE_HANDLE_LAST : '',
	                columnIndex: frozenBorder ? length - 1 : index,
	                columnName: columnName,
	                width: width + 'px',
	                height: this.handleHeights[index] + 'px',
	                title: i18n.get('resizeHandleGuide'),
	                displayType: (column.resizable === false) ? 'none' : 'block'
	            });
	        }, this);

	        return resizeHandleMarkupList.join('');
	    },

	    /**
	     * Render
	     * @returns {module:view/layout/resizeHandle} This object
	     */
	    render: function() {
	        var headerHeight = this.dimensionModel.get('headerHeight');
	        var htmlStr = this._getResizeHandlerMarkup();
	        var styles = {
	            display: 'block'
	        };

	        if (this.frozenBorder) {
	            this.$el.addClass(classNameConst.FROZEN_BORDER_TOP);
	        } else {
	            _.extend(styles, {
	                marginTop: -headerHeight,
	                height: headerHeight
	            });
	        }

	        this.$el.empty().html(htmlStr).css(styles);
	        this._refreshHandlerPosition();

	        return this;
	    },

	    /**
	     * Refresh the position of every handler.
	     * @private
	     */
	    _refreshHandlerPosition: function() {
	        var columnData = this._getColumnData();
	        var columnWidths = columnData.widths;
	        var $resizeHandleList = this.$el.find('.' + classNameConst.COLUMN_RESIZE_HANDLE);
	        var handlerWidthHalf = Math.floor(RESIZE_HANDLE_WIDTH / 2);
	        var curPos = 0;
	        var left = 0;

	        snippet.forEachArray($resizeHandleList, function(item, index) {
	            var $handler = $resizeHandleList.eq(index);

	            if (!this.frozenBorder) {
	                curPos += columnWidths[index] + CELL_BORDER_WIDTH;
	                left = curPos - handlerWidthHalf;
	            }

	            $handler.css('left', left);
	        }, this);
	    },

	    /**
	     * Event handler for the 'mousedown' event
	     * @param {MouseEvent} ev - mouse event
	     * @private
	     */
	    _onMouseDown: function(ev) {
	        var $target = $(ev.target);
	        var columnWidths = this.coordColumnModel.getWidths(this.whichSide);
	        var columnIndex = parseInt($target.attr(attrNameConst.COLUMN_INDEX), 10);

	        this.dragEmitter.start(ev, {
	            width: columnWidths[columnIndex],
	            columnIndex: this._getHandlerColumnIndex(columnIndex),
	            pageX: ev.pageX
	        });
	    },

	    /**
	     * Event handler for dragmove event
	     * @param {module:event/gridEvent} ev - GridEvent
	     * @private
	     */
	    _onDragMove: function(ev) {
	        var startData = ev.startData;
	        var diff = ev.pageX - startData.pageX;

	        ev.setData({
	            columnIndex: startData.columnIndex,
	            width: startData.width + diff
	        });
	    },

	    /**
	     * Event handler for the 'dblclick' event
	     * @param {MouseEvent} mouseEvent - mouse event
	     * @private
	     */
	    _onDblClick: function(mouseEvent) {
	        var $target = $(mouseEvent.target);
	        var columnIndex = parseInt($target.attr(attrNameConst.COLUMN_INDEX), 10);

	        this.domEventBus.trigger('dblclick:resizeColumn', {
	            columnIndex: this._getHandlerColumnIndex(columnIndex)
	        });
	    },

	    /**
	     * Find the real index (based on visibility) of the column using index value of the handler and returns it.
	     * @param {number} index - index value of the handler
	     * @returns {number}
	     * @private
	     */
	    _getHandlerColumnIndex: function(index) {
	        return (this.whichSide === frameConst.R) ? (index + this.columnModel.getVisibleFrozenCount(true)) : index;
	    }
	});

	module.exports = ResizeHandle;


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Class for the body layout
	 * @author NHN Ent. FE Development Lab
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);

	var View = __webpack_require__(4);
	var DragEventEmitter = __webpack_require__(38);
	var GridEvent = __webpack_require__(15);
	var util = __webpack_require__(16);
	var constMap = __webpack_require__(10);
	var classNameConst = __webpack_require__(18);
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
	var Body = View.extend(/** @lends module:view/layout/body.prototype */{
	    initialize: function(options) {
	        View.prototype.initialize.call(this);

	        _.assign(this, {
	            dimensionModel: options.dimensionModel,
	            renderModel: options.renderModel,
	            viewFactory: options.viewFactory,
	            domEventBus: options.domEventBus,

	            // DIV for setting rendering position of entire child-nodes of $el.
	            $container: null,
	            whichSide: (options && options.whichSide) || frameConst.R
	        });

	        this.listenTo(this.dimensionModel, 'change:bodyHeight', this._onBodyHeightChange)
	            .listenTo(this.dimensionModel, 'change:totalRowHeight', this._resetContainerHeight)
	            .listenTo(this.renderModel, 'change:scrollTop', this._onScrollTopChange)
	            .listenTo(this.renderModel, 'change:scrollLeft', this._onScrollLeftChange);

	        this.dragEmitter = new DragEventEmitter({
	            type: 'body',
	            domEventBus: this.domEventBus,
	            onDragMove: _.bind(this._onDragMove, this)
	        });
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
	     * Mousedown event handler
	     * @param {MouseEvent} ev - MouseEvent
	     * @private
	     */
	    _onMouseDown: function(ev) {
	        var $target = $(ev.target);
	        var isTargetInput = $target.is('input, teaxarea');

	        if (!this._triggerPublicMousedown(ev)) {
	            return;
	        }

	        this._triggerBodyMousedown(ev);

	        if (isTargetInput && ev.shiftKey) {
	            ev.preventDefault();
	        }

	        if (util.isRightClickEvent(ev)) {
	            return;
	        }

	        if (!isTargetInput || ev.shiftKey) {
	            this.dragEmitter.start(ev, {
	                pageX: ev.pageX,
	                pageY: ev.pageY
	            });
	        }
	    },

	    /**
	     * Trigger mousedown event on domEventBus and returns the result
	     * @param {MouseEvent} ev - MouseEvent
	     * @returns {module:event/gridEvent}
	     * @private
	     */
	    _triggerPublicMousedown: function(ev) {
	        var startTime, endTime;
	        var gridEvent = new GridEvent(ev, GridEvent.getTargetInfo($(ev.target)));
	        var result = true;

	        if (gridEvent.targetType === GridEvent.targetTypeConst.DUMMY) {
	            result = false;
	        } else {
	            startTime = (new Date()).getTime();
	            this.domEventBus.trigger('mousedown', gridEvent);

	            if (gridEvent.isStopped()) {
	                result = false;
	            } else {
	                // check if the model window (alert or confirm) was popped up
	                endTime = (new Date()).getTime();
	                result = (endTime - startTime) <= MIN_INTERVAL_FOR_PAUSED;
	            }
	        }

	        return result;
	    },

	    /**
	     * Trigger mousedown:body event on domEventBus
	     * @param {MouseEvent} ev - MouseEvent
	     * @private
	     */
	    _triggerBodyMousedown: function(ev) {
	        var gridEvent = new GridEvent(ev, {
	            pageX: ev.pageX,
	            pageY: ev.pageY,
	            shiftKey: ev.shiftKey
	        });

	        this.domEventBus.trigger('mousedown:body', gridEvent);
	    },

	    /**
	     * Event handler for dragmove
	     * @param {event:module/gridEvent} gridEvent - GridEvent
	     */
	    _onDragMove: function(gridEvent) {
	        var startData = gridEvent.startData;
	        var currentData = {
	            pageX: gridEvent.pageX,
	            pageY: gridEvent.pageY
	        };

	        if (this._getMouseMoveDistance(startData, currentData) < MIN_DISATNCE_FOR_DRAG) {
	            gridEvent.stop();
	        }
	    },

	    /**
	     * Returns the distance between start position and current position.
	     * @param {{pageX:number, pageY:number}} start - start position
	     * @param {{pageX:number, pageY:number}} current - current position
	     * @returns {number}
	     * @private
	     */
	    _getMouseMoveDistance: function(start, current) {
	        var dx = Math.abs(start.pageX - current.pageX);
	        var dy = Math.abs(start.pageY - current.pageY);

	        return Math.round(Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)));
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


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Class for the table layout in the body(data) area
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);

	var View = __webpack_require__(4);
	var constMap = __webpack_require__(10);
	var classNameConst = __webpack_require__(18);

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
	var BodyTable = View.extend(/** @lends module:view/layout/bodyTable.prototype */{
	    initialize: function(options) {
	        View.prototype.initialize.call(this);

	        _.assign(this, {
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
	        var columnWidths = this.coordColumnModel.getWidths(this.whichSide);
	        var $colList = this.$el.find('col');

	        _.each(columnWidths, function(width, index) {
	            $colList.eq(index).css('width', width + CELL_BORDER_WIDTH);
	        }, this);
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
	        var columnWidths = this.coordColumnModel.getWidths(whichSide);
	        var columns = this.columnModel.getVisibleColumns(whichSide, true);
	        var html = '';

	        _.each(columns, function(column, index) {
	            html += this.templateCol({
	                attrColumnName: ATTR_COLUMN_NAME,
	                columnName: column.name,
	                width: columnWidths[index] + CELL_BORDER_WIDTH
	            });
	        }, this);

	        return html;
	    }
	});

	module.exports = BodyTable;


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Summary
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var View = __webpack_require__(4);
	var classNameConst = __webpack_require__(18);
	var constMap = __webpack_require__(10);
	var frameConst = constMap.frame;

	var ATTR_COLUMN_NAME = constMap.attrName.COLUMN_NAME;
	var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;

	/**
	 * Summary area
	 * @module view/layout/summary
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	var Summary = View.extend(/** @lends module:view/layout/summary.prototype */{
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
	        this.listenTo(this.columnModel, 'setSummaryContent', this._setColumnContent);
	        if (this.summaryModel) {
	            this.listenTo(this.summaryModel, 'change', this._onChangeSummaryValue);
	        }
	    },

	    className: classNameConst.SUMMARY_AREA,

	    events: {
	        scroll: '_onScrollView'
	    },

	    /**
	     * template
	     */
	    template: _.template(
	        '<table class="<%=className%>" style="height:<%=height%>px">' +
	            '<colgroup><%=colgroup%></colgroup>' +
	            '<tbody><%=tbody%></tbody>' +
	        '</table>'
	    ),

	    /**
	     * Template for <th>
	     */
	    templateHeader: _.template(
	        '<th <%=attrColumnName%>="<%=columnName%>" ' +
	            'class="<%=className%>" ' +
	        '>' +
	        '<%=value%>' +
	        '</th>'
	    ),

	    /**
	     * Template for <col>
	     */
	    templateColgroup: _.template(
	        '<col ' +
	            '<%=attrColumnName%>="<%=columnName%>" ' +
	            'style="width:<%=width%>px">'
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

	    /**
	     * Change column width
	     * @private
	     */
	    _onChangeColumnWidth: function() {
	        var columnWidths = this.coordColumnModel.getWidths(this.whichSide);
	        var $ths = this.$el.find('col');

	        _.each(columnWidths, function(columnWidth, index) {
	            $ths.eq(index).css('width', columnWidth + CELL_BORDER_WIDTH);
	        });
	    },

	    /**
	     * Sets the HTML string of <th> of given column
	     * @param {string} columnName - column name
	     * @param {string} contents - HTML string
	     * @private
	     */
	    _setColumnContent: function(columnName, contents) {
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

	        this._setColumnContent(columnName, contents);
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
	     * Generates a HTML string of <colgroup> and returns it
	     * @returns {string} - HTML String
	     * @private
	     */
	    _generateColgroupHTML: function() {
	        var columns = this.columnModel.getVisibleColumns(this.whichSide, true);
	        var columnWidths = this.coordColumnModel.getWidths(this.whichSide);
	        var htmlList = [];

	        _.each(columnWidths, function(width, index) {
	            htmlList.push(this.templateColgroup({
	                attrColumnName: ATTR_COLUMN_NAME,
	                columnName: columns[index].name,
	                width: width + CELL_BORDER_WIDTH
	            }));
	        }, this);

	        return htmlList.join('');
	    },

	    /**
	     * Generates a HTML string of <tbody> and returns it
	     * @returns {string} - HTML String
	     * @private
	     */
	    _generateTbodyHTML: function() {
	        var summaryModel = this.summaryModel;
	        var columns = this.columnModel.getVisibleColumns(this.whichSide, true);

	        return _.reduce(columns, function(memo, column) {
	            var columnName = column.name;
	            var valueMap;

	            if (summaryModel) {
	                valueMap = summaryModel.getValue(column.name);
	            }

	            return memo + this.templateHeader({
	                attrColumnName: ATTR_COLUMN_NAME,
	                columnName: columnName,
	                className: classNameConst.CELL_HEAD + ' ' + classNameConst.CELL,
	                value: this._generateValueHTML(columnName, valueMap)
	            });
	        }, '', this);
	    },

	    /**
	     * Render
	     * @returns {object}
	     */
	    render: function() {
	        var summaryHeight = this.dimensionModel.get('summaryHeight');
	        var summaryPosition = this.dimensionModel.get('summaryPosition');
	        var className = summaryPosition === 'top' ? classNameConst.SUMMARY_AREA_TOP : classNameConst.SUMMARY_AREA_BOTTOM;

	        this.$el.addClass(className);

	        if (summaryHeight) {
	            this.$el.html(this.template({
	                className: classNameConst.TABLE,
	                height: summaryHeight,
	                tbody: this._generateTbodyHTML(),
	                colgroup: this._generateColgroupHTML()
	            }));
	        }

	        return this;
	    }
	});

	module.exports = Summary;


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview RowList View
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var View = __webpack_require__(4);
	var constMap = __webpack_require__(10);
	var classNameConst = __webpack_require__(18);

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
	var RowList = View.extend(/** @lends module:view/rowList.prototype */{
	    initialize: function(options) {
	        var focusModel = options.focusModel;
	        var renderModel = options.renderModel;
	        var selectionModel = options.selectionModel;
	        var coordRowModel = options.coordRowModel;
	        var whichSide = options.whichSide || 'R';

	        _.assign(this, {
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
	    _getColumns: function() {
	        return this.columnModel.getVisibleColumns(this.whichSide, true);
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
	        var beforeRows = this.collection.slice(0, _.indexOf(rowKeys, dupRowKeys[0]));
	        var afterRows = this.collection.slice(_.indexOf(rowKeys, _.last(dupRowKeys)) + 1);

	        this.$el.prepend(this._getRowsHtml(beforeRows));
	        this.$el.append(this._getRowsHtml(afterRows));
	    },

	    /**
	     * Redraw all rows.
	     * @private
	     */
	    _resetRows: function() {
	        var html = this._getRowsHtml(this.collection.models);
	        var $tbody;

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
	        var rowPainter = this.painterManager.getRowPainter();
	        var columnNames = _.pluck(this._getColumns(), 'name');

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
	        var renderModel = this.renderModel;
	        var renderStartIndex = renderModel.get('startIndex');
	        var startIndex, endIndex;

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
	        var rowIndex = this.dataModel.indexOfRowKey(rowKey);
	        var renderStartIndex = this.renderModel.get('startIndex');

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
	        var columnNames = _.pluck(this._getColumns(), 'name');
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
	    isInnerHtmlOfTbodyReadOnly: (snippet.browser.msie &&
	        snippet.browser.version <= 9) // eslint-disable-line no-magic-numbers
	});

	module.exports = RowList;


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Class for the selection layer
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);

	var View = __webpack_require__(4);
	var classNameConst = __webpack_require__(18);
	var CELL_BORDER_WIDTH = __webpack_require__(10).dimension.CELL_BORDER_WIDTH;
	var frameConst = __webpack_require__(10).frame;

	/**
	 * Class for the selection layer
	 * @module view/selectionLayer
	 * @extends module:base/view
	 * @param {object} options Options
	 * @ignore
	 */
	var SelectionLayer = View.extend(/** @lends module:view/selectionLayer.prototype */{
	    initialize: function(options) {
	        _.assign(this, {
	            whichSide: options.whichSide || frameConst.R,
	            dimensionModel: options.dimensionModel,
	            coordRowModel: options.coordRowModel,
	            coordColumnModel: options.coordColumnModel,
	            columnModel: options.columnModel,
	            selectionModel: options.selectionModel
	        });
	        this._updateColumnWidths();

	        this.listenTo(this.coordColumnModel, 'columnWidthChanged', this._onChangeColumnWidth);
	        this.listenTo(this.selectionModel, 'change:range', this.render);
	    },

	    className: classNameConst.LAYER_SELECTION,

	    /**
	     * Updates this.columnWidths
	     * @private
	     */
	    _updateColumnWidths: function() {
	        this.columnWidths = this.coordColumnModel.getWidths(this.whichSide);
	    },

	    /**
	     * Event handler for 'columnWidthChanged' evnet on Dimension model.
	     * @private
	     */
	    _onChangeColumnWidth: function() {
	        this._updateColumnWidths();
	        this.render();
	    },

	    /**
	     * Returns relative column range based on 'this.whichSide'
	     * @private
	     * @param {array} columnRange - Column range indexes. [start, end]
	     * @returns {array} - Relative column range indexes. [start, end]
	     */
	    _getOwnSideColumnRange: function(columnRange) {
	        var frozenCount = this.columnModel.getVisibleFrozenCount();
	        var ownColumnRange = null;

	        if (this.whichSide === frameConst.L) {
	            if (columnRange[0] < frozenCount) {
	                ownColumnRange = [
	                    columnRange[0],
	                    Math.min(columnRange[1], frozenCount - 1)
	                ];
	            }
	        } else if (columnRange[1] >= frozenCount) {
	            ownColumnRange = [
	                Math.max(columnRange[0], frozenCount) - frozenCount,
	                columnRange[1] - frozenCount
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
	        var columnWidths = this.columnWidths;
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
	        endIndex = Math.min(endIndex, columnWidths.length - 1);

	        for (; i <= endIndex; i += 1) {
	            if (i < startIndex) {
	                left += columnWidths[i] + CELL_BORDER_WIDTH;
	            } else {
	                width += columnWidths[i] + CELL_BORDER_WIDTH;
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


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Layer class that represents the state of rendering phase
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var View = __webpack_require__(4);
	var CELL_BORDER_WIDTH = __webpack_require__(10).dimension.CELL_BORDER_WIDTH;
	var attrNameConst = __webpack_require__(10).attrName;
	var classNameConst = __webpack_require__(18);

	/**
	 * Layer class that represents the state of rendering phase.
	 * @module view/editingLayer
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	var EditingLayer = View.extend(/** @lends module:view/editingLayer.prototype */{
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
	        var editType = snippet.pick(cellData, 'columnModel', 'editOptions', 'type');
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
	        var browser = snippet.browser;
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
	        if (cellData.editing) {
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


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Layer View class which contains the 'tui-date-picker'
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);

	var DatePicker = __webpack_require__(32);

	var View = __webpack_require__(4);
	var classNameConst = __webpack_require__(18);
	var DEFAULT_DATE_FORMAT = 'yyyy-MM-dd';
	var FULL_RANGES = [[new Date(1900, 0, 1), new Date(2999, 11, 31)]];
	var DatePickerLayer;

	/**
	 * Layer View class which contains the 'tui-date-picker'
	 * @module view/datePickerLayer
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	DatePickerLayer = View.extend(/** @lends module:view/datePickerLayer.prototype */{
	    initialize: function(options) {
	        this.focusModel = options.focusModel;
	        this.textPainter = options.textPainter;
	        this.columnModel = options.columnModel;
	        this.domState = options.domState;
	        this.datePickerMap = this._createDatePickers();

	        /**
	         * Current focused input element
	         * @type {jQuery}
	         */
	        this.$focusedInput = null;

	        this.listenTo(this.textPainter, 'focusIn', this._onFocusInTextInput);
	        this.listenTo(options.domEventBus, 'windowResize', this._closeDatePickerLayer);
	    },

	    className: classNameConst.LAYER_DATE_PICKER,

	    events: {
	        click: '_onClick'
	    },

	    /**
	     * Event handler for the 'click' event on the datepicker layer.
	     * @param {MouseEvent} ev - MouseEvent object
	     * @private
	     */
	    _onClick: function(ev) {
	        ev.stopPropagation();
	    },

	    /**
	     * Creates instances map of 'tui-date-picker'
	     * @returns {Object.<string, DatePicker>}
	     * @private
	     */
	    _createDatePickers: function() {
	        var datePickerMap = {};
	        var columnModelMap = this.columnModel.get('columnModelMap');

	        _.each(columnModelMap, function(columnModel) {
	            var name = columnModel.name;
	            var component = columnModel.component;
	            var options;

	            if (component && component.name === 'datePicker') {
	                options = component.options || {};

	                datePickerMap[name] = new DatePicker(this.$el, options);

	                this._bindEventOnDatePicker(datePickerMap[name]);
	            }
	        }, this);

	        return datePickerMap;
	    },

	    /**
	     * Bind custom event on the DatePicker instance
	     * @param {DatePicker} datePicker - instance of DatePicker
	     * @private
	     */
	    _bindEventOnDatePicker: function(datePicker) {
	        var self = this;

	        datePicker.on('open', function() {
	            self.textPainter.blockFocusingOut();
	        });

	        datePicker.on('close', function() {
	            var focusModel = self.focusModel;
	            var address = focusModel.which();
	            var rowKey = address.rowKey;
	            var columnName = address.columnName;
	            var changedValue = self.$focusedInput.val();

	            self.textPainter.unblockFocusingOut();

	            // when the datePicker layer is closed, selected date must set on input element.
	            if (focusModel.isEditingCell(rowKey, columnName)) {
	                focusModel.dataModel.setValue(rowKey, columnName, changedValue);
	            }
	            focusModel.finishEditing();
	        });
	    },

	    /**
	     * Resets date picker options
	     * @param {Object} options - datePicker options
	     * @param {jQuery} $input - target input element
	     * @param {string} columnName - name to find the DatePicker instance created on each column
	     * @private
	     */
	    _resetDatePicker: function(options, $input, columnName) {
	        var datePicker = this.datePickerMap[columnName];
	        var format = options.format || DEFAULT_DATE_FORMAT;
	        var date = options.date || (new Date());
	        var selectableRanges = options.selectableRanges;

	        datePicker.setInput($input, {
	            format: format,
	            syncFromInput: true
	        });

	        if (selectableRanges) {
	            datePicker.setRanges(selectableRanges);
	        } else {
	            datePicker.setRanges(FULL_RANGES);
	        }

	        if ($input.val() === '') {
	            datePicker.setDate(date);
	            $input.val('');
	        }
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
	        var options;

	        if (editType === 'text' && component && component.name === 'datePicker') {
	            options = component.options || {};

	            this.$focusedInput = $input;

	            this.$el.css(this._calculatePosition($input)).show();
	            this._resetDatePicker(options, $input, columnName);
	            this.datePickerMap[columnName].open();
	        }
	    },

	    /**
	     * Close the date picker layer that is already opend
	     * @private
	     */
	    _closeDatePickerLayer: function() {
	        var name = this.focusModel.which().columnName;
	        var datePicker = this.datePickerMap[name];

	        if (datePicker && datePicker.isOpened()) {
	            datePicker.close();
	        }
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


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Class for the layer view that represents the currently focused cell
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);

	var View = __webpack_require__(4);
	var constMap = __webpack_require__(10);
	var classNameConst = __webpack_require__(18);

	var frameConst = constMap.frame;
	var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;
	var HTML_BORDER_DIV = '<div class="' + classNameConst.LAYER_FOCUS_BORDER + '"></div>';
	var BLUR_CLASS_NAME = classNameConst.LAYER_FOCUS_DEACTIVE;

	/**
	 * Class for the layer view that represents the currently focused cell
	 * @module view/focusLayer
	 * @extends module:base/view
	 * @param {Object} options - Options
	 * @ignore
	 */
	var FocusLayer = View.extend(/** @lends module:view/focusLayer.prototype */{
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
	        this.listenTo(this.focusModel, 'change:active', this._onChangeActiveState);
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
	     * Event handler for 'change:active' event on module:model/focus
	     * @param {object} model - Focus model
	     * @private
	     */
	    _onChangeActiveState: function(model) {
	        if (!model.changed.active) {
	            this.$el.addClass(BLUR_CLASS_NAME);
	        } else {
	            this.$el.removeClass(BLUR_CLASS_NAME);
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


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

	
	/**
	 * @fileoverview Creator of domEventBus
	 * @author NHN Ent. FE Development Lab
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var Backbone = __webpack_require__(5);

	module.exports = {
	    create: function() {
	        return _.extend({}, Backbone.Events);
	    }
	};


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview This class offers methods that can be used to get the current state of DOM element.
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var attrNameConst = __webpack_require__(10).attrName;
	var classNameConst = __webpack_require__(18);

	/**
	 * Class for offering methods that can be used to get the current state of DOM element.
	 * @module domState
	 * @param {jQuery} $el - jQuery object of the container element.
	 * @ignore
	 */
	var DomState = snippet.defineClass(/** @lends module:domState.prototype */{
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


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Public Event Emitter
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var Backbone = __webpack_require__(5);
	var snippet = __webpack_require__(3);

	/**
	 * Class that listens public events (for external user) to the other object and
	 * triggers them on the public object(module:grid).
	 * @module publicEventEmitter
	 * @param {Object} publicObject - Object on which event will be triggered.
	 *            This object should have methods of Backbone.Events.
	 * @ignore
	 */
	var PublicEventEmitter = snippet.defineClass(/** @lends module:publicEventEmitter.prototype */{
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
	     * Trigger specified event on the public object.
	     * @param  {String} eventName - Event name
	     * @param  {Object} eventData - Event data
	     * @private
	     */
	    _triggerOnPublic: function(eventName, eventData) {
	        this.publicObject.trigger(eventName, _.extend(eventData, {
	            instance: this.publicObject
	        }));
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
	     * Listen to Dom Event bus
	     * @param  {module:event/domEventBus} domEventBus - Dom Event bus
	     */
	    listenToDomEventBus: function(domEventBus) {
	        this._listenForThrough(domEventBus, [
	            'click',
	            'dblclick',
	            'mousedown',
	            'mouseover',
	            'mouseout'
	        ]);
	    },

	    /**
	     * Listen to Focus model
	     * @param  {module:model/focus} focusModel - Focus model
	     */
	    listenToFocusModel: function(focusModel) {
	        this._listenForThrough(focusModel, ['focusChange']);
	    },

	    /**
	     * Listen to RowList model
	     * @param {module:model/rowList} dataModel - RowList model
	     */
	    listenToDataModel: function(dataModel) {
	        this._listenForThrough(dataModel, [
	            'check',
	            'uncheck',
	            'deleteRange'
	        ]);
	    },

	    listenToSelectionModel: function(selectionModel) {
	        this._listenForThrough(selectionModel, ['selection']);
	    }
	});

	_.extend(PublicEventEmitter.prototype, Backbone.Events);

	module.exports = PublicEventEmitter;


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Painter Manager
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var RowPainter = __webpack_require__(60);
	var CellPainter = __webpack_require__(62);
	var DummyCellPainter = __webpack_require__(63);
	var TextPainter = __webpack_require__(64);
	var SelectPainter = __webpack_require__(66);
	var ButtonPainter = __webpack_require__(67);
	var MainButtonPainter = __webpack_require__(68);

	/**
	 * Painter manager
	 * @module painter/manager
	 * @param {Object} options - Options
	 * @ignore
	 */
	var PainterManager = snippet.defineClass(/** @lends module:painter/manager.prototype */{
	    init: function(options) {
	        this.gridId = options.gridId;
	        this.selectType = options.selectType;
	        this.fixedRowHeight = options.fixedRowHeight;

	        this.inputPainters = this._createInputPainters(options.controller);
	        this.cellPainters = this._createCellPainters(options.controller, options.domEventBus);
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
	     * @param {module:event/domEventBus} domEventBus - domEventBus
	     * @returns {Object} Key-value object
	     * @private
	     */
	    _createCellPainters: function(controller, domEventBus) {
	        var cellPainters = {
	            dummy: new DummyCellPainter({
	                controller: controller
	            }),
	            normal: new CellPainter({
	                domEventBus: domEventBus,
	                controller: controller,
	                fixedRowHeight: this.fixedRowHeight,
	                editType: 'normal'
	            })
	        };

	        _.each(this.inputPainters, function(inputPainter, editType) {
	            cellPainters[editType] = new CellPainter({
	                editType: editType,
	                controller: controller,
	                fixedRowHeight: this.fixedRowHeight,
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


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Painter class for the row(TR) views
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var Painter = __webpack_require__(61);
	var constMap = __webpack_require__(10);
	var classNameConst = __webpack_require__(18);
	var attrNameConst = constMap.attrName;
	var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;

	/**
	 * Painter class for the row(TR) views
	 * @module painter/row
	 * @extends module:base/painter
	 * @param {object} options - Options
	 * @ignore
	 */
	var RowPainter = snippet.defineClass(Painter, /** @lends module:painter/row.prototype */{
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
	        var editType = snippet.pick(cellData.columnModel, 'editOptions', 'type');

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
	        var cellPainter = this.painterManager.getCellPainter('dummy');
	        var html = '';

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
	            var cellData = model.get(columnName);
	            var editType, cellPainter;

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
	        var className = (rowNum % 2) ? classNameConst.ROW_ODD : classNameConst.ROW_EVEN;
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


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Base class for Painters
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

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
	var Painter = snippet.defineClass(/** @lends module:base/painter.prototype */{
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


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Painter class for cell(TD) views
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var Painter = __webpack_require__(61);
	var util = __webpack_require__(16);
	var attrNameConst = __webpack_require__(10).attrName;
	var classNameConst = __webpack_require__(18);

	/**
	 * Painter class for cell(TD) views
	 * @module painter/cell
	 * @extends module:base/painter
	 * @param {Object} options - options
	 * @ignore
	 */
	var Cell = snippet.defineClass(Painter, /** @lends module:painter/cell.prototype */{
	    init: function(options) {
	        Painter.apply(this, arguments);

	        this.editType = options.editType;
	        this.fixedRowHeight = options.fixedRowHeight;
	        this.inputPainter = options.inputPainter;
	        this.selector = 'td[' + attrNameConst.EDIT_TYPE + '="' + this.editType + '"]';
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
	        if (this.fixedRowHeight) {
	            styles.push('max-height:' + cellData.height + 'px');
	        }

	        return styles.join(';');
	    },

	    /**
	     * Returns the HTML string of the contents containg the value of the 'prefix' and 'postfix'.
	     * @param {Object} cellData - cell data
	     * @returns {String}
	     * @private
	     */
	    _getContentHtml: function(cellData) {
	        var customTemplate = cellData.columnModel.template;
	        var content = cellData.formattedValue;
	        var prefix = cellData.prefix;
	        var postfix = cellData.postfix;
	        var fullContent, template;

	        if (this.inputPainter) {
	            content = this.inputPainter.generateHtml(cellData);

	            if (this._shouldContentBeWrapped() && !this._isUsingViewMode(cellData)) {
	                prefix = this._getSpanWrapContent(prefix, classNameConst.CELL_CONTENT_BEFORE);
	                postfix = this._getSpanWrapContent(postfix, classNameConst.CELL_CONTENT_AFTER);
	                content = this._getSpanWrapContent(content, classNameConst.CELL_CONTENT_INPUT);
	                // notice the order of concatenation
	                fullContent = prefix + postfix + content;
	            }
	        }

	        if (!fullContent) {
	            fullContent = prefix + content + postfix;
	        }

	        if (cellData.columnName === '_number' && _.isFunction(customTemplate)) {
	            template = customTemplate({
	                content: fullContent
	            });
	        } else {
	            template = this.contentTemplate({
	                content: fullContent,
	                className: classNameConst.CELL_CONTENT,
	                style: this._getContentStyle(cellData)
	            });
	        }

	        return template;
	    },

	    /**
	     * Returns whether the cell has view mode.
	     * @param {Object} cellData - cell data
	     * @returns {Boolean}
	     * @private
	     */
	    _isUsingViewMode: function(cellData) {
	        return snippet.pick(cellData, 'columnModel', 'editOptions', 'useViewMode') !== false;
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
	        if (snippet.isFalsy(content)) {
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
	            classNameConst.CELL
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
	        var contentProps = ['value', 'editing', 'disabled', 'listItems'];
	        var editingChangedToTrue = _.contains(cellData.changed, 'editing') && cellData.editing;
	        var shouldUpdateContent = _.intersection(contentProps, cellData.changed).length > 0;
	        var attrs = this._getAttributes(cellData);
	        var mainButton = this.editType === 'mainButton';

	        $td.attr(attrs);

	        if (editingChangedToTrue && !this._isUsingViewMode(cellData)) {
	            this.inputPainter.focus($td);
	        } else if (mainButton) {
	            $td.find(this.inputPainter.selector).prop({
	                checked: cellData.value,
	                disabled: cellData.disabled
	            });
	        } else if (shouldUpdateContent) {
	            $td.html(this._getContentHtml(cellData));
	            $td.scrollLeft(0);
	        }
	    }
	});

	module.exports = Cell;


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Dummy cell painter
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var Painter = __webpack_require__(61);
	var util = __webpack_require__(16);
	var attrNameConst = __webpack_require__(10).attrName;
	var classNameConst = __webpack_require__(18);

	/**
	 * Dummy Cell Painter
	 * @module painter/dummyCell
	 * @extends module:base/painter
	 * @ignore
	 */
	var DummyCell = snippet.defineClass(Painter, /** @lends module:painter/dummyCell.prototype */{
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
	            classNameConst.CELL_DUMMY
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


/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Painter class for the 'input[type=text]' and 'input[type=password]'.
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var InputPainter = __webpack_require__(65);
	var util = __webpack_require__(16);
	var classNameConst = __webpack_require__(18);

	var SELECTOR_TEXT = '.' + classNameConst.CELL_CONTENT_TEXT;
	var SELECTOR_PASSWORD = 'input[type=password]';

	/**
	 * Painter class for the 'input[type=text]' and 'input[type=password]'
	 * @module painter/input/text
	 * @extends module:painter/input/base
	 * @param {Object} options - options
	 * @ignore
	 */
	var TextPainter = snippet.defineClass(InputPainter, /** @lends module:painter/input/text.prototype */{
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
	        var maxLength = snippet.pick(cellData, 'columnModel', 'editOptions', 'maxLength');
	        var params = {
	            type: this.inputType,
	            className: classNameConst.CELL_CONTENT_TEXT,
	            value: cellData.value,
	            name: util.getUniqueKey(),
	            disabled: cellData.disabled ? 'disabled' : '',
	            maxLength: maxLength
	        };

	        if (cellData.whiteSpace !== 'nowrap') {
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


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Base class for the Input Painter
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);
	var Backbone = __webpack_require__(5);
	var snippet = __webpack_require__(3);

	var Painter = __webpack_require__(61);
	var keyNameMap = __webpack_require__(10).keyName;

	/**
	 * Input Painter Base
	 * @module painter/input/base
	 * @extends module:base/painter
	 * @param {Object} options - options
	 * @ignore
	 */
	var InputPainter = snippet.defineClass(Painter, /** @lends module:painter/input/base.prototype */{
	    init: function() {
	        Painter.apply(this, arguments);

	        /**
	         * State of finishing to edit
	         * @type {Boolean}
	         */
	        this._finishedEditing = false;
	    },

	    /**
	     * key-value object contains event names as keys and handler names as values
	     * @type {Object}
	     */
	    events: {
	        keydown: '_onKeyDown',
	        focusin: '_onFocusIn',
	        focusout: '_onFocusOut',
	        change: '_onChange'
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
	     * @param {{rowKey: number, columnName: string}} address - target cell address
	     * @private
	     */
	    _executeCustomEventHandler: function(event, address) {
	        this.controller.executeCustomInputEventHandler(event, address);
	    },

	    /**
	     * Event handler for the 'change' event.
	     * This method is just a stub. Override this if necessary.
	     * @private
	     */
	    _onChange: function() {
	        // do nothing
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
	            self._executeCustomEventHandler(event, address);
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

	        if (!this._finishedEditing) {
	            this._executeCustomEventHandler(event, address);
	            this.trigger('focusOut', $target, address);
	            this.controller.finishEditing(address, false, $target.val());
	        }
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

	        this._executeCustomEventHandler(event, param.address);

	        if (action && !event.shiftKey) {
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
	        return snippet.pick(cellData, 'columnModel', 'editOptions', 'useViewMode') !== false;
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
	        } else if (!this._isUsingViewMode(cellData) || cellData.editing) {
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
	    },

	    /**
	     * Block focusing out
	     */
	    blockFocusingOut: function() {
	        this._finishedEditing = true;
	    },

	    /**
	     * Unblock focusing out
	     */
	    unblockFocusingOut: function() {
	        this._finishedEditing = false;
	    }
	});

	_.assign(InputPainter.prototype, Backbone.Events);

	module.exports = InputPainter;


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Painter class for 'select' input.
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var InputPainter = __webpack_require__(65);
	var util = __webpack_require__(16);

	/**
	 * Painter class for 'select' input.
	 * @module painter/input/select
	 * @extends module:painter/input/base
	 * @ignore
	 */
	var SelectPainter = snippet.defineClass(InputPainter, /** @lends module:painter/input/select.prototype */{
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
	     * Event handler for the 'change' event
	     * @param {Event} ev - DOM Event
	     */
	    _onChange: function(ev) {
	        var $target = $(ev.target);
	        var address = this._getCellAddress($target);

	        this.controller.setValueIfNotUsingViewMode(address, $target.val());
	    },

	    /**
	     * Returns the value string of given data to display in the cell.
	     * @param {Object} cellData - cell data
	     * @implements {module:painter/input/base}
	     * @returns {String}
	     * @protected
	     */
	    _getDisplayValue: function(cellData) {
	        var selectedOption = _.find(cellData.listItems, function(item) {
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
	        var optionHtml = _.reduce(cellData.listItems, function(html, item) {
	            return html + this.optionTemplate({
	                value: item.value,
	                text: item.text,
	                selected: (String(cellData.value) === String(item.value)) ? 'selected' : ''
	            });
	        }, '', this);

	        return this.template({
	            name: util.getUniqueKey(),
	            disabled: cellData.disabled ? 'disabled' : '',
	            options: optionHtml
	        });
	    }
	});

	module.exports = SelectPainter;


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Painter class for 'checkbox' and 'radio button'.
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var InputPainter = __webpack_require__(65);
	var util = __webpack_require__(16);

	/**
	 * Painter class for 'checkbox' and 'radio button'.
	 * @module painter/input/button
	 * @extends module:painter/input/base
	 * @param {Object} options - options
	 * @ignore
	 */
	var ButtonPainter = snippet.defineClass(InputPainter, /** @lends module:painter/input/button.prototype */{
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
	     * Event handler for 'change' event
	     * @param {Event} ev - DOM Event
	     */
	    _onChange: function(ev) {
	        var $target = $(ev.target);
	        var address = this._getCellAddress($target);
	        var value = this._getCheckedValueString($target);

	        this.controller.setValueIfNotUsingViewMode(address, value);
	    },

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

	        _.each(cellData.listItems, function(item) {
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

	        _.each(cellData.listItems, function(item) {
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


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Main Button Painter
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var Painter = __webpack_require__(61);
	var classNameConst = __webpack_require__(18);
	var keyCodeMap = __webpack_require__(10).keyCode;

	var className = classNameConst.CELL_MAIN_BUTTON;

	/**
	 * Main Button Painter
	 * (This class does not extend from module:painter/input/base but from module:base/painter directly)
	 * @module painter/input/mainButton
	 * @extends module:base/painter
	 * @param {Object} options - options
	 * @ignore
	 */
	var InputPainter = snippet.defineClass(Painter, /** @lends module:painter/input/mainButton.prototype */{
	    init: function(options) {
	        Painter.apply(this, arguments);

	        this.selector = 'input.' + className;
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
	        '<input class="<%=className%>" ' +
	        'type="<%=type%>" name="<%=name%>" <%=checked%> <%=disabled%> />'
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
	        var customTemplate = cellData.columnModel.template;
	        var convertedHTML = null;
	        var props = {
	            type: this.inputType,
	            name: this.gridId,
	            className: className
	        };

	        if (_.isFunction(customTemplate)) {
	            convertedHTML = customTemplate(_.extend(props, {
	                checked: cellData.value,
	                disabled: cellData.disabled
	            }));
	        } else {
	            convertedHTML = this.template(_.extend(props, {
	                checked: cellData.value ? 'checked' : '',
	                disabled: cellData.disabled ? 'disabled' : ''
	            }));
	        }

	        return convertedHTML;
	    }
	});

	module.exports = InputPainter;


/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Controller class to handle actions from the painters
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	var util = __webpack_require__(16);

	/**
	 * Controller class to handle actions from the painters
	 * @module painter/controller
	 * @param {Object} options - options
	 * @ignore
	 */
	var PainterController = snippet.defineClass(/** @lends module:painter/controller.prototype */{
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
	        var maxLength = snippet.pick(column, 'editOptions', 'maxLength');

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
	        var eventType, editOptions, handler;

	        if (!columnModel) {
	            return;
	        }

	        eventType = event.type;
	        editOptions = columnModel.editOptions || {};
	        handler = editOptions[getEventHandlerName(eventType)];

	        if (_.isFunction(handler)) {
	            handler.call(event.target, event, address);
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
	        if (columnModel.name === '_button') {
	            if (value) {
	                this.dataModel.check(address.rowKey);
	            } else {
	                this.dataModel.uncheck(address.rowKey);
	            }
	        } else {
	            this.dataModel.setValue(address.rowKey, address.columnName, value);
	        }
	    },

	    /**
	     * Sets the value of the given cell, if the given column is not using view-mode.
	     * @param {{rowKey:String, columnName:String}} address - cell address
	     * @param {(Number|String|Boolean)} value - value
	     */
	    setValueIfNotUsingViewMode: function(address, value) {
	        var columnModel = this.columnModel.getColumnModel(address.columnName);

	        if (!snippet.pick(columnModel, 'editOptions', 'useViewMode')) {
	            this.setValue(address, value);
	        }
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

	/**
	 * Returns a property name of a custom event handler matched to the given eventType
	 * @param {string} eventType - event type
	 * @returns {string}
	 */
	function getEventHandlerName(eventType) {
	    switch (eventType) {
	        case 'focusin':
	            return 'onFocus';
	        case 'focusout':
	            return 'onBlur';
	        case 'keydown':
	            return 'onKeyDown';
	        default:
	            return '';
	    }
	}

	module.exports = PainterController;


/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Add-on for binding to remote data
	 * @author NHN Ent. FE Development Lab
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var Backbone = __webpack_require__(5);
	var _ = __webpack_require__(2);

	var View = __webpack_require__(4);
	var Router = __webpack_require__(71);
	var util = __webpack_require__(16);
	var formUtil = __webpack_require__(72);
	var i18n = __webpack_require__(40);
	var GridEvent = __webpack_require__(15);

	var renderStateMap = __webpack_require__(10).renderState;
	var DELAY_FOR_LOADING_STATE = 200;

	var requestMessageMap = {
	    createData: 'net.confirmCreate',
	    updateData: 'net.confirmUpdate',
	    deleteData: 'net.confirmDelete',
	    modifyData: 'net.confirmModify'
	};
	var errorMessageMap = {
	    createData: 'net.noDataToCreate',
	    updateData: 'net.noDataToUpdate',
	    deleteData: 'net.noDataToDelete',
	    modifyData: 'net.noDataToModify'
	};

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
	var Net = View.extend(/** @lends module:addon/net.prototype */{
	    initialize: function(options) {
	        var defaultOptions = {
	            initialRequest: true,
	            perPage: 500,
	            enableAjaxHistory: true
	        };
	        var defaultApi = {
	            readData: '',
	            createData: '',
	            updateData: '',
	            deleteData: '',
	            modifyData: '',
	            downloadExcel: '',
	            downloadExcelAll: ''
	        };

	        options = _.assign(defaultOptions, options);
	        options.api = _.assign(defaultApi, options.api);

	        _.assign(this, {
	            // models
	            dataModel: options.dataModel,
	            renderModel: options.renderModel,

	            // extra objects
	            router: null,
	            domEventBus: options.domEventBus,
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

	        this.listenTo(this.dataModel, 'sortChanged', this._onSortChanged);
	        this.listenTo(this.domEventBus, 'click:excel', this._onClickExcel);

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
	            pagination.setItemsPerPage(this.perPage);
	            pagination.setTotalItems(1);
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
	     * Event listener for 'click:excel' event on domEventBus
	     * @param {module:event/gridEvent} gridEvent - GridEvent
	     * @private
	     */
	    _onClickExcel: function(gridEvent) {
	        var downloadType = (gridEvent.type === 'all') ? 'excelAll' : 'excel';
	        this.download(downloadType);
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

	            pagination.setItemsPerPage(this.perPage);
	            pagination.setTotalItems(totalCount);
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
	            startNumber = ((this.curPage - 1) * this.perPage) + 1;
	            this.renderModel.set({
	                startNumber: startNumber
	            });

	            // 마지막 요청한 reloadData에서 사용하기 위해 data 를 저장함.
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
	     * @param {boolean} sortOptions.ascending 오름차순 여부
	     */
	    _onSortChanged: function(sortOptions) {
	        if (sortOptions.requireFetch) {
	            this._readDataAt(1, true, sortOptions);
	        }
	    },

	    /**
	     * 데이터 객체의 정렬 옵션 관련 값을 변경한다.
	     * @private
	     * @param {object} data 데이터 객체
	     * @param {object} sortOptions 정렬 옵션
	     * @param {string} sortOptions.sortColumn 정렬할 컬럼명
	     * @param {boolean} sortOptions.ascending 오름차순 여부
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
	            data.sortAscending = sortOptions.ascending;
	        }
	    },

	    /**
	     * 현재 form data 기준으로, page 에 해당하는 데이터를 조회 한다.
	     * @param {Number} page 조회할 페이지 정보
	     * @param {Boolean} [isUsingRequestedData=true] page 단위 검색이므로, form 수정여부와 관계없이 처음 보낸 form 데이터로 조회할지 여부를 결정한다.
	     * @param {object} sortOptions 정렬 옵션
	     * @param {string} sortOptions.sortColumn 정렬할 컬럼명
	     * @param {boolean} sortOptions.ascending 오름차순 여부
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
	     *      @param {String} [options.checkedOnly=true] - Whether the request param only contains checked rows
	     *      @param {String} [options.modifiedOnly=true] - Whether the request param only contains modified rows
	     *      @param {String} [options.showConfirm=true] - Whether to show confirm dialog before sending request
	     *      @param {String} [options.updateOriginal=false] - Whether to update original data with current data
	     * @returns {boolean} Whether requests or not
	     */
	    request: function(requestType, options) {
	        var newOptions = _.extend({
	            url: this.api[requestType],
	            type: null,
	            hasDataParam: true,
	            checkedOnly: true,
	            modifiedOnly: true,
	            showConfirm: true,
	            updateOriginal: false
	        }, options);
	        var param = this._getRequestParam(requestType, newOptions);

	        if (param) {
	            if (newOptions.updateOriginal) {
	                this.dataModel.setOriginalRowList();
	            }
	            this._ajax(param);
	        }

	        return !!param;
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
	     *      @param {boolean} [options.hasDataParam=true] request 데이터에 rows 관련 데이터가 포함될 지 여부.
	     *      @param {boolean} [options.modifiedOnly=true] rows 관련 데이터 중 수정된 데이터만 포함할 지 여부
	     *      @param {boolean} [options.checkedOnly=true] rows 관련 데이터 중 checked 된 데이터만 포함할 지 여부
	     * @returns {{count: number, data: {requestType: string, url: string, rows: object,
	     *      type: string, dataType: string}}} 옵션 조건에 해당하는 그리드 데이터 정보
	     * @private
	     */
	    _getDataParam: function(requestType, options) {
	        var dataModel = this.dataModel,
	            checkMap = {
	                createData: ['createdRows'],
	                updateData: ['updatedRows'],
	                deleteData: ['deletedRows'],
	                modifyData: ['createdRows', 'updatedRows', 'deletedRows']
	            },
	            checkList = checkMap[requestType],
	            data = {},
	            count = 0,
	            dataMap;

	        options = _.defaults(options || {}, {
	            hasDataParam: true,
	            modifiedOnly: true,
	            checkedOnly: true
	        });

	        if (options.hasDataParam) {
	            if (options.modifiedOnly) {
	                // {createdRows: [], updatedRows:[], deletedRows: []} 에 담는다.
	                dataMap = dataModel.getModifiedRows({
	                    checkedOnly: options.checkedOnly
	                });
	                _.each(dataMap, function(list, name) {
	                    if (_.contains(checkList, name) && list.length) {
	                        count += list.length;
	                        data[name] = JSON.stringify(list);
	                    }
	                }, this);
	            } else {
	                // {rows: []} 에 담는다.
	                data.rows = dataModel.getRows(options.checkedOnly);
	                count = data.rows.length;
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
	     *      @param {boolean} [options.modifiedOnly=true] rowList 관련 데이터 중 수정된 데이터만 포함할 지 여부
	     *      @param {boolean} [options.checkedOnly=true] rowList 관련 데이터 중 checked 된 데이터만 포함할 지 여부
	     * @returns {{requestType: string, url: string, data: object, type: string, dataType: string}}
	     *      ajax 호출시 사용될 option 파라미터
	     * @private
	     */
	    _getRequestParam: function(requestType, options) {
	        var defaultOptions = {
	            url: this.api[requestType],
	            type: null,
	            hasDataParam: true,
	            modifiedOnly: true,
	            checkedOnly: true
	        };
	        var newOptions = $.extend(defaultOptions, options);
	        var dataParam = this._getDataParam(requestType, newOptions);
	        var param = null;

	        if (!newOptions.showConfirm || this._isConfirmed(requestType, dataParam.count)) {
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
	        var messageKey = (count > 0) ? requestMessageMap[requestType] : errorMessageMap[requestType];
	        var replacedValues = {
	            count: count
	        };

	        return i18n.get(messageKey, replacedValues);
	    },

	    /**
	     * ajax 통신을 한다.
	     * @param {{requestType: string, url: string, data: object, type: string, dataType: string}} options ajax 요청 파라미터
	     * @private
	     */
	    _ajax: function(options) {
	        var gridEvent = new GridEvent(null, options.data);
	        var params;

	        /**
	         * Occurs before the http request is sent
	         * @event Grid#beforeRequest
	         * @type {module:event/gridEvent}
	         * @property {Grid} instance - Current grid instance
	         */
	        this.trigger('beforeRequest', gridEvent);
	        if (gridEvent.isStopped()) {
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

	    /* eslint-disable complexity */
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
	        var responseMessage = responseData && responseData.message;
	        var gridEvent = new GridEvent(null, {
	            httpStatus: status,
	            requestType: options.requestType,
	            requestParameter: options.data,
	            responseData: responseData
	        });

	        /**
	         * Occurs when the response is received from the server
	         * @event Grid#reponse
	         * @type {module:event/gridEvent}
	         * @property {number} httpStatus - HTTP status
	         * @property {string} requestType - Request type
	         * @property {string} requestParameter - Request parameters
	         * @property {Object} responseData - response data
	         * @property {Grid} instance - Current grid instance
	         */
	        this.trigger('response', gridEvent);
	        if (gridEvent.isStopped()) {
	            return;
	        }
	        if (responseData && responseData.result) {
	            /**
	             * Occurs after the response event, if the result is true
	             * @event Grid#successReponse
	             * @type {module:event/gridEvent}
	             * @property {number} httpStatus - HTTP status
	             * @property {string} requestType - Request type
	             * @property {string} requestParameter - Request parameter
	             * @property {Object} responseData - response data
	             * @property {Grid} instance - Current grid instance
	             */
	            this.trigger('successResponse', gridEvent);
	            if (gridEvent.isStopped()) {
	                return;
	            }
	            if (_.isFunction(callback)) {
	                callback(responseData.data || {}, status, jqXHR);
	            }
	        } else {
	            /**
	             * Occurs after the response event, if the result is false
	             * @event Grid#failResponse
	             * @type {module:event/gridEvent}
	             * @property {number} httpStatus - HTTP status
	             * @property {string} requestType - Request type
	             * @property {string} requestParameter - Request parameter
	             * @property {Object} responseData - response data
	             * @property {Grid} instance - Current grid instance
	             */
	            this.trigger('failResponse', gridEvent);
	            if (gridEvent.isStopped()) {
	                return;
	            }
	            if (responseMessage) {
	                alert(responseMessage);
	            }
	        }
	    },
	    /* eslint-enable complexity */

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
	        var eventData = new GridEvent(null, {
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
	         * @event Grid#errorResponse
	         * @type {module:event/gridEvent}
	         * @property {number} httpStatus - HTTP status
	         * @property {string} requestType - Request type
	         * @property {string} requestParameter - Request parameters
	         * @property {Grid} instance - Current grid instance
	         */
	        this.trigger('errorResponse', eventData);
	        if (eventData.isStopped()) {
	            return;
	        }

	        if (jqXHR.readyState > 1) {
	            alert(i18n.get('net.failResponse'));
	        }
	    }
	});

	module.exports = Net;


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Router for Addon.Net
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var Backbone = __webpack_require__(5);

	/**
	 * Router for Addon.Net
	 * @module addon/net-router
	 * @param  {object} attributes - Attributes
	 * @ignore
	 */
	var Router = Backbone.Router.extend(/** @lends module:addon/net-router.prototype */{
	    initialize: function(attributes) {
	        this.net = attributes.net;
	    },

	    routes: {
	        'read/:queryStr': 'read'
	    }
	});

	module.exports = Router;


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Utilities for form data, form element
	 * @author NHN Ent. Fe Development Team
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

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
	            var options = snippet.toArray(targetElement.options);

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
	            var options = snippet.toArray(targetElement.options);

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
	            isExisty = snippet.isExisty;

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

	        $elementList = snippet.isHTMLTag($elementList) ? [$elementList] : $elementList;
	        $elementList = snippet.toArray($elementList);
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


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * @fileoverview Component holder
	 * @author NHN Ent. FE Development Team
	 */

	'use strict';

	var $ = __webpack_require__(7);
	var snippet = __webpack_require__(3);

	var defaultOptionsMap = {
	    pagination: null
	};

	/**
	 * Component holder
	 * @module componentHolder
	 * @ignore
	 */
	var ComponentHolder = snippet.defineClass(/** @lends module:componentHolder.prototype */{
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


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	* @fileoverview theme manager
	* @author NHN Ent. FE Development Team
	*/

	'use strict';

	var $ = __webpack_require__(7);
	var util = __webpack_require__(16);
	var styleGen = __webpack_require__(75);
	var themeNameConst = __webpack_require__(10).themeName;

	var STYLE_ELEMENT_ID = 'tui-grid-theme-style';

	var presetOptions = {};
	presetOptions[themeNameConst.DEFAULT] = __webpack_require__(77);
	presetOptions[themeNameConst.STRIPED] = __webpack_require__(78);
	presetOptions[themeNameConst.CLEAN] = __webpack_require__(79);

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
	            styleGen.cellFocused(cell.focused),
	            styleGen.cellFocusedInactive(cell.focusedInactive)
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


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	* @fileoverview css style generator
	* @author NHN Ent. FE Development Team
	*/

	'use strict';

	var _ = __webpack_require__(2);

	var builder = __webpack_require__(76);
	var classNameConst = __webpack_require__(18);

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
	        var headerRule = classRule(classNameConst.HEAD_AREA).border(options.border);
	        var summaryRule = classRule(classNameConst.SUMMARY_AREA).border(options.border);
	        var borderLineRule = classRule(classNameConst.BORDER_LINE).bg(options.border);
	        var scrollHeadRule = classRule(classNameConst.SCROLLBAR_HEAD).border(options.border);
	        var scrollBorderRule = classRule(classNameConst.SCROLLBAR_BORDER).bg(options.border);
	        var summaryRightRule = classRule(classNameConst.SUMMARY_AREA_RIGHT).border(options.border);

	        return builder.buildAll([
	            containerRule,
	            contentAreaRule,
	            tableRule,
	            headerRule,
	            summaryRule,
	            borderLineRule,
	            scrollHeadRule,
	            scrollBorderRule,
	            summaryRightRule
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
	        var summaryRightRule = classRule(classNameConst.SUMMARY_AREA_RIGHT).bg(options.background);
	        var bodyAreaRule = classRule(classNameConst.BODY_AREA).bg(options.background);
	        var frozenBorderRule = classRule(classNameConst.FROZEN_BORDER_BOTTOM).bg(options.background);

	        return builder.buildAll(webkitScrollbarRules.concat([
	            ieScrollbarRule,
	            rightBottomRule,
	            leftBottomRule,
	            scrollHeadRule,
	            summaryRightRule,
	            bodyAreaRule,
	            frozenBorderRule
	        ]));
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
	        var bodyAreaRule = classRule(classNameConst.BODY_AREA).border(options.border);

	        return builder.buildAll([
	            cellRule,
	            bodyAreaRule
	        ]);
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
	            .bg(options.background)
	            .border(options.border);

	        var summaryAreaRule = classRule(classNameConst.SUMMARY_AREA)
	            .bg(options.background);

	        return builder.buildAll([headRule, headAreaRule, summaryAreaRule]);
	    },

	    /**
	     * Generates a css string for the cells in even rows.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    cellEvenRow: function(options) {
	        return classRule(classNameConst.ROW_EVEN + '>td')
	            .bg(options.background)
	            .build();
	    },

	    /**
	     * Generates a css string for the cells in odd rows.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    cellOddRow: function(options) {
	        return classRule(classNameConst.ROW_ODD + '>td')
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
	     * Generates a css string for focused cell.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    cellFocused: function(options) {
	        var focusLayerRule = classRule(classNameConst.LAYER_FOCUS_BORDER).bg(options.border);
	        var editingLayerRule = classRule(classNameConst.LAYER_EDITING).border(options.border);

	        return builder.buildAll([focusLayerRule, editingLayerRule]);
	    },

	    /**
	     * Generates a css string for focus inactive cell.
	     * @param {Object} options - options
	     * @returns {String}
	     */
	    cellFocusedInactive: function(options) {
	        return builder.create('.' + classNameConst.LAYER_FOCUS_DEACTIVE + ' .' + classNameConst.LAYER_FOCUS_BORDER)
	            .bg(options.border)
	            .build();
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


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	* @fileoverview CSS Rule string builder
	* @author NHN Ent. FE Development Team
	*/

	'use strict';

	var _ = __webpack_require__(2);
	var snippet = __webpack_require__(3);

	/**
	 * create css rule string and returns it
	 * @module {theme/cssBuilder}
	 * @param {String} selector - css selector
	 * @param {String} property - css property
	 * @param {String} value - css value
	 * @ignore
	 */
	var CSSRuleBuilder = snippet.defineClass({
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


/***/ }),
/* 77 */
/***/ (function(module, exports) {

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
	        focusedInactive: {
	            border: '#aaa'
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


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	* @fileoverview default theme preset
	* @author NHN Ent. FE Development Team
	*/

	'use strict';

	var $ = __webpack_require__(7);

	var presetDefault = __webpack_require__(77);

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


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	* @fileoverview default theme preset
	* @author NHN Ent. FE Development Team
	*/

	'use strict';

	var $ = __webpack_require__(7);

	var presetDefault = __webpack_require__(77);

	module.exports = $.extend(true, {}, presetDefault, {
	    grid: {
	        border: '#c0c0c0'
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


/***/ }),
/* 80 */
/***/ (function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ })
/******/ ])
});
;