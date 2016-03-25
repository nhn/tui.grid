/**
 * @fileoverview Painter class for the text cell
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Cell = require('../cell');
var util = require('../../common/util');
var formUtil = require('../../common/formUtil');

/**
 * Painter class for the text cell
 * @module painter/cell/text
 * @extends module:painter/cell
 */
var TextCell = tui.util.defineClass(Cell, /**@lends module:painter/cell/text.prototype */{
    /**
     * @constructs
     * @param {object} attributes Attributes
     * @param {object} options Options
     */
    init: function(attributes, options) { // eslint-disable-line
        Cell.apply(this, arguments);
        this.setOwnProperties({
            originalText: ''
        });

        this.setKeyDownSwitch({
            'ENTER': function() {
                this.controller.focusOut();
            },
            'ESC': function(keyDownEvent, param) {
                this._restore(param.$target);
                this.controller.focusOut();
            }
        });
    },

    redrawAttributes: ['isEditable'],

    eventHandler: {
        'blur input': '_onBlur',
        'keydown input': '_onKeyDown',
        'focus input': '_onFocus',
        'selectstart input': '_onSelectStart'
    },

    /**
     * Content markup template
     * @returns {string} html
     */
    contentTemplate: _.template(
        '<input' +
        ' type="<%=type%>"' +
        ' value="<%=value%>"' +
        ' name="<%=name%>"' +
        ' align="center"' +
        ' maxLength="<%=maxLength%>"' +
        ' <% if (isDisabled) print("disabled"); %>' +
        '/>'
    ),

    /**
     * input type 을 반환한다.
     * @returns {string} input 타입
     * @private
     */
    _getInputType: function() {
        return 'text';
    },

    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @returns {String} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    getEditType: function() {
        return 'text';
    },

    /**
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    focusIn: function($td) {
        var $input = $td.find('input');
        if ($input.prop('disabled')) {
            this.controller.focusOut();
        } else {
            formUtil.setCursorToEnd($input.get(0));
            $input.select();
        }
    },

    /**
     * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
     * - 필요에 따라 override 한다.
     */
    focusOut: function() {
        this.controller.focusOut();
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
        var columnModel = this.getColumnModel(cellData),
            editOption = columnModel.editOption,
            value = cellData.value,
            html = this._getConvertedHtml(value, cellData);

        if (tui.util.isNull(html)) {
            html = this.contentTemplate({
                type: this._getInputType(),
                value: value,
                name: util.getUniqueKey(),
                isDisabled: cellData.isDisabled,
                maxLength: editOption.maxLength
            });
        }
        return html;
    },

    /**
     * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
     * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    setElementAttribute: function(cellData, $td) {
        var isValueChanged = $.inArray('value', cellData.changed) !== -1,
            $input = $td.find('input');

        if (isValueChanged) {
            $input.val(cellData.value);
        }
        $input.prop('disabled', cellData.isDisabled);
    },

    /**
     * 원래 text 와 비교하여 값이 변경 되었는지 여부를 판단한다.
     * @param {jQuery} $input   인풋 jquery 엘리먼트
     * @returns {Boolean}    값의 변경여부
     * @private
     */
    _isEdited: function($input) {
        return $input.val() !== this.originalText;
    },

    /**
     * 원래 text로 값을 되돌린다.
     * @param {jQuery} $input 인풋 jquery 엘리먼트
     * @private
     */
    _restore: function($input) {
        $input.val(this.originalText);
    },

    /**
     * 각 셀 페인터 인스턴스마다 정의된 getContentHtml 을 이용하여
     * 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링 을 반환한다.
     * (Input의 width를 beforeText와 afterText의 유무에 관계없이 100%로 유지하기 위해 마크업이 달라져야 하기 때문에
     * Painter.Cell로부터 override 해서 구현함)
     * @param {object} cellData Model 의 셀 데이터
     * @returns {string} 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링
     * @private
     * @override
     */
    _getContentHtml: function(cellData) {
        var columnName = cellData.columnName,
            columnModel = this.grid.columnModel.getColumnModel(columnName),
            editOption = columnModel.editOption || {},
            content = '',
            beforeContent, afterContent;

        if (!tui.util.isExisty(cellData.value)) {
            cellData.value = columnModel.defaultValue;
        }
        beforeContent = this._getExtraContent(editOption.beforeContent || editOption.beforeText, cellData);
        afterContent = this._getExtraContent(editOption.afterContent || editOption.afterText, cellData);

        if (beforeContent) {
            content += this._getSpanWrapContent(beforeContent, 'before', cellData);
        }
        if (afterContent) {
            content += this._getSpanWrapContent(afterContent, 'after', cellData);
        }
        content += this._getSpanWrapContent(this.getContentHtml(cellData), 'input');

        return content;
    },

    /**
     * blur 이벤트 핸들러
     * @param {Event} blurEvent 이벤트 객체
     * @private
     */
    _onBlur: function(blurEvent) {
        var $target = $(blurEvent.target),
            rowKey = this.getRowKey($target),
            columnName = this.getColumnName($target);

        this._executeInputEventHandler(blurEvent, 'blur');
        if (this._isEdited($target)) {
            this.controller.setValue(rowKey, columnName, $target.val());
        }
        this.controller.enableSelection();
        this.controller.validateCell(rowKey, columnName);
    },

    /**
     * focus 이벤트 핸들러
     * @param {Event} focusEvent 이벤트 객체
     * @private
     */
    _onFocus: function(focusEvent) {
        var $input = $(focusEvent.target);

        this.originalText = $input.val();
        this._executeInputEventHandler(focusEvent, 'focus');
        this.controller.endSelection();
    },

    /**
     * keydown 이벤트 핸들러
     * @param  {KeyboardEvent} keyboardEvent 키보드 이벤트 객체
     * @private
     */
    _onKeyDown: function(keyboardEvent) {
        this._executeInputEventHandler(keyboardEvent, 'keydown');
        Cell.prototype._onKeyDown.call(this, keyboardEvent);
    },

    /**
     * event 객체가 발생한 셀을 찾아 editOption에 inputEvent 핸들러 정보가 설정되어 있으면
     * 해당 이벤트 핸들러를 호출해준다.
     * @param {Event} event - 이벤트 객체
     * @param {string} eventType - The type of the event.
     *     This value is required to clarify the type because the `event.type` of the 'focus' event
     *     can be 'focusin' and the 'blur' event can be 'focusout'
     * @returns {boolean} Return value of the event handler. Null if there's no event handler.
     * @private
     */
    _executeInputEventHandler: function(event) {
        var $input = $(event.target),
            cellInfo = this._getCellAddress($input);

        return this.controller.executeCustomInputEventHandler(event, cellInfo);
    },

    /**
     * selectstart 이벤트 핸들러
     * IE에서 selectstart 이벤트가 Input 요소에 까지 적용되어 값에 셀렉션 지정이 안되는 문제를 해결
     * @param {Event} event 이벤트 객체
     * @private
     */
    _onSelectStart: function(event) {
        event.stopPropagation();
    }
});

module.exports = TextCell;
