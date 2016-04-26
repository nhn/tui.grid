/**
 * @fileoverview This class offers methods that can be used to get the current state of DOM element.
 * @author NHN Ent. FE Development Team
 */
'use strict';

var attrNameConst = require('./common/constMap').attrName;

/**
 * Class for offering methods that can be used to get the current state of DOM element.
 * @module domState
 */
var DomState = tui.util.defineClass(/**@lends module:domState.prototype */{
    /**
     * @constructs
     * @param {jQuery} $el - jQuery object of the container element.
     */
    init: function($el) {
        this.$el = $el;
    },

    /**
     * Returns the element of the table-cell identified by rowKey and columnName
     * @param {(Number|String)} rowKey - Row key
     * @param {String} columnName - Column name
     * @returns {jQuery} Cell(TD) element
     */
    getElement: function(rowKey, columnName) {
        return this.$el.find('tr[' + attrNameConst.ROW_KEY + '=' + rowKey + ']')
            .find('td[' + attrNameConst.COLUMN_NAME + '=' + columnName + ']');
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
