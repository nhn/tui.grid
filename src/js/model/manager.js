/**
 * @fileoverview Model Manager
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');

var ColumnModelData = require('./data/columnModel');
var RowListData = require('./data/rowList');
var ToolbarModel = require('./toolbar');
var DimensionModel = require('./dimension');
var CoordRowModel = require('./coordRow');
var FocusModel = require('./focus');
var RenderModel = require('./renderer');
var SmartRenderModel = require('./renderer-smart');
var SelectionModel = require('./selection');
var SummaryModel = require('./summary');
var util = require('../common/util');

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
        this.focusModel = this._createFocusModel(domState);
        this.renderModel = this._createRenderModel(options);
        this.selectionModel = this._createSelectionModel();
        this.summaryModel = this._createSummaryModel(options.footer);

        // todo: remove dependency
        this.focusModel.renderModel = this.renderModel;
        this.dimensionModel.renderModel = this.renderModel;
        this.dimensionModel.coordRowModel = this.coordRowModel;
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
        return new CoordRowModel({
            dataModel: this.dataModel,
            dimensionModel: this.dimensionModel,
            domState: domState
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
            coordRowModel: this.coordRowModel
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
