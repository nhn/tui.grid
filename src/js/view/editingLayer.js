/**
 * @fileoverview Layer class that represents the state of rendering phase
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');
var snippet = require('tui-code-snippet');

var View = require('../base/view');
var CELL_BORDER_WIDTH = require('../common/constMap').dimension.CELL_BORDER_WIDTH;
var attrNameConst = require('../common/constMap').attrName;
var classNameConst = require('../common/classNameConst');

/**
 * Layer class that represents the state of rendering phase.
 * @module view/editingLayer
 * @extends module:base/view
 * @param {Object} options - Options
 * @ignore
 */
var EditingLayer = View.extend(/** @lends module:view/editingLayer.prototype */{
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
        var editType = snippet.pick(cellData, 'columnModel', 'editOptions', 'type');
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
     * Adjust offset value of TD, because it varies from browsers to browsers when borders are callapsed.
     * @param {Number} offsetValue - offset value (offset.top or offset.left)
     * @returns {Number}
     * @private
     */
    _adjustCellOffsetValue: function(offsetValue) {
        var browser = snippet.browser;
        var result = offsetValue;

        if (browser.msie) {
            if (browser.version === 9) {
                result = offsetValue - 1;
            } else if (browser.version > 9) {
                result = Math.floor(offsetValue);
            }
        }

        return result;
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
        var cellHeight = $cell.outerHeight() + CELL_BORDER_WIDTH;
        var cellWidth = $cell.outerWidth() + CELL_BORDER_WIDTH;

        return {
            top: this._adjustCellOffsetValue(cellOffset.top) - wrapperOffset.top,
            left: this._adjustCellOffsetValue(cellOffset.left) - wrapperOffset.left,
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
        if (cellData.editing) {
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
