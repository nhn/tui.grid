/**
 * @fileoverview Painter class for the 'input[type=text]' and 'input[type=password]'.
 * @author NHN Ent. FE Development Team
 */
'use strict';

var InputPainter = require('./base');
var util = require('../../common/util');
var formUtil = require('../../common/formUtil');

/**
 * Painter class for the 'input[type=text]' and 'input[type=password]'
 * @module painter/cell
 * @extends module:base/painter
 */
var TextPainter = tui.util.defineClass(InputPainter, /**@lends module:painter/cell.prototype */{
    /**
     * @constructs
     * @param {Object} options - options
     */
    init: function(options) {
        InputPainter.apply(this, arguments);

        this.inputType = options.inputType;

        /**
         * css selector to use delegated event handlers by '$.on()' method.
         * @type {String}
         */
        this.selector = 'input[type=' + this.inputType + ']';

        this._extendEvents({
            selectstart: '_onSelectStart'
        });
    },

    /**
     * Markup template
     * @returns {string} html
     */
    template: _.template(
        '<input' +
        ' type="<%=type%>"' +
        ' value="<%=value%>"' +
        ' name="<%=name%>"' +
        ' align="center"' +
        ' maxLength="<%=maxLength%>"' +
        ' <%=disabled%>' +
        '/>'
    ),

    /**
     * Event handler for the'selectstart' event.
     * (To prevent 'selectstart' event be prevented by module:view/layout/body in IE)
     * @param {Event} event - DOM event object
     * @private
     */
    _onSelectStart: function(event) {
        event.stopPropagation();
    },

    /**
     * Convert each character in the given string to '*' and returns them as a string.
     * @param {String} value - value string
     * @returns {String}
     * @private
     */
    _convertStringToAsterisks: function(value) {
        return Array(value.length + 1).join('*');
    },

    /**
     * Returns the value string of given data to display in the cell.
     * @param {Object} cellData - cell data
     * @implements {module:painter/input/base}
     * @returns {String}
     * @protected
     */
    _getDisplayValue: function(cellData) {
        var value = cellData.formattedValue;

        if (this.inputType === 'password') {
            value = this._convertStringToAsterisks(cellData.value);
        }

        return value;
    },

    /**
     * Generates an input HTML string from given data, and returns it.
     * @param {object} cellData - cell data
     * @implements {module:painter/input/base}
     * @returns {string}
     * @protected
     */
    _generateInputHtml: function(cellData) {
        var maxLength = tui.util.pick(cellData, 'columnModel', 'editOption', 'maxLength');

        return this.template({
            type: this.inputType,
            value: cellData.value,
            name: util.getUniqueKey(),
            disabled: cellData.isDisabled ? 'disabled' : '',
            maxLength: maxLength
        });
    },

    /**
     * Finds an element from the given parent element with 'this.selector', and moves focus to it.
     * @param {jquery} $parent - parent element
     * @override
     */
    focus: function($parent) {
        var $input = $parent.find(this.selector);

        if ($input.length === 1) {
            formUtil.setCursorToEnd($input.get(0));
            $input.select();
        }
    }
});

module.exports = TextPainter;
