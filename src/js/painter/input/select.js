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
var SelectPainter = tui.util.defineClass(InputPainter, /**@lends module:painter/cell.prototype */{
    /**
     * @constructs
     */
    init: function() {
        InputPainter.apply(this, arguments);
    },

    selector: 'select',

    /**
     * Content markup template
     * @returns {string} html
     */
    template: _.template(
        '<select name="<%=name%>" <%=disabled%>><%=options%></select>'
    ),

    /**
     * Options markup template
     * It will be added to content
     * :: The value of option is a type of stirng, and use '==' operator for
     *    comparison regardless of some types of value in cellData
     * @returns {string} html
     */
    optionTemplate: _.template(
        '<option value="<%=value%>" <%=selected%>><%=text%></option>'
    ),

    /**
     * Returns the html string
     * @param {Object} cellData - cellData
     * @returns {String}
     */
    getHtml: function(cellData) {
        var optionItems = cellData.columnModel.editOption.list,
            optionHtml;

        if (!_.isNull(cellData.convertedHTML)) {
            return cellData.convertedHTML;
        }

        optionHtml = _.reduce(optionItems, function(html, item) {
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
