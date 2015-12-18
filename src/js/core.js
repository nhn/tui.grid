/**
 * @fileoverview Grid Core 파일
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('./base/model');
var ColumnModelData = require('./data/columnModel');
var RowListData = require('./data/rowList');
var ToolbarModel = require('./model/toolbar');
var DimensionModel = require('./model/dimension');
var FocusModel = require('./model/focus');
var RenderModel = require('./model/renderer');
var SmartRenderModel = require('./model/renderer-smart');
var SelectionModel = require('./model/selection');
var CellFactory = require('./view/cellFactory');

var util = require('./common/util');
var renderStateMap = require('./common/constMap').renderState;

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
 * Grid Core
 * @module core
 */
var Core = Model.extend(/**@lends module:core.prototype */{
    /**
     * @constructs
     * @extends module:base/model
     * @param {Object} options Grid.js 의 생성자 option 과 동일값.
     */
    initialize: function(options, domState, publicInstance) {
        options = $.extend(true, {}, defaultOptions, options);

        this.domState = domState;
        this.publicInstance = publicInstance;
        this.id = util.getUniqueKey();

        this._initializeModel(options);

        this.listenTo(this.focusModel, 'select', this._onSelectRow);
    },

    /**
     * Initialize model instances
     * @private
     */
    _initializeModel: function(options) {
        var offset = this.domState.getOffset(),
            renderOptions;

        this.columnModel = new ColumnModelData({
            grid: this,
            hasNumberColumn: options.autoNumbering,
            keyColumnName: options.keyColumnName,
            columnFixCount: options.columnFixCount,
            selectType: options.selectType,
            columnMerge: options.columnMerge
        });
        this.columnModel.set('columnModelList', options.columnModelList);

        this.dataModel = new RowListData([], {
            grid: this,
            useClientSort: options.useClientSort
        });
        this.dataModel.reset([]);

        this.dimensionModel = new DimensionModel({
            grid: this,
            offsetTop: offset.top,
            offsetLeft: offset.left,
            width: this.domState.getWidth(),
            headerHeight: options.headerHeight,
            rowHeight: options.rowHeight,

            scrollX: !!options.scrollX,
            scrollY: !!options.scrollY,
            scrollBarSize: this.scrollBarSize,

            minimumColumnWidth: options.minimumColumnWidth,
            displayRowCount: options.displayRowCount
        });

        this.toolbarModel = new ToolbarModel(options.toolbar);
        if (!this.toolbarModel.isVisible()) {
            this.dimensionModel.set('toolbarHeight', 0);
        }

        this.focusModel = new FocusModel({
            grid: this,
            scrollX: !!options.scrollX,
            scrollY: !!options.scrollY,
            scrollBarSize: this.scrollBarSize
        });

        this.selectionModel = new SelectionModel({
            grid: this
        });

        renderOptions = {
            grid: this,
            emptyMessage: options.emptyMessage
        };
        if (options.notUseSmartRendering) {
            this.renderModel = new RenderModel(renderOptions);
        } else {
            this.renderModel = new SmartRenderModel(renderOptions);
        }

        this.cellFactory = new CellFactory({
            grid: this
        });
    },

    _onSelectRow: function(rowKey) {
        this.trigger('selectRow', {
            rowKey: rowKey,
            rowData: this.dataModel.getRowData(rowKey)
        });
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

module.exports = Core;
