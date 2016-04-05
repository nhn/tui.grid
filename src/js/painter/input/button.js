/**
 * @fileoverview Painter class for 'checkbox' and 'radio button'.
 * @author NHN Ent. FE Development Team
 */
'use strict';

var InputPainter = require('./base');
var util = require('../../common/util');

/**
 * Painter class for 'checkbox' and 'radio button'.
 * @module painter/input/button
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

        /**
         * css selector to find its own element(s) from a parent element.
         * @type {String}
         */
        this.selector = 'input[type=' + this.inputType + ']';

        this._extendKeydownActions({
            TAB: function(param) {
                var value;
                if (!this._focusNextInput(param.$target, param.shiftKey)) {
                    value = this._getCheckedValueString(param.$target);
                    this.controller.finishEditing(param.address, true, value);
                    this.controller.focusInToNextCell(param.shiftKey);
                }
            },
            ENTER: function(param) {
                var value = this._getCheckedValueString(param.$target);
                this.controller.finishEditing(param.address, true, value);
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
        '<label for="<%=id%>"><%=labelText%></label>'
    ),

    /**
     * Event handler for 'blur' event
     * @param {Event} event - event object
     * @override
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
                self.controller.finishEditing(address, false, value);
            }
        });
    },

    /**
     * Moves focus to the next input element.
     * @param {jquery} $target - target element
     * @param {Boolean} reverse - if set to true, find previous element instead of next element.
     * @returns {Boolean} - false if no element exist, true otherwise.
     */
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
     * Generates a HTML string from given data, and returns it.
     * @param {object} cellData - cell data
     * @returns {string} HTML string
     * @implements {module:base/painter}
     */
    generateHtml: function(cellData) {
        var value, checkedMap, name, html;

        if (!_.isNull(cellData.convertedHTML)) {
            return cellData.convertedHTML;
        }

        value = cellData.value;
        checkedMap = {};
        name = util.getUniqueKey();
        html = '';

        _.each(String(value).split(','), function(itemValue) {
            checkedMap[itemValue] = true;
        });

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
