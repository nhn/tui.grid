/**
 * @fileoverview Class for the selection layer
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');

var View = require('../base/view');
var util = require('../common/util');
var classNameConst = require('../common/classNameConst');
var CELL_BORDER_WIDTH = require('../common/constMap').dimension.CELL_BORDER_WIDTH;

/**
 * Class for the selection layer
 * @module view/selectionLayer
 * @extends module:base/view
 */
var SelectionLayer = View.extend(/**@lends module:view/selectionLayer.prototype */{
    /**
     * @constructs
     * @param {object} options Options
     * @param {array} options.columnWidthList  selection 레이어에 해당하는 영역의 컬럼 너비 리스트 정보
     */
    initialize: function(options) {
        this.setOwnProperties({
            whichSide: options.whichSide || 'R',
            dimensionModel: options.dimensionModel,
            columnModel: options.columnModel,
            selectionModel: options.selectionModel
        });
        this._updateColumnWidthList();

        this.listenTo(this.dimensionModel, 'columnWidthChanged', this._onChangeColumnWidth);
        this.listenTo(this.selectionModel, 'change:range', this.render);
    },

    className: classNameConst.LAYER_SELECTION,

    /**
     * Updates this.columnWidthList
     * @private
     */
    _updateColumnWidthList: function() {
        this.columnWidthList = this.dimensionModel.getColumnWidthList(this.whichSide);
    },

    /**
     * Event handler for 'columnWidthChanged' evnet on Dimension model.
     * @private
     */
    _onChangeColumnWidth: function() {
        this._updateColumnWidthList();
        this.render();
    },

    /**
     * Returns relative column range based on 'this.whichSide'
     * @private
     * @param {array} columnRange - Column range indexes. [start, end]
     * @returns {array} - Relative column range indexes. [start, end]
     */
    _getOwnSideColumnRange: function(columnRange) {
        var columnFixCount = this.columnModel.getVisibleColumnFixCount();
        var ownColumnRange = null;

        if (this.whichSide === 'L') {
            if (columnRange[0] < columnFixCount) {
                ownColumnRange = [
                    columnRange[0],
                    Math.min(columnRange[1], columnFixCount - 1)
                ];
            }
        } else if (columnRange[1] >= columnFixCount) {
            ownColumnRange = [
                Math.max(columnRange[0], columnFixCount) - columnFixCount,
                columnRange[1] - columnFixCount
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
        var rowHeight = this.dimensionModel.get('rowHeight');
        var top = util.getHeight(rowRange[0], rowHeight);
        var height = util.getHeight(rowRange[1] - rowRange[0] + 1, rowHeight) - CELL_BORDER_WIDTH;

        return {
            top: top + 'px',
            height: height + 'px'
        };
    },

    /**
     * Returns the object containing 'left' and 'width' css value.
     * @private
     * @param  {array} columnRange - Column range indexes. [start, end]
     * @returns {{left: string, width: string}} - css values
     */
    _getHorizontalStyles: function(columnRange) {
        var columnWidthList = this.columnWidthList,
            metaColumnCount = this.columnModel.getVisibleMetaColumnCount(),
            startIndex = columnRange[0],
            endIndex = columnRange[1],
            left = 0,
            width = 0,
            i = 0;

        if (this.whichSide === 'L') {
            startIndex += metaColumnCount;
            endIndex += metaColumnCount;
        }
        endIndex = Math.min(endIndex, columnWidthList.length - 1);

        for (; i <= endIndex; i += 1) {
            if (i < startIndex) {
                left += columnWidthList[i] + CELL_BORDER_WIDTH;
            } else {
                width += columnWidthList[i] + CELL_BORDER_WIDTH;
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
