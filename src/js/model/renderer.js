/**
 * @fileoverview Rendering 모델
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');

var Model = require('../base/model');
var RowList = require('./rowList');
var renderStateMap = require('../common/constMap').renderState;
var CELL_BORDER_WIDTH = require('../common/constMap').dimension.CELL_BORDER_WIDTH;

var DATA_LENGTH_FOR_LOADING = 1000;

/**
 * View 에서 Rendering 시 사용할 객체
 * @module model/renderer
 * @extends module:base/model
 * @param {Object} attrs - Attributes
 * @param {Object} options - Options
 * @ignore
 */
var Renderer = Model.extend(/**@lends module:model/renderer.prototype */{
    initialize: function(attrs, options) {
        var lside, rside, rowListOptions;

        this.setOwnProperties({
            dataModel: options.dataModel,
            columnModel: options.columnModel,
            focusModel: options.focusModel,
            dimensionModel: options.dimensionModel,
            coordRowModel: options.coordRowModel,
            coordColumnModel: options.coordColumnModel
        });

        rowListOptions = {
            dataModel: this.dataModel,
            columnModel: this.columnModel,
            focusModel: this.focusModel
        };

        lside = new RowList([], rowListOptions);
        rside = new RowList([], rowListOptions);
        this.set({
            lside: lside,
            rside: rside
        });

        this.listenTo(this.columnModel, 'columnModelChange change', this._onColumnModelChange)
            .listenTo(this.dataModel, 'add remove sort reset delRange', this._onDataListChange)
            .listenTo(this.dataModel, 'add', this._onAddDataModel)
            .listenTo(this.dataModel, 'beforeReset', this._onBeforeResetData)
            .listenTo(lside, 'valueChange', this._executeRelation)
            .listenTo(rside, 'valueChange', this._executeRelation)
            .listenTo(this.focusModel, 'change:editingAddress', this._onEditingAddressChange)
            .listenTo(this.coordRowModel, 'reset', this._onChangeRowHeights)
            .listenTo(this.dimensionModel, 'change:width', this._updateMaxScrollLeft)
            .listenTo(this.dimensionModel, 'change:totalRowHeight change:scrollBarSize change:bodyHeight',
                this._updateMaxScrollTop);

        if (this.get('showDummyRows')) {
            this.listenTo(this.dimensionModel, 'change:bodyHeight change:totalRowHeight', this._resetDummyRowCount);
            this.on('change:dummyRowCount', this._resetDummyRows);
        }

        this._onChangeLayoutBound = _.bind(this._onChangeLayout, this);

        this.listenTo(this.dimensionModel, 'columnWidthChanged', this.finishEditing);

        this._updateMaxScrollLeft();
    },

    defaults: {
        top: 0,
        bottom: 0,
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
        state: renderStateMap.DONE
    },

    /**
     * Event handler for change:scrollTop and change:scrollLeft.
     * @private
     */
    _onChangeLayout: function() {
        this.focusModel.finishEditing();
        this.focusModel.focusClipboard();
    },

    /**
     * Event handler for 'reset' event on coordRowModel
     * @private
     */
    _onChangeRowHeights: function() {
        var coordRowModel = this.coordRowModel;
        var lside = this.get('lside');
        var rside = this.get('rside');
        var len = lside.length;
        var i = 0;
        var height;

        for (; i < len; i += 1) {
            height = coordRowModel.getHeightAt(i);
            lside.at(i).set('height', height);
            rside.at(i).set('height', height);
        }
    },

    /**
     * Event handler for 'chage:width' event on Dimension.
     * @private
     */
    _updateMaxScrollLeft: function() {
        var dimension = this.dimensionModel;
        var maxScrollLeft = this.coordColumnModel.getFrameWidth('R') - dimension.get('rsideWidth') +
                dimension.getScrollYWidth();

        this.set('maxScrollLeft', maxScrollLeft);
    },

    /**
     * Event handler to reset 'maxScrollTop' attribute.
     * @private
     */
    _updateMaxScrollTop: function() {
        var dimension = this.dimensionModel;
        var maxScrollTop = dimension.get('totalRowHeight') - dimension.get('bodyHeight') +
            dimension.getScrollXHeight();

        this.set('maxScrollTop', maxScrollTop);
    },

    /**
     * Event handler for 'beforeReset' event on dataModel
     * @param {number} dataLength - the length of data
     * @private
     */
    _onBeforeResetData: function(dataLength) {
        if (dataLength > DATA_LENGTH_FOR_LOADING) {
            this.set('state', renderStateMap.LOADING);
        }
    },

    /**
     * Event handler for 'change:editingAddress' event on focusModel
     * @param {module:model/focus} focusModel - focus model
     * @param {{rowKey: Number, columnName: String}} address - address
     * @private
     */
    _onEditingAddressChange: function(focusModel, address) {
        var target = address;
        var editing = true;
        var self = this;

        if (!address) {
            target = focusModel.previous('editingAddress');
            editing = false;
        }
        this._updateCellData(target.rowKey, target.columnName, {
            isEditing: editing
        });

        this._triggerEditingStateChanged(target.rowKey, target.columnName);

        // defered call to prevent 'change:scrollLeft' or 'change:scrollTop' event
        // triggered by module:view/layout/body._onScroll()
        // when module:model/focus.scrollToFocus() method is called.
        _.defer(function() {
            self._toggleChangeLayoutEventHandlers(editing);
        });
    },

    /**
     * Toggle event handler for change:scrollTop and change:scrollLeft event.
     * @param {Boolean} editing - whether currently editing
     * @private
     */
    _toggleChangeLayoutEventHandlers: function(editing) {
        var renderEventName = 'change:scrollTop change:scrollLeft';
        var dimensionEventName = 'columnWidthChanged';

        if (editing) {
            this.listenToOnce(this.dimensionModel, dimensionEventName, this._onChangeLayoutBound);
            this.once(renderEventName, this._onChangeLayoutBound);
        } else {
            this.stopListening(this.dimensionModel, dimensionEventName, this._onChangeLayoutBound);
            this.off(renderEventName, this._onChangeLayoutBound);
        }
    },

    /**
     * Triggers the 'editingStateChanged' event if the cell data identified by
     * given row key and column name has the useViewMode:true option.
     * @param {String} rowKey - row key
     * @param {String} columnName - column name
     * @private
     */
    _triggerEditingStateChanged: function(rowKey, columnName) {
        var cellData = this.getCellData(rowKey, columnName);

        if (tui.util.pick(cellData, 'columnModel', 'editOption', 'useViewMode') !== false) {
            this.trigger('editingStateChanged', cellData);
        }
    },

    /**
     * Updates the view-data of the cell identified by given rowKey and columnName.
     * @param {(String|Number)} rowKey - row key
     * @param {String} columnName - column name
     * @param {Object} cellData - cell data
     * @private
     */
    _updateCellData: function(rowKey, columnName, cellData) {
        var rowModel = this._getRowModel(rowKey, columnName);

        if (rowModel) {
            rowModel.setCell(columnName, cellData);
        }
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
     * @returns {Object} collection  해당 영역의 랜더 데이터 콜랙션
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
        this.refresh({
            columnModelChanged: true
        });
    },

    /**
     * Event handler for changing data list
     * @private
     */
    _onDataListChange: function() {
        this.refresh({
            dataListChanged: true
        });
    },

    /**
     * Event handler for 'add' event on dataModel.
     * @param  {module:model/data/rowList} dataModel - data model
     * @param  {Object} options - options for appending. See {@link module:model/data/rowList#append}
     * @private
     */
    _onAddDataModel: function(dataModel, options) {
        if (options.focus) {
            this.focusModel.focusAt(options.at, 0);
        }
    },

    /**
     * Resets dummy rows and trigger 'dataListChanged' event.
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
     * @param  {Number} height - the height of the row
     * @param  {Number} rowNum - Row number
     * @returns {Object} - view data object
     * @private
     */
    _createViewDataFromDataModel: function(rowDataModel, columnNames, height, rowNum) {
        var viewData = {
            height: height,
            rowNum: rowNum,
            rowKey: rowDataModel.get('rowKey'),
            _extraData: rowDataModel.get('_extraData')
        };

        _.each(columnNames, function(columnName) {
            var value = rowDataModel.get(columnName);

            if (columnName === '_number' && !_.isNumber(value)) {
                value = rowNum;
            }
            viewData[columnName] = value;
        });

        return viewData;
    },

    /**
     * Returns the object that contains two array of column names splitted by columnFixCount.
     * @returns {{lside: Array, rside: Array}} - Column names map
     * @private
     */
    _getColumnNamesOfEachSide: function() {
        var columnFixCount = this.columnModel.getVisibleColumnFixCount(true);
        var columnModels = this.columnModel.getVisibleColumnModelList(null, true);
        var columnNames = _.pluck(columnModels, 'columnName');

        return {
            lside: columnNames.slice(0, columnFixCount),
            rside: columnNames.slice(columnFixCount)
        };
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
        var columnNamesMap = this._getColumnNamesOfEachSide();
        var rowNum = this.get('startNumber') + startIndex;
        var lsideData = [];
        var rsideData = [];
        var rowDataModel, height, i;

        for (i = startIndex; i <= endIndex; i += 1) {
            rowDataModel = this.dataModel.at(i);
            height = this.coordRowModel.getHeightAt(i);

            lsideData.push(this._createViewDataFromDataModel(rowDataModel, columnNamesMap.lside, height, rowNum));
            rsideData.push(this._createViewDataFromDataModel(rowDataModel, columnNamesMap.rside, height, rowNum));
            rowNum += 1;
        }

        this._resetViewModelList('lside', lsideData);
        this._resetViewModelList('rside', rsideData);
    },

    /**
     * Returns the count of rows (except dummy rows) in view model list
     * @returns {Number} Count of rows
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
     * Calculate required count of dummy rows and set the 'dummyRowCount' attribute.
     * @param {boolean} silent - whether sets the dummyRowCount silently
     * @private
     */
    _resetDummyRowCount: function() {
        var dimensionModel = this.dimensionModel;
        var totalRowHeight = dimensionModel.get('totalRowHeight');
        var rowHeight = dimensionModel.get('rowHeight') + CELL_BORDER_WIDTH;
        var bodyHeight = dimensionModel.get('bodyHeight') - dimensionModel.getScrollXHeight();
        var dummyRowCount = 0;

        if (totalRowHeight < bodyHeight) {
            dummyRowCount = Math.ceil((bodyHeight - totalRowHeight) / rowHeight);
        }

        this.set('dummyRowCount', dummyRowCount);
    },

    /**
     * fills the empty area with dummy rows.
     * @private
     */
    _fillDummyRows: function() {
        var dummyRowCount = this.get('dummyRowCount');
        var rowNum, rowHeight;


        if (dummyRowCount) {
            rowNum = this.get('startNumber') + this.get('endIndex') + 1;
            rowHeight = this.dimensionModel.get('rowHeight');

            _.times(dummyRowCount, function() {
                _.each(['lside', 'rside'], function(listName) {
                    this.get(listName).add({
                        height: rowHeight,
                        rowNum: rowNum
                    });
                }, this);
                rowNum += 1;
            }, this);
        }
    },

    /**
     * Refreshes the rendering range and the list of view models, and triggers events.
     * @param {Object} options - options
     * @param {Boolean} [options.columnModelChanged] - The boolean value whether columnModel has changed
     * @param {Boolean} [options.dataListChanged] - The boolean value whether dataModel has changed
     */
    refresh: function(options) {
        var columnModelChanged = !!options && options.columnModelChanged;
        var dataListChanged = !!options && options.dataListChanged;
        var startIndex, endIndex, i;

        this._setRenderingRange(this.get('scrollTop'));
        startIndex = this.get('startIndex');
        endIndex = this.get('endIndex');

        this._resetAllViewModelListWithRange(startIndex, endIndex);

        for (i = startIndex; i <= endIndex; i += 1) {
            this._executeRelation(i);
        }

        if (columnModelChanged) {
            this.trigger('columnModelChanged');
        } else {
            this.trigger('rowListChanged', dataListChanged);
            if (dataListChanged) {
                this.coordRowModel.syncWithDom();
            }
        }
        this._refreshState();
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
     * @returns {Collection} 컬럼명에 해당하는 영역의 콜랙션
     * @private
     */
    _getCollectionByColumnName: function(columnName) {
        var lside = this.get('lside');
        var collection;

        if (lside.at(0) && lside.at(0).get(columnName)) {
            collection = lside;
        } else {
            collection = this.get('rside');
        }
        return collection;
    },

    /**
     * Returns the specified row model.
     * @param {(Number|String)} rowKey - row key
     * @param {String} columnName - column name
     * @returns {module:model/row}
     * @private
     */
    _getRowModel: function(rowKey, columnName) {
        var collection = this._getCollectionByColumnName(columnName);

        return collection.get(rowKey);
    },

    /**
     * 셀 데이터를 반환한다.
     * @param {number} rowKey   데이터의 키값
     * @param {String} columnName   컬럼명
     * @returns {object} cellData 셀 데이터
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
         changed: []    //names of changed properties
     }
     */
    getCellData: function(rowKey, columnName) {
        var row = this._getRowModel(rowKey, columnName);
        var cellData = null;

        if (row) {
            cellData = row.get(columnName);
        }

        return cellData;
    },

    /**
     * Executes the relation of the row identified by rowIndex
     * @param {Number} rowIndex - Row index
     * @private
     */
    _executeRelation: function(rowIndex) {
        var row = this.dataModel.at(rowIndex);
        var renderIdx = rowIndex - this.get('startIndex');
        var rowModel, relationResult;

        relationResult = row.executeRelationCallbacksAll();

        _.each(relationResult, function(changes, columnName) {
            rowModel = this._getCollectionByColumnName(columnName).at(renderIdx);
            if (rowModel) {
                rowModel.setCell(columnName, changes);
            }
        }, this);
    }
});

module.exports = Renderer;
