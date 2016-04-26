/**
 * @fileoverview Dummy cell painter
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../base/painter');
var util = require('../common/util');
var attrNameConst = require('../common/constMap').attrName;

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
     * key-value object contains event names as keys and handler names as values
     * @type {Object}
     */
    events: {
        dblclick: '_onDblClick'
    },

    /**
     * css selector to find its own element(s) from a parent element.
     * @type {String}
     */
    selector: 'td[' + attrNameConst.EDIT_TYPE + '=dummy]',

    /**
     * Template function
     * @returns {String} HTML string
     */
    template: _.template(
        '<td <%=attrColumnName%>="<%=columnName%>" ' +
            'class="<%=className%>" ' +
            '<%=attrEditType%>="dummy">' +
            '&#8203;' + // 'for height issue with empty cell in IE7
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
     * Generates a HTML string from given data, and returns it.
     * @param {String} columnName - column name
     * @returns {string} HTML string
     * @implements {module:base/painter}
     */
    generateHtml: function(columnName) {
        var isMeta = util.isMetaColumn(columnName);

        return this.template({
            attrColumnName: attrNameConst.COLUMN_NAME,
            attrEditType: attrNameConst.EDIT_TYPE,
            columnName: columnName,
            className: (isMeta ? 'meta_column ' : '') + 'dummy'
        });
    }
});

module.exports = DummyCell;
