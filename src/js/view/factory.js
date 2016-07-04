/**
 * @fileoverview View factory
 * @author NHN Ent. FE Development Team
 */
'use strict';

var ContainerView = require('./container');
var ContentAreaView = require('./layout/content-area');
var ToolbarView = require('./toolbar');
var PaginationView = require('./pagination');
var HeightResizeHandleView = require('./heightResizeHandle');
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
var EditingLayerView = require('./editingLayer');
var DatePickeLayerView = require('./datePickerLayer');
var FocusLayerView = require('./focusLayer');
var isOptionEnabled = require('../common/util').isOptionEnabled;

/**
 * View Factory
 * @module viewFactory
 */
var ViewFactory = tui.util.defineClass({
    init: function(options) {
        // dependencies
        this.domState = options.domState;
        this.modelManager = options.modelManager;
        this.painterManager = options.painterManager;
        this.componentHolder = options.componentHolder;

        // view options
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
            painterManager: this.modelManager.painterManager,
            copyOption: this.copyOption
        });
    },

    /**
     * Creates frame view and returns it.
     * @param  {String} whichSide - 'L'(left) or 'R'(right)
     * @returns {module:view/layout/frame} New frame view instance
     */
    createFrame: function(whichSide) {
        var Constructor = whichSide === 'L' ? LsideFrameView : RsideFrameView;

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
            viewFactory: this
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
            columnModel: this.modelManager.columnModel
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
            columnModel: this.modelManager.columnModel
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
            focusModel: this.modelManager.focusModel
        });
    }
});

module.exports = ViewFactory;
