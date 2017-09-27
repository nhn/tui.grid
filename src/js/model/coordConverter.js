/**
 * @fileoverview Converts coordinates to index of rows and columns
 * @author NHN Ent. FE Development Lab
 */

'use strict';

var snippet = require('tui-code-snippet');

var Model = require('../base/model');
var dimensionConstMap = require('../common/constMap').dimension;

var TABLE_BORDER_WIDTH = dimensionConstMap.TABLE_BORDER_WIDTH;
var CELL_BORDER_WIDTH = dimensionConstMap.CELL_BORDER_WIDTH;

/**
 * @module model/coordConverter
 * @param {Object} attrs - Attributes
 * @param {Object} options - Options
 * @extends module:base/model
 * @ignore
 */
var CoordConverter = Model.extend(/** @lends module:model/coordConverter.prototype */{
    initialize: function(attrs, options) {
        this.dataModel = options.dataModel;
        this.columnModel = options.columnModel;
        this.focusModel = options.focusModel;
        this.dimensionModel = options.dimensionModel;
        this.renderModel = options.renderModel;
        this.coordRowModel = options.coordRowModel;
        this.coordColumnModel = options.coordColumnModel;

        this.listenTo(this.focusModel, 'focus', this._onFocus);
    },

    /**
     * Get cell index from mouse position
     * @param {Number} pageX - Mouse X-position based on page
     * @param {Number} pageY - Mouse Y-position based on page
     * @param {boolean} [withMeta] - Whether the meta columns go with this calculation
     * @returns {{row: number, column: number}} Cell index
     */
    getIndexFromMousePosition: function(pageX, pageY, withMeta) {
        var position = this.dimensionModel.getPositionFromBodyArea(pageX, pageY);
        var posWithScroll = this._getScrolledPosition(position);

        return {
            row: this.coordRowModel.indexOf(posWithScroll.y),
            column: this.coordColumnModel.indexOf(posWithScroll.x, withMeta)
        };
    },

    /**
     * Returns the scrolled position in addition to given position
     * @param {{x: number, y: number}} position - position
     * @returns {{x: number, y: number}}
     * @private
     */
    _getScrolledPosition: function(position) {
        var renderModel = this.renderModel;
        var isRside = position.x > this.dimensionModel.get('lsideWidth');
        var scrollLeft = isRside ? renderModel.get('scrollLeft') : 0;
        var scrollTop = renderModel.get('scrollTop');

        return {
            x: position.x + scrollLeft,
            y: position.y + scrollTop
        };
    },

    /**
     * Returns the count of rowspan of given cell
     * @param {Number} rowKey - row key
     * @param {String} columnName - column name
     * @returns {Number}
     * @private
     */
    _getRowSpanCount: function(rowKey, columnName) {
        var rowSpanData = this.dataModel.get(rowKey).getRowSpanData(columnName);

        if (!rowSpanData.isMainRow) {
            rowKey = rowSpanData.mainRowKey;
            rowSpanData = this.dataModel.get(rowKey).getRowSpanData(columnName);
        }

        return rowSpanData.count || 1;
    },

    /**
     * Returns the vertical position of the given row
     * @param {Number} rowKey - row key
     * @param {Number} rowSpanCount - the count of rowspan
     * @returns {{top: Number, bottom: Number}}
     * @private
     */
    _getCellVerticalPosition: function(rowKey, rowSpanCount) {
        var firstIdx, lastIdx, top, bottom;
        var coordRowModel = this.coordRowModel;

        firstIdx = this.dataModel.indexOfRowKey(rowKey);
        lastIdx = firstIdx + rowSpanCount - 1;
        top = coordRowModel.getOffsetAt(firstIdx);
        bottom = coordRowModel.getOffsetAt(lastIdx) +
            coordRowModel.getHeightAt(lastIdx) + CELL_BORDER_WIDTH;

        return {
            top: top,
            bottom: bottom
        };
    },

    /**
     * Returns the horizontal position of the given column
     * @param {String} columnName - column name
     * @returns {{left: Number, right: Number}}
     * @private
     */
    _getCellHorizontalPosition: function(columnName) {
        var columnModel = this.columnModel;
        var metaColumnCount = columnModel.getVisibleMetaColumnCount();
        var widths = this.coordColumnModel.get('widths');
        var leftColumnCount = columnModel.getVisibleFrozenCount() + metaColumnCount;
        var targetIdx = columnModel.indexOfColumnName(columnName, true) + metaColumnCount;
        var idx = leftColumnCount > targetIdx ? 0 : leftColumnCount;
        var left = 0;

        for (; idx < targetIdx; idx += 1) {
            left += widths[idx] + CELL_BORDER_WIDTH;
        }

        return {
            left: left,
            right: left + widths[targetIdx] + CELL_BORDER_WIDTH
        };
    },

    /**
     * Returns the bounds of the cell identified by given address
     * @param {Number|String} rowKey - row key
     * @param {String} columnName - column name
     * @returns {{top: number, left: number, right: number, bottom: number}}
     * @todo TC
     */
    getCellPosition: function(rowKey, columnName) {
        var rowSpanCount, vPos, hPos;

        rowKey = this.dataModel.getMainRowKey(rowKey, columnName);

        if (!this.dataModel.get(rowKey)) {
            return {};
        }

        rowSpanCount = this._getRowSpanCount(rowKey, columnName);
        vPos = this._getCellVerticalPosition(rowKey, rowSpanCount);
        hPos = this._getCellHorizontalPosition(columnName);

        return {
            top: vPos.top,
            bottom: vPos.bottom,
            left: hPos.left,
            right: hPos.right
        };
    },

    /**
     * Judge scroll direction.
     * @param {{top: number, bottom: number, left: number, right: number}} targetPosition - Position of target element
     * @param {boolean} isRsideColumn - Whether the target cell is in rside
     * @param {{height: number, rsideWidth: number}} bodySize - Using cached bodySize
     * @returns {{isUp: boolean, isDown: boolean, isLeft: boolean, isRight: boolean}} Direction
     * @private
     */
    _judgeScrollDirection: function(targetPosition, isRsideColumn, bodySize) {
        var renderModel = this.renderModel;
        var currentTop = renderModel.get('scrollTop');
        var currentLeft = renderModel.get('scrollLeft');
        var isUp, isDown, isLeft, isRight;

        isUp = targetPosition.top < currentTop;
        isDown = !isUp && (targetPosition.bottom > (currentTop + bodySize.height));
        if (isRsideColumn) {
            isLeft = targetPosition.left < currentLeft;
            isRight = !isLeft && (targetPosition.right > (currentLeft + bodySize.rsideWidth - 1));
        } else {
            isLeft = isRight = false;
        }

        return {
            isUp: isUp,
            isDown: isDown,
            isLeft: isLeft,
            isRight: isRight
        };
    },

    /**
     * Scroll to focus
     * @param {number} rowKey - row key
     * @param {string} columnName - column name
     * @param {boolean} shouldScroll - whether scroll to the target cell
     * @private
     */
    _onFocus: function(rowKey, columnName, shouldScroll) {
        var scrollPosition;

        if (!shouldScroll) {
            return;
        }
        scrollPosition = this.getScrollPosition(rowKey, columnName);

        if (!snippet.isEmpty(scrollPosition)) {
            this.renderModel.set(scrollPosition);
        }
    },

    /**
     * Make scroll position
     * @param {{isUp: boolean, isDown: boolean, isLeft: boolean, isRight: boolean}} scrollDirection - Direction
     * @param {{top: number, bottom: number, left: number, right: number}} targetPosition - Position of target element
     * @param {{height: number, rsideWidth: number}} bodySize - Using cached bodySize
     * @returns {{scrollLeft: ?Number, scrollTop: ?Number}} Position to scroll
     * @private
     */
    _makeScrollPosition: function(scrollDirection, targetPosition, bodySize) {
        var pos = {};

        if (scrollDirection.isUp) {
            pos.scrollTop = targetPosition.top;
        } else if (scrollDirection.isDown) {
            pos.scrollTop = targetPosition.bottom - bodySize.height;
        }

        if (scrollDirection.isLeft) {
            pos.scrollLeft = targetPosition.left;
        } else if (scrollDirection.isRight) {
            pos.scrollLeft = targetPosition.right - bodySize.rsideWidth + TABLE_BORDER_WIDTH;
        }

        return pos;
    },

    /**
     * Return scroll position from the received index
     * @param {Number|String} rowKey - Row-key of target cell
     * @param {String} columnName - Column name of target cell
     * @returns {{scrollLeft: ?Number, scrollTop: ?Number}} Position to scroll
     */
    getScrollPosition: function(rowKey, columnName) {
        var isRsideColumn = !this.columnModel.isLside(columnName);
        var targetPosition = this.getCellPosition(rowKey, columnName);
        var bodySize = this.dimensionModel.getBodySize();
        var scrollDirection = this._judgeScrollDirection(targetPosition, isRsideColumn, bodySize);

        return this._makeScrollPosition(scrollDirection, targetPosition, bodySize);
    }
});

module.exports = CoordConverter;
