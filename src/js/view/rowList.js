/**
 * @fileoverview RowList View
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view'),
    util = require('../common/util');

var CLASSNAME_SELECTED = 'selected',
    CLASSNAME_FOCUSED_ROW = 'focused_row',
    SELECTOR_META_CELL = 'td.meta_column';

/**
 * RowList View
 * @module view/rowList
 * @extends module:baes/view
 */
var RowList = View.extend(/**@lends module:view/rowList.prototype */{
    /**
     * @constructs
     * @param {object} options - Options
     * @param {string} [options.whichSide='R']   어느 영역에 속하는 rowList 인지 여부. 'L|R' 중 하나를 지정한다.
     */
    initialize: function(options) {
        var focusModel = options.focusModel,
            renderModel = options.renderModel,
            selectionModel = options.selectionModel,
            whichSide = options.whichSide || 'R';

        this.setOwnProperties({
            whichSide: whichSide,
            bodyTableView: options.bodyTableView,
            focusModel: focusModel,
            renderModel: renderModel,
            selectionModel: selectionModel,
            dataModel: options.dataModel,
            columnModel: options.columnModel,
            collection: renderModel.getCollection(whichSide),
            painterManager: options.painterManager,
            sortOptions: null,
            renderedRowKeys: null
        });

        this.listenTo(this.collection, 'change', this._onModelChange)
            .listenTo(this.collection, 'restore', this._onModelRestore)
            // .listenTo(focusModel, 'focusIn', this._onFocusIn)
            .listenTo(focusModel, 'change:rowKey', this._refreshFocusedRow)
            .listenTo(renderModel, 'rowListChanged', this.render);

        if (this.whichSide === 'L') {
            this.listenTo(focusModel, 'change:rowKey', this._refreshSelectedMetaColumns)
                .listenTo(selectionModel, 'change:range', this._refreshSelectedMetaColumns)
                .listenTo(renderModel, 'rowListChanged', this._refreshSelectedMetaColumns);
        }
    },

    /**
     * Returns the list of column models in it's own side
     * @returns {Array} - Column model list
     */
    _getColumnModelList: function() {
        return this.columnModel.getVisibleColumnModelList(this.whichSide, true);
    },

    /**
     * 기존에 생성되어 있던 TR요소들 중 새로 렌더링할 데이터와 중복되지 않은 목록의 TR요소만 삭제한다.
     * @param {array} dupRowKeys 중복된 데이터의 rowKey 목록
     */
    _removeOldRows: function(dupRowKeys) {
        var firstIdx = _.indexOf(this.renderedRowKeys, dupRowKeys[0]),
            lastIdx = _.indexOf(this.renderedRowKeys, _.last(dupRowKeys)),
            $rows = this.$el.children('tr');

        $rows.slice(0, firstIdx).remove();
        $rows.slice(lastIdx + 1).remove();
    },

    /**
     * 기존의 렌더링된 데이터와 중복되지 않은 목록에 대해서만 TR요소를 추가한다.
     * @param {array} rowKeys 렌더링할 데이터의 rowKey 목록
     * @param {array} dupRowKeys 중복된 데이터의 rowKey 목록
     */
    _appendNewRows: function(rowKeys, dupRowKeys) {
        var beforeRows = this.collection.slice(0, _.indexOf(rowKeys, dupRowKeys[0])),
            afterRows = this.collection.slice(_.indexOf(rowKeys, _.last(dupRowKeys)) + 1);

        this.$el.prepend(this._getRowsHtml(beforeRows));
        this.$el.append(this._getRowsHtml(afterRows));
    },

    /**
     * Redraw all rows.
     * @private
     */
    _resetRows: function() {
        var html = this._getRowsHtml(this.collection.models),
            $tbody;

        if (RowList.isInnerHtmlOfTbodyReadOnly) {
            $tbody = this.bodyTableView.redrawTable(html);
            this.setElement($tbody, false); // table이 다시 생성되었기 때문에 tbody의 참조를 갱신해준다.

            // prevent layout from breaking in IE7
            if (util.isBrowserIE7()) {
                $tbody.width($tbody.width());
            }
        } else {
            // As using a compatibility mode in IE makes it hard to detect the actual version of the browser,
            // use try/catch block to make in correct.
            try {
                this.$el[0].innerHTML = html;
            } catch (e) {
                RowList.isInnerHtmlOfTbodyReadOnly = true;
                this._resetRows();
            }
        }
    },

    /**
     * 행데이터 목록을 받아, HTML 문자열을 생성해서 반환한다.
     * @param {Model.Row[]} rows - 행데이터 목록
     * @returns {string} 생성된 HTML 문자열
     */
    _getRowsHtml: function(rows) {
        var rowPainter = this.painterManager.getRowPainter(),
            columnModelList = this._getColumnModelList();

        return _.map(rows, function(row) {
            return rowPainter.getHtml(row, columnModelList);
        }).join('');
    },

    /**
     * Returns a TR element of given rowKey
     * @param {(string|number)} rowKey - rowKey
     * @returns {jquery}
     * @private
     */
    _getRowElement: function(rowKey) {
        return this.$el.find('tr[key="' + rowKey + '"]');
    },

    /**
     * Refreshes 'selected' class of meta columns.
     * @private
     */
    _refreshSelectedMetaColumns: function() {
        var $rows = this.$el.find('tr'),
            $filteredRows;

        if (this.selectionModel.hasSelection()) {
            $filteredRows = this._filterRowsByIndexRange($rows, this.selectionModel.get('range').row);
        } else {
            $filteredRows = this._filterRowByKey($rows, this.focusModel.get('rowKey'));
        }

        $rows.find(SELECTOR_META_CELL).removeClass(CLASSNAME_SELECTED);
        $filteredRows.find(SELECTOR_META_CELL).addClass(CLASSNAME_SELECTED);
    },

    /**
     * Filters the rows by given range(index) and returns them.
     * @param {jQuery} $rows - rows (tr elements)
     * @param {Array.<Number>} rowRange - [startIndex, endIndex]
     * @returns {jQuery}
     * @private
     */
    _filterRowsByIndexRange: function($rows, rowRange) {
        var renderModel = this.renderModel,
            renderStartIndex = renderModel.get('startIndex'),
            startIndex, endIndex;

        startIndex = Math.max(rowRange[0] - renderStartIndex, 0);
        endIndex = Math.max(rowRange[1] - renderStartIndex + 1, 0); // add 1 for exclusive value

        if (!startIndex && !endIndex) {
            return $();
        }
        return $rows.slice(startIndex, endIndex);
    },

    /**
     * Filters the row by given rowKey
     * @param {jQuery} $rows - rows (tr elements)
     * @param {Number} rowKey - rowKey
     * @returns {jQuery}
     * @private
     */
    _filterRowByKey: function($rows, rowKey) {
        var rowIndex = this.dataModel.indexOfRowKey(rowKey),
            renderStartIndex = this.renderModel.get('startIndex');

        if (renderStartIndex > rowIndex) {
            return $();
        }
        return $rows.eq(rowIndex - renderStartIndex);
    },

    /**
     * Removes the CLASSNAME_FOCUSED_ROW class from the cells in the previously focused row and
     * adds it to the cells in the currently focused row.
     * @private
     */
    _refreshFocusedRow: function() {
        var rowKey = this.focusModel.get('rowKey'),
            prevRowKey = this.focusModel.get('prevRowKey');

        this._setFocusedRowClass(prevRowKey, false);
        this._setFocusedRowClass(rowKey, true);
    },

    /**
     * Finds all cells in the row indentified by given rowKey and toggles the CLASSNAME_FOCUSED_ROW on them.
     * @param {Number|String} rowKey - rowKey
     * @param {Boolean} focused - if set to true, the class will be added, otherwise be removed.
     * @private
     */
    _setFocusedRowClass: function(rowKey, focused) {
        var columnNames = _.pluck(this._getColumnModelList(), 'columnName'),
            trMap = {};

        _.each(columnNames, function(columnName) {
            var mainRowKey = this.dataModel.getMainRowKey(rowKey, columnName),
                $td;

            if (!trMap[mainRowKey]) {
                trMap[mainRowKey] = this._getRowElement(mainRowKey);
            }
            $td = trMap[mainRowKey].find('td[columnname=' + columnName + ']');
            $td.toggleClass(CLASSNAME_FOCUSED_ROW, focused);
        }, this);
    },

    /**
     * Event handler for 'focusIn' event on module:model/focus
     * @param  {(Number|String)} rowKey - RowKey of the target cell
     * @param  {String} columnName columnName - ColumnName of the target cell
     * @private
     */
    _onFocusIn: function(rowKey, columnName) {
        var whichSide = this.columnModel.isLside(columnName) ? 'L' : 'R',
            $td, editType, cellPainter;

        if (whichSide === this.whichSide) {
            $td = this.dataModel.getElement(rowKey, columnName);
            editType = this.columnModel.getEditType(columnName);
            cellPainter = this.painterManager.getCellPainter(editType);

            cellPainter.focusIn($td);
        }
    },

    /**
     * Renders.
     * @param {boolean} isModelChanged - 모델이 변경된 경우(add, remove..) true, 아니면(스크롤 변경 등) false
     * @returns {View.RowList} this 객체
     */
    render: function(isModelChanged) {
        var rowKeys = this.collection.pluck('rowKey'),
            dupRowKeys;

        this.bodyTableView.resetTablePosition();

        if (isModelChanged) {
            this._resetRows();
        } else {
            dupRowKeys = _.intersection(rowKeys, this.renderedRowKeys);
            if (_.isEmpty(rowKeys) || _.isEmpty(dupRowKeys) ||
                // 중복된 데이터가 70% 미만일 경우에는 성능을 위해 innerHTML을 사용.
                (dupRowKeys.length / rowKeys.length < 0.7)) { // eslint-disable-line no-magic-numbers
                this._resetRows();
            } else {
                this._removeOldRows(dupRowKeys);
                this._appendNewRows(rowKeys, dupRowKeys);
            }
        }
        this.renderedRowKeys = rowKeys;

        return this;
    },

    /**
     * modelChange 이벤트 발생시 실행되는 핸들러 함수.
     * @param {Model.Row} model Row 모델 객체
     * @private
     */
    _onModelChange: function(model) {
        var $tr = this._getRowElement(model.get('rowKey'));

        this.painterManager.getRowPainter().refresh(model.changed, $tr);
    },

    /**
     * Event handler for 'restore' event on module:model/row
     * @param {Object} cellData - CellData
     * @private
     */
    _onModelRestore: function(cellData) {
        var $td = this.dataModel.getElement(cellData.rowKey, cellData.columnName),
            editType = this.columnModel.getEditType(cellData.columnName);

        this.painterManager.getCellPainter(editType).redraw(cellData, $td);
    }
}, {
    /**
     * Whether the innerHTML property of a tbody element is readonly.
     * @memberof RowList
     * @static
     */
    isInnerHtmlOfTbodyReadOnly: (tui.util.browser.msie &&
        tui.util.browser.version <= 9) // eslint-disable-line no-magic-numbers
});

module.exports = RowList;
