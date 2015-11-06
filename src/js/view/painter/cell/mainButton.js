/**
 * @fileoverview Painter class for the main button
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Cell = require('../cell');

/**
 * Painter class for the main button
 * @module painter/cell/mainButton
 */
var MainButton = tui.util.defineClass(Cell,/**@lends module:painter/cell/mainButton.prototype */{
    /**
     * @constructs
     * @extends module:painter/cell
     */
    init: function() {
        Cell.apply(this, arguments);
        this.setKeyDownSwitch({
            'UP_ARROW': function() {},
            'DOWN_ARROW': function() {},
            'ENTER': function(keyDownEvent, param) {
                this.focusOut(param.$target);
            },
            'LEFT_ARROW': function() {},
            'RIGHT_ARROW': function() {},
            'ESC': function() {}
        });
    },

    /**
     * rendering 해야하는 cellData 의 변경 목록
     */
    redrawAttributes: ['isDisabled', 'isEditable', 'optionList'],

    eventHandler: {
        'mousedown': '_onMouseDown',
        'change input': '_onChange',
        'keydown input': '_onKeyDown'
    },

    /**
     * Content markup template
     * @return {string} html
     */
    contentTemplate: _.template(
        '<input' +
        ' type="<%=type%>"' +
        ' name="<%=name%>"' +
        ' <% if (isChecked) print("checked") %>' +
        ' <% if (isDisabled) print("disabled") %>' +
        '/>'
    ),

    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {string} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    getEditType: function() {
        return '_button';
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
        var isDisabled = cellData.isDisabled;

        return this.contentTemplate({
            type: this.grid.option('selectType'),
            name: this.grid.id,
            isChecked: !!cellData.value,
            isDisabled: isDisabled
        });
    },

    /**
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    /* istanbul ignore next */
    focusIn: function() {
        //아무것도 안하도록 변경
    },

    /**
     * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
     * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    setElementAttribute: function(cellData, $td) {
        var $input = $td.find('input'),
            isChecked = $input.prop('checked');
        if (isChecked !== !!cellData.value) {
            $input.prop('checked', cellData.value);
        }
    },

    /**
     * checked 를 toggle 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    toggle: function($td) {
        var $input = $td.find('input');
        if (this.grid.option('selectType') === 'checkbox') {
            $input.prop('checked', !$input.prop('checked'));
        }
    },

    /**
     * getHtml 으로 마크업 생성시 td에 포함될 attribute object 를 반환한다.
     * @return {Object} td 에 지정할 attribute 데이터
     */
    getAttributes: function() {
        return {
            align: 'center'
        };
    },

    /**
     * onChange 이벤트 핸들러
     * @param {Event} changeEvent 이벤트 객체
     * @private
     */
    _onChange: function(changeEvent) {
        var $target = $(changeEvent.target),
            rowKey = this.getRowKey($target);
        this.grid.setValue(rowKey, '_button', $target.prop('checked'));
    },

    /**
     * TD 전체 mousedown 이벤트 발생시 checkbox 클릭 이벤트를 발생시킨다.
     * @param {Event} mouseDownEvent 이벤트 객체
     * @private
     */
    _onMouseDown: function(mouseDownEvent) {
        var $target = $(mouseDownEvent.target);
        if (!$target.is('input')) {
            $target.find('input').trigger('click');
        }
    }
});

module.exports = MainButton;
