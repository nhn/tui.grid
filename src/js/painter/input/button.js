/**
 * @fileoverview CellPainter 의 기초 클래스
 * @author NHN Ent. FE Development Team
 */
'use strict';

var InputPainter = require('./base');
var util = require('../../common/util');

/**
 * Cell Painter Base
 * @module painter/cell
 * @extends module:base/painter
 */
var ButtonPainter = tui.util.defineClass(InputPainter, /**@lends module:painter/cell.prototype */{
    /**
     * @constructs
     * @param {Object} options - options
     */
    init: function(options) {
        InputPainter.apply(this, arguments);

        this.inputType = options.inputType;

        this._extendKeydownActions({
            TAB: function(param) {
                if (!this._focusNextInput(param.$target, param.shiftKey)) {
                    this.controller.endEdit(param.address, true, param.value);
                    this.controller.focusInNext(param.shiftKey);
                }
            },
            ENTER: function(param) {
                var value = this._getCheckedValueString(param.$target);
                this.controller.endEdit(param.address, true, value);
            },
            LEFT_ARROW: function(param) {
                this._focusNextInput(param.$target, true);
            },
            RIGHT_ARROW: function(param) {
                this._focusNextInput(param.$target);
            },
            UP_ARROW: function() {},
            DOWN_ARROW: function() {}
        });
    },

    /**
     * Input markup template
     * @returns {String}
     */
    template: _.template(
        '<input type="<%=type%>" name="<%=name%>" id="<%=id%>" value="<%=value%>"' +
        ' <%=checked%> <%=disabled%> />'
    ),

    /**
     * Label markup template
     * @returns {String}
     */
    labelTemplate: _.template(
        '<label for="<%=id%>" style="margin-right:10px;"><%=labelText%></label>'
    ),

    /**
     * Event handler for 'blur' event
     * @param {Event} event - event object
     * @private
     */
    _onBlur: function(event) {
        var $target = $(event.target);
        var self = this;

        _.defer(function() {
            var address, value;

            if (!$target.siblings('input:focus').length) {
                address = self._getCellAddress($target);
                value = self._getCheckedValueString($target);
                self.controller.endEdit(address, false, value);
            }
        });
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
     * Returns the comma seperated value of all checked inputs
     * @param {jQuery} $target - target element
     * @returns {String}
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
     * @returns {String} - HTML String
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
    }
});

module.exports = ButtonPainter;
