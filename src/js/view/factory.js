/**
 * @fileoverview Model Manager
 * @author NHN Ent. FE Development Team
 */
'use strict';

var ContainerView = require('./container');
var ToolbarView = require('./layout/toolbar');
var ToolbarControlPanelView = require('./layout/toolbar/controlPanel');
var ToolbarPaginationView = require('./layout/toolbar/pagination');
var ToolbarResizeHandlerView = require('./layout/toolbar/resizeHandler');
var StateLayerView = require('./stateLayer');
var ClipboardView = require('./clipboard');
var LsideFrameView = require('./layout/frame-lside');
var RsideFrameView = require('./layout/frame-rside');
var HeaderView = require('./layout/header');
var HeaderResizeHandlerView = require('./layout/resizeHandler');
var BodyView = require('./layout/body');
var BodyTableView = require('./layout/bodyTable');
var RowListView = require('./rowList');
var SelectionLayerView = require('./selectionLayer');

/**
 * View Factory
 * @module viewFactory
 */
var ViewFactory = tui.util.defineClass({
    init: function(modelManager) {
        this.modelManager = modelManager;
    },

    /**
     * Creates container view and returns it.
     * @param {Object} options - Options set by user
     * @return {ContainerView} - New container view
     */
    createContainer: function(options) {
        return new ContainerView({
            el: options.el,
            singleClickEdit: options.singleClickEdit,
            dataModel: this.modelManager.dataModel,
            dimensionModel: this.modelManager.dimensionModel,
            focusModel: this.modelManager.focusModel,
            gridId: this.modelManager.gridId,
            viewFactory: this
        });
    },

    createToolbar: function() {
        return new ToolbarView({
            toolbarModel: this.modelManager.toolbarModel,
            dimensionModel: this.modelManager.dimensionModel,
            viewFactory: this
        });
    },

    createToolbarControlPanel: function() {
        return new ToolbarControlPanelView({
            gridId: this.modelManager.gridId,
            toolbarModel: this.modelManager.toolbarModel
        });
    },

    createToolbarPagination: function() {
        return new ToolbarPaginationView({
            toolbarModel: this.modelManager.toolbarModel
        });
    },

    createToolbarResizeHandler: function() {
        return new ToolbarResizeHandlerView({
            dimensionModel: this.modelManager.dimensionModel
        });
    },

    createStateLayer: function() {
        return new StateLayerView({
            dimensionModel: this.modelManager.dimensionModel,
            renderModel: this.modelManager.renderModel
        });
    },

    createClipboard: function() {
        return new ClipboardView({
            columnModel: this.modelManager.columnModel,
            dataModel: this.modelManager.dataModel,
            dimensionModel: this.modelManager.dimensionModel,
            selectionModel: this.modelManager.selectionModel,
            focusModel: this.modelManager.focusModel,
            renderModel: this.modelManager.renderModel,
            cellFactory: this.modelManager.cellFactory
        });
    },

    createFrame: function(whichSide) {
        var Constructor = whichSide === 'L' ? LsideFrameView : RsideFrameView;

        return new Constructor({
            dimensionModel: this.modelManager.dimensionModel,
            renderModel: this.modelManager.renderModel,
            viewFactory: this
        });
    },

    createHeader: function(whichSide) {
        return new HeaderView({
            whichSide: whichSide,
            renderModel: this.modelManager.renderModel,
            dimensionModel: this.modelManager.dimensionModel,
            selectionModel: this.modelManager.selectionModel,
            dataModel: this.modelManager.dataModel,
            columnModel: this.modelManager.columnModel,
            viewFactory: this
        });
    },

    createHeaderResizeHandler: function(whichSide) {
        return new HeaderResizeHandlerView({
            whichSide: whichSide,
            dimensionModel: this.modelManager.dimensionModel,
            columnModel: this.modelManager.columnModel
        });
    },

    createBody: function(whichSide) {
        return new BodyView({
            whichSide: whichSide,
            renderModel: this.modelManager.renderModel,
            dimensionModel: this.modelManager.dimensionModel,
            dataModel: this.modelManager.dataModel,
            columnModel: this.modelManager.columnModel,
            selectionModel: this.modelManager.selectionModel,
            focusModel: this.modelManager.focusModel,
            viewFactory: this
        });
    },

    createBodyTable: function(whichSide) {
        return new BodyTableView({
            whichSide: whichSide,
            dimensionModel: this.modelManager.dimensionModel,
            renderModel: this.modelManager.renderModel,
            columnModel: this.modelManager.columnModel,
            viewFactory: this
        });
    },

    createRowList: function(options) {
        var whichSide = options.whichSide,
            columnModelList = this.modelManager.columnModel.getVisibleColumnModelList(whichSide, true);

        return new RowListView({
            el: options.el,
            whichSide: whichSide,
            columnModelList: columnModelList,
            bodyTableView: options.bodyTableView,
            dataModel: this.modelManager.dataModel,
            dimensionModel: this.modelManager.dimensionModel,
            renderModel: this.modelManager.renderModel,
            focusModel: this.modelManager.focusModel,
            grid: this.modelManager
        });
    },

    createSelectionLayer: function(whichSide) {
        return new SelectionLayerView({
            whichSide: whichSide,
            selectionModel: this.modelManager.selectionModel,
            dimensionModel: this.modelManager.dimensionModel,
            columnModel: this.modelManager.columnModel
        });
    }
});

module.exports = ViewFactory;
