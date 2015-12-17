/**
 * @fileoverview This class offers methods that can be used to get the current state of DOM element.
 * @author NHN Ent. FE Development Team
 */
'use strict';

/**
 * Class for offering methods that can be used to get the current state of DOM element.
 * @module domState
 */
var DomState = tui.util.defineClass({
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
     * @return {jQuery} Cell(TD) element
     */
    getElement: function(rowKey, columnName) {
        return this.$el.find('tr[key="' + rowKey + '"]').find('td[columnname="' + columnName + '"]');
    },

    /**
     * Returns the offset of the container element
     * @return {{top: Number, left: Number} Offset object
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
     * Returns whether there's child element having focus.
     * @returns {boolean} True if there's child element having focus
     */
    hasFocusedElement: function() {
        return !!this.$el.find(':focus').length;
    }
});

module.exports = DomState;
