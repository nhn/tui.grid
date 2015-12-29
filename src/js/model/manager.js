/**
 * @fileoverview Model Manager
 * @author NHN Ent. FE Development Team
 */
'use strict';

var ColumnModelData = require('./data/columnModel');
var RowListData = require('./data/rowList');
var ToolbarModel = require('./toolbar');
var DimensionModel = require('./dimension');
var FocusModel = require('./focus');
var RenderModel = require('./renderer');
var SmartRenderModel = require('./renderer-smart');
var SelectionModel = require('./selection');
var CellFactory = require('../view/cellFactory');

var util = require('../common/util');
var renderStateMap = require('../common/constMap').renderState;

var defaultOptions = {
    columnFixCount: 0,
    columnModelList: [],
    keyColumnName: null,
    selectType: '',
    autoNumbering: true,
    headerHeight: 35,
    rowHeight: 27,
    displayRowCount: 10,
    minimumColumnWidth: 50,
    notUseSmartRendering: false,
    columnMerge: [],
    scrollX: true,
    scrollY: true,
    useClientSort: true,
    singleClickEdit: false,
    toolbar: {
        hasResizeHandler: true,
        hasControlPanel: true,
        hasPagination: true
    }
};

/**
 * Model Manager
 * @module modelManager
 */
var ModelManager = tui.util.defineClass({
    /**
     * @constructs
     * @extends module:base/model
     * @param {Object} options - Options to create models
     */
    init: function(options, domState) {
        options = $.extend(true, {}, defaultOptions, options);

        // todo: remove cellFactory
        this.cellFactory = new CellFactory({
            grid: this
        });

        this.columnModel = this._createColumnModel(options);
        this.dataModel = this._createDataModel(options, domState);
        this.toolbarModel = this._createToolbarModel(options);
        this.dimensionModel = this._createDimensionModel(options, domState);
        this.renderModel = this._createRenderModel(options);
        this.focusModel = this._createFocusModel(domState);
        this.selectionModel = this._createSelectionModel();

        // todo: remove dependency
        this.dimensionModel.renderModel = this.renderModel;
    },

    /**
     * Creates an instance of column model and returns it.
     * @param  {Object} options - Options
     * @return {module:data/columnModel} A new instance
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
     * @return {module:data/rowList} - A new instance
     * @private
     */
    _createDataModel: function(options, domState) {
        return new RowListData([], {
            gridId: options.gridId,
            domState: domState,
            columnModel: this.columnModel,
            useClientSort: options.useClientSort
        });
    },

    /**
     * Creates an instance of toolbar model and returns it.
     * @param  {Object} options - Options
     * @return {module:model/toolbar} - A new instance
     * @private
     */
    _createToolbarModel: function(options) {
        return new ToolbarModel(options.toolbar);
    },

    /**
     * Creates an instance of dimension model and returns it.
     * @param  {Object} options - Options
     * @param  {module:domState} domState - domState
     * @return {module:model/dimension} - A new instance
     * @private
     */
    _createDimensionModel: function(options, domState) {
        var attrs = {
            headerHeight: options.headerHeight,
            rowHeight: options.rowHeight,
            scrollX: !!options.scrollX,
            scrollY: !!options.scrollY,
            minimumColumnWidth: options.minimumColumnWidth,
            displayRowCount: options.displayRowCount
        };
        if (!this.toolbarModel.isVisible()) {
            attrs.toolbarHeight = 0;
        }

        return new DimensionModel(attrs, {
            columnModel: this.columnModel,
            dataModel: this.dataModel,
            domState: domState
        });
    },

    /**
     * Creates an instance of focus model and returns it.
     * @param  {module:domState} domState - DomState instance
     * @return {module:model/focus} - A new instance
     * @private
     */
    _createFocusModel: function(domState) {
        return new FocusModel(null, {
            columnModel: this.columnModel,
            dataModel: this.dataModel,
            dimensionModel: this.dimensionModel,
            renderModel: this.renderModel,
            cellFactory: this.cellFactory,
            domState: domState
        });
    },

    /**
     * Creates an instance of seleciton model and returns it.
     * @return {module:model/selection} - A new instance
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
     * @return {module:model/render} - A new instance
     * @private
     */
    _createRenderModel: function(options) {
        var attrs, renderOptions, Constructor;

        attrs = {
            emptyMessage: options.emptyMessage
        };
        renderOptions = {
            columnModel: this.columnModel,
            dataModel: this.dataModel,
            dimensionModel: this.dimensionModel
        };
        Constructor = options.notUseSmartRendering ? RenderModel : SmartRenderModel

        return new Constructor(attrs, renderOptions);
    },

    /**
     * 소멸자
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
