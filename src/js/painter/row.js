/**
 * @fileoverview Row Painter 정의
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../base/painter');
var util = require('../common/util');

/**
 * Row Painter
 * 성능 향상을 위해 Row Painter 를 위한 클래스 생성
 * @module painter/row
 */
var RowPainter = tui.util.defineClass(Painter,/**@lends module:painter/row.prototype */{
    /**
     * @constructs
     * @extends module:base/painter
     * @param {object} options - Options
     *      @param {string} [options.whichSide='R']   어느 영역에 속하는 row 인지 여부. 'L|R' 중 하나를 지정한다.
     *      @param {object} options.collection change 를 감지할 collection 객체
     */
    init: function(options) {
        Painter.apply(this, arguments);
        this.painterManager = options.painterManager;
    },

    template: _.template(
        '' +
        '<tr ' +
        'key="<%=key%>" ' +
        'class="<%=className%>" ' +
        'style="height: <%=height%>px;">' +
        '<%=contents%>' +
        '</tr>'
    ),

    /**
     * model 변경 시 이벤트 핸들러
     * @param {object} model - 변화가 일어난 모델 인스턴스
     * @param {jQuery} $tr - jquery object for tr element
     */
    onModelChange: function(model, $tr) {
        _.each(model.changed, function(cellData, columnName) {
            var editType, cellPainter;

            if (columnName !== '_extraData') {
                editType = this._getEditType(columnName, cellData);
                cellPainter = this.painterManager.getCellPainter(editType);
                cellPainter.onModelChange(cellData, $tr);
            }
        }, this);
    },

    /**
     * cellData 의 isEditable 프로퍼티에 따른 editType 을 반환한다.
     * editable 프로퍼티가 false 라면 normal type 으로 설정한다.
     * @param {string} columnName 컬럼명
     * @param {Object} cellData 셀 데이터
     * @return {string} cellFactory 에서 사용될 editType
     * @private
     */
    _getEditType: function(columnName, cellData) {
        var editType = this.grid.columnModel.getEditType(columnName);
        if (!cellData.isEditable && columnName !== '_number') {
            editType = 'normal';
        }
        return editType;
    },

    /**
     * Returns the HTML string of all cells in Dummy row.
     * @param  {Number} columnLength - Length of column model list
     * @return {String} HTLM string
     * @private
     */
    _getHtmlForDummyRow: function(columnLength) {
        var cellPainter = this.painterManager.getCellPainter('dummy'),
            html = '';

        _.times(columnLength, function() {
            html += cellPainter.getHtml();
        });
        return html;
    },

    /**
     * Returns the HTML string of all cells in Actual row.
     * @param  {module:model/row} model - View model instance
     * @param  {Array.<Object>} columnModelList - Column model list
     * @return {String} HTLM string
     * @private
     */
    _getHtmlForActualRow: function(model, columnModelList) {
        var html = '';

        _.each(columnModelList, function(columnModel) {
            var columnName = columnModel.columnName,
                cellData = model.get(columnName),
                editType, cellPainter;

            if (cellData && cellData.isMainRow) {
                editType = this._getEditType(columnName, cellData);
                cellPainter = this.painterManager.getCellPainter(editType);
                html += cellPainter.getHtml(cellData);
            }
        }, this);
        return html;
    },

    /**
     * Returns the HTML string of all cells in the given model (row).
     * @param  {module:model/row} model - View model instance
     * @param  {Array.<Object>} columnModelList - Column model list
     * @return {String} HTLM string
     */
    getHtml: function(model, columnModelList) {
        var rowKey = model.get('rowKey'),
            html;

        if (_.isUndefined(rowKey)) {
            html = this._getHtmlForDummyRow(columnModelList.length);
        } else {
            html = this._getHtmlForActualRow(model, columnModelList);
        }

        return this.template({
            key: rowKey,
            height: this.grid.dimensionModel.get('rowHeight') + RowPainter._extraHeight,
            contents: html,
            className: ''
        });
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
        }())
    }
});

module.exports = RowPainter;
