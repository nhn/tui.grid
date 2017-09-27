/**
 * @fileoverview Dummy cell painter
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');
var snippet = require('tui-code-snippet');

var Painter = require('../base/painter');
var util = require('../common/util');
var attrNameConst = require('../common/constMap').attrName;
var classNameConst = require('../common/classNameConst');

/**
 * Dummy Cell Painter
 * @module painter/dummyCell
 * @extends module:base/painter
 * @ignore
 */
var DummyCell = snippet.defineClass(Painter, /** @lends module:painter/dummyCell.prototype */{
    init: function() {
        Painter.apply(this, arguments);
    },

    /**
     * css selector to find its own element(s) from a parent element.
     * @type {String}
     */
    selector: 'td[' + attrNameConst.EDIT_TYPE + '="dummy"]',

    /**
     * Template function
     * @returns {String} HTML string
     */
    template: _.template(
        '<td ' +
            attrNameConst.COLUMN_NAME + '="<%=columnName%>" ' +
            attrNameConst.EDIT_TYPE + '="dummy" ' +
            'class="<%=className%>">' +
        '</td>'
    ),

    /**
     * Generates a HTML string from given data, and returns it.
     * @param {Number} rowNum - row number
     * @param {String} columnName - column name
     * @returns {string} HTML string
     * @implements {module:base/painter}
     */
    generateHtml: function(rowNum, columnName) {
        var classNames = [
            classNameConst.CELL,
            classNameConst.CELL_DUMMY
        ];

        if (util.isMetaColumn(columnName)) {
            classNames.push(classNameConst.CELL_HEAD);
        }

        return this.template({
            columnName: columnName,
            className: classNames.join(' ')
        });
    }
});

module.exports = DummyCell;
