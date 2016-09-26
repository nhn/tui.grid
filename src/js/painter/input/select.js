/**
 * @fileoverview Painter class for 'select' input.
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');

var InputPainter = require('./base');
var util = require('../../common/util');

/**
 * Painter class for 'select' input.
 * @module painter/input/select
 * @extends module:painter/input/base
 */
var SelectPainter = tui.util.defineClass(InputPainter, /**@lends module:painter/input/select.prototype */{
    /**
     * @constructs
     */
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
     * Returns the value string of given data to display in the cell.
     * @param {Object} cellData - cell data
     * @implements {module:painter/input/base}
     * @returns {String}
     * @protected
     */
    _getDisplayValue: function(cellData) {
        var selectedOption = _.find(cellData.optionList, function(item) {
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
        var optionHtml = _.reduce(cellData.optionList, function(html, item) {
            return html + this.optionTemplate({
                value: item.value,
                text: item.text,
                selected: (String(cellData.value) === String(item.value)) ? 'selected' : ''
            });
        }, '', this);

        return this.template({
            name: util.getUniqueKey(),
            disabled: cellData.isDisabled ? 'disabled' : '',
            options: optionHtml
        });
    }
});

module.exports = SelectPainter;
