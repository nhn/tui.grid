/**
 * @fileoverview View factory
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');
var snippet = require('tui-code-snippet');
var DatePicker = require('tui-date-picker');

var ContainerView = require('./container');
var ContentAreaView = require('./layout/content-area');
var PaginationView = require('./pagination');
var HeightResizeHandleView = require('./heightResizeHandle');
var StateLayerView = require('./stateLayer');
var ClipboardView = require('./clipboard');
var LsideFrameView = require('./layout/frame-lside');
var RsideFrameView = require('./layout/frame-rside');
var HeaderView = require('./layout/header');
var HeaderResizeHandleView = require('./layout/resizeHandle');
var BodyView = require('./layout/body');
var BodyTableView = require('./layout/bodyTable');
var SummaryView = require('./layout/summary');
var RowListView = require('./rowList');
var SelectionLayerView = require('./selectionLayer');
var EditingLayerView = require('./editingLayer');
var DatePickeLayerView = require('./datePickerLayer');
var FocusLayerView = require('./focusLayer');
var isOptionEnabled = require('../common/util').isOptionEnabled;
var frameConst = require('../common/constMap').frame;

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
