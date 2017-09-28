/**
 * @fileoverview Painter class for the row(TR) views
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');
var snippet = require('tui-code-snippet');

var Painter = require('../base/painter');
var constMap = require('../common/constMap');
var classNameConst = require('../common/classNameConst');
var attrNameConst = constMap.attrName;
var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;

/**
 * Painter class for the row(TR) views
 * @module painter/row
 * @extends module:base/painter
 * @param {object} options - Options
 * @ignore
 */
var RowPainter = snippet.defineClass(Painter, /** @lends module:painter/row.prototype */{
    init: function(options) {
        Painter.apply(this, arguments);
        this.painterManager = options.painterManager;
    },

    /**
     * css selector to find its own element(s) from a parent element.
     * @type {String}
     */
    selector: 'tr',

    /**
     * markup template
     * @returns {String} HTML string
     */
    template: _.template(
        '<tr ' +
        '<%=rowKeyAttr%>" ' +
        'class="<%=className%>" ' +
        'style="height: <%=height%>px;">' +
        '<%=contents%>' +
        '</tr>'
    ),

    /**
     * cellData 의 isEditable 프로퍼티에 따른 editType 을 반환한다.
     * editable 프로퍼티가 false 라면 normal type 으로 설정한다.
     * @param {string} columnName 컬럼명
     * @param {Object} cellData 셀 데이터
     * @returns {string} cellFactory 에서 사용될 editType
     * @private
     */
    _getEditType: function(columnName, cellData) {
        var editType = snippet.pick(cellData.columnModel, 'editOptions', 'type');

        return editType || 'normal';
    },

    /**
     * Returns the HTML string of all cells in Dummy row.
     * @param {Number} rowNum - row number
     * @param {Array.<String>} columnNames - An array of column names
     * @returns {String} HTLM string
     * @private
     */
    _generateHtmlForDummyRow: function(rowNum, columnNames) {
        var cellPainter = this.painterManager.getCellPainter('dummy');
        var html = '';

        _.each(columnNames, function(columnName) {
            html += cellPainter.generateHtml(rowNum, columnName);
        });

        return html;
    },

    /**
     * Returns the HTML string of all cells in Actual row.
     * @param  {module:model/row} model - View model instance
     * @param  {Array.<String>} columnNames - An array of column names
     * @returns {String} HTLM string
     * @private
     */
    _generateHtmlForActualRow: function(model, columnNames) {
        var html = '';

        _.each(columnNames, function(columnName) {
            var cellData = model.get(columnName);
            var editType, cellPainter;

            if (cellData && cellData.isMainRow) {
                editType = this._getEditType(columnName, cellData);
                cellPainter = this.painterManager.getCellPainter(editType);
                html += cellPainter.generateHtml(cellData);
            }
        }, this);

        return html;
    },

    /**
     * Returns the HTML string of all cells in the given model (row).
     * @param  {module:model/row} model - View model instance
     * @param  {Array.<String>} columnNames - An array of column names
     * @returns {String} HTLM string
     */
    generateHtml: function(model, columnNames) {
        var rowKey = model.get('rowKey');
        var rowNum = model.get('rowNum');
        var className = (rowNum % 2) ? classNameConst.ROW_ODD : classNameConst.ROW_EVEN;
        var rowKeyAttr = '';
        var html;

        if (_.isUndefined(rowKey)) {
            html = this._generateHtmlForDummyRow(rowNum, columnNames);
        } else {
            rowKeyAttr = attrNameConst.ROW_KEY + '="' + rowKey + '"';
            html = this._generateHtmlForActualRow(model, columnNames);
        }

        return this.template({
            rowKeyAttr: rowKeyAttr,
            height: model.get('height') + CELL_BORDER_WIDTH,
            contents: html,
            className: className
        });
    },

    /**
     * Refreshes the row(TR) element.
     * @param {object} changed - object that contains the changed data using columnName as keys
     * @param {jQuery} $tr - jquery object for tr element
     */
    refresh: function(changed, $tr) {
        _.each(changed, function(cellData, columnName) {
            var editType, cellPainter, $td;

            if (columnName !== '_extraData') {
                $td = $tr.find('td[' + attrNameConst.COLUMN_NAME + '="' + columnName + '"]');
                editType = this._getEditType(columnName, cellData);
                cellPainter = this.painterManager.getCellPainter(editType);
                cellPainter.refresh(cellData, $td);
            }
        }, this);
    }
});

module.exports = RowPainter;
