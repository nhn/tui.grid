/**
 * @fileoverview Selection 클래스 파일
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');
// var Layer = require('./selectionLayer');

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
            range: {
                column: [-1, -1],
                row: [-1, -1]
            },
            intervalIdForAutoScroll: 0,
            scrollPixelScale: 40,
            _isEnabled: true,
            _isShown: false
        });

        this.listenTo(this.grid.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this)
            .listenTo(this.grid.dataModel, 'add remove sort reset', this.endSelection, this);
    },

    /**
     * selection 을 enable 한다.
     */
    enable: function() {
        if (this.grid.option('useDataCopy')) {
            this._isEnabled = true;
        }
    },

    /**
     * selection 을 disable 한다.
     */
    disable: function() {
        this.endSelection();
        this._isEnabled = false;
    },


    isEnabled: function() {
        return this._isEnabled;
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
     * rowSpan 을 함께 계산한 범위를 반환한다.
     * @return {{row: array, column: array}} rowSpan 을 함께 계산한 범위정보
     */
    getRange: function() {
        return $.extend(true, {}, this.range);
    },

    /**
     *  현재 selection 범위내 데이터를 문자열 형태로 변환하여 반환한다.
     *  @return {String} selection 범위내 데이터 문자열
     */
    getSelectionToString: function() {
        var columnModelList = this.grid.columnModel.getVisibleColumnModelList()
                .slice(this.range.column[0], this.range.column[1] + 1),
            columnNameList = [],
            tmpString = [],
            strings = [],
            rowList, string;

        _.each(columnModelList, function(columnModel) {
            columnNameList.push(columnModel['columnName']);
        });

        rowList = this.grid.dataModel.slice(this.range.row[0], this.range.row[1] + 1);

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
     * 실제로 랜더링될 selection layer view 를 생성 후 반환한다.
     * @param {String} [whichSide='L'] 좌 우 영역중 어느 영역인지 여부
     * @return {Object} 해당 영역의 selection layer view 인스턴스
     */
    // createLayer: function(whichSide) {
    //     var layer = this._getLayer(whichSide);
    //
    //     if (layer && ne.util.isFunction(layer.destroy())) {
    //         layer.destroy();
    //     }
    //     layer = this.createView(Layer, {
    //         grid: this.grid,
    //         whichSide: whichSide,
    //         columnWidthList: this.grid.dimensionModel.getColumnWidthList(whichSide)
    //     });
    //
    //     if (whichSide === 'R') {
    //         this.rside = layer;
    //     } else {
    //         this.lside = layer;
    //     }
    //     return layer;
    // },

    /**
     * 전체 영역을 선택한다.
     */
    selectAll: function() {
        if (this._isEnabled) {
            this.startSelection(0, 0);
            this.updateSelection(this.grid.dataModel.length - 1, this.grid.columnModel.getVisibleColumnModelList().length - 1);
        }
    },

    /**
     * selection 영역 선택을 시작한다.
     * @param {Number} rowIndex 시작점의 row 인덱스 정보
     * @param {Number} columnIndex 시작점의 column 인덱스 정보
     */
    startSelection: function(rowIndex, columnIndex) {
        if (!this._isEnabled) {
            return;
        }
        this.range = this._adjustRange({
            row: [rowIndex, rowIndex],
            column: [columnIndex, columnIndex]
        });
        console.log('startSelection');
        console.log('range.row', this.range.row);
        console.log('range.column', this.range.column);
        this.show();
    },

    startByMousePosition: function(pageX, pageY) {
        var indexInfo = this._getIndexFromMousePosition(pageX, pageY);
        console.log('startByMousePosition', pageX, pageY);
        this.startSelection(indexInfo.row, indexInfo.column);
    },

    /**
     * selection 영역 선택을 확장한다.
     * @param {Number} rowIndex 확장할 지점의 row 인덱스 정보
     * @param {Number} columnIndex 확장할 지점의 column 인덱스 정보
     */
    updateSelection: function(rowIndex, columnIndex) {
        var focused;

        if (!this._isEnabled) {
            return;
        }

        if (!this.hasSelection()) {
            focused = this.grid.focusModel.indexOf(true);
            this.startSelection(focused.rowIdx, focused.columnIdx);
        }
        this.range = this._adjustRange({
            row: [this.range.row[0], rowIndex],
            column: [this.range.column[0], columnIndex]
        });
        this.show();
        this.grid.focusAt(rowIndex, columnIndex);
    },

    /**
     * selection 영역에 대한 mouseDown 퍼블릭 이벤트 핸들러
     * @param {event} mouseDownEvent Event object
     */
    updateByMousePosition: function(pageX, pageY) {
        var indexInfo = this._getIndexFromMousePosition(pageX, pageY);
        this.updateSelection(indexInfo.row, indexInfo.column);
    },

    /**
     * selection 영역 선택을 종료하고 selection 데이터를 초기화한다.
     */
    endSelection: function() {
        this.range.row[0] = this.range.row[1] = this.range.column[0] = this.range.column[1] = -1;
        this.hide();
        console.log('endSelection');
        console.log(this.range.row);
        console.log(this.range.column);
        // this.detachMouseEvent();
    },

    /**
     * dimension model 의 columnWidth 가 변경되었을 경우 크기를 재 계산하여 rendering 한다.
     * @private
     */
    _onColumnWidthChanged: function() {
        this.show();
    },

    _adjustRange: function(range) {
        var dataModel = this.grid.dataModel,
            columnFixCount = this.grid.columnModel.getVisibleColumnFixCount(),
            spannedRange, tmpRowRange;

        console.log('before row', range.row);
        console.log('before col', range.column);
        spannedRange = {
            row: _.sortBy(range.row),
            column: _.sortBy(range.column),
        }
        if (dataModel.isRowSpanEnable()) {
            do {
                tmpRowRange = _.assign([], spannedRange.row);
                spannedRange = this._getRowSpannedIndex(spannedRange);
            } while (spannedRange.row[0] !== tmpRowRange[0] || spannedRange.row[1] !== tmpRowRange[1]);
        }
        console.log('after row', spannedRange.row);
        console.log('after col', spannedRange.column);
        return spannedRange;
    },

    /**
     * 현재 selection range 정보를 기반으로 selection Layer 를 노출한다.
     */
    show: function() {
        if (!this._isEnabled || !this.hasSelection()) {
            return;
        }
        this._isShown = true;
        console.log('range.row', this.range.row);
        console.log('range.column', this.range.column);
        this.trigger('show', this.range);
        // this.lside.show(spannedRange);
        // this.rside.show({
        //     row: spannedRange.row,
        //     column: [Math.max(-1, spannedRange.column[0] - columnFixCount), Math.max(-1, spannedRange.column[1] - columnFixCount)]
        // });
        //selection 이 생성될 때에는 무조건 input 에 focus 가 가지 않도록 clipboard에 focus 를 준다.
        this.grid.focusClipboard();
    },

    /**
     * selection layer 를 숨긴다. 데이터는 초기화 되지 않는다.
     */
    hide: function() {
        this._isShown = false;
        this.trigger('hide');
        // if (this.lside) {
        //     this.lside.hide();
        // }
        // if (this.rside) {
        //     this.rside.hide();
        // }
    },

    /**
     * 현재 selection 레이어가 노출되어 있는지 확인한다.
     * @return {boolean}    레이어 노출여부
     */
    isShown: function() {
        return this._isShown;
    },

    /**
     * selection이 시작된 셀의 인덱스를 반환한다.
     * @return {{rowIdx: number, columnIdx: number}} 행과 열의 인덱스정보를 가진 객체
     */
    getStartIndex: function() {
        return {
            rowIdx: this.range.row[0],
            columnIdx: this.range.column[0]
        };
    },

    /**
     * selection이 끝나는 셀의 인덱스를 반환한다.
     * @return {{rowIdx: number, columnIdx: number}} 행과 열의 인덱스정보를 가진 객체
     */
    getEndIndex: function() {
        return {
            rowIdx: this.range.row[1],
            columnIdx: this.range.column[1]
        };
    },

    /**
     * Selection Layer View 를 반환한다.
     * @param {String} [whichSide='L'] 어느 영역의 layer 를 조회할지 여부. 'L|R' 중 하나를 지정한다.
     * @return {View.Selection.rside|View.Selection.lside} 해당 selection layer view 인스턴스
     * @private
     */
    // _getLayer: function(whichSide) {
    //     return whichSide === 'R' ? this.rside : this.lside;
    // },

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
     * selection 데이터가 존재하는지 확인한다.
     * @return {boolean}    selection 데이터 존재여부
     * @private
     */
    hasSelection: function() {
        return !(this.range.row[0] === -1);
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
