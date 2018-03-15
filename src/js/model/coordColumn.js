/**
 * @fileoverview Manage coordinates of rows
 * @author NHN Ent. FE Development Lab
 */

'use strict';

var _ = require('underscore');
var snippet = require('tui-code-snippet');

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
var CoordColumn = Model.extend(/** @lends module:model/coordColumn.prototype */{
    initialize: function(attrs, options) {
        this.dimensionModel = options.dimensionModel;
        this.columnModel = options.columnModel;

        /**
         * An array of the fixed flags of the columns
         * @private
         * @type {boolean[]}
         */
        this._fixedWidthFlags = null;

        /**
         * An array of the minimum width of the columns
         * @private
         * @type {number[]}
         */
        this._minWidths = null;

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
        widths: [],
        resizable: true
    },

    /**
     * Reset the width of each column by using initial setting of column models.
     */
    resetColumnWidths: function() {
        var columns = this.columnModel.getVisibleColumns(null, true);
        var commonMinWidth = this.dimensionModel.get('minimumColumnWidth');
        var widths = [];
        var fixedFlags = [];
        var minWidths = [];

        _.each(columns, function(columnModel) {
            var columnWidth = columnModel.width || 'auto';
            var fixedWidth = !isNaN(columnWidth);
            var width, minWidth;

            // Meta columns are not affected by common 'minimumColumnWidth' value
            if (util.isMetaColumn(columnModel.name)) {
                minWidth = width;
            } else {
                minWidth = columnModel.minWidth || commonMinWidth;
            }

            width = fixedWidth ? columnWidth : minWidth;

            if (width < minWidth) {
                width = minWidth;
            }

            // If the width is not assigned (in other words, the width is not positive number),
            // set it to zero (no need to worry about minimum width at this point)
            // so that #_fillEmptyWidth() can detect which one is empty.
            // After then, minimum width will be applied by #_applyMinimumWidth().
            widths.push(width);
            minWidths.push(minWidth);
            fixedFlags.push(fixedWidth);
        }, this);

        this._fixedWidthFlags = fixedFlags;
        this._minWidths = minWidths;

        this._setColumnWidthVariables(this._calculateColumnWidth(widths), true);
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
     * widths 로 부터, lside 와 rside 의 전체 너비를 계산하여 저장한다.
     * @param {array} widths - 컬럼 넓이값 배열
     * @param {boolean} [saveWidths] - 저장 여부. true이면 넓이값 배열을 originalWidths로 저장한다.
     * @private
     */
    _setColumnWidthVariables: function(widths, saveWidths) {
        var totalWidth = this.dimensionModel.get('width');
        var maxLeftSideWidth = this.dimensionModel.getMaxLeftSideWidth();
        var frozenCount = this.columnModel.getVisibleFrozenCount(true);
        var rsideWidth, lsideWidth, lsideWidths, rsideWidths;

        lsideWidths = widths.slice(0, frozenCount);
        rsideWidths = widths.slice(frozenCount);

        lsideWidth = this._getFrameWidth(lsideWidths);
        if (maxLeftSideWidth && maxLeftSideWidth < lsideWidth) {
            lsideWidths = this._adjustLeftSideWidths(lsideWidths, maxLeftSideWidth);
            lsideWidth = this._getFrameWidth(lsideWidths);
            widths = lsideWidths.concat(rsideWidths);
        }
        rsideWidth = totalWidth - lsideWidth;

        this.set({
            widths: widths
        });
        this.dimensionModel.set({
            rsideWidth: rsideWidth,
            lsideWidth: lsideWidth
        });

        if (saveWidths) {
            this.set('originalWidths', _.clone(widths));
        }
        this.trigger('columnWidthChanged');
    },

    /**
     * columnFrozenCount 가 적용되었을 때, window resize 시 left side 의 너비를 조정한다.
     * @param {Array} lsideWidths    열고정 영역의 너비 리스트 배열
     * @param {Number} totalWidth   grid 전체 너비
     * @returns {Array} 열고정 영역의 너비 리스트
     * @private
     */
    _adjustLeftSideWidths: function(lsideWidths, totalWidth) {
        var i = lsideWidths.length - 1;
        var minimumColumnWidth = this.dimensionModel.get('minimumColumnWidth');
        var currentWidth = this._getFrameWidth(lsideWidths);
        var diff = currentWidth - totalWidth;
        var changedWidth;

        if (diff > 0) {
            while (i >= 0 && diff > 0) {
                changedWidth = Math.max(minimumColumnWidth, lsideWidths[i] - diff);
                diff -= lsideWidths[i] - changedWidth;
                lsideWidths[i] = changedWidth;
                i -= 1;
            }
        } else if (diff < 0) {
            lsideWidths[i] += Math.abs(diff);
        }

        return lsideWidths;
    },

    /**
     * calculate column width list
     * @param {Array.<Number>} widths - widths
     * @returns {Array.<Number>}
     * @private
     */
    _calculateColumnWidth: function(widths) {
        widths = this._fillEmptyWidth(widths);
        widths = this._applyMinimumWidth(widths);
        widths = this._adjustWidths(widths);

        return widths;
    },

    /**
     * Sets the width of columns whose width is not assigned by distributing extra width to them equally.
     * @param {number[]} widths - An array of column widths
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _fillEmptyWidth: function(widths) {
        var totalWidth = this.dimensionModel.getAvailableTotalWidth(widths.length);
        var remainTotalWidth = totalWidth - util.sum(widths);
        var emptyIndexes = [];

        _.each(widths, function(width, index) {
            if (!width) {
                emptyIndexes.push(index);
            }
        });

        return this._distributeExtraWidthEqually(widths, remainTotalWidth, emptyIndexes);
    },

    /**
     * widths 로부터 보더 값을 포함하여 계산한 frameWidth 를 구한다.
     * @param {Array} widths 너비 리스트 배열
     * @returns {Number} 계산된 frame 너비값
     * @private
     */
    _getFrameWidth: function(widths) {
        var frameWidth = 0;

        if (widths.length) {
            frameWidth = util.sum(widths) + ((widths.length + 1) * CELL_BORDER_WIDTH);
        }

        return frameWidth;
    },

    /**
     * Adds extra widths of the column equally.
     * @param {number[]} widths - An array of column widths
     * @param {number} totalExtraWidth - Total extra width
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _addExtraColumnWidth: function(widths, totalExtraWidth) {
        var fixedFlags = this._fixedWidthFlags;
        var columnIndexes = [];

        _.each(fixedFlags, function(flag, index) {
            if (!flag) {
                columnIndexes.push(index);
            }
        });

        return this._distributeExtraWidthEqually(widths, totalExtraWidth, columnIndexes);
    },

    /**
     * Reduces excess widths of the column equally.
     * @param {number[]} widths - An array of column widths
     * @param {number} totalExcessWidth - Total excess width (negative number)
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _reduceExcessColumnWidth: function(widths, totalExcessWidth) {
        var minWidths = this._minWidths;
        var fixedFlags = this._fixedWidthFlags;
        var availableList = [];

        _.each(widths, function(width, index) {
            if (!fixedFlags[index]) {
                availableList.push({
                    index: index,
                    width: width - minWidths[index]
                });
            }
        });

        return this._reduceExcessColumnWidthSub(_.clone(widths), totalExcessWidth, availableList);
    },

    /**
     * Reduce the (remaining) excess widths of the column.
     * This method will be called recursively by _reduceExcessColumnWidth.
     * @param {number[]} widths - An array of column Width
     * @param {number} totalRemainWidth - Remaining excess width (negative number)
     * @param {object[]} availableList - An array of infos about available column.
     *                                 Each item of the array has {index:number, width:number}.
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _reduceExcessColumnWidthSub: function(widths, totalRemainWidth, availableList) {
        var avgValue = Math.round(totalRemainWidth / availableList.length);
        var newAvailableList = [];
        var columnIndexes;

        _.each(availableList, function(available) {
            // note that totalRemainWidth and avgValue are negative number.
            if (available.width < Math.abs(avgValue)) {
                totalRemainWidth += available.width;
                widths[available.index] -= available.width;
            } else {
                newAvailableList.push(available);
            }
        });
        // call recursively until all available width are less than average
        if (availableList.length > newAvailableList.length) {
            return this._reduceExcessColumnWidthSub(widths, totalRemainWidth, newAvailableList);
        }
        columnIndexes = _.pluck(availableList, 'index');

        return this._distributeExtraWidthEqually(widths, totalRemainWidth, columnIndexes);
    },

    /**
     * Distributes the extra width equally to each column at specified indexes.
     * @param {number[]} widths - An array of column width
     * @param {number} extraWidth - Extra width
     * @param {number[]} columnIndexes - An array of indexes of target columns
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _distributeExtraWidthEqually: function(widths, extraWidth, columnIndexes) {
        var length = columnIndexes.length;
        var avgValue = Math.round(extraWidth / length);
        var errorValue = (avgValue * length) - extraWidth; // to correct total width
        var resultList = _.clone(widths);

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
     * @param {number[]} widths - 컬럼 넓이값 배열
     * @returns {number[]} - 수정된 새로운 넓이값 배열
     * @private
     */
    _applyMinimumWidth: function(widths) {
        var minWidths = this._minWidths;
        var appliedList = _.clone(widths);

        _.each(appliedList, function(width, index) {
            var minWidth = minWidths[index];
            if (width < minWidth) {
                appliedList[index] = minWidth;
            }
        });

        return appliedList;
    },

    /**
     * Adjust the column widths to make them fit into the dimension.
     * @param {number[]} widths - An array of column width
     * @param {boolean} [fitToReducedTotal] - If set to true and the total width is smaller than dimension(width),
     *                                    the column widths will be reduced.
     * @returns {number[]} - A new array of column widths
     * @private
     */
    _adjustWidths: function(widths, fitToReducedTotal) {
        var columnLength = widths.length;
        var availableWidth = this.dimensionModel.getAvailableTotalWidth(columnLength);
        var totalExtraWidth = availableWidth - util.sum(widths);
        var fixedCount = _.filter(this._fixedWidthFlags).length;
        var adjustedWidths;

        if (totalExtraWidth > 0 && (columnLength > fixedCount)) {
            adjustedWidths = this._addExtraColumnWidth(widths, totalExtraWidth);
        } else if (fitToReducedTotal && totalExtraWidth < 0) {
            adjustedWidths = this._reduceExcessColumnWidth(widths, totalExtraWidth);
        } else {
            adjustedWidths = widths;
        }

        return adjustedWidths;
    },

    /**
     * width 값 변경시 각 column 별 너비를 계산한다.
     * @private
     */
    _onDimensionWidthChange: function() {
        var widths = this.get('widths');

        if (!this._isModified) {
            widths = this._adjustWidths(widths, true);
        }
        this._setColumnWidthVariables(widths);
    },

    /**
     * L side 와 R side 에 따른 widths 를 반환한다.
     * @param {String} [whichSide] 어느 영역인지 여부. L,R 중 하나를 인자로 넘긴다. 생략시 전체 columnList 반환
     * @returns {Array}  조회한 영역의 widths
     */
    getWidths: function(whichSide) {
        var columnFrozenCount = this.columnModel.getVisibleFrozenCount(true);
        var widths = [];

        switch (whichSide) {
            case frameConst.L:
                widths = this.get('widths').slice(0, columnFrozenCount);
                break;
            case frameConst.R:
                widths = this.get('widths').slice(columnFrozenCount);
                break;
            default:
                widths = this.get('widths');
                break;
        }

        return widths;
    },

    /**
     * L, R 중 하나를 입력받아 frame 의 너비를 구한다.
     * @param {String} [whichSide]  지정하지 않을 경우 전체 너비.
     * @returns {Number} 해당 frame 의 너비
     */
    getFrameWidth: function(whichSide) {
        var columnFrozenCount = this.columnModel.getVisibleFrozenCount(true);
        var widths = this.getWidths(whichSide);
        var frameWidth = this._getFrameWidth(widths);

        if (_.isUndefined(whichSide) && columnFrozenCount > 0) {
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
        var widths = this.get('widths');
        var minWidth = this._minWidths[index];

        if (widths[index]) {
            widths[index] = Math.max(width, minWidth);
            this._setColumnWidthVariables(widths);
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
        var widths = this.getWidths();
        var totalColumnWidth = this.getFrameWidth();
        var adjustableIndex = (withMeta) ? 0 : this.columnModel.getVisibleMetaColumnCount();
        var columnIndex = 0;

        if (posX >= totalColumnWidth) {
            columnIndex = widths.length - 1;
        } else {
            snippet.forEachArray(widths, function(width, index) { // eslint-disable-line consistent-return
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
        var orgWidth = this.get('originalWidths')[index];

        this.setColumnWidth(index, orgWidth);
    }
});

module.exports = CoordColumn;
