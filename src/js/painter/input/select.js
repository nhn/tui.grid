/**
 * @fileoverview CellPainter 의 기초 클래스
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../../base/painter');
var util = require('../../common/util');
var keyNameMap = require('../../common/constMap').keyName;

/**
 * Cell Painter Base
 * @module painter/cell
 * @extends module:base/painter
 */
var SelectPainter = tui.util.defineClass(Painter, /**@lends module:painter/cell.prototype */{
    /**
     * @constructs
     * @param {Object} options - options
     */
    init: function(options) {
        Painter.apply(this, arguments);

        this.controller = options.controller;
        this.inputType = options.inputType;
    },

    eventHandler: {
        'keydown select': '_onKeyDown',
        'blur select': '_onBlur',
        'focus select': '_onFocus'
    },

    /**
     * Content markup template
     * @returns {string} html
     */
    template: _.template(
        '<select name="<%=name%>" <%=disabled%>><%=options%></select>'
    ),

    /**
     * Options markup template
     * It will be added to content
     * :: The value of option is a type of stirng, and use '==' operator for
     *    comparison regardless of some types of value in cellData
     * @returns {string} html
     */
    optionTemplate: _.template(
        '<option value="<%=value%>" <%=selected%>><%=text%></option>'
    ),

    /**
     * 인자로 받은 element 로 부터 rowKey 와 columnName 을 반환한다.
     * @param {jQuery} $target 조회할 엘리먼트
     * @returns {{rowKey: String, columnName: String}} rowKey 와 columnName 정보
     * @private
     */
    _getCellAddress: function($target) {
        return {
            rowKey: $target.closest('tr').attr('key'),
            columnName: $target.closest('td').attr('columnName')
        };
    },

    /**
     * focus 이벤트 핸들러
     * @param {Event} event 이벤트 객체
     * @private
     */
    _onFocus: function(event) {
        var address = this._getCellAddress($(event.target));

        this.controller.startEdit(address.rowKey, address.columnName);
    },

    /**
     * blur 이벤트 핸들러
     * @param {Event} blurEvent 이벤트 객체
     * @private
     */
    _onBlur: function(blurEvent) {
        this.controller.endEdit(false, blurEvent.target.value);
    },

    /**
     * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
     * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @returns {string} html 마크업 문자열
     * @example
     * var html = this.getContentHtml();
     * <select>
     *     <option value='1'>option1</option>
     *     <option value='2'>option1</option>
     *     <option value='3'>option1</option>
     * </select>
     */
    getHtml: function(cellData) {
        var optionItems = cellData.columnModel.editOption.list,
            optionHtml;

        if (!_.isNull(cellData.convertedHTML)) {
            return cellData.convertedHTML;
        }

        optionHtml = _.reduce(optionItems, function(html, item) {
            return html + this.optionTemplate({
                value: item.value,
                text: item.text,
                selected: (String(cellData.value) === String(item.value)) ? 'selected' : ''
            });
        }, '', this);

        return this.template({
            name: util.getUniqueKey(),
            disabled: cellData.isDisabled ? 'disabled' : '',
            options: optionHtml
        });
    },

    /**
     * keydown 이벤트 핸들러
     * @param  {KeyboardEvent} event 키보드 이벤트 객체
     * @private
     */
    _onKeyDown: function(event) {
        var keyCode = event.keyCode || event.which,
            keyName = keyNameMap[keyCode];

        switch (keyName) {
            case 'ESC':
                this.controller.endEdit(true);
                break;
            case 'ENTER':
                this.controller.endEdit(true, event.target.value);
                break;
            case 'TAB':
                this.controller.endEdit(true, event.target.value);
                this.controller.focusInNext(event.shiftKey);
                event.preventDefault();
                break;
            default:
                // do nothing
        }
    },

    focus: function($td) {
        $td.find('select').eq(0).focus();
    },

    setValue: function($td, value) {
        $td.find('select').val(value);
    }
});

module.exports = SelectPainter;
