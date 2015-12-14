/**
 * @fileoverview Selection Model class
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model'),
    util = require('../common/util');

/**
 * @ignore
 * @const
 * @type {{cell: string, row: string, column: string}}
 * @desc
 *  Selection states
 */
var SELECTION_STATE = {
    cell: 'cell',
    row: 'row',
    column: 'column'
};
/**
 *  Selection Model class
 *  @module model/selection
 */
var Selection = Model.extend(/**@lends module:model/selection.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     */
    initialize: function() {
        Model.prototype.initialize.apply(this, arguments);

        this.setOwnProperties({
            inputRange: null,
            intervalIdForAutoScroll: null,
            scrollPixelScale: 40,
            _isEnabled: true,
            _selectionState: SELECTION_STATE.cell
        });

        this.listenTo(this.grid.dataModel, 'add remove sort reset', this.end);
    },

    defaults: {
        /**
         * Selection range
         * ex) {row: [0, 1], column: [1, 2]}
         * @type {{row: array, column: array}}
         */
        range: null
    },

    /**
     * Set selection state
     * @param {string} state - Selection state (cell, row, column)
     */
    setState: function(state) {
        this._selectionState = SELECTION_STATE[state] || this._selectionState;
    },

    /**
     * Return the selection state
     * @returns {string} state - Selection state (cell, row, column)
     */
    getState: function() {
        return this._selectionState;
    },

    /**
     * Enables the selection.
     */
    enable: function() {
        this._isEnabled = true;
    },

    /**
     * Disables the selection.
     */
    disable: function() {
        this.end();
        this._isEnabled = false;
    },

    /**
     * Returns whether the selection is enabled.
     * @return {boolean} True if the selection is enabled.
     */
    isEnabled: function() {
        return this._isEnabled;
    },

    /**
     * Starts the selection.
     * @param {Number} rowIndex - Row index
     * @param {Number} columnIndex - Column index
     * @param {string} state - Selection state강지
     */
    start: function(rowIndex, columnIndex, state) {
        if (!this._isEnabled) {
            return;
        }
        this.setState(state);
        this.inputRange = {
            row: [rowIndex, rowIndex],
            column: [columnIndex, columnIndex]
        };
        this._resetRangeAttribute();
    },

    /**
     * Starts the selection by mouse position.
     * @param {number} pageX - X position relative to the document
     * @param {number} pageY - Y position relative to the document
     * @param {string} state - Selection state
     */
    startByMousePosition: function(pageX, pageY, state) {
        var index = this.grid.dimensionModel.getIndexFromMousePosition(pageX, pageY);
        this.start(index.row, index.column, state);
    },

    /**
     * Updates the selection range.
     * @param {number} rowIndex - Row index
     * @param {number} columnIndex - Column index
     * @param {string} [state] - Selection state
     */
    update: function(rowIndex, columnIndex, state) {
        var grid = this.grid,
            focusedIndex;

        if (!this._isEnabled || rowIndex < 0 || columnIndex < 0) {
            return;
        }

        if (!this.hasSelection()) {
            focusedIndex = grid.focusModel.indexOf();
            this.start(focusedIndex.row, focusedIndex.column, state);
        } else {
            this.setState(state);
        }

        this._updateInputRange(rowIndex, columnIndex);
        this._resetRangeAttribute();
    },

    /**
     * Update input range (end range, not start range)
     * @param {number} rowIndex - Row index
     * @param {number} columnIndex - Column index
     * @private
     */
    _updateInputRange: function(rowIndex, columnIndex) {
        var inputRange = this.inputRange;

        inputRange.row[1] = rowIndex;
        inputRange.column[1] = columnIndex;
    },

    /**
     * Extend column selection
     * @param {undefined|Array} columnIndexes - Column indexes
     * @param {number} pageX - Mouse position X
     * @param {number} pageY - Mouse positino Y
     */
    extendColumnSelection: function(columnIndexes, pageX, pageY) {
        var minimumColumnRange = this._minimumColumnRange,
            index = this.grid.dimensionModel.getIndexFromMousePosition(pageX, pageY),
            range = {
                row: [0, 0],
                column: []
            },
            minMax;

        if (!columnIndexes || !columnIndexes.length) {
            columnIndexes = [index.column]
        }

        this._setScrolling(pageX, pageY);
        if (minimumColumnRange) {
            minMax = util.getMinMax(columnIndexes.concat(minimumColumnRange));
        } else {
            columnIndexes.push(this.inputRange.column[0]);
            minMax = util.getMinMax(columnIndexes);
        }
        range.column.push(minMax.min, minMax.max);
        this._resetRangeAttribute(range);
    },

    /**
     * Set auto scrolling for selection
     * @param {number} pageX - Mouse position X
     * @param {number} pageY - Mouse positino Y
     * @private
     */
    _setScrolling: function(pageX, pageY) {
        var overflow = this.grid.dimensionModel.getOverflowFromMousePosition(pageX, pageY);

        this.stopAutoScroll();
        if (this._isAutoScrollable(overflow.x, overflow.y)) {
            this.intervalIdForAutoScroll = setInterval(
                _.bind(this._adjustScroll, this, overflow.x, overflow.y)
            );
        }
    },

    /**
     * Updates the selection range by mouse position.
     * @param {number} pageX - X position relative to the document
     * @param {number} pageY - Y position relative to the document
     * @param {string} [state] - Selection state
     */
    updateByMousePosition: function(pageX, pageY, state) {
        var index = this.grid.dimensionModel.getIndexFromMousePosition(pageX, pageY);

        this._setScrolling(pageX, pageY);
        this.update(index.row, index.column, state);
    },

    /**
     * selection 영역 선택을 종료하고 selection 데이터를 초기화한다.
     */
    end: function() {
        this.inputRange = null;
        this.unset('range');
        this.unsetMinimumColumnRange();
    },

    /**
     * Stops the auto-scroll interval.
     */
    stopAutoScroll: function() {
        if (!_.isNull(this.intervalIdForAutoScroll)) {
            clearInterval(this.intervalIdForAutoScroll);
            this.intervalIdForAutoScroll = null;
        }
    },

    /**
     * Select all data in a row
     */
    selectRow: function(rowIndex) {
        var grid;

        if (this._isEnabled) {
            grid = this.grid;

            grid.focusAt(rowIndex, 0);
            this.start(rowIndex, 0, SELECTION_STATE.row);
            this.update(rowIndex, grid.columnModel.getVisibleColumnModelList().length - 1);
        }
    },

    /**
     * Select all data in a column
     */
    selectColumn: function(columnIdx) {
        var grid;

        if (this._isEnabled) {
            grid = this.grid;

            grid.focusAt(0, columnIdx);
            this.start(0, columnIdx, SELECTION_STATE.column);
            this.update(grid.dataModel.length - 1, columnIdx);
        }
    },

    /**
     * Selects all data range.
     */
    selectAll: function() {
        var grid;

        if (this._isEnabled) {
            grid = this.grid;

            this.start(0, 0, SELECTION_STATE.cell);
            this.update(grid.dataModel.length - 1, grid.columnModel.getVisibleColumnModelList().length - 1);
        }
    },

    /**
     * Returns the row and column indexes of the starting position.
     * @return {{row: number, column: number}} Objects containing indexes
     */
    getStartIndex: function() {
        var range = this.get('range');
        return {
            row: range.row[0],
            column: range.column[0]
        };
    },

    /**
     * Returns the row and column indexes of the ending position.
     * @return {{row: number, column: number}} Objects containing indexes
     */
    getEndIndex: function() {
        var range = this.get('range');
        return {
            row: range.row[1],
            column: range.column[1]
        };
    },

    /**
     * selection 데이터가 존재하는지 확인한다.
     * @return {boolean} selection 데이터 존재여부
     */
    hasSelection: function() {
        return !!this.get('range');
    },

    /**
     * Returns the string value of all cells in the selection range as a single string.
     * @return {String} string of values
     */
    getValuesToString: function() {
        var grid = this.grid,
            range = this.get('range'),
            columnModelList, rowList, columnNameList, rowValues;

        columnModelList = grid.columnModel.getVisibleColumnModelList().slice(range.column[0], range.column[1] + 1);
        rowList = grid.dataModel.slice(range.row[0], range.row[1] + 1);

        columnNameList = _.pluck(columnModelList, 'columnName');
        rowValues = _.map(rowList, function(row) {
            var tmpString = _.map(columnNameList, function(columnName) {
                return row.getVisibleText(columnName);
            });
            return tmpString.join('\t');
        });

        return rowValues.join('\n');
    },

    /**
     * 마우스 드래그로 selection 선택 시 auto scroll 조건에 해당하는지 반환한다.
     * @param {Number} overflowX    가로축 기준 영역 overflow 값
     * @param {Number} overflowY    세로축 기준 영역 overflow 값
     * @return {boolean} overflow 되었는지 여부
     * @private
     */
    _isAutoScrollable: function(overflowX, overflowY) {
        return !(overflowX === 0 && overflowY === 0);
    },

    /**
     * Adjusts scrollTop and scrollLeft value.
     * @param {Number} overflowX    가로축 기준 영역 overflow 값
     * @param {Number} overflowY    세로축 기준 영역 overflow 값
     * @private
     */
    _adjustScroll: function(overflowX, overflowY) {
        var renderModel = this.grid.renderModel;

        if (overflowX) {
            this._adjustScrollLeft(overflowX, renderModel.get('scrollLeft'), renderModel.get('maxScrollLeft'));
        }
        if (overflowY) {
            this._adjustScrollTop(overflowY, renderModel.get('scrollTop'), renderModel.get('maxScrollTop'));
        }
    },

    /**
     * Adjusts scrollLeft value.
     * @param  {number} overflowX - 1 | 0 | -1
     * @param  {number} scrollLeft - Current scrollLeft value
     * @param  {number} maxScrollLeft - Max scrollLeft value
     * @private
     */
    _adjustScrollLeft: function(overflowX, scrollLeft, maxScrollLeft) {
        var adjusted = scrollLeft,
            pixelScale = this.scrollPixelScale;

        if (overflowX < 0) {
            adjusted = Math.max(0, scrollLeft - pixelScale);
        } else if (overflowX > 0) {
            adjusted = Math.min(maxScrollLeft, scrollLeft + pixelScale);
        }
        this.grid.renderModel.set('scrollLeft', adjusted);
    },

    /**
     * Adjusts scrollTop value.
     * @param  {number} overflowY - 1 | 0 | -1
     * @param  {number} scrollTop - Current scrollTop value
     * @param  {number} maxScrollTop - Max scrollTop value
     * @private
     */
    _adjustScrollTop: function(overflowY, scrollTop, maxScrollTop) {
        var adjusted = scrollTop,
            pixelScale = this.scrollPixelScale;

        if (overflowY < 0) {
            adjusted = Math.max(0, scrollTop - pixelScale);
        } else if (overflowY > 0) {
            adjusted = Math.min(maxScrollTop, scrollTop + pixelScale);
        }
        this.grid.renderModel.set('scrollTop', adjusted);
    },

    /**
     * Expands the 'this.inputRange' if rowspan data exists, and resets the 'range' attributes to the value.
     * @param {{column: number[], row: number[]}} [inputRange = this.inputRange] - Input range
     * @private
     */
    _resetRangeAttribute: function(inputRange) {
        var grid = this.grid,
            dataModel = grid.dataModel,
            hasSpannedRange, spannedRange, tmpRowRange;

        inputRange = inputRange || this.inputRange;
        if (!inputRange) {
            this.set('range', null);
            return;
        }

        spannedRange = {
            row: _.sortBy(inputRange.row),
            column: _.sortBy(inputRange.column)
        };

        if (dataModel.isRowSpanEnable()) {
            do {
                tmpRowRange = _.assign([], spannedRange.row);
                spannedRange = this._getRowSpannedIndex(spannedRange);

                hasSpannedRange = (
                    spannedRange.row[0] !== tmpRowRange[0] ||
                    spannedRange.row[1] !== tmpRowRange[1]
                );
            } while (hasSpannedRange);
        }

        this._setRangeMinMax(spannedRange.row, spannedRange.column);
        switch (this._selectionState) {
            case SELECTION_STATE.column:
                spannedRange.row = [0, dataModel.length - 1];
                break;
            case SELECTION_STATE.row:
                spannedRange.column = [0, grid.columnModel.getVisibleColumnModelList().length - 1];
                break;
            case SELECTION_STATE.cell:
            default:
                break;
        }

        this.set('range', spannedRange);
    },

    /**
     * Set minimum column range
     * @param {Array} range - Minimum column range
     */
    setMinimumColumnRange: function(range) {
        this._minimumColumnRange = _.extend(range);
    },

    /**
     * Unset minimum column range
     */
    unsetMinimumColumnRange: function() {
        this._minimumColumnRange = null;
    },

    /**
     * Set min, max value of range(row, column)
     * @param {Array} rowRange - Row range
     * @param {Array} columnRange - Column range
     * @private
     */
    _setRangeMinMax: function(rowRange, columnRange) {
        var grid = this.grid;

        if (rowRange) {
            rowRange[0] = Math.max(0, rowRange[0]);
            rowRange[1] = Math.min(grid.dataModel.length - 1, rowRange[1]);
        }

        if (columnRange) {
            columnRange[0] = Math.max(0, columnRange[0]);
            columnRange[1] = Math.min(grid.columnModel.getVisibleColumnModelList().length - 1, columnRange[1]);
        }
    },

    /**
     * row start index 기준으로 rowspan 을 확인하며 startRangeList 업데이트 하는 함수
     * @param {object} param - parameters
     * @private
     */
    _concatRowSpanIndexFromStart: function(param) {
        var startIndex = param.startIndex,
            endIndex = param.endIndex,
            columnName = param.columnName,
            rowSpanData = param.startRowSpanDataMap && param.startRowSpanDataMap[columnName],
            startIndexList = param.startIndexList,
            endIndexList = param.endIndexList,
            spannedIndex;

        if (!rowSpanData) {
            return;
        }

        if (!rowSpanData['isMainRow']) {
            spannedIndex = startIndex + rowSpanData['count'];
            startIndexList.push(spannedIndex);
        } else {
            spannedIndex = startIndex + rowSpanData['count'] - 1;
            if (spannedIndex > endIndex) {
                endIndexList.push(spannedIndex);
            }
        }
    },

    /**
     * row end index 기준으로 rowspan 을 확인하며 endRangeList 를 업데이트 하는 함수
     * @param {object} param - parameters
     * @private
     */
    _concatRowSpanIndexFromEnd: function(param) {
        var endIndex = param.endIndex,
            columnName = param.columnName,
            rowSpanData = param.endRowSpanDataMap && param.endRowSpanDataMap[columnName],
            endIndexList = param.endIndexList,
            dataModel = param.dataModel,
            spannedIndex, tmpRowSpanData;

        if (!rowSpanData) {
            return;
        }

        if (!rowSpanData['isMainRow']) {
            spannedIndex = endIndex + rowSpanData['count'];
            tmpRowSpanData = dataModel.at(spannedIndex).getRowSpanData(columnName);
            spannedIndex += tmpRowSpanData['count'] - 1;
            if (spannedIndex > endIndex) {
                endIndexList.push(spannedIndex);
            }
        } else {
            spannedIndex = endIndex + rowSpanData['count'] - 1;
            endIndexList.push(spannedIndex);
        }
    },

    /**
     * rowSpan 된 Index range 를 반환한다.
     * @param {{row: Array, column: Array}} spannedRange 인덱스 정보
     * @returns {{row: Array, column: Array}} New Range
     * @private
     */
    _getRowSpannedIndex: function(spannedRange) {
        var columnModelList = this.grid.columnModel.getVisibleColumnModelList()
                .slice(spannedRange.column[0], spannedRange.column[1] + 1),
            dataModel = this.grid.dataModel,
            startIndexList = [spannedRange.row[0]],
            endIndexList = [spannedRange.row[1]],
            startRow = dataModel.at(spannedRange.row[0]),
            endRow = dataModel.at(spannedRange.row[1]),
            newSpannedRange = $.extend({}, spannedRange),
            startRowSpanDataMap, endRowSpanDataMap, columnName, param;

        if (!startRow || !endRow) {
            return newSpannedRange;
        }

        startRowSpanDataMap = dataModel.at(spannedRange.row[0]).getRowSpanData();
        endRowSpanDataMap = dataModel.at(spannedRange.row[1]).getRowSpanData();

        //모든 열을 순회하며 각 열마다 설정된 rowSpan 정보에 따라 인덱스를 업데이트 한다.
        _.each(columnModelList, function(columnModel) {
            columnName = columnModel['columnName'];
            param = {
                columnName: columnName,
                startIndex: spannedRange.row[0],
                endIndex: spannedRange.row[1],
                endRowSpanDataMap: endRowSpanDataMap,
                startRowSpanDataMap: startRowSpanDataMap,
                startIndexList: startIndexList,
                endIndexList: endIndexList,
                dataModel: dataModel
            };
            this._concatRowSpanIndexFromStart(param);
            this._concatRowSpanIndexFromEnd(param);
        }, this);

        newSpannedRange.row = [Math.min.apply(null, startIndexList), Math.max.apply(null, endIndexList)];
        return newSpannedRange;
    }
});

module.exports = Selection;
