/**
 * @fileoverview Painter class for the 'input[type=text]' and 'input[type=password]'.
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');
var snippet = require('tui-code-snippet');

var InputPainter = require('./base');
var util = require('../../common/util');
var classNameConst = require('../../common/classNameConst');

var SELECTOR_TEXT = '.' + classNameConst.CELL_CONTENT_TEXT;
var SELECTOR_PASSWORD = 'input[type=password]';

/**
 * Painter class for the 'input[type=text]' and 'input[type=password]'
 * @module painter/input/text
 * @extends module:painter/input/base
 * @param {Object} options - options
 * @ignore
 */
var TextPainter = snippet.defineClass(InputPainter, /** @lends module:painter/input/text.prototype */{
    init: function(options) {
        InputPainter.apply(this, arguments);

        this.inputType = options.inputType;

        /**
         * css selector to use delegated event handlers by '$.on()' method.
         * @type {String}
         */
        this.selector = (options.inputType === 'text') ? SELECTOR_TEXT : SELECTOR_PASSWORD;

        this._extendEvents({
            selectstart: '_onSelectStart'
        });
    },

    /**
     * template for input
     * @returns {string} html
     */
    templateInput: _.template(
        '<input' +
        ' class="<%=className%>"' +
        ' type="<%=type%>"' +
        ' value="<%=value%>"' +
        ' name="<%=name%>"' +
        ' align="center"' +
        ' maxLength="<%=maxLength%>"' +
        ' <%=disabled%>' +
        '/>'
    ),

    /**
     * template for textarea
     * @returns {string} html
     */
    templateTextArea: _.template(
        '<textarea' +
        ' class="<%=className%>"' +
        ' name="<%=name%>"' +
        ' maxLength="<%=maxLength%>"' +
        ' <%=disabled%>><%=value%>' +
        '</textarea>'
    ),

    /**
     * Event handler for the 'selectstart' event.
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
        var maxLength = snippet.pick(cellData, 'columnModel', 'editOptions', 'maxLength');
        var params = {
            type: this.inputType,
            className: classNameConst.CELL_CONTENT_TEXT,
            value: cellData.value,
            name: util.getUniqueKey(),
            disabled: cellData.disabled ? 'disabled' : '',
            maxLength: maxLength
        };

        if (cellData.whiteSpace !== 'nowrap') {
            return this.templateTextArea(params);
        }

        return this.templateInput(params);
    },

    /**
     * Finds an element from the given parent element with 'this.selector', and moves focus to it.
     * @param {jquery} $parent - parent element
     * @override
     */
    focus: function($parent) {
        var $input = $parent.find(this.selector);

        if ($input.length === 1 && !$input.is(':focus')) {
            $input.select();
        }
    }
});

module.exports = TextPainter;
