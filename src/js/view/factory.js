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

/**
 * Model Manager
 * @module modelManager
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
            dataModel: this.modelManager.dataModel,
            dimensionModel: this.modelManager.dimensionModel,
            focusModel: this.modelManager.focusModel,
            gridId: this.modelManager.gridId,
            grid: this.modelManager, // todo: remove this line!!
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
    }
});

module.exports = ViewFactory;
