/**
 * @fileoverview Render model to be used for smart-rendering
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');

var Renderer = require('./renderer');
var dimensionConst = require('../common/constMap').dimension;

var CELL_BORDER_WIDTH = dimensionConst.CELL_BORDER_WIDTH;

// The ratio of buffer size to bodyHeight
var BUFFER_RATIO = 0.3;

// The ratio of the size bodyHeight which can cause to refresh the rendering range
var BUFFER_HIT_RATIO = 0.1;

/**
 * Render model to be used for smart-rendering
 * @module model/renderer-smart
 * @extends module:model/renderer
 * @ignore
 */
var SmartRenderer = Renderer.extend(/** @lends module:model/renderer-smart.prototype */{
    initialize: function() {
        Renderer.prototype.initialize.apply(this, arguments);

        this.on('change:scrollTop', this._onChangeScrollTop, this);
        this.listenTo(this.dimensionModel, 'change:bodyHeight', this._onChangeBodyHeight);
    },

    /**
     * Event handler for change:scrollTop event
     * @private
     */
    _onChangeScrollTop: function() {
        if (this._shouldRefresh(this.get('scrollTop'))) {
            this._setRenderingRange();
        }
    },

    /**
     * Event handler for change:bodyHeight event on model/dimension
     * @private
     */
    _onChangeBodyHeight: function() {
        this._setRenderingRange();
    },

    /**
     * Calculate the range to render and set the attributes.
     * @param {boolean} silent - whether set attributes silently
     * @private
     */
    _setRenderingRange: function(silent) {
        var scrollTop = this.get('scrollTop');
        var dimensionModel = this.dimensionModel;
        var dataModel = this.dataModel;
        var coordRowModel = this.coordRowModel;
        var bodyHeight = dimensionModel.get('bodyHeight');
        var bufferSize = parseInt(bodyHeight * BUFFER_RATIO, 10);
        var startIndex = Math.max(coordRowModel.indexOf(scrollTop - bufferSize), 0);
        var endIndex = Math.min(coordRowModel.indexOf(scrollTop + bodyHeight + bufferSize), dataModel.length - 1);
        var top, bottom;

        if (dataModel.isRowSpanEnable()) {
            startIndex += this._getStartRowSpanMinCount(startIndex);
            endIndex += this._getEndRowSpanMaxCount(endIndex);
        }

        top = coordRowModel.getOffsetAt(startIndex);
        bottom = coordRowModel.getOffsetAt(endIndex) +
            coordRowModel.getHeightAt(endIndex) + CELL_BORDER_WIDTH;

        this.set({
            top: top,
            bottom: bottom,
            startIndex: startIndex,
            endIndex: endIndex
        }, {
            silent: silent
        });
    },

    /**
     * 렌더링을 시작하는 행에 rowSpan 정보가 있으면, count 값이 가장 작은 행의 값을 반환한다.
     * @param {number} startIndex 시작하는 행의 Index
     * @returns {number} rowSpan의 count 값 (0 이하)
     * @private
     */
    _getStartRowSpanMinCount: function(startIndex) {
        var firstRow = this.dataModel.at(startIndex);
        var result = 0;
        var counts;

        if (firstRow) {
            counts = _.pluck(firstRow.getRowSpanData(), 'count');
            counts.push(0); // count가 음수인 경우(mainRow가 아닌 경우)에만 최소값을 구함. 없으면 0
            result = _.min(counts);
        }

        return result;
    },

    /**
     * 렌더링할 마지막 행에 rowSpan 정보가 있으면, count 값이 가장 큰 행의 값을 반환한다.
     * @param {number} endIndex 마지막 행의 Index
     * @returns {number} rowSpan의 count 값 (0 이상)
     * @private
     */
    _getEndRowSpanMaxCount: function(endIndex) {
        var lastRow = this.dataModel.at(endIndex);
        var result = 0;
        var counts;

        if (lastRow) {
            counts = _.pluck(lastRow.getRowSpanData(), 'count');
            counts.push(0); // count가 양수인 경우(mainRow인 경우)에만 최대값을 구함. 없으면 0
            result = _.max(counts);
        }

        // subtract 1, as the count includes main-cell itself
        if (result > 0) {
            result -= 1;
        }

        return result;
    },

    /**
     * Returns whether the scroll potision hits the buffer limit or not.
     * @param {number} scrollTop - scroll top
     * @returns {boolean}
     * @private
     */
    _shouldRefresh: function(scrollTop) {
        var bodyHeight = this.dimensionModel.get('bodyHeight');
        var scrollBottom = scrollTop + bodyHeight;
        var totalRowHeight = this.dimensionModel.get('totalRowHeight');
        var top = this.get('top');
        var bottom = this.get('bottom');
        var bufferHitSize = parseInt(bodyHeight * BUFFER_HIT_RATIO, 10);
        var hitTopBuffer = (scrollTop - top) < bufferHitSize;
        var hitBottomBuffer = (bottom - scrollBottom) < bufferHitSize;

        return (hitTopBuffer && top > 0) || (hitBottomBuffer && bottom < totalRowHeight);
    }
});

// exports consts for external use
SmartRenderer.BUFFER_RATIO = BUFFER_RATIO;
SmartRenderer.BUFFER_HIT_RATIO = BUFFER_HIT_RATIO;

module.exports = SmartRenderer;
