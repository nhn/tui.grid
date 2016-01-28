/**
 * @fileoverview Rendering 모델
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');
var RowList = require('./rowList');
var renderStateMap = require('../common/constMap').renderState;
var util = require('../common/util');

/**
 * View 에서 Rendering 시 사용할 객체
 * @module model/renderer
 */
var Renderer = Model.extend(/**@lends module:model/renderer.prototype */{
    /**
     * @extends module:base/model
     * @constructs
     */
    initialize: function(attrs, options) {
        var lside, rside, rowListOptions;

        this.setOwnProperties({
            dataModel: options.dataModel,
            columnModel: options.columnModel,
            dimensionModel: options.dimensionModel,
            timeoutIdForRefresh: 0,
            isColumnModelChanged: false
        });
        rowListOptions = {
            dataModel: this.dataModel,
            columnModel: this.columnModel
        };

        lside = new RowList([], rowListOptions);
        rside = new RowList([], rowListOptions);
        this.set({
            lside: lside,
            rside: rside
        });

        this.listenTo(this.columnModel, 'all', this._onColumnModelChange)
            .listenTo(this.dataModel, 'add remove sort reset', this._onRowListChange)
            .listenTo(this.dataModel, 'beforeReset', this._onBeforeResetData)
            .listenTo(lside, 'valueChange', this._executeRelation)
            .listenTo(rside, 'valueChange', this._executeRelation)
            .listenTo(this.dimensionModel, 'change:width', this._updateMaxScrollLeft)
            .listenTo(this.dimensionModel, 'change:totalRowHeight change:scrollBarSize change:bodyHeight',
                this._updateMaxScrollTop);

        if (this.get('showDummyRows')) {
            this.listenTo(this.dimensionModel, 'change:displayRowCount', this._resetDummyRows)
        }

        this._updateMaxScrollLeft();
    },

    defaults: {
        top: 0,
        scrollTop: 0,
        scrollLeft: 0,
        maxScrollLeft: 0,
        maxScrollTop: 0,
        startIndex: 0,
        endIndex: 0,
        startNumber: 1,
        lside: null,
        rside: null,
        showDummyRows: false,
        dummyRowCount: 0,

        // text that will be shown if no data to render (custom value set by user)
        emptyMessage: null,

        // constMap.renderState
        state: renderStateMap.EMPTY
    },

    /**
     * Event handler for 'chage:width' event on Dimension.
     * @private
     */
    _updateMaxScrollLeft: function() {
        var dimension = this.dimensionModel;
        this.set('maxScrollLeft', dimension.getFrameWidth('R') - dimension.get('rsideWidth'));
    },

    /**
     * Event handler to reset 'maxScrollTop' attribute.
     * @private
     */
    _updateMaxScrollTop: function() {
        var dimension = this.dimensionModel,
            maxScrollTop = dimension.get('totalRowHeight') - dimension.get('bodyHeight') + dimension.get('scrollBarSize');

        this.set('maxScrollTop', maxScrollTop);
    },

    /**
     * Event handler for 'beforeReset' event on dataModel
     * @private
     */
    _onBeforeResetData: function() {
        this.set('state', renderStateMap.LOADING);
    },

    /**
     * Initializes own properties.
     * (called by module:addon/net)
     */
    initializeVariables: function() {
        this.set({
            top: 0,
            scrollTop: 0,
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
        return this.get(tui.util.isString(whichSide) ? whichSide.toLowerCase() + 'side' : 'rside');
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
     * Resets dummy rows and trigger 'rowListChanged' event.
     * @private
     */
    _resetDummyRows: function() {
        this._clearDummyRows();
        this._fillDummyRows();
        this.trigger('rowListChanged');
    },

    /**
     * rendering 할 index 범위를 결정한다.
     * Smart rendering 을 사용하지 않을 경우 전체 범위로 랜더링한다.
     * @private
     */
    _setRenderingRange: function() {
        this.set({
            startIndex: 0,
            endIndex: this.dataModel.length - 1
        });
    },

    /**
     * Returns the new data object for rendering based on rowDataModel and specified column names.
     * @param  {Object} rowDataModel - Instance of module:model/data/row
     * @param  {Array.<String>} columnNames - Column names
     * @param  {Number} rowNum - Row number
     * @return {Object} - view data object
     * @private
     */
    _createViewDataFromDataModel: function(rowDataModel, columnNames, rowNum) {
        var viewData = {
            rowKey: rowDataModel.get('rowKey'),
            _extraData: rowDataModel.get('_extraData')
        };

        _.each(columnNames, function(columnName) {
            var value = rowDataModel.get(columnName);
            if (columnName === '_number') {
                value = rowNum;
            }
            viewData[columnName] = value;
        });

        return viewData;
    },

    /**
     * Returns the object that contains two array of column names splitted by columnFixCount.
     * @return {{lside: Array, rside: Array}} - Column names map
     * @private
     */
    _getColumnNamesOfEachSide: function() {
        var columnFixCount = this.columnModel.getVisibleColumnFixCount(true),
            columnModels = this.columnModel.getVisibleColumnModelList(null, true),
            columnNames = _.pluck(columnModels, 'columnName');

        return {
            lside: columnNames.slice(0, columnFixCount),
            rside: columnNames.slice(columnFixCount)
        }
    },

    /**
     * Resets specified view model list.
     * @param  {String} attrName - 'lside' or 'rside'
     * @param  {Object} viewData - Converted data for rendering view
     * @private
     */
    _resetViewModelList: function(attrName, viewData) {
        this.get(attrName).clear().reset(viewData, {
            parse: true
        });
    },

    /**
     * Resets both sides(lside, rside) of view model list with given range of data model list.
     * @param  {Number} startIndex - Start index
     * @param  {Number} endIndex - End index
     * @private
     */
    _resetAllViewModelListWithRange: function(startIndex, endIndex) {
        var columnNamesMap = this._getColumnNamesOfEachSide(),
            rowNum = this.get('startNumber') + startIndex,
            lsideData = [],
            rsideData = [],
            rowDataModel, i, len;

        for (i = startIndex; i <= endIndex; i += 1) {
            rowDataModel = this.dataModel.at(i);
            lsideData.push(this._createViewDataFromDataModel(rowDataModel, columnNamesMap.lside, rowNum));
            rsideData.push(this._createViewDataFromDataModel(rowDataModel, columnNamesMap.rside));
            rowNum += 1;
        }

        this._resetViewModelList('lside', lsideData);
        this._resetViewModelList('rside', rsideData);
    },

    /**
     * Returns the count of rows (except dummy rows) in view model list
     * @return {Number} Count of rows
     * @private
     */
    _getActualRowCount: function() {
        return this.get('endIndex') - this.get('startIndex') + 1;
    },

    /**
     * Removes all dummy rows in the view model list.
     * @private
     */
    _clearDummyRows: function() {
        var dataRowCount = this.get('endIndex') - this.get('startIndex') + 1;

        _.each(['lside', 'rside'], function(attrName) {
            var rowList = this.get(attrName);
            while (rowList.length > dataRowCount) {
                rowList.pop();
            }
        }, this);
    },

    /**
     * fills the empty area with dummy rows.
     * @private
     */
    _fillDummyRows: function() {
        var displayRowCount = this.dimensionModel.get('displayRowCount'),
            actualRowCount = this._getActualRowCount(),
            dummyRowCount = Math.max(displayRowCount - actualRowCount, 0);

        _.times(dummyRowCount, function() {
            this.get('lside').add({});
            this.get('rside').add({});
        }, this);
        this.set('dummyRowCount', dummyRowCount);
    },

    /**
     * Refreshes the rendering range and the list of view models, and triggers events.
     * @param {Boolean} isDataModelChanged - The boolean value whether dataModel has changed
     */
    refresh: function(isDataModelChanged) {
        var startIndex, endIndex, i;

        this._setRenderingRange(this.get('scrollTop'));
        startIndex = this.get('startIndex');
        endIndex = this.get('endIndex');

        this._resetAllViewModelListWithRange(startIndex, endIndex);
        if (this.get('showDummyRows')) {
            this._fillDummyRows();
        }

        for (i = startIndex; i <= endIndex; i += 1) {
            this._executeRelation(i);
        }

        if (this.isColumnModelChanged) {
            this.trigger('columnModelChanged');
            this.isColumnModelChanged = false;
        } else {
            this.trigger('rowListChanged', isDataModelChanged);
        }
        this._refreshState();
        this.trigger('refresh');
    },

    /**
     * Set state value based on the DataModel.length
     * @private
     */
    _refreshState: function() {
        if (this.dataModel.length) {
            this.set('state', renderStateMap.DONE);
        } else {
            this.set('state', renderStateMap.EMPTY);
        }
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
     * Executes the relation of the row identified by rowIndex
     * @param {Number} rowIndex - Row index
     * @private
     */
    _executeRelation: function(rowIndex) {
        var row = this.dataModel.at(rowIndex),
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
     * @private
     */
    _destroy: function() {
        clearTimeout(this.timeoutIdForRefresh);
    }
});

module.exports = Renderer;
