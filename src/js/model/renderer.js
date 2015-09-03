/**
 * @fileoverview Rendering 모델
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');
var RowList = require('./rowList');

/**
 * View 에서 Rendering 시 사용할 객체
 * @constructor Model.Renderer
 */
var Renderer = Model.extend(/**@lends Model.Renderer.prototype */{
    defaults: {
        top: 0,
        scrollTop: 0,
        scrollLeft: 0,
        maxScrollLeft: 0,
        startIndex: 0,
        endIndex: 0,
        startNumber: 1,
        lside: null,
        rside: null
    },

    /**
     * 생성자 함수
     */
    initialize: function() {
        var lside, rside;

        Model.prototype.initialize.apply(this, arguments);

        this.setOwnProperties({
            timeoutIdForRowListChange: 0,
            timeoutIdForRefresh: 0,
            isColumnModelChanged: false
        });

        //lside 와 rside 별 Collection 생성
        lside = new RowList([], {
            grid: this.grid
        });
        rside = new RowList([], {
            grid: this.grid
        });
        this.set({
            lside: lside,
            rside: rside
        });

        //원본 rowList 의 상태 값 listening
        this.listenTo(this.grid.columnModel, 'all', this._onColumnModelChange, this)
            .listenTo(this.grid.dataModel, 'add remove sort reset', this._onRowListChange, this)
            .listenTo(this.grid.dimensionModel, 'change:width', this._onWidthChange, this)
            .listenTo(lside, 'valueChange', this._onValueChange, this)
            .listenTo(rside, 'valueChange', this._onValueChange, this);
    },

    /**
     * lside 와 rside collection 에서 value 값이 변경되었을 시 executeRelation 을 수행하기 위한 이벤트 핸들러
     * @param {number} rowIndex row 의 index 값
     * @private
     */
    _onValueChange: function(rowIndex) {
        this.executeRelation(rowIndex);
    },

    /**
     * Event handler for 'chage:width' event on Dimension.
     */
    _onWidthChange: function() {
        var dimension = this.grid.dimensionModel;
        this.set('maxScrollLeft', dimension.getFrameWidth('R') - dimension.get('rsideWidth'));
    },

    /**
     * 내부 변수를 초기화 한다.
     */
    initializeVariables: function() {
        this.set({
            top: 0,
            scrollTop: 0,
            $scrollTarget: null,
            scrollLeft: 0,
            startIndex: 0,
            endIndex: 0,
            startNumber: 1
        });
    },

    /**
     * 열고정 영역 또는 열고정이 아닌 영역에 대한 Render Collection 을 반환한다.
     * @param {String} [whichSide='R']    어느 영역인지 여부. 'L|R' 중에 하나의 값을 넘긴다.
     * @return {Object} collection  해당 영역의 랜더 데이터 콜랙션
     */
    getCollection: function(whichSide) {
        return this.get(ne.util.isString(whichSide) ? whichSide.toLowerCase() + 'side' : 'rside');
    },

    /**
     * Data.ColumnModel 이 변경되었을 때 열고정 영역 frame, 열고정 영역이 아닌 frame 의 list 를 재생성 하기 위한 이벤트 핸들러
     * @private
     */
    _onColumnModelChange: function() {
        this.set({
            scrollTop: 0,
            top: 0,
            startIndex: 0,
            endIndex: 0
        });
        this.isColumnModelChanged = true;
        clearTimeout(this.timeoutIdForRefresh);
        this.timeoutIdForRefresh = setTimeout($.proxy(this.refresh, this), 0);
    },

    /**
     * Data.RowList 가 변경되었을 때 열고정 영역 frame, 열고정 영역이 아닌 frame 의 list 를 재생성 하기 위한 이벤트 핸들러
     * @private
     */
    _onRowListChange: function() {
        clearTimeout(this.timeoutIdForRefresh);
        this.timeoutIdForRefresh = setTimeout($.proxy(this.refresh, this, true), 0);
    },

    /**
     * rendering 할 index 범위를 결정한다.
     * Smart rendering 을 사용하지 않을 경우 전체 범위로 랜더링한다.
     * @private
     */
    _setRenderingRange: function() {
        this.set({
            startIndex: 0,
            endIndex: this.grid.dataModel.length - 1
        });
    },

    /**
     * rendering 할 데이터를 생성한다.
     * @param {boolean} isDataModelChanged - The boolean value whether dataModel has changed
     */
    refresh: function(isDataModelChanged) {
        this._setRenderingRange(this.get('scrollTop'));

        //TODO : rendering 해야할 데이터만 가져온다.
        //TODO : eslint 에러 수정
        var columnFixIndex = this.grid.columnModel.get('columnFixIndex'), // eslint-disable-line
            columnList = this.grid.columnModel.get('visibleList'),
            columnNameList = _.pluck(columnList, 'columnName'),

            lsideColumnList = columnNameList.slice(0, columnFixIndex),
            rsideColumnList = columnNameList.slice(columnFixIndex),

            lsideRowList = [],
            rsideRowList = [],
            lsideRow = [],
            rsideRow = [],
            startIndex = this.get('startIndex'),
            endIndex = this.get('endIndex'),
            num = this.get('startNumber') + startIndex,
            len,
            i,
            rowModel,
            rowKey;

        for (i = startIndex; i < endIndex + 1; i += 1) {
            rowModel = this.grid.dataModel.at(i);
            if (rowModel) {
                rowKey = rowModel.get('rowKey');

                //데이터 초기화
                lsideRow = {
                    '_extraData': rowModel.get('_extraData'),
                    'rowKey': rowKey
                };
                rsideRow = {
                    '_extraData': rowModel.get('_extraData'),
                    'rowKey': rowKey
                };

                //lside 데이터 먼저 채운다.
                _.each(lsideColumnList, function (columnName) { // eslint-disable-line
                    if (columnName === '_number') {
                        lsideRow[columnName] = num++; // eslint-disable-line
                    } else {
                        lsideRow[columnName] = rowModel.get(columnName);
                    }
                });

                _.each(rsideColumnList, function (columnName) { // eslint-disable-line
                    if (columnName === '_number') {
                        rsideRow[columnName] = num++; // eslint-disable-line
                    } else {
                        rsideRow[columnName] = rowModel.get(columnName);
                    }
                });
                lsideRowList.push(lsideRow);
                rsideRowList.push(rsideRow);
            }
        }
        //lside 와 rside 를 초기화한다.
        this.get('lside').clear().reset(lsideRowList, {
            parse: true
        });
        this.get('rside').clear().reset(rsideRowList, {
            parse: true
        });


        len = rsideRowList.length + startIndex;

        //relation 을 수행한다.
        for (i = startIndex; i < len; i += 1) {
            this.executeRelation(i);
        }
        //컬럼모델의 변경이 있을 경우 columnModelChanged 이벤트를 발생한다.
        if (this.isColumnModelChanged) {
            this.trigger('columnModelChanged', this.get('top'));
            this.isColumnModelChanged = false;
        } else {
            this.trigger('rowListChanged', isDataModelChanged);
        }
        this.trigger('refresh', this.get('top'));
    },

    /**
     * columnName 으로 lside 와 rside rendering collection 중 하나를 반환한다.
     * @param {String} columnName   컬럼명
     * @return {Collection} 컬럼명에 해당하는 영역의 콜랙션
     * @private
     */
    _getCollectionByColumnName: function(columnName) {
        var lside = this.get('lside'),
            collection;

        if (lside.at(0) && lside.at(0).get(columnName)) {
            collection = lside;
        } else {
            collection = this.get('rside');
        }
        return collection;
    },

    /**
     * 셀 데이터를 반환한다.
     * @param {number} rowKey   데이터의 키값
     * @param {String} columnName   컬럼명
     * @return {object} cellData 셀 데이터
     * @example
     =>
     {
         rowKey: rowKey,
         columnName: columnName,
         value: value,
         rowSpan: rowSpanData.count,
         isMainRow: rowSpanData.isMainRow,
         mainRowKey: rowSpanData.mainRowKey,
         isEditable: isEditable,
         isDisabled: isDisabled,
         optionList: [],
         className: row.getClassNameList(columnName).join(' '),
         changed: []    //변경된 프로퍼티 목록들
     }
     */
    getCellData: function(rowKey, columnName) {
        var collection = this._getCollectionByColumnName(columnName),
            row = collection.get(rowKey);
        if (row) {
           return row.get(columnName);
        }
    },

    /**
     * rowIndex 에 해당하는 relation 을 수행한다.
     * @param {Number} rowIndex row 의 index 값
     */
    executeRelation: function(rowIndex) {
        var row = this.grid.dataModel.at(rowIndex),
            renderIdx = rowIndex - this.get('startIndex'),
            rowModel, relationResult;
        relationResult = row.getRelationResult();

        _.each(relationResult, function(changes, columnName) {
            rowModel = this._getCollectionByColumnName(columnName).at(renderIdx);
            if (rowModel) {
                rowModel.setCell(columnName, changes);
            }
        }, this);
    },

    /**
     * Destroys itself
     */
    _destroy: function() {
        clearTimeout(this.timeoutIdForRefresh);
    }
});

module.exports = Renderer;
