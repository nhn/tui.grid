/**
 * @fileoverview Model Manager
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');

var ColumnModelData = require('./data/columnModel');
var RowListData = require('./data/rowList');
var DimensionModel = require('./dimension');
var CoordRowModel = require('./coordRow');
var CoordColumnModel = require('./coordColumn');
var CoordConverterModel = require('./coordConverter');
var FocusModel = require('./focus');
var RenderModel = require('./renderer');
var SmartRenderModel = require('./renderer-smart');
var SelectionModel = require('./selection');
var SummaryModel = require('./summary');
var ClipboardModel = require('./clipboard');
var util = require('../common/util');

var defaultOptions = {
    columnFixCount: 0,
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
        resizable: true
    },
    rowHeight: 27,
    fitToParentHeight: false,
    fixedRowHeight: true,
    fixedHeight: false,
    showDummyRows: false,
    virtualScrolling: true,
    copyOptions: null,
    scrollX: true,
    scrollY: true,
    singleClickEdit: false,
    useClientSort: true
};

/**
 * Model Manager
 * @module model/manager
 * @param {Object} options - Options to create models
 * @param {module/domState} domState - DomState instance
 * @ignore
 */
var ModelManager = tui.util.defineClass(/**@lends module:modelManager.prototype */{
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
        this.selectionModel = this._createSelectionModel(domEventBus);
        this.summaryModel = this._createSummaryModel(options.footer);
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
            hasNumberColumn: options.autoNumbering,
            keyColumnName: options.keyColumnName,
            columnFixCount: options.columnFixCount,
            selectType: options.selectType,
            complexHeaderColumns: options.header.complexColumns,
            copyOptions: options.copyOptions,
            columns: options.columns
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
            useClientSort: options.useClientSort
        });
    },

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
        var attrs = {
            headerHeight: options.header.height,
            bodyHeight: options.bodyHeight,
            footerHeight: options.footer ? options.footer.height : 0,
            rowHeight: options.rowHeight,
            fitToParentHeight: options.fitToParentHeight,
            scrollX: !!options.scrollX,
            scrollY: !!options.scrollY,
            minimumColumnWidth: options.columnOptions.minWidth,
            fixedRowHeight: options.fixedRowHeight,
            fixedHeight: options.fixedHeight
        };

        if (options.fixedRowHeight === false && options.virtualScrolling) {
            util.warning('The fixedRowHeight can\'t be false if the virtualScrolling is not set to false.');
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
            singleClickEdit: options.singleClickEdit
        });
    },

    /**
     * Creates an instance of seleciton model and returns it.
     * @param {module:event/domEventBus} domEventBus - domEventBus
     * @returns {module:model/selection} - A new instance
     * @private
     */
    _createSelectionModel: function(domEventBus) {
        return new SelectionModel(null, {
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
            showDummyRows: options.showDummyRows,
            language: options.language
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
