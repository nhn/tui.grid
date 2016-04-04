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
         * css selector to find its own element(s) from a parent element.
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
     * Generates a HTML string from given data, and returns it.
     * @param {Object} cellData - cell data
     * @returns {String}
     */
    generateHtml: function(cellData) {
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

        formUtil.setCursorToEnd($input.get(0));
        $input.select();
    }
});

module.exports = TextPainter;
