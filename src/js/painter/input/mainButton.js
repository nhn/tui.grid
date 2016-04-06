/**
 * @fileoverview Main Button Painter
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../../base/painter');

/**
 * Main Button Painter
 * (This class does not extend from module:painter/input/base but from module:base/painter directly)
 * @module painter/input/mainButton
 * @extends module:base/painter
 */
var InputPainter = tui.util.defineClass(Painter, /**@lends module:painter/input/mainButton.prototype */{
    /**
     * @constructs
     * @param {Object} options - options
     */
    init: function(options) {
        Painter.apply(this, arguments);

        this.selector = 'input.main_button';
        this.inputType = options.inputType;
        this.gridId = options.gridId;
    },

    /**
     * key-value object contains event names as keys and handler names as values
     * @type {Object}
     */
    events: {
        change: '_onChange'
    },

    /**
     * markup template
     * @returns {String}
     */
    template: _.template(
        '<input class="main_button" type="<%=type%>" name="<%=name%>" <%=checked%> />'
    ),

     /**
     * Event handler for 'change' DOM event.
     * @param {Event} event - DOM event object
     * @private
     */
    _onChange: function(event) {
        var $target = $(event.target);
        var address = this._getCellAddress($target);

        this.controller.setValue(address, $target.is(':checked'));
    },

    /**
     * Generates a HTML string from given data, and returns it.
     * @param {Object} cellData - cell data
     * @returns {String}
     * @implements {module:painter/input/base}
     */
    generateHtml: function(cellData) {
        return this.template({
            type: this.inputType,
            name: this.gridId,
            checked: cellData.value ? 'checked' : ''
        });
    }
});

module.exports = InputPainter;
