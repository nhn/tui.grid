/**
 * @fileoverview 크기에 관련된 데이터를 다루는 모델
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');

var Model = require('../base/model');
var util = require('../common/util');
var dimensionConstMap = require('../common/constMap').dimension;

var TABLE_BORDER_WIDTH = dimensionConstMap.TABLE_BORDER_WIDTH;
var CELL_BORDER_WIDTH = dimensionConstMap.CELL_BORDER_WIDTH;

/**
 * 크기 관련 데이터 저장
 * @module model/dimension
 * @extends module:base/model
 */
var Dimension = Model.extend(/**@lends module:model/dimension.prototype */{
    /**
     * @constructs
     * @param {Object} attrs - Attributes
     * @param {Object} options - Options
     */
    initialize: function(attrs, options) {
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

        this.columnModel = options.columnModel;
        this.dataModel = options.dataModel;
        this.domState = options.domState;

        this.listenTo(this.columnModel, 'columnModelChange', this._initColumnWidthVariables);
        this.listenTo(this.dataModel, 'add remove reset', this._resetTotalRowHeight);

        this.on('change:width', this._onWidthChange, this);
        this.on('change:bodyHeight', this._resetDisplayRowCount, this);
        this.on('change:displayRowCount', this._resetBodyHeight, this);

        this._initColumnWidthVariables();
        this._resetBodyHeight();
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
        resizeHandleHeight: 0,
        paginationHeight: 0,

        rowHeight: 0,
        totalRowHeight: 0,

        rsideWidth: 0,
        lsideWidth: 0,
        columnWidthList: [],

        minimumColumnWidth: 0,
        displayRowCount: 1,
        scrollBarSize: 17,
        scrollX: true,
        scrollY: true,
        fitToParentHeight: false
    },

    /**
     * 전체 넓이에서 스크롤바, border등의 넓이를 제외하고 실제 셀의 넓이에 사용되는 값만 반환한다.
     * @param {number} columnLength - 컬럼의 개수
     * @returns {number} 사용가능한 전체 셀의 넓이
     * @private
     */
    _getAvailableTotalWidth: function(columnLength) {
        var totalWidth = this.get('width');
        var borderCount = columnLength + 1 + (this.isDivisionBorderDoubled() ? 1 : 0);
        var totalBorderWidth = borderCount * CELL_BORDER_WIDTH;
        var availableTotalWidth = totalWidth - this.getScrollYWidth() - totalBorderWidth;

        return availableTotalWidth;
    },

    /**
     * Makes all width of columns not less than minimumColumnWidth.
     * @param {number[]} columnWidthList - 컬럼 넓이값 배열
     * @returns {number[]} - 수정된 새로운 넓이값 배열
     * @private
     */
    _applyMinimumColumnWidth: function(columnWidthList) {
        var minWidthList = this._minColumnWidthList;
        var appliedList = _.clone(columnWidthList);

        _.each(appliedList, function(width, index) {
            var minWidth = minWidthList[index];
            if (width < minWidth) {
                appliedList[index] = minWidth;
            }
        });

        return appliedList;
    },

    /**
     * Resets the 'totalRowHeight' attribute.
     * @private
     */
    _resetTotalRowHeight: function() {
        var rowHeight = this.get('rowHeight');
        var rowCount = this.dataModel.length;

        this.set('totalRowHeight', util.getHeight(rowCount, rowHeight));
    },

    /**
     * Resets the 'displayRowCount' attribute.
     * @private
     */
    _resetDisplayRowCount: function() {
        var actualBodyHeight, displayRowCount;

        // To prevent recursive call with _resetBodyHeight (called by change:displayRowCount event)
        if (_.has(this.changed, 'displayRowCount')) {
            return;
        }
        actualBodyHeight = this.get('bodyHeight') - this.getScrollXHeight();
        displayRowCount = util.getDisplayRowCount(actualBodyHeight, this.get('rowHeight'));

        this.set('displayRowCount', displayRowCount);
    },

    /**
     * Sets the width of columns whose width is not assigned by distributing extra width to them equally.
     * @param {number[]} columnWidthList - An array of column widths
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _fillEmptyColumnWidth: function(columnWidthList) {
        var totalWidth = this._getAvailableTotalWidth(columnWidthList.length);
        var remainTotalWidth = totalWidth - util.sum(columnWidthList);
        var emptyIndexes = [];

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
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _addExtraColumnWidth: function(columnWidthList, totalExtraWidth) {
        var fixedFlags = this._columnWidthFixedFlags;
        var columnIndexes = [];

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
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _reduceExcessColumnWidth: function(columnWidthList, totalExcessWidth) {
        var minWidthList = this._minColumnWidthList;
        var fixedFlags = this._columnWidthFixedFlags;
        var availableList = [];

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
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _reduceExcessColumnWidthSub: function(columnWidthList, totalRemainWidth, availableList) {
        var avgValue = Math.round(totalRemainWidth / availableList.length);
        var newAvailableList = [];
        var columnIndexes;

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
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _distributeExtraWidthEqually: function(columnWidthList, extraWidth, columnIndexes) {
        var length = columnIndexes.length;
        var avgValue = Math.round(extraWidth / length);
        var errorValue = (avgValue * length) - extraWidth; // to correct total width
        var resultList = _.clone(columnWidthList);

        _.each(columnIndexes, function(columnIndex) {
            resultList[columnIndex] += avgValue;
        });

        if (columnIndexes.length) {
            resultList[_.last(columnIndexes)] -= errorValue;
        }

        return resultList;
    },

    /**
     * Adjust the column widths to make them fit into the dimension.
     * @param {number[]} columnWidthList - An array of column width
     * @param {boolean} [fitToReducedTotal] - If set to true and the total width is smaller than dimension(width),
     *                                    the column widths will be reduced.
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _adjustColumnWidthList: function(columnWidthList, fitToReducedTotal) {
        var columnLength = columnWidthList.length;
        var availableWidth = this._getAvailableTotalWidth(columnLength);
        var totalExtraWidth = availableWidth - util.sum(columnWidthList);
        var fixedCount = _.filter(this._columnWidthFixedFlags).length;
        var adjustedList;

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
        var columnModelList = this.columnModel.getVisibleColumnModelList(null, true);
        var commonMinWidth = this.get('minimumColumnWidth');
        var widthList = [];
        var fixedFlags = [];
        var minWidthList = [];

        _.each(columnModelList, function(columnModel) {
            var width = columnModel.width > 0 ? columnModel.width : 0;
            var minWidth = Math.max(width, commonMinWidth);

            // Meta columns are not affected by common 'minimumColumnWidth' value
            if (util.isMetaColumn(columnModel.columnName)) {
                minWidth = width;
            }

            // If the width is not assigned (in other words, the width is not positive number),
            // set it to zero (no need to worry about minimum width at this point)
            // so that #_fillEmptyColumnWidth() can detect which one is empty.
            // After then, minimum width will be applied by #_applyMinimumColumnWidth().
            widthList.push(width ? minWidth : 0);
            minWidthList.push(minWidth);
            fixedFlags.push(!!columnModel.isFixedWidth);
        }, this);

        this._columnWidthFixedFlags = fixedFlags;
        this._minColumnWidthList = minWidthList;

        this._setColumnWidthVariables(this._calculateColumnWidth(widthList), true);
    },

    /**
     * calculate column width list
     * @param {Array.<Number>} widthList - widthList
     * @returns {Array.<Number>}
     * @private
     */
    _calculateColumnWidth: function(widthList) {
        widthList = this._fillEmptyColumnWidth(widthList);
        widthList = this._applyMinimumColumnWidth(widthList);
        widthList = this._adjustColumnWidthList(widthList);

        return widthList;
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
     * L, R 중 하나를 입력받아 frame 의 너비를 구한다.
     * @param {String} [whichSide]  지정하지 않을 경우 전체 너비.
     * @returns {Number} 해당 frame 의 너비
     */
    getFrameWidth: function(whichSide) {
        var columnFixCount = this.columnModel.getVisibleColumnFixCount(true);
        var columnWidthList = this.getColumnWidthList(whichSide);
        var frameWidth = this._getFrameWidth(columnWidthList);

        if (_.isUndefined(whichSide) && columnFixCount > 0) {
            frameWidth += CELL_BORDER_WIDTH;
        }

        return frameWidth;
    },

    /**
     * widthList 로부터 보더 값을 포함하여 계산한 frameWidth 를 구한다.
     * @param {Array} widthList 너비 리스트 배열
     * @returns {Number} 계산된 frame 너비값
     * @private
     */
    _getFrameWidth: function(widthList) {
        var frameWidth = 0;

        if (widthList.length) {
            frameWidth = util.sum(widthList) + ((widthList.length + 1) * CELL_BORDER_WIDTH);
        }

        return frameWidth;
    },

    /**
     * columnWidthList 로 부터, lside 와 rside 의 전체 너비를 계산하여 저장한다.
     * @param {array} columnWidthList - 컬럼 넓이값 배열
     * @param {boolean} [isSaveWidthList] - 저장 여부. true이면 넓이값 배열을 originalWidthList로 저장한다.
     * @private
     */
    _setColumnWidthVariables: function(columnWidthList, isSaveWidthList) {
        var totalWidth = this.get('width');
        var columnFixCount = this.columnModel.getVisibleColumnFixCount(true);
        var maxLeftSideWidth = this._getMaxLeftSideWidth();
        var rsideWidth, lsideWidth, lsideWidthList, rsideWidthList;

        lsideWidthList = columnWidthList.slice(0, columnFixCount);
        rsideWidthList = columnWidthList.slice(columnFixCount);

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
     * @returns {number} 열고정 영역의 최소 너비값.
     * @private
     */
    _getMinLeftSideWidth: function() {
        var minimumColumnWidth = this.get('minimumColumnWidth');
        var columnFixCount = this.columnModel.getVisibleColumnFixCount(true);
        var minWidth = 0;
        var borderWidth;

        if (columnFixCount) {
            borderWidth = (columnFixCount + 1) * CELL_BORDER_WIDTH;
            minWidth = borderWidth + (minimumColumnWidth * columnFixCount);
        }

        return minWidth;
    },

    /**
     * 열 고정 영역의 maximum width 값을 구한다.
     * @returns {number} 열고정 영역의 최대 너비값.
     * @private
     */
    _getMaxLeftSideWidth: function() {
        var maxWidth = Math.ceil(this.get('width') * 0.9); // eslint-disable-line no-magic-number

        if (maxWidth) {
            maxWidth = Math.max(maxWidth, this._getMinLeftSideWidth());
        }

        return maxWidth;
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
        var columnWidthList = this.get('columnWidthList');
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
     */
    _getCellVerticalPosition: function(rowKey, rowSpanCount) {
        var dataModel = this.dataModel;
        var rowHeight = this.get('rowHeight');
        var rowIdx = dataModel.indexOfRowKey(rowKey);
        var top = util.getHeight(rowIdx, rowHeight);
        var height = util.getHeight(rowSpanCount, rowHeight);

        return {
            top: top,
            bottom: top + height
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
        var containerPos = this._rebasePositionToContainer(pageX, pageY);
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
     * Get cell index from mouse position
     * @param {Number} pageX - Mouse X-position based on page
     * @param {Number} pageY - Mouse Y-position based on page
     * @param {boolean} [withMeta] - Whether the meta columns go with this calculation
     * @returns {{row: number, column: number}} Cell index
     */
    getIndexFromMousePosition: function(pageX, pageY, withMeta) {
        var containerPos = this._rebasePositionToContainer(pageX, pageY);

        return {
            row: this._calcRowIndexFromPositionY(containerPos.y),
            column: this._calcColumnIndexFromPositionX(containerPos.x, withMeta)
        };
    },

    /**
     * Calc and get column index from Y-position based on the container
     * @param {number} containerY - X-position based on the container
     * @returns {number} Row index
     * @private
     */
    _calcRowIndexFromPositionY: function(containerY) {
        var cellY = containerY + this.renderModel.get('scrollTop');
        var tempIndex = Math.floor(cellY / (this.get('rowHeight') + CELL_BORDER_WIDTH));
        var min = 0;
        var max = Math.max(min, this.dataModel.length - 1);

        return util.clamp(tempIndex, min, max);
    },

    /**
     * Calc and get column index from X-position based on the container
     * @param {number} containerX - X-position based on the container
     * @param {boolean} withMeta - Whether the meta columns go with this calculation
     * @returns {number} Column index
     * @private
     */
    _calcColumnIndexFromPositionX: function(containerX, withMeta) {
        var columnWidthList = this.getColumnWidthList();
        var totalColumnWidth = this.getFrameWidth();
        var cellX = containerX;
        var isRsidePosition = containerX >= this.get('lsideWidth');
        var adjustableIndex = (withMeta) ? 0 : this.columnModel.getVisibleMetaColumnCount();
        var columnIndex = 0;

        if (isRsidePosition) {
            cellX += this.renderModel.get('scrollLeft');
        }

        if (cellX >= totalColumnWidth) {
            columnIndex = columnWidthList.length - 1;
        } else {
            tui.util.forEachArray(columnWidthList, function(width, index) { // eslint-disable-line consistent-return
                width += CELL_BORDER_WIDTH;
                columnIndex = index;

                if (cellX > width) {
                    cellX -= width;
                } else {
                    return false;
                }
            });
        }

        return Math.max(0, columnIndex - adjustableIndex);
    },

    /**
     * 마우스 위치 정보에 해당하는 grid container 기준 pageX 와 pageY 를 반환한다.
     * @param {Number} pageX    마우스 x 좌표
     * @param {Number} pageY    마우스 y 좌표
     * @returns {{x: number, y: number}} 그리드 container 기준의 x, y 값
     * @private
     */
    _rebasePositionToContainer: function(pageX, pageY) {
        var offsetX = this.get('offsetLeft');
        var offsetY = this.get('offsetTop') + this.get('headerHeight') + this.get('toolbarHeight')
             + CELL_BORDER_WIDTH + TABLE_BORDER_WIDTH;

        return {
            x: pageX - offsetX,
            y: pageY - offsetY
        };
    },

    /**
     * columnFixCount 가 적용되었을 때, window resize 시 left side 의 너비를 조정한다.
     * @param {Array} lsideWidthList    열고정 영역의 너비 리스트 배열
     * @param {Number} totalWidth   grid 전체 너비
     * @returns {Array} 열고정 영역의 너비 리스트
     * @private
     */
    _adjustLeftSideWidthList: function(lsideWidthList, totalWidth) {
        var i = lsideWidthList.length - 1;
        var minimumColumnWidth = this.get('minimumColumnWidth');
        var currentWidth = this._getFrameWidth(lsideWidthList);
        var diff = currentWidth - totalWidth;
        var changedWidth;

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
     * Resets the 'bodyHeight' attribute.
     * @private
     */
    _resetBodyHeight: function() {
        var rowListHeight;

        // To prevent recursive call with _resetDisplayRowCount (called by change:bodyHeight event)
        if (_.has(this.changed, 'bodyHeight')) {
            return;
        }
        rowListHeight = util.getHeight(this.get('displayRowCount'), this.get('rowHeight'));
        this.set('bodyHeight', rowListHeight + this.getScrollXHeight());
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
        var columnWidthList = this.get('columnWidthList');
        var fixedFlags = this._columnWidthFixedFlags;
        var minWidth = this._minColumnWidthList[index];
        var adjustedList;

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
     * @returns {number} The height of the table body
     * @private
     */
    _calcRealBodyHeight: function(height) {
        return height - this.get('headerHeight') - this.get('toolbarHeight') - TABLE_BORDER_WIDTH;
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
     * (Resets the bodyHeight and displayRowCount relative to the dimension height)
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
        }
        if (height > 0) {
            this._setHeight(height);
        }
        this.trigger('setSize');
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
     * @returns {Array}  조회한 영역의 columnWidthList
     */
    getColumnWidthList: function(whichSide) {
        var columnFixCount = this.columnModel.getVisibleColumnFixCount(true);
        var columnWidthList = [];

        switch (whichSide) {
            case 'l':
            case 'L':
                columnWidthList = this.get('columnWidthList').slice(0, columnFixCount);
                break;
            case 'r':
            case 'R':
                columnWidthList = this.get('columnWidthList').slice(columnFixCount);
                break;
            default :
                columnWidthList = this.get('columnWidthList');
                break;
        }

        return columnWidthList;
    }
});

module.exports = Dimension;
