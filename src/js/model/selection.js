/**
 * @fileoverview Selection 클래스 파일
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');

/**
 *  selection layer 의 컨트롤을 담당하는 틀래스
 *  @module view/selection
 */
var Selection = Model.extend(/**@lends module:view/selection.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     */
    initialize: function() {
        Model.prototype.initialize.apply(this, arguments);

        this.setOwnProperties({
            inputRange: null,
            intervalIdForAutoScroll: 0,
            scrollPixelScale: 40,
            _isEnabled: true,
            _isShown: false
        });

        this.listenTo(this.grid.dataModel, 'add remove sort reset', this.end);
    },

    defaults: {
        range: null
    },

    /**
     * Enables the selection.
     */
    enable: function() {
        if (this.grid.option('useDataCopy')) {
            this._isEnabled = true;
        }
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
     * @return {[type]} [description]
     */
    isEnabled: function() {
        return this._isEnabled;
    },

    /**
     * Starts the selection.
     * @param {Number} rowIndex - Row index
     * @param {Number} columnIndex - Column index
     */
    start: function(rowIndex, columnIndex) {
        if (!this._isEnabled) {
            return;
        }
        this.inputRange = {
            row: [rowIndex, rowIndex],
            column: [columnIndex, columnIndex]
        };
        this._resetRangeAttribute();
        this.grid.focusClipboard();
    },

    /**
     * Starts the selection by mouse position.
     * @param {number} pageX - X position relative to the document
     * @param {number} pageY - Y position relative to the document
     */
    startByMousePosition: function(pageX, pageY) {
        var pos = this._getIndexFromMousePosition(pageX, pageY);
        this.start(pos.row, pos.column);
    },

    /**
     * Updates the selection range.
     * @param {Number} rowIndex - Row index
     * @param {Number} columnIndex - Column index
     */
    update: function(rowIndex, columnIndex) {
        var focused;

        if (!this._isEnabled || !this.inputRange || rowIndex < 0 || columnIndex < 0) {
            return;
        }

        if (!this.hasSelection()) {
            focused = this.grid.focusModel.indexOf(true);
            this.start(focused.rowIdx, focused.columnIdx);
        }
        this.inputRange.row[1] = rowIndex;
        this.inputRange.column[1] = columnIndex;
        this._resetRangeAttribute();
        this.grid.focusClipboard();
        this.grid.focusAt(rowIndex, columnIndex);
    },

    /**
     * Updates the selection range by mouse position.
     * @param {number} pageX - X position relative to the document
     * @param {number} pageY - Y position relative to the document
     */
    updateByMousePosition: function(pageX, pageY) {
        var pos = this._getIndexFromMousePosition(pageX, pageY),
            self = this;

        if (this._isAutoScrollable(pos.overflowX, pos.overflowY)) {
            this.stopAutoScroll();
            this.intervalIdForAutoScroll = setInterval(
                _.bind(this._adjustScroll, this, pos.overflowX, pos.overflowY)
            );
        }
        this.update(pos.row, pos.column);
    },

    /**
     * selection 영역 선택을 종료하고 selection 데이터를 초기화한다.
     */
    end: function() {
        this.inputRange = null;
        this.set('range', null);
    },

    /**
     * Stops the auto-scroll interval.
     */
    stopAutoScroll: function() {
        clearInterval(this.intervalIdForAutoScroll);
    },

    /**
     * Selects all data range.
     */
    selectAll: function() {
        if (this._isEnabled) {
            this.start(0, 0);
            this.update(this.grid.dataModel.length - 1, this.grid.columnModel.getVisibleColumnModelList().length - 1);
        }
    },

    /**
     * Returns the row and column indexes of the starting position.
     * @return {{rowIdx: number, columnIdx: number}} Objects containing indexes
     */
    getStartIndex: function() {
        var range = this.get('range');
        return {
            rowIdx: range.row[0],
            columnIdx: range.column[0]
        };
    },

    /**
     * Returns the row and column indexes of the ending position.
     * @return {{rowIdx: number, columnIdx: number}} Objects containing indexes
     */
    getEndIndex: function() {
        var range = this.get('range');
        return {
            rowIdx: range.row[1],
            columnIdx: range.column[1]
        };
    },

    /**
     * selection 데이터가 존재하는지 확인한다.
     * @return {boolean}    selection 데이터 존재여부
     * @private
     */
    hasSelection: function() {
        return !!this.get('range');
    },

    /**
     *  현재 selection 범위내 데이터를 문자열 형태로 변환하여 반환한다.
     *  @return {String} selection 범위내 데이터 문자열
     */
    getSelectionToString: function() {
        var columnNameList = [],
            tmpString = [],
            strings = [],
            grid = this.grid,
            range = this.get('range'),
            columnModelList, rowList, string;

        columnModelList = grid.columnModel.getVisibleColumnModelList().slice(range.column[0], range.column[1] + 1);
        _.each(columnModelList, function(columnModel) {
            columnNameList.push(columnModel['columnName']);
        });

        rowList = grid.dataModel.slice(range.row[0], range.row[1] + 1);

        _.each(rowList, function(row) {
            tmpString = [];
            _.each(columnNameList, function(columnName) {
                tmpString.push(row.getVisibleText(columnName));
            });
            strings.push(tmpString.join('\t'));
        });

        string = strings.join('\n');
        return string;
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
     * scrollTop 과 scrollLeft 값을 조정한다.
     * @param {Number} overflowX    가로축 기준 영역 overflow 값
     * @param {Number} overflowY    세로축 기준 영역 overflow 값
     * @private
     */
    _adjustScroll: function(overflowX, overflowY) {
        var renderModel = this.grid.renderModel,
            scrollLeft = renderModel.get('scrollLeft'),
            maxScrollLeft = renderModel.get('maxScrollLeft'),
            scrollTop = renderModel.get('scrollTop');

        if (overflowX < 0) {
            renderModel.set('scrollLeft', Math.min(Math.max(0, scrollLeft - this.scrollPixelScale), maxScrollLeft));
        } else if (overflowX > 0) {
            renderModel.set('scrollLeft', Math.min(Math.max(0, scrollLeft + this.scrollPixelScale), maxScrollLeft));
        }

        /* istanbul ignore next: scrollTop 은 보정로직과 얽혀있어 확인이 어렵기 때문에 무시한다. */
        if (overflowY < 0) {
            renderModel.set('scrollTop', Math.max(0, scrollTop - this.scrollPixelScale));
        } else if (overflowY > 0) {
            renderModel.set('scrollTop', Math.max(0, scrollTop + this.scrollPixelScale));
        }
    },

    /**
     * 마우스 위치 정보에 해당하는 row 와 column index 를 반환한다.
     * @param {Number} pageX    마우스 x좌표
     * @param {Number} pageY    마우스 y 좌표
     * @return {{row: number, column: number, overflowX: number, overflowY: number}} row, column의 인덱스 정보와 x, y축 overflow 정보.
     */
    _getIndexFromMousePosition: function(pageX, pageY) {
        var containerPos = this._getContainerPosition(pageX, pageY),
            dimensionModel = this.grid.dimensionModel,
            renderModel = this.grid.renderModel,
            columnWidthList = dimensionModel.getColumnWidthList(),
            scrollTop = renderModel.get('scrollTop'),
            scrollLeft = renderModel.get('scrollLeft'),
            totalColumnWidth = dimensionModel.getFrameWidth(),
            dataPosY = containerPos.pageY + scrollTop,
            dataPosX = containerPos.pageX,
            overflowX = 0,
            overflowY = 0,
            isLside = (dimensionModel.get('lsideWidth') > containerPos.pageX),
            len = columnWidthList.length,
            curWidth = 0,
            height = this.grid.option('scrollX') ?
                dimensionModel.get('bodyHeight') - this.grid.scrollBarSize : dimensionModel.get('bodyHeight'),
            width = this.grid.option('scrollY') ?
                dimensionModel.get('width') - this.grid.scrollBarSize : dimensionModel.get('width'),
            rowIdx, columnIdx;

        if (!isLside) {
            dataPosX = dataPosX + scrollLeft;
        }
        rowIdx = Math.max(0, Math.min(Math.floor(dataPosY / (dimensionModel.get('rowHeight') + 1)), this.grid.dataModel.length - 1));

        if (containerPos.pageY < 0) {
            overflowY = -1;
        } else if (containerPos.pageY > height) {
            overflowY = 1;
        }

        if (containerPos.pageX < 0) {
            overflowX = -1;
        } else if (containerPos.pageX > width) {
            overflowX = 1;
        }

        if (dataPosX < 0) {
            columnIdx = 0;
        } else if (totalColumnWidth < dataPosX) {
            columnIdx = len - 1;
        } else {
            ne.util.forEachArray(columnWidthList, function(columnWidth, i) {
                curWidth += columnWidth + 1;
                if (dataPosX <= curWidth) {
                    columnIdx = i;
                    return false;
                }
            });
        }

        return {
            row: rowIdx,
            column: columnIdx - this.grid.columnModel.getVisibleMetaColumnCount(),
            overflowX: overflowX,
            overflowY: overflowY
        };
    },

    /**
     * Expands the 'this.inputRange' if rowspan data exists, and resets the 'range' attributes to the value.
     * @private
     */
    _resetRangeAttribute: function() {
        var dataModel = this.grid.dataModel,
            columnFixCount = this.grid.columnModel.getVisibleColumnFixCount(),
            spannedRange = null,
            tmpRowRange;

        if (this.inputRange) {
            spannedRange = {
                row: _.sortBy(this.inputRange.row),
                column: _.sortBy(this.inputRange.column),
            }
            if (dataModel.isRowSpanEnable()) {
                do {
                    tmpRowRange = _.assign([], spannedRange.row);
                    spannedRange = this._getRowSpannedIndex(spannedRange);
                } while (spannedRange.row[0] !== tmpRowRange[0] || spannedRange.row[1] !== tmpRowRange[1]);
            }
        }
        this.set('range', spannedRange);
    },

    /**
     * 마우스 위치 정보에 해당하는 grid container 기준 pageX 와 pageY 를 반환한다.
     * @param {Number} pageX    마우스 x 좌표
     * @param {Number} pageY    마우스 y 좌표
     * @return {{pageX: number, pageY: number}} 그리드 container 기준의 pageX, pageY 값
     * @private
     */
    _getContainerPosition: function(pageX, pageY) {
        var dimensionModel = this.grid.dimensionModel,
            containerPosX = pageX - dimensionModel.get('offsetLeft'),
            containerPosY = pageY - (dimensionModel.get('offsetTop') + dimensionModel.get('headerHeight') + 2);

        return {
            pageX: containerPosX,
            pageY: containerPosY
        };
    },

    /**
     * row start index 기준으로 rowspan 을 확인하며 startRangeList 업데이트 하는 함수
     * @param {object} param - parameters
     */
    _concatRowSpanIndexFromStart: function(param) {
        var startIndex = param.startIndex,
            endIndex = param.endIndex,
            columnName = param.columnName,
            rowSpanData = param.startRowSpanDataMap && param.startRowSpanDataMap[columnName],
            startIndexList = param.startIndexList,
            endIndexList = param.endIndexList,
            spannedIndex;

        if (rowSpanData) {
            if (!rowSpanData['isMainRow']) {
                spannedIndex = startIndex + rowSpanData['count'];
                startIndexList.push(spannedIndex);
            } else {
                spannedIndex = startIndex + rowSpanData['count'] - 1;
                if (spannedIndex > endIndex) {
                    endIndexList.push(spannedIndex);
                }
            }
        }
    },

    /**
     * row end index 기준으로 rowspan 을 확인하며 endRangeList 를 업데이트 하는 함수
     * @param {object} param - parameters
     */
    _concatRowSpanIndexFromEnd: function(param) {
        var endIndex = param.endIndex,
            columnName = param.columnName,
            rowSpanData = param.endRowSpanDataMap && param.endRowSpanDataMap[columnName],
            endIndexList = param.endIndexList,
            dataModel = param.dataModel,
            spannedIndex, tmpRowSpanData;

        if (rowSpanData) {
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
