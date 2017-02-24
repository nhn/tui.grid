/**
 * @fileoverview Main Button Painter
 * @author NHN Ent. FE Development Team
 */
'use strict';

var _ = require('underscore');

var Painter = require('../../base/painter');
var classNameConst = require('../../common/classNameConst');
var keyCodeMap = require('../../common/constMap').keyCode;

/**
 * Main Button Painter
 * (This class does not extend from module:painter/input/base but from module:base/painter directly)
 * @module painter/input/mainButton
 * @extends module:base/painter
 * @param {Object} options - options
 * @ignore
 */
var InputPainter = tui.util.defineClass(Painter, /**@lends module:painter/input/mainButton.prototype */{
    init: function(options) {
        Painter.apply(this, arguments);

        this.selector = 'input.' + classNameConst.CELL_MAIN_BUTTON;
        this.inputType = options.inputType;
        this.gridId = options.gridId;
    },

    /**
     * key-value object contains event names as keys and handler names as values
     * @type {Object}
     */
    events: {
        change: '_onChange',
        keydown: '_onKeydown'
    },

    /**
     * markup template
     * @returns {String}
     */
    template: _.template(
        '<input class="' + classNameConst.CELL_MAIN_BUTTON + '"' +
        ' type="<%=type%>" name="<%=name%>" <%=checked%> <%=disabled%> />'
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
     * Event handler for 'keydown' DOM event
     * @param {KeyboardEvent} event [description]
     */
    _onKeydown: function(event) {
        var address;

        if (event.keyCode === keyCodeMap.TAB) {
            event.preventDefault();
            address = this._getCellAddress($(event.target));
            this.controller.focusInToRow(address.rowKey);
        }
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
            checked: cellData.value ? 'checked' : '',
            disabled: cellData.disabled ? 'disabled' : ''
        });
    }
});

module.exports = InputPainter;
