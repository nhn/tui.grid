/**
 * @fileoverview 크기에 관련된 데이터를 다루는 모델
 * @author NHN Ent. FE Development Team
 */
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
        this.listenTo(this.columnModel, 'columnModelChange', this._setColumnWidthVariables);

        this.on('change:width', this._onWidthChange, this);
        this.on('change:displayRowCount', this._setBodyHeight, this);
        this._setColumnWidthVariables();
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
            availableTotalWidth -= 1;
        }
        return availableTotalWidth;
    },

    /**
     * 주어진 컬럼 넓이값 배열에서 minimumColumnWidth 값보다 작은 값이 없도록 수정해준다.
     * @param {array} columnWidthList - 컬럼 넓이값 배열
     * @private
     */
    _applyMinimumColumnWidth: function(columnWidthList) {
        var minWidth = this.get('minimumColumnWidth');

        _.each(columnWidthList, function(width, index) {
            if (width < minWidth) {
                columnWidthList[index] = minWidth;
            }
        });
    },

    /**
     * 컬럼 넓이값의 배열에서, 넓이가 지정되지 않은 컬럼들의 값을 균등하게 채워준다.
     * @param {array} columnWidthList - 컬럼 넓이값 배열
     * @param {number} totalWidth - 전체 넓이
     * @return {array} - 값이 모두 채워진 새로운 배열
     * @private
     */
    _getAssignedColumnWidthList: function(columnWidthList, totalWidth) {
        var columnLength = columnWidthList.length,
            assignedTotal = 0,
            assignedCount = 0,
            assignedList = Array(columnLength),
            remainAvgWidth;

        _.each(columnWidthList, function(width, index) {
            if (width > 0) {
                assignedList[index] = width;
                assignedTotal += width;
                assignedCount += 1;
            }
        });
        remainAvgWidth = Math.round((totalWidth - assignedTotal) / (columnLength - assignedCount));

        _.each(assignedList, function(width, index) {
            if (!width) {
                assignedList[index] = remainAvgWidth;
            }
        });

        return assignedList;
    },

    /**
     * 컬럼 넓이값의 배열에서, fixed가 아닌 컬럼의 넓이에 추가적인 넓이값을 균등하게 더해준다.
     * @param {array} columnWidthList - 컬럼 넓이값 배열
     * @param {number} extraTotalWidth - 추가될 전체 넓이
     * @param {number} variableCount - 넓이가 가변적인(fixed가 아닌) 컬럼의 개수
     * @private
     */
    _addExtraColumnWidth: function(columnWidthList, extraTotalWidth, variableCount) {
        var extraWidthAvg = Math.round(extraTotalWidth / variableCount),
            fixedFlags = this.get('columnWidthFixedFlags'),
            extraAddedCount = 0,
            extraWidth;

        _.each(columnWidthList, function(width, index) {
            if (!fixedFlags[index]) {
                if (extraAddedCount === variableCount - 1) {
                    extraWidth = extraTotalWidth;
                } else {
                    extraWidth = extraWidthAvg;
                }
                columnWidthList[index] += extraWidth;
                extraTotalWidth -= extraWidth;
                extraAddedCount += 1;
            }
        });
    },
    /**
     * 컬럼 넓이값의 배열을 받아, 전체 넓이에 맞게 각 넓이값을 재조정하여 새로운 배열로 반환한다.
     * @param {array} columnWidthList - 컬럼 넓이값 배열
     * @return {array} - 조정된 넓이갑 배열
     * @private
     */
    _calculateColumnWidthList: function(columnWidthList) {
        var columnLength = columnWidthList.length,
            fixedFlags = this.get('columnWidthFixedFlags'),
            totalWidth = this._getAvailableTotalWidth(columnLength),
            newWidthList = this._getAssignedColumnWidthList(columnWidthList, totalWidth),
            extraTotalWidth = totalWidth,
            variableCount = 0;

        _.each(newWidthList, function(width, index) {
            extraTotalWidth -= width;
            if (!fixedFlags[index]) {
                variableCount += 1;
            }
        });

        if (extraTotalWidth > 0) {
            if (variableCount) {
                this._addExtraColumnWidth(newWidthList, extraTotalWidth, variableCount);
            } else {
                newWidthList[columnLength - 1] += extraTotalWidth;
            }
        }
        this._applyMinimumColumnWidth(newWidthList);

        return newWidthList;
    },

    /**
     * columnModel 에 설정된 width 값을 기준으로 widthList 를 작성한다.
     * @return {Array}  columnModel 에 설정된 width 값 기준의 너비 리스트
     * @private
     */
    _getOriginalColumnWidthList: function() {
        var columnModelList = this.columnModel.get('visibleList'),
            columnWidthList = [],
            columnWidthFixedFlags = [];

        _.each(columnModelList, function(columnModel) {
            columnWidthList.push(columnModel.width || 0);
            columnWidthFixedFlags.push(columnModel.isFixedWidth);
        });
        this.set('columnWidthFixedFlags', columnWidthFixedFlags);

        return this._calculateColumnWidthList(columnWidthList, true);
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
        //border 값(1px 도 함께 더한다.)
        return widthList.length ? Util.sum(widthList) + widthList.length + 1 : 0;
    },

    /**
     * columnWidthList 로 부터, lside 와 rside 의 전체 너비를 계산하여 저장한다.
     * @param {Array} [columnWidthList] 인자가 존재하지 않을 경우, 현재 columnModel 에 저장된 정보 기준으로 columnWidth 를 설정한다.
     * @private
     */
    _setColumnWidthVariables: function(columnWidthList) {
        var totalWidth = this.get('width'),
            columnFixIndex = this.columnModel.get('columnFixIndex'),
            maxLeftSideWidth = this._getMaxLeftSideWidth(),
            isSaveWidthList = false,
            rsideWidth, lsideWidth, lsideWidthList, rsideWidthList;

        if (!columnWidthList) {
            columnWidthList = this._getOriginalColumnWidthList();
            isSaveWidthList = true;
        }

        lsideWidthList = columnWidthList.slice(0, columnFixIndex);
        rsideWidthList = columnWidthList.slice(columnFixIndex);

        lsideWidth = this._getFrameWidth(lsideWidthList);
        if (maxLeftSideWidth < lsideWidth) {
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
            minWidth;
        //border 값(1px 도 함께 더한다.) columnFixIndex 가 0보다 클 경우, 좌우 나누어진 영역에 대한 보더값도 더한다.
        minWidth = columnFixIndex ? (columnFixIndex * (minimumColumnWidth + 1)) + 1 : 0;
        return minWidth;
    },
    /**
     * 열 고정 영역의 maximum width 값을 구한다.
     * @return {number} 열고정 영역의 최대 너비값.
     * @private
     */
    _getMaxLeftSideWidth: function() {
        var maxWidth = Math.ceil(this.get('width') * 0.9);
        maxWidth = Math.max(maxWidth, this._getMinLeftSideWidth());
        return maxWidth;
    },
    /**
     * 계산한 cell 의 위치를 리턴한다.
     * @param {Number|String} rowKey 데이터의 키값
     * @param {String} columnName   칼럼명
     * @return {{top: number, left: number, right: number, bottom: number}}
     */
    getCellPosition: function(rowKey, columnName) {
        var top, left = 0, right, bottom, i = 0,
            dataModel = this.grid.dataModel,
            rowHeight = this.get('rowHeight'),
            rowSpanData = dataModel.get(rowKey).getRowSpanData(columnName),
            rowIdx, spanCount,
            columnWidthList = this.get('columnWidthList'),
            columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
            columnIdx = this.grid.columnModel.indexOfColumnName(columnName, true);


        if (!rowSpanData.isMainRow) {
            rowKey = rowSpanData.mainRowKey;
            rowSpanData = dataModel.get(rowKey).getRowSpanData(columnName);
        }

        spanCount = rowSpanData.count || 1;

        rowIdx = dataModel.indexOfRowKey(rowKey);

        top = Util.getHeight(rowIdx, rowHeight);
        bottom = top + Util.getHeight(spanCount, rowHeight) - 1;

        if (columnFixIndex <= columnIdx) {
            i = columnFixIndex;
        }

        for (; i < columnIdx; i += 1) {
            //border 값(1px 도 함께 더한다.)
            left += columnWidthList[i] + 1;
        }
        //border 값(1px 도 함께 더한다.)
        right = left + columnWidthList[i] + 1;

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
        var curColumnWidthList = this.get('columnWidthList');
        this._setColumnWidthVariables(this._calculateColumnWidthList(curColumnWidthList));
    },

    /**
     * columnResize 발생 시 index 에 해당하는 컬럼의 width 를 변경하여 반영한다.
     * @param {Number} index    너비를 변경할 컬럼의 인덱스
     * @param {Number} width    변경할 너비 pixel값
     */
    setColumnWidth: function(index, width) {
        var columnWidthList = this.get('columnWidthList'),
            fixedFlags = this.get('columnWidthFixedFlags');

        if (!fixedFlags[index] && columnWidthList[index]) {
            columnWidthList[index] = width;
            this._setColumnWidthVariables(this._calculateColumnWidthList(columnWidthList));
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
     * 실제 조정된 column의 width 들을 반영한다.
     * @param {Array} columnWidthList   조정된 열의 너비 리스트
     * @param {Boolean} [whichSide]   어느 영역인지 여부. 'L|R' 중 하나를 인자로 넘긴다. 생략시 columnList 변경
     */
    setColumnWidthList: function(columnWidthList, whichSide) {
        var oppositeSide = (whichSide === 'L') ? 'R' : 'L',
            oppositeSideColumnWidthList = this.getColumnWidthList(oppositeSide) || [],
            newColumnWidthList;

        if (whichSide === 'L') {
            newColumnWidthList = columnWidthList.concat(oppositeSideColumnWidthList);
        } else if (whichSide === 'R') {
            newColumnWidthList = oppositeSideColumnWidthList.concat(columnWidthList);
        } else {
            newColumnWidthList = columnWidthList;
        }
        this._setColumnWidthVariables(newColumnWidthList);
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
