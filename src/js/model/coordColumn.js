/**
 * @fileoverview Manage coordinates of rows
 * @author NHN Ent. FE Development Lab
 */
'use strict';

var Model = require('../base/model');
var util = require('../common/util');
var constMap = require('../common/constMap');
var dimensionConst = constMap.dimension;
var frameConst = constMap.frame;

var CELL_BORDER_WIDTH = dimensionConst.CELL_BORDER_WIDTH;

/**
 * @module model/coordColumn
 * @param {Object} attrs - Attributes
 * @param {Object} options - Options
 * @extends module:base/model
 * @ignore
 */
var CoordColumn = Model.extend(/**@lends module:model/coordColumn.prototype */{
    initialize: function(attrs, options) {
        this.dimensionModel = options.dimensionModel;
        this.columnModel = options.columnModel;

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

        /**
         * Whether the column width is modified by user.
         * @type {boolean}
         */
        this._isModified = false;

        this.listenTo(this.columnModel, 'columnModelChange', this.resetColumnWidths);
        this.listenTo(this.dimensionModel, 'change:width', this._onDimensionWidthChange);

        if (options.domEventBus) {
            this.listenTo(options.domEventBus, 'dragmove:resizeColumn', this._onDragResize);
            this.listenTo(options.domEventBus, 'dblclick:resizeColumn', this._onDblClick);
        }
        this.resetColumnWidths();
    },

    defaults: {
        columnWidthList: []
    },

    /**
     * Reset the width of each column by using initial setting of column models.
     */
    resetColumnWidths: function() {
        var columnModelList = this.columnModel.getVisibleColumnModelList(null, true);
        var commonMinWidth = this.dimensionModel.get('minimumColumnWidth');
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
     * Event handler for dragmove event on domEventBus
     * @param {module:event/gridEvent} ev - GridEvent
     * @private
     */
    _onDragResize: function(ev) {
        this.setColumnWidth(ev.columnIndex, ev.width);
    },

    /**
     * Event handler for dblclick event on domEventBus
     * @param {module:event/gridEventd} ev - GridEvent
     * @private
     */
    _onDblClick: function(ev) {
        this.restoreColumnWidth(ev.columnIndex);
    },

    /**
     * columnWidthList 로 부터, lside 와 rside 의 전체 너비를 계산하여 저장한다.
     * @param {array} columnWidthList - 컬럼 넓이값 배열
     * @param {boolean} [isSaveWidthList] - 저장 여부. true이면 넓이값 배열을 originalWidthList로 저장한다.
     * @private
     */
    _setColumnWidthVariables: function(columnWidthList, isSaveWidthList) {
        var totalWidth = this.dimensionModel.get('width');
        var maxLeftSideWidth = this.dimensionModel.getMaxLeftSideWidth();
        var columnFixCount = this.columnModel.getVisibleColumnFixCount(true);
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
            columnWidthList: columnWidthList
        });
        this.dimensionModel.set({
            rsideWidth: rsideWidth,
            lsideWidth: lsideWidth
        });

        if (isSaveWidthList) {
            this.set('originalWidthList', _.clone(columnWidthList));
        }
        this.trigger('columnWidthChanged');
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
        var minimumColumnWidth = this.dimensionModel.get('minimumColumnWidth');
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
     * Sets the width of columns whose width is not assigned by distributing extra width to them equally.
     * @param {number[]} columnWidthList - An array of column widths
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _fillEmptyColumnWidth: function(columnWidthList) {
        var totalWidth = this.dimensionModel.getAvailableTotalWidth(columnWidthList.length);
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
     * Adjust the column widths to make them fit into the dimension.
     * @param {number[]} columnWidthList - An array of column width
     * @param {boolean} [fitToReducedTotal] - If set to true and the total width is smaller than dimension(width),
     *                                    the column widths will be reduced.
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _adjustColumnWidthList: function(columnWidthList, fitToReducedTotal) {
        var columnLength = columnWidthList.length;
        var availableWidth = this.dimensionModel.getAvailableTotalWidth(columnLength);
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
     * width 값 변경시 각 column 별 너비를 계산한다.
     * @private
     */
    _onDimensionWidthChange: function() {
        var widthList = this.get('columnWidthList');

        if (!this._isModified) {
            widthList = this._adjustColumnWidthList(widthList, true);
        }
        this._setColumnWidthVariables(widthList);
    },

    /**
     * L side 와 R side 에 따른 columnWidthList 를 반환한다.
     * @param {String} [whichSide] 어느 영역인지 여부. L,R 중 하나를 인자로 넘긴다. 생략시 전체 columnList 반환
     * @returns {Array}  조회한 영역의 columnWidthList
     */
    getColumnWidthList: function(whichSide) {
        var columnFixCount = this.columnModel.getVisibleColumnFixCount(true);
        var columnWidthList = [];

        switch (whichSide) {
            case frameConst.L:
                columnWidthList = this.get('columnWidthList').slice(0, columnFixCount);
                break;
            case frameConst.R:
                columnWidthList = this.get('columnWidthList').slice(columnFixCount);
                break;
            default :
                columnWidthList = this.get('columnWidthList');
                break;
        }

        return columnWidthList;
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
     * columnResize 발생 시 index 에 해당하는 컬럼의 width 를 변경하여 반영한다.
     * @param {Number} index    너비를 변경할 컬럼의 인덱스
     * @param {Number} width    변경할 너비 pixel값
     */
    setColumnWidth: function(index, width) {
        var columnWidthList = this.get('columnWidthList');
        var fixedFlags = this._columnWidthFixedFlags;
        var minWidth = this._minColumnWidthList[index];

        if (!fixedFlags[index] && columnWidthList[index]) {
            columnWidthList[index] = Math.max(width, minWidth);
            this._setColumnWidthVariables(columnWidthList);
            this._isModified = true;
        }
    },

    /**
     * Returns column index from X-position relative to the body-area
     * @param {number} posX - X-position relative to the body-area
     * @param {boolean} withMeta - Whether the meta columns go with this calculation
     * @returns {number} Column index
     * @private
     */
    indexOf: function(posX, withMeta) {
        var columnWidthList = this.getColumnWidthList();
        var totalColumnWidth = this.getFrameWidth();
        var adjustableIndex = (withMeta) ? 0 : this.columnModel.getVisibleMetaColumnCount();
        var columnIndex = 0;

        if (posX >= totalColumnWidth) {
            columnIndex = columnWidthList.length - 1;
        } else {
            tui.util.forEachArray(columnWidthList, function(width, index) { // eslint-disable-line consistent-return
                width += CELL_BORDER_WIDTH;
                columnIndex = index;

                if (posX > width) {
                    posX -= width;
                } else {
                    return false;
                }
            });
        }

        return Math.max(0, columnIndex - adjustableIndex);
    },

    /**
     * Restore a column to the default width.
     * @param {Number} index - target column index
     */
    restoreColumnWidth: function(index) {
        var orgWidth = this.get('originalWidthList')[index];

        this.setColumnWidth(index, orgWidth);
    }
});

module.exports = CoordColumn;
