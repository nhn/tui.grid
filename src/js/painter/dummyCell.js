/**
 * @fileoverview Dummy cell painter
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../base/painter');

/**
 * Dummy Cell Painter
 * @module painter/dummyCell
 * @extends module:base/painter
 */
var DummyCell = tui.util.defineClass(Painter, /**@lends module:painter/dummyCell.prototype */{
    /**
     * @constructs
     */
    init: function() {
        Painter.apply(this, arguments);
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
     * Returns the edit type of the cell.
     * (To implement interface of module:painter/cell)
     * @returns {String} Edit type
     */
    getEditType: function() {
        return 'dummy';
    },

    /**
     * Event handler for 'dblclick' event
     * @private
     */
    _onDblClick: function() {
        this.grid.dataModel.append({}, {
            focus: true
        });
    },

    /**
     * Returns the HTML string (TD) of the cell
     * @param {String} columnName - column name
     * @returns {string} HTML string
     */
    getHtml: function(columnName) {
        var isMeta = this.grid.columnModel.isMetaColumn(columnName);
        return this.template({
            columnName: columnName,
            className: (isMeta ? 'meta_column ' : '') + 'dummy'
        });
    }
});

module.exports = DummyCell;
