/**
 * @fileoverview CellPainter 의 기초 클래스
 * @author NHN Ent. FE Development Team
 */
'use strict';

var InputPainter = require('./base');
var util = require('../../common/util');
var formUtil = require('../../common/formUtil');

/**
 * Cell Painter Base
 * @module painter/cell
 * @extends module:base/painter
 */
var TextPainter = tui.util.defineClass(InputPainter, /**@lends module:painter/cell.prototype */{
    /**
     * @constructs
     * @param {Object} options - options
     */
    init: function(options) {
        InputPainter.apply(this, arguments);

        this.inputType = options.inputType;
        this._extendEvents({
            selectstart: '_onSelectStart'
        });
    },

    /**
     * Markup template
     * @returns {string} html
     */
    template: _.template(
        '<input' +
        ' type="<%=type%>"' +
        ' value="<%=value%>"' +
        ' name="<%=name%>"' +
        ' align="center"' +
        ' maxLength="<%=maxLength%>"' +
        ' <%=disabled%>' +
        '/>'
    ),

    /**
     * selectstart 이벤트 핸들러
     * IE에서 selectstart 이벤트가 Input 요소에 까지 적용되어 값에 셀렉션 지정이 안되는 문제를 해결
     * @param {Event} event 이벤트 객체
     * @private
     */
    _onSelectStart: function(event) {
        event.stopPropagation();
    },

    /**
     * Row Painter 에서 한번에 table 을 랜더링 할 때 사용하기 위해
     * td 단위의 html 문자열을 반환한다.
     * @param {object} cellData Model 의 셀 데이터
     * @returns {string} td 마크업 문자열
     */
    getHtml: function(cellData) {
        var maxLength = tui.util.pick(cellData, 'columnModel', 'editOption', 'maxLength');

        return this.template({
            type: this.inputType,
            value: cellData.value,
            name: util.getUniqueKey(),
            disabled: cellData.isDisabled ? 'disabled' : '',
            maxLength: maxLength
        });
    },

    /**
     * @override
     * @param {[type]} $parent [description]
     */
    focus: function($parent) {
        var $input = $parent.find(this.selector);

        formUtil.setCursorToEnd($input.get(0));
        $input.select();
    }
});

module.exports = TextPainter;
