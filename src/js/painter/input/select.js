/**
 * @fileoverview Painter class for 'select' input.
 * @author NHN Ent. FE Development Team
 */

'use strict';

var $ = require('jquery');
var _ = require('underscore');
var snippet = require('tui-code-snippet');

var InputPainter = require('./base');
var util = require('../../common/util');

/**
 * Painter class for 'select' input.
 * @module painter/input/select
 * @extends module:painter/input/base
 * @ignore
 */
var SelectPainter = snippet.defineClass(InputPainter, /** @lends module:painter/input/select.prototype */{
    init: function() {
        InputPainter.apply(this, arguments);

        /**
         * css selector to use delegated event handlers by '$.on()' method.
         * @type {String}
         */
        this.selector = 'select';
    },

    /**
     * Content markup template
     * @returns {string} html
     */
    template: _.template(
        '<select name="<%=name%>" <%=disabled%>><%=options%></select>'
    ),

    /**
     * Options markup template
     * @returns {string} html
     */
    optionTemplate: _.template(
        '<option value="<%=value%>" <%=selected%>><%=text%></option>'
    ),

    /**
     * Event handler for the 'change' event
     * @param {Event} ev - DOM Event
     */
    _onChange: function(ev) {
        var $target = $(ev.target);
        var address = this._getCellAddress($target);

        this.controller.setValueIfNotUsingViewMode(address, $target.val());
    },

    /**
     * Returns the value string of given data to display in the cell.
     * @param {Object} cellData - cell data
     * @implements {module:painter/input/base}
     * @returns {String}
     * @protected
     */
    _getDisplayValue: function(cellData) {
        var selectedOption = _.find(cellData.listItems, function(item) {
            return String(item.value) === String(cellData.value);
        });

        return selectedOption ? selectedOption.text : '';
    },

    /**
     * Generates an input HTML string from given data, and returns it.
     * @param {object} cellData - cell data
     * @implements {module:painter/input/base}
     * @returns {string}
     * @protected
     */
    _generateInputHtml: function(cellData) {
        var optionHtml = _.reduce(cellData.listItems, function(html, item) {
            return html + this.optionTemplate({
                value: item.value,
                text: item.text,
                selected: (String(cellData.value) === String(item.value)) ? 'selected' : ''
            });
        }, '', this);

        return this.template({
            name: util.getUniqueKey(),
            disabled: cellData.disabled ? 'disabled' : '',
            options: optionHtml
        });
    }
});

module.exports = SelectPainter;
