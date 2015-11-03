/**
 * @fileoverview 기본 Cell (일반, 숫자, 메인 Checkbox) 관련 Painter 정의
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Cell = require('../cell');

/**
 * editOption 이 적용되지 않은 cell 의 Painter
 * @module painter/cell/normal
 */
var Normal = tui.util.defineClass(Cell,/**@lends module:painter/cell/normal.prototype */{
    /**
     * @constructs
     * @extends module:painter/cell
     */
    init: function() {
        Cell.apply(this, arguments);
    },

    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {string} editType 'normal|select|button|text|text-convertible'
     */
    getEditType: function() {
        return 'normal';
    },

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
    getContentHtml: function(cellData) {
        var columnName = cellData.columnName,
            columnModel = this.grid.columnModel.getColumnModel(columnName),
            value = this.grid.dataModel.get(cellData.rowKey).getHTMLEncodedString(columnName),
            rowKey = cellData.rowKey;
        if (tui.util.isFunction(columnModel.formatter)) {
            value = columnModel.formatter(value, this.grid.dataModel.get(rowKey).toJSON(), columnModel);
        }
        if (!tui.util.isExisty(value)) {
            value = '';
        }
        return value;
    },

    /**
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     */
    focusIn: function() {
        this.grid.focusClipboard();
    },

    /**
     * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
     * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @param {jQuery} $td 해당 cell 엘리먼트
     * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
     */
    /* istanbul ignore next */
    setElementAttribute: function(cellData, $td, hasFocusedElement) {} // eslint-disable-line
});

module.exports = Normal;
