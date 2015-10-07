/**
 * @fileoverview 크기에 관련된 데이터를 다루는 모델
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');
var util = require('../util');

// The width of the border of the dimension.
var BORDER_WIDTH = 1;

// The width of the border of table row.
var ROW_BORDER_WIDTH = 1;

/**
 * 크기 관련 데이터 저장
 * @module model/dimension
 */
var Dimension = Model.extend(/**@lends module:model/dimension.prototype */{
    /**
     * @extends module:base/model
     * @constructs
     */
    initialize: function() {
        Model.prototype.initialize.apply(this, arguments);

        /**
         * An array of the fixed flags of the columns
         * @private
         * @type {boolean[]}
         */
        this._columnWidthFixedFlags = null;

        /**
         * An array of the minimum width of the columns
         * @private
         * @type {number[]}
         */
        this._minColumnWidthList = null;
        this.columnModel = this.grid.columnModel;

        this.listenTo(this.columnModel, 'columnModelChange', this._initColumnWidthVariables);
        this.listenTo(this.grid.dataModel, 'add remove reset', this._resetTotalRowHeight);

        this.on('change:width', this._onWidthChange, this);
        this.on('change:displayRowCount', this._setBodyHeight, this);

        this._initColumnWidthVariables();
        this._setBodyHeight();
    },

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
        totalRowHeight: 0,

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
            availableTotalWidth -= ROW_BORDER_WIDTH;
        }
        return availableTotalWidth;
    },

    /**
     * Makes all width of columns not less than minimumColumnWidth.
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
     * Reset 'totalRowHeight' property.
     */
    _resetTotalRowHeight: function() {
        var rowHeight = this.get('rowHeight'),
            rowCount = this.grid.dataModel.length,
            totalBorderWidth = rowCount + 1;

        this.set('totalRowHeight', (rowHeight * rowCount) + totalBorderWidth);
    },

    /**
     * Sets the width of columns whose width is not assigned by distributing extra width to them equally.
     * @param {number[]} columnWidthList - An array of column widths
     * @return {number[]} - A new array of column widths
     * @private
     */
    _fillEmptyColumnWidth: function(columnWidthList) {
        var totalWidth = this._getAvailableTotalWidth(columnWidthList.length),
            remainTotalWidth = totalWidth - util.sum(columnWidthList),
            emptyIndexes = [];

        _.each(columnWidthList, function(width, index) {
            if (!width) {
                emptyIndexes.push(index);
            }
        });
        return this._distributeExtraWidthEqually(columnWidthList, remainTotalWidth, emptyIndexes);
    },

    /**
     * Adds extra widths of the column equally.
     * @param {number[]} columnWidthList - An array of column widths
     * @param {number} totalExtraWidth - Total extra width
     * @return {number[]} - A new array of column widths
     * @private
     */
    _addExtraColumnWidth: function(columnWidthList, totalExtraWidth) {
        var fixedFlags = this._columnWidthFixedFlags,
            columnIndexes = [];

        _.each(fixedFlags, function(flag, index) {
            if (!flag) {
                columnIndexes.push(index);
            }
        });
        return this._distributeExtraWidthEqually(columnWidthList, totalExtraWidth, columnIndexes);
    },

    /**
     * Reduces excess widths of the column equally.
     * @param {number[]} columnWidthList - An array of column widths
     * @param {number} totalExcessWidth - Total excess width (negative number)
     * @return {number[]} - A new array of column widths
     * @private
     */
    _reduceExcessColumnWidth: function(columnWidthList, totalExcessWidth) {
        var minWidthList = this._minColumnWidthList,
            fixedFlags = this._columnWidthFixedFlags,
            availableList = [];

        _.each(columnWidthList, function(width, index) {
            if (!fixedFlags[index]) {
                availableList.push({
                    index: index,
                    width: width - minWidthList[index]
                });
            }
        });
        return this._reduceExcessColumnWidthSub(_.clone(columnWidthList), totalExcessWidth, availableList);
    },

    /**
     * Reduce the (remaining) excess widths of the column.
     * This method will be called recursively by _reduceExcessColumnWidth.
     * @param {number[]} columnWidthList - An array of column Width
     * @param {number} totalRemainWidth - Remaining excess width (negative number)
     * @param {object[]} availableList - An array of infos about available column.
     *                                 Each item of the array has {index:number, width:number}.
     * @return {number[]} - A new array of column widths
     * @private
     */
    _reduceExcessColumnWidthSub: function(columnWidthList, totalRemainWidth, availableList) {
        var avgValue = Math.round(totalRemainWidth / availableList.length),
            newAvailableList = [],
            columnIndexes;

        _.each(availableList, function(available) {
            // note that totalRemainWidth and avgValue are negative number.
            if (available.width < Math.abs(avgValue)) {
                totalRemainWidth += available.width;
                columnWidthList[available.index] -= available.width;
            } else {
                newAvailableList.push(available);
            }
        });
        // call recursively until all available width are less than average
        if (availableList.length > newAvailableList.length) {
            return this._reduceExcessColumnWidthSub(columnWidthList, totalRemainWidth, newAvailableList);
        }
        columnIndexes = _.pluck(availableList, 'index');
        return this._distributeExtraWidthEqually(columnWidthList, totalRemainWidth, columnIndexes);
    },

    /**
     * Distributes the extra width equally to each column at specified indexes.
     * @param {number[]} columnWidthList - An array of column width
     * @param {number} extraWidth - Extra width
     * @param {number[]} columnIndexes - An array of indexes of target columns
     * @return {number[]} - A new array of column widths
     * @private
     */
    _distributeExtraWidthEqually: function(columnWidthList, extraWidth, columnIndexes) {
        var length = columnIndexes.length,
            avgValue = Math.round(extraWidth / length),
            errorValue = (avgValue * length) - extraWidth, // to correct total width
            resultList = _.clone(columnWidthList);

        _.each(columnIndexes, function(columnIndex) {
            resultList[columnIndex] += avgValue;
        });
        resultList[_.last(columnIndexes)] -= errorValue;

        return resultList;
    },

    /**
     * Adjust the column widths to make them fit into the dimension.
     * @param {number[]} columnWidthList - An array of column width
     * @param {boolean} fitToReducedTotal - If set to true and the total width is smaller than dimension(width),
     *                                    the column widths will be reduced.
     * @return {number[]} - A new array of column widths
     * @private
     */
    _adjustColumnWidthList: function(columnWidthList, fitToReducedTotal) {
        var columnLength = columnWidthList.length,
            availableWidth = this._getAvailableTotalWidth(columnLength),
            totalExtraWidth = availableWidth - util.sum(columnWidthList),
            fixedCount = _.filter(this._columnWidthFixedFlags).length,
            adjustedList;

        if (totalExtraWidth > 0) {
            if (columnLength > fixedCount) {
                adjustedList = this._addExtraColumnWidth(columnWidthList, totalExtraWidth);
            } else {
                // If all column has fixed width, add extra width to the last column.
                adjustedList = _.clone(columnWidthList);
                adjustedList[columnLength - 1] += totalExtraWidth;
            }
        } else if (fitToReducedTotal && totalExtraWidth < 0) {
            adjustedList = this._reduceExcessColumnWidth(columnWidthList, totalExtraWidth);
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
            minWidthList = [],
            calculate;

        _.each(columnModelList, function(columnModel) {
            var width = columnModel.width > 0 ? columnModel.width : 0,
                minWidth = Math.max(width, commonMinWidth);
            // If the width is not assigned (not positive number), set it to zero (not applying minimum width)
            // so that #_fillEmptyColumnWidth() can detect which one is empty.
            // After then, minimum width will be applied by #_applyMinimumColumnWidth().
            widthList.push(width ? minWidth : 0);
            minWidthList.push(minWidth);
            fixedFlags.push(!!columnModel.isFixedWidth);
        });

        this._columnWidthFixedFlags = fixedFlags;
        this._minColumnWidthList = minWidthList;

        // note that the calling order of functions is bottom-to-top.
        calculate = _.compose(
            this._adjustColumnWidthList,
            this._applyMinimumColumnWidth,
            this._fillEmptyColumnWidth
        );
        this._setColumnWidthVariables(calculate.call(this, widthList), true);
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
            frameWidth = util.sum(widthList) + ((widthList.length + 1) * ROW_BORDER_WIDTH);
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
            this.set('originalWidthList', _.clone(columnWidthList));
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
            borderWidth = (columnFixIndex + 1) * ROW_BORDER_WIDTH;
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

        top = util.getHeight(rowIdx, rowHeight);
        bottom = top + util.getHeight(spanCount, rowHeight) - borderWidth;

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
        var height = util.getHeight(this.get('displayRowCount'), this.get('rowHeight'));
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
        return util.getDisplayRowCount(this.get('bodyHeight') - this.getScrollXHeight(), this.get('rowHeight'));
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
        var widthList = this._adjustColumnWidthList(this.get('columnWidthList'), true);
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
            // makes width of the target column fixed temporarily
            // to not be influenced while adjusting column widths.
            fixedFlags[index] = true;
            adjustedList = this._adjustColumnWidthList(columnWidthList);
            fixedFlags[index] = false;
            this._setColumnWidthVariables(adjustedList);
        }
    },

    /**
     * Returns the height of table body.
     * @param  {number} height - The height of the dimension
     * @return {number} The height of the table body
     * @private
     */
    _getBodyHeight: function(height) {
        return height - this.get('headerHeight') - this.get('toolbarHeight') - BORDER_WIDTH;
    },

    /**
     * Returns the minimum height of table body.
     * @return {number} The minimum height of table body
     * @private
     */
    _getMinBodyHeight: function() {
        return this.get('rowHeight') + (ROW_BORDER_WIDTH * 2) + this.getScrollXHeight();
    },

    /**
     * Sets the height of the dimension.
     * (Resets the bodyHeight and displayRowCount relative to the dimension height)
     * @param  {number} height - The height of the dimension
     */
    setHeight: function(height) {
        this.set('bodyHeight', Math.max(this._getBodyHeight(height), this._getMinBodyHeight()));
        this.set('displayRowCount', this.getDisplayRowCount(), {silent: true});
    },

    /**
     * 초기 너비로 돌린다.
     * @param {Number} index    너비를 변경할 컬럼의 인덱스
     */
    restoreColumnWidth: function(index) {
        var orgWidth = this.get('originalWidthList')[index];
        this.setColumnWidth(index, orgWidth);
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

module.exports = Dimension;
