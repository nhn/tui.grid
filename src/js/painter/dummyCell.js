/**
 * @fileoverview Dummy cell painter
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../base/painter'),
    util = require('../common/util');

/**
 * Dummy Cell Painter
 * @module painter/dummyCell
 * @extends module:base/painter
 */
var DummyCell = tui.util.defineClass(Painter, /**@lends module:painter/dummyCell.prototype */{
    /**
     * @constructs
     */
    init: function(options) {
        Painter.apply(this, arguments);

        this.controller = options.controller;
    },

    /**
     * Event handlers
     */
    eventHandler: {
        dblclick: '_onDblClick'
    },

    /**
     * Template
     * @returns {String} String
     */
    template: _.template(
        '<td columnname="<%=columnName%>" ' +
            'class="<%=className%>" ' +
            'edit-type="dummy">' +
            '&nbsp;' + // '&nbsp' for height issue with empty cell in IE7
        '</td>'
    ),

    /**
     * Event handler for 'dblclick' event
     * @private
     */
    _onDblClick: function() {
        this.controller.appendEmptyRowAndFocus(true);
    },

    /**
     * Returns the HTML string (TD) of the cell
     * @param {String} columnName - column name
     * @returns {string} HTML string
     */
    getHtml: function(columnName) {
        var isMeta = util.isMetaColumn(columnName);

        return this.template({
            columnName: columnName,
            className: (isMeta ? 'meta_column ' : '') + 'dummy'
        });
    }
});

module.exports = DummyCell;
