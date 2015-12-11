/**
 * @fileoverview Focus 관련 데이터 처리름 담당한다.
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model'),
    util = require('../util');

/**
 * Focus model
 * RowList collection 이 focus class 를 listen 한다.
 * @module model/focus
 */
var Focus = Model.extend(/**@lends module:model/focus.prototype */{
    /**
     * @extends module:base/model
     * @constructs
     */
    initialize: function() {
        Model.prototype.initialize.apply(this, arguments);
    },

    defaults: {
        rowKey: null,
        columnName: '',
        prevRowKey: null,
        prevColumnName: ''
    },

    /**
     * 이전 focus 정보를 저장한다.
     * @private
     * @return {Model.Focus} This object
     */
    _savePrevious: function() {
        if (this.get('rowKey') !== null) {
            this.set('prevRowKey', this.get('rowKey'));
        }
        if (this.get('columnName')) {
            this.set('prevColumnName', this.get('columnName'));
        }
        return this;
    },

    /**
     * 이전 focus 정보를 제거한다.
     * @private
     */
    _clearPrevious: function() {
        this.set({
            prevRowKey: null,
            prevColumnName: ''
        });
    },

    /**
     * 행을 select 한다.
     * @param {Number|String} rowKey - select 할 행의 키값
     * @returns {Model.Focus} This object
     */
    select: function(rowKey) {
        this.unselect().set('rowKey', rowKey);
        this.trigger('select', rowKey);
        return this;
    },

    /**
     * 행을 unselect 한다.
     * @param {boolean} blur - The boolean value whether to invoke blur
     * @return {Model.Focus} This object
     */
    unselect: function(blur) {
        if (blur) {
            this.blur();
        }
        this.trigger('unselect', this.get('rowKey'));
        this.set({
            'rowKey': null
        });
        return this;
    },

    /**
     * focus 처리한다.
     * @param {Number|String} rowKey focus 처리할 셀의 rowKey 값
     * @param {String} columnName focus 처리할 셀의 컬럼명
     * @param {Boolean} isScrollable focus 처리한 영역으로 scroll 위치를 이동할지 여부
     * @return {Model.Focus} This object
     */
    focus: function(rowKey, columnName, isScrollable) {
        if (util.isBlank(rowKey) ||
            util.isBlank(columnName) ||
            this.grid.columnModel.isMetaColumn(columnName) ||
            (this.get('rowKey') === rowKey && this.get('columnName') === columnName)) {
            return this;
        }

        this.blur()
            .select(rowKey)
            .set('columnName', columnName)
            .trigger('focus', rowKey, columnName);

        if (isScrollable) {
            this.scrollToFocus();
        }
        return this;
    },

    /**
     * Scroll to focus
     */
    scrollToFocus: function() {
        var grid = this.grid,
            rowKey = this.get('rowKey'),
            columnName = this.get('columnName'),
            scrollPosition = grid.dimensionModel.getScrollPosition(rowKey, columnName);

        if (!tui.util.isEmpty(scrollPosition)) {
            grid.renderModel.set(scrollPosition);
        }
    },

    /**
     * 디자인 blur 처리한다.
     * @return {Model.Focus} This object
     */
    blur: function() {
        if (this.has()) {
            this._savePrevious();
            this.trigger('blur', this.get('rowKey'), this.get('columnName'));
            if (this.get('rowKey') !== null) {
                this.set('columnName', '');
            }
        }
        return this;
    },

    /**
     * 현재 focus 정보를 반환한다.
     * @return {{rowKey: (number|string), columnName: string}} 현재 focus 정보에 해당하는 rowKey, columnName
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
     * @return {{row: number, column: number}} The object that contains index info
     */
    indexOf: function(isPrevious) {
        var grid = this.grid,
            rowKey = isPrevious ? this.get('prevRowKey') : this.get('rowKey'),
            columnName = isPrevious ? this.get('prevColumnName') : this.get('columnName');

        return {
            row: grid.dataModel.indexOfRowKey(rowKey),
            column: grid.columnModel.indexOfColumnName(columnName, true)
        };
    },

    /**
     * Returns whether has focus.
     * @return {boolean} True if has focus.
     */
    has: function() {
        return this._isValidCell(this.get('rowKey'), this.get('columnName'));
    },

    /**
     * Restore previous focus data.
     * @return {boolean} True if restored
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
     * Returns whether the specified cell is exist
     * @return {boolean} True if exist
     */
    _isValidCell: function(rowKey, columnName) {
        var isValidRowKey = !util.isBlank(rowKey) && !!this.grid.dataModel.get(rowKey),
            isValidColumnName = !util.isBlank(columnName) && !!this.grid.columnModel.getColumnModel(columnName);

        return isValidRowKey && isValidColumnName;
    },

    /**
     * 현재 focus 된 row 기준으로 offset 만큼 이동한 rowKey 를 반환한다.
     * @param {Number} offset   이동할 offset
     * @return {Number|String} rowKey   offset 만큼 이동한 위치의 rowKey
     * @private
     */
    _findRowKey: function(offset) {
        var index, row,
            dataModel = this.grid.dataModel;
        if (this.has()) {
            index = Math.max(Math.min(dataModel.indexOfRowKey(this.get('rowKey')) + offset, this.grid.dataModel.length - 1), 0);
            row = dataModel.at(index);
            return row && row.get('rowKey');
        }
    },

    /**
     * 현재 focus 된 column 기준으로 offset 만큼 이동한 columnName 을 반환한다.
     * @param {Number} offset   이동할 offset
     * @return {String} columnName  offset 만큼 이동한 위치의 columnName
     * @private
     */
    _findColumnName: function(offset) {
        var index,
            columnModel = this.grid.columnModel,
            columnModelList = columnModel.getVisibleColumnModelList(),
            columnIndex = columnModel.indexOfColumnName(this.get('columnName'), true);

        if (this.has()) {
            index = Math.max(Math.min(columnIndex + offset, columnModelList.length - 1), 0);
            return columnModelList[index] && columnModelList[index]['columnName'];
        }
    },

    /**
     * rowSpanData 를 반환한다.
     * @param {Number|String} rowKey    조회할 데이터의 키값
     * @param {String} columnName   컬럼명
     * @return {*|{count: number, isMainRow: boolean, mainRowKey: *}|*} rowSpanData 정보
     * @private
     */
    _getRowSpanData: function(rowKey, columnName) {
        return this.grid.dataModel.get(rowKey).getRowSpanData(columnName);
    },

    /**
     * offset 만큼 뒤로 이동한 row 의 index 를 반환한다.
     * @param {number} offset   이동할 offset
     * @return {Number} 이동한 위치의 row index
     */
    nextRowIndex: function(offset) {
        var rowKey = this.nextRowKey(offset);
        return this.grid.dataModel.indexOfRowKey(rowKey);
    },

    /**
     * offset 만큼 앞으로 이동한 row의 index를 반환한다.
     * @param {number} offset 이동할 offset
     * @return {Number} 이동한 위치의 row index
     */
    prevRowIndex: function(offset) {
        var rowKey = this.prevRowKey(offset);
        return this.grid.dataModel.indexOfRowKey(rowKey);
    },

    /**
     * 다음 컬럼의 인덱스를 반환한다.
     * @return {Number} 다음 컬럼의 index
     */
    nextColumnIndex: function() {
        var columnName = this.nextColumnName();
        return this.grid.columnModel.indexOfColumnName(columnName, true);
    },

    /**
     * 이전 컬럼의 인덱스를 반환한다.
     * @return {Number} 이전 컬럼의 인덱스
     */
    prevColumnIndex: function() {
        var columnName = this.prevColumnName();
        return this.grid.columnModel.indexOfColumnName(columnName, true);
    },

    /**
     * keyEvent 발생 시 호출될 메서드로,
     * rowSpan 정보 까지 계산된 다음 rowKey 를 반환한다.
     * @param {number}  offset 이동할 offset
     * @return {Number|String} offset 만큼 이동한 위치의 rowKey
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
     * @return {Number|String} offset 만큼 이동한 위치의 rowKey
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
     * @return {String} 다음 컬럼명
     */
    nextColumnName: function() {
        return this._findColumnName(1);
    },

    /**
     * keyEvent 발생 시 호출될 메서드로, 이전 columnName 을 반환한다.
     * @return {String} 이전 컬럼명
     */
    prevColumnName: function() {
        return this._findColumnName(-1);
    },

    /**
     * 첫번째 row 의 key 를 반환한다.
     * @return {(string|number)} 첫번째 row 의 키값
     */
    firstRowKey: function() {
        return this.grid.dataModel.at(0).get('rowKey');
    },

    /**
     * 마지막 row의 key 를 반환한다.
     * @return {(string|number)} 마지막 row 의 키값
     */
    lastRowKey: function() {
        return this.grid.dataModel.at(this.grid.dataModel.length - 1).get('rowKey');
    },

    /**
     * 첫번째 columnName 을 반환한다.
     * @return {string} 첫번째 컬럼명
     */
    firstColumnName: function() {
        var columnModelList = this.grid.columnModel.getVisibleColumnModelList();
        return columnModelList[0]['columnName'];
    },

    /**
     * 마지막 columnName 을 반환한다.
     * @return {string} 마지막 컬럼명
     */
    lastColumnName: function() {
        var columnModelList = this.grid.columnModel.getVisibleColumnModelList(),
            lastIndex = columnModelList.length - 1;
        return columnModelList[lastIndex]['columnName'];
    }
});

module.exports = Focus;
