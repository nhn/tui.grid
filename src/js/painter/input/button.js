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
        this.selector = 'fieldset[data-type=' + this.inputType + ']';

        this._extendEvents({
            mousedown: '_onMouseDown'
        });

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
     * fieldset markup template
     * @returns {String}
     */
    template: _.template(
        '<fieldset data-type="<%=type%>"><%=content%></fieldset>'
    ),

    /**
     * Input markup template
     * @returns {String}
     */
    inputTemplate: _.template(
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
    _onFocusOut: function(event) {
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
     * Event handler for 'mousedown' DOM event
     * @param {MouseEvent} event - mouse event object
     */
    _onMouseDown: function(event) {
        var $target = $(event.target);
        var hasFocusedInput = $target.closest('fieldset').find('input:focus').length > 0;

        if (!$target.is('input') && hasFocusedInput) {
            event.stopPropagation();
            event.preventDefault();
        }
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
     * Returns the set object that contains the checked value.
     * @param {String} value - value
     * @returns {Object}
     */
    _getCheckedValueSet: function(value) {
        var checkedMap = {};

        _.each(String(value).split(','), function(itemValue) {
            checkedMap[itemValue] = true;
        });

        return checkedMap;
    },

    /**
     * Returns the value string of given data to display in the cell.
     * @param {Object} cellData - cell data
     * @implements {module:painter/input/base}
     * @returns {String}
     * @protected
     */
    _getDisplayValue: function(cellData) {
        var optionItems = cellData.columnModel.editOption.list;
        var checkedSet = this._getCheckedValueSet(cellData.value);
        var optionTexts = [];

        _.each(optionItems, function(item) {
            if (checkedSet[item.value]) {
                optionTexts.push(item.text);
            }
        });

        return optionTexts.join(',');
    },

    /**
     * Generates a input HTML string from given data, and returns it.
     * @param {object} cellData - cell data
     * @implements {module:painter/input/base}
     * @returns {string}
     * @protected
     */
    _generateInputHtml: function(cellData) {
        var checkedSet = this._getCheckedValueSet(cellData.value);
        var name = util.getUniqueKey();
        var contentHtml = '';

        _.each(cellData.columnModel.editOption.list, function(item) {
            var id = name + '_' + item.value;

            contentHtml += this.inputTemplate({
                type: this.inputType,
                id: id,
                name: name,
                value: item.value,
                checked: checkedSet[item.value] ? 'checked' : '',
                disabled: cellData.isDisabled ? 'disabled' : ''
            });
            if (item.text) {
                contentHtml += this.labelTemplate({
                    id: id,
                    labelText: item.text
                });
            }
        }, this);

        return this.template({
            type: this.inputType,
            content: contentHtml
        });
    },

    /**
     * Finds an element from the given parent element with 'this.selector', and moves focus to it.
     * @param {jquery} $parent - parent element
     */
    focus: function($parent) {
        var $input = $parent.find('input');

        if (!$input.is(':focus')) {
            $input.eq(0).focus();
        }
    }
});

module.exports = ButtonPainter;
