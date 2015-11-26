/**
 * @fileoverview Painter class for the text cell
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Cell = require('../cell');
var util = require('../../../util');
var formUtil = require('../../../formUtil');

/**
 * Painter class for the text cell
 * @module painter/cell/text
 */
var TextCell = tui.util.defineClass(Cell,/**@lends module:painter/cell/text.prototype */{
    /**
     * @constructs
     * @extends module:painter/cell
     * @param {object} attributes Attributes
     * @param {object} options Options
     */
    init: function(attributes, options) { // eslint-disable-line
        Cell.apply(this, arguments);
        this.setOwnProperties({
            originalText: ''
        });

        this.setKeyDownSwitch({
            'UP_ARROW': function() {},
            'DOWN_ARROW': function() {},
            'PAGE_UP': function() {},
            'PAGE_DOWN': function() {},
            'ENTER': function(keyDownEvent, param) {
                this.focusOut(param.$target.closest('td'));
            },
            'ESC': function(keyDownEvent, param) {
                this._restore(param.$target);
                this.focusOut(param.$target.closest('td'));
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
     * @return {string} html
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
     * @return {string} input 타입
     * @private
     */
    _getInputType: function() {
        return 'text';
    },

    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    getEditType: function() {
        return 'text';
    },

    /**
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    /* istanbul ignore next: focus, select 를 검증할 수 없음 */
    focusIn: function($td) {
        var $input = $td.find('input');
        if ($input.prop('disabled')) {
            this.grid.focusClipboard();
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
        this.grid.focusClipboard();
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
        //@fixme: defaultValue 옵션값 처리 (cellData.value 를 참조하도록)
        var columnModel = this.getColumnModel(cellData),
            editOption = columnModel.editOption,
            value = this.grid.dataModel.get(cellData.rowKey).getHTMLEncodedString(cellData.columnName),
            html;

        if (tui.util.isUndefined(value)) {
            value = '';
        }
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
     * @return {Boolean}    값의 변경여부
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
     * @return {string} 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링
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
            this.grid.setValue(rowKey, columnName, $target.val());
        }
        this.grid.selectionModel.enable();
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
        this.grid.selectionModel.end();
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
     * 해당 input 요소가 포함된 셀을 찾아 rowKey와 columnName을 객체로 반환한다.
     * @param  {jQuery} $input - 인풋 요소의 jquery 객체
     * @return {{rowKey: number, columnName: number}} 셀의 rowKey, columnName 정보
     * @private
     */
    _getCellInfoFromInput: function($input) {
        var $cell = $input.closest('td'),
            $row = $cell.closest('tr');

        return {
            rowKey: $row.attr('key'),
            columnName: $cell.attr('columnname')
        };
    },

    /**
     * event 객체가 발생한 셀을 찾아 editOption에 inputEvent 핸들러 정보가 설정되어 있으면
     * 해당 이벤트 핸들러를 호출해준다.
     * @param {Event} event - 이벤트 객체
     * @param {string} eventName - 이벤트명
     * @return {boolean} Return value of the event handler. Null if there's no event handler.
     * @private
     */
    _executeInputEventHandler: function(event, eventName) {
        var $input = $(event.target),
            cellInfo = this._getCellInfoFromInput($input),
            columnModel = this.grid.columnModel.getColumnModel(cellInfo.columnName),
            eventHandler = tui.util.pick(columnModel, 'editOption', 'inputEvents', eventName);

        if (_.isFunction(eventHandler)) {
            return eventHandler(event, cellInfo);
        }
        return null;
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
