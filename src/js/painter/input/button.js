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
var ButtonPainter = tui.util.defineClass(Painter, /**@lends module:painter/cell.prototype */{
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
        'keydown input': '_onKeyDown',
        'blur input': '_onBlur',
        'focus input': '_onFocus'
    },

    /**
     * markup template
     * @returns {String} html
     */
    template: _.template(
        '<input type="<%=type%>" name="<%=name%>" id="<%=id%>" value="<%=value%>"' +
        ' <%=checked%> <%=disabled%> />'
    ),

    /**
     * Label markup template
     * It will be added to content
     * @returns {String} html
     */
    labelTemplate: _.template(
        '<label for="<%=id%>" style="margin-right:10px;"><%=labelText%></label>'
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

        this.controller.startEdit(address);
    },

    /**
     * focus 이벤트 핸들러
     * @param {Event} event 이벤트 객체
     * @private
     */
    _onBlur: function(event) {
        var address = this._getCellAddress($(event.target));
        var $target = $(event.target);
        var self = this;

        _.defer(function() {
            if (!$target.siblings('input:focus').length) {
                self.controller.endEdit(address, false, self._getCheckedValueString($target));
            }
        });
    },

    /**
     * keydown 이벤트 핸들러
     * @param  {KeyboardEvent} event 키보드 이벤트 객체
     * @private
     */
    _onKeyDown: function(event) {
        var keyCode = event.keyCode || event.which,
            keyName = keyNameMap[keyCode],
            $target = $(event.target),
            address = this._getCellAddress($target),
            value = this._getCheckedValueString($target);

        switch (keyName) {
            case 'ESC':
                this.controller.endEdit(address, true);
                break;
            case 'ENTER':
                this.controller.endEdit(address, true, value);
                break;
            case 'TAB':
                if (!this._focusNextInput($target, event.shiftKey)) {
                    this.controller.endEdit(address, true, value);
                    this.controller.focusInNext(event.shiftKey);
                }
                event.preventDefault();
                break;
            case 'LEFT_ARROW':
                this._focusNextInput($target, true);
                event.preventDefault();
                break;
            case 'RIGHT_ARROW':
                this._focusNextInput($target);
                event.preventDefault();
                break;
            case 'UP_ARROW':
            case 'DOWN_ARROW':
                event.preventDefault();
                break;
            default:
                // do nothing
        }
    },

    _focusNextInput: function($target, reverse) {
        var traverseFuncName = reverse ? 'prevAll' : 'nextAll',
            $nextInputs = $target[traverseFuncName]('input');

        if ($nextInputs.length) {
            $nextInputs.first().focus();
            return true;
        }
        return false;
    },

    /**
     * check 된 button 의 값들을 가져온다. onChange 이벤트 핸들러에서 호출한다.
     * @param {jQuery} $target 이벤트가 발생한 targetElement
     * @returns {Array}  check 된 값들의 결과 배열
     * @private
     */
    _getCheckedValueString: function($target) {
        var $checkedInputs = $target.parent().find('input:checked'),
            checkedValues = [];

        $checkedInputs.each(function() {
            checkedValues.push(this.value);
        });

        return checkedValues.join(',');
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
        var value = cellData.value,
            html = cellData.convertedHTML,
            name = util.getUniqueKey(),
            checkedMap = {};

        if (!_.isNull(html)) {
            return html;
        }

        _.each(String(value).split(','), function(itemValue) {
            checkedMap[itemValue] = true;
        });

        html = '';
        _.each(cellData.columnModel.editOption.list, function(item) {
            var id = name + '_' + item.value;

            html += this.template({
                type: this.inputType,
                id: id,
                name: name,
                value: item.value,
                checked: checkedMap[item.value] ? 'checked' : '',
                disabled: cellData.isDisabled ? 'disabled' : ''
            });
            if (item.text) {
                html += this.labelTemplate({
                    id: id,
                    labelText: item.text
                });
            }
        }, this);

        return html;
    },

    focus: function($td) {
        $td.find('input').eq(0).focus();
    }
});

module.exports = ButtonPainter;
