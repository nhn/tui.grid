/**
 * @fileoverview Painter class for the row(TR) views
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../base/painter');
var util = require('../common/util');
var constMap = require('../common/constMap');
var attrNameConst = constMap.attrName;
var CELL_BORDER_WIDTH = constMap.dimension.CELL_BORDER_WIDTH;

/**
 * Painter class for the row(TR) views
 * @module painter/row
 * @extends module:base/painter
 */
var RowPainter = tui.util.defineClass(Painter, /**@lends module:painter/row.prototype */{
    /**
     * @constructs
     * @param {object} options - Options
     */
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
        '<%=rowKeyAttrName%>="<%=rowKey%>" ' +
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
        var editType = tui.util.pick(cellData.columnModel, 'editOption', 'type');

        return editType || 'normal';
    },

    /**
     * Returns the HTML string of all cells in Dummy row.
     * @param  {Array.<String>} columnNames - An array of column names
     * @returns {String} HTLM string
     * @private
     */
    _generateHtmlForDummyRow: function(columnNames) {
        var cellPainter = this.painterManager.getCellPainter('dummy'),
            html = '';

        _.each(columnNames, function(columnName) {
            html += cellPainter.generateHtml(columnName);
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
            var cellData = model.get(columnName),
                editType, cellPainter;

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
        var rowKey = model.get('rowKey'),
            html;

        if (_.isUndefined(rowKey)) {
            html = this._generateHtmlForDummyRow(columnNames);
        } else {
            html = this._generateHtmlForActualRow(model, columnNames);
        }

        return this.template({
            rowKeyAttrName: attrNameConst.ROW_KEY,
            rowKey: rowKey,
            height: model.get('height') + RowPainter._extraHeight + CELL_BORDER_WIDTH,
            contents: html,
            className: ''
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
                $td = $tr.find('td[' + attrNameConst.COLUMN_NAME + '=' + columnName + ']');
                editType = this._getEditType(columnName, cellData);
                cellPainter = this.painterManager.getCellPainter(editType);
                cellPainter.refresh(cellData, $td);
            }
        }, this);
    },

    static: {
        /**
         * IE7에서만 TD의 border만큼 높이가 늘어나는 버그에 대한 예외처리를 위한 값
         * @memberof RowPainter
         * @static
         */
        _extraHeight: (function() {
            var value = 0;
            if (util.isBrowserIE7()) {
                // css에서 IE7에 대해서만 padding의 높이를 위아래 1px씩 주고 있음 (border가 생겼을 때는 0)
                value = -2;
            }
            return value;
        })()
    }
});

module.exports = RowPainter;
