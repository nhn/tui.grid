/**
 * @fileoverview Model Manager
 * @author NHN Ent. FE Development Team
 */

'use strict';

var $ = require('jquery');
var _ = require('underscore');
var snippet = require('tui-code-snippet');

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
