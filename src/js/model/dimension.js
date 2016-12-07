/**
 * @fileoverview 크기에 관련된 데이터를 다루는 모델
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');
var dimensionConstMap = require('../common/constMap').dimension;

var TABLE_BORDER_WIDTH = dimensionConstMap.TABLE_BORDER_WIDTH;
var CELL_BORDER_WIDTH = dimensionConstMap.CELL_BORDER_WIDTH;

/**
 * 크기 관련 데이터 저장
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
     * Returns the horizontal position of the given column
     * @param {String} columnName - column name
     * @returns {{left: Number, right: Number}}
     * @private
     */
    _getCellHorizontalPosition: function(columnName) {
        var columnModel = this.columnModel;
        var metaColumnCount = columnModel.getVisibleMetaColumnCount();
        var columnWidthList = this.coordColumnModel.get('columnWidthList');
        var leftColumnCount = columnModel.getVisibleColumnFixCount() + metaColumnCount;
        var targetIdx = columnModel.indexOfColumnName(columnName, true) + metaColumnCount;
        var idx = leftColumnCount > targetIdx ? 0 : leftColumnCount;
        var left = 0;

        for (; idx < targetIdx; idx += 1) {
            left += columnWidthList[idx] + CELL_BORDER_WIDTH;
        }

        return {
            left: left,
            right: left + columnWidthList[targetIdx] + CELL_BORDER_WIDTH
        };
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
     * 계산한 cell 의 위치를 리턴한다.
     * @param {Number|String} rowKey - 데이터의 키값
     * @param {String} columnName - 칼럼명
     * @returns {{top: number, left: number, right: number, bottom: number}} - cell의 위치
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
     * Return scroll position from the received index
     * @param {Number|String} rowKey - Row-key of target cell
     * @param {String} columnName - Column name of target cell
     * @returns {{scrollLeft: ?Number, scrollTop: ?Number}} Position to scroll
     */
    getScrollPosition: function(rowKey, columnName) {
        var isRsideColumn = !this.columnModel.isLside(columnName);
        var targetPosition = this.getCellPosition(rowKey, columnName);
        var bodySize = this._getBodySize();
        var scrollDirection = this._judgeScrollDirection(targetPosition, isRsideColumn, bodySize);

        return this._makeScrollPosition(scrollDirection, targetPosition, bodySize);
    },

    /**
     * Calc body size of grid except scrollBar
     * @returns {{height: number, totalWidth: number, rsideWidth: number}} Body size
     * @private
     */
    _getBodySize: function() {
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
     * Calc and get overflow values from container position
     * @param {Number} pageX - Mouse X-position based on page
     * @param {Number} pageY - Mouse Y-position based on page
     * @returns {{x: number, y: number}} Mouse-overflow
     */
    getOverflowFromMousePosition: function(pageX, pageY) {
        var containerPos = this.getPositionFromBodyArea(pageX, pageY);
        var bodySize = this._getBodySize();

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
     * 마우스 위치 정보에 해당하는 grid container 기준 pageX 와 pageY 를 반환한다.
     * @param {Number} pageX    마우스 x 좌표
     * @param {Number} pageY    마우스 y 좌표
     * @returns {{x: number, y: number}} 그리드 container 기준의 x, y 값
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
