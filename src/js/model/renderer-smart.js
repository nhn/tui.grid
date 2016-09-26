/**
 * @fileoverview 스마트 랜더링을 지원하는 Renderer 모ㄷ델
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');

var Renderer = require('./renderer');
var util = require('../common/util');

/**
 *  View 에서 Rendering 시 사용할 객체
 *  Smart Rendering 을 지원한다.
 *  @module model/renderer-smart
 * @extends module:model/renderer
 */
var SmartRenderer = Renderer.extend(/**@lends module:model/renderer-smart.prototype */{
    /**
     * @constructs
     */
    initialize: function() {
        Renderer.prototype.initialize.apply(this, arguments);
        this.on('change:scrollTop', this._onChange, this);
        this.listenTo(this.dimensionModel, 'change:bodyHeight', this._onChange, this);

        this.setOwnProperties({
            hiddenRowCount: 10,
            criticalPoint: 3
        });
    },
    /**
     * bodyHeight 가 변경 되었을때 이벤트 핸들러
     * @private
     */
    _onChange: function() {
        if (this._isRenderable(this.get('scrollTop'))) {
            this.refresh();
        }
    },

    /**
     * SmartRendering 을 사용하여 rendering 할 index 범위를 결정한다.
     * @param {Number} scrollTop    랜더링 범위를 결정하기 위한 현재 scrollTop 위치 값
     * @private
     */
    _setRenderingRange: function(scrollTop) {
        var dimensionModel = this.dimensionModel,
            dataModel = this.dataModel,
            rowHeight = dimensionModel.get('rowHeight'),
            displayRowCount = dimensionModel.get('displayRowCount'),
            startIndex = Math.max(0, Math.ceil(scrollTop / (rowHeight + 1)) - this.hiddenRowCount),
            endIndex = Math.min(dataModel.length - 1, startIndex + displayRowCount + (this.hiddenRowCount * 2)),
            top;

        if (dataModel.isRowSpanEnable()) {
            startIndex += this._getStartRowSpanMinCount(startIndex);
            endIndex += this._getEndRowSpanMaxCount(endIndex);
        }
        top = (startIndex === 0) ? 0 : util.getHeight(startIndex, rowHeight);

        this.set({
            top: top,
            startIndex: startIndex,
            endIndex: endIndex
        });
    },

    /**
     * 렌더링을 시작하는 행에 rowSpan 정보가 있으면, count 값이 가장 작은 행의 값을 반환한다.
     * @param {number} startIndex 시작하는 행의 Index
     * @returns {number} rowSpan의 count 값 (0 이하)
     * @private
     */
    _getStartRowSpanMinCount: function(startIndex) {
        var firstRow = this.dataModel.at(startIndex),
            result = 0,
            counts;

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
        var lastRow = this.dataModel.at(endIndex),
            result = 0,
            counts;

        if (lastRow) {
            counts = _.pluck(lastRow.getRowSpanData(), 'count');
            counts.push(0); // count가 양수인 경우(mainRow인 경우)에만 최대값을 구함. 없으면 0
            result = _.max(counts);
        }
        return result;
    },
    /**
     * scrollTop 값 에 따라 rendering 해야하는지 판단한다.
     * @param {Number} scrollTop 랜더링 범위를 결정하기 위한 현재 scrollTop 위치 값
     * @returns {boolean}    랜더링 해야할지 여부
     * @private
     */
    _isRenderable: function(scrollTop) {
        var dimensionModel = this.dimensionModel,
            dataModel = this.dataModel,
            rowHeight = dimensionModel.get('rowHeight'),
            bodyHeight = dimensionModel.get('bodyHeight'),
            rowCount = dataModel.length,
            displayStartIdx = Math.max(0, Math.ceil(scrollTop / (rowHeight + 1))),
            displayEndIdx = Math.min(dataModel.length - 1, Math.floor((scrollTop + bodyHeight) / (rowHeight + 1))),
            startIndex = this.get('startIndex'),
            endIndex = this.get('endIndex');

        //시작 지점이 임계점 이하로 올라갈 경우 return true
        if (startIndex !== 0) {
            if (startIndex + this.criticalPoint > displayStartIdx) {
                return true;
            }
        }
        //마지막 지점이 임계점 이하로 내려갔을 경우 return true
        if (endIndex !== rowCount - 1) {
            if (endIndex - this.criticalPoint < displayEndIdx) {
                return true;
            }
        }
        return false;
    }
});

module.exports = SmartRenderer;
