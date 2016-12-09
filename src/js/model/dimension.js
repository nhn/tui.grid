/**
 * @fileoverview module:model/dimension
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');
var dimensionConstMap = require('../common/constMap').dimension;

var TABLE_BORDER_WIDTH = dimensionConstMap.TABLE_BORDER_WIDTH;
var CELL_BORDER_WIDTH = dimensionConstMap.CELL_BORDER_WIDTH;

/**
 * Manage values about dimension (layout)
 * @module model/dimension
 * @param {Object} attrs - Attributes
 * @param {Object} options - Options
 * @extends module:base/model
 * @ignore
 */
var Dimension = Model.extend(/**@lends module:model/dimension.prototype */{
    initialize: function(attrs, options) {
        Model.prototype.initialize.apply(this, arguments);

        this.columnModel = options.columnModel;
        this.dataModel = options.dataModel;
        this.domState = options.domState;

        this.on('change:isFixedHeight', this._resetSyncHeightHandler);

        this._resetSyncHeightHandler();
    },

    defaults: {
        offsetLeft: 0,
        offsetTop: 0,

        width: 0,

        headerHeight: 0,
        bodyHeight: 0,
        footerHeight: 0,

        toolbarHeight: 0,
        resizeHandleHeight: 0,
        paginationHeight: 0,

        rowHeight: 0,
        totalRowHeight: 0,
        isFixedRowHeight: true,

        rsideWidth: 0,
        lsideWidth: 0,

        minimumColumnWidth: 0,
        scrollBarSize: 17,
        scrollX: true,
        scrollY: true,
        fitToParentHeight: false,
        isFixedHeight: false
    },

    /**
     * Attach/Detach event handler of change:totalRowHeight event based on the isFixedHeight.
     * @private
     */
    _resetSyncHeightHandler: function() {
        if (this.get('isFixedHeight')) {
            this.off('change:totalRowHeight');
        } else {
            this.on('change:totalRowHeight', this._syncBodyHeightWithTotalRowHeight);
        }
    },

    /**
     * Sets the bodyHeight value based on the totalRowHeight value.
     * @private
     */
    _syncBodyHeightWithTotalRowHeight: function() {
        var currBodyHeight = this.get('bodyHeight');
        var realBodyHeight = this.get('totalRowHeight') + this.getScrollXHeight();

        this.set('bodyHeight', Math.max(currBodyHeight, realBodyHeight));
    },


    /**
     * Returns whether division border (between meta column and data column) is doubled or not.
     * Division border should be doubled only if visible fixed data column exists.
     * @returns {Boolean}
     */
    isDivisionBorderDoubled: function() {
        return this.columnModel.getVisibleColumnFixCount() > 0;
    },

    /**
     * 전체 넓이에서 스크롤바, border등의 넓이를 제외하고 실제 셀의 넓이에 사용되는 값만 반환한다.
     * @param {number} columnLength - 컬럼의 개수
     * @returns {number} 사용가능한 전체 셀의 넓이
     * @private
     */
    getAvailableTotalWidth: function(columnLength) {
        var totalWidth = this.get('width');
        var borderCount = columnLength + 1 + (this.isDivisionBorderDoubled() ? 1 : 0);
        var totalBorderWidth = borderCount * CELL_BORDER_WIDTH;
        var availableTotalWidth = totalWidth - this.getScrollYWidth() - totalBorderWidth;

        return availableTotalWidth;
    },

    /**
     * Calc body size of grid except scrollBar
     * @returns {{height: number, totalWidth: number, rsideWidth: number}} Body size
     */
    getBodySize: function() {
        var lsideWidth = this.get('lsideWidth'),
            rsideWidth = this.get('rsideWidth') - this.getScrollYWidth(),
            height = this.get('bodyHeight') - this.getScrollXHeight();

        return {
            height: height,
            rsideWidth: rsideWidth,
            totalWidth: lsideWidth + rsideWidth
        };
    },

    /**
     * Calc and get overflow values from container position
     * @param {Number} pageX - Mouse X-position based on page
     * @param {Number} pageY - Mouse Y-position based on page
     * @returns {{x: number, y: number}} Mouse-overflow
     */
    getOverflowFromMousePosition: function(pageX, pageY) {
        var containerPos = this.getPositionFromBodyArea(pageX, pageY);
        var bodySize = this.getBodySize();

        return this._judgeOverflow(containerPos, bodySize);
    },

    /**
     * Judge overflow
     * @param {{x: number, y: number}} containerPosition - Position values based on container
     * @param {{height: number, totalWidth: number, rsideWidth: number}} bodySize - Real body size
     * @returns {{x: number, y: number}} Overflow values
     * @private
     */
    _judgeOverflow: function(containerPosition, bodySize) {
        var containerX = containerPosition.x;
        var containerY = containerPosition.y;
        var overflowY = 0;
        var overflowX = 0;

        if (containerY < 0) {
            overflowY = -1;
        } else if (containerY > bodySize.height) {
            overflowY = 1;
        }

        if (containerX < 0) {
            overflowX = -1;
        } else if (containerX > bodySize.totalWidth) {
            overflowX = 1;
        }

        return {
            x: overflowX,
            y: overflowY
        };
    },

    /**
     * Return height of X-scrollBar.
     * If no X-scrollBar, return 0
     * @returns {number} Height of X-scrollBar
     */
    getScrollXHeight: function() {
        return (this.get('scrollX') ? this.get('scrollBarSize') : 0);
    },

    /**
     * Return width of Y-scrollBar.
     * If no Y-scrollBar, return 0
     * @returns {number} Width of Y-scrollBar
     */
    getScrollYWidth: function() {
        return (this.get('scrollY') ? this.get('scrollBarSize') : 0);
    },

    /**
     * Returns the height of table body.
     * @param  {number} height - The height of the dimension
     * @returns {number} The height of the table body
     * @private
     */
    _calcRealBodyHeight: function(height) {
        var extraHeight = this.get('headerHeight') + this.get('footerHeight') +
            this.get('toolbarHeight') + TABLE_BORDER_WIDTH;

        return height - extraHeight;
    },

    /**
     * Returns the minimum height of table body.
     * @returns {number} The minimum height of table body
     * @private
     */
    _getMinBodyHeight: function() {
        return this.get('rowHeight') + (CELL_BORDER_WIDTH * 2) + this.getScrollXHeight();
    },

    /**
     * Sets the height of the dimension.
     * (Resets the bodyHeight relative to the dimension height)
     * @param  {number} height - The height of the dimension
     * @private
     */
    _setHeight: function(height) {
        this.set('bodyHeight', Math.max(this._calcRealBodyHeight(height), this._getMinBodyHeight()));
    },

    /**
     * Sets the width and height of the dimension.
     * @param {(Number|Null)} width - Width
     * @param {(Number|Null)} height - Height
     */
    setSize: function(width, height) {
        if (width > 0) {
            this.set('width', width);
            this.trigger('setWidth', width);
        }
        if (height > 0) {
            this._setHeight(height);
        }
    },

    /**
     * Returns the height of the dimension.
     * @returns {Number} Height
     */
    getHeight: function() {
        return this.get('bodyHeight') + this.get('headerHeight') + this.get('toolbarHeight');
    },

    /**
     * layout 에 필요한 크기 및 위치 데이터를 갱신한다.
     */
    refreshLayout: function() {
        var domState = this.domState;
        var offset = domState.getOffset();

        this.set({
            offsetTop: offset.top,
            offsetLeft: offset.left,
            width: domState.getWidth()
        });

        if (this.get('fitToParentHeight')) {
            this._setHeight(domState.getParentHeight());
        }
    },

    /**
     * Set bodyHeight value based on the count of row.
     * (This method is temporary and required only until the displayRowCount option is removed)
     * @param {number} rowCount - row count
     */
    setBodyHeightWithRowCount: function(rowCount) {
        var rowHeight = this.get('rowHeight');
        var scrollXHeight = this.getScrollXHeight();

        this.set({
            isFixedHeight: true,
            bodyHeight: (rowHeight + CELL_BORDER_WIDTH) * rowCount + scrollXHeight
        });
    },

    /**
     * Returns the offset.top of body
     * @returns {number}
     */
    getBodyOffsetTop: function() {
        return this.get('offsetTop') + this.get('headerHeight') + this.get('toolbarHeight')
            + CELL_BORDER_WIDTH + TABLE_BORDER_WIDTH;
    },

    /**
     * Returns the position relative to the body-area.
     * @param {Number} pageX - x-pos relative to document
     * @param {Number} pageY - y-pos relative to document
     * @returns {{x: number, y: number}}
     * @private
     */
    getPositionFromBodyArea: function(pageX, pageY) {
        var bodyOffsetX = this.get('offsetLeft');
        var bodyOffsetY = this.getBodyOffsetTop();

        return {
            x: pageX - bodyOffsetX,
            y: pageY - bodyOffsetY
        };
    }
});

module.exports = Dimension;
