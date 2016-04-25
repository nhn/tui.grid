/**
 * @fileoverview Layer class that represents the state of rendering phase
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var CELL_BORDER_WIDTH = require('../common/constMap').dimension.CELL_BORDER_WIDTH;
var attrNameConst = require('../common/constMap').attrName;
var classNameConst = require('../common/classNameConst');

/**
 * Layer class that represents the state of rendering phase.
 * @module view/editingLayer
 * @extends module:base/view
 */
var EditingLayer = View.extend(/**@lends module:view/editingLayer.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
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
        var editType = tui.util.pick(cellData, 'columnModel', 'editOption', 'type');
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
        this.$el.removeAttr(attrNameConst.ROW_KEY);
        this.$el.removeAttr(attrNameConst.COLUMN_NAME);
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
        var cellHeight = $cell.height() + CELL_BORDER_WIDTH;
        var cellWidth = $cell.width() + CELL_BORDER_WIDTH;

        return {
            top: cellOffset.top - wrapperOffset.top,
            left: cellOffset.left - wrapperOffset.left,
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
        if (cellData.isEditing) {
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
