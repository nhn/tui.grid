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
 * @param {array} options.columnWidthList  selection 레이어에 해당하는 영역의 컬럼 너비 리스트 정보
 * @ignore
 */
var SelectionLayer = View.extend(/**@lends module:view/selectionLayer.prototype */{
    initialize: function(options) {
        this.setOwnProperties({
            whichSide: options.whichSide || 'R',
            dimensionModel: options.dimensionModel,
            coordRowModel: options.coordRowModel,
            coordColumnModel: options.coordColumnModel,
            columnModel: options.columnModel,
            selectionModel: options.selectionModel
        });
        this._updateColumnWidthList();

        this.listenTo(this.coordColumnModel, 'columnWidthChanged', this._onChangeColumnWidth);
        this.listenTo(this.selectionModel, 'change:range', this.render);
    },

    className: classNameConst.LAYER_SELECTION,

    /**
     * Updates this.columnWidthList
     * @private
     */
    _updateColumnWidthList: function() {
        this.columnWidthList = this.coordColumnModel.getColumnWidthList(this.whichSide);
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

        if (this.whichSide === frameConst.L) {
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
        var columnWidthList = this.columnWidthList;
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
