/**
 * @fileoverview Class for the selection layer
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');

var View = require('../base/view');
var classNameConst = require('../common/classNameConst');
var CELL_BORDER_WIDTH = require('../common/constMap').dimension.CELL_BORDER_WIDTH;
var frameConst = require('../common/constMap').frame;

/**
 * Class for the selection layer
 * @module view/selectionLayer
 * @extends module:base/view
 * @param {object} options Options
 * @ignore
 */
var SelectionLayer = View.extend(/** @lends module:view/selectionLayer.prototype */{
    initialize: function(options) {
        _.assign(this, {
            whichSide: options.whichSide || frameConst.R,
            dimensionModel: options.dimensionModel,
            coordRowModel: options.coordRowModel,
            coordColumnModel: options.coordColumnModel,
            columnModel: options.columnModel,
            selectionModel: options.selectionModel
        });
        this._updateColumnWidths();

        this.listenTo(this.coordColumnModel, 'columnWidthChanged', this._onChangeColumnWidth);
        this.listenTo(this.selectionModel, 'change:range', this.render);
    },

    className: classNameConst.LAYER_SELECTION,

    /**
     * Updates this.columnWidths
     * @private
     */
    _updateColumnWidths: function() {
        this.columnWidths = this.coordColumnModel.getWidths(this.whichSide);
    },

    /**
     * Event handler for 'columnWidthChanged' evnet on Dimension model.
     * @private
     */
    _onChangeColumnWidth: function() {
        this._updateColumnWidths();
        this.render();
    },

    /**
     * Returns relative column range based on 'this.whichSide'
     * @private
     * @param {array} columnRange - Column range indexes. [start, end]
     * @returns {array} - Relative column range indexes. [start, end]
     */
    _getOwnSideColumnRange: function(columnRange) {
        var frozenCount = this.columnModel.getVisibleFrozenCount();
        var ownColumnRange = null;

        if (this.whichSide === frameConst.L) {
            if (columnRange[0] < frozenCount) {
                ownColumnRange = [
                    columnRange[0],
                    Math.min(columnRange[1], frozenCount - 1)
                ];
            }
        } else if (columnRange[1] >= frozenCount) {
            ownColumnRange = [
                Math.max(columnRange[0], frozenCount) - frozenCount,
                columnRange[1] - frozenCount
            ];
        }

        return ownColumnRange;
    },

    /**
     * Returns the object containing 'top' and 'height' css value.
     * @private
     * @param  {array} rowRange - Row range indexes. [start, end]
     * @returns {{top: string, height: string}} - css values
     */
    _getVerticalStyles: function(rowRange) {
        var coordRowModel = this.coordRowModel;
        var top = coordRowModel.getOffsetAt(rowRange[0]);
        var bottom = coordRowModel.getOffsetAt(rowRange[1]) + coordRowModel.getHeightAt(rowRange[1]);

        return {
            top: top + 'px',
            height: (bottom - top) + 'px'
        };
    },

    /**
     * Returns the object containing 'left' and 'width' css value.
     * @private
     * @param  {array} columnRange - Column range indexes. [start, end]
     * @returns {{left: string, width: string}} - css values
     */
    _getHorizontalStyles: function(columnRange) {
        var columnWidths = this.columnWidths;
        var metaColumnCount = this.columnModel.getVisibleMetaColumnCount();
        var startIndex = columnRange[0];
        var endIndex = columnRange[1];
        var left = 0;
        var width = 0;
        var i = 0;

        if (this.whichSide === frameConst.L) {
            startIndex += metaColumnCount;
            endIndex += metaColumnCount;
        }
        endIndex = Math.min(endIndex, columnWidths.length - 1);

        for (; i <= endIndex; i += 1) {
            if (i < startIndex) {
                left += columnWidths[i] + CELL_BORDER_WIDTH;
            } else {
                width += columnWidths[i] + CELL_BORDER_WIDTH;
            }
        }
        width -= CELL_BORDER_WIDTH; // subtract last border width

        return {
            left: left + 'px',
            width: width + 'px'
        };
    },

    /**
     * Render.
     * @returns {SelectionLayer} this object
     */
    render: function() {
        var range = this.selectionModel.get('range');
        var styles, columnRange;

        if (range) {
            columnRange = this._getOwnSideColumnRange(range.column);
        }
        if (columnRange) {
            styles = _.assign({},
                this._getVerticalStyles(range.row),
                this._getHorizontalStyles(columnRange)
            );
            this.$el.show().css(styles);
        } else {
            this.$el.hide();
        }

        return this;
    }
});

module.exports = SelectionLayer;
