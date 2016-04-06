/**
 * @fileoverview Focus 관련 데이터 처리름 담당한다.
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model'),
    util = require('../common/util'),
    GridEvent = require('../common/gridEvent');

/**
 * Focus model
 * RowList collection 이 focus class 를 listen 한다.
 * @module model/focus
 * @extends module:base/model
 */
var Focus = Model.extend(/**@lends module:model/focus.prototype */{
    /**
     * @constructs
     * @param {Object} attrs - Attributes
     * @param {Object} options - Options
     */
    initialize: function(attrs, options) {
        Model.prototype.initialize.apply(this, arguments);

        this.dataModel = options.dataModel;
        this.columnModel = options.columnModel;
        this.dimensionModel = options.dimensionModel;
        this.cellFactory = options.cellFactory;
        this.domState = options.domState;

        this.listenTo(this.dataModel, 'reset', this._onResetData);
    },

    defaults: {
        /**
         * row key of the current cell
         * @type {String|Number}
         */
        rowKey: null,

        /**
         * column name of the current cell
         * @type {String}
         */
        columnName: '',

        /**
         * row key of the previously focused cell
         * @type {String|Number}
         */
        prevRowKey: null,

        /**
         * column name of the previously focused cell
         * @type {String}
         */
        prevColumnName: '',

        /**
         * address of the editing cell.
         * @type {{rowKey:(String|Number), columnName:String}}
         */
        editingAddress: null
    },

    /**
     * Event handler for 'reset' event on dataModel.
     * @private
     */
    _onResetData: function() {
        this.unselect(true);
    },

    /**
     * Saves previous data.
     * @private
     */
    _savePrevious: function() {
        if (this.get('rowKey') !== null) {
            this.set('prevRowKey', this.get('rowKey'));
        }
        if (this.get('columnName')) {
            this.set('prevColumnName', this.get('columnName'));
        }
    },

    /**
     * Clear previous data.
     * @private
     */
    _clearPrevious: function() {
        this.set({
            prevRowKey: null,
            prevColumnName: ''
        });
    },

    /**
     * Returns whether given rowKey and columnName is equal to current value
     * @param {(Number|String)} rowKey - row key
     * @param {String} columnName - column name
     * @param {Boolean} isMainRowKey - true if the target row key is main row
     * @returns {Boolean} - True if equal
     */
    isCurrentCell: function(rowKey, columnName, isMainRowKey) {
        var curColumnName = this.get('columnName');
        var curRowKey = this.get('rowKey');

        if (isMainRowKey) {
            curRowKey = this.dataModel.getMainRowKey(curRowKey, curColumnName);
        }

        return String(curRowKey) === String(rowKey) && curColumnName === columnName;
    },

    /**
     * Selects the given row
     * @param {Number|String} rowKey - Rowkey of the target row
     * @returns {Boolean} True is success
     */
    select: function(rowKey) {
        var eventData = new GridEvent(),
            currentRowKey = this.get('rowKey');

        if (String(currentRowKey) === String(rowKey)) {
            return true;
        }

        eventData.setData({
            rowKey: rowKey,
            prevRowKey: currentRowKey,
            rowData: this.dataModel.getRowData(rowKey)
        });
        this.trigger('select', eventData);
        if (eventData.isStopped()) {
            this._cancelSelect();
            return false;
        }

        this.set('rowKey', rowKey);
        if (this.columnModel.get('selectType') === 'radio') {
            this.dataModel.check(rowKey);
        }
        return true;
    },

    /**
     * Cancel select
     * @private
     */
    _cancelSelect: function() {
        var prevColumnName = this.get('prevColumnName');
        this.set('columnName', prevColumnName);
        this.trigger('focus', this.get('rowKey'), prevColumnName);
    },

    /**
     * 행을 unselect 한다.
     * @param {boolean} blur - The boolean value whether to invoke blur
     */
    unselect: function(blur) {
        if (blur) {
            this.blur();
        }
        this.set({
            rowKey: null
        });
    },

    /**
     * Focus to the cell identified by given rowKey and columnName.
     * @param {Number|String} rowKey - rowKey
     * @param {String} columnName - columnName
     * @param {Boolean} isScrollable - if set to true, move scroll position to focused position
     * @returns {Boolean} true if focused cell is changed
     */
    focus: function(rowKey, columnName, isScrollable) {
        if (!this._isValidCell(rowKey, columnName) ||
            util.isMetaColumn(columnName) ||
            this.isCurrentCell(rowKey, columnName)) {
            return true;
        }

        this.blur();
        if (!this.select(rowKey)) {
            return false;
        }

        this.set('columnName', columnName);
        this.trigger('focus', rowKey, columnName);

        if (isScrollable) {
            this.scrollToFocus();
        }
        return true;
    },

    /**
     * Focus to the cell identified by given rowIndex and columnIndex.
     * @param {(Number|String)} rowIndex - rowIndex
     * @param {String} columnIndex - columnIndex
     * @param {boolean} [isScrollable=false] - if set to true, scroll to focused cell
     * @returns {Boolean} true if success
     */
    focusAt: function(rowIndex, columnIndex, isScrollable) {
        var row = this.dataModel.at(rowIndex),
            column = this.columnModel.at(columnIndex, true),
            result = false;

        if (row && column) {
            result = this.focus(row.get('rowKey'), column.columnName, isScrollable);
        }

        return result;
    },

    /**
     * Focus to the cell identified by given rowKey and columnName and change it to edit-mode if editable.
     * @param {(Number|String)} rowKey - rowKey
     * @param {String} columnName - columnName
     * @param {boolean} [isScrollable=false] - if set to true, scroll to focused cell
     * @returns {Boolean} true if success
     */
    focusIn: function(rowKey, columnName, isScrollable) {
        var result = this.focus(rowKey, columnName, isScrollable);

        if (result) {
            rowKey = this.dataModel.getMainRowKey(rowKey, columnName);

            if (this.dataModel.get(rowKey).isEditable(columnName)) {
                this.finishEditing();
                this.startEditing(rowKey, columnName);
            } else {
                this.focusClipboard();
            }
        }

        return result;
    },

    /**
     * Focus to the cell identified by given rowIndex and columnIndex and change it to edit-mode if editable.
     * @param {(Number|String)} rowIndex - rowIndex
     * @param {String} columnIndex - columnIndex
     * @param {Boolean} [isScrollable=false] - if set to true, scroll to focused cell
     * @returns {Boolean} true if success
     */
    focusInAt: function(rowIndex, columnIndex, isScrollable) {
        var row = this.dataModel.at(rowIndex),
            column = this.columnModel.at(columnIndex, true),
            result = false;

        if (row && column) {
            result = this.focusIn(row.get('rowKey'), column.columnName, isScrollable);
        }
        return result;
    },

    /**
     * clipboard 에 focus 한다.
     */
    focusClipboard: function() {
        this.trigger('focusClipboard');
    },

    /**
     * If the grid has an element which has a focus, make sure that focusModel has a valid data,
     * Otherwise call focusModel.blur().
     */
    refreshState: function() {
        var restored;

        if (!this.domState.hasFocusedElement()) {
            this.blur();
        } else if (!this.has()) {
            restored = this.restore();
            if (!restored) {
                this.focusAt(0, 0);
            }
        }
    },

    /**
     * Scroll to focus
     */
    scrollToFocus: function() {
        var rowKey = this.get('rowKey'),
            columnName = this.get('columnName'),
            scrollPosition = this.dimensionModel.getScrollPosition(rowKey, columnName);

        if (!tui.util.isEmpty(scrollPosition)) {
            this.renderModel.set(scrollPosition);
        }
    },

    /**
     * 디자인 blur 처리한다.
     * @returns {Model.Focus} This object
     */
    blur: function() {
        var columnName = this.get('columnName');

        if (!this.has()) {
            return this;
        }

        if (this.has(true)) {
            this._savePrevious();
        }

        if (this.get('rowKey') !== null) {
            this.set('columnName', '');
        }
        this.trigger('blur', this.get('rowKey'), columnName);

        return this;
    },

    /**
     * 현재 focus 정보를 반환한다.
     * @returns {{rowKey: (number|string), columnName: string}} 현재 focus 정보에 해당하는 rowKey, columnName
     */
    which: function() {
        return {
            rowKey: this.get('rowKey'),
            columnName: this.get('columnName')
        };
    },

    /**
     * 현재 focus 정보를 index 기준으로 반환한다.
     * @param {boolean} isPrevious 이전 focus 정보를 반환할지 여부
     * @returns {{row: number, column: number}} The object that contains index info
     */
    indexOf: function(isPrevious) {
        var rowKey = isPrevious ? this.get('prevRowKey') : this.get('rowKey'),
            columnName = isPrevious ? this.get('prevColumnName') : this.get('columnName');

        return {
            row: this.dataModel.indexOfRowKey(rowKey),
            column: this.columnModel.indexOfColumnName(columnName, true)
        };
    },

    /**
     * Returns whether has focus.
     * @param {boolean} checkValid - if set to true, check whether the current cell is valid.
     * @returns {boolean} True if has focus.
     */
    has: function(checkValid) {
        var rowKey = this.get('rowKey'),
            columnName = this.get('columnName');

        if (checkValid) {
            return this._isValidCell(rowKey, columnName);
        }
        return !util.isBlank(rowKey) && !util.isBlank(columnName);
    },

    /**
     * Restore previous focus data.
     * @returns {boolean} True if restored
     */
    restore: function() {
        var prevRowKey = this.get('prevRowKey'),
            prevColumnName = this.get('prevColumnName'),
            restored = false;

        if (this._isValidCell(prevRowKey, prevColumnName)) {
            this.focus(prevRowKey, prevColumnName);
            restored = true;
        }
        return restored;
    },

    /**
     * Returns whether the cell identified by given rowKey and columnName is editing now.
     * @param {Number} rowKey - row key
     * @param {String} columnName - column name
     * @returns {Boolean}
     */
    isEditingCell: function(rowKey, columnName) {
        var address = this.get('editingAddress');

        return address &&
            (String(address.rowKey) === String(rowKey)) &&
            (address.columnName === columnName);
    },

    /**
     * Starts editing a cell identified by given rowKey and columnName, and returns the result.
     * @param {(String|Number)} rowKey - row key
     * @param {String} columnName - column name
     * @returns {Boolean} true if succeeded, false otherwise.
     */
    startEditing: function(rowKey, columnName) {
        if (this.get('editingAddress') ||
            !this.isCurrentCell(rowKey, columnName) ||
            !this.dataModel.get(rowKey).isEditable(columnName)) {
            return false;
        }

        this.set('editingAddress', {
            rowKey: rowKey,
            columnName: columnName
        });

        return true;
    },

    /**
     * Finishes editing the current cell, and returns the result.
     * @returns {Boolean} - true if an editing cell exist, false otherwise.
     */
    finishEditing: function() {
        if (!this.get('editingAddress')) {
            return false;
        }

        this.set('editingAddress', null);

        return true;
    },

    /**
     * Returns whether the specified cell is exist
     * @param {String|Number} rowKey - Rowkey
     * @param {String} columnName - ColumnName
     * @returns {boolean} True if exist
     */
    _isValidCell: function(rowKey, columnName) {
        var isValidRowKey = !util.isBlank(rowKey) && !!this.dataModel.get(rowKey),
            isValidColumnName = !util.isBlank(columnName) && !!this.columnModel.getColumnModel(columnName);

        return isValidRowKey && isValidColumnName;
    },

    /**
     * 현재 focus 된 row 기준으로 offset 만큼 이동한 rowKey 를 반환한다.
     * @param {Number} offset   이동할 offset
     * @returns {?Number|String} rowKey   offset 만큼 이동한 위치의 rowKey
     * @private
     */
    _findRowKey: function(offset) {
        var index, row,
            dataModel = this.dataModel,
            rowKey = null;

        if (this.has(true)) {
            index = Math.max(
                Math.min(
                    dataModel.indexOfRowKey(this.get('rowKey')) + offset,
                    this.dataModel.length - 1
                ), 0
            );
            row = dataModel.at(index);
            if (row) {
                rowKey = row.get('rowKey');
            }
        }
        return rowKey;
    },

    /**
     * 현재 focus 된 column 기준으로 offset 만큼 이동한 columnName 을 반환한다.
     * @param {Number} offset   이동할 offset
     * @returns {?String} columnName  offset 만큼 이동한 위치의 columnName
     * @private
     */
    _findColumnName: function(offset) {
        var index,
            columnModel = this.columnModel,
            columnModelList = columnModel.getVisibleColumnModelList(),
            columnIndex = columnModel.indexOfColumnName(this.get('columnName'), true),
            columnName = null;

        if (this.has(true)) {
            index = Math.max(Math.min(columnIndex + offset, columnModelList.length - 1), 0);
            columnName = columnModelList[index] && columnModelList[index].columnName;
        }
        return columnName;
    },

    /**
     * rowSpanData 를 반환한다.
     * @param {Number|String} rowKey    조회할 데이터의 키값
     * @param {String} columnName   컬럼명
     * @returns {*|{count: number, isMainRow: boolean, mainRowKey: *}|*} rowSpanData 정보
     * @private
     */
    _getRowSpanData: function(rowKey, columnName) {
        return this.dataModel.get(rowKey).getRowSpanData(columnName);
    },

    /**
     * offset 만큼 뒤로 이동한 row 의 index 를 반환한다.
     * @param {number} offset   이동할 offset
     * @returns {Number} 이동한 위치의 row index
     */
    nextRowIndex: function(offset) {
        var rowKey = this.nextRowKey(offset);
        return this.dataModel.indexOfRowKey(rowKey);
    },

    /**
     * offset 만큼 앞으로 이동한 row의 index를 반환한다.
     * @param {number} offset 이동할 offset
     * @returns {Number} 이동한 위치의 row index
     */
    prevRowIndex: function(offset) {
        var rowKey = this.prevRowKey(offset);
        return this.dataModel.indexOfRowKey(rowKey);
    },

    /**
     * 다음 컬럼의 인덱스를 반환한다.
     * @returns {Number} 다음 컬럼의 index
     */
    nextColumnIndex: function() {
        var columnName = this.nextColumnName();
        return this.columnModel.indexOfColumnName(columnName, true);
    },

    /**
     * 이전 컬럼의 인덱스를 반환한다.
     * @returns {Number} 이전 컬럼의 인덱스
     */
    prevColumnIndex: function() {
        var columnName = this.prevColumnName();
        return this.columnModel.indexOfColumnName(columnName, true);
    },

    /**
     * keyEvent 발생 시 호출될 메서드로,
     * rowSpan 정보 까지 계산된 다음 rowKey 를 반환한다.
     * @param {number}  offset 이동할 offset
     * @returns {Number|String} offset 만큼 이동한 위치의 rowKey
     */
    nextRowKey: function(offset) {
        var focused = this.which(),
            rowKey = focused.rowKey,
            count, rowSpanData;

        offset = (typeof offset === 'number') ? offset : 1;
        if (offset > 1) {
            rowKey = this._findRowKey(offset);
            rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
            if (!rowSpanData.isMainRow) {
                rowKey = this._findRowKey(rowSpanData.count + offset);
            }
        } else {
            rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
            if (rowSpanData.isMainRow && rowSpanData.count > 0) {
                rowKey = this._findRowKey(rowSpanData.count);
            } else if (!rowSpanData.isMainRow) {
                count = rowSpanData.count;
                rowSpanData = this._getRowSpanData(rowSpanData.mainRowKey, focused.columnName);
                rowKey = this._findRowKey(rowSpanData.count + count);
            } else {
                rowKey = this._findRowKey(1);
            }
        }
        return rowKey;
    },

    /**
     * keyEvent 발생 시 호출될 메서드로,
     * rowSpan 정보 까지 계산된 이전 rowKey 를 반환한다.
     * @param {number}  offset 이동할 offset
     * @returns {Number|String} offset 만큼 이동한 위치의 rowKey
     */
    prevRowKey: function(offset) {
        var focused = this.which(),
            rowKey = focused.rowKey,
            rowSpanData;
        offset = typeof offset === 'number' ? offset : 1;
        offset *= -1;

        if (offset < -1) {
            rowKey = this._findRowKey(offset);
            rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
            if (!rowSpanData.isMainRow) {
                rowKey = this._findRowKey(rowSpanData.count + offset);
            }
        } else {
            rowSpanData = this._getRowSpanData(rowKey, focused.columnName);
            if (!rowSpanData.isMainRow) {
                rowKey = this._findRowKey(rowSpanData.count - 1);
            } else {
                rowKey = this._findRowKey(-1);
            }
        }
        return rowKey;
    },

    /**
     * keyEvent 발생 시 호출될 메서드로, 다음 columnName 을 반환한다.
     * @returns {String} 다음 컬럼명
     */
    nextColumnName: function() {
        return this._findColumnName(1);
    },

    /**
     * keyEvent 발생 시 호출될 메서드로, 이전 columnName 을 반환한다.
     * @returns {String} 이전 컬럼명
     */
    prevColumnName: function() {
        return this._findColumnName(-1);
    },

    /**
     * 첫번째 row 의 key 를 반환한다.
     * @returns {(string|number)} 첫번째 row 의 키값
     */
    firstRowKey: function() {
        return this.dataModel.at(0).get('rowKey');
    },

    /**
     * 마지막 row의 key 를 반환한다.
     * @returns {(string|number)} 마지막 row 의 키값
     */
    lastRowKey: function() {
        return this.dataModel.at(this.dataModel.length - 1).get('rowKey');
    },

    /**
     * 첫번째 columnName 을 반환한다.
     * @returns {string} 첫번째 컬럼명
     */
    firstColumnName: function() {
        var columnModelList = this.columnModel.getVisibleColumnModelList();
        return columnModelList[0].columnName;
    },

    /**
     * 마지막 columnName 을 반환한다.
     * @returns {string} 마지막 컬럼명
     */
    lastColumnName: function() {
        var columnModelList = this.columnModel.getVisibleColumnModelList(),
            lastIndex = columnModelList.length - 1;
        return columnModelList[lastIndex].columnName;
    }
});

module.exports = Focus;
