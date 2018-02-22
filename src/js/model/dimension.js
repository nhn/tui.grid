/**
 * @fileoverview module:model/dimension
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');

var Model = require('../base/model');
var constMap = require('../common/constMap');
var dimensionConstMap = constMap.dimension;
var summaryPositionConst = constMap.summaryPosition;

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
var Dimension = Model.extend(/** @lends module:model/dimension.prototype */{
    initialize: function(attrs, options) {
        Model.prototype.initialize.apply(this, arguments);

        this.columnModel = options.columnModel;
        this.dataModel = options.dataModel;
        this.domState = options.domState;

        this.on('change:fixedHeight', this._resetSyncHeightHandler);
        this.on('change:bodyHeight', this._onChangeBodyHeight);

        if (options.domEventBus) {
            this.listenTo(options.domEventBus, 'windowResize', this._onResizeWindow);
            this.listenTo(options.domEventBus, 'dragmove:resizeHeight',
                _.debounce(_.bind(this._onDragMoveForHeight, this)));
        }

        this._resetSyncHeightHandler();
    },

    defaults: {
        offsetLeft: 0,
        offsetTop: 0,

        width: 0,

        headerHeight: 0,
        bodyHeight: 0,

        summaryHeight: 0,
        summaryPosition: null,

        resizeHandleHeight: 0,
        paginationHeight: 0,

        rowHeight: 0,
        totalRowHeight: 0,
        fixedRowHeight: true,

        rsideWidth: 0,
        lsideWidth: 0,

        minimumColumnWidth: 0,
        scrollBarSize: 17,
        scrollX: true,
        scrollY: true,
        fitToParentHeight: false,
        fixedHeight: false,

        minRowHeight: 0,
        minBodyHeight: 0,

        frozenBorderWidth: null
    },

    /**
     * Event handler for 'windowResize' event on domEventBus
     * @private
     */
    _onResizeWindow: function() {
        this.refreshLayout();
    },

    /**
     * Event handler for 'dragmmove:resizeHgith' event on domEventBus
     * @param {module:event/gridEvent} ev - GridEvent
     * @private
     */
    _onDragMoveForHeight: function(ev) {
        var height = ev.pageY - this.get('offsetTop') - ev.startData.mouseOffsetY;

        this.setHeight(height);
    },

    /**
     * Event handler for changing 'bodyHeight' value
     * @param {object} model - dimension model
     * @private
     */
    _onChangeBodyHeight: function(model) {
        var changed = model.changed;
        var changedTotalRowHeight = changed.totalRowHeight;
        var changedBodyHeight = changed.bodyHeight;

        if (!changedTotalRowHeight && changedBodyHeight) {
            this.set('fixedHeight', (changedBodyHeight !== 'auto'));
        }
    },

    /**
     * Attach/Detach event handler of change:totalRowHeight event based on the fixedHeight.
     * @private
     */
    _resetSyncHeightHandler: function() {
        if (this.get('fixedHeight')) {
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
        var realBodyHeight = this.get('totalRowHeight') + this.getScrollXHeight();
        var minBodyHeight = this.get('minBodyHeight');
        var bodyHeight = Math.max(minBodyHeight, realBodyHeight);

        this.set('bodyHeight', bodyHeight);
    },

    /**
     * Returns whether division border (between meta column and data column) is doubled or not.
     * Division border should be doubled only if visible fixed data column exists.
     * @returns {Boolean}
     */
    isDivisionBorderDoubled: function() {
        return this.columnModel.getVisibleFrozenCount() > 0;
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

        if (this.hasFrozenBorder()) {
            availableTotalWidth -= this.get('frozenBorderWidth');
        }

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
        var extraHeight = this.get('headerHeight') + this.get('summaryHeight') + TABLE_BORDER_WIDTH;

        return height - extraHeight;
    },

    /**
     * Returns the minimum height of table body.
     * @returns {number} The minimum height of table body
     * @private
     */
    _getMinBodyHeight: function() {
        return this.get('minBodyHeight') + (CELL_BORDER_WIDTH * 2) + this.getScrollXHeight();
    },

    /**
     * 열 고정 영역의 minimum width 값을 구한다.
     * @returns {number} 열고정 영역의 최소 너비값.
     * @private
     */
    _getMinLeftSideWidth: function() {
        var minimumColumnWidth = this.get('minimumColumnWidth');
        var columnFrozenCount = this.columnModel.getVisibleFrozenCount(true);
        var minWidth = 0;
        var borderWidth;

        if (columnFrozenCount) {
            borderWidth = (columnFrozenCount + 1) * CELL_BORDER_WIDTH;
            minWidth = borderWidth + (minimumColumnWidth * columnFrozenCount);
        }

        return minWidth;
    },

    /**
     * 열 고정 영역의 maximum width 값을 구한다.
     * @returns {number} 열고정 영역의 최대 너비값.
     * @private
     */
    getMaxLeftSideWidth: function() {
        var maxWidth = Math.ceil(this.get('width') * 0.9); // eslint-disable-line no-magic-number

        if (maxWidth) {
            maxWidth = Math.max(maxWidth, this._getMinLeftSideWidth());
        }

        return maxWidth;
    },

    /**
     * Set the width of the dimension.
     * @param {number} width - Width
     */
    setWidth: function(width) {
        if (width > 0) {
            this.set('width', width);
            this.trigger('setWidth', width);
        }
    },

    /**
     * Sets the height of the dimension.
     * (Resets the bodyHeight relative to the dimension height)
     * @param  {number} height - The height of the dimension
     * @private
     */
    setHeight: function(height) {
        if (height > 0) {
            this.set('bodyHeight', Math.max(this._calcRealBodyHeight(height), this._getMinBodyHeight()));
        }
    },

    /**
     * Returns the height of the dimension.
     * @returns {Number} Height
     */
    getHeight: function() {
        return this.get('bodyHeight') + this.get('headerHeight');
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
            this.setHeight(domState.getParentHeight());
        }
    },

    /**
     * Returns the offset.top of body
     * @returns    {number}
     */
    getBodyOffsetTop: function() {
        var offsetTop = this.domState.getOffset().top;
        var summaryHeight = this.get('summaryPosition') === summaryPositionConst.TOP ? this.get('summaryHeight') : 0;

        return offsetTop + this.get('headerHeight') + summaryHeight
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
        var bodyOffsetX = this.domState.getOffset().left;
        var bodyOffsetY = this.getBodyOffsetTop();

        return {
            x: pageX - bodyOffsetX,
            y: pageY - bodyOffsetY
        };
    },

    /**
     * Whether the frozen border width is set or not
     * @returns {boolean} State of the frozen border width
     */
    hasFrozenBorder: function() {
        return _.isNumber(this.get('frozenBorderWidth'));
    }
});

module.exports = Dimension;
