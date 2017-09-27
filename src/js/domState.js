/**
 * @fileoverview This class offers methods that can be used to get the current state of DOM element.
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');
var snippet = require('tui-code-snippet');

var attrNameConst = require('./common/constMap').attrName;
var classNameConst = require('./common/classNameConst');

/**
 * Class for offering methods that can be used to get the current state of DOM element.
 * @module domState
 * @param {jQuery} $el - jQuery object of the container element.
 * @ignore
 */
var DomState = snippet.defineClass(/** @lends module:domState.prototype */{
    init: function($el) {
        this.$el = $el;
    },

    /**
     * Returns a jquery object contains the tr elements
     * @param {string} frameClassName - class name of frame
     * @returns {jQuery}
     * @private
     */
    _getBodyTableRows: function(frameClassName) {
        return this.$el.find('.' + frameClassName)
            .find('.' + classNameConst.BODY_TABLE_CONTAINER).find('tr[' + attrNameConst.ROW_KEY + ']');
    },

    /**
     * Returns max height of cells in the given row.
     * @param {jQuery} $row - traget row
     * @returns {number}
     * @private
     */
    _getMaxCellHeight: function($row) {
        var heights = $row.find('.' + classNameConst.CELL_CONTENT).map(function() {
            return this.scrollHeight;
        }).get();

        return _.max(heights);
    },

    /**
     * Returns an element of the table-cell identified by rowKey and columnName
     * @param {(Number|String)} rowKey - Row key
     * @param {String} columnName - Column name
     * @returns {jQuery} Cell(TD) element
     */
    getElement: function(rowKey, columnName) {
        return this.$el.find('tr[' + attrNameConst.ROW_KEY + '=' + rowKey + ']')
            .find('td[' + attrNameConst.COLUMN_NAME + '="' + columnName + '"]');
    },

    /**
     * Returns an array of heights of all rows
     * @returns {Array.<number>}
     */
    getRowHeights: function() {
        var $lsideRows = this._getBodyTableRows(classNameConst.LSIDE_AREA);
        var $rsideRows = this._getBodyTableRows(classNameConst.RSIDE_AREA);
        var lsideHeight, rsideHeight;
        var heights = [];
        var i, len;

        for (i = 0, len = $lsideRows.length; i < len; i += 1) {
            lsideHeight = this._getMaxCellHeight($lsideRows.eq(i));
            rsideHeight = this._getMaxCellHeight($rsideRows.eq(i));
            heights[i] = Math.max(lsideHeight, rsideHeight) + 1;
        }

        return heights;
    },

    /**
     * Returns the offset of the container element
     * @returns {{top: Number, left: Number}} Offset object
     */
    getOffset: function() {
        return this.$el.offset();
    },

    /**
     * Returns the width of the container element
     * @returns {Number} Width of the container element
     */
    getWidth: function() {
        return this.$el.width();
    },

    /**
     * Returns the height of the parent of container element.
     * @returns {Number} Height of the parent of container element
     */
    getParentHeight: function() {
        return this.$el.parent().height();
    },

    /**
     * Returns whether there's child element having focus.
     * @returns {boolean} True if there's child element having focus
     */
    hasFocusedElement: function() {
        return !!this.$el.find(':focus').length;
    }
});

module.exports = DomState;
