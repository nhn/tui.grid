/**
 * @fileoverview Rendering 모델
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');
var snippet = require('tui-code-snippet');

var Model = require('../base/model');
var Row = require('./row');
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
var Renderer = Model.extend(/** @lends module:model/renderer.prototype */{
    initialize: function(attrs, options) {
        var rowListOptions;
        var partialLside, partialRside;

        _.assign(this, {
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

        partialLside = new RowList([], rowListOptions);
        partialRside = new RowList([], rowListOptions);

        this.set({
            lside: [],
            rside: [],
            partialLside: partialLside,
            partialRside: partialRside
        });

        this.listenTo(this.columnModel, 'columnModelChange change', this._onColumnModelChange)
            .listenTo(this.dataModel, 'sort reset', this._onDataModelChange)
            .listenTo(this.dataModel, 'deleteRange', this._onRangeDataModelChange)
            .listenTo(this.dataModel, 'add', this._onAddDataModelChange)
            .listenTo(this.dataModel, 'remove', this._onRemoveDataModelChange)
            .listenTo(this.dataModel, 'beforeReset', this._onBeforeResetData)
            .listenTo(this.focusModel, 'change:editingAddress', this._onEditingAddressChange)
            .listenTo(partialLside, 'valueChange', this._executeRelation)
            .listenTo(partialRside, 'valueChange', this._executeRelation)
            .listenTo(this.coordRowModel, 'reset', this._onChangeRowHeights)
            .listenTo(this.dimensionModel, 'columnWidthChanged', this.finishEditing)
            .listenTo(this.dimensionModel, 'change:width', this._updateMaxScrollLeft)
            .listenTo(this.dimensionModel, 'change:totalRowHeight change:scrollBarSize change:bodyHeight',
                this._updateMaxScrollTop);

        if (this.get('showDummyRows')) {
            this.listenTo(this.dimensionModel, 'change:bodyHeight change:totalRowHeight', this._resetDummyRowCount);
            this.on('change:dummyRowCount', this._resetDummyRows);
        }

        this.on('change', this._onChangeIndex, this);
        this._onChangeLayoutBound = _.bind(this._onChangeLayout, this);
    },

    defaults: {
        top: 0,
        bottom: 0,
        scrollTop: 0,
        scrollLeft: 0,
        maxScrollLeft: 0,
        maxScrollTop: 0,
        startIndex: -1,
        endIndex: -1,
        startNumber: 1,
        lside: null,
        rside: null,
        partialLside: null,
        partialRside: null,
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
     * Event handler for changing startIndex or endIndex.
     * @param {Object} model - Renderer model fired event
     * @private
     */
    _onChangeIndex: function(model) {
        var changedData = model.changed;
        var changedStartIndex = _.has(changedData, 'startIndex');
        var changedEndIndex = _.has(changedData, 'endIndex');

        if (changedStartIndex || changedEndIndex) {
            this.refresh();
        }
    },

    /**
     * Event handler for 'reset' event on coordRowModel
     * @private
     */
    _onChangeRowHeights: function() {
        var coordRowModel = this.coordRowModel;
        var lside = this.get('partialLside');
        var rside = this.get('partialRside');
        var i = 0;
        var len = lside.length;
        var height;

        for (; i < len; i += 1) {
            height = coordRowModel.getHeightAt(i);

            lside.at(i).set('height', height);
            rside.at(i).set('height', height);
        }
    },

    /**
     * Event handler for 'change:width' event on Dimension.
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
            editing: editing
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

        if (snippet.pick(cellData, 'columnModel', 'editOptions', 'useViewMode') !== false &&
            cellData.convertedHTML === null) {
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
            startNumber: 1
        });
    },

    /**
     * 열고정 영역 또는 열고정이 아닌 영역에 대한 Render Collection 을 반환한다.
     * @param {String} [whichSide='R']    어느 영역인지 여부. 'L|R' 중에 하나의 값을 넘긴다.
     * @returns {Object} collection  해당 영역의 랜더 데이터 콜랙션
     */
    getCollection: function(whichSide) {
        var attrName = this._getPartialWhichSideType(whichSide);

        return this.get(attrName);
    },

    /**
     * Get string of partial which side type
     * @param {string} whichSide - Type of which side (L|R)
     * @returns {string} String of appened prefix value 'partial'
     * @private
     */
    _getPartialWhichSideType: function(whichSide) {
        return snippet.isString(whichSide) ? 'partial' + whichSide + 'side' : 'partialRside';
    },

    /**
     * Event handler for regenerating left and right side frames when the Data.ColumnModel is changed
     * @private
     */
    _onColumnModelChange: function() {
        this.set({
            scrollLeft: 0,
            scrollTop: 0
        }, {silent: true});

        this._resetViewModelList();
        this._setRenderingRange(true);

        this.refresh({
            change: false,
            columnModelChanged: true
        });

        this._updateMaxScrollLeft();
    },

    /**
     * Event handler for changing data list
     * @private
     */
    _onDataModelChange: function() {
        this._resetViewModelList();
        this._setRenderingRange(true);

        this.refresh({
            type: 'reset',
            dataListChanged: true
        });
    },

    /**
     * Event handler for adding data list
     * @param {array} modelList - List of added item
     * @param {object} options - Info of added item
     * @private
     */
    _onAddDataModelChange: function(modelList, options) {
        var columnNamesMap = this._getColumnNamesOfEachSide();
        var at = options.at;
        var height, viewData, rowNum;
        var viewModel;

        this._setRenderingRange(true);

        // the type of modelList is array or collection
        modelList = _.isArray(modelList) ? modelList : modelList.models;

        _.each(modelList, function(model, index) {
            height = this.coordRowModel.getHeightAt(index);

            _.each(['lside', 'rside'], function(attrName) {
                rowNum = at + index + 1;
                viewData = this._createViewDataFromDataModel(
                    model, columnNamesMap[attrName], height, rowNum);

                viewModel = this._createRowModel(viewData, true);

                this.get(attrName).splice(at + index, 0, viewModel);
            }, this);
        }, this);

        this.refresh({
            type: 'add',
            dataListChanged: true
        });

        if (options.focus) {
            this.focusModel.focusAt(options.at, 0);
        }
    },

    /**
     * Event handler for removing data list
     * @param {number|string} rowKey - rowKey of the removed row
     * @param {number} removedIndex - Index of the removed row
     * @private
     */
    _onRemoveDataModelChange: function(rowKey, removedIndex) {
        _.each(['lside', 'rside'], function(attrName) {
            this.get(attrName).splice(removedIndex, 1);
        }, this);

        this._setRenderingRange(true);

        this.refresh({
            dataListChanged: true
        });
    },

    /**
     * Event handler for deleting cell data
     * @param {GridEvent} ev - event object when "delRange" event is fired
     * @private
     */
    _onRangeDataModelChange: function(ev) {
        var columnModel = this.columnModel;
        var rowKeys = ev.rowKeys;
        var columnNames = ev.columnNames;

        this._setRenderingRange(true);

        _.each(['partialLside', 'partialRside'], function(attrName) {
            _.each(this.get(attrName).models, function(model) {
                var rowKey = model.get('rowKey');
                var changedRow = _.contains(rowKeys, rowKey);

                if (changedRow) {
                    _.each(columnNames, function(columnName) {
                        if (columnModel.getColumnModel(columnName).editOptions) {
                            this._updateCellData(rowKey, columnName, {
                                value: '',
                                formattedValue: ''
                            });
                        }
                    }, this);
                }
            }, this);
        }, this);

        this.refresh({
            type: 'deleteRange',
            dataListChanged: true
        });
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
     * Set index-range to render
     * @param {boolean} silent - whether set attributes silently
     * @private
     */
    _setRenderingRange: function(silent) {
        var dataLength = this.dataModel.length;

        this.set({
            startIndex: dataLength ? 0 : -1,
            endIndex: dataLength - 1
        }, {
            silent: silent
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
            rowNum: rowNum,
            height: height,
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
     * Returns the object that contains two array of column names splitted by frozenCount.
     * @returns {{lside: Array, rside: Array}} - Column names map
     * @private
     */
    _getColumnNamesOfEachSide: function() {
        var frozenCount = this.columnModel.getVisibleFrozenCount(true);
        var columnModels = this.columnModel.getVisibleColumns(null, true);
        var columnNames = _.pluck(columnModels, 'name');

        return {
            lside: columnNames.slice(0, frozenCount),
            rside: columnNames.slice(frozenCount)
        };
    },

    /**
     * Add view model list by range
     * @param {number} startIndex - Index of start row
     * @param {number} endIndex - Index of end row
     * @private
     */
    _addViewModelListWithRange: function(startIndex, endIndex) {
        var columnNamesMap = this._getColumnNamesOfEachSide();
        var rowDataModel, height, index;

        if (startIndex >= 0 && endIndex >= 0) {
            for (index = startIndex; index <= endIndex; index += 1) {
                rowDataModel = this.dataModel.at(index);
                height = this.coordRowModel.getHeightAt(index);

                this._addViewModelList(rowDataModel, columnNamesMap, height, index);
            }
        }
    },

    /**
     * Add view model list on each side
     * @param {object} rowDataModel - Data model of row
     * @param {object} columnNamesMap - Map of column names
     * @param {number} height - Height of row
     * @param {number} index - Index of row
     * @private
     */
    _addViewModelList: function(rowDataModel, columnNamesMap, height, index) {
        _.each(['lside', 'rside'], function(attrName) {
            var viewData;

            if (!this.get(attrName)[index]) {
                viewData = this._createViewDataFromDataModel(
                    rowDataModel, columnNamesMap[attrName], height, index + 1);

                this.get(attrName)[index] = this._createRowModel(viewData, true);
            }
        }, this);
    },

    /**
     * Update the row number
     * @param {number} startIndex - Start index
     * @param {number} endIndex - End index
     * @private
     */
    _updateRowNumber: function(startIndex, endIndex) {
        var collection = this.get('lside');
        var index = startIndex;
        var currentModel, rowNum, newRowNum;

        for (; index <= endIndex; index += 1) {
            currentModel = collection[index];
            newRowNum = index + 1;

            if (currentModel) {
                rowNum = currentModel.get('rowNum');
                newRowNum = index + 1;

                if (rowNum !== newRowNum) {
                    currentModel.set({
                        rowNum: newRowNum
                    }, {
                        silent: true
                    });

                    currentModel.setCell('_number', {
                        formattedValue: newRowNum,
                        value: newRowNum
                    });
                }
            }
        }
    },

    /**
     * Reset partial view model list
     * @param {number} startIndex - Index of start row
     * @param {number} endIndex - Index of end row
     * @private
     */
    _resetPartialViewModelList: function(startIndex, endIndex) {
        var originalWhichSide, partialWhichSide;
        var viewModelList, partialViewModelList;

        _.each(['L', 'R'], function(whichSide) {
            originalWhichSide = whichSide.toLowerCase() + 'side';
            partialWhichSide = this._getPartialWhichSideType(whichSide);
            viewModelList = this.get(originalWhichSide);
            partialViewModelList = viewModelList.slice(startIndex, endIndex + 1);

            this.get(partialWhichSide).reset(partialViewModelList);
        }, this);
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
                    this.get(listName).push(this._createRowModel({
                        height: rowHeight,
                        rowNum: rowNum
                    }));
                }, this);

                rowNum += 1;
            }, this);
        }
    },

    /* eslint-disable complexity */
    /**
     * Refreshes the rendering range and the list of view models, and triggers events.
     * @param {object} options - options
     * @param {boolean} [options.columnModelChanged] - The boolean value whether columnModel has changed
     * @param {boolean} [options.dataListChanged] - The boolean value whether dataModel has changed
     * @param {string} [options.type] - Event type (reset|add|remove)
     */
    refresh: function(options) {
        var columnModelChanged = !!options && options.columnModelChanged;
        var dataListChanged = !!options && options.dataListChanged;
        var eventType = !!options && options.type;
        var startIndex, endIndex, i;

        startIndex = this.get('startIndex');
        endIndex = this.get('endIndex');

        if (eventType !== 'add' && eventType !== 'deleteRange') {
            this._addViewModelListWithRange(startIndex, endIndex);
        }

        if (eventType !== 'deleteRange') {
            this._updateRowNumber(startIndex, endIndex);
        }

        this._resetPartialViewModelList(startIndex, endIndex);
        this._fillDummyRows();

        if (startIndex >= 0 && endIndex >= 0) {
            for (i = startIndex; i <= endIndex; i += 1) {
                this._executeRelation(i);
            }
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
    /* eslint-enable complexity */

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
        var lside = this.get('partialLside');
        var collection;

        if (lside.at(0) && lside.at(0).get(columnName)) {
            collection = lside;
        } else {
            collection = this.get('partialRside');
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
     {
         rowKey: rowKey,
         columnName: columnName,
         value: value,
         rowSpan: rowSpanData.count,
         isMainRow: rowSpanData.isMainRow,
         mainRowKey: rowSpanData.mainRowKey,
         editable: editable,
         disabled: disabled,
         listItems: [],
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
    },

    /**
     * Create row model
     * @param {object} attrs - Attributes to create
     * @param {boolean} parse - Whether calling parse or not
     * @returns {object} Row model
     * @private
     */
    _createRowModel: function(attrs, parse) {
        return new Row(attrs, {
            parse: parse,
            dataModel: this.dataModel,
            columnModel: this.columnModel,
            focusModel: this.focusModel
        });
    },

    /**
     * Reset view models when value of columModel or dataModel is changed
     * @private
     */
    _resetViewModelList: function() {
        _.each(['lside', 'rside'], function(attrName) {
            this.set(attrName, new Array(this.dataModel.length));
        }, this);
    }
});

module.exports = Renderer;
