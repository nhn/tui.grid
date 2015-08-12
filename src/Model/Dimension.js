/**
 * @fileoverview 크기에 관련된 데이터를 다루는 모델
 * @author NHN Ent. FE Development Team
 */
(function() {
'use strict';

var BORDER_WIDTH = 1;

/**
 * 크기 관련 데이터 저장
 * @constructor Model.Dimension
 */
Model.Dimension = Model.Base.extend(/**@lends Model.Dimension.prototype */{
    models: null,
    columnModel: null,
    defaults: {
        offsetLeft: 0,
        offsetTop: 0,

        width: 0,

        headerHeight: 0,
        bodyHeight: 0,
        toolbarHeight: 0,

        rowHeight: 0,

        rsideWidth: 0,
        lsideWidth: 0,
        columnWidthList: [],

        minimumColumnWidth: 0,
        displayRowCount: 1,
        scrollBarSize: 17,
        scrollX: true,
        scrollY: true
    },

    /**
     * 생성자 함수
     */
    initialize: function() {
        Model.Base.prototype.initialize.apply(this, arguments);
        this.columnModel = this.grid.columnModel;
        this.listenTo(this.columnModel, 'columnModelChange', this._initColumnWidthVariables);
        this.on('change:width', this._onWidthChange, this);
        this.on('change:displayRowCount', this._setBodyHeight, this);

        this._columnWidthFixedFlags = null;
        this._minColumnWidthList = null;

        this._initColumnWidthVariables();
        this._setBodyHeight();
    },

    /**
     * 전체 넓이에서 스크롤바, border등의 넓이를 제외하고 실제 셀의 넓이에 사용되는 값만 반환한다.
     * @param {number} columnLength - 컬럼의 개수
     * @return {number} 사용가능한 전체 셀의 넓이
     * @private
     */
    _getAvailableTotalWidth: function(columnLength) {
        var totalWidth = this.get('width'),
            availableTotalWidth = totalWidth - columnLength - 1;

        if (this.get('scrollY')) {
            availableTotalWidth -= this.get('scrollBarSize');
        }
        if (this.columnModel.get('columnFixIndex') > 0) {
            availableTotalWidth -= BORDER_WIDTH;
        }
        return availableTotalWidth;
    },

    /**
     * 주어진 컬럼 넓이값 배열에서 minimumColumnWidth 값보다 작은 값이 없도록 수정해준다.
     * @param {number[]} columnWidthList - 컬럼 넓이값 배열
     * @return {number[]} - 수정된 새로운 넓이값 배열
     * @private
     */
    _applyMinimumColumnWidth: function(columnWidthList) {
        var minWidthList = this._minColumnWidthList,
            appliedList = _.clone(columnWidthList);

        _.each(appliedList, function(width, index) {
            var minWidth = minWidthList[index];
            if (width < minWidth) {
                appliedList[index] = minWidth;
            }
        });
        return appliedList;
    },

    /**
     * 컬럼 넓이값의 배열에서, 넓이가 지정되지 않은 컬럼들의 값을 균등하게 채워준다.
     * @param {number[]} columnWidthList - 컬럼 넓이값 배열
     * @return {number[]} - 값이 모두 채워진 새로운 배열
     * @private
     */
    _fillColumnWidthList: function(columnWidthList) {
        var columnLength = columnWidthList.length,
            totalWidth = this._getAvailableTotalWidth(columnLength),
            filledList = Array(columnLength),
            remainTotalWidth = totalWidth,
            remainIndexes = [],
            remainAvgWidth;

        _.each(columnWidthList, function(width, index) {
            if (width > 0) {
                filledList[index] = width;
                remainTotalWidth -= width;
            } else {
                remainIndexes.push(index);
            }
        });
        if (!remainIndexes.length) {
            return filledList;
        }

        remainAvgWidth = Math.round(remainTotalWidth / remainIndexes.length);
        _.each(remainIndexes, function(remainIndex, index) {
            if (index === remainIndexes.length - 1) {
                filledList[remainIndex] = remainTotalWidth;
            } else {
                filledList[remainIndex] = remainAvgWidth;
                remainTotalWidth -= remainAvgWidth;
            }
        });
        return filledList;
    },

    /**
     * 컬럼 넓이값의 배열에서, fixed가 아닌 컬럼의 넓이에 추가적인 넓이값을 균등하게 더해준다.
     * @param {number[]} columnWidthList - 컬럼 넓이값 배열
     * @param {number} extraTotalWidth - 추가될 전체 넓이
     * @param {number} varColumnCount - 넓이가 가변적인(fixed가 아닌) 컬럼의 개수
     * @return {number[]} - 수정된 새로운 넓이값 배열
     * @private
     */
    _addExtraColumnWidth: function(columnWidthList, extraTotalWidth, varColumnCount) {
        var extraWidthAvg = Math.round(extraTotalWidth / varColumnCount),
            fixedFlags = this._columnWidthFixedFlags,
            addedList = _.clone(columnWidthList),
            extraAddedCount = 0,
            extraWidth;

        _.each(addedList, function(width, index) {
            if (!fixedFlags[index]) {
                if (extraAddedCount === varColumnCount - 1) {
                    extraWidth = extraTotalWidth;
                } else {
                    extraWidth = extraWidthAvg;
                }
                addedList[index] += extraWidth;
                extraTotalWidth -= extraWidth;
                extraAddedCount += 1;
            }
        });
        return addedList;
    },

    /**
     * 컬럼 넓이값의 배열을 받아, 전체 넓이에 맞게 각 넓이값을 재조정하여 새로운 배열로 반환한다.
     * @param {number[]} columnWidthList - 컬럼 넓이값 배열
     * @return {number[]} 수정된 새로운 넓이값 배열
     * @private
     */
    _adjustColumnWidthList: function(columnWidthList, fitToReducedTotal) {
        var columnLength = columnWidthList.length,
            totalWidth = this._getAvailableTotalWidth(columnLength),
            extraTotalWidth = totalWidth - Util.sum(columnWidthList),
            varColumnCount, // 가변적인(fixed가 아닌) 컬럼의 수
            adjustedList;

        if (extraTotalWidth > 0 || (fitToReducedTotal && extraTotalWidth < 0)) {
            varColumnCount = columnLength - _.filter(this._columnWidthFixedFlags).length;
            if (varColumnCount) {
                adjustedList = this._addExtraColumnWidth(columnWidthList, extraTotalWidth, varColumnCount);
            } else {
                // 모든 컬럼 넓이가 고정(fixed)이면 마지막 컬럼의 넓이를 증가시킨다.
                adjustedList = _.clone(columnWidthList);
                adjustedList[columnLength - 1] += extraTotalWidth;
            }
        } else {
            adjustedList = columnWidthList;
        }
        return adjustedList;
    },

    /**
     * columnModel 에 설정된 넓이값을 기준으로 컬럼넓이와 관련된 변수들의 값을 초기화한다.
     * @private
     */
    _initColumnWidthVariables: function() {
        var columnModelList = this.columnModel.get('visibleList'),
            commonMinWidth = this.get('minimumColumnWidth'),
            widthList = [],
            fixedFlags = [],
            minWidthList = [];

        _.each(columnModelList, function(columnModel) {
            var width = columnModel.width,
                minWidth = Math.max(width, commonMinWidth);
            // width가 지정되지 않은 경우에는 0으로 설정해두어, 아래 _fillColumnWidthList()에서 남은 넓이를 채울 수 있도록 한다.
            widthList.push(width > 0 ? minWidth : 0);
            minWidthList.push(minWidth);
            fixedFlags.push(!!columnModel.isFixedWidth);
        });

        this._columnWidthFixedFlags = fixedFlags;
        this._minColumnWidthList = minWidthList;

        widthList = this._fillColumnWidthList(widthList);
        widthList = this._applyMinimumColumnWidth(widthList);
        widthList = this._adjustColumnWidthList(widthList);
        this._setColumnWidthVariables(widthList, true);
    },

    /**
     * L, R 중 하나를 입력받아 frame 의 너비를 구한다.
     * @param {String} [whichSide]  지정하지 않을 경우 전체 너비.
     * @return {Number} 해당 frame 의 너비
     */
    getFrameWidth: function(whichSide) {
        var columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
            columnWidthList = this.getColumnWidthList(whichSide),
            frameWidth = this._getFrameWidth(columnWidthList);
        if (ne.util.isUndefined(whichSide) && columnFixIndex > 0) {
            //columnFixIndex 가 0보다 클 경우, 열고정 되어있기 때문에, 경계영역에 대한 1px도 함께 더한다.
            frameWidth += 1;
        }
        return frameWidth;
    },
    /**
     * widthList 로부터 보더 값을 포함하여 계산한 frameWidth 를 구한다.
     * @param {Array} widthList 너비 리스트 배열
     * @return {Number} 계산된 frame 너비값
     * @private
     */
    _getFrameWidth: function(widthList) {
        var frameWidth = 0;
        if (widthList.length) {
            frameWidth = Util.sum(widthList) + ((widthList.length + 1) * BORDER_WIDTH);
        }
        return frameWidth;
    },

    /**
     * columnWidthList 로 부터, lside 와 rside 의 전체 너비를 계산하여 저장한다.
     * @param {array} columnWidthList - 컬럼 넓이값 배열
     * @param {boolean} isSaveWidthList - 저장 여부. true이면 넓이값 배열을 originalWidthList로 저장한다.
     * @private
     */
    _setColumnWidthVariables: function(columnWidthList, isSaveWidthList) {
        var totalWidth = this.get('width'),
            columnFixIndex = this.columnModel.get('columnFixIndex'),
            maxLeftSideWidth = this._getMaxLeftSideWidth(),
            rsideWidth, lsideWidth, lsideWidthList, rsideWidthList;

        lsideWidthList = columnWidthList.slice(0, columnFixIndex);
        rsideWidthList = columnWidthList.slice(columnFixIndex);

        lsideWidth = this._getFrameWidth(lsideWidthList);
        if (maxLeftSideWidth && maxLeftSideWidth < lsideWidth) {
            lsideWidthList = this._adjustLeftSideWidthList(lsideWidthList, maxLeftSideWidth);
            lsideWidth = this._getFrameWidth(lsideWidthList);
            columnWidthList = lsideWidthList.concat(rsideWidthList);
        }
        rsideWidth = totalWidth - lsideWidth;
        this.set({
            columnWidthList: columnWidthList,
            rsideWidth: rsideWidth,
            lsideWidth: lsideWidth
        });

        if (isSaveWidthList) {
            this.set('originalWidthList', columnWidthList);
        }
        this.trigger('columnWidthChanged');
    },

    /**
     * 열 고정 영역의 minimum width 값을 구한다.
     * @return {number} 열고정 영역의 최소 너비값.
     * @private
     */
    _getMinLeftSideWidth: function() {
        var minimumColumnWidth = this.get('minimumColumnWidth'),
            columnFixIndex = this.columnModel.get('columnFixIndex'),
            minWidth = 0,
            borderWidth;

        if (columnFixIndex) {
            borderWidth = (columnFixIndex + 1) * BORDER_WIDTH;
            minWidth = borderWidth + (minimumColumnWidth * columnFixIndex);
        }
        return minWidth;
    },
    /**
     * 열 고정 영역의 maximum width 값을 구한다.
     * @return {number} 열고정 영역의 최대 너비값.
     * @private
     */
    _getMaxLeftSideWidth: function() {
        var maxWidth = Math.ceil(this.get('width') * 0.9);

        if (maxWidth) {
            maxWidth = Math.max(maxWidth, this._getMinLeftSideWidth());
        }
        return maxWidth;
    },
    /**
     * 계산한 cell 의 위치를 리턴한다.
     * @param {Number|String} rowKey - 데이터의 키값
     * @param {String} columnName - 칼럼명
     * @return {{top: number, left: number, right: number, bottom: number}} - cell의 위치
     */
    getCellPosition: function(rowKey, columnName) {
        var top, left = 0, right, bottom, i = 0,
            dataModel = this.grid.dataModel,
            rowHeight = this.get('rowHeight'),
            rowSpanData = dataModel.get(rowKey).getRowSpanData(columnName),
            rowIdx, spanCount,
            columnWidthList = this.get('columnWidthList'),
            columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
            columnIdx = this.grid.columnModel.indexOfColumnName(columnName, true),
            borderWidth = 1;


        if (!rowSpanData.isMainRow) {
            rowKey = rowSpanData.mainRowKey;
            rowSpanData = dataModel.get(rowKey).getRowSpanData(columnName);
        }

        spanCount = rowSpanData.count || 1;

        rowIdx = dataModel.indexOfRowKey(rowKey);

        top = Util.getHeight(rowIdx, rowHeight);
        bottom = top + Util.getHeight(spanCount, rowHeight) - borderWidth;

        if (columnFixIndex <= columnIdx) {
            i = columnFixIndex;
        }

        for (; i < columnIdx; i += 1) {
            left += columnWidthList[i] + borderWidth;
        }
        right = left + columnWidthList[i] + borderWidth;

        return {
            top: top,
            left: left,
            right: right,
            bottom: bottom
        };
    },
    /**
     * columnFixIndex 가 적용되었을 때, window resize 시 left side 의 너비를 조정한다.
     * @param {Array} lsideWidthList    열고정 영역의 너비 리스트 배열
     * @param {Number} totalWidth   grid 전체 너비
     * @return {Array} 열고정 영역의 너비 리스트
     * @private
     */
    _adjustLeftSideWidthList: function(lsideWidthList, totalWidth) {
        var i = lsideWidthList.length - 1,
            minimumColumnWidth = this.get('minimumColumnWidth'),
            currentWidth = this._getFrameWidth(lsideWidthList),
            diff = currentWidth - totalWidth,
            changedWidth;
        if (diff > 0) {
            while (i >= 0 && diff > 0) {
                changedWidth = Math.max(minimumColumnWidth, lsideWidthList[i] - diff);
                diff -= lsideWidthList[i] - changedWidth;
                lsideWidthList[i] = changedWidth;
                i -= 1;
            }
        } else if (diff < 0) {
            lsideWidthList[i] += Math.abs(diff);
        }
        return lsideWidthList;
    },
    /**
     * 그리드의 body height 를 계산하여 할당한다.
     * @private
     */
    _setBodyHeight: function() {
        var height = Util.getHeight(this.get('displayRowCount'), this.get('rowHeight'));
        if (this.get('scrollX')) {
            height += this.get('scrollBarSize');
        }
        this.set('bodyHeight', height);
    },
    /**
     * 현재 화면에 보이는 row 개수를 반환
     * @return {number} 화면에 보이는 행 개수
     */
    getDisplayRowCount: function() {
        return Util.getDisplayRowCount(this.get('bodyHeight') - this.get('toolbarHeight'), this.get('rowHeight'));
    },
    /**
     * 수평 스크롤바의 높이를 구한다. 수평 스크롤바를 사용하지 않을 경우 0을 반환한다.
     * @return {number} 수평 스크롤바의 높이
     */
    getScrollXHeight: function() {
        return +this.get('scrollX') * this.get('scrollBarSize');
    },
    /**
     * width 값 변경시 각 column 별 너비를 계산한다.
     * @private
     */
    _onWidthChange: function() {
        var widthList = this.get('columnWidthList');

        widthList = this._adjustColumnWidthList(widthList, true);
        widthList = this._applyMinimumColumnWidth(widthList);

        this._setColumnWidthVariables(widthList);
    },

    /**
     * columnResize 발생 시 index 에 해당하는 컬럼의 width 를 변경하여 반영한다.
     * @param {Number} index    너비를 변경할 컬럼의 인덱스
     * @param {Number} width    변경할 너비 pixel값
     */
    setColumnWidth: function(index, width) {
        var columnWidthList = this.get('columnWidthList'),
            fixedFlags = this._columnWidthFixedFlags,
            minWidth = this._minColumnWidthList[index],
            adjustedList;

        if (!fixedFlags[index] && columnWidthList[index]) {
            columnWidthList[index] = Math.max(width, minWidth);
            fixedFlags[index] = true;
            adjustedList = this._adjustColumnWidthList(columnWidthList);
            fixedFlags[index] = false;
            this._setColumnWidthVariables(adjustedList);
        }
    },
    /**
     * 초기 너비로 돌린다.
     * @param {Number} index    너비를 변경할 컬럼의 인덱스
     */
    restoreColumnWidth: function(index) {
        var curColumnWidthList = this.get('columnWidthList');
        if (!ne.util.isUndefined(curColumnWidthList[index])) {
            curColumnWidthList[index] = this.get('originalWidthList')[index];
            this._setColumnWidthVariables(curColumnWidthList);
        }
    },
    /**
     * L side 와 R side 에 따른 columnWidthList 를 반환한다.
     * @param {String} [whichSide] 어느 영역인지 여부. 'L|R' 중 하나를 인자로 넘긴다. 생략시 전체 columnList 반환
     * @return {Array}  조회한 영역의 columnWidthList
     */
    getColumnWidthList: function(whichSide) {
        var columnFixIndex = this.columnModel.get('columnFixIndex'),
            columnWidthList = [];

        whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
        switch (whichSide) {
            case 'L':
                columnWidthList = this.get('columnWidthList').slice(0, columnFixIndex);
                break;
            case 'R':
                columnWidthList = this.get('columnWidthList').slice(columnFixIndex);
                break;
            default :
                columnWidthList = this.get('columnWidthList');
                break;
        }
        return columnWidthList;
    }
});
}());
