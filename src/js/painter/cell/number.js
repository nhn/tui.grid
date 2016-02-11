/**
 * @fileoverview Painter class for the number cell
 * @author NHN Ent. FE Development Team
 */
'use strict';

var NormalCell = require('./normal');

/**
 * Number Cell 의 Painter
 * @module painter/cell/number
 * @extends module:painter/cell/normal
 */
var NumberCell = tui.util.defineClass(NormalCell, /**@lends module:painter/cell/number.prototype */{
    /**
     * @constructs
     */
    init: function() {
        NormalCell.apply(this, arguments);
    },

    redrawAttributes: [],

    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @returns {string} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    getEditType: function() {
        return '_number';
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
    getContentHtml: function(cellData) {
        return cellData.value;
    }
});

module.exports = NumberCell;
