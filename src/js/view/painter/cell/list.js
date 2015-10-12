/**
 * @fileoverview 리스트 형태의 Cell Painter을 위한 Base 클래스
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Cell = require('../cell');

/**
 * editOption 에 list 를 가지고 있는 형태의 Base 클래스
 * @module painter/cell/list
 */
var List = ne.util.defineClass(Cell,/**@lends module:painter/cell/list.prototype */{
    /**
     * @constructs
     * @extends module:painter/cell
     */
    init: function() {
        Cell.apply(this, arguments);
    },

    redrawAttributes: ['isDisabled', 'isEditable', 'optionList'],

    eventHandler: {},

    /* eslint-disable */
    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    getEditType: function() {},

    /**
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    focusIn: function($td) {}, // eslint-disable-line no-unused-vars

    /**
     * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
     * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @return  {string} html 마크업 문자열
     * @example
     * var html = this.getContentHtml();
     * <select>
     *     <option value='1'>option1</option>
     *     <option value='2'>option1</option>
     *     <option value='3'>option1</option>
     * </select>
     */
    getContentHtml: function(cellData) { // eslint-disable-line no-unused-vars
        throw this.error('Implement getContentHtml(cellData, $target) method. On re-rendering');
    },

    /**
     * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
     * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @param {jQuery} $td 해당 cell 엘리먼트
     * @param {boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
     */
    setElementAttribute: function(cellData, $td, hasFocusedElement) { // eslint-disable-line no-unused-vars
        throw this.error('Implement setElementAttribute(cellData, $target) method. ');
    },
    /* eslint-enable */

    /**
     * List Type 의 option list 를 반환하는 메서드
     *
     * cellData 의 optionsList 가 존재한다면 cellData 의 옵션 List 를 반환하고,
     * 그렇지 않다면 columnModel 의 optionList 를 반환한다.
     * @param {Object} cellData 모델의 셀 데이터
     * @return {Array} 옵션 리스트
     */
    getOptionList: function(cellData) {
        var columnModel = this.grid.columnModel.getColumnModel(cellData.columnName);
        return cellData.optionList && cellData.optionList.length ? cellData.optionList : columnModel.editOption.list;
    }
});

module.exports = List;
