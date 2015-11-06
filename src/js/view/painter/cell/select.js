/**
 * @fileoverview Painter class for the select cell
 * @author NHN Ent. FE Development Team
 */
'use strict';

var List = require('./list');
var util = require('../../../util');

/**
 * Painter class for the select cell
 * @module view/painter/cell/select
 */
var Select = tui.util.defineClass(List,/**@lends module:view/painter/cell/select.prototype */{
    /**
     * @constructs
     * @extends module:view/painter/cell/list
     */
    init: function() {
        List.apply(this, arguments);

        this.setKeyDownSwitch({
            'ESC': function(keyDownEvent, param) {
                this.focusOut(param.$target);
            },
            'ENTER': function(keyDownEvent, param) {
                this.focusOut(param.$target);
            }
        });
    },

    eventHandler: {
        'change select': '_onChange',
        'keydown select': '_onKeyDown'
    },

    contentTemplate: _.template(
        '<select' +
        ' name="<%=name%>"' +
        ' <% if (isDisabled) print("disabled"); %>' +
        '>' +
        '<%=options%>' +
        '</select>'
    ),

    /**
     * '=='구문은 의도된 구문.
     * The value of option is a type of stirng, and use '==' operator for comparison regardless of some types of value in cellData
     */
    optionTemplate: _.template(
        '<option' +
        ' value="<%=value%>"' +
        ' <% if (cellDataValue == value)  print("selected"); %>' +
        '>' +
        '<%=text%>' +
        '</option>'
    ),

    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    getEditType: function() {
        return 'select';
    },

    /**
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    focusIn: function($td) {
        /* istanbul ignore next */
        if ($td.find('select').prop('disabled')) {
            this.grid.focusClipboard();
        } else {
            $td.find('select').eq(0).focus();
        }
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
        var list = this.getOptionList(cellData),
            isDisabled = cellData.isDisabled,
            html = this._getConvertedHtml(cellData.value, cellData),
            optionsHtml = '';

        //@todo html !== null인경우 tc부족
        if (tui.util.isNull(html)) {
           _.each(list, function(item) {
               optionsHtml += this.optionTemplate({
                   value: item.value,
                   cellDataValue: cellData.value,
                   text: item.text
               });
           }, this);

           html = this.contentTemplate({
               name: util.getUniqueKey(),
               isDisabled: isDisabled,
               options: optionsHtml
           });
        }
        return html;
    },

    /**
     * 각 셀 페인터 인스턴스마다 정의된 getContentHtml 을 이용하여
     * 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링 을 반환한다.
     * (Input의 width를 beforeText와 afterText의 유무에 관계없이 100%로 유지하기 위해 마크업이 달라져야 하기 때문에
     * View.Base.Painter.Cell로부터 override 해서 구현함)
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
     * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
     * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @param {jquery} $td 해당 cell 엘리먼트
     * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
     */
    setElementAttribute: function(cellData, $td, hasFocusedElement) {
        var $select = $td.find('select');
        /*
        키보드 상하로 조작시 onChange 콜백에서 false 리턴시 이전 값으로
        돌아가지 않는 현상때문에 blur focus 를 수행한다.
         */

        /* istanbul ignore next: blur 확인 불가 */
        if (hasFocusedElement) {
            $select.blur();
        }
        $select.val(cellData.value);

        /* istanbul ignore next: focus 확인 불가 */
        if (hasFocusedElement) {
            $select.focus();
        }
    },

    /**
     * change 이벤트 핸들러
     * @param {Event} changeEvent   이벤트 객체
     * @private
     */
    _onChange: function(changeEvent) {
        var $target = $(changeEvent.target),
            cellAddr = this._getCellAddress($target),
            grid = this.grid;
        grid.setValue(cellAddr.rowKey, cellAddr.columnName, $target.val());
    }
});

module.exports = Select;
